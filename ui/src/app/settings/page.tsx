'use client';

import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { useTheme } from 'next-themes';
import { useToast } from '@/components/ui/toast';
import {
  User, Shield, Key, Bell, Database, Users, Palette, Code, 
  Zap, Settings as SettingsIcon, Lock, Search, LogOut,
  Mail, Smartphone, Globe, Monitor, Activity, AlertTriangle,
  Download, Trash2, Eye, EyeOff, Save, Upload, Plus,
  Moon, Sun, Cpu, Network, Cloud, HardDrive, BarChart3,
  Bot, Workflow, Target, Gauge, FileText, Copy
} from 'lucide-react';

interface SettingsSection {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  description?: string;
}

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();
  
  const [activeSection, setActiveSection] = useState('account');
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const isDarkMode = theme === 'dark';

  // Settings state
  const [settings, setSettings] = useState({
    // Account
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    
    // AI Settings
    aiSuggestions: true,
    autoOptimization: false,
    aiInsights: true,
    predictiveAnalytics: true,
    aiAssistantEnabled: true,
    intelligentAlerting: true,
    autoResourceScaling: false,
    
    // Infrastructure
    autoBackup: true,
    monitoringEnabled: true,
    alertsEnabled: true,
    resourceOptimization: false,
    continuousDeployment: false,
    healthChecks: true,
    performanceTracking: true,
    
    // Teams
    shareData: true,
    allowCollaboration: true,
    publicProfile: false,
    teamNotifications: true,
    
    // Appearance
    compactMode: false,
    animationsEnabled: true,
    sidebarCollapsed: false,
    
    // Features
    betaFeatures: false,
    developerMode: false,
    debugMode: false,
    experimentalFeatures: false,
    
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    securityAlerts: true,
    deploymentAlerts: true,
    performanceAlerts: true,
    weeklyReports: false,
    maintenanceUpdates: true,
    
    // Security
    twoFactorEnabled: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    loginAlerts: true,
    
    // Privacy
    telemetryEnabled: true,
    crashReports: true,
    usageAnalytics: false,
    dataRetention: 90
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const settingsSections: SettingsSection[] = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'ai', label: 'AI', icon: Bot },
    { id: 'infrastructure', label: 'Infrastructure', icon: Database },
    { id: 'teams', label: 'Teams', icon: Users },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'features', label: 'Features', icon: Code },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'privacy', label: 'Privacy', icon: Lock },
    { id: 'about', label: 'About', icon: SettingsIcon }
  ];

  const filteredSections = settingsSections.filter(section =>
    section.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };
  
  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
  };

  const handleSaveSetting = (setting: string, successMessage: string) => {
    setTimeout(() => {
      showToast({
        type: 'success',
        title: 'Settings Updated',
        message: successMessage,
      });
    }, 300);
  };

  const handleLogout = () => {
    dispatch(logout());
    showToast({
      type: 'info',
      title: 'Logged Out',
      message: 'You have been successfully logged out',
    });
  };

  const handleDataExport = () => {
    const data = {
      account: { email: user?.email, role: user?.role },
      settings: settings,
      exportDate: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sirsi-nexus-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast({
      type: 'success',
      title: 'Data Exported',
      message: 'Your settings have been downloaded',
    });
  };

  const ToggleSwitch = ({ checked, onChange, disabled = false }: { 
    checked: boolean; 
    onChange: (value: boolean) => void;
    disabled?: boolean;
  }) => (
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
        disabled 
          ? 'bg-gray-200 cursor-not-allowed' 
          : checked 
            ? 'bg-blue-600' 
            : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-1'
        }`}
      />
    </button>
  );

  const themeClasses = {
    bg: isDarkMode ? 'bg-gray-900' : 'bg-gray-50',
    contentBg: isDarkMode ? 'bg-gray-800' : 'bg-white',
    sidebarBg: isDarkMode ? 'bg-gray-900' : 'bg-white',
    text: isDarkMode ? 'text-white' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
    input: isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900',
    sidebarActive: isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700',
    sidebarInactive: isDarkMode ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className={`min-h-screen ${themeClasses.bg} flex`}>
      {/* Sidebar */}
      <div className={`w-64 ${themeClasses.sidebarBg} ${themeClasses.border} border-r flex flex-col`}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className={`text-xl font-semibold ${themeClasses.text}`}>Settings</h1>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${themeClasses.textSecondary}`} />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg ${themeClasses.input} ${themeClasses.border} border focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 pb-4 space-y-1">
          {filteredSections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  isActive ? themeClasses.sidebarActive : themeClasses.sidebarInactive
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{section.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Content Header */}
        <div className={`${themeClasses.contentBg} ${themeClasses.border} border-b px-8 py-6`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-2xl font-semibold ${themeClasses.text} capitalize`}>
                {activeSection}
              </h2>
              <p className={themeClasses.textSecondary}>
                {user?.email}
              </p>
            </div>
            
            {activeSection === 'account' && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-8">
          <div className={`${themeClasses.contentBg} rounded-lg ${themeClasses.border} border`}>
            
            {/* Account Section */}
            {activeSection === 'account' && (
              <div className="p-6">
                <div className="space-y-6">
                  {/* User Profile Card */}
                  <div className={`p-6 rounded-lg ${themeClasses.border} border`}>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">
                          {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <h3 className={`text-xl font-semibold ${themeClasses.text}`}>
                          {user?.name || 'User'}
                        </h3>
                        <p className={`${themeClasses.textSecondary}`}>
                          {user?.email || 'user@example.com'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            user?.role === 'admin' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user?.role?.toUpperCase() || 'USER'}
                          </span>
                          <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                            Active
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Account Stats */}
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-center">
                        <div className={`text-lg font-semibold ${themeClasses.text}`}>
                          {user?.createdAt ? Math.floor((new Date().getTime() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0}
                        </div>
                        <div className={`text-xs ${themeClasses.textSecondary}`}>Days Active</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-lg font-semibold ${themeClasses.text}`}>12</div>
                        <div className={`text-xs ${themeClasses.textSecondary}`}>Projects</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-lg font-semibold ${themeClasses.text}`}>
                          {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Today'}
                        </div>
                        <div className={`text-xs ${themeClasses.textSecondary}`}>Last Login</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={settings.email}
                      onChange={(e) => handleSettingChange('email', e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg ${themeClasses.input} ${themeClasses.border} border focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="Enter your email address"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                      Username
                    </label>
                    <input
                      type="text"
                      value={user?.name || ''}
                      onChange={(e) => handleSettingChange('username', e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg ${themeClasses.input} ${themeClasses.border} border focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="Enter your username"
                    />
                  </div>

                  <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h3 className={`text-lg font-medium ${themeClasses.text} mb-4`}>Change Password</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.current ? 'text' : 'password'}
                            value={settings.currentPassword}
                            onChange={(e) => handleSettingChange('currentPassword', e.target.value)}
                            className={`w-full px-3 py-2 pr-10 rounded-lg ${themeClasses.input} ${themeClasses.border} border focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                            className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${themeClasses.textSecondary} hover:text-gray-600`}
                          >
                            {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.new ? 'text' : 'password'}
                            value={settings.newPassword}
                            onChange={(e) => handleSettingChange('newPassword', e.target.value)}
                            className={`w-full px-3 py-2 pr-10 rounded-lg ${themeClasses.input} ${themeClasses.border} border focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                            className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${themeClasses.textSecondary} hover:text-gray-600`}
                          >
                            {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                          Confirm Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.confirm ? 'text' : 'password'}
                            value={settings.confirmPassword}
                            onChange={(e) => handleSettingChange('confirmPassword', e.target.value)}
                            className={`w-full px-3 py-2 pr-10 rounded-lg ${themeClasses.input} ${themeClasses.border} border focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                            className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${themeClasses.textSecondary} hover:text-gray-600`}
                          >
                            {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6">
                    <h3 className={`text-lg font-medium ${themeClasses.text} mb-4`}>Version</h3>
                    <div className="flex items-center gap-2">
                      <Copy className={`h-4 w-4 ${themeClasses.textSecondary}`} />
                      <span className={`font-mono text-sm ${themeClasses.textSecondary}`}>
                        v0.2025.01.07.08.36.stable_02
                      </span>
                      <span className={`px-2 py-1 text-xs rounded ${isDarkMode ? 'bg-green-900 text-green-100' : 'bg-green-100 text-green-800'}`}>
                        Up to date
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AI Section */}
            {activeSection === 'ai' && (
              <div className="p-6">
                <div className="space-y-4">
                  {[
                    { key: 'aiSuggestions', label: 'AI Suggestions', description: 'Get intelligent recommendations for infrastructure optimization' },
                    { key: 'aiInsights', label: 'AI Insights', description: 'Receive automated insights about your infrastructure' },
                    { key: 'predictiveAnalytics', label: 'Predictive Analytics', description: 'Enable predictive analysis for performance and capacity planning' },
                    { key: 'aiAssistantEnabled', label: 'AI Assistant', description: 'Enable the AI assistant for interactive help' },
                    { key: 'intelligentAlerting', label: 'Intelligent Alerting', description: 'Use AI to reduce alert noise and prioritize critical issues' },
                    { key: 'autoOptimization', label: 'Auto Optimization', description: 'Allow AI to automatically optimize infrastructure configurations' },
                    { key: 'autoResourceScaling', label: 'Auto Resource Scaling', description: 'Automatically scale resources based on AI predictions' },
                  ].map(({ key, label, description }) => (
                    <div key={key} className="flex items-center justify-between py-3">
                      <div>
                        <h3 className={`font-medium ${themeClasses.text}`}>{label}</h3>
                        <p className={`text-sm ${themeClasses.textSecondary}`}>{description}</p>
                      </div>
                      <ToggleSwitch
                        checked={settings[key as keyof typeof settings] as boolean}
                        onChange={(value) => {
                          handleSettingChange(key, value);
                          handleSaveSetting(key, `${label} ${value ? 'enabled' : 'disabled'}`);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Infrastructure Section */}
            {activeSection === 'infrastructure' && (
              <div className="p-6">
                <div className="space-y-4">
                  {[
                    { key: 'monitoringEnabled', label: 'Infrastructure Monitoring', description: 'Monitor infrastructure health and performance' },
                    { key: 'alertsEnabled', label: 'Infrastructure Alerts', description: 'Receive alerts for infrastructure issues' },
                    { key: 'autoBackup', label: 'Automatic Backups', description: 'Automatically backup infrastructure configurations' },
                    { key: 'healthChecks', label: 'Health Checks', description: 'Continuously monitor service health' },
                    { key: 'performanceTracking', label: 'Performance Tracking', description: 'Track and analyze infrastructure performance metrics' },
                    { key: 'resourceOptimization', label: 'Resource Optimization', description: 'Optimize resource allocation and usage' },
                    { key: 'continuousDeployment', label: 'Continuous Deployment', description: 'Enable automated deployment pipelines' },
                  ].map(({ key, label, description }) => (
                    <div key={key} className="flex items-center justify-between py-3">
                      <div>
                        <h3 className={`font-medium ${themeClasses.text}`}>{label}</h3>
                        <p className={`text-sm ${themeClasses.textSecondary}`}>{description}</p>
                      </div>
                      <ToggleSwitch
                        checked={settings[key as keyof typeof settings] as boolean}
                        onChange={(value) => {
                          handleSettingChange(key, value);
                          handleSaveSetting(key, `${label} ${value ? 'enabled' : 'disabled'}`);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Teams Section */}
            {activeSection === 'teams' && (
              <div className="p-6">
                <div className="space-y-4">
                  {[
                    { key: 'allowCollaboration', label: 'Team Collaboration', description: 'Allow team members to collaborate on infrastructure projects' },
                    { key: 'shareData', label: 'Share Data', description: 'Share infrastructure data with team members' },
                    { key: 'teamNotifications', label: 'Team Notifications', description: 'Receive notifications about team activities' },
                    { key: 'publicProfile', label: 'Public Profile', description: 'Make your profile visible to other team members' },
                  ].map(({ key, label, description }) => (
                    <div key={key} className="flex items-center justify-between py-3">
                      <div>
                        <h3 className={`font-medium ${themeClasses.text}`}>{label}</h3>
                        <p className={`text-sm ${themeClasses.textSecondary}`}>{description}</p>
                      </div>
                      <ToggleSwitch
                        checked={settings[key as keyof typeof settings] as boolean}
                        onChange={(value) => {
                          handleSettingChange(key, value);
                          handleSaveSetting(key, `${label} ${value ? 'enabled' : 'disabled'}`);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Appearance Section */}
            {activeSection === 'appearance' && (
              <div className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className={`font-medium ${themeClasses.text} mb-3`}>Theme</h3>
                    <div className="space-y-2">
                      {[
                        { value: 'light', label: 'Light', icon: Sun },
                        { value: 'dark', label: 'Dark', icon: Moon },
                        { value: 'system', label: 'System', icon: Monitor },
                      ].map(({ value, label, icon: Icon }) => (
                        <label key={value} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name="theme"
                            value={value}
                            checked={theme === value}
                            onChange={(e) => {
                              handleThemeChange(e.target.value);
                              handleSaveSetting('theme', `Theme changed to ${label}`);
                            }}
                            className="sr-only"
                          />
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            theme === value 
                              ? 'border-blue-500 bg-blue-500' 
                              : isDarkMode ? 'border-gray-600' : 'border-gray-300'
                          }`}>
                            {theme === value && (
                              <div className="w-full h-full rounded-full bg-white scale-50" />
                            )}
                          </div>
                          <Icon className={`h-4 w-4 ${themeClasses.textSecondary}`} />
                          <span className={themeClasses.text}>{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      { key: 'compactMode', label: 'Compact Mode', description: 'Use a more compact interface layout' },
                      { key: 'animationsEnabled', label: 'Animations', description: 'Enable interface animations and transitions' },
                      { key: 'sidebarCollapsed', label: 'Collapse Sidebar', description: 'Start with collapsed sidebar by default' },
                    ].map(({ key, label, description }) => (
                      <div key={key} className="flex items-center justify-between py-3">
                        <div>
                          <h3 className={`font-medium ${themeClasses.text}`}>{label}</h3>
                          <p className={`text-sm ${themeClasses.textSecondary}`}>{description}</p>
                        </div>
                        <ToggleSwitch
                          checked={settings[key as keyof typeof settings] as boolean}
                          onChange={(value) => {
                            handleSettingChange(key, value);
                            handleSaveSetting(key, `${label} ${value ? 'enabled' : 'disabled'}`);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Features Section */}
            {activeSection === 'features' && (
              <div className="p-6">
                <div className="space-y-4">
                  {[
                    { key: 'betaFeatures', label: 'Beta Features', description: 'Enable access to beta features and functionality' },
                    { key: 'developerMode', label: 'Developer Mode', description: 'Enable developer tools and advanced options' },
                    { key: 'experimentalFeatures', label: 'Experimental Features', description: 'Enable experimental features (may be unstable)' },
                    { key: 'debugMode', label: 'Debug Mode', description: 'Enable debug logging and diagnostics' },
                  ].map(({ key, label, description }) => (
                    <div key={key} className="flex items-center justify-between py-3">
                      <div>
                        <h3 className={`font-medium ${themeClasses.text}`}>{label}</h3>
                        <p className={`text-sm ${themeClasses.textSecondary}`}>{description}</p>
                      </div>
                      <ToggleSwitch
                        checked={settings[key as keyof typeof settings] as boolean}
                        onChange={(value) => {
                          handleSettingChange(key, value);
                          handleSaveSetting(key, `${label} ${value ? 'enabled' : 'disabled'}`);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notifications Section */}
            {activeSection === 'notifications' && (
              <div className="p-6">
                <div className="space-y-4">
                  {[
                    { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive notifications via email' },
                    { key: 'pushNotifications', label: 'Push Notifications', description: 'Receive browser push notifications' },
                    { key: 'securityAlerts', label: 'Security Alerts', description: 'Important security-related notifications' },
                    { key: 'deploymentAlerts', label: 'Deployment Alerts', description: 'Notifications about deployment status' },
                    { key: 'performanceAlerts', label: 'Performance Alerts', description: 'Alerts about performance issues' },
                    { key: 'maintenanceUpdates', label: 'Maintenance Updates', description: 'System maintenance and update notifications' },
                    { key: 'weeklyReports', label: 'Weekly Reports', description: 'Weekly summary reports' },
                  ].map(({ key, label, description }) => (
                    <div key={key} className="flex items-center justify-between py-3">
                      <div>
                        <h3 className={`font-medium ${themeClasses.text}`}>{label}</h3>
                        <p className={`text-sm ${themeClasses.textSecondary}`}>{description}</p>
                      </div>
                      <ToggleSwitch
                        checked={settings[key as keyof typeof settings] as boolean}
                        onChange={(value) => {
                          handleSettingChange(key, value);
                          handleSaveSetting(key, `${label} ${value ? 'enabled' : 'disabled'}`);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Security Section */}
            {activeSection === 'security' && (
              <div className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <h3 className={`font-medium ${themeClasses.text}`}>Two-Factor Authentication</h3>
                      <p className={`text-sm ${themeClasses.textSecondary}`}>Add an extra layer of security to your account</p>
                    </div>
                    <button 
                      onClick={() => {
                        const newValue = !settings.twoFactorEnabled;
                        handleSettingChange('twoFactorEnabled', newValue);
                        handleSaveSetting('twoFactorEnabled', `Two-factor authentication ${newValue ? 'enabled' : 'disabled'}`);
                      }}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        settings.twoFactorEnabled 
                          ? 'bg-red-600 hover:bg-red-700 text-white' 
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      {settings.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                    </button>
                  </div>

                  <div className="space-y-4">
                    {[
                      { key: 'loginAlerts', label: 'Login Alerts', description: 'Get notified of new sign-ins' },
                    ].map(({ key, label, description }) => (
                      <div key={key} className="flex items-center justify-between py-3">
                        <div>
                          <h3 className={`font-medium ${themeClasses.text}`}>{label}</h3>
                          <p className={`text-sm ${themeClasses.textSecondary}`}>{description}</p>
                        </div>
                        <ToggleSwitch
                          checked={settings[key as keyof typeof settings] as boolean}
                          onChange={(value) => {
                            handleSettingChange(key, value);
                            handleSaveSetting(key, `${label} ${value ? 'enabled' : 'disabled'}`);
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                        Session Timeout (minutes)
                      </label>
                      <select
                        value={settings.sessionTimeout}
                        onChange={(e) => {
                          handleSettingChange('sessionTimeout', parseInt(e.target.value));
                          handleSaveSetting('sessionTimeout', `Session timeout set to ${e.target.value} minutes`);
                        }}
                        className={`w-full px-3 py-2 rounded-lg ${themeClasses.input} ${themeClasses.border} border focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      >
                        <option value={15}>15 minutes</option>
                        <option value={30}>30 minutes</option>
                        <option value={60}>1 hour</option>
                        <option value={240}>4 hours</option>
                        <option value={480}>8 hours</option>
                      </select>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                        Password Expiry (days)
                      </label>
                      <select
                        value={settings.passwordExpiry}
                        onChange={(e) => {
                          handleSettingChange('passwordExpiry', parseInt(e.target.value));
                          handleSaveSetting('passwordExpiry', `Password expiry set to ${e.target.value} days`);
                        }}
                        className={`w-full px-3 py-2 rounded-lg ${themeClasses.input} ${themeClasses.border} border focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      >
                        <option value={30}>30 days</option>
                        <option value={60}>60 days</option>
                        <option value={90}>90 days</option>
                        <option value={180}>180 days</option>
                        <option value={0}>Never</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy Section */}
            {activeSection === 'privacy' && (
              <div className="p-6">
                <div className="space-y-6">
                  <div className="space-y-4">
                    {[
                      { key: 'telemetryEnabled', label: 'Telemetry', description: 'Share anonymous usage data to help improve SirsiNexus' },
                      { key: 'crashReports', label: 'Crash Reports', description: 'Automatically send crash reports to help improve stability' },
                      { key: 'usageAnalytics', label: 'Usage Analytics', description: 'Share usage patterns to help improve features' },
                    ].map(({ key, label, description }) => (
                      <div key={key} className="flex items-center justify-between py-3">
                        <div>
                          <h3 className={`font-medium ${themeClasses.text}`}>{label}</h3>
                          <p className={`text-sm ${themeClasses.textSecondary}`}>{description}</p>
                        </div>
                        <ToggleSwitch
                          checked={settings[key as keyof typeof settings] as boolean}
                          onChange={(value) => {
                            handleSettingChange(key, value);
                            handleSaveSetting(key, `${label} ${value ? 'enabled' : 'disabled'}`);
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                      Data Retention (days)
                    </label>
                    <select
                      value={settings.dataRetention}
                      onChange={(e) => {
                        handleSettingChange('dataRetention', parseInt(e.target.value));
                        handleSaveSetting('dataRetention', `Data retention set to ${e.target.value} days`);
                      }}
                      className={`w-full max-w-xs px-3 py-2 rounded-lg ${themeClasses.input} ${themeClasses.border} border focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    >
                      <option value={30}>30 days</option>
                      <option value={60}>60 days</option>
                      <option value={90}>90 days</option>
                      <option value={180}>180 days</option>
                      <option value={365}>1 year</option>
                    </select>
                  </div>

                  <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className={`font-medium ${themeClasses.text}`}>Export Data</h3>
                        <p className={`text-sm ${themeClasses.textSecondary}`}>Download all your account data and settings</p>
                      </div>
                      <button
                        onClick={handleDataExport}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        Export Data
                      </button>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-red-200 dark:border-red-800">
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                        <div className="flex-1">
                          <h3 className="font-medium text-red-900 dark:text-red-100">Delete Account</h3>
                          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                            Permanently delete your account and all associated data. This action cannot be undone.
                          </p>
                          <button className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                            Delete Account
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* About Section */}
            {activeSection === 'about' && (
              <div className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className={`text-lg font-medium ${themeClasses.text} mb-4`}>About SirsiNexus</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={themeClasses.textSecondary}>Version</span>
                        <div className="flex items-center gap-2">
                          <span className={`font-mono text-sm ${themeClasses.text}`}>v0.2025.01.07.08.36.stable_02</span>
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 rounded">
                            Up to date
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={themeClasses.textSecondary}>Check for updates</span>
                        <button className="text-blue-600 dark:text-blue-400 hover:underline">
                          Check now
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h3 className={`text-lg font-medium ${themeClasses.text} mb-4`}>Support</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={themeClasses.textSecondary}>Documentation</span>
                        <button className="text-blue-600 dark:text-blue-400 hover:underline">
                          View docs
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={themeClasses.textSecondary}>Contact support</span>
                        <button className="text-blue-600 dark:text-blue-400 hover:underline">
                          Get help
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={themeClasses.textSecondary}>Report a bug</span>
                        <button className="text-blue-600 dark:text-blue-400 hover:underline">
                          Report issue
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h3 className={`text-lg font-medium ${themeClasses.text} mb-4`}>Legal</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={themeClasses.textSecondary}>Terms of Service</span>
                        <button className="text-blue-600 dark:text-blue-400 hover:underline">
                          View terms
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={themeClasses.textSecondary}>Privacy Policy</span>
                        <button className="text-blue-600 dark:text-blue-400 hover:underline">
                          View policy
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
