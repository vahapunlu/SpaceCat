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
const exoplanetCode = between(worker, 'function stableDailyHash', 'async function handleDailyExoplanet');
const handlerCode = between(worker, 'async function handleDailyExoplanet', 'function jsonResponse');
const api = new Function(
  `${cleanTextCode}\n${finiteNumberCode}\n${exoplanetCode}\n` +
  'return {stableDailyHash,exoplanetSizeClass,normalizeExoplanet,selectDailyExoplanet};'
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

const rows = [
  {
    pl_name: 'Planet B', hostname: 'Star B', discoverymethod: 'Transit', disc_year: 2024,
    pl_rade: 1.1, pl_bmasse: null, pl_orbper: 12.5, pl_eqt: 280, sy_dist: 10,
    disc_facility: 'Telescope B'
  },
  {
    pl_name: 'Planet A', hostname: 'Star A', discoverymethod: 'Radial Velocity', disc_year: 2018,
    pl_rade: 2.7, pl_bmasse: 8.2, pl_orbper: 45, pl_eqt: null, sy_dist: 20,
    disc_facility: 'Observatory A'
  },
  { pl_name: 'Incomplete', disc_year: 2020, pl_rade: null, pl_orbper: 2 }
];

const normalized = api.normalizeExoplanet(rows[0]);
equal(normalized.name, 'Planet B', 'planet name is preserved');
equal(normalized.sizeClass, 'EARTH-SIZED', 'radius class uses a conservative size band');
equal(normalized.massEarth, null, 'missing mass is not invented');
ok(Math.abs(normalized.distanceLightYears - 32.6156) < 0.0001, 'parsecs convert to light-years');
equal(api.normalizeExoplanet(rows[2]), null, 'record without required radius is rejected');
equal(api.exoplanetSizeClass(1.5), 'SUPER-EARTH SIZE', 'super-Earth size threshold is stable');
equal(api.exoplanetSizeClass(3), 'NEPTUNE-SIZED', 'Neptune size threshold is stable');
equal(api.exoplanetSizeClass(12), 'GIANT-SIZED', 'giant size threshold is stable');

const date = '2026-07-31';
const selected = api.selectDailyExoplanet(rows, date);
const selectedReordered = api.selectDailyExoplanet(rows.slice().reverse(), date);
equal(selected.name, selectedReordered.name, 'daily selection ignores upstream row ordering');
equal(
  api.selectDailyExoplanet(rows, date).name,
  api.selectDailyExoplanet(rows, date).name,
  'same UTC day deterministically selects the same world'
);
ok(Number.isInteger(api.stableDailyHash(date)), 'daily hash is an unsigned integer');

ok(worker.includes('cleanPath === "/api/exoplanets/daily"'), 'daily endpoint is routed');
ok(worker.includes('select top 256'), 'archive candidate query is bounded');
ok(worker.includes('from pscomppars'), 'current PSCompPars table is used');
ok(worker.includes('selectionDate === utcDate'), 'cache turns over at the UTC date boundary');
ok(worker.includes('serving last-known-good world'), 'previous daily world survives an outage');
ok(worker.includes('signal: AbortSignal.timeout(10000)'), 'archive request has a hard deadline');
ok(worker.includes('"X-Robots-Tag": "noindex, nofollow"'), 'daily endpoint stays out of search');

ok(index.includes('world:function'), 'world terminal command is registered');
ok(index.includes('exoplanet:function'), 'exoplanet alias is registered');
ok(index.includes("fsEntry('exoplanet','file','cr--r--r--')"), 'exoplanet device is mounted');
ok(index.includes("path==='/dev/exoplanet'"), 'exoplanet device is readable');
ok(index.includes('SAME UTC DAY, SAME WORLD'), 'daily deterministic promise is visible');
ok(index.includes('radius band is not a composition claim'), 'size classification limitation is visible');
ok(index.includes('symbolic terminal render'), 'ASCII art is labeled as symbolic');
ok(!index.includes('exoplanetarchive.ipac.caltech.edu'), 'browser talks only to same-origin edge adapter');
const help = between(index, 'help:function()', 'about:function()');
ok(!help.includes('>world<'), 'daily world remains a filesystem-discovered executable');

async function cacheContractChecks() {
  const jsonResponse = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers }
  });
  const factory = new Function(
    'caches', 'fetch', 'withSecurityHeaders', 'jsonResponse',
    `const EXOPLANET_API=${JSON.stringify('https://archive.invalid/TAP/sync')};\n` +
    `const EXOPLANET_CACHE_URL=${JSON.stringify('https://spacecat.watch/api/exoplanets/daily?schema=1')};\n` +
    `${cleanTextCode}\n${finiteNumberCode}\n${edgeResponseCode}\n${exoplanetCode}\n${handlerCode}\n` +
    'return handleDailyExoplanet;'
  );
  const security = (response) => response;
  const today = new Date().toISOString().slice(0, 10);
  let calls = 0;
  let handler = factory(
    { default: {
      match: async () => jsonResponse({ selectionDate: today, world: { name: 'Cached World' } }),
      put: async () => { throw new Error('fresh cache must not be rewritten'); }
    } },
    async () => { calls += 1; throw new Error('must not fetch'); },
    security,
    jsonResponse
  );
  let response = await handler(new Request('https://spacecat.watch/api/exoplanets/daily'), null);
  equal(response.headers.get('X-Spacecat-Cache'), 'HIT', 'current UTC world is an edge hit');
  equal(calls, 0, 'current UTC world suppresses upstream fetch');

  const oldWorld = { selectionDate: '2000-01-01', world: { name: 'Last Known World' } };
  handler = factory(
    { default: { match: async () => jsonResponse(oldWorld), put: async () => {} } },
    async () => { throw new Error('simulated archive outage'); },
    security,
    jsonResponse
  );
  response = await handler(new Request('https://spacecat.watch/api/exoplanets/daily'), null);
  equal(response.status, 200, 'old world remains readable during archive outage');
  equal(response.headers.get('X-Spacecat-Cache'), 'STALE', 'old world is labeled stale');

  handler = factory(
    { default: { match: async () => null, put: async () => {} } },
    async () => { throw new Error('simulated cold-start outage'); },
    security,
    jsonResponse
  );
  response = await handler(new Request('https://spacecat.watch/api/exoplanets/daily'), null);
  equal(response.status, 502, 'cold-start archive outage fails explicitly');
}

const script = index.match(/<script>([\s\S]*?)<\/script>/);
ok(!!script, 'main application script exists');
new Function(script[1]);
checks += 1;

cacheContractChecks().then(() => {
  console.log(`NASA Exoplanet Archive terminal checks OK (${checks})`);
}).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
