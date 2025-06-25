import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlanStep } from './steps/PlanStep';
import { SpecifyStep } from './steps/SpecifyStep';
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  ChevronRight,
  Settings,
  Search,
  Loader,
} from 'lucide-react';
import type { MigrationStep, MigrationStatus } from '@/types/migration';

interface StepConfig {
  title: string;
  description: string;
  icon: React.ElementType;
}

const STEPS: Record<MigrationStep, StepConfig> = {
  plan: {
    title: 'Plan Migration',
    description: 'Discover resources and create migration strategy',
    icon: Search,
  },
  specify: {
    title: 'Specify Requirements',
    description: 'Define migration parameters and constraints',
    icon: Settings,
  },
  test: {
    title: 'Test Configuration',
    description: 'Validate migration settings and permissions',
    icon: Settings,
  },
  build: {
    title: 'Build Infrastructure',
    description: 'Prepare target environment and dependencies',
    icon: Settings,
  },
  transfer: {
    title: 'Transfer Resources',
    description: 'Execute the migration process',
    icon: Settings,
  },
  validate: {
    title: 'Validate Migration',
    description: 'Verify successful resource transfer',
    icon: Settings,
  },
  optimize: {
    title: 'Optimize Resources',
    description: 'Fine-tune performance and costs',
    icon: Settings,
  },
  support: {
    title: 'Support & Monitor',
    description: 'Ongoing maintenance and improvements',
    icon: Settings,
  },
};

const statusIcons: Record<MigrationStatus, React.ElementType> = {
  not_started: Clock,
  in_progress: Loader,
  completed: CheckCircle,
  failed: XCircle,
  warning: AlertTriangle,
};

const statusColors: Record<MigrationStatus, string> = {
  not_started: 'text-gray-400',
  in_progress: 'text-blue-500',
  completed: 'text-green-500',
  failed: 'text-red-500',
  warning: 'text-yellow-500',
};

interface MigrationStepsProps {
  currentStep: MigrationStep;
  stepStatuses: Record<MigrationStep, MigrationStatus>;
  onStepClick: (step: MigrationStep) => void;
}

export const MigrationSteps: React.FC<MigrationStepsProps> = ({
  currentStep,
  stepStatuses,
  onStepClick,
}) => {
  const steps = Object.keys(STEPS) as MigrationStep[];

  return (
    <div className="mx-auto max-w-4xl">
      <div className="space-y-4">
        {steps.map((step, index) => {
          const config = STEPS[step];
          const status = stepStatuses[step];
          const StatusIcon = statusIcons[status];
          const colorClass = statusColors[status];
          const isActive = step === currentStep;

          return (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`cursor-pointer rounded-lg border p-4 shadow-sm transition-colors ${
                isActive ? 'border-sirsi-500 bg-sirsi-50' : 'border-gray-200 hover:border-sirsi-200'
              }`}
              onClick={() => onStepClick(step)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <StatusIcon className={`h-6 w-6 ${colorClass}`} />
                  <div>
                    <h3 className="font-medium text-gray-900">{config.title}</h3>
                    <p className="text-sm text-gray-500">{config.description}</p>
                  </div>
                </div>
                <ChevronRight
                  className={`h-5 w-5 ${
                    isActive ? 'text-sirsi-500' : 'text-gray-400'
                  }`}
                />
              </div>

              {isActive && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 border-t pt-4"
                >
                  <AnimatePresence mode="wait">
                    {step === 'plan' && (
                      <PlanStep
                        key="plan"
                        onComplete={() => onStepClick('specify')}
                      />
                    )}
                    {step === 'specify' && (
                      <SpecifyStep
                        key="specify"
                        resources={[
                          {
                            id: '1',
                            name: 'prod-db-01',
                            type: 'database',
                            status: 'not_started',
                            metadata: {
                              engine: 'postgresql',
                              version: '13.4',
                              size: '100GB',
                            },
                          },
                        ]}
                        onComplete={(requirements) => {
                          console.log('Requirements:', requirements);
                          onStepClick('test');
                        }}
                      />
                    )}
                    {/* Add other step components here */}
                  </AnimatePresence>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
