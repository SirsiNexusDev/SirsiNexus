'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Cloud,
  Server,
  Key,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Info,
  Settings,
  Lock,
  Globe
} from 'lucide-react';
import { CredentialSelector, type Credential } from '@/components/CredentialSelector';

interface EnvironmentSetupStepProps {
  wizardType: 'migration' | 'optimization' | 'scaling';
  onComplete: (artifact?: {name: string; type: string; size: string; content?: string}) => void;
}

export const EnvironmentSetupStep: React.FC<EnvironmentSetupStepProps> = ({ 
  wizardType, 
  onComplete 
}) => {
  const [sourceCredential, setSourceCredential] = useState<Credential | null>(null);
  const [targetCredential, setTargetCredential] = useState<Credential | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const getWizardConfig = () => {
    switch (wizardType) {
      case 'migration':
        return {
          title: 'Migration Environment Setup',
          description: 'Configure source and destination environments for migration',
          sourceTitle: 'Source Environment Credentials',
          sourceDescription: 'Select credentials for the environment you\'re migrating FROM',
          targetTitle: 'Target Environment Credentials', 
          targetDescription: 'Select credentials for the environment you\'re migrating TO',
          sourceRequired: true,
          targetRequired: true,
          sourceTypes: ['aws', 'azure', 'gcp', 'vsphere'],
          targetTypes: ['aws', 'azure', 'gcp'], // Can't migrate TO vsphere
        };
      case 'optimization':
        return {
          title: 'Optimization Environment Setup',
          description: 'Configure environment credentials for cost and performance optimization',
          sourceTitle: 'Environment Credentials',
          sourceDescription: 'Select credentials for the environment you want to optimize',
          targetTitle: null,
          targetDescription: null,
          sourceRequired: true,
          targetRequired: false,
          sourceTypes: ['aws', 'azure', 'gcp'],
          targetTypes: [],
        };
      case 'scaling':
        return {
          title: 'Auto-Scaling Environment Setup', 
          description: 'Configure environment credentials for auto-scaling configuration',
          sourceTitle: 'Environment Credentials',
          sourceDescription: 'Select credentials for the environment where you want to configure auto-scaling',
          targetTitle: null,
          targetDescription: null,
          sourceRequired: true,
          targetRequired: false,
          sourceTypes: ['aws', 'azure', 'gcp'],
          targetTypes: [],
        };
      default:
        return {
          title: 'Environment Setup',
          description: 'Configure environment credentials',
          sourceTitle: 'Environment Credentials',
          sourceDescription: 'Select your environment credentials',
          targetTitle: null,
          targetDescription: null,
          sourceRequired: true,
          targetRequired: false,
          sourceTypes: ['aws', 'azure', 'gcp', 'vsphere'],
          targetTypes: [],
        };
    }
  };

  const config = getWizardConfig();

  const validateSetup = () => {
    const errors: string[] = [];
    
    if (config.sourceRequired && !sourceCredential) {
      errors.push('Source environment credentials are required');
    }
    
    if (config.targetRequired && !targetCredential) {
      errors.push('Target environment credentials are required');
    }
    
    if (wizardType === 'migration' && sourceCredential && targetCredential) {
      if (sourceCredential.id === targetCredential.id) {
        errors.push('Source and target credentials must be different');
      }
      
      if (sourceCredential.type === targetCredential.type && 
          sourceCredential.region === targetCredential.region) {
        errors.push('Source and target environments should be in different regions for best practices');
      }
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleContinue = () => {
    if (!validateSetup()) {
      return;
    }

    // Generate environment configuration artifact
    const environmentConfig = {
      wizardType,
      source: sourceCredential ? {
        name: sourceCredential.name,
        type: sourceCredential.type,
        region: sourceCredential.region || sourceCredential.subscription || sourceCredential.project,
        account: sourceCredential.account || sourceCredential.subscription || sourceCredential.project,
        status: sourceCredential.status,
        lastUsed: sourceCredential.lastUsed,
        scopes: sourceCredential.scopes,
      } : null,
      target: targetCredential ? {
        name: targetCredential.name,
        type: targetCredential.type,
        region: targetCredential.region || targetCredential.subscription || targetCredential.project,
        account: targetCredential.account || targetCredential.subscription || targetCredential.project,
        status: targetCredential.status,
        lastUsed: targetCredential.lastUsed,
        scopes: targetCredential.scopes,
      } : null,
      configuredAt: new Date().toISOString(),
    };

    const artifact = {
      name: 'Environment Configuration',
      type: 'JSON',
      size: '2.1 KB',
      content: JSON.stringify(environmentConfig, null, 2)
    };

    onComplete(artifact);
  };

  const isValid = () => {
    return config.sourceRequired ? !!sourceCredential : true &&
           config.targetRequired ? !!targetCredential : true;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-sirsi-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Key className="h-8 w-8 text-sirsi-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{config.title}</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">{config.description}</p>
      </div>

      {/* Environment Configuration Status */}
      {(sourceCredential || targetCredential) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-sirsi-50 to-blue-50 rounded-lg p-6 border border-sirsi-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Settings className="h-5 w-5 mr-2 text-sirsi-600" />
            Environment Configuration Summary
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sourceCredential && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">
                  {wizardType === 'migration' ? 'Source Environment' : 'Target Environment'}
                </h4>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      sourceCredential.type === 'aws' ? 'bg-orange-100 text-orange-700' :
                      sourceCredential.type === 'azure' ? 'bg-blue-100 text-blue-700' :
                      sourceCredential.type === 'gcp' ? 'bg-green-100 text-green-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {sourceCredential.type === 'vsphere' ? (
                        <Server className="h-5 w-5" />
                      ) : (
                        <Cloud className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{sourceCredential.name}</p>
                      <p className="text-sm text-gray-600">
                        {sourceCredential.type.toUpperCase()} • {sourceCredential.region || sourceCredential.subscription || sourceCredential.project}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {targetCredential && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Target Environment</h4>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      targetCredential.type === 'aws' ? 'bg-orange-100 text-orange-700' :
                      targetCredential.type === 'azure' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      <Cloud className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{targetCredential.name}</p>
                      <p className="text-sm text-gray-600">
                        {targetCredential.type.toUpperCase()} • {targetCredential.region || targetCredential.subscription || targetCredential.project}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Source Environment Credentials */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <CredentialSelector
          title={config.sourceTitle}
          description={config.sourceDescription}
          selectedCredential={sourceCredential}
          onSelect={setSourceCredential}
          allowedTypes={config.sourceTypes}
          required={config.sourceRequired}
        />
      </div>

      {/* Target Environment Credentials (if needed) */}
      {config.targetTitle && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <CredentialSelector
            title={config.targetTitle}
            description={config.targetDescription!}
            selectedCredential={targetCredential}
            onSelect={setTargetCredential}
            allowedTypes={config.targetTypes}
            required={config.targetRequired}
          />
        </div>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4"
        >
          <div className="flex items-center space-x-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h4 className="font-medium text-red-900">Configuration Issues</h4>
          </div>
          <ul className="space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index} className="text-sm text-red-800 flex items-center space-x-2">
                <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                <span>{error}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Lock className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Security Notice</h4>
            <p className="text-sm text-blue-800">
              Your credentials are securely stored and encrypted. We only use the minimum required permissions 
              for {wizardType} operations. You can revoke access at any time through the Credentials Management page.
            </p>
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <div className="flex justify-end">
        <button
          onClick={handleContinue}
          disabled={!isValid()}
          className="flex items-center space-x-2 bg-sirsi-600 hover:bg-sirsi-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all"
        >
          <span>Continue to {wizardType === 'migration' ? 'Resource Discovery' : wizardType === 'optimization' ? 'Analysis' : 'Monitoring Setup'}</span>
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};
