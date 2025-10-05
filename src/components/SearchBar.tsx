import React from 'react';
import { Search, X, List, Grid, Moon, Sun, Menu } from 'lucide-react';
import type { ViewMode } from '../types/Message';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  messageCount: number;
  totalCount: number;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  backupDate?: string;
  onMenuOpen: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  messageCount,
  totalCount,
  viewMode,
  onViewModeChange,
  darkMode,
  onToggleDarkMode,
  backupDate,
  onMenuOpen,
}) => {
  return (
    <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center gap-4 mb-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search messages..."
              className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              title="List View (⌘1)"
            >
              <List className="w-5 h-5" />
            </button>
            <button
              onClick={() => onViewModeChange('card')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'card'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              title="Card View (⌘2)"
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-lg transition-colors bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              title="Toggle Dark Mode"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={onMenuOpen}
              className="p-2 rounded-lg transition-colors bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              title="Open Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <div>
            {searchTerm ? (
              <span>
                <span className="font-semibold">{messageCount}</span> of{' '}
                <span className="font-semibold">{totalCount}</span> messages
              </span>
            ) : (
              <span>
                <span className="font-semibold">{totalCount}</span> messages total
              </span>
            )}
          </div>
          {backupDate && (
            <div className="text-xs text-gray-500 dark:text-gray-500">
              Backup: <span className="font-semibold">{backupDate}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

