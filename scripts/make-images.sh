#!/bin/sh
# App Store 用に撮影した実際のスクリーンショット（../store-screenshots/）から、
# Webサイト用の軽い画像（WebP）と OGP画像・アイコンを作る。最初の1回と、スクショを撮り直したときだけ実行する。
# 画像の中身（文言・数値・色）は変えず、縮小・圧縮だけを行う。
# 必要なもの：cwebp（brew install webp）、sips（macOS 標準）、Google Chrome（OGP画像用）
set -eu
cd "$(dirname "$0")/.."
SRC=../store-screenshots
OUT=public/images
mkdir -p "$OUT"

conv() { cwebp -quiet -q 78 -resize 600 0 -metadata none "$SRC/$1" -o "$OUT/$2"; }
conv 1_home_web.png screen-home.webp  # TestFlight 表示のないホーム画面（2026-10 差し替え）
conv 2_detail.png screen-detail.webp
conv 3_record_detail.png screen-followup.webp
conv 4_my_record.png screen-my-record.webp
conv 5_search.png screen-search.webp

# アイコン（アプリと同じ画像を縮小）
sips -s format png -z 180 180 ../assets/images/icon.png --out "$OUT/apple-touch-icon.png" >/dev/null
sips -s format png -z 192 192 ../assets/images/icon.png --out "$OUT/icon-192.png" >/dev/null
sips -s format png -z 48 48 ../assets/images/icon.png --out "public/favicon.png" >/dev/null

# OGP画像（1200x630）
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CHROME" --headless --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
  --window-size=1200,630 --screenshot="$PWD/$OUT/og.png" "file://$PWD/scripts/og.html" 2>/dev/null
ls -la "$OUT" public/favicon.png
