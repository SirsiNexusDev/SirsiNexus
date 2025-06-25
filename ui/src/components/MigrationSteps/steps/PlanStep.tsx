import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Server, Database, Cloud } from 'lucide-react';
import type { Resource } from '@/types/migration';

interface ResourceTypeCount {
  type: string;
  count: number;
  icon: React.ElementType;
}

interface PlanStepProps {
  onComplete: () => void;
}

export const PlanStep: React.FC<PlanStepProps> = ({ onComplete }) => {
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [resources, setResources] = useState<Resource[]>([]);

  // Mock resource types for demonstration
  const resourceTypes: ResourceTypeCount[] = [
    { type: 'Virtual Machines', count: 12, icon: Server },
    { type: 'Databases', count: 3, icon: Database },
    { type: 'Storage Buckets', count: 8, icon: Cloud },
  ];

  const startDiscovery = async () => {
    setIsDiscovering(true);
    // Mock discovery process
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // Mock discovered resources
    const mockResources: Resource[] = [
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
      // Add more mock resources as needed
    ];
    
    setResources(mockResources);
    setIsDiscovering(false);
  };

  return (
    <div className="space-y-6">
      {/* Discovery Section */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-medium">Resource Discovery</h3>
        
        <button
          onClick={startDiscovery}
          disabled={isDiscovering}
          className="mb-6 flex items-center rounded-md bg-sirsi-500 px-4 py-2 text-white hover:bg-sirsi-600 disabled:opacity-50"
        >
          <Search className="mr-2 h-5 w-5" />
          {isDiscovering ? 'Discovering...' : 'Start Discovery'}
        </button>

        {/* Resource Type Summary */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {resourceTypes.map((rt) => (
            <motion.div
              key={rt.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-gray-100 bg-gray-50 p-4"
            >
              <div className="flex items-center">
                <rt.icon className="mr-3 h-6 w-6 text-sirsi-500" />
                <div>
                  <p className="font-medium">{rt.type}</p>
                  <p className="text-sm text-gray-600">{rt.count} found</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Resource List */}
      {resources.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-medium">Discovered Resources</h3>
          <div className="space-y-2">
            {resources.map((resource) => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-lg border border-gray-100 p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{resource.name}</p>
                    <p className="text-sm text-gray-600">{resource.type}</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {Object.entries(resource.metadata).map(([key, value]) => (
                      <p key={key}>
                        {key}: <span className="font-medium">{value}</span>
                      </p>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={onComplete}
          disabled={resources.length === 0}
          className="rounded-md bg-sirsi-500 px-4 py-2 text-white hover:bg-sirsi-600 disabled:opacity-50"
        >
          Continue to Requirements
        </button>
      </div>
    </div>
  );
};
