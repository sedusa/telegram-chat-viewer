import { useState, useMemo, useCallback, useEffect, useTransition } from 'react';
import { FileUploader } from './components/FileUploader';
import { SearchBar } from './components/SearchBar';
import { MessageCard } from './components/MessageCard';
import { MessageListItem } from './components/MessageList';
import { SideMenu } from './components/SideMenu';
import { filterMessages } from './utils/parser';
import type { Message, ViewMode } from './types/Message';
import { FixedSizeList as List } from 'react-window';

function App() {
  // Initialize dark mode from localStorage before first render
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true';
  });

  const [messages, setMessages] = useState<Message[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('viewMode');
    return (saved as ViewMode) || 'list';
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backupDate, setBackupDate] = useState<string | undefined>(undefined);
  const [basePath, setBasePath] = useState<string | undefined>(undefined);
  const [, startTransition] = useTransition();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Apply dark mode class immediately on mount and when changed
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  // Save view mode preference
  useEffect(() => {
    localStorage.setItem('viewMode', viewMode);
  }, [viewMode]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      startTransition(() => {
        setDebouncedSearchTerm(searchTerm);
      });
    }, 150); // 150ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘F - Focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        const input = document.querySelector('input[type="text"]') as HTMLInputElement | null;
        input?.focus();
      }
      
      // ⌘1 - List view
      if ((e.metaKey || e.ctrlKey) && e.key === '1') {
        e.preventDefault();
        setViewMode('list');
      }
      
      // ⌘2 - Card view
      if ((e.metaKey || e.ctrlKey) && e.key === '2') {
        e.preventDefault();
        setViewMode('card');
      }
      
      // Escape - Clear search
      if (e.key === 'Escape') {
        setSearchTerm('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filtered messages with debounced search
  const filteredMessages = useMemo(() => {
    return filterMessages(messages, debouncedSearchTerm);
  }, [messages, debouncedSearchTerm]);

  const handleMessagesLoaded = useCallback((loadedMessages: Message[], date?: string, path?: string) => {
    setMessages(loadedMessages);
    setBackupDate(date);
    setBasePath(path);
    setError(null);
  }, []);

  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    setTimeout(() => setError(null), 5000);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
  }, []);

  const handleDeleteMessage = useCallback((messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  }, []);

  const handleToggleDarkMode = useCallback(() => {
    setDarkMode(prev => !prev);
  }, []);

  const handleMenuOpen = useCallback(() => {
    setIsMenuOpen(true);
  }, []);

  const handleMenuClose = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const handleEjectBackup = useCallback(() => {
    // Reset all state to return to upload screen
    setMessages([]);
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setBackupDate(undefined);
    setBasePath(undefined);
    setError(null);
  }, []);

  // Show empty state if no messages loaded
  if (messages.length === 0 && !loading) {
    return (
      <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 m-4 rounded">
            {error}
          </div>
        )}
        <FileUploader
          onMessagesLoaded={handleMessagesLoaded}
          onError={handleError}
          onLoadingChange={setLoading}
        />
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 m-4 rounded">
          {error}
        </div>
      )}
      
      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        messageCount={filteredMessages.length}
        totalCount={messages.length}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
        backupDate={backupDate}
        onMenuOpen={handleMenuOpen}
      />

      <SideMenu
        isOpen={isMenuOpen}
        onClose={handleMenuClose}
        onEjectBackup={handleEjectBackup}
      />

      <div className="flex-1 overflow-hidden">
        {filteredMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <p className="text-lg">No messages found</p>
              <p className="text-sm mt-2">Try a different search term</p>
            </div>
          </div>
        ) : viewMode === 'card' ? (
          <div className="h-full overflow-y-auto overflow-x-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
              {filteredMessages.map((message) => (
                <MessageCard 
                  key={message.id} 
                  message={message}
                  onDelete={handleDeleteMessage}
                  basePath={basePath}
                />
              ))}
            </div>
          </div>
        ) : (
          <List
            height={window.innerHeight - 80}
            itemCount={filteredMessages.length}
            itemSize={80}
            width="100%"
            className="bg-white dark:bg-gray-800"
            itemData={{ messages: filteredMessages, onDelete: handleDeleteMessage, basePath }}
          >
            {({ index, style, data }) => (
              <div style={style}>
                <MessageListItem 
                  message={data.messages[index]}
                  onDelete={data.onDelete}
                  basePath={data.basePath}
                />
              </div>
            )}
          </List>
        )}
      </div>
    </div>
  );
}

export default App;

