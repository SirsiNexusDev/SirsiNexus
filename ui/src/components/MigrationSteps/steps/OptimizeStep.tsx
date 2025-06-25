'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  DollarSign,
  Zap,
  Leaf,
  Check,
  BarChart,
  Settings,
} from 'lucide-react';

interface Optimization {
  id: string;
  name: string;
  description: string;
  category: 'performance' | 'cost' | 'sustainability';
  impact: 'high' | 'medium' | 'low';
  metrics: {
    before: string;
    after: string;
    improvement: string;
  };
  status: 'pending' | 'applied' | 'skipped';
  recommendation: string;
}

interface OptimizeStepProps {
  onComplete: () => void;
}

export const OptimizeStep: React.FC<OptimizeStepProps> = ({ onComplete }) => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [selectedOptimizations, setSelectedOptimizations] = useState<string[]>([]);

  const [optimizations, setOptimizations] = useState<Optimization[]>([
    {
      id: 'perf-1',
      name: 'Instance Right-sizing',
      description: 'Adjust compute resources based on actual usage patterns',
      category: 'performance',
      impact: 'high',
      metrics: {
        before: '4 vCPU, 16GB RAM',
        after: '2 vCPU, 8GB RAM',
        improvement: '50% resource optimization',
      },
      status: 'pending',
      recommendation: 'Current usage patterns show over-provisioning. Reducing resources will maintain performance while reducing costs.',
    },
    {
      id: 'cost-1',
      name: 'Storage Tier Optimization',
      description: 'Move infrequently accessed data to lower-cost storage',
      category: 'cost',
      impact: 'medium',
      metrics: {
        before: '$120/month',
        after: '$75/month',
        improvement: '37.5% cost reduction',
      },
      status: 'pending',
      recommendation: 'Implement lifecycle policies to automatically move older data to cheaper storage tiers.',
    },
    {
      id: 'sust-1',
      name: 'Carbon Footprint Reduction',
      description: 'Optimize workload scheduling for renewable energy usage',
      category: 'sustainability',
      impact: 'high',
      metrics: {
        before: '2.5 tons CO2/year',
        after: '1.8 tons CO2/year',
        improvement: '28% emissions reduction',
      },
      status: 'pending',
      recommendation: 'Schedule non-time-critical workloads during periods of high renewable energy availability.',
    },
    {
      id: 'perf-2',
      name: 'Network Optimization',
      description: 'Implement CDN and optimize data transfer patterns',
      category: 'performance',
      impact: 'medium',
      metrics: {
        before: '150ms latency',
        after: '50ms latency',
        improvement: '66% latency reduction',
      },
      status: 'pending',
      recommendation: 'Deploy CDN endpoints and optimize data transfer patterns for improved performance.',
    },
  ]);

  const categoryIcons = {
    performance: TrendingUp,
    cost: DollarSign,
    sustainability: Leaf,
  };

  const impactColors = {
    high: 'text-red-500',
    medium: 'text-yellow-500',
    low: 'text-green-500',
  };

  const applyOptimizations = async () => {
    setIsOptimizing(true);

    for (const id of selectedOptimizations) {
      // Simulate optimization process
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setOptimizations((prev) =>
        prev.map((opt) =>
          opt.id === id ? { ...opt, status: 'applied' } : opt
        )
      );
    }

    // Mark unselected optimizations as skipped
    setOptimizations((prev) =>
      prev.map((opt) =>
        !selectedOptimizations.includes(opt.id)
          ? { ...opt, status: 'skipped' }
          : opt
      )
    );

    setIsOptimizing(false);
  };

  const toggleOptimization = (id: string) => {
    setSelectedOptimizations((prev) =>
      prev.includes(id)
        ? prev.filter((optId) => optId !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Resource Optimization</h3>
            <p className="text-sm text-gray-600">
              Select optimizations to apply to your migrated resources
            </p>
          </div>
          <button
            onClick={applyOptimizations}
            disabled={isOptimizing || selectedOptimizations.length === 0}
            className="rounded-md bg-sirsi-500 px-4 py-2 text-white hover:bg-sirsi-600 disabled:opacity-50"
          >
            {isOptimizing ? 'Optimizing...' : 'Apply Selected'}
          </button>
        </div>

        <div className="space-y-4">
          {optimizations.map((optimization, index) => {
            const CategoryIcon = categoryIcons[optimization.category];
            return (
              <motion.div
                key={optimization.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-lg border p-4 ${
                  selectedOptimizations.includes(optimization.id)
                    ? 'border-sirsi-500 bg-sirsi-50'
                    : 'border-gray-100 bg-gray-50'
                }`}
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-start">
                    <div className="mr-4">
                      <input
                        type="checkbox"
                        checked={selectedOptimizations.includes(optimization.id)}
                        onChange={() => toggleOptimization(optimization.id)}
                        disabled={optimization.status !== 'pending'}
                        className="h-4 w-4 rounded border-gray-300 text-sirsi-500 focus:ring-sirsi-500"
                      />
                    </div>
                    <div>
                      <div className="flex items-center">
                        <CategoryIcon className="mr-2 h-5 w-5 text-sirsi-500" />
                        <h4 className="font-medium">{optimization.name}</h4>
                        <span
                          className={`ml-2 rounded-full px-2 py-1 text-xs ${
                            impactColors[optimization.impact]
                          }`}
                        >
                          {optimization.impact} impact
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        {optimization.description}
                      </p>
                    </div>
                  </div>
                  {optimization.status !== 'pending' && (
                    <span
                      className={`flex items-center rounded-full px-2 py-1 text-xs ${
                        optimization.status === 'applied'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {optimization.status === 'applied' && (
                        <Check className="mr-1 h-3 w-3" />
                      )}
                      {optimization.status}
                    </span>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div className="rounded border border-gray-100 bg-white p-3">
                    <div className="text-xs text-gray-500">Before</div>
                    <div className="mt-1 font-medium">
                      {optimization.metrics.before}
                    </div>
                  </div>
                  <div className="rounded border border-gray-100 bg-white p-3">
                    <div className="text-xs text-gray-500">After</div>
                    <div className="mt-1 font-medium">
                      {optimization.metrics.after}
                    </div>
                  </div>
                  <div className="rounded border border-gray-100 bg-white p-3">
                    <div className="text-xs text-gray-500">Improvement</div>
                    <div className="mt-1 font-medium text-green-500">
                      {optimization.metrics.improvement}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-start rounded-lg bg-gray-50 p-3">
                  <Settings className="mr-2 mt-0.5 h-4 w-4 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    {optimization.recommendation}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Optimization Summary */}
      {optimizations.some((opt) => opt.status !== 'pending') && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-medium">Optimization Impact</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
              <div className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-sirsi-500" />
                <h4 className="font-medium">Performance</h4>
              </div>
              <div className="mt-2 text-2xl font-bold text-sirsi-500">58%</div>
              <div className="text-sm text-gray-600">Average improvement</div>
            </div>
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
              <div className="flex items-center">
                <DollarSign className="mr-2 h-5 w-5 text-sirsi-500" />
                <h4 className="font-medium">Cost Savings</h4>
              </div>
              <div className="mt-2 text-2xl font-bold text-sirsi-500">
                $45/mo
              </div>
              <div className="text-sm text-gray-600">Projected savings</div>
            </div>
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
              <div className="flex items-center">
                <Leaf className="mr-2 h-5 w-5 text-sirsi-500" />
                <h4 className="font-medium">Sustainability</h4>
              </div>
              <div className="mt-2 text-2xl font-bold text-sirsi-500">
                0.7 tons
              </div>
              <div className="text-sm text-gray-600">CO₂ reduction/year</div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={onComplete}
          disabled={isOptimizing || optimizations.some((opt) => opt.status === 'pending')}
          className="rounded-md bg-sirsi-500 px-4 py-2 text-white hover:bg-sirsi-600 disabled:opacity-50"
        >
          Continue to Support
        </button>
      </div>
    </div>
  );
};
