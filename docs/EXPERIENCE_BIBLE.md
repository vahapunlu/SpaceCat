# SPACE CAT Experience Bible

Bu belge sitenin büyürken bir özellik çöplüğüne dönüşmesini engelleyen tasarım anayasasıdır.
Ana fikir değişmez: ziyaretçi bir pazarlama sayfasına değil, kendi kendine yaşayan eski bir
uçuş terminaline girdiğini hissetmelidir.

## 1. Değişmez tasarım yasaları

1. **Terminal kahramandır.** Yeni özellik ayrı bir web bileşeni gibi görünemez; komut, dosya,
   cihaz, kayıt, sinyal veya uçuş ekranı olarak terminal evrenine girmelidir.
2. **Merak satıştan önce gelir.** Saat yüzünün ayrıntıları açıklanmaz. Site ilgi uyandırır;
   ürün sayfası satın alma kararını tamamlar.
3. **Gerçek veri gerçek diye, model model diye görünür.** LL2 takvimi ile modellenmiş uçuş
   profili hiçbir zaman birbirine karıştırılmaz.
4. **Bir anda tek baskın deneyim.** Sinema, canlı takip ve ISS ekranı aynı anda çalışamaz.
   Ambiyans bu sahnelerin sesine veya odağına müdahale edemez.
5. **Her deneyimin çıkışı vardır.** Baskın deneyim ESC ile kapanır; mümkünse sahneye tıklamak
   da aynı sonucu verir. Çıkış bütün timer ve event listener'larını temizler.
6. **Azaltılmış hareket birinci sınıf davranıştır.** `prefers-reduced-motion` aktifken deneyim
   anlamını korur, fakat uzun animasyon zorlamaz.
7. **Sıfır editoryal bakım tercih edilir.** UTC, canlı veri, cihaz cache'i ve deterministik
   kurallar sürekli elle içerik girmekten önce gelir.
8. **Sır yalnızca saklanmaz, keşfedilir.** Gizli şeylerin izi dosya ağacında, `man` sayfasında,
   binary taşıyıcıda veya mantıklı bir terminal davranışında bulunmalıdır.
9. **Kullanıcı verisi cihazda kalır.** Black Box, clearance, CAPCOM loopback ve oyun kayıtları
   için hesap veya merkezi leaderboard kurulmaz.
10. **Yeni şey eski hissi güçlendirmelidir.** DOS/CRT estetiğini bozan kart, modal, rozet,
    modern dashboard veya dekoratif animasyon reddedilir.
11. **Bilgi hazinesi saklanmaz.** Sürprizler gizli olabilir; eğitim ve referans arşivleri
    kök dosya ağacında görünür mount olarak yaşar. `help` yeni içerik kataloğuna dönüşmez;
    dosya komutlarını öğrenen kullanıcı `tree`, `cd`, `ls` ve `cat` ile derine iner.
12. **Terminal saldırgana saldırmaz; onu gözlemler.** Unix keşif, yetki ve ağ komutları
    yalnız SpaceCatOS kurgusu içinde çalışır. Gerçek shell, soket, tarama veya dosya mutasyonu
    yoktur. Sert denemeler cihaz-yerel audit kaydına dönüşür; kullanıcı kendi izini dosya
    sisteminde keşfeder. Bu katman `help` ve TAB tamamlama listesinde yer almaz.
13. **Bilimsel gerçek ile rol yapma aynı satırda ayrılır.** Gerçek uzay araçları yalnız
    kaynak gösterilen kamu ephemerisiyle ve read-only görünür. Telemetri, kontrol yetkisi veya
    RF bağlantısı asla ima edilmez. Yazılabilir hedefler açıkça hayalî ve cihaz-yerel eğitim
    simülasyonudur; gerçek hedefe komut denemesi paket yaratmadan kapanır.

## 2. Deneyim şeritleri

| Şerit | Görev | Örnek |
|---|---|---|
| CORE | İlk ziyaret ve ana büyülenme anı | boot, hero, `sudo launch` |
| LIVE | Gerçek dünyaya bağlı yaşayan sistem | `track`, `iss`, anomaliler |
| ARCHIVE | Bakım gerektirmeyen tarihî derinlik | `replay`, tape dosyaları |
| AMBIENT | Odağı çalmayan atmosfer | CAPCOM `radio`, küçük CRT hareketi |
| SECRET | Merak eden kullanıcıya mikro ödül | `ping felicette`, gizli dosyalar |
| LEGACY | Eski bilgisayar kültüründen güvenli dijital arkeoloji | `PINGPONG.COM` |
| SIMULATION | Kurallı, tekrar oynanabilir terminal programı | gelecekte ASCII Lunar Lander |

Bir özellik birden fazla şeride ihtiyaç duyuyorsa bölünür. Şeridi belli değilse yapılmaz.

## 3. Experience Kernel sözleşmesi

Her hareketli veya uzun yaşayan deneyim kayıt tablosuna şu bilgileri vermelidir:

- kimlik ve şerit
- `dominant`, `ambient` veya `micro` çalışma modu
- veri kaynağı
- hareket seviyesi
- ses sahipliği
- kesin çıkış davranışı
- oluşturduğu interval, timeout ve event listener'ları

Kernel'in kuralları:

- `dominant` sahne başlamadan önce başka dominant sahne bulunmadığını doğrular.
- Sesli dominant sahne CAPCOM radyo ambiyansını kapatır.
- Timer ve listener'lar doğrudan sahneye değil kernel kaynak havuzuna kaydolur.
- Sahne bittiğinde kaynak havuzu tek noktadan temizlenir.
- Çalışma durumu `cat /proc/experience` ile gözlemlenebilir.

## 4. Hareket bütçesi

- Ana ekranda en fazla bir sürekli düşük hareket: pad cam.
- Baskın ekranda en fazla bir yüksek hareket motoru.
- Aynı anda en fazla bir ses kaynağı ailesi.
- Mikro reaksiyon 3 saniyeyi, kullanıcı istemeden başlayan vurgu 2 saniyeyi aşmamalı.
- Yeni bir animasyon motoru ancak mevcut motorla anlatılamayan yeni bir bilgi taşıyorsa eklenir.
- Görsel çeşitlilik için önce aynı motorun gerçek veri senaryoları kullanılır:
  `GO`, `HOLD`, `TBD`, T-0 retarget, pad weather, gündüz/gece ve görev sonucu.

## 5. Fikir kabul kapısı

Yeni fikir aşağıdaki beş sorudan en az dördüne “evet” demelidir:

1. Terminal evreninin içinde doğal mı?
2. Ziyaretçiye keşif, gerçek bilgi veya ustalık kazandırıyor mu?
3. Kendi kendine yaşayabilir mi?
4. Mevcut bir animasyon/komut/dosya sistemiyle üretilebilir mi?
5. Beş dakikada kaldırılabilecek kadar izole mi?

Ek veto koşulları:

- Yeni ücretli servis gerektiriyorsa belirgin ölçülebilir fayda göstermeli.
- Haftalık editoryal bakım istiyorsa reddedilir.
- Saat yüzünü veya ürünün özel ayrıntılarını gereksizce anlatıyorsa reddedilir.
- İlk ziyarette ana CTA'yı veya komut satırını bastırıyorsa reddedilir.

## 6. Sıradaki kontrollü genişleme

### Faz 9.1 — Gerçek senaryo zenginliği — TAMAMLANDI

Mevcut launch/live motoruna yeni motor eklemeden durum varyasyonları:

- `GO`, `HOLD`, `TBD/TBC`, `SCRUB`, `SUCCESS`, `PARTIAL FAILURE` ve `FAILURE` merkezi
  görev durum motoruyla sınıflandırılır.
- HOLD, unconfirmed veya bilinmeyen durumdaki gerçek görev planlanan T-0 geçse bile pad'den
  ayrılmaz. Yalnız LL2'nin uçuşa izin veren durumu modellenmiş yükselişi başlatabilir.
- T-0 retarget, gecikme/öne çekilme yönü ve dakika farkıyla kaydedilir; model saati yeni
  T-0'a kilitlenir.
- Araçlar bakım gerektirmeyen isim eşlemesiyle `LIGHT`, `CORE`, `HEAVY`, `SHIP`, `WING`
  ve `BOOST` ASCII profillerinden birini kullanır. Bunlar teknik çizim değil terminal
  siluetleridir.
- Pad gündüz/gece/şafak/alacakaranlık durumu koordinat + UTC ile onboard hesaplanır.
- Open-Meteo'dan alınan güncel pad havası 30 dakika cihazda cache edilir. Açık biçimde
  “CURRENT PAD CONDITIONS · not a T-0 forecast” olarak etiketlenir.
- Simülasyon bitişi artık gerçek yörünge başarısı iddia etmez. Canlı sonuç LL2 teyit edene
  kadar `RESULT PENDING`; teyit geldiğinde success/failure/scrub sonucu gösterilir.
- Karar motoru `tools/test_web_phase9.js` ile deterministik regresyon testine sahiptir.

### Faz 9.2 — Terminal reaction pack — TAMAMLANDI

Paket 11 davranışta donduruldu:

- mevcut `whoami` ve `ping felicette`
- `ver`, `dir [/w] [/a]`, `type`, `mem`, `chkdsk`
- kernel yönetimli `tracert` (`traceroute` uyumluluk alias'ı)
- case-preserving ve HTML-safe `echo`
- kalıcı olarak non-destructive `format`
- gerçek ağ isteği atmayan local-simulation `nmap`

Ana `help` listesinde görünmezler. Keşif zinciri:

1. `ls -a /var/log`
2. `type /var/log/.maintenance`
3. `VER → DIR /W → CHKDSK → TRACERT`

`NMAP` ve `FORMAT` terminal tecrübesi olan kullanıcıların doğal denemelerine bırakılır.
Paket yeni API, backend, hesap, veri yazımı veya gerçek ağ taraması oluşturmaz.

### Faz 9.2A — PINGPONG.COM Legacy Display Artifact — TAMAMLANDI

- `/usr/games/PINGPONG.COM`, ana `help` ve TAB listesinden gizli; `tree /`, `cd`, `ls`,
  `cat` ve doğrudan `.COM` çalıştırma davranışıyla keşfedilir.
- Program gerçek zararlı yazılım değildir: tek bir DOS topunu ve geçici ekran gliflerini
  görünür viewport içinde hareket ettiren, oturumluk ve cihaz-yerel bir 8088/Ping-Pong
  saygı duruşudur. Ağ, cookie,
  IndexedDB, localStorage, service worker, dosya yazımı veya dış payload kullanmaz.
- Top Command Deck'in üst sınırında seker; prompt her an görünür ve çalışır. Mobil klavye
  açıldığında `visualViewport` sınırları yeniden hesaplanır.
- 1989 CSIR teknik analizindeki davranış temel alınır: top ekran hücresindeki karakteri
  algılar ve bazı karakterlerden yön değiştirerek seker. Space Cat varyantı vurulan glifi
  geçici bir restore hücresinde saklar, görsel kopyasını yerçekimiyle ekran tabanına düşürür.
- Aynı anda en fazla 32 düşen glif bulunur. Canlı hero satırı yeniden çizilirse yetim görsel
  otomatik kaldırılır; sabit satırlardaki bütün karakterler cleanup sırasında kendi text-node
  konumuna geri yazılır. Sayfa yenilemek bütün oturum kalıntısını doğal olarak kaldırır.
- `CHKDSK` yerleşik video-memory imzasını teşhis eder, `SCAN /REMOVE` kernel kaynaklarını ve
  yer değiştiren glif sayısını gösterir. Tek cleanup; bütün karakterleri, animation frame'i
  ve görsel kalıntıyı kaldırır; sonuç ekranı geri yüklenen glif sayısı, sıfır dosya
  değişikliği ve sıfır ağ paketi sınırını görünür biçimde raporlar.
- `prefers-reduced-motion` etkinse top hareket etmez; anomali ve kurtarma yolu anlamını
  korur. Ekran okuyucuya başlangıç/temizleme durumu bildirilir, dekoratif top gizlenir.
- Bu deneyim oyun kataloğu değildir ve `help`e yeni komut eklemez; eski bir diskte unutulmuş
  yürütülebilir dosya gibi davranır.

### Faz 9.3 — Mobile Release Gate — TAMAMLANDI

Mobil uyumluluk bütün yeni deneyimler için veto yetkili yayın kuralıdır:

- Destek matrisi en az 320, 360, 390 ve 430 px portrait ile kısa phone landscape içerir.
- Bir dominant deneyim klavye `ESC` yanında açık bir touch çıkışı sunmadan tamamlanmış
  sayılmaz.
- Dokunma hedefleri en az 44 px'dir; sanal klavye terminali yakınlaştırmamalı veya komut
  satırını erişilemez bırakmamalıdır.
- Safe-area, yatay taşma, prompt'a dönüş ve Experience Kernel cleanup test edilmelidir.
- Sahnenin bütün yüzeyi gizli kapatma düğmesi değildir; yanlış dokunmalar deneyimi
  sonlandırmaz.
- Mobil düzeltme DOS/CRT dilini bozacak ayrı bir “mobil arayüz” üretmez.
- Boşluklarla hizalanmış masaüstü tabloları telefona aynen sıkıştırılmaz. `help` gibi uzun
  terminal listeleri semantik satırlar kullanır: masaüstünde komut/açıklama iki sütun,
  mobilde komut üstte ve `└─` ile bağlanan açıklama altta okunur. Yazıyı küçültmek çözüm
  sayılmaz; 320 px'de anlamlı satır grupları ve sıfır yatay taşma korunur.
- İlk temas sırası `terminal → prompt/help → ürün bağlantısı → kaynak günlüğü`dür. Mağaza
  CTA'sı komut satırını ilk viewport dışına itemez ve terminalin başrolünü alamaz.
- Command Deck her viewport'ta alt kenara sabitlenir. Normal terminalde gerçek düzenlenebilir
  prompt ve kısa kullanım ipucu görünür; dominant deneyimde sahte bir giriş alanı yerine
  çalışan kanalın adı ile `ESC / EXIT` çıkışı gösterilir.
- Dock yüksekliği içerikte dinamik olarak ayrılır. `visualViewport`, safe-area ve sanal
  klavye ofseti izlenir; komut satırı mobil klavyenin veya tarayıcı kromunun arkasında kalmaz.

### Faz 9.4 — Search & Discovery Gate — TAMAMLANDI

Arama ve makine-okuyucu keşif katmanı da terminal evreninin parçasıdır:

- Crawler'a kullanıcıdan farklı veya gizli içerik sunulmaz.
- Ham HTML, canlı terminal açılmadan önce aynı DOS görünümünde anlamlı ürün metni ve gerçek
  bağlantılar taşır.
- JavaScript progressive enhancement uygular; statik terminali mevcut canlı deneyime
  yükseltir.
- Deep-link rotaları yalnız metadata değiştirerek çoğaltılmaz; görünür statik açıklamaları
  ve `WebPage` kimlikleri de farklıdır.
- Structured data yalnız görünür ve doğrulanabilir bilgiyi taşır. Sahte rating, review,
  fiyat veya sonuç kullanılmaz.
- `llms.txt` deneysel yardımcı dosyadır; canonical HTML ve JSON-LD asıl kaynak kalır.
- Discovery katmanı yeni backend, framework, haftalık içerik üretimi veya aylık maliyet
  oluşturmaz.

### Faz 9.5 — Animation Truth Contract — TAMAMLANDI

Canlı sahnenin ciddi oyuncak niteliği üç görünür otorite sınıfıyla korunur:

- `SOURCE`: sağlayıcının görev durumu ve T-0 bilgisi
- `PLANNED`: sağlayıcı görev timeline'ından gelen, gerçekleştiği henüz iddia edilmeyen olay
- `MODEL`: sembolik yol, yükseklik, hız ve generic fallback olayları

Sinematik ilkeler:

- Max-Q, MECO, separation, fairing, landing burn ve deploy vurguları sabit genişlikte,
  kısa ve dekoratif kalır; yeni panel veya kart üretmez.
- Aynı görev kimliği aynı yıldız/smoke dizisini üretir; rastgele sahne farkı yoktur.
- Gizli sekmede dominant launch çizimi durur, canlı saat geri dönüldüğünde kaynağın T-0'ına
  yeniden oturur. Reduced-motion kullanıcısında canlı sahne daha düşük ritimde güncellenir.
- En dar desteklenen 320 px görünümde doğruluk satırı kırılabilir; belge ve ASCII ekran
  yatay taşamaz. Mobil sürüm masaüstünün eksik kopyası değil, yalnız temiz çalışan aynı
  terminal deneyimidir.
- Bu katman yeni API, cache, cron, backend veya aylık maliyet oluşturmaz.

### Faz 9.6 — Scientific Map Truth Contract — TAMAMLANDI

- Dünya gridleri yalnız kaynağın verdiği enlem/boylamı equirectangular ASCII izdüşümüne
  taşır; konumu olmayan kayıt için görsel tahmin yapılmaz.
- Fireball koordinatı atmosferik hava patlamasının raporlanan konumudur, doğrulanmış bir
  yer çarpma noktası değildir. Bu ayrım haritanın hemen altında görünür kalır.
- Haritadaki marker ile metin satırı geri izlenebilir olmalıdır: `@` en yeni koordinatlı
  kayıt, rakam arşiv satırı ve `+` ortak grid hücresidir.
- ISS ve fireball aynı izdüşüm matematiğini paylaşır; yeni görselleştirme yeni bir veri
  kaynağı, polling döngüsü veya bakım servisi açmaz.
- Harita terminalin inline `pre.screen` yüzeyidir; ayrı dashboard, kart veya renk dili
  üretmez. 320 px'de yatay taşmadan okunabilir ve reduced-motion tercihini izler.

### Faz 10 — Booster Recovery Training Program — TAMAMLANDI / V2

Tek oyun, terminal içinde, klavye/touch kontrollü ve yerel skor kayıtlı:

- `/usr/games/README.TXT → LANDER.COM → lander` keşif izi ana `help` listesinden gizlidir
- 56×26 ASCII yüzey, sabit başlangıç koşulları ve görünür `PAD01` hedefiyle fizik tekrar
  üretilebilirdir
- klavye ile press-and-hold touch kontrolleri aynı uçuş durumunu yönetir
- oyuncu uçuşu açıkça `[BEGIN RECOVERY]` ile başlatır; terminal komutundaki Enter fiziği
  yanlışlıkla ateşleyemez
- yaklaşma koridoru, pad offset'i, dikey/yatay hız ve attitude guidance aynı fizik
  durumundan üretilir; gerçek telemetri iddiası taşımaz
- motor alevi, irtifaya bağlı duman/toz ve pad ışıkları launch cinema'nın ölçülü ASCII
  efekt dilini paylaşır
- sonuç ekranı S–F grade, pad offset, temas hızları, attitude ve yakıt debrief'i verir
- skor yalnız `sc_lander_v2` ile cihazda tutulur; ağ, hesap ve global leaderboard yoktur
- oyun Black Box kaydı veya clearance sağlamaz
- ESC veya görünür TAP çıkışı bütün timer/listener kaynaklarını temizleyip prompt'a döner
- 320 px dahil mobil görünümde yatay taşma yoktur; kontrol hedefleri en az 44 px'dir

Her yeni oyun aynı ilkeyi izler: önce izole prototip, sonra kullanıcı onayı, mobil kapı ve
deterministik regresyon; ana terminalin `help` yüzeyi oyun kataloğuna dönüştürülmez.

### Faz 10.1 — Orbital Rendezvous production contract

- Docking oyunu refleks veya hız yarışı değildir; clearance kapılarında bağıl hareketi
  sabitlemek, hassas RCS seçmek ve temiz temas kurmak ana beceridir.
- Skor erken bitirmeyi ödüllendiremez. Prosedür, stabilite, burn disiplini ve yakıt esastır.
- Kamera yakınlaşması yalnız aynı fizik durumunun sunumudur; yeni telemetri iddiası üretmez.

### Faz 20.1 — SC Game System ekran sözleşmesi

- Gizli oyunlar aynı terminal evreninde `SC GAME SYSTEM // CARTRIDGE nn` kimliğiyle açılır.
- Açılış kartı oyun alanını taklit etmez; Space Cat maskotu, görev mottosu, amaç, temel
  güvenlik/prosedür zarfı, cihaz-yerel rekor ve açık başlatma eylemi gösterir.
- Başarılı sonuç `MISSION COMPLETE`, başarısız sonuç `SIGNAL LOST // GAME OVER` olarak
  ayrılır. İki sonuç da grade, skor, kritik son durum ve retry eylemini aynı hiyerarşide taşır.
- Teknik debrief sonuç kartının altında korunur; dramatik ekran bilimsel/prosedürel sonucu
  gizleyemez veya gerçek telemetri izlenimi yaratamaz.
- Boot ve signal-break hareketleri kısa ve `prefers-reduced-motion` altında kapalıdır.
- Her kart oyunun sabit ASCII gridine sığmalı; 320 px mobil yüzeyde yatay taşma üretemez.
- Görev profilleri sınırlı ve tasarlanmış olmalıdır; rastgele günlük içerik veya bakım
  gerektiren senaryo akışı açılmaz.
- Ses kanalı görünür olarak varsayılan açık/armed olabilir; gerçek oynatma yalnız kullanıcı
  `Begin Approach` jestiyle başlar. Uçuş öncesi ve sırasında kapatılabilir, yereldir,
  kurgusaldır ve gerçek NASA/ISS iletişimi gibi sunulamaz.
- Kullanıcı onayı alınmıştır. Production keşfi ana `help`ten gizli kalır:
  `/usr/games/README.TXT → DOCKING.COM → docking`.
- Oyun ayrı tam ekran yüzeydir; `noindex,follow` kullanır ve görünür terminal dönüşü taşır.
- Mobil release gate 320/390 px taşmasız yüzey ve 48 px touch hedefleriyle aynen uygulanır;
  ses autoplay kullanamaz ve ilk gerçek oynatma mutlaka kullanıcı jestine bağlıdır.

### Faz 11 — Autonomous Watchstander — TAMAMLANDI

Terminal mevcut gerçek verileri tek bir düşük profilli nöbet durumunda birleştirir:

- yeni API, timer motoru, hesap veya arka uç eklenmez
- LL2 primary mission, mevcut yerel saat ve varsa taze NOAA cache'i kullanılır
- normal durumda mevcut `type help` ipucu korunur; yalnız anlamlı görev koşulu onu geçici
  bir uçuş direktifine dönüştürür
- durum `/proc/watch` ve `/var/log/watch.log` içinde okunabilir; ana `help` listesine yeni
  komut eklenmez
- HOLD, T-0 belirsizliği, final count, ascent ve teyitli sonuç birbirine karıştırılmaz
- durum değişimleri mevcut hero saniye döngüsünden beslenir; ikinci sürekli timer kurulmaz
- Watchstander yalnız bilgi ve yönlendirme üretir; otomatik komut, ses, bildirim, clearance
  veya veri yazımı yapamaz

### Faz 21 — Cosmic Discovery Suite — TAMAMLANDI

Beş yeni deneyim aynı terminal evrenine ayrı ve sökülebilir modüller olarak girdi:

- `earth`, NASA DSCOVR EPIC gözlem karelerini Worker üzerinden aynı-origin alır ve yalnız
  cihazda ASCII'ye çevirir. Bu gözlemler hiçbir zaman canlı video olarak etiketlenmez.
- `apod`, günlük NASA APOD kaydını kredisi ve özgün kaynak bağlantısıyla taşır; video
  günlerinde autoplay yerine önizleme kullanır.
- `nightwatch`, açık konum izninden sonra Ay, yaklaşık ISS geçişi, Mars yerel ufuk
  dönüşümü, NOAA aurora grid değeri ve hava tahminini tek bir model/forecast brifinginde
  toplar. SPACE CAT konum saklamaz; Open-Meteo'ya yalnız 0.25° yuvarlanmış grid gider ve
  bu durum izin istemeden önce görünürdür.
- `transmit <target> <message>`, JPL Horizons geometrik mesafesini gerçek ışık gecikmesine
  dönüştürür; paket/ACK tamamen yerel ve açıkça simülasyondur. Eski CAPCOM loopback komutu
  ve clearance eşiği gezegen hedefi olmayan kullanımda değişmez.
- `pulsar`, statik katalog periyodunu WebAudio sonifikasyonuna dönüştürür; canlı radyo
  sinyali iddia etmez, autoplay yapmaz ve M/ESC/touch çıkışlarını taşır.

`earth` ve `pulsar` dominant Experience Kernel sahipleridir; radyo ambiyansını kapatır,
timer/listener/audio kaynaklarını tek cleanup noktasında bırakır. Reduced-motion altında
EPIC tek kare, pulsar sabit spektrum olur. Görüntü proxy'leri allowlist/şema doğrulamalı,
uzun edge-cache'li ve API anahtarını istemciden ayırır. Yeni cron, veritabanı, hesap,
abonelik veya editoryal bakım yoktur.

### Faz 21.6 — Mission Focus sözleşmesi — TAMAMLANDI

- `focus [n]`, yeni bir veri veya animasyon motoru değildir; doğrulanmış `track [n]` canlı
  senkronunun dikkat dağıtmayan viewport sunumudur. Aynı T-0, durum, timeline, retarget,
  on dakikalık kaynak kontrolü ve Source/Planned/Model doğruluk sözleşmesini paylaşır.
- Focus açıkken terminal geçmişi, mağaza satırı ve kaynak çekmecesi görünmez. Normal
  düzenlenebilir prompt, alttaki Command Deck içinde `MISSION FOCUS ACTIVE · ESC / EXIT`
  durumuna dönüşür; büyük gerçek görev saati, ASCII sahne, kritik telemetri ve doğruluk
  şeridi kalır.
- CSS viewport modu bütün tarayıcılarda temel davranıştır. Native Fullscreen yalnız destek
  varsa ve kullanıcının açık `[FULLSCREEN]` dokunuşuyla progressive enhancement olarak açılır.
- ESC ve safe-area uyumlu görünür `[EXIT]` aynı Experience Kernel cleanup yoluna gider.
  Sahneye rastgele dokunmak çıkış değildir; mobil klavye moda girerken kapanır.
- 320/390 px portrait ve kısa landscape düzenleri yatay taşma üretemez; kontrol hedefleri
  telefonda en az 48 px'dir. Her yeni web deneyimi bu mobil kapıdan geçmeden yayınlanmaz.
- Inline `track`, oluşturulduğunda kendi viewport-yüksekliğindeki uçuş alanına hizalanır;
  kullanıcı animasyonu görmek için aşağı kaydırmaz. Çıkışta geçici yükseklik kaldırılır.

### Faz 21.7 — Persistent Command Deck sözleşmesi — TAMAMLANDI

- Komut satırı, terminalin birincil kontrol yüzeyidir ve mobil/masaüstünde viewport'un alt
  kenarında sürekli görünür. Terminal çıktısının uzunluğu kullanıcıyı prompt aramaya zorlamaz.
- Normal modda tek gerçek düzenlenebilir giriş korunur. `focus`, `track`, ISS ve diğer
  dominant Experience Kernel sahnelerinde dock, çalışma durumunu ve çıkış yolunu gösteren
  salt-okunur bir durum satırına dönüşür; çalışmayan sahte prompt üretilmez.
- Dinamik dock rezervi içerik ve animasyonların altını kapatmaz. `visualViewport` klavye
  ofseti, safe-area ve `ResizeObserver` birlikte çalışır; 320/390 px telefon ile 1280 px
  masaüstünde yatay taşma olmadan doğrulanmıştır.
- Bu kabuk yeni API, polling, backend, medya veya bakım maliyeti oluşturmaz.

### Faz 21.8 — Yerelleştirme sınırı — TAMAMLANDI

- SPACE CAT'in işletim sistemi İngilizcedir. Prompt, komut ve argümanlar, dosya yolları,
  `MISSION OPS / DEEP SPACE / FILESYSTEM`, görev/ajans adları, ASCII sanat ile
  `SOURCE / PLANNED / MODEL / SIMULATED / GO / HOLD / T-0` sözlüğü çevrilmez.
- Yerelleştirme yalnız kullanıcıya anlam ve yön veren katmanda yaşar: crawlable ürün
  açıklaması, `help` açıklamaları, ilk operatör yönlendirmesi, uygulama özellikleri,
  platform/kurulum/fiyat metni, güven açıklaması ve erişilebilirlik etiketi.
- İki dil aynı anda yan yana basılmaz. Tek aktif açıklama dili vardır; terminal kimliği
  İngilizce kalırken açıklama aynı alanda yer değiştirir. Böylece görsel ve dilsel kakafoni
  oluşmaz.
- İngilizce `/` aynı zamanda `x-default`; Türkçe `/tr`, İspanyolca `/es`, Fransızca `/fr`,
  Japonca `/ja` ve Almanca `/de` ayrı,
  self-canonical sayfalardır. Karşılıklı `hreflang`, sitemap ve görünür gerçek bağlantılar
  kullanılır; IP, cookie, `Accept-Language` veya yalnız `localStorage` ile otomatik
  yönlendirme yapılmaz.
- `lang en|tr|es|fr|ja|de` ile görünür `LANG EN/TR/ES/FR/JA/DE` bağlantıları aynı canonical rotalara gider. `home`,
  aktif dil kökünü korur. Yeni diller aynı merkezi açıklama kataloğu ve bu sınır üzerinden
  eklenir; çekirdek terminal metinleri kopyalanmaz.

## 7. Kopyalanma yaklaşımı

Savunma odağı patent veya görsel engelleme değildir. Avantaj; canlı veriyle davranan sistem,
tutarlı terminal dili, zamanla oluşan Black Box geçmişi ve detayların toplamıdır. Kaynak
dosyalarını okunmaz hâle getirmek veya kullanıcı deneyimini bozan kopya koruması eklemek bu
projenin tasarım ilkelerine aykırıdır.
