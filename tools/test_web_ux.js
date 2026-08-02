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

ok(index.includes('SOURCES MOUNTED · OPEN LOG'), 'source drawer keeps attribution discoverable');
ok(index.includes('SatNOGS DB contributors (CC BY-SA 4.0)'), 'source drawer preserves SatNOGS license');
ok(index.includes('.source-drawer summary'), 'source drawer has terminal-native styling');
ok(index.includes('summary:focus-visible'), 'source drawer exposes keyboard focus');
ok(index.includes('a:focus-visible'), 'links expose keyboard focus');
ok(index.includes("GUIDANCE_KEY='sc_guidance_v1'"), 'local-only guidance milestone key exists');
ok(index.includes('NEW OPERATOR'), 'first-contact hint exists');
ok(index.includes('LIVE ORBITAL LAUNCH NETWORK'), 'first contact leads with the terminal, not a store advertisement');
ok(index.includes('terminal-storeline'), 'Wear OS remains available through a terminal-native install line');
ok(index.includes('.mpanel .val{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'), 'mobile mission values stay on one compact line');
ok(index.includes('function dockHomeUtilities()'), 'secondary store/source utilities can move below the prompt');
ok(index.includes("line.setAttribute('data-home-utility','')"), 'docked utility wrappers are explicitly owned for cleanup');
ok(index.includes('clearHomeUtilities();\n    out.innerHTML=\'\';'), 'home command removes docked utilities before rebuilding');
ok(index.includes('NAV VECTOR'), 'help advances discovery guidance');
ok(index.includes('ROOT MOUNTED'), 'root tree advances discovery guidance');
ok(index.includes('cd /observatory'), 'root guidance uses an absolute working path');
ok(index.includes('OBSERVATORY ONLINE'), 'observatory entry completes discovery guidance');
ok(index.includes("cmd==='help'&&next<1"), 'help milestone is deterministic');
ok(index.includes("cmd==='tree'&&next<2"), 'tree milestone is deterministic');
ok(index.includes("cmd==='cd'&&next<3"), 'observatory milestone is deterministic');
ok(index.includes('setTimeout(function(){\n      hint.innerHTML=watchHintHtml(state.watch);'), 'guidance pulse returns to live watch condition');
ok(index.includes('var mobileLanding=innerWidth<=600'), 'mobile landing detection is explicit');
ok(index.includes("brand.scrollIntoView({block:'start'})"), 'mobile first contact returns to the brand');
ok(index.includes("if(mobileLanding&&!e.target.closest('#promptline,#hint'))return"), 'mobile body taps do not summon the keyboard');
ok(index.includes("e.target.closest('a,button,input,summary,[contenteditable=\"true\"]')"), 'interactive controls retain native focus behavior');
ok(index.includes("else if(e.key==='Escape')"), 'escape clears prompt input');
ok(index.includes('↑ recalls history · TAB completes commands'), 'prompt recovery hint is available');
ok((index.match(/aria-disabled="true"/g) || []).length === 1, 'no-JS coming-soon control exposes disabled state without duplicating the first-screen ad');
ok(privacy.includes('Terminal progress, recent public-data snapshots, training scores and discovery hints'), 'privacy text covers local terminal state');
ok(privacy.includes('read-only, same-origin adapters'), 'privacy text accurately describes public data adapters');

const script = index.match(/<script>([\s\S]*?)<\/script>/);
ok(!!script, 'main script exists');
new Function(script[1]);
checks += 1;

console.log(`UX flight-deck checks OK (${checks})`);
