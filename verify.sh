#!/bin/bash

echo "🔍 Verifying Telegram Chat Viewer Setup"
echo "========================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check function
check_exists() {
    if [ -e "$1" ]; then
        echo -e "${GREEN}✅${NC} $1"
        return 0
    else
        echo -e "${RED}❌${NC} $1 (missing)"
        return 1
    fi
}

echo "📁 Checking Project Structure..."
echo ""

# Core config files
check_exists "package.json"
check_exists "tsconfig.json"
check_exists "vite.config.ts"
check_exists "tailwind.config.js"
check_exists "index.html"

echo ""
echo "📂 Checking Frontend Files..."
echo ""

check_exists "src/App.tsx"
check_exists "src/main.tsx"
check_exists "src/types/Message.ts"
check_exists "src/utils/parser.ts"
check_exists "src/utils/linkParser.ts"
check_exists "src/components/FileUploader.tsx"
check_exists "src/components/SearchBar.tsx"
check_exists "src/components/MessageCard.tsx"
check_exists "src/components/MessageList.tsx"
check_exists "src/components/LinkPreview.tsx"
check_exists "src/styles/globals.css"

echo ""
echo "🦀 Checking Tauri Backend Files..."
echo ""

check_exists "src-tauri/Cargo.toml"
check_exists "src-tauri/tauri.conf.json"
check_exists "src-tauri/build.rs"
check_exists "src-tauri/src/main.rs"
check_exists "src-tauri/icons"

echo ""
echo "📚 Checking Documentation..."
echo ""

check_exists "README.md"
check_exists "SETUP.md"
check_exists "QUICKSTART.md"
check_exists "PROJECT_SUMMARY.md"
check_exists "PRD.md"

echo ""
echo "🔧 Checking Dependencies..."
echo ""

if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅${NC} node_modules (installed)"
else
    echo -e "${RED}❌${NC} node_modules (run: npm install)"
fi

echo ""
echo "🎨 Checking Icons..."
echo ""

ICONS_NEEDED=false
for icon in "32x32.png" "128x128.png" "128x128@2x.png" "icon.icns"; do
    if [ -f "src-tauri/icons/$icon" ]; then
        echo -e "${GREEN}✅${NC} src-tauri/icons/$icon"
    else
        echo -e "${YELLOW}⚠️${NC}  src-tauri/icons/$icon (needed - run ./create-icon.sh)"
        ICONS_NEEDED=true
    fi
done

echo ""
echo "📊 Summary"
echo "========="
echo ""

if [ "$ICONS_NEEDED" = true ]; then
    echo -e "${YELLOW}⚠️${NC}  Icons need to be generated"
    echo "   Run: ./create-icon.sh"
    echo ""
fi

echo "Next steps:"
echo "  1. Generate icons: ./create-icon.sh"
echo "  2. Start dev: npm run tauri:dev"
echo ""
echo "See QUICKSTART.md for detailed instructions."

