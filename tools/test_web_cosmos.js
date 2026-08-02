#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const worker = fs.readFileSync(path.join(root, 'web', '_worker.js'), 'utf8');
const index = fs.readFileSync(path.join(root, 'web', 'index.html'), 'utf8');

let checks = 0;
function ok(condition, label) {
  checks += 1;
  if (!condition) throw new Error(label);
}

ok(worker.includes('cleanPath === "/api/cosmos/earth"'), 'EPIC metadata endpoint is routed');
ok(worker.includes('cleanPath === "/api/cosmos/earth-image"'), 'EPIC image proxy is routed');
ok(worker.includes('cleanPath === "/api/cosmos/apod"'), 'APOD metadata endpoint is routed');
ok(worker.includes('cleanPath === "/api/cosmos/apod-image"'), 'APOD image proxy is routed');
ok(worker.includes('env && env.NASA_API_KEY'), 'APOD supports a private NASA key binding');
ok(worker.includes('"DEMO_KEY"'), 'APOD has a zero-configuration low-volume fallback');
ok(worker.includes('epicArchiveUrl(date, image)'), 'EPIC archive URL is constructed from validated fields');
ok(worker.includes('/^epic_1b_\\d{14}$/'), 'EPIC frame identifiers are allowlisted');
ok(worker.includes('type.toLowerCase().startsWith("image/")'), 'image proxy rejects non-image payloads');
ok(worker.includes('s-maxage=604800'), 'cosmic metadata retains an edge last-known-good window');
ok(worker.includes('s-maxage=${maxAgeSeconds}'), 'cosmic images receive long edge caching');
ok(worker.includes('"X-Robots-Tag": "noindex, nofollow"'), 'data endpoints remain outside search');

ok(index.includes('earth:function(){earthStart()'), 'earth command is registered');
ok(index.includes('apod:function(){apodFetch()'), 'APOD command is registered');
ok(index.includes('nightwatch:function(){nightwatchStart()'), 'nightwatch command is registered');
ok(index.includes('pulsar:function(a){return pulsarStart'), 'pulsar command is registered');
ok(index.includes('lighttime:function(){return lighttimeStatus()'), 'light-time queue command is registered');
ok(index.includes("HORIZONS_KEYS.indexOf(target)>=0"), 'planet-target transmit keeps the legacy loopback path isolated');
ok(index.includes('SIMULATED PACKET / SIMULATED ACK'), 'light-time truth label is visible');
ok(index.includes('OBSERVATION FRAME, NOT LIVE VIDEO'), 'EPIC is not mislabeled as live video');
ok(index.includes('PERIODIC AUDIO MAPPING · SYNTHESIZED LOCALLY · NOT RADIO RECEPTION'), 'pulsar truth label is visible');
ok(index.includes('Open-Meteo receives only a rounded 0.25° weather grid'), 'nightwatch privacy tradeoff is disclosed before acquisition');
ok(index.includes("Math.round(lat*4)/4"), 'weather location is coarsened before transmission');
ok(index.includes("path==='/observatory/cosmos/README.TXT'"), 'cosmic imaging is discoverable in the filesystem');
ok(index.includes("path==='/observatory/lighttime/queue.log'"), 'light-time packets are inspectable as a file');
ok(index.includes("experienceOn('earth',exit,'click',finish)"), 'Earth channel has a touch exit');
ok(index.includes("experienceOn('pulsar',exit,'click',finish)"), 'pulsar receiver has a touch exit');
ok(index.includes("if(!reduce)experienceInterval('pulsar',draw,120)"), 'pulsar motion respects reduced-motion');
ok(index.includes("if(reduce&&frames.length)frames=[frames[frames.length-1]]"), 'EPIC motion respects reduced-motion');
ok(!index.includes('https://api.nasa.gov/planetary/apod'), 'browser never receives the NASA API endpoint or key');
ok(!index.includes('https://epic.gsfc.nasa.gov/api/natural'), 'browser uses the same-origin EPIC adapter');

const script = index.match(/<script>([\s\S]*?)<\/script>/);
ok(!!script, 'main application script exists');
new Function(script[1]);
checks += 1;

console.log(`Cosmic discovery suite checks OK (${checks})`);
