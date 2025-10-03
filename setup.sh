#!/bin/bash

echo "🚀 Telegram Chat Viewer - Setup Script"
echo "======================================"
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi
echo "✅ Node.js found: $(node --version)"

# Check for npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi
echo "✅ npm found: $(npm --version)"

# Check for Rust
if ! command -v rustc &> /dev/null; then
    echo "❌ Rust is not installed."
    echo "   Install with: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
    exit 1
fi
echo "✅ Rust found: $(rustc --version)"

# Check for Cargo
if ! command -v cargo &> /dev/null; then
    echo "❌ Cargo is not installed."
    exit 1
fi
echo "✅ Cargo found: $(cargo --version)"

echo ""
echo "📦 Installing npm dependencies..."
npm install

echo ""
echo "🎨 Icon Setup"
echo "============="
echo ""
echo "To complete the setup, you need to create application icons:"
echo ""
echo "Option 1: Use the Tauri icon generator"
echo "  1. Place a 1024x1024 PNG icon in the project root as 'app-icon.png'"
echo "  2. Run: npx tauri icon app-icon.png"
echo ""
echo "Option 2: Create placeholder icons for development"
echo "  Run: npx tauri icon src-tauri/icons/icon.png (if you have a default icon)"
echo ""
echo "For now, creating icon directory..."
mkdir -p src-tauri/icons

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Create application icons (see above)"
echo "  2. Run: npm run tauri:dev (start development)"
echo "  3. Or run: npm run tauri:build (build for production)"
echo ""
echo "📚 See SETUP.md and README.md for detailed instructions"
