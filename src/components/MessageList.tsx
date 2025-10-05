import React from 'react';
import { FileText, Image, File, FileArchive, Link as LinkIcon, Trash2 } from 'lucide-react';
import type { Message } from '../types/Message';
import { openUrl } from '../utils/linkParser';
import { Command } from '@tauri-apps/plugin-shell';
import { formatCompactDate } from '../utils/dateFormatter';

interface MessageListProps {
  message: Message;
  onDelete: (messageId: string) => void;
  basePath?: string;
}

const getMediaIcon = (mediaType: string | null) => {
  switch (mediaType) {
    case 'pdf':
      return <FileText className="w-4 h-4 text-red-500" />;
    case 'image':
      return <Image className="w-4 h-4 text-blue-500" />;
    case 'zip':
      return <FileArchive className="w-4 h-4 text-yellow-500" />;
    default:
      return <File className="w-4 h-4 text-gray-500" />;
  }
};

const MessageListItemComponent: React.FC<MessageListProps> = ({ message, onDelete, basePath }) => {
  const handleLinkClick = async (e: React.MouseEvent) => {
    if (message.isLinkOnly && message.links.length > 0) {
      e.preventDefault();
      openUrl(message.links[0]);
    } else if (message.hasMedia && message.mediaTitle && basePath) {
      e.preventDefault();
      
      try {
        const { exists, readDir } = await import('@tauri-apps/plugin-fs');
        
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
          alert(`File not found: ${message.mediaTitle}\n\nSearched in: ${possibleFolders.filter(f => f).join(', ')}`);
        }
      } catch (error) {
        console.error('Failed to open file:', error);
        alert(`Failed to open file: ${error}`);
      }
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    // In Tauri, window.confirm returns a Promise, so we need to await it
    const confirmed = await confirm('Delete this message?');
    if (confirmed) {
      onDelete(message.id);
    }
  };

  return (
    <div
      onClick={handleLinkClick}
      className={`border-b border-gray-200 dark:border-gray-700 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group relative ${
        message.isLinkOnly || message.hasMedia ? 'cursor-pointer' : ''
      }`}
    >
      <button
        onClick={handleDelete}
        className="absolute top-2 right-2 p-1.5 rounded-md bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Delete message"
      >
        <Trash2 className="w-3 h-3" />
      </button>
      
      <div className="flex items-start justify-between gap-4 pr-8">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">
              {message.fromName}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0" title={message.timestamp}>
              {formatCompactDate(message.timestamp)}
            </span>
          </div>
          
          <div className="flex items-start gap-2">
            {message.hasMedia && (
              <div className="flex-shrink-0 mt-0.5">
                {getMediaIcon(message.mediaType)}
              </div>
            )}
            {message.isLinkOnly && message.links.length > 0 && (
              <div className="flex-shrink-0 mt-0.5">
                <LinkIcon className="w-4 h-4 text-blue-500 dark:text-blue-400" />
              </div>
            )}
            <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-2 break-words font-mono">
              {message.text || message.mediaTitle || 'Media attachment'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Memoize with custom comparison to prevent unnecessary re-renders
export const MessageListItem = React.memo(MessageListItemComponent, (prevProps, nextProps) => {
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.text === nextProps.message.text &&
    prevProps.basePath === nextProps.basePath
  );
});

MessageListItem.displayName = 'MessageListItem';

