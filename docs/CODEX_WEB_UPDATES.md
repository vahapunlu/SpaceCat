# SPACE CAT — Codex Web Güncellemeleri

> Sahip: Codex  
> Başlangıç: 2026-07-30  
> Kapsam: `spacecat.watch` üretim dayanıklılığı, keşfedilebilirlik, gizlilik ve erişilebilirlik.

## Tasarım ilkesi

- DOS terminal ekranının görünür kompozisyonu, renkleri, tipografisi ve keşif hissi korunur.
- Web sitesinde saat yüzü veya ayrıntılı ürün ekranı gösterilmez.
- Site bir ürün kataloğu değil, uzay meraklılarının komutları keşfettiği bir görev terminalidir.
- Yapılan değişiklikler görünmez altyapı iyileştirmeleridir; mevcut CTA ve terminal deneyimi değişmez.

## Kendi kendine yaşayan sistem ilkesi

- Site düzenli içerik girişi, görev seçimi veya elle kampanya güncellemesi gerektirmeyecek.
- Görevler ve uzay olayları desteklenen canlı veri kaynaklarından otomatik gelecek.
- Eğlenceli/kişisel öğeler mümkün olduğunca görev kimliği, tarih veya cihazdaki yerel kayıttan deterministik üretilecek.
- Harici veri geçici olarak kesilirse arayüz çökmeyecek; son iyi cache veya açıkça işaretlenmiş demo verisiyle çalışmaya devam edecek.
- Yeni özellik seçiminde bakım yükü ve aylık altyapı maliyeti temel eleme ölçütü olacak.
- Sürekli editoryal bakım, kullanıcı hesabı, moderasyon veya elle veri girişi isteyen özellikler eklenmeyecek.

## Onaylanan deneyim kararı

- Terminal komut satırı ile `type help · sudo launch · track` yardım satırı, kısa içerikte ekranın alt bölümüne oturtuldu.
- Bu alan `fixed` veya `sticky` yapılmadı; mobil klavyeyle ve uzun terminal çıktılarıyla çakışmadan doğal belge akışında kalır.
- Terminal çıktısı uzadığında komut satırı çıktının sonunda ilerler; kısa içerikte ise gerçek bir DOS terminali gibi ekranın en altındaki aktif öğe olur.
- Yanıp sönen DOS blok imleci artık input alanının sağ kenarında beklemek yerine gerçek yazma konumunu takip eder.
- İmleç, metin girişi ve caret/selection değişikliklerinde yeniden konumlanır; metnin ortasında yapılan düzenlemeleri de izler.

## Saat uygulaması API mimarisi kararı

- Wear OS ve watchOS üretim uygulamaları canlı fırlatma verisini Cloudflare üzerinden değil, doğrudan LL2 v2.3 API'sinden alır.
- Bu doğrudan yapı özellikle ek sunucu, veritabanı ve ücretli API maliyeti oluşturmamak için korunacak.
- API anahtarı olmayan merkezi Cloudflare proxy, kullanıcıları ortak bir çıkış kotasında toplayabileceğinden kullanılmayacak.
- Ücretsiz yapıyı güvenli tutmak için ileride cihaz tarafında yenileme aralığı, eşzamanlı istek birleştirme, `429`/`Retry-After` yönetimi ve stale-cache davranışı güçlendirilecek.
- Launch verisi için yaklaşık 30 dakikalık, daha yavaş değişen event verisi için 4–6 saatlik cihaz önbelleği hedeflenecek.
- Ücretli veya merkezi mimari ancak gerçek kullanım verisi mevcut doğrudan yapının yetersiz olduğunu gösterirse yeniden değerlendirilecek.

## Faz 1 — Yaşayan fırlatma konsolu

- Gerçek sıradaki görev T-60 dakika penceresine girdiğinde terminal otomatik olarak `PRIORITY TRAFFIC` durumuna geçer.
- T-10 dakikada mesaj `FINAL COUNT · TERMINAL OVERRIDE`, T+ ilk saatte `ASCENT WINDOW ACTIVE` olarak değişir.
- HOLD ve yaklaşan doğrulanmamış T-0 durumları ayrı terminal uyarılarıyla gösterilir.
- Yakın görev sırasında tarayıcı sekmesi gerçek saniyelik T-/T+ sayacını, görev adını ve HOLD durumunu gösterir.
- Yakın görev verisi 10 dakikada bir yeniden kontrol edilir; ana panel ile `track` aynı tek uçuş isteği hattını paylaşır ve eşzamanlı LL2 çağrıları birleşir.
- T-0 değiştiğinde gecikme/öne çekilme dakika cinsinden, durum değiştiğinde eski ve yeni durum iki dakika boyunca öncelikli trafik olarak gösterilir.
- `sound on`, `sound off` ve `sound` durum komutları eklendi.
- Ses yalnızca kullanıcı açıkça silahlandırdığında devreye girer; autoplay veya sayfa açılışında ses yoktur.
- Tarayıcı medya kilidini açmazsa terminal sessiz çalışmaya devam eder ve kullanıcıya interlock mesajı verir.
- Simülasyon ve gerçek takip ekranları ortak, tekil ses hattını kullanır; bitişte ses kontrollü biçimde söner ve tekrar kullanım için sıfırlanır.

## Faz 2 — Yerel Black Box görev günlüğü

- `logbook` ve `clearance` komutları eklendi.
- Yalnızca LL2'den gelen gerçek bir görevde, kullanıcı `track` oturumuna T-0'dan önce katılıp gerçek ateşleme çizgisini geçtiğinde görev mühürlenir.
- `sudo launch`, offline demo ve T-0'dan sonra açılan takip oturumları Black Box kaydı üretmez.
- Kayıtlar `sc_logbook_v1` altında yalnızca kullanıcının cihazında tutulur; hesap, sunucu isteği veya analitik olayı yoktur.
- Aynı görev LL2 görev kimliğiyle tekilleştirilir ve ikinci kez kaydedilmez.
- Son 50 görev saklanır.
- Görev sayısına göre otomatik clearance seviyeleri: Observer, Flight Controller, Guidance, Mission Specialist, CAPCOM, Flight Director ve Orbital Veteran.
- `logbook export`, cihazdaki kayıtları hiçbir yere yüklemeden indirilebilir JSON dosyası üretir.
- `logbook clear` doğrudan silmez; `logbook clear confirm` interlock onayı gerektirir.
- Gerçek görev kaydedilmişse takip sona erdiğinde terminal `BLACK BOX SEALED` mesajını gösterir.

## Faz 3 — ASCII görev izleri ve paylaşım

- `patch [n]` komutu eklendi.
- Her patch LL2 görev kimliğinin hash'iyle deterministik üretilir; aynı görev her cihazda aynı, farklı görev farklı yıldız alanı ve patch numarası oluşturur.
- Patch üretimi tamamen tarayıcıda yapılır; görsel servisi, dosya depolama veya editoryal çalışma yoktur.
- `copy patch [n]`, 44 sütunluk ASCII mission patch'i panoya kopyalar.
- `copy [n]`, 48 sütunluk SPACE CAT flight record üretip panoya kopyalar.
- Flight record görev, araç, ajans, gerçek T-0, durum ve Black Box'ta bulunuyorsa `WITNESSED`; aksi halde `TERMINAL SIM` ibaresini içerir.
- `share [n]` artık gerçek görev verisiyle oluşturulan flight record'u terminalde gösterir ve X, Reddit ile Hacker News paylaşım kapılarını sunar.
- Clipboard API reddedilirse eski tarayıcı kopyalama yolu denenir; ikisi de reddedilirse terminal açık bir interlock mesajı gösterir.

## Faz 4 — Derin uzay ve sınıflandırılmış terminal katmanı

- `solar` komutu NOAA Space Weather Prediction Center'ın anahtarsız planetary K-index verisini doğrudan ziyaretçinin tarayıcısından alır.
- Uzay hava verisi 15 dakika cihazda saklanır; servis geçici olarak kesilirse son iyi veri `STALE CACHE` olarak gösterilir, hiç veri yoksa terminal kontrollü bir `UPLINK LOST` mesajı verir.
- Kp değeri G0–G5 geomanyetik fırtına ölçeğine çevrilerek kaynak zamanı ve açık veri kaynağıyla birlikte gösterilir.
- `signal` komutu UTC gününe göre deterministik bir derin uzay iletisi seçer. Aynı gün bütün ziyaretçiler aynı sinyali alır; görev zamanlayıcısı, sunucu veya editoryal bakım gerekmez.
- `/classified` adında keşfedilebilir bir terminal dizini eklendi.
- `ls /classified`, `cat /classified/<file>` ve `decode <binary>` komutlarıyla gizli dosya/binary decoder akışı oluşturuldu.
- `black-box.seal`, yalnızca cihazın yerel Black Box günlüğünde gerçek bir T-0 tanıklığı varsa açılır; boş veya simülasyon geçmişiyle erişilemez.
- Yeni katmanın tamamı mevcut DOS terminali içinde yaşar; görünür landing page kompozisyonuna kart, menü veya ürün ekranı eklenmedi.

## Faz 5 — Terminal giriş kapıları

- Tek terminal deneyimine bakım gerektirmeyen, paylaşılabilir giriş rotaları eklendi:
  - `/live` gerçek sıradaki göreve `track` komutuyla kilitlenir.
  - `/launch` ASCII fırlatma sinemasını başlatır.
  - `/iss` canlı ISS yer istasyonu görünümünü açar.
  - `/solar` NOAA uzay hava durumu hattını sorgular.
  - `/felicette` Félicette anı çekirdeğini açar.
- Bu rotalar ayrı landing page değildir; aynı HTML, aynı DOS kabuğu ve aynı komut motorunu kullanır.
- Her rota Cloudflare Worker tarafından kendi title, description, canonical, Open Graph, Twitter ve JSON-LD URL metadatasıyla sunulur.
- Sondaki `/` kullanılan rota adresleri tek canonical biçime 301 yönlendirilir.
- Eski `#launch`, `#track` ve `#iss` bağlantıları geriye dönük çalışmaya devam eder; yeni paylaşımlar `/launch` rotasını kullanır.
- Bütün giriş rotaları sitemap'e eklendi. Yeni backend, veritabanı veya içerik yönetimi ihtiyacı doğmadı.

## Yapılan değişiklikler

### 1. LL2 v2.3 ve kota güvenliği

- Site, destek süresi biten LL2 v2.2'den güncel ve üretim için önerilen LL2 v2.3 API'sine taşındı.
- Ücretsiz LL2 kotası IP başına 15 istek/saat olduğundan merkezi Cloudflare proxy yaklaşımı canlı testte uygun bulunmadı: bütün kullanıcıları tek edge çıkış IP'sinde toplamak kotayı kötüleştirebilirdi.
- Nihai yapıda istekler ziyaretçinin tarayıcısından doğrudan LL2'ye gider; böylece kota kullanıcılar arasında paylaşılmaz.
- Sıradaki görev listesi 30 dakika, geçmiş görevler ve olaylar 60 dakika tarayıcıda cache'lenir.
- Yeni API cache anahtarı `sc_ll2_v5`; eski cache şemaları, kimliksiz görev kayıtları ve tamamlanmış görevler yeni veriyi gölgeleyemez.
- LL2'nin `upcoming` cevabında kısa süre kalabilen tamamlanmış görevler, gerçek uçuş için ayrılan bir saatlik T+ toleransından sonra otomatik elenir ve ana panel sıradaki göreve geçer.
- `track` komutunun T-0 değişikliği kontrolü 5 dakikadan 10 dakikaya çıkarıldı.
- Yoğun bir keşif oturumunda dahi teorik LL2 çağrı sayısı ücretsiz sınırın altında kalır.

### 2. Canonical alan adı

- `www.spacecat.watch` ve `spacecat.pages.dev`, path ve query korunarak `https://spacecat.watch` adresine 301 yönlendirilir.
- Ana sayfa ve gizlilik sayfasına canonical etiketleri eklendi.

### 3. Güvenlik başlıkları

`_worker.js` statik yanıtlara aşağıdaki başlıkları ekler:

- Content Security Policy
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- sıkı referrer policy
- kamera, mikrofon, konum, ödeme ve USB için Permissions Policy kısıtları

### 4. SEO ve paylaşım metadatası

- `robots.txt` ve `sitemap.xml` eklendi.
- Robots, canonical, Open Graph site adı ve görsel alt metinleri eklendi.
- SoftwareApplication JSON-LD verisi eklendi.
- 404 sayfası `noindex` olarak işaretlendi.

### 5. Gizlilik metni

- “We collect nothing” ifadesi ile Cloudflare Web Analytics arasındaki çelişki giderildi.
- Metin, kişisel veri toplanmadığını; web tarafında cookieless ve toplu trafik ölçümü kullanıldığını açıklar.

### 6. Erişilebilirlik ve hata yönetimi

- Saniyede güncellenen geri sayımın tüm terminali ekran okuyucu canlı bölgesine çevirmesi engellendi.
- Komut çalıştırma durumu için ayrı, görünmez bir `aria-live` bölgesi eklendi.
- Terminal girdisi yardım metniyle ilişkilendirildi; görsel imleç dekoratif olarak işaretlendi.
- LL2, ISS, haber ve hava API yanıtlarında HTTP hata kodları artık açıkça hata akışına düşer.

### 7. Dokümantasyon

- `web/README.md` canlı domain ve Wrangler/Worker tabanlı yerel geliştirme akışına göre güncellendi.

## Doğrulama

- [x] Gömülü ana JavaScript sözdizimi
- [x] `_worker.js` modül sözdizimi
- [x] Manifest JSON doğrulaması
- [x] Cloudflare Worker yerel derlemesi
- [x] LL2 v2.3 ayrıntılı upcoming/previous ve events şemaları doğrulandı
- [x] Canlı görev verisi ana ekranda görüntülendi
- [x] `next` komutu gerçek görevleri döndürdü
- [x] Güvenlik başlıkları yerel yanıtta doğrulandı
- [x] 390×844 mobil görünümde yatay taşma yok
- [x] Masaüstü görünüm mevcut terminal kompozisyonuyla aynı
- [x] Komut satırı kısa masaüstü görünümde ekranın altına oturuyor
- [x] DOS blok imleci boş inputta, yazı sonunda ve caret güncellemelerinde giriş noktasını takip ediyor
- [x] LL2 `upcoming` cevabında kalmış 15 saatlik tamamlanmış görev otomatik elendi
- [x] Ana panel ve `next` komutu aynı gerçek gelecek görevini gösteriyor
- [x] Faz 1 komut envanterinde `sound on|off` görünüyor
- [x] Ses hattı SAFE durumunda sinema akışı hatasız çalışıyor
- [x] Canlı üretimde `sound` komutu SAFE durumunu doğru bildiriyor
- [x] Canlı `launch.mp3` varlığı, MIME türü ve medya CSP izni doğrulandı
- [x] Uzak görevde priority/track override gizli ve standart sekme başlığı korunuyor
- [x] Yakın görev eşikleri, HOLD/TBD ve T-/T+ başlık biçimleri deterministik kontrol edildi
- [x] Prompt caret stili LL2 bağlantı yükleme imlecinden izole edildi
- [x] Black Box boş durum, clearance, export-empty ve silme interlock komutları tarayıcıda doğrulandı
- [x] Black Box yazma ve aynı görevi tekilleştirme davranışı deterministik test edildi
- [x] Tüm clearance eşikleri ve dolu logbook JSON dışa aktarma bağlantısı test edildi
- [x] Aynı görev için patch çıktısının birebir deterministik, farklı görev için benzersiz olduğu test edildi
- [x] Mission patch bütün satırlarda 44, flight record 48 sütun olarak doğrulandı
- [x] `patch`, `share` ve `copy patch` komutları gerçek görev verisiyle tarayıcıda doğrulandı
- [x] X, Reddit ve Show HN paylaşım bağlantıları ile clipboard başarı mesajı doğrulandı
- [x] `signal` komutunun UTC gününe göre deterministik çıktısı tarayıcıda doğrulandı
- [x] `/classified` listeleme, binary dosya okuma ve `AD ASTRA` decode akışı doğrulandı
- [x] Black Box seal erişiminin boş gerçek görev günlüğünde reddedildiği doğrulandı
- [x] NOAA planetary K-index yanıt ayrıştırıcısı ve G0–G5 eşikleri deterministik test edildi
- [x] NOAA erişilemediğinde `solar` komutunun kontrollü hata durumuna düştüğü doğrulandı
- [x] `/live`, `/launch`, `/iss`, `/solar` ve `/felicette` rotalarının yerelde HTTP 200 döndürdüğü doğrulandı
- [x] Beş rotanın title ve canonical metadatasının birbirinden doğru biçimde ayrıldığı doğrulandı
- [x] `/solar/` biçiminin `/solar` canonical adresine 301 yönlendiği doğrulandı
- [x] Her giriş rotasının karşılık gelen terminal komutunu otomatik çalıştırdığı gerçek tarayıcıda doğrulandı
- [x] Rota-özel sekme başlığının terminalin canlı title döngüsünden sonra da korunduğu üretimde doğrulandı
- [x] Tarayıcı konsolunda hata veya uyarı yok

## Dağıtım

- Durum: üretime dağıtıldı ve özel alan adında doğrulandı.
- Üretim URL: `https://spacecat.watch`
- Son Cloudflare Pages deployment: `c2aeb09b`
- Son deployment URL: `https://c2aeb09b.spacecat.pages.dev`
- Dağıtım yöntemi: `wrangler pages deploy web --project-name spacecat`
- Canlı HTML'de LL2 v2.3, alt terminal yerleşimi ve takip eden DOS caret kodu doğrulandı.
- Canlı ana panelin tamamlanmış görevi atlayıp gerçek sıradaki göreve geçtiği doğrulandı.
- Faz 1 priority traffic, canlı başlık ve kullanıcı kontrollü audio bus kodu üretimde doğrulandı.
- Faz 2 yerel Black Box günlüğü ve Faz 3 deterministik görev izleri üretimde doğrulandı.
- Faz 4 NOAA solar uplink, günlük sinyal ve `/classified` keşif katmanı üretimde doğrulandı.
- Faz 5 doğrudan terminal giriş rotaları, rota-özel metadata ve çalışan sekme başlıkları üretimde doğrulandı.
- Faz 6 SpaceCatOS sanal dosya sistemi, değişen çalışma dizini promptu ve sosyal relay kanalları üretimde doğrulandı.
- Faz 7 koşullu anomaly buffer ve bugünün gerçek dolunay mount'u üretimde doğrulandı.
- Canlı CSP içinde doğrudan LL2 bağlantı izni doğrulandı.
- Canlı CSP içinde doğrudan NOAA SWPC bağlantı izni doğrulandı.
- `www.spacecat.watch` yönlendirmesinin path ve query bilgisini koruduğu doğrulandı.
- Canlı tarayıcı konsolunda hata veya uyarı görülmedi.

## Geri dönüş

Cloudflare Pages panelindeki önceki başarılı deployment tek tıkla yeniden üretime alınabilir. Yerel kaynak tarafında bu dosyada listelenen değişiklikler `web/_worker.js`, metadata/erişilebilirlik satırları, `robots.txt`, `sitemap.xml`, `privacy.html` ve `web/README.md` ile sınırlıdır.

## 2026-07-31 — Codex operasyon tutarlılığı

- X botunun yeni `ll2:prod` üretim cache mimarisiyle eski debug probu arasındaki anahtar uyuşmazlığı giderildi.
- `debug=1` artık üretim cache boyutunu, zamanını ve yaşını gösterir; eski `ll2:cache` anahtarının varlığını yalnızca geçiş teşhisi olarak raporlar.
- `SON_DURUM.md` içindeki eski 60 dakikalık cache açıklaması kaldırıldı ve `86400` saniyelik TTL açık biçimde 24 saat olarak yazıldı.
- Canlı dry-run sırasında LL2 `429` verdiğinde lldev verisinin görüntülenip otomatik X paylaşımının kilitlendiği doğrulandı.

## Faz 6 — SpaceCatOS sanal dosya sistemi

- Terminalin çalışma dizini `/home/visitor` olarak tanımlandı; prompt artık aktif dizini gerçek bir shell gibi gösterir.
- `pwd`, `cd`, `ls -a`, `tree`, `cat`, `grep`, `strings`, `xxd`, `hexdump` ve `man` komutları eklendi.
- `ps`, `uptime` ve `who` komutları yardım listesinin dışında bırakılan keşif komutları olarak çalışır.
- Sanal dosya sistemi tamamen tarayıcıda, canlı ve cihaz-yerel veriden anlık oluşturulur:
  - `/missions`: LL2'den gelen sıradaki görev, program ve numaralı görev dosyaları.
  - `/proc/orbit`: sıradaki görevin canlı durum ve T-0 görünümü.
  - `/proc/clearance`: cihazdaki gerçek Black Box kayıt sayısına bağlı clearance.
  - `/var/log`: boot, uplink ve mevcut terminal oturumu kayıtları.
  - `/dev/deepspace`: o günün deterministik derin uzay sinyali.
  - `/home/visitor/flight-records`: yalnızca bu cihazda mühürlenmiş gerçek T-0 kayıtları.
  - `/classified`: gizli carrier ipucu, binary sinyal, Félicette kaydı ve izin kontrollü Black Box mührü.
- `strings /classified/signal-01.bin`, binary taşıyıcıdan `AD ASTRA` mesajını çıkarır; `xxd` aynı dosyayı hex telemetrisi olarak gösterir.
- `grep` bir dosyayı veya bütün sanal dizin ağacını arayabilir.
- Black Box mührü ve uçuş kayıtları mevcut güvenlik kuralını korur: gerçek T-0 tanıklığı olmayan cihazda içerik açılmaz.
- `help` yalnızca dosya sisteminin giriş komutlarını gösterir; tüm executable'ları açıklamayarak keşif duygusunu korur.
- Aktif sosyal hesaplar DOS görünümünü bozmadan `/home/visitor/social.links`, `social`, `x` ve `instagram` üzerinden `@spacecatwatch` relay kanallarına bağlandı.
- Flight record içindeki eski hash deep-link, canonical `/launch` rotasına taşındı.

### Faz 6 doğrulaması

- [x] Ana JavaScript ve Worker sözdizimi doğrulandı
- [x] `pwd`, mutlak/göreli `cd`, `cd ..`, `cd ~` ve dizine göre değişen prompt gerçek tarayıcıda doğrulandı
- [x] `ls`, `ls -a` ve `tree /` dinamik görevlerle doğrulandı
- [x] Canlı LL2 görevi `/missions/next.launch` içinden okundu
- [x] `strings`, `xxd`, recursive `grep`, `man` ve Black Box permission-denied akışları doğrulandı
- [x] X ve Instagram relay bağlantıları doğru hesap URL'leriyle doğrulandı
- [x] 390×844 mobil görünümde sanal dosya ağacı ve fırlatma sineması yatay taşma üretmedi
- [x] Masaüstü görünüm 1280 px genişlikte taşmasız kaldı
- [x] Tarayıcı hata/uyarı günlüğü boş

## Faz 7 — Koşullu anomaliler

- SpaceCatOS her dosya sistemi okumasında gerçek koşulları yeniden değerlendiren bir anomaly buffer kazandı.
- `scan` ve gizli alias `anomaly`, yalnız o anda etkin koşulları gösterir; hiçbiri etkin değilse açık biçimde nominal durum döndürür.
- Anomali dosyaları şart oluştuğunda `/classified` altında mount edilir, şart ortadan kalkınca kendiliğinden kaybolur:
  - `lunar-window.log`: onboard saf matematik hesabı dolunay penceresindeyse.
  - `countdown.override`: gerçek LL2 görevi T-10 ile T+60 dakika arasındaysa.
  - `solar-event.log`: son altı saatlik NOAA cache'inde Kp ≥ 5 ise.
  - `felicette.protocol`: 18 Ekim UTC Félicette yıldönümünde.
  - `unknown-carrier.log`: bütün dünyada aynı UTC gününde oluşan seyrek deterministik carrier koşulunda.
- `/proc/anomalies` her zaman okunabilir makine durumu sağlar.
- En az bir koşul etkinse `/var/log/anomaly.log`, aynı olayların UTC kayıtlarını oluşturur.
- Koşullar kullanıcı hesabı, cron, editoryal içerik veya yeni backend gerektirmez; canlı veri, cihaz cache'i, UTC ve matematikten türetilir.
- Anomali komutları ana `help` listesine konmadı. Kullanıcı `.carrier`, `/proc` ve terminal keşfi üzerinden bunlara ulaşır.

### Faz 7 doğrulaması

- [x] 2026-07-31 gerçek dolunay penceresi `scan` tarafından bulundu
- [x] `lunar-window.log`, `/classified` altında koşullu olarak mount edildi ve doğru ay yaşı/aydınlanma değerini verdi
- [x] `/proc/anomalies` canlı koşulla eşleşti
- [x] Sabit nötr tarihte anomaly buffer'ın boş olduğu deterministik test edildi
- [x] 18 Ekim Félicette protokolü deterministik test edildi
- [x] T-5 dakika gerçek görev kuralı countdown override üretti
- [x] Kp 6.4 cache koşulu NOAA G2 solar event üretti
- [x] Ana JavaScript sözdizimi ve mevcut Faz 6 dosya komutları regresyon testinden geçti

## Faz 7.5 — Ücretsiz veri omurgası ve bot kota dayanıklılığı

- Web sitesi ile Wear OS/watchOS uygulamalarının ziyaretçi/cihaz başına doğrudan LL2 erişimi değiştirilmedi; merkezi proxy ve ücretli API maliyeti eklenmedi.
- X Worker cron'u 15 dakikada bir uyanmaya devam eder, ancak LL2 üretim sorgusu artık en yakın göreve göre adaptiftir:
  - son dört saat: 15 dakika
  - 4–12 saat: 30 dakika
  - 12–48 saat: 60 dakika
  - daha uzak: 180 dakika
- LL2 `429` ve ağ hatalarında `Retry-After` dikkate alınır; aksi durumda sorgular 30 dakikadan 360 dakikaya kadar katlanarak geri çekilir.
- Son güvenilir LL2 üretim snapshot'ı uyarı hassasiyetine göre sınırlandırılır: T-180 ile kesin sonuçlar için üç saat, T-60 için 75 dakika, T-10 için 30 dakika.
- Yakın görevde LL2 snapshot'ı T-60 güven eşiğini aşmışsa bot önce ücretsiz ikinci kaynakla kesin T-0 arar; bulamazsa eski saate dayanarak paylaşım yapmaz.
- Güvenilir LL2 verisi yoksa RocketLaunch.Live'ın ücretsiz sıradaki beş görev akışı soğuk yedek olur.
- İkinci kaynak yalnız kesin `t0` taşıyan görevlerde T-180 ve T-60 uyarısına yetkilidir. T-10 ile başarı/başarısızlık kararları LL2 olmadan paylaşılmaz.
- LL2 ve RocketLaunch.Live görev adları araç önekleri, `Group` sözcüğü ve noktalama farklarından arındırılarak aynı tekilleştirme anahtarına bağlanır.
- Bayat ve sınırlı `lldev` verisi üretim botu karar zincirinden tamamen çıkarıldı.
- `debug=1` çıktısı artık LL2/RocketLaunch.Live cache yaşlarını, adaptif yenileme aralığını, son upstream durumunu, ardışık hata sayısını ve sonraki LL2 deneme zamanını gösterir.
- `force=1`, yalnız elle sağlık testi için adaptif bekleme/backoff kapısını atlar.

### Faz 7.5 doğrulaması

- [x] Worker paketi Wrangler dry-run ile derlendi
- [x] Yerel canlı LL2 isteği üretim snapshot'ı oluşturdu ve sonraki sorguyu görev uzaklığına göre 60 dakika sonrasına aldı
- [x] İkinci yerel çalıştırma ağ isteği atmadan adaptif cache kullandı
- [x] LL2 snapshot'ı kaldırılıp 429 backoff durumu simüle edildi; ücretsiz RocketLaunch.Live soğuk yedeği devreye girdi
- [x] Yedek şema yalnız kesin T-0 kayıtlarını normalize etti
- [x] Worker `d01b8dec-408d-420f-b945-933155725df2` sürümüyle canlıya alındı
- [x] Canlı dry-run gerçek LL2 `429` yanıtında 15 dakikalık `Retry-After` uyguladı ve RocketLaunch.Live'a geçti
- [x] Canlı sağlık probunda `rll:prod` snapshot'ı, upstream sayaçları ve sonraki LL2 deneme zamanı doğrulandı
- [x] Hiçbir ücretli API veya yeni aylık servis eklenmedi

## Faz 8 — Black Box clearance katmanları

- Clearance unvanları dekor olmaktan çıkarıldı; yalnız bu cihazda mühürlenmiş gerçek T-0 kayıt sayısı güvenli dizinleri ve executable'ları fiilen açar.
- Simüle edilen `sudo launch`, tarihî `replay`, hesap, ödeme veya query parametresi clearance yükseltemez.
- Katmanlar:

| Mühürlü görev | Clearance | Yeni mount | Yeni executable |
|---:|---|---|---|
| 0 | Observer | — | — |
| 1 | Flight Controller | `/ops` | `status` |
| 3 | Guidance | `/guidance` | `vector [n]` |
| 5 | Mission Specialist | `/archive` | `debrief [n]` |
| 10 | CAPCOM | `/comms` | `transmit <message>` |
| 25 | Flight Director | `/director` | `poll` |
| 50 | Orbital Veteran | `/vault` | `seal` |

- `/ops` canlı konsol durumunu, watchstanding özetini ve gizli uçuş kontrol emrini taşır.
- `/guidance` LL2 T-0/yerel saat çözümünü ve gerçek Black Box tanıklık farklarını vektör olarak üretir; araç telemetrisi taklidi yapmaz.
- `/archive` cihazdaki gerçek uçuş indeksini ve mevcut tarihî tape arşivini dosya sistemi içinde açar.
- `/comms` Quindar referanslarını, CAPCOM loop durumunu ve yalnız localStorage'a yazılan ağsız loopback mesajlarını taşır. `transmit` hiçbir veriyi cihaz dışına göndermez.
- `/director` mevcut görev durumu, GO olasılığı ve varsa NOAA cache'iyle bir danışma matrisi üretir; gerçek fırlatma otoritesinin sağlayıcıda olduğunu açıkça yazar.
- `/vault` Félicette anahtarını, son taşıyıcı metnini ve `strings` ile çözülebilen veteran star-map payload'unu açar.
- `clearance`, `/proc/clearance` ve `/proc/mounts` o cihazın gerçek yetki/mount durumunu anlık gösterir.
- Kilitli mount'lar `tree /` içinde görünmez. Yol tahmin edilirse shell “clearance denied” ve gereken gerçek görev sayısını döndürür.
- Kilitli executable'lar TAB tamamlamada görünmez ve doğrudan çağrıldığında merkezi komut kapısından reddedilir.
- Black Box silinirse mount ve executable yetkileri aynı anda geri alınır; kullanıcı kilitlenen bir dizinin içindeyse göreli erişim de reddedilir.
- Gerçek T-0 yeni bir eşiği geçirdiğinde terminal Black Box mührünün yanında eski/yeni clearance, açılan mount ve executable'ı bildirir.
- Shell komut adları case-insensitive kalırken dosya yolları ve CAPCOM payload'ları artık büyük/küçük harfi korur; `cat README.txt` gerçek shell davranışıyla çalışır.

### Faz 8 doğrulaması

- [x] Ana JavaScript sözdizimi `new Function` ile doğrulandı
- [x] 0/1/3/5/10/25/50 kayıtlı sentetik localStorage profillerinin tamamı ayrı tarayıcı context'lerinde test edildi
- [x] Her seviyenin mount'u, executable'ı ve bir sonraki kilit kapısı doğrulandı
- [x] CAPCOM mesajının büyük/küçük harfi koruduğu ve yalnız `/comms/relay.log` içine yazıldığı doğrulandı
- [x] Orbital Veteran binary payload'u `strings /vault/star-map.bin` ile çözüldü
- [x] Kilitli komutların TAB tamamlamadan saklandığı doğrulandı
- [x] Black Box silindikten sonra aktif güvenli dizinin anında yeniden kilitlendiği doğrulandı
- [x] Yerel, gerçek-clock T-0 provasında Black Box kaydı ve `OBSERVER → FLIGHT CONTROLLER` elevation bildirimi uçtan uca doğrulandı
- [x] 390×844 mobil Observer ve Orbital Veteran görünümlerinde yatay taşma oluşmadı
- [x] Mevcut help, filesystem, anomaly, binary carrier ve man sayfaları regresyon testinden geçti
- [x] Yeni backend, hesap, ücretli API veya bakım gerektiren içerik eklenmedi
- [x] Cloudflare Pages production dağıtımı `94299b37-4900-4ac6-8d78-dccdc6c659ba` ile tamamlandı
- [x] `https://spacecat.watch` üzerinde Observer smoke testi, kilitli `/ops` reddi, case-sensitive `README.txt` ve 390 px taşma kontrolü doğrulandı

## Faz 9 — Experience Kernel ve tasarım anayasası

- Terminal büyürken animasyon ve özellik çöplüğüne dönüşmesin diye merkezi bir
  `EXPERIENCE_REGISTRY` ve yaşam döngüsü çekirdeği eklendi.
- `cinema`, tarihî `replay`, gerçek `live` ve `iss` tek baskın deneyim kuralına bağlandı.
- Baskın deneyim başlangıcı komut satırını devre dışı bırakır; bitişi prompt'u ve odağı tek
  noktadan geri getirir.
- Her sahnenin interval, timeout ve event listener'ı kernel kaynak havuzuna kaydolur. ESC veya
  sahne tıklaması kaynakların tamamını temizler; görünmez timer/listener bırakmaz.
- CAPCOM `radio`, baskın bir deneyim başlarken otomatik kapanır. Böylece Quindar ambiyansı ile
  fırlatma sesi üst üste binmez.
- `ping felicette` zincir timeout'ları da kernel yönetimine taşındı; yeni ping eski zinciri
  temizler.
- Ses fade işlemi ayrı kernel kaynağına alındı; yeni sahne eskiden kalan fade/ses kuyruğunu
  temizler.
- Runtime gözlemi için `/proc/experience` eklendi. Aktif dominant deneyimi, reduced-motion
  durumunu, kayıtlı deneyimleri ve aktif kaynak sayılarını gösterir.
- `docs/EXPERIENCE_BIBLE.md` oluşturuldu. Terminal kimliği, hareket bütçesi, fikir kabul kapısı,
  gizli komut politikası ve Lunar Lander sınırları burada kalıcılaştırıldı.
- Patent/kopya koruma yoluna gidilmedi; tasarım üstünlüğü davranış bütünlüğü ve canlı sistem
  derinliğinde tutuldu.

### Faz 9 doğrulama hedefleri

- [x] Ana JavaScript ve `_worker.js` sözdizimi
- [x] Sinema, replay, live ve ISS için ESC sonrası `DOMINANT IDLE`
- [x] Radyo açıkken baskın deneyimin radyoyu temizlemesi
- [x] Tekrarlı giriş/çıkışta bütün dominant kaynak sayaçlarının sıfıra dönmesi
- [x] Reduced-motion hızlı fırlatma yolunun aynı `endCard → experienceEnd` temizliğine bağlanması
- [x] 390×844 mobil sinema ve 1280 px masaüstü yatay taşma kontrolü
- [x] Tarayıcı hata/uyarı günlüğünün boş kalması
- [x] Cloudflare Pages production dağıtımı `b97c574c-d7ff-4476-8e19-a72f5bf22c5b`
- [x] `https://spacecat.watch` üzerinde `/proc/experience`, sinema ESC/prompt dönüşü,
  390 px yatay taşma ve tarayıcı hata günlüğü smoke testi

## Faz 9.1 — Gerçek görev senaryoları

- LL2 durum metinleri merkezi `missionDisposition` motorunda `GO`, `FLIGHT`, `HOLD`,
  `UNCONFIRMED`, `SCRUB`, `SUCCESS`, `PARTIAL`, `FAILURE` veya güvenli `UNKNOWN`
  durumuna çevriliyor.
- Gerçek `track` sahnesindeki önemli doğruluk açığı kapatıldı: HOLD, TBD/TBC ve bilinmeyen
  görevler planlanan T-0 geçse bile modellenmiş yükselişi başlatmıyor. Araç pad'de ve servis
  koluna bağlı kalıyor.
- Scrub/success/failure gibi final LL2 durumları gerçek outcome kartına geçiyor. GO veya
  başka kesinleşmemiş statüde modellenmiş profil biterse terminal `RESULT PENDING` diyerek
  provider teyidini bekliyor.
- `sudo launch` artık `MISSION COMPLETE — ORBIT ACHIEVED` iddiası üretmiyor;
  `SIMULATION COMPLETE — PROFILE ENDED` ve `NOT FLIGHT TELEMETRY` gösteriyor.
- Tarihî replay kayıtları kendi doğrulanmış arşiv sonlarını koruyor.
- T-0 değişiklikleri `retargetDirective` ile gecikme/öne çekilme yönü ve dakika farkına
  dönüştürülüyor. Yeni T-0 geldiğinde olay işaretleri, ignition, smoke ve pad ışığı güvenli
  biçimde yeniden kuruluyor.
- Araç adına göre altı düşük bakım profili eklendi: `LIGHT`, `CORE`, `HEAVY`, `SHIP`,
  `WING`, `BOOST`. Aynı render motoru kullanıldığı için yeni animasyon sistemi oluşmadı.
- Pad ışığı koordinat, UTC ve equation-of-time hesabıyla `DAY`, `NIGHT`, `DAWN`, `DUSK`
  olarak onboard hesaplanıyor. Gündüz pad'de yıldızlar bastırılıyor; yüksek irtifada geri
  geliyor.
- Mevcut Open-Meteo kaynağı ortak `getPadWeather` katmanına alındı. Son pad snapshot'ı
  cihazda 30 dakika cache edilir; sinema/live telemetrisine `WX NOW` olarak yansır.
- Hava verisi hiçbir zaman T-0 tahmini gibi sunulmaz. `wx` çıktısı gözlem zamanını ve
  `not a T-0 forecast` uyarısını taşır.
- Saf karar fonksiyonları için kalıcı test aracı eklendi:
  `node tools/test_web_phase9.js`.

### Faz 9.1 doğrulaması

- [x] 29 deterministik durum, live gate, retarget, outcome, pad ışığı ve araç profili testi
- [x] Ana JavaScript ve `_worker.js` sözdizimi
- [x] Gerçek tarayıcıda `CORE DAY`, güncel `WX NOW` ve Open-Meteo cache akışı
- [x] Simülasyon bitişinde gerçek başarı iddiası bulunmaması
- [x] Félicette tarihî replay sonucunun korunması
- [x] Live GO sahnesinin gerçek countdown, status ve modellenmiş telemetri ayrımını koruması
- [x] ESC sonrası Experience Kernel kaynaklarının sıfıra dönmesi
- [x] 390×844 mobil ve 1280 px masaüstü yatay taşma kontrolü
- [x] Tarayıcı hata/uyarı günlüğünün boş kalması
- [x] Cloudflare Pages production dağıtımı `356833e4-fc82-402b-a89f-9aaf84fefe79`
- [x] `https://spacecat.watch` üzerinde `CORE DAY`, `WX NOW`, dürüst simulation card,
  390 px taşma ve boş tarayıcı hata günlüğü smoke testi

## Faz 9.2 — Terminal Reaction Pack

- Terminal derinliği kontrollü bir bütçeyle 11 DOS/yerel-hacker davranışında donduruldu:
  `whoami`, `ping felicette`, `ver`, `dir`, `type`, `mem`, `chkdsk`, `tracert`,
  `echo`, `format`, `nmap`.
- `traceroute`, aynı tracert davranışının uyumluluk alias'ıdır; ayrı özellik sayılmaz.
- Yeni komutların hiçbiri ana `help` listesine eklenmedi.
- `/var/log/.maintenance`, yalnız `ls -a` ile görülen keşif izi olarak mount edildi.
  İçerik kullanıcıyı `VER`, `DIR /W`, `TYPE`, `MEM`, `CHKDSK` ve `TRACERT` zincirine taşır.
- `DIR /W`, mevcut sanal dosya sistemi ve clearance kapılarını kullanır; kilitli dizinleri
  atlayamaz. `/A` gizli dosyaları gösterir.
- `TYPE`, aynı permission-aware `cat` yolunu kullanır.
- `MEM`, mevcut komut geçmişi, cihazdaki Black Box sektörleri ve Experience Kernel kaynak
  sayısından deterministik bir DOS bellek raporu üretir.
- `CHKDSK`, root mount, Black Box ve koşullu anomaly durumunu okur; hiçbir dosyayı değiştirmez.
- `TRACERT`, gecikmeli terminal çıktısını kernel `trace` kaynak havuzunda çalıştırır. Yeni bir
  trace eski timeout zincirini temizler. Başlık ve sonuç bunun local simulation olduğunu,
  cihazdan paket çıkmadığını açıkça söyler.
- `NMAP`, terminalin yerel servis tiyatrosunu gösterir; `fetch`, WebSocket veya başka ağ
  mekanizması çalıştırmaz.
- `FORMAT`, onay sorusunu kendi kendine `N` ile cevaplar. Black Box/localStorage dahil hiçbir
  veriyi silmez ve `0 bytes written` raporlar.
- `ECHO`, kullanıcının büyük/küçük harfini korur ve HTML payload'ını escape eder.
- Kalıcı güvenlik/regresyon aracı eklendi: `node tools/test_web_reactions.js`.

### Faz 9.2 doğrulaması

- [x] 33 statik kayıt, gizlilik, kernel, ağsızlık ve non-destructive güvenlik kontrolü
- [x] Faz 9.1'in 29 deterministik regresyon testi
- [x] Gizli `.maintenance` keşif zinciri ve ana help'ten saklanma
- [x] `DIR /W`, `MEM`, `CHKDSK`, `NMAP`, `FORMAT` ve case-preserving `ECHO`
- [x] HTML payload'ının DOM'a etiket olarak enjekte edilememesi
- [x] İkinci tracert başlatıldığında ilkinin timeout zincirinin temizlenmesi
- [x] Tracert sonunda kernel `resources=0`
- [x] 390×844 mobil ve 1280 px masaüstü yatay taşma kontrolü
- [x] Tarayıcı hata/uyarı günlüğünün boş kalması
- [x] Cloudflare Pages production dağıtımı `c4d0449d-0beb-40fb-b2aa-933b827fcf89`
- [x] `https://spacecat.watch` üzerinde `.maintenance`, güvenli `FORMAT`, tamamlanan
  `TRACERT`, kernel `resources=0`, 390 px taşma ve boş hata günlüğü smoke testi

## Faz 9.3 — Mobile Release Gate

Mobil uyumluluk bundan sonra sonradan yapılan bir görsel kontrol değil, her deneyim için
zorunlu yayın kapısıdır.

- Ana terminal ve gizlilik sayfası `viewport-fit=cover` ve dört yönlü safe-area padding
  kullanır. `100vh` fallback'i korunurken destekleyen tarayıcılarda `100dvh` devreye girer.
- Mobil terminal girişi 16 px'dir; iOS odaklandığında sayfanın istemsiz yakınlaşması
  engellenir. Otomatik düzeltme kapalı, sanal klavye Enter etiketi `send` olarak ayarlıdır.
- CTA ve sahne çıkışları en az 44 px dokunma yüksekliğine sahiptir.
- Canlı takip, ASCII sinema ve ISS ekranı artık görünür `ESC / TAP` düğmeleriyle telefondan
  kapatılabilir. Sahnenin kendisine dokunmak yanlışlıkla çıkış üretmez.
- Tamamlanmış sahnelerin çıkış düğmeleri pasifleştirilir; terminal geçmişinde sahte aktif
  kontrol bırakılmaz.
- 430 px genişlikte hero flex düzeninin ürettiği 512 px yatay taşma bulundu ve mobilde tek
  sütuna geçilerek giderildi.
- Kısa telefon landscape görünümü için ayrı safe-area ve dikey boşluk kuralı eklendi.
- Kalıcı regresyon aracı: `node tools/test_web_mobile.js`.

### Faz 9.3 doğrulaması

- [x] 27 statik mobil, safe-area, klavye, dokunma ve cleanup kontrolü
- [x] Faz 9.1'in 29 ve Faz 9.2'nin 33 regresyon testi
- [x] 320×568, 360×800, 390×844 ve 430×932 dikey telefon matrisi
- [x] 844×390 kısa landscape görünümü
- [x] Bütün dikey genişliklerde `scrollWidth === viewport width`
- [x] 390 px gerçek tarayıcıda `track`, `sudo launch` ve `iss` dokunmatik çıkışları
- [x] Sahneye yanlışlıkla dokunmanın canlı takibi kapatmaması
- [x] Cloudflare Pages production dağıtımı `07b3743f-bbc9-4048-8d4f-72ab835a83c0`
- [x] `https://spacecat.watch` üzerinde 390 px `track` touch çıkışı, prompt dönüşü,
  16 px mobil input, sıfır yatay taşma ve boş hata günlüğü
- [x] Canlı `/privacy` sayfasında 320 px sıfır yatay taşma ve boş hata günlüğü

## Faz 9.4 — Search & Discovery Gate

- JavaScript öncesinde boş kalan `#output`, aynı DOS tasarımını kullanan gerçek bir
  progressive-enhancement terminal kabuğuna dönüştürüldü.
- Ham HTML artık görünür H1, ürün açıklaması, Google Play CTA'sı, platform durumu,
  data-source notu ve altı crawlable terminal bağlantısı içeriyor.
- JavaScript hazır olduğunda bu kabuğu temizleyip mevcut boot/live terminalini aynı yerde
  başlatıyor. Kullanıcı görünümü değişmedi; botlara ayrı veya gizli içerik sunulmuyor.
- Worker deep-link rotalarında yalnız head metadata'sını değil, görünür statik başlığı,
  açıklamayı ve `WebPage` JSON-LD kimliğini de route'a özgü üretiyor.
- Entity graphı `WebPage`, `WebSite`, `Organization` ve
  `MobileApplication + SoftwareApplication` ilişkilerini kuruyor; Google Play, X ve
  Instagram canonical kimlik sinyallerine bağlandı.
- Gerçek rating/review bulunmadığı için sahte rich-result verisi eklenmedi.
- `sitemap.xml`, kaynak dosyaların mtime değerlerinden üretilebilen yedi canonical URL'lik
  sade bir sitemap oldu.
- Deneysel `llms.txt` eklendi; canonical HTML'nin asıl kaynak olduğu dosyanın içinde açıkça
  belirtiliyor.
- IndexNow sahiplik dosyası ve `node tools/submit_indexnow.js` aracı eklendi.
- İlk production IndexNow bildirimi yedi URL için `HTTP 202` ile kabul edildi.
- Kalıcı regresyon aracı: `node tools/test_web_seo.js`.

### Faz 9.4 doğrulaması

- [x] 39 robots, sitemap, static HTML, internal-link, JSON-LD, Worker ve llms kontrolü
- [x] Faz 9.1'in 29, Faz 9.2'nin 33 ve Mobile Gate'in 27 regresyon kontrolü
- [x] Gerçek Worker'da `/`, `/live`, `/launch`, `/iss`, `/solar`, `/felicette` ham kaynakları
- [x] Route-specific title, canonical, görünür H2/açıklama ve JSON-LD `WebPage`
- [x] Production Googlebot isteğinde crawlable ürün metni ve entity graphı
- [x] Production tarayıcıda statik kabuktan canlı terminale tek H1 ile temiz yükseltme
- [x] `/live` deep-link otomatik giriş, touch exit, prompt dönüşü ve boş hata günlüğü
- [x] Cloudflare Pages production `77aa80d3-ccbc-437e-8b46-79e5fd2d22af`
- [x] Google Search Console Domain property DNS doğrulaması, sitemap gönderimi ve yedi
  canonical URL için tek seferlik dizine ekleme isteği

**Manuel hesap adımı:** `docs/SEARCH_DISCOVERY_RUNBOOK.md`.

## Faz 10 — Lunar Lander Training Program — TAMAMLANDI

Başlangıç kararı:

- Tek oyun; terminal evreni içinde ve ilk `help` ekranından gizli.
- Keşif bir sanal dosya izi üzerinden yapılacak.
- Basit, deterministik ve test edilebilir uçuş fiziği kullanılacak.
- Klavye ile touch aynı kontrol sözleşmesine bağlanacak.
- Skor yalnız cihazda tutulacak; Black Box clearance üretmeyecek.
- Ağ, hesap, global leaderboard, yeni API veya aylık servis olmayacak.
- Experience Kernel `lander` dominant deneyiminin bütün timer/listener/çıkış temizliğini
  yönetecek.
- İlk yayın yalnız çekirdek oyunu kapsayacak; görev paketleri ve ekstra yüzeyler sonraki
  değerlendirmeye bırakılacak.

### Faz 10 çalışma kapıları

- [x] Faz başlangıç kaydı ve kapsam dondurma
- [x] `/usr/games/README.TXT → LANDER.COM → lander` sanal dosya keşif izi
- [x] Sabit başlangıç koşullu deterministik fizik çekirdeği
- [x] 48×22 ASCII yüzey, pad ve araç renderer'ı
- [x] Klavye + press-and-hold pointer kontrol sözleşmesi
- [x] `sc_lander_v1` cihaz-yerel skor ve `/usr/games/SCORES.DAT`
- [x] Experience Kernel ESC/TAP cleanup
- [x] `node tools/test_web_lander.js` — 43 deterministik/güvenlik kontrolü
- [x] 1280×900 masaüstü keşif, doğal crash, retry, skor dosyası ve cleanup QA
- [x] 320×568 mobilde sıfır yatay taşma, 44 px uçuş/çıkış kontrolleri ve 16 px input
- [x] Faz 9.1 + Reaction Pack + Mobile Gate + SEO dahil toplam 171 kontrol
- [x] Cloudflare Pages production dağıtımı
  `3a46a55c-6ead-43aa-89dd-ea1c959ce003`
- [x] `https://spacecat.watch` üzerinde 320×568 Lander başlangıcı, kontrol hedefleri,
  sıfır yatay taşma, TAP cleanup ve boş tarayıcı hata günlüğü
- [x] Sitemap yenileme ve yedi canonical URL için IndexNow `HTTP 200`

İlk çekirdek kuralları:

- Sol/sağ veya A/D dönüş; W/yukarı/Space ana motor.
- Güvenli iniş: pad içinde, `|H/S| ≤ 0.8`, `V/S ≥ -0.85`, `|angle| ≤ 15°`.
- Skor yakıt, dikey/yatay hız ve araç açısını birlikte değerlendirir.
- Crash skoru `0`; oyun hiçbir Black Box kaydı veya clearance üretmez.
- `wargames`, oyuna ikinci ama yine gizli bir terminal kapısıdır.

### X API / bot sağlık kontrolü — CODEX — 31 Temmuz 2026

- Worker'daki `RUN_KEY` ve dört OAuth 1.0a X sırrının tamamı mevcut.
- `STATE` KV binding'i ve `*/15 * * * *` cron tanımı doğru; Wrangler dry-run derlemesi
  başarılı.
- Kimlik bilgileri salt-okunur `GET /2/users/me` çağrısında `HTTP 200` verdi ve
  `@spacecatwatch` hesabına bağlı olduğu doğrulandı.
- Botun `dry=1` uçtan uca kontrolü tweet atmadan başarıyla tamamlandı; aktif kaynak
  `ll2-cache`.
- Son LL2 ve RocketLaunch.Live istekleri `HTTP 200`; LL2 ardışık hata sayısı `0`.
- `POST /2/tweets` yalnız cron veya açıkça dry olmayan yetkili çağrıda çalışır; sağlık
  denetiminde gönderi yapılmadı.
- Sağlık kaydındaki eski `lastLl2Error: HTTP 429` alanı son başarılı çağrıdan sonra
  temizlenmediği için tarihsel/kozmetik bir izdir; aktif durum değildir.

**Canlı production:** Cloudflare Pages
`3a46a55c-6ead-43aa-89dd-ea1c959ce003` · `https://spacecat.watch`

## Faz 11 — Autonomous Watchstander — TAMAMLANDI

Amaç, yeni bir özellik yüzeyi eklemeden terminalin mevcut gerçek koşullara göre kendiliğinden
nöbet tutmasını sağlamaktır.

### Dondurulan kapsam

- Tek saf karar motoru: primary LL2 mission + yerel saat + varsa taze NOAA Kp cache'i.
- Durumlar: `UPLINK`, `NOMINAL`, `LAUNCH_DAY`, `PRIORITY`, `FINAL`, `HOLD`,
  `UNCONFIRMED`, `ASCENT`, `RESULT`, `SOLAR`.
- Normal durumda mevcut alt ipucu değişmez. Yalnız operasyonel durumda aynı DOS satırı
  `WATCH CONDITION` direktifine dönüşür.
- Derinlik yüzeyi: `/proc/watch` ve `/var/log/watch.log`.
- Ana `help` listesi, hero yerleşimi ve CTA değişmez.
- Yeni fetch, timer, notification, ses, localStorage yazımı, API veya aylık maliyet yok.
- Mevcut hero saniye döngüsü karar motorunu çağırır; state değişmedikçe DOM güncellenmez.

### Faz 11 çalışma kapıları

- [x] Kapsam, durum öncelikleri ve bakım bütçesi donduruldu
- [x] Saf Watchstander karar motoru
- [x] Prompt altı koşullu DOS direktifi
- [x] `/proc/watch` + `/var/log/watch.log`
- [x] 33 Watchstander kontrolü; bütün paketlerle toplam 204 regresyon kontrolü
- [x] 1280×900 masaüstünde güncel primary mission, gerçek T- saati ve `NOMINAL` raporu
- [x] 320×568 mobilde prompt/hint erişimi, 16 px input, sıfır yatay taşma ve boş hata günlüğü
- [x] `man watchstander` keşfi ve advisory-only yetki sınırı
- [x] Cloudflare Pages production dağıtımı
  `41552220-0e1d-41b7-8b29-9b8eb8484965`
- [x] `https://spacecat.watch` üzerinde boot clue, `/proc/watch`, gerçek primary T-,
  320 px taşma ve boş hata günlüğü smoke testi
- [x] Sitemap yenileme ve yedi canonical URL için IndexNow `HTTP 200`

**Canlı production:** Cloudflare Pages
`41552220-0e1d-41b7-8b29-9b8eb8484965` · `https://spacecat.watch`

## Premium RocketLaunch.Live standby — CODEX — 31 Temmuz 2026

- RocketLaunch.Live Premium minimum **$3/ay** üyeliği etkinleştirildi.
- Anahtar yerelde `keystore/rocketlaunch_live_api_key.txt` içinde `600` izniyle, üretimde
  Cloudflare Pages `ROCKETLAUNCH_API_KEY` şifreli secret binding'inde tutuluyor.
- LL2 primary akış ve kullanıcı başına doğrudan erişim değişmedi.
- LL2 başarısız olursa tarayıcı aynı-origin `/api/launches/upcoming` kasasını çağırır.
- Pages Worker premium isteği `Authorization: Bearer` ile yapar; anahtar URL'ye, kaynak
  pakete, terminal çıktısına veya JSON yanıtına girmez.
- RocketLaunch.Live'ın hem düz hem `{ response: ... }` premium yanıt biçimi desteklenir.
- Yalnız kesin `t0` taşıyan beş görev normalize edilir; edge cache `5 dk`, cihaz cache
  `10 dk`, yalnız kesinti durumunda son iyi cihaz verisi `60 dk` sınırındadır.
- Belirsiz premium görev `TBC` kalır. Program ve geri sayım çalışır; LL2 GO/in-flight
  otoritesi olmadan gerçek-zamanlı sahne pad'den ayrılmaz.
- `Data by RocketLaunch.Live (standby)` atfı statik ve dinamik terminal yüzeylerine eklendi.
- Premium origin istemci CSP'sine eklenmedi; tarayıcı sadece `'self'` endpoint'ini görür.
- `node tools/test_web_rll.js`: 24 kontrol. Bütün web paketleri toplam `241` kontrol geçti.
- Canlı endpoint ilk istekte `MISS`, ikinci istekte `HIT` ile `HTTP 200` ve beş görev
  döndürdü.

**Production:** `fd8be8e8-d42c-4f04-88d3-817832e5ee68` ·
`https://spacecat.watch`

**Maliyet etkisi:** RocketLaunch.Live **$3/ay**; ek Cloudflare ürünü veya veritabanı yok.

## Webcast Signal + çift kaynak T-0 kilidi — CODEX — 31 Temmuz 2026

- LL2 primary akış korunurken RocketLaunch.Live artık sağlıklı akışta da görev-adı bazlı
  schedule crosscheck sağlar.
- Sağlayıcı isimleri deterministik normalize edilir; yalnız açık eşleşme karşılaştırılır.
- `≤120 sn` fark `SOURCE LOCK · 2/2`, daha büyük fark `SCHEDULE DIVERGENCE`, eşleşme
  yokluğu `SINGLE SOURCE`, LL2 kesintisi `RLL STANDBY` olarak görünür.
- Crosscheck LL2 `net` veya status değerini değiştirmez. Belirsizlik uçuş otoritesine
  dönüşmez.
- Canlı Starlink 17-52 kaydı LL2 `02:00 UTC` / RLL `02:59 UTC` eşleşmesiyle
  `SCHEDULE DIVERGENCE · RLL +59 MIN` verdi.
- Worker yalnız allowlist içindeki HTTPS YouTube, X/Twitter ve Bilibili taşıyıcılarını
  normalize eder; ham premium payload ve secret tarayıcıya gönderilmez.
- `stream [n]` canlı/onaylı taşıyıcıyı seçer, ancak embed/autoplay yapmaz. Resmî yayın
  yalnız açık kullanıcı tıklamasıyla yeni sekmede açılır.
- Yeni keşif yüzeyleri: `crosscheck [n]`, `stream [n]`,
  `/missions/source-lock.status`, `/missions/next.broadcast`, hero/mission `VERIFY`.
- Şema ve cache yükseltmesi: endpoint `?schema=2`, payload `schema: 2`,
  `sc_rll_v2`, `sc_ll2_v6`.
- `node tools/test_web_rll.js`: 32 kontrol.
- `node tools/test_web_signal.js`: 25 kontrol.
- Sekiz web test paketi toplam **274** kontrol geçti.
- Canlı endpoint: `HTTP 200`, `MISS → HIT`, beş görev, güvenli X webcast'i, secret sızıntısı
  yok.

**Production:** `770ca101-356f-43d0-a0b3-a1f12ee0bf87` ·
`https://spacecat.watch`

**Maliyet:** Mevcut RocketLaunch.Live **$3/ay** dışında sıfır. Saat uygulaması değişmedi.

## Genel kod incelemesi sertleştirmesi — CODEX — 31 Temmuz 2026

- Tarayıcı LL2 isteği 8 saniye, RocketLaunch.Live crosscheck isteği 2.5 saniye ile
  sınırlandı; standby kaynak terminal açılışını sonsuza kadar bekletemez.
- Pages Worker premium upstream isteğine 8 saniyelik kesin deadline eklendi.
- Botun manuel yönetimi yalnız `POST` + `Authorization: Bearer` kabul eder. RUN_KEY URL,
  tarayıcı geçmişi ve proxy loglarına girmez; debug yolu artık KV'ye probe yazmayan salt-okunur
  rapordur. Yönetim yanıtları `Cache-Control: no-store` taşır.
- X API gönderimine 12 saniyelik deadline eklendi.
- `tools/test_bot_security.js` ile 8 bot güvenlik kapısı; RocketLaunch.Live paketi 35
  kontrol; sekiz web paketi toplam **277** kontrol.
- Cloudflare Pages ve Worker paketleri yerelde doğrulandı. 31 Temmuz 15:08–15:12 TSİ
  aralığındaki geçici 520/521/522 kesintisi sonrasında yönetim API'si toparlandı ve iki
  production dağıtımı da tamamlandı.
- Pages: `e684e6cd-3cf7-4a4c-995e-702f941254a3` ·
  `https://e684e6cd.spacecat.pages.dev` · özel alan adı `https://spacecat.watch`.
- Bot Worker: `88fca2d6-5b79-4de8-be0a-e362fec02937` · 15 dakikalık schedule aktif.
- Smoke test: site ve schema=2 launch endpoint'i `HTTP 200`; beş RocketLaunch.Live görevi;
  bot GET/yetkili debug `HTTP 200`, eksik ve hatalı Bearer çağrıları `HTTP 401`.

## Cloudflare Web Analytics API — CODEX — 31 Temmuz 2026

- `spacecat.watch` için Cloudflare Web Analytics otomatik kurulumu canlı ve veri topluyor.
- Botlar hariç son 24 saatlik panel/API doğrulaması: `74` ziyaret, `74` sayfa görüntüleme.
- Ayrı `spacecat-analytics-read` hesap tokenı oluşturuldu; tek yetkisi
  `Account Analytics Read`, yazma/deploy yetkisi yok.
- Token kaynak ağacına veya düz metin dosyaya konmadı; macOS Anahtar Zinciri'nde
  `spacecat.cloudflare.analytics-read` servisi altında saklanıyor.
- `node tools/read_web_analytics.js`, botsuz son 5 dakika, 24 saat ve 7 günlük ziyaret /
  sayfa görüntüleme sayılarını Cloudflare GraphQL Analytics API'den okur.
- `node tools/read_web_analytics.js --json`, aynı sonucu otomasyonlara uygun JSON üretir.
- Son 5 dakika metriği yalnız “yakın zamanlı etkinlik” göstergesidir; mahremiyet odaklı
  Web Analytics kesin eşzamanlı kullanıcı/kişi takibi yapmaz.
- Yeni istemci scripti, çerez, fingerprint, Durable Object veya ücretli servis eklenmedi.

## Terminal `home` komutu — CODEX — 31 Temmuz 2026

- Görünür `home` komutu terminal çıktısını ilk SPACE CAT hero/mission ekranına döndürür.
- Tam sayfa yenilemez; komut geçmişi ve açıkça kurulmuş ses tercihi aynı sekmede korunur.
- Eski hero sayaçları ve yarım kalan yerel `ping`/`tracert` efektleri temizlenir; çoğalan
  interval/listener bırakılmaz.
- Çalışma dizini `/home/visitor`, adres de canonical `/` durumuna alınır.
- Mobilde aynı terminal akışı ve mevcut prompt/caret sözleşmesi kullanılır.
- 39 reaction kontrolü dahil toplam 210 regresyon kontrolü geçti.
- 390×844 gerçek tarayıcı testinde `help → home`, tek H1/hero, odakta input, `390 px`
  scroll width ve boş hata günlüğü doğrulandı.
- Production dağıtımı: `1f8188a6-af20-4801-bdac-0d8750f7ee9f`.
- `spacecat.watch` `HTTP 200`; canlı kaynakta `home` komutu ve canonical URL dönüşü
  doğrulandı. IndexNow yedi URL'yi `HTTP 200` ile kabul etti.

## Lunar Lander kısa tıklama kontrol düzeltmesi — CODEX — 31 Temmuz 2026

- Browser'da kısa sol/sağ tıklamanın yalnız buton durumunu parlatıp 80 ms fizik adımının
  arasında kaybolabildiği doğrulandı.
- İlk `pointerdown` veya klavye basışına deterministik `0.16 s` kontrol darbesi eklendi.
  Tek tıklama artık anında `8°` dönüş üretir; basılı tutma mevcut sürekli dönüşü sürdürür.
- Aynı giriş yolu sol, sağ ve ana motor için mouse, klavye ve dokunmatiği kapsar.
- Fizik saatini ilerletmeden uygulanan kısa darbe ayrıca test edildi; 50 Lander kontrolü
  dahil toplam 217 regresyon kontrolü geçiyor.
- Production: `2adc4532-e5e1-40c4-b9a2-02b9a9ee61d9`. Canlı kaynak ve `HTTP 200`
  doğrulandı; IndexNow yedi URL'yi `HTTP 200` ile kabul etti.

## Arama platformları + Play gizlilik bağlantısı — CODEX — 31 Temmuz 2026

- Search Console'ın yeni platform mülkü akışı Instagram, X ve YouTube için denendi.
- X, Google Hesabı bağlantıları içinde aktif görünüyor; Search Console mülkü henüz
  yaratılmadı. Instagram akışı izin sonrası dış doğrulamaya geçmedi.
- Google hesabında SPACE CAT YouTube kanalı bulunmuyor; yalnız `@nehaber123` ve
  `@FWFLiveApp` sunulduğu için yanlış kanal eklenmedi.
- Play Console'da `Space Cat: Launch Terminal` / `com.spacecat.terminal` doğrulandı ve
  gizlilik URL'i `https://spacecat.watch/privacy` olarak kaydedildi.
- Play gönderim ekranı bu değişikliğin 30 Temmuz'dan beri süren mağaza incelemesini iptal
  edip yeniden başlatacağını bildirdi. Mevcut inceleme korundu; gizlilik URL'i bekleyen tek
  değişiklik olarak bırakıldı ve inceleme tamamlandığında gönderilmelidir.

## Faz 12 · NASA/JPL CNEOS yaşayan veri katmanı — CODEX — 31 Temmuz 2026

- `fireball`, NASA/JPL CNEOS Fireball Data API'deki son 12 atmosferik olayı normalize eder;
  terminal ilk sekizini UTC, koordinat, irtifa, hız ve tahmini kt TNT enerjisiyle gösterir.
- `approach`, önümüzdeki 60 günde 20 Ay mesafesine kadar olan yakın geçişleri normalize
  eder; ilk sekiz kayıt TDB zamanı, Ay mesafesi, bağıl hız ve varsa çapla görünür.
- Terminal açıkça `close approach ≠ impact prediction` yazar; bilinmeyen hız/çap/konum
  uydurulmaz.
- Tarayıcı JPL origin'ine doğrudan çıkmaz. Aynı-origin `/api/cneos/fireballs` ve
  `/api/cneos/approaches` endpoint'leri 8 saniye timeout, 6 saat tazelik ve 7 günlük
  last-known-good edge cache sözleşmesiyle çalışır. Cihazda ayrı 30 dakika taze / 7 gün
  son-sinyal cache'i bulunur.
- Derinlik izleri: `/dev/cneos`, `man cneos` ve `/var/log/uplink.log`.
- Ana hero, Watchstander, ses ve dominant animasyon sistemi değişmedi; yeni veriler yalnız
  açık terminal isteğinde yüklenir.
- Yeni `tools/test_web_cneos.js` 34 kontrol ekledi. Dokuz web paketi toplam **311** kontrol
  geçti; Pages Worker derlemesi başarılı.
- Canlı smoke: iki endpoint ilk istekte `MISS`, ikinci istekte `HIT`, `HTTP 200`; sırasıyla
  12 fireball ve 20 approach kaydı. `POST` kapısı `405`, API'ler `noindex` ve güvenlik
  başlıkları altında.

**Production:** `f9a46496-d7cf-467c-a4cc-6eee5741dc78` · `https://f9a46496.spacecat.pages.dev` ·
`https://spacecat.watch`

**Maliyet:** Yeni abonelik, veritabanı veya secret yok; NASA/JPL kaynakları ve mevcut
Cloudflare Pages katmanı kullanılıyor. Saat uygulamalarına dokunulmadı.

## Faz 13 · Daily Exoplanet Signal — CODEX — 31 Temmuz 2026

- Güncel NASA Exoplanet Archive TAP servisi ve `PSCompPars` tablosu kullanıldı; emekli
  confirmed-planets API'sine bağlanılmadı.
- Worker sorgusu veri-zengin 256 adayla server-side sınırlandı. Kullanıcı parametresi veya
  serbest TAP proxy'si yoktur.
- UTC tarihi sabit hash ile normalize edilmiş ve ada göre sıralanmış aday listesine
  uygulanır. Aynı gün ve aynı snapshot herkes için aynı dünya seçilir.
- Help'e yazılmayan `world` ve `exoplanet` komutları `/dev/exoplanet` aygıtından keşfedilir.
  İlk edinimden sonra günlük kayıt aynı aygıta bağlanır.
- Çıktı; isim, yıldız, yarıçap, kütle, yörünge süresi, denge sıcaklığı, uzaklık, keşif
  yöntemi/yılı ve tesisi gösterir. Eksik alan `unreported` kalır.
- ASCII küre açıkça `symbolic terminal render`; `EARTH-SIZED/SUPER-EARTH SIZE/...`
  sınıfları açıkça yarıçap bandıdır ve bileşim iddiası değildir.
- Cache UTC gün sınırında yenilenir; upstream kesintisinde önceki dünya `LAST KNOWN WORLD`
  olarak korunur. Edge/device son-sinyal ömrü 7 gün, upstream timeout 10 saniyedir.
- `tools/test_web_exoplanet.js` 34 deterministik/cache/güvenlik kontrolü ekledi. On web
  paketi toplam **345** kontrol geçti; Worker derlemesi başarılı.
- Canlı 31 Temmuz sinyali: `Kepler-418 b`, `MISS → HIT`, 256 aday, `HTTP 200`;
  yetkisiz yöntem `405`.

**Production:** `db4bf006-841d-4e1e-b23c-229ec77e006a` ·
`https://db4bf006.spacecat.pages.dev` · `https://spacecat.watch`

**Maliyet:** Yeni API anahtarı, abonelik, cron, veritabanı veya istemci scripti yok.
Saat uygulamalarına ve ana terminal hero'suna dokunulmadı.

## Faz 14 · JPL Horizons Observatory — CODEX — 31 Temmuz 2026

- Kök sanal dosya sistemine `/observatory` bağlandı. `README.TXT → targets.list →
  where mars → last.vector` zinciri help'e yazılmadan keşfedilir.
- Server-side allowlist yalnız Mercury, Venus, Moon, Mars, Jupiter, Saturn, Uranus,
  Neptune ve Pluto'yu kabul eder. Başka hedef `400`; kullanıcı metni Horizons sorgusuna
  dönüşemez.
- JPL Horizons observer tablosu `Earth geocenter (500@399)`, `UT`, degree-format apparent
  RA/DEC ve yalnız `2,9,10,20,23,24,29` quantities ile çağrılır.
- Normalize çıktı apparent RA/DEC, magnitude, illumination, Earth range/range-rate, solar
  elongation, phase angle ve constellation code içerir. `n.a.` değerler uydurulmaz.
- 31×9 sembolik equirectangular locator terminal genişliğine sığar; açıkça yerel
  azimuth/elevation olmadığı belirtilir. Konum izni kullanılmaz.
- Hedef başına 6 saat edge/device cache, 7 gün last-known-good ve 10 saniye upstream
  timeout uygulanır.
- `tools/test_web_horizons.js` 41 normalizasyon/allowlist/cache/güvenlik kontrolü ekledi.
  On bir web paketi toplam **386** kontrol geçti; Worker derlemesi başarılı.
- Canlı Mars vektörü: `2026-07-31 20:00 UT`, RA `82.32437°`, DEC `23.34133°`,
  `1.998193 AU`; endpoint `MISS → HIT`, `HTTP 200`; invalid target `400`, POST `405`.

**Production:** `915864a2-0e78-44dd-b768-2771a4518685` ·
`https://915864a2.spacecat.pages.dev` · `https://spacecat.watch`

**Maliyet:** Yeni API anahtarı, abonelik, cron, veritabanı veya kullanıcı-konum servisi
yok. Ana hero, saat uygulamaları ve dominant deneyimler değişmedi.

## Faz 15 · SatNOGS Radio Catalog — CODEX — 31 Temmuz 2026

- SatNOGS DB okuma API'sinin herkese açık olduğu ve verinin CC BY-SA 4.0 lisanslandığı
  resmî dokümantasyondan doğrulandı.
- Filtresiz transmitter endpoint'inin yaklaşık 3,5 MB döndürdüğü ölçüldü ve mimaride
  yasaklandı. Her upstream çağrı server-side NORAD, `alive=true` ve `status=active`
  filtrelerini taşır.
- Yedi hedef: ISS, AO-7, SO-50, NOAA-18, NOAA-19, QO-100/Es'hail-2 ve Meteor-M 2-3.
  `all` veya allowlist dışı hedef `400` verir ve upstream'e çıkmaz.
- Normalizasyon yalnız doğrulanmış, frekans-ihlali işaretlenmemiş, downlink frekanslı
  kayıtları kabul eder; frekans/mode/açıklama tekrarları atılır ve yanıt 12 kayıtla sınırlı.
- Help'e yazılmayan `beacon`/`satellite` komutları
  `/observatory/radio/README.TXT → catalog.list → last.signal` zincirinden keşfedilir.
- Terminal frekans/range, modulation mode, baud, service ve varsa uplink gösterir. Kayıt
  açıkça “not proof of a current on-air signal” taşır; canlı spektrum/alım uydurulmaz.
- Hedef başına 24 saat edge/device cache, 7 gün last-known-good ve 10 saniye upstream
  timeout vardır. API anahtarı veya kullanıcı başına filtresiz çağrı yoktur.
- SatNOGS DB / Libre Space Foundation contributors atfı ve CC BY-SA 4.0 lisansı payload,
  terminal ve statik footer içinde görünür.
- `tools/test_web_satnogs.js` 38 kontrol ekledi. On iki web paketi toplam **424** kontrol
  geçti; Worker derlemesi başarılı.
- Canlı ISS kataloğu 12 normalize kayıtla `MISS → HIT`, `HTTP 200`; `all` hedefi `400`,
  POST `405`.

**Production:** `4ecc9ca8-53ab-4a15-beb4-796dfb4f60e7` ·
`https://4ecc9ca8.spacecat.pages.dev` · `https://spacecat.watch`

**Maliyet:** Yeni abonelik, token, cron veya veritabanı yok. Yalnız mevcut Cloudflare
Pages edge cache ve açık SatNOGS okuma API'si kullanılıyor.

## Faz 16 · Rare Signal Watch — CODEX — 1 Ağustos 2026

- GraceDB REST API'nin unauthenticated erişiminin yalnız kamuya uygun kayıtlara açık
  olduğu, `public` sorgusu ve Production varsayılanı resmî dokümantasyondan doğrulandı.
- `/observatory/gravity/README.TXT → gravity → candidate.log` zinciri eklendi. En son
  sekiz public production superevent normalize edilir; test/MDC ve serbest query yoktur.
- Terminal aday kayıtlarını kesin keşif diye sunmaz. FAR tahmini false-alarm rate olarak
  Hz cinsinden kalır; olayın gerçek olma olasılığına çevrilmez. Her kayıt gelişen notice
  geçmişinin görülebileceği doğrulanmış GraceDB sayfasına bağlanır.
- CelesTrak GP query ve kullanım politikası 1 Ağustos 2026'da yeniden doğrulandı. Yalnız
  `CATNR=<allowlisted id>&FORMAT=JSON` kullanılır ve response tam bir tek nesne olmalıdır.
- `/observatory/orbits/README.TXT → targets.list → orbit iss → last.element` zinciri
  eklendi. Mean-element çıktısı canlı konum/iz/üstgeçiş gibi sunulmaz.
- CelesTrak upstream yalnız komutla açılır; 12 saat Cache API + subrequest + device cache,
  7 gün last-known-good ve 10 saniye timeout kullanır. Redirect ve non-200 yanıtlar tek
  çağrıda durur; otomatik retry, prefetch ve toplu katalog yoktur.
- GraceDB bir saat taze cache kullanır. İki adapter de aynı-origin, `GET|HEAD`, noindex,
  son-iyi-sinyal ve explicit `502` cold-start sözleşmesini korur.
- Statik ve dinamik footer'a IGWN GraceDB ile CelesTrak atfı eklendi. Ana hero, ses,
  mobil prompt, saat ürünleri ve mevcut dominant deneyimler değişmedi.
- `tools/test_web_rare_signal.js` 58 yeni kontrol getirdi; toplam **482** web kontrolü ve
  Worker derlemesi başarılı.

**Production:** `ae23d1b1-5336-4e6d-916e-f5e564b70626` ·
`https://ae23d1b1.spacecat.pages.dev` · `https://spacecat.watch`

**Canlı smoke:** GraceDB sekiz kayıtla `HTTP 200 / HIT`; CelesTrak ISS tek OMM kaydıyla
`MISS → HIT / HTTP 200`; `target=all` `400`, GraceDB POST `405`. Pages yayılımındaki kısa
eski/yeni sürüm penceresi kapandıktan sonra ardışık üç CelesTrak isteği `HIT` verdi.

**Maliyet:** Yeni abonelik, API anahtarı, cron, KV, D1 veya Durable Object yok. Mevcut
Cloudflare Pages edge katmanı ve ücretsiz kamu veri kaynakları kullanılıyor.

## Faz 17 · UX Flight Deck — CODEX — 1 Ağustos 2026

- Masaüstü ve `390×844` mobil ilk açılış; marka, CTA, hero, prompt, odak, taşma ve kaynak
  atfı gerçek tarayıcıda incelendi. DOS/CRT kimliği, ana hero ve komut satırının sayfa
  altındaki yeri değişmedi.
- Mobil ilk yüklemede otomatik odak ve en alta sıçrama kaldırıldı. Terminal artık SPACE CAT
  marka/CTA yüzeyinden açılıyor; sayfanın gövdesine dokunmak yazılım klavyesini çağırmıyor.
  Kullanıcı prompt veya hint bölgesine dokunduğunda komut satırı odaklanıyor.
- Yeni kullanıcıya yerel ve üç aşamalı bir keşif vektörü eklendi:
  `help → tree / → cd /observatory`. Son adım `ls` ve `cat README.TXT` ile derin katmanı
  açar; gizli executable listesi yine açıkça ifşa edilmez.
- Rehber durumu yalnız `sc_guidance_v1` ile cihazda tutulur. Her yönlendirme 10 saniyelik
  bir pulse'tur; sonra o andaki Autonomous Watchstander durumu komut hint'ini yeniden
  devralır. Launch-day uyarısı ilk kullanıcıya `help` kapısını da aynı satırda gösterir.
- Uzun kaynak/attribution bloğu, terminale ait `SOURCES MOUNTED · OPEN LOG` satırına
  dönüştürüldü. Native `details/summary` yapısı klavye ve dokunmayla açılır; SatNOGS
  `CC BY-SA 4.0` atfı ve tüm kaynaklar içeride aynen korunur.
- Link ve summary odak halkaları eklendi; `ESC` boşta komut girdisini temizler ve tarihçe /
  TAB hatırlatmasını gösterir. Coming Soon yüzeyleri ekran okuyucuya `aria-disabled`
  bildirir.
- Gizlilik metni gerçek mimariye uyarlandı: doğrudan tarayıcı istekleri ile read-only
  same-origin adapter ayrımı ve cihaz-yerel terminal ilerlemesi/cache/score/hint verileri
  açıkça anlatılır.
- Yeni `tools/test_web_ux.js` 26 kontrol ekledi. On dört paket toplam **508** kontrol geçti;
  Worker derlemesi başarılı. Mobil canlı kontrolde `390 px` scroll width, marka başlangıcı,
  klavye odak kapısı ve kaynak çekmecesi doğrulandı.

**Production:** `326755b3-9726-474e-9881-c5cdba07acc3` · `https://spacecat.watch`

**Maliyet:** Yeni API, backend, analitik olayı, cron, veritabanı veya abonelik yoktur.

## Faz 17.1 · Status-Driven Hero Flight — CODEX — 1 Ağustos 2026

- Ana hero'nun eski `PAD CAM` döngüsü kaynak durumundan bağımsızdı; sayaç `T+` ve LL2
  `In Flight` gösterirken roketin yerde kalmasının kök nedeni buydu.
- Hero artık saf `heroPhase(status, diff, offline)` durum makinesiyle çalışır:
  `PAD → IGNITION → ASCENT → UPPER STAGE → ORBIT WATCH → SUCCESS`. Failure/partial
  failure için ayrı `MISSION ANOMALY`, T-0 geçmiş ama liftoff doğrulanmamışsa
  `AWAIT STATUS` sahnesi vardır.
- Roket yalnız kaynak `In Flight`/liftoff bildirdiğinde yerden ayrılır. `GO` saati geçmiş
  olsa bile kaynak teyidi yoksa pad'de kalır; HOLD, TBC ve offline demo hiçbir zaman
  uçuşa çevrilmez.
- Hero hareketi API karelerinden gelmez. Kaynaktan alınan durum + gerçek T-0 saati yerel
  olarak 900 ms/1 s ritminde sembolik kareye dönüştürülür. UPPER STAGE ve ORBIT sahneleri
  açıkça `STATUS-DRIVEN · NOT TELEMETRY` taşır; anomali ekranı yörünge uydurmaz.
- Kota dengesi adaptif yapıldı: sakin nöbette 10 dakika; T-60/T+ ve doğrulanmış uçuşta
  6 dakika kaynak kontrolü. Yakın görev cache'i de 30 dakikadan 6 dakikaya iner. Yerel
  hareket bu aralıkta API çağrısı yapmadan devam eder; teorik otomatik LL2 yükü kritik
  saatte yaklaşık 10 istekle mevcut 15/saat sınırının altında kalır.
- Doğrulanmış `In Flight` kayıtları eski bir saatlik kesme yerine en fazla üç saat tutulur;
  final sonuç 90 dakika, belirsiz/eski kayıt bir saat sınırını korur. Böylece uzun coast /
  deployment evresinde hero erken bir sonraki göreve dönmez.
- Geç uçuşta tamamlanmış `track` deneyimi tekrar önerilmez; kullanıcı `recent` ile final
  sonucu kontrol etmeye yönlendirilir. Ses kapısı değişmedi ve otomatik ses yoktur.
- `tools/test_web_hero_state.js` 38 deterministik durum/cache/kota/erişilebilirlik kontrolü
  ekledi. On beş web paketi toplam **546** kontrolden geçti; Worker derlemesi başarılı.
- Canlı Starlink 17-52 doğrulaması: LL2 `In Flight`, `T+01:05`, hero `ORBIT WATCH`,
  erişilebilir durum `Symbolic launch state: orbit`, mobil genişlik `390 px`, yatay taşma
  ve tarayıcı hatası yok.

**Production:** `aee6c4ed-1c07-41bf-ae7a-b7aa2cf50cc2` · `https://spacecat.watch`

**Maliyet:** Yeni API, Cloudflare servisi, cron, KV/D1 veya abonelik eklenmedi.

## Faz 17.2 · Mission Timeline Engine + Wear round-safe düzeltmesi — CODEX — 1 Ağustos 2026

- LL2 `timeline` alanı ISO-8601 göreli sürelerden güvenli, allowlist'li görev olaylarına
  normalize edildi. Kaynakta en az üç geçerli olay varsa hero/track `MISSION TIMELINE`,
  yoksa araç ailesine göre açıkça `GENERIC PROFILE` kullanır.
- Canlı modelin eski sabit T+09:12 bitişi kaldırıldı. İzleme, son güvenilir görev olayına
  kadar sürer ve 120 saniyelik sonuç penceresi bırakır. Önceden katılmış kullanıcılar için
  geçmiş olaylar yeniden ateşlenmez.
- Stage separation sonrasında üst kademe ile booster iki sembolik hatta ayrılır. Entry,
  landing burn ve landing zamanları yalnız planlanmış olaydır; sağlayıcı sonucu yoksa
  `LANDING WINDOW · RESULT PENDING` kalır ve başarı uydurulmaz.
- `Payload Deployed` ayrı, kaynak-doğrulanmış bir final durumudur. Failure/partial failure
  halinde ses/yanma kesilir, son sembolik konum donar ve `SOURCE-REPORTED ANOMALY · PATH
  FROZEN` gösterilir; patlama veya enkaz animasyonu üretilmez.
- Hero paneline `PROFILE`, `NEXT EVT` ve varsa `BOOSTER` satırları eklendi. Tüm hareket
  hâlâ yerel saatten üretilir; animasyon karesi için API çağrısı yapılmaz. Kritik LL2
  kontrol aralığı 6 dakika olarak kaldı.
- `tools/test_web_mission_timeline.js` 24 normalizasyon, fallback, booster ve anomali
  kontrolü ekledi. On altı web paketi toplam **574** kontrolden geçti; Worker derlendi.

**Production:** `https://spacecat.watch` · Cloudflare Pages sürümü
`https://a2728fb8.spacecat.pages.dev` (özel alan adı canlı ve doğrulandı).

**Maliyet:** Yeni API, cron, veritabanı, KV/D1 veya abonelik yoktur.

### Google Play Wear OS politika düzeltmesi

- Play Console kanıtı, reddedilen `5 (1.1.0)` paketinde görev ekranı ve uzun olay metninin
  yuvarlak ekran kenarına taşabildiğini gösterdi.
- Wear Compose için ortak `roundSafeWidth`, `roundSafeNarrativeWidth` ve tam ekran
  `wearViewport` sözleşmesi eklendi. Görsel, uzun metin, telemetri, ayar ve kontrol
  yüzeyleri dairesel ekranın güvenli kirişine alındı.
- 454×454 yuvarlak Wear emülatöründe ana liste, görev ekranı ve uzun olay açıklaması görsel
  olarak doğrulandı. Android lint/debug/unit/release bundle kapıları başarılı.
- Düzeltme paketi `6 (1.1.1)` olarak imzalı AAB halinde hazırlandı; SHA-256
  `376f2264f31439733c975652017c2e53163be4a743febdf753ad8e7c5da8755f` ile Play
  yüklemesi doğrulandı.
- 1 Ağustos 2026'da `wear:production` kanalında %100 dağıtım için oluşturuldu. Play
  Console'daki son onayla Wear paketi, İngilizce mağaza metinleri ve
  `https://spacecat.watch/privacy` olmak üzere dört değişiklik Google incelemesine
  gönderildi. Yayın özeti `İncelenmekte olan değişiklikler` durumunu doğruladı.

### Saat olay sözleşmesi

- Wear OS ve watchOS kaynaklarına aynı kısa olay modeli eklendi: ignition, liftoff, Max-Q,
  MECO, stage separation, üst kademe start/cutoff, fairing, booster burns/landing, orbit
  insertion ve payload deployment.
- Saat ekranı yalnız kısa kaynak-planlı milestone/next-event metni gösterir; kesintisiz
  saatler süren uçuş animasyonu veya telemetri iddiası yoktur. Anomali ve payload deployed
  kaynak durumundan ayrıca işlenir.
- Wear `assembleDebug/lintDebug/bundleRelease`, watchOS simulator Debug build başarılı.
  Apple'daki mevcut inceleme paketine dokunulmadı; bu kaynaklar sonraki watchOS build'i
  içindir.

## Faz 18 · Animation Truth Contract — CODEX — 1 Ağustos 2026

- Canlı sahnede gerçek ve modellenmiş sinyaller görünür olarak ayrıldı. Sağlayıcının T-0
  ve görev durumu `SOURCE`; LL2 görev timeline'ı `PLANNED`; sembolik yol, yükseklik, hız
  ve generic fallback olayları `MODEL` etiketini taşır.
- Eski çıplak `ALT / VEL / RNG / STAGE` alanları sinemada `MODEL` öneki aldı. Canlı takip
  `SOURCE STATUS`, `PLANNED/MODEL EVENT` ve `PLANNED BOOSTER` ayrımını kullanır. `/live`
  metadata'sındaki “launch telemetry” iddiası kaldırıldı.
- Hero `PROFILE` satırı artık `PLANNED · MISSION TIMELINE` veya
  `MODEL · GENERIC PROFILE`; `NEXT EVT` ise `PLAN EVT` olarak görünür.
- `sudo launch` ve `track` yıldız/smoke akışları görev kimliği ve sahne kanalından türeyen
  deterministik PRNG ile üretildi. Aynı görev aynı görsel diziyi verir; test ve kayıt
  tekrar üretilebilir.
- Canlı Max-Q, stage separation, fairing, landing burn ve payload deploy anlarına kısa,
  sabit genişlikte ASCII vurguları eklendi. Birinci/ikinci kademe alevi MECO, SES ve SECO
  pencerelerine bağlandı; olaylar dekoratiftir ve telemetri iddiası taşımaz.
- Gizli sekmede iki dominant launch çizimi durur. Canlı saat dönüşte gerçek T-0'a yeniden
  oturur; reduced-motion canlı güncelleme ritmi 120 ms yerine 480 ms'dir.
- Yeni `tools/test_web_animation_truth.js` 31 doğruluk, determinizm, mobil ve metadata
  kontrolü ekledi. On yedi web paketi toplam **605** kontrolden geçti.
- Gerçek tarayıcı QA: `390×844` ve `320×700`; belge genişliği viewport ile aynı, ASCII
  ekran taşmıyor, doğruluk satırı güvenli kırılıyor ve touch çıkışı 50–68 px yüksekliğinde.

**Production:** `4c28f4be` · `https://4c28f4be.spacecat.pages.dev` ·
`https://spacecat.watch` ve `/live` `HTTP 200`; canlı kaynakta yeni truth-contract ve
route metadata doğrulandı.

**Maliyet:** Yeni API, Cloudflare servisi, cron, KV/D1, medya dosyası veya abonelik yoktur.

## Faz 18.1 · First Contact Rebalance — CODEX — 1 Ağustos 2026

- İlk canlı açılışta terminal deneyiminden önce görünen büyük Google Play / App Store CTA
  bloğu kaldırıldı. JavaScript'siz, taranabilir HTML'deki çalışan mağaza bağlantısı
  korunuyor; crawler ve no-JS erişimi kaybolmadı.
- Açılış metni `LIVE ORBITAL LAUNCH NETWORK · mission control online` olarak sadeleştirildi.
  Wear OS, hero ve komut satırından sonra `PACKAGE: WEAR OS OK · ... [INSTALL]` şeklinde
  düşük profilli terminal satırı olarak kalıyor.
- Mobil hero görev değerleri `.val` sözleşmesiyle tek satır ellipsis kullanır. Uzun ajans,
  pad ve profil adları ilk viewport'u dikey olarak şişirmiyor; masaüstü davranışı korunur.
- Prompt ve `type help` sırası, ürün bağlantısı ve `SOURCES MOUNTED` çekmecesinin önüne
  taşındı. Yardımcı bloklar terminal kabuğunda açık sahiplik işaretiyle dock edilir ve
  `home` komutunda temizlenip yeniden kurulur; kopya DOM bırakılmaz.
- Production ölçümü: `320×700` prompt `609–634 px`, help `636–672 px`; `390×844` prompt
  `635–659 px`, help `661–697 px`. Her iki görünümde belge genişliği viewport ile eşit ve
  yatay taşma yoktur.
- UX paketi üç yeni kalıcı kontrolle 32'ye çıktı; 17 web paketi toplam **608** kontrol geçti.

**Production:** `66035006` · `https://66035006.spacecat.pages.dev` ·
`https://spacecat.watch` üzerinde 320/390 px ilk temas sırası doğrulandı.

**Maliyet:** Yeni API, medya, servis veya bakım işi eklenmedi.

## Faz 18.2 · Fireball World Grid — CODEX — 1 Ağustos 2026

- `fireball` arşivi, son sekiz CNEOS kaydını mevcut koordinatlarından ortak 58×18 ASCII
  dünya izdüşümüne yerleştirir. `@` en yeni koordinatlı kaydı, `2–8` arşiv satırını,
  `+` aynı hücreyi paylaşan kayıtları gösterir.
- Harita ile liste aynı marker sözleşmesini kullanır. Koordinatı raporlanmayan kayıt listeyi
  korur fakat haritada uydurma konum üretmez.
- Bilimsel sınır görünürdür: koordinat `REPORTED AIRBURST LOCATION` olarak adlandırılır ve
  `NOT A CONFIRMED GROUND IMPACT SITE` uyarısı her sonuçta kalır.
- ISS ve fireball ekranları aynı equirectangular izdüşüm yardımcısını paylaşır. Yeni API,
  polling, timer, cache veya backend eklenmedi; mevcut CNEOS edge/device katmanı kullanılır.
- Radar edinim efekti tek seferlik ve hafiftir; reduced-motion altında kapalıdır. Harita
  `role=img` ve açıklayıcı erişilebilir ad taşır.
- Gerçek CNEOS verisiyle `390×844` ve `320×800` QA: belge genişliği viewport ile aynı,
  harita kendi içinde taşmıyor (`390 px: 301/301`, `320 px: 254/254`).
- CNEOS paketi 52 kontrole, 17 web paketi toplam **626** kontrole çıktı.

**Production:** `47ab22ec` · `https://47ab22ec.spacecat.pages.dev` ·
`https://spacecat.watch` üzerinde doğrulandı.

**Maliyet:** Yeni API, Cloudflare ürünü, cron, veritabanı, KV/D1 veya abonelik yoktur.

## Faz 19 · Orbital Rendezvous Lab — CODEX — 1 Ağustos 2026

- Önce `prototypes/orbital-docking/` altında bağımsız geliştirilen ASCII kenetlenme eğitimi,
  kullanıcı oyun deneyimi ve görsel onayından sonra production yüzeyine alındı.
- Dört eksenli translation kontrolü; bağıl closing/drift, yaklaşma koridoru, yakıt ve
  180 saniyelik pencere birlikte yönetilir. Güvenli capture için hız ve hizalama sınırları
  deterministiktir.
- Model açıkça `TRAINING MODEL · SYMBOLIC RELATIVE MOTION · NOT TELEMETRY · NOT FLIGHT
  SOFTWARE` olarak etiketlidir. Ağ isteği, hesap, global skor veya clearance yoktur.
- Klavye ile press-and-hold touch aynı kontrol yolunu kullanır. Pause, reset, gizli sekme
  zaman koruması, 48 px hedefler ve cihaz-yerel best score hazırdır.
- İlk kullanıcı denemesinde hareketin birkaç saniye aynı ASCII hücresinde kalabildiği
  görüldü. Sunum ölçeği 2.4× yapıldı, başlangıç yaklaşımı kısaltıldı, thrust tepkisi
  güçlendirildi ve kısa dokunuş alevi görünür bir pencereye uzatıldı.
- 39 prototip kontrolü; bir saniyede görünür ilerleme ve 100 saniyeden kısa güvenli
  guidance tamamlanması dahil geçti.
- Varsayılan kapalı `SC STATION CONTROL` ses kanalı eklendi. Sekiz yerel, radyo-band
  filtreli sistem sesi yalnız range 25/12, soft-capture go, yüksek closing/drift ve sonuç
  anlarında konuşur; kritik uyarılar rutin range çağrılarını kesebilir.
- Kanal kullanıcı tıklaması olmadan başlayamaz. Metin ve README bunun kurgusal Space Cat
  istasyonu olduğunu, NASA/ISS kaydı olmadığını açıkça korur. Test paketi **56** kontrole çıktı.
- Derin oyun döngüsü eklendi: Range 25 ve Range 12'de 2.5 saniyelik stabil hold zorunlu;
  clearance olmadan kapıyı geçmek ayrı `PROCEDURE` abort sonucudur. Final yaklaşma için
  oyuncunun Fine RCS seçmesi gerekir.
- Coarse/Fine RCS farklı impulse ve yakıt karakterine sahiptir. Puan, hızlı bitirmeyi artık
  ödüllendirmez; hold tamamlama, kalan yakıt, az burn sayısı ve temiz temas S–F grade üretir.
- `CAM 01 WIDE → CAM 02 CORRIDOR → CAM 03 PORT` range'e bağlı üç ASCII kadraj kullanır.
  Sonuç ekranı max closing/drift, pulse, yakıt, hold ve station verdict debrief'i verir.
- `NOMINAL`, `CROSS DRIFT`, `LOW FUEL` olmak üzere üç sınırlı profil vardır; rastgele fizik
  veya günlük içerik bakımına dönüşmez. Clearance sesleriyle yerel kanal 11 klibe çıktı.
- Prototip paketi hold state-machine, fine/coarse farkı, acele puanı yasağı, kamera, debrief,
  üç profil ve 150 saniye altında prosedürlü tamamlanabilirlik dahil **73** kontrolden geçti.

- Production oyunu Cloudflare'ın doğal uzantısız rotasında çalışır:
  `https://spacecat.watch/games/docking`. Rota `noindex,follow`; sitemap veya ana `help`
  içine eklenmez. Keşif izi `cd /usr/games → cat README.TXT → DOCKING.COM → docking`dir.
- `wargames` yüzeyi ikinci simülatörü `ORBITAL RENDEZVOUS · AVAILABLE` olarak gösterir;
  oyundan terminale 48 px `[RETURN TO SPACE CAT TERMINAL]` bağlantısı vardır.
- Production HTML ve onaylı prototip aynı fizik/script kaynağını kullanır. Sesler rota adıyla
  çakışmayan `/games/docking-comms/` altında 11 küçük yerel MP3 olarak sunulur; API, ağ
  polling'i, hesap veya global leaderboard eklenmedi.
- Gerçek tarayıcı QA: `390×844` ve `320×800`. Yatay taşma yok; ASCII ekran 320 px cihazda
  280 px, uçuş ve yardımcı kontroller 48 px, dar panel 2×3'tür. Mobil prograde dokunuşu
  closing değerini değiştirdi; başlangıç yazısındaki ASCII koridor çakışması giderildi.
- Yeni `tools/test_web_docking.js` 44 production rota, keşif, güvenlik, fizik, ses ve mobil
  kontrolü ekledi. 18 web paketi toplam **673** kontrolden geçti; prototip paketi ayrıca
  **73** kontrolden geçti.

**Production:** `df0a5fb7` · `https://df0a5fb7.spacecat.pages.dev` ·
`https://spacecat.watch/games/docking` ve 11 ses varlığı `HTTP 200`; production 320 px
tarayıcı QA tamamlandı.

**Maliyet:** Sıfır; on bir küçük yerel MP3 dışında yeni servis, API veya abonelik yoktur.

## Faz 20 · Booster Recovery V2 — CODEX — 1 Ağustos 2026

- Gizli `lander` deneyimi basit Lunar Lander eskizinden ciddi bir booster recovery
  eğitimine taşındı. Fizik hâlâ deterministik ve tamamen cihaz-yereldir.
- Sağdaki `PAD01` artık açıkça ışıklandırılmıştır; yaklaşma koridoru, pad delta-X,
  dikey/yatay hız ve attitude guidance oyuncunun tam olarak nereye ve hangi zarfla
  inmesi gerektiğini sürekli gösterir.
- `BOOSTBACK`, `BRAKING`, `FINAL` ve `LANDING BURN` safhaları aynı uçuş durumundan
  türetilir. Bunlar sembolik training modelidir; gerçek görev telemetrisi değildir.
- Launch cinema'nın ASCII efekt dili oyuna taşındı: üç kare motor alevi, yükselen egzoz
  dumanı, alçak irtifada iki yana yayılan pad tozu ve ölçülü pad işaret ışıkları.
- Terminal komutundaki Enter'ın uçuşu yanlışlıkla başlatması engellendi. Fizik ve uçuş
  kontrolleri açık `[BEGIN RECOVERY]` eylemine kadar kilitli ve donmuş kalır.
- Başarılı/başarısız sonuçlar S–F grade ile; pad offset, dikey/yatay temas hızı,
  attitude ve kalan yakıtı içeren cihaz-yerel post-flight debrief üretir.
- `sc_lander_v2` yeni zarfın skorlarını eski sürümden ayırır. Ağ, API, hesap, global
  leaderboard, yeni ses dosyası veya sürekli bakım işi eklenmedi.
- Gerçek tarayıcı QA `390×844` ve `320×800` üzerinde tamamlandı. `PAD01`, pre-flight
  hold ve guidance okunur; yatay taşma yok ve üç uçuş kontrolü mobil hedef boyutunu korur.
- `tools/test_web_lander.js` 80 kontrole çıktı. 18 web paketi toplam **703** kontrol geçti.

**Production:** `17a9b2ef` · `https://17a9b2ef.spacecat.pages.dev` ·
`https://spacecat.watch` üzerinde canlı doğrulandı.

**Maliyet:** Sıfır; yalnız mevcut HTML/CSS/JavaScript ve cihaz-yerel depolama kullanılır.

## Faz 20.1 · SC Game System Cabinet — CODEX — 1 Ağustos 2026

- Booster Recovery ve Orbital Rendezvous aynı `SC GAME SYSTEM // CARTRIDGE 10/20`
  arcade-terminal kimliğine bağlandı.
- Açılış ekranları Space Cat maskotu, oyuna özgü motto, net görev hedefi, kritik
  iniş/prosedür zarfı, cihaz-yerel rekor ve görünür başlatma eylemi taşır.
- Oyun fiziği açılış brifinginde donuktur. Lander ve docking uçuş kontrolleri açık
  başlangıç eylemine kadar devre dışı kalır.
- Başarı ayrı amber `MISSION COMPLETE`; kayıp ayrı kırmızı `SIGNAL LOST // GAME OVER`
  sahnesidir. Maskot ifadesi, sonuç, grade, skor, kritik son veriler ve retry aynı kartta
  okunur; teknik debrief kartın altında korunur.
- Kısa boot ve signal-break geçişleri terminal stilini korur; reduced-motion tercihinde
  tamamen kapanır. Yeni görsel dosya veya bağımlılık eklenmedi.
- Kartlar Lander'ın 56×26 ve Docking'in 64×28 sabit ASCII gridlerinde programatik olarak
  doğrulandı. Lander paketi 94, docking paketi 59 kontrole çıktı; 18 web paketi toplam
  **732** kontrolden geçti.

**Production:** `1834e313` · `https://1834e313.spacecat.pages.dev` ·
`https://spacecat.watch` üzerinde canlı.

**Maliyet:** Sıfır; API, medya, servis, depolama veya sürekli bakım işi eklenmedi.

## Faz 20.2 · Docking Comms Default Armed — CODEX — 1 Ağustos 2026

- Orbital Rendezvous, açılışta `COMMS ON` ve `ARMED · BEGIN APPROACH TO OPEN` gösterir.
- Ses sayfa yüklenirken oynatılmaz. İlk SC Station kanal kontrolü yalnız kullanıcının
  `[BEGIN APPROACH]` tıklaması veya Enter jesti içinde başlar; tarayıcı autoplay sınırı
  ve kullanıcı beklentisi birlikte korunur.
- Oyuncu kanalı uçuş öncesinde kapatabilir. Uçuş sırasında on/off, reset ve retry mevcut
  tercihi korur; sayfa yeniden açıldığında tasarlanan varsayılan yeniden ON olur.
- Production ve prototip oyun scriptleri birebir eş kaldı. Docking paketi 62 kontrole,
  18 web paketi toplam **735** kontrole çıktı.

**Production:** `05ed1592` · `https://05ed1592.spacecat.pages.dev` ·
`https://spacecat.watch/games/docking` üzerinde canlı.

**Maliyet:** Sıfır; yeni ses, API, servis veya depolama eklenmedi.

## Faz 21 · Cosmic Discovery Suite — CODEX — 2 Ağustos 2026

- `earth`, NASA DSCOVR EPIC'in en güncel günlük setinden seçilen dört tam-Dünya gözlemini
  same-origin Worker kasasından alır ve cihazda ASCII'ye çevirir. Bunun gözlem karesi,
  canlı video olmadığı ekranda kalıcıdır. Reduced-motion tek kare kullanır.
- `apod`, NASA Astronomy Picture of the Day kaydını başlık, kısa saha notu, medya türü,
  kredi/telif ve özgün NASA bağlantısıyla günlük kozmik kartpostal olarak çözer. Video
  günlerinde autoplay yoktur; yalnız önizleme ASCII'ye çevrilir.
- `nightwatch`, açık konum izninden sonra Ay fazı, yaklaşık ISS geçişi, JPL Mars ufuk
  dönüşümü, NOAA OVATION aurora grid değeri ve Open-Meteo hava penceresini tek yerel
  gözlem brifinginde birleştirir. SPACE CAT konumu saklamaz; hava servisine gitmeden önce
  0.25° gride yuvarlar ve bunu izin istemeden önce açıkça bildirir.
- `transmit mars "HELLO"`, mevcut Horizons mesafesini gerçek tek-yön/round-trip ışık
  süresine çevirir. Paket, zaman ve gecikmiş ACK yalnız localStorage'dadır; hiçbir mesaj
  NASA'ya, uzay aracına veya gezegene gönderilmez. Eski clearance-korumalı CAPCOM loopback
  kullanımı korunmuştur. `lighttime` ve `/observatory/lighttime/queue.log` kuyruğu okur.
- `pulsar crab|vela|b1919|j0437`, statik katalog periyodunu yerel WebAudio darbe treni ve
  ASCII waterfall'a dönüştürür. Bu canlı radyo alımı değildir; M sesi keser, ESC/touch
  Experience Kernel üzerinden bütün ses/timer/listener kaynaklarını temizler.
- `/observatory/cosmos`, `/observatory/lighttime` ve `/dev/earth` dosya keşif yüzeyleri;
  `man earth|apod|nightwatch|lighttime|pulsar` doğruluk sözleşmeleri eklendi.
- Worker'da EPIC/APOD metadata ve sabit hedefli görüntü proxy'leri şema/medya doğrulamalı,
  noindex ve uzun edge-cache'lidir. NASA anahtarı istemciye çıkmaz; opsiyonel
  `NASA_API_KEY` secret yoksa düşük hacimli ücretsiz `DEMO_KEY` kullanılır.
- Gerçek tarayıcı QA: ilk prompt/help 390×844 ilk viewport içinde; `earth` 390×844 ve
  320×720'de gövde/panel/ASCII taşması üretmedi. EPIC, APOD, görüntü proxy'leri ve mevcut
  Horizons Moon mesafesi production'da gerçek yanıtlarla doğrulandı.
- Yeni `tools/test_web_cosmos.js` 33 kontrol ekledi; 19 web paketi toplam **770** kontrolden
  geçti. Worker ve inline terminal script sözdizimi ayrıca temizdir.

**Production:** `db1eb723` · `https://db1eb723.spacecat.pages.dev` ·
`https://spacecat.watch` üzerinde canlı. EPIC/APOD metadata ve görüntü uçları `HTTP 200`.

**Maliyet:** Yeni ücretli servis, cron, veritabanı veya editoryal bakım yoktur. NASA
`DEMO_KEY` mevcut düşük trafik için ücretsiz fallback'tir; ücretsiz kişisel anahtar daha
sonra yalnız bir Cloudflare secret olarak eklenebilir.

## Faz 21.1 · Hidden Side B — CODEX — 2 Ağustos 2026

- `/observatory/radio` altında normal `ls` ve `tree` çıktısından saklanan `.side-b`
  kültürel taşıyıcısı eklendi.
- Keşif zinciri terminal dilini korur: `tree / → cat /observatory/radio/README.TXT →
  ls -a /observatory/radio → cat /observatory/radio/.side-b`.
- Son dosya The Beatles'ın “Across the Universe — Remastered 2009” kaydını sanatçı ve
  parça adıyla tanımlar; şarkı sözü, ses dosyası veya Spotify embed'i barındırmaz.
- Bağlantı Spotify'ın doğrulanmış parça adresine gider ve yalnız açık kullanıcı tıklamasıyla
  yeni sekmede açılır. Autoplay yoktur; Spotify uygulaması/oturumu platform tarafından
  yönetilir.
- Ana `help`, TAB tamamlama ve ilk açılış değişmedi. İpucu deneyimli terminal kullanıcıları
  için yeterince adil, keşfin ödülü ise tamamen isteğe bağlıdır.
- SatNOGS test paketi 46 kontrolle gizli mount, keşif ipucu, sabit Spotify adresi,
  tıklama/autoplay sözleşmesi ve help görünmezliğini doğrular. On dokuz web paketi toplam
  **778** kontrolden geçti.

**Production:** `23af6113` · `https://23af6113.spacecat.pages.dev` ·
`https://spacecat.watch` `HTTP 200`; canlı kaynakta gizli mount, ipucu ve doğrulanmış
Spotify parça adresi görüldü. Pages önizleme alan adı yerel doğrulamada zaman aşımına
uğradı; özel alan adı ve production kaynak doğrulaması başarılıdır.

**Maliyet:** Sıfır; yeni API, medya, abonelik, cache, cron veya bakım işi yoktur.

## Faz 21.2 · Open Engineering Library — CODEX — 2 Ağustos 2026

- “Her şeyi gizlememe” tasarım kararı anayasaya işlendi: sürprizler gizli kalabilir;
  eğitim ve referans arşivleri kök dosya ağacında görünürdür.
- `/library`, `tree /` çıktısında açıkça görünür. İlk koleksiyon `engineering`; alt raflar
  `launch-vehicles`, `propulsion`, `guidance-navigation-control` ve `structures-materials`.
  Keşif yalnız mevcut `tree`, `cd`, `ls` ve `cat` araçlarını kullanır. Ana `help`e yeni komut
  eklenmedi.
- Raflar ve dosya yolları tek `LIBRARY_DOCUMENTS` kataloğundaki `collection/shelf/name`
  alanlarından otomatik üretiliyor. Yeni belge ikinci bir klasör listesi gerektirmiyor;
  ileride eklenecek koleksiyonlar mevcut mühendislik raflarına karışmadan büyüyebilir.
- On kamuya açık NASA/NTRS kaydı sistem mühendisliği, launch vehicle tasarım süreci,
  ön yük/boyutlandırma, sıvı motor, injector, nozzle, turbopump, uçuş kontrolü, solid motor
  case ve yapısal malzeme konularını kapsar.
- Her sanal `.pdf` kaydı başlık, rapor numarası, yıl, kapsam, kaynak ve tarihî referans
  uyarısını gösterir; açık operatör tıklamasıyla doğrudan resmi NASA PDF'sini açar.
- Bütün on PDF ucu `HTTP 206 application/pdf` ile doğrulandı. Dosyalar SPACE CAT sunucusuna
  kopyalanmadı; yeni depolama, telif kopyası, API, cache veya bakım işi oluşmadı.
- `tools/test_web_library.js`, görünür mount, raflar, sınırlı katalog, NTRS kayıtları,
  help sadeliği, referans uyarısı ve deployment içinde PDF bulunmamasını doğrular.

**Doğrulama:** 20 web test paketi · 809 kontrol · tamamı başarılı.

**Production:** `0b9b7105` · `https://0b9b7105.spacecat.pages.dev` ·
`https://spacecat.watch` `HTTP 200`; cache-buster ile canlı kaynakta `LIBRARY_DOCUMENTS`,
otomatik raf üreticisi ve `/library nasa-ntrs remote-ro` mount kaydı doğrulandı.

**Maliyet:** Sıfır; yalnız resmi NASA/NTRS dış bağlantıları ve mevcut sanal dosya sistemi.

## Faz 21.3 · Sentinel Shell / Intrusion Fiction — CODEX — 2 Ağustos 2026

- Standart sistem keşfi artık tutarlı SpaceCatOS yanıtları verir: `whoami`, `id`, `uname`,
  `hostname`, `env`, `ps`, `mount`, `df`, `free`, `ss`, `netstat`, `ip`, `ifconfig`,
  `systemctl`, `crontab` ve `find`.
- Yetki ve sınır denemeleri `sudo -l`, `su`, `ssh`, `chmod`, `rm`, `curl`, `wget`, `nmap`,
  `ping`, `traceroute` ve `format` üzerinden tek bir kurgu sözleşmesine bağlandı.
- Hiçbir komut gerçek shell, host dosya sistemi, port taraması, DNS, soket, `fetch`, servis
  kontrolü veya dosya mutasyonu yapmaz. Çıktılar `0 packets`, `0 bytes`, `0 modes/files`
  ifadeleriyle simülasyon gerçeğini korur.
- Olaylar `sc_intrusion_audit_v1` içinde yalnız cihazda ve son 40 kayıtla sınırlı tutulur.
  Reconnaissance → Privilege Probe → Active Containment aşamaları, en sert benzersiz denemeye
  göre oluşur; sistem gözlemler ve sınırlar, asla misilleme yapmaz.
- Kök dosya sistemine `/etc`, kilitli `/root`, `/proc/security`, `/proc/net/{tcp,udp}` ve
  `/var/log/auth.log` eklendi. Kullanıcı `passwd`, `fstab`, servisler, socket tablosu ve kendi
  zaman damgalı izleri üzerinden “root bir insan hesabı değil” kurgusuna ulaşır.
- Yeni komutların hiçbiri ana `help` çıktısında veya TAB tamamlama listesinde yer almaz.
  Gerçek Unix kas hafızasıyla bulunurlar.
- `tools/test_web_intrusion_fiction.js`, cihaz-yerel audit sınırını, ağ/mutasyon yokluğunu,
  bütün komutları, dosya izlerini, gizli keşfi ve Félicette sentinel doktrinini doğrular.

**Doğrulama:** 21 web test paketi · 861 kontrol · tamamı başarılı.

**Production:** `5363328f` · `https://5363328f.spacecat.pages.dev` ·
`https://spacecat.watch` `HTTP 200`; Cloudflare deployment listesinde `main / Production`
ve canlı özel alan adı kaynağında `sc_intrusion_audit_v1` doğrulandı.

**Maliyet:** Sıfır; yalnız tarayıcı içi kurgu ve sınırlı `localStorage` kaydı.

## Faz 21.4 · Deep Space Relay Lab — CODEX — 2 Ağustos 2026

- `/observatory/relay`, DSN’den ilham alan fakat bağımsız ve açıkça simülasyon olarak
  etiketlenen yeni deneyim mount’u oldu. `AFFILIATION NONE`, `AUTHORITY NONE FOR REAL
  SPACECRAFT` ve `RF PATH DISCONNECTED` sözleşmeleri bütün kritik yüzeylerde görünür.
- NASA/JPL Horizons allowlist’ine güncel ephemerisi olan sekiz gerçek araç eklendi: Voyager 1
  (`-31`), Voyager 2 (`-32`), New Horizons (`-98`), Juno (`-61`), Mars Science Laboratory /
  Curiosity (`-76`), Mars Reconnaissance Orbiter (`-74`), Lucy (`-49`) ve JWST (`-170`).
- Bütün kimlikler resmi Horizons API’sinde 2 Ağustos 2026 UTC ephemerisiyle manuel doğrulandı.
  Perseverance/Mars 2020 (`-168`), Horizons kapsamı 18 Şubat 2026’da sona erdiği için özellikle
  allowlist’e alınmadı; veri yokken “canlı” iddiası üretilmedi.
- `probe <target>` yalnız Earth-centered kamu ephemerisini gösterir: epoch, menzil, tek yönlü
  ışık süresi, range rate ve apparent RA/DEC. `telemetry <target>` isteği aynı kanala yönlenir
  fakat açıkça `PUBLIC EPHEMERIS · NOT SPACECRAFT TELEMETRY` olarak yeniden sınıflandırılır.
- `dsn`, `probe`, `telemetry`, `antenna` ve `uplink` komutları `help` ve TAB listesinde yoktur;
  `/dev/dsn`, `/proc/dsn`, `/observatory/relay/*` ve `/var/spool/uplink/*` üzerinden keşfedilir.
- Gerçek gezegen veya uzay aracı hedeflerine `uplink` paket yaratmadan kapanır. Tek yazılabilir
  hedef, adı ve statüsü her yerde `FICTIONAL` olan `SC-FELICETTE-1` eğitim sondasıdır.
- Eğitim sonda komutları altı güvenli allowlist girdisiyle sınırlıdır: `status report`,
  `attitude hold`, `science scan`, `antenna home`, `sleep`, `wake`. Paketler yalnız cihazda,
  son 20 kayıtla tutulur; ACK gecikmesi, NASA/JPL Horizons’ın güncel Earth–Mars menzilinden
  türetilir. Bu veri yalnız menzil modelidir; NASA/JPL/DSN/araç/istasyon kontrol ucu yoktur.
- `tools/test_web_deep_space_relay.js`, server-side spacecraft kimliklerini, read-only gerçek
  hedefleri, hayalî tek yazılabilir hedefi, ağ/soket yokluğunu, mount’ları, gizli keşfi ve
  kaynak/bağlılık açıklamalarını doğrular.

**Doğrulama:** 22 web test paketi · 928 kontrol · tamamı başarılı. Resmi Horizons
API'sinde sekiz spacecraft kimliği manuel doğrulandı. Production yayılımı tamamlandıktan sonra
sekiz canlı same-origin spacecraft ucu altı turda sınandı: `48/48 HTTP 200`.

**Production:** `2d4dcbd8` · `https://2d4dcbd8.spacecat.pages.dev` ·
`https://spacecat.watch` `HTTP 200`; canlı kaynakta `sc_dsn_training_v1`, gizli komut filtresi
ve relay doğruluk etiketleri; canlı API'de Voyager 1 ile Curiosity dahil bütün allowlist
ephemeris uçları doğrulandı.

**Maliyet:** Sıfır; mevcut allowlist Horizons adaptörü ve edge cache yeniden kullanılır.

## Faz 21.5 · Mobile Help Readability — CODEX — 2 Ağustos 2026

- Ana `help` çıktısındaki boşluk dolgulu masaüstü hizası semantik `help-section`, `help-row`
  ve `help-tokens` yapılarına dönüştürüldü. İçerik ve DOS renk dili korunurken komut ile
  açıklama artık tarayıcının anlayabildiği ayrı öğelerdir.
- Masaüstünde iki sütun devam eder. `600 px` ve altında her komut kendi satırına, açıklaması
  da `└─` devam işaretiyle alt satıra iner; uzun cümleler artık komut adının ortasında
  kırılmaz. Yazı küçültülmedi; mobil ritim `13.5 px / 1.38` ve anlamlı satır aralıklarıyla
  düzenlendi.
- `FILESYSTEM`, `THE APP` ve `MISC` kısa komutları esnek token satırlarında sarılır. Bölüm
  başlıkları ince terminal ayıracı taşır; gizli komutlar yine `help`e alınmadı.
- `solar` komutunun eski yardım metnindeki yinelenen satırı temizlendi. Yeni yapı `role=list`,
  `role=listitem` ve bölüm `aria-label`larıyla ekran okuyucular için de daha anlamlıdır.
- Gerçek tarayıcı QA'sında `390×844` ve en dar desteklenen `320×700` görünümleri çalıştırıldı:
  komut/açıklama dikey yığını doğrulandı, belge genişliği viewport ile eşit kaldı ve yatay
  taşma oluşmadı.
- `tools/test_web_mobile.js` responsive yardım sözleşmesini; `tools/test_web_reactions.js`
  ise `home` komutunun yeni yardım yapısında görünürlüğünü kalıcı olarak denetler.

**Maliyet:** Sıfır; yalnız mevcut statik HTML/CSS/JavaScript içinde responsive sunum.

**Doğrulama:** 22 web test paketi · **936 kontrol** · tamamı başarılı. Gerçek tarayıcıda
`390×844` ve `320×700` ölçümlerinde `scrollWidth === viewport width` ve komut/açıklama
dikey yığını doğrulandı.

**Production:** `ca2d4d40` · `https://spacecat.watch` `HTTP 200`; cache-buster ile canlı
kaynakta `.help-screen`, mobil `└─` devam kuralı ve semantik `helpRow` üreticisi doğrulandı.
Pages önizleme alan adı yerel doğrulamada bağlantıyı sıfırladı; özel alan adı ve canlı
kaynak doğrulaması başarılıdır.

## Faz 21.6 · Mission Focus + Track Reveal — CODEX — 2 Ağustos 2026

- Yeni `focus [n]` komutu, mevcut `track [n]` canlı motorunu tam viewport görev izleme
  kabuğunda sunar. Yeni API, timer, kaynak polling'i veya ikinci uçuş fiziği yoktur.
- Focus sahnesi büyük gerçek T-0 saati, görev adı, kaynak durumu/son kontrol zamanı,
  66×22 ASCII sahne, kritik telemetri ve `SOURCE / PLANNED / MODEL` doğruluk şeridini taşır.
  Terminal geçmişi, prompt ve ikincil ürün yüzeyleri mod boyunca gizlenir.
- CSS `position: fixed; inset: 0` bütün tarayıcılarda güvenilir temel tam-ekrandır. Native
  Fullscreen API yalnız destek varsa görünür ve `[FULLSCREEN]` kullanıcı jestiyle çalışır;
  otomatik fullscreen talebi yoktur.
- Mobil klavye dominant sahne başında blur edilir. Arka plan kaydırması kilitlenir; ESC ve
  safe-area uyumlu 48 px `[EXIT]` aynı kernel cleanup hattından overlay'i, sınıfı,
  listener'ı ve native fullscreen durumunu temizleyerek prompt'a döner.
- Mevcut `track` sorunu kökünden giderildi: inline sahne geçici bir viewport-yüksekliği alır
  ve `scrollIntoView({block:'start'})` ile açıldığı anda ekranın üstüne hizalanır. 320 px
  ölçümünde eski `panelTop ≈ 461 px`, yeni yapıda `panelTop ≈ 0 px` oldu. Çıkışta geçici
  yükseklik kaldırılır.
- Gerçek tarayıcı QA: `focus` için `320×700`, `390×844`, `1280×800`; `track` için `320×700`.
  Bütün sahnelerde panel/saat/ASCII `scrollWidth` viewport'u aşmadı; mobil klavye kapandı,
  click ve ESC çıkışları temiz prompt dönüşü verdi.
- Yeni `tools/test_web_focus.js` 34 komut, ortak motor, doğruluk, fullscreen, safe-area,
  touch, keyboard, scroll-lock, track reveal ve cleanup kontrolü taşır.

**Doğrulama:** 23 web test paketi · **970 kontrol** · tamamı başarılı.

**Maliyet:** Sıfır; mevcut live motoru ve kaynak yenileme ritmi paylaşılır.

**Production:** `c2d72894` · `https://spacecat.watch` `HTTP 200`; cache-buster ile canlı
kaynakta `focus [n]`, `.live-focus`, `.live-track` ve üst-hizalama çağrısı doğrulandı.
Pages önizleme alan adı yerel doğrulamada zaman aşımına uğradı; canonical özel alan adı ve
canlı kaynak doğrulaması başarılıdır.

## Faz 21.7 · Persistent Command Deck — CODEX — 2 Ağustos 2026

- Terminalin birincil kontrol yüzeyi artık bütün normal ekranlarda viewport'un altına
  sabitlenmiş gerçek bir Command Deck'tir. Uzun çıktı, `help` veya geçmiş kullanıcıyı komut
  satırını aramak ve sayfanın sonuna inmek zorunda bırakmaz.
- Normal durumda gerçek düzenlenebilir prompt ile kısa ipucu görünür. `focus`, `track`, ISS,
  sinema ve diğer dominant Experience Kernel akışlarında aynı dock sahte bir input sunmaz;
  çalışan kanalın adını ve `ESC / EXIT` çıkışını gösteren salt-okunur durum satırına dönüşür.
- Dock yüksekliği `ResizeObserver` ile ölçülerek içerikte yer ayrılır. `visualViewport`
  resize/scroll takibi, safe-area ve klavye ofseti komut satırını telefon klavyesinin veya
  tarayıcı kromunun arkasında bırakmaz.
- Inline `track` için viewport rezervi Command Deck'i hesaba katar; sahne üstten başlar,
  telemetri dock altında kaybolmaz. Focus overlay'i dock'un altında değil arkasında kalır.
- Gerçek tarayıcı QA'sında normal/focus/track durumları `320×700`, `390×844` ve masaüstü
  `1280×800` boyutlarında kontrol edildi. Belge genişliği viewport ile eşit kaldı; dock her
  durumda alt kenarda ve görünür ölçüldü.
- Yeni `tools/test_web_command_dock.js`, normal/busy durum geçişi, kernel entegrasyonu,
  klavye/safe-area, içerik rezervi ve cleanup sözleşmesini 37 kontrolle korur.

**Doğrulama:** 24 web test paketi · **1007 kontrol** · tamamı başarılı.

**Maliyet:** Sıfır; yalnız mevcut statik HTML/CSS/JavaScript kabuğu değişti.

**Production:** `c8c65a6e` · `https://spacecat.watch` `HTTP 200`; cache-buster ile canlı
kaynakta `.command-dock`, `syncCommandDock`, busy durum satırı ve focus/track entegrasyonu
doğrulandı. Deployment önizlemesi: `https://c8c65a6e.spacecat.pages.dev`.

## Faz 21.8 · İlk Yerel Dil: Kontrollü Türkçe — CODEX — 2 Ağustos 2026

- İlk yerel dil Türkçe olarak `/tr` altında ayrı, crawlable ve self-canonical bir rota
  biçiminde kuruldu. İngilizce `/` aynı zamanda `x-default`; iki sayfa karşılıklı `hreflang`
  taşır ve `/tr` sitemap'e eklendi.
- Tasarım sınırı bilinçli olarak dar tutuldu. Prompt, komutlar/argümanlar, dosya sistemi,
  `MISSION OPS / DEEP SPACE`, görev/ajans isimleri, ASCII sahneler ve doğruluk sözlüğü
  (`SOURCE / PLANNED / MODEL / SIMULATED`) çevrilmedi.
- Türkçeleşen katman: arama başlığı/açıklaması, JavaScript öncesi görünür ürün metni,
  `help` komut açıklamaları, ilk operatör rehberi, hero kullanım ipuçları, uygulama
  özellikleri, platform/kurulum/fiyat açıklamaları, güven bildirimi ve input erişilebilirlik
  etiketi. Aynı içeriğin İngilizce/Türkçe kopyaları ekrana birlikte basılmıyor.
- `lang en|tr` komutu ve ürün satırındaki sade `LANG TR [EN]` / `LANG EN [TR]` bağlantısı
  gerçek canonical rotalar arasında geçiş yapar. Dil yalnız localStorage veya tarayıcı
  tahminine bırakılmadı; otomatik yönlendirme yoktur. `home`, seçilen dilin kökünde kalır.
- Worker, Türkçe rotada `<html lang="tr">`, `og:locale=tr_TR`, Türkçe WebPage/App JSON-LD,
  meta metni ve statik görünür içeriği sunar. Komut motoru tek kaynak olarak paylaşılır;
  yeni backend, API, polling veya çalışma zamanı çeviri servisi eklenmedi.
- Gerçek tarayıcı QA: Türkçe ana ekran ve `help` 320×700 ile 390×844; ana ekran 1280×800.
  Yatay taşma sıfır, Command Deck her durumda alt kenarda ve `lang en` geçişi başarılıdır.
- Yeni `tools/test_web_i18n.js` dil sınırı, canonical/hreflang/JSON-LD, sitemap, komutların
  değişmemesi, tek aktif açıklama dili ve route dönüşümünü 41 kontrolle korur.

**Doğrulama:** 26 web/güvenlik test paketi · **1058 kontrol** · tamamı başarılı.

**Maliyet:** Sıfır; mevcut Worker + statik terminal üzerinde derleme zamanı metin kataloğu.

**Production:** `97ee3c7e` · `https://spacecat.watch/tr` `HTTP 200`; canlı kaynakta Türkçe
`html lang`, self-canonical, karşılıklı `hreflang`, Türkçe JSON-LD, görünür ürün metni,
merkezi `TR_HELP` kataloğu ve `lang` komutu doğrulandı. `/tr/` kalıcı olarak `/tr`ye 301
yönlenir; canlı sitemap Türkçe canonical URL'yi taşır.

## Faz 21.9 · İkinci Yerel Dil: Kontrollü İspanyolca — CODEX — 2 Ağustos 2026

- İspanyolca `/es`, mevcut yerelleştirme anayasasının ikinci yerel dili olarak ayrı,
  crawlable ve self-canonical rotada kuruldu. `/`, `/tr`, `/es` ve `x-default` karşılıklı
  `hreflang` taşır; İspanyolca canonical sitemap'e eklendi.
- Terminalin temel karakteri değişmedi. Prompt, komutlar/argümanlar, dosya yolları,
  `MISSION OPS / DEEP SPACE / FILESYSTEM`, görev/ajans adları, ASCII sahneler ve
  `SOURCE / PLANNED / MODEL / SIMULATED / GO / HOLD / T-0` sözlüğü İngilizce kaldı.
- İspanyolcalaşan alanlar yalnız anlam katmanıdır: SEO metni, JavaScript öncesi görünür
  ürün açıklaması, `help` açıklamaları, operatör rehberi, hero ipuçları, özellikler,
  platform/kurulum/fiyat, güven bildirimi ve erişilebilirlik etiketi. Ekranda birden fazla
  açıklama dili aynı anda gösterilmez.
- Merkezi `ES_HELP` kataloğu mevcut `TR_HELP` ile ortak seçim sınırına bağlandı.
  `lang en|tr|es` ve ürün satırındaki sade iki alternatif dil bağlantısı canonical rotalar
  arasında geçer; aktif dil bağlantısı tekrarlanmaz ve `home` o dilin kökünü korur.
- Worker `/es` için `<html lang="es">`, `og:locale=es_ES`, İspanyolca WebPage/App JSON-LD,
  meta bilgisi ve görünür statik içeriği üretir. Otomatik IP/tarayıcı yönlendirmesi,
  çalışma zamanı çeviri servisi, yeni API veya backend yoktur.
- Gerçek tarayıcı QA: İspanyolca ana ekran/`help` 320×700 ve 390×844; ana ekran 1280×800.
  Yatay taşma sıfır, Command Deck sabit, `[EN] [TR]` bağlantıları doğru ve `lang es` ile
  `lang en` geçişleri başarılıdır.
- `tools/test_web_i18n.js` üç dilin canonical/hreflang/JSON-LD sözleşmesini, iki açıklama
  kataloğunu, korunmuş İngilizce terminal çekirdeğini ve route dönüşümünü 60 kontrolle korur.

**Doğrulama:** 26 web/güvenlik test paketi · **1078 kontrol** · tamamı başarılı.

**Maliyet:** Sıfır; mevcut Worker ve statik açıklama katalogları paylaşılır.

**Production:** `3c969e31` · `https://spacecat.watch/es` `HTTP 200`; canlı kaynakta
İspanyolca `html lang`, self-canonical, `es_ES`, JSON-LD, görünür ürün metni, `ES_HELP`,
üçlü `hreflang` ve `lang es` sözleşmesi doğrulandı. `/es/` kalıcı olarak `/es`ye 301
yönlenir; canlı sitemap İspanyolca canonical URL'yi taşır.

## Faz 21.10 · Üçüncü Yerel Dil: Kontrollü Fransızca — CODEX — 2 Ağustos 2026

- Fransızca `/fr`, aynı dar yerelleştirme sözleşmesinin üçüncü yerel dili olarak ayrı,
  crawlable ve self-canonical rotada kuruldu. `/`, `/tr`, `/es`, `/fr` ve `x-default`
  karşılıklı `hreflang` taşır; Fransızca canonical sitemap'e eklendi.
- Prompt, komutlar/argümanlar, dosya yolları, görev kontrolü başlıkları, görev/ajans adları,
  ASCII sahneler ve doğruluk sözlüğü İngilizce kaldı. SEO ve JavaScript öncesi içerik,
  `help` açıklamaları, operatör rehberi, canlı görev ipuçları, ürün/güven metinleri ve
  erişilebilirlik etiketi Fransızcalaştırıldı.
- Merkezi `FR_HELP`, Türkçe ve İspanyolca kataloglarla aynı seçim sınırına bağlandı.
  `lang en|tr|es|fr` ve görünür alternatif bağlantıları canonical rotalara gider; aktif dil
  tekrarlanmaz, `home` seçili dilde kalır ve otomatik dil yönlendirmesi yapılmaz.
- Worker `/fr` için `<html lang="fr">`, `og:locale=fr_FR`, Fransızca WebPage/App JSON-LD,
  arama metni ve görünür statik içerik üretir. Yeni API, backend, abonelik veya çalışma
  zamanı çeviri servisi eklenmedi.

**Doğrulama:** Fransızca ana ekran ve `help` 390×844, `help` 320×700, ana ekran 1280×800
gerçek tarayıcı boyutlarında yatay taşmasızdır. Command Deck alt kenarda görünür;
`lang en` → `lang fr` gidiş dönüşü başarılıdır. 26 web/güvenlik test paketi toplam
**1097 kontrol** ile geçmiştir.

**Maliyet:** Sıfır; mevcut Worker ve statik açıklama katalogları paylaşılır.

**Production:** `3b3e526c` · `https://spacecat.watch/fr` `HTTP 200`; canlı kaynakta
Fransızca `html lang`, self-canonical, `fr_FR`, JSON-LD, görünür ürün metni, `FR_HELP`,
dörtlü `hreflang` ve `lang fr` sözleşmesi doğrulandı. `/fr/` kalıcı olarak `/fr`ye 301
yönlenir; canlı sitemap Fransızca canonical URL'yi taşır.
