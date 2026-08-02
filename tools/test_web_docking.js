#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const terminalHtml = fs.readFileSync(path.join(root, 'web', 'index.html'), 'utf8');
const gameHtml = fs.readFileSync(path.join(root, 'web', 'games', 'docking.html'), 'utf8');
const prototypeHtml = fs.readFileSync(path.join(root, 'prototypes', 'orbital-docking', 'index.html'), 'utf8');
const gameScript = gameHtml.match(/<script>([\s\S]*?)<\/script>/);
const prototypeScript = prototypeHtml.match(/<script>([\s\S]*?)<\/script>/);
if (!gameScript || !prototypeScript) throw new Error('orbital docking script missing');

function between(source, start, end) {
  const a = source.indexOf(start);
  const b = source.indexOf(end, a);
  if (a < 0 || b < 0) throw new Error(`source segment missing: ${start}`);
  return source.slice(a, b);
}

let checks = 0;
function ok(value, label) { checks += 1; if (!value) throw new Error(label); }
function equal(actual, expected, label) {
  checks += 1;
  if (actual !== expected) throw new Error(`${label}: expected ${expected}, got ${actual}`);
}

new Function(gameScript[1]);
checks += 1;
equal(gameScript[1], prototypeScript[1], 'production and approved prototype use identical game logic');
ok(gameHtml.includes('<meta name="robots" content="noindex,follow">'), 'hidden game is excluded from search results');
ok(gameHtml.includes('<link rel="canonical" href="https://spacecat.watch/games/docking">'), 'game has a stable canonical URL');
ok(gameHtml.includes('href="/">[RETURN TO SPACE CAT TERMINAL]</a>'), 'game offers an explicit terminal return path');
ok(gameHtml.includes('.return{') && gameHtml.includes('min-height:48px'), 'return path is a mobile-size touch target');
ok(gameHtml.includes('TRAINING MODEL · SYMBOLIC RELATIVE MOTION · NOT TELEMETRY · NOT FLIGHT SOFTWARE'), 'truth contract remains visible');
equal((gameHtml.match(/data-control=/g) || []).length, 4, 'four touch flight controls are visible');
ok(gameHtml.includes("button.addEventListener('pointerdown'"), 'flight controls support press and hold');
ok(gameHtml.includes("document.addEventListener('keydown'"), 'keyboard controls remain available');
ok(gameHtml.includes('@media(max-width:600px)') && gameHtml.includes('@media(max-width:340px)'), 'narrow mobile breakpoints exist');
ok(gameHtml.includes('min-height:48px'), 'interactive controls exceed the 44px touch minimum');
ok(gameHtml.includes('id="comms" type="button" aria-pressed="true">[COMMS ON]'), 'station voice is visibly armed by default');
ok(gameHtml.includes('ARMED · BEGIN APPROACH TO OPEN'), 'opening screen explains that sound begins with the approach gesture');
ok(gameHtml.includes('<audio id="radio" preload="none"></audio>') && !gameHtml.includes('<audio id="radio" autoplay'), 'audio cannot autoplay');
ok(gameScript[1].includes("if(commsOn)stationCall('online');"), 'Begin Approach opens the armed channel inside a user gesture');
ok(gameScript[1].includes("channelText(state.started?'ONLINE':'ARMED · BEGIN APPROACH TO OPEN')"), 'pre-flight comms can be switched off or left armed without playback');
ok(gameHtml.includes('data-comms-root="/games/docking-comms/"'), 'production voice assets use a non-conflicting static root');
ok(!/\bfetch\s*\(/.test(gameScript[1]), 'game makes no API requests');
ok(!/recordWitness|writeLogbook|CLEARANCE_LEVELS/.test(gameScript[1]), 'game cannot grant terminal clearance');
ok(gameHtml.includes('POST-FLIGHT DEBRIEF') && gameHtml.includes('HOLD POINT 25'), 'procedural debrief and hold gates are present');
ok(gameHtml.includes('id="rcs" type="button">[RCS COARSE]'), 'coarse/fine RCS selector is visible');
ok(gameHtml.includes('id="profile" type="button">[PROFILE NOMINAL]'), 'training profile selector is visible');
ok(gameHtml.includes('SC GAME SYSTEM // CARTRIDGE 20'), 'opening screen uses the Space Cat game cabinet identity');
ok(gameHtml.includes('O R B I T A L   R E N D E Z V O U S'), 'opening screen names the rendezvous game');
ok(gameHtml.includes('MATCH MOMENTUM. EARN CAPTURE.'), 'opening screen carries a mission-specific motto');
ok(gameHtml.includes('HOLD 25 · HOLD 12 · FINE RCS FINAL'), 'opening screen exposes the core procedure before flight');
ok(gameHtml.includes("success?'( ^.^ )':'( x.x )'"), 'result screen gives the Space Cat distinct victory and loss expressions');
ok(gameHtml.includes("'G A M E   O V E R'"), 'failed approach has a dedicated game over screen');
ok(gameHtml.includes("'M I S S I O N   C O M P L E T E'"), 'successful approach has a dedicated completion screen');
ok(gameHtml.includes('.screen-shell[data-mode="gameover"]') && gameHtml.includes('@keyframes gameSignalBreak'), 'game over has a restrained terminal signal-break treatment');
ok(gameHtml.includes('@media(prefers-reduced-motion:reduce)') && gameHtml.includes('.screen-shell[data-mode="intro"]'), 'new docking transitions respect reduced motion');
ok(gameScript[1].includes('b.disabled=true') && gameScript[1].includes('buttons.forEach(function(b){b.disabled=false;});'), 'flight controls remain locked through the opening briefing');

ok(terminalHtml.includes("fsEntry('DOCKING.COM','file','-r-xr-xr-x')"), 'terminal filesystem exposes the executable');
ok(terminalHtml.includes("if(path==='/usr/games/DOCKING.COM')"), 'terminal can inspect the executable artifact');
ok(terminalHtml.includes("docking:function(){location.href='/games/docking';return null;}"), 'docking command opens the production route');
ok(terminalHtml.includes("docking:'DOCKING(6)"), 'manual page documents the simulator');
ok(terminalHtml.includes('ORBITAL RENDEZVOUS .............. <span class="amber">AVAILABLE</span>'), 'wargames easter egg advertises the second simulator');
const help = between(terminalHtml, 'help:function()', 'about:function()');
ok(!/\bdocking\b/i.test(help), 'docking remains absent from main help');

const physics = between(gameScript[1], 'var W=64', 'function readRecord');
const api = new Function(`${physics}\nreturn {W,H,PORT_X,TARGET_Y,initialState,controlPulse,procedureStep,verdict};`)();
const presentationCode = between(gameScript[1], 'function blank()', 'var screen=');
const presentation = new Function(`${physics}\n${presentationCode}\nreturn {intro:introGrid,end:endGrid};`)();
equal(api.W, 64, 'ASCII display has a fixed 64-column model');
equal(api.H, 28, 'ASCII display has a fixed 28-row model');
equal(JSON.stringify(api.initialState()), JSON.stringify(api.initialState()), 'training state is deterministic');
const active = {...api.initialState(), paused:false, started:true};
const coarse = api.controlPulse(active, 'right');
const fine = api.controlPulse({...active, rcsMode:'FINE'}, 'right');
ok(fine.vx - active.vx < coarse.vx - active.vx, 'fine RCS impulse is smaller than coarse impulse');
let hold25 = {...active, x:api.PORT_X - 24, vx:0, vy:0, y:api.TARGET_Y};
for (let i = 0; i < 43; i += 1) hold25 = api.procedureStep(hold25, .06);
ok(hold25.clear25, 'stable Hold Point 25 grants clearance');
let hold12 = {...hold25, x:api.PORT_X - 11, vx:0, vy:0, y:api.TARGET_Y, rcsMode:'FINE'};
for (let i = 0; i < 43; i += 1) hold12 = api.procedureStep(hold12, .06);
ok(hold12.clear12, 'stable fine-RCS Hold Point 12 grants clearance');
equal(api.verdict({...hold12, x:api.PORT_X, y:api.TARGET_Y, vx:.15, vy:.05}).code, 'DOCKED', 'safe cleared contact docks');
const dockingIntro = presentation.intro({best:654,dockings:3});
equal(dockingIntro.length, api.H, 'opening card preserves the fixed display height');
ok(dockingIntro.every(row => row.length === api.W), 'opening card preserves the fixed display width');
ok(dockingIntro.map(row => row.join('')).join('\n').includes('654 PTS · 3 DOCKINGS'), 'opening card renders the device-local record');
const dockingFailure = {...api.initialState(),result:{code:'CONTACT',label:'HARD CONTACT — CAPTURE ABORTED'},grade:'F',score:0};
ok(presentation.end(dockingFailure,{best:654}).map(row => row.join('')).join('\n').includes('G A M E   O V E R'), 'failure card renders inside the fixed ASCII grid');
const dockingVictory = {...api.initialState(),x:api.PORT_X,result:{code:'DOCKED',label:'SOFT CAPTURE CONFIRMED'},grade:'A',score:1500};
ok(presentation.end(dockingVictory,{best:1500}).map(row => row.join('')).join('\n').includes('M I S S I O N   C O M P L E T E'), 'victory card renders inside the fixed ASCII grid');

const commsDir = path.join(root, 'web', 'games', 'docking-comms');
const clips = ['online','range25','clear25','range12','clear12','range5go','closingHigh','driftHigh','docked','contact','procedureAbort'];
for (const clip of clips) {
  const file = path.join(commsDir, `${clip}.mp3`);
  ok(fs.existsSync(file) && fs.statSync(file).size > 1000, `${clip} production voice clip exists`);
}

console.log(`Production orbital docking checks OK (${checks})`);
