'use client';

import React from 'react';
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
  Eye,
  Crown,
  Brain,
} from 'lucide-react';
import { EmbeddedAssistant } from './ai-assistant/EmbeddedAssistant';

interface SidebarItem {
  label: string;
  icon: React.ElementType;
  path: string;
}

interface SidebarProps {
  aiAssistant?: boolean;
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

const sidebarSections: SidebarSection[] = [
  {
    title: 'Management',
    items: [
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
    ]
  },
  {
    title: 'Support',
    items: [
      { label: 'Help & Tutorials', icon: HelpCircle, path: '/help' },
      { label: 'Backend Tests', icon: Rocket, path: '/test-backend' },
    ]
  }
];

export const Sidebar: React.FC<SidebarProps> = ({ aiAssistant = false }) => {
  const pathname = usePathname();
  const [migrationStepsExpanded, setMigrationStepsExpanded] = React.useState(false);
  const [wizardsExpanded, setWizardsExpanded] = React.useState(true);
  
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

  return (
    <div className="bg-white/95 backdrop-blur-sm fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 overflow-y-auto hidden lg:block border-r border-slate-200 shadow-sm">
      <nav className="p-4 space-y-6">
        {/* Overview Section */}
        <div className="glass rounded-xl p-4 mb-6">
          <button
            onClick={() => window.location.pathname !== '/' ? window.location.href = '/' : null}
            className={`w-full text-left transition-all duration-300 group ${
              pathname === '/'
                ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg rounded-xl p-4 -m-4'
                : 'hover:bg-white/20 rounded-xl p-4 -m-4'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                pathname === '/'
                  ? 'bg-white/20'
                  : 'bg-gradient-to-r from-emerald-500 to-green-600'
              }`}>
                <Home className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className={`text-lg ${pathname === '/' ? 'nav-item-active' : 'text-headline'}`}>Overview</h2>
                <p className={`text-xs ${pathname === '/' ? 'text-white/80' : 'text-caption'}`}>Dashboard and insights</p>
              </div>
            </div>
          </button>
        </div>

        {/* Smart Wizards Section */}
        <div className="mb-6">
          <button
            onClick={() => setWizardsExpanded(!wizardsExpanded)}
            className="w-full glass glass-hover rounded-xl p-4 mb-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                  <Wand2 className="h-4 w-4 text-white" />
                </div>
                <span className="nav-item">Smart Wizards</span>
              </div>
              <ChevronDown className={`h-4 w-4 text-slate-600 transition-transform ${wizardsExpanded ? 'rotate-180' : ''}`} />
            </div>
          </button>
          
          {wizardsExpanded && (
            <div className="space-y-3 fade-in">
              {wizards.map((wizard) => {
                const WizardIcon = wizard.icon;
                const isActive = pathname === wizard.path;
                return (
                  <button
                    key={wizard.path}
                    onClick={() => {
                      window.location.href = wizard.path;
                    }}
                    className={`w-full p-4 rounded-xl transition-all duration-300 group ${
                      isActive
                        ? `bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg scale-105`
                        : 'glass glass-hover text-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                        isActive 
                          ? 'bg-white/20' 
                          : `bg-gradient-to-r ${wizard.gradient}`
                      }`}>
                        <WizardIcon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-white'}`} />
                      </div>
                      <div className="text-left">
                        <div className={`text-sm ${isActive ? 'nav-item-active' : 'card-title'}`}>{wizard.label}</div>
                        <div className={`text-xs mt-1 ${isActive ? 'text-white/80' : 'text-caption'}`}>
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

        {/* AI Assistant */}
        {aiAssistant && (
          <EmbeddedAssistant 
            position="sidebar" 
            compact={true} 
            context="sidebar-navigation" 
          />
        )}

        {/* Navigation Sections */}
        <div className="space-y-6">
          {sidebarSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
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
                          className={`w-full p-2 rounded-lg transition-all duration-200 group text-left ${
                            isActive
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                              : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'
                          }`}
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
                      className={`w-full p-2 rounded-lg transition-all duration-200 group text-left ${
                        isActive
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'
                      }`}
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
        <div className="mt-8 pt-6">
          <button 
            onClick={() => window.location.href = '/migration'}
            className="w-full btn-primary rounded-xl p-4 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Rocket className="h-4 w-4 text-white" />
              </div>
              <div className="text-left">
                <div className="nav-item text-sm">Start Migration</div>
                <div className="text-xs text-white/80">Begin your journey</div>
              </div>
            </div>
          </button>
        </div>
      </nav>
    </div>
  );
};
