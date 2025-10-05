import React, { useState } from 'react';
import { FileText, Image, File, FileArchive, Copy, Check, Trash2 } from 'lucide-react';
import type { Message } from '../types/Message';
import { LinkPreview } from './LinkPreview';
import { Command } from '@tauri-apps/plugin-shell';
import { formatCompactDate } from '../utils/dateFormatter';

interface MessageCardProps {
  message: Message;
  onDelete: (messageId: string) => void;
  basePath?: string;
}

const getMediaIcon = (mediaType: string | null) => {
  switch (mediaType) {
    case 'pdf':
      return <FileText className="w-5 h-5 text-red-500" />;
    case 'image':
      return <Image className="w-5 h-5 text-blue-500" />;
    case 'zip':
      return <FileArchive className="w-5 h-5 text-yellow-500" />;
    default:
      return <File className="w-5 h-5 text-gray-500" />;
  }
};

const MessageCardComponent: React.FC<MessageCardProps> = ({ message, onDelete, basePath }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleDelete = async () => {
    // In Tauri, window.confirm returns a Promise, so we need to await it
    const confirmed = await confirm('Delete this message?');
    if (confirmed) {
      onDelete(message.id);
    }
  };

  const handleMediaClick = async () => {
    if (!message.mediaTitle || !basePath) {
      alert('Unable to open file: base path not available');
      return;
    }

    try {
      const { exists, readDir } = await import('@tauri-apps/plugin-fs');
      
      // Construct potential file paths
      // Telegram typically stores files in: files/, photos/, video_files/, etc.
      const possibleFolders = [
        'files',
        'photos',
        'video_files',
        'voice_messages',
        'audio_files',
        'documents',
        'stickers',
        '', // Root folder
      ];

      let filePath: string | null = null;

      // Try to find the file in each folder
      for (const folder of possibleFolders) {
        const testPath = folder ? `${basePath}/${folder}` : basePath;
        
        try {
          // Check if the folder exists
          const folderExists = await exists(testPath);
          if (!folderExists) continue;

          // List files in the folder
          const entries = await readDir(testPath);
          
          // Look for the file
          const foundFile = entries.find(
            entry => entry.name === message.mediaTitle
          );

          if (foundFile) {
            filePath = folder ? `${basePath}/${folder}/${message.mediaTitle}` : `${basePath}/${message.mediaTitle}`;
            break;
          }
        } catch (error) {
          // Folder doesn't exist or can't be read, try next
          continue;
        }
      }

      if (filePath) {
        // Use macOS 'open' command to open file with default application
        try {
          const command = Command.create('open', [filePath]);
          await command.execute();
        } catch (openError) {
          console.error('Failed to execute open command:', openError);
          alert(`Failed to open file: ${openError}`);
        }
      } else {
        alert(`File not found: ${message.mediaTitle}\n\nSearched in: ${possibleFolders.filter(f => f).join(', ')}\n\nMake sure the export folder contains the media files.`);
      }
    } catch (error) {
      console.error('Failed to open file:', error);
      alert(`Failed to open file: ${error}`);
    }
  };

  // If it's a link-only message, show link preview
  if (message.isLinkOnly && message.links.length > 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow relative group">
        <button
          onClick={handleDelete}
          className="absolute top-2 right-2 p-1.5 rounded-md bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Delete message"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        <div className="flex items-center justify-between mb-3 pr-8">
          <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{message.fromName}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400" title={message.timestamp}>
            {formatCompactDate(message.timestamp)}
          </span>
        </div>
        <LinkPreview url={message.links[0]} />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow relative group">
      <button
        onClick={handleDelete}
        className="absolute top-2 right-2 p-1.5 rounded-md bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800 opacity-0 group-hover:opacity-100 transition-opacity z-10"
        title="Delete message"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <div className="flex items-center justify-between mb-2 pr-8">
        <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{message.fromName}</span>
        <span className="text-xs text-gray-500 dark:text-gray-400" title={message.timestamp}>
          {formatCompactDate(message.timestamp)}
        </span>
      </div>
      
      {message.text && (
        <div className="relative group/code mb-3">
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 p-1.5 rounded-md bg-gray-700 dark:bg-gray-600 text-white hover:bg-gray-600 dark:hover:bg-gray-500 opacity-0 group-hover/code:opacity-100 transition-opacity z-10"
            title="Copy text"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          </button>
          <pre className="bg-gray-900 dark:bg-gray-950 text-gray-100 text-xs p-3 rounded-lg overflow-x-auto whitespace-pre-wrap break-words font-mono">
            <code>{message.text}</code>
          </pre>
        </div>
      )}
      
      {message.hasMedia && message.mediaTitle && (
        <button
          onClick={handleMediaClick}
          className="w-full flex items-center gap-2 bg-gray-50 dark:bg-gray-700 rounded px-3 py-2 mb-2 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          title="Click to open file"
        >
          {getMediaIcon(message.mediaType)}
          <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{message.mediaTitle}</span>
        </button>
      )}
      
      {message.links.length > 0 && !message.isLinkOnly && (
        <div className="mt-2 space-y-2">
          {message.links.map((link, idx) => (
            <div key={idx} className="space-y-2">
              <LinkPreview url={link} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Memoize with custom comparison to prevent unnecessary re-renders
export const MessageCard = React.memo(MessageCardComponent, (prevProps, nextProps) => {
  // Only re-render if message content or basePath changes
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.text === nextProps.message.text &&
    prevProps.message.links.length === nextProps.message.links.length &&
    prevProps.basePath === nextProps.basePath
  );
});

MessageCard.displayName = 'MessageCard';

