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

ok(index.includes("helpRow('focus','[n]','full-screen mission watch — same verified live sync')"),
  'focus is discoverable in mission help');
ok(index.includes("focus:function(a){liveTrack(parseInt(a[0],10)||1,{focus:true});return null;}"),
  'focus accepts the same one-based mission selector as track');
ok(index.includes('function liveTrack(n,options)') && index.includes('runLive(m,realMission,options)'),
  'focus and track share one live data engine');
ok(index.includes("var focusMode=!!options.focus"), 'focus is a presentation mode, not a second polling engine');
ok(index.includes("var experienceId='live'"), 'focus remains governed by the live Experience Kernel lane');
ok(index.includes("options.focus?'MISSION FOCUS ENGAGED':'LIVE SYNC ENGAGED'"),
  'focus engagement is explicit in terminal history');

ok(index.includes('.live-focus{') && index.includes('position:fixed;inset:0;z-index:60'),
  'Mission Focus fills the visual viewport');
ok(index.includes('env(safe-area-inset-top)') &&
   index.includes('calc(7px + env(safe-area-inset-bottom,0px))') &&
   index.includes('padding-bottom:calc(var(--dock-space) + 8px)'),
  'Mission Focus respects phone safe areas');
ok(index.includes('html.focus-active,html.focus-active body{overflow:hidden'),
  'background scrolling is locked while focus is active');
ok(index.includes("document.documentElement.classList.add('focus-active')"),
  'focus scroll lock is armed on entry');
ok(index.includes("experienceResource(experienceId,function(){document.documentElement.classList.remove('focus-active');});"),
  'focus scroll lock is removed through kernel cleanup');
ok(index.includes('role="dialog" aria-modal="true" aria-label="Mission Focus live launch tracking"'),
  'focus exposes a modal mission-control surface to assistive technology');

ok(index.includes('class="focus-exit"') && index.includes('aria-label="Exit Mission Focus"'),
  'focus has an explicit labeled touch exit');
ok(index.includes('.focus-actions button{min-height:48px'), 'phone focus controls have 48px touch targets');
ok(index.includes("function onKey(ev){ if(ev.key==='Escape')finish(true); }"),
  'Escape exits the shared live scene');
ok(index.includes("experienceOn(experienceId,exit,'click',function(){finish(true);});"),
  'the visible focus exit uses normal live cleanup');
ok(!index.includes("experienceOn(experienceId,panel,'click'"),
  'tapping the mission display cannot accidentally close focus');
ok(index.includes("if(wrap.parentNode)wrap.parentNode.removeChild(wrap);"),
  'the fixed focus surface is removed before returning to terminal');
ok(index.includes("else panel.classList.remove('live-track');"),
  'closed inline tracking releases its temporary viewport-height stage');

ok(index.includes('class="focus-fullscreen" type="button" hidden'),
  'native fullscreen remains an optional progressive enhancement');
ok(index.includes('if(full&&panel.requestFullscreen)') && index.includes("panel.requestFullscreen({navigationUI:'hide'})"),
  'native fullscreen is offered only when supported and after a button gesture');
ok(index.includes("experienceOn(experienceId,document,'fullscreenchange'"),
  'native fullscreen exit is reconciled with mission cleanup');
ok(index.includes("if(document.activeElement===input)input.blur();"),
  'dominant scenes dismiss the mobile keyboard before presentation');

ok(index.includes("panel.scrollIntoView({block:'start',inline:'nearest'});"),
  'inline track aligns its animation to the top of the viewport');
ok(index.includes('else keepStageVisible();'), 'track reveals the scene as soon as it is mounted');
ok((index.match(/keepStageVisible\(\);/g) || []).length >= 4,
  'retarget, ignition and event transitions keep inline track visible');
ok(index.includes("if(focusMode)return;\n      panel.scrollIntoView"),
  'fixed focus mode never scrolls the background document');

ok(index.includes('.focus-clock{') && index.includes('focusClock.textContent=clock'),
  'focus carries a large clock driven by the real live clock state');
ok(index.includes("focusStatus.textContent=disposition.code"),
  'focus carries source-derived mission disposition');
ok(index.includes("' · CHECK '+new Date(lastPoll).toISOString().slice(11,19)+' UTC'"),
  'focus exposes the last source check time');
ok(index.includes('REAL T-0 · SOURCE STATUS · MODELED ASCENT'),
  'focus preserves the source/model truth boundary');
ok(index.includes('@media (max-height:450px) and (orientation:landscape)') &&
   index.includes('.live-focus pre.screen{font-size:clamp(5px,1.7vh,7px)'),
  'short phone landscape has a dedicated focus layout');

const script = index.match(/<script>([\s\S]*?)<\/script>/);
ok(!!script, 'main script exists');
new Function(script[1]);
checks += 1;

console.log(`Mission Focus checks OK (${checks})`);
