# SPACE CAT — Ücretsiz Özellik Yol Haritası

Tüm maddeler **ücretsiz** veri kaynaklarıyla mümkün: LL2 (thespacedevs), SNAPI (haber),
Open-Meteo (hava), Open-Notify/LL2 events. Ek maliyet yok; sadece istek limiti yönetimi.

Öncelik sırası, algılanan değer / efor oranına göre.

---

## Dalga 1 — Canlı Yayın (en yüksek öncelik)  🔴

**Ne:** Fırlatmanın canlı yayın linkini gösterip **telefonda açmak** (Wear-native akış).

**Veri:** LL2 `mode=detailed` → `vidURLs[]` (url, title, priority, live) + `webcast_live` (boolean).
- `mode=normal` vidURLs vermiyor → endpoint `detailed`'a geçirilecek. `webcast_live`, `weather_concerns`,
  `probability`, `pad.latitude/longitude`, `image` normal'de de var (Dalga 3'e hazır).

**İş kalemleri:**
- [x] `Ll2Api` → `mode=detailed`, `LaunchDto` + `VidUrlDto` alanları
- [x] `Launch` modeli → `webcastLive`, `webcastUrl`, `webcastTitle`
- [x] `LaunchRepository.refresh()` → en yüksek öncelikli vidURL'i seç
- [x] `PhoneLauncher` yardımcı (androidx.wear:wear-remote-interactions → `RemoteActivityHelper`)
- [x] DetailScreen → "▶ WEBCAST" / "🔴 LIVE" chip'i, telefonda açar
- [x] Liste kartı → canlı yayın anında 🔴 LIVE rozeti
- [x] watchOS eşdeğeri (Handoff webpageURL → iPhone Safari)

## Dalga 2 — Uçuş Anı & Sonuç  🚀

**Ne:** T-0 haptik + fırlatma sonucu (SUCCESS/FAILURE) bildirimi + IN-FLIGHT durumu.

**Veri:** LL2 `status` (Go/TBD/Hold/In Flight/Success/Failure) — mevcut diff motoruna eklenir.

**İş kalemleri:**
- [x] T-0 anında haptik titreşim (offline, `Haptics` — VibratorManager/Vibrator, API 30+)
- [x] T-0 alarmı (`AlarmScheduler` RC_T0, 60 sn pencere) → LIFTOFF bildirimi + buzz
- [x] Sonuç bildirimi: In Flight / Success / Failure / Partial geçişleri (`LaunchNotifier`)
- [x] Status renkleri: success=yeşil, failure/partial=kırmızı, in-flight=amber
- [x] Ayarlar: "Liftoff buzz" + "Launch result" toggle'ları
- [x] watchOS eşdeğeri (T-0 bildirim haptik + WKInterfaceDevice success/failure)

## Dalga 3 — Pad Hava Durumu & Go İhtimali  🌦️

**Ne:** "Neden ertelendi" sorusunu cevaplar; scrub'ların çoğu hava kaynaklı.

**Veri:** LL2 `probability` + `weather_concerns` (ücretsiz, mevcut) → hızlı kazanç.
İleri: Open-Meteo (`pad.latitude/longitude`, ücretsiz, anahtar yok) rüzgar/bulut.

**İş kalemleri:**
- [x] DetailScreen → GO ODDS %{probability} (renkli), weather_concerns satırı
- [x] Open-Meteo entegrasyonu — pad koordinatıyla anlık hava (PAD WX paneli)
- [x] WeatherRepository (30 dk bellek cache, talep üzerine — senkrona bindirilmez)
- [x] WMO kod → etiket+emoji, rüzgar uyarısı (gust ≥ 40 km/h kırmızı)
- [x] watchOS eşdeğeri (PAD WX paneli + GO ODDS, WeatherService actor)

## Dalga 4 — Uzay Meraklısı Genişlemesi  🛰️

**Ne:** Fırlatma dışı içerik; "ajans-bağımsız bilek terminali" kimliğini büyütür.

**Veri (hepsi ücretsiz):**
- LL2 `/event/` → spacewalk, docking, EVA
- Ajans/roket istatistiği: `agency_launch_attempt_count`, streak (LL2 normal'de mevcut)
- Görev görseli / yaması: LL2 `image`, `mission_patches`
- ISS "şu an üstümde": Open-Notify / LL2

**İş kalemleri:**
- [x] STATS bölümü (DetailScreen/View) — AGY FLT #N · PAD FLT #N · RECORD ok/total (LL2 mevcut, yeni API yok)
- [x] EVENTS bölümü (liste altında, WIRE gibi) — LL2 `/event/upcoming/` + EventDetail
- [x] EventRepository (Wear) / EventStore (watchOS) — ayrı cache, senkrona bindirildi
- [x] Her iki platformda gerçek veriyle doğrulandı (Soyuz Undocking event + SpaceX #710 stats)
- [ ] (opsiyonel ileri) Takvime ekle intent'i, ISS "şu an üstümde", görev görseli

## Dalga 5 — Görsel Zenginlik  🖼️

**Ne:** Görev/roket görseli detay ekranına hero banner olarak; uygulamayı görsel olarak
bambaşka yere taşır.

**Veri:** LL2 `image` (dict: `thumbnail_url` + `image_url`) — her fırlatmada var, ücretsiz.

**İş kalemleri:**
- [x] `Launch.imageUrl` (thumbnail öncelikli) + `ImageDto`/`ImageDTO` + eşleme
- [x] Wear: Coil (`io.coil-kt:coil-compose`) AsyncImage hero'su (DetailScreen)
- [x] watchOS: yerleşik AsyncImage hero'su (DetailView)
- [x] Her iki platformda gerçek görselle doğrulandı (Falcon 9 + Starlink fairing)

## Dalga 6 — Canlı ISS Takibi  🛰️

**Ne:** Uluslararası Uzay İstasyonu'nun anlık konumu/irtifası/hızı; kendine yeten,
canlı güncellenen bir "bilek terminali" ekranı.

**Veri:** wheretheiss.at `/v1/satellites/25544` (ücretsiz, anahtarsız) — lat/long,
altitude, velocity, visibility. Yedek: open-notify iss-now.json.

**İş kalemleri:**
- [x] `IssState` modeli + `IssApi`/`IssStore` + `IssRepository` (cache yok, taze)
- [x] Wear: `IssScreen` (5 sn canlı tazeleme) + liste "🛰 ISS TRACKER" girişi + nav
- [x] watchOS: `IssView`/`IssStore` + liste girişi + SHOT_SCREEN=iss
- [x] watchOS'ta canlı veriyle doğrulandı (46.6°N 87.5°W · ALT 424 km · 27.585 km/h · DAYLIGHT)

## Dalga 7 — Takvime Ekle  📅

**Ne:** Fırlatmayı tek dokunuşla takvime ekle — tracker'ların en çok istenen özelliği.

**Yöntem:** Google Calendar "şablon" URL'i (web linki) → mevcut "telefona devir"
akışıyla açılır (Wear: `RemoteActivityHelper`, watchOS: Handoff). Yeni izin yok.

**İş kalemleri:**
- [x] `CalendarLink` (Google Calendar TEMPLATE URL — mission/dates/details/location)
- [x] Wear: `CalendarChip` (DetailScreen) → PhoneLauncher ile telefonda açar
- [x] watchOS: `calendarButton` (DetailView) → ikinci `.userActivity` Handoff'u
- [x] watchOS'ta buton doğrulandı; devir yolu webcast ile aynı (gerçek Galaxy Watch7'de kanıtlı)

## Dalga 8 — Ajans Markası  🏢

**Ne:** Fırlatma detayında ajans logosu + tipi (Commercial/Government); Dalga 5'in
görev görselini tamamlar, detayı "premium" gösterir.

**Veri:** LL2 `launch_service_provider.logo` (image_url) + `.type.name` — mevcut, ücretsiz.

**İş kalemleri:**
- [x] `Launch.agencyLogoUrl`/`agencyType` + `AgencyDto.logo`(ImageDto)/`type` + eşleme
- [x] Wear/watchOS: DetailScreen/View'da logo + tip rozeti (status altında)
- [x] KIRPMA DERSİ: logolar geniş wordmark (SpX 9.5:1) → thumbnail kare kırpım verir,
      **image_url** (tam logo) tercih edilmeli; watchOS'ta SPACEX logosu tam doğrulandı

## Dalga 11 — ASCII Liftoff Sequence  🚀 — PLANLANDI

**Ne:** Gerçek fırlatmanın T-0 anında Wear OS ve watchOS uygulamasında yerel ASCII
ateşleme/yükseliş sekansı. Mevcut watchOS 1.0 incelemesine dokunulmayacak; sonraki sürüm
özelliğidir.

**Doğruluk ve maliyet sınırları:**
- Kareler uygulamaya gömülü ve deterministik olur; video/stream indirilmez, yeni API veya
  Cloudflare yükü oluşturulmaz.
- `HOLD`, `TBD/TBC`, scrub veya bilinmeyen durumda roket kalkmaz; pad sahnesinde bekler.
- Gerçek telemetri olmayan uçuş aşamaları açıkça `MODELED FLIGHT · NOT TELEMETRY` taşır.
- Animasyon yalnız uygulama açıkken kısa T-0 penceresinde çalışır; ambient/Always-On tek
  düşük enerjili kareye iner.
- Wear ve watchOS aynı sahne sözleşmesini paylaşır: T-10 pad wake, T-3 ignition, liftoff,
  MAX-Q, stage separation, MECO ve doğrulanmış sonuç. Haptik yalnız kullanıcı ayarı açıksa.

**İş kalemleri:**
- [x] Ortak kısa görev olayı sözleşmesi ve kaynak durum kapısı
- [x] Wear OS kaynak-planlı milestone/next-event readout (yalnız detay ekranı açıkken)
- [x] watchOS kaynak-planlı milestone/next-event readout (sonraki build kaynağı)
- [ ] Wear OS kısa yerel ASCII renderer + lifecycle/pil kapıları
- [ ] watchOS kısa yerel ASCII renderer + Always-On/scenePhase kapıları
- [ ] Gecikme, HOLD, scrub ve T-0 retarget regresyon testleri
- [ ] Gerçek cihazda haptik, okunabilirlik ve enerji doğrulaması

---

**Not:** Her dalga hem Wear OS hem watchOS'ta eşitlenir. Wear önce (birincil geliştirme
cihazı Galaxy Watch7), watchOS port sonra.

---

## Web terminali — yaşayan uzay veri fazları — CODEX

Bu seri saat uygulamasından bağımsızdır. Her kaynak aynı sözleşmeye uyar: dar kapsamlı
server-side adapter, normalize edilmiş güvenli payload, kesin timeout, edge cache,
last-known-good ve açık kaynak/zaman ölçeği etiketi. Ana hero değişmez; yeni veriler terminal
komutu ve sanal dosya izi üzerinden keşfedilir.

### Faz 12 — CNEOS Atmosphere + Near-Earth Watch — TAMAMLANDI

- [x] NASA/JPL Fireball Data API → `fireball`
- [x] NASA/JPL Close Approach Data API → `approach`
- [x] `/dev/cneos` + `man cneos`
- [x] 6 saat tazelik, 7 gün edge/device last-known-good, 8 saniye upstream timeout
- [x] Yakın geçişin çarpışma tahmini olmadığı ve zamanların TDB olduğu açık etiketlendi
- [x] Mobil satır düzeni, normalizasyon ve regresyon kapıları

### Faz 13 — Exoplanet Daily World — TAMAMLANDI

- [x] NASA Exoplanet Archive TAP / `PSCompPars` üzerinden 256 kayıtla sınırlı aday sorgusu
- [x] UTC tarihinden deterministik tek dünya; aynı gün ve aynı arşiv snapshot'ında aynı sonuç
- [x] Help'e yazılmayan `world`/`exoplanet` ve `/dev/exoplanet` keşif izi
- [x] Yarıçap, kütle, yörünge, denge sıcaklığı, uzaklık ve keşif bilgisinde null güvenliği
- [x] Boyut bandı bileşim iddiasından, ASCII küre gerçek görüntüden açıkça ayrıldı
- [x] UTC-günlük edge cache + 7 günlük edge/device last-known-good + 10 saniye timeout
- [x] Ana hero, dominant animasyon, ses, Watchstander ve saat uygulamaları değişmedi

### Faz 14 — JPL Horizons Ephemeris — TAMAMLANDI

- [x] Dokuz server-side hedef: Mercury, Venus, Moon, Mars, Jupiter, Saturn, Uranus,
  Neptune, Pluto
- [x] Geocentric observer (`500@399`), UT ve apparent RA/DEC sözleşmesi
- [x] Minimal Horizons quantities: RA/DEC, magnitude, illumination, range/rate,
  elongation, phase ve constellation
- [x] Help'e yazılmayan `where`/`horizons`; `/observatory/README.TXT`, `targets.list`,
  `last.vector` keşif zinciri
- [x] Sembolik 31×9 equirectangular sky locator; yerel azimut/elevation iddiası yok
- [x] Hedef allowlist'i; kullanıcı girdisinden serbest upstream sorgusu üretilemez
- [x] Hedef başına 6 saat edge/device cache, 7 gün last-known-good, 10 saniye timeout
- [x] Ana hero, ses, dominant animasyon, konum izni ve saat uygulamaları değişmedi

### Faz 15 — SatNOGS Signal Registry — TAMAMLANDI

- [x] SatNOGS DB açık okuma API'si ve CC BY-SA 4.0 veri lisansı doğrulandı
- [x] Yedi server-side hedef: ISS, AO-7, SO-50, NOAA-18/19, QO-100, Meteor-M 2-3
- [x] Yalnız `alive=true`, `status=active`, doğrulanmış ve frekans-ihlalsiz downlink'ler
- [x] Filtresiz yaklaşık 3,5 MB transmitter çağrısı yasak; NORAD filtresi zorunlu
- [x] Help'e yazılmayan `beacon`/`satellite`; `/observatory/radio` dosya keşif zinciri
- [x] Frekans/range, mode, baud, service ve varsa uplink; “live reception” iddiası yok
- [x] Hedef başına 24 saat edge/device cache, 7 gün last-known-good, 10 saniye timeout
- [x] SatNOGS/Libre Space contributors atfı ve CC BY-SA 4.0 terminal/payload kaydı

### Faz 16 — Rare Signal Watch — TAMAMLANDI

- [x] GraceDB yalnız unauthenticated `public` ve varsayılan Production kayıtlarıyla,
  en fazla sekiz aday üzerinden okunur
- [x] Her kayıtta `CANDIDATE ≠ CONFIRMED DETECTION`; FAR açıkça tahmini false-alarm
  rate ve olay olasılığı olmayan bir oran olarak anlatılır
- [x] Kaydın değişebilen güncel notice geçmişi için doğrulanmış GraceDB kayıt bağlantısı
  sunulur; terminal kendisini son bilimsel otorite gibi göstermez
- [x] CelesTrak yalnız dokuz server-side `CATNR` hedefinden tek bir OMM JSON kaydı alır;
  `GROUP`, `NAME`, `INTDES`, `SPECIAL` ve toplu katalog geçidi yoktur
- [x] CelesTrak istekleri yalnız kullanıcı komutuyla; 12 saat edge/device/subrequest cache,
  7 gün last-known-good ve 10 saniye timeout ile çalışır
- [x] CelesTrak non-200 veya manual redirect yanıtında aynı istek içinde tekrar denemez; sağlayıcı
  kullanım politikası korunur
- [x] Help'e yazılmayan `gravity`/`grace` ve `orbit`/`elements`; keşif zincirleri
  `/observatory/gravity` ve `/observatory/orbits` altındadır
- [x] Ana hero, ses, saat uygulamaları, konum izinleri ve dominant animasyonlar değişmedi

### Faz 17 — UX Flight Deck — TAMAMLANDI

- [x] Mobil ilk açılış marka/CTA'dan başlar; prompt terminal akışının altında kalır
- [x] Dar ekranda gövde dokunuşu klavyeyi açmaz; prompt/hint dokunuşu odağı devralır
- [x] Yerel ve kademeli keşif: `help → tree / → cd /observatory`
- [x] 10 saniyelik rehber pulse'undan sonra canlı Watchstander hint'i geri döner
- [x] Kaynak/lisans metni erişilebilir `SOURCES MOUNTED · OPEN LOG` çekmecesinde korunur
- [x] Klavye focus-visible, `ESC` input temizliği ve `aria-disabled` sözleşmesi
- [x] Gizlilik metni same-origin adapter ve cihaz-yerel terminal durumunu açıkça kapsar
- [x] 390×844 mobil QA, yatay taşma kapısı ve toplam 508 regresyon kontrolü

### Faz 17.1 — Status-Driven Hero Flight — TAMAMLANDI

- [x] Kaynak teyitli `PAD / IGNITION / ASCENT / UPPER / ORBIT / SUCCESS` hero evreleri
- [x] HOLD/TBC/unknown/offline için muhafazakâr pad; failure için yörünge uydurmayan anomali
- [x] Sembolik sahnelerde görünür `NOT TELEMETRY` doğruluk etiketi
- [x] Sakin 10 dk, kritik/uçuş 6 dk adaptif polling ve 6 dk yakın-görev cache'i
- [x] `In Flight` üç saat, final 90 dakika, belirsiz görev bir saat retention kapısı
- [x] Mobil/masaüstü canlı Starlink 17-52 ORBIT WATCH doğrulaması ve toplam 546 kontrol

### Faz 17.2 — Mission Timeline Engine — TAMAMLANDI

- [x] LL2 relative timeline normalizasyonu ve güvenli olay allowlist'i
- [x] Son güvenilir olay + sonuç penceresine bağlı görev-spesifik bitiş
- [x] Stage separation sonrası üst kademe / booster çift kanal
- [x] Landing window pending/success/failure ve Payload Deployed ayrımı
- [x] Pad/flight anomaly güvenlik motoru; patlama/enkaz uydurmayan donmuş son kare
- [x] Mission timeline yoksa açık araç-ailesi `GENERIC PROFILE` fallback'i
- [x] Wear OS/watchOS kısa milestone sözleşmesi; uzun sürekli animasyon yok
- [x] 16 web paketi / 574 kontrol, Android lint+release bundle, watchOS simulator build

### Faz 18 — Animation Truth Contract — TAMAMLANDI

- [x] Canlı T-0/durum için `SOURCE`, görev olayları için `PLANNED`, sembolik yol ve
  ALT/VEL için `MODEL` otorite sözleşmesi
- [x] Hero `PROFILE / PLAN EVT`, canlı telemetri `SOURCE STATUS / MODEL ALT / MODEL VEL`
- [x] Görev kimliğine bağlı deterministik yıldız ve smoke dizileri
- [x] Max-Q, MECO, separation, fairing, landing burn ve deploy için kısa olay vurguları
- [x] MECO/SES/SECO penceresine bağlı motor alevi
- [x] Gizli sekmede çizim durdurma ve reduced-motion canlı ritmi
- [x] 320×700 ve 390×844 mobil QA; belge/ASCII yatay taşması yok, touch çıkışı ≥44 px
- [x] 17 web paketinde 605 deterministik kontrol

### Faz 18.1 — First Contact Rebalance — TAMAMLANDI

- [x] Canlı ilk açılıştaki büyük mağaza CTA'sını kaldır; terminali başrole al
- [x] Wear OS erişimini prompt altındaki terminal-native `[INSTALL]` satırında koru
- [x] Mobil görev değerlerini tek satır ellipsis ile kompakt tut
- [x] Prompt ve `type help` satırını ikincil ürün/kaynak bloklarının önüne taşı
- [x] `home` dönüşünde dock edilmiş yardımcı blokları temiz ve güvenli yeniden kur
- [x] 320×700 ve 390×844 production QA; prompt/help tamamen ilk viewport'ta
- [x] 17 web paketinde 608 kontrol

### Faz 18.2 — Fireball World Grid — TAMAMLANDI

- [x] Son sekiz CNEOS kaydını ortak 58×18 ASCII dünya izdüşümünde göster
- [x] `@` newest-located, rakam archive row, `+` shared-cell marker sözleşmesi
- [x] Konumu olmayan kayıt için sahte koordinat üretme
- [x] Airburst koordinatını doğrulanmış yer çarpması diye sunmayan görünür uyarı
- [x] ISS ve fireball için tek koordinat izdüşüm yardımcısı
- [x] Reduced-motion ve erişilebilir `role=img` açıklaması
- [x] 390×844 / 320×800 mobil QA; belge ve harita yatay taşması yok
- [x] 17 web paketinde 626 deterministik kontrol

### Faz 19 — Orbital Rendezvous Lab — TAMAMLANDI / PRODUCTION

- [x] Production'dan izole standalone ASCII docking ekranı
- [x] Closing/drift/fuel ve yaklaşma koridoruna bağlı deterministik capture fiziği
- [x] Klavye + press-and-hold touch, pause/reset ve cihaz-yerel skor
- [x] Görünür training-model / not-telemetry / not-flight-software sözleşmesi
- [x] Ağ, hesap, clearance ve global leaderboard olmadan çalış; sesi yerel ve opt-in tut
- [x] Görünür ilk-saniye hareketi, kalıcı tap geri bildirimi ve 100 sn altı tamamlanabilirlik
- [x] Hold Point 25/12 clearance state-machine ve prosedür ihlali abort'u
- [x] Coarse/Fine RCS; final yaklaşmada Fine zorunluluğu
- [x] WIDE/CORRIDOR/PORT olmak üzere üç range-tetikli ASCII kamera
- [x] S–F grade ve teknik post-flight debrief; hızlı bitirmeye puan vermeme
- [x] NOMINAL / CROSS DRIFT / LOW FUEL kontrollü görev profilleri
- [x] 73 fizik, prosedür, güvenlik, mobil ve tamamlanabilirlik kontrolü
- [x] Varsayılan-armed, ilk Begin jestiyle başlayan; kapatılabilir, yerel ve kurgusal
  SC Station teknik ses anonsları
- [x] Kullanıcı oyun deneyimi ve görsel onayı
- [x] `/usr/games/DOCKING.COM → docking` gizli keşif yolunu bağla
- [x] `noindex,follow` standalone production rotası ve terminale dönüş yüzeyi
- [x] 390×844 / 320×800 mobil QA; 48 px touch, taşmasız 64×28 ASCII yüzey
- [x] 44 production kontrolü; 18 web paketi toplam 673 kontrol
- [x] Production `df0a5fb7` / `https://spacecat.watch/games/docking`

### Faz 20 — Booster Recovery V2 — TAMAMLANDI / PRODUCTION

- [x] Lunar iniş metaforunu terminale daha uygun `BOOSTER RECOVERY` görevine dönüştür
- [x] Açık `PAD01` hedefi, ışıklar, yaklaşma koridoru ve canlı pad offset guidance
- [x] Launch cinema ile ortak ASCII motor alevi, egzoz dumanı ve alçak irtifa tozu
- [x] `BOOSTBACK / BRAKING / FINAL / LANDING BURN` fazları ve landing-envelope kontrolü
- [x] Yanlışlıkla başlayan uçuşu önleyen açık pre-flight hold / Begin Recovery kapısı
- [x] S–F grade ve temas hızı, yatay drift, attitude, yakıt içeren teknik debrief
- [x] Cihaz-yerel `sc_lander_v2`; ağ, API, hesap veya global leaderboard yok
- [x] 390×844 / 320×800 gerçek tarayıcı QA; taşmasız ASCII ve ≥44 px kontroller
- [x] Lander paketi 80 kontrol; 18 web paketi toplam 703 kontrol
- [x] Production `17a9b2ef` / `https://spacecat.watch`

### Faz 20.1 — SC Game System Cabinet — TAMAMLANDI / PRODUCTION

- [x] Lander ve docking için ortak `SC GAME SYSTEM // CARTRIDGE` açılış kimliği
- [x] Space Cat maskotu, görev mottosu, hedef/prosedür özeti ve cihaz-yerel rekor
- [x] Brifing tamamlanana kadar uçuş kontrollerini kilitle
- [x] Başarı için amber `MISSION COMPLETE`, kayıp için kırmızı `SIGNAL LOST // GAME OVER`
- [x] Sonuç kartında grade, skor, kritik durum ve doğrudan retry
- [x] Teknik debrief'i dramatik sonuç kartının altında koru
- [x] Reduced-motion uyumlu kısa boot/signal-break geçişleri
- [x] Sabit 56×26 ve 64×28 ASCII grid sözleşmesi; mobilde taşma üretme
- [x] Lander 94, docking 59 kontrol; 18 web paketi toplam 732 kontrol
- [x] Production `1834e313` / `https://spacecat.watch`

### Faz 20.2 — Docking Comms Default Armed — TAMAMLANDI / PRODUCTION

- [x] SC Station kanalını açılışta görünür `COMMS ON` / `ARMED` durumuna getir
- [x] Tarayıcı autoplay kullanma; ilk anonsu Begin Approach kullanıcı jestine bağla
- [x] Uçuş öncesinde kapatma ve uçuş sırasında on/off davranışını koru
- [x] Retry sırasında kullanıcının mevcut on/off tercihini koru
- [x] Production ve onaylı prototip script eşliğini sürdür
- [x] Docking 62 kontrol; 18 web paketi toplam 735 kontrol
- [x] Production `05ed1592` / `https://spacecat.watch/games/docking`

### Google Play Wear round-safe düzeltmesi — İNCELEMEDE

- [x] Play Console ret kanıtı ve etkilenen `5 (1.1.0)` paket doğrulandı
- [x] Ortak round-safe viewport, uzun metin, görsel ve kontrol genişliği sözleşmesi
- [x] 454×454 yuvarlak emülatörde görev ve olay ekranı görsel QA
- [x] İmzalı `6 (1.1.1)` release AAB
- [x] `6 (1.1.1)` AAB'yi Wear OS üretim kanalına yükle ve yeniden incelemeye gönder
- [x] Mağaza metinleri ile `https://spacecat.watch/privacy` değişikliğini aynı inceleme grubuna gönder
- [ ] Google Play inceleme sonucunu gözlemle
