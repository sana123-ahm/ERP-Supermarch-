#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(pwd)"
TARGET_DIR="$ROOT_DIR/frontend"

echo "Creating frontend directory: $TARGET_DIR"
mkdir -p "$TARGET_DIR"

FILES=(index.html package.json postcss.config.mjs vite.config.ts README.md)

echo "Moving top-level files..."
for f in "${FILES[@]}"; do
  if [ -f "$ROOT_DIR/$f" ]; then
    echo " - moving $f"
    mv "$ROOT_DIR/$f" "$TARGET_DIR/"
  fi
done

echo "Moving src and styles directories if present..."
for d in src styles guidlines; do
  if [ -d "$ROOT_DIR/$d" ]; then
    echo " - moving $d"
    mv "$ROOT_DIR/$d" "$TARGET_DIR/"
  fi
done

echo "Frontend reorganized into $TARGET_DIR"
echo "You may need to update relative paths or adjust build scripts."
