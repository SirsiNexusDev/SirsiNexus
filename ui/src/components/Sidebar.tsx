'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Home,
  Wand2,
  KeyRound,
  Folder,
  GitBranch,
  BarChart,
  Shield,
  Terminal,
  HelpCircle,
  Play,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

interface SidebarItem {
  label: string;
  icon: React.ElementType;
  path: string;
}

const sidebarItems: SidebarItem[] = [
  { label: 'Overview', icon: Home, path: '/' },
  { label: 'Demo Scenarios', icon: Play, path: '/demos' },
  { label: 'Migration Wizard', icon: Wand2, path: '/wizard' },
  { label: 'Credential Management', icon: KeyRound, path: '/credentials' },
  { label: 'Projects', icon: Folder, path: '/projects' },
  { label: 'Migration Steps', icon: GitBranch, path: '/steps' },
  { label: 'Analytics & Reports', icon: BarChart, path: '/analytics' },
  { label: 'Security', icon: Shield, path: '/security' },
  { label: 'Scripting Console', icon: Terminal, path: '/console' },
  { label: 'Help & Tutorials', icon: HelpCircle, path: '/help' },
];

export const Sidebar: React.FC = () => {
  const [activeItem, setActiveItem] = React.useState('/');
  const [migrationStepsExpanded, setMigrationStepsExpanded] = React.useState(false);
  
  const migrationSteps = [
    { label: 'PLAN', path: '/migration/plan' },
    { label: 'SPEC', path: '/migration/spec' },
    { label: 'BUILD', path: '/migration/build' },
    { label: 'TRANSFER', path: '/migration/transfer' },
    { label: 'VALIDATE', path: '/migration/validate' },
    { label: 'OPTIMIZE', path: '/migration/optimize' },
    { label: 'SUPPORT', path: '/migration/support' },
  ];

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className="sidebar-glass fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 overflow-y-auto hidden lg:block"
    >
      <nav className="p-4 space-y-1">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.path;
          const isMigrationSteps = item.path === '/steps';
          
          if (isMigrationSteps) {
            return (
              <div key={item.path}>
                <button
                  onClick={() => setMigrationStepsExpanded(!migrationStepsExpanded)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                    isActive
                      ? 'card-3d shadow-glow'
                      : 'text-slate-700 hover:card-3d hover:shadow-glow hover:scale-105'
                  }`}
                >
                  <div className="flex items-center">
                    <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-primary' : 'text-slate-500'}`} />
                    {item.label}
                  </div>
                  {migrationStepsExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                
                {migrationStepsExpanded && (
                  <div className="ml-6 mt-2 space-y-1">
                    {migrationSteps.map((step, index) => {
                      const isCompleted = index < 2; // Mock some as completed
                      const isCurrent = index === 2; // Mock current step
                      return (
                        <button
                          key={step.path}
                          onClick={() => window.location.href = step.path}
                          className={`flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                            isCurrent
                              ? 'bg-blue-50 text-blue-700'
                              : isCompleted
                              ? 'text-green-700 bg-green-50'
                              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <span>{step.label}</span>
                          <span className={`px-2 py-1 text-xs rounded ${
                            isCurrent
                              ? 'bg-blue-100 text-blue-700'
                              : isCompleted
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            {isCurrent ? 'CURRENT' : isCompleted ? 'DONE' : 'TODO'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }
          
          return (
            <a
              key={item.path}
              href={item.path}
              onClick={() => {
                setActiveItem(item.path);
                window.location.href = item.path;
              }}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                isActive
                  ? 'card-3d shadow-glow scale-105'
                  : 'text-slate-700 hover:card-3d hover:shadow-glow hover:scale-105'
              }`}
            >
              <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-primary' : 'text-slate-500'}`} />
              {item.label}
            </a>
          );
        })}
        
        {/* Quick Actions */}
        <div className="mt-8 pt-4 border-t border-gray-200">
          <div className="px-3 mb-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Quick Actions
            </h3>
          </div>
          <div className="space-y-1">
            <button 
              onClick={() => window.location.href = '/wizard'}
              className="w-full flex items-center px-3 py-2 text-sm text-slate-700 hover:card-3d hover:shadow-glow rounded-lg transition-all"
            >
              <Play className="mr-3 h-4 w-4 text-gray-400" />
              Start New Migration
            </button>
          </div>
        </div>
      </nav>
    </motion.div>
  );
};
