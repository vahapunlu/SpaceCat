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
const horizonsCode = between(worker, 'function horizonsEpoch', 'async function handleHorizonsObserver');
const handlerCode = between(worker, 'async function handleHorizonsObserver', 'function jsonResponse');
const targetConfig = {
  mercury: { id: '199', name: 'Mercury' }, venus: { id: '299', name: 'Venus' },
  moon: { id: '301', name: 'Moon' }, mars: { id: '499', name: 'Mars' },
  jupiter: { id: '599', name: 'Jupiter' }, saturn: { id: '699', name: 'Saturn' },
  uranus: { id: '799', name: 'Uranus' }, neptune: { id: '899', name: 'Neptune' },
  pluto: { id: '999', name: 'Pluto' }
};
const api = new Function(
  'HORIZONS_API',
  `${cleanTextCode}\n${finiteNumberCode}\n${horizonsCode}\n` +
  'return {horizonsEpoch,horizonsRequestUrl,horizonsUtc,normalizeHorizonsObserver};'
)('https://ssd.jpl.nasa.gov/api/horizons.api');

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

equal(api.horizonsEpoch(new Date('2026-07-31T21:47:12Z')), '2026-07-31 21:00', 'epoch rounds to UTC hour');
const url = new URL(api.horizonsRequestUrl(targetConfig.mars, '2026-07-31 21:00'));
equal(url.origin + url.pathname, 'https://ssd.jpl.nasa.gov/api/horizons.api', 'official API origin is fixed');
equal(url.searchParams.get('COMMAND'), "'499'", 'Mars target id is server controlled');
equal(url.searchParams.get('CENTER'), "'500@399'", 'observer is Earth geocenter');
equal(url.searchParams.get('TIME_TYPE'), "'UT'", 'observer time scale is explicit');
equal(url.searchParams.get('QUANTITIES'), "'2,9,10,20,23,24,29'", 'observer quantities stay minimal');

const sampleResult = `
 Date__(UT)__HR:MN:SC.fff, , ,R.A._(a-app), DEC_(a-app), APmag, S-brt, Illu%, delta, deldot, S-O-T,/r, S-T-O, Cnst,
$$SOE
 2026-Jul-31 21:00:00.000, , , 82.35497, 23.34339, 1.337, 4.357, 93.55940, 1.99802303388005, -7.0696372, 45.6855,/L, 29.3991, Tau,
$$EOE`;
const vector = api.normalizeHorizonsObserver({ result: sampleResult }, 'mars', targetConfig.mars);
equal(vector.observedAt, '2026-07-31T21:00:00.000Z', 'Horizons UT becomes explicit ISO time');
equal(vector.targetName, 'Mars', 'allowlisted display name survives normalization');
equal(vector.rightAscensionDeg, 82.35497, 'apparent right ascension is parsed');
equal(vector.declinationDeg, 23.34339, 'apparent declination is parsed');
equal(vector.apparentMagnitude, 1.337, 'apparent magnitude is parsed');
equal(vector.illuminationPercent, 93.5594, 'illumination is parsed');
equal(vector.distanceAu, 1.99802303388005, 'observer range is parsed');
ok(Math.abs(vector.distanceMillionKm - 298.900) < 0.01, 'AU converts to million kilometers');
equal(vector.rangeRateKps, -7.0696372, 'signed range rate is retained');
equal(vector.constellationCode, 'Tau', 'constellation code is retained');
equal(api.normalizeHorizonsObserver({ error: 'bad target' }, 'mars', targetConfig.mars), null, 'API error is rejected');

ok(worker.includes('cleanPath === "/api/horizons/observer"'), 'observer endpoint is routed');
ok(worker.includes('const HORIZONS_TARGETS = {'), 'target allowlist is server-side');
ok(worker.includes('target not allowed'), 'unknown target fails closed');
ok(worker.includes('age < 6 * 60 * 60 * 1000'), 'edge vector freshness is bounded');
ok(worker.includes('serving last-known-good vector'), 'outage preserves last-known-good vector');
ok(worker.includes('signal: AbortSignal.timeout(10000)'), 'Horizons request has a hard deadline');

ok(index.includes('where:function'), 'where command is registered');
ok(index.includes("fsEntry('observatory','dir')"), 'observatory mount is discoverable');
ok(index.includes("path==='/observatory/README.TXT'"), 'observatory contains instructions');
ok(index.includes("path==='/observatory/targets.list'"), 'allowlist is visible as a file');
ok(index.includes("path==='/observatory/last.vector'"), 'last vector is mounted after acquisition');
ok(index.includes('not local azimuth/elevation'), 'coordinate limitation is visible');
ok(index.includes('symbolic equirectangular sky locator'), 'sky map is labeled symbolic');
ok(!index.includes('ssd.jpl.nasa.gov/api/horizons.api'), 'browser never calls the Horizons API directly');
ok(index.includes("link:{url:'https://ssd.jpl.nasa.gov/horizons/'"), 'official Horizons source page is operator-click only');
const help = between(index, 'help:function()', 'about:function()');
ok(!help.includes('>where<'), 'where remains a filesystem-discovered executable');

async function cacheContractChecks() {
  const jsonResponse = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers }
  });
  const factory = new Function(
    'caches', 'fetch', 'withSecurityHeaders', 'jsonResponse',
    `const HORIZONS_API=${JSON.stringify('https://ssd.jpl.nasa.gov/api/horizons.api')};\n` +
    `const HORIZONS_CACHE_ROOT=${JSON.stringify('https://spacecat.watch/api/horizons/observer')};\n` +
    `const HORIZONS_TARGETS=${JSON.stringify(targetConfig)};\n` +
    `${cleanTextCode}\n${finiteNumberCode}\n${edgeResponseCode}\n${horizonsCode}\n${handlerCode}\n` +
    'return handleHorizonsObserver;'
  );
  const security = (response) => response;
  let calls = 0;
  let handler = factory(
    { default: {
      match: async () => jsonResponse({ fetchedAt: new Date().toISOString(), vector: { targetName: 'Mars' } }),
      put: async () => { throw new Error('fresh cache must not be rewritten'); }
    } },
    async () => { calls += 1; throw new Error('must not fetch'); },
    security,
    jsonResponse
  );
  let request = new Request('https://spacecat.watch/api/horizons/observer?target=mars');
  let response = await handler(request, null, new URL(request.url));
  equal(response.headers.get('X-Spacecat-Cache'), 'HIT', 'fresh vector is an edge hit');
  equal(calls, 0, 'fresh vector suppresses upstream request');

  request = new Request('https://spacecat.watch/api/horizons/observer?target=earth');
  response = await handler(request, null, new URL(request.url));
  equal(response.status, 400, 'unknown target is rejected before upstream');
  equal(calls, 0, 'unknown target cannot trigger upstream');

  const stale = { fetchedAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(), vector: { targetName: 'Mars' } };
  handler = factory(
    { default: { match: async () => jsonResponse(stale), put: async () => {} } },
    async () => { throw new Error('simulated Horizons outage'); },
    security,
    jsonResponse
  );
  request = new Request('https://spacecat.watch/api/horizons/observer?target=mars');
  response = await handler(request, null, new URL(request.url));
  equal(response.status, 200, 'stale vector remains readable during outage');
  equal(response.headers.get('X-Spacecat-Cache'), 'STALE', 'outage vector is labeled stale');

  handler = factory(
    { default: { match: async () => null, put: async () => {} } },
    async () => { throw new Error('simulated cold-start outage'); },
    security,
    jsonResponse
  );
  response = await handler(request, null, new URL(request.url));
  equal(response.status, 502, 'cold-start Horizons outage fails explicitly');
}

const script = index.match(/<script>([\s\S]*?)<\/script>/);
ok(!!script, 'main application script exists');
new Function(script[1]);
checks += 1;

cacheContractChecks().then(() => {
  console.log(`NASA/JPL Horizons terminal checks OK (${checks})`);
}).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
