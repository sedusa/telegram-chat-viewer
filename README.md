# Telegram Chat Viewer

A native macOS desktop application for viewing and searching through exported Telegram chat data.

![Telegram icon](./app-icon.png)

## Features

- **Multiple Input Methods**: Load chats from folders or individual HTML files
- **Powerful Search**: Real-time search across message content, senders, and links
- **Two View Modes**: Switch between compact list view and detailed card view
- **Link Previews**: Beautiful preview cards for URL-only messages
- **High Performance**: Optimized for large chat exports (10,000+ messages)
- **Keyboard Shortcuts**: Full keyboard navigation support
- **Modern UI**: Clean, intuitive interface built with React and Tailwind CSS

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **Rust** (latest stable version)
- **Xcode Command Line Tools** (for macOS)

### Installing Prerequisites

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Node.js (using Homebrew)
brew install node

# Install Xcode Command Line Tools
xcode-select --install
```

## Installation

1. **Clone or navigate to the repository**:
   ```bash
   cd /Users/samueledusa/Desktop/code/my-projects/telegram-chat-viewer
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Icons are already configured!**
   - The app uses the `app-icon.png` in the project root
   - All icon sizes are already generated in `src-tauri/icons/`
   - To update the icon in the future, replace `app-icon.png` and run:
     ```bash
     ./update-icon.sh
     ```

## Development

Run the application in development mode with hot-reloading:

```bash
npm run tauri:dev
```

This will start the Vite dev server and launch the Tauri application.

## Building for Production

Build the application for distribution:

```bash
npm run tauri:build
```

The built application will be available in `src-tauri/target/release/bundle/`.

## Usage

### Exporting Telegram Chats

1. Open Telegram Desktop
2. Select the chat you want to export
3. Click the three dots menu (⋮) → Export chat history
4. Choose "Machine-readable JSON" or leave as HTML
5. Select what to include (messages, photos, etc.)
6. Choose export location
7. Wait for export to complete

### Loading Chats in the Viewer

**Method 1: Folder Selection (Recommended)**
- Click "Select Folder" button
- Navigate to your exported chat folder
- The app will automatically find all `messages*.html` files

**Method 2: Single File**
- Click "Select HTML File" button
- Choose a `messages.html` file

### Keyboard Shortcuts

- `⌘O` - Open HTML file
- `⌘⇧O` - Open folder
- `⌘F` - Focus search bar
- `⌘1` - Switch to list view
- `⌘2` - Switch to card view
- `Esc` - Clear search
- `⌘Q` - Quit application

## Project Structure

```
telegram-chat-viewer/
├── src/                      # React frontend source
│   ├── components/          # React components
│   │   ├── FileUploader.tsx
│   │   ├── SearchBar.tsx
│   │   ├── MessageCard.tsx
│   │   ├── MessageList.tsx
│   │   └── LinkPreview.tsx
│   ├── types/              # TypeScript type definitions
│   │   └── Message.ts
│   ├── utils/              # Utility functions
│   │   ├── parser.ts       # HTML parsing logic
│   │   └── linkParser.ts   # URL parsing utilities
│   ├── styles/             # CSS styles
│   │   └── globals.css
│   ├── App.tsx             # Main application component
│   └── main.tsx            # React entry point
├── src-tauri/              # Tauri backend (Rust)
│   ├── src/
│   │   └── main.rs        # Rust application entry
│   ├── icons/             # Application icons
│   ├── Cargo.toml         # Rust dependencies
│   └── tauri.conf.json    # Tauri configuration
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Technologies Used

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Desktop Framework**: Tauri 2.0
- **Build Tool**: Vite
- **HTML Parsing**: Cheerio
- **Icons**: Lucide React

## Troubleshooting

### "Failed to load folder/file" Error
- Ensure the folder contains `messages.html` or `messages2.html` files
- Check that the files are valid HTML from Telegram exports
- Verify file permissions

### Performance Issues with Large Exports
- Use folder selection instead of individual files for better performance
- Close other applications to free up memory
- Consider splitting very large exports (100,000+ messages)

### Need to Update the App Icon?
1. Replace `app-icon.png` in the project root with your new icon (1024x1024 PNG recommended)
2. Run `./update-icon.sh` to regenerate all icon sizes
3. Rebuild the app with `npm run tauri:build`

## Future Enhancements

Planned features for future versions:

- [ ] Media file previews (images, videos)
- [ ] Dark mode theme
- [ ] Export filtered results
- [ ] Advanced date range filters
- [ ] Multi-chat support
- [ ] Message threading/replies
- [ ] Export to PDF/CSV

## Privacy & Security

- **100% Local**: All data processing happens on your device
- **No Network Requests**: Except when opening links in your browser
- **No Telemetry**: Zero tracking or analytics
- **No Auto-Updates**: Manual version control

## Contributing

This is a personal project, but suggestions and bug reports are welcome!

## License

MIT License

Copyright (c) 2025 Samuel Edusa

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
