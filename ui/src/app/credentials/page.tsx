import { Breadcrumb } from '@/components/Breadcrumb';
import {
  Plus,
  Key,
  Cloud,
  Server,
  Lock,
  Calendar,
  MoreVertical,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

const mockCredentials = [
  {
    id: '1',
    name: 'AWS Production',
    type: 'aws',
    status: 'valid',
    lastUsed: '2 hours ago',
    expiresIn: '29 days',
    scopes: ['ec2:*', 's3:*', 'rds:*'],
  },
  {
    id: '2',
    name: 'Azure Development',
    type: 'azure',
    status: 'warning',
    lastUsed: '1 day ago',
    expiresIn: '5 days',
    scopes: ['compute/*', 'storage/*'],
  },
  {
    id: '3',
    name: 'vSphere Staging',
    type: 'vsphere',
    status: 'expired',
    lastUsed: '30 days ago',
    expiresIn: 'Expired',
    scopes: ['vm.*', 'datastore.*'],
  },
];

export default function CredentialsPage() {
  return (
    <div>
      <Breadcrumb />
      
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Credentials
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage cloud provider credentials
          </p>
        </div>
        <button className="flex items-center rounded-md bg-sirsi-500 px-4 py-2 text-white hover:bg-sirsi-600">
          <Plus className="mr-2 h-5 w-5" />
          Add Credentials
        </button>
      </div>

      <div className="space-y-4">
        {mockCredentials.map((credential) => (
          <div
            key={credential.id}
            className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center">
                <div
                  className={`mr-4 rounded-lg p-2 ${
                    credential.type === 'aws'
                      ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-400'
                      : credential.type === 'azure'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400'
                      : 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400'
                  }`}
                >
                  {credential.type === 'aws' ? (
                    <Cloud className="h-6 w-6" />
                  ) : credential.type === 'azure' ? (
                    <Cloud className="h-6 w-6" />
                  ) : (
                    <Server className="h-6 w-6" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {credential.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {credential.type.toUpperCase()} Credentials
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span
                  className={`flex items-center rounded-full px-3 py-1 text-sm ${
                    credential.status === 'valid'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400'
                      : credential.status === 'warning'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400'
                  }`}
                >
                  {credential.status === 'valid' ? (
                    <CheckCircle className="mr-1 h-4 w-4" />
                  ) : credential.status === 'warning' ? (
                    <AlertTriangle className="mr-1 h-4 w-4" />
                  ) : (
                    <Lock className="mr-1 h-4 w-4" />
                  )}
                  {credential.status === 'valid'
                    ? 'Valid'
                    : credential.status === 'warning'
                    ? 'Expiring Soon'
                    : 'Expired'}
                </span>
                <button className="rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 border-t border-gray-100 pt-4 dark:border-gray-700 sm:grid-cols-3">
              <div className="flex items-center">
                <Key className="mr-2 h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Scopes
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {credential.scopes.join(', ')}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Last Used
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {credential.lastUsed}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <Lock className="mr-2 h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Expires In
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {credential.expiresIn}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
