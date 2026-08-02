#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ADS_DIR="$ROOT_DIR/store/ads"
SOURCE_DIR="$ADS_DIR/source"
V_EN="$ADS_DIR/storyboard-v5-en-vertical"
H_TR="$ADS_DIR/storyboard-v5-tr-landscape"
H_EN="$ADS_DIR/storyboard-v5-en-landscape"

GREEN="#00E68A"
AMBER="#FFB86C"
WHITE="#F4F7F8"
FONT="Menlo-Regular"

mkdir -p "$V_EN" "$H_TR" "$H_EN"

vertical_frame() {
  local source_path="$1"
  local output_path="$2"
  local kicker="$3"
  local line_one="$4"
  local line_two="$5"

  magick "$source_path" -resize 1080x1920! \
    \( -size 1080x520 gradient:'#020509E6-#02050900' \) \
    -gravity north -compose over -composite \
    -gravity northwest -font "$FONT" -kerning 2 \
    -fill "$GREEN" -pointsize 22 -annotate +70+86 "$kicker" \
    -fill "$WHITE" -pointsize 32 -annotate +70+140 "$line_one" \
    -fill "$AMBER" -pointsize 32 -annotate +70+194 "$line_two" \
    -strip -define png:compression-level=9 "$output_path"
}

vertical_live_frame() {
  local output_path="$1"

  magick "$SOURCE_DIR/scene-01-integrated-watch-v3.png" \
    -resize 1274x2264! -crop 1080x1920+97+170 +repage \
    \( -size 1080x520 gradient:'#020509E6-#02050900' \) \
    -gravity north -compose over -composite \
    -gravity northwest -font "$FONT" -kerning 2 \
    -fill "$GREEN" -pointsize 22 -annotate +70+86 "LIVE T-MINUS" \
    -fill "$WHITE" -pointsize 32 -annotate +70+140 "COUNTING DOWN" \
    -fill "$AMBER" -pointsize 32 -annotate +70+194 "EVERY SECOND." \
    -strip -define png:compression-level=9 "$output_path"
}

landscape_frame() {
  local source_path="$1"
  local output_path="$2"
  local kicker="$3"
  local line_one="$4"
  local line_two="$5"

  magick "$source_path" -resize 1920x1080! \
    \( -size 920x430 gradient:'#020509E3-#02050900' \) \
    -gravity north -geometry +220+0 -compose over -composite \
    -gravity north -font "$FONT" -kerning 2 \
    -fill "$GREEN" -pointsize 24 -annotate +220+58 "$kicker" \
    -fill "$WHITE" -pointsize 36 -annotate +220+106 "$line_one" \
    -fill "$AMBER" -pointsize 36 -annotate +220+158 "$line_two" \
    -strip -define png:compression-level=9 "$output_path"
}

landscape_live_frame() {
  local output_path="$1"
  local kicker="$2"
  local line_one="$3"
  local line_two="$4"

  magick "$SOURCE_DIR/scene-01-integrated-watch-landscape-v3.png" \
    -resize 2200x1238! -crop 1920x1080+80+60 +repage \
    \( -size 920x430 gradient:'#020509E3-#02050900' \) \
    -gravity north -geometry +220+0 -compose over -composite \
    -gravity north -font "$FONT" -kerning 2 \
    -fill "$GREEN" -pointsize 24 -annotate +220+58 "$kicker" \
    -fill "$WHITE" -pointsize 36 -annotate +220+106 "$line_one" \
    -fill "$AMBER" -pointsize 36 -annotate +220+158 "$line_two" \
    -strip -define png:compression-level=9 "$output_path"
}

vertical_frame \
  "$SOURCE_DIR/scene-01-integrated-watch-v3.png" \
  "$V_EN/01-hook.png" \
  "SPACE CAT // LIVE" \
  "THE NEXT LAUNCH" \
  "IS ALREADY COUNTING DOWN."

vertical_live_frame "$V_EN/02-live.png"

vertical_frame \
  "$SOURCE_DIR/scene-03-mission-integrated-v4.png" \
  "$V_EN/03-mission.png" \
  "MISSION FILES" \
  "EVERY MISSION." \
  "EVERY AGENCY."

vertical_frame \
  "$SOURCE_DIR/scene-04-alerts-integrated-v4.png" \
  "$V_EN/04-alerts.png" \
  "SMART ALERTS" \
  "GO. HOLD." \
  "DELAYS."

magick "$SOURCE_DIR/scene-01-integrated-watch-v3.png" \
  -resize 1080x1920! -blur 0x18 -modulate 55,65,100 \
  \( -size 1080x1920 xc:'#020509B8' \) -compose over -composite \
  \( -background none "$SOURCE_DIR/spacecat-mark-transparent.svg" -resize 590x590 \) \
  -gravity north -geometry +0+250 -compose over -composite \
  -gravity north -font "$FONT" -kerning 3 \
  -fill "$GREEN" -pointsize 34 -annotate +0+900 "SPACE CAT" \
  -fill "$WHITE" -pointsize 36 -annotate +0+1010 "NEVER MISS" \
  -fill "$AMBER" -pointsize 36 -annotate +0+1075 "LIFTOFF." \
  -fill "$GREEN" -pointsize 24 -annotate +0+1450 "ON GOOGLE PLAY" \
  -strip -define png:compression-level=9 "$V_EN/05-cta.png"

landscape_frame \
  "$SOURCE_DIR/scene-01-integrated-watch-landscape-v3.png" \
  "$H_TR/01-hook.png" \
  "SPACE CAT // CANLI" \
  "SIRADAKİ FIRLATMA" \
  "ZATEN GERİ SAYIYOR."

landscape_live_frame \
  "$H_TR/02-live.png" \
  "CANLI T-MINUS" \
  "GERİ SAYIM" \
  "HER SANİYE."

landscape_frame \
  "$SOURCE_DIR/scene-03-mission-integrated-landscape-v5.png" \
  "$H_TR/03-mission.png" \
  "GÖREV DOSYALARI" \
  "HER GÖREV." \
  "HER AJANS."

landscape_frame \
  "$SOURCE_DIR/scene-04-alerts-integrated-landscape-v5.png" \
  "$H_TR/04-alerts.png" \
  "AKILLI UYARILAR" \
  "GO. HOLD." \
  "ERTELEME."

landscape_frame \
  "$SOURCE_DIR/scene-01-integrated-watch-landscape-v3.png" \
  "$H_EN/01-hook.png" \
  "SPACE CAT // LIVE" \
  "THE NEXT LAUNCH" \
  "IS ALREADY COUNTING DOWN."

landscape_live_frame \
  "$H_EN/02-live.png" \
  "LIVE T-MINUS" \
  "COUNTING DOWN" \
  "EVERY SECOND."

landscape_frame \
  "$SOURCE_DIR/scene-03-mission-integrated-landscape-v5.png" \
  "$H_EN/03-mission.png" \
  "MISSION FILES" \
  "EVERY MISSION." \
  "EVERY AGENCY."

landscape_frame \
  "$SOURCE_DIR/scene-04-alerts-integrated-landscape-v5.png" \
  "$H_EN/04-alerts.png" \
  "SMART ALERTS" \
  "GO. HOLD." \
  "DELAYS."

landscape_cta() {
  local output_path="$1"
  local line_one="$2"
  local line_two="$3"
  local store_line="$4"

  magick "$SOURCE_DIR/scene-01-integrated-watch-landscape-v3.png" \
    -resize 1920x1080! -blur 0x18 -modulate 50,60,100 \
    \( -size 1920x1080 xc:'#020509C4' \) -compose over -composite \
    \( -background none "$SOURCE_DIR/spacecat-mark-transparent.svg" -resize 500x500 \) \
    -gravity northwest -geometry +190+285 -compose over -composite \
    -gravity northwest -font "$FONT" -kerning 3 \
    -fill "$GREEN" -pointsize 36 -annotate +840+315 "SPACE CAT" \
    -fill "$WHITE" -pointsize 48 -annotate +840+410 "$line_one" \
    -fill "$AMBER" -pointsize 48 -annotate +840+485 "$line_two" \
    -fill "$GREEN" -pointsize 28 -annotate +840+690 "$store_line" \
    -strip -define png:compression-level=9 "$output_path"
}

landscape_cta "$H_TR/05-cta.png" "FIRLATMAYI" "KAÇIRMA." "GOOGLE PLAY'DE"
landscape_cta "$H_EN/05-cta.png" "NEVER MISS" "LIFTOFF." "ON GOOGLE PLAY"

magick montage "$V_EN"/0*.png \
  -thumbnail '270x480>' -tile 5x1 -geometry +12+12 \
  -background '#111318' "$V_EN/storyboard-contact-sheet.png"

magick montage "$H_TR"/0*.png \
  -thumbnail '384x216>' -tile 5x1 -geometry +12+12 \
  -background '#111318' "$H_TR/storyboard-contact-sheet.png"

magick montage "$H_EN"/0*.png \
  -thumbnail '384x216>' -tile 5x1 -geometry +12+12 \
  -background '#111318' "$H_EN/storyboard-contact-sheet.png"

echo "$V_EN"
echo "$H_TR"
echo "$H_EN"
