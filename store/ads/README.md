# Space Cat — Google App Campaign Creative Kit

## Kampanya fikri

**Ana fikir:** `THE NEXT LAUNCH IS ALREADY COUNTING DOWN.`

Space Cat'in en güçlü vaadi “uzay haberi” değil; **T-0 anını kişinin bileğine taşıması**. Bu nedenle
kreatif, uzaktan izlenen gerçekçi bir gece fırlatması ile o anda çalışan gerçek Wear OS ekranını
tek karede birleştiriyor.

İki görsel hipotez hazır:

1. **Product proof:** Saat ekranında emülatörden alınmış gerçek Starlink / Falcon 9 / GO sayacı.
2. **Brand recall:** Saat ekranında CAT işareti.

İlk hipotez ürünü ve kullanım anını açıklar; ikincisi daha hızlı marka hatırlanması hedefler.
Google Ads'te ikisini aynı kampanyaya yükleyip asset performans etiketleriyle karşılaştır.

## Hazır dosyalar

### Görseller

| Dosya | Oran | Kullanım |
|---|---:|---|
| `images/spacecat-appcampaign-1200x1200.png` | 1:1 | Product proof · square |
| `images/spacecat-appcampaign-1200x628.png` | 1.91:1 | Product proof · landscape |
| `images/spacecat-appcampaign-1200x1500.png` | 4:5 | Product proof · portrait |
| `images/spacecat-logo-1200x1200.png` | 1:1 | Brand recall · square |
| `images/spacecat-logo-1200x628.png` | 1.91:1 | Brand recall · landscape |
| `images/spacecat-logo-1200x1500.png` | 4:5 | Brand recall · portrait |

Görsellerde ekstra reklam metni yoktur. Böylece Google'ın dinamik metin yerleşimine ve farklı
kırpımlarına alan kalır; yalnız ürünün gerçek UI metni ve marka işareti görünür.

### Videolar

| Dosya | Dil | Oran | Süre |
|---|---|---:|---:|
| `video/spacecat-appcampaign-tr-9x16-v4-approved-15s.mp4` | Türkçe | 9:16 | 15 sn |
| `video/spacecat-appcampaign-en-9x16-v5-15s.mp4` | İngilizce | 9:16 | 15 sn |
| `video/spacecat-appcampaign-tr-16x9-v5-15s.mp4` | Türkçe | 16:9 | 15 sn |
| `video/spacecat-appcampaign-en-16x9-v5-15s.mp4` | İngilizce | 16:9 | 15 sn |

Videolar 30 fps H.264, `yuv420p`, AAC stereo ve `faststart` olarak hazırlanmıştır. Müzik lisansı
riski kullanıcı tarafından sağlanan kaynak dosyanın lisansına bağlıdır. Final master'larda
`jci21-rocket-launch-sfx-253937.mp3` roket fırlatma kaydı kullanılmıştır.

App Campaign videoları Google Ads'e eklenmeden önce YouTube'a **public** veya **unlisted** olarak
yüklenmelidir.

## Google Ads metinleri

Makine-okunur ve kopyalanabilir TR/EN set: [`copy.json`](copy.json)

Her dilde 5 bağımsız headline ve 5 bağımsız description bulunur. Google bu parçaları farklı
kombinasyonlarda gösterebildiği için her cümle tek başına anlamlıdır. Headline'lar en fazla 30,
description'lar en fazla 90 karakterdir.

Dil karıştırma:

- Türkçe kampanyada yalnız `tr` metinleri + Türkçe 9:16 ve 16:9 videolar.
- İngilizce kampanyada yalnız `en` metinleri + İngilizce 9:16 ve 16:9 videolar.
- Dil içermeyen altı statik görsel iki kampanyada da kullanılabilir.

## Önerilen ilk kampanya yapısı

### 1. `UAC_TR_PURCHASE_V1`

- Amaç: ücretli uygulama edinimi.
- Store: Google Play / `com.spacecat.terminal`.
- Dil: Türkçe.
- Görseller: altı dosyanın tamamı.
- Video: `spacecat-appcampaign-tr-9x16-v4-approved-15s.mp4` ve
  `spacecat-appcampaign-tr-16x9-v5-15s.mp4`.
- Ana hipotez: “Fırlatmayı kaçırma” aciliyeti.

### 2. `UAC_EN_PURCHASE_V1`

- Amaç: ücretli uygulama edinimi.
- Store: Google Play / `com.spacecat.terminal`.
- Dil: İngilizce.
- Görseller: altı dosyanın tamamı.
- Video: `spacecat-appcampaign-en-9x16-v5-15s.mp4` ve
  `spacecat-appcampaign-en-16x9-v5-15s.mp4`.
- Ana hipotez: “Mission control on your wrist.”

Ülke, bütçe ve hedef CPA tek kararda birbirine bağlanmamalı. Önce TR ve EN kampanyalarını ayrı
tut; böylece fiyat hassasiyeti, dil ve kreatif sonucu birbirine karışmaz. İlk veri geldikten sonra
Google Ads asset raporunda `Low / Good / Best` etiketlerini inceleyip yalnız açıkça zayıf kalan
varlıkları değiştir.

## Resmî ölçü kontrolü

Google App Campaign güncel tavsiyeleri:

- Headline: 1–5 adet, 30 karakter; önerilen 5.
- Description: 1–5 adet, 90 karakter; önerilen 5.
- Görseller: 1200×628, 1200×1500, 1200×1200; PNG/JPG, en fazla 5 MB.
- Videolar: 16:9, 9:16 ve 1:1; 10–60 saniye; YouTube URL'si.

Kaynak: [Google Ads App campaigns specs and format requirements](https://support.google.com/google-ads/answer/17091671)

## AI etiketi

Fırlatma + bilek fotoğrafı arka planları üretken yapay zekâ ile oluşturulmuş, gerçek uygulama UI'ı
ve Space Cat logosu yerel olarak kompozitlenmiştir. Google Ads'e yüklerken bu görsel ve videolar
için **“created or edited with AI”** seçeneğini işaretle. Google'ın AI label ayarı Temmuz 2026
boyunca kademeli olarak açılıyor ve bazı bölgelerde görünür açıklama ekleyebiliyor.

Kaynak: [Google Ads — Use AI content label settings and disclosures](https://support.google.com/google-ads/editor/answer/17231795)

## Üretim kaynağı ve tekrar render

```bash
cd "/Users/vahap/Documents/SPACE CAT"
store/ads/render_ads.sh
```

Gerekenler: ImageMagick, FFmpeg ve FFprobe.

### Image generation prompt — vertical

```text
Use case: ads-marketing
Asset type: vertical 9:16 master background for a Google App Campaign and YouTube Shorts ad
Primary request: a cinematic, photorealistic night rocket-launch viewing scene designed to advertise a Wear OS launch-tracking app
Scene/backdrop: a real orbital rocket lifting off from a distant coastal launch pad at night, huge bright exhaust plume, low clouds catching amber light, sparse stars, subtle atmospheric haze
Subject: foreground close-up of an adult space enthusiast's forearm naturally raised toward the camera, wearing a modern round black smartwatch; the circular watch display faces the camera almost straight-on and is perfectly blank, pure matte black, with a clean circular edge for later UI compositing
Style/medium: premium cinematic campaign photography, believable documentary realism, not sci-fi fantasy
Composition/framing: vertical 9:16; watch fills the lower-middle third, rocket and plume visible in the upper half, generous clean dark negative space near the top and bottom for later typography
Lighting/mood: deep navy night, dramatic amber launch glow, very subtle emerald-green rim light echoing a mission-control terminal
Constraints: no visible UI on the watch, no text, no logo, no brand marks, no watermark, no extra watches, no spacesuit, no fictional spacecraft
```

### Image generation prompt — landscape

```text
Use case: ads-marketing
Asset type: landscape 16:9 master background for a Google App Campaign and YouTube in-stream ad
Primary request: a cinematic, photorealistic night rocket-launch viewing scene designed to advertise a Wear OS launch-tracking app
Scene/backdrop: a real orbital rocket lifting off from a distant coastal launch pad at night, massive bright exhaust plume illuminating low clouds and water, sparse stars, realistic atmospheric haze
Subject: foreground close-up of an adult space enthusiast's forearm extending from the right side, wearing a modern round black smartwatch; the circular watch display faces the camera nearly straight-on and is perfectly blank, pure matte black
Style/medium: premium cinematic campaign photography, believable documentary realism, not sci-fi fantasy
Composition/framing: wide 16:9; rocket and launch plume in the left third, watch fills the right-center third, clean negative space along the upper center
Lighting/mood: deep navy night, dramatic amber launch glow, subtle emerald-green rim light echoing a mission-control terminal
Constraints: no visible UI on the watch, no text, no logo, no brand marks, no watermark, no extra watches, no spacesuit, no fictional spacecraft
```

Üretim modu: built-in ImageGen. Son kompozit ve format türetmeleri `render_ads.sh` ile yerel olarak
yapılmıştır.
