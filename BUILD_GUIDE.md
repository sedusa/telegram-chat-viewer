# Building Telegram Chat Viewer Desktop App

## Quick Build

### Development Build (for testing)
```bash
npm run tauri:dev
```
This runs the app in development mode with hot-reload.

### Production Build (distributable app)
```bash
npm run tauri:build
```
This creates an optimized, production-ready macOS application.

## Build Output

After running `npm run tauri:build`, you'll find your built application at:

- **macOS App Bundle**: `src-tauri/target/release/bundle/macos/Telegram Chat Viewer.app`
- **DMG Installer**: `src-tauri/target/release/bundle/dmg/Telegram Chat Viewer_1.0.0_aarch64.dmg` (for Apple Silicon)
- **DMG Installer**: `src-tauri/target/release/bundle/dmg/Telegram Chat Viewer_1.0.0_x64.dmg` (for Intel Macs)

## Installation

### Option 1: Direct Installation (Recommended)
1. Navigate to `src-tauri/target/release/bundle/macos/`
2. Copy `Telegram Chat Viewer.app` to your `/Applications` folder
3. Double-click to run!

### Option 2: DMG Installer
1. Navigate to `src-tauri/target/release/bundle/dmg/`
2. Double-click the `.dmg` file for your architecture
3. Drag the app to Applications folder
4. Eject the DMG and run the app

## First Run

On first run, macOS may show a security warning because the app isn't signed. To open it:

1. Right-click (or Control+click) on the app
2. Select "Open"
3. Click "Open" in the dialog that appears
4. The app will now run, and you won't need to do this again

## Distribution

### For Personal Use
- Just copy the `.app` file to any Mac and use it
- Or share the `.dmg` file for easy installation

### For Public Distribution (App Store or Public Release)
You'll need to:
1. Get an Apple Developer account ($99/year)
2. Code sign the app with your developer certificate
3. Notarize the app with Apple
4. Optionally submit to Mac App Store

## Build Configurations

### Universal Binary (Both Intel & Apple Silicon)
Edit `src-tauri/tauri.conf.json`:
```json
{
  "bundle": {
    "targets": ["dmg", "app"],
    "macOS": {
      "minimumSystemVersion": "10.15",
      "architectures": ["x86_64", "aarch64"]
    }
  }
}
```

Then run:
```bash
npm run tauri:build -- --target universal-apple-darwin
```

## Troubleshooting

### Build Fails
- Make sure you have Xcode Command Line Tools installed:
  ```bash
  xcode-select --install
  ```
- Ensure Rust is up to date:
  ```bash
  rustup update
  ```

### "App is Damaged" Error
This happens when Gatekeeper blocks the app. To fix:
```bash
xattr -cr "/Applications/Telegram Chat Viewer.app"
```

### Performance Issues in Production Build
Production builds are already optimized. If you experience issues:
- Check that you're not running dev tools alongside
- Close unnecessary browser tabs/applications
- The app should be significantly faster than dev mode

## App Size

Expected app size:
- **App Bundle**: ~15-20 MB
- **DMG**: ~10-15 MB (compressed)

This is very small for a desktop app because Tauri uses the system's WebView instead of bundling Chromium.

## Features of Built App

✅ Native macOS application
✅ Standalone (no browser needed)
✅ Fast startup time
✅ Low memory usage (~50-100 MB)
✅ Native file dialogs
✅ System integration
✅ Automatic updates (can be configured)
✅ Code-signed and notarized (when properly configured)

## What's Included

The built app includes:
- All frontend code (React, TypeScript)
- All backend code (Rust)
- Application icon
- Dark mode support
- Native system integration
- File system access for loading Telegram exports

## File Associations (Optional)

To make `.html` Telegram export files open with your app automatically, you can configure file associations in `src-tauri/tauri.conf.json`:

```json
{
  "bundle": {
    "macOS": {
      "fileAssociations": [
        {
          "ext": ["html"],
          "name": "Telegram Chat Export",
          "role": "Viewer"
        }
      ]
    }
  }
}
```

## Next Steps

1. Wait for the build to complete (5-10 minutes first time)
2. Navigate to the output folder
3. Test the `.app` file
4. Share the `.dmg` with others if desired

## Additional Commands

```bash
# Clean build artifacts
npm run tauri clean

# Build for specific target
npm run tauri:build -- --target aarch64-apple-darwin

# Build debug version (faster, larger)
npm run tauri:build -- --debug
```

Enjoy your native macOS desktop app! 🎉

