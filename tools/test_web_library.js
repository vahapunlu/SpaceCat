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

ok(index.includes("fsEntry('library','dir')"), 'open library is visible at filesystem root');
ok(index.includes("if(path==='/library')return [fsEntry('README.TXT')].concat("), 'library root is generated from catalog');
ok(index.includes("collection:'engineering'"), 'engineering is a first-class collection');
ok(index.includes("shelf:'launch-vehicles'"), 'launch vehicle shelf is cataloged');
ok(index.includes("shelf:'propulsion'"), 'propulsion shelf is cataloged');
ok(index.includes("shelf:'guidance-navigation-control'"), 'GNC shelf is cataloged');
ok(index.includes("shelf:'structures-materials'"), 'structures and materials shelf is cataloged');
ok(index.includes("path==='/library/README.TXT'"), 'library has browsing instructions');
ok(index.includes('var libraryDoc=libraryDocument(path)'), 'PDF records resolve through one bounded catalog');
ok(index.includes('function libraryDirEntries(path)'), 'directory listings are derived from catalog metadata');
ok(index.includes("'/library/'+doc.collection+'/'+doc.shelf+'/'+doc.name"), 'document paths follow the collection/shelf/name schema');
ok(index.includes('OPEN OFFICIAL NASA PDF ►'), 'records expose an explicit official PDF action');
ok(index.includes('HISTORICAL REFERENCE · NOT FLIGHT CERTIFICATION'), 'records disclose reference limits');
ok(index.includes('Public NASA/NTRS technical documents mounted as remote PDF pointers.'), 'library explains remote mounting');
ok(index.includes("'/library nasa-ntrs remote-ro'"), 'library is declared in the virtual mount table');

const catalog = between(index, 'var LIBRARY_DOCUMENTS=[', 'var RLL_FALLBACK=');
const ids = [
  '20170001761', '20010066713', '20240002646', '19710019929', '19760023196',
  '19770009165', '19750012398', '20090001165', '19700020430', '20170001809'
];
ids.forEach((id) => ok(catalog.includes(`id:'${id}'`), `NASA record ${id} is cataloged`));
ok((catalog.match(/id:'/g) || []).length === 10, 'catalog contains ten launch documents');
ok(index.includes("file:'05-LV_Loads_Sizing.pdf'"), 'nonstandard NTRS filename is explicit');

const help = between(index, 'help:function()', 'about:function()');
ok(!help.includes('library'), 'no new library command bloats main help');
ok(!help.includes('NASA SP-125'), 'document catalog stays in the filesystem');

const webFiles = [];
function walk(dir) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else webFiles.push(full);
  });
}
walk(path.join(root, 'web'));
ok(!webFiles.some((file) => file.toLowerCase().endsWith('.pdf')), 'NASA PDFs are not copied into the deployment');

console.log(`Open engineering library checks OK (${checks})`);
