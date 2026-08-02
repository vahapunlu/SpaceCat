#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const index = fs.readFileSync(path.join(root, 'web', 'index.html'), 'utf8');
const script = index.match(/<script>([\s\S]*?)<\/script>/);
if (!script) throw new Error('web/index.html: main script not found');
new Function(script[1]);

let checks = 1;
function ok(condition, label) {
  checks += 1;
  if (!condition) throw new Error(label);
}
function between(source, start, end) {
  const a = source.indexOf(start);
  const b = source.indexOf(end, a);
  if (a < 0 || b < 0) throw new Error(`source segment missing: ${start}`);
  return source.slice(a, b);
}

const audit = between(index, '/* ── INTRUSION FICTION', 'var CLEARANCE_LEVELS=');
ok(audit.includes("INTRUSION_KEY='sc_intrusion_audit_v1'"), 'audit has a dedicated local-storage namespace');
ok(audit.includes('rows.slice(-40)'), 'audit rotation is bounded');
ok(audit.includes("code:'RECON'"), 'reconnaissance stage exists');
ok(audit.includes("code:'PRIVILEGE'"), 'privilege-probe stage exists');
ok(audit.includes("code:'CONTAINED'"), 'containment stage exists');
ok(audit.includes('localStorage.setItem'), 'audit persists on the device');
ok(!audit.includes('fetch('), 'audit cannot make a network request');
ok(!audit.includes('WebSocket'), 'audit cannot open a socket');

const shell = between(index, '/* ── SENTINEL SHELL', '/* ── LEGACY REACTION PACK');
ok(shell.includes('no request left this device'), 'outbound request fiction states its boundary');
ok(shell.includes('0 packets transmitted'), 'remote login fiction states packet truth');
ok(shell.includes('0 modes changed'), 'permission fiction states mutation truth');
ok(shell.includes('root is intentionally absent from the authority graph'), 'sudo policy carries the story premise');
ok(!shell.includes('fetch('), 'sentinel commands never call fetch');

[
  'id', 'hostname', 'env', 'printenv', 'mount', 'df', 'free', 'ss', 'netstat',
  'ip', 'ifconfig', 'systemctl', 'crontab', 'find', 'ssh', 'su', 'chmod', 'curl', 'wget'
].forEach((command) => ok(index.includes(`${command}:function`), `${command} probe is implemented`));

ok(index.includes("if(op==='-l'||op==='--list')"), 'sudo policy enumeration is supported');
ok(index.includes("fsEntry('etc','dir')"), '/etc is visible in the root filesystem');
ok(index.includes("fsEntry('root','dir','dr-x------')"), '/root advertises locked authority');
ok(index.includes("if(path==='/etc')"), '/etc files are mounted');
ok(index.includes("path==='/etc/passwd'"), 'passwd fiction is readable');
ok(index.includes("path==='/etc/shadow'"), 'shadow access is explicitly protected');
ok(index.includes("path==='/var/log/auth.log'"), 'operator traces are discoverable in auth.log');
ok(index.includes("path==='/proc/security'"), 'live sentinel state is discoverable in proc');
ok(index.includes("path==='/proc/net/tcp'"), 'synthetic TCP table is mounted');
ok(index.includes("HIDDEN_SHELL_COMMANDS[name]"), 'hidden commands are removed from tab completion');

const help = between(index, 'help:function()', 'about:function()');
['systemctl', 'crontab', 'sudo -l', 'ssh', 'chmod', '/proc/security', '/var/log/auth.log'].forEach((term) =>
  ok(!help.includes(term), `${term} is absent from help`));

ok(index.includes('observe · contain · never retaliate'), 'sentinel has a non-retaliation doctrine');
ok(index.includes('Nothing leaves this device.'), 'filesystem notice states the simulation boundary');

console.log(`Intrusion fiction checks OK (${checks})`);
