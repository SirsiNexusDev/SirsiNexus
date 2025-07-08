'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight, Database, Server, HardDrive, AlertTriangle, CheckCircle, Loader,
  Network, Shield, Settings
} from 'lucide-react';
import { trackMigrationStep, trackUserInteraction, trackError, trackPerformance } from '@/lib/analytics';

interface TransferStepProps {
  onComplete: (artifact?: {name: string; type: string; size: string; content?: string}) => void;
}

export const TransferStep: React.FC<TransferStepProps> = ({ onComplete }) => {
  const [isTransferring, setIsTransferring] = useState(false);
  const [completedResources, setCompletedResources] = useState<string[]>([]);
  const [transferProgress, setTransferProgress] = useState<Record<string, number>>({});
  const [transferMetrics, setTransferMetrics] = useState<any>(null);
  const [aiOptimizations, setAiOptimizations] = useState<any[]>([]);
  const [networkLatency, setNetworkLatency] = useState<number>(0);
  const [throughput, setThroughput] = useState<string>('0 MB/s');
  const [isExpanded, setIsExpanded] = useState(false);
  const [transferStartTime, setTransferStartTime] = useState<number>(0);

  const basicResources = [
    { id: 'database', name: 'Main Database', icon: Database, size: '2.5TB' },
    { id: 'appserver', name: 'Application Server', icon: Server, size: '250GB' },
    { id: 'storage', name: 'Storage Volume', icon: HardDrive, size: '1TB' },
    { id: 'network', name: 'Network Config', icon: Network, size: '100MB' },
    { id: 'security', name: 'Security Policies', icon: Shield, size: '50MB' }
  ];

  const startTransfer = async () => {
    setIsTransferring(true);
    setCompletedResources([]);
    setTransferStartTime(Date.now());
    trackMigrationStep('transfer_started', { resourceCount: basicResources.length });

    for (const resource of basicResources) {
      try {
        // Initialize progress tracking
        setTransferProgress(prev => ({ ...prev, [resource.id]: 0 }));
        
        // Simulate realistic transfer with progress updates
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 200));
          setTransferProgress(prev => ({ ...prev, [resource.id]: progress }));
          
          // Simulate network metrics
          setNetworkLatency(Math.floor(Math.random() * 50) + 10);
          setThroughput(`${(Math.random() * 100 + 50).toFixed(1)} MB/s`);
        }
        
        setCompletedResources(prev => [...prev, resource.id]);
        
        // Track transfer metrics
        setTransferMetrics(prev => ({
          ...prev,
          [resource.id]: {
            transferTime: Date.now() - transferStartTime,
            size: resource.size,
            throughput: throughput,
            latency: networkLatency
          }
        }));
        
        trackUserInteraction('resource_transfer', 'TransferStep', { 
          resourceId: resource.id,
          size: resource.size,
          latency: networkLatency
        });

      } catch (error) {
        trackError(new Error('Transfer failed for ' + resource.id), {
          component: 'TransferStep',
          resource: resource.id
        });
      }
    }

    trackMigrationStep('transfer_completed', { completedCount: completedResources.length });
    setIsTransferring(false);
  };

  const canProceed = completedResources.length === basicResources.length;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">Transfer Infrastructure</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Transfer selected infrastructure components to the target environment using AI-recommended optimizations and strategies
        </p>
        
        <button
          onClick={startTransfer}
          disabled={isTransferring}
          className="rounded-md bg-sirsi-500 px-6 py-3 text-white hover:bg-sirsi-600 disabled:opacity-50 font-medium"
        >
          {isTransferring ? 'Transferring...' : 'Start Transfer'}
        </button>
      </div>

      <div className="space-y-4">
        {basicResources.map((resource) => {
          const Icon = resource.icon;
          const isCompleted = completedResources.includes(resource.id);
          const isCurrent = isTransferring && !isCompleted && completedResources.length === basicResources.findIndex(r => r.id === resource.id);

          return (
            <motion.div
              key={resource.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-gray-100 bg-gray-50 dark:bg-gray-900 p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Icon className="mr-3 h-5 w-5 text-sirsi-500" />
                  <div>
                    <h4 className="font-medium">{resource.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Size: {resource.size}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  {/* Status indicator */}
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : isCurrent ? (
                    <Loader className="h-5 w-5 animate-spin text-blue-500" />
                  ) : (
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  )}
                  
                  {/* Progress bar for current transfer */}
                  {isCurrent && transferProgress[resource.id] !== undefined && (
                    <div className="mt-2 w-24">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${transferProgress[resource.id]}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{transferProgress[resource.id]}%</p>
                    </div>
                  )}
                  
                  {/* Transfer metrics */}
                  {isCompleted && transferMetrics?.[resource.id] && (
                    <div className="mt-2 text-xs text-gray-500">
                      <p>Latency: {transferMetrics[resource.id].latency}ms</p>
                      <p>Throughput: {transferMetrics[resource.id].throughput}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {completedResources.length > 0 && (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
          <h3 className="mb-4 text-lg font-medium">Transfer Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-gray-100 bg-gray-50 dark:bg-gray-900 p-4">
              <div className="text-2xl font-bold">{completedResources.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Resources Transferred</div>
            </div>
            <div className="rounded-lg border border-gray-100 bg-gray-50 dark:bg-gray-900 p-4">
              <div className="text-2xl font-bold text-green-500">100%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={() => {
            const artifact = {
              name: 'Transfer Execution Log',
              type: 'LOG',
              size: '12.3 MB',
              content: `# Transfer Execution Log\n\nGenerated on: ${new Date().toISOString()}\n\nCompleted Resources:\n${completedResources.map(id => `- ${id}: transferred`).join('\n')}`
            };
            onComplete(artifact);
          }}
          disabled={!canProceed}
          className="rounded-md bg-sirsi-500 px-4 py-2 text-white hover:bg-sirsi-600 disabled:opacity-50 text-lg px-8 py-4 font-bold"
        >
          Continue to Validation
        </button>
      </div>
    </div>
  );
};
