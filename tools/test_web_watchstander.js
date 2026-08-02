#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'web', 'index.html'), 'utf8');
const match = html.match(/<script>([\s\S]*?)<\/script>/);
if (!match) throw new Error('web/index.html: main script not found');
const source = match[1];

function between(start, end) {
  const a = source.indexOf(start);
  const b = source.indexOf(end, a);
  if (a < 0 || b < 0) throw new Error(`source segment missing: ${start}`);
  return source.slice(a, b);
}

const dispositionCode = between('function missionDisposition', 'function liveGate');
const watchCode = between('function watchCondition', 'function readCachedSolarKp');
const api = new Function(
  `${dispositionCode}\n${watchCode}\nreturn {missionDisposition,watchCondition};`
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

const now = Date.parse('2026-08-01T00:00:00Z');
const mission = (minutes, status = 'Go') => ({
  id: 'mission-1',
  name: 'TEST FLIGHT',
  status,
  net: new Date(now + minutes * 60000).toISOString()
});

equal(api.watchCondition(null, now, null).code, 'UPLINK', 'missing mission waits for uplink');
equal(api.watchCondition(mission(24 * 60), now, null).code, 'NOMINAL', 'distant mission stays quiet');
equal(api.watchCondition(mission(5 * 60), now, null).code, 'LAUNCH_DAY', 'six-hour watch opens');
equal(api.watchCondition(mission(45), now, null).code, 'PRIORITY', 'T-60 priority window');
equal(api.watchCondition(mission(5), now, null).code, 'FINAL', 'T-10 final count');
equal(api.watchCondition(mission(-5), now, null).code, 'ASCENT', 'T+ ascent channel');
equal(api.watchCondition(mission(30, 'Hold'), now, null).code, 'HOLD', 'hold overrides countdown');
equal(
  api.watchCondition(mission(120, 'TBC'), now, null).code,
  'UNCONFIRMED',
  'unconfirmed clock stays conservative'
);
equal(api.watchCondition(mission(-5, 'Success'), now, null).code, 'RESULT', 'success becomes result');
equal(api.watchCondition(mission(-5, 'Failure'), now, null).level, 'RED', 'failure result is red');
equal(api.watchCondition(mission(-5, 'Scrubbed'), now, null).code, 'RESULT', 'scrub is final result');
equal(api.watchCondition(mission(24 * 60), now, 6).code, 'SOLAR', 'fresh high Kp opens solar watch');
equal(api.watchCondition(null, now, 5).code, 'SOLAR', 'solar watch survives LL2 outage');
equal(api.watchCondition(mission(5), now, 7).code, 'FINAL', 'launch window outranks solar watch');
equal(api.watchCondition(mission(5), now, null).action, 'track', 'final count directs to track');
equal(api.watchCondition(mission(120, 'TBD'), now, null).action, 'scan', 'uncertain T-0 directs to scan');
equal(api.watchCondition(mission(24 * 60), now, 6).action, 'solar', 'solar watch directs to solar');
equal(api.watchCondition(mission(24 * 60), now, null).action, 'help', 'nominal watch keeps default help');

const watchRuntime = between('/* ── AUTONOMOUS WATCHSTANDER', 'function retargetDirective');
ok(!/\bfetch\s*\(/.test(watchRuntime), 'watchstander performs no network request');
ok(!/\bsetInterval\s*\(|\bsetTimeout\s*\(/.test(watchRuntime), 'watchstander owns no timer');
ok(!/localStorage\.setItem/.test(watchRuntime), 'watchstander writes no local data');
ok(!/\bNotification\b|\bnew Audio\b/.test(watchRuntime), 'watchstander owns no notification or audio');
ok(
  source.includes("if(signature===state.watchSignature)return w;"),
  'unchanged state does not rewrite the DOM'
);
ok(source.includes('applyWatchCondition(off?null:m);'), 'existing hero clock drives watch state');
ok(source.includes('Autonomous watchstander ............'), 'boot exposes a restrained system clue');
ok(source.includes("fsEntry('watch.log')"), 'watch log is mounted');
ok(source.includes("fsEntry('watch')"), 'proc watch file is mounted');
ok(source.includes("if(path==='/proc/watch')"), 'proc watch report is readable');
ok(source.includes("if(path==='/var/log/watch.log')"), 'watch log report is readable');
ok(source.includes('advisory only · no automatic command'), 'report states non-automation policy');
ok(source.includes('The watchstander cannot run commands'), 'manual freezes authority boundary');

const help = between('help:function()', 'about:function()');
ok(!/watchstander/i.test(help), 'main help remains unchanged');

new Function(source);
checks += 1;

console.log(`Phase 11 Watchstander checks OK (${checks})`);
