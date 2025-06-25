import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Database, Server, Network, Clock } from 'lucide-react';
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

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
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
