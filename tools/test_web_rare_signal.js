#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const worker = fs.readFileSync(path.join(root, 'web', '_worker.js'), 'utf8');
const index = fs.readFileSync(path.join(root, 'web', 'index.html'), 'utf8');

function between(source, start, end) {
  const a = source.indexOf(start);
  const b = source.indexOf(end, a);
  if (a < 0 || b < 0) throw new Error(`source segment missing: ${start}`);
  return source.slice(a, b);
}

const cleanTextCode = between(worker, 'function cleanText', 'function rocketLaunchStatus');
const finiteNumberCode = between(worker, 'function finiteNumber', 'function cneosUtc');
const edgeResponseCode = between(worker, 'function edgeCachedResponse', 'async function handleCneosFeed');
const graceCode = between(worker, 'function gracedbRequestUrl', 'async function handleGracedbPublic');
const graceHandlerCode = between(worker, 'async function handleGracedbPublic', 'function celestrakRequestUrl');
const celestrakCode = between(worker, 'function celestrakRequestUrl', 'async function handleCelestrakElements');
const celestrakHandlerCode = between(worker, 'async function handleCelestrakElements', 'function jsonResponse');

const targets = {
  iss: { noradId: 25544, name: 'International Space Station' },
  hubble: { noradId: 20580, name: 'Hubble Space Telescope' },
  tiangong: { noradId: 48274, name: 'Tiangong / Tianhe' },
  ao7: { noradId: 7530, name: 'AO-7' },
  so50: { noradId: 27607, name: 'SO-50' },
  noaa18: { noradId: 28654, name: 'NOAA-18' },
  noaa19: { noradId: 33591, name: 'NOAA-19' },
  qo100: { noradId: 43700, name: "QO-100 / Es'hail-2" },
  meteor: { noradId: 57166, name: 'Meteor-M 2-3' }
};

const api = new Function(
  'GRACEDB_API', 'CELESTRAK_API',
  `${cleanTextCode}\n${finiteNumberCode}\n${graceCode}\n${celestrakCode}\n` +
  'return {gracedbRequestUrl,gracedbCreatedUtc,normalizeGracedbSuperevents,' +
  'celestrakRequestUrl,celestrakEpochUtc,normalizeCelestrakElement};'
)('https://gracedb.ligo.org/api/superevents/', 'https://celestrak.org/NORAD/elements/gp.php');

let checks = 0;
function ok(condition, label) {
  checks += 1;
  if (!condition) throw new Error(label);
}
function equal(actual, expected, label) {
  checks += 1;
  if (actual !== expected) {
    throw new Error(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

const graceUrl = new URL(api.gracedbRequestUrl());
equal(graceUrl.origin + graceUrl.pathname, 'https://gracedb.ligo.org/api/superevents/', 'GraceDB origin is fixed');
equal(graceUrl.searchParams.get('query'), 'public', 'GraceDB query is public only');
equal(graceUrl.searchParams.get('count'), '8', 'GraceDB response is tightly bounded');
equal(api.gracedbCreatedUtc('2025-11-18 12:41:31 UTC'), '2025-11-18T12:41:31.000Z', 'GraceDB UTC is normalized');
equal(api.gracedbCreatedUtc('yesterday'), null, 'ambiguous GraceDB time is rejected');

const graceBase = {
  superevent_id: 'S251118cm', gw_id: null, category: 'Production',
  created: '2025-11-18 12:41:31 UTC', t_0: 1447504872.731934,
  far: 0.000005901454658684518, labels: ['LOW_SIGNIF_PRELIM_SENT', 'DQOK'],
  preferred_event_data: {
    graceid: 'G619011', group: 'CBC', pipeline: 'pycbc', search: 'AllSky', instruments: 'H1,L1'
  }
};
const graceRows = api.normalizeGracedbSuperevents({ superevents: [
  graceBase,
  { ...graceBase, superevent_id: 'S251118aa', labels: ['RETRACTION'] },
  { ...graceBase, superevent_id: 'S251118ab', gw_id: 'GW251118A', labels: [] },
  { ...graceBase, superevent_id: 'TS251118aa', category: 'Test' },
  { ...graceBase, superevent_id: '<script>' }
] });
equal(graceRows.length, 3, 'only valid production superevents survive');
equal(graceRows[0].state, 'PUBLIC CANDIDATE', 'unconfirmed record stays a candidate');
equal(graceRows[0].lowSignificance, true, 'low-significance qualifier survives');
equal(graceRows[0].farHz, graceBase.far, 'false-alarm rate remains numeric Hz');
equal(graceRows[1].state, 'RETRACTED', 'retraction overrides all other states');
equal(graceRows[2].state, 'CONFIRMED GW', 'GW identifier marks confirmed state');
equal(graceRows[0].sourceUrl, 'https://gracedb.ligo.org/superevents/S251118cm/view/', 'record link is constructed from validated id');

const celestrakUrl = new URL(api.celestrakRequestUrl(targets.iss));
equal(celestrakUrl.origin + celestrakUrl.pathname, 'https://celestrak.org/NORAD/elements/gp.php', 'CelesTrak endpoint is fixed');
equal(celestrakUrl.searchParams.get('CATNR'), '25544', 'CelesTrak uses one server-controlled catalog number');
equal(celestrakUrl.searchParams.get('FORMAT'), 'JSON', 'CelesTrak uses OMM JSON fields');
const omm = {
  OBJECT_NAME: 'ISS (ZARYA)', OBJECT_ID: '1998-067A', EPOCH: '2026-07-31T12:09:44.683488',
  MEAN_MOTION: 15.4928469, ECCENTRICITY: 0.00071204, INCLINATION: 51.6316,
  RA_OF_ASC_NODE: 80.7664, ARG_OF_PERICENTER: 357.3867, MEAN_ANOMALY: 2.7084,
  NORAD_CAT_ID: 25544, REV_AT_EPOCH: 57862, BSTAR: 0.00016881397,
  CLASSIFICATION_TYPE: 'U'
};
const element = api.normalizeCelestrakElement([omm], targets.iss);
equal(element.epochAt, '2026-07-31T12:09:44.683Z', 'OMM epoch is explicit UTC');
equal(element.noradId, 25544, 'catalog id survives normalization');
ok(Math.abs(element.orbitalPeriodMinutes - 92.946) < 0.01, 'orbital period is derived from mean motion');
equal(element.eccentricity, 0.00071204, 'eccentricity survives normalization');
equal(api.normalizeCelestrakElement([{ ...omm, NORAD_CAT_ID: 20580 }], targets.iss), null, 'mismatched catalog id is rejected');
equal(api.normalizeCelestrakElement([omm, omm], targets.iss), null, 'multi-object response is rejected');
equal(api.normalizeCelestrakElement([{ ...omm, EPOCH: 'not-a-time' }], targets.iss), null, 'invalid epoch is rejected');

ok(worker.includes('cleanPath === "/api/gracedb/public"'), 'GraceDB endpoint is routed');
ok(worker.includes('cleanPath === "/api/celestrak/elements"'), 'CelesTrak endpoint is routed');
ok(worker.includes('const CELESTRAK_TARGETS = {'), 'CelesTrak allowlist is server-side');
ok(worker.includes('age < 60 * 60 * 1000'), 'GraceDB edge freshness is one hour');
ok(worker.includes('age < 12 * 60 * 60 * 1000'), 'CelesTrak edge freshness is twelve hours');
ok(worker.includes('cacheTtl: 43200'), 'CelesTrak subrequest cache matches long edge cache');
ok(worker.includes('redirect: "manual"'), 'CelesTrak redirects are exposed for explicit rejection');
ok(worker.includes('serving last-known-good candidate snapshot'), 'GraceDB preserves last-known-good data');
ok(worker.includes('serving last-known-good GP element'), 'CelesTrak preserves last-known-good data');
ok(!worker.includes('GROUP='), 'worker contains no CelesTrak group download');
ok(!worker.includes('NAME='), 'worker contains no CelesTrak name search');

ok(index.includes('gravity:function'), 'gravity command is registered');
ok(index.includes('orbit:function'), 'orbit command is registered');
ok(index.includes("path==='/observatory/gravity/README.TXT'"), 'candidate watch is filesystem-discoverable');
ok(index.includes("path==='/observatory/orbits/targets.list'"), 'orbit allowlist is filesystem-discoverable');
ok(index.includes('CANDIDATE ≠ CONFIRMED DETECTION'), 'terminal warns against certainty');
ok(index.includes('FAR is an estimated false-alarm rate, not the probability'), 'FAR is described scientifically');
ok(index.includes('mean elements, not live position or pass prediction'), 'orbital elements are not mislabeled live');
ok(index.includes('No GROUP, NAME, INTDES or bulk catalog query is exposed'), 'bulk-query policy is visible');
ok(!index.includes('gracedb.ligo.org'), 'browser only sees same-origin GraceDB adapter');
ok(!index.includes('celestrak.org'), 'browser only sees same-origin CelesTrak adapter');
const help = between(index, 'help:function()', 'about:function()');
ok(!help.includes('>gravity<'), 'gravity remains a filesystem-discovered executable');
ok(!help.includes('>orbit<'), 'orbit remains a filesystem-discovered executable');

async function cacheContractChecks() {
  const jsonResponse = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers }
  });
  const security = (response) => response;

  const graceFactory = new Function(
    'caches', 'fetch', 'withSecurityHeaders', 'jsonResponse',
    `const GRACEDB_API=${JSON.stringify('https://gracedb.ligo.org/api/superevents/')};\n` +
    `const GRACEDB_CACHE_URL=${JSON.stringify('https://spacecat.watch/api/gracedb/public?schema=1')};\n` +
    `${cleanTextCode}\n${finiteNumberCode}\n${edgeResponseCode}\n${graceCode}\n${graceHandlerCode}\n` +
    'return handleGracedbPublic;'
  );
  let calls = 0;
  let handler = graceFactory(
    { default: {
      match: async () => jsonResponse({ fetchedAt: new Date().toISOString(), candidates: [{ id: 'cached' }] }),
      put: async () => { throw new Error('fresh cache must not be rewritten'); }
    } },
    async () => { calls += 1; throw new Error('must not fetch'); }, security, jsonResponse
  );
  let request = new Request('https://spacecat.watch/api/gracedb/public');
  let response = await handler(request, null);
  equal(response.headers.get('X-Spacecat-Cache'), 'HIT', 'fresh GraceDB snapshot is an edge hit');
  equal(calls, 0, 'fresh GraceDB snapshot suppresses upstream fetch');

  const staleGrace = { fetchedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), candidates: [{ id: 'cached' }] };
  handler = graceFactory(
    { default: { match: async () => jsonResponse(staleGrace), put: async () => {} } },
    async () => { throw new Error('simulated GraceDB outage'); }, security, jsonResponse
  );
  response = await handler(request, null);
  equal(response.status, 200, 'stale GraceDB snapshot survives outage');
  equal(response.headers.get('X-Spacecat-Cache'), 'STALE', 'GraceDB outage is labeled stale');

  const celestrakFactory = new Function(
    'caches', 'fetch', 'withSecurityHeaders', 'jsonResponse',
    `const CELESTRAK_API=${JSON.stringify('https://celestrak.org/NORAD/elements/gp.php')};\n` +
    `const CELESTRAK_CACHE_ROOT=${JSON.stringify('https://spacecat.watch/api/celestrak/elements')};\n` +
    `const CELESTRAK_TARGETS=${JSON.stringify(targets)};\n` +
    `${cleanTextCode}\n${finiteNumberCode}\n${edgeResponseCode}\n${celestrakCode}\n${celestrakHandlerCode}\n` +
    'return handleCelestrakElements;'
  );
  calls = 0;
  handler = celestrakFactory(
    { default: {
      match: async () => jsonResponse({ fetchedAt: new Date().toISOString(), element: { noradId: 25544 } }),
      put: async () => { throw new Error('fresh cache must not be rewritten'); }
    } },
    async () => { calls += 1; throw new Error('must not fetch'); }, security, jsonResponse
  );
  request = new Request('https://spacecat.watch/api/celestrak/elements?target=iss');
  response = await handler(request, null, new URL(request.url));
  equal(response.headers.get('X-Spacecat-Cache'), 'HIT', 'fresh GP element is an edge hit');
  equal(calls, 0, 'fresh GP element suppresses upstream fetch');

  request = new Request('https://spacecat.watch/api/celestrak/elements?target=all');
  response = await handler(request, null, new URL(request.url));
  equal(response.status, 400, 'bulk target is rejected');
  equal(calls, 0, 'bulk target cannot trigger upstream');

  const staleElement = { fetchedAt: new Date(Date.now() - 13 * 60 * 60 * 1000).toISOString(), element: { noradId: 25544 } };
  handler = celestrakFactory(
    { default: { match: async () => jsonResponse(staleElement), put: async () => {} } },
    async () => { throw new Error('simulated CelesTrak outage'); }, security, jsonResponse
  );
  request = new Request('https://spacecat.watch/api/celestrak/elements?target=iss');
  response = await handler(request, null, new URL(request.url));
  equal(response.status, 200, 'stale GP element survives outage');
  equal(response.headers.get('X-Spacecat-Cache'), 'STALE', 'CelesTrak outage is labeled stale');

  handler = celestrakFactory(
    { default: { match: async () => null, put: async () => {} } },
    async () => { throw new Error('simulated cold-start outage'); }, security, jsonResponse
  );
  response = await handler(request, null, new URL(request.url));
  equal(response.status, 502, 'cold-start CelesTrak outage fails explicitly');
}

const script = index.match(/<script>([\s\S]*?)<\/script>/);
ok(!!script, 'main application script exists');
new Function(script[1]);
checks += 1;

cacheContractChecks().then(() => {
  console.log(`Rare signal watch checks OK (${checks})`);
}).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
