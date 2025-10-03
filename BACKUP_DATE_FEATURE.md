# Backup Date Feature

## Overview
The application now automatically extracts and displays the backup date from the folder name when you load a Telegram chat export.

## How It Works

### 1. Date Extraction
The app looks for date patterns in the folder or file path and automatically extracts them:

**Supported Date Formats:**
- `2023-05-23` (YYYY-MM-DD)
- `20230523` (YYYYMMDD)
- `05-23-2023` (MM-DD-YYYY)
- `05/23/2023` (MM/DD/YYYY)

**Example Folder Names:**
- `ChatExport_2023-05-23` → Extracts: `2023-05-23`
- `telegram_backup_20230523` → Extracts: `2023-05-23`
- `messages_05-23-2023` → Extracts: `2023-05-23`

### 2. Display Location
The backup date appears in the search bar, on the same line as the message count, but **right-aligned**.

**Visual Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ 2998 messages total            Backup: 2023-05-23       │
└─────────────────────────────────────────────────────────┘
```

### 3. Implementation Details

#### FileUploader Component
- Extracts the folder name from the selected path
- Runs the folder name through date pattern matching
- Passes the extracted date to the App component

#### SearchBar Component
- Receives the backup date as a prop
- Displays it right-aligned when available
- Shows in a subtle gray color with "Backup:" label

#### App Component
- Stores the backup date in state
- Passes it down to SearchBar for display

## Code Examples

### Date Extraction Function
```typescript
const extractBackupDate = (folderName: string): string | undefined => {
  const patterns = [
    /(\d{4})-(\d{2})-(\d{2})/, // 2023-05-23
    /(\d{4})(\d{2})(\d{2})/, // 20230523
    /(\d{2})-(\d{2})-(\d{4})/, // 05-23-2023
    /(\d{2})\/(\d{2})\/(\d{4})/, // 05/23/2023
  ];

  for (const pattern of patterns) {
    const match = folderName.match(pattern);
    if (match) {
      if (match[1].length === 4) {
        return `${match[1]}-${match[2]}-${match[3]}`;
      } else {
        return `${match[3]}-${match[1]}-${match[2]}`;
      }
    }
  }

  return undefined;
};
```

### Display in SearchBar
```tsx
<div className="flex items-center justify-between">
  <div>
    <span className="font-semibold">{totalCount}</span> messages total
  </div>
  {backupDate && (
    <div className="text-xs text-gray-500 dark:text-gray-500">
      Backup: <span className="font-semibold">{backupDate}</span>
    </div>
  )}
</div>
```

## Styling

### Light Mode
- Color: `text-gray-500`
- Size: `text-xs`
- Right-aligned with flexbox

### Dark Mode
- Color: `text-gray-500` (same, subtle in both modes)
- Maintains same size and alignment

## Edge Cases

### No Date Found
If the folder/file name doesn't contain a recognizable date pattern:
- The backup date simply won't be displayed
- No error or placeholder shown
- App functions normally

### Multiple Dates in Name
If multiple date patterns exist in the folder name:
- The first matching pattern is used
- Follows the priority order of the patterns array

### Invalid Dates
The function looks for date-like patterns but doesn't validate if the date is real:
- `2023-99-99` would be extracted as `2023-99-99`
- Consider adding date validation if needed

## Testing

### Test Cases
1. **Folder with date**: `ChatExport_2023-05-23`
   - ✅ Should show: `Backup: 2023-05-23`

2. **Folder with compact date**: `backup_20230523`
   - ✅ Should show: `Backup: 2023-05-23`

3. **Folder without date**: `MyTelegramChats`
   - ✅ Should show nothing (gracefully)

4. **File selection**: `/path/to/ChatExport_2023-05-23/messages.html`
   - ✅ Should extract from parent folder name

### Manual Testing
1. Create a test folder with a date in the name
2. Load it in the app
3. Check the search bar - backup date should appear on the right

## Future Enhancements

Possible improvements:
- [ ] Add date validation
- [ ] Format date based on user locale
- [ ] Parse date from message timestamps if folder name has no date
- [ ] Show both export date and date range of messages
- [ ] Allow manual date editing
- [ ] Click date to filter messages by date range

## Browser Compatibility

Works in all modern browsers:
- ✅ Chrome/Edge
- ✅ Firefox
- ✅ Safari
- ✅ Tauri WebView

## Performance

- Date extraction happens once on load
- No performance impact on rendering or scrolling
- Regex matching is fast (< 1ms)

---

**Status**: ✅ Fully Implemented  
**Version**: 1.0.0  
**Last Updated**: 2025-10-03

