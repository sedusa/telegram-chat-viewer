#!/bin/bash
# Simple icon creator using ImageMagick

echo "Creating placeholder icon..."

if ! command -v convert &> /dev/null; then
    echo "ImageMagick not found. Installing..."
    brew install imagemagick
fi

# Create a 1024x1024 icon with Telegram blue background and white "T"
convert -size 1024x1024 xc:'#0088cc' \
    -gravity center \
    -pointsize 600 \
    -font Helvetica-Bold \
    -fill white \
    -annotate +0+0 'T' \
    app-icon.png

echo "✅ Created app-icon.png"
echo "Generating Tauri icons..."

npx tauri icon app-icon.png

echo "✅ Icons generated successfully!"
