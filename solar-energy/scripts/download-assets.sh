#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ASSETS_DIR="$ROOT_DIR/public/images"

mkdir -p "$ASSETS_DIR/hero" "$ASSETS_DIR/showcase" "$ASSETS_DIR/progress"

download() {
  local url="$1"
  local dest="$2"
  echo "Downloading $url -> $dest"
  curl -L "$url" -o "$dest"
}

# Hero poster (image)
download "https://res.cloudinary.com/dwedcl97k/video/upload/so_0,f_jpg,w_1600/v1769199580/Design_sem_nome_-_2026-01-23T171932.339_fjulxo.mp4" \
  "$ASSETS_DIR/hero/hero-poster.jpg"

# Showcase - studio
download "https://i.postimg.cc/mksDjFhJ/Whats-App-Image-2026-01-22-at-12-04-21.jpg" \
  "$ASSETS_DIR/showcase/studio-1.jpg"
download "https://i.postimg.cc/GpTm1jyg/Whats-App-Image-2026-01-22-at-12-04-21-(2).jpg" \
  "$ASSETS_DIR/showcase/studio-2.jpg"
download "https://i.postimg.cc/mDNRbp2p/Whats-App-Image-2026-01-22-at-12-04-21-(1).jpg" \
  "$ASSETS_DIR/showcase/studio-3.jpg"

# Showcase - 2 bedrooms
download "https://i.postimg.cc/pV5VhCch/Whats-App-Image-2026-01-22-at-12-04-20.jpg" \
  "$ASSETS_DIR/showcase/apt-2-1.jpg"
download "https://i.postimg.cc/vZYdztXF/Whats-App-Image-2026-01-22-at-12-04-20-(1).jpg" \
  "$ASSETS_DIR/showcase/apt-2-2.jpg"
download "https://i.postimg.cc/1zbTLGGj/Whats-App-Image-2026-01-22-at-12-04-20-(2).jpg" \
  "$ASSETS_DIR/showcase/apt-2-3.jpg"
download "https://i.postimg.cc/m2Tqf29C/Design-sem-nome-2026-01-24T013521-711.png" \
  "$ASSETS_DIR/showcase/apt-2-4.png"

# Showcase - 3 bedrooms
download "https://i.postimg.cc/LsrVzVfh/CASA-TIPO-E-5.png" \
  "$ASSETS_DIR/showcase/apt-3-1.png"
download "https://i.postimg.cc/xTtysQMH/CASA-TIPO-E-6.png" \
  "$ASSETS_DIR/showcase/apt-3-2.png"

# Showcase - amenities
download "https://i.postimg.cc/kX7Z3XSm/Design-sem-nome-2026-01-24T013513-644.png" \
  "$ASSETS_DIR/showcase/amenities-1.png"
download "https://i.postimg.cc/6QBTCZ4p/Design-sem-nome-2026-01-24T013506-098.png" \
  "$ASSETS_DIR/showcase/amenities-2.png"
download "https://i.postimg.cc/gJTJ9BM5/Design-sem-nome-2026-01-24T013459-346.png" \
  "$ASSETS_DIR/showcase/amenities-3.png"
download "https://i.postimg.cc/qq67pXS1/Design-sem-nome-2026-01-24T013356-074.png" \
  "$ASSETS_DIR/showcase/amenities-4.png"

# Progress gallery
download "https://i.postimg.cc/bwQR1PBD/20251204-082816-(1).jpg" \
  "$ASSETS_DIR/progress/progress-1.jpg"
download "https://i.postimg.cc/tT7mRvNb/20251204-082550-(1).jpg" \
  "$ASSETS_DIR/progress/progress-2.jpg"
download "https://i.postimg.cc/9fwJvwmZ/20251204-082247-(1).jpg" \
  "$ASSETS_DIR/progress/progress-3.jpg"
download "https://i.postimg.cc/90rCyBPd/20251113-080300.jpg" \
  "$ASSETS_DIR/progress/progress-4.jpg"

echo "✅ Assets downloaded to $ASSETS_DIR"
