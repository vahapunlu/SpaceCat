#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';

const apiBase = 'https://api.appstoreconnect.apple.com/v1';
const keyPath = process.env.ASC_KEY_JSON;
const bundleId = process.env.APP_STORE_BUNDLE_ID || 'com.spacecat.terminal';
const versionString = process.env.APP_STORE_VERSION || '1.0';
const buildNumber = process.env.APP_STORE_BUILD_NUMBER;

if (!keyPath) throw new Error('ASC_KEY_JSON is required');
if (!buildNumber) throw new Error('APP_STORE_BUILD_NUMBER is required');

function base64url(input) {
  return Buffer.from(input).toString('base64')
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function token() {
  const key = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'ES256', kid: key.key_id, typ: 'JWT' }));
  const claims = base64url(JSON.stringify({
    iss: key.issuer_id,
    iat: now,
    exp: now + Math.min(key.duration || 1200, 1200),
    aud: 'appstoreconnect-v1',
  }));
  const unsigned = `${header}.${claims}`;
  const signature = crypto.createSign('SHA256').update(unsigned)
    .sign({ key: key.key, dsaEncoding: 'ieee-p1363' });
  return `${unsigned}.${base64url(signature)}`;
}

async function api(method, endpoint, body) {
  const response = await fetch(`${apiBase}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${token()}`,
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(20_000),
  });
  const text = await response.text();
  const json = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const detail = json?.errors?.map((error) =>
      `${error.status || response.status} ${error.code || ''}: ${error.detail || error.title || ''}`
    ).join('\n');
    throw new Error(`${method} ${endpoint} failed (${response.status})\n${detail || text}`);
  }
  return json;
}

async function one(endpoint, label) {
  const json = await api('GET', endpoint);
  if ((json.data || []).length !== 1) {
    throw new Error(`Expected one ${label}; found ${(json.data || []).length}`);
  }
  return json.data[0];
}

async function context() {
  const app = await one(`/apps?filter[bundleId]=${encodeURIComponent(bundleId)}`, 'app');
  const version = await one(
    `/apps/${app.id}/appStoreVersions?filter[platform]=IOS&filter[versionString]=${encodeURIComponent(versionString)}`,
    'version'
  );
  const builds = await api('GET',
    `/builds?filter[app]=${app.id}&filter[version]=${encodeURIComponent(buildNumber)}&sort=-uploadedDate&limit=10`
  );
  const build = (builds.data || []).find((item) => item.attributes?.version === buildNumber);
  let submission = null;
  let selectedBuild = null;
  try {
    submission = (await api('GET', `/appStoreVersions/${version.id}/appStoreVersionSubmission`)).data;
  } catch (error) {
    if (!String(error.message).includes('(404)')) throw error;
  }
  try {
    selectedBuild = (await api('GET', `/appStoreVersions/${version.id}/build`)).data;
  } catch (error) {
    if (!String(error.message).includes('(404)')) throw error;
  }
  return { app, version, build, submission, selectedBuild };
}

function printStatus({ app, version, build, submission, selectedBuild }) {
  console.log(`App: ${app.attributes?.name || ''} (${bundleId})`);
  console.log(`Version: ${version.attributes?.versionString} · ${version.attributes?.appStoreState}`);
  console.log(build
    ? `Build ${build.attributes?.version}: ${build.attributes?.processingState}`
    : `Build ${buildNumber}: not visible`);
  console.log(`Submission: ${submission ? 'present' : 'none'}`);
  console.log(`Selected build: ${selectedBuild?.attributes?.version || 'none'}`);
}

async function replace() {
  const current = await context();
  printStatus(current);
  if (!current.build) throw new Error(`Build ${buildNumber} is not visible yet`);
  if (current.build.attributes?.processingState !== 'VALID') {
    throw new Error(`Build ${buildNumber} is not VALID`);
  }
  if (!['WAITING_FOR_REVIEW', 'DEVELOPER_REJECTED'].includes(current.version.attributes?.appStoreState)) {
    throw new Error(`Refusing replacement from state ${current.version.attributes?.appStoreState}`);
  }

  if (current.submission) {
    await api('DELETE', `/appStoreVersionSubmissions/${current.submission.id}`);
    console.log('Canceled the waiting review submission.');
  }
  if (current.selectedBuild) {
    await api('PATCH', `/appStoreVersions/${current.version.id}/relationships/build`, {
      data: null,
    });
    console.log('Detached the previous build.');
  }
  await api('PATCH', `/appStoreVersions/${current.version.id}/relationships/build`, {
    data: { type: 'builds', id: current.build.id },
  });
  console.log(`Attached build ${buildNumber}.`);
  await submitModernReview(current.app.id, current.version.id);
}

async function submitModernReview(appId, versionId) {
  const submission = await api('POST', '/reviewSubmissions', {
    data: {
      type: 'reviewSubmissions',
      relationships: {
        app: { data: { type: 'apps', id: appId } },
      },
    },
  });
  const submissionId = submission.data.id;
  await api('POST', '/reviewSubmissionItems', {
    data: {
      type: 'reviewSubmissionItems',
      relationships: {
        reviewSubmission: {
          data: { type: 'reviewSubmissions', id: submissionId },
        },
        appStoreVersion: {
          data: { type: 'appStoreVersions', id: versionId },
        },
      },
    },
  });
  await api('PATCH', `/reviewSubmissions/${submissionId}`, {
    data: {
      type: 'reviewSubmissions',
      id: submissionId,
      attributes: { submitted: true },
    },
  });
  console.log(`Submitted build ${buildNumber} for review.`);
}

async function submitAttachedBuild() {
  const current = await context();
  printStatus(current);
  if (!current.build || current.build.attributes?.processingState !== 'VALID') {
    throw new Error(`Build ${buildNumber} is not VALID`);
  }
  if (current.selectedBuild?.id !== current.build.id) {
    throw new Error(`Build ${buildNumber} is not attached to the version`);
  }
  if (current.submission) throw new Error('A review submission already exists');
  await submitModernReview(current.app.id, current.version.id);
}

const mode = process.argv[2] || 'status';
if (mode === 'status') printStatus(await context());
else if (mode === 'replace') await replace();
else if (mode === 'submit') await submitAttachedBuild();
else throw new Error(`Unknown mode: ${mode}`);
