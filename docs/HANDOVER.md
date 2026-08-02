# SPACE CAT — Oturum Devir Notu (Handover)

> Son güncelleme: 2026-07-31. Yeni bir sohbet bu dosyayı okuyarak kaldığı yerden devam edebilir.
> Ayrıntılı yol haritası: [ROADMAP.md](ROADMAP.md). Kalıcı proje hafızası: `~/.claude/projects/-Users-vahap-Documents-SPACE-CAT/memory/`.

---

## 1. Proje nedir

**Space Cat: Launch Terminal** — uzay meraklısının **bilek terminali**. Ajans-bağımsız fırlatma
takip uygulaması. **İki platform**, tek vizyon, birbirini yansıtan mimari:

- **Wear OS** (Kotlin + Compose for Wear) — modül `:wear`, paket `com.spacecat.terminal`, namespace `com.spacecat.wear`
- **watchOS** (Swift + SwiftUI) — `watchos/`, xcodegen, watch-only app, bundle `com.spacecat.terminal.watchkitapp`

Terminal estetiği: monospace, yeşil/amber, "MISSION FILE" dili. İsim hikâyesi: `cat` Unix komutu +
Félicette (1963, uzaya giden tek kedi).

---

## 2. DURUM — 10 dalga, iki platformda TAMAM ✅

Her özellik gerçek veriyle doğrulandı (çoğu watchOS simülatöründe görsel + Wear derleme/telefon).

| # | Dalga | Ne yapar |
|---|---|---|
| 1 | Canlı yayın | LL2 `vidURLs`/`webcast_live` → detayda "🔴 LIVE — WATCH"/"▶ WEBCAST" chip'i, **telefonda açar** |
| 2 | T-0 haptik + sonuç | Kalkışta titreşim + LIFTOFF; In Flight/Success/Failure/Partial bildirimleri |
| 3 | Pad hava + GO ihtimali | Open-Meteo PAD WX paneli + LL2 probability (GO ODDS) |
| 4 | Events + istatistik | LL2 `/event/` (undocking/tutulma/flyby) bölümü + STATS (AGY/PAD/RECORD) |
| 5 | Görev görseli | LL2 `image` → detay tepesinde hero banner (Coil / AsyncImage) |
| 6 | Canlı ISS takibi | wheretheiss.at → "🛰 ISS NOW" ekranı, 5 sn canlı |
| 7 | Takvime ekle | Google Calendar şablon URL'i → telefona devir (Handoff/RemoteActivity) |
| 8 | Ajans markası | LL2 agency `logo`/`type` → detayda logo + COMMERCIAL/GOVERNMENT |
| 9 | Terminal cilası | **Favori ajans filtresi**: detayda ☆FOLLOW/★FAVORITE yıldızı + Ayarlar'da "Favorites only" → liste süzülür. **About/Félicette ekranı**: hikâye + sürüm + veri künyesi. **GO ODDS glanceable**: Wear tile'a GO ODDS satırı + yeni GoOddsComplicationService; watchOS'ta ikinci widget (GoOddsWidget). Hava "hafif" yol — cache'li LL2 probability, ağ isteği yok. |
| 10 | Favori derinleşmesi | **(c) Bildirim süzme**: "Favorites only" açıkken uyarılar (GO/HOLD, sonuç, gecikme, T-10/T-60/T-0) da yalnız favori ajanslara iner — LaunchNotifier / NotificationManager'da `filterActive` kapısı, liste ile aynı semantik. **(b) Yönetim ekranı**: Ayarlar → "Manage favorites" → cache'li ajanslar + mevcut favoriler toplu yıldız toggle'ı (Wear ManageFavoritesScreen / watchOS ManageFavoritesView). |

> **Dalga 9 notu:** "canlı geri sayım tile/complication/widget" zaten temel uygulamada canlıydı (Wear dynamic expressions / watchOS `Text(timerInterval:)`) — yeniden yapılmadı.
> **Dalga 10 notu:** "menü"den (b)+(c) yapıldı. **(a) tam canlı PAD WX complication ERTELENDİ** — naif hali complication içinde ağ uyandırır (projenin pil felsefesine aykırı). Yapılırsa: havayı 30 dk'lık senkrona bindir + T-24 saat kapısı → cache'ten oku (GO ODDS ile aynı "hafif" desen), complication içinde fetch YOK.

**Kod hazır, iki platform temiz build, geçici test kodu yok.**
**Dalga 9 doğrulama:** watchOS sim'de About + favori butonu (☆ FOLLOW · SpX) görsel onaylı; iki platform `BUILD SUCCESSFUL`.

---

## 3. YAYIN DURUMU (en kritik bölüm) — 2026-07-27 güncel

### 🟢 PLAY (WEAR) — CANLIDA / YAYINDA (2026-07-27)
**vc5 / 1.1.0 ONAYLANDI ve Google Play'de YAYINDA.** İlk mağaza fırlatması tamam. 10 dalganın tamamı + tüm compliance düzeltmeleri canlı. (Aşağısı bu noktaya nasıl gelindiğinin geçmişi.)

### App Store (watchOS) — WAITING FOR REVIEW
1.0 build 3 (güvenilir widget fallback'i + alarm/URL güvenliği + sürüm eşleme düzeltmeleri)
31 Temmuz'da yüklendi ve yeniden incelemeye gönderildi.

---

**Play (Wear) — ÖNCEKİ vc2 REDDEDİLDİ (25 Tem):** 3 gerekçe → (1) scrollbar eksik, (2) branded splash ikonu eksik, (3) **Wear mağaza görüntüleri** dekorlu/pazarlama metinli (politika ihlali). "Bekle sonra güncelle" planı ARTIK GEÇERSİZ (onay değil, RED geldi).

**Bu oturumda yapıldı — vc5 TASLAK olarak hazırlandı (henüz incelemeye GÖNDERİLMEDİ):**
- **vc5 / 1.1.0** imzalı AAB `wear:production` track'ine yüklendi (tam rollout, taslak). Dalga 1-10 + tüm compliance düzeltmeleri içinde.
- **en-US Wear görselleri** 6 adet **ham app-UI** ile değiştirildi (liste/detay/FOLLOW/ISS/About/ManageFav — çerçevesiz, metinsiz). Emülatör `SpaceCat_Shots` (454×454) ile çekildi.
- **Tiles SDK uyarısı düzeltildi:** vc4 yüklenince Play `androidx.wear.tiles:1.4.1`'in API35 hedefinde Wear5 SecurityException riskini bildirdi → **tiles 1.5.0 + protolayout 1.3.0**'a çıkıldı, vc5 derlendi. Emülatörde çalışma-zamanı sağlık kontrolü OK.
- Commit `?changesNotSentForReview=true` ile yapıldı → **hiçbir şey incelemeye gitmedi.**

> **KRİTİK KEŞİF:** Handover'ın "vc3 incelemede" bilgisi YANLIŞMIŞ. API incelemesi: önceki vc3 yanlışlıkla standart `production` track'ine (taslak) yüklenmiş; Wear'ın gerçek üretim track'i `wear:production` hâlâ **reddedilen vc2'yi** tam-rollout için bekletiyordu. vc5 doğru track'e (`wear:production`) kondu. `production`'daki stray vc3 taslağı zararsız (taslak gönderilmez), bırakıldı.

### SIRADAKI TEK ADIM (kullanıcı yapar)
Play Console → Yayın özeti → **"18 değişikliği incelemeye gönder"**. (API otomatik review'a izin vermiyor — `changesNotSentForReview` zorunlu; son gönderim Console'dan elle.)

- **App Store (watchOS):** 2026-07-31 **YENİLENDİ.** Build 2 inceleme kuyruğundan
  kontrollü biçimde çekildi; **build 3 / 1.0** yüklendi, Apple işleminden `VALID` geçti,
  sürüme bağlandı ve güncel Review Submissions API ile yeniden gönderildi →
  **WAITING_FOR_REVIEW**. Kaynak, watch app ve widget `1.0.0 (3)`; arşiv
  `watchos/build/SpaceCat-v3.xcarchive`. Tekrarlanabilir operasyon aracı:
  `tools/app_store_replace_build.mjs`.

### Play API reçetesi (bu oturum scratchpad'i)
`play_api.py` (token+REST+retry), `play_submit.py` (AAB+track+görsel+commit), `play_bump.py` (sadece AAB+track). SA: `~/Downloads/quotecatcher-501208-922fab8ecf45.json`. **Not:** `:validate` endpoint'i `changesNotSentForReview`'i kabul etmeyip 400 verir → validate'i ATLA, doğrudan commit et. Ağ TLS'i aralıklı reset atıyor → retry şart.

---

## 4. Mimari (özet)

Kaynaklar (hepsi ücretsiz, anahtarsız) → Repository/Store (kaynak başına) → DTO→domain model→**cache** → UI.

**Fetch stratejisi (kilit nokta — "saat kaldırır mı?" cevabı):**
- Fırlatma + Haber + Olay: açılışta + **30 dk** arka plan senkronu (WorkManager / WKApplicationRefreshBackgroundTask), DataStore/UserDefaults cache.
- Hava + Görsel: **tembel**, sadece o detay açılınca (hava 30 dk bellek cache).
- ISS: sadece ISS ekranı açıkken 5 sn'de bir.
- Webcast + Takvim: **fetch yok** — URL üretip telefona devreder.
- Geri sayım tik'i **sistem** çiziyor (Wear dynamic expressions / watchOS `Text(timerInterval:)`), uygulama uyanmıyor.

**Standalone:** her iki app telefon olmadan çalışır. **Companion telefon uygulaması YOK.** "Telefonda aç"
işleri telefonun kendi tarayıcı/takvimini kullanır (Wear `RemoteActivityHelper`, watchOS Handoff).

**Ayna eşleştirme:** `LaunchRepository↔LaunchStore`, `EventRepository↔EventStore`, `WeatherRepository↔WeatherService`, `IssRepository↔IssStore`, `PhoneLauncher↔Handoff`, `CalendarLink` (iki tarafta).

---

## 5. Veri kaynakları

| Kaynak | Ne | Not |
|---|---|---|
| LL2 `thespacedevs` | fırlatma + olay | DEBUG `lldev.thespacedevs.com` (bol istek, bayat veri), prod `ll.thespacedevs.com` (~15 istek/saat). `mode=detailed` (vidURLs/webcast_live/image/logo bu modda) |
| SNAPI `spaceflightnewsapi.net/v4` | haber (WIRE) | ücretsiz |
| Open-Meteo `api.open-meteo.com` | pad havası | anahtarsız |
| wheretheiss.at `api.wheretheiss.at` | ISS konumu | anahtarsız (yedek: open-notify) |

**Görsel tuzağı:** LL2 `thumbnail_url` **kare kırpım** verir. Görev görseli (kare) → thumbnail iyi.
Ajans logosu (geniş wordmark, örn. SpaceX 9.5:1) → thumbnail bozuk dilim, **image_url kullan**.

---

## 6. Build & doğrulama

### Ortam
- Mac: Android Studio, JDK 17 (`JAVA_HOME=$(/usr/libexec/java_home -v 17)`), Gradle 8.14.3 / AGP 8.9.2 / Kotlin 2.1.20. Xcode 26.6, watchOS 26.5 sim.
- **Android emülatör (emulator-5554) genelde Codex tarafından kullanılıyor — DOKUNMA.**
- Kullanıcının telefonu (Galaxy S24 Ultra, `R5CX239Z7HT`) ara ara USB'de; Wear app adb ile kurulup çalışır ama ekran kilitlenip siyah dönebiliyor.
- Galaxy Watch7 kablosuz adb (`adb-RFAY70R130R-...`) düşüp kalkıyor.

### Wear
```bash
cd "/Users/vahap/Documents/SPACE CAT"
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
./gradlew :wear:assembleDebug          # veya bundleRelease (imzalı AAB)
```
Release imza: `keystore/spacecat-release.jks` + `keystore.properties` (İKİSİ DE GİT DIŞI, kullanıcıda yedek).

### watchOS
```bash
cd "/Users/vahap/Documents/SPACE CAT/watchos"
xcodegen generate                       # yeni .swift dosyası ekleyince ŞART
xcodebuild -project SpaceCatWatch.xcodeproj -scheme SpaceCatWatch \
  -destination 'id=<WATCH_SIM_UDID>' -configuration Debug build
```
**Görsel doğrulama (MCP paneli `sudo xcode-select` istiyor, kullanıcı bunu/computer-use'u reddetti → CLI kullan):**
```bash
xcrun simctl install <UDID> <APP>
SIMCTL_CHILD_SHOT_SCREEN=<detail|list|event|iss|settings|wire> \
  xcrun simctl launch <UDID> com.spacecat.terminal.watchkitapp
xcrun simctl io <UDID> screenshot out.png
```
- `SHOT_SCREEN` env → ContentView belirli ekrana atlar (izin diyaloğunu da atlar; requestAuthorization SHOT_SCREEN'de gate'li).
- Booted temiz sim: **Apple Watch Ultra 3** `78796FDD-6568-4581-96E1-96728B5AB1CD` (FWF Watch 46mm'de izin diyaloğu sticky kaldı).
- SHOT modunda **cache doluysa refresh çalışmaz** → görsel test için önce `simctl uninstall`.
- Katlanmanın altındaki panelleri (STATS/PAD WX/takvim/ajans) görmek için geçici olarak en üste taşı, screenshot, GERİ AL (simctl'de scroll yok).
- Görsel ~15 sn'de yüklenebiliyor; screenshot'u geç al.

### Play yükleme (API) — vc4 için
- Script: bu oturum scratchpad'inde `play_upload_vc3.py` + `play_inspect.py` (eski `play_api.py`'nin `get_token`/`api` yardımcılarını import eder). Service account: `~/Downloads/quotecatcher-501208-922fab8ecf45.json`.
- **ÖNEMLİ:** commit `?changesNotSentForReview=true` ŞART (yoksa 400). Bu param taslağı kaydeder, incelemeye GÖNDERMEZ — kullanıcı Console'dan "Send for review" yapar.
- vc4 için: build.gradle'da versionCode 3→4, versionName; bundleRelease; script'te AAB yolu + release notes güncelle.

---

## 6.5 Web sitesi (2026-07-30)

`web/index.html` — tek dosyalık DOS-terminal tanıtım sitesi (+`launch.mp3` sfx, `web/README.md` yayın notları).
Canlı LL2 verisi (sıradaki görev + gerçek geri sayım, 20 dk cache), yazılabilir komut satırı
(`help/next/iss/wire/felicette…`), `sudo launch` = 30 sn ASCII fırlatma sineması (gerçek görev verisiyle),
`track` = ekranı GERÇEK T-0'a kilitleyen canlı senkron modu (5 dk'da bir LL2 tazeleme, erteleme→retarget).
Yerel test: `cd web && python3 -m http.server 8787`.
**🟢 YAYINDA (2026-07-30):** Cloudflare Pages projesi `spacecat` → https://spacecat.pages.dev CANLI.
**Domain SATIN ALINDI: `spacecat.watch`** ($34.20/yıl, Cloudflare Registrar, auto-renew açık) — apex + www
custom domain olarak Pages'e bağlandı, CNAME'ler zone'da hazır (proxied); TLD delegasyon yayılımı bekleniyor.
**Deploy reçetesi (API):** `CLOUDFLARE_API_TOKEN=$(cat keystore/cloudflare_pages_token.txt) npx wrangler pages deploy web --project-name spacecat --commit-dirty=true`
(token: sadece Pages:Edit yetkili `spacecat-pages-deploy`; hesap ID `keystore/cloudflare_account_id.txt`).
**İşlev dalgası 2 (2026-07-30, yayında):** `iss` = ASCII dünya haritasında canlı ISS takibi (5 sn refresh, iz bırakır),
`wx [n]` = pad havası (Open-Meteo) + GO odds, `mission [n]` = tam görev dosyası (orbit/window/brief),
`events` = LL2 olayları (30 dk cache `sc_ev`), `remind [n]` = GCal linki + .ics indirme,
deep link'ler `#launch/#track/#iss` (boot sonrası otomatik komut), TAB tamamlama + `history`,
easter egg'ler (`ping felicette`, `uname`, `meow`, `rm`, `sl`, `exit`). LL2 cache anahtarı `sc_ll2_v2` (alan eklendi).
Viral hazırlık TAMAM: `og.png` sosyal kartı (1200×630, headless Chrome ile üretildi), twitter/og meta'ları,
gerçek favicon (`icon.svg`), `share` komutu (X/Reddit/Show HN linkleri). **Domain kararı: `spacecat.watch`**
(2026-07-30 RDAP: müsait; spacecat.space/.dev/.app dolu). Kullanıcı Cloudflare Registrar'dan alacak;
meta'lar ve `SITE` sabiti şimdiden bu domain'e ayarlı.

## 7. Sıradaki adımlar / açık işler

- [ ] **watchOS 1.0 build 3 onayını bekle.** Yeni binary yükleme/inceleme değişikliği yapma.
- [ ] **Sonraki sürüm — Dalga 11 ASCII Liftoff Sequence:** Wear/watchOS'ta T-0 ile eşlenen,
  uygulama içine gömülü ASCII fırlatma animasyonu. HOLD/TBD/scrub durumunda ateşleme yok;
  telemetri olmayan aşamalar `MODELED FLIGHT · NOT TELEMETRY`; ambient mod statik, yeni API
  ve aylık maliyet yok. Ayrıntılı kapılar `docs/ROADMAP.md` içinde.
- [x] ~~Dalga 9~~ TAMAM (favori filtresi + About/Félicette + GO ODDS glanceable, iki platform).
- [x] ~~Dalga 10 (b)+(c)~~ TAMAM (bildirim süzme + favori yönetim ekranı, iki platform).
- [ ] **Dalga 10 (a) ERTELENDİ:** tam canlı PAD WX complication — yapılırsa cache'li piggyback + T-24 kapısı ile (§2 notu). Pil için complication içinde fetch yok.
- [ ] İstenirse **Dalga 11+**: tile'a favori kısayolu, favori ajansa özel bildirim sesi/ikonu, çoklu-fırlatma tile karüzeli.
- [ ] (opsiyonel) Proje hafızasını `/consolidate-memory` ile sadeleştir (çok şişti).
- [ ] watchOS App Store yükleme reçetesi (Xcode 26 container bug'ı) hafızada detaylı — yeni build gönderirken oraya bak.

## 8. Tekrarlayan tuzaklar (kısa)
- Wear'da state'i **destinasyon composable'ının içinde** topla (`rememberUpcomingLaunches` deseni).
- `install -r` sonrası eski process ayakta kalıp bayat gösterebilir → `am force-stop` / önce uninstall.
- xcodegen: yeni Swift dosyası ekleyince `xcodegen generate` çalıştır.
- watchOS `.task`'i mainList yerine **dış body**'de tut (branch değişince iptal olmasın).
- Telefonda Wear ScalingLazyColumn çok büyük render olup scroll güvenilmez — görsel doğrulama için watchOS sim tercih et.

## 9. Web Faz 12 handover — NASA/JPL CNEOS — CODEX — 31 Temmuz 2026

Canlı komutlar: `fireball`, `approach`, `man cneos`, `cat /dev/cneos`.

Worker endpoint'leri:

- `GET|HEAD /api/cneos/fireballs?schema=1`
- `GET|HEAD /api/cneos/approaches?schema=1`

Adapter kaynakları yalnız `web/_worker.js` içindedir; tarayıcı bundle'ında JPL origin'i
yoktur. Query kapsamı server-side sabittir; açık proxy oluşturulmamıştır. 6 saat tazelik
sonrası upstream yenilemesi denenir, hata halinde edge'deki son sağlam yanıt `STALE` olarak
döner. Cache kaydı 7 gün yaşar. İstemci anahtarları `sc_cneos_fireball_v1` ve
`sc_cneos_approach_v1`dir.

Test:

```bash
node tools/test_web_cneos.js
for test_file in tools/test_web_*.js; do node "$test_file" || exit 1; done
npx wrangler pages functions build --build-output-directory web --outdir /tmp/spacecat-pages-build
```

Son doğrulama: 311 web kontrolü, canlı `MISS → HIT`, 12 fireball + 20 approach kaydı.
Production deployment: `f9a46496-d7cf-467c-a4cc-6eee5741dc78` /
`https://spacecat.watch`.

Sonraki faza geçerken ortak adapter/cache sözleşmesini bozma; ana hero'ya kart ekleme ve
serbest kullanıcı sorgusunu upstream proxy'leme. Faz 13 planı `docs/ROADMAP.md` içindedir.

## 10. Web Faz 13 handover — Daily Exoplanet — CODEX — 31 Temmuz 2026

Canlı keşif:

```text
ls /dev
cat /dev/exoplanet
world
cat /dev/exoplanet
```

`world` ve `exoplanet` bilerek `help` içinde yoktur. Endpoint:
`GET|HEAD /api/exoplanets/daily?schema=1`.

Worker güncel NASA Exoplanet Archive TAP `PSCompPars` tablosundan server-side sabit
`top 256` sorgusu yapar. Sonuçları normalize edip ada göre sıralar; UTC tarih hash'i tek
dünyayı seçer. Tarayıcı arşiv origin'ini veya TAP sorgusunu görmez. Cache tazeliği saat
değil `selectionDate === UTC today` ile belirlenir; gün değişince yenilenir, hata halinde
önceki edge snapshot `STALE` kalır. Cihaz anahtarı `sc_exoplanet_daily_v1`.

Test:

```bash
node tools/test_web_exoplanet.js
for test_file in tools/test_web_*.js; do node "$test_file" || exit 1; done
```

Son doğrulama: **345** web kontrolü; `Kepler-418 b`; canlı `MISS → HIT`; `POST 405`.
Production: `db4bf006-841d-4e1e-b23c-229ec77e006a` / `https://spacecat.watch`.

Faz 14 bu kuralla tamamlandı: yalnız küratürlü hedef allowlist'i kullanılır; serbest
komut metni TAP/Horizons sorgusuna çevrilmez.

## 11. Web Faz 14 handover — JPL Horizons — CODEX — 31 Temmuz 2026

Canlı keşif:

```text
tree /observatory
cat /observatory/README.TXT
cat /observatory/targets.list
where mars
cat /observatory/last.vector
```

Endpoint: `GET|HEAD /api/horizons/observer?schema=1&target=mars`.

Server-side `HORIZONS_TARGETS` allowlist'i dışındaki değerler `400` döner. Horizons
observer sorgusu `CENTER='500@399'`, `TIME_TYPE='UT'`, `ANG_FORMAT='DEG'`,
`CSV_FORMAT='YES'`, `QUANTITIES='2,9,10,20,23,24,29'` kullanır. `TLIST`, Worker'ın
mevcut UTC saatine yuvarlanır. Çıktı parse edilirken `$$SOE/$$EOE` sınırı ve zorunlu
RA/DEC/range alanları doğrulanır.

Cache key hedef başınadır; 6 saat taze, 7 gün edge last-known-good. Cihaz anahtarları
`sc_horizons_v1_<target>`. İstemci JPL origin'ini veya serbest sorgu parametrelerini görmez.

Test:

```bash
node tools/test_web_horizons.js
for test_file in tools/test_web_*.js; do node "$test_file" || exit 1; done
```

Son doğrulama: **386** web kontrolü; Mars `MISS → HIT`; unknown target `400`; POST `405`.
Production: `915864a2-0e78-44dd-b768-2771a4518685` / `https://spacecat.watch`.

Faz 15 bu kuralla tamamlandı: public API şartları doğrulandı ve kullanıcı başına filtresiz
upstream çağrı yapılmıyor.

## 12. Web Faz 15 handover — SatNOGS Radio Catalog — CODEX — 31 Temmuz 2026

Canlı keşif:

```text
tree /observatory/radio
cat /observatory/radio/README.TXT
cat /observatory/radio/catalog.list
beacon iss
cat /observatory/radio/last.signal
```

Endpoint: `GET|HEAD /api/satnogs/catalog?schema=1&target=iss`.

Server-side `SATNOGS_TARGETS` dışı değerler `400`. Upstream her zaman
`satellite__norad_cat_id=<id>&alive=true&status=active`; filtresiz transmitter endpoint'i
çağrılmaz. Normalizer ayrıca `unconfirmed` ve `frequency_violation` kayıtlarını reddeder,
downlink zorunlu tutar, tekrarları atar ve ilk 12 kaydı döndürür.

Cache hedef başına 24 saat taze, 7 gün edge last-known-good. Cihaz anahtarları
`sc_satnogs_v1_<target>`. Veri lisansı/atfı public payload'dan çıkarılmamalıdır:
SatNOGS DB / Libre Space Foundation contributors, CC BY-SA 4.0.

Test:

```bash
node tools/test_web_satnogs.js
for test_file in tools/test_web_*.js; do node "$test_file" || exit 1; done
```

Son doğrulama: **424** web kontrolü; ISS 12 kayıt; `MISS → HIT`; `all` target `400`;
POST `405`. Production: `4ecc9ca8-53ab-4a15-beb4-796dfb4f60e7` /
`https://spacecat.watch`.

Faz 16'ya geçişte GraceDB/CelesTrak kullanım sınırları yeniden doğrulandı. “Candidate”
olaylar doğrulanmış keşif gibi sunulmadı; CelesTrak yalnız uzun edge cache ve tek nesnelik
allowlist ile açıldı. Güncel sözleşme aşağıdadır.

## 13. Web Faz 16 handover — Rare Signal Watch — CODEX — 1 Ağustos 2026

Canlı keşif:

```text
tree /observatory
cat /observatory/gravity/README.TXT
gravity
cat /observatory/gravity/candidate.log
cat /observatory/orbits/targets.list
orbit iss
cat /observatory/orbits/last.element
```

Endpoint'ler:

```text
GET|HEAD /api/gracedb/public?schema=1
GET|HEAD /api/celestrak/elements?schema=1&target=iss
```

GraceDB adapteri `query=public&count=8` dışında sorgu kabul etmez. Superevent kimliği
regex ile doğrulanmadan dış kayıt URL'si üretilemez. Category `Production` zorunludur;
FAR sayısal Hz olarak korunur. İstemcide adaylık uyarısını ve evolving-status bağlantısını
kaldırma.

CelesTrak adapterinde `CELESTRAK_TARGETS` tek yetki kaynağıdır. Upstream her zaman
`gp.php?CATNR=<server id>&FORMAT=JSON` olur. JSON array uzunluğu tam 1, NORAD eşleşmesi,
UTC epoch, positive mean motion, eccentricity ve inclination zorunludur. `GROUP`, `NAME`,
`INTDES`, `SPECIAL`, redirect takibi ve otomatik retry ekleme. Worker runtime'ında
`redirect: manual` zorunludur; `error` desteklenmez ve kullanılmamalıdır.

Cache: GraceDB 1 saat; CelesTrak 12 saat ve `cf.cacheTtl=43200`; cihaz anahtarları sırasıyla
`sc_gracedb_public_v1` ve `sc_celestrak_v1_<target>`. Her ikisinde 7 gün last-known-good.
CelesTrak kullanım politikası değişirse yayın öncesi tekrar doğrulanmalı.

Test:

```bash
node tools/test_web_rare_signal.js
for test_file in tools/test_web_*.js; do node "$test_file" || exit 1; done
```

Son doğrulama: **482** web kontrolü; Worker derlemesi başarılı. GraceDB `HTTP 200 / HIT /
8 kayıt`; CelesTrak ISS `MISS → HIT / HTTP 200`; bulk target `400`; GraceDB POST `405`.
Production: `ae23d1b1-5336-4e6d-916e-f5e564b70626` / `https://spacecat.watch`.
