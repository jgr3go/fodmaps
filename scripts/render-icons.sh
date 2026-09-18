#!/bin/zsh
# Render public/icons/*.svg to PNG with headless Chrome (macOS), then downscale with sips.
# Usage: npm run icons
set -e
ROOT=$(cd "$(dirname "$0")/.." && pwd)
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
TMP=$(mktemp -d)
render() { # render <svg> <out.png>
  local svg="$1" out="$2" html="$TMP/$(basename "$out").html"
  local body; body=$(cat "$svg")
  printf '<!doctype html><html><body style="margin:0;background:transparent">%s</body></html>' "${body/<svg /<svg style=\"display:block;width:100vw;height:100vh\" }" > "$html"
  "$CHROME" --headless=new --disable-gpu --no-first-run --user-data-dir="$TMP/profile-$(basename "$out")" --default-background-color=00000000 \
    --window-size=512,512 --screenshot="$out" "file://$html" >/dev/null 2>&1 &
  local pid=$!; for i in {1..30}; do kill -0 $pid 2>/dev/null || break; sleep 1; done; kill -9 $pid 2>/dev/null || true
}
render "$ROOT/public/icons/icon.svg" "$ROOT/public/icons/icon-512.png"
render "$ROOT/public/icons/icon-maskable.svg" "$ROOT/public/icons/icon-maskable-512.png"
sips -z 192 192 "$ROOT/public/icons/icon-512.png" --out "$ROOT/public/icons/icon-192.png" >/dev/null
rm -rf "$TMP"; ls -la "$ROOT/public/icons/"
