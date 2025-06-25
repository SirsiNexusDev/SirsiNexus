import { Breadcrumb } from '@/components/Breadcrumb';
import {
  Plus,
  Filter,
  Search,
  Cloud,
  Server,
  ArrowUpRight,
  MoreVertical,
} from 'lucide-react';

const mockProjects = [
  {
    id: '1',
    name: 'Production Database Migration',
    description: 'Migrate production PostgreSQL database to managed cloud service',
    status: 'in_progress',
    progress: 65,
    source: 'aws',
    target: 'azure',
    updatedAt: '2 hours ago',
  },
  {
    id: '2',
    name: 'Web App Servers',
    description: 'Migrate web application servers to containerized environment',
    status: 'planning',
    progress: 25,
    source: 'vsphere',
    target: 'aws',
    updatedAt: '4 hours ago',
  },
  {
    id: '3',
    name: 'Storage Bucket Transfer',
    description: 'Transfer object storage data to new cloud provider',
    status: 'completed',
    progress: 100,
    source: 'gcp',
    target: 'aws',
    updatedAt: '1 day ago',
  },
];

export default function ProjectsPage() {
  return (
    <div>
      <Breadcrumb />

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Projects
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your migration projects
          </p>
        </div>
        <button className="flex items-center rounded-md bg-sirsi-500 px-4 py-2 text-white hover:bg-sirsi-600">
          <Plus className="mr-2 h-5 w-5" />
          New Project
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              className="w-full rounded-md border border-gray-200 bg-white py-2 pl-10 pr-4 focus:border-sirsi-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
            />
          </div>
        </div>
        <button className="flex items-center rounded-md border border-gray-200 px-4 py-2 text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600">
          <Filter className="mr-2 h-5 w-5" />
          Filters
        </button>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {mockProjects.map((project) => (
          <div
            key={project.id}
            className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {project.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {project.description}
                </p>
              </div>
              <button className="rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4">
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Progress</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {project.progress}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-2 rounded-full bg-sirsi-500"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Cloud className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {project.source} → {project.target}
                  </span>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs ${
                    project.status === 'completed'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400'
                      : project.status === 'in_progress'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                  }`}
                >
                  {project.status.split('_').join(' ')}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Updated {project.updatedAt}
                </span>
                <button className="flex items-center rounded-md border border-gray-200 px-3 py-1 text-sm hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600">
                  Open
                  <ArrowUpRight className="ml-1 h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
