/**
 * Link metadata cache and fetching utilities
 * Implements caching, request deduplication, and rate limiting
 */

interface LinkMetadata {
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
}

interface CacheEntry {
  metadata: LinkMetadata | null;
  timestamp: number;
  loading: boolean;
}

// In-memory cache
const metadataCache = new Map<string, CacheEntry>();

// Track in-flight requests to avoid duplicates
const pendingRequests = new Map<string, Promise<LinkMetadata | null>>();

// Cache duration: 1 hour
const CACHE_DURATION = 60 * 60 * 1000;

// Maximum concurrent requests
const MAX_CONCURRENT_REQUESTS = 2; // Reduced from 3 for better performance
let activeRequests = 0;

// Request queue
const requestQueue: Array<() => Promise<void>> = [];

/**
 * Process the next request in the queue
 */
async function processQueue() {
  if (activeRequests >= MAX_CONCURRENT_REQUESTS || requestQueue.length === 0) {
    return;
  }

  const nextRequest = requestQueue.shift();
  if (nextRequest) {
    activeRequests++;
    try {
      await nextRequest();
    } finally {
      activeRequests--;
      // Process next in queue
      processQueue();
    }
  }
}

/**
 * Parse HTML and extract metadata
 */
function parseMetadata(html: string, url: string, domain: string): LinkMetadata {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Extract Open Graph metadata
  const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content');
  const ogDescription = doc.querySelector('meta[property="og:description"]')?.getAttribute('content');
  const ogImage = doc.querySelector('meta[property="og:image"]')?.getAttribute('content');
  const ogSiteName = doc.querySelector('meta[property="og:site_name"]')?.getAttribute('content');

  // Fallback to Twitter Card metadata
  const twitterTitle = doc.querySelector('meta[name="twitter:title"]')?.getAttribute('content');
  const twitterDescription = doc.querySelector('meta[name="twitter:description"]')?.getAttribute('content');
  const twitterImage = doc.querySelector('meta[name="twitter:image"]')?.getAttribute('content');

  // Fallback to standard HTML metadata
  const htmlTitle = doc.querySelector('title')?.textContent;
  const htmlDescription = doc.querySelector('meta[name="description"]')?.getAttribute('content');

  const meta: LinkMetadata = {
    title: ogTitle || twitterTitle || htmlTitle || undefined,
    description: ogDescription || twitterDescription || htmlDescription || undefined,
    image: ogImage || twitterImage || undefined,
    siteName: ogSiteName || domain,
  };

  // If image URL is relative, make it absolute
  if (meta.image && !meta.image.startsWith('http')) {
    try {
      meta.image = new URL(meta.image, url).href;
    } catch (e) {
      meta.image = undefined;
    }
  }

  return meta;
}

/**
 * Fetch metadata for a URL with caching and deduplication
 */
async function fetchMetadataInternal(url: string, domain: string): Promise<LinkMetadata | null> {
  try {
    const { fetch: tauriFetch } = await import('@tauri-apps/plugin-http');
    
    // Set a timeout for the request (3 seconds for faster failure)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await tauriFetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return null;
    }

    const html = await response.text();
    return parseMetadata(html, url, domain);
  } catch (error) {
    console.error('Failed to fetch metadata for', url, error);
    return null;
  }
}

/**
 * Get metadata for a URL (with caching and request deduplication)
 */
export async function getLinkMetadata(url: string, domain: string): Promise<LinkMetadata | null> {
  // Check cache first
  const cached = metadataCache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.metadata;
  }

  // Check if request is already in flight
  const pending = pendingRequests.get(url);
  if (pending) {
    return pending;
  }

  // Create new request
  const requestPromise = new Promise<LinkMetadata | null>((resolve) => {
    const executeRequest = async () => {
      try {
        const metadata = await fetchMetadataInternal(url, domain);
        
        // Cache the result
        metadataCache.set(url, {
          metadata,
          timestamp: Date.now(),
          loading: false,
        });

        resolve(metadata);
      } catch (error) {
        console.error('Error fetching metadata:', error);
        resolve(null);
      } finally {
        // Remove from pending requests
        pendingRequests.delete(url);
      }
    };

    // Add to queue
    requestQueue.push(executeRequest);
    processQueue();
  });

  // Track as pending
  pendingRequests.set(url, requestPromise);

  return requestPromise;
}

/**
 * Preload metadata for multiple URLs
 */
export function preloadMetadata(urls: string[], domains: string[]) {
  urls.forEach((url, index) => {
    const domain = domains[index] || '';
    // Don't await - let it load in background
    getLinkMetadata(url, domain).catch(() => {
      // Silently fail
    });
  });
}

/**
 * Clear the cache (useful for testing or memory management)
 */
export function clearMetadataCache() {
  metadataCache.clear();
  pendingRequests.clear();
}

