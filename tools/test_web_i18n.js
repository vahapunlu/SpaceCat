#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const index = fs.readFileSync(path.join(root, 'web', 'index.html'), 'utf8');
const worker = fs.readFileSync(path.join(root, 'web', '_worker.js'), 'utf8');
const sitemap = fs.readFileSync(path.join(root, 'web', 'sitemap.xml'), 'utf8');

let checks = 0;
function ok(condition, label) {
  checks += 1;
  if (!condition) throw new Error(label);
}

ok(index.includes('<html lang="en">'), 'English remains the canonical root language');
ok(index.includes('hreflang="en" href="https://spacecat.watch/"'), 'English alternate is explicit');
ok(index.includes('hreflang="tr" href="https://spacecat.watch/tr"'), 'Turkish alternate is explicit');
ok(index.includes('hreflang="es" href="https://spacecat.watch/es"'), 'Spanish alternate is explicit');
ok(index.includes('hreflang="fr" href="https://spacecat.watch/fr"'), 'French alternate is explicit');
ok(index.includes('hreflang="ja" href="https://spacecat.watch/ja"'), 'Japanese alternate is explicit');
ok(index.includes('hreflang="de" href="https://spacecat.watch/de"'), 'German alternate is explicit');
ok(index.includes('hreflang="x-default" href="https://spacecat.watch/"'), 'x-default points to English root');
ok(worker.includes('"/tr": {'), 'Worker exposes a Turkish route');
ok(worker.includes('"/es": {'), 'Worker exposes a Spanish route');
ok(worker.includes('"/fr": {'), 'Worker exposes a French route');
ok(worker.includes('"/ja": {'), 'Worker exposes a Japanese route');
ok(worker.includes('"/de": {'), 'Worker exposes a German route');
ok(worker.includes('locale: "tr"'), 'Turkish route declares its locale');
ok(worker.includes('ogLocale: "tr_TR"'), 'Turkish Open Graph locale is declared');
ok(worker.includes('ogLocale: "es_ES"'), 'Spanish Open Graph locale is declared');
ok(worker.includes('locale: "fr"'), 'French route declares its locale');
ok(worker.includes('ogLocale: "fr_FR"'), 'French Open Graph locale is declared');
ok(worker.includes('locale: "ja"'), 'Japanese route declares its locale');
ok(worker.includes('ogLocale: "ja_JP"'), 'Japanese Open Graph locale is declared');
ok(worker.includes('locale: "de"'), 'German route declares its locale');
ok(worker.includes('ogLocale: "de_DE"'), 'German Open Graph locale is declared');
ok(worker.includes('Gerçek roket fırlatmalarını canlı geri sayım'), 'Turkish metadata contains meaningful primary content');
ok(worker.includes('Komutlar ve görev kontrol dili özgün İngilizce biçimini korur.'), 'Turkish static copy states the language boundary');
ok(worker.includes('Los comandos y el lenguaje de control de misión conservan su forma original en inglés.'), 'Spanish static copy states the language boundary');
ok(worker.includes('Les commandes et le langage du contrôle de mission conservent leur forme originale en anglais.'), 'French static copy states the language boundary');
ok(worker.includes('コマンドとミッションコントロールの言語は本来の英語表記を維持します。'), 'Japanese static copy states the language boundary');
ok(worker.includes('Befehle und Missionskontrollsprache bleiben in ihrer englischen Originalform.'), 'German static copy states the language boundary');
ok(worker.includes('page.inLanguage = route.locale'), 'Localized JSON-LD declares page language');
ok(worker.includes('app.description = route.appDescription'), 'Localized JSON-LD explains the application');
ok(sitemap.includes('<loc>https://spacecat.watch/tr</loc>'), 'Sitemap exposes the Turkish URL');
ok(sitemap.includes('<loc>https://spacecat.watch/es</loc>'), 'Sitemap exposes the Spanish URL');
ok(sitemap.includes('<loc>https://spacecat.watch/fr</loc>'), 'Sitemap exposes the French URL');
ok(sitemap.includes('<loc>https://spacecat.watch/ja</loc>'), 'Sitemap exposes the Japanese URL');
ok(sitemap.includes('<loc>https://spacecat.watch/de</loc>'), 'Sitemap exposes the German URL');

ok(index.includes("var LOCALE=localePath==='/tr'?'tr':localePath==='/es'?'es':localePath==='/fr'?'fr':localePath==='/ja'?'ja':localePath==='/de'?'de':'en';"), 'Runtime locale follows crawlable paths');
ok(index.includes("var HOME_PATH=LOCALE==='en'?'/':'/'+LOCALE;"), 'Home preserves the active locale');
ok(!/localStorage\.(?:getItem|setItem)\([^\n]*locale/i.test(index), 'Locale is not hidden only in local storage');
ok(index.includes('var TR_HELP={'), 'Turkish help catalog is centralized');
ok(index.includes('var ES_HELP={'), 'Spanish help catalog is centralized');
ok(index.includes('var FR_HELP={'), 'French help catalog is centralized');
ok(index.includes('var JA_HELP={'), 'Japanese help catalog is centralized');
ok(index.includes('var DE_HELP={'), 'German help catalog is centralized');
ok(index.includes('var HELP_COPY={tr:TR_HELP,es:ES_HELP,fr:FR_HELP,ja:JA_HELP,de:DE_HELP};'), 'Locale help catalogs share one selection boundary');
ok((index.match(/^\s{4}(?:'[^']+'|[a-z]+):/gm) || []).length >= 30, 'Turkish help catalog covers the visible command set');
ok(index.includes('description=helpDescription(command,description);'), 'Help descriptions use the locale catalog');
ok(index.includes("helpSection('MISSION OPS'"), 'MISSION OPS identity stays English');
ok(index.includes("helpSection('DEEP SPACE'"), 'DEEP SPACE identity stays English');
ok(index.includes("helpTokens('FILESYSTEM'"), 'FILESYSTEM identity stays English');
ok(index.includes('visitor@spacecat:~$'), 'Terminal prompt remains unchanged');
ok(index.includes("helpTokens('MISC',['home','lang'"), 'Language command is discoverable without adding visual clutter');
ok(index.includes('lang:function(a){'), 'lang command is registered');
ok(index.includes("location.assign(target==='en'?'/':'/'+target);"), 'lang command switches between canonical locale URLs');
ok(index.includes("['en','tr','es','fr','ja','de'].indexOf(target)<0"), 'lang command allowlists all six languages');
ok(index.includes("LANG '+LOCALE.toUpperCase()"), 'Home utility line exposes the active language and alternate');
ok(index.includes('function localeSwitchHtml()'), 'Language links are generated without duplicating the active locale');
ok(index.includes("history.replaceState(null,'',HOME_PATH)"), 'home command stays inside the locale');
ok(index.includes("row('🚀 LIVE TILE',localized("), 'Feature names stay English while explanations localize');
ok(index.includes("30 saniyelik sinema için <span class=\"amber\">sudo launch</span>"), 'Hero instructions localize without translating commands');
ok(index.includes("escribe <span class=\"amber\">sudo launch</span> para el cine de 30 segundos"), 'Spanish hero instructions preserve commands');
ok(index.includes("écrivez <span class=\"amber\">sudo launch</span> pour le cinéma de 30 secondes"), 'French hero instructions preserve commands');
ok(index.includes("30秒シネマは <span class=\"amber\">sudo launch</span>"), 'Japanese hero instructions preserve commands');
ok(index.includes("<span class=\"amber\">sudo launch</span> für das 30-Sekunden-Kino"), 'German hero instructions preserve commands');
ok(index.includes("localized('Not affiliated with SpaceX, NASA or any agency.'"), 'Trust disclaimer is understandable in Turkish');
ok(index.includes("input.setAttribute('aria-label','terminal komut girişi')"), 'Terminal input accessibility localizes');
ok(index.includes("input.setAttribute('aria-label','entrada de comandos del terminal')"), 'Spanish terminal input accessibility localizes');
ok(index.includes("input.setAttribute('aria-label','saisie de commande du terminal')"), 'French terminal input accessibility localizes');
ok(index.includes("input.setAttribute('aria-label','ターミナルコマンド入力')"), 'Japanese terminal input accessibility localizes');
ok(index.includes("input.setAttribute('aria-label','Terminal-Befehlseingabe')"), 'German terminal input accessibility localizes');

const functionStart = worker.indexOf('function applyRouteMetadata');
const functionEnd = worker.indexOf('function withSecurityHeaders', functionStart);
ok(functionStart >= 0 && functionEnd > functionStart, 'Metadata transformer can be isolated');
const applyRouteMetadata = new Function(
  `const CANONICAL_HOST = "spacecat.watch";\n${worker.slice(functionStart, functionEnd)}\nreturn applyRouteMetadata;`
)();
const rendered = applyRouteMetadata(index, '/tr', {
  title: 'SPACE CAT :: Canlı Roket Fırlatma Terminali',
  description: 'Türkçe arama açıklaması.',
  staticTitle: 'LIVE SPACEFLIGHT TERMINAL',
  staticDescription: 'Türkçe görünür ana içerik.',
  locale: 'tr',
  ogLocale: 'tr_TR',
  staticLead: 'Türkçe giriş.',
  staticProduct: 'Türkçe ürün açıklaması.',
  staticStoreStatus: 'Türkçe mağaza durumu.',
  staticNoJs: 'Türkçe JavaScript açıklaması.',
  staticFooter: 'Türkçe kaynak açıklaması.',
  appDescription: 'Türkçe uygulama açıklaması.',
});
ok(rendered.includes('<html lang="tr">'), 'Rendered Turkish route has the correct HTML language');
ok(rendered.includes('<link rel="canonical" href="https://spacecat.watch/tr">'), 'Rendered Turkish route is self-canonical');
ok(rendered.includes('<meta property="og:locale" content="tr_TR">'), 'Rendered Turkish route has Turkish Open Graph locale');
ok(rendered.includes('Türkçe görünür ana içerik.'), 'Rendered Turkish route contains localized visible content');
ok(rendered.includes('"inLanguage":"tr"'), 'Rendered Turkish JSON-LD identifies Turkish');
ok(rendered.includes('<a href="/" lang="en">EN</a>'), 'Rendered static terminal links back to English');
ok(!rendered.includes('<a href="/tr" lang="tr">TR</a>'), 'Rendered static terminal does not link to itself as alternate UI');

const renderedEs = applyRouteMetadata(index, '/es', {
  title: 'SPACE CAT :: Terminal de Lanzamientos en Vivo',
  description: 'Descripción de búsqueda en español.',
  staticTitle: 'LIVE SPACEFLIGHT TERMINAL',
  staticDescription: 'Contenido principal visible en español.',
  locale: 'es',
  ogLocale: 'es_ES',
  staticLead: 'Entrada en español.',
  staticProduct: 'Descripción del producto en español.',
  staticStoreStatus: 'Estado de tienda en español.',
  staticNoJs: 'Explicación de JavaScript en español.',
  staticFooter: 'Fuentes en español.',
  appDescription: 'Descripción de la aplicación en español.',
});
ok(renderedEs.includes('<html lang="es">'), 'Rendered Spanish route has the correct HTML language');
ok(renderedEs.includes('<link rel="canonical" href="https://spacecat.watch/es">'), 'Rendered Spanish route is self-canonical');
ok(renderedEs.includes('<meta property="og:locale" content="es_ES">'), 'Rendered Spanish route has Spanish Open Graph locale');
ok(renderedEs.includes('Contenido principal visible en español.'), 'Rendered Spanish route contains localized visible content');
ok(renderedEs.includes('"inLanguage":"es"'), 'Rendered Spanish JSON-LD identifies Spanish');
ok(renderedEs.includes('<a href="/" lang="en">EN</a>'), 'Rendered Spanish terminal links back to English');
ok(renderedEs.includes('<a href="/tr" lang="tr">TR</a>'), 'Rendered Spanish terminal keeps the Turkish alternate');
ok(!renderedEs.includes('<a href="/es" lang="es">ES</a>'), 'Rendered Spanish terminal does not link to itself as alternate UI');

const renderedFr = applyRouteMetadata(index, '/fr', {
  title: 'SPACE CAT :: Terminal de Lancements en Direct',
  description: 'Description de recherche en français.',
  staticTitle: 'LIVE SPACEFLIGHT TERMINAL',
  staticDescription: 'Contenu principal visible en français.',
  locale: 'fr',
  ogLocale: 'fr_FR',
  staticLead: 'Entrée en français.',
  staticProduct: 'Description du produit en français.',
  staticStoreStatus: 'État de la boutique en français.',
  staticNoJs: 'Explication JavaScript en français.',
  staticFooter: 'Sources en français.',
  appDescription: 'Description de l’application en français.',
});
ok(renderedFr.includes('<html lang="fr">'), 'Rendered French route has the correct HTML language');
ok(renderedFr.includes('<link rel="canonical" href="https://spacecat.watch/fr">'), 'Rendered French route is self-canonical');
ok(renderedFr.includes('<meta property="og:locale" content="fr_FR">'), 'Rendered French route has French Open Graph locale');
ok(renderedFr.includes('Contenu principal visible en français.'), 'Rendered French route contains localized visible content');
ok(renderedFr.includes('"inLanguage":"fr"'), 'Rendered French JSON-LD identifies French');
ok(renderedFr.includes('<a href="/" lang="en">EN</a>'), 'Rendered French terminal links back to English');
ok(renderedFr.includes('<a href="/tr" lang="tr">TR</a>'), 'Rendered French terminal keeps the Turkish alternate');
ok(renderedFr.includes('<a href="/es" lang="es">ES</a>'), 'Rendered French terminal keeps the Spanish alternate');
ok(!renderedFr.includes('<a href="/fr" lang="fr">FR</a>'), 'Rendered French terminal does not link to itself as alternate UI');

const renderedJa = applyRouteMetadata(index, '/ja', {
  title: 'SPACE CAT :: ライブロケット打ち上げターミナル',
  description: '日本語の検索説明。',
  staticTitle: 'LIVE SPACEFLIGHT TERMINAL',
  staticDescription: '日本語で表示される主要コンテンツ。',
  locale: 'ja',
  ogLocale: 'ja_JP',
  staticLead: '日本語の導入。',
  staticProduct: '日本語の製品説明。',
  staticStoreStatus: '日本語のストア状態。',
  staticNoJs: '日本語のJavaScript説明。',
  staticFooter: '日本語のデータソース。',
  appDescription: '日本語のアプリ説明。',
});
ok(renderedJa.includes('<html lang="ja">'), 'Rendered Japanese route has the correct HTML language');
ok(renderedJa.includes('<link rel="canonical" href="https://spacecat.watch/ja">'), 'Rendered Japanese route is self-canonical');
ok(renderedJa.includes('<meta property="og:locale" content="ja_JP">'), 'Rendered Japanese route has Japanese Open Graph locale');
ok(renderedJa.includes('日本語で表示される主要コンテンツ。'), 'Rendered Japanese route contains localized visible content');
ok(renderedJa.includes('"inLanguage":"ja"'), 'Rendered Japanese JSON-LD identifies Japanese');
ok(renderedJa.includes('<a href="/" lang="en">EN</a>'), 'Rendered Japanese terminal links back to English');
ok(renderedJa.includes('<a href="/tr" lang="tr">TR</a>'), 'Rendered Japanese terminal keeps the Turkish alternate');
ok(renderedJa.includes('<a href="/es" lang="es">ES</a>'), 'Rendered Japanese terminal keeps the Spanish alternate');
ok(renderedJa.includes('<a href="/fr" lang="fr">FR</a>'), 'Rendered Japanese terminal keeps the French alternate');
ok(!renderedJa.includes('<a href="/ja" lang="ja">JA</a>'), 'Rendered Japanese terminal does not link to itself as alternate UI');

const renderedDe = applyRouteMetadata(index, '/de', {
  title: 'SPACE CAT :: Live-Raketenstart-Terminal',
  description: 'Deutsche Suchbeschreibung.',
  staticTitle: 'LIVE SPACEFLIGHT TERMINAL',
  staticDescription: 'Sichtbarer Hauptinhalt auf Deutsch.',
  locale: 'de',
  ogLocale: 'de_DE',
  staticLead: 'Deutscher Einstieg.',
  staticProduct: 'Deutsche Produktbeschreibung.',
  staticStoreStatus: 'Deutscher Store-Status.',
  staticNoJs: 'Deutsche JavaScript-Erklärung.',
  staticFooter: 'Deutsche Quellenangabe.',
  appDescription: 'Deutsche App-Beschreibung.',
});
ok(renderedDe.includes('<html lang="de">'), 'Rendered German route has the correct HTML language');
ok(renderedDe.includes('<link rel="canonical" href="https://spacecat.watch/de">'), 'Rendered German route is self-canonical');
ok(renderedDe.includes('<meta property="og:locale" content="de_DE">'), 'Rendered German route has German Open Graph locale');
ok(renderedDe.includes('Sichtbarer Hauptinhalt auf Deutsch.'), 'Rendered German route contains localized visible content');
ok(renderedDe.includes('"inLanguage":"de"'), 'Rendered German JSON-LD identifies German');
ok(renderedDe.includes('<a href="/" lang="en">EN</a>'), 'Rendered German terminal links back to English');
ok(renderedDe.includes('<a href="/tr" lang="tr">TR</a>'), 'Rendered German terminal keeps the Turkish alternate');
ok(renderedDe.includes('<a href="/es" lang="es">ES</a>'), 'Rendered German terminal keeps the Spanish alternate');
ok(renderedDe.includes('<a href="/fr" lang="fr">FR</a>'), 'Rendered German terminal keeps the French alternate');
ok(renderedDe.includes('<a href="/ja" lang="ja">JA</a>'), 'Rendered German terminal keeps the Japanese alternate');
ok(!renderedDe.includes('<a href="/de" lang="de">DE</a>'), 'Rendered German terminal does not link to itself as alternate UI');

const script = index.match(/<script>([\s\S]*?)<\/script>/);
ok(!!script, 'Main application script exists');
new Function(script[1]);
checks += 1;

console.log(`Web localization checks OK (${checks})`);
