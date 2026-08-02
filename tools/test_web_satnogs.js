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
const satnogsCode = between(worker, 'function satnogsRequestUrl', 'async function handleSatnogsCatalog');
const handlerCode = between(worker, 'async function handleSatnogsCatalog', 'function jsonResponse');
const targets = {
  iss: { noradId: 25544, name: 'International Space Station' },
  ao7: { noradId: 7530, name: 'AO-7' },
  so50: { noradId: 27607, name: 'SO-50' },
  noaa18: { noradId: 28654, name: 'NOAA-18' },
  noaa19: { noradId: 33591, name: 'NOAA-19' },
  qo100: { noradId: 43700, name: "QO-100 / Es'hail-2" },
  meteor: { noradId: 57166, name: 'Meteor-M 2-3' }
};
const api = new Function(
  'SATNOGS_API',
  `${cleanTextCode}\n${finiteNumberCode}\n${satnogsCode}\n` +
  'return {satnogsRequestUrl,normalizeSatnogsTransmitters};'
)('https://db.satnogs.org/api/transmitters/');

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

const requestUrl = new URL(api.satnogsRequestUrl(targets.iss));
equal(requestUrl.origin + requestUrl.pathname, 'https://db.satnogs.org/api/transmitters/', 'official transmitter endpoint is fixed');
equal(requestUrl.searchParams.get('satellite__norad_cat_id'), '25544', 'NORAD filter is server controlled');
equal(requestUrl.searchParams.get('alive'), 'true', 'upstream query requests alive records');
equal(requestUrl.searchParams.get('status'), 'active', 'upstream query requests active records');

const base = {
  uuid: 'safe-id', description: 'Mode V APRS', alive: true, type: 'Transmitter',
  uplink_low: null, uplink_high: null, downlink_low: 145825000, downlink_high: null,
  mode: 'AFSK', uplink_mode: null, baud: 1200, status: 'active',
  updated: '2026-07-31T10:00:00Z', service: 'Amateur',
  unconfirmed: false, frequency_violation: false
};
const normalized = api.normalizeSatnogsTransmitters([
  base,
  { ...base },
  { ...base, uuid: 'higher', description: 'High channel', downlink_low: 437800000, mode: 'FM', baud: null },
  { ...base, uuid: 'dead', alive: false, downlink_low: 100000000 },
  { ...base, uuid: 'inactive', status: 'inactive', downlink_low: 100000001 },
  { ...base, uuid: 'unconfirmed', unconfirmed: true, downlink_low: 100000002 },
  { ...base, uuid: 'violation', frequency_violation: true, downlink_low: 100000003 },
  { ...base, uuid: 'no-frequency', downlink_low: null }
]);
equal(normalized.length, 2, 'invalid and duplicate records are removed');
equal(normalized[0].downlinkLowHz, 145825000, 'records sort by downlink frequency');
equal(normalized[0].baud, 1200, 'baud survives normalization');
equal(normalized[1].baud, null, 'missing baud remains unknown');
equal(normalized[0].updatedAt, '2026-07-31T10:00:00.000Z', 'updated timestamp is normalized');
equal(normalized[0].service, 'Amateur', 'service attribution survives normalization');

const many = Array.from({ length: 15 }, (_, i) => ({
  ...base, uuid: `id-${i}`, description: `Signal ${i}`, downlink_low: 100000000 + i
}));
equal(api.normalizeSatnogsTransmitters(many).length, 12, 'public catalog is capped at twelve records');

ok(worker.includes('cleanPath === "/api/satnogs/catalog"'), 'catalog endpoint is routed');
ok(worker.includes('const SATNOGS_TARGETS = {'), 'satellite allowlist is server-side');
ok(worker.includes('target not allowed'), 'unknown satellite fails closed');
ok(worker.includes('age < 24 * 60 * 60 * 1000'), 'edge catalog freshness is one day');
ok(worker.includes('serving last-known-good catalog'), 'outage preserves last-known-good catalog');
ok(worker.includes('"CC BY-SA 4.0"'), 'data license is carried in public payload');
ok(worker.includes('SatNOGS DB / Libre Space Foundation contributors'), 'contributor attribution is explicit');
ok(worker.includes('signal: AbortSignal.timeout(10000)'), 'SatNOGS request has a hard deadline');
ok(!worker.includes('api/transmitters/?format=json"'), 'unfiltered multi-megabyte URL is never hardcoded');

ok(index.includes('beacon:function'), 'beacon command is registered');
ok(index.includes('satellite:function'), 'satellite alias is registered');
ok(index.includes("path==='/observatory/radio/README.TXT'"), 'radio catalog has instructions');
ok(index.includes("path==='/observatory/radio/catalog.list'"), 'curated target list is readable');
ok(index.includes("path==='/observatory/radio/last.signal'"), 'last catalog is mounted');
ok(index.includes("fsEntry('.side-b')"), 'hidden cultural carrier is mounted on radio side B');
ok(index.includes("path==='/observatory/radio/.side-b'"), 'hidden side B has a readable file record');
ok(index.includes('https://open.spotify.com/track/4dkoqJrP0L8FXftrMZongF'), 'official Spotify track URL is fixed');
ok(index.includes('OPEN SPOTIFY TRANSMISSION ►'), 'side B exposes an explicit operator link');
ok(index.includes('external carrier · user initiated · no autoplay'), 'external playback stays click-only');
ok(index.includes('Ordinary listings do not reveal hidden channels.'), 'radio README leaves a fair hidden-file clue');
ok(index.includes('not proof of a current on-air signal'), 'catalog is never mislabeled as live reception');
ok(index.includes('CC BY-SA 4.0'), 'license attribution is visible in terminal');
ok(!index.includes('db.satnogs.org'), 'browser only sees same-origin adapter');
const help = between(index, 'help:function()', 'about:function()');
ok(!help.includes('>beacon<'), 'beacon remains a filesystem-discovered executable');
ok(!help.includes('SPOTIFY'), 'the Spotify artifact remains outside main help');
ok(!help.includes('ACROSS THE UNIVERSE'), 'the track remains a filesystem discovery');

async function cacheContractChecks() {
  const jsonResponse = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers }
  });
  const factory = new Function(
    'caches', 'fetch', 'withSecurityHeaders', 'jsonResponse',
    `const SATNOGS_API=${JSON.stringify('https://db.satnogs.org/api/transmitters/')};\n` +
    `const SATNOGS_CACHE_ROOT=${JSON.stringify('https://spacecat.watch/api/satnogs/catalog')};\n` +
    `const SATNOGS_TARGETS=${JSON.stringify(targets)};\n` +
    `${cleanTextCode}\n${finiteNumberCode}\n${edgeResponseCode}\n${satnogsCode}\n${handlerCode}\n` +
    'return handleSatnogsCatalog;'
  );
  const security = (response) => response;
  let calls = 0;
  let handler = factory(
    { default: {
      match: async () => jsonResponse({ fetchedAt: new Date().toISOString(), transmitters: [{ id: 'cached' }] }),
      put: async () => { throw new Error('fresh cache must not be rewritten'); }
    } },
    async () => { calls += 1; throw new Error('must not fetch'); },
    security,
    jsonResponse
  );
  let request = new Request('https://spacecat.watch/api/satnogs/catalog?target=iss');
  let response = await handler(request, null, new URL(request.url));
  equal(response.headers.get('X-Spacecat-Cache'), 'HIT', 'fresh catalog is an edge hit');
  equal(calls, 0, 'fresh catalog suppresses upstream fetch');

  request = new Request('https://spacecat.watch/api/satnogs/catalog?target=all');
  response = await handler(request, null, new URL(request.url));
  equal(response.status, 400, 'unfiltered target is rejected');
  equal(calls, 0, 'unfiltered target cannot trigger upstream');

  const stale = { fetchedAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(), transmitters: [{ id: 'cached' }] };
  handler = factory(
    { default: { match: async () => jsonResponse(stale), put: async () => {} } },
    async () => { throw new Error('simulated SatNOGS outage'); },
    security,
    jsonResponse
  );
  request = new Request('https://spacecat.watch/api/satnogs/catalog?target=iss');
  response = await handler(request, null, new URL(request.url));
  equal(response.status, 200, 'stale catalog remains readable during outage');
  equal(response.headers.get('X-Spacecat-Cache'), 'STALE', 'outage catalog is labeled stale');

  handler = factory(
    { default: { match: async () => null, put: async () => {} } },
    async () => { throw new Error('simulated cold-start outage'); },
    security,
    jsonResponse
  );
  response = await handler(request, null, new URL(request.url));
  equal(response.status, 502, 'cold-start SatNOGS outage fails explicitly');
}

const script = index.match(/<script>([\s\S]*?)<\/script>/);
ok(!!script, 'main application script exists');
new Function(script[1]);
checks += 1;

cacheContractChecks().then(() => {
  console.log(`SatNOGS radio catalog checks OK (${checks})`);
}).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
