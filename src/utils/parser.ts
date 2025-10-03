import * as cheerio from 'cheerio';
import type { Message, MediaType } from '../types/Message';

/**
 * Extract URLs from text content
 */
export function extractLinks(html: string): string[] {
  const $ = cheerio.load(html);
  const links: string[] = [];
  
  $('a').each((_, el) => {
    const href = $(el).attr('href');
    if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
      links.push(href);
    }
  });
  
  return links;
}

/**
 * Determine media type from file extension or class name
 */
function getMediaType(fileName: string): MediaType {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.pdf')) return 'pdf';
  if (lower.endsWith('.zip') || lower.endsWith('.rar')) return 'zip';
  if (lower.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return 'image';
  return 'file';
}

/**
 * Check if message contains only a link
 */
function isMessageLinkOnly(textContent: string, links: string[]): boolean {
  if (links.length !== 1) return false;
  
  const trimmed = textContent.trim();
  const link = links[0];
  
  // Check if the text is just the link or very similar
  return trimmed === link || trimmed.replace(/\s+/g, '') === link.replace(/\s+/g, '');
}

/**
 * Parse a single message element from HTML
 */
function parseMessageElement($: cheerio.CheerioAPI, element: any): Message | null {
  const $msg = $(element);
  
  // Extract message ID
  const id = $msg.attr('id') || `msg-${Date.now()}-${Math.random()}`;
  
  // Extract sender name (may not exist for joined messages)
  const fromName = $msg.find('.from_name').text().trim() || 'Unknown';
  
  // Extract timestamp
  const dateTitle = $msg.find('.date').attr('title') || '';
  const timestamp = dateTitle || $msg.find('.date').text().trim();
  
  // Extract text content
  const $textDiv = $msg.find('.text');
  const text = $textDiv.text().trim();
  
  // Extract links
  const links = extractLinks($textDiv.html() || '');
  
  // Check for media attachments
  const $media = $msg.find('.media_file');
  const hasMedia = $media.length > 0;
  let mediaType: MediaType = null;
  let mediaTitle: string | undefined;
  
  if (hasMedia) {
    mediaTitle = $media.find('.title').text().trim() || $media.attr('title');
    if (mediaTitle) {
      mediaType = getMediaType(mediaTitle);
    }
  }
  
  // Determine if link-only message
  const isLinkOnly = isMessageLinkOnly(text, links);
  
  return {
    id,
    fromName,
    text,
    timestamp,
    mediaType,
    mediaTitle,
    links,
    isLinkOnly,
    hasMedia,
  };
}

/**
 * Parse HTML content from a Telegram export file
 */
export function parseMessagesFromHTML(htmlContent: string): Message[] {
  const $ = cheerio.load(htmlContent);
  const messages: Message[] = [];
  
  // Find all message divs (exclude service messages)
  $('.message.default').each((_, element) => {
    const message = parseMessageElement($, element);
    if (message && message.text) {
      messages.push(message);
    }
  });
  
  return messages;
}

/**
 * Parse multiple HTML files and combine messages
 */
export async function parseMultipleFiles(htmlContents: string[]): Promise<Message[]> {
  const allMessages: Message[] = [];
  
  for (const htmlContent of htmlContents) {
    const messages = parseMessagesFromHTML(htmlContent);
    allMessages.push(...messages);
  }
  
  // Sort by timestamp (descending - most recent first)
  // Note: This is a simple sort that might need improvement for actual timestamp parsing
  allMessages.sort((a, b) => {
    // Extract numeric ID from the message id if possible
    const aId = parseInt(a.id.replace(/\D/g, '')) || 0;
    const bId = parseInt(b.id.replace(/\D/g, '')) || 0;
    return bId - aId; // Reversed for descending order
  });
  
  return allMessages;
}

/**
 * Filter messages based on search term
 */
export function filterMessages(messages: Message[], searchTerm: string): Message[] {
  if (!searchTerm.trim()) {
    return messages;
  }
  
  const searchLower = searchTerm.toLowerCase();
  
  return messages.filter(msg => {
    // Search in text content
    if (msg.text.toLowerCase().includes(searchLower)) return true;
    
    // Search in sender name
    if (msg.fromName.toLowerCase().includes(searchLower)) return true;
    
    // Search in media title
    if (msg.mediaTitle && msg.mediaTitle.toLowerCase().includes(searchLower)) return true;
    
    // Search in URLs
    if (msg.links.some(link => link.toLowerCase().includes(searchLower))) return true;
    
    return false;
  });
}

