const CANONICAL_HOST = "spacecat.watch";
const REDIRECT_HOSTS = new Set(["www.spacecat.watch", "spacecat.pages.dev"]);
const ROCKETLAUNCH_API =
  "https://fdo.rocketlaunch.live/json/launches?limit=25";
const ROCKETLAUNCH_CACHE_URL =
  `https://${CANONICAL_HOST}/api/launches/upcoming?schema=2`;
const CNEOS_FIREBALL_API =
  "https://ssd-api.jpl.nasa.gov/fireball.api?limit=12&req-loc=true&sort=-date";
const CNEOS_APPROACH_API =
  "https://ssd-api.jpl.nasa.gov/cad.api?date-min=now&date-max=%2B60&dist-max=20LD&diameter=true&fullname=true&sort=date&limit=20";
const CNEOS_CACHE_ROOT = `https://${CANONICAL_HOST}/api/cneos`;
const EXOPLANET_QUERY =
  "select top 256 pl_name,hostname,discoverymethod,disc_year,pl_rade,pl_bmasse,pl_orbper,pl_eqt,sy_dist,disc_facility from pscomppars where pl_rade is not null and pl_orbper is not null and disc_year is not null order by pl_name";
const EXOPLANET_API =
  `https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=${encodeURIComponent(EXOPLANET_QUERY)}&format=json`;
const EXOPLANET_CACHE_URL =
  `https://${CANONICAL_HOST}/api/exoplanets/daily?schema=1`;
const HORIZONS_API = "https://ssd.jpl.nasa.gov/api/horizons.api";
const HORIZONS_CACHE_ROOT = `https://${CANONICAL_HOST}/api/horizons/observer`;
const HORIZONS_TARGETS = {
  mercury: { id: "199", name: "Mercury" },
  venus: { id: "299", name: "Venus" },
  moon: { id: "301", name: "Moon" },
  mars: { id: "499", name: "Mars" },
  jupiter: { id: "599", name: "Jupiter" },
  saturn: { id: "699", name: "Saturn" },
  uranus: { id: "799", name: "Uranus" },
  neptune: { id: "899", name: "Neptune" },
  pluto: { id: "999", name: "Pluto" },
  voyager1: { id: "-31", name: "Voyager 1" },
  voyager2: { id: "-32", name: "Voyager 2" },
  newhorizons: { id: "-98", name: "New Horizons" },
  juno: { id: "-61", name: "Juno" },
  curiosity: { id: "-76", name: "Mars Science Laboratory / Curiosity" },
  mro: { id: "-74", name: "Mars Reconnaissance Orbiter" },
  lucy: { id: "-49", name: "Lucy" },
  jwst: { id: "-170", name: "James Webb Space Telescope" },
};
const SATNOGS_API = "https://db.satnogs.org/api/transmitters/";
const SATNOGS_CACHE_ROOT = `https://${CANONICAL_HOST}/api/satnogs/catalog`;
const SATNOGS_TARGETS = {
  iss: { noradId: 25544, name: "International Space Station" },
  ao7: { noradId: 7530, name: "AO-7" },
  so50: { noradId: 27607, name: "SO-50" },
  noaa18: { noradId: 28654, name: "NOAA-18" },
  noaa19: { noradId: 33591, name: "NOAA-19" },
  qo100: { noradId: 43700, name: "QO-100 / Es'hail-2" },
  meteor: { noradId: 57166, name: "Meteor-M 2-3" },
};
const GRACEDB_API = "https://gracedb.ligo.org/api/superevents/";
const GRACEDB_CACHE_URL =
  `https://${CANONICAL_HOST}/api/gracedb/public?schema=1`;
const CELESTRAK_API = "https://celestrak.org/NORAD/elements/gp.php";
const CELESTRAK_CACHE_ROOT = `https://${CANONICAL_HOST}/api/celestrak/elements`;
const EPIC_API = "https://epic.gsfc.nasa.gov/api/natural";
const COSMOS_EARTH_CACHE_URL =
  `https://${CANONICAL_HOST}/api/cosmos/earth?schema=1`;
const COSMOS_APOD_CACHE_ROOT =
  `https://${CANONICAL_HOST}/api/cosmos/apod`;
const NASA_APOD_API = "https://api.nasa.gov/planetary/apod";
const CELESTRAK_TARGETS = {
  iss: { noradId: 25544, name: "International Space Station" },
  hubble: { noradId: 20580, name: "Hubble Space Telescope" },
  tiangong: { noradId: 48274, name: "Tiangong / Tianhe" },
  ao7: { noradId: 7530, name: "AO-7" },
  so50: { noradId: 27607, name: "SO-50" },
  noaa18: { noradId: 28654, name: "NOAA-18" },
  noaa19: { noradId: 33591, name: "NOAA-19" },
  qo100: { noradId: 43700, name: "QO-100 / Es'hail-2" },
  meteor: { noradId: 57166, name: "Meteor-M 2-3" },
};
const BROADCAST_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "youtu.be",
  "x.com",
  "www.x.com",
  "twitter.com",
  "www.twitter.com",
  "bilibili.com",
  "www.bilibili.com",
  "live.bilibili.com",
]);
const ENTRY_ROUTES = {
  "/tr": {
    title: "SPACE CAT :: Canlı Roket Fırlatma Terminali",
    description: "Gerçek roket fırlatmalarını canlı geri sayım, görev durumu, fırlatma sahası hava durumu ve resmi yayın bağlantılarıyla saf DOS tarzı bir uzay terminalinde keşfedin.",
    staticTitle: "LIVE SPACEFLIGHT TERMINAL",
    staticDescription: "Sıradaki gerçek roket fırlatmasını, canlı T-0 geri sayımını, ISS konumunu ve uzay hava durumunu saf DOS tarzı bir terminalde keşfedin. Komutlar ve görev kontrol dili özgün İngilizce biçimini korur.",
    locale: "tr",
    ogLocale: "tr_TR",
    staticLead: "Bileğiniz için tasarlanmış görev kontrol terminali.",
    staticProduct: "SpaceX, NASA, Rocket Lab, ULA, ESA, ISRO, CASC ve diğer sağlayıcıların yörüngesel roket fırlatmalarını izleyin. SPACE CAT; canlı geri sayımı, görev durumunu, fırlatma sahası hava durumunu ve resmi yayın erişimini Wear OS saatinize taşır. Telefon gerekmeden bağımsız çalışır.",
    staticStoreStatus: "Wear OS — LIVE · watchOS — incelemede · tek fiyat · abonelik yok",
    staticNoJs: "JavaScript terminali çevrimiçi hâle getirir. JavaScript olmadan da görev kapıları ve Google Play bağlantısı çalışmaya devam eder.",
    staticFooter: "Veri kaynakları: Launch Library 2 · RocketLaunch.Live (yedek) · NASA/JPL CNEOS · NASA DSCOVR EPIC · NASA APOD · NASA Exoplanet Archive · NASA/JPL Horizons · NOAA SWPC/OVATION · ATNF Pulsar Catalogue referans periyotları · SatNOGS DB katkıcıları (CC BY-SA 4.0) · IGWN GraceDB · CelesTrak · Spaceflight News API · Open-Meteo · wheretheiss.at. SpaceX, NASA veya herhangi bir uzay ajansıyla bağlantılı değildir. © 2026 BE Engineering.",
    appDescription: "Bileğiniz için tasarlanmış, yörüngesel roket fırlatmalarını izleyen bağımsız görev kontrol terminali.",
  },
  "/es": {
    title: "SPACE CAT :: Terminal de Lanzamientos en Vivo",
    description: "Explora lanzamientos reales de cohetes con cuenta atrás en vivo, estado de misión, meteorología de la plataforma y enlaces oficiales dentro de un terminal espacial con estilo DOS.",
    staticTitle: "LIVE SPACEFLIGHT TERMINAL",
    staticDescription: "Explora el próximo lanzamiento real, la cuenta atrás T-0 en vivo, la posición de la ISS y el clima espacial dentro de un terminal con estilo DOS. Los comandos y el lenguaje de control de misión conservan su forma original en inglés.",
    locale: "es",
    ogLocale: "es_ES",
    staticLead: "El terminal de control de misión para tu muñeca.",
    staticProduct: "Sigue los lanzamientos orbitales de SpaceX, NASA, Rocket Lab, ULA, ESA, ISRO, CASC y otros proveedores. SPACE CAT lleva a tu reloj Wear OS una cuenta atrás en vivo, el estado de la misión, la meteorología de la plataforma y el acceso a la transmisión oficial. Funciona de forma autónoma, sin teléfono.",
    staticStoreStatus: "Wear OS — LIVE · watchOS — en revisión · pago único · sin suscripción",
    staticNoJs: "JavaScript conecta el terminal. Sin JavaScript, las puertas de misión y el enlace de Google Play siguen funcionando.",
    staticFooter: "Fuentes de datos: Launch Library 2 · RocketLaunch.Live (respaldo) · NASA/JPL CNEOS · NASA DSCOVR EPIC · NASA APOD · NASA Exoplanet Archive · NASA/JPL Horizons · NOAA SWPC/OVATION · períodos de referencia del ATNF Pulsar Catalogue · colaboradores de SatNOGS DB (CC BY-SA 4.0) · IGWN GraceDB · CelesTrak · Spaceflight News API · Open-Meteo · wheretheiss.at. No está afiliado con SpaceX, NASA ni ninguna agencia espacial. © 2026 BE Engineering.",
    appDescription: "Un terminal autónomo de control de misión para seguir lanzamientos orbitales desde tu muñeca.",
  },
  "/fr": {
    title: "SPACE CAT :: Terminal de Lancements en Direct",
    description: "Explorez de véritables lancements de fusées avec compte à rebours en direct, état de mission, météo du pas de tir et liens officiels dans un terminal spatial au style DOS.",
    staticTitle: "LIVE SPACEFLIGHT TERMINAL",
    staticDescription: "Explorez le prochain lancement réel, le compte à rebours T-0 en direct, la position de l’ISS et la météo spatiale dans un terminal au style DOS. Les commandes et le langage du contrôle de mission conservent leur forme originale en anglais.",
    locale: "fr",
    ogLocale: "fr_FR",
    staticLead: "Le terminal de contrôle de mission pour votre poignet.",
    staticProduct: "Suivez les lancements orbitaux de SpaceX, NASA, Rocket Lab, ULA, ESA, ISRO, CASC et d’autres opérateurs. SPACE CAT affiche sur votre montre Wear OS un compte à rebours en direct, l’état de la mission, la météo du pas de tir et l’accès à la diffusion officielle. Il fonctionne de manière autonome, sans téléphone.",
    staticStoreStatus: "Wear OS — LIVE · watchOS — en cours d’examen · achat unique · sans abonnement",
    staticNoJs: "JavaScript connecte le terminal. Sans JavaScript, les portes de mission et le lien Google Play restent accessibles.",
    staticFooter: "Sources de données : Launch Library 2 · RocketLaunch.Live (secours) · NASA/JPL CNEOS · NASA DSCOVR EPIC · NASA APOD · NASA Exoplanet Archive · NASA/JPL Horizons · NOAA SWPC/OVATION · périodes de référence de l’ATNF Pulsar Catalogue · contributeurs SatNOGS DB (CC BY-SA 4.0) · IGWN GraceDB · CelesTrak · Spaceflight News API · Open-Meteo · wheretheiss.at. Non affilié à SpaceX, NASA ou toute autre agence spatiale. © 2026 BE Engineering.",
    appDescription: "Un terminal autonome de contrôle de mission pour suivre les lancements orbitaux depuis votre poignet.",
  },
  "/live": {
    title: "SPACE CAT :: Live Launch Sync",
    description: "Lock a pure DOS terminal to the next real rocket T-0. Live mission status, countdown retargeting and a clearly labeled modeled ascent.",
    staticTitle: "REAL T-0 LIVE SYNC",
    staticDescription: "Lock the terminal to the next real orbital launch countdown. SPACE CAT follows schedule changes and mission status from Launch Library 2 while keeping modeled ascent data clearly labeled.",
  },
  "/launch": {
    title: "SPACE CAT :: ASCII Launch Sequence",
    description: "Run a cinematic ASCII rocket launch inside the SPACE CAT mission-control terminal.",
    staticTitle: "ASCII LAUNCH SEQUENCE",
    staticDescription: "Run a cinematic 30-second ASCII rocket sequence using current mission data. The terminal labels the ascent as a simulation and never presents modeled telemetry as a verified flight result.",
  },
  "/iss": {
    title: "SPACE CAT :: ISS Live Telemetry",
    description: "Open a pure DOS terminal uplink to the International Space Station's live position, altitude and velocity.",
    staticTitle: "ISS LIVE TELEMETRY",
    staticDescription: "Open a DOS-style uplink to the International Space Station and follow its current latitude, longitude, altitude, velocity and daylight state.",
  },
  "/solar": {
    title: "SPACE CAT :: Solar Weather Uplink",
    description: "Read the latest NOAA planetary K-index and geomagnetic storm state through a pure DOS space terminal.",
    staticTitle: "NOAA SOLAR WEATHER UPLINK",
    staticDescription: "Read the latest NOAA planetary K-index and geomagnetic storm state through the terminal, with device-local caching and a last-known-good fallback.",
  },
  "/felicette": {
    title: "SPACE CAT :: Félicette Memorial Core",
    description: "Enter a DOS terminal memorial to Félicette, the first and only cat to fly to space.",
    staticTitle: "FÉLICETTE MEMORIAL CORE",
    staticDescription: "Enter the terminal archive dedicated to Félicette, the first and only cat to travel to space, launched by France on 18 October 1963.",
  },
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (REDIRECT_HOSTS.has(url.hostname)) {
      const destination = new URL(url.pathname + url.search, `https://${CANONICAL_HOST}`);
      return Response.redirect(destination.toString(), 301);
    }

    const cleanPath =
      url.pathname.length > 1 ? url.pathname.replace(/\/+$/, "") : url.pathname;

    if (cleanPath === "/api/launches/upcoming") {
      return handleRocketLaunchFallback(request, env, ctx);
    }
    if (cleanPath === "/api/cneos/fireballs") {
      return handleCneosFeed(request, ctx, "fireballs");
    }
    if (cleanPath === "/api/cneos/approaches") {
      return handleCneosFeed(request, ctx, "approaches");
    }
    if (cleanPath === "/api/exoplanets/daily") {
      return handleDailyExoplanet(request, ctx);
    }
    if (cleanPath === "/api/horizons/observer") {
      return handleHorizonsObserver(request, ctx, url);
    }
    if (cleanPath === "/api/satnogs/catalog") {
      return handleSatnogsCatalog(request, ctx, url);
    }
    if (cleanPath === "/api/gracedb/public") {
      return handleGracedbPublic(request, ctx);
    }
    if (cleanPath === "/api/celestrak/elements") {
      return handleCelestrakElements(request, ctx, url);
    }
    if (cleanPath === "/api/cosmos/earth") {
      return handleEpicEarth(request, ctx);
    }
    if (cleanPath === "/api/cosmos/earth-image") {
      return handleEpicEarthImage(request, ctx, url);
    }
    if (cleanPath === "/api/cosmos/apod") {
      return handleApod(request, env, ctx, url);
    }
    if (cleanPath === "/api/cosmos/apod-image") {
      return handleApodImage(request, env, ctx, url);
    }

    if (cleanPath === "/app") {
      return Response.redirect(
        "https://play.google.com/store/apps/details?id=com.spacecat.terminal",
        302
      );
    }
    if (cleanPath !== url.pathname && ENTRY_ROUTES[cleanPath]) {
      const destination = new URL(cleanPath + url.search, url.origin);
      return Response.redirect(destination.toString(), 301);
    }

    if (ENTRY_ROUTES[cleanPath] && (request.method === "GET" || request.method === "HEAD")) {
      const assetUrl = new URL(request.url);
      assetUrl.pathname = "/";
      assetUrl.search = "";
      const assetRequest = new Request(assetUrl.toString(), request);
      const response = await env.ASSETS.fetch(assetRequest);
      if (request.method === "HEAD") return withSecurityHeaders(response);
      const html = applyRouteMetadata(await response.text(), cleanPath, ENTRY_ROUTES[cleanPath]);
      const headers = new Headers(response.headers);
      headers.delete("content-length");
      return withSecurityHeaders(
        new Response(html, {
          status: response.status,
          statusText: response.statusText,
          headers,
        })
      );
    }

    const response = await env.ASSETS.fetch(request);
    return withSecurityHeaders(response);
  },
};

function cleanText(value, fallback = "—", maxLength = 320) {
  const text = String(value == null ? "" : value)
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return (text || fallback).slice(0, maxLength);
}

function rocketLaunchStatus(result) {
  switch (Number(result)) {
    case 0:
      return "Launch Failure";
    case 1:
      return "Launch Successful";
    case 2:
      return "Partial Failure";
    case 3:
      return "In-Flight Abort";
    default:
      return "TBC";
  }
}

function rocketLaunchLocation(pad) {
  const location = pad && pad.location ? pad.location : {};
  return [
    location.name,
    location.state || location.statename,
    location.country,
  ]
    .map((part) => cleanText(part, "", 80))
    .filter((part, index, parts) => part && parts.indexOf(part) === index)
    .join(", ") || "—";
}

function safeBroadcastUrl(value) {
  try {
    const url = new URL(String(value || ""));
    if (url.protocol !== "https:" || !BROADCAST_HOSTS.has(url.hostname.toLowerCase())) {
      return null;
    }
    url.username = "";
    url.password = "";
    url.hash = "";
    return url.toString();
  } catch (error) {
    return null;
  }
}

function broadcastPlatform(url) {
  const host = new URL(url).hostname.toLowerCase();
  if (host === "youtu.be" || host.endsWith("youtube.com")) return "YouTube";
  if (host === "x.com" || host.endsWith(".x.com") || host.endsWith("twitter.com")) return "X";
  if (host.endsWith("bilibili.com")) return "Bilibili";
  return "Webcast";
}

function normalizeRocketLaunchBroadcasts(media) {
  const rows = Array.isArray(media) ? media : [];
  const normalized = rows
    .map((item, index) => {
      const candidate =
        item && item.media_url
          ? item.media_url
          : item && item.youtube_vidid
            ? `https://www.youtube.com/watch?v=${encodeURIComponent(item.youtube_vidid)}`
            : item && item.x_postid
              ? `https://x.com/i/web/status/${encodeURIComponent(item.x_postid)}`
              : item && item.bilibili_roomid
                ? `https://live.bilibili.com/${encodeURIComponent(item.bilibili_roomid)}`
                : null;
      const url = safeBroadcastUrl(candidate);
      if (!url) return null;
      return {
        url,
        platform: broadcastPlatform(url),
        title: cleanText(item.title || item.description, "", 120) || null,
        live: item.live_status === true,
        approved: item.approved === true,
        featured: item.featured === true || item.ldfeatured === true,
        order: index,
      };
    })
    .filter(Boolean)
    .sort(
      (a, b) =>
        Number(b.live) - Number(a.live) ||
        Number(b.approved) - Number(a.approved) ||
        Number(b.featured) - Number(a.featured) ||
        a.order - b.order
    );

  const seen = new Set();
  return normalized
    .filter((item) => {
      if (seen.has(item.url)) return false;
      seen.add(item.url);
      delete item.order;
      return true;
    })
    .slice(0, 3);
}

/* Premium RocketLaunch.Live data is reduced to the exact fields the public
   terminal needs. The API key and the original response never reach clients. */
function normalizeRocketLaunchData(data) {
  const envelope =
    data && data.response && typeof data.response === "object"
      ? data.response
      : data;
  const launches = Array.isArray(envelope && envelope.result)
    ? envelope.result
    : [];
  return launches
    .filter((launch) => {
      if (!launch || !launch.t0) return false;
      return Number.isFinite(Date.parse(launch.t0));
    })
    .map((launch) => {
      const mission =
        Array.isArray(launch.missions) && launch.missions.length
          ? launch.missions[0]
          : {};
      return {
        id: `rll-${cleanText(launch.id, "unknown", 40)}`,
        name: cleanText(launch.name || mission.name, "UNKNOWN MISSION", 160),
        net: new Date(launch.t0).toISOString(),
        status: rocketLaunchStatus(launch.result),
        prob: null,
        pad: cleanText(launch.pad && launch.pad.name, "—", 120),
        loc: rocketLaunchLocation(launch.pad),
        lat: null,
        lng: null,
        agency: cleanText(
          launch.provider && launch.provider.name,
          "—",
          120
        ),
        rocket: cleanText(
          launch.vehicle && launch.vehicle.name,
          "—",
          120
        ),
        orbit: null,
        desc: cleanText(
          launch.mission_description ||
            mission.description ||
            launch.launch_description,
          "",
          500
        ) || null,
        wstart: launch.win_open || null,
        wend: launch.win_close || null,
        modified: launch.modified || null,
        broadcasts: normalizeRocketLaunchBroadcasts(launch.media),
        source: "RocketLaunch.Live",
      };
    })
    .sort((a, b) => Date.parse(a.net) - Date.parse(b.net))
    .slice(0, 5);
}

async function handleRocketLaunchFallback(request, env, ctx) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return withSecurityHeaders(
      jsonResponse({ error: "method not allowed" }, 405, {
        Allow: "GET, HEAD",
      })
    );
  }

  if (!env.ROCKETLAUNCH_API_KEY) {
    console.warn("rll-vault: production secret missing");
    return withSecurityHeaders(
      jsonResponse({ error: "standby uplink unavailable" }, 503)
    );
  }

  const cache = caches.default;
  const cacheKey = new Request(ROCKETLAUNCH_CACHE_URL, { method: "GET" });
  const cached = await cache.match(cacheKey);
  if (cached) {
    console.log("rll-vault: edge cache hit");
    const headers = new Headers(cached.headers);
    headers.set("X-Spacecat-Cache", "HIT");
    const response = new Response(
      request.method === "HEAD" ? null : cached.body,
      { status: cached.status, headers }
    );
    return withSecurityHeaders(response);
  }

  let upstream;
  try {
    upstream = await fetch(ROCKETLAUNCH_API, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${env.ROCKETLAUNCH_API_KEY}`,
        "User-Agent": "SPACE-CAT/1.0 (spacecat.watch)",
      },
      signal: AbortSignal.timeout(8000),
    });
  } catch (error) {
    console.warn(`rll-vault: network error · ${String(error)}`);
    return withSecurityHeaders(
      jsonResponse({ error: "standby uplink failed" }, 502)
    );
  }

  if (!upstream.ok) {
    console.warn(`rll-vault: upstream HTTP ${upstream.status}`);
    return withSecurityHeaders(
      jsonResponse({ error: "standby uplink rejected" }, 502)
    );
  }

  let payload;
  try {
    payload = await upstream.json();
  } catch (error) {
    console.warn(`rll-vault: invalid JSON · ${String(error)}`);
    return withSecurityHeaders(
      jsonResponse({ error: "standby payload invalid" }, 502)
    );
  }

  const envelope =
    payload && payload.response && typeof payload.response === "object"
      ? payload.response
      : payload;
  if (envelope && envelope.valid_auth === false) {
    console.warn("rll-vault: upstream rejected API key");
    return withSecurityHeaders(
      jsonResponse({ error: "standby authentication failed" }, 502)
    );
  }

  const results = normalizeRocketLaunchData(payload);
  if (!results.length) {
    console.warn("rll-vault: no exact future T-0 records");
    return withSecurityHeaders(
      jsonResponse({ error: "standby schedule empty" }, 502)
    );
  }

  const response = jsonResponse(
    {
      schema: 2,
      source: "RocketLaunch.Live",
      fetchedAt: new Date().toISOString(),
      results,
    },
    200,
    {
      "Cache-Control":
        "public, max-age=60, s-maxage=300, stale-while-revalidate=1800",
      "X-Robots-Tag": "noindex, nofollow",
      "X-Spacecat-Cache": "MISS",
    }
  );
  console.log(`rll-vault: fresh premium snapshot · ${results.length} missions`);

  const cacheWrite = cache.put(cacheKey, response.clone());
  if (ctx && typeof ctx.waitUntil === "function") ctx.waitUntil(cacheWrite);
  else await cacheWrite;

  if (request.method === "HEAD") {
    return withSecurityHeaders(
      new Response(null, { status: response.status, headers: response.headers })
    );
  }
  return withSecurityHeaders(response);
}

function cneosFieldRows(payload) {
  const fields = Array.isArray(payload && payload.fields) ? payload.fields : [];
  const rows = Array.isArray(payload && payload.data) ? payload.data : [];
  return rows.map((row) => {
    const record = {};
    fields.forEach((field, index) => {
      record[field] = Array.isArray(row) ? row[index] : null;
    });
    return record;
  });
}

function finiteNumber(value) {
  if (value == null || String(value).trim() === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function cneosUtc(value) {
  const text = cleanText(value, "", 32);
  if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(text)) return null;
  const time = Date.parse(text.replace(" ", "T") + "Z");
  return Number.isFinite(time) ? new Date(time).toISOString() : null;
}

function cneosTdb(value) {
  const text = cleanText(value, "", 32);
  const match = text.match(/^(\d{4})-([A-Z][a-z]{2})-(\d{2}) (\d{2}):(\d{2})$/);
  if (!match) return null;
  const months = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
  };
  if (!(match[2] in months)) return null;
  return new Date(Date.UTC(
    Number(match[1]), months[match[2]], Number(match[3]),
    Number(match[4]), Number(match[5])
  )).toISOString();
}

function signedCoordinate(value, direction) {
  const number = finiteNumber(value);
  if (number == null) return null;
  return /^(S|W)$/i.test(String(direction || "")) ? -number : number;
}

function normalizeCneosFireballs(payload) {
  return cneosFieldRows(payload)
    .map((row) => ({
      observedAt: cneosUtc(row.date),
      latitude: signedCoordinate(row.lat, row["lat-dir"]),
      longitude: signedCoordinate(row.lon, row["lon-dir"]),
      altitudeKm: finiteNumber(row.alt),
      velocityKps: finiteNumber(row.vel),
      radiatedEnergy10J: finiteNumber(row.energy),
      impactEnergyKt: finiteNumber(row["impact-e"]),
    }))
    .filter((record) => record.observedAt && record.impactEnergyKt != null)
    .slice(0, 12);
}

function normalizeCneosApproaches(payload) {
  const lunarDistancesPerAu = 389.174;
  return cneosFieldRows(payload)
    .map((row) => {
      const distanceAu = finiteNumber(row.dist);
      return {
        designation: cleanText(row.des, "UNKNOWN", 80),
        name: cleanText(row.fullname || row.des, "UNKNOWN", 120),
        approachAt: cneosTdb(row.cd),
        timeScale: "TDB",
        distanceAu,
        lunarDistances: distanceAu == null ? null : distanceAu * lunarDistancesPerAu,
        relativeVelocityKps: finiteNumber(row.v_rel),
        absoluteMagnitude: finiteNumber(row.h),
        diameterKm: finiteNumber(row.diameter),
      };
    })
    .filter((record) => record.approachAt && record.distanceAu != null)
    .slice(0, 20);
}

function cneosConfig(feed) {
  return feed === "fireballs"
    ? {
        upstream: CNEOS_FIREBALL_API,
        source: "NASA/JPL CNEOS Fireball Data API",
        normalize: normalizeCneosFireballs,
      }
    : {
        upstream: CNEOS_APPROACH_API,
        source: "NASA/JPL CNEOS Close Approach Data API",
        normalize: normalizeCneosApproaches,
      };
}

function edgeCachedResponse(cached, request, cacheState) {
  const headers = new Headers(cached.headers);
  headers.set("X-Spacecat-Cache", cacheState);
  return withSecurityHeaders(new Response(
    request.method === "HEAD" ? null : cached.body,
    { status: cached.status, headers }
  ));
}

async function handleCneosFeed(request, ctx, feed) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return withSecurityHeaders(
      jsonResponse({ error: "method not allowed" }, 405, { Allow: "GET, HEAD" })
    );
  }

  const config = cneosConfig(feed);
  const cache = caches.default;
  const cacheKey = new Request(`${CNEOS_CACHE_ROOT}/${feed}?schema=1`, { method: "GET" });
  const cached = await cache.match(cacheKey);
  if (cached) {
    try {
      const body = await cached.clone().json();
      const age = Date.now() - Date.parse(body.fetchedAt || "");
      if (Number.isFinite(age) && age >= 0 && age < 6 * 60 * 60 * 1000) {
        console.log(`cneos-${feed}: edge cache hit`);
        return edgeCachedResponse(cached, request, "HIT");
      }
    } catch (error) {
      console.warn(`cneos-${feed}: cached payload unreadable · ${String(error)}`);
    }
  }

  let upstream;
  try {
    upstream = await fetch(config.upstream, {
      headers: {
        Accept: "application/json",
        "User-Agent": "SPACE-CAT/1.0 (spacecat.watch)",
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!upstream.ok) throw new Error(`HTTP ${upstream.status}`);
    const raw = await upstream.json();
    if (!raw || !raw.signature || !Array.isArray(raw.fields) || !Array.isArray(raw.data)) {
      throw new Error("invalid CNEOS envelope");
    }
    const results = config.normalize(raw);
    if (!results.length) throw new Error("empty normalized feed");
    const response = jsonResponse(
      {
        schema: 1,
        source: config.source,
        fetchedAt: new Date().toISOString(),
        results,
      },
      200,
      {
        "Cache-Control": "public, max-age=60, s-maxage=604800",
        "X-Robots-Tag": "noindex, nofollow",
        "X-Spacecat-Cache": "MISS",
      }
    );
    const cacheWrite = cache.put(cacheKey, response.clone());
    if (ctx && typeof ctx.waitUntil === "function") ctx.waitUntil(cacheWrite);
    else await cacheWrite;
    console.log(`cneos-${feed}: fresh snapshot · ${results.length} records`);
    if (request.method === "HEAD") {
      return withSecurityHeaders(
        new Response(null, { status: response.status, headers: response.headers })
      );
    }
    return withSecurityHeaders(response);
  } catch (error) {
    console.warn(`cneos-${feed}: upstream failed · ${String(error)}`);
    if (cached) {
      console.warn(`cneos-${feed}: serving last-known-good snapshot`);
      return edgeCachedResponse(cached, request, "STALE");
    }
    return withSecurityHeaders(
      jsonResponse({ error: "CNEOS uplink unavailable" }, 502, {
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow",
      })
    );
  }
}

function stableDailyHash(value) {
  let hash = 2166136261;
  for (const character of String(value || "")) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function exoplanetSizeClass(radiusEarth) {
  if (radiusEarth == null) return "UNCLASSIFIED";
  if (radiusEarth <= 1.25) return "EARTH-SIZED";
  if (radiusEarth <= 2) return "SUPER-EARTH SIZE";
  if (radiusEarth <= 4) return "NEPTUNE-SIZED";
  return "GIANT-SIZED";
}

function normalizeExoplanet(row) {
  if (!row || typeof row !== "object") return null;
  const radiusEarth = finiteNumber(row.pl_rade);
  const orbitalPeriodDays = finiteNumber(row.pl_orbper);
  const discoveryYear = finiteNumber(row.disc_year);
  const name = cleanText(row.pl_name, "", 100);
  if (!name || radiusEarth == null || orbitalPeriodDays == null || discoveryYear == null) {
    return null;
  }
  const distanceParsec = finiteNumber(row.sy_dist);
  return {
    name,
    hostStar: cleanText(row.hostname, "UNKNOWN", 100),
    discoveryMethod: cleanText(row.discoverymethod, "UNKNOWN", 100),
    discoveryYear: Math.round(discoveryYear),
    discoveryFacility: cleanText(row.disc_facility, "UNKNOWN", 140),
    radiusEarth,
    sizeClass: exoplanetSizeClass(radiusEarth),
    massEarth: finiteNumber(row.pl_bmasse),
    orbitalPeriodDays,
    equilibriumTemperatureK: finiteNumber(row.pl_eqt),
    distanceParsec,
    distanceLightYears: distanceParsec == null ? null : distanceParsec * 3.26156,
  };
}

function selectDailyExoplanet(rows, utcDate) {
  const worlds = (Array.isArray(rows) ? rows : [])
    .map(normalizeExoplanet)
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name, "en"));
  if (!worlds.length) return null;
  return worlds[stableDailyHash(utcDate) % worlds.length];
}

async function handleDailyExoplanet(request, ctx) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return withSecurityHeaders(
      jsonResponse({ error: "method not allowed" }, 405, { Allow: "GET, HEAD" })
    );
  }

  const utcDate = new Date().toISOString().slice(0, 10);
  const cache = caches.default;
  const cacheKey = new Request(EXOPLANET_CACHE_URL, { method: "GET" });
  const cached = await cache.match(cacheKey);
  if (cached) {
    try {
      const body = await cached.clone().json();
      if (body.selectionDate === utcDate && body.world) {
        console.log("exoplanet-daily: edge cache hit");
        return edgeCachedResponse(cached, request, "HIT");
      }
    } catch (error) {
      console.warn(`exoplanet-daily: cached payload unreadable · ${String(error)}`);
    }
  }

  try {
    const upstream = await fetch(EXOPLANET_API, {
      headers: {
        Accept: "application/json",
        "User-Agent": "SPACE-CAT/1.0 (spacecat.watch)",
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!upstream.ok) throw new Error(`HTTP ${upstream.status}`);
    const rows = await upstream.json();
    const world = selectDailyExoplanet(rows, utcDate);
    if (!world) throw new Error("empty normalized archive");
    const response = jsonResponse(
      {
        schema: 1,
        source: "NASA Exoplanet Archive / PSCompPars",
        selectionDate: utcDate,
        fetchedAt: new Date().toISOString(),
        candidateCount: Array.isArray(rows) ? rows.length : 0,
        world,
      },
      200,
      {
        "Cache-Control": "public, max-age=60, s-maxage=604800",
        "X-Robots-Tag": "noindex, nofollow",
        "X-Spacecat-Cache": "MISS",
      }
    );
    const cacheWrite = cache.put(cacheKey, response.clone());
    if (ctx && typeof ctx.waitUntil === "function") ctx.waitUntil(cacheWrite);
    else await cacheWrite;
    console.log(`exoplanet-daily: selected ${world.name} from ${rows.length} candidates`);
    if (request.method === "HEAD") {
      return withSecurityHeaders(
        new Response(null, { status: response.status, headers: response.headers })
      );
    }
    return withSecurityHeaders(response);
  } catch (error) {
    console.warn(`exoplanet-daily: upstream failed · ${String(error)}`);
    if (cached) {
      console.warn("exoplanet-daily: serving last-known-good world");
      return edgeCachedResponse(cached, request, "STALE");
    }
    return withSecurityHeaders(
      jsonResponse({ error: "exoplanet archive unavailable" }, 502, {
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow",
      })
    );
  }
}

function horizonsEpoch(now = new Date()) {
  const iso = now.toISOString();
  return `${iso.slice(0, 10)} ${iso.slice(11, 13)}:00`;
}

function horizonsRequestUrl(target, epoch) {
  const url = new URL(HORIZONS_API);
  const settings = {
    format: "json",
    COMMAND: `'${target.id}'`,
    OBJ_DATA: "'NO'",
    MAKE_EPHEM: "'YES'",
    EPHEM_TYPE: "'OBSERVER'",
    CENTER: "'500@399'",
    TLIST: `'${epoch}'`,
    TIME_TYPE: "'UT'",
    ANG_FORMAT: "'DEG'",
    CSV_FORMAT: "'YES'",
    QUANTITIES: "'2,9,10,20,23,24,29'",
  };
  Object.entries(settings).forEach(([key, value]) => url.searchParams.set(key, value));
  return url.toString();
}

function horizonsUtc(value) {
  const text = cleanText(value, "", 40);
  const match = text.match(/^(\d{4})-([A-Z][a-z]{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/);
  if (!match) return null;
  const months = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
  };
  if (!(match[2] in months)) return null;
  return new Date(Date.UTC(
    Number(match[1]), months[match[2]], Number(match[3]),
    Number(match[4]), Number(match[5]), Number(match[6])
  )).toISOString();
}

function normalizeHorizonsObserver(payload, key, target) {
  if (!payload || payload.error || typeof payload.result !== "string") return null;
  const section = payload.result.split("$$SOE")[1];
  if (!section || !section.includes("$$EOE")) return null;
  const line = section.split("$$EOE")[0]
    .split(/\r?\n/)
    .map((row) => row.trim())
    .find(Boolean);
  if (!line) return null;
  const fields = line.split(",").map((value) => value.trim());
  if (fields.length < 14) return null;
  const observedAt = horizonsUtc(fields[0]);
  const rightAscensionDeg = finiteNumber(fields[3]);
  const declinationDeg = finiteNumber(fields[4]);
  const distanceAu = finiteNumber(fields[8]);
  if (!observedAt || rightAscensionDeg == null || declinationDeg == null || distanceAu == null) {
    return null;
  }
  return {
    key,
    targetId: target.id,
    targetName: target.name,
    observedAt,
    timeScale: "UT",
    observer: "Earth geocenter (500@399)",
    coordinateType: "apparent RA/DEC",
    rightAscensionDeg,
    declinationDeg,
    apparentMagnitude: finiteNumber(fields[5]),
    illuminationPercent: finiteNumber(fields[7]),
    distanceAu,
    distanceMillionKm: distanceAu * 149.5978707,
    rangeRateKps: finiteNumber(fields[9]),
    solarElongationDeg: finiteNumber(fields[10]),
    phaseAngleDeg: finiteNumber(fields[12]),
    constellationCode: cleanText(fields[13], "UNKNOWN", 12),
  };
}

async function handleHorizonsObserver(request, ctx, requestUrl) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return withSecurityHeaders(
      jsonResponse({ error: "method not allowed" }, 405, { Allow: "GET, HEAD" })
    );
  }
  const key = cleanText(requestUrl.searchParams.get("target"), "", 24).toLowerCase();
  const target = HORIZONS_TARGETS[key];
  if (!target) {
    return withSecurityHeaders(
      jsonResponse({
        error: "target not allowed",
        allowed: Object.keys(HORIZONS_TARGETS),
      }, 400, {
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow",
      })
    );
  }

  const cache = caches.default;
  const cacheKey = new Request(`${HORIZONS_CACHE_ROOT}?schema=1&target=${key}`, { method: "GET" });
  const cached = await cache.match(cacheKey);
  if (cached) {
    try {
      const body = await cached.clone().json();
      const age = Date.now() - Date.parse(body.fetchedAt || "");
      if (Number.isFinite(age) && age >= 0 && age < 6 * 60 * 60 * 1000) {
        console.log(`horizons-${key}: edge cache hit`);
        return edgeCachedResponse(cached, request, "HIT");
      }
    } catch (error) {
      console.warn(`horizons-${key}: cached payload unreadable · ${String(error)}`);
    }
  }

  try {
    const epoch = horizonsEpoch();
    const upstream = await fetch(horizonsRequestUrl(target, epoch), {
      headers: {
        Accept: "application/json",
        "User-Agent": "SPACE-CAT/1.0 (spacecat.watch)",
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!upstream.ok) throw new Error(`HTTP ${upstream.status}`);
    const raw = await upstream.json();
    const vector = normalizeHorizonsObserver(raw, key, target);
    if (!vector) throw new Error(raw && raw.error ? cleanText(raw.error) : "invalid observer table");
    const response = jsonResponse(
      {
        schema: 1,
        source: "NASA/JPL Horizons API",
        fetchedAt: new Date().toISOString(),
        vector,
      },
      200,
      {
        "Cache-Control": "public, max-age=60, s-maxage=604800",
        "X-Robots-Tag": "noindex, nofollow",
        "X-Spacecat-Cache": "MISS",
      }
    );
    const cacheWrite = cache.put(cacheKey, response.clone());
    if (ctx && typeof ctx.waitUntil === "function") ctx.waitUntil(cacheWrite);
    else await cacheWrite;
    console.log(`horizons-${key}: fresh geocentric observer vector`);
    if (request.method === "HEAD") {
      return withSecurityHeaders(
        new Response(null, { status: response.status, headers: response.headers })
      );
    }
    return withSecurityHeaders(response);
  } catch (error) {
    console.warn(`horizons-${key}: upstream failed · ${String(error)}`);
    if (cached) {
      console.warn(`horizons-${key}: serving last-known-good vector`);
      return edgeCachedResponse(cached, request, "STALE");
    }
    return withSecurityHeaders(
      jsonResponse({ error: "Horizons observer unavailable" }, 502, {
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow",
      })
    );
  }
}

function satnogsRequestUrl(target) {
  const url = new URL(SATNOGS_API);
  url.searchParams.set("format", "json");
  url.searchParams.set("satellite__norad_cat_id", String(target.noradId));
  url.searchParams.set("alive", "true");
  url.searchParams.set("status", "active");
  return url.toString();
}

function normalizeSatnogsTransmitters(rows) {
  const seen = new Set();
  return (Array.isArray(rows) ? rows : [])
    .filter((row) =>
      row && row.alive === true && row.status === "active" &&
      row.unconfirmed !== true && row.frequency_violation !== true &&
      finiteNumber(row.downlink_low) != null
    )
    .map((row) => ({
      id: cleanText(row.uuid, "UNKNOWN", 48),
      description: cleanText(row.description, "UNNAMED SIGNAL", 140),
      type: cleanText(row.type, "Transmitter", 40),
      downlinkLowHz: finiteNumber(row.downlink_low),
      downlinkHighHz: finiteNumber(row.downlink_high),
      uplinkLowHz: finiteNumber(row.uplink_low),
      uplinkHighHz: finiteNumber(row.uplink_high),
      mode: cleanText(row.mode, "UNKNOWN", 40),
      uplinkMode: cleanText(row.uplink_mode, "", 40) || null,
      baud: finiteNumber(row.baud),
      service: cleanText(row.service, "UNKNOWN", 80),
      updatedAt: Number.isFinite(Date.parse(row.updated))
        ? new Date(row.updated).toISOString()
        : null,
    }))
    .sort((a, b) =>
      a.downlinkLowHz - b.downlinkLowHz ||
      a.mode.localeCompare(b.mode, "en") ||
      a.description.localeCompare(b.description, "en")
    )
    .filter((row) => {
      const key = [row.downlinkLowHz, row.downlinkHighHz, row.mode, row.description].join("|");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 12);
}

async function handleSatnogsCatalog(request, ctx, requestUrl) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return withSecurityHeaders(
      jsonResponse({ error: "method not allowed" }, 405, { Allow: "GET, HEAD" })
    );
  }
  const key = cleanText(requestUrl.searchParams.get("target"), "", 24).toLowerCase();
  const target = SATNOGS_TARGETS[key];
  if (!target) {
    return withSecurityHeaders(
      jsonResponse({
        error: "target not allowed",
        allowed: Object.keys(SATNOGS_TARGETS),
      }, 400, {
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow",
      })
    );
  }

  const cache = caches.default;
  const cacheKey = new Request(`${SATNOGS_CACHE_ROOT}?schema=1&target=${key}`, { method: "GET" });
  const cached = await cache.match(cacheKey);
  if (cached) {
    try {
      const body = await cached.clone().json();
      const age = Date.now() - Date.parse(body.fetchedAt || "");
      if (Number.isFinite(age) && age >= 0 && age < 24 * 60 * 60 * 1000) {
        console.log(`satnogs-${key}: edge cache hit`);
        return edgeCachedResponse(cached, request, "HIT");
      }
    } catch (error) {
      console.warn(`satnogs-${key}: cached payload unreadable · ${String(error)}`);
    }
  }

  try {
    const upstream = await fetch(satnogsRequestUrl(target), {
      headers: {
        Accept: "application/json",
        "User-Agent": "SPACE-CAT/1.0 (spacecat.watch)",
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!upstream.ok) throw new Error(`HTTP ${upstream.status}`);
    const raw = await upstream.json();
    const transmitters = normalizeSatnogsTransmitters(raw);
    if (!transmitters.length) throw new Error("no confirmed active downlinks");
    const response = jsonResponse(
      {
        schema: 1,
        source: "SatNOGS DB",
        attribution: "SatNOGS DB / Libre Space Foundation contributors",
        license: {
          name: "CC BY-SA 4.0",
          url: "https://creativecommons.org/licenses/by-sa/4.0/",
        },
        fetchedAt: new Date().toISOString(),
        target: {
          key,
          name: target.name,
          noradId: target.noradId,
        },
        transmitters,
      },
      200,
      {
        "Cache-Control": "public, max-age=60, s-maxage=604800",
        "X-Robots-Tag": "noindex, nofollow",
        "X-Spacecat-Cache": "MISS",
      }
    );
    const cacheWrite = cache.put(cacheKey, response.clone());
    if (ctx && typeof ctx.waitUntil === "function") ctx.waitUntil(cacheWrite);
    else await cacheWrite;
    console.log(`satnogs-${key}: fresh catalog · ${transmitters.length} transmitters`);
    if (request.method === "HEAD") {
      return withSecurityHeaders(
        new Response(null, { status: response.status, headers: response.headers })
      );
    }
    return withSecurityHeaders(response);
  } catch (error) {
    console.warn(`satnogs-${key}: upstream failed · ${String(error)}`);
    if (cached) {
      console.warn(`satnogs-${key}: serving last-known-good catalog`);
      return edgeCachedResponse(cached, request, "STALE");
    }
    return withSecurityHeaders(
      jsonResponse({ error: "SatNOGS catalog unavailable" }, 502, {
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow",
      })
    );
  }
}

function gracedbRequestUrl() {
  const url = new URL(GRACEDB_API);
  url.searchParams.set("query", "public");
  url.searchParams.set("count", "8");
  return url.toString();
}

function gracedbCreatedUtc(value) {
  const text = cleanText(value, "", 40);
  const match = text.match(/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2}) UTC$/);
  if (!match) return null;
  const time = Date.parse(`${match[1]}T${match[2]}Z`);
  return Number.isFinite(time) ? new Date(time).toISOString() : null;
}

function normalizeGracedbSuperevents(payload) {
  return (Array.isArray(payload && payload.superevents) ? payload.superevents : [])
    .map((row) => {
      if (!row || row.category !== "Production") return null;
      const id = cleanText(row.superevent_id, "", 32);
      if (!/^(?:S|GW)\d{6}[A-Za-z]+$/.test(id)) return null;
      const labels = (Array.isArray(row.labels) ? row.labels : [])
        .map((label) => cleanText(label, "", 48).toUpperCase())
        .filter(Boolean)
        .slice(0, 24);
      const gwId = cleanText(row.gw_id, "", 32) || null;
      const retracted = labels.some((label) => label.includes("RETRACT"));
      const preferred = row.preferred_event_data && typeof row.preferred_event_data === "object"
        ? row.preferred_event_data
        : {};
      return {
        id,
        gwId,
        state: retracted ? "RETRACTED" : (gwId ? "CONFIRMED GW" : "PUBLIC CANDIDATE"),
        confirmed: Boolean(gwId) && !retracted,
        retracted,
        lowSignificance: labels.some((label) => label.includes("LOW_SIGNIF")),
        createdAt: gracedbCreatedUtc(row.created),
        t0Gps: finiteNumber(row.t_0),
        farHz: finiteNumber(row.far),
        preferredEvent: cleanText(preferred.graceid, "", 32) || null,
        group: cleanText(preferred.group, "UNREPORTED", 40),
        pipeline: cleanText(preferred.pipeline, "UNREPORTED", 40),
        search: cleanText(preferred.search, "UNREPORTED", 48),
        instruments: cleanText(preferred.instruments, "UNREPORTED", 48),
        labels,
        sourceUrl: `https://gracedb.ligo.org/superevents/${id}/view/`,
      };
    })
    .filter(Boolean)
    .slice(0, 8);
}

async function handleGracedbPublic(request, ctx) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return withSecurityHeaders(
      jsonResponse({ error: "method not allowed" }, 405, { Allow: "GET, HEAD" })
    );
  }

  const cache = caches.default;
  const cacheKey = new Request(GRACEDB_CACHE_URL, { method: "GET" });
  const cached = await cache.match(cacheKey);
  if (cached) {
    try {
      const body = await cached.clone().json();
      const age = Date.now() - Date.parse(body.fetchedAt || "");
      if (Number.isFinite(age) && age >= 0 && age < 60 * 60 * 1000) {
        console.log("gracedb-public: edge cache hit");
        return edgeCachedResponse(cached, request, "HIT");
      }
    } catch (error) {
      console.warn(`gracedb-public: cached payload unreadable · ${String(error)}`);
    }
  }

  try {
    const upstream = await fetch(gracedbRequestUrl(), {
      headers: {
        Accept: "application/json",
        "User-Agent": "SPACE-CAT/1.0 (spacecat.watch)",
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!upstream.ok) throw new Error(`HTTP ${upstream.status}`);
    const raw = await upstream.json();
    const candidates = normalizeGracedbSuperevents(raw);
    if (!candidates.length) throw new Error("empty public candidate set");
    const response = jsonResponse(
      {
        schema: 1,
        source: "IGWN GraceDB",
        fetchedAt: new Date().toISOString(),
        totalPublicRecords: finiteNumber(raw.numRows),
        notice: "A public candidate record is not a confirmed gravitational-wave detection.",
        candidates,
      },
      200,
      {
        "Cache-Control": "public, max-age=60, s-maxage=604800",
        "X-Robots-Tag": "noindex, nofollow",
        "X-Spacecat-Cache": "MISS",
      }
    );
    const cacheWrite = cache.put(cacheKey, response.clone());
    if (ctx && typeof ctx.waitUntil === "function") ctx.waitUntil(cacheWrite);
    else await cacheWrite;
    console.log(`gracedb-public: fresh snapshot · ${candidates.length} records`);
    if (request.method === "HEAD") {
      return withSecurityHeaders(
        new Response(null, { status: response.status, headers: response.headers })
      );
    }
    return withSecurityHeaders(response);
  } catch (error) {
    console.warn(`gracedb-public: upstream failed · ${String(error)}`);
    if (cached) {
      console.warn("gracedb-public: serving last-known-good candidate snapshot");
      return edgeCachedResponse(cached, request, "STALE");
    }
    return withSecurityHeaders(
      jsonResponse({ error: "GraceDB public candidate watch unavailable" }, 502, {
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow",
      })
    );
  }
}

function celestrakRequestUrl(target) {
  const url = new URL(CELESTRAK_API);
  url.searchParams.set("CATNR", String(target.noradId));
  url.searchParams.set("FORMAT", "JSON");
  return url.toString();
}

function celestrakEpochUtc(value) {
  const text = cleanText(value, "", 40);
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(text)) return null;
  const time = Date.parse(text + "Z");
  return Number.isFinite(time) ? new Date(time).toISOString() : null;
}

function normalizeCelestrakElement(rows, target) {
  const row = Array.isArray(rows) && rows.length === 1 ? rows[0] : null;
  if (!row || Number(row.NORAD_CAT_ID) !== Number(target.noradId)) return null;
  const epochAt = celestrakEpochUtc(row.EPOCH);
  const meanMotion = finiteNumber(row.MEAN_MOTION);
  const eccentricity = finiteNumber(row.ECCENTRICITY);
  const inclinationDeg = finiteNumber(row.INCLINATION);
  if (!epochAt || meanMotion == null || meanMotion <= 0 || eccentricity == null || inclinationDeg == null) {
    return null;
  }
  return {
    objectName: cleanText(row.OBJECT_NAME, target.name, 100),
    objectId: cleanText(row.OBJECT_ID, "UNREPORTED", 40),
    noradId: Number(target.noradId),
    epochAt,
    meanMotionRevPerDay: meanMotion,
    orbitalPeriodMinutes: 1440 / meanMotion,
    eccentricity,
    inclinationDeg,
    rightAscensionNodeDeg: finiteNumber(row.RA_OF_ASC_NODE),
    argumentPericenterDeg: finiteNumber(row.ARG_OF_PERICENTER),
    meanAnomalyDeg: finiteNumber(row.MEAN_ANOMALY),
    bstar: finiteNumber(row.BSTAR),
    revolutionAtEpoch: finiteNumber(row.REV_AT_EPOCH),
    classification: cleanText(row.CLASSIFICATION_TYPE, "UNREPORTED", 8),
  };
}

async function handleCelestrakElements(request, ctx, requestUrl) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return withSecurityHeaders(
      jsonResponse({ error: "method not allowed" }, 405, { Allow: "GET, HEAD" })
    );
  }
  const key = cleanText(requestUrl.searchParams.get("target"), "", 24).toLowerCase();
  const target = CELESTRAK_TARGETS[key];
  if (!target) {
    return withSecurityHeaders(
      jsonResponse({
        error: "target not allowed",
        allowed: Object.keys(CELESTRAK_TARGETS),
      }, 400, {
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow",
      })
    );
  }

  const cache = caches.default;
  const cacheKey = new Request(`${CELESTRAK_CACHE_ROOT}?schema=1&target=${key}`, { method: "GET" });
  const cached = await cache.match(cacheKey);
  if (cached) {
    try {
      const body = await cached.clone().json();
      const age = Date.now() - Date.parse(body.fetchedAt || "");
      if (Number.isFinite(age) && age >= 0 && age < 12 * 60 * 60 * 1000) {
        console.log(`celestrak-${key}: edge cache hit`);
        return edgeCachedResponse(cached, request, "HIT");
      }
    } catch (error) {
      console.warn(`celestrak-${key}: cached payload unreadable · ${String(error)}`);
    }
  }

  try {
    const upstream = await fetch(celestrakRequestUrl(target), {
      headers: {
        Accept: "application/json",
        "User-Agent": "SPACE-CAT/1.0 (spacecat.watch)",
      },
      redirect: "manual",
      cf: { cacheEverything: true, cacheTtl: 43200 },
      signal: AbortSignal.timeout(10000),
    });
    if (!upstream.ok) throw new Error(`HTTP ${upstream.status}`);
    const raw = await upstream.json();
    const element = normalizeCelestrakElement(raw, target);
    if (!element) throw new Error("invalid single-object GP record");
    const response = jsonResponse(
      {
        schema: 1,
        source: "CelesTrak GP / OMM JSON",
        fetchedAt: new Date().toISOString(),
        target: { key, name: target.name, noradId: target.noradId },
        element,
        notice: "Mean orbital elements are not a live position or a tracking solution.",
      },
      200,
      {
        "Cache-Control": "public, max-age=60, s-maxage=604800",
        "X-Robots-Tag": "noindex, nofollow",
        "X-Spacecat-Cache": "MISS",
      }
    );
    const cacheWrite = cache.put(cacheKey, response.clone());
    if (ctx && typeof ctx.waitUntil === "function") ctx.waitUntil(cacheWrite);
    else await cacheWrite;
    console.log(`celestrak-${key}: fresh single-object GP element`);
    if (request.method === "HEAD") {
      return withSecurityHeaders(
        new Response(null, { status: response.status, headers: response.headers })
      );
    }
    return withSecurityHeaders(response);
  } catch (error) {
    console.warn(`celestrak-${key}: upstream failed · ${String(error)}`);
    if (cached) {
      console.warn(`celestrak-${key}: serving last-known-good GP element`);
      return edgeCachedResponse(cached, request, "STALE");
    }
    return withSecurityHeaders(
      jsonResponse({ error: "CelesTrak orbital element unavailable" }, 502, {
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow",
      })
    );
  }
}

function cosmosMethodGuard(request) {
  if (request.method === "GET" || request.method === "HEAD") return null;
  return withSecurityHeaders(
    jsonResponse({ error: "method not allowed" }, 405, { Allow: "GET, HEAD" })
  );
}

function epicArchiveUrl(date, image) {
  const match = String(date || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match || !/^epic_1b_\d{14}$/.test(String(image || ""))) return null;
  return `https://epic.gsfc.nasa.gov/archive/natural/${match[1]}/${match[2]}/${match[3]}/png/${image}.png`;
}

function normalizeEpicFrame(frame) {
  if (!frame || typeof frame !== "object") return null;
  const image = cleanText(frame.image, "", 48);
  const dateText = cleanText(frame.date, "", 40);
  const date = dateText.slice(0, 10);
  if (!epicArchiveUrl(date, image)) return null;
  const centroid = frame.centroid_coordinates || {};
  const position = frame.dscovr_j2000_position || {};
  return {
    identifier: cleanText(frame.identifier, "", 32),
    capturedAt: dateText ? `${dateText.replace(" ", "T")}Z` : null,
    image,
    date,
    caption: cleanText(frame.caption, "NASA DSCOVR EPIC full-disc Earth image", 180),
    centroidLatitude: finiteNumber(centroid.lat),
    centroidLongitude: finiteNumber(centroid.lon),
    dscovrDistanceKm: Math.hypot(
      finiteNumber(position.x) || 0,
      finiteNumber(position.y) || 0,
      finiteNumber(position.z) || 0
    ) || null,
    imageUrl: `/api/cosmos/earth-image?date=${encodeURIComponent(date)}&image=${encodeURIComponent(image)}`,
  };
}

function selectEpicFrames(rows) {
  const normalized = (Array.isArray(rows) ? rows : [])
    .map(normalizeEpicFrame)
    .filter(Boolean);
  if (normalized.length <= 4) return normalized;
  const indexes = [0, Math.floor((normalized.length - 1) / 3), Math.floor((normalized.length - 1) * 2 / 3), normalized.length - 1];
  return indexes.map((index) => normalized[index]);
}

async function handleEpicEarth(request, ctx) {
  const rejected = cosmosMethodGuard(request);
  if (rejected) return rejected;
  const cache = caches.default;
  const cacheKey = new Request(COSMOS_EARTH_CACHE_URL, { method: "GET" });
  const cached = await cache.match(cacheKey);
  if (cached) {
    try {
      const body = await cached.clone().json();
      const age = Date.now() - Date.parse(body.fetchedAt || "");
      if (Number.isFinite(age) && age >= 0 && age < 2 * 60 * 60 * 1000) {
        return edgeCachedResponse(cached, request, "HIT");
      }
    } catch (error) {
      console.warn(`epic-earth: cached payload unreadable · ${String(error)}`);
    }
  }
  try {
    const upstream = await fetch(EPIC_API, {
      headers: { Accept: "application/json", "User-Agent": "SPACE-CAT/1.0 (spacecat.watch)" },
      signal: AbortSignal.timeout(10000),
    });
    if (!upstream.ok) throw new Error(`HTTP ${upstream.status}`);
    const frames = selectEpicFrames(await upstream.json());
    if (!frames.length) throw new Error("empty EPIC frame set");
    const response = jsonResponse({
      schema: 1,
      source: "NASA DSCOVR EPIC",
      fetchedAt: new Date().toISOString(),
      frameCount: frames.length,
      frames,
    }, 200, {
      "Cache-Control": "public, max-age=300, s-maxage=604800",
      "X-Robots-Tag": "noindex, nofollow",
      "X-Spacecat-Cache": "MISS",
    });
    const cacheWrite = cache.put(cacheKey, response.clone());
    if (ctx && typeof ctx.waitUntil === "function") ctx.waitUntil(cacheWrite);
    else await cacheWrite;
    return request.method === "HEAD"
      ? withSecurityHeaders(new Response(null, { status: response.status, headers: response.headers }))
      : withSecurityHeaders(response);
  } catch (error) {
    console.warn(`epic-earth: upstream failed · ${String(error)}`);
    if (cached) return edgeCachedResponse(cached, request, "STALE");
    return withSecurityHeaders(jsonResponse({ error: "EPIC Earth unavailable" }, 502, {
      "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow",
    }));
  }
}

async function proxyCosmosImage(request, ctx, cacheUrl, upstreamUrl, maxAgeSeconds) {
  const cache = caches.default;
  const cacheKey = new Request(cacheUrl, { method: "GET" });
  const cached = await cache.match(cacheKey);
  if (cached) return edgeCachedResponse(cached, request, "HIT");
  try {
    const upstream = await fetch(upstreamUrl, {
      headers: { Accept: "image/*", "User-Agent": "SPACE-CAT/1.0 (spacecat.watch)" },
      cf: { cacheEverything: true, cacheTtl: maxAgeSeconds },
      signal: AbortSignal.timeout(15000),
    });
    if (!upstream.ok) throw new Error(`HTTP ${upstream.status}`);
    const type = upstream.headers.get("content-type") || "";
    if (!type.toLowerCase().startsWith("image/")) throw new Error("upstream was not an image");
    const headers = new Headers({
      "Content-Type": type,
      "Cache-Control": `public, max-age=86400, s-maxage=${maxAgeSeconds}`,
      "X-Robots-Tag": "noindex, nofollow",
      "X-Spacecat-Cache": "MISS",
    });
    const response = withSecurityHeaders(new Response(upstream.body, { status: 200, headers }));
    const cacheWrite = cache.put(cacheKey, response.clone());
    if (ctx && typeof ctx.waitUntil === "function") ctx.waitUntil(cacheWrite);
    else await cacheWrite;
    return request.method === "HEAD"
      ? withSecurityHeaders(new Response(null, { status: 200, headers: response.headers }))
      : response;
  } catch (error) {
    console.warn(`cosmos-image: upstream failed · ${String(error)}`);
    return withSecurityHeaders(jsonResponse({ error: "cosmos image unavailable" }, 502, {
      "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow",
    }));
  }
}

async function handleEpicEarthImage(request, ctx, requestUrl) {
  const rejected = cosmosMethodGuard(request);
  if (rejected) return rejected;
  const date = cleanText(requestUrl.searchParams.get("date"), "", 10);
  const image = cleanText(requestUrl.searchParams.get("image"), "", 48);
  const upstreamUrl = epicArchiveUrl(date, image);
  if (!upstreamUrl) return withSecurityHeaders(jsonResponse({ error: "invalid EPIC frame" }, 400, {
    "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow",
  }));
  const cacheUrl = `https://${CANONICAL_HOST}/api/cosmos/earth-image?date=${encodeURIComponent(date)}&image=${encodeURIComponent(image)}`;
  return proxyCosmosImage(request, ctx, cacheUrl, upstreamUrl, 30 * 24 * 60 * 60);
}

function validApodDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) return null;
  const date = new Date(`${value}T00:00:00Z`);
  const first = new Date("1995-06-16T00:00:00Z");
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return Number.isFinite(date.getTime()) && date >= first && date <= tomorrow ? String(value) : null;
}

async function fetchApod(env, date) {
  const url = new URL(NASA_APOD_API);
  url.searchParams.set("api_key", cleanText(env && env.NASA_API_KEY, "DEMO_KEY", 128));
  url.searchParams.set("thumbs", "true");
  if (date) url.searchParams.set("date", date);
  const upstream = await fetch(url.toString(), {
    headers: { Accept: "application/json", "User-Agent": "SPACE-CAT/1.0 (spacecat.watch)" },
    signal: AbortSignal.timeout(10000),
  });
  if (!upstream.ok) throw new Error(`HTTP ${upstream.status}`);
  const raw = await upstream.json();
  const observedDate = validApodDate(raw.date);
  if (!observedDate || !raw.title || !raw.media_type) throw new Error("invalid APOD payload");
  return {
    date: observedDate,
    title: cleanText(raw.title, "Untitled cosmic frame", 160),
    explanation: cleanText(raw.explanation, "No field note was supplied.", 1600),
    copyright: cleanText(raw.copyright, "NASA / public archive", 160),
    mediaType: raw.media_type === "video" ? "video" : "image",
    originalUrl: /^https:\/\//.test(String(raw.hdurl || raw.url || "")) ? String(raw.hdurl || raw.url) : null,
    sourcePage: `https://apod.nasa.gov/apod/ap${observedDate.slice(2).replaceAll("-", "")}.html`,
    imageUrl: `/api/cosmos/apod-image?date=${encodeURIComponent(observedDate)}`,
    proxySource: raw.media_type === "video" ? raw.thumbnail_url : raw.url,
  };
}

async function handleApod(request, env, ctx, requestUrl) {
  const rejected = cosmosMethodGuard(request);
  if (rejected) return rejected;
  const requestedDate = requestUrl.searchParams.get("date");
  const date = requestedDate ? validApodDate(requestedDate) : new Date().toISOString().slice(0, 10);
  if (!date) return withSecurityHeaders(jsonResponse({ error: "invalid APOD date" }, 400, {
    "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow",
  }));
  const cache = caches.default;
  const cacheKey = new Request(`${COSMOS_APOD_CACHE_ROOT}?schema=1&date=${date}`, { method: "GET" });
  const cached = await cache.match(cacheKey);
  if (cached) return edgeCachedResponse(cached, request, "HIT");
  try {
    const item = await fetchApod(env, date);
    const previewSource = item.proxySource;
    delete item.proxySource;
    const response = jsonResponse({
      schema: 1, source: "NASA Astronomy Picture of the Day", fetchedAt: new Date().toISOString(), item,
    }, 200, {
      "Cache-Control": "public, max-age=300, s-maxage=604800",
      "X-Robots-Tag": "noindex, nofollow", "X-Spacecat-Cache": "MISS",
    });
    const previewCacheKey = new Request(`${COSMOS_APOD_CACHE_ROOT}/preview-source?date=${date}`, { method: "GET" });
    const previewRecord = jsonResponse({ date, previewSource }, 200, {
      "Cache-Control": "public, max-age=300, s-maxage=604800",
      "X-Robots-Tag": "noindex, nofollow",
    });
    const cacheWrite = Promise.all([
      cache.put(cacheKey, response.clone()),
      cache.put(previewCacheKey, previewRecord),
    ]);
    if (ctx && typeof ctx.waitUntil === "function") ctx.waitUntil(cacheWrite);
    else await cacheWrite;
    return request.method === "HEAD"
      ? withSecurityHeaders(new Response(null, { status: response.status, headers: response.headers }))
      : withSecurityHeaders(response);
  } catch (error) {
    console.warn(`apod-${date}: upstream failed · ${String(error)}`);
    return withSecurityHeaders(jsonResponse({ error: "APOD unavailable" }, 502, {
      "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow",
    }));
  }
}

async function handleApodImage(request, env, ctx, requestUrl) {
  const rejected = cosmosMethodGuard(request);
  if (rejected) return rejected;
  const date = validApodDate(requestUrl.searchParams.get("date"));
  if (!date) return withSecurityHeaders(jsonResponse({ error: "invalid APOD date" }, 400, {
    "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow",
  }));
  try {
    const cache = caches.default;
    const previewCacheKey = new Request(`${COSMOS_APOD_CACHE_ROOT}/preview-source?date=${date}`, { method: "GET" });
    const previewRecord = await cache.match(previewCacheKey);
    let previewSource = null;
    if (previewRecord) {
      try { previewSource = (await previewRecord.json()).previewSource; } catch {}
    }
    if (!previewSource) previewSource = (await fetchApod(env, date)).proxySource;
    const upstreamUrl = /^https:\/\//.test(String(previewSource || "")) ? previewSource : null;
    if (!upstreamUrl) throw new Error("APOD has no safe preview image");
    const cacheUrl = `https://${CANONICAL_HOST}/api/cosmos/apod-image?date=${date}`;
    return proxyCosmosImage(request, ctx, cacheUrl, upstreamUrl, 30 * 24 * 60 * 60);
  } catch (error) {
    console.warn(`apod-image-${date}: upstream failed · ${String(error)}`);
    return withSecurityHeaders(jsonResponse({ error: "APOD preview unavailable" }, 502, {
      "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow",
    }));
  }
}

function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...extraHeaders,
    },
  });
}

function applyRouteMetadata(html, path, route) {
  const canonical = `https://${CANONICAL_HOST}${path}`;
  let updated = html
    .replace(/<title>[^<]*<\/title>/, `<title>${route.title}</title>`)
    .replace(
      /<meta name="description" content="[^"]*">/,
      `<meta name="description" content="${route.description}">`
    )
    .replace(
      /<link rel="canonical" href="[^"]*">/,
      `<link rel="canonical" href="${canonical}">`
    )
    .replace(
      /<meta property="og:title" content="[^"]*">/,
      `<meta property="og:title" content="${route.title}">`
    )
    .replace(
      /<meta property="og:description" content="[^"]*">/,
      `<meta property="og:description" content="${route.description}">`
    )
    .replace(
      /<meta property="og:url" content="[^"]*">/,
      `<meta property="og:url" content="${canonical}">`
    )
    .replace(
      /<meta name="twitter:title" content="[^"]*">/,
      `<meta name="twitter:title" content="${route.title}">`
    )
    .replace(
      /<meta name="twitter:description" content="[^"]*">/,
      `<meta name="twitter:description" content="${route.description}">`
    )
    .replace(
      /(<h2 id="staticRouteTitle">)[\s\S]*?(<\/h2>)/,
      `$1${route.staticTitle}$2`
    )
    .replace(
      /(<p id="staticRouteDescription">)[\s\S]*?(<\/p>)/,
      `$1${route.staticDescription}$2`
    );

  if (route.locale) {
    updated = updated
      .replace(/<html lang="[^"]*">/, `<html lang="${route.locale}">`)
      .replace(
        /<meta property="og:locale" content="[^"]*">/,
        `<meta property="og:locale" content="${route.ogLocale || route.locale}">`
      )
      .replace(
        /(<p class="white" id="staticLead">)[\s\S]*?(<\/p>)/,
        `$1${route.staticLead}$2`
      )
      .replace(
        /(<p id="staticProduct">)[\s\S]*?(<\/p>)/,
        `$1${route.staticProduct}$2`
      )
      .replace(
        /(<p class="dim" id="staticStoreStatus">)[\s\S]*?(<\/p>)/,
        `$1${route.staticStoreStatus}$2`
      )
      .replace(
        /(<p class="dim" id="staticNoJs">)[\s\S]*?(<\/p>)/,
        `$1${route.staticNoJs}$2`
      )
      .replace(
        /(<footer class="foot" id="staticFooter">)[\s\S]*?(<\/footer>)/,
        `$1${route.staticFooter}$2`
      )
      ;
    const localeSelfLink = `<a href="/${route.locale}" lang="${route.locale}">${route.locale.toUpperCase()}</a>`;
    updated = updated.replace(localeSelfLink, '<a href="/" lang="en">EN</a>');
  }

  return updated.replace(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
    (match, json) => {
      try {
        const data = JSON.parse(json);
        const graph = Array.isArray(data["@graph"]) ? data["@graph"] : [];
        const page = graph.find((item) => item && item["@type"] === "WebPage");
        if (!page) return match;
        page["@id"] = `${canonical}#webpage`;
        page.url = canonical;
        page.name = route.title;
        page.description = route.description;
        if (route.locale) page.inLanguage = route.locale;
        if (route.locale && route.appDescription) {
          const app = graph.find((item) => item && Array.isArray(item["@type"]) && item["@type"].includes("MobileApplication"));
          if (app) app.description = route.appDescription;
        }
        return `<script type="application/ld+json">\n${JSON.stringify(data)}\n</script>`;
      } catch {
        return match;
      }
    }
  );
}

function withSecurityHeaders(response) {
  const headers = new Headers(response.headers);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(self), payment=(), usb=()"
  );
  headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
      "form-action 'none'",
      "img-src 'self' data:",
      "media-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com",
      "connect-src 'self' https://ll.thespacedevs.com https://api.spaceflightnewsapi.net https://api.wheretheiss.at https://api.open-meteo.com https://services.swpc.noaa.gov https://cloudflareinsights.com",
    ].join("; ")
  );
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
