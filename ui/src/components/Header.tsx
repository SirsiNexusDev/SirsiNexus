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
import { motion } from 'framer-motion';

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
    <header className="nav-glass gradient-animated text-slate-800 shadow-intense sticky top-0 z-50">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="text-2xl font-black tracking-tight"
            style={{
              background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 50%, #4ade80 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
            }}
          >
            Sirsi Nexus
          </motion.div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleThemeToggle}
            className="btn-modern rounded-full p-2 hover:scale-105 transition-all"
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
              className="btn-modern rounded-full p-2 hover:scale-105 transition-all"
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
              className="glass-strong flex items-center gap-2 rounded-full px-3 py-2 hover:scale-105 transition-all shadow-glow"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-primary text-white">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <User className="h-5 w-5" />
                )}
              </div>
              <span className="text-sm font-bold text-slate-900">
                {user?.name || 'Guest User'}
              </span>
              <ChevronDown className="h-4 w-4 text-slate-800" />
            </button>

            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-48 rounded-lg border border-border bg-background py-1 shadow-lg"
              >
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center px-4 py-2 text-sm text-slate-800 font-medium hover:bg-gray-100"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
