#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const worker = fs.readFileSync(path.join(root, 'web', '_worker.js'), 'utf8');
const index = fs.readFileSync(path.join(root, 'web', 'index.html'), 'utf8');
const gitignore = fs.readFileSync(path.join(root, '.gitignore'), 'utf8');

function between(source, start, end) {
  const a = source.indexOf(start);
  const b = source.indexOf(end, a);
  if (a < 0 || b < 0) throw new Error(`source segment missing: ${start}`);
  return source.slice(a, b);
}

const normalizerCode = between(
  worker,
  'function cleanText',
  'async function handleRocketLaunchFallback'
);
const api = new Function(
  `const BROADCAST_HOSTS=new Set(["youtube.com","www.youtube.com","youtu.be","x.com","www.x.com","twitter.com","www.twitter.com","bilibili.com","www.bilibili.com","live.bilibili.com"]);\n`+
  `${normalizerCode}\nreturn {rocketLaunchStatus,normalizeRocketLaunchBroadcasts,normalizeRocketLaunchData};`
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

const sample = {
  valid_auth: true,
  result: [
    {
      id: 6098,
      name: 'MISSION B',
      t0: '2026-08-02T10:00:00Z',
      result: -1,
      provider: { name: 'Agency B' },
      vehicle: { name: 'Rocket B' },
      pad: {
        name: 'PAD B',
        location: { name: 'Base B', state: 'CA', country: 'United States' }
      },
      missions: [{ description: 'Second mission' }]
    },
    {
      id: 6097,
      name: 'MISSION\u0000 A',
      t0: '2026-08-01T10:00:00Z',
      result: 1,
      provider: { name: 'Agency A' },
      vehicle: { name: 'Rocket A' },
      pad: {
        name: 'PAD A',
        location: { name: 'Base A', country: 'New Zealand' }
      },
      missions: [{ description: 'First mission' }],
      media: [
        {
          media_url: 'https://x.com/i/broadcasts/1AxRnnrObgzxl',
          live_status: true,
          approved: true,
          featured: true
        },
        {
          media_url: 'https://x.com/i/broadcasts/1AxRnnrObgzxl',
          approved: true
        },
        {
          media_url: 'https://evil.example/watch/secret',
          approved: true
        },
        {
          media_url: 'http://www.youtube.com/watch?v=unsafe',
          approved: true
        },
        {
          youtube_vidid: 'SAFE123',
          approved: true
        }
      ]
    },
    {
      id: 6099,
      name: 'NO EXACT T0',
      t0: null,
      result: -1
    }
  ]
};

const normalized = api.normalizeRocketLaunchData(sample);
equal(normalized.length, 2, 'launches without exact T0 are excluded');
equal(normalized[0].id, 'rll-6097', 'records are sorted by exact T0');
equal(normalized[0].status, 'Launch Successful', 'result code maps to confirmed success');
equal(normalized[1].status, 'TBC', 'unset result stays conservative');
equal(normalized[0].source, 'RocketLaunch.Live', 'source attribution survives normalization');
equal(normalized[0].name, 'MISSION A', 'control characters are removed');
equal(normalized[1].loc, 'Base B, CA, United States', 'location is normalized');
equal(normalized[0].broadcasts.length, 2, 'safe webcast signals are deduplicated');
equal(normalized[0].broadcasts[0].platform, 'X', 'live X carrier keeps its platform');
equal(normalized[0].broadcasts[0].live, true, 'live signal is prioritized');
equal(normalized[0].broadcasts[1].platform, 'YouTube', 'video id becomes a safe YouTube URL');
ok(!JSON.stringify(normalized).includes('evil.example'), 'unapproved webcast hosts are discarded');
ok(!JSON.stringify(normalized).includes('http://'), 'non-HTTPS webcast URLs are discarded');
equal(api.rocketLaunchStatus(0), 'Launch Failure', 'failure result maps safely');
equal(api.rocketLaunchStatus(2), 'Partial Failure', 'partial failure maps safely');
equal(api.rocketLaunchStatus(3), 'In-Flight Abort', 'abort result is preserved');
equal(
  api.normalizeRocketLaunchData({ response: sample }).length,
  2,
  'premium response envelope is accepted'
);

ok(worker.includes('Authorization: `Bearer ${env.ROCKETLAUNCH_API_KEY}`'), 'secret uses Authorization header');
ok(!worker.includes('?key=${env.ROCKETLAUNCH_API_KEY}'), 'secret is never placed in a URL');
ok(worker.includes('signal: AbortSignal.timeout(8000)'), 'premium upstream has a hard deadline');
ok(worker.includes('caches.default'), 'premium fallback is edge cached');
ok(worker.includes('upcoming?schema=2'), 'schema-v2 cache key cannot reuse the old media-free payload');
ok(worker.includes('schema: 2'), 'public endpoint announces the normalized schema');
ok(worker.includes('slice(0, 5)'), 'public response is limited to five exact launches');
ok(worker.includes('"X-Robots-Tag": "noindex, nofollow"'), 'API response stays out of search');
ok(index.includes('var RLL_FALLBACK="/api/launches/upcoming?schema=2"'), 'browser calls only the same-origin vault');
ok(index.includes('fetchWithTimeout(RLL_FALLBACK') && index.includes('},2500)'), 'browser standby crosscheck is bounded');
ok(index.includes('fetchWithTimeout(LL2,{},8000)'), 'browser primary launch request is bounded');
ok(!index.includes('fdo.rocketlaunch.live'), 'premium origin and key path stay out of the browser bundle');
ok(index.includes("source:\"Launch Library 2\""), 'LL2 remains the named primary source');
ok(index.includes("source: \"RocketLaunch.Live\"") || worker.includes('source: "RocketLaunch.Live"'), 'standby source is explicit');
ok(index.includes('Data by RocketLaunch.Live (standby)'), 'required attribution is visible');
ok(gitignore.split(/\r?\n/).includes('keystore/'), 'local secret directory is ignored');

const script = index.match(/<script>([\s\S]*?)<\/script>/);
ok(!!script, 'main application script exists');
new Function(script[1]);
checks += 1;

console.log(`RocketLaunch.Live fallback checks OK (${checks})`);
