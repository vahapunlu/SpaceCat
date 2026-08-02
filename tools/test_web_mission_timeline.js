#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const index = fs.readFileSync(path.join(__dirname, '..', 'web', 'index.html'), 'utf8');
let checks = 0;
function ok(condition, label) {
  checks += 1;
  if (!condition) throw new Error(label);
}

const timelineSource = index.match(/function relativeSeconds\(value\)\{[\s\S]*?\n\n  function slim\(L\)/);
ok(!!timelineSource, 'mission timeline helpers are extractable');
const helpers = timelineSource[0].replace(/\n\n  function slim\(L\)[\s\S]*$/, '');
const api = new Function(`function p2(n){return String(n).padStart(2,'0');}\n${helpers}\nreturn {relativeSeconds,normalizeTimeline,missionTimeline,timelineEvent,timelineNow};`)();

ok(api.relativeSeconds('PT1M8S') === 68, 'positive LL2 relative time parses');
ok(api.relativeSeconds('-PT38M') === -2280, 'negative countdown relative time parses');
ok(api.relativeSeconds('P1DT2H3M4S') === 93784, 'day/hour duration parses');
ok(api.relativeSeconds('not-a-duration') === null, 'invalid relative time is rejected');

const rows = [
  {type:{name:'Liftoff'}, relative_time:'PT0S'},
  {type:{name:'Max-Q'}, relative_time:'PT1M8S'},
  {type:{name:'Stage Separation'}, relative_time:'PT2M29S'},
  {type:{name:'Entry Burn'}, relative_time:'PT5M59S'},
  {type:{name:'Landing'}, relative_time:'PT8M19S'},
  {type:{name:'Starlink Deployment'}, relative_time:'PT1H1M28S'},
  {type:{name:'Press conference'}, relative_time:'PT2H'},
];
const normalized = api.normalizeTimeline(rows);
ok(normalized.length === 6, 'only launch-flight events are admitted');
ok(normalized[0].code === 'LIFTOFF' && normalized[0].t === 0, 'liftoff is normalized');
ok(normalized.find(event => event.code === 'SEP').t === 149, 'stage separation is normalized');
ok(normalized.find(event => event.code === 'LAND').channel === 'BOOSTER', 'landing is assigned to booster lane');
ok(normalized.at(-1).code === 'DEPLOY' && normalized.at(-1).t === 3688, 'deployment sets mission-specific end');

const mission = {rocket:'Falcon 9', timeline:normalized, landings:[]};
const profile = api.missionTimeline(mission);
ok(profile.trusted === true && profile.source === 'MISSION TIMELINE', 'source timeline is marked trusted');
ok(profile.end === 3688, 'animation ends at the last trusted event');
ok(api.timelineEvent(profile, 'LAND', 0) === 499, 'named event time is addressable');
ok(api.timelineNow(mission, -500_000).booster === 'LANDING WINDOW · RESULT PENDING', 'landing is not falsely declared successful');
ok(api.timelineNow(mission, 600_000).next.code === 'LIFTOFF', 'prelaunch panel does not skip liftoff');

const fallback = api.missionTimeline({rocket:'Falcon 9', timeline:[]});
ok(fallback.trusted === false && fallback.source === 'GENERIC PROFILE', 'missing timeline uses disclosed fallback');
ok(fallback.end === 540, 'generic Falcon profile retains bounded end');

ok(index.includes('MISSION ANOMALY · NOMINAL TIMELINE TERMINATED'), 'flight anomaly terminates nominal path');
ok(index.includes('SOURCE-REPORTED ANOMALY · PATH FROZEN'), 'anomaly freezes the last symbolic frame');
ok(index.includes('DUAL CHANNEL · PLANNED EVENTS'), 'dual-stage hero is present');
ok(index.includes('PAYLOAD DEPLOYED · SOURCE'), 'payload-deployed state is visible');
ok(index.includes("'sc_ll2_v7'"), 'timeline schema uses a fresh cache namespace');

const script = index.match(/<script>([\s\S]*?)<\/script>/);
ok(!!script, 'main script exists');
new Function(script[1]);
checks += 1;

console.log(`Mission timeline checks OK (${checks})`);
