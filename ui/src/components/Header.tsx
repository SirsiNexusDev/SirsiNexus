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
    <header className="nav-glass sticky top-0 z-50">
      <div className="container-professional">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center gap-6">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-display text-3xl font-black tracking-tight slide-up"
            >
              Sirsi Nexus
            </motion.div>
            <div className="status-success text-xs px-3 py-1">
              v0.3.2
            </div>
          </div>

          <div className="flex items-center gap-6">
          <motion.button
            onClick={handleThemeToggle}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="card-professional p-3 rounded-xl hover-glow transition-all"
            title={`Current: ${theme} mode - Click to cycle`}
          >
            {theme === 'dark' ? (
              <Sun className="h-6 w-6 text-amber-500" />
            ) : theme === 'light' ? (
              <Moon className="h-6 w-6 text-purple-500" />
            ) : (
              <Monitor className="h-6 w-6 text-blue-500" />
            )}
          </motion.button>

          <NotificationDropdown />

          <div className="relative">
            <motion.button
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="card-professional p-3 rounded-xl hover-glow transition-all"
            >
              <Settings className="h-6 w-6 text-gray-600" />
            </motion.button>
            <SettingsDropDown 
              isOpen={showSettingsMenu} 
              onClose={() => setShowSettingsMenu(false)} 
            />
          </div>

          <div className="relative">
            <motion.button
              onClick={() => setShowUserMenu(!showUserMenu)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="card-glass flex items-center gap-4 rounded-2xl px-4 py-3 hover-glow transition-all backdrop-blur"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl card-gradient text-white shadow-primary">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-full w-full rounded-xl object-cover"
                  />
                ) : (
                  <User className="h-6 w-6" />
                )}
              </div>
              <span className="text-base font-bold text-gray-900">
                {user?.name || 'Guest User'}
              </span>
              <ChevronDown className="h-5 w-5 text-gray-600" />
            </motion.button>

            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute right-0 mt-4 w-56 card-professional p-2 shadow-xl"
              >
                <motion.button
                  onClick={handleLogout}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex w-full items-center px-4 py-3 text-base text-red-600 font-semibold hover:card-professional hover:text-red-700 rounded-lg transition-all"
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Sign Out
                </motion.button>
              </motion.div>
            )}
          </div>
          </div>
        </div>
      </div>
    </header>
  );
};
