#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ADS_DIR="$ROOT_DIR/store/ads"
VIDEO_DIR="$ADS_DIR/video"
SFX_PATH="$ROOT_DIR/jci21-rocket-launch-sfx-253937.mp3"

mkdir -p "$VIDEO_DIR"

render_video() {
  local frame_dir="$1"
  local output_path="$2"

  for required_file in \
    "$frame_dir/01-hook.png" \
    "$frame_dir/02-live.png" \
    "$frame_dir/03-mission.png" \
    "$frame_dir/04-alerts.png" \
    "$frame_dir/05-cta.png" \
    "$SFX_PATH"; do
    if [[ ! -f "$required_file" ]]; then
      echo "Missing required file: $required_file" >&2
      exit 1
    fi
  done

  # Typography remains part of a static full-resolution scene. Only cross-dissolves move.
  ffmpeg -hide_banner -loglevel error -y \
    -loop 1 -t 3.4 -i "$frame_dir/01-hook.png" \
    -loop 1 -t 3.4 -i "$frame_dir/02-live.png" \
    -loop 1 -t 3.4 -i "$frame_dir/03-mission.png" \
    -loop 1 -t 3.4 -i "$frame_dir/04-alerts.png" \
    -loop 1 -t 3.4 -i "$frame_dir/05-cta.png" \
    -i "$SFX_PATH" \
    -filter_complex \
      "[0:v]fps=30,format=yuv420p,settb=AVTB,setpts=PTS-STARTPTS[v0]; \
       [1:v]fps=30,format=yuv420p,settb=AVTB,setpts=PTS-STARTPTS[v1]; \
       [2:v]fps=30,format=yuv420p,settb=AVTB,setpts=PTS-STARTPTS[v2]; \
       [3:v]fps=30,format=yuv420p,settb=AVTB,setpts=PTS-STARTPTS[v3]; \
       [4:v]fps=30,format=yuv420p,settb=AVTB,setpts=PTS-STARTPTS[v4]; \
       [v0][v1]xfade=transition=fade:duration=0.4:offset=3.0[x1]; \
       [x1][v2]xfade=transition=fade:duration=0.4:offset=6.0[x2]; \
       [x2][v3]xfade=transition=fade:duration=0.4:offset=9.0[x3]; \
       [x3][v4]xfade=transition=fade:duration=0.4:offset=12.0,format=yuv420p[vout]; \
       [5:a]atrim=start=0:end=15,asetpts=PTS-STARTPTS,volume=0.85, \
       afade=t=in:st=0:d=0.45,afade=t=out:st=13.7:d=1.3,alimiter=limit=0.95[aout]" \
    -map "[vout]" -map "[aout]" \
    -t 15 -r 30 \
    -c:v libx264 -preset slow -crf 18 -profile:v high -level 4.2 \
    -c:a aac -b:a 192k -ar 48000 -ac 2 \
    -movflags +faststart \
    "$output_path"
}

render_video \
  "$ADS_DIR/storyboard-v5-en-vertical" \
  "$VIDEO_DIR/spacecat-appcampaign-en-9x16-v5-15s.mp4"

render_video \
  "$ADS_DIR/storyboard-v5-tr-landscape" \
  "$VIDEO_DIR/spacecat-appcampaign-tr-16x9-v5-15s.mp4"

render_video \
  "$ADS_DIR/storyboard-v5-en-landscape" \
  "$VIDEO_DIR/spacecat-appcampaign-en-16x9-v5-15s.mp4"

echo "$VIDEO_DIR/spacecat-appcampaign-en-9x16-v5-15s.mp4"
echo "$VIDEO_DIR/spacecat-appcampaign-tr-16x9-v5-15s.mp4"
echo "$VIDEO_DIR/spacecat-appcampaign-en-16x9-v5-15s.mp4"
