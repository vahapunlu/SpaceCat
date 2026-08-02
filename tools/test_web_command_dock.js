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

ok(index.includes('class="command-dock" id="commandDock" hidden'),
  'command dock stays hidden only during BIOS boot');
ok(index.includes('class="promptline" id="promptline" hidden'),
  'the real editable prompt lives inside the dock');
ok(index.includes('class="busyline" id="busyline" role="status" aria-live="polite" hidden'),
  'dominant experiences have an accessible terminal status line');
ok(index.includes('id="busyStatus">MISSION CHANNEL ACTIVE · ESC / EXIT'),
  'busy status exposes its exit contract');
ok(index.includes('class="hint" id="hint" hidden'),
  'the contextual hint is part of the same dock');

ok(index.includes('.command-dock{') && index.includes('position:fixed;left:50%;bottom:var(--keyboard-offset)'),
  'command dock remains fixed to the visual bottom');
ok(index.includes('z-index:80') && index.includes('z-index:60'),
  'command dock remains above Mission Focus');
ok(index.includes('width:min(940px,calc(100% - 24px))'),
  'desktop dock follows the terminal content width');
ok(index.includes('.wrap{') && index.includes('padding-bottom:var(--dock-space)'),
  'terminal content reserves space for the fixed dock');
ok(index.includes("getBoundingClientRect().height+6"),
  'dock reserves only a compact six-pixel breathing gap above the prompt');
ok(/\.crt\{[\s\S]*?padding:[\s\S]*?\n\s+0\n\s+calc\(clamp\(14px,4vw,44px\)/.test(index),
  'the CRT frame does not duplicate the dock bottom reservation');
ok(index.includes('--dock-space:76px; --keyboard-offset:0px'),
  'dock has safe initial layout variables');
ok(index.includes('.command-dock.busy{border-top-color:'),
  'busy state is visibly distinct without changing the terminal language');

ok(index.includes('.command-dock{\n      width:100%;padding-left:max(10px,env(safe-area-inset-left,0px))'),
  'phone dock spans the viewport and respects the left safe area');
ok(index.includes('padding-right:max(10px,env(safe-area-inset-right,0px))'),
  'phone dock respects the right safe area');
ok(index.includes('calc(7px + env(safe-area-inset-bottom,0px))'),
  'dock clears the phone home-indicator safe area');
ok(index.includes('.command-dock .hint{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'),
  'mobile hint cannot inflate or overflow the dock');
ok(index.includes('.cmdfield{font-size:16px}'),
  'mobile dock input still prevents iOS focus zoom');

ok(index.includes('function syncCommandDock(){'), 'visual viewport synchronization is centralized');
ok(index.includes('var vv=window.visualViewport'), 'dock observes the visual rather than only layout viewport');
ok(index.includes('window.innerHeight-(vv.height+vv.offsetTop)'),
  'keyboard/browser chrome offset follows the visible viewport bottom');
ok(index.includes("style.setProperty('--keyboard-offset'"),
  'calculated keyboard offset reaches CSS');
ok(index.includes("style.setProperty('--dock-space'"),
  'measured dock height reaches content and focus layout');
ok(index.includes("window.visualViewport.addEventListener('resize',syncCommandDock)"),
  'mobile keyboard resize updates dock position');
ok(index.includes("window.visualViewport.addEventListener('scroll',syncCommandDock)"),
  'mobile browser chrome movement updates dock position');
ok(index.includes("new ResizeObserver(syncCommandDock).observe(commandDock)"),
  'hint/busy height changes update reserved space');

ok(index.includes('function setCommandDockBusy(label){'), 'dominant status transition is centralized');
ok(index.includes('promptline.hidden=true;hint.hidden=true;busyline.hidden=false'),
  'busy mode never presents a non-working input');
ok(index.includes('function setCommandDockReady(){'), 'editable prompt restoration is centralized');
ok(index.includes('busyline.hidden=true;promptline.hidden=false;hint.hidden=false'),
  'normal mode restores prompt and hint');
ok(index.includes('setCommandDockBusy(commandDockLabel(id));'),
  'Experience Kernel moves every dominant scene into dock busy state');
ok(index.includes('setCommandDockReady();\n      scroll();'),
  'Experience Kernel restores the dock before returning to the latest output');
ok(index.includes("setCommandDockBusy(options.focus?'MISSION FOCUS ACTIVE':'LIVE SYNC ACTIVE')"),
  'focus and inline live tracking identify themselves precisely');
ok(index.includes("if(document.activeElement===input)input.blur();"),
  'dominant entry dismisses the phone keyboard');

ok(index.includes('padding-bottom:calc(var(--dock-space) + 8px)'),
  'phone Mission Focus reserves room for the visible dock');
ok(index.includes('100dvh - var(--dock-space) - 24px'),
  'inline track reveal accounts for the dock height');
ok(index.includes('setCommandDockReady();\n    var mobileLanding=innerWidth<=600'),
  'dock becomes visible as soon as the terminal is ready');

const script = index.match(/<script>([\s\S]*?)<\/script>/);
ok(!!script, 'main script exists');
new Function(script[1]);
checks += 1;

console.log(`Persistent Command Deck checks OK (${checks})`);
