#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const index = fs.readFileSync(path.join(__dirname, '..', 'web', 'index.html'), 'utf8');
const privacy = fs.readFileSync(path.join(__dirname, '..', 'web', 'privacy.html'), 'utf8');

let checks = 0;
function ok(condition, label) {
  checks += 1;
  if (!condition) throw new Error(label);
}

ok(index.includes('width=device-width, initial-scale=1, viewport-fit=cover'), 'main viewport covers safe area');
ok(privacy.includes('width=device-width, initial-scale=1, viewport-fit=cover'), 'privacy viewport covers safe area');
ok(index.includes('env(safe-area-inset-top,0px)'), 'main top safe area is applied');
ok(index.includes('env(safe-area-inset-right,0px)'), 'main right safe area is applied');
ok(index.includes('env(safe-area-inset-bottom,0px)'), 'main bottom safe area is applied');
ok(index.includes('env(safe-area-inset-left,0px)'), 'main left safe area is applied');
ok(privacy.includes('env(safe-area-inset-top,0px)'), 'privacy safe area is applied');
ok(index.includes('min-height:100vh;min-height:100dvh'), 'vh fallback precedes dynamic viewport height');
ok(index.includes('-webkit-text-size-adjust:100%'), 'iOS text inflation is controlled');
ok(index.includes('@media (max-width:600px)'), 'phone breakpoint exists');
ok(index.includes('.cmdfield{font-size:16px}'), 'terminal input avoids iOS focus zoom');
ok(index.includes('.hero{display:block}'), 'phone hero cannot enter the 430px flex overflow gap');
ok(index.includes('.help-screen{max-width:92ch;white-space:normal;word-break:normal'), 'help overrides preformatted line wrapping');
ok(index.includes('.help-row{') && index.includes('grid-template-columns:minmax(18ch,25ch) minmax(0,1fr)'), 'desktop help uses semantic columns');
ok(index.includes('.help-row{display:block;padding:5px 0 4px}'), 'phone help stacks each command and description');
ok(index.includes(".help-desc::before{content:'└─ '"), 'phone descriptions have a terminal continuation marker');
ok(index.includes('.help-screen{font-size:13.5px;line-height:1.38;max-width:none}'), 'phone help has a compact readable rhythm');
ok(index.includes('function helpRow(command,args,description)'), 'help rows are generated semantically');
ok(index.includes("helpTokens('FILESYSTEM',['pwd','cd','ls','tree','cat','man'])"), 'filesystem commands wrap as mobile tokens');
ok((index.match(/helpRow\('solar'/g) || []).length === 1, 'help no longer duplicates the solar command');
ok(index.includes('enterkeyhint="send"'), 'mobile keyboard has an explicit enter action');
ok(index.includes('autocorrect="off"'), 'terminal commands disable mobile autocorrect');
ok(index.includes('.btn{width:100%;justify-content:center}'), 'mobile CTA uses full-width target');
ok(index.includes('min-height:44px'), 'touch targets meet 44px minimum');
ok(index.includes('@media (max-height:450px) and (orientation:landscape)'), 'short landscape layout has an override');
ok(index.includes('pre.screen') && index.includes('max-width:100%;overflow-x:auto'), 'cinema remains bounded and scrollable');

const exits = (index.match(/<button class="term-exit"/g) || []).length;
ok(exits === 6, 'ISS, cinema, live, lander, Earth and pulsar each expose a touch exit');
ok(index.includes("experienceOn(experienceId,exit,'click',function(){finish(true);});"), 'live touch exit ends tracking');
ok(index.includes("experienceOn('iss',exit,'click',finish);"), 'ISS touch exit is wired');
ok(index.includes("experienceOn(experienceId,exit,'click',finish);"), 'cinema touch exit is wired');
ok(index.includes("experienceOn('earth',exit,'click',finish);"), 'Earth touch exit is wired');
ok(index.includes("experienceOn('pulsar',exit,'click',finish);"), 'pulsar touch exit is wired');
ok(!index.includes("experienceOn(experienceId,wrap,'click'"), 'cinema no longer exits on accidental screen taps');
ok(index.includes('.term-exit:disabled'), 'completed experience controls have an inert visual state');
ok((index.match(/exit\.disabled=true/g) || []).length === 6, 'all six touch exits retire after cleanup');

const script = index.match(/<script>([\s\S]*?)<\/script>/);
ok(!!script, 'main script exists');
new Function(script[1]);
checks += 1;

console.log(`Mobile release-gate checks OK (${checks})`);
