import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader,
  BarChart,
  Shield,
  Database,
  Network,
} from 'lucide-react';

interface ValidationCheck {
  id: string;
  name: string;
  description: string;
  category: 'performance' | 'security' | 'data' | 'network';
  status: 'pending' | 'running' | 'passed' | 'failed' | 'warning';
  details?: string;
  metrics?: {
    name: string;
    value: string;
    threshold?: string;
    status: 'good' | 'warning' | 'bad';
  }[];
}

interface ValidateStepProps {
  onComplete: () => void;
}

export const ValidateStep: React.FC<ValidateStepProps> = ({ onComplete }) => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationChecks, setValidationChecks] = useState<ValidationCheck[]>([
    {
      id: 'perf-1',
      name: 'Response Time',
      description: 'Measuring application response latency',
      category: 'performance',
      status: 'pending',
      metrics: [
        {
          name: 'Avg Response Time',
          value: '120ms',
          threshold: '< 200ms',
          status: 'good',
        },
        {
          name: 'P95 Response Time',
          value: '350ms',
          threshold: '< 500ms',
          status: 'warning',
        },
      ],
    },
    {
      id: 'sec-1',
      name: 'Security Verification',
      description: 'Checking security configurations and access controls',
      category: 'security',
      status: 'pending',
      metrics: [
        {
          name: 'SSL/TLS',
          value: 'TLS 1.3',
          status: 'good',
        },
        {
          name: 'IAM Roles',
          value: 'Configured',
          status: 'good',
        },
      ],
    },
    {
      id: 'data-1',
      name: 'Data Integrity',
      description: 'Verifying data consistency after migration',
      category: 'data',
      status: 'pending',
      metrics: [
        {
          name: 'Checksum Match',
          value: '100%',
          status: 'good',
        },
        {
          name: 'Record Count',
          value: 'Matched',
          status: 'good',
        },
      ],
    },
    {
      id: 'net-1',
      name: 'Network Configuration',
      description: 'Validating network settings and connectivity',
      category: 'network',
      status: 'pending',
      metrics: [
        {
          name: 'DNS Resolution',
          value: 'Working',
          status: 'good',
        },
        {
          name: 'Firewall Rules',
          value: 'Configured',
          status: 'good',
        },
      ],
    },
  ]);

  const categoryIcons = {
    performance: BarChart,
    security: Shield,
    data: Database,
    network: Network,
  };

  const statusIcons = {
    passed: CheckCircle,
    failed: XCircle,
    warning: AlertTriangle,
    running: Loader,
    pending: Loader,
  };

  const statusColors = {
    passed: 'text-green-500',
    failed: 'text-red-500',
    warning: 'text-yellow-500',
    running: 'text-blue-500',
    pending: 'text-gray-400',
  };

  const startValidation = async () => {
    setIsValidating(true);

    for (const check of validationChecks) {
      // Update check status to running
      setValidationChecks((prev) =>
        prev.map((c) =>
          c.id === check.id ? { ...c, status: 'running' } : c
        )
      );

      // Simulate validation check
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Update check status to final state
      setValidationChecks((prev) =>
        prev.map((c) =>
          c.id === check.id
            ? {
                ...c,
                status: Math.random() > 0.2 ? 'passed' : Math.random() > 0.5 ? 'warning' : 'failed',
              }
            : c
        )
      );
    }

    setIsValidating(false);
  };

  const getStatusBadge = (status: ValidationCheck['status']) => {
    const Icon = statusIcons[status];
    return (
      <div className={`flex items-center ${statusColors[status]}`}>
        <Icon className={`h-5 w-5 ${status === 'running' ? 'animate-spin' : ''}`} />
        <span className="ml-2 capitalize">{status}</span>
      </div>
    );
  };

  const getMetricStatusColor = (status: 'good' | 'warning' | 'bad') => {
    switch (status) {
      case 'good':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'bad':
        return 'text-red-500';
    }
  };

  const canProceed =
    !isValidating &&
    validationChecks.every((check) => ['passed', 'warning'].includes(check.status));

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-medium">Migration Validation</h3>
          <button
            onClick={startValidation}
            disabled={isValidating}
            className="rounded-md bg-sirsi-500 px-4 py-2 text-white hover:bg-sirsi-600 disabled:opacity-50"
          >
            {isValidating ? 'Validating...' : 'Start Validation'}
          </button>
        </div>

        <div className="space-y-4">
          {validationChecks.map((check, index) => {
            const CategoryIcon = categoryIcons[check.category];
            return (
              <motion.div
                key={check.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-lg border border-gray-100 bg-gray-50 p-4"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <CategoryIcon className="mr-3 h-5 w-5 text-sirsi-500" />
                    <div>
                      <h4 className="font-medium">{check.name}</h4>
                      <p className="text-sm text-gray-600">{check.description}</p>
                    </div>
                  </div>
                  {getStatusBadge(check.status)}
                </div>

                {check.metrics && (
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    {check.metrics.map((metric) => (
                      <div
                        key={metric.name}
                        className="rounded border border-gray-100 bg-white p-3"
                      >
                        <div className="text-sm text-gray-600">{metric.name}</div>
                        <div className="mt-1 flex items-center justify-between">
                          <span
                            className={`font-medium ${getMetricStatusColor(
                              metric.status
                            )}`}
                          >
                            {metric.value}
                          </span>
                          {metric.threshold && (
                            <span className="text-sm text-gray-500">
                              Target: {metric.threshold}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Validation Summary */}
      {!isValidating && validationChecks.some((check) => check.status !== 'pending') && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-medium">Validation Summary</h3>
          <div className="grid grid-cols-4 gap-4">
            {['passed', 'warning', 'failed'].map((status) => {
              const count = validationChecks.filter(
                (check) => check.status === status
              ).length;
              if (count === 0) return null;

              return (
                <div
                  key={status}
                  className="rounded-lg border border-gray-100 bg-gray-50 p-4"
                >
                  <div className={`text-2xl font-bold ${statusColors[status as any]}`}>
                    {count}
                  </div>
                  <div className="text-sm capitalize text-gray-600">
                    {status} Checks
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={onComplete}
          disabled={!canProceed}
          className="rounded-md bg-sirsi-500 px-4 py-2 text-white hover:bg-sirsi-600 disabled:opacity-50"
        >
          Continue to Optimization
        </button>
      </div>
    </div>
  );
};
