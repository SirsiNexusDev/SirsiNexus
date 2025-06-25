'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Server, Database, Cloud, Bot, MessageSquare, 
  Sparkles, CheckCircle, AlertTriangle, Info, RefreshCw 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  const [agentMessage, setAgentMessage] = useState('');
  const [discoveryProgress, setDiscoveryProgress] = useState(0);
  const [showAgentChat, setShowAgentChat] = useState(false);

  // Mock resource types for demonstration
  const resourceTypes: ResourceTypeCount[] = [
    { type: 'Virtual Machines', count: 12, icon: Server },
    { type: 'Databases', count: 3, icon: Database },
    { type: 'Storage Buckets', count: 8, icon: Cloud },
  ];

  const agentMessages = [
    'Scanning your cloud infrastructure...',
    'Analyzing AWS resources in us-east-1...',
    'Discovering EC2 instances and databases...',
    'Mapping dependencies and relationships...',
    'Generating migration compatibility matrix...',
    'Discovery complete! Found 23 resources.',
  ];

  const startDiscovery = async () => {
    setIsDiscovering(true);
    setShowAgentChat(true);
    setDiscoveryProgress(0);
    
    // Simulate agent discovery with progress
    for (let i = 0; i < agentMessages.length; i++) {
      setAgentMessage(agentMessages[i]);
      setDiscoveryProgress((i + 1) / agentMessages.length * 100);
      await new Promise((resolve) => setTimeout(resolve, 800));
    }
    
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
          region: 'us-east-1',
        },
      },
      {
        id: '2',
        name: 'web-server-cluster',
        type: 'compute',
        status: 'not_started',
        metadata: {
          instanceType: 't3.large',
          count: '3',
          os: 'Ubuntu 20.04',
          region: 'us-east-1',
        },
      },
      {
        id: '3',
        name: 'data-warehouse',
        type: 'database',
        status: 'not_started',
        metadata: {
          engine: 'redshift',
          nodes: '4',
          size: '2.5TB',
          region: 'us-west-2',
        },
      },
    ];
    
    setResources(mockResources);
    setIsDiscovering(false);
    
    // Final agent message
    setTimeout(() => {
      setAgentMessage('Ready to proceed with migration planning!');
    }, 500);
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

      {/* AI Agent Chat Interface */}
      <AnimatePresence>
        {showAgentChat && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-lg border border-sirsi-200 bg-sirsi-50 p-6"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex items-center justify-center w-8 h-8 bg-sirsi-500 rounded-full">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div>
                <h4 className="font-medium text-sirsi-900">Discovery Agent</h4>
                <p className="text-sm text-sirsi-600">AI-powered infrastructure discovery</p>
              </div>
            </div>
            
            {/* Progress Bar */}
            {isDiscovering && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-sirsi-700">Discovery Progress</span>
                  <span className="text-sm text-sirsi-600">{Math.round(discoveryProgress)}%</span>
                </div>
                <div className="w-full bg-sirsi-200 rounded-full h-2">
                  <motion.div
                    className="bg-sirsi-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${discoveryProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}
            
            {/* Agent Message */}
            <motion.div
              key={agentMessage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start space-x-3"
            >
              <MessageSquare className="h-5 w-5 text-sirsi-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-sirsi-800">{agentMessage}</p>
                {isDiscovering && (
                  <div className="flex items-center space-x-1 mt-2">
                    <RefreshCw className="h-3 w-3 text-sirsi-500 animate-spin" />
                    <span className="text-xs text-sirsi-600">Working...</span>
                  </div>
                )}
                {!isDiscovering && resources.length > 0 && (
                  <div className="flex items-center space-x-1 mt-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-700">Discovery completed successfully</span>
                  </div>
                )}
              </div>
            </motion.div>
            
            {/* Agent Suggestions */}
            {!isDiscovering && resources.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-4 p-3 bg-white rounded-lg border border-sirsi-100"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium text-gray-900">AI Recommendations</span>
                </div>
                <div className="space-y-1 text-sm text-gray-700">
                  <p>• Consider migrating databases first to establish connectivity</p>
                  <p>• Group resources by region to optimize network transfer costs</p>
                  <p>• Schedule migration during low-traffic hours (2-4 AM EST)</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setShowAgentChat(!showAgentChat)}
          className="flex items-center space-x-2"
        >
          <MessageSquare className="h-4 w-4" />
          <span>{showAgentChat ? 'Hide' : 'Show'} Agent Chat</span>
        </Button>
        
        <Button
          onClick={onComplete}
          disabled={resources.length === 0}
          className="bg-sirsi-500 hover:bg-sirsi-600"
        >
          Continue to Requirements
        </Button>
      </div>
    </div>
  );
};
