'use client';

import React, { useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
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
  TrendingUp,
  Zap,
  ArrowRight,
  Sparkles,
  Rocket,
  Activity,
  Crown,
  Brain,
  Code,
  Send,
  Command,
} from 'lucide-react';

interface SidebarItem {
  label: string;
  icon: React.ElementType;
  path: string;
}

interface SidebarProps {
  aiAssistant?: boolean;
  isDarkMode?: boolean;
  onNavigateToInfrastructure?: () => void;
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

const sidebarSections: SidebarSection[] = [
  {
    title: 'Build & Deploy',
    items: [
      { label: 'Infrastructure Builder', icon: Code, path: '/infrastructure' },
      { label: 'Projects', icon: Folder, path: '/projects' },
      { label: 'Migration Steps', icon: GitBranch, path: '/steps' },
      { label: 'Credentials', icon: KeyRound, path: '/credentials' },
    ]
  },
  {
    title: 'AI & Automation',
    items: [
      { label: 'Agent Management', icon: Sparkles, path: '/agents' },
      { label: 'AI Orchestration', icon: Brain, path: '/ai-orchestration' },
      { label: 'SIRSI HYPERVISOR', icon: Crown, path: '/sirsi-hypervisor' },
    ]
  },
  {
    title: 'Analytics',
    items: [
      { label: 'Reports', icon: BarChart, path: '/analytics' },
      { label: 'Enhanced Analytics', icon: TrendingUp, path: '/analytics/enhanced' },
      { label: 'Observability', icon: Activity, path: '/observability' },
    ]
  },
  {
    title: 'Tools',
    items: [
      { label: 'Scripting Console', icon: Terminal, path: '/console' },
      { label: 'Security', icon: Shield, path: '/security' },
      { label: 'Demo Scenarios', icon: Play, path: '/demos' },
      { label: 'Help & Tutorials', icon: HelpCircle, path: '/help' },
      { label: 'Backend Tests', icon: Rocket, path: '/test-backend' },
    ]
  }
];

export const Sidebar: React.FC<SidebarProps> = ({ 
  aiAssistant = false,
  isDarkMode = false,
  onNavigateToInfrastructure
}) => {
  const pathname = usePathname();
  const [migrationStepsExpanded, setMigrationStepsExpanded] = React.useState(false);
  const [wizardsExpanded, setWizardsExpanded] = React.useState(true);
  const [nlpQuery, setNlpQuery] = useState('');
  const nlpInputRef = useRef<HTMLTextAreaElement>(null);
  
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
    { 
      label: 'Migration Wizard', 
      icon: ArrowRight, 
      path: '/migration', 
      description: 'Complete infrastructure migration',
      gradient: 'from-blue-500 to-purple-600'
    },
    { 
      label: 'Optimization Wizard', 
      icon: TrendingUp, 
      path: '/optimization', 
      description: 'Cost and performance optimization',
      gradient: 'from-emerald-500 to-teal-600'
    },
    { 
      label: 'Auto-Scaling Wizard', 
      icon: Zap, 
      path: '/scaling', 
      description: 'Configure intelligent auto-scaling',
      gradient: 'from-amber-500 to-orange-600'
    },
  ];

  const handleNlpSubmit = () => {
    if (!nlpQuery.trim()) return;
    
    if (onNavigateToInfrastructure) {
      onNavigateToInfrastructure();
    } else {
      window.location.href = `/infrastructure?query=${encodeURIComponent(nlpQuery)}`;
    }
    setNlpQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleNlpSubmit();
    }
  };

  // Centralized styling for theme consistency
  const getActiveStyles = (isActive: boolean) => isActive
    ? (isDarkMode 
      ? 'bg-purple-100 text-purple-700 border border-purple-200'
      : 'bg-emerald-100 text-emerald-700 border border-emerald-200')
    : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900';

  const getIconBg = (isActive: boolean) => isActive
    ? (isDarkMode ? 'bg-purple-200' : 'bg-emerald-200')
    : 'bg-slate-200';

  const themeClasses = isDarkMode ? {
    bg: 'bg-slate-900/95',
    border: 'border-slate-700',
    text: 'text-slate-100',
    textSecondary: 'text-slate-400',
    input: 'bg-slate-800 border-slate-600 text-slate-100',
    button: 'bg-purple-600 hover:bg-purple-700'
  } : {
    bg: 'bg-white/95',
    border: 'border-slate-200',
    text: 'text-slate-900',
    textSecondary: 'text-slate-600',
    input: 'bg-white border-slate-200 text-slate-900',
    button: 'bg-emerald-600 hover:bg-emerald-700'
  };

  return (
    <div className={`${themeClasses.bg} backdrop-blur-sm fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 overflow-y-auto hidden lg:block border-r ${themeClasses.border}`}>
      <nav className="p-4 space-y-6">
        {/* Natural Language AI Assistant */}
        <div className="mb-6">
          <div className="mb-3">
            <label className={`block text-xs font-semibold ${themeClasses.text} mb-2 flex items-center gap-2`}>
              <Sparkles className="h-3 w-3" />
              Sirsi AI Assistant
            </label>
            <div className="relative">
              <textarea
                ref={nlpInputRef}
                value={nlpQuery}
                onChange={(e) => setNlpQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything or describe what you need..."
                className={`w-full p-3 text-sm rounded-lg resize-none min-h-[60px] max-h-[120px] ${themeClasses.input} placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
              />
              <button
                onClick={handleNlpSubmit}
                disabled={!nlpQuery.trim()}
                className={`absolute bottom-2 right-2 p-1.5 ${themeClasses.button} text-white rounded-md text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Send className="h-3 w-3" />
              </button>
            </div>
            <p className={`text-xs ${themeClasses.textSecondary} mt-1 flex items-center gap-1`}>
              <Command className="h-3 w-3" />
              <span>Cmd+Enter to send</span>
            </p>
          </div>
        </div>

        {/* Overview Section */}
        <div className="mb-6">
          <button
            onClick={() => window.location.pathname !== '/' ? window.location.href = '/' : null}
            className={`w-full p-3 rounded-lg transition-all duration-200 group text-left ${getActiveStyles(pathname === '/')}`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getIconBg(pathname === '/')}`}>
                <Home className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-medium">Overview</h2>
                <p className={`text-xs ${themeClasses.textSecondary}`}>Dashboard and insights</p>
              </div>
            </div>
          </button>
        </div>

        {/* Smart Wizards Section */}
        <div className="mb-6">
          <button
            onClick={() => setWizardsExpanded(!wizardsExpanded)}
            className={`w-full p-3 rounded-lg transition-colors mb-3 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-50 hover:bg-slate-100'}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-purple-100' : 'bg-indigo-100'}`}>
                  <Wand2 className={`h-3 w-3 ${isDarkMode ? 'text-purple-600' : 'text-indigo-600'}`} />
                </div>
                <span className={`text-sm font-medium ${themeClasses.text}`}>Smart Wizards</span>
              </div>
              <ChevronDown className={`h-3 w-3 ${themeClasses.textSecondary} transition-transform ${wizardsExpanded ? 'rotate-180' : ''}`} />
            </div>
          </button>
          
          {wizardsExpanded && (
            <div className="space-y-2 fade-in">
              {wizards.map((wizard) => {
                const WizardIcon = wizard.icon;
                const isActive = pathname === wizard.path;
                return (
                  <button
                    key={wizard.path}
                    onClick={() => window.location.href = wizard.path}
                    className={`w-full p-3 rounded-lg transition-all duration-200 group text-left ${getActiveStyles(isActive)}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${getIconBg(isActive)}`}>
                        <WizardIcon className="h-3 w-3 text-slate-600" />
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-medium">{wizard.label}</div>
                        <div className={`text-xs ${themeClasses.textSecondary} mt-0.5`}>
                          {wizard.description}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Navigation Sections */}
        <div className="space-y-6">
          {sidebarSections.map((section) => (
            <div key={section.title}>
              <h3 className={`text-xs font-semibold ${themeClasses.textSecondary} uppercase tracking-wider mb-3`}>
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.path;
                  const isMigrationSteps = item.path === '/steps';
                  
                  if (isMigrationSteps) {
                    return (
                      <div key={item.path} className="space-y-1">
                        <button
                          onClick={() => setMigrationStepsExpanded(!migrationStepsExpanded)}
                          className={`w-full p-2 rounded-lg transition-all duration-200 group text-left ${getActiveStyles(isActive)}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              <span className="text-sm font-medium">{item.label}</span>
                            </div>
                            <ChevronDown className={`h-3 w-3 transition-transform ${migrationStepsExpanded ? 'rotate-180' : ''}`} />
                          </div>
                        </button>
                        
                        {migrationStepsExpanded && (
                          <div className="ml-6 space-y-1 fade-in">
                            {migrationSteps.map((step, index) => {
                              const isCompleted = index < 2;
                              const isCurrent = index === 2;
                              return (
                                <button
                                  key={step.path}
                                  onClick={() => window.location.href = step.path}
                                  className={`w-full flex items-center justify-between p-2 rounded-lg text-sm transition-all ${
                                    isCurrent
                                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                      : isCompleted
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                  }`}
                                >
                                  <span>{step.label}</span>
                                  <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                                    isCurrent
                                      ? 'bg-blue-100 text-blue-700'
                                      : isCompleted
                                      ? 'bg-emerald-100 text-emerald-700'
                                      : 'bg-slate-100 text-slate-500'
                                  }`}>
                                    {isCurrent ? 'ACTIVE' : isCompleted ? 'DONE' : 'TODO'}
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
                    <button
                      key={item.path}
                      onClick={() => window.location.href = item.path}
                      className={`w-full p-2 rounded-lg transition-all duration-200 group text-left ${getActiveStyles(isActive)}`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        
        {/* Quick Action CTA */}
        <div className={`mt-8 pt-6 border-t ${themeClasses.border}`}>
          <button 
            onClick={() => window.location.href = '/infrastructure'}
            className={`w-full ${themeClasses.button} text-white rounded-lg p-3 transition-colors group mb-3`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-purple-500' : 'bg-emerald-500'}`}>
                <Code className="h-3 w-3 text-white" />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium">Infrastructure Builder</div>
                <div className={`text-xs ${isDarkMode ? 'text-purple-100' : 'text-emerald-100'}`}>AI-powered infrastructure</div>
              </div>
            </div>
          </button>
        </div>
      </nav>
    </div>
  );
};
