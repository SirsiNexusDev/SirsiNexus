'use client';

import React, { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store';
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
  Search,
  Command,
} from 'lucide-react';
import { NotificationDropdown } from './NotificationDropdown';
import { SettingsDropDown } from './SettingsDropDown';
import { GlobalSearch } from './GlobalSearch';
import Image from 'next/image';

export const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const { theme, setTheme } = useTheme();
  const user = useAppSelector((state) => state.auth.user);
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = React.useState(false);
  const [showSearch, setShowSearch] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Global search shortcut
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setShowSearch(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
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
  };

  if (!mounted) {
    return null;
  }

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <header className="bg-white/95 backdrop-blur-sm sticky top-0 z-50 border-b border-slate-200">
      <div className="max-w-full mx-auto px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                <span className="text-sm font-bold text-white">S</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-slate-900">
                  SirsiNexus
                </h1>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    v0.4.2
                  </span>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                    <span className="text-xs text-slate-600">Live</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-8">
            <button
              onClick={() => setShowSearch(true)}
              className="w-full flex items-center gap-3 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-left"
            >
              <Search className="h-4 w-4 text-slate-500" />
              <span className="text-sm text-slate-500 flex-1">Search...</span>
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Command className="h-3 w-3" />
                <span>K</span>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleThemeToggle}
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title={`Current: ${theme} mode - Click to cycle`}
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : theme === 'light' ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Monitor className="h-4 w-4" />
              )}
            </button>

            <NotificationDropdown />

            <div className="relative">
              <button
                onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Settings className="h-4 w-4" />
              </button>
              <SettingsDropDown 
                isOpen={showSettingsMenu} 
                onClose={() => setShowSettingsMenu(false)} 
              />
            </div>

            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center">
                  {user?.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.name || 'User avatar'}
                      width={24}
                      height={24}
                      className="h-full w-full rounded-full object-cover"
                      priority
                    />
                  ) : (
                    <User className="h-3 w-3 text-slate-600" />
                  )}
                </div>
                <span className="text-sm text-slate-700">
                  {user?.name || 'Guest'}
                </span>
                <ChevronDown className="h-3 w-3 text-slate-500" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-sm p-1">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
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
      
      {/* Global Search Modal */}
      <GlobalSearch isOpen={showSearch} onClose={() => setShowSearch(false)} />
    </header>
  );
};
