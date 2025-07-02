'use client';

import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store';
import { toggleTheme } from '@/store/slices/uiSlice';
import { logout } from '@/store/slices/authSlice';
import { useTheme } from 'next-themes';
import {
  Bell,
  Settings,
  User,
  Sun,
  Moon,
  ChevronDown,
  LogOut,
  Monitor,
} from 'lucide-react';
import { NotificationDropdown } from './NotificationDropdown';
import { SettingsDropDown } from './SettingsDropDown';

export const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const { theme, setTheme } = useTheme();
  const user = useAppSelector((state) => state.auth.user);
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeToggle = () => {
    let newTheme: string;
    if (theme === 'light') {
      newTheme = 'dark';
    } else if (theme === 'dark') {
      newTheme = 'system';
    } else {
      newTheme = 'light';
    }
    setTheme(newTheme);
    dispatch(toggleTheme());
  };

  if (!mounted) {
    return null;
  }

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-900">
              Sirsi Nexus
            </h1>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              v0.3.2
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleThemeToggle}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
              title={`Current: ${theme} mode - Click to cycle`}
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : theme === 'light' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Monitor className="h-5 w-5" />
              )}
            </button>

          <NotificationDropdown />

          <div className="relative">
            <button
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
            >
              <Settings className="h-5 w-5" />
            </button>
            <SettingsDropDown 
              isOpen={showSettingsMenu} 
              onClose={() => setShowSettingsMenu(false)} 
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
            >
              <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-full w-full rounded-lg object-cover"
                  />
                ) : (
                  <User className="h-4 w-4 text-teal-600" />
                )}
              </div>
              <span className="text-sm font-medium">
                {user?.name || 'Guest User'}
              </span>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg p-1">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-all"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
          </div>
        </div>
      </div>
    </header>
  );
};
