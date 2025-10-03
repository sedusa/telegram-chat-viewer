import React from 'react';
import { ExternalLink } from 'lucide-react';
import { parseLink, openUrl } from '../utils/linkParser';

interface LinkPreviewProps {
  url: string;
}

export const LinkPreview: React.FC<LinkPreviewProps> = ({ url }) => {
  const parsed = parseLink(url);

  const handleClick = () => {
    openUrl(url);
  };

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <ExternalLink className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-semibold text-blue-900 dark:text-blue-200">{parsed.domain}</span>
        </div>
      </div>
      
      {parsed.path && parsed.path !== '/' && (
        <div className="mb-3">
          <code className="text-xs text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 px-2 py-1 rounded block break-all overflow-hidden">
            {parsed.path}
          </code>
        </div>
      )}
      
      <div className="border-t border-blue-200 dark:border-blue-700 pt-2 mt-2">
        <p className="text-xs text-blue-700 dark:text-blue-300 break-all overflow-hidden">{url}</p>
      </div>
    </div>
  );
};

