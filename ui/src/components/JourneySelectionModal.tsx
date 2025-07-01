'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Cloud,
  TrendingUp,
  Zap,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface JourneySelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectJourney: (journey: 'migration' | 'optimization' | 'scaling') => void;
}

const journeyOptions = [
  {
    id: 'migration' as const,
    title: 'Cloud Migration',
    description: 'Move your infrastructure to the cloud with confidence',
    longDescription: 'Migrate your on-premises systems to AWS, Azure, or GCP with our proven 7-step process.',
    icon: Cloud,
    color: 'blue',
    gradient: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50 hover:bg-blue-100',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-900',
    subtextColor: 'text-blue-700'
  },
  {
    id: 'optimization' as const,
    title: 'Resource Optimization',
    description: 'Optimize your cloud resources for cost and performance',
    longDescription: 'Analyze and optimize your existing cloud infrastructure to reduce costs and improve performance.',
    icon: TrendingUp,
    color: 'green',
    gradient: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50 hover:bg-green-100',
    borderColor: 'border-green-200',
    textColor: 'text-green-900',
    subtextColor: 'text-green-700'
  },
  {
    id: 'scaling' as const,
    title: 'Auto Scaling',
    description: 'Scale your applications automatically based on demand',
    longDescription: 'Set up intelligent auto-scaling for your applications to handle traffic spikes efficiently.',
    icon: Zap,
    color: 'purple',
    gradient: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50 hover:bg-purple-100',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-900',
    subtextColor: 'text-purple-700'
  }
];

export const JourneySelectionModal: React.FC<JourneySelectionModalProps> = ({ 
  isOpen, 
  onClose, 
  onSelectJourney 
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white/80 backdrop-blur-md"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl max-h-[90vh] glass-ultra shadow-intense rounded-xl overflow-hidden text-slate-800"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-300">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-forest-500 to-purple-600 rounded-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Welcome to Sirsi Nexus!
                  </h2>
                  <p className="text-sm text-slate-700 font-medium">
                    What would you like to accomplish today?
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  console.log('X button clicked');
                  e.preventDefault();
                  e.stopPropagation();
                  onClose();
                }}
                className="p-2 rounded-full hover:bg-white/20 transition-colors"
              >
                <X className="h-5 w-5 text-slate-600 hover:text-slate-800" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="mb-6 text-center">
                <p className="text-lg text-slate-800 font-medium mb-2">
                  Choose your journey to get started with a guided experience
                </p>
                <p className="text-sm text-slate-600 font-medium">
                  You can always explore other options later from the dashboard
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {journeyOptions.map((journey) => {
                  const Icon = journey.icon;
                  return (
                    <motion.button
                      key={journey.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: journeyOptions.indexOf(journey) * 0.1 }}
                      onClick={() => onSelectJourney(journey.id)}
                      className={`
                        group relative p-6 rounded-xl border-2 transition-all duration-300
                        ${journey.bgColor} ${journey.borderColor}
                        hover:scale-105 hover:shadow-lg
                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-forest-500
                      `}
                    >
                      {/* Icon */}
                      <div className={`
                        inline-flex p-4 rounded-xl bg-gradient-to-r ${journey.gradient} 
                        text-white mb-4 group-hover:scale-110 transition-transform
                      `}>
                        <Icon className="h-8 w-8" />
                      </div>

                      {/* Content */}
                      <div className="text-left">
                        <h3 className={`text-xl font-bold mb-2 ${journey.textColor}`}>
                          {journey.title}
                        </h3>
                        <p className={`text-sm mb-4 ${journey.subtextColor}`}>
                          {journey.description}
                        </p>
                        <p className={`text-xs ${journey.subtextColor} opacity-80`}>
                          {journey.longDescription}
                        </p>
                      </div>

                      {/* Arrow */}
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight className={`h-5 w-5 ${journey.textColor}`} />
                      </div>

                      {/* Hover effect */}
                      <div className={`
                        absolute inset-0 rounded-xl bg-gradient-to-r ${journey.gradient} 
                        opacity-0 group-hover:opacity-5 transition-opacity
                      `} />
                    </motion.button>
                  );
                })}
              </div>

              {/* Skip option */}
              <div className="mt-8 text-center">
                <button
                  onClick={onClose}
                  className="text-slate-600 hover:text-slate-800 text-sm font-medium transition-colors"
                >
                  I&apos;ll explore on my own
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
