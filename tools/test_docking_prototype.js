#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'prototypes', 'orbital-docking', 'index.html');
const html = fs.readFileSync(file, 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/);
if (!script) throw new Error('docking prototype script missing');

function between(source, start, end) {
  const a = source.indexOf(start);
  const b = source.indexOf(end, a);
  if (a < 0 || b < 0) throw new Error(`source segment missing: ${start}`);
  return source.slice(a, b);
}

const physics = between(script[1], "var W=64", 'function readRecord');
const api = new Function(`${physics}\nreturn {W,H,PORT_X,HULL_X,TARGET_Y,PROFILES,initialState,applyControls,controlPulse,procedureStep,stepState,verdict,score,grade,debriefText};`)();
let checks = 0;
function ok(value, label){checks += 1;if(!value)throw new Error(label);}
function equal(actual, expected, label){checks += 1;if(actual!==expected)throw new Error(`${label}: expected ${expected}, got ${actual}`);}

equal(api.W,64,'display width');
equal(api.H,28,'display height');
equal(JSON.stringify(api.initialState()),JSON.stringify(api.initialState()),'initial state is deterministic');
ok(api.initialState().paused,'approach begins in a deliberate hold');
equal(Object.keys(api.PROFILES).length,3,'three bounded training profiles exist');
equal(api.initialState('LOW FUEL').fuel,52,'low-fuel profile has a deliberate constraint');

const active = {...api.initialState(),paused:false,started:true};
const coast = api.stepState(active,{left:false,right:false,up:false,down:false},1);
ok(coast.x>active.x,'initial closing velocity advances toward station');
ok(coast.x-active.x>.3,'one second of coast produces visible ASCII progress');
equal(coast.fuel,active.fuel,'coast does not burn fuel');

const prograde = api.stepState(active,{left:false,right:true,up:false,down:false},1);
ok(prograde.vx>coast.vx,'prograde thrust increases closing rate');
ok(prograde.fuel<active.fuel,'translation thrust burns fuel');
const retro = api.stepState(active,{left:true,right:false,up:false,down:false},1);
ok(retro.vx<coast.vx,'retrograde thrust decreases closing rate');
const normal = api.stepState(active,{left:false,right:false,up:true,down:false},1);
ok(normal.vy<coast.vy,'normal control translates upward in screen coordinates');
const antiNormal = api.stepState(active,{left:false,right:false,up:false,down:true},1);
ok(antiNormal.vy>coast.vy,'anti-normal control translates downward in screen coordinates');

const tap = api.controlPulse(active,'right');
ok(tap.vx>active.vx,'quick tap produces deterministic impulse');
ok(tap.fuel<active.fuel,'quick tap consumes fuel');
equal(tap.time,active.time,'control pulse does not advance mission time');
const tapFeedback=api.stepState(tap,{left:false,right:false,up:false,down:false},.06);
equal(tapFeedback.thruster,'right','quick tap remains visible for a renderable feedback window');
const fineTap=api.controlPulse({...active,rcsMode:'FINE'},'right');
ok(fineTap.vx-active.vx<tap.vx-active.vx,'fine RCS produces a smaller translation impulse');

let hold25={...active,x:api.PORT_X-24,vx:0,vy:0,y:api.TARGET_Y};
for(let i=0;i<43;i+=1)hold25=api.procedureStep(hold25,.06);
ok(hold25.clear25&&hold25.holdPoints===1,'stable hold point 25 grants first clearance');
let hold12={...hold25,x:api.PORT_X-11,vx:0,vy:0,y:api.TARGET_Y,rcsMode:'FINE'};
for(let i=0;i<43;i+=1)hold12=api.procedureStep(hold12,.06);
ok(hold12.clear12&&hold12.holdPoints===2,'stable fine-RCS hold point 12 grants final clearance');
const overrun=api.procedureStep({...active,x:api.PORT_X-19,vx:.4,vy:0},.06);
ok(!!overrun.procedureAbort,'crossing an uncleared hold gate aborts the approach');

equal(api.verdict({...active,x:30}),null,'mid-course state has no verdict');
const cleared={...active,clear25:true,clear12:true,holdPoints:2,rcsMode:'FINE'};
equal(api.verdict({...cleared,x:api.PORT_X,y:api.TARGET_Y,vx:.15,vy:.05}).code,'DOCKED','safe cleared fine-RCS contact docks');
equal(api.verdict({...active,x:api.PORT_X,y:api.TARGET_Y,vx:.5,vy:0}).code,'CONTACT','excess closing rate aborts capture');
equal(api.verdict({...active,x:api.PORT_X,y:api.TARGET_Y,vx:.2,vy:.4}).code,'CONTACT','excess drift aborts capture');
equal(api.verdict({...active,x:api.HULL_X,y:api.TARGET_Y+4,vx:.1,vy:0}).code,'COLLISION','off-axis hull contact violates keep-out zone');
equal(api.verdict({...active,x:10,y:2,vx:0,vy:-.1}).code,'LOST','leaving tracking volume ends attempt');
equal(api.verdict({...active,time:180}).code,'TIME','rendezvous window is finite');
equal(api.verdict({...active,procedureAbort:'HOLD POINT 25 OVERRUN'}).code,'PROCEDURE','clearance violation has a distinct verdict');

const dockState={...cleared,x:api.PORT_X,y:api.TARGET_Y,vx:.15,vy:.05,fuel:70,time:90,pulseCount:20};
const dockVerdict=api.verdict(dockState);
ok(api.score(dockState,dockVerdict)>0,'safe capture earns score');
equal(api.score(dockState,{code:'CONTACT'}),0,'failed contact earns no score');
ok(api.score({...dockState,fuel:90},dockVerdict)>api.score({...dockState,fuel:20},dockVerdict),'fuel discipline improves score');
equal(api.score({...dockState,time:150},dockVerdict),api.score({...dockState,time:60},dockVerdict),'score does not reward rushing the procedure');
equal(api.grade(1900,dockVerdict),'S','high-quality capture earns S grade');
ok(api.debriefText({...dockState,grade:'A'},dockVerdict).includes('HOLD POINTS     2/2'),'debrief reports procedural completion');

let guided={...api.initialState(),paused:false,started:true};
let guidedResult=null;
for(let frame=0;frame<5000&&!guidedResult;frame+=1){
  const range=api.PORT_X-guided.x;
  const controls={left:false,right:false,up:false,down:false};
  let desiredClosing;
  if(!guided.clear25)desiredClosing=range>30?.35:range>26?.14:.045;
  else if(!guided.clear12){
    if(range<=13)guided.rcsMode='FINE';
    desiredClosing=range>17?.26:range>13?.10:.035;
  }else desiredClosing=range>5?.16:.10;
  if(guided.vx<desiredClosing-.012)controls.right=true;
  if(guided.vx>desiredClosing+.012)controls.left=true;
  const offset=guided.y-api.TARGET_Y;
  const desiredDrift=Math.max(-.08,Math.min(.08,-offset*.08));
  if(guided.vy<desiredDrift-.01)controls.down=true;
  if(guided.vy>desiredDrift+.01)controls.up=true;
  guided=api.stepState(guided,controls,.06);
  guidedResult=api.verdict(guided);
}
equal(guidedResult&&guidedResult.code,'DOCKED','a bounded guidance policy can complete the game');
ok(guided.time<150,'guided completion includes deliberate holds without dragging');

ok(html.includes('TRAINING MODEL · SYMBOLIC RELATIVE MOTION · NOT TELEMETRY · NOT FLIGHT SOFTWARE'),'truth contract is visible');
ok(html.includes('role="img" aria-label="ASCII orbital rendezvous training display"'),'ASCII surface is accessible');
equal((html.match(/data-control=/g)||[]).length,4,'four touch controls are visible');
ok(html.includes('min-height:48px'),'touch targets exceed 44 pixels');
ok(html.includes("button.addEventListener('pointerdown'"),'touch controls support press and hold');
ok(html.includes("document.addEventListener('keydown'"),'keyboard controls are present');
ok(html.includes("document.addEventListener('visibilitychange'"),'hidden tab timing is guarded');
ok(!/\bfetch\s*\(/.test(script[1]),'prototype performs no network requests');
ok(!/recordWitness|writeLogbook|CLEARANCE_LEVELS/.test(script[1]),'prototype cannot grant site clearance');
ok(html.includes('@media(max-width:600px)')&&html.includes('@media(max-width:340px)'),'mobile breakpoints exist');
ok(html.includes('id="comms" type="button" aria-pressed="false">[COMMS OFF]'),'voice channel is explicitly opt-in');
ok(html.includes('<audio id="radio" preload="none"></audio>')&&!html.includes('<audio id="radio" autoplay'),'radio cannot autoplay');
ok(html.includes("document.documentElement.dataset.commsRoot||'comms/'"),'voice clips remain local to the prototype');
ok(html.includes("voiceRange<=9&&state.vx>.42")&&html.includes("stationCall('closingHigh')"),'unsafe closing rate has a guarded warning');
ok(html.includes("voiceRange<=9&&Math.abs(state.vy)>.3")&&html.includes("stationCall('driftHigh')"),'unsafe lateral drift has a guarded warning');
ok(html.includes("if(result.code==='DOCKED')stationCall('docked')")&&html.includes("result.code==='CONTACT'||result.code==='COLLISION'"),'only physical contact results produce capture callouts');
ok(html.includes('currentVoice&&call.priority>currentVoice.priority'),'critical calls can preempt routine range calls');
ok(html.includes('VOICE CHANNEL · SC STATION CONTROL'),'fictional station authority is visible');
ok(html.includes('id="rcs" type="button">[RCS COARSE]')&&html.includes("state.rcsMode==='COARSE'?'FINE':'COARSE'"),'coarse/fine RCS is player controlled');
ok(html.includes("camera==='PORT'")&&html.includes("camera==='CORRIDOR'"),'three-stage camera changes with approach range');
ok(html.includes('id="debrief" class="debrief" hidden')&&html.includes('POST-FLIGHT DEBRIEF'),'technical post-flight debrief is present');
ok(html.includes('id="profile" type="button">[PROFILE NOMINAL]'),'training profile selector is present');

const commsDir=path.join(__dirname,'..','prototypes','orbital-docking','comms');
const expectedClips=['online','range25','clear25','range12','clear12','range5go','closingHigh','driftHigh','docked','contact','procedureAbort'];
for(const clip of expectedClips){
  const audioPath=path.join(commsDir,`${clip}.mp3`);
  ok(fs.existsSync(audioPath)&&fs.statSync(audioPath).size>1000,`${clip} voice clip exists`);
}
const voiceScript=fs.readFileSync(path.join(commsDir,'script.tsv'),'utf8');
ok(voiceScript.includes('Space Cat Station')&&!/NASA|ISS/.test(voiceScript),'voice script is fictional and avoids real-agency attribution');

new Function(script[1]);checks += 1;
console.log(`Orbital docking prototype checks OK (${checks})`);
