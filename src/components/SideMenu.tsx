import React from 'react';
import { X, LogOut } from 'lucide-react';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onEjectBackup: () => void;
}

export const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose, onEjectBackup }) => {
  const handleEject = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // In Tauri, window.confirm returns a Promise, so we need to await it
    const confirmed = await window.confirm('Are you sure you want to exit this backup? This will return you to the upload screen.');
    
    // Only proceed if user clicked OK/Yes
    if (confirmed) {
      onClose();
      onEjectBackup();
    }
    // If user clicked Cancel/No, do nothing and stay in current state
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Side Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white dark:bg-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Menu</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
              title="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Menu Items */}
          <div className="flex-1 p-4">
            <button
              onClick={handleEject}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Eject Backup</span>
            </button>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Telegram Chat Viewer v1.0
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

