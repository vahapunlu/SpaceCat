#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const web = path.join(root, 'web');
const index = path.join(web, 'index.html');
const worker = path.join(web, '_worker.js');
const privacy = path.join(web, 'privacy.html');

function latestDate(files) {
  const newest = Math.max(...files.map((file) => fs.statSync(file).mtimeMs));
  return new Date(newest).toISOString().slice(0, 10);
}

const terminalDate = latestDate([index, worker]);
const entries = [
  { path: '/', date: terminalDate },
  { path: '/tr', date: terminalDate },
  { path: '/es', date: terminalDate },
  { path: '/fr', date: terminalDate },
  { path: '/ja', date: terminalDate },
  { path: '/live', date: terminalDate },
  { path: '/launch', date: terminalDate },
  { path: '/iss', date: terminalDate },
  { path: '/solar', date: terminalDate },
  { path: '/felicette', date: terminalDate },
  { path: '/privacy', date: latestDate([privacy]) },
];

const urls = entries.map(({ path: pathname, date }) => [
  '  <url>',
  `    <loc>https://spacecat.watch${pathname}</loc>`,
  `    <lastmod>${date}</lastmod>`,
  '  </url>',
].join('\n')).join('\n');

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  urls,
  '</urlset>',
  '',
].join('\n');

fs.writeFileSync(path.join(web, 'sitemap.xml'), xml);
console.log(`sitemap.xml updated (${entries.length} canonical URLs, terminal ${terminalDate})`);
