#!/usr/bin/env bash
# Shong07 master (2160x1216, 16:9, 24 fps) -> TikTok uploads, centred on a 9:16 black canvas, kept at 24 fps
set -euo pipefail
O="$(cd "$(dirname "$0")/.." && pwd)/out"
M="$O/final_master_2160x1216.mp4"
ENH="unsharp=lx=13:ly=13:la=0.4:cx=5:cy=5:ca=0,cas=strength=0.7,curves=m='0/0 0.25/0.235 0.75/0.775 1/1',vibrance=intensity=0.15"
VF4="scale=2160:1216:flags=lanczos,$ENH,pad=2160:3840:0:(oh-ih)/2:black,setsar=1,format=yuv420p"
VF1="scale=1080:608:flags=lanczos,$ENH,pad=1080:1920:0:(oh-ih)/2:black,setsar=1,format=yuv420p"
X264='-c:v libx264 -preset slow -profile:v high -tune film -r 24 -fps_mode cfr -g 24 -bf 2 -x264-params open-gop=0'
AUD='-c:a aac -b:a 320k -ar 48000 -ac 2'
ffmpeg -nostdin -v error -y -i "$M" -vf "$VF4" $X264 -level 5.2 -b:v 40M -maxrate 40M -bufsize 80M $AUD -movflags +faststart "$O/final_tiktok_4k_plain.mp4"
python3 -I "$(dirname "$0")/tiktok_ghost_patch.py" "$O/final_tiktok_4k_plain.mp4" "$O/final_tiktok_4k_patched.mp4"
ffmpeg -nostdin -v error -y -i "$M" -vf "$VF1" $X264 -level 4.2 -b:v 20M -maxrate 24M -bufsize 40M $AUD -movflags +faststart "$O/final_tiktok_1080x1920.mp4"
ls -la "$O"/final_*
