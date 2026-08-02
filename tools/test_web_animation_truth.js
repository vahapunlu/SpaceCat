#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const index = fs.readFileSync(path.join(__dirname, '..', 'web', 'index.html'), 'utf8');
const worker = fs.readFileSync(path.join(__dirname, '..', 'web', '_worker.js'), 'utf8');
let checks = 0;
function ok(condition, label) {
  checks += 1;
  if (!condition) throw new Error(label);
}

const truthSource = index.match(/function timelineAuthority\(profile\)\{[\s\S]*?\n  \}\n\n  function slim\(L\)/);
ok(!!truthSource, 'truth-contract helpers are extractable');
const truthHelpers = truthSource[0].replace(/\n\n  function slim\(L\)[\s\S]*$/, '');
const truth = new Function(`${truthHelpers}\nreturn {timelineAuthority,truthLegend};`)();

ok(truth.timelineAuthority({trusted:true}) === 'PLANNED · MISSION TIMELINE', 'trusted mission events are planned, not telemetry');
ok(truth.timelineAuthority({trusted:false}) === 'MODEL · GENERIC PROFILE', 'fallback events are explicitly modeled');
ok(truth.truthLegend({trusted:true}, true, true).includes('SOURCE</span> status + T-0'), 'live source clock/status is disclosed');
ok(truth.truthLegend({trusted:true}, true, true).includes('PLANNED</span> mission events'), 'source timeline is described as planned');
ok(truth.truthLegend({trusted:false}, true, true).includes('MODEL</span> generic events'), 'generic timeline is described as modeled');
ok(truth.truthLegend(null, false, false).includes('MODEL</span> offline demo clock + metadata'), 'offline demo never claims a source clock');

const rngSource = index.match(/function hash32\(s\)\{[\s\S]*?\n  \}\n  function patchText\(m\)/);
ok(!!rngSource, 'mission RNG helpers are extractable');
const rngHelpers = rngSource[0].replace(/\n  function patchText\(m\)[\s\S]*$/, '');
const rng = new Function(`${rngHelpers}\nreturn {missionRng};`)();
const mission = {id:'mission-42', name:'TEST FLIGHT', net:'2026-08-01T12:00:00Z'};
const a = rng.missionRng(mission, 'live');
const b = rng.missionRng(mission, 'live');
const c = rng.missionRng(mission, 'cinema');
const seqA = [a(), a(), a(), a()];
const seqB = [b(), b(), b(), b()];
const seqC = [c(), c(), c(), c()];
ok(JSON.stringify(seqA) === JSON.stringify(seqB), 'same mission and lane produce the same scene sequence');
ok(JSON.stringify(seqA) !== JSON.stringify(seqC), 'cinema and live lanes receive distinct deterministic sequences');
ok(seqA.every(value => value >= 0 && value < 1), 'deterministic scene values stay in range');

const cinemaBlock = index.match(/function runCinema\(m,realMission\)\{[\s\S]*?\/\* ══ LIVE SYNC/);
const liveBlock = index.match(/function runLive\(m,realMission,options\)\{[\s\S]*?\/\* ── SHELL/);
ok(!!cinemaBlock && !!liveBlock, 'both animation engines are inspectable');
ok(!cinemaBlock[0].includes('Math.random'), 'cinema scene has no nondeterministic random source');
ok(!liveBlock[0].includes('Math.random'), 'live scene has no nondeterministic random source');
ok((index.match(/if\(document\.hidden\)return;/g) || []).length === 2, 'both dominant launch scenes pause while the page is hidden');
ok(index.includes('experienceInterval(experienceId,step,reduce?480:120)'), 'live scene lowers its update rate for reduced-motion users');

ok(index.includes('│ MODEL ALT'), 'altitude is labeled as a model');
ok(index.includes('│ MODEL VEL'), 'velocity is labeled as a model');
ok(index.includes('│ SOURCE STATUS'), 'provider mission status is labeled as source data');
ok(index.includes("timelineProfile.trusted?'PLANNED':'MODEL'"), 'event authority follows the mounted timeline');
ok(index.includes('│ PLANNED BOOSTER'), 'booster lane is explicitly planned');
ok(index.includes("eventBeat==='MAXQ'") && index.includes("eventBeat==='SEP'"), 'Max-Q and separation receive bounded event beats');
ok(index.includes("eventBeat==='FAIRING'") && index.includes("eventBeat==='DEPLOY'"), 'fairing and deployment receive bounded event beats');
ok(index.includes("eventBeat==='LAND_BURN'"), 'landing burn receives a bounded booster beat');
ok(index.includes('modelT<mecoSec') && index.includes('modelT>=sesSec&&modelT<secoSec'), 'engine flame follows planned cutoff/start windows');

ok(index.includes('.truth-strip') && index.includes('overflow-wrap:anywhere'), 'truth legend wraps safely on narrow screens');
ok(index.includes('.truth-strip{font-size:11px;letter-spacing:.02em}'), 'truth legend has a compact phone treatment');
ok(!worker.includes('launch telemetry'), 'route metadata does not claim launch telemetry');
ok(worker.includes('clearly labeled modeled ascent'), 'route metadata discloses the modeled ascent');

const script = index.match(/<script>([\s\S]*?)<\/script>/);
ok(!!script, 'main script exists');
new Function(script[1]);
checks += 1;

console.log(`Animation truth-contract checks OK (${checks})`);
