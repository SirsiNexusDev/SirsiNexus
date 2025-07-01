'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
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
          <div className="mb-8">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gradient">
              Quick Actions
            </h2>
            <p className="text-slate-800 font-medium">
              Get started with common tasks
            </p>
          </div>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <button
            onClick={() => setShowCreateProjectModal(true)}
            className="card-3d flex items-center gap-4 p-6 rounded-xl transition-all duration-300 hover:shadow-glow group"
          >
            <div className="gradient-primary p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
              <Plus className="h-6 w-6 text-white" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-lg text-slate-800">New Project</h3>
              <p className="text-sm font-medium text-slate-800">Start migration</p>
            </div>
          </button>
          
          <button
            onClick={() => dispatch(setModalState({ modal: 'auth', visible: true }))}
            className="card-3d flex items-center gap-4 p-6 rounded-xl transition-all duration-300 hover:shadow-glow group"
          >
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-lg text-slate-800">Demo Sign In</h3>
              <p className="text-sm font-medium text-slate-800">Try the platform</p>
            </div>
          </button>
          
          <button
            onClick={() => dispatch(setModalState({ modal: 'journeySelection', visible: true }))}
            className="card-3d flex items-center gap-4 p-6 rounded-xl transition-all duration-300 hover:shadow-glow group"
          >
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-lg text-slate-800">Choose Journey</h3>
              <p className="text-sm font-medium text-slate-800">Select your path</p>
            </div>
          </button>
          
          <button className="card-3d flex items-center gap-4 p-6 rounded-xl transition-all duration-300 hover:shadow-glow group">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
              <BarChart className="h-6 w-6 text-white" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-lg text-slate-800">Analytics</h3>
              <p className="text-sm font-medium text-slate-800">View reports</p>
            </div>
          </button>
        </div>
      </div>

      {/* Dashboard Section */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gradient">
          Dashboard
        </h1>
        <p className="text-slate-800 font-medium">
          Overview of your migration projects and activities
        </p>
      </div>
      
      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {mockStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="card-3d rounded-xl p-6 hover:shadow-glow transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div className="gradient-primary p-3 rounded-lg shadow-md">
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <span
                  className={`text-sm ${
                    stat.change.startsWith('+')
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {stat.change}
                </span>
              </div>
              <h3 className="mt-4 text-2xl font-bold text-slate-800">
                {stat.value}
              </h3>
              
              <p className="text-sm font-medium text-slate-800">
                {stat.name}
              </p>
              <p className="text-xs text-slate-700 font-medium mt-1">
                {stat.description}
              </p>
            </div>
          );
        })}
      </div>

      
      {/* Recent Activity */}
      <div className="card-3d rounded-xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">
            Recent Activity
          </h2>
          <button className="flex items-center text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
            View All
            <ArrowRight className="ml-1 h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          {mockRecentActivity.map((activity) => (
            <div
              key={activity.id}
              className="list-item-3d flex items-center justify-between rounded-lg p-4"
            >
              <div>
                <h4 className="font-semibold text-slate-800">
                  {activity.project}
                </h4>
                <p className="text-sm font-medium text-slate-800">
                  {activity.timestamp}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-sm font-semibold ${
                  activity.status === 'success'
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : activity.status === 'warning'
                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                }`}
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
