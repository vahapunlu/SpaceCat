#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const index = fs.readFileSync(path.join(root, 'web', 'index.html'), 'utf8');

function between(source, start, end) {
  const a = source.indexOf(start);
  const b = source.indexOf(end, a);
  if (a < 0 || b < 0) throw new Error(`source segment missing: ${start}`);
  return source.slice(a, b);
}

const signalCode = between(index, 'var BROADCAST_HOSTS=', 'function slim(L)');
const api = new Function(
  `const location={origin:"https://spacecat.watch"};` +
  `function p2(n){return (n<10?"0":"")+n;}` +
  `${signalCode}` +
  `return {safeBroadcastUrl,normalizeBroadcasts,missionKey,mergeCrosscheck,` +
  `standbyVerification,verificationLabel,verificationDelta,selectedBroadcast};`
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

equal(
  api.missionKey('Falcon 9 Block 5 | Starlink Group 17-52'),
  api.missionKey('Starlink (17-52)'),
  'provider-specific Starlink names resolve to one mission key'
);
equal(
  api.missionKey('Véronique AGI 47'),
  'veronique-agi-47',
  'mission key removes accents deterministically'
);

const primary = [{
  name: 'Falcon 9 Block 5 | Starlink Group 17-52',
  net: '2026-08-01T02:00:00.000Z',
  source: 'Launch Library 2',
  broadcasts: [
    { url: 'https://www.youtube.com/watch?v=LL2', platform: 'YouTube' },
    { url: 'https://x.com/i/broadcasts/SHARED', platform: 'X' }
  ]
}];
const standby = [{
  name: 'Starlink (17-52)',
  net: '2026-08-01T02:59:00.000Z',
  source: 'RocketLaunch.Live',
  broadcasts: [
    { url: 'https://x.com/i/broadcasts/SHARED', platform: 'X', live: true, approved: true },
    { url: 'https://evil.example/watch', platform: 'Webcast', live: true }
  ]
}];

const divergence = api.mergeCrosscheck(primary, standby)[0];
equal(divergence.verification.code, 'DIVERGENCE', '59-minute provider drift is exposed');
equal(divergence.verification.deltaSec, 3540, 'provider clock delta preserves its sign');
equal(
  api.verificationLabel(divergence.verification),
  'SCHEDULE DIVERGENCE · RLL +59 MIN',
  'operator label explains the later RLL clock'
);
equal(api.verificationDelta(divergence.verification), '+00:59:00', 'clock delta uses DOS time notation');
equal(divergence.broadcasts.length, 2, 'broadcasts merge, deduplicate, and reject unsafe hosts');
equal(api.selectedBroadcast(divergence).platform, 'X', 'live signal wins over a non-live signal');

const locked = api.mergeCrosscheck(primary, [{
  ...standby[0],
  net: '2026-08-01T02:01:30.000Z'
}])[0];
equal(locked.verification.code, 'LOCK', 'two clocks within two minutes form a source lock');
equal(api.verificationLabel(locked.verification), 'SOURCE LOCK · 2/2', 'lock label reports two sources');

const single = api.mergeCrosscheck(primary, [])[0];
equal(single.verification.code, 'SINGLE', 'missing standby match stays explicitly single-source');
const fallback = api.standbyVerification(standby)[0];
equal(fallback.verification.code, 'STANDBY', 'RLL-only operation is labeled standby');

equal(api.safeBroadcastUrl('https://youtu.be/abc'), 'https://youtu.be/abc', 'allowlisted HTTPS webcast survives');
equal(api.safeBroadcastUrl('http://youtu.be/abc'), null, 'HTTP webcast is rejected');
equal(api.safeBroadcastUrl('https://youtube.com.evil.example/abc'), null, 'lookalike host is rejected');

ok(index.includes('crosscheck:function'), 'crosscheck command is registered');
ok(index.includes('stream:function'), 'stream command is registered');
ok(index.includes("fsEntry('next.broadcast')"), 'broadcast signal is mounted in the mission filesystem');
ok(index.includes("fsEntry('source-lock.status')"), 'source lock is mounted in the mission filesystem');
ok(index.includes('explicit operator click · no autoplay'), 'stream command states its consent boundary');
ok(!/<iframe\b/i.test(index), 'webcast feature does not embed third-party players');
ok(!/\bautoplay\s*=/i.test(index), 'webcast feature cannot autoplay media');
ok(!index.includes('fdo.rocketlaunch.live'), 'premium provider origin stays server-side');

const script = index.match(/<script>([\s\S]*?)<\/script>/);
ok(!!script, 'main application script exists');
new Function(script[1]);
checks += 1;

console.log(`Webcast signal and source-lock checks OK (${checks})`);
