'use client';

import React, { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { Breadcrumb } from '@/components/Breadcrumb';
import { SignInModal } from '@/components/SignInModal';
import { MigrationWelcomeModal } from '@/components/MigrationWelcomeModal';
import { PathSelectionModal } from '@/components/PathSelectionModal';
import { OptimizationWelcomeModal } from '@/components/OptimizationWelcomeModal';
import { ScalingWelcomeModal } from '@/components/ScalingWelcomeModal';
import { CreateProjectModal } from '@/components/CreateProjectModal';
import { useAppSelector, useAppDispatch } from '@/store';
import { useAuthSync } from '@/hooks/useAuthSync';
import { setModalState, selectJourney, markAsNotFirstTime } from '@/store/slices/uiSlice';
import { login } from '@/store/slices/authSlice';
import {
  BarChart,
  Server,
  ArrowRight,
  Database,
  Cloud,
  Activity,
  Plus,
  TrendingUp,
  Users,
  Shield,
  Zap,
  Sparkles,
  Rocket,
  Monitor,
  Search,
  Command,
} from 'lucide-react';

const mockStats = [
  {
    name: 'Active Migrations',
    value: '24',
    change: '+8',
    icon: Cloud,
    description: 'Currently running migration projects across AWS, Azure, and GCP',
    trend: 'up',
    percentage: '+32.5%',
  },
  {
    name: 'Resources Migrated',
    value: '12,847',
    change: '+1,253',
    icon: Server,
    description: 'Successfully migrated servers, databases, and applications',
    trend: 'up',
    percentage: '+10.8%',
  },
  {
    name: 'Success Rate',
    value: '99.2%',
    change: '+0.7%',
    icon: Activity,
    description: 'Migration success rate across all projects this quarter',
    trend: 'up',
    percentage: '+0.7%',
  },
  {
    name: 'Data Transferred',
    value: '47.3 TB',
    change: '+12.8 TB',
    icon: Database,
    description: 'Total data volume transferred across all active migrations',
    trend: 'up',
    percentage: '+37.2%',
  },
  {
    name: 'Cost Savings',
    value: '$2.8M',
    change: '+$450K',
    icon: TrendingUp,
    description: 'Infrastructure cost savings achieved through optimization',
    trend: 'up',
    percentage: '+19.3%',
  },
  {
    name: 'Team Members',
    value: '156',
    change: '+12',
    icon: Users,
    description: 'Active team members across all migration projects',
    trend: 'up',
    percentage: '+8.3%',
  },
];

const mockRecentActivity = [
  {
    id: '1',
    type: 'migration_completed',
    project: 'Production Database Migration',
    timestamp: '2 hours ago',
    status: 'success',
  },
  {
    id: '2',
    type: 'optimization_suggested',
    project: 'Web App Servers',
    timestamp: '4 hours ago',
    status: 'info',
  },
  {
    id: '3',
    type: 'validation_warning',
    project: 'Storage Bucket Transfer',
    timestamp: '6 hours ago',
    status: 'warning',
  },
];

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const authSync = useAuthSync(); // Sync NextAuth with Redux
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const welcomeModalOpen = useAppSelector((state) => state.ui.modals.welcome);
  const authModalOpen = useAppSelector((state) => state.ui.modals.auth);
  const journeySelectionModalOpen = useAppSelector((state) => state.ui.modals.journeySelection);
  const optimizationWelcomeModalOpen = useAppSelector((state) => state.ui.modals.optimizationWelcome);
  const scalingWelcomeModalOpen = useAppSelector((state) => state.ui.modals.scalingWelcome);
  const userJourney = useAppSelector((state) => state.ui.userJourney);
  
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);

  // Show auth modal by default if user is not authenticated
  useEffect(() => {
    if (!isAuthenticated && !authModalOpen && !journeySelectionModalOpen) {
      dispatch(setModalState({ modal: 'auth', visible: true }));
    }
  }, [isAuthenticated, authModalOpen, journeySelectionModalOpen, dispatch]);

  const handleSignIn = (credentials: { email: string; password: string }) => {
    console.log('Signing in with:', credentials);
    
    dispatch(login({ 
      id: '1', 
      email: credentials.email, 
      name: credentials.email.split('@')[0], 
      role: credentials.email.includes('admin') ? 'admin' : 'user'
    }));
    dispatch(setModalState({ modal: 'auth', visible: false }));
    
    // Show journey selection for first-time users
    if (userJourney.isFirstTime) {
      dispatch(setModalState({ modal: 'journeySelection', visible: true }));
    }
  };

  const handleRegister = (userData: { name: string; email: string; password: string; confirmPassword: string }) => {
    console.log('Registering user:', userData);
    dispatch(login({ 
      id: '2', 
      email: userData.email, 
      name: userData.name, 
      role: 'user'
    }));
    dispatch(setModalState({ modal: 'auth', visible: false }));
    
    // Show journey selection for new users
    dispatch(setModalState({ modal: 'journeySelection', visible: true }));
  };

  const handleOAuthLogin = (provider: string) => {
    console.log(`OAuth login with ${provider}`);
    dispatch(login({ 
      id: '3', 
      email: `demo@${provider}.com`, 
      name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`, 
      role: 'user'
    }));
    dispatch(setModalState({ modal: 'auth', visible: false }));
    
    // Show journey selection for OAuth users
    if (userJourney.isFirstTime) {
      dispatch(setModalState({ modal: 'journeySelection', visible: true }));
    }
  };

  const handleCreateProject = (projectData: any) => {
    console.log('Creating project:', projectData);
    // Handle project creation
  };

  const handleStartMigration = () => {
    // Navigate to migration wizard or create new project
    window.location.href = '/migration';
  };

  const handleJourneySelection = (journey: 'migration' | 'optimization' | 'scaling') => {
    dispatch(selectJourney(journey));
  };

  const handleStartOptimization = () => {
    // Navigate to optimization wizard
    console.log('Starting optimization journey');
    window.location.href = '/optimization';
  };

  const handleStartScaling = () => {
    // Navigate to scaling wizard
    console.log('Starting scaling journey');
    window.location.href = '/scaling';
  };

  // Only show dashboard content if user is authenticated and has completed onboarding
  const showBackdrop = journeySelectionModalOpen || authModalOpen || welcomeModalOpen || optimizationWelcomeModalOpen || scalingWelcomeModalOpen;
  const hideMainContent = !isAuthenticated || authModalOpen || journeySelectionModalOpen;

  return (
    <div>
      <Breadcrumb />
      
      {!hideMainContent && (
        <>
          {/* Quick Actions - at the very top */}
          <div className="mb-12 stagger-children">
        <div className="card-action-premium mb-8 spring-entrance border-2 border-emerald-500/30 hover:border-emerald-500/60 group relative overflow-hidden">
          <div className="card-action-glow"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center border border-emerald-600 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-headline text-3xl group-hover:text-emerald-600 transition-colors">
                  Quick Actions
                </h2>
                <p className="text-subheading group-hover:text-slate-700 transition-colors">
                  Get started with common tasks
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <button
            onClick={() => setShowCreateProjectModal(true)}
            className="card-action-premium group relative overflow-hidden border-2 border-emerald-500/30 hover:border-emerald-500/60"
          >
            <div className="card-action-glow"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 border border-emerald-600">
                  <Plus className="h-6 w-6 text-white" />
                </div>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              </div>
              <h3 className="card-title mb-2 group-hover:text-emerald-600 transition-colors">New Project</h3>
              <p className="text-body group-hover:text-slate-700">Start your migration journey</p>
            </div>
          </button>
          
          <button
            onClick={() => dispatch(setModalState({ modal: 'auth', visible: true }))}
            className="card-action-premium group relative overflow-hidden border-2 border-blue-500/30 hover:border-blue-500/60"
          >
            <div className="card-action-glow"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 border border-blue-600">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              </div>
              <h3 className="card-title mb-2 group-hover:text-blue-600 transition-colors">Demo Sign In</h3>
              <p className="text-body group-hover:text-slate-700">Try the platform features</p>
            </div>
          </button>
          
          <button
            onClick={() => dispatch(setModalState({ modal: 'journeySelection', visible: true }))}
            className="card-action-premium group relative overflow-hidden border-2 border-amber-500/30 hover:border-amber-500/60"
          >
            <div className="card-action-glow"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 border border-amber-600">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
              </div>
              <h3 className="card-title mb-2 group-hover:text-amber-600 transition-colors">Choose Journey</h3>
              <p className="text-body group-hover:text-slate-700">Select your migration path</p>
            </div>
          </button>
          
          <button
            onClick={() => window.location.href = '/analytics'}
            className="card-action-premium group relative overflow-hidden border-2 border-purple-500/30 hover:border-purple-500/60"
          >
            <div className="card-action-glow"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 border border-purple-600">
                  <BarChart className="h-6 w-6 text-white" />
                </div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              </div>
              <h3 className="card-title mb-2 group-hover:text-purple-600 transition-colors">Analytics</h3>
              <p className="text-body group-hover:text-slate-700">View detailed reports</p>
            </div>
          </button>
        </div>
      </div>

      {/* Dashboard Overview Header */}
      <div className="card-action-premium mb-8 border-2 border-emerald-500/30 hover:border-emerald-500/60 group relative overflow-hidden">
        <div className="card-action-glow"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center border border-emerald-600 group-hover:scale-110 transition-transform duration-300">
              <Monitor className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-headline text-3xl group-hover:text-emerald-600 transition-colors">
                Dashboard Overview
              </h1>
              <p className="text-subheading group-hover:text-slate-700 transition-colors">
                Real-time insights into your migration projects and infrastructure
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Interactive Stats Grid */}
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {mockStats.map((stat, index) => {
          const Icon = stat.icon;
          const getNavigationPath = (name: string) => {
            switch (name) {
              case 'Active Migrations':
                return '/analytics?filter=active-migrations';
              case 'Resources Migrated':
                return '/analytics?filter=resources';
              case 'Success Rate':
                return '/analytics?filter=success-metrics';
              case 'Data Transferred':
                return '/analytics?filter=data';
              case 'Cost Savings':
                return '/analytics?filter=cost-savings';
              case 'Team Members':
                return '/team';
              default:
                return '/analytics';
            }
          };
          
          return (
            <button
              key={stat.name}
              onClick={() => window.location.href = getNavigationPath(stat.name)}
              className="card-action-premium text-left group relative overflow-hidden border-2 border-emerald-500/30 hover:border-emerald-500/60"
            >
              <div className="card-action-glow"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="card-title text-base group-hover:text-emerald-600 transition-colors">
                    {stat.name}
                  </h3>
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 border border-emerald-600">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                </div>
              
                <div className="mb-4">
                  <div className="card-value text-3xl mb-1">
                    {stat.value}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-subheading text-emerald-600">
                      {stat.change}
                    </span>
                    <span className="text-caption text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">
                      {stat.percentage}
                    </span>
                  </div>
                </div>
                
                <p className="text-body group-hover:text-slate-700 transition-colors">
                  {stat.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      
      {/* Recent Activity */}
      <div className="card-action-premium mb-8 border-2 border-emerald-500/30 hover:border-emerald-500/60 group relative overflow-hidden">
        <div className="card-action-glow"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center border border-emerald-600 group-hover:scale-110 transition-transform duration-300">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-headline text-2xl group-hover:text-emerald-600 transition-colors">
                  Recent Activity
                </h2>
                <p className="text-subheading group-hover:text-slate-700 transition-colors">
                  Latest updates and project milestones
                </p>
              </div>
            </div>
            <button 
              onClick={() => window.location.href = '/projects'}
              className="btn-primary flex items-center btn-text-large px-6 py-3 hover:scale-[1.02] active:scale-[0.98] transition-all border border-emerald-600"
            >
              View All Projects
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {mockRecentActivity.map((activity, index) => {
          const getActivityPath = (activityId: string, type: string) => {
            switch (type) {
              case 'migration_completed':
                return `/projects/${activityId}`;
              case 'optimization_suggested':
                return `/optimization?project=${activityId}`;
              case 'validation_warning':
                return `/projects/${activityId}?tab=logs`;
              default:
                return `/projects/${activityId}`;
            }
          };
          
          return (
            <button
              key={activity.id}
              onClick={() => window.location.href = getActivityPath(activity.id, activity.type)}
              className="card-action-premium w-full text-left group relative overflow-hidden border-2 border-emerald-500/30 hover:border-emerald-500/60"
            >
              <div className="card-action-glow"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="card-title mb-2 group-hover:text-emerald-600 transition-colors">
                      {activity.project}
                    </h3>
                    <p className="text-body group-hover:text-slate-700 transition-colors">
                      {activity.timestamp} • {activity.type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-caption border ${
                        activity.status === 'success'
                          ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                          : activity.status === 'warning'
                          ? 'bg-amber-100 text-amber-700 border-amber-200'
                          : 'bg-blue-100 text-blue-700 border-blue-200'
                      }`}
                    >
                      {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                    </span>
                    <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
        </>
      )}
      
      {/* Modals */}
      <PathSelectionModal
        isOpen={journeySelectionModalOpen}
        onClose={() => {
          console.log('Closing path selection modal - user skipped');
          dispatch(setModalState({ modal: 'journeySelection', visible: false }));
          // Mark as not first time but don't select any journey when skipping
          if (userJourney.isFirstTime) {
            dispatch(markAsNotFirstTime());
          }
        }}
        onSelectPath={handleJourneySelection}
      />
      
      <SignInModal
        isOpen={authModalOpen}
        onClose={() => dispatch(setModalState({ modal: 'auth', visible: false }))}
        onSignIn={handleSignIn}
        onRegister={handleRegister}
        onOAuthLogin={handleOAuthLogin}
      />
      
      <MigrationWelcomeModal
        isOpen={welcomeModalOpen}
        onClose={() => dispatch(setModalState({ modal: 'welcome', visible: false }))}
        onStartMigration={handleStartMigration}
      />

      <OptimizationWelcomeModal
        isOpen={optimizationWelcomeModalOpen}
        onClose={() => dispatch(setModalState({ modal: 'optimizationWelcome', visible: false }))}
        onStartOptimization={handleStartOptimization}
      />

      <ScalingWelcomeModal
        isOpen={scalingWelcomeModalOpen}
        onClose={() => dispatch(setModalState({ modal: 'scalingWelcome', visible: false }))}
        onStartScaling={handleStartScaling}
      />
      
      <CreateProjectModal
        isOpen={showCreateProjectModal}
        onClose={() => setShowCreateProjectModal(false)}
        onCreateProject={handleCreateProject}
      />
    </div>
  );
}
