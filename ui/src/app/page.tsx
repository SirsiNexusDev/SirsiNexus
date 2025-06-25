import { Breadcrumb } from '@/components/Breadcrumb';
import {
  BarChart,
  Server,
  ArrowRight,
  Database,
  Cloud,
  Activity,
} from 'lucide-react';

const mockStats = [
  {
    name: 'Active Migrations',
    value: '12',
    change: '+2',
    icon: Cloud,
  },
  {
    name: 'Resources',
    value: '1,234',
    change: '+45',
    icon: Server,
  },
  {
    name: 'Success Rate',
    value: '98.5%',
    change: '+0.5%',
    icon: Activity,
  },
  {
    name: 'Data Transferred',
    value: '2.4 TB',
    change: '+156 GB',
    icon: Database,
  },
];

const mockRecentActivity = [
  {
    id: '1',
    type: 'migration_completed',
    project: 'Production Database Migration',
    timestamp: '2 hours ago',
    status: 'success',
  },
  {
    id: '2',
    type: 'optimization_suggested',
    project: 'Web App Servers',
    timestamp: '4 hours ago',
    status: 'info',
  },
  {
    id: '3',
    type: 'validation_warning',
    project: 'Storage Bucket Transfer',
    timestamp: '6 hours ago',
    status: 'warning',
  },
];

export default function DashboardPage() {
  return (
    <div>
      <Breadcrumb />
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Overview of your migration projects and activities
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {mockStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex items-center justify-between">
                <Icon className="h-8 w-8 text-sirsi-500" />
                <span
                  className={`text-sm ${
                    stat.change.startsWith('+')
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {stat.change}
                </span>
              </div>
              <h3 className="mt-4 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {stat.value}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {stat.name}
              </p>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Recent Activity
          </h2>
          <button className="flex items-center text-sm text-sirsi-500 hover:text-sirsi-600 dark:hover:text-sirsi-400">
            View All
            <ArrowRight className="ml-1 h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          {mockRecentActivity.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between rounded-lg border border-gray-100 p-4 dark:border-gray-800"
            >
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  {activity.project}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {activity.timestamp}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-sm ${
                  activity.status === 'success'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400'
                    : activity.status === 'warning'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400'
                }`}
              >
                {activity.type.split('_').join(' ')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
