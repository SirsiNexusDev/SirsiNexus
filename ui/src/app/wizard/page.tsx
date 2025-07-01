'use client';

import { Breadcrumb } from '@/components/Breadcrumb';
import { MigrationSteps } from '@/components/MigrationSteps/MigrationSteps';
import type { MigrationStep } from '@/types/migration';
import { useState } from 'react';

// In a real app, this would come from Redux/Context
const mockStepStatuses: Record<MigrationStep, 'not_started' | 'in_progress' | 'completed' | 'failed' | 'warning'> = {
  plan: 'in_progress',
  specify: 'not_started',
  test: 'not_started',
  build: 'not_started',
  transfer: 'not_started',
  validate: 'not_started',
  optimize: 'not_started',
  support: 'not_started',
};

export default function WizardPage() {
  const [currentStep, setCurrentStep] = useState<MigrationStep>('plan');
  const [stepStatuses, setStepStatuses] = useState(mockStepStatuses);

  const handleStepClick = (step: MigrationStep) => {
    console.log('Switching to step:', step);
    setCurrentStep(step);
    // Update step status when clicked
    setStepStatuses(prev => ({
      ...prev,
      [step]: 'in_progress'
    }));
  };
  
  const handleStepComplete = (step: MigrationStep) => {
    console.log('WizardPage: Step completed:', step);
    console.log('WizardPage: Current step before update:', currentStep);
    console.log('WizardPage: Current step statuses:', stepStatuses);
    
    setStepStatuses(prev => {
      const newStatuses = {
        ...prev,
        [step]: 'completed' as const
      };
      console.log('WizardPage: Updated step statuses:', newStatuses);
      return newStatuses;
    });
    
    // Auto-advance to next step
    const steps: MigrationStep[] = ['plan', 'specify', 'test', 'build', 'transfer', 'validate', 'optimize', 'support'];
    const currentIndex = steps.indexOf(step);
    console.log('WizardPage: Current step index:', currentIndex, 'Total steps:', steps.length);
    
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1];
      console.log('WizardPage: Advancing to next step:', nextStep);
      handleStepClick(nextStep);
    } else {
      console.log('WizardPage: Migration workflow completed!');
    }
  };

  return (
    <div>
      <Breadcrumb />
      
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900">
          Migration Wizard
        </h1>
        <p className="text-xl text-slate-800 font-medium">
          Step-by-step guide to migrate your resources
        </p>
      </div>

      <MigrationSteps
        currentStep={currentStep}
        stepStatuses={stepStatuses}
        onStepClick={handleStepClick}
        onStepComplete={handleStepComplete}
      />
    </div>
  );
}
