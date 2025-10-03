/**
 * Parse URL into components for display
 */
export interface ParsedLink {
  url: string;
  domain: string;
  path: string;
  protocol: string;
}

export function parseLink(url: string): ParsedLink {
  try {
    const urlObj = new URL(url);
    return {
      url: url,
      domain: urlObj.hostname,
      path: urlObj.pathname + urlObj.search + urlObj.hash,
      protocol: urlObj.protocol,
    };
  } catch (error) {
    // Fallback for invalid URLs
    return {
      url: url,
      domain: url,
      path: '',
      protocol: 'http:',
    };
  }
}

/**
 * Open URL in default browser
 */
export async function openUrl(url: string): Promise<void> {
  try {
    const { open } = await import('@tauri-apps/plugin-shell');
    await open(url);
  } catch (error) {
    console.error('Failed to open URL:', error);
  }
}

