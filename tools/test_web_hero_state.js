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

const dispositionSource = index.match(/function missionDisposition\(status\)\{[\s\S]*?\n  \}\n  function liveGate/);
const phaseSource = index.match(/function heroPhase\(mission,diff,offline\)\{[\s\S]*?\n  \}\n  function heroArt/);
const activeSource = index.match(/function activeLaunches\(list,nowMs\)\{[\s\S]*?\n  \}\n\n  var llPromise/);
ok(!!dispositionSource, 'mission disposition function is extractable');
ok(!!phaseSource, 'hero phase function is extractable');
ok(!!activeSource, 'active launch retention function is extractable');

const missionFunction = dispositionSource[0].replace(/\n  function liveGate[\s\S]*$/, '');
const phaseFunction = phaseSource[0].replace(/\n  function heroArt[\s\S]*$/, '');
const activeFunction = activeSource[0].replace(/\n\n  var llPromise[\s\S]*$/, '');
const timelineStubs = `
function timelineNow(){return {current:null,profile:{events:[],end:540},landing:null};}
function timelineEvent(profile,code,fallback){return fallback;}`;
const functions = new Function(`${missionFunction}\n${timelineStubs}\n${phaseFunction}\n${activeFunction}\nreturn {heroPhase,activeLaunches};`)();
const heroPhase = functions.heroPhase;
const activeLaunches = functions.activeLaunches;

ok(heroPhase('Go', 60_000, false) === 'pad', 'future GO mission stays on pad');
ok(heroPhase('Go', 5_000, false) === 'ignition', 'confirmed GO enters final ignition window');
ok(heroPhase('Go', -5_000, false) === 'awaiting', 'past T-0 without flight confirmation stays conservative');
ok(heroPhase('Hold', -5_000, false) === 'pad', 'hold never launches the hero rocket');
ok(heroPhase('TBC', -5_000, false) === 'pad', 'unconfirmed status never launches the hero rocket');
ok(heroPhase('In Flight', -5_000, false) === 'ignition', 'early confirmed flight shows ignition');
ok(heroPhase('Launch in Flight', -60_000, false) === 'ascent', 'confirmed T+60 flight shows ascent');
ok(heroPhase('In Flight', -300_000, false) === 'upper', 'confirmed T+5m flight shows upper stage');
ok(heroPhase('In Flight', -1_200_000, false) === 'orbit', 'confirmed T+20m flight shows orbit watch');
ok(heroPhase('Success', -1_200_000, false) === 'success', 'confirmed success shows completion state');
ok(heroPhase('Payload Deployed', -1_200_000, false) === 'deployed', 'confirmed payload deployment has a distinct completion state');
ok(heroPhase('Failure', -60_000, false) === 'anomaly', 'failure shows anomaly without inferred path');
ok(heroPhase('Partial Failure', -60_000, false) === 'anomaly', 'partial failure shows anomaly without inferred path');
ok(heroPhase('In Flight', -60_000, true) === 'pad', 'offline demo never masquerades as live flight');

const NOW = Date.parse('2026-08-01T06:00:00Z');
const mission = (ageMs, status) => ({name:status, status, net:new Date(NOW-ageMs).toISOString()});
ok(activeLaunches([mission(2*60*60*1000, 'In Flight')], NOW).length === 1, 'confirmed flight remains primary for three hours');
ok(activeLaunches([mission(4*60*60*1000, 'In Flight')], NOW).length === 0, 'stale flight cannot pin the hero forever');
ok(activeLaunches([mission(75*60*1000, 'Success')], NOW).length === 1, 'recent final result remains visible');
ok(activeLaunches([mission(2*60*60*1000, 'TBC')], NOW).length === 0, 'stale unconfirmed schedule keeps the one-hour cutoff');

ok(index.includes('STATUS-DRIVEN · NOT TELEMETRY'), 'orbit art discloses symbolic status-driven rendering');
ok(index.includes('NO FLIGHT PATH INFERRED'), 'anomaly art refuses to invent a trajectory');
ok(index.includes('T-0 PASSED · AWAIT STATUS'), 'source-lag state remains visibly conservative');
ok(index.includes("art.dataset.phase=phase"), 'rendered hero exposes its phase for deterministic QA');
ok(index.includes("role=\"img\" aria-label=\"Symbolic launch pad status\""), 'ASCII hero has an accessible image label');
ok(index.includes('source status + real clock drive this symbolic ignition frame'), 'ignition disclosure is visible');
ok(index.includes('upper-stage watch follows the mounted mission profile · not telemetry'), 'upper-stage profile disclosure is visible');
ok(index.includes("engage.hidden=!priority||priority.final||phase==='orbit'"), 'late and final outcomes do not offer an already-finished live tracker');
ok(index.includes("d.code==='FLIGHT'&&diff<=0&&diff>-3*60*60*1000"), 'watchstander follows confirmed flight beyond the old one-hour cutoff');
ok(index.includes("flightActive=missionDisposition(m.status).code==='FLIGHT'"), 'hero polling remains active while the source reports flight');
ok(index.includes("var watchForce=force==='watch', hardForce=force===true"), 'watch refresh is distinct from a hard manual refresh');
ok(index.includes("var freshFor=(watchForce||nearMission)?6*60*1000:30*60*1000"), 'near-launch cache tightens to six minutes');
ok(index.includes("getLaunches('watch')"), 'hero uses quota-aware watch refreshes');
ok(index.includes("if(disposition.code==='FLIGHT')return 6*60*1000"), 'confirmed flight refreshes at six-minute cadence');
ok(index.includes('return 10*60*1000'), 'quiet watch retains ten-minute cadence');
ok((index.match(/getLaunches\(true\)\.then\(function\(fresh\)/g) || []).length === 1,
  'only the user-engaged live tracker retains a hard refresh');

const script = index.match(/<script>([\s\S]*?)<\/script>/);
ok(!!script, 'main script exists');
new Function(script[1]);
checks += 1;

console.log(`Status-driven hero checks OK (${checks})`);
