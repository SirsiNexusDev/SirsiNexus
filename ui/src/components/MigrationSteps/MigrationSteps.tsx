'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlanStep } from './steps/PlanStep';
import { SpecifyStep } from './steps/SpecifyStep';
import { TestStep } from './steps/TestStep';
import { BuildStep } from './steps/BuildStep';
import { TransferStep } from './steps/TransferStep';
import { ValidateStep } from './steps/ValidateStep';
import { OptimizeStep } from './steps/OptimizeStep';
import { SupportStep } from './steps/SupportStep';
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
  not_started: 'text-slate-600',
  in_progress: 'text-blue-600',
  completed: 'text-green-600',
  failed: 'text-red-600',
  warning: 'text-yellow-600',
};

interface MigrationStepsProps {
  currentStep: MigrationStep;
  stepStatuses: Record<MigrationStep, MigrationStatus>;
  onStepClick: (step: MigrationStep) => void;
}

interface ExtendedMigrationStepsProps extends MigrationStepsProps {
  onStepComplete?: (step: MigrationStep) => void;
}

export const MigrationSteps: React.FC<ExtendedMigrationStepsProps> = ({
  currentStep,
  stepStatuses,
  onStepClick,
  onStepComplete,
}) => {
  
  const handleStepComplete = (step: MigrationStep) => {
    console.log('MigrationSteps: Step completed:', step);
    
    // First call the external completion handler if provided
    if (onStepComplete) {
      console.log('MigrationSteps: Calling external onStepComplete');
      onStepComplete(step);
    } else {
      // Fallback auto-advance if no external handler
      console.log('MigrationSteps: No external handler, auto-advancing');
      const steps = Object.keys(STEPS) as MigrationStep[];
      const currentIndex = steps.indexOf(step);
      if (currentIndex < steps.length - 1) {
        const nextStep = steps[currentIndex + 1];
        onStepClick(nextStep);
      }
    }
  };
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
                    <h3 className="text-xl font-bold text-slate-900">{config.title}</h3>
                    <p className="text-lg text-slate-800 font-medium">{config.description}</p>
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
                        onComplete={() => {
                          console.log('Plan step completed');
                          handleStepComplete('plan');
                        }}
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
                          handleStepComplete('specify');
                        }}
                      />
                    )}
                    {step === 'test' && (
                      <TestStep
                        key="test"
                        onComplete={() => handleStepComplete('test')}
                      />
                    )}
                    {step === 'build' && (
                      <BuildStep
                        key="build"
                        onComplete={() => handleStepComplete('build')}
                      />
                    )}
                    {step === 'transfer' && (
                      <TransferStep
                        key="transfer"
                        onComplete={() => handleStepComplete('transfer')}
                      />
                    )}
                    {step === 'validate' && (
                      <ValidateStep
                        key="validate"
                        onComplete={() => handleStepComplete('validate')}
                      />
                    )}
                    {step === 'optimize' && (
                      <OptimizeStep
                        key="optimize"
                        onComplete={() => handleStepComplete('optimize')}
                      />
                    )}
                    {step === 'support' && (
                      <SupportStep
                        key="support"
                        onComplete={() => {
                          handleStepComplete('support');
                          console.log('Migration completed!');
                        }}
                      />
                    )}
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
