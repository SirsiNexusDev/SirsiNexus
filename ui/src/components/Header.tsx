'use client';

import React, { useEffect, useState } from 'react';
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
  Search,
  Command,
} from 'lucide-react';
import { NotificationDropdown } from './NotificationDropdown';
import { SettingsDropDown } from './SettingsDropDown';
import Image from 'next/image';

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
    <header className="glass-strong sticky top-0 z-50 border-b border-white/20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-xl font-black text-white">S</span>
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-800">
                  Sirsi Nexus
                </h1>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600 bg-gradient-to-r from-emerald-100 to-teal-100 px-3 py-1 rounded-full border border-emerald-200">
                    v0.3.2
                  </span>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-xs font-semibold text-emerald-600">Live</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleThemeToggle}
              className="p-2 text-slate-600 hover:text-orange-600 hover:bg-orange-500/10 rounded border border-transparent hover:border-orange-500/20 transition-all"
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
              className="p-2 text-slate-600 hover:text-orange-600 hover:bg-orange-500/10 rounded border border-transparent hover:border-orange-500/20 transition-all"
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
              className="flex items-center gap-3 p-2 text-slate-700 hover:bg-white/20 rounded-lg transition-all"
            >
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                {user?.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.name || 'User avatar'}
                    width={32}
                    height={32}
                    className="h-full w-full rounded-lg object-cover"
                    priority
                  />
                ) : (
                  <User className="h-4 w-4 text-orange-600" />
                )}
              </div>
              <span className="text-sm font-medium">
                {user?.name || 'Guest User'}
              </span>
              <ChevronDown className="h-4 w-4 text-slate-600" />
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
