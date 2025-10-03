import React from 'react';
import { Upload, FolderOpen } from 'lucide-react';
import { open } from '@tauri-apps/plugin-dialog';
import { readTextFile, readDir, BaseDirectory } from '@tauri-apps/plugin-fs';
import { parseMultipleFiles } from '../utils/parser';
import type { Message } from '../types/Message';

interface FileUploaderProps {
  onMessagesLoaded: (messages: Message[], backupDate?: string, basePath?: string) => void;
  onError: (error: string) => void;
  onLoadingChange: (loading: boolean) => void;
}

/**
 * Extract backup date from folder name
 * Supports formats like: "ChatExport_2023-05-23" or "export_20230523" or "Telegram_05-23-2023"
 */
const extractBackupDate = (folderName: string): string | undefined => {
  // Try different date patterns
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
        // Year first: 2023-05-23
        return `${match[1]}-${match[2]}-${match[3]}`;
      } else {
        // Month/day first: 05-23-2023
        return `${match[3]}-${match[1]}-${match[2]}`;
      }
    }
  }

  return undefined;
};

export const FileUploader: React.FC<FileUploaderProps> = ({
  onMessagesLoaded,
  onError,
  onLoadingChange,
}) => {
  const handleFolderSelect = async () => {
    try {
      onLoadingChange(true);
      
      const selected = await open({
        directory: true,
        multiple: false,
        title: 'Select Telegram Export Folder',
      });

      if (!selected || typeof selected !== 'string') {
        onLoadingChange(false);
        return;
      }

      // Read all files in the directory
      const entries = await readDir(selected);
      
      // Filter for messages*.html files
      const messageFiles = entries
        .filter(entry => entry.name && /^messages\d*\.html$/i.test(entry.name))
        .sort((a, b) => {
          // Sort messages.html first, then by number
          const aNum = a.name === 'messages.html' ? 0 : parseInt(a.name?.match(/\d+/)?.[0] || '999999');
          const bNum = b.name === 'messages.html' ? 0 : parseInt(b.name?.match(/\d+/)?.[0] || '999999');
          return aNum - bNum;
        });

      if (messageFiles.length === 0) {
        onError('No messages*.html files found in the selected folder.');
        onLoadingChange(false);
        return;
      }

      // Read all HTML files
      const htmlContents: string[] = [];
      for (const file of messageFiles) {
        const fullPath = `${selected}/${file.name}`;
        const content = await readTextFile(fullPath);
        htmlContents.push(content);
      }

      // Parse all messages
      const messages = await parseMultipleFiles(htmlContents);
      
      // Extract backup date from folder name
      const folderName = selected.split('/').pop() || '';
      const backupDate = extractBackupDate(folderName);
      
      if (messages.length === 0) {
        onError('No messages found in the HTML files.');
      } else {
        onMessagesLoaded(messages, backupDate, selected);
      }
      
      onLoadingChange(false);
    } catch (error) {
      console.error('Error loading folder:', error);
      onError(`Failed to load folder: ${error}`);
      onLoadingChange(false);
    }
  };

  const handleFileSelect = async () => {
    try {
      onLoadingChange(true);
      
      const selected = await open({
        multiple: false,
        title: 'Select Telegram Export HTML File',
        filters: [{
          name: 'HTML',
          extensions: ['html']
        }]
      });

      if (!selected || typeof selected !== 'string') {
        onLoadingChange(false);
        return;
      }

      // Read the file
      const content = await readTextFile(selected);
      
      // Parse messages
      const messages = await parseMultipleFiles([content]);
      
      // Try to extract backup date from file path
      const pathParts = selected.split('/');
      const folderName = pathParts[pathParts.length - 2] || '';
      const backupDate = extractBackupDate(folderName);
      
      // Get the base path (the folder containing the messages.html file)
      const basePath = pathParts.slice(0, -1).join('/');
      
      if (messages.length === 0) {
        onError('No messages found in the HTML file.');
      } else {
        onMessagesLoaded(messages, backupDate, basePath);
      }
      
      onLoadingChange(false);
    } catch (error) {
      console.error('Error loading file:', error);
      onError(`Failed to load file: ${error}`);
      onLoadingChange(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <Upload className="w-24 h-24 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Welcome to Telegram Chat Viewer
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Select a Telegram chat export to get started
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleFolderSelect}
            className="w-full flex items-center justify-center gap-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg transition-colors shadow-md"
          >
            <FolderOpen className="w-6 h-6" />
            <span>Select Folder</span>
          </button>

          <button
            onClick={handleFileSelect}
            className="w-full flex items-center justify-center gap-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold py-4 px-6 rounded-lg transition-colors"
          >
            <Upload className="w-6 h-6" />
            <span>Select HTML File</span>
          </button>
        </div>

        <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          <p>💡 Tip: Selecting a folder is faster for multi-file exports</p>
        </div>
      </div>
    </div>
  );
};

