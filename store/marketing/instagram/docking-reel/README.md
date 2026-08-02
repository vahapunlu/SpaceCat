# SPACE CAT — Orbital Rendezvous Instagram Reel

## Teslim varlıkları

- `spacecat-docking-reel-directors-cut-1080x1920-26s.mp4` — Instagram Reels ana video / yönetmen kurgusu
- `spacecat-docking-reel-1080x1920-15s.mp4` — ilk kurgu; yayın için kullanılmayacak
- `cover-1080x1920.png` — dikey kapak
- `instagram-caption.txt` — yayın metni
- `frame.html` ve `frames/` — alt uçuş telemetrisi eklenmiş yeniden üretilebilir görsel kaynak
- `render.sh` — aynı varlıklardan videoyu yeniden üretir

## Teknik sözleşme

- 1080×1920, 9:16, 30 fps, H.264 High / AAC
- 26.0 saniye; 48 kHz stereo ses; fast-start MP4
- SC Station katmanları yalnızca `clear25` (8.4 sn) ve `docked` (19.05 sn)
- Arka plan: `universfield-deep-space-ambient-153309.mp3`; ana atmosfer olarak kesintisiz ve
  yaklaşık +9.5 dB yükseltilmiş. Konuşmalar sırasında ducking uygulanmaz.
- Ek katmanlar: yalnızca üç düşük seviyeli görev/geçiş tonu
- Müzik ağırlıklı bölümlerde ortalama yaklaşık -15.6 dB; final peak yaklaşık -1.3 dB
- Telifli trend müzik veya dış ağ varlığı kullanılmadı

## Storyboard

1. Cartridge 20 boot — 3.5 sn
2. Wide acquisition — 5.5 sn
3. Hold Point 12 / Fine RCS — 5.5 sn
4. Port A final approach — 6.5 sn
5. Soft capture / Mission Complete — 5.5 sn
6. Find the Cartridge / spacecat.watch — 3 sn

Sahneler 0.7 saniyelik yumuşak geçişlerle birbirine bağlanır. Uçuş karesinin alt bölümü;
range, closing rate, attitude/alignment ve yaklaşma fazlarını gösteren navigation deck ile doldurulmuştur.
