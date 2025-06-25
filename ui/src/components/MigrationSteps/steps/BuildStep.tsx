import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Loader, XCircle, Play, RefreshCw, Network, Shield } from 'lucide-react';

interface BuildTask {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  icon: React.ElementType;
  dependencies?: string[];
}

interface BuildStepProps {
  onComplete: () => void;
}

export const BuildStep: React.FC<BuildStepProps> = ({ onComplete }) => {
  const [tasks, setTasks] = useState<BuildTask[]>([
    {
      id: 'network',
      name: 'Network Configuration',
      description: 'Setting up VPC, subnets, and security groups',
      status: 'pending',
      progress: 0,
      icon: Cloud,
    },
    {
      id: 'storage',
      name: 'Storage Provisioning',
      description: 'Creating and configuring storage volumes',
      status: 'pending',
      progress: 0,
      icon: Database,
      dependencies: ['network'],
    },
    {
      id: 'compute',
      name: 'Compute Resources',
      description: 'Launching and configuring instances',
      status: 'pending',
      progress: 0,
      icon: Server,
      dependencies: ['network', 'storage'],
    },
    {
      id: 'monitoring',
      name: 'Monitoring Setup',
      description: 'Configuring metrics and alerts',
      status: 'pending',
      progress: 0,
      icon: Settings,
      dependencies: ['compute'],
    },
  ]);

  const [isBuilding, setIsBuilding] = useState(false);

  const startBuild = async () => {
    setIsBuilding(true);

    for (const task of tasks) {
      // Update task status to running
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, status: 'running' } : t
        )
      );

      // Simulate progress updates
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        setTasks((prev) =>
          prev.map((t) =>
            t.id === task.id ? { ...t, progress } : t
          )
        );
      }

      // Mark task as completed
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, status: 'completed' } : t
        )
      );
    }

    setIsBuilding(false);
  };

  const getStatusIcon = (status: BuildTask['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'running':
        return <Loader className="h-5 w-5 animate-spin text-blue-500" />;
      case 'failed':
        return <Settings className="h-5 w-5 text-red-500" />;
      default:
        return <Settings className="h-5 w-5 text-gray-400" />;
    }
  };

  const canProceed = tasks.every((task) => task.status === 'completed');

  return (
    <div className="space-y-6">
/* Build Control */}
<Card>
  <CardHeader>
    <CardTitle>Infrastructure Build/CardTitle>
    <CardDescription>
      Deploy and configure infrastructure components/CardDescription>
  /CardHeader>
  <CardContent>
    <div className="flex justify-between items-center">
      <div className="space-y-1">
        <div className="text-sm font-medium">Build Status/div>
        <div className="text-sm text-gray-500">
          {isBuilding
            ? 'Building infrastructure components...'
            : 'Ready to start build'}
        /div>
      /div>
      <Button
        onClick={startBuild}
        disabled={isBuilding}
        className="w-[150px]"
      >
        {isBuilding ? (
          <>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin"/>
            Building...
          <>
        ) : (
          <>
            <Play className="mr-2 h-4 w-4"/>
            Start Build
          <>
        )}
      /Button
    /div>
  /CardContent>
/Card>

/* Task Grid */}
<div className="grid grid-cols-2 gap-4"><Card className="col-span-1"><CardHeader><CardTitle>Build Tasks/CardTitle>
/CardHeader>
<CardContent><div className="space-y-4">
          <h3 className="text-lg font-medium">Infrastructure Build</h3>
          <button
            onClick={startBuild}
            disabled={isBuilding}
            className="rounded-md bg-sirsi-500 px-4 py-2 text-white hover:bg-sirsi-600 disabled:opacity-50"
          >
            {isBuilding ? 'Building...' : 'Start Build'}
          </button>
        </div>

        <div className="space-y-4">
          {tasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-lg border border-gray-100 bg-gray-50 p-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center">
                  <task.icon className="mr-3 h-5 w-5 text-sirsi-500" />
                  <div>
                    <h4 className="font-medium">{task.name}</h4>
                    <p className="text-sm text-gray-600">{task.description}</p>
                  </div>
                </div>
                {getStatusIcon(task.status)}
              </div>

              {task.status !== 'pending' && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">{task.progress}%</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-gray-200">
                    <motion.div
                      className="h-full rounded-full bg-sirsi-500"
                      initial={{ width: '0%' }}
                      animate={{ width: `${task.progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              )}

              {task.dependencies && task.dependencies.length > 0 && (
                <div className="mt-2 text-xs text-gray-500">
                  Dependencies:{' '}
                  {task.dependencies.map((dep, i) => (
                    <span key={dep}>
                      {i > 0 && ', '}
                      {tasks.find((t) => t.id === dep)?.name}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

{/* Alerts */
<AnimatePresence>
  {alerts.map((alert, index) => (
    motion.div
      key={index}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-2"
    >
      <Alert
        variant={
          alert.type === 'error'
            ? 'destructive'
            : alert.type === 'warning'
            ? 'default'
            : 'default'
        }
      >
        <AlertCircle className="h-4 w-4">/>
        <AlertTitle>{alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}/AlertTitle>
        <AlertDescription>{alert.message}/AlertDescription>
      /Alert>
    /motion.div>
  ))}
/AnimatePresence>

/* Continue Button */
        <button
          onClick={onComplete}
          disabled={!canProceed}
          className="rounded-md bg-sirsi-500 px-4 py-2 text-white hover:bg-sirsi-600 disabled:opacity-50"
        >
          Continue to Transfer
        </button>
      </div>
    </div>
  );
};
