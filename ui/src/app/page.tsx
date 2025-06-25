import { RootLayout } from '@/components/RootLayout';
import { MigrationSteps } from '@/components/MigrationSteps/MigrationSteps';
import React, { useState } from 'react';
import type { MigrationStep, MigrationStatus } from '@/types/migration';

export default function Home() {
  const [currentStep, setCurrentStep] = useState<MigrationStep>('plan');
  const stepStatuses: Record<MigrationStep, MigrationStatus> = {
    plan: 'not_started',
    specify: 'not_started',
    test: 'not_started',
    build: 'not_started',
    transfer: 'not_started',
    validate: 'not_started',
    optimize: 'not_started',
    support: 'not_started',
  };

  const handleStepClick = (step: MigrationStep) => {
    setCurrentStep(step);
    // Implement logic to manage step transition, fetch data, etc.
  };

  return (
    <RootLayout>
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">Migration Wizard</h1>
        <MigrationSteps
          currentStep={currentStep}
          stepStatuses={stepStatuses}
          onStepClick={handleStepClick}
        />
      </div>
    </RootLayout>
  );
}
