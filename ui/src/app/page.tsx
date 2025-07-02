'use client';

import React, { useState, useEffect } from 'react';
import { Breadcrumb } from '@/components/Breadcrumb';
import { SignInModal } from '@/components/SignInModal';
import { MigrationWelcomeModal } from '@/components/MigrationWelcomeModal';
import { PathSelectionModal } from '@/components/PathSelectionModal';
import { OptimizationWelcomeModal } from '@/components/OptimizationWelcomeModal';
import { ScalingWelcomeModal } from '@/components/ScalingWelcomeModal';
import { CreateProjectModal } from '@/components/CreateProjectModal';
import { useAppSelector, useAppDispatch } from '@/store';
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
          <div className="mb-12">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Quick Actions
            </h2>
            <p className="text-gray-600">
              Get started with common tasks
            </p>
          </div>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <button
            onClick={() => setShowCreateProjectModal(true)}
            className="glass-ultra rounded-xl p-6 text-left hover:focus-ring transition-all duration-300 group"
          >
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="h-4 w-4 text-emerald-700" />
              </div>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1 text-gradient">New Project</h3>
            <p className="text-sm text-gray-600">Start migration journey</p>
          </button>
          
          <button
            onClick={() => dispatch(setModalState({ modal: 'auth', visible: true }))}
            className="glass-ultra rounded-xl p-6 text-left hover:focus-ring transition-all duration-300 group"
          >
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Shield className="h-4 w-4 text-purple-700" />
              </div>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1 text-gradient">Demo Sign In</h3>
            <p className="text-sm text-gray-600">Try the platform</p>
          </button>
          
          <button
            onClick={() => dispatch(setModalState({ modal: 'journeySelection', visible: true }))}
            className="glass-ultra rounded-xl p-6 text-left hover:focus-ring transition-all duration-300 group"
          >
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="h-4 w-4 text-emerald-700" />
              </div>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1 text-gradient">Choose Journey</h3>
            <p className="text-sm text-gray-600">Select your path</p>
          </button>
          
          <button
            className="glass-ultra rounded-xl p-6 text-left hover:focus-ring transition-all duration-300 group"
          >
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <BarChart className="h-4 w-4 text-blue-700" />
              </div>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1 text-gradient">Analytics</h3>
            <p className="text-sm text-gray-600">View reports</p>
          </button>
        </div>
      </div>

      {/* Dashboard Section */}
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600">
          Overview of your migration projects and activities
        </p>
      </div>
      
      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {mockStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="glass-ultra rounded-xl p-6 hover:focus-ring transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon className="h-4 w-4 text-emerald-700" />
                </div>
                <span className="text-sm font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                  {stat.percentage}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {stat.value}
              </h3>
              <p className="text-sm font-semibold text-gray-900 mb-2">
                {stat.name}
              </p>
              <p className="text-sm text-gray-600">
                {stat.description}
              </p>
            </div>
          );
        })}
      </div>

      
      {/* Recent Activity */}
      <div className="card-professional p-8 animate-slide-up">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-display text-2xl">
            Recent Activity
          </h2>
          <button className="btn-primary flex items-center text-base font-bold px-6 py-3 hover:scale-[1.02] active:scale-[0.98] transition-all">
            View All
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {mockRecentActivity.map((activity, index) => (
            <div
              key={activity.id}
              className="card-professional hover-lift flex items-center justify-between p-6 animate-slide-up"
            >
              <div>
                <h4 className="font-black text-lg text-gray-900 mb-2">
                  {activity.project}
                </h4>
                <p className="text-base font-semibold text-gray-600">
                  {activity.timestamp}
                </p>
              </div>
              <span
                className={`${activity.status === 'success'
                    ? 'status-success'
                    : activity.status === 'warning'
                    ? 'status-warning'
                    : 'status-success'
                } text-base font-bold px-4 py-2`}
              >
                {activity.type.split('_').join(' ')}
              </span>
            </div>
          ))}
        </div>
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
