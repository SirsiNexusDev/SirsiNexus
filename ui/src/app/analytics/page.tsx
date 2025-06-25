import { Breadcrumb } from '@/components/Breadcrumb';
import {
  ArrowUpRight,
  Download,
  BarChart2,
  Clock,
  DollarSign,
  Cpu,
  Database,
  Server,
} from 'lucide-react';

const mockMetrics = [
  {
    name: 'Total Migrations',
    value: '156',
    change: '+12% vs last month',
    trend: 'up',
  },
  {
    name: 'Success Rate',
    value: '98.5%',
    change: '+0.5% vs last month',
    trend: 'up',
  },
  {
    name: 'Avg Duration',
    value: '4.2h',
    change: '-15% vs last month',
    trend: 'up',
  },
  {
    name: 'Cost Savings',
    value: '$45k',
    change: '+25% vs last month',
    trend: 'up',
  },
];

const mockReports = [
  {
    id: '1',
    name: 'Monthly Migration Summary',
    description: 'Overview of all migrations including success rates and trends',
    type: 'automatic',
    frequency: 'Monthly',
    lastGenerated: '2 days ago',
  },
  {
    id: '2',
    name: 'Cost Analysis Report',
    description: 'Detailed breakdown of migration costs and potential savings',
    type: 'automatic',
    frequency: 'Weekly',
    lastGenerated: '5 days ago',
  },
  {
    id: '3',
    name: 'Performance Metrics',
    description: 'Analysis of migration performance and optimization opportunities',
    type: 'automatic',
    frequency: 'Daily',
    lastGenerated: '1 day ago',
  },
];

const mockResourceMetrics = [
  {
    type: 'Compute',
    icon: Cpu,
    metrics: [
      { name: 'Total VMs', value: '245' },
      { name: 'Migrated', value: '180' },
      { name: 'In Progress', value: '45' },
    ],
  },
  {
    type: 'Storage',
    icon: Database,
    metrics: [
      { name: 'Total Volume', value: '12.5 TB' },
      { name: 'Transferred', value: '8.2 TB' },
      { name: 'Remaining', value: '4.3 TB' },
    ],
  },
  {
    type: 'Infrastructure',
    icon: Server,
    metrics: [
      { name: 'Services', value: '45' },
      { name: 'Dependencies', value: '156' },
      { name: 'Configurations', value: '89' },
    ],
  },
];

export default function AnalyticsPage() {
  return (
    <div>
      <Breadcrumb />
      
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Analytics & Reports
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Migration performance metrics and analysis
          </p>
        </div>
        <button className="flex items-center rounded-md border border-gray-200 px-4 py-2 text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600">
          <Download className="mr-2 h-5 w-5" />
          Export Data
        </button>
      </div>

      {/* Key Metrics */}
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {mockMetrics.map((metric) => (
          <div
            key={metric.name}
            className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {metric.name}
              </h3>
              <BarChart2 className="h-5 w-5 text-gray-400" />
            </div>
            <div className="mt-2 flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {metric.value}
              </p>
              <p
                className={`ml-2 text-sm ${
                  metric.trend === 'up'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {metric.change}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Resource Metrics */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {mockResourceMetrics.map((resource) => {
          const Icon = resource.icon;
          return (
            <div
              key={resource.type}
              className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="mb-4 flex items-center">
                <div className="rounded-lg bg-sirsi-100 p-3 dark:bg-sirsi-900">
                  <Icon className="h-6 w-6 text-sirsi-600 dark:text-sirsi-400" />
                </div>
                <h3 className="ml-3 text-lg font-medium text-gray-900 dark:text-gray-100">
                  {resource.type}
                </h3>
              </div>
              <div className="space-y-3">
                {resource.metrics.map((metric) => (
                  <div
                    key={metric.name}
                    className="flex items-center justify-between"
                  >
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {metric.name}
                    </p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {metric.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Reports */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Generated Reports
          </h2>
          <button className="text-sm text-sirsi-600 hover:text-sirsi-700 dark:text-sirsi-400 dark:hover:text-sirsi-300">
            View All Reports
          </button>
        </div>

        <div className="space-y-4">
          {mockReports.map((report) => (
            <div
              key={report.id}
              className="flex items-center justify-between rounded-lg border border-gray-100 p-4 dark:border-gray-700"
            >
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                  {report.name}
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {report.description}
                </p>
                <div className="mt-2 flex items-center space-x-4">
                  <span className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="mr-1 h-4 w-4" />
                    {report.frequency}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Last generated {report.lastGenerated}
                  </span>
                </div>
              </div>
              <button className="ml-4 flex items-center rounded-md border border-gray-200 px-3 py-1.5 text-sm hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600">
                View Report
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
