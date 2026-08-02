#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const index = read('web/index.html');
const worker = read('web/_worker.js');
const robots = read('web/robots.txt');
const sitemap = read('web/sitemap.xml');
const privacy = read('web/privacy.html');
const notFound = read('web/404.html');
const llms = read('web/llms.txt');
const manifest = JSON.parse(read('web/manifest.webmanifest'));

let checks = 0;
function ok(condition, label) {
  checks += 1;
  if (!condition) throw new Error(label);
}

ok(/User-agent:\s*\*/.test(robots), 'robots covers all crawlers');
ok(/Allow:\s*\/\s*$/m.test(robots), 'robots allows the site');
ok(robots.includes('https://spacecat.watch/sitemap.xml'), 'robots advertises canonical sitemap');
ok(!/noindex/i.test(index), 'home is indexable');
ok(privacy.includes('content="index,follow"'), 'privacy is indexable');
ok(notFound.includes('content="noindex"'), '404 is noindex');

const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const lastmods = [...sitemap.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((match) => match[1]);
ok(urls.length === 12, 'sitemap exposes twelve canonical pages');
ok(new Set(urls).size === urls.length, 'sitemap URLs are unique');
ok(urls.every((url) => /^https:\/\/spacecat\.watch\//.test(url)), 'sitemap uses canonical HTTPS host');
ok(lastmods.length === urls.length, 'every sitemap URL has lastmod');
ok(lastmods.every((date) => /^\d{4}-\d{2}-\d{2}$/.test(date)), 'lastmod values are ISO dates');

ok(index.includes('<main class="out" id="output">'), 'terminal output is semantic main content');
ok(index.includes('<section class="static-terminal"'), 'raw HTML contains progressive terminal content');
ok(index.includes('<h1 id="staticTitle">SPACE&nbsp;CAT</h1>'), 'raw HTML contains the visible H1');
ok(index.includes('Track every orbital rocket launch'), 'raw HTML explains the product');
ok(index.includes('href="/live"'), 'raw HTML exposes crawlable internal routes');
ok(index.includes('href="/privacy"'), 'raw HTML exposes crawlable privacy link');
ok(index.includes('rel="alternate" hreflang="tr" href="https://spacecat.watch/tr"'), 'home advertises Turkish alternate');
ok(index.includes('rel="alternate" hreflang="es" href="https://spacecat.watch/es"'), 'home advertises Spanish alternate');
ok(index.includes('rel="alternate" hreflang="fr" href="https://spacecat.watch/fr"'), 'home advertises French alternate');
ok(index.includes('rel="alternate" hreflang="ja" href="https://spacecat.watch/ja"'), 'home advertises Japanese alternate');
ok(index.includes('rel="alternate" hreflang="de" href="https://spacecat.watch/de"'), 'home advertises German alternate');
ok(index.includes('rel="alternate" hreflang="x-default" href="https://spacecat.watch/"'), 'home advertises x-default');
ok(index.includes('out.innerHTML=\'\';\n  typeBoot(0);'), 'JavaScript upgrades the static terminal in place');
ok(!/<section class="static-terminal"[^>]*(hidden|display:\s*none)/i.test(index), 'static terminal is not hidden');

const jsonLdMatch = index.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
ok(!!jsonLdMatch, 'JSON-LD exists');
const jsonLd = JSON.parse(jsonLdMatch[1]);
const graph = jsonLd['@graph'];
ok(Array.isArray(graph), 'JSON-LD uses an entity graph');
ok(graph.some((item) => item['@type'] === 'WebPage'), 'graph identifies the WebPage');
ok(graph.some((item) => item['@type'] === 'WebSite'), 'graph identifies the WebSite');
ok(graph.some((item) => item['@type'] === 'Organization'), 'graph identifies the publisher');
ok(graph.some((item) => Array.isArray(item['@type']) && item['@type'].includes('MobileApplication')), 'graph identifies the mobile app');
ok(index.includes('https://x.com/spacecatwatch'), 'graph links official X account');
ok(index.includes('https://www.instagram.com/spacecatwatch/'), 'graph links official Instagram account');
ok(index.includes('id=com.spacecat.terminal'), 'graph links the Google Play listing');

ok((worker.match(/staticTitle:/g) || []).length === 10, 'all deep and locale routes have static titles');
ok((worker.match(/staticDescription:/g) || []).length === 10, 'all deep and locale routes have static descriptions');
ok(worker.includes('page["@id"] = `${canonical}#webpage`'), 'route worker rewrites WebPage identity');
ok(worker.includes('page.description = route.description'), 'route worker rewrites JSON-LD description');
ok(worker.includes('id="staticRouteDescription"'), 'route worker rewrites visible static description');

ok(llms.includes('experimental machine-readable orientation'), 'llms file states its experimental role');
ok(llms.includes('https://spacecat.watch/live'), 'llms file points to canonical mission pages');
ok(manifest.start_url === '/', 'manifest starts at canonical root');
ok(manifest.name.includes('SPACE CAT'), 'manifest preserves product identity');

const script = index.match(/<script>([\s\S]*?)<\/script>/);
ok(!!script, 'main application script exists');
new Function(script[1]);
checks += 1;

console.log(`SEO discovery-gate checks OK (${checks})`);
