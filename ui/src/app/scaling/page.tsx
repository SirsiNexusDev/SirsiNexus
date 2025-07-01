'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  Download,
  FileText,
  Trophy,
  Activity,
  Target,
  Zap,
  BarChart,
  Shield,
  Sparkles,
  Cpu,
  HardDrive,
  Network,
  Users,
  Lock,
  Building,
  Globe,
  TrendingUp,
  Settings
} from 'lucide-react';
import { EnvironmentSetupStep } from '@/components/MigrationSteps/steps/EnvironmentSetupStep';

type ScalingStep = 'environment' | 'monitor' | 'define' | 'configure' | 'test' | 'protect' | 'activate';
type ScalingStatus = 'not_started' | 'in_progress' | 'completed' | 'failed' | 'warning';

const SCALING_STEPS: Record<ScalingStep, { title: string; description: string; icon: React.ElementType }> = {
  environment: {
    title: 'Environment Setup',
    description: 'Configure environment credentials for auto-scaling',
    icon: Lock,
  },
  monitor: {
    title: 'Setup Monitoring',
    description: 'Comprehensive monitoring for application metrics and performance',
    icon: Activity,
  },
  define: {
    title: 'Define Scaling Policies',
    description: 'Establish scaling thresholds and performance targets',
    icon: Target,
  },
  configure: {
    title: 'Configure Auto-Scaling',
    description: 'Set up auto-scaling groups and load balancing rules',
    icon: Zap,
  },
  test: {
    title: 'Test Scaling Behavior',
    description: 'Simulate traffic spikes to verify scaling performance',
    icon: BarChart,
  },
  protect: {
    title: 'Implement Safeguards',
    description: 'Set up cost controls and scaling limits for protection',
    icon: Shield,
  },
  activate: {
    title: 'Activate Auto-Scaling',
    description: 'Deploy auto-scaling and monitor performance improvements',
    icon: CheckCircle,
  },
};

interface ScalingArtifact {
  id: string;
  name: string;
  type: string;
  size: string;
  step: string;
  content?: string;
}

export default function ScalingWizardPage() {
  const [currentStep, setCurrentStep] = useState<ScalingStep>('environment');
  const [stepStatuses, setStepStatuses] = useState<Record<ScalingStep, ScalingStatus>>({
    environment: 'not_started',
    monitor: 'not_started',
    define: 'not_started',
    configure: 'not_started',
    test: 'not_started',
    protect: 'not_started',
    activate: 'not_started',
  });
  const [completedSteps, setCompletedSteps] = useState<Set<ScalingStep>>(new Set());
  const [artifacts, setArtifacts] = useState<ScalingArtifact[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [scalingData, setScalingData] = useState<any>(null);

  const steps = Object.keys(SCALING_STEPS) as ScalingStep[];

  // Get business entity context
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const entity = urlParams.get('entity') || localStorage.getItem('selectedEntity') || 'tvfone';
    const journey = urlParams.get('demo') || localStorage.getItem('selectedJourney') || 'scaleUp';
    
    // Load entity-specific scaling data
    loadScalingContext(entity, journey);
  }, []);

  const loadScalingContext = (entity: string, journey: string) => {
    // Generate scaling context based on business entity
    const scalingContexts: Record<string, any> = {
      tvfone: {
        currentUsers: 450000,
        targetUsers: 1350000, // 3x growth
        currentInstances: 12,
        targetInstances: 36,
        currentCost: 47650,
        projectedCost: 98850, // Optimized scaling cost
        resources: [
          { type: 'streaming-servers', current: 12, target: 36, scalingFactor: 3 },
          { type: 'cdn-endpoints', current: 15, target: 25, scalingFactor: 1.67 },
          { type: 'ai-recommendation', current: 8, target: 18, scalingFactor: 2.25 },
          { type: 'load-balancers', current: 4, target: 8, scalingFactor: 2 },
        ],
        metrics: {
          peakConcurrent: 75000,
          targetConcurrent: 225000,
          responseTime: '150ms',
          targetResponseTime: '< 200ms',
        },
        triggers: ['CPU > 70%', 'Memory > 80%', 'Concurrent users > 70K'],
      },
      kulturio: {
        currentUsers: 150000,
        targetUsers: 750000, // 5x growth for global expansion
        currentInstances: 8,
        targetInstances: 24,
        currentCost: 32450,
        projectedCost: 89650,
        resources: [
          { type: 'telemedicine-platform', current: 4, target: 20, scalingFactor: 5 },
          { type: 'ai-analysis', current: 6, target: 18, scalingFactor: 3 },
          { type: 'patient-database', current: 8, target: 16, scalingFactor: 2 },
          { type: 'imaging-storage', current: 6, target: 12, scalingFactor: 2 },
        ],
        metrics: {
          peakConcurrent: 500,
          targetConcurrent: 2500,
          responseTime: '300ms',
          targetResponseTime: '< 400ms',
        },
        triggers: ['Active sessions > 400', 'AI queue > 50', 'Database connections > 80%'],
      },
      uniedu: {
        currentUsers: 385000,
        targetUsers: 423500, // 10% annual growth
        currentInstances: 18,
        targetInstances: 22,
        currentCost: 24650,
        projectedCost: 28950,
        resources: [
          { type: 'analytics-engines', current: 18, target: 22, scalingFactor: 1.22 },
          { type: 'lms-servers', current: 6, target: 8, scalingFactor: 1.33 },
          { type: 'research-compute', current: 64, target: 80, scalingFactor: 1.25 },
          { type: 'student-portals', current: 12, target: 15, scalingFactor: 1.25 },
        ],
        metrics: {
          peakConcurrent: 50000,
          targetConcurrent: 55000,
          responseTime: '200ms',
          targetResponseTime: '< 250ms',
        },
        triggers: ['Enrollment periods', 'Research compute demand', 'Concurrent students > 45K'],
      },
    };

    setScalingData(scalingContexts[entity] || scalingContexts.tvfone);
  };

  const handleStepClick = (step: ScalingStep) => {
    setCurrentStep(step);
  };

  const handleStepComplete = (step: ScalingStep, artifact?: {name: string; type: string; size: string; content?: string}) => {
    console.log(`Scaling step ${step} completed`);
    
    // Mark step as completed
    setCompletedSteps(prev => new Set([...prev, step]));
    setStepStatuses(prev => ({ ...prev, [step]: 'completed' }));
    
    // Store artifact if provided
    if (artifact) {
      const stepArtifact: ScalingArtifact = {
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

  const downloadArtifact = (artifact: ScalingArtifact) => {
    const content = artifact.content || `# ${artifact.name}\\n\\nGenerated on: ${new Date().toISOString()}\\nStep: ${artifact.step}\\nType: ${artifact.type}\\nSize: ${artifact.size}\\n\\nThis is a scaling artifact generated during the auto-scaling configuration process.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${artifact.name.replace(/\\s+/g, '_')}.${artifact.type.toLowerCase()}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
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
            <div className="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="h-10 w-10 text-white" />
            </div>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-gray-900 mb-4"
          >
            Auto-Scaling Configured Successfully!
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-gray-600 mb-8"
          >
            Your auto-scaling configuration is now active and monitoring your infrastructure for optimal performance.
          </motion.p>

          {artifacts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-8"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Generated Scaling Artifacts</h3>
              <div className="space-y-3">
                {artifacts.map((artifact) => (
                  <div
                    key={artifact.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-purple-500 rounded-full">
                        <FileText className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{artifact.name}</h4>
                        <p className="text-sm text-gray-600">{artifact.type} • {artifact.size}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => downloadArtifact(artifact)}
                      className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-md text-sm"
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
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              Configure New Scaling
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Auto-Scaling Wizard
          </h1>
          <p className="text-lg text-gray-600">
            Configure intelligent auto-scaling for optimal performance
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Step Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Scaling Steps
              </h2>
              <div className="space-y-3">
                {steps.map((step, index) => {
                  const config = SCALING_STEPS[step];
                  const status = stepStatuses[step];
                  const isActive = step === currentStep;
                  const isCompleted = completedSteps.has(step);
                  
                  return (
                    <div
                      key={step}
                      onClick={() => handleStepClick(step)}
                      className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                        isActive 
                          ? 'border-purple-500 bg-purple-50' 
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
                            ? 'bg-purple-500' 
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
                            isActive ? 'text-purple-900' : isCompleted ? 'text-green-900' : 'text-gray-900'
                          }`}>
                            {config.title}
                          </h3>
                          <p className={`text-xs ${
                            isActive ? 'text-purple-600' : isCompleted ? 'text-green-600' : 'text-gray-600'
                          }`}>
                            {config.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Scaling Progress Panel */}
              {scalingData && (
                <div className="mt-6 bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Scaling Progress
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Steps Completed</span>
                      <span>{completedSteps.size}/{steps.length}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(completedSteps.size / steps.length) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {completedSteps.size === steps.length ? 'Auto-Scaling Ready!' : `${steps.length - completedSteps.size} steps remaining`}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Step Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-purple-500 rounded-full">
                    <span className="text-lg font-bold text-white">
                      {steps.indexOf(currentStep) + 1}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {SCALING_STEPS[currentStep].title}
                    </h2>
                    <p className="text-gray-600">
                      {SCALING_STEPS[currentStep].description}
                    </p>
                  </div>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Environment Setup Step */}
                  {currentStep === 'environment' && (
                    <EnvironmentSetupStep 
                      wizardType="scaling"
                      onComplete={(artifact) => {
                        console.log('EnvironmentSetupStep completed with artifact:', artifact);
                        handleStepComplete(currentStep, artifact);
                      }}
                    />
                  )}

                  {/* Business Entity Context */}
                  {currentStep !== 'environment' && scalingData && (
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Scaling Overview</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">{scalingData.currentUsers.toLocaleString()}</div>
                          <div className="text-sm text-gray-600">Current Users</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">{scalingData.targetUsers.toLocaleString()}</div>
                          <div className="text-sm text-gray-600">Target Users</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{Math.round((scalingData.targetUsers / scalingData.currentUsers) * 100)}%</div>
                          <div className="text-sm text-gray-600">Growth Factor</div>
                        </div>
                      </div>

                      {/* Resource Scaling Details */}
                      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {scalingData.resources.slice(0, 4).map((resource: any, index: number) => (
                          <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                            <h4 className="font-medium text-gray-900 mb-2">{resource.type.replace('-', ' ').replace(/\\b\\w/g, (l: string) => l.toUpperCase())}</h4>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Current: {resource.current}</span>
                              <span className="text-purple-600 font-medium">Target: {resource.target}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Step-specific content */}
                  {currentStep !== 'environment' && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Zap className="h-8 w-8 text-purple-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {SCALING_STEPS[currentStep].title} in Progress
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Click continue to proceed with {SCALING_STEPS[currentStep].title.toLowerCase()}
                      </p>
                      <button
                        onClick={() => {
                          const artifact = {
                            name: `${SCALING_STEPS[currentStep].title} Configuration`,
                            type: 'JSON',
                            size: '1.8 MB',
                            content: `# ${SCALING_STEPS[currentStep].title} Configuration\\n\\nGenerated: ${new Date().toISOString()}\\n\\nThis configuration contains auto-scaling settings and policies for ${SCALING_STEPS[currentStep].title.toLowerCase()}.`
                          };
                          handleStepComplete(currentStep, artifact);
                        }}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium"
                      >
                        Complete {SCALING_STEPS[currentStep].title}
                      </button>
                    </div>
                  </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Artifacts Detail Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Scaling Artifacts
              </h2>
              
              {artifacts.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-sm text-gray-500 mb-2">No artifacts generated yet</p>
                  <p className="text-xs text-gray-400">Complete scaling steps to generate configurations</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {artifacts.map((artifact) => (
                    <motion.div
                      key={artifact.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-purple-500 rounded-full">
                            <FileText className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 text-sm">{artifact.name}</h4>
                            <p className="text-xs text-gray-500">{artifact.step} Step</p>
                          </div>
                        </div>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {artifact.type}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{artifact.size}</span>
                        <button
                          onClick={() => downloadArtifact(artifact)}
                          className="flex items-center space-x-1 text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 px-2 py-1 rounded"
                        >
                          <Download className="h-3 w-3" />
                          <span>Download</span>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
