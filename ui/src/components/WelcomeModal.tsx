import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from './ui/button';
import { ChevronRight, Sparkles, Shield, Zap, Clock, CheckCircle } from 'lucide-react';

interface Step {
  title: string;
  description: string;
  icon: React.ReactNode;
  features?: string[];
  cta?: string;
}

const welcomeSteps: Step[] = [
  {
    title: 'Welcome to Sirsi Nexus',
    description: 'Your AI-powered migration and infrastructure management platform that transforms complex cloud operations into simple, guided experiences.',
    icon: <Sparkles className="h-12 w-12 text-sirsi-500" />, 
    features: ['AI-Powered Automation', 'Enterprise Security', 'Multi-Cloud Support'],
    cta: 'Get Started',
  },
  {
    title: 'Meet Your AI Agent Team',
    description: 'Specialized AI agents work together to discover, assess, plan, and execute your migrations with precision and intelligence.',
    icon: <div className="relative">
      <Zap className="h-12 w-12 text-blue-500" />
    </div>,
    features: ['Discovery Agent', 'Assessment Agent', 'Planning Agent', 'Execution Agent'],
    cta: 'Meet the Team',
  },
  {
    title: 'Enterprise-Grade Security',
    description: 'Built with zero-trust architecture, end-to-end encryption, and comprehensive audit trails for enterprise compliance.',
    icon: <Shield className="h-12 w-12 text-green-600" />, 
    features: ['Zero-Trust Architecture', 'End-to-End Encryption', 'Compliance Ready'],
    cta: 'Learn Security',
  },
  {
    title: 'Start Your Migration Journey',
    description: 'Begin with automated discovery or jump into planning. Our AI agents will guide you through every step of the process.',
    icon: <Clock className="h-12 w-12 text-purple-500" />, 
    features: ['Automated Discovery', 'Risk Assessment', 'Cost Estimation', 'Migration Planning'],
    cta: 'Start Migration',
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
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="text-center"
            >
              <motion.div 
                className="mb-6 flex justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              >
                {welcomeSteps[currentStep].icon}
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Dialog.Title className="mb-3 text-2xl font-bold text-gray-900">
                  {welcomeSteps[currentStep].title}
                </Dialog.Title>
                <Dialog.Description className="mb-6 text-gray-600 leading-relaxed">
                  {welcomeSteps[currentStep].description}
                </Dialog.Description>
              </motion.div>

              {/* Feature highlights */}
              {welcomeSteps[currentStep].features && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mb-6 space-y-2"
                >
                  {welcomeSteps[currentStep].features!.map((feature, index) => (
                    <motion.div
                      key={feature}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="flex items-center justify-center space-x-2 text-sm text-gray-700"
                    >
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>{feature}</span>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Progress and Navigation */}
          <motion.div 
            className="mt-8 flex items-center justify-between"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex space-x-2">
              {welcomeSteps.map((_, index) => (
                <motion.div
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentStep 
                      ? 'w-8 bg-sirsi-500' 
                      : index < currentStep 
                      ? 'w-2 bg-sirsi-400'
                      : 'w-2 bg-gray-200'
                  }`}
                  layoutId={`progress-${index}`}
                />
              ))}
            </div>
            
            <div className="flex space-x-3">
              {currentStep > 0 && (
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="px-4 py-2"
                >
                  Back
                </Button>
              )}
              <Button
                onClick={nextStep}
                className="flex items-center space-x-2 px-4 py-2 bg-sirsi-500 hover:bg-sirsi-600"
              >
                <span>
                  {currentStep === welcomeSteps.length - 1 ? 'Get Started' : welcomeSteps[currentStep].cta || 'Next'}
                </span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
