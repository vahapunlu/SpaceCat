#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const host = 'spacecat.watch';
const key = 'cf4b34b0e4a1e34ad3bea02a25907602';
const root = path.join(__dirname, '..');
const keyFile = path.join(root, 'web', `${key}.txt`);
const sitemap = fs.readFileSync(path.join(root, 'web', 'sitemap.xml'), 'utf8');

if (fs.readFileSync(keyFile, 'utf8').trim() !== key) {
  throw new Error('IndexNow ownership key file does not match the configured key.');
}

const urlList = [...sitemap.matchAll(/<loc>(https:\/\/spacecat\.watch\/?[^<]*)<\/loc>/g)]
  .map((match) => match[1]);

if (!urlList.length) throw new Error('No canonical URLs found in sitemap.xml.');

fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify({
    host,
    key,
    keyLocation: `https://${host}/${key}.txt`,
    urlList,
  }),
}).then(async (response) => {
  const body = await response.text();
  if (!response.ok) {
    throw new Error(`IndexNow returned HTTP ${response.status}: ${body || response.statusText}`);
  }
  console.log(`IndexNow accepted ${urlList.length} URLs (HTTP ${response.status}).`);
}).catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
