# Product Requirements Document: Telegram Chat Viewer - Mac Desktop Application

## Overview
Convert the existing Telegram Chat Viewer web application into a native macOS desktop application that can efficiently parse, display, and search through exported Telegram chat data.

## Project Goals
- Create a native macOS-only application for viewing Telegram chat exports
- Maintain the existing UI/UX from the web version
- Improve performance for large chat exports (10,000+ messages)
- Provide native file system integration for better user experience
- Simple, standalone application with no cloud services or auto-updates

## Technical Stack

### Primary Technology Choice: Tauri
- **Framework**: Tauri 2.0
- **Frontend**: React 18+ with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React hooks (useState, useMemo, useCallback)
- **File Parsing**: cheerio for HTML parsing
- **Zip Handling**: adm-zip or jszip for Node.js

### Alternative: Electron (if Tauri constraints exist)
- All other specs remain the same

## Architecture

### Application Structure
```
telegram-viewer-mac/
├── src/
│   ├── App.tsx                 # Main React component
│   ├── components/
│   │   ├── FileUploader.tsx    # File/folder selection
│   │   ├── SearchBar.tsx       # Sticky search header
│   │   ├── MessageCard.tsx     # Card view component
│   │   ├── MessageList.tsx     # List view component
│   │   └── LinkPreview.tsx     # URL preview component
│   ├── utils/
│   │   ├── parser.ts           # HTML message parser
│   │   ├── fileSystem.ts       # File operations wrapper
│   │   └── zipHandler.ts       # ZIP extraction logic
│   ├── types/
│   │   └── Message.ts          # TypeScript interfaces
│   └── styles/
│       └── globals.css         # Tailwind imports
├── src-tauri/                  # Tauri backend (Rust)
│   ├── src/
│   │   └── main.rs            # Tauri commands
│   ├── Cargo.toml
│   └── tauri.conf.json
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── README.md
```

## Core Features

### 1. File Input Methods

#### 1.1 ZIP File Upload
- Native file picker dialog for `.zip` files
- Extract ZIP contents to temporary directory
- Parse all `messages*.html` files found
- Display progress indicator during extraction and parsing

**Tauri Command**: `open_zip_file`
```rust
#[tauri::command]
async fn open_zip_file(path: String) -> Result<Vec<String>, String>
```

#### 1.2 Folder Selection
- Native folder picker dialog
- Read all `messages*.html` files directly from folder
- No extraction needed - faster for pre-extracted exports
- Remember last opened directory

**Tauri Command**: `open_folder`
```rust
#[tauri::command]
async fn open_folder(path: String) -> Result<Vec<String>, String>
```

#### 1.3 File System Operations
**Tauri Command**: `read_html_files`
```rust
#[tauri::command]
async fn read_html_files(paths: Vec<String>) -> Result<Vec<String>, String>
```

### 2. Message Parsing

#### 2.1 HTML Structure
Expected Telegram export HTML structure:
```html
<div class="message default clearfix" id="message228402">
  <div class="body">
    <div class="date" title="23.05.2023 05:54:24 UTC-05:00">05:54</div>
    <div class="from_name">deviant cat</div>
    <div class="text">
      <a href="https://example.com">https://example.com</a>
    </div>
  </div>
</div>
```

#### 2.2 Message Data Structure
```typescript
interface Message {
  id: string;
  fromName: string;
  text: string;
  timestamp: string;
  mediaType: 'pdf' | 'zip' | 'image' | 'file' | null;
  mediaTitle?: string;
  links: string[];
  isLinkOnly: boolean;
  hasMedia: boolean;
}
```

#### 2.3 Parser Requirements
- Extract sender name from `.from_name`
- Extract message text from `.text` div
- Extract timestamp from `.date` title attribute
- Identify media attachments from `.media_file` elements
- Detect links and determine if message is link-only
- Handle joined messages (messages without sender repeated)
- Parse date separators (`.message.service`)

### 3. Search Functionality

#### 3.1 Search Implementation
- Real-time search as user types
- Search across:
  - Message text content
  - Sender names
  - Media file names
  - URLs
- Case-insensitive search
- Debounced input (300ms) for performance
- Use `useMemo` to cache filtered results

#### 3.2 Search UI
- Sticky header that remains visible during scroll
- Search input with icon
- Live count: "X of Y messages"
- Clear button when search has text

### 4. View Modes

#### 4.1 List View
- Compact, single-column layout
- Shows: sender, timestamp, text preview (2 lines max), media icon
- Full width utilization
- Alternating hover states
- Click to expand (future enhancement)

#### 4.2 Card View
- Grid layout (responsive: 1-3 columns based on width)
- Larger cards with full message text
- Media previews
- Link preview cards for URL-only messages
- Box shadow and hover effects

#### 4.3 View Toggle
- Icon buttons in sticky header
- List icon (☰) and Grid icon (⊞)
- Active state highlighting
- Persist user preference (localStorage/settings file)

### 5. Link Previews

#### 5.1 Link-Only Messages
Messages containing only a URL should display as preview cards:
```
┌─────────────────────────────┐
│ • example.com               │
│                             │
│ example.com                 │
│ /path/to/page               │
├─────────────────────────────┤
│ https://example.com/path    │
└─────────────────────────────┘
```

#### 5.2 Preview Components
- Domain extraction and display
- Path display in monospace font
- Full URL in footer
- Clickable - opens in default browser
- Gradient background
- Hover effects

#### 5.3 Mixed Content Messages
Messages with text + links show:
- Message text
- Links as clickable blue text below

### 6. Performance Optimizations

#### 6.1 Virtual Scrolling
- Implement `react-window` or `react-virtual` for message lists
- Render only visible messages + buffer
- Critical for 10,000+ message exports
- Maintain scroll position during search

#### 6.2 Memoization
```typescript
// Filtered messages
const filteredMessages = useMemo(() => {
  if (!searchTerm) return messages;
  const searchLower = searchTerm.toLowerCase();
  return messages.filter(msg => /* search logic */);
}, [messages, searchTerm]);

// Message components
const MessageCard = React.memo(({ message }) => { /* ... */ });
const MessageListItem = React.memo(({ message }) => { /* ... */ });
```

#### 6.3 Lazy Parsing
- Parse HTML files sequentially, not all at once
- Show progress indicator
- Allow cancellation of loading
- Stream results to UI as they're parsed

#### 6.4 Worker Threads (Future)
- Offload HTML parsing to worker threads
- Keep UI responsive during large file processing

### 7. UI/UX Requirements

#### 7.1 Sticky Header
```
┌──────────────────────────────────────┐
│ Telegram Chat Viewer                 │
│ ┌──────────────────────────────────┐ │
│ │ 🔍 Search messages...            │ │
│ │              [List] [Grid] [Buttons] │
│ │ 150 of 1,234 messages            │ │
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
  ↓ Scrollable content below
```

#### 7.2 Empty State
- Large upload icon
- Clear instructions
- Two prominent buttons: "Choose ZIP File" | "Select Folder"
- Helper text about performance benefits of folder selection

#### 7.3 Loading States
- Progress bar during ZIP extraction
- Parsing indicator with message count
- Skeleton screens for initial render

#### 7.4 Error Handling
- Invalid file format errors
- Corrupted ZIP handling
- Missing HTML files notification
- Graceful degradation for malformed HTML

### 8. Native Integration

#### 8.1 Menu Bar
```
Telegram Chat Viewer
├── File
│   ├── Open ZIP File...        ⌘O
│   ├── Open Folder...          ⌘⇧O
│   ├── Close                   ⌘W
│   └── Quit                    ⌘Q
├── Edit
│   ├── Copy                    ⌘C
│   └── Select All              ⌘A
└── View
    ├── List View               ⌘1
    ├── Card View               ⌘2
    └── Toggle Search           ⌘F
```

#### 8.2 Keyboard Shortcuts
- `⌘O`: Open ZIP file
- `⌘⇧O`: Open folder
- `⌘F`: Focus search
- `⌘1`: Switch to list view
- `⌘2`: Switch to card view
- `Esc`: Clear search
- `⌘W`: Close window
- `⌘Q`: Quit application

#### 8.3 Window Settings
- Minimum size: 1000x700
- Default size: 1200x800
- Resizable
- Remember window position and size
- Native title bar with traffic lights (macOS style)

### 9. Data Handling

#### 9.1 Supported Export Structure
```
ChatExport/
├── messages.html          # Main file (optional)
├── messages2.html         # Continuation
├── messages3.html         # Continuation
├── messages4.html         # etc.
├── files/                 # Attachments (not parsed in v1)
├── photos/                # Images (not parsed in v1)
├── stickers/              # Stickers (not parsed in v1)
└── video_files/           # Videos (not parsed in v1)
```

#### 9.2 File Pattern Matching
- Primary: `messages.html`
- Continuation: `messages[0-9]+.html`
- Parse files in numerical order
- Combine all messages and sort by timestamp

#### 9.3 Message Sorting
- Sort by parsed timestamp (ascending by default)
- Group by date sections if present
- Handle timezone information in timestamps

### 10. Settings & Preferences

#### 10.1 Persistent Settings (JSON file)
```json
{
  "lastOpenedPath": "/Users/username/Downloads/ChatExport",
  "viewMode": "list",
  "windowBounds": {
    "width": 1200,
    "height": 800,
    "x": 100,
    "y": 100
  }
}
```

#### 10.2 Settings Location
- macOS: `~/Library/Application Support/TelegramChatViewer/settings.json`
- No cloud sync - local storage only

### 11. Build & Distribution

#### 11.1 Development Setup
```bash
# Install dependencies
npm install

# Run in dev mode
npm run tauri dev

# Build for production
npm run tauri build
```

#### 11.2 Package Configuration
```json
// package.json
{
  "name": "telegram-chat-viewer",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "tauri": "tauri",
    "tauri:dev": "tauri dev",
    "tauri:build": "tauri build"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-window": "^1.8.10",
    "lucide-react": "^0.263.1"
  },
  "devDependencies": {
    "@tauri-apps/cli": "^2.0.0",
    "@tauri-apps/api": "^2.0.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

#### 11.3 Tauri Configuration
```json
// src-tauri/tauri.conf.json
{
  "build": {
    "beforeBuildCommand": "npm run build",
    "beforeDevCommand": "npm run dev",
    "devPath": "http://localhost:5173",
    "distDir": "../dist"
  },
  "package": {
    "productName": "Telegram Chat Viewer",
    "version": "1.0.0"
  },
  "tauri": {
    "allowlist": {
      "all": false,
      "fs": {
        "all": false,
        "readFile": true,
        "readDir": true,
        "scope": ["$HOME/**"]
      },
      "dialog": {
        "all": true
      },
      "shell": {
        "open": true
      }
    },
    "bundle": {
      "active": true,
      "identifier": "com.telegramviewer.app",
      "icon": [
        "icons/32x32.png",
        "icons/128x128.png",
        "icons/icon.icns"
      ],
      "macOS": {
        "minimumSystemVersion": "10.15"
      }
    },
    "windows": [
      {
        "title": "Telegram Chat Viewer",
        "width": 1200,
        "height": 800,
        "minWidth": 1000,
        "minHeight": 700,
        "resizable": true,
        "fullscreen": false
      }
    ]
  }
}
```

#### 11.4 Distribution
- Create DMG installer with custom background
- Code sign with Apple Developer certificate (optional for personal use)
- Notarize for macOS Gatekeeper (optional for personal use)
- Manual distribution - no auto-update mechanism
- Users download new versions manually from GitHub releases

### 12. Testing Requirements

#### 12.1 Unit Tests
- Message parser functions
- Search filter logic
- Link extraction
- Date parsing

#### 12.2 Integration Tests
- ZIP file extraction
- HTML file reading
- Full parsing pipeline
- UI component rendering

#### 12.3 Manual Test Cases
1. Load small export (< 100 messages)
2. Load large export (10,000+ messages)
3. Search with various terms
4. Switch between view modes
5. Test with messages containing:
   - Plain text
   - URLs only
   - Media attachments
   - Mixed content
6. Test folder vs ZIP loading
7. Test with corrupted/invalid files

### 13. Success Metrics

#### 13.1 Performance Targets
- Parse 10,000 messages in < 5 seconds
- Search results in < 100ms
- Smooth 60fps scrolling
- Initial render in < 1 second

#### 13.2 User Experience Goals
- Intuitive file loading (no confusion)
- Instant search feedback
- Readable message layout
- Accessible link previews

## Implementation Phases

### Phase 1: Core Infrastructure (Week 1)
- Set up Tauri project
- Implement file system operations
- Create message parser
- Basic UI with message list

### Phase 2: UI Polish (Week 1-2)
- Implement card/list views
- Add sticky search header
- Style link previews
- Add loading states

### Phase 3: Performance (Week 2)
- Implement virtual scrolling
- Add memoization
- Optimize parsing
- Test with large datasets

### Phase 4: Native Features (Week 3)
- Menu bar integration
- Keyboard shortcuts
- Settings persistence
- Window state management

### Phase 5: Distribution (Week 3-4)
- Create installer
- Code signing
- Documentation
- Release preparation

## Future Enhancements (Post-v1)

- [ ] Media file previews (images, videos)
- [ ] Export search results
- [ ] Dark mode
- [ ] Advanced filters (date range, sender)
- [ ] Multi-chat support
- [ ] Full-text search indexing
- [ ] Message threading/replies
- [ ] Export to PDF/CSV

**Explicitly Out of Scope:**
- ❌ Windows or Linux support
- ❌ Cloud sync (iCloud, Dropbox, etc.)
- ❌ Auto-update functionality
- ❌ Analytics or crash reporting
- ❌ Telemetry of any kind

## Appendix

### A. Dependencies

#### Required NPM Packages
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-window": "^1.8.10",
  "lucide-react": "^0.263.1",
  "@tauri-apps/api": "^2.0.0",
  "cheerio": "^1.0.0-rc.12"
}
```

#### Required Dev Dependencies
```json
{
  "@tauri-apps/cli": "^2.0.0",
  "@types/react": "^18.2.0",
  "@types/react-dom": "^18.2.0",
  "@types/react-window": "^1.8.8",
  "typescript": "^5.0.0",
  "vite": "^5.0.0",
  "@vitejs/plugin-react": "^4.0.0",
  "tailwindcss": "^3.4.0",
  "autoprefixer": "^10.4.0",
  "postcss": "^8.4.0"
}
```

### B. Rust Dependencies (Cargo.toml)
```toml
[dependencies]
tauri = "2.0"
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
zip = "0.6"
```

### C. Reference Implementation
The web version provides the baseline functionality and UI:
- Component structure
- Message parsing logic
- Search implementation
- View mode switching
- Link preview rendering

All React components should be adapted from the web version with modifications for native file system access.

---

## Getting Started

To begin implementation:

1. Initialize Tauri project: `npm create tauri-app`
2. Select: React + TypeScript + Vite
3. Copy React components from web version
4. Replace browser APIs with Tauri commands
5. Implement Rust backend for file operations
6. Test with sample Telegram exports
7. Iterate on performance and UX

## Scope & Constraints

**Platform:**
- ✅ macOS only (minimum version: 10.15 Catalina)
- ❌ No Windows or Linux support

**Features:**
- ✅ Local file storage and processing
- ✅ Manual version updates only
- ❌ No cloud sync capabilities
- ❌ No auto-update mechanism
- ❌ No analytics or crash reporting
- ❌ No telemetry or usage tracking

**Privacy & Data:**
- All data stays local on user's machine
- No network requests except opening URLs in browser
- No data collection of any kind
- Fully offline application

---

**Document Version**: 1.1  
**Last Updated**: 2025-10-03  
**Status**: Ready for Development