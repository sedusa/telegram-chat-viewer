#!/bin/bash

# Script to update app icons from app-icon.png
# Usage: ./update-icon.sh

echo "🎨 Updating app icons from app-icon.png..."

# Check if app-icon.png exists
if [ ! -f "app-icon.png" ]; then
    echo "❌ Error: app-icon.png not found in the current directory"
    exit 1
fi

# Generate all icon sizes using Tauri CLI
echo "📦 Generating icon files for all platforms..."
npx @tauri-apps/cli icon app-icon.png

if [ $? -eq 0 ]; then
    echo "✅ Icons generated successfully!"
    echo ""
    echo "Generated icons:"
    echo "  - src-tauri/icons/icon.icns (macOS)"
    echo "  - src-tauri/icons/icon.ico (Windows)"
    echo "  - src-tauri/icons/*.png (All platforms)"
    echo ""
    echo "🚀 You can now build your app with: npm run tauri:build"
else
    echo "❌ Error generating icons"
    exit 1
fi

