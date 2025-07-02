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
          <div className="mb-6 animate-slide-up">
            <h2 className="text-display text-2xl mb-3">
              Quick Actions
            </h2>
            <p className="text-lg text-gray-600 font-medium">
              Get started with common tasks
            </p>
          </div>
        
        <div className="grid-professional">
          <button
            onClick={() => setShowCreateProjectModal(true)}
            className="card-professional hover-lift p-8 group hover:scale-[1.02] active:scale-[0.98] transition-all animate-slide-up"
          >
            <div className="card-gradient p-4 rounded-2xl shadow-primary group-hover:shadow-xl transition-all mb-6">
              <Plus className="h-8 w-8 text-white" />
            </div>
            <div className="text-left">
              <h3 className="font-black text-xl text-gray-900 mb-2">New Project</h3>
              <p className="text-base font-semibold text-gray-600">Start migration journey</p>
            </div>
          </button>
          
          <button
            onClick={() => dispatch(setModalState({ modal: 'auth', visible: true }))}
            className="card-professional hover-lift p-8 group hover:scale-[1.02] active:scale-[0.98] transition-all animate-slide-up"
          >
            <div className="bg-gradient-secondary p-4 rounded-2xl shadow-secondary group-hover:shadow-xl transition-all mb-6">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div className="text-left">
              <h3 className="font-black text-xl text-gray-900 mb-2">Demo Sign In</h3>
              <p className="text-base font-semibold text-gray-600">Try the platform</p>
            </div>
          </button>
          
          <button
            onClick={() => dispatch(setModalState({ modal: 'journeySelection', visible: true }))}
            className="card-professional hover-lift p-8 group hover:scale-[1.02] active:scale-[0.98] transition-all animate-slide-up"
          >
            <div className="bg-gradient-accent p-4 rounded-2xl shadow-purple group-hover:shadow-xl transition-all mb-6">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <div className="text-left">
              <h3 className="font-black text-xl text-gray-900 mb-2">Choose Journey</h3>
              <p className="text-base font-semibold text-gray-600">Select your path</p>
            </div>
          </button>
          
          <button
            className="card-professional hover-lift p-8 group hover:scale-[1.02] active:scale-[0.98] transition-all animate-slide-up"
          >
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-4 rounded-2xl shadow-lg group-hover:shadow-xl transition-all mb-6">
              <BarChart className="h-8 w-8 text-white" />
            </div>
            <div className="text-left">
              <h3 className="font-black text-xl text-gray-900 mb-2">Analytics</h3>
              <p className="text-base font-semibold text-gray-600">View reports</p>
            </div>
          </button>
        </div>
      </div>

      {/* Dashboard Section */}
      <div className="mb-8 animate-slide-up">
        <h1 className="text-display text-3xl mb-3">
          Dashboard
        </h1>
        <p className="text-lg text-gray-600 font-medium">
          Overview of your migration projects and activities
        </p>
      </div>
      
      {/* Stats Grid */}
      <div className="mb-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {mockStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="card-professional hover-lift p-8 group animate-slide-up"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="card-gradient p-4 rounded-2xl shadow-primary group-hover:shadow-xl transition-all">
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <div className={`status-${stat.change.startsWith('+') ? 'success' : 'error'} px-3 py-2 text-sm font-bold`}>
                  {stat.percentage}
                </div>
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-2">
                {stat.value}
              </h3>
              
              <p className="text-lg font-bold text-gray-800 mb-3">
                {stat.name}
              </p>
              <p className="text-sm text-gray-600 font-medium leading-relaxed">
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
