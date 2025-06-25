import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Dialog from '@radix-ui/react-dialog';

interface Step {
  title: string;
  description: string;
  icon: string;
}

const welcomeSteps: Step[] = [
  {
    title: 'Welcome to Sirsi Nexus',
    description: 'Your AI-powered migration and infrastructure platform.',
    icon: '🚀',
  },
  {
    title: 'Intelligent Assistance',
    description: 'Meet your personal AI agent team, ready to help with every step.',
    icon: '🤖',
  },
  {
    title: 'Cloud Migration Made Easy',
    description: 'Automated discovery, assessment, and migration planning.',
    icon: '☁️',
  },
];

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = React.useState(0);

  const nextStep = () => {
    if (currentStep < welcomeSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  return (
    <Dialog.Root open={isOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="mb-4 text-4xl">{welcomeSteps[currentStep].icon}</div>
              <Dialog.Title className="mb-2 text-2xl font-bold text-sirsi-900">
                {welcomeSteps[currentStep].title}
              </Dialog.Title>
              <Dialog.Description className="mb-6 text-sirsi-600">
                {welcomeSteps[currentStep].description}
              </Dialog.Description>
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 flex justify-between">
            <div className="flex space-x-1">
              {welcomeSteps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-2 rounded-full ${
                    index === currentStep ? 'bg-sirsi-500' : 'bg-sirsi-200'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={nextStep}
              className="rounded bg-sirsi-500 px-4 py-2 text-white hover:bg-sirsi-600"
            >
              {currentStep === welcomeSteps.length - 1 ? 'Get Started' : 'Next'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
