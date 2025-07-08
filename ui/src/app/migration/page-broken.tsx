'use client';

import { Breadcrumb } from '@/components/Breadcrumb';
import { MigrationSteps } from '@/components/MigrationSteps/MigrationSteps';
import type { MigrationStep } from '@/types/migration';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Download, FileText, Trophy, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const [generatedArtifacts, setGeneratedArtifacts] = useState<Array<{id: string; name: string; type: string; step: string; size: string; content?: string}>>([]);
  const [isComplete, setIsComplete] = useState(false);

  const handleStepClick = (step: MigrationStep) => {
    console.log('Switching to step:', step);
    setCurrentStep(step);
    // Update step status when clicked
    setStepStatuses(prev => ({
      ...prev,
      [step]: 'in_progress'
    }));
  };
  
  const generateArtifact = (step: MigrationStep) => {
    const artifactMap: Record<MigrationStep, {name: string; type: string; size: string}> = {
      plan: { name: 'Migration Assessment Report', type: 'PDF', size: '2.4 MB' },
      specify: { name: 'Requirements Specification', type: 'JSON', size: '156 KB' },
      test: { name: 'Test Results Summary', type: 'HTML', size: '890 KB' },
      build: { name: 'Infrastructure Blueprint', type: 'YAML', size: '45 KB' },
      transfer: { name: 'Transfer Execution Log', type: 'LOG', size: '12.3 MB' },
      validate: { name: 'Validation Report', type: 'PDF', size: '1.8 MB' },
      optimize: { name: 'Optimization Recommendations', type: 'JSON', size: '234 KB' },
      support: { name: 'Support Playbook', type: 'PDF', size: '3.2 MB' }
    };

    const artifact = artifactMap[step];
    if (artifact) {
      const newArtifact = {
        id: `${step}-${Date.now()}`,
        name: artifact.name,
        type: artifact.type,
        step: step.charAt(0).toUpperCase() + step.slice(1),
        size: artifact.size
      };
      setGeneratedArtifacts(prev => [...prev, newArtifact]);
    }
  };

  const handleStepComplete = (step: MigrationStep, artifact?: {name: string; type: string; size: string; content?: string}) => {
    console.log('WizardPage: Step completed:', step);
    
    // Generate artifact for completed step if provided
    if (artifact) {
      const newArtifact = {
        id: `${step}-${Date.now()}`,
        name: artifact.name,
        type: artifact.type,
        step: step.charAt(0).toUpperCase() + step.slice(1),
        size: artifact.size,
        content: artifact.content
      };
      setGeneratedArtifacts(prev => [...prev, newArtifact]);
    } else {
      generateArtifact(step);
    }
    
    // Mark step as completed
    setStepStatuses(prev => ({
      ...prev,
      [step]: 'completed' as const
    }));
    
    // Auto-advance to next step
    const steps: MigrationStep[] = ['plan', 'specify', 'test', 'build', 'transfer', 'validate', 'optimize', 'support'];
    const currentIndex = steps.indexOf(step);
    
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1];
      console.log('WizardPage: Advancing to next step:', nextStep);
      // Set next step to in_progress and make it current
      setStepStatuses(prev => ({
        ...prev,
        [nextStep]: 'in_progress' as const
      }));
      setCurrentStep(nextStep);
    } else {
      console.log('WizardPage: Migration workflow completed!');
      setIsComplete(true);
    }
  };

  const downloadArtifact = (artifact: any) => {
    // Simulate artifact download
    const blob = new Blob([`# ${artifact.name}\n\nGenerated on: ${new Date().toISOString()}\nStep: ${artifact.step}\nType: ${artifact.type}\nSize: ${artifact.size}\n\nThis is a sample artifact generated during the migration process.`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${artifact.name.replace(/\s+/g, '_')}.${artifact.type.toLowerCase()}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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

      {/* Migration Completion Banner */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8 rounded-lg border border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20 p-6"
          >
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-green-50 dark:bg-green-900/200 rounded-full">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-green-900">Migration Completed Successfully!</h2>
                <p className="text-green-800 dark:text-green-300 font-medium">All migration steps have been completed. Your resources are now successfully migrated and optimized.</p>
                <div className="mt-4 flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-green-700 dark:text-green-300 font-medium">{generatedArtifacts.length} Artifacts Generated</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-5 w-5 text-green-600" />
                    <span className="text-green-700 dark:text-green-300 font-medium">Ready for Production</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generated Artifacts Panel */}
      {generatedArtifacts.length > 0 && (
        <div className="mb-8 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Generated Artifacts</h3>
              <p className="text-slate-700 font-medium">Download reports and documentation from each step</p>
            </div>
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-sirsi-500" />
              <span className="text-sirsi-600 font-medium">{generatedArtifacts.length} files</span>
            </div>
          </div>
          
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {generatedArtifacts.map((artifact, index) => (
              <motion.div
                key={artifact.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 dark:bg-gray-900 p-4 hover:bg-gray-100 dark:bg-gray-800 transition-colors"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-slate-900">{artifact.name}</h4>
                  <p className="text-sm text-slate-600">{artifact.step} • {artifact.type} • {artifact.size}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => downloadArtifact(artifact)}
                  className="ml-3"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <MigrationSteps
        currentStep={currentStep}
        stepStatuses={stepStatuses}
        onStepClick={handleStepClick}
        onStepComplete={handleStepComplete}
      />
    </div>
  );
}
