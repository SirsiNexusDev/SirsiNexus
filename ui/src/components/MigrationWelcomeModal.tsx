'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Clipboard,
  Settings,
  TestTube,
  Wrench,
  Cloud,
  ArrowLeftRight,
  CheckCircle,
  Sparkles,
  Rocket
} from 'lucide-react';

interface MigrationWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartMigration?: () => void;
}

const migrationSteps = [
  {
    number: 1,
    title: 'Plan',
    description: "We'll help you understand what you have and create a migration plan.",
    icon: Clipboard,
    color: 'text-blue-600 bg-blue-100'
  },
  {
    number: 2,
    title: 'Specify',
    description: 'Design your new cloud setup based on your current systems.',
    icon: Settings,
    color: 'text-purple-600 bg-purple-100'
  },
  {
    number: 3,
    title: 'Test',
    description: 'Test everything works before we move your real data.',
    icon: TestTube,
    color: 'text-green-600 bg-green-100'
  },
  {
    number: 4,
    title: 'Build',
    description: 'Build your new cloud environment ready for migration.',
    icon: Wrench,
    color: 'text-orange-600 bg-orange-100'
  },
  {
    number: 5,
    title: 'Sample Test',
    description: 'Simulate a real data migration to catch any hidden issues.',
    icon: Cloud,
    color: 'text-cyan-600 bg-cyan-100'
  },
  {
    number: 6,
    title: 'Transfer',
    description: 'Move your real data to the cloud safely.',
    icon: ArrowLeftRight,
    color: 'text-indigo-600 bg-indigo-100'
  },
  {
    number: 7,
    title: 'Validate',
    description: 'Make sure everything works perfectly in the cloud.',
    icon: CheckCircle,
    color: 'text-emerald-600 bg-emerald-100'
  }
];

export const MigrationWelcomeModal: React.FC<MigrationWelcomeModalProps> = ({ isOpen, onClose, onStartMigration }) => {
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
                <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Welcome to Cloud Migration!
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/20 transition-colors"
              >
                <X className="h-5 w-5 text-slate-600 hover:text-slate-800" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="mb-6">
                <p className="text-lg text-slate-800 font-medium flex items-center gap-2">
                  <span className="text-xl">👋</span>
                  Welcome! This is an overview of our proven 7-step migration process. When you're ready, I'll guide you through each step interactively in the Migration Wizard.
                </p>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-bold text-slate-900 mb-6">
                  Overview of our 7-step migration process:
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {migrationSteps.map((step) => {
                    const Icon = step.icon;
                    return (
                      <motion.div
                        key={step.number}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: step.number * 0.1 }}
                        className="flex items-start gap-4 p-4 rounded-lg border border-slate-300 hover:border-slate-400 transition-colors bg-white/60"
                      >
                        <div className={`p-3 rounded-lg ${step.color} flex-shrink-0`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg font-bold text-slate-900">
                              {step.number}. {step.title}
                            </span>
                          </div>
                          <p className="text-sm text-slate-700 font-medium leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-300">
                <button
                  onClick={onClose}
                  className="px-6 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors"
                >
                  SKIP TUTORIAL
                </button>
                <button
                  onClick={() => {
                    onStartMigration?.();
                    onClose();
                  }}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium transition-all"
                >
                  <Rocket className="h-5 w-5" />
                  OPEN MIGRATION WIZARD
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
