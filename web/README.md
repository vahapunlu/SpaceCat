# SPACE CAT — Web Sitesi (DOS terminal)

Statik arayüz: `index.html` + `launch.mp3` (sfx) + `og.png` (sosyal kart) +
`icon.svg`/`icon-512.png` (favicon). `web/_worker.js`, güvenlik başlıkları, rota
metadatası, RocketLaunch.Live crosscheck/standby kasası ve NASA/JPL CNEOS edge
adapterleri için kullanılır.
Build ve framework yok.

**Domain:** `spacecat.watch` (Cloudflare Registrar; canlı).
Meta etiketleri, canonical URL ve `share` komutu bu domain'e göre ayarlı.
OG kartın kaynağı scratchpad'te üretildi; yeniden üretmek için: 1200×630 HTML → headless Chrome `--screenshot`.

## Özellikler
- CRT/DOS terminal estetiği (scanline, fosfor yeşili, yazılabilir komut satırı)
- **Canlı veri:** Launch Library 2 v2.3 primary kaynaktır (30 dk tarayıcı cache; canlı
  takipte 10 dk yeniden kontrol). Premium RocketLaunch.Live aynı görevin T-0'ını
  crosscheck eder; LL2 kesilirse `/api/launches/upcoming?schema=2` üzerinden standby olur.
  Premium yanıt 5 dakika edge cache'de tutulur.
- `crosscheck [n]` — LL2 ve RocketLaunch.Live T-0 saatini açıkça karşılaştırır; iki
  dakikaya kadar `SOURCE LOCK`, daha büyük farkta `SCHEDULE DIVERGENCE` verir.
- `stream [n]` — iki kaynaktaki güvenli YouTube/X/Bilibili webcast sinyalini birleştirir.
  Embed veya autoplay yoktur; resmî yayın yalnız kullanıcı tıklamasıyla açılır.
- **Uzay hava durumu:** NOAA SWPC'nin anahtarsız planetary K-index verisi (`solar`; 15 dk tarayıcı cache ve son iyi veri fallback'i)
- **NASA/JPL CNEOS:** `fireball` son atmosferik olayları koordinat işaretli, mobil-uyumlu
  bir ASCII dünya gridinde ve eşleşen arşiv satırlarında gösterir; raporlanan hava patlaması
  konumu hiçbir zaman doğrulanmış yer çarpması diye sunulmaz. `approach` önümüzdeki 60 gün
  içinde 20 Ay mesafesine kadar yakın geçişleri gösterir. Tarayıcı yalnız same-origin
  Worker endpoint'lerine gider; 6 saatlik edge tazeliği ve 7 günlük cihaz/edge
  last-known-good katmanı vardır. `/dev/cneos` ve `man cneos` keşif yüzeyleridir.
- **Daily Exoplanet Signal:** Help'e yazılmayan `world`/`exoplanet` komutu NASA Exoplanet
  Archive `PSCompPars` verisinden UTC günü için deterministik tek bir doğrulanmış dünya
  seçer. Keşif izi `/dev/exoplanet`; veri günde bir kez edge'de yenilenir ve kesintide son
  sağlam dünya açıkça `LAST KNOWN WORLD` olarak kalır. ASCII render semboliktir.
- **Cosmic Imaging Array:** `earth`, NASA DSCOVR EPIC'in son tam-Dünya gözlemlerinden dört
  kareyi aynı-origin Worker kasası üzerinden alıp cihazda ASCII'ye çevirir. Kareler canlı
  video diye sunulmaz; reduced-motion tek karede kalır ve 320 px mobil kapıdan geçer.
  `apod`, NASA Astronomy Picture of the Day kaydını günlük edge/device cache ile açar,
  görsel/video önizlemesini ASCII'ye çevirir ve kaynak telif/kredi satırını korur.
- **Local Nightwatch:** `nightwatch`, kullanıcının açık izniyle Ay fazı, yaklaşık ISS geçişi,
  JPL Mars ufuk dönüşümü, NOAA OVATION aurora grid değeri ve Open-Meteo gözlem koşullarını
  tek terminal brifinginde birleştirir. SPACE CAT konumu saklamaz; yalnız hava sorgusu için
  koordinat 0.25° gride yuvarlanarak Open-Meteo'ya gönderilir ve bu işlem önceden açıklanır.
- **Light-Time Lab:** `transmit mars "HELLO"`, mevcut JPL Horizons mesafesinden gerçek ışık
  gidiş-dönüş süresini hesaplar; paket ve gecikmiş ACK yalnız cihazda tutulur. Ağ üzerinden
  gezegene/uzay aracına mesaj gitmez ve bütün ACK'ler görünür biçimde `SIMULATED` etiketlidir.
  `lighttime` veya `/observatory/lighttime/queue.log` kuyruğu okur.
- **Pulsar Receiver:** `pulsar crab|vela|b1919|j0437`, statik katalog periyodu anlık yerel
  WebAudio darbe trenine ve ASCII waterfall'a dönüştürür. Canlı radyo alımı iddia etmez,
  autoplay yapmaz, reduced-motion ve Experience Kernel cleanup sözleşmesini izler.
- **JPL Horizons Observatory:** `/observatory` içindeki dosyalardan keşfedilen `where`
  komutu dokuz allowlist hedefi için Dünya-merkezli apparent RA/DEC, parlaklık, aydınlanma,
  mesafe/hız, uzanım, faz ve takımyıldız vektörü üretir. Kullanıcı konumu alınmaz; sonuç
  yerel azimut/yükseklik değildir. Hedef başına 6 saat edge/device cache ve 7 gün
  last-known-good vardır; serbest Horizons proxy'si açılmaz.
- **SatNOGS Radio Catalog:** `/observatory/radio` içinden keşfedilen `beacon`/`satellite`
  komutları ISS, AO-7, SO-50, NOAA-18/19, QO-100 ve Meteor-M 2-3 için doğrulanmış aktif
  transmitter kayıtlarını gösterir. Bu bir canlı alıcı değildir. Hedef başına 24 saat
  cache kullanılır; filtresiz çok megabaytlık katalog çağrısı ve serbest proxy yoktur.
  Veri atfı: SatNOGS DB contributors, CC BY-SA 4.0.
- **Hidden Side B:** `/observatory/radio/README.TXT` içindeki küçük ipucunu izleyip
  `ls -a` kullanan ziyaretçi `.side-b` dosyasına ulaşır. `cat .side-b`, The Beatles'ın
  “Across the Universe” parçasını Spotify'da açan kullanıcı-tetiklemeli bağlantıyı gösterir;
  embed, autoplay, yerel medya kopyası veya yeni API yoktur.
- `sudo launch [n]` — 30 saniyelik ASCII fırlatma sineması (gerçek görev verisi, altı araç
  siluet sınıfı, UTC/koordinat tabanlı pad ışığı, cache'li güncel hava; ses: `launch.mp3`).
  Bitiş kartı açıkça terminal simülasyonu olduğunu söyler.
- `track [n]` — **CANLI SENKRON**: ekran gerçek T-0'a kilitlenir; yalnız LL2 GO/in-flight
  durumunda sembolik uçuş profili başlar. HOLD/TBD/SCRUB aracın pad'den ayrılmasını engeller.
  T-0 ve görev durumu `SOURCE`, görev timeline olayları `PLANNED`, yol/yükseklik/hız ise
  `MODEL` olarak görünür biçimde ayrılır.
  LL2 10 dk'da bir tazelenir; retarget yeni T-0'a kilitlenir. Başarı/başarısızlık yalnız LL2
  sonucu teyit ederse gösterilir. RocketLaunch.Live standby görevleri `TBC` kalır; gerçek
  saat ve programı korur fakat roketi otomatik olarak pad'den kaldırmaz.
- `focus [n]` — aynı `track` motorunu API/polling çoğaltmadan tam viewport Mission Focus
  kabuğunda açar. Büyük gerçek T-0, ASCII sahne, kaynak durumu ve doğruluk şeridi dışında
  terminali susturur; ESC veya 48 px `[EXIT]` ile temiz kapanır. Native fullscreen yalnız
  desteklenen tarayıcıda açık kullanıcı dokunuşuyla sunulur. Inline `track` de artık sahne
  açıldığında otomatik olarak viewport üstüne hizalanır.
- `signal` — UTC gününe göre deterministik derin uzay mesajı; sunucu ve editoryal bakım gerektirmez
- Gerçek sanal dosya sistemi: `pwd`, `cd`, `ls -a`, `tree`, `cat`, `grep`, `strings`, `xxd`, `man`
- Sentinel shell: standart Unix keşif/yetki/ağ komutlarına gerçekçi fakat tamamen simüle
  yanıtlar verir. Olaylar yalnız cihazda, en fazla 40 kayıtla `/var/log/auth.log` ve
  `/proc/security` altında yaşar; gerçek shell, soket, tarama veya dosya mutasyonu yoktur.
  Bu komutlar `help` ve TAB tamamlama listesinden bilerek çıkarılmıştır.
- Deep Space Relay Lab: `/observatory/relay`, sekiz allowlist uzay aracı için NASA/JPL
  Horizons kamu ephemerisini read-only sunar. Ephemeris telemetri olarak etiketlenmez;
  gerçek araçlarda kontrol yetkisi yoktur. Yalnız hayalî `SC-FELICETTE-1`, son 20 paketle
  sınırlı cihaz-yerel eğitim kuyruğuna yazılabilir; gecikme modeli mevcut Earth–Mars
  menzilini kullanır. RF, kontrol veya telemetry endpoint’i bulunmaz.
- Açık mühendislik kütüphanesi: kökte görünen `/library`, on resmi NASA/NTRS PDF kaydını
  `engineering/{launch-vehicles,propulsion,guidance-navigation-control,structures-materials}`
  raflarında sunar. Klasör ve dosya yolları merkezi kataloğun `collection/shelf/name`
  alanlarından otomatik üretilir. PDF'ler
  yeniden barındırılmaz; `cat <document.pdf>` doğrulanmış resmi NASA bağlantısını açar.
- Canlı mount'lar: `/missions`, `/proc/orbit`, `/var/log`; cihaz-yerel Black Box: `/home/visitor/flight-records`
- Gizli keşif katmanı: `/classified`, `/dev/deepspace`, binary decoder ve izinli `black-box.seal`
- Koşullu anomali mount'ları: gerçek T-0, NOAA Kp, Ay fazı, UTC yıldönümü ve deterministik carrier günlerine göre `/classified` altında belirip kaybolur (`scan`)
- Experience Kernel: baskın animasyon, ses, timer ve ESC temizliğini merkezî yönetir;
  canlı durum `cat /proc/experience` ile görülebilir
- Mobile Release Gate: safe-area uyumu, 320–430 px portrait + kısa landscape matrisi,
  44 px dokunma hedefleri ve dominant sahnelerde gerçek `ESC / TAP` çıkışı
- Persistent Command Deck: normal terminalde gerçek prompt + ipucu viewport altına sabit;
  dominant sahnelerde aynı yüzey salt-okunur kanal durumu + `ESC / EXIT` çıkışı olur.
  Dinamik içerik rezervi, `visualViewport` klavye ofseti ve safe-area desteği sayesinde
  komut satırı mobilde tarayıcı/klavye arkasında kalmaz.
- Kontrollü yerelleştirme: `/` İngilizce + `x-default`, `/tr` Türkçe, `/es` İspanyolca,
  `/fr` Fransızca, `/ja` Japonca, `/de` Almanca
  açıklama katmanıdır. Komutlar, prompt, dosya sistemi, mission-control etiketleri ve ASCII
  evreni İngilizce kalır; yalnız crawlable ürün metni, `help` açıklamaları, operatör
  yönlendirmesi ve uygulama bilgileri çevrilir. `lang en|tr|es|fr|ja|de` ile görünür `LANG`
  bağlantıları canonical rotaları değiştirir.
- Responsive terminal yardımı: `help` boşluk dolgulu düz metin yerine semantik satırlardır;
  masaüstünde komut/açıklama iki sütun, 600 px ve altında komut üstte ve `└─` açıklama
  altta görünür. Kısa komut grupları terminal token satırı olarak doğal biçimde sarılır.
- Search & Discovery Gate: JavaScript öncesi crawlable terminal içeriği, route-specific
  metadata + görünür metin, JSON-LD entity graphı, sitemap otomasyonu ve IndexNow
- Gizli legacy bakım katmanı: `/var/log/.maintenance` izinden keşfedilen DOS araçları ve
  tamamen yerel `tracert`/`nmap`/non-destructive `format` reaksiyonları
- Gizli Booster Lander: `/usr/games` dosya izinden keşfedilen; açık `PAD01`, yaklaşma
  koridoru, guidance, motor alevi/dumanı, S–F debrief, deterministik ASCII fizik,
  klavye + press-and-hold touch kontrolü, `SC GAME SYSTEM` intro/GAME OVER kabini ve
  yalnız cihazda tutulan `sc_lander_v2` skoru
- Gizli Orbital Rendezvous: aynı `/usr/games` izindeki `DOCKING.COM` ile açılan bağımsız
  `/games/docking` ekranı; Hold Point 25/12, Fine RCS finali, üç kamera/profil, S–F debrief
  ortak `SC GAME SYSTEM` intro/GAME OVER kabini ve varsayılan açık görünen, ilk Begin
  Approach jestiyle başlayan 11 yerel SC Station anonsu. İsteyen uçuş öncesinde kapatabilir;
  ağ/API, hesap ve global skor yoktur.
- Autonomous Watchstander: mevcut LL2 primary mission, yerel saat ve varsa taze NOAA
  cache'inden prompt altı koşullu direktif ile `/proc/watch` üretir; yeni istek veya timer yok
- Sosyal relay: `/home/visitor/social.links` ile `social`, `x`, `instagram` komutları (`@spacecatwatch`)
- `next`, `iss`, `wire`, `felicette`, `help` … komutları
- Doğrudan terminal girişleri: `/live`, `/launch`, `/iss`, `/solar`, `/felicette` (aynı DOS kabuğu; rota-özel SEO/paylaşım metadatası)

## Yayınlama

### Cloudflare Pages (önerilen, ücretsiz)
1. dash.cloudflare.com → Workers & Pages → Create → **Pages** → "Upload assets"
2. `web/` klasörünü sürükle-bırak → deploy. (Ya da repo bağla; build command boş, output dir `web`.)
3. İstersen custom domain bağla (ör. spacecat.app).

Premium standby secret'ı ilk kurulumda:

```bash
CLOUDFLARE_API_TOKEN=$(cat keystore/cloudflare_pages_token.txt) \
CLOUDFLARE_ACCOUNT_ID=$(cat keystore/cloudflare_account_id.txt) \
npx wrangler pages secret put ROCKETLAUNCH_API_KEY \
  --project-name spacecat < keystore/rocketlaunch_live_api_key.txt
```

Deploy:

```bash
CLOUDFLARE_API_TOKEN=$(cat keystore/cloudflare_pages_token.txt) \
CLOUDFLARE_ACCOUNT_ID=$(cat keystore/cloudflare_account_id.txt) \
npx wrangler pages deploy web --project-name spacecat --commit-dirty=true
```

Anahtar yalnız Cloudflare secret binding'inde bulunur. Tarayıcı aynı-origin endpoint'ten
en fazla beş normalize edilmiş görev alır; upstream yanıtı ve anahtar istemciye çıkmaz.
`web/_worker.js` ayrıca `www`/`pages.dev` canonical yönlendirmelerini ve güvenlik
başlıklarını sağlar. Dağıtım Wrangler ile yapılmalıdır.

### Railway
Statik dosya sunucusu gerekir (ör. `npx serve web`) — statik site için Cloudflare Pages daha basit ve ücretsiz.

## Yerel test
```bash
npx wrangler pages dev web --compatibility-date=2026-07-29
```

Kalıcı regresyon kontrolleri:

```bash
node tools/test_web_phase9.js
node tools/test_web_animation_truth.js
node tools/test_web_reactions.js
node tools/test_web_mobile.js
node tools/test_web_seo.js
node tools/test_web_lander.js
node tools/test_web_docking.js
node tools/test_web_watchstander.js
node tools/test_web_rll.js
node tools/test_web_signal.js
node tools/test_web_cneos.js
node tools/test_web_exoplanet.js
node tools/test_web_horizons.js
node tools/test_web_satnogs.js
node tools/test_web_cosmos.js
```

SEO/discovery dağıtım akışı:

```bash
node tools/update_web_sitemap.js
npx wrangler pages deploy web --project-name spacecat
node tools/submit_indexnow.js
```

Google Search Console hesap adımı ve ölçüm ritmi:
`docs/SEARCH_DISCOVERY_RUNBOOK.md`.
