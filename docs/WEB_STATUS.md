# SPACE CAT — Web Sitesi Durum Özeti

> Son güncelleme: 2026-08-02 (Türkçe + İspanyolca kontrollü yerelleştirme hazır).
> Wear/watchOS uygulama durumu için: [HANDOVER.md](HANDOVER.md).
> **Teknik detayın güncel sahibi: [CODEX_WEB_UPDATES.md](CODEX_WEB_UPDATES.md)** — aşağıdaki bazı detaylar
> (cache anahtarları, komut listesi) Codex dalgasıyla değişti; çelişkide Codex dosyası esastır.

## ⚡ 2026-07-30 GECE — Claude dalga 3 (canlıda doğrulandı ✅)

- **`replay [flight]`** — TAPE ARCHIVE: felicette (1963, suborbital, "RECOVERED ALIVE"), sputnik, apollo11, sts1, voyager. Statik veri, sinema motoru override'larıyla (m.endTitle/m.orbitCall/m.archive).
- **`board`** — havaalanı tarzı DEPARTURES tablosu (canlı LL2).
- **`install` + ASCII QR** — statik QR matrisi (python qrcode ile üretildi, EC-M) → `spacecat.watch/app` → worker 302 → Play Store. Telefon kamerası okuyor.
- **`today`** — uzay tarihinde bugün (~48 statik kayıt, UTC deterministik; eşleşme yoksa en yakın kayıt).
- **`moon`** — ay fazı, saf matematik (epoch 2000-01-06 18:14 UTC), ASCII sanat.
- **`pass`** — ISS senin üstünden ne zaman geçecek: geolocation (izinle, cihazda kalır) + dairesel yörünge yaklaşımı, 24s tahmin. Worker Permissions-Policy `geolocation=(self)` yapıldı.
- **`radio`** — CAPCOM ambiyansı: WebAudio ile sentezlenen statik + Quindar tonları (dosyasız). `radio off`.
- **`wargames`/`joshua`** — "Shall we play a game?" easter egg.
- **Tanıtım varlıkları:** `store/spacecat-launch.gif` (3.4MB) + **`store/spacecat-launch.mp4`** (344KB, 1280px, X için ideal).
- Doğrulama: canlıda board/install(QR)/moon çalışır görüldü, `/app` 302 ✅, JS+worker sözdizimi ✅, konsol temiz ✅, `replay felicette` tam akış yerelde izlendi ✅.

## ⚡ 2026-07-30 AKŞAM — Codex dalgası (canlıda doğrulandı ✅)

- **LL2 v2.3**'e geçildi (v2.2 EOL). Cache: `sc_ll2_v5` (30 dk), events/previous 60 dk. `track` T-0 kontrolü 10 dk.
- **`_worker.js`** eklendi: güvenlik başlıkları (CSP/nosniff/DENY/referrer/permissions) + www ve pages.dev → apex 301 canonical + rota metadatası. **Deploy artık Wrangler ile yapılmalı** (worker'lı Pages).
- **Yeni rotalar:** `/live` `/launch` `/iss` `/solar` `/felicette` — aynı terminal, rota-özel title/canonical/OG; komutu otomatik çalıştırır. Paylaşımda artık `#launch` değil `/launch` kullan.
- **Yeni komutlar:** `solar` (NOAA Kp/G-ölçeği; NOAA kesikken "UPLINK LOST" fallback — doğrulandı), `signal` (günlük deterministik mesaj), `logbook`/`clearance` (yerel Black Box görev günlüğü, `sc_logbook_v1`), `patch`/`copy` (deterministik ASCII mission patch + flight record), `sound on/off`, `ls /classified` + `decode` (gizli katman).
- **Faz 1 canlı konsol:** T-60dk "PRIORITY TRAFFIC", T-10dk "FINAL COUNT", sekme başlığında canlı sayaç, HOLD/retarget uyarıları.
- SEO: `robots.txt`, `sitemap.xml`, JSON-LD, canonical'lar. Erişilebilirlik: aria-live düzeni. Privacy metni analytics'le tutarlı hale getirildi.
- Claude doğrulaması (canlı): güvenlik başlıkları ✅, www→apex 301 (path+query korunuyor) ✅, pages.dev→apex ✅, `/solar`+`/live` rota metadata ✅, trailing slash 301 ✅, LL2 v2.3 ✅, konsol temiz ✅. NOAA şu an küresel olarak boş yanıt veriyor (202/0B) — site fallback'i doğru çalışıyor, kod sorunu değil.

## 🟢 CANLI DURUM

- **Site:** https://spacecat.watch — YAYINDA, tam çalışır.
- **www:** https://www.spacecat.watch — bağlı (Pages custom domain).
- **Yedek URL:** https://spacecat.pages.dev (Cloudflare Pages projesi `spacecat`).
- **Domain:** `spacecat.watch` satın alındı (Cloudflare Registrar, $34.20/yıl, auto-renew AÇIK, WHOIS gizliliği dahil). Nameserver'lar Cloudflare, DNS aktif.
- **Analytics:** Cloudflare Web Analytics kurulu (çerezsiz, otomatik enjeksiyon). Panel: dash → Analytics → Web analytics → spacecat.watch. Veri birkaç saatte birikmeye başlar.
- **Command Deck:** Gerçek prompt normal terminalde viewport altına sabittir. Dominant
  animasyonlarda aynı alan çalışan kanalın durumunu ve `ESC / EXIT` çıkışını gösterir;
  320/390 px telefon ve 1280 px masaüstü QA'sı taşmasızdır.
- **Diller:** İngilizce `/` + `x-default`; Türkçe `/tr`; İspanyolca `/es`; Fransızca `/fr`;
  Japonca `/ja`; Almanca `/de`.
  Terminal çekirdeği İngilizce, kullanıcı açıklamaları tek aktif dilde görünür.
  `lang en|tr|es|fr|ja|de`, karşılıklı
  `hreflang`, self-canonical ve sitemap kayıtları hazırdır.

## 📁 Dosyalar (`web/`)

| Dosya | Ne |
|---|---|
| `index.html` | Tek dosyalık DOS-terminal ana sayfa (tüm JS gömülü) |
| `launch.mp3` | Roket fırlatma ses efekti (`sudo launch`/`track` sırasında) |
| `og.png` | 1200×630 sosyal medya kartı (X/Reddit/WhatsApp önizleme) |
| `icon.svg` / `icon-512.png` | Favicon + apple-touch-icon |
| `manifest.webmanifest` | PWA — telefona "uygulama gibi" eklenebilir |
| `privacy.html` | Gizlilik politikası (`/privacy`), terminal temalı — "We collect nothing" |
| `404.html` | Terminal temalı 404 sayfası |
| `README.md` | Yayın notları |

**Ayrıca:** `store/spacecat-launch.gif` (3.4 MB, 900px, 10fps) — X/Reddit paylaşımı için hazır tanıtım GIF'i. Ham 9.4 MB versiyon `~/Downloads/spacecat-launch.gif`.

## ⌨️ Terminal komutları (hepsi canlı veri, çalışıyor)

**Mission ops:** `sudo launch [n]` (30 sn ASCII fırlatma sineması + ses), `track [n]` (GERÇEK T-0'a kilitli canlı senkron; sahne otomatik görünür), `focus [n]` (aynı canlı motorun tam viewport Mission Focus modu), `next`, `crosscheck [n]` (LL2 ↔ RLL T-0 doğrulaması), `stream [n]` (güvenli resmî webcast sinyali), `recent` (son 5 fırlatma + sonuç), `mission [n]` (tam görev dosyası), `wx [n]` (pad havası + GO odds), `remind [n]` (GCal/.ics), `notify` (T-10 dk tarayıcı bildirimi).
**Deep space:** `iss` (ASCII dünya haritasında canlı ISS takibi), `events`, `wire`.
**Uygulama:** `about`, `features`, `platforms`, `install`, `price`, `contact`.
**Misc:** `felicette`, `share`, `history`, `clear`, TAB tamamlama.
**Easter egg:** `ping felicette`, `uname`, `meow`, `rm`, `sl`, `exit`.
**Deep link:** `spacecat.watch/#launch` (otomatik sinema), `#track`, `#iss` (boot sonrası otomatik komut).
**Fırlatma-günü modu:** gerçek T-0'a <1 saat kalınca hero'da "⚠ LAUNCH IMMINENT" + tek tık track.

## 🚀 DEPLOY (tek komut, tarayıcısız)

```bash
cd "/Users/vahap/Documents/SPACE CAT" && \
CLOUDFLARE_API_TOKEN=$(cat keystore/cloudflare_pages_token.txt) \
CLOUDFLARE_ACCOUNT_ID=$(cat keystore/cloudflare_account_id.txt) \
npx wrangler pages deploy web --project-name spacecat --commit-dirty=true
```

- **Token:** `keystore/cloudflare_pages_token.txt` — sadece **Pages:Edit** yetkili, adı `spacecat-pages-deploy`. Hesap ID: `keystore/cloudflare_account_id.txt` (`10e684a115d2f5e04f0b2a66f9f6cf49`).
- Yerel test: `cd web && python3 -m http.server 8787`.

## 📊 Veri kaynakları

Launch Library 2 (`ll.thespacedevs.com`) primary ve tarayıcıdan direkt · premium
RocketLaunch.Live (**$3/ay**) Cloudflare Pages secret kasası üzerinden schedule crosscheck
ve LL2 arızasında standby · Spaceflight News API · Open-Meteo · wheretheiss.at. LL2 cache:
`localStorage sc_ll2_v6` (30 dk); RocketLaunch.Live şema 2 endpoint'i edge cache 5 dk /
`sc_rll_v2` cihaz cache 10 dk; events ve previous 60 dk.

## 📣 PAYLAŞIM CEPHANESİ (reklam koordinatörü notu)

- **GIF hazır:** `store/spacecat-launch.gif` — X/Reddit'te düz linkten çok daha fazla etkileşim.
- **Show HN başlığı:** "Show HN: Watch real rocket launches in a DOS terminal (ASCII + live data)"
- **X (TR):** "Gerçek roket fırlatmalarını 1985 model bir DOS terminalinden izleyin: canlı geri sayım, ASCII fırlatma sineması, ASCII haritada canlı ISS takibi. `sudo launch` yazmanız yeterli 🐈🚀 spacecat.watch/#launch"
- **ZAMANLAMA:** Sıradaki gerçek fırlatma **1 Ağustos 2026 02:00 UTC** (Starlink 17-52). Paylaşımı 2-3 saat önce yap → tıklayan herkes `track` ile canlı sayan geri sayıma düşer.
- Kanallar: Show HN + X + r/spacex + r/InternetIsBeautiful.

## ⏳ AÇIK İŞLER

- [ ] **Paylaşım** — GIF + metinlerle, 1 Ağustos fırlatmasından önce (kullanıcı yapar).
- [ ] **App Store onayı** gelince (watchOS 1.0 build 2 WAITING_FOR_REVIEW): `index.html`'de "APP STORE — COMING SOON" ghost butonunu gerçek App Store linkiyle değiştir (`.btn.ghost.soon` span → `<a class="btn">`). Tek satır + deploy.
- [ ] **Play Console privacy URL'i** → `https://spacecat.watch/privacy` olarak güncelle (kullanıcı, Console'dan).
- [ ] (ops) Analytics'i fırlatma günü kontrol et — trafiğin nereden geldiğini gör.

## 🔑 Bilgi

- Cloudflare hesabı: Vahapunlu@gmail.com. Registrant e-postası aynı.
- Uygulama arayüzü statik ve framework'süzdür. Tek sunucu tarafı parça,
  RocketLaunch.Live anahtarını saklayan aynı-origin Pages Worker endpoint'idir; ek
  veritabanı veya Cloudflare ücreti yoktur.
