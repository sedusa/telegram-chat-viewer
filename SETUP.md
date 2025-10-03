# Setup Instructions

## Quick Start

Follow these steps to get the Telegram Chat Viewer running:

### 1. Install Dependencies

```bash
npm install
```

### 2. Create App Icons

The app needs icons for macOS. You have two options:

**Option A: Use Tauri's Icon Generator (Recommended)**

1. Create or find a 1024x1024 PNG icon
2. Save it as `app-icon.png` in the project root
3. Run:
   ```bash
   npm install -g @tauri-apps/cli
   npx tauri icon app-icon.png
   ```

**Option B: Use Placeholder Icons**

For development, you can create simple placeholder icons:

```bash
# Create basic icon files (requires ImageMagick)
brew install imagemagick
convert -size 1024x1024 xc:blue -pointsize 200 -fill white -gravity center -annotate +0+0 "T" app-icon.png
npx tauri icon app-icon.png
```

Or manually create these files in `src-tauri/icons/`:
- `32x32.png`
- `128x128.png`
- `128x128@2x.png`
- `icon.icns` (macOS)
- `icon.ico` (Windows, optional)

### 3. Run Development Server

```bash
npm run tauri:dev
```

This will:
- Start the Vite dev server on port 5173
- Launch the Tauri application
- Enable hot-reloading for frontend changes

### 4. Test the Application

1. The app should open automatically
2. Click "Select Folder" or "Select HTML File"
3. Navigate to a Telegram export folder
4. Test search, view modes, and keyboard shortcuts

## Building for Production

```bash
npm run tauri:build
```

The output will be in `src-tauri/target/release/bundle/macos/`.

## Troubleshooting

### Icons Missing Error

If you get an error about missing icons during build:

```bash
# Quick fix: create minimal icons directory
mkdir -p src-tauri/icons
```

Then follow icon creation steps above.

### Rust Not Found

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

### Tauri CLI Issues

```bash
# Clear npm cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Port 5173 Already in Use

Change the port in `vite.config.ts`:
```typescript
server: {
  port: 5174, // or any available port
  strictPort: true,
}
```

## Development Tips

1. **Hot Reload**: Frontend changes will hot-reload automatically
2. **Rust Changes**: Require restarting `npm run tauri:dev`
3. **Console Logs**: Open DevTools in the app (right-click → Inspect Element)
4. **Performance**: Test with real Telegram exports of various sizes

## Next Steps

After setup:
1. Export a chat from Telegram Desktop
2. Test loading it in the viewer
3. Experiment with search and view modes
4. Check keyboard shortcuts work
5. Review the README.md for full usage instructions

---

**Need Help?** Check the README.md and PRD.md for detailed information.

