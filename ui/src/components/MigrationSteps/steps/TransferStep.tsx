'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight, Database, Server, HardDrive, AlertTriangle, CheckCircle, Loader,
  Network, Shield, Settings
} from 'lucide-react';

interface TransferStepProps {
  onComplete: (artifact?: {name: string; type: string; size: string; content?: string}) => void;
}

export const TransferStep: React.FC<TransferStepProps> = ({ onComplete }) => {
  const [isTransferring, setIsTransferring] = useState(false);
  const [completedResources, setCompletedResources] = useState<string[]>([]);

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

    for (const resource of basicResources) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setCompletedResources(prev => [...prev, resource.id]);
    }

    setIsTransferring(false);
  };

  const canProceed = completedResources.length === basicResources.length;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">Transfer Infrastructure</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Transfer selected infrastructure components to the target environment
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
                {isCompleted ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : isCurrent ? (
                  <Loader className="h-5 w-5 animate-spin text-blue-500" />
                ) : (
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                )}
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
