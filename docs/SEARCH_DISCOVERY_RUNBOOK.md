# SPACE CAT — Search & Discovery Runbook

Bu doküman sitenin bakım yükü oluşturmadan Google, Bing ekosistemi ve makine-okuyucu
tarayıcılar tarafından keşfedilmesini sağlamak için hazırlanmıştır.

## 1. Otomatik çalışan katman

- `robots.txt` bütün botlara siteyi açar ve canonical sitemap'i bildirir.
- `sitemap.xml`, `node tools/update_web_sitemap.js` ile kaynak dosyaların gerçek değişiklik
  tarihlerinden üretilir.
- Ana sayfa ve beş terminal giriş rotası JavaScript çalışmadan da gerçek başlık, ürün
  açıklaması, CTA ve crawlable iç bağlantılar sunar.
- Worker her giriş rotasına ayrı title, description, canonical, görünür route metni ve
  `WebPage` JSON-LD kimliği verir.
- JSON-LD graphı `WebPage`, `WebSite`, `Organization` ve `MobileApplication` varlıklarını
  birbirine bağlar.
- `llms.txt`, deneysel ve ikincil bir makine-okuyucu yönlendirme dosyasıdır. Canonical HTML
  her zaman asıl kaynaktır.
- IndexNow sahiplik anahtarı site kökünde barındırılır. Güncelleme sonrası:

```bash
node tools/submit_indexnow.js
```

2026-07-31 ilk production bildirimi yedi URL için `HTTP 202` ile kabul edildi. Bu kod ilk
anahtar doğrulaması beklenirken normaldir; sonraki başarılı bildirimler çoğunlukla `200`
döner.

## 2. Google Search Console — TAMAMLANDI (31 Temmuz 2026)

Canlı durum:

- `sc-domain:spacecat.watch` property Cloudflare Domain Connect üzerinden DNS TXT ile
  doğrulandı. Doğrulamanın kalması için bu TXT kaydı silinmemeli.
- `https://spacecat.watch/sitemap.xml` başarıyla işlendi; Google **7 sayfa** keşfetti.
- `/`, `/live`, `/launch`, `/iss`, `/solar`, `/felicette` ve `/privacy` URL Inspection
  canlı testinden geçerek birer kez öncelikli tarama sırasına gönderildi.
- İlk tabloda birkaç saniye görünen `Getirilemedi` durumu geçiciydi; sitemap ayrıntısı
  `Site haritası başarıyla işlendi` sonucuna ve 7 keşfedilmiş sayfaya döndü.

Google IndexNow kullanmaz. Aşağıdaki işlem site sahibi Google hesabıyla bir kez yapılmalıdır:

1. `https://search.google.com/search-console` adresinde **Domain property** olarak
   `spacecat.watch` ekle.
2. Google'ın verdiği DNS TXT doğrulama kaydını Cloudflare DNS'e ekle.
3. **Sitemaps** bölümünde `https://spacecat.watch/sitemap.xml` gönder.
4. **URL Inspection** ile önce ana sayfayı kontrol et ve `Request indexing` seç.
5. Aynı işlemi şu rotalar için yap:
   - `https://spacecat.watch/live`
   - `https://spacecat.watch/launch`
   - `https://spacecat.watch/iss`
   - `https://spacecat.watch/solar`
   - `https://spacecat.watch/felicette`
   - `https://spacecat.watch/privacy`

İstek göndermek sıralama garantisi değildir. Search Console'da rendered HTML içinde
`SPACE CAT`, ürün açıklaması ve terminal giriş bağlantıları görünmelidir.

## 3. Dış keşif sinyalleri

- Google Play Console'daki **Developer website** alanı `https://spacecat.watch/` olmalıdır.
- X ve Instagram bio'ları canonical domain'e bağlantı vermelidir.
- Search Console platform mülkleri kademeli dağıtımdadır. 31 Temmuz 2026 denetiminde X,
  Google Hesabı düzeyinde bağlı uygulama olarak kaydedildi; ancak Search Console X mülkü
  oluşturulmadı. Instagram izin ekranı dış doğrulamaya geçmedi. YouTube seçiminde yalnız
  `@nehaber123` ve `@FWFLiveApp` göründüğü için SPACE CAT adına yanlış kanal bağlanmadı.
  Marka YouTube kanalı ve platform doğrulama akışı hazır olmadan bu adım tamamlanmış
  sayılmaz.
- Show HN, Reddit veya diğer topluluk gönderileri reklam metni gibi değil, deneyimin
  kendisine açılan gerçek bağlantı taşımalıdır.
- Sahte rating, yapay review, ücretli backlink veya anahtar kelime doldurma kullanılmaz.

## 4. Kontrol ritmi

Sürekli editoryal bakım gerekmez. Lansmandan sonra:

- 48 saat: URL Inspection ve sitemap okuma durumu
- 7 gün: indexed page sayısı ve ilk impression/query sinyalleri
- 28 gün: sorgu, ülke, cihaz ve CTR karşılaştırması

Karar kaynağı Search Console'dır; `site:` araması yalnız hızlı bir gözlem aracıdır.

## 5. Yayın kapısı

Her web dağıtımından önce:

```bash
node tools/update_web_sitemap.js
node tools/test_web_seo.js
node tools/test_web_phase9.js
node tools/test_web_reactions.js
node tools/test_web_mobile.js
```

Production doğrulamasından sonra yalnız gerçekten değişen canonical URL'ler için IndexNow
bildirimi gönderilir. Mevcut küçük sitede yedi URL'lik tam gönderim güvenlidir.
