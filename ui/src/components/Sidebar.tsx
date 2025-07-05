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
} from 'lucide-react';

interface SidebarItem {
  label: string;
  icon: React.ElementType;
  path: string;
}

const sidebarItems: SidebarItem[] = [
  { label: 'Demo Scenarios', icon: Play, path: '/demos' },
  { label: 'Agent Management', icon: Sparkles, path: '/agents' },
  { label: 'SIRSI HYPERVISOR', icon: Crown, path: '/sirsi-hypervisor' },
  { label: 'Observability Dashboard', icon: Activity, path: '/observability' },
  { label: 'Credential Management', icon: KeyRound, path: '/credentials' },
  { label: 'Projects', icon: Folder, path: '/projects' },
  { label: 'Migration Steps', icon: GitBranch, path: '/steps' },
  { label: 'Analytics & Reports', icon: BarChart, path: '/analytics' },
  { label: 'Enhanced Analytics', icon: TrendingUp, path: '/analytics/enhanced' },
  { label: 'Security', icon: Shield, path: '/security' },
  { label: 'Scripting Console', icon: Terminal, path: '/console' },
  { label: 'Backend Tests', icon: Rocket, path: '/test-backend' },
  { label: 'Help & Tutorials', icon: HelpCircle, path: '/help' },
];

export const Sidebar: React.FC = () => {
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
    <div className="glass-strong fixed left-0 top-20 h-[calc(100vh-5rem)] w-72 overflow-y-auto hidden lg:block rounded-r-2xl border-r-0">
      <nav className="p-6 space-y-4">
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

        {/* Navigation Items */}
        <div className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            const isMigrationSteps = item.path === '/steps';
            
            if (isMigrationSteps) {
              return (
                <div key={item.path} className="space-y-2">
                  <button
                    onClick={() => setMigrationStepsExpanded(!migrationStepsExpanded)}
                    className={`w-full p-3 rounded-xl transition-all duration-300 group ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg'
                        : 'glass glass-hover text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isActive ? 'bg-white/20' : 'bg-gradient-to-r from-emerald-500 to-green-600'
                        }`}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <span className="nav-item">{item.label}</span>
                      </div>
                      <ChevronDown className={`h-4 w-4 transition-transform ${migrationStepsExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </button>
                  
                  {migrationStepsExpanded && (
                    <div className="ml-4 space-y-1 fade-in">
                      {migrationSteps.map((step, index) => {
                        const isCompleted = index < 2;
                        const isCurrent = index === 2;
                        return (
                          <button
                            key={step.path}
                            onClick={() => window.location.href = step.path}
                            className={`w-full flex items-center justify-between p-2 rounded-lg text-sm transition-all ${
                              isCurrent
                                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                : isCompleted
                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                : 'glass-subtle text-slate-600 hover:text-slate-800'
                            }`}
                          >
                            <span>{step.label}</span>
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                              isCurrent
                                ? 'bg-blue-200 text-blue-800'
                                : isCompleted
                                ? 'bg-emerald-200 text-emerald-800'
                                : 'bg-slate-200 text-slate-600'
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
                onClick={() => {
                  window.location.href = item.path;
                }}
                className={`w-full p-3 rounded-xl transition-all duration-300 group ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg'
                    : 'glass glass-hover text-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isActive ? 'bg-white/20' : 'bg-gradient-to-r from-emerald-500 to-green-600'
                  }`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <span className={`text-sm ${isActive ? 'nav-item-active' : 'nav-item'}`}>{item.label}</span>
                </div>
              </button>
            );
          })}
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
