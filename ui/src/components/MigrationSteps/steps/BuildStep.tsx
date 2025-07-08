'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Server, Database, Cloud, Settings, CheckCircle, Loader } from 'lucide-react';

interface BuildStepProps {
  onComplete: (artifact?: {name: string; type: string; size: string; content?: string}) => void;
}

export const BuildStep: React.FC<BuildStepProps> = ({ onComplete }) => {
  const [isBuilding, setIsBuilding] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);

  const buildTasks = [
    { id: 'network', name: 'Network Configuration', icon: Cloud },
    { id: 'storage', name: 'Storage Provisioning', icon: Database },
    { id: 'compute', name: 'Compute Resources', icon: Server },
    { id: 'monitoring', name: 'Monitoring Setup', icon: Settings }
  ];

  const startBuilding = async () => {
    setIsBuilding(true);
    setCompletedTasks([]);

    for (const task of buildTasks) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate time to complete task
      setCompletedTasks(prev => [...prev, task.id]);
    }

    setIsBuilding(false);
  };

  const canProceed = completedTasks.length === buildTasks.length;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium">Infrastructure Build</h3>
            <p className="text-sm text-gray-600">Deploy and configure infrastructure components</p>
          </div>
          <button
            onClick={startBuilding}
            disabled={isBuilding}
            className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
          >
            {isBuilding ? 'Building...' : 'Start Build'}
          </button>
        </div>

        <div className="space-y-4">
          {buildTasks.map(task => {
            const Icon = task.icon;
            const isCompleted = completedTasks.includes(task.id);
            const isCurrent = isBuilding && !isCompleted && completedTasks.length === buildTasks.indexOf(task);

            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded border p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Icon className="mr-3 h-5 w-5 text-indigo-600" />
                    <div>
                      <h4 className="font-medium">{task.name}</h4>
                    </div>
                  </div>
                  {isCompleted ? <CheckCircle className="h-5 w-5 text-green-500" /> : isCurrent ? <Loader className="h-5 w-5 animate-spin text-blue-500" /> : null}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => {
            const artifact = {
              name: 'Build Log',
              type: 'LOG',
              size: '1 MB',
              content: `# Build Log\n\nCompleted Tasks:\n${completedTasks.map(id => `- ${id}: completed`).join('\n')}`
            };
            onComplete(artifact);
          }}
          disabled={!canProceed}
          className="rounded-md bg-green-500 px-4 py-2 text-white hover:bg-green-600 disabled:opacity-50"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

