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

const physicsCode = between('var LANDER_W=', 'function readLanderStats');
const api = new Function(
  `${physicsCode}\nreturn {LANDER_W,LANDER_H,LANDER_PAD_LEFT,LANDER_PAD_RIGHT,LANDER_PAD_CENTER,landerGround,landerInitial,landerStepState,landerControlPulse,landerPadOffset,landerPhase,landerGuidance,landerVerdict,landerScore,landerGrade,landerDebriefText};`
)();
const presentationCode = between('function landerGrid()', 'function landerPaint');
const presentation = new Function(
  `${physicsCode}\n${presentationCode}\nreturn {intro:landerIntroGrid,end:landerEndGrid};`
)();

let checks = 0;
function ok(condition, label) {
  checks += 1;
  if (!condition) throw new Error(label);
}
function equal(actual, expected, label) {
  checks += 1;
  if (actual !== expected) throw new Error(`${label}: expected ${expected}, got ${actual}`);
}

const initialA = api.landerInitial();
const initialB = api.landerInitial();
equal(JSON.stringify(initialA), JSON.stringify(initialB), 'initial state is deterministic');
equal(api.LANDER_W, 56, 'flight display has fixed width');
equal(api.LANDER_H, 26, 'flight display has fixed height');
equal(api.LANDER_PAD_CENTER, 42, 'lighted recovery pad has a stable center');
ok(initialA.x < api.LANDER_PAD_LEFT, 'booster begins downrange from the recovery pad');

for (let x = api.LANDER_PAD_LEFT; x <= api.LANDER_PAD_RIGHT; x += 1) equal(api.landerGround(x), 2, `pad is level at x=${x}`);
ok(api.landerGround(5) >= 1, 'terrain exists outside pad');

const coast = api.landerStepState(initialA, {left:false,right:false,thrust:false}, 1);
ok(coast.vy < initialA.vy, 'gravity accelerates downward');
equal(coast.fuel, initialA.fuel, 'coasting does not burn fuel');

const thrust = api.landerStepState(initialA, {left:false,right:false,thrust:true}, 1);
ok(thrust.vy > coast.vy, 'main engine counters gravity');
ok(thrust.fuel < initialA.fuel, 'main engine burns fuel');

const turnLeft = api.landerStepState(initialA, {left:true,right:false,thrust:false}, .5);
const turnRight = api.landerStepState(initialA, {left:false,right:true,thrust:false}, .5);
ok(turnLeft.angle < initialA.angle, 'left control rotates left');
ok(turnRight.angle > initialA.angle, 'right control rotates right');

const tapLeft = api.landerControlPulse(initialA, 'left');
const tapRight = api.landerControlPulse(initialA, 'right');
const tapThrust = api.landerControlPulse(initialA, 'thrust');
ok(tapLeft.angle < initialA.angle, 'quick left tap produces a deterministic rotation pulse');
ok(tapRight.angle > initialA.angle, 'quick right tap produces a deterministic rotation pulse');
ok(tapThrust.vy > initialA.vy, 'quick thrust tap produces a deterministic engine pulse');
ok(tapThrust.fuel < initialA.fuel, 'quick thrust tap consumes fuel');
equal(tapLeft.elapsed, initialA.elapsed, 'tap pulse does not advance the flight clock');

equal(api.landerVerdict({...initialA,y:10}), null, 'airborne craft has no verdict');
equal(
  api.landerVerdict({...initialA,x:api.LANDER_PAD_CENTER,y:2,vx:.2,vy:-.4,angle:4}).code,
  'LANDED',
  'safe pad contact lands'
);
equal(
  api.landerVerdict({...initialA,x:10,y:api.landerGround(10),vx:0,vy:-.2,angle:0}).code,
  'CRASH',
  'off-pad contact crashes'
);
equal(
  api.landerVerdict({...initialA,x:api.LANDER_PAD_CENTER,y:2,vx:.2,vy:-1.2,angle:4}).code,
  'HARD',
  'excess descent rate causes hard landing'
);
equal(
  api.landerVerdict({...initialA,x:api.LANDER_PAD_CENTER,y:2,vx:.2,vy:-.4,angle:16}).code,
  'HARD',
  'excess attitude causes hard landing'
);
equal(
  api.landerVerdict({...initialA,out:true}).code,
  'LOST',
  'leaving tracking range ends flight'
);

const safeState = {...initialA,x:api.LANDER_PAD_CENTER,y:2,vx:.2,vy:-.4,angle:4,fuel:60};
const safeVerdict = api.landerVerdict(safeState);
ok(api.landerScore(safeState, safeVerdict) > 0, 'safe landing earns score');
equal(api.landerScore(safeState, {code:'HARD'}), 0, 'failed landing earns no score');
ok(
  api.landerScore({...safeState,fuel:80}, safeVerdict) > api.landerScore({...safeState,fuel:20}, safeVerdict),
  'remaining fuel improves score'
);
equal(api.landerPhase(initialA), 'BOOSTBACK', 'high-altitude approach begins in boostback phase');
equal(api.landerPhase({...initialA,y:10}), 'BRAKING', 'mid-altitude approach enters braking phase');
equal(api.landerPhase({...initialA,x:api.LANDER_PAD_CENTER,y:5}), 'FINAL', 'low approach enters final phase');
equal(api.landerGuidance(initialA).horizontal, 'RIGHT', 'guidance points toward the remote pad');
ok(!api.landerGuidance(initialA).go, 'initial high lateral speed is outside the landing envelope');
ok(api.landerGuidance(safeState).go, 'safe contact state is inside the landing envelope');
equal(api.landerGrade(1400, safeVerdict), 'S', 'excellent recovery earns S grade');
equal(api.landerGrade(0, {code:'HARD'}), 'F', 'failed contact earns F grade');
ok(api.landerDebriefText({...safeState,grade:'A'}, safeVerdict).includes('PAD OFFSET'), 'debrief reports pad offset');

let guided = api.landerInitial();
let guidedVerdict = null;
for (let frame = 0; frame < 8000 && !guidedVerdict; frame += 1) {
  const altitude = guided.y - api.landerGround(guided.x);
  const dx = api.LANDER_PAD_CENTER - guided.x;
  const desiredVx = Math.max(-.55, Math.min(.9, dx * .10));
  const desiredAngle = Math.max(-28, Math.min(28, (desiredVx - guided.vx) * 32));
  const desiredVy = altitude > 12 ? -.55 : altitude > 7 ? -.42 : altitude > 3 ? -.28 : -.15;
  const controls = {left:false,right:false,thrust:guided.vy < desiredVy - .035};
  if (guided.angle < desiredAngle - 1) controls.right = true;
  if (guided.angle > desiredAngle + 1) controls.left = true;
  guided = api.landerStepState(guided, controls, .08);
  guidedVerdict = api.landerVerdict(guided);
}
equal(guidedVerdict && guidedVerdict.code, 'LANDED', 'bounded guidance policy can recover the booster');
ok(guided.elapsed < 60, 'guided recovery completes inside one minute');

ok(source.includes("lander:{lane:'TRAINING',mode:'dominant'"), 'lander is registered in Experience Kernel');
ok(source.includes("lander:function(){landerStart();return null;}"), 'lander command starts training');
ok(source.includes("fsEntry('LANDER.COM','file','-r-xr-xr-x')"), 'filesystem exposes executable artifact');
ok(source.includes("if(path==='/usr/games/SCORES.DAT')"), 'filesystem exposes local score record');
ok(source.includes("localStorage.setItem(LANDER_KEY"), 'scores persist locally');
ok(source.includes("experienceInterval('lander',step"), 'physics clock belongs to Experience Kernel');
ok(source.includes("experienceEnd('lander')"), 'exit returns ownership to terminal');
ok(source.includes("experienceOn('lander',document,'keydown'"), 'keyboard controls are kernel-managed');
ok(source.includes("experienceOn('lander',button,'pointerdown'"), 'touch controls support press-and-hold');
ok(source.includes('engageControl(name);'), 'pointer-down applies an immediate control pulse');
ok(source.includes("engageControl('left')"), 'keyboard taps use the same immediate control path');
ok((html.match(/class="lander-control"/g) || []).length === 3, 'three visible flight controls exist');
ok(html.includes('.lander-control,.lander-reset') && html.includes('min-height:44px'), 'touch controls meet target size');
ok(source.includes("LANDER_KEY='sc_lander_v2'"), 'rebalanced recovery has a separate local score generation');
ok(source.includes("'|====PAD01====|'"), 'lighted pad is visibly labeled inside the ASCII terrain');
ok(source.includes('LANDER_PAD_LEFT-3') && source.includes('LANDER_PAD_RIGHT+3'), 'approach corridor rails frame the pad');
ok(source.includes("var flame=frame%3===0") && source.includes("class=\"fl\""), 'launch-cinema flame language is reused');
ok(source.includes("puffs.push({x:craftCenter-2") && source.includes("puffs.push({x:craftCenter+2"), 'low-altitude landing burn spreads dust in both directions');
ok(source.includes('class="lander-guidance"') && source.includes('LANDING ENVELOPE GO'), 'guidance strip exposes the safe landing envelope');
ok(source.includes('class="lander-debrief" hidden') && source.includes('POST-FLIGHT RECOVERY DEBRIEF'), 'technical post-flight debrief is present');
ok(source.includes('class="lander-start"') && source.includes('[BEGIN RECOVERY]'), 'pre-flight hold requires an explicit start action');
ok(source.includes("if(!armed){frame++;render();return;}"), 'physics remains frozen during the pre-flight hold');
ok(source.includes('startReadyAt=performance.now()+250'), 'terminal command Enter cannot also start the flight');
ok(source.includes('if(closed||flight.done||!armed)return;'), 'flight controls cannot bypass the pre-flight hold');
ok(source.includes('SC GAME SYSTEM // CARTRIDGE 10'), 'opening screen uses the Space Cat game cabinet identity');
ok(source.includes('B O O S T E R   R E C O V E R Y'), 'opening screen names the recovery game');
ok(source.includes('BRING THE BIRD HOME.'), 'opening screen carries a mission-specific Space Cat motto');
ok(source.includes('OBJECTIVE   LAND UPRIGHT ON LIGHTED PAD01'), 'opening screen explains the exact landing objective');
ok(source.includes("success?'( ^.^ )':'( x.x )'"), 'result screen gives the Space Cat distinct victory and loss expressions');
ok(source.includes("'G A M E   O V E R'"), 'failed recovery has a dedicated game over screen');
ok(source.includes("'M I S S I O N   C O M P L E T E'"), 'successful recovery has a dedicated completion screen');
ok(html.includes('.lander-screen[data-mode="gameover"]') && html.includes('@keyframes gameSignalBreak'), 'game over has a restrained terminal signal-break treatment');
ok(html.includes('@media (prefers-reduced-motion:reduce)') && html.includes('.lander-screen[data-mode="intro"]'), 'new lander transitions respect reduced motion');
const landerIntro = presentation.intro({best:321,landings:4});
equal(landerIntro.length, api.LANDER_H, 'opening card preserves the fixed display height');
ok(landerIntro.every(row => row.length === api.LANDER_W), 'opening card preserves the fixed display width');
ok(landerIntro.map(row => row.join('')).join('\n').includes('321 PTS  ·  4 RECOVERIES'), 'opening card renders the device-local record');
const landerFailureCard = presentation.end({...safeState,verdict:{code:'HARD',label:'HARD CONTACT — BOOSTER LOST'},grade:'F',score:0}, {best:321});
ok(landerFailureCard.map(row => row.join('')).join('\n').includes('G A M E   O V E R'), 'failure card renders inside the fixed ASCII grid');
const landerVictoryCard = presentation.end({...safeState,verdict:safeVerdict,grade:'A',score:1100}, {best:1100});
ok(landerVictoryCard.map(row => row.join('')).join('\n').includes('M I S S I O N   C O M P L E T E'), 'victory card renders inside the fixed ASCII grid');

const help = between('help:function()', 'about:function()');
ok(!/\blander\b/i.test(help), 'lander remains absent from main help');
const landerRuntime = between('/* ══ BOOSTER LANDER', '/* ══ ASCII LAUNCH CINEMA');
ok(!/\bfetch\s*\(/.test(landerRuntime), 'lander performs no network requests');
ok(!/recordWitness|writeLogbook|CLEARANCE_LEVELS/.test(landerRuntime), 'lander cannot grant clearance');

new Function(source);
checks += 1;

console.log(`Phase 10 Booster Lander checks OK (${checks})`);
