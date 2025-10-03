# App Icon Configuration Guide

## Current Setup

Your app now uses the **`app-icon.png`** file in the project root as the source for all application icons across all platforms.

## What Was Done

1. ✅ Generated all required icon sizes from `app-icon.png`
2. ✅ Created icons for:
   - **macOS**: `.icns` file (Dock, Finder, Spotlight)
   - **Windows**: `.ico` file 
   - **Linux**: PNG files
   - **iOS/Android**: All required sizes
3. ✅ Updated HTML favicon to use your icon
4. ✅ Created convenience script for future updates

## Icon Files Generated

All icons are stored in `src-tauri/icons/`:

### macOS
- `icon.icns` - Main macOS icon bundle (1.9 MB)
- `32x32.png`, `64x64.png`, `128x128.png`, `128x128@2x.png`

### Windows
- `icon.ico` - Windows icon (69 KB)

### General
- `icon.png` - 256x256 main PNG icon

### Mobile (iOS/Android)
- Multiple sizes in `ios/` and `android/` folders

## How to Update Your Icon

### Method 1: Using the Convenience Script (Recommended)

```bash
# 1. Replace app-icon.png with your new icon
cp /path/to/your/new-icon.png app-icon.png

# 2. Run the update script
./update-icon.sh

# 3. Rebuild the app
npm run tauri:build
```

### Method 2: Manual Update

```bash
# 1. Replace app-icon.png with your new icon
cp /path/to/your/new-icon.png app-icon.png

# 2. Generate new icons
npx @tauri-apps/cli icon app-icon.png

# 3. Rebuild the app
npm run tauri:build
```

## Icon Requirements

For best results, your `app-icon.png` should be:

- ✅ **Size**: 1024x1024 pixels (minimum 512x512)
- ✅ **Format**: PNG with transparency
- ✅ **Color**: RGB or RGBA
- ✅ **Design**: Simple, recognizable at small sizes
- ✅ **Background**: Transparent preferred (but not required)

### macOS Specific Guidelines

- Use rounded corners (macOS will apply them automatically)
- Avoid text that's too small
- Test at 16x16 to ensure it's recognizable
- Consider dark mode appearance

## Where Your Icon Appears

### During Development (`npm run tauri:dev`)
- Window title bar
- macOS Dock (if running)
- Task switcher (⌘+Tab)

### After Building (`npm run tauri:build`)
- **macOS Dock** - Shows when app is running
- **Finder** - App bundle in Applications folder
- **Spotlight** - Search results
- **Launchpad** - App grid
- **Recent Applications** - Quick access menu
- **Window Title Bar** - When app is open

## Verifying Your Icon

After updating, verify the icon works:

```bash
# 1. Build the app
npm run tauri:build

# 2. Check the .app bundle
ls -lh src-tauri/target/release/bundle/macos/*.app

# 3. Copy to Applications and check in Finder
cp -r "src-tauri/target/release/bundle/macos/Telegram Chat Viewer.app" /Applications/

# 4. Open Finder, navigate to Applications, and verify the icon appears
```

## Troubleshooting

### Icon Not Updating After Build
```bash
# Clear icon cache (macOS)
sudo rm -rf /Library/Caches/com.apple.iconservices.store
killall Dock
killall Finder
```

### Icon Appears Blurry
- Ensure source `app-icon.png` is at least 1024x1024
- Use PNG format, not JPEG
- Check that the image is sharp at the source

### Icon Not Showing in Development
- Restart the development server: `npm run tauri:dev`
- Clear Tauri cache: `rm -rf src-tauri/target/`

### Wrong Icon Shows in Dock
- macOS caches icons aggressively
- Clear cache (see above)
- Rename the app slightly to force cache refresh

## Icon in the Future

If you want to change the icon later:

1. **Create or find a new icon** (1024x1024 PNG)
2. **Replace** `app-icon.png` in the project root
3. **Run** `./update-icon.sh`
4. **Rebuild** the app with `npm run tauri:build`
5. **Reinstall** the app (copy to Applications)

## Advanced: Custom Icon Sizes

If you need custom icon sizes, edit the script:

```bash
# Generate specific sizes only
npx @tauri-apps/cli icon app-icon.png --target macos
npx @tauri-apps/cli icon app-icon.png --target windows
```

## Icon in Distribution

When you share your app:

- **DMG installer** - Will show your icon
- **.app bundle** - Will use your icon
- **First launch** - Icon appears immediately
- **No code signing needed** - Icon works without signing

---

**Your icon is now fully configured and ready to use!** 🎉

Every build will automatically use your `app-icon.png` as the source.

