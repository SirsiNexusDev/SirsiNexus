'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  User, 
  Lock, 
  Bell, 
  Monitor, 
  Moon, 
  Sun,
  X
} from 'lucide-react';

interface SettingsDropDownProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsDropDown: React.FC<SettingsDropDownProps> = ({ isOpen, onClose }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={onClose} 
          />
          
          {/* Dropdown */}
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-20"
          >
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Settings</h3>
            </div>

            <div className="p-4 space-y-4">
              {/* Theme Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {darkMode ? <Moon className="h-4 w-4 text-gray-500" /> : <Sun className="h-4 w-4 text-gray-500" />}
                  <span className="text-sm text-gray-700">Dark Mode</span>
                </div>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    darkMode ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      darkMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Notifications Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Notifications</span>
                </div>
                <button
                  onClick={() => setNotifications(!notifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Account Settings */}
              <button 
                onClick={() => {
                  onClose();
                  if (window.location.pathname !== '/settings') {
                    window.history.pushState({}, '', '/settings');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-800 font-medium hover:bg-gray-50 rounded-lg"
              >
                <User className="h-4 w-4 text-slate-600" />
                Account Settings
              </button>

              {/* Security */}
              <button 
                onClick={() => {
                  onClose();
                  if (window.location.pathname !== '/settings') {
                    window.history.pushState({}, '', '/settings');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-800 font-medium hover:bg-gray-50 rounded-lg"
              >
                <Lock className="h-4 w-4 text-slate-600" />
                Security & Privacy
              </button>

              {/* Display */}
              <button 
                onClick={() => {
                  onClose();
                  if (window.location.pathname !== '/settings') {
                    window.history.pushState({}, '', '/settings');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-800 font-medium hover:bg-gray-50 rounded-lg"
              >
                <Monitor className="h-4 w-4 text-slate-600" />
                Display Settings
              </button>
            </div>

            <div className="p-3 border-t border-gray-200">
              <button 
                onClick={() => {
                  onClose();
                  if (window.location.pathname !== '/settings') {
                    window.history.pushState({}, '', '/settings');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }
                }}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                All Settings
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
