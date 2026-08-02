#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ADS_DIR="$ROOT_DIR/store/ads"
SOURCE_DIR="$ADS_DIR/source"
IMAGE_DIR="$ADS_DIR/images"
VIDEO_DIR="$ADS_DIR/video"
AUDIO_DIR="$ADS_DIR/audio"
TMP_DIR="$(mktemp -d "${TMPDIR:-/tmp}/spacecat-ads.XXXXXX")"

trap 'rm -rf "$TMP_DIR"' EXIT

GREEN="#00E68A"
AMBER="#FFB86C"
GREY="#9AA5B1"
WHITE="#F4F7F8"
DEEP="#07100F"
FONT_REGULAR="Menlo-Regular"
FONT_BOLD="Menlo-Bold"

mkdir -p "$IMAGE_DIR" "$VIDEO_DIR" "$AUDIO_DIR"

for command_name in magick ffmpeg ffprobe; do
  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "Missing required command: $command_name" >&2
    exit 1
  fi
done

make_circle() {
  local input_path="$1"
  local output_path="$2"

  magick "$input_path" \
    -alpha set \
    \( -size 454x454 xc:none -fill white -draw "circle 227,227 227,8" \) \
    -compose DstIn -composite \
    "$output_path"
}

make_circle "$SOURCE_DIR/ui-live-countdown.png" "$TMP_DIR/ui-live-circle.png"
make_circle "$SOURCE_DIR/ui-mission-file.png" "$TMP_DIR/ui-mission-circle.png"
make_circle "$ROOT_DIR/store/screenshots/05_smart_alerts.png" "$TMP_DIR/ui-alerts-circle.png"
make_circle "$ROOT_DIR/art/icon_512.png" "$TMP_DIR/logo-circle.png"

# Place the real Wear OS countdown inside the blank watch displays produced for the campaign.
magick "$SOURCE_DIR/rocket-watch-vertical.png" \
  "$TMP_DIR/ui-live-circle.png" -geometry 276x276+289+875 -composite \
  "$TMP_DIR/watch-master-vertical.png"

magick "$SOURCE_DIR/rocket-watch-landscape.png" \
  "$TMP_DIR/ui-live-circle.png" -geometry 288x288+870+397 -composite \
  "$TMP_DIR/watch-master-landscape.png"

magick "$SOURCE_DIR/rocket-watch-vertical.png" \
  "$TMP_DIR/logo-circle.png" -geometry 276x276+289+875 -composite \
  "$TMP_DIR/watch-logo-vertical.png"

magick "$SOURCE_DIR/rocket-watch-landscape.png" \
  "$TMP_DIR/logo-circle.png" -geometry 288x288+870+397 -composite \
  "$TMP_DIR/watch-logo-landscape.png"

# Language-neutral App Campaign image set. Google supplies copy independently, so these
# deliberately avoid promotional text overlays and preserve safe crop space.
magick "$TMP_DIR/watch-master-vertical.png" \
  -crop 944x944+0+240 +repage -resize 1200x1200! \
  -unsharp 0x0.7 -strip -define png:compression-level=9 \
  "$IMAGE_DIR/spacecat-appcampaign-1200x1200.png"

magick "$TMP_DIR/watch-master-landscape.png" \
  -crop 1672x875+0+30 +repage -resize 1200x628! \
  -unsharp 0x0.7 -strip -define png:compression-level=9 \
  "$IMAGE_DIR/spacecat-appcampaign-1200x628.png"

magick "$TMP_DIR/watch-master-vertical.png" \
  -crop 944x1180+0+220 +repage -resize 1200x1500! \
  -unsharp 0x0.7 -strip -define png:compression-level=9 \
  "$IMAGE_DIR/spacecat-appcampaign-1200x1500.png"

# Brand-recall alternates: identical art direction, with the Space Cat mark on the watch.
magick "$TMP_DIR/watch-logo-vertical.png" \
  -crop 944x944+0+240 +repage -resize 1200x1200! \
  -unsharp 0x0.7 -strip -define png:compression-level=9 \
  "$IMAGE_DIR/spacecat-logo-1200x1200.png"

magick "$TMP_DIR/watch-logo-landscape.png" \
  -crop 1672x875+0+30 +repage -resize 1200x628! \
  -unsharp 0x0.7 -strip -define png:compression-level=9 \
  "$IMAGE_DIR/spacecat-logo-1200x628.png"

magick "$TMP_DIR/watch-logo-vertical.png" \
  -crop 944x1180+0+220 +repage -resize 1200x1500! \
  -unsharp 0x0.7 -strip -define png:compression-level=9 \
  "$IMAGE_DIR/spacecat-logo-1200x1500.png"

make_video_frames_portrait() {
  local frame_dir="$1"
  mkdir -p "$frame_dir"

  magick "$TMP_DIR/watch-master-vertical.png" \
    -resize "1080x1920^" -gravity center -extent 1080x1920 \
    \( -size 1080x760 gradient:'#05080D00-#05080DEB' -rotate 180 \) -gravity north -compose over -composite \
    -gravity north -font "$FONT_REGULAR" -kerning 2 -fill "$GREEN" -pointsize 26 -annotate +0+98 "SPACE CAT // LIVE" \
    -fill "$WHITE" -pointsize 42 -interline-spacing 12 -annotate +0+160 "THE NEXT LAUNCH\nIS ALREADY COUNTING DOWN." \
    "$frame_dir/01.png"

  magick -size 1080x1920 "xc:$DEEP" \
    -fill "#0B241B" -draw "circle 540,1030 1010,1030" \
    "$TMP_DIR/ui-live-circle.png" -geometry 760x760+160+650 -composite \
    -fill none -stroke "$GREEN" -strokewidth 8 -draw "circle 540,1030 925,1030" \
    -gravity north -font "$FONT_BOLD" -fill "$GREEN" -pointsize 32 -annotate +0+170 "REAL-TIME T-MINUS" \
    -fill "$WHITE" -pointsize 64 -annotate +0+235 "LIVE. EVERY SECOND." \
    "$frame_dir/02.png"

  magick -size 1080x1920 "xc:#05080D" \
    -fill "#132019" -draw "circle 540,1030 1010,1030" \
    "$TMP_DIR/ui-mission-circle.png" -geometry 760x760+160+650 -composite \
    -fill none -stroke "$GREEN" -strokewidth 8 -draw "circle 540,1030 925,1030" \
    -gravity north -font "$FONT_BOLD" -fill "$GREEN" -pointsize 32 -annotate +0+160 "MISSION FILES" \
    -fill "$WHITE" -pointsize 58 -interline-spacing 12 -annotate +0+225 "EVERY MISSION.\nEVERY AGENCY." \
    "$frame_dir/03.png"

  magick -size 1080x1920 "xc:#05080D" \
    -fill "#231A12" -draw "circle 540,1030 1010,1030" \
    "$TMP_DIR/ui-alerts-circle.png" -geometry 760x760+160+650 -composite \
    -fill none -stroke "$AMBER" -strokewidth 8 -draw "circle 540,1030 925,1030" \
    -gravity north -font "$FONT_BOLD" -fill "$AMBER" -pointsize 32 -annotate +0+150 "SMART ALERTS" \
    -fill "$WHITE" -pointsize 58 -interline-spacing 12 -annotate +0+215 "GO. HOLD. DELAY.\nKNOW FIRST." \
    "$frame_dir/04.png"

  magick -size 1080x1920 "xc:#030609" \
    "$ROOT_DIR/art/icon_512.png" -geometry 600x600+240+255 -composite \
    -gravity north -font "$FONT_BOLD" -fill "$GREEN" -pointsize 92 -annotate +0+960 "SPACE CAT" \
    -fill "$WHITE" -pointsize 40 -interline-spacing 12 -annotate +0+1095 "LAUNCH TERMINAL\nFOR YOUR WRIST." \
    -fill "$AMBER" -pointsize 34 -annotate +0+1450 "AVAILABLE ON GOOGLE PLAY" \
    "$frame_dir/05.png"
}

make_video_frames_portrait_tr() {
  local frame_dir="$1"
  mkdir -p "$frame_dir"

  magick "$TMP_DIR/watch-master-vertical.png" \
    -resize "1080x1920^" -gravity center -extent 1080x1920 \
    \( -size 1080x760 gradient:'#05080D00-#05080DEB' -rotate 180 \) -gravity north -compose over -composite \
    -gravity north -font "$FONT_REGULAR" -kerning 2 -fill "$GREEN" -pointsize 26 -annotate +0+98 "SPACE CAT // CANLI" \
    -fill "$WHITE" -pointsize 42 -interline-spacing 12 -annotate +0+160 "SIRADAKİ FIRLATMA" \
    -fill "$AMBER" -pointsize 42 -annotate +0+224 "ZATEN GERİ SAYIYOR." \
    "$frame_dir/01.png"

  magick -size 1080x1920 "xc:$DEEP" \
    -fill "#0B241B" -draw "circle 540,1030 1010,1030" \
    "$TMP_DIR/ui-live-circle.png" -geometry 760x760+160+650 -composite \
    -fill none -stroke "$GREEN" -strokewidth 8 -draw "circle 540,1030 925,1030" \
    -gravity north -font "$FONT_BOLD" -fill "$GREEN" -pointsize 32 -annotate +0+170 "GERÇEK ZAMANLI T-MINUS" \
    -fill "$WHITE" -pointsize 64 -annotate +0+235 "CANLI. HER SANİYE." \
    "$frame_dir/02.png"

  magick -size 1080x1920 "xc:#05080D" \
    -fill "#132019" -draw "circle 540,1030 1010,1030" \
    "$TMP_DIR/ui-mission-circle.png" -geometry 760x760+160+650 -composite \
    -fill none -stroke "$GREEN" -strokewidth 8 -draw "circle 540,1030 925,1030" \
    -gravity north -font "$FONT_BOLD" -fill "$GREEN" -pointsize 32 -annotate +0+160 "GÖREV DOSYALARI" \
    -fill "$WHITE" -pointsize 58 -interline-spacing 12 -annotate +0+225 "HER GÖREV.\nHER AJANS." \
    "$frame_dir/03.png"

  magick -size 1080x1920 "xc:#05080D" \
    -fill "#231A12" -draw "circle 540,1030 1010,1030" \
    "$TMP_DIR/ui-alerts-circle.png" -geometry 760x760+160+650 -composite \
    -fill none -stroke "$AMBER" -strokewidth 8 -draw "circle 540,1030 925,1030" \
    -gravity north -font "$FONT_BOLD" -fill "$AMBER" -pointsize 32 -annotate +0+150 "AKILLI UYARILAR" \
    -fill "$WHITE" -pointsize 58 -interline-spacing 12 -annotate +0+215 "GO. HOLD. ERTELEME.\nİLK SEN BİL." \
    "$frame_dir/04.png"

  magick -size 1080x1920 "xc:#030609" \
    "$ROOT_DIR/art/icon_512.png" -geometry 600x600+240+255 -composite \
    -gravity north -font "$FONT_BOLD" -fill "$GREEN" -pointsize 92 -annotate +0+960 "SPACE CAT" \
    -fill "$WHITE" -pointsize 40 -interline-spacing 12 -annotate +0+1095 "BİLEĞİNDEKİ\nFIRLATMA TERMİNALİ." \
    -fill "$AMBER" -pointsize 34 -annotate +0+1450 "GOOGLE PLAY'DE" \
    "$frame_dir/05.png"
}

make_video_frames_square() {
  local frame_dir="$1"
  mkdir -p "$frame_dir"

  magick "$TMP_DIR/watch-master-vertical.png" \
    -crop 944x944+0+240 +repage -resize 1080x1080! \
    \( -size 1080x420 gradient:'#05080D00-#05080DEB' -rotate 180 \) -gravity north -compose over -composite \
    -gravity north -font "$FONT_BOLD" -fill "$GREEN" -pointsize 26 -annotate +0+58 "SPACE CAT // LIVE" \
    -fill "$WHITE" -pointsize 42 -interline-spacing 8 -annotate +0+108 "THE NEXT LAUNCH\nIS ALREADY COUNTING DOWN." \
    "$frame_dir/01.png"

  magick -size 1080x1080 "xc:$DEEP" \
    "$TMP_DIR/ui-live-circle.png" -geometry 620x620+230+320 -composite \
    -fill none -stroke "$GREEN" -strokewidth 7 -draw "circle 540,630 853,630" \
    -gravity north -font "$FONT_BOLD" -fill "$GREEN" -pointsize 26 -annotate +0+75 "REAL-TIME T-MINUS" \
    -fill "$WHITE" -pointsize 50 -annotate +0+125 "LIVE. EVERY SECOND." \
    "$frame_dir/02.png"

  magick -size 1080x1080 "xc:#05080D" \
    "$TMP_DIR/ui-mission-circle.png" -geometry 620x620+230+320 -composite \
    -fill none -stroke "$GREEN" -strokewidth 7 -draw "circle 540,630 853,630" \
    -gravity north -font "$FONT_BOLD" -fill "$GREEN" -pointsize 26 -annotate +0+65 "MISSION FILES" \
    -fill "$WHITE" -pointsize 48 -interline-spacing 8 -annotate +0+115 "EVERY MISSION.\nEVERY AGENCY." \
    "$frame_dir/03.png"

  magick -size 1080x1080 "xc:#05080D" \
    "$TMP_DIR/ui-alerts-circle.png" -geometry 620x620+230+320 -composite \
    -fill none -stroke "$AMBER" -strokewidth 7 -draw "circle 540,630 853,630" \
    -gravity north -font "$FONT_BOLD" -fill "$AMBER" -pointsize 26 -annotate +0+65 "SMART ALERTS" \
    -fill "$WHITE" -pointsize 48 -interline-spacing 8 -annotate +0+115 "GO. HOLD. DELAY.\nKNOW FIRST." \
    "$frame_dir/04.png"

  magick -size 1080x1080 "xc:#030609" \
    "$ROOT_DIR/art/icon_512.png" -geometry 430x430+325+95 -composite \
    -gravity north -font "$FONT_BOLD" -fill "$GREEN" -pointsize 68 -annotate +0+560 "SPACE CAT" \
    -fill "$WHITE" -pointsize 31 -interline-spacing 8 -annotate +0+660 "LAUNCH TERMINAL\nFOR YOUR WRIST." \
    -fill "$AMBER" -pointsize 28 -annotate +0+900 "AVAILABLE ON GOOGLE PLAY" \
    "$frame_dir/05.png"
}

make_video_frames_landscape() {
  local frame_dir="$1"
  mkdir -p "$frame_dir"

  magick "$TMP_DIR/watch-master-landscape.png" \
    -resize "1920x1080^" -gravity center -extent 1920x1080 \
    \( -size 980x1080 gradient:'#05080DED-#05080D00' \) -gravity west -compose over -composite \
    -gravity northwest -font "$FONT_BOLD" -fill "$GREEN" -pointsize 34 -annotate +120+235 "SPACE CAT // LIVE" \
    -fill "$WHITE" -pointsize 64 -interline-spacing 14 -annotate +120+300 "THE NEXT LAUNCH\nIS ALREADY\nCOUNTING DOWN." \
    "$frame_dir/01.png"

  magick -size 1920x1080 "xc:$DEEP" \
    "$TMP_DIR/ui-live-circle.png" -geometry 720x720+1080+180 -composite \
    -fill none -stroke "$GREEN" -strokewidth 8 -draw "circle 1440,540 1804,540" \
    -gravity northwest -font "$FONT_BOLD" -fill "$GREEN" -pointsize 32 -annotate +140+330 "REAL-TIME T-MINUS" \
    -fill "$WHITE" -pointsize 68 -interline-spacing 12 -annotate +140+395 "LIVE.\nEVERY SECOND." \
    "$frame_dir/02.png"

  magick -size 1920x1080 "xc:#05080D" \
    "$TMP_DIR/ui-mission-circle.png" -geometry 720x720+1080+180 -composite \
    -fill none -stroke "$GREEN" -strokewidth 8 -draw "circle 1440,540 1804,540" \
    -gravity northwest -font "$FONT_BOLD" -fill "$GREEN" -pointsize 32 -annotate +140+300 "MISSION FILES" \
    -fill "$WHITE" -pointsize 64 -interline-spacing 12 -annotate +140+365 "EVERY MISSION.\nEVERY AGENCY." \
    "$frame_dir/03.png"

  magick -size 1920x1080 "xc:#05080D" \
    "$TMP_DIR/ui-alerts-circle.png" -geometry 720x720+1080+180 -composite \
    -fill none -stroke "$AMBER" -strokewidth 8 -draw "circle 1440,540 1804,540" \
    -gravity northwest -font "$FONT_BOLD" -fill "$AMBER" -pointsize 32 -annotate +140+300 "SMART ALERTS" \
    -fill "$WHITE" -pointsize 64 -interline-spacing 12 -annotate +140+365 "GO. HOLD. DELAY.\nKNOW FIRST." \
    "$frame_dir/04.png"

  magick -size 1920x1080 "xc:#030609" \
    "$ROOT_DIR/art/icon_512.png" -geometry 470x470+190+305 -composite \
    -gravity northwest -font "$FONT_BOLD" -fill "$GREEN" -pointsize 92 -annotate +790+305 "SPACE CAT" \
    -fill "$WHITE" -pointsize 42 -interline-spacing 12 -annotate +795+430 "LAUNCH TERMINAL\nFOR YOUR WRIST." \
    -fill "$AMBER" -pointsize 34 -annotate +795+660 "AVAILABLE ON GOOGLE PLAY" \
    "$frame_dir/05.png"
}

make_soundtrack() {
  local output_path="$AUDIO_DIR/spacecat-original-telemetry.wav"

  ffmpeg -hide_banner -loglevel error -y \
    -f lavfi -i "anoisesrc=color=brown:amplitude=0.07:duration=15:sample_rate=48000" \
    -f lavfi -i "sine=frequency=880:duration=0.10:sample_rate=48000" \
    -f lavfi -i "sine=frequency=880:duration=0.10:sample_rate=48000" \
    -f lavfi -i "sine=frequency=1100:duration=0.14:sample_rate=48000" \
    -f lavfi -i "sine=frequency=1320:duration=0.18:sample_rate=48000" \
    -f lavfi -i "anoisesrc=color=white:amplitude=0.13:duration=3.5:sample_rate=48000" \
    -filter_complex \
      "[0:a]lowpass=f=160,volume=0.55[rumble]; \
       [1:a]volume=0.22,adelay=250:all=1[b1]; \
       [2:a]volume=0.22,adelay=1250:all=1[b2]; \
       [3:a]volume=0.20,adelay=6250:all=1[b3]; \
       [4:a]volume=0.18,adelay=9250:all=1[b4]; \
       [5:a]highpass=f=180,lowpass=f=1400,afade=t=in:st=0:d=0.3,afade=t=out:st=1.7:d=1.8,volume=0.10,adelay=10500:all=1[air]; \
       [rumble][b1][b2][b3][b4][air]amix=inputs=6:normalize=0,volume=8,alimiter=limit=0.88,pan=stereo|c0=c0|c1=c0[out]" \
    -map "[out]" -c:a pcm_s16le "$output_path"
}

render_video() {
  local frame_dir="$1"
  local width="$2"
  local height="$3"
  local output_path="$4"

  ffmpeg -hide_banner -loglevel error -y \
    -i "$frame_dir/01.png" \
    -i "$frame_dir/02.png" \
    -i "$frame_dir/03.png" \
    -i "$frame_dir/04.png" \
    -i "$frame_dir/05.png" \
    -i "$AUDIO_DIR/spacecat-original-telemetry.wav" \
    -filter_complex \
      "[0:v]zoompan=z='min(zoom+0.00035,1.04)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=102:s=${width}x${height}:fps=30,setsar=1[v0]; \
       [1:v]zoompan=z='min(zoom+0.00025,1.03)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=102:s=${width}x${height}:fps=30,setsar=1[v1]; \
       [2:v]zoompan=z='min(zoom+0.00025,1.03)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=102:s=${width}x${height}:fps=30,setsar=1[v2]; \
       [3:v]zoompan=z='min(zoom+0.00025,1.03)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=102:s=${width}x${height}:fps=30,setsar=1[v3]; \
       [4:v]zoompan=z='min(zoom+0.00030,1.035)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=102:s=${width}x${height}:fps=30,setsar=1[v4]; \
       [v0][v1]xfade=transition=fade:duration=0.4:offset=3.0[x1]; \
       [x1][v2]xfade=transition=fade:duration=0.4:offset=6.0[x2]; \
       [x2][v3]xfade=transition=fade:duration=0.4:offset=9.0[x3]; \
       [x3][v4]xfade=transition=fade:duration=0.4:offset=12.0,format=yuv420p[vout]" \
    -map "[vout]" -map 5:a -t 15 \
    -c:v libx264 -preset slow -crf 18 -profile:v high -level 4.2 \
    -c:a aac -b:a 192k -movflags +faststart \
    "$output_path"
}

make_soundtrack

make_video_frames_portrait "$TMP_DIR/frames-portrait"
make_video_frames_portrait_tr "$TMP_DIR/frames-portrait-tr"
make_video_frames_square "$TMP_DIR/frames-square"
make_video_frames_landscape "$TMP_DIR/frames-landscape"

render_video "$TMP_DIR/frames-portrait" 1080 1920 "$VIDEO_DIR/spacecat-appcampaign-9x16-15s.mp4"
render_video "$TMP_DIR/frames-portrait-tr" 1080 1920 "$VIDEO_DIR/spacecat-appcampaign-tr-9x16-15s.mp4"
render_video "$TMP_DIR/frames-square" 1080 1080 "$VIDEO_DIR/spacecat-appcampaign-1x1-15s.mp4"
render_video "$TMP_DIR/frames-landscape" 1920 1080 "$VIDEO_DIR/spacecat-appcampaign-16x9-15s.mp4"

echo "Rendered App Campaign assets:"
find "$IMAGE_DIR" "$VIDEO_DIR" "$AUDIO_DIR" -maxdepth 1 -type f -print
