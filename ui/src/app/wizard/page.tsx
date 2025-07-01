'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Download, FileText, Trophy, Sparkles, Clock, ChevronRight, Search, Server, Database, Cloud, Settings, TestTube, Wrench, ArrowLeftRight, BarChart, Shield, Play, Loader, RefreshCw, AlertTriangle, Info } from 'lucide-react';
import { PlanStep } from '@/components/MigrationSteps/steps/PlanStep';
import { SpecifyStep } from '@/components/MigrationSteps/steps/SpecifyStep';
import { TestStep } from '@/components/MigrationSteps/steps/TestStep';
import { BuildStep } from '@/components/MigrationSteps/steps/BuildStep';
import { TransferStep } from '@/components/MigrationSteps/steps/TransferStep';
import { ValidateStep } from '@/components/MigrationSteps/steps/ValidateStep';
import { OptimizeStep } from '@/components/MigrationSteps/steps/OptimizeStep';
import { SupportStep } from '@/components/MigrationSteps/steps/SupportStep';

type MigrationStep = 'plan' | 'specify' | 'test' | 'build' | 'transfer' | 'validate' | 'optimize' | 'support';
type MigrationStatus = 'not_started' | 'in_progress' | 'completed' | 'failed' | 'warning';

const STEPS: Record<MigrationStep, { title: string; description: string; icon: React.ElementType }> = {
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
    icon: TestTube,
  },
  build: {
    title: 'Build Infrastructure',
    description: 'Prepare target environment and dependencies',
    icon: Wrench,
  },
  transfer: {
    title: 'Transfer Resources',
    description: 'Execute the migration process',
    icon: ArrowLeftRight,
  },
  validate: {
    title: 'Validate Migration',
    description: 'Verify successful resource transfer',
    icon: Shield,
  },
  optimize: {
    title: 'Optimize Resources',
    description: 'Fine-tune performance and costs',
    icon: BarChart,
  },
  support: {
    title: 'Support & Monitor',
    description: 'Ongoing maintenance and improvements',
    icon: Settings,
  },
};

interface StepArtifact {
  id: string;
  name: string;
  type: string;
  size: string;
  step: string;
  content?: string;
}

export default function WizardPage() {
  const [currentStep, setCurrentStep] = useState<MigrationStep>('plan');
  const [stepStatuses, setStepStatuses] = useState<Record<MigrationStep, MigrationStatus>>({
    plan: 'not_started',
    specify: 'not_started',
    test: 'not_started',
    build: 'not_started',
    transfer: 'not_started',
    validate: 'not_started',
    optimize: 'not_started',
    support: 'not_started',
  });
  const [completedSteps, setCompletedSteps] = useState<Set<MigrationStep>>(new Set());
  const [artifacts, setArtifacts] = useState<StepArtifact[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  const steps = Object.keys(STEPS) as MigrationStep[];

  const handleStepClick = (step: MigrationStep) => {
    setCurrentStep(step);
  };

  const handleStepComplete = (step: MigrationStep, artifact?: {name: string; type: string; size: string; content?: string}) => {
    console.log(`Step ${step} completed`);
    
    // Mark step as completed
    setCompletedSteps(prev => new Set([...prev, step]));
    setStepStatuses(prev => ({ ...prev, [step]: 'completed' }));
    
    // Store artifact if provided
    if (artifact) {
      const stepArtifact: StepArtifact = {
        id: `${step}-${Date.now()}`,
        name: artifact.name,
        type: artifact.type,
        size: artifact.size,
        step: step.charAt(0).toUpperCase() + step.slice(1),
        content: artifact.content
      };
      setArtifacts(prev => [...prev, stepArtifact]);
    }
    
    // Advance to next step
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1];
      setCurrentStep(nextStep);
      setStepStatuses(prev => ({ ...prev, [nextStep]: 'in_progress' }));
    } else {
      // All steps completed
      setIsCompleted(true);
    }
  };

  const downloadArtifact = (artifact: StepArtifact) => {
    const content = artifact.content || `# ${artifact.name}\n\nGenerated on: ${new Date().toISOString()}\nStep: ${artifact.step}\nType: ${artifact.type}\nSize: ${artifact.size}\n\nThis is a sample artifact generated during the migration process.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${artifact.name.replace(/\s+/g, '_')}.${artifact.type.toLowerCase()}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto text-center bg-white rounded-2xl shadow-xl p-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="mb-6"
          >
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="h-10 w-10 text-white" />
            </div>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-gray-900 mb-4"
          >
            Migration Completed Successfully!
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-gray-600 mb-8"
          >
            Your migration has been completed successfully. All resources have been transferred and validated.
          </motion.p>

          {artifacts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-8"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Generated Artifacts</h3>
              <div className="space-y-3">
                {artifacts.map((artifact) => (
                  <div
                    key={artifact.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-full">
                        <FileText className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{artifact.name}</h4>
                        <p className="text-sm text-gray-600">{artifact.type} • {artifact.size}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => downloadArtifact(artifact)}
                      className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download</span>
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex justify-center space-x-4"
          >
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              Start New Migration
            </button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Migration Wizard</h1>
          <p className="text-lg text-gray-600">Complete your migration step by step</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Step Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Migration Steps</h2>
              <div className="space-y-3">
                {steps.map((step, index) => {
                  const config = STEPS[step];
                  const status = stepStatuses[step];
                  const isActive = step === currentStep;
                  const isCompleted = completedSteps.has(step);
                  
                  return (
                    <div
                      key={step}
                      onClick={() => handleStepClick(step)}
                      className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                        isActive 
                          ? 'border-blue-500 bg-blue-50' 
                          : isCompleted
                          ? 'border-green-200 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                          isCompleted 
                            ? 'bg-green-500' 
                            : isActive 
                            ? 'bg-blue-500' 
                            : 'bg-gray-300'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="h-4 w-4 text-white" />
                          ) : (
                            <span className="text-sm font-medium text-white">{index + 1}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className={`text-sm font-medium ${
                            isActive ? 'text-blue-900' : isCompleted ? 'text-green-900' : 'text-gray-900'
                          }`}>
                            {config.title}
                          </h3>
                          <p className={`text-xs ${
                            isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-600'
                          }`}>
                            {config.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Step Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-500 rounded-full">
                    <span className="text-lg font-bold text-white">
                      {steps.indexOf(currentStep) + 1}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {STEPS[currentStep].title}
                    </h2>
                    <p className="text-gray-600">
                      {STEPS[currentStep].description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Step-specific content - Using proper step components */}
                {currentStep === 'plan' && (
                  <PlanStep 
                    onComplete={(artifact) => {
                      console.log('PlanStep completed with artifact:', artifact);
                      handleStepComplete(currentStep, artifact);
                    }}
                  />
                )}

                {currentStep === 'specify' && (
                  <SpecifyStep 
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
                    onComplete={(artifact) => {
                      console.log('SpecifyStep completed with artifact:', artifact);
                      handleStepComplete(currentStep, artifact);
                    }}
                  />
                )}

                {currentStep === 'test' && (
                  <TestStep 
                    onComplete={(artifact) => {
                      console.log('TestStep completed with artifact:', artifact);
                      handleStepComplete(currentStep, artifact);
                    }}
                  />
                )}

                {currentStep === 'build' && (
                  <BuildStep 
                    onComplete={(artifact) => {
                      console.log('BuildStep completed with artifact:', artifact);
                      handleStepComplete(currentStep, artifact);
                    }}
                  />
                )}

                {currentStep === 'transfer' && (
                  <TransferStep 
                    onComplete={(artifact) => {
                      console.log('TransferStep completed with artifact:', artifact);
                      handleStepComplete(currentStep, artifact);
                    }}
                  />
                )}

                {currentStep === 'validate' && (
                  <ValidateStep 
                    onComplete={(artifact) => {
                      console.log('ValidateStep completed with artifact:', artifact);
                      handleStepComplete(currentStep, artifact);
                    }}
                  />
                )}

                {currentStep === 'optimize' && (
                  <OptimizeStep 
                    onComplete={(artifact) => {
                      console.log('OptimizeStep completed with artifact:', artifact);
                      handleStepComplete(currentStep, artifact);
                    }}
                  />
                )}

                {currentStep === 'support' && (
                  <SupportStep 
                    onComplete={(artifact) => {
                      console.log('SupportStep completed with artifact:', artifact);
                      handleStepComplete(currentStep, artifact);
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
