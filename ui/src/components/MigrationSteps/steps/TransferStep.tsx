'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Database,
  Server,
  HardDrive,
  AlertTriangle,
  CheckCircle,
  Loader,
} from 'lucide-react';
import type { Resource } from '@/types/migration';

interface TransferStatus {
  bytesTransferred: number;
  totalBytes: number;
  speed: string;
  estimatedTimeRemaining: string;
  errors: string[];
}

interface TransferStepProps {
  onComplete: () => void;
}

export const TransferStep: React.FC<TransferStepProps> = ({ onComplete }) => {
  const [isTransferring, setIsTransferring] = useState(false);
  const [currentResource, setCurrentResource] = useState<Resource | null>(null);
  const [completedResources, setCompletedResources] = useState<Resource[]>([]);
  const [transferStatus, setTransferStatus] = useState<TransferStatus>({
    bytesTransferred: 0,
    totalBytes: 1024 * 1024 * 1024 * 100, // 100GB
    speed: '0 MB/s',
    estimatedTimeRemaining: 'Calculating...',
    errors: [],
  });

  // Mock resources to transfer
  const resources: Resource[] = [
    {
      id: '1',
      name: 'Main Database',
      type: 'database',
      status: 'not_started',
      metadata: {
        size: '50GB',
        type: 'PostgreSQL',
      },
    },
    {
      id: '2',
      name: 'Application Server',
      type: 'server',
      status: 'not_started',
      metadata: {
        size: '30GB',
        type: 'Linux VM',
      },
    },
    {
      id: '3',
      name: 'Storage Volume',
      type: 'storage',
      status: 'not_started',
      metadata: {
        size: '20GB',
        type: 'Block Storage',
      },
    },
  ];

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'database':
        return Database;
      case 'server':
        return Server;
      case 'storage':
        return HardDrive;
      default:
        return Server;
    }
  };

  const startTransfer = async () => {
    setIsTransferring(true);

    for (const resource of resources) {
      setCurrentResource(resource);
      
      // Simulate transfer progress
      const totalBytes = parseInt(resource.metadata.size) * 1024 * 1024 * 1024;
      let bytesTransferred = 0;

      while (bytesTransferred < totalBytes) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        const increment = Math.min(
          totalBytes - bytesTransferred,
          1024 * 1024 * 100 // 100MB chunks
        );
        bytesTransferred += increment;

        const speed = `${Math.round(increment / (1024 * 1024))} MB/s`;
        const remaining = Math.round((totalBytes - bytesTransferred) / (increment * 2));
        
        setTransferStatus({
          bytesTransferred,
          totalBytes,
          speed,
          estimatedTimeRemaining: `${remaining} seconds`,
          errors: [],
        });
      }

      setCompletedResources((prev) => [...prev, resource]);
    }

    setIsTransferring(false);
    setCurrentResource(null);
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i))} ${sizes[i]}`;
  };

  const getProgress = () => {
    if (!currentResource) return 0;
    return (transferStatus.bytesTransferred / transferStatus.totalBytes) * 100;
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-medium">Resource Transfer</h3>
          <button
            onClick={startTransfer}
            disabled={isTransferring}
            className="rounded-md bg-sirsi-500 px-4 py-2 text-white hover:bg-sirsi-600 disabled:opacity-50"
          >
            {isTransferring ? 'Transferring...' : 'Start Transfer'}
          </button>
        </div>

        {/* Resource List */}
        <div className="space-y-4">
          {resources.map((resource) => {
            const Icon = getResourceIcon(resource.type);
            const isCompleted = completedResources.find((r) => r.id === resource.id);
            const isCurrent = currentResource?.id === resource.id;

            return (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-gray-100 bg-gray-50 p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Icon className="mr-3 h-5 w-5 text-sirsi-500" />
                    <div>
                      <h4 className="font-medium">{resource.name}</h4>
                      <p className="text-sm text-gray-600">
                        {resource.metadata.type} • {resource.metadata.size}
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

                {isCurrent && (
                  <div className="mt-4">
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-gray-600">
                        {formatBytes(transferStatus.bytesTransferred)} of{' '}
                        {formatBytes(transferStatus.totalBytes)}
                      </span>
                      <span className="text-gray-600">{transferStatus.speed}</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-200">
                      <motion.div
                        className="h-full rounded-full bg-sirsi-500"
                        initial={{ width: '0%' }}
                        animate={{ width: `${getProgress()}%` }}
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      Estimated time remaining: {transferStatus.estimatedTimeRemaining}
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Transfer Summary */}
      {completedResources.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-medium">Transfer Summary</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
              <div className="text-2xl font-bold">{completedResources.length}</div>
              <div className="text-sm text-gray-600">Resources Transferred</div>
            </div>
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
              <div className="text-2xl font-bold">
                {formatBytes(
                  completedResources.reduce(
                    (acc, r) => acc + parseInt(r.metadata.size) * 1024 * 1024 * 1024,
                    0
                  )
                )}
              </div>
              <div className="text-sm text-gray-600">Total Data Transferred</div>
            </div>
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
              <div className="text-2xl font-bold text-green-500">100%</div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
          </div>
        </div>
      )}

      {transferStatus.errors.length > 0 && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />
            <h4 className="font-medium text-yellow-800">Transfer Warnings</h4>
          </div>
          <ul className="mt-2 list-inside list-disc text-sm text-yellow-700">
            {transferStatus.errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={onComplete}
          disabled={completedResources.length !== resources.length}
          className="rounded-md bg-sirsi-500 px-4 py-2 text-white hover:bg-sirsi-600 disabled:opacity-50"
        >
          Continue to Validation
        </button>
      </div>
    </div>
  );
};
