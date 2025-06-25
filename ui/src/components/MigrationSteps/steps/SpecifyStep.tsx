'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertCircle, Database, Server, Network, Clock, Bot, 
  Sparkles, TrendingUp, Shield, DollarSign, Zap, CheckCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Resource, RiskAssessment } from '@/types/migration';

interface SpecifyStepProps {
  resources: Resource[];
  onComplete: (requirements: MigrationRequirements) => void;
}

interface MigrationRequirements {
  downtime: string;
  networkBandwidth: string;
  targetSpecs: {
    cpu: string;
    memory: string;
    storage: string;
  };
  schedulePreference: 'weekend' | 'weekday' | 'any';
  compliance: string[];
}

export const SpecifyStep: React.FC<SpecifyStepProps> = ({ resources, onComplete }) => {
  const [requirements, setRequirements] = useState<MigrationRequirements>({
    downtime: '4h',
    networkBandwidth: '1Gbps',
    targetSpecs: {
      cpu: '8 vCPU',
      memory: '32GB',
      storage: '500GB',
    },
    schedulePreference: 'weekend',
    compliance: ['GDPR', 'SOC2'],
  });
  
  const [showAssessmentAgent, setShowAssessmentAgent] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [costEstimate, setCostEstimate] = useState({
    oneTime: 12500,
    monthly: 2800,
    savings: 15,
  });

  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment>({
    score: 75,
    level: 'medium',
    findings: [
      {
        category: 'Performance',
        description: 'Network bandwidth might be insufficient for large databases',
        impact: 'Could extend migration duration',
        recommendation: 'Consider upgrading network capacity or splitting migration batches',
      },
      {
        category: 'Compliance',
        description: 'Data transfer across regions requires encryption',
        impact: 'Additional security measures needed',
        recommendation: 'Enable in-transit encryption and verify compliance requirements',
      },
    ],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(requirements);
  };

  return (
    <div className="space-y-6">
      {/* Requirements Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-medium">Migration Requirements</h3>

          {/* Resource Summary */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex items-center rounded-lg border border-gray-100 bg-gray-50 p-4">
              <Server className="mr-3 h-6 w-6 text-sirsi-500" />
              <div>
                <p className="font-medium">Resources</p>
                <p className="text-sm text-gray-600">{resources.length} total</p>
              </div>
            </div>

            <div className="flex items-center rounded-lg border border-gray-100 bg-gray-50 p-4">
              <Clock className="mr-3 h-6 w-6 text-sirsi-500" />
              <div>
                <p className="font-medium">Estimated Duration</p>
                <p className="text-sm text-gray-600">4-6 hours</p>
              </div>
            </div>

            <div className="flex items-center rounded-lg border border-gray-100 bg-gray-50 p-4">
              <Network className="mr-3 h-6 w-6 text-sirsi-500" />
              <div>
                <p className="font-medium">Network Required</p>
                <p className="text-sm text-gray-600">{requirements.networkBandwidth}</p>
              </div>
            </div>
          </div>

          {/* Target Specifications */}
          <div className="mb-6">
            <h4 className="mb-2 font-medium">Target Environment Specifications</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">CPU</label>
                <select
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-sirsi-500 focus:outline-none"
                  value={requirements.targetSpecs.cpu}
                  onChange={(e) =>
                    setRequirements({
                      ...requirements,
                      targetSpecs: { ...requirements.targetSpecs, cpu: e.target.value },
                    })
                  }
                >
                  <option>4 vCPU</option>
                  <option>8 vCPU</option>
                  <option>16 vCPU</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Memory</label>
                <select
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-sirsi-500 focus:outline-none"
                  value={requirements.targetSpecs.memory}
                  onChange={(e) =>
                    setRequirements({
                      ...requirements,
                      targetSpecs: { ...requirements.targetSpecs, memory: e.target.value },
                    })
                  }
                >
                  <option>16GB</option>
                  <option>32GB</option>
                  <option>64GB</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Storage</label>
                <select
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-sirsi-500 focus:outline-none"
                  value={requirements.targetSpecs.storage}
                  onChange={(e) =>
                    setRequirements({
                      ...requirements,
                      targetSpecs: { ...requirements.targetSpecs, storage: e.target.value },
                    })
                  }
                >
                  <option>250GB</option>
                  <option>500GB</option>
                  <option>1TB</option>
                </select>
              </div>
            </div>
          </div>

          {/* Schedule Preference */}
          <div className="mb-6">
            <h4 className="mb-2 font-medium">Schedule Preference</h4>
            <div className="flex space-x-4">
              {['weekend', 'weekday', 'any'].map((pref) => (
                <label
                  key={pref}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="radio"
                    name="schedule"
                    value={pref}
                    checked={requirements.schedulePreference === pref}
                    onChange={(e) =>
                      setRequirements({
                        ...requirements,
                        schedulePreference: e.target.value as any,
                      })
                    }
                    className="h-4 w-4 text-sirsi-500 focus:ring-sirsi-500"
                  />
                  <span className="text-sm capitalize">{pref}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-medium">Risk Assessment</h3>
          
          <div className="mb-6 flex items-center">
            <div
              className={`mr-4 h-16 w-16 rounded-full ${
                riskAssessment.level === 'low'
                  ? 'bg-green-100'
                  : riskAssessment.level === 'medium'
                  ? 'bg-yellow-100'
                  : 'bg-red-100'
              } flex items-center justify-center`}
            >
              <span
                className={`text-2xl font-bold ${
                  riskAssessment.level === 'low'
                    ? 'text-green-600'
                    : riskAssessment.level === 'medium'
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`}
              >
                {riskAssessment.score}
              </span>
            </div>
            <div>
              <h4 className="font-medium capitalize">{riskAssessment.level} Risk</h4>
              <p className="text-sm text-gray-600">Overall assessment score</p>
            </div>
          </div>

          <div className="space-y-4">
            {riskAssessment.findings.map((finding, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-lg border border-gray-100 bg-gray-50 p-4"
              >
                <div className="flex items-start">
                  <AlertCircle className="mr-3 h-5 w-5 text-yellow-500" />
                  <div>
                    <h5 className="font-medium">{finding.category}</h5>
                    <p className="mt-1 text-sm text-gray-600">{finding.description}</p>
                    <p className="mt-2 text-sm">
                      <strong>Impact:</strong> {finding.impact}
                    </p>
                    <p className="text-sm text-sirsi-600">
                      <strong>Recommendation:</strong> {finding.recommendation}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* AI Assessment Agent Panel */}
        <div className="rounded-lg border border-sirsi-200 bg-sirsi-50 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-sirsi-500 rounded-full">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div>
                <h4 className="font-medium text-sirsi-900">Assessment Agent</h4>
                <p className="text-sm text-sirsi-600">AI-powered cost and risk analysis</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowAssessmentAgent(!showAssessmentAgent)}
            >
              {showAssessmentAgent ? 'Hide Analysis' : 'Show Analysis'}
            </Button>
          </div>
          
          <AnimatePresence>
            {showAssessmentAgent && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-6"
              >
                {/* Cost Estimation */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-sirsi-100">
                    <div className="flex items-center space-x-2 mb-2">
                      <DollarSign className="h-5 w-5 text-green-500" />
                      <span className="font-medium text-gray-900">One-time Cost</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">${costEstimate.oneTime.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Migration execution</p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 border border-sirsi-100">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-blue-500" />
                      <span className="font-medium text-gray-900">Monthly Cost</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">${costEstimate.monthly.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Infrastructure running</p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 border border-sirsi-100">
                    <div className="flex items-center space-x-2 mb-2">
                      <Sparkles className="h-5 w-5 text-purple-500" />
                      <span className="font-medium text-gray-900">Savings</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-600">{costEstimate.savings}%</p>
                    <p className="text-sm text-gray-600">Estimated reduction</p>
                  </div>
                </div>
                
                {/* AI Recommendations */}
                <div className="bg-white rounded-lg p-4 border border-sirsi-100">
                  <div className="flex items-center space-x-2 mb-3">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    <span className="font-medium text-gray-900">AI Recommendations</span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <p>Consider using spot instances for development workloads to reduce costs by 60%</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <p>Schedule migration during weekend hours to minimize business impact</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <p>Enable auto-scaling to optimize resource utilization and costs</p>
                    </div>
                  </div>
                </div>
                
                {/* Performance Insights */}
                <div className="bg-white rounded-lg p-4 border border-sirsi-100">
                  <div className="flex items-center space-x-2 mb-3">
                    <Shield className="h-5 w-5 text-blue-500" />
                    <span className="font-medium text-gray-900">Performance & Security Insights</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h6 className="font-medium text-gray-900 mb-1">Performance</h6>
                      <p className="text-gray-700">Current configuration will handle 2x traffic growth</p>
                      <p className="text-gray-700">Expected 25% performance improvement</p>
                    </div>
                    <div>
                      <h6 className="font-medium text-gray-900 mb-1">Security</h6>
                      <p className="text-gray-700">Encryption at rest and in transit enabled</p>
                      <p className="text-gray-700">Compliance requirements satisfied</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setShowAssessmentAgent(!showAssessmentAgent)}
            className="flex items-center space-x-2"
          >
            <Bot className="h-4 w-4" />
            <span>AI Assessment</span>
          </Button>
          
          <button
            type="submit"
            className="rounded-md bg-sirsi-500 px-4 py-2 text-white hover:bg-sirsi-600"
          >
            Continue to Configuration
          </button>
        </div>
      </form>
    </div>
  );
};
