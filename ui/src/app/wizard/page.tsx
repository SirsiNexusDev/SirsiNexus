import { Breadcrumb } from '@/components/Breadcrumb';
import { MigrationSteps } from '@/components/MigrationSteps/MigrationSteps';
import type { MigrationStep } from '@/types/migration';

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
  return (
    <div>
      <Breadcrumb />
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Migration Wizard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Step-by-step guide to migrate your resources
        </p>
      </div>

      <MigrationSteps
        currentStep="plan"
        stepStatuses={mockStepStatuses}
        onStepClick={(step) => console.log('Step clicked:', step)}
      />
    </div>
  );
}
