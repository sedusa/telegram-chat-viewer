# Quick Start Guide

Get the Telegram Chat Viewer running in 3 steps:

## Step 1: Generate Icons (Required)

Choose one option:

### Option A: Using ImageMagick (Automatic)
```bash
./create-icon.sh
```

### Option B: Manual with your own icon
```bash
# Place your 1024x1024 PNG as app-icon.png, then:
npx tauri icon app-icon.png
```

### Option C: Without ImageMagick
```bash
# Download a simple icon or create one manually
# Save as app-icon.png (1024x1024 PNG)
npx tauri icon app-icon.png
```

## Step 2: Start Development Server

```bash
npm run tauri:dev
```

This will:
- Start Vite dev server
- Compile Rust backend (first time takes 3-5 minutes)
- Launch the application

## Step 3: Test the App

1. Click "Select Folder" or "Select HTML File"
2. Navigate to a Telegram export folder
3. Try searching messages
4. Switch between list and card views
5. Test keyboard shortcuts (⌘F, ⌘1, ⌘2)

## Export Telegram Chats

If you don't have a Telegram export yet:

1. Open **Telegram Desktop**
2. Select a chat
3. Click **⋮** (three dots) → **Export chat history**
4. Choose format: **HTML** (default is fine)
5. Select export location
6. Wait for export to complete
7. Use that folder in the app

## Common Issues

### "Icons not found"
- Run `./create-icon.sh` or manually create icons
- Icons must be in `src-tauri/icons/`

### "Rust not found"
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

### "Port 5173 in use"
```bash
# Kill the process or change port in vite.config.ts
lsof -ti:5173 | xargs kill -9
```

### First build is slow
- Normal! Rust compiles all dependencies on first run
- Subsequent runs are much faster

## Production Build

When ready:

```bash
npm run tauri:build
```

Output: `src-tauri/target/release/bundle/macos/Telegram Chat Viewer.app`

## Need More Help?

- **README.md** - Full documentation
- **SETUP.md** - Detailed setup guide
- **PROJECT_SUMMARY.md** - Technical overview
- **PRD.md** - Complete specifications

---

**Ready to go?** Run `./create-icon.sh` then `npm run tauri:dev`! 🚀

