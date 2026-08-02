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

const scenarioCode = between('function missionDisposition', '/* Approximate solar elevation');
const lightCode = between('function padLight', 'function weatherCacheKey');
const vehicleCode = between('var R=[', 'var FL=[');
const api = new Function(
  `${scenarioCode}\n${lightCode}\n${vehicleCode}\n` +
  'return {missionDisposition,liveGate,retargetDirective,outcomePresentation,padLight,vehicleProfile};'
)();

let checks = 0;
function equal(actual, expected, label) {
  checks += 1;
  if (actual !== expected) {
    throw new Error(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

equal(api.missionDisposition('Go').code, 'GO', 'GO classification');
equal(api.missionDisposition('Hold').code, 'HOLD', 'HOLD classification');
equal(api.missionDisposition('TBD').blocked, true, 'TBD is conservative');
equal(api.missionDisposition('Launch Successful').code, 'SUCCESS', 'success classification');
equal(api.missionDisposition('Partial Failure').code, 'PARTIAL', 'partial failure classification');
equal(api.missionDisposition('Launch Failure').code, 'FAILURE', 'failure classification');
equal(api.missionDisposition('Scrubbed').code, 'SCRUB', 'scrub classification');
equal(api.missionDisposition('mystery').code, 'UNKNOWN', 'unknown classification');

equal(api.liveGate('Hold', 45).modelT, 0, 'HOLD never leaves pad after scheduled T-0');
equal(api.liveGate('TBD', 45).modelT, 0, 'TBD never leaves pad after scheduled T-0');
equal(api.liveGate('Go', 45).modelT, 45, 'GO follows modeled ascent clock');
equal(api.liveGate('Scrubbed', 1).finish, true, 'scrub produces final result after scheduled T-0');
equal(api.liveGate('Launch Successful', 1).finish, true, 'success produces final result');
equal(api.liveGate('Go', 672, 552).finish, false, 'result window remains open after profile end');
equal(api.liveGate('Go', 673, 552).finish, true, 'modeled live profile ends after its result window');
equal(api.liveGate('Go', 3_689, 3_568).finish, true, 'mission-specific end replaces the old fixed cutoff');
equal(api.liveGate('Launch Failure', 45, 552).finish, false, 'anomaly state remains visible for the freeze window');

equal(
  api.retargetDirective('2026-07-31T10:00:00Z', '2026-07-31T10:12:00Z').label,
  'DELAY +12 MIN',
  'delay retarget label'
);
equal(
  api.retargetDirective('2026-07-31T10:00:00Z', '2026-07-31T09:55:00Z').label,
  'ADVANCE 5 MIN',
  'advance retarget label'
);
equal(
  api.retargetDirective('2026-07-31T10:00:00Z', '2026-07-31T10:00:01Z'),
  null,
  'sub-threshold retarget ignored'
);

const mission = {status: 'Go', endTitle: 'ARCHIVE END'};
equal(
  api.outcomePresentation('simulation', mission, 'Go').title,
  'SIMULATION COMPLETE — PROFILE ENDED',
  'simulation never claims real orbit'
);
equal(
  api.outcomePresentation('live', mission, 'Go').title,
  'LIVE PROFILE ENDED — RESULT PENDING',
  'unconfirmed live result stays pending'
);
equal(
  api.outcomePresentation('live', mission, 'Launch Successful').title,
  'MISSION RESULT — SUCCESS CONFIRMED',
  'confirmed live success'
);
equal(
  api.outcomePresentation('archive', mission, 'Success').title,
  'ARCHIVE END',
  'archive keeps recorded ending'
);

const kennedy = {lat: 28.57, lng: -80.65};
equal(api.padLight(kennedy, Date.parse('2026-06-21T17:00:00Z')).light, 'DAY', 'Kennedy daytime');
equal(api.padLight(kennedy, Date.parse('2026-06-21T05:00:00Z')).light, 'NIGHT', 'Kennedy nighttime');

equal(api.vehicleProfile({rocket: 'Rocket Lab Electron'}).code, 'LIGHT', 'light vehicle profile');
equal(api.vehicleProfile({rocket: 'Falcon Heavy'}).code, 'HEAVY', 'heavy vehicle profile');
equal(api.vehicleProfile({rocket: 'Starship / Super Heavy'}).code, 'SHIP', 'Starship profile');
equal(api.vehicleProfile({rocket: 'Space Shuttle Columbia'}).code, 'WING', 'winged profile');
equal(api.vehicleProfile({rocket: 'Soyuz 2.1a'}).code, 'BOOST', 'strap-on booster profile');
equal(api.vehicleProfile({rocket: 'Falcon 9 Block 5'}).code, 'CORE', 'default core profile');

console.log(`Phase 9.1 deterministic checks OK (${checks})`);
