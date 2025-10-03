/**
 * Format a date string from Telegram export format to a more readable format
 * Input: "23.05.2023 05:54:24 UTC-05:00" or similar
 * Output: "May 23, 2023 at 5:54 AM"
 */
export function formatMessageDate(dateString: string): string {
  try {
    // Parse the Telegram date format: "23.05.2023 05:54:24 UTC-05:00"
    const parts = dateString.match(/(\d+)\.(\d+)\.(\d+)\s+(\d+):(\d+):(\d+)/);
    
    if (!parts) {
      return dateString; // Return original if parsing fails
    }

    const [, day, month, year, hour, minute] = parts;
    
    // Create a Date object (month is 0-indexed in JS)
    const date = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hour),
      parseInt(minute)
    );

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return dateString;
    }

    // Format options
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    };

    return date.toLocaleString('en-US', options);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
}

/**
 * Get relative time (e.g., "2 hours ago", "Yesterday")
 */
export function getRelativeTime(dateString: string): string {
  try {
    const parts = dateString.match(/(\d+)\.(\d+)\.(\d+)\s+(\d+):(\d+):(\d+)/);
    
    if (!parts) {
      return dateString;
    }

    const [, day, month, year, hour, minute] = parts;
    const date = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hour),
      parseInt(minute)
    );

    if (isNaN(date.getTime())) {
      return dateString;
    }

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    
    // For older messages, show the formatted date
    return formatMessageDate(dateString);
  } catch (error) {
    return dateString;
  }
}

/**
 * Format date in a compact way: "May 23, 2023, 5:54 AM"
 */
export function formatCompactDate(dateString: string): string {
  try {
    const parts = dateString.match(/(\d+)\.(\d+)\.(\d+)\s+(\d+):(\d+):(\d+)/);
    
    if (!parts) {
      return dateString;
    }

    const [, day, month, year, hour, minute] = parts;
    const date = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hour),
      parseInt(minute)
    );

    if (isNaN(date.getTime())) {
      return dateString;
    }

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    };

    return date.toLocaleString('en-US', options);
  } catch (error) {
    return dateString;
  }
}

