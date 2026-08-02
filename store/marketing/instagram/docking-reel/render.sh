#!/bin/zsh
set -euo pipefail

reel_dir="${0:A:h}"
frame_dir="$reel_dir/frames"
project_dir="${reel_dir:h:h:h:h}"
comms_dir="$project_dir/web/games/docking-comms"
output="$reel_dir/spacecat-docking-reel-directors-cut-1080x1920-26s.mp4"

# Director's cut: the approach is deliberately unhurried. Music is the spine of
# the piece; two station calls sit over it without ducking the ambient track.
ffmpeg -hide_banner -loglevel warning -y \
  -loop 1 -framerate 30 -i "$frame_dir/boot.png" \
  -loop 1 -framerate 30 -i "$frame_dir/wide.png" \
  -loop 1 -framerate 30 -i "$frame_dir/hold12.png" \
  -loop 1 -framerate 30 -i "$frame_dir/final.png" \
  -loop 1 -framerate 30 -i "$frame_dir/complete.png" \
  -loop 1 -framerate 30 -i "$frame_dir/cta.png" \
  -i "$comms_dir/clear25.mp3" \
  -i "$comms_dir/docked.mp3" \
  -stream_loop -1 -i "$project_dir/universfield-deep-space-ambient-153309.mp3" \
  -filter_complex "
    [0:v]zoompan=z='min(zoom+0.00005,1.006)':d=105:s=1080x1920:fps=30,trim=end_frame=105,setpts=PTS-STARTPTS,setsar=1[v0];
    [1:v]zoompan=z='min(zoom+0.00007,1.012)':d=165:s=1080x1920:fps=30,trim=end_frame=165,setpts=PTS-STARTPTS,setsar=1[v1];
    [2:v]zoompan=z='min(zoom+0.00006,1.010)':d=165:s=1080x1920:fps=30,trim=end_frame=165,setpts=PTS-STARTPTS,setsar=1[v2];
    [3:v]zoompan=z='min(zoom+0.00008,1.016)':d=195:s=1080x1920:fps=30,trim=end_frame=195,setpts=PTS-STARTPTS,setsar=1[v3];
    [4:v]zoompan=z='min(zoom+0.00005,1.008)':d=165:s=1080x1920:fps=30,trim=end_frame=165,setpts=PTS-STARTPTS,setsar=1[v4];
    [5:v]zoompan=z='min(zoom+0.00004,1.004)':d=90:s=1080x1920:fps=30,trim=end_frame=90,setpts=PTS-STARTPTS,setsar=1[v5];
    [v0][v1]xfade=transition=fade:duration=0.7:offset=2.8[x1];
    [x1][v2]xfade=transition=fade:duration=0.7:offset=7.6[x2];
    [x2][v3]xfade=transition=fade:duration=0.7:offset=12.4[x3];
    [x3][v4]xfade=transition=fade:duration=0.7:offset=18.2[x4];
    [x4][v5]xfade=transition=fade:duration=0.7:offset=23.0,format=yuv420p[v];

    [6:a]highpass=f=110,lowpass=f=5200,volume=0.92,adelay=8400|8400,apad=pad_dur=26[voice1];
    [7:a]highpass=f=110,lowpass=f=5200,volume=0.98,adelay=19050|19050,apad=pad_dur=26[voice2];
    [8:a]atrim=start=0:duration=26,asetpts=N/SR/TB,highpass=f=32,volume=3.0,
      afade=t=in:st=0:d=0.6,afade=t=out:st=24.4:d=1.6[music];
    sine=frequency=1480:duration=0.11,volume=0.028,adelay=3000|3000,pan=stereo|c0=c0|c1=c0[b1];
    sine=frequency=1120:duration=0.13,volume=0.026,adelay=13000|13000,pan=stereo|c0=c0|c1=c0[b2];
    sine=frequency=740:duration=0.18,volume=0.03,adelay=19000|19000,pan=stereo|c0=c0|c1=c0[b3];
    [voice1]pan=stereo|c0=c0|c1=c0[v1s];
    [voice2]pan=stereo|c0=c0|c1=c0[v2s];
    [music][v1s][v2s][b1][b2][b3]amix=inputs=6:duration=longest:normalize=0,
      alimiter=limit=0.92,loudnorm=I=-13.5:LRA=9:TP=-1.3[a]
  " \
  -map "[v]" -map "[a]" -t 26 \
  -c:v libx264 -profile:v high -level 4.1 -preset slow -crf 18 -r 30 -g 60 \
  -c:a aac -b:a 256k -ar 48000 -ac 2 -movflags +faststart \
  "$output"

ffmpeg -hide_banner -loglevel warning -y -i "$frame_dir/final.png" -vf scale=1080:1920:flags=lanczos -frames:v 1 -update 1 "$reel_dir/cover-1080x1920.png"

printf '%s\n' "$output"
