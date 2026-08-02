#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(
  path.join(__dirname, '..', 'bot', 'src', 'index.js'),
  'utf8'
);

let checks = 0;
function ok(condition, label) {
  checks += 1;
  if (!condition) throw new Error(label);
}

ok(source.includes('request.method !== "POST"'), 'admin actions require POST');
ok(source.includes('request.headers.get("authorization")'), 'admin secret comes from Authorization');
ok(source.includes('authorization !== `Bearer ${env.RUN_KEY}`'), 'Bearer secret is validated');
ok(!source.includes('searchParams.get("key")'), 'admin secret never appears in the URL');
ok(!source.includes('STATE.put("probe"'), 'debug status is read-only');
ok(source.includes('"cache-control": "no-store"'), 'admin responses cannot be cached');
ok((source.match(/AbortSignal\.timeout\(12000\)/g) || []).length >= 2,
  'data and X posting requests have deadlines');

new Function(source.replace(/export default[\s\S]*$/, ''));
checks += 1;

console.log(`Bot security checks OK (${checks})`);
