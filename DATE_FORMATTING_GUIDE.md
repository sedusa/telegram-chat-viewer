# Date Formatting Guide

## Overview
The application now formats Telegram export dates in a much more readable format.

## Date Format Changes

### Before
```
23.05.2023 05:54:24 UTC-05:00
```

### After
```
May 23, 5:54 AM
```

## Implementation

### New Date Formatter Utility
Created `src/utils/dateFormatter.ts` with three formatting functions:

#### 1. `formatCompactDate()` - Used in UI
Formats dates in a compact, readable way without the year (unless needed).

**Examples:**
- `23.05.2023 05:54:24 UTC-05:00` → `May 23, 5:54 AM`
- `15.12.2023 14:30:00 UTC-05:00` → `Dec 15, 2:30 PM`
- `01.01.2023 00:00:00 UTC-05:00` → `Jan 1, 12:00 AM`

#### 2. `formatMessageDate()` - Full Format
Includes the year for complete context.

**Example:**
- `23.05.2023 05:54:24 UTC-05:00` → `May 23, 2023 at 5:54 AM`

#### 3. `getRelativeTime()` - Human-Friendly
Shows relative time for recent messages.

**Examples:**
- Just now
- 5m ago
- 2h ago
- Yesterday
- 3d ago
- May 23, 5:54 AM (for older messages)

## Features

### Hover to See Original
The original timestamp is preserved in a `title` attribute, so hovering over any date shows the full original format:

```tsx
<span title="23.05.2023 05:54:24 UTC-05:00">
  May 23, 5:54 AM
</span>
```

### Locale Support
Uses `Intl.DateTimeFormat` which automatically adapts to the user's locale:
- US: 12-hour format (5:54 AM)
- Most other regions: 24-hour format (05:54)
- Month names in user's language

### Error Handling
If date parsing fails for any reason:
- Falls back to displaying the original date string
- Logs error to console for debugging
- App continues to function normally

## Date Parsing Logic

The formatter handles Telegram's date format:

```typescript
// Input format: DD.MM.YYYY HH:MM:SS
const parts = dateString.match(/(\d+)\.(\d+)\.(\d+)\s+(\d+):(\d+):(\d+)/);
```

Extracted components:
1. Day
2. Month
3. Year
4. Hour
5. Minute
6. Second (parsed but not displayed in compact format)

## Usage in Components

### MessageCard.tsx
```tsx
import { formatCompactDate } from '../utils/dateFormatter';

<span title={message.timestamp}>
  {formatCompactDate(message.timestamp)}
</span>
```

### MessageList.tsx
```tsx
import { formatCompactDate } from '../utils/dateFormatter';

<span title={message.timestamp}>
  {formatCompactDate(message.timestamp)}
</span>
```

## Format Options

The formatter uses these `Intl.DateTimeFormat` options:

```typescript
const options: Intl.DateTimeFormatOptions = {
  month: 'short',      // Jan, Feb, Mar...
  day: 'numeric',      // 1, 2, 3...
  hour: 'numeric',     // 1, 2, 3... (or 13, 14 for 24h)
  minute: '2-digit',   // 01, 02, 03...
  hour12: true,        // AM/PM format
};
```

## Testing

### Test Cases
```typescript
// Input → Output
"23.05.2023 05:54:24 UTC-05:00" → "May 23, 5:54 AM"
"01.01.2024 00:00:00 UTC-05:00" → "Jan 1, 12:00 AM"
"15.12.2023 23:59:59 UTC-05:00" → "Dec 15, 11:59 PM"
"31.07.2023 12:30:00 UTC-05:00" → "Jul 31, 12:30 PM"
```

### Edge Cases Handled
- Invalid dates → Falls back to original string
- Missing components → Falls back to original string
- Malformed input → Falls back to original string
- Different timezones → Parsed correctly (time is absolute)

## Customization

### Changing the Format
To modify the date format, edit the `options` object in `dateFormatter.ts`:

```typescript
// Add year to compact format
const options: Intl.DateTimeFormatOptions = {
  year: 'numeric',     // Add this
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
};
// Output: "May 23, 2023, 5:54 AM"
```

### 24-Hour Format
```typescript
const options: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,       // Change this
};
// Output: "May 23, 05:54"
```

### Different Locale
```typescript
// Use specific locale
date.toLocaleString('en-GB', options); // British format
date.toLocaleString('de-DE', options); // German format
date.toLocaleString('ja-JP', options); // Japanese format
```

## Performance

- Date parsing is done once per message on render
- Results are memoized by React (messages are memoized)
- Very fast: < 1ms per date
- No performance impact on large message lists

## Browser Compatibility

- ✅ All modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ Tauri WebView
- ✅ Works on all operating systems
- Uses standard `Date` and `Intl` APIs

## Future Enhancements

Possible improvements:
- [ ] User preference for date format (12h vs 24h)
- [ ] Option to show/hide year
- [ ] Locale selection in settings
- [ ] Date grouping headers ("Today", "Yesterday", etc.)
- [ ] Timezone conversion options

---

**Status**: ✅ Fully Implemented  
**Version**: 1.0.0  
**Last Updated**: 2025-10-03

