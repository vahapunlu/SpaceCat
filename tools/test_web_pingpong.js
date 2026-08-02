#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const index = fs.readFileSync(path.join(root, 'web', 'index.html'), 'utf8');
const script = index.match(/<script>([\s\S]*?)<\/script>/);

let checks = 0;
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

ok(!!script, 'main script exists');
new Function(script[1]);
checks += 1;

ok(index.includes("fsEntry('PINGPONG.COM','file','-r-xr-xr-x')"), 'legacy executable is discoverable in /usr/games');
ok(index.includes("path==='/usr/games/PINGPONG.COM'"), 'legacy executable has an inspectable filesystem record');
ok(index.includes("'pingpong.com':function(){return pingPongStart();}"), 'DOS executable name starts the artifact');
ok(index.includes("'./pingpong.com':function(){return pingPongStart();}"), 'relative DOS executable name starts the artifact');
ok(index.includes("'/usr/games/pingpong.com':function(){return pingPongStart();}"), 'absolute DOS executable name starts the artifact');
ok(index.includes("scan:function(a){return pingPongScan(a);}"), 'local recovery scanner is implemented');
ok(index.includes('PINGPONG SIGNATURE DETECTED'), 'scanner identifies the resident artifact');
ok(index.includes('SCAN /REMOVE'), 'recovery path is discoverable after diagnosis');
ok(index.includes('PINGPONG REMOVED'), 'scanner confirms recovery');
ok(index.includes('0 files changed · 0 packets sent'), 'recovery report states the safety boundary');
ok(index.includes("state.pingPong?'  RESIDENT VIDEO"), 'memory diagnostics expose the resident artifact');
ok(index.includes('resident video-memory artifact(s)'), 'CHKDSK diagnoses the resident artifact');
ok(index.includes('displaced restorable glyph(s)'), 'CHKDSK counts displaced glyphs');
ok(index.includes('pingPongBounds(ball)'), 'animation recomputes visual viewport bounds');
ok(index.includes('Math.min(viewBottom,dockTop)'), 'animation cannot cover the fixed command dock');
ok(index.includes('function pingPongTextHit(x,y)'), 'ball can resolve the text cell beneath it');
ok(index.includes('document.caretPositionFromPoint') && index.includes('document.caretRangeFromPoint'), 'text collision supports modern and legacy caret hit testing');
ok(index.includes("parent.closest('#output .ln')"), 'collisions are limited to terminal output lines');
ok(index.includes('function pingPongDropCharacter(session,hit)'), 'character-impact mutation is isolated');
ok(index.includes('session.fallen.length>=32'), 'fallen glyph budget is bounded');
ok(index.includes("vacancy.className='pingpong-vacancy'"), 'struck character keeps a restorable cell');
ok(index.includes("glyph.className='pingpong-falling-char'"), 'struck character receives a separate falling glyph');
ok(index.includes("glyph.setAttribute('aria-hidden','true')"), 'falling duplicate is hidden from accessibility tree');
ok(index.includes('item.vy+=440*dt'), 'fallen glyphs use deterministic gravity');
ok(index.includes('!item.vacancy.isConnected'), 'live scene redraws retire orphaned falling glyphs');
ok(index.includes('session.glyphHits++'), 'all text impacts are counted independently of live redraws');
ok(index.includes('function pingPongRestoreFallen(session)'), 'cleanup owns exact glyph restoration');
ok(index.includes('parent.replaceChild(document.createTextNode(item.character),item.vacancy)'), 'cleanup restores each original character');
ok(index.includes('parent.normalize()'), 'cleanup rejoins split text nodes');
ok(index.includes('glyphs restored'), 'recovery report confirms restored glyph count');
ok(index.includes('VARIANT SPACE CAT / GLYPH-GRAVITY MUTATION'), 'filesystem record labels the deliberate Space Cat mutation');
ok(index.includes("if(reduce){"), 'reduced-motion mode is explicitly handled');
ok(index.includes("ball.setAttribute('aria-hidden','true')"), 'decorative ball is hidden from accessibility tree');
ok(index.includes("srStatus.textContent='Legacy Ping-Pong"), 'state change is announced to assistive technology');
ok(index.includes("pingpong:{lane:'LEGACY',mode:'ambient'"), 'artifact is registered with the experience kernel');

const fiction = between(index, '/* ── PING-PONG.COM', '/* ── COMMANDS');
ok(!fiction.includes('fetch('), 'artifact cannot make network requests');
ok(!fiction.includes('WebSocket'), 'artifact cannot open sockets');
ok(!fiction.includes('localStorage'), 'artifact has no persistence');
ok(!fiction.includes('indexedDB'), 'artifact cannot persist to IndexedDB');
ok(!fiction.includes('document.cookie'), 'artifact cannot write cookies');

const help = between(index, 'help:function()', 'about:function()');
ok(!/PINGPONG|pingpong|SCAN \/REMOVE/.test(help), 'legacy artifact remains outside indexed help');
ok(index.includes("'pingpong.com':1") && index.includes('scan:1'), 'artifact and recovery commands are excluded from tab completion');

console.log(`Ping-Pong fiction checks OK (${checks})`);
