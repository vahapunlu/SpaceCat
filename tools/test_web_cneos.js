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
const cneosCode = between(worker, 'function cneosFieldRows', 'async function handleCneosFeed');
const cneosHandlerCode = between(worker, 'async function handleCneosFeed', 'function jsonResponse');
const api = new Function(
  `${cleanTextCode}\n${cneosCode}\n` +
  'return {normalizeCneosFireballs,normalizeCneosApproaches,cneosUtc,cneosTdb};'
)();

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

const fireballs = api.normalizeCneosFireballs({
  fields: ['date', 'energy', 'impact-e', 'lat', 'lat-dir', 'lon', 'lon-dir', 'alt', 'vel'],
  data: [
    ['2026-07-21 01:14:45', '3.2', '0.11', '9.4', 'N', '57.4', 'W', '31.5', null],
    ['2026-06-11 02:00:58', '3.2', '0.11', '18.7', 'S', '16.1', 'E', '33.0', '12.4'],
    ['invalid', '1', null, null, null, null, null, null, null]
  ]
});
equal(fireballs.length, 2, 'invalid or energy-free fireballs are discarded');
equal(fireballs[0].observedAt, '2026-07-21T01:14:45.000Z', 'fireball UTC is explicit');
equal(fireballs[0].latitude, 9.4, 'north latitude stays positive');
equal(fireballs[0].longitude, -57.4, 'west longitude becomes negative');
equal(fireballs[1].latitude, -18.7, 'south latitude becomes negative');
equal(fireballs[0].velocityKps, null, 'missing velocity remains unknown');

const approaches = api.normalizeCneosApproaches({
  fields: ['des', 'cd', 'dist', 'v_rel', 'h', 'diameter', 'fullname'],
  data: [
    ['2026 OS', '2026-Aug-01 20:03', '0.00787734975910887', '5.8432', '28.065', null, '       (2026 OS)'],
    ['BAD', 'invalid', '0.01', '1', '20', '0.3', 'Bad Date']
  ]
});
equal(approaches.length, 1, 'approaches without a valid TDB timestamp are discarded');
equal(approaches[0].approachAt, '2026-08-01T20:03:00.000Z', 'TDB display timestamp is normalized');
equal(approaches[0].timeScale, 'TDB', 'time scale is never implied to be UTC');
ok(Math.abs(approaches[0].lunarDistances - 3.0656) < 0.001, 'AU converts to lunar distance');
equal(approaches[0].diameterKm, null, 'unknown diameter is not invented');

ok(worker.includes('cleanPath === "/api/cneos/fireballs"'), 'fireball endpoint is routed');
ok(worker.includes('cleanPath === "/api/cneos/approaches"'), 'approach endpoint is routed');
ok(worker.includes('date-max=%2B60') && worker.includes('dist-max=20LD'), 'approach query is bounded');
ok(worker.includes('limit=12&req-loc=true&sort=-date'), 'fireball query is bounded and requests location');
ok(worker.includes('age < 6 * 60 * 60 * 1000'), 'edge freshness is evaluated from the snapshot');
ok(worker.includes('serving last-known-good snapshot'), 'stale edge snapshot survives upstream failure');
ok(worker.includes('edgeCachedResponse(cached, request, "STALE")'), 'stale response is observable');
ok(worker.includes('signal: AbortSignal.timeout(8000)'), 'upstream request has a hard deadline');
ok(worker.includes('"X-Robots-Tag": "noindex, nofollow"'), 'feed endpoints stay out of search');

async function cacheContractChecks() {
  const jsonResponse = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers }
  });
  const handlerFactory = new Function(
    'caches', 'fetch', 'withSecurityHeaders', 'jsonResponse',
    `const CNEOS_FIREBALL_API=${JSON.stringify('https://ssd-api.jpl.nasa.gov/fireball.api?limit=12&req-loc=true&sort=-date')};\n` +
    `const CNEOS_APPROACH_API=${JSON.stringify('https://ssd-api.jpl.nasa.gov/cad.api?date-min=now&date-max=%2B60&dist-max=20LD&diameter=true&fullname=true&sort=date&limit=20')};\n` +
    `const CNEOS_CACHE_ROOT=${JSON.stringify('https://spacecat.watch/api/cneos')};\n` +
    `${cleanTextCode}\n${cneosCode}\n${cneosHandlerCode}\nreturn handleCneosFeed;`
  );
  const security = (response) => response;

  let upstreamCalls = 0;
  const freshCache = {
    match: async () => jsonResponse({ fetchedAt: new Date().toISOString(), results: [{ ok: true }] }),
    put: async () => { throw new Error('fresh cache must not be rewritten'); }
  };
  let handler = handlerFactory(
    { default: freshCache },
    async () => { upstreamCalls += 1; throw new Error('must not fetch'); },
    security,
    jsonResponse
  );
  let response = await handler(new Request('https://spacecat.watch/api/cneos/fireballs'), null, 'fireballs');
  equal(response.headers.get('X-Spacecat-Cache'), 'HIT', 'fresh cache is served without upstream');
  equal(upstreamCalls, 0, 'fresh cache suppresses upstream request');

  const staleBody = { fetchedAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(), results: [{ ok: true }] };
  const staleCache = {
    match: async () => jsonResponse(staleBody),
    put: async () => { throw new Error('failed refresh must not overwrite last-known-good'); }
  };
  handler = handlerFactory(
    { default: staleCache },
    async () => { throw new Error('simulated upstream outage'); },
    security,
    jsonResponse
  );
  response = await handler(new Request('https://spacecat.watch/api/cneos/fireballs'), null, 'fireballs');
  equal(response.status, 200, 'stale last-known-good remains available during outage');
  equal(response.headers.get('X-Spacecat-Cache'), 'STALE', 'outage response is labeled stale');

  handler = handlerFactory(
    { default: { match: async () => null, put: async () => {} } },
    async () => { throw new Error('simulated cold-start outage'); },
    security,
    jsonResponse
  );
  response = await handler(new Request('https://spacecat.watch/api/cneos/fireballs'), null, 'fireballs');
  equal(response.status, 502, 'cold-start outage fails explicitly');
}

ok(index.includes('fireball:function'), 'fireball terminal command is registered');
ok(index.includes('approach:function'), 'approach terminal command is registered');
ok(index.includes("fsEntry('cneos','file','cr--r--r--')"), 'CNEOS device is mounted');
ok(index.includes("path==='/dev/cneos'"), 'CNEOS device has a readable contract');
ok(index.includes('close approach ≠ impact prediction'), 'terminal states the critical safety distinction');
ok(index.includes('sc_cneos_fireball_v1') && index.includes('sc_cneos_approach_v1'), 'device last-known-good caches are separate');
ok(!index.includes('ssd-api.jpl.nasa.gov'), 'browser talks only to the same-origin edge adapter');

const worldPlotCode = between(index, 'var MAP=[', '/* ══ TAPE ARCHIVE');
const worldPlot = new Function(`${worldPlotCode}\nreturn {MAP,worldMapPoint,fireballWorldPlot};`)();
equal(worldPlot.MAP.length, 18, 'shared ASCII world keeps its 18-row contract');
equal(worldPlot.MAP[0].length, 58, 'shared ASCII world keeps its 58-column contract');
const northWest = worldPlot.worldMapPoint(90, -180, 0, 0);
equal(northWest.x, 0, 'west antimeridian maps to the first column');
equal(northWest.y, 0, 'north pole maps to the first row');
const southEast = worldPlot.worldMapPoint(-90, 180, 4, 2);
equal(southEast.x, 61, 'east antimeridian respects the requested map offset');
equal(southEast.y, 19, 'south pole respects the requested map offset');

const locatedPlot = worldPlot.fireballWorldPlot([
  {latitude:null, longitude:null},
  {latitude:9.4, longitude:-57.4},
  {latitude:-18.7, longitude:16.1}
]);
equal(locatedPlot.plotted, 2, 'unreported coordinates stay out of the map count');
equal(locatedPlot.markers[1], '@', 'newest located record receives the acquisition marker');
equal(locatedPlot.markers[2], '3', 'later located records retain their archive row number');
ok(locatedPlot.text.includes('@') && locatedPlot.text.includes('3'), 'located records are visible on the ASCII world');

const collisionPlot = worldPlot.fireballWorldPlot([
  {latitude:10, longitude:20},
  {latitude:10.2, longitude:20.1}
]);
equal(collisionPlot.markers[0], '+', 'first record in a shared map cell becomes a collision marker');
equal(collisionPlot.markers[1], '+', 'second record in a shared map cell becomes a collision marker');
ok(collisionPlot.text.includes('+'), 'shared-cell collision is visible on the map');

ok(index.includes('REPORTED AIRBURST LOCATION · NOT A CONFIRMED GROUND IMPACT SITE'), 'map refuses to describe an airburst coordinate as a ground impact');
ok(index.includes('role="img" aria-label="ASCII world map of recent reported fireball airburst coordinates"'), 'fireball world map has an accessible description');
ok(index.includes("var rowTag=(marker==='@'||marker==='+')?marker+p2(i+1):' '+p2(i+1);"), 'archive list avoids repeating numeric map markers in row labels');
ok(index.includes('.flicker,.cur,.livedot,.fireball-map{animation:none}'), 'radar acquisition respects reduced motion');
ok(index.includes('function mapXY(lat,lon){return worldMapPoint(lat,lon,ox,oy);}'), 'ISS and fireball views share one coordinate projection');

const script = index.match(/<script>([\s\S]*?)<\/script>/);
ok(!!script, 'main application script exists');
new Function(script[1]);
checks += 1;

cacheContractChecks().then(() => {
  console.log(`NASA/JPL CNEOS terminal checks OK (${checks})`);
}).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
