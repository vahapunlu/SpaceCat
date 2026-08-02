#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'web', 'index.html'), 'utf8');
const match = html.match(/<script>([\s\S]*?)<\/script>/);
if (!match) throw new Error('web/index.html: main script not found');
const source = match[1];
new Function(source);

function between(start, end) {
  const a = source.indexOf(start);
  const b = source.indexOf(end, a);
  if (a < 0 || b < 0) throw new Error(`source segment missing: ${start}`);
  return source.slice(a, b);
}

let checks = 0;
function ok(condition, label) {
  checks += 1;
  if (!condition) throw new Error(label);
}

const commands = between('var CMDS={', 'function featList');
const help = between('help:function()', 'about:function()');
const reactionNames = [
  'whoami', 'ping', 'ver', 'dir', 'type', 'mem',
  'chkdsk', 'tracert', 'echo', 'format', 'nmap'
];

reactionNames.forEach((name) => {
  ok(new RegExp(`\\n\\s*${name}:function\\(`).test(commands), `${name} command is registered`);
  ok(!help.includes(`<span class="amber">${name}`), `${name} remains outside main help`);
});

ok(commands.includes('traceroute:function'), 'traceroute compatibility alias exists');
ok(source.includes("trace:{lane:'SECRET',mode:'micro'"), 'tracert is registered with Experience Kernel');
ok(source.includes("experienceTimeout('trace'"), 'tracert timers use Experience Kernel');
ok(source.includes("experienceClear('trace')"), 'tracert clears its resource bucket');
ok(source.includes("fsEntry('.maintenance')"), 'hidden maintenance breadcrumb is mounted');
ok(source.includes("path==='/var/log/.maintenance'"), 'maintenance breadcrumb has readable content');
ok(source.includes('no packets leave this device'), 'tracert discloses local simulation');
ok(source.includes('No network probe was performed.'), 'nmap discloses local simulation');
ok(/\n\s*home:function\(\)\{returnHome\(\);return null;\}/.test(commands), 'home command is registered');
ok(help.includes("helpTokens('MISC',['home','lang','logbook','copy','felicette','share','history','clear'])"),
  'home is visible in the responsive main help');
ok(source.includes("state.cwd='/home/visitor';"), 'home restores the visitor working directory');
ok(source.includes("history.replaceState(null,'',HOME_PATH)"), 'home restores the active locale root URL');
ok(source.includes("experienceClear('trace');"), 'home clears asynchronous trace output');
ok(source.includes('heroUnmount();'), 'home retires the previous hero timers before remounting');

const formatBody = between('function formatCommand', '/* ── COMMANDS');
ok(!/removeItem|localStorage\.clear|fetch\s*\(/.test(formatBody), 'FORMAT cannot delete or transmit data');
ok(formatBody.includes('0 bytes written'), 'FORMAT reports zero writes');

const nmapBody = between('function nmapCommand', 'function formatCommand');
ok(!/fetch\s*\(|XMLHttpRequest|WebSocket/.test(nmapBody), 'NMAP performs no network request');

console.log(`Phase 9.2 reaction checks OK (${checks})`);
