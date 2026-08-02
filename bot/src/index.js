/**
 * SPACE CAT launch-alert bot — @spacecatwatch
 * Cron: every 15 min. Checks LL2 upcoming launches and posts linkless alerts
 * (URL posts cost 13x more on X pay-per-use; the link lives in the bio).
 * Cross-source dedup via KV: sent:v2:{missionFingerprint}:{alertKey} (TTL 7 days).
 */

const LL2 = "https://ll.thespacedevs.com/2.3.0/launches/upcoming/?limit=5";
const RLL = "https://fdo.rocketlaunch.live/json/launches/next/5";
const UA = "spacecat-bot/1.0 (spacecat.watch)";
const PROD_CACHE_KEY = "ll2:prod";
const RLL_CACHE_KEY = "rll:prod";
const HEALTH_KEY = "upstream:health";
const SNAPSHOT_TTL_SECONDS = 86400;
const HEALTH_TTL_SECONDS = 2592000;

function parseJson(raw, fallback = null) {
  if (!raw) return fallback;
  try { return JSON.parse(raw); } catch { return fallback; }
}

function minutesSince(timestamp) {
  return timestamp ? (Date.now() - timestamp) / 60000 : Infinity;
}

function closestLaunchMinutes(data) {
  const launches = (data && data.results) || [];
  const distances = launches
    .map((launch) => Math.abs((new Date(launch.net).getTime() - Date.now()) / 60000))
    .filter(Number.isFinite);
  return distances.length ? Math.min(...distances) : Infinity;
}

function adaptiveRefreshMinutes(data) {
  const distance = closestLaunchMinutes(data);
  if (distance <= 240) return 15;
  if (distance <= 720) return 30;
  if (distance <= 2880) return 60;
  return 180;
}

function ll2AllowedKinds(ageMinutes) {
  const allowed = new Set();
  if (ageMinutes < 180) {
    allowed.add("t180");
    allowed.add("success");
    allowed.add("failure");
  }
  if (ageMinutes < 75) allowed.add("t60");
  if (ageMinutes < 30) allowed.add("t10");
  return allowed;
}

function retryMinutes(status, consecutiveFailures, retryAfter) {
  const headerSeconds = Number(retryAfter);
  if (Number.isFinite(headerSeconds) && headerSeconds > 0)
    return Math.min(360, Math.max(15, Math.ceil(headerSeconds / 60)));
  const base = status === 429 ? 30 : 15;
  return Math.min(360, base * (2 ** Math.min(4, Math.max(0, consecutiveFailures - 1))));
}

async function readHealth(env) {
  return parseJson(await env.STATE.get(HEALTH_KEY), {
    consecutiveLl2Failures: 0,
    nextLl2AttemptAt: 0,
  });
}

async function writeHealth(env, health) {
  await env.STATE.put(HEALTH_KEY, JSON.stringify(health), {
    expirationTtl: HEALTH_TTL_SECONDS,
  });
}

async function fetchJson(url) {
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "application/json" },
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        retryAfter: response.headers.get("retry-after"),
      };
    }
    return { ok: true, status: response.status, data: await response.json() };
  } catch (error) {
    return { ok: false, status: 0, error: String(error) };
  }
}

/* ── OAuth 1.0a (HMAC-SHA1) ─────────────────────────────────────── */
function pe(s) {
  return encodeURIComponent(s).replace(/[!*'()]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase());
}
async function hmacSha1(key, base) {
  const k = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(key), { name: "HMAC", hash: "SHA-1" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", k, new TextEncoder().encode(base));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}
async function postTweet(env, text) {
  const url = "https://api.twitter.com/2/tweets";
  const oauth = {
    oauth_consumer_key: env.X_CONSUMER_KEY,
    oauth_nonce: crypto.randomUUID().replace(/-/g, ""),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: env.X_ACCESS_TOKEN,
    oauth_version: "1.0",
  };
  const params = Object.keys(oauth).sort().map((k) => `${pe(k)}=${pe(oauth[k])}`).join("&");
  const base = ["POST", pe(url), pe(params)].join("&");
  const signingKey = `${pe(env.X_CONSUMER_SECRET)}&${pe(env.X_ACCESS_SECRET)}`;
  oauth.oauth_signature = await hmacSha1(signingKey, base);
  const header = "OAuth " + Object.keys(oauth).sort().map((k) => `${pe(k)}="${pe(oauth[k])}"`).join(", ");
  const r = await fetch(url, {
    method: "POST",
    headers: { Authorization: header, "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
    signal: AbortSignal.timeout(12000),
  });
  return { status: r.status, body: await r.text() };
}

/* ── Alert copy (linkless by design) ────────────────────────────── */
function trunc(s, n) { return s && s.length > n ? s.slice(0, n - 1) + "…" : (s || ""); }

function alertText(kind, m, mins) {
  const name = trunc(m.name, 90);
  const agency = trunc(m.agency, 30);
  const pad = trunc(m.pad, 40);
  if (kind === "t180")
    return `🚀 LAUNCH DAY\n\n▸ ${name}\n▸ ${agency} · ${pad}\n▸ T-${Math.round(mins / 60)} hours · status: ${m.status}\n\nride the real countdown at the terminal in our bio 🐈\n\n#rocketlaunch #space`;
  if (kind === "t60")
    return `🔴 LAUNCH IN ${mins} MINUTES\n\n▸ ${name}\n▸ ${agency} · ${pad}\n▸ status: ${m.status}\n\nvisitor@spacecat:~$ track\n\nterminal in bio — ignition at the ACTUAL T-0 🐈🚀`;
  if (kind === "t10")
    return `⏱ T-MINUS ${mins} MINUTES\n\n${name}\n\nthe pad is clear. the count is real.\nterminal in bio 🚀`;
  if (kind === "success")
    return `✅ ORBIT CONFIRMED\n\n${name} — mission success.\n\nflight record sealed. the terminal keeps watch. 🐈🚀`;
  if (kind === "failure")
    return `⚠ ANOMALY DECLARED\n\n${name} — ${m.statusName || m.status}.\n\nspace is hard. we keep watching.`;
  return null;
}

/* ── Launch data with adaptive polling and a cold standby ─────────
   The public LL2 quota is per IP. Cloudflare egress is shared, so a fixed
   15-minute fetch cadence can receive 429s even though this bot is polite.

   Strategy:
     1. keep cron at 15 min, but fetch LL2 adaptively (15/30/60/180 min)
     2. exponentially back off after upstream failures and respect Retry-After
     3. use a production LL2 snapshot for at most 3 h
     4. if no trustworthy LL2 snapshot exists, use RocketLaunch.Live's free
        next-five feed for T-180/T-60 only; never infer T-10 or results from it
     5. never use lldev for production decisions

   This adds no paid service and keeps the richer LL2 feed authoritative. */
function normalizeRll(data) {
  const results = ((data && data.result) || [])
    .filter((launch) => launch && launch.t0)
    .map((launch) => ({
      id: `rll-${launch.id}`,
      name: launch.name || "Unknown mission",
      net: launch.t0,
      status: "TBC",
      statusName: "Scheduled",
      agency: (launch.provider && launch.provider.name) || "—",
      pad: (launch.pad && launch.pad.name) || "—",
      sourceId: String(launch.id),
    }));
  return { results };
}

async function getRllData(env, health, log) {
  const cached = parseJson(await env.STATE.get(RLL_CACHE_KEY));
  const cacheAge = cached ? minutesSince(cached.t) : Infinity;

  if (cached && cacheAge < 15) {
    log.push(`rll: cache hit (${cacheAge.toFixed(1)}min)`);
    return {
      data: cached.d,
      source: "rll-cache",
      allowedKinds: new Set(["t180", "t60"]),
    };
  }

  const response = await fetchJson(RLL);
  health.lastRllAttemptAt = Date.now();
  health.lastRllStatus = response.status;

  if (response.ok) {
    const normalized = normalizeRll(response.data);
    const snapshot = { t: Date.now(), d: normalized };
    await env.STATE.put(RLL_CACHE_KEY, JSON.stringify(snapshot), {
      expirationTtl: SNAPSHOT_TTL_SECONDS,
    });
    health.lastRllSuccessAt = snapshot.t;
    await writeHealth(env, health);
    log.push("rll: fresh cold-standby fetch ok");
    return {
      data: normalized,
      source: "rll-live",
      allowedKinds: new Set(["t180", "t60"]),
    };
  }

  await writeHealth(env, health);
  if (cached && cacheAge < 60) {
    log.push(`rll: ${response.status || "network error"}, cache (${cacheAge.toFixed(0)}min)`);
    return {
      data: cached.d,
      source: "rll-cache",
      allowedKinds: new Set(["t180", "t60"]),
    };
  }

  log.push(`rll: ${response.status || "network error"}, no trustworthy standby data`);
  return null;
}

async function getLaunchData(env, log, force = false) {
  const prod = parseJson(await env.STATE.get(PROD_CACHE_KEY));
  const prodAge = prod ? minutesSince(prod.t) : Infinity;
  const health = await readHealth(env);
  const now = Date.now();
  const refreshMinutes = prod ? adaptiveRefreshMinutes(prod.d) : 15;
  const cacheDueAt = prod ? prod.t + refreshMinutes * 60000 : 0;
  const backoffActive = !force && health.nextLl2AttemptAt > now;
  const refreshDue = force || !prod || now >= cacheDueAt;

  if (!refreshDue) {
    log.push(`ll2: adaptive cache (${prodAge.toFixed(1)}min; refresh ${refreshMinutes}min)`);
    return {
      data: prod.d,
      source: "ll2-cache",
      allowedKinds: ll2AllowedKinds(prodAge),
    };
  }

  if (backoffActive) {
    const wait = Math.ceil((health.nextLl2AttemptAt - now) / 60000);
    log.push(`ll2: backoff active (${wait}min remaining)`);
    if (prod && prodAge < 180) {
      log.push(`ll2: trusted production snapshot (${prodAge.toFixed(0)}min)`);
      if (closestLaunchMinutes(prod.d) <= 90 && prodAge >= 75) {
        log.push("ll2: snapshot too old for T-60; consulting cold standby");
        const standby = await getRllData(env, health, log);
        if (standby) return standby;
      }
      return {
        data: prod.d,
        source: "ll2-cache",
        allowedKinds: ll2AllowedKinds(prodAge),
      };
    }
    return getRllData(env, health, log);
  }

  const response = await fetchJson(LL2);
  health.lastLl2AttemptAt = now;
  health.lastLl2Status = response.status;

  if (response.ok) {
    const snapshot = { t: Date.now(), d: response.data };
    const nextRefresh = adaptiveRefreshMinutes(response.data);
    await env.STATE.put(PROD_CACHE_KEY, JSON.stringify(snapshot), {
      expirationTtl: SNAPSHOT_TTL_SECONDS,
    });
    health.lastLl2SuccessAt = snapshot.t;
    health.consecutiveLl2Failures = 0;
    health.nextLl2AttemptAt = snapshot.t + nextRefresh * 60000;
    await writeHealth(env, health);
    log.push(`ll2: fresh production fetch ok; next in ${nextRefresh}min`);
    return {
      data: response.data,
      source: "ll2-live",
      allowedKinds: ll2AllowedKinds(0),
    };
  }

  health.consecutiveLl2Failures = (health.consecutiveLl2Failures || 0) + 1;
  const waitMinutes = retryMinutes(
    response.status,
    health.consecutiveLl2Failures,
    response.retryAfter
  );
  health.nextLl2AttemptAt = now + waitMinutes * 60000;
  health.lastLl2Error = response.error || `HTTP ${response.status}`;
  await writeHealth(env, health);
  log.push(`ll2: ${response.status || "network error"}; backoff ${waitMinutes}min`);

  if (prod && prodAge < 180) {
    log.push(`ll2: trusted production snapshot (${prodAge.toFixed(0)}min)`);
    if (closestLaunchMinutes(prod.d) <= 90 && prodAge >= 75) {
      log.push("ll2: snapshot too old for T-60; consulting cold standby");
      const standby = await getRllData(env, health, log);
      if (standby) return standby;
    }
    return {
      data: prod.d,
      source: "ll2-cache",
      allowedKinds: ll2AllowedKinds(prodAge),
    };
  }

  return getRllData(env, health, log);
}

/* ── Core check ─────────────────────────────────────────────────── */
function missionFingerprint(mission) {
  const rawName = String(mission.name || mission.id || "unknown");
  const missionName = rawName.includes("|")
    ? rawName.split("|").at(-1).trim()
    : rawName;
  const name = missionName
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\bgroup\b/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
  return name || String(mission.id);
}

async function runCheck(env, dry, force = false) {
  const log = [];
  const source = await getLaunchData(env, log, force);
  if (!source) return { error: "Launch data unavailable", log };
  const j = source.data;
  log.push(`source: ${source.source}`);
  const launches = (j.results || []).map((L) => ({
    id: L.id,
    name: L.name || "Unknown mission",
    net: L.net,
    status: typeof L.status === "string" ? L.status : ((L.status && L.status.abbrev) || "TBD"),
    statusName: L.statusName || ((L.status && L.status.name) || ""),
    agency: L.agency || ((L.launch_service_provider && L.launch_service_provider.name) || "—"),
    pad: typeof L.pad === "string" ? L.pad : ((L.pad && L.pad.name) || "—"),
  }));

  for (const m of launches) {
    const diffMin = (new Date(m.net).getTime() - Date.now()) / 60000; // + = future
    const confirmed = m.status === "Go" || m.status === "TBC";
    const candidates = [];

    if (confirmed && diffMin > 150 && diffMin <= 195) candidates.push(["t180", Math.round(diffMin)]);
    if (confirmed && diffMin > 45 && diffMin <= 70) candidates.push(["t60", Math.round(diffMin)]);
    if (m.status === "Go" && diffMin > 1 && diffMin <= 20) candidates.push(["t10", Math.round(diffMin)]);
    if (m.status === "Success" && diffMin < -2 && diffMin > -120) candidates.push(["success", 0]);
    if ((m.status === "Failure" || m.status === "Partial Failure") && diffMin < -2 && diffMin > -120)
      candidates.push(["failure", 0]);

    for (const [kind, mins] of candidates) {
      if (!source.allowedKinds.has(kind)) {
        log.push(`suppress ${kind} (${source.source} confidence policy)`);
        continue;
      }
      const key = `sent:v2:${missionFingerprint(m)}:${kind}`;
      const legacyKey = `sent:${m.id}:${kind}`;
      if (await env.STATE.get(key) || await env.STATE.get(legacyKey)) {
        log.push(`skip ${kind} ${m.name} (already sent)`);
        continue;
      }
      const text = alertText(kind, m, mins);
      if (!text) continue;
      if (dry) { log.push(`DRY would post [${kind}]:\n${text}`); continue; }
      const res = await postTweet(env, text);
      log.push(`post ${kind} ${m.name} -> ${res.status}`);
      if (res.status === 201) {
        await env.STATE.put(key, new Date().toISOString(), { expirationTtl: 604800 });
        await env.STATE.put(legacyKey, new Date().toISOString(), { expirationTtl: 604800 });
      } else {
        log.push(`body: ${res.body.slice(0, 200)}`);
      }
    }
    log.push(`checked: ${m.name} · ${m.status} · T${diffMin >= 0 ? "-" : "+"}${Math.abs(Math.round(diffMin))}min`);
  }
  return { ok: true, source: source.source, log };
}

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(runCheck(env, false).then((r) => console.log(JSON.stringify(r.log))));
  },
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method !== "POST")
      return new Response("SPACE CAT BOT · standing by 🐈🚀", { status: 200 });
    const authorization = request.headers.get("authorization") || "";
    if (!env.RUN_KEY || authorization !== `Bearer ${env.RUN_KEY}`)
      return new Response("Unauthorized", {
        status: 401,
        headers: { "cache-control": "no-store" },
      });
    if (url.searchParams.get("debug") === "1") {
      const prodCache = await env.STATE.get(PROD_CACHE_KEY);
      const rllCache = await env.STATE.get(RLL_CACHE_KEY);
      const health = await readHealth(env);
      const legacyCache = await env.STATE.get("ll2:cache");
      const prodSnapshot = parseJson(prodCache);
      const rllSnapshot = parseJson(rllCache);
      const legacySnapshot = parseJson(legacyCache);
      return new Response(JSON.stringify({
        prodCacheLen: prodCache ? prodCache.length : null,
        prodCacheT: prodSnapshot ? prodSnapshot.t : null,
        prodCacheAgeMin: prodSnapshot ? Math.round((Date.now() - prodSnapshot.t) / 60000) : null,
        prodAdaptiveRefreshMin: prodSnapshot ? adaptiveRefreshMinutes(prodSnapshot.d) : null,
        rllCacheLen: rllCache ? rllCache.length : null,
        rllCacheT: rllSnapshot ? rllSnapshot.t : null,
        rllCacheAgeMin: rllSnapshot ? Math.round((Date.now() - rllSnapshot.t) / 60000) : null,
        upstreamHealth: health,
        legacyCachePresent: !!legacyCache,
        legacyCacheAgeMin: legacySnapshot ? Math.round((Date.now() - legacySnapshot.t) / 60000) : null,
        legacyCacheDev: legacySnapshot ? !!legacySnapshot.dev : null,
        now: Date.now(),
      }), { headers: {
        "content-type": "application/json",
        "cache-control": "no-store",
      } });
    }
    const dry = url.searchParams.get("dry") === "1";
    const force = url.searchParams.get("force") === "1";
    const result = await runCheck(env, dry, force);
    return new Response(JSON.stringify(result, null, 2), {
      headers: {
        "content-type": "application/json",
        "cache-control": "no-store",
      },
    });
  },
};
