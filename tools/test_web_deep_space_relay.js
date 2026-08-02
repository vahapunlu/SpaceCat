#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const index = fs.readFileSync(path.join(root, 'web', 'index.html'), 'utf8');
const worker = fs.readFileSync(path.join(root, 'web', '_worker.js'), 'utf8');
const script = index.match(/<script>([\s\S]*?)<\/script>/);
if (!script) throw new Error('web/index.html: main script not found');
new Function(script[1]);

let checks = 1;
function ok(condition, label) {
  checks += 1;
  if (!condition) throw new Error(label);
}
function between(source, start, end) {
  const a = source.indexOf(start);
  const b = source.indexOf(end, a);
  if (a < 0 || b < 0) throw new Error(`source segment missing: ${start}`);
  return source.slice(a, b);
}

const probes = {
  voyager1: '-31', voyager2: '-32', newhorizons: '-98', juno: '-61',
  curiosity: '-76', mro: '-74', lucy: '-49', jwst: '-170'
};
Object.entries(probes).forEach(([key, id]) => {
  ok(worker.includes(`${key}: { id: "${id}"`), `${key} has a server-controlled Horizons id`);
  ok(index.includes(`${key}:{name:`), `${key} has front-end educational metadata`);
});

const relay = between(index, '/* ── DEEP SPACE RELAY LAB', '/* ── SATNOGS');
ok(relay.includes("DSN_TRAINING_KEY='sc_dsn_training_v1'"), 'training queue has isolated device storage');
ok(relay.includes('rows.slice(-20)'), 'training queue is bounded to twenty packets');
ok(relay.includes("target!=='sc-felicette-1'"), 'only the fictional target is writable');
ok(relay.includes('REAL OBJECTS ARE READ-ONLY'), 'real object writes fail closed');
ok(relay.includes('AUTHORITY NONE'), 'real-object authority is explicit');
ok(relay.includes('RF_PATH      DISCONNECTED'), 'RF path is explicitly disconnected');
ok(relay.includes('NOT SPACECRAFT TELEMETRY'), 'ephemeris is never labeled telemetry');
ok(relay.includes('AFFILIATION  NONE'), 'independence is explicit');
ok(relay.includes("horizonsSnapshotFetch('mars')"), 'training delay uses the existing public Mars range adapter');
ok(!relay.includes('fetch('), 'relay layer cannot call a control or network endpoint directly');
ok(!relay.includes('WebSocket'), 'relay layer cannot open a socket');
ok(!relay.includes('EventSource'), 'relay layer cannot open a streaming channel');

['status report', 'attitude hold', 'science scan', 'antenna home', 'sleep', 'wake'].forEach((command) =>
  ok(relay.includes(`'${command}'`), `${command} is in the bounded training allowlist`));
ok((relay.match(/:'(?:return|hold|run|enter|resume)/g) || []).length === 6, 'training allowlist has exactly six commands');

['dsn', 'probe', 'telemetry', 'antenna', 'uplink'].forEach((command) => {
  ok(index.includes(`${command}:function`), `${command} command is registered`);
  ok(index.includes(`${command}:1`), `${command} is excluded from tab completion`);
});

[
  "fsEntry('relay','dir')", "path==='/observatory/relay/README.TXT'",
  "path==='/observatory/relay/probes.list'", "path==='/observatory/relay/last.ephemeris'",
  "path==='/observatory/relay/training.target'", "path==='/observatory/relay/uplink.queue'",
  "path==='/var/spool/uplink/queue.log'", "path==='/dev/dsn'", "path==='/proc/dsn'"
].forEach((needle) => ok(index.includes(needle), `${needle} is mounted`));

ok(index.includes('No NASA, JPL, DSN, spacecraft or ground-station control endpoint is contacted.'),
  'spool README states the control boundary');
ok(index.includes("link:{url:'https://ssd.jpl.nasa.gov/horizons/'"), 'official source page is linked');
ok(index.includes('scheduleTrainingWake();'), 'local delayed acknowledgements are resumed');
ok(index.includes("'dsn-training':{lane:'SIMULATION'"), 'training delay is registered with the experience kernel');
ok(index.includes("'/observatory/relay horizons-public+local-training ro-sim'"), 'relay mount declares mixed read-only/simulation provenance');

const help = between(index, 'help:function()', 'about:function()');
['dsn', 'probe', 'telemetry', 'antenna', 'uplink', 'SC-FELICETTE-1'].forEach((term) =>
  ok(!help.includes(term), `${term} is absent from help`));

console.log(`Deep-space relay checks OK (${checks})`);
