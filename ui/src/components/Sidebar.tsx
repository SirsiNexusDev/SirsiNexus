'use client';

import React from 'react';
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
  TrendingUp,
  Zap,
  ArrowRight,
} from 'lucide-react';

interface SidebarItem {
  label: string;
  icon: React.ElementType;
  path: string;
}

const sidebarItems: SidebarItem[] = [
  { label: 'Overview', icon: Home, path: '/' },
  { label: 'Demo Scenarios', icon: Play, path: '/demos' },
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
  const [wizardsExpanded, setWizardsExpanded] = React.useState(false);
  
  const migrationSteps = [
    { label: 'PLAN', path: '/migration/plan' },
    { label: 'SPEC', path: '/migration/spec' },
    { label: 'BUILD', path: '/migration/build' },
    { label: 'TRANSFER', path: '/migration/transfer' },
    { label: 'VALIDATE', path: '/migration/validate' },
    { label: 'OPTIMIZE', path: '/migration/optimize' },
    { label: 'SUPPORT', path: '/migration/support' },
  ];

  const wizards = [
    { label: 'Migration Wizard', icon: ArrowRight, path: '/migration', description: 'Complete infrastructure migration' },
    { label: 'Optimization Wizard', icon: TrendingUp, path: '/optimization', description: 'Cost and performance optimization' },
    { label: 'Auto-Scaling Wizard', icon: Zap, path: '/scaling', description: 'Configure intelligent auto-scaling' },
  ];

  return (
    <div className="sidebar-glass fixed left-0 top-20 h-[calc(100vh-5rem)] w-72 overflow-y-auto hidden lg:block">
      <nav className="p-6 space-y-2">
        {/* Wizards Section */}
        <div className="mb-6">
          <button
            onClick={() => setWizardsExpanded(!wizardsExpanded)}
            className="w-full flex items-center justify-between px-4 py-4 text-base font-bold rounded-xl transition-all text-white glass-ultra hover:glass-focus"
          >
            <div className="flex items-center">
              <div className="p-2 card-gradient rounded-lg mr-3">
                <Wand2 className="h-4 w-4 text-white" />
              </div>
              <span className="text-gradient">Wizards</span>
            </div>
            <div className={`transition-transform duration-200 ${wizardsExpanded ? 'rotate-180' : ''}`}>
              <ChevronDown className="h-5 w-5 text-gray-600" />
            </div>
          </button>
          
          {wizardsExpanded && (
            <div className="ml-4 mt-4 space-y-3 animate-fade-in">
              {wizards.map((wizard) => {
                const WizardIcon = wizard.icon;
                const isActive = activeItem === wizard.path;
                return (
                  <a
                    key={wizard.path}
                    href={wizard.path}
                    onClick={() => {
                      setActiveItem(wizard.path);
                      window.location.href = wizard.path;
                    }}
                    className={`flex items-start px-4 py-4 text-sm rounded-xl transition-all hover:scale-[1.02] hover:translate-x-1 active:scale-[0.98] ${
                      isActive
                        ? 'card-gradient text-white shadow-primary'
                        : 'card-professional hover-lift text-gray-700 hover:text-gray-900'
                    }`}
                  >
                <WizardIcon className={`mr-3 h-4 w-4 mt-0.5 flex-shrink-0 ${
                  isActive ? 'text-white' : 'text-gray-500'
                }`} />
                    <div>
                      <div className="font-bold text-base">{wizard.label}</div>
                      <div className={`text-xs mt-1 ${
                        isActive ? 'text-white/80' : 'text-gray-500'
                      }`}>{wizard.description}</div>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </div>

        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.path;
          const isMigrationSteps = item.path === '/steps';
          
          if (isMigrationSteps) {
            return (
              <div key={item.path}>
                <button
                  onClick={() => setMigrationStepsExpanded(!migrationStepsExpanded)}
                  className={`w-full flex items-center justify-between px-4 py-4 text-base font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] ${
                    isActive
                      ? 'card-gradient text-white shadow-primary'
                      : 'text-gray-700 card-professional hover-lift'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg mr-4 ${
                      isActive ? 'bg-white/20' : 'card-gradient'
                    }`}>
                      <Icon className={`h-4 w-4 ${
                        isActive ? 'text-white' : 'text-white'
                      }`} />
                    </div>
                    <span className={isActive ? 'text-white' : 'text-gradient'}>{item.label}</span>
                  </div>
                  <div className={`transition-transform duration-200 ${migrationStepsExpanded ? 'rotate-180' : ''}`}>
                    <ChevronDown className="h-4 w-4" />
                  </div>
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
              className={`flex items-center px-4 py-4 text-base font-bold rounded-xl transition-all hover:scale-[1.02] hover:translate-x-1 active:scale-[0.98] ${
                isActive
                  ? 'card-gradient text-white shadow-primary'
                  : 'text-gray-700 card-professional hover-lift'
              }`}
            >
              <div className={`p-2 rounded-lg mr-3 ${
                isActive ? 'bg-white/20' : 'card-gradient'
              }`}>
                <Icon className={`h-4 w-4 ${
                  isActive ? 'text-white' : 'text-white'
                }`} />
              </div>
              <span className={isActive ? 'text-white' : 'text-gradient'}>{item.label}</span>
            </a>
          );
        })}
        
        {/* Quick Actions */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="px-4 mb-4">
            <h3 className="text-sm font-black text-gradient uppercase tracking-wider">
              Quick Actions
            </h3>
          </div>
          <div className="space-y-3">
            <button 
              onClick={() => window.location.href = '/migration'}
              className="w-full flex items-center px-4 py-4 text-base text-white card-gradient rounded-xl shadow-primary hover-glow transition-all font-bold hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="p-2 bg-white/20 rounded-lg mr-3">
                <Play className="h-4 w-4 text-white" />
              </div>
              Start New Migration
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
};
