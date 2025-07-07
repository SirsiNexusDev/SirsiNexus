'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { signIn } from 'next-auth/react';
import { initiateOAuth } from '@/lib/oauth';
import { 
  X, 
  Eye, 
  EyeOff, 
  Shield,
  Mail,
  Lock
} from 'lucide-react';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignIn: (credentials: { email: string; password: string; rememberMe?: boolean }) => void;
  onRegister?: (userData: { name: string; email: string; password: string; confirmPassword: string }) => void;
  onOAuthLogin?: (provider: string) => void;
}

export const SignInModal: React.FC<SignInModalProps> = ({ isOpen, onClose, onSignIn, onRegister, onOAuthLogin }) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!email.trim()) newErrors.email = 'Email is required';
    if (!password.trim()) newErrors.password = 'Password is required';
    
    if (activeTab === 'register') {
      if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
      if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
      if (!agreeToTerms) newErrors.terms = 'You must agree to the terms';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setErrors({});
    
    try {
      if (activeTab === 'signin') {
        // Simulate API call - replace with real authentication
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Demo credentials check
        const validCredentials = [
          { email: 'admin@migration.com', password: 'admin123' },
          { email: 'user@migration.com', password: 'user123' }
        ];
        
        const isValid = validCredentials.some(cred => 
          cred.email === email && cred.password === password
        );
        
        if (isValid) {
          setShowSuccess(true);
          setTimeout(() => {
            onSignIn({ email, password, rememberMe });
            onClose();
          }, 2000);
        } else {
          setErrors({ signin: 'Invalid credentials. Please check your email and password.' });
        }
      } else {
        // Registration logic
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setShowSuccess(true);
        setTimeout(() => {
          onRegister?.({ name: email.split('@')[0], email, password, confirmPassword });
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setErrors({ signin: 'Authentication failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = (type: 'admin' | 'user') => {
    if (type === 'admin') {
      setEmail('admin@migration.com');
      setPassword('admin123');
    } else {
      setEmail('user@migration.com');
      setPassword('user123');
    }
  };

  const handleOAuthLogin = (provider: string) => {
    setLoading(true);
    
    // Listen for OAuth success event
    const handleOAuthSuccess = (event: CustomEvent) => {
      const user = event.detail;
      onOAuthLogin?.(provider);
      setLoading(false);
      
      // Clean up event listener
      window.removeEventListener('oauth_success', handleOAuthSuccess as EventListener);
    };
    
    window.addEventListener('oauth_success', handleOAuthSuccess as EventListener);
    
    // Start OAuth flow
    try {
      initiateOAuth(provider);
    } catch (error) {
      console.error('OAuth error:', error);
      setErrors({ oauth: 'OAuth login failed. Please try again.' });
      setLoading(false);
      window.removeEventListener('oauth_success', handleOAuthSuccess as EventListener);
    }
  };

  // Clean up event listeners when component unmounts
  useEffect(() => {
    return () => {
      window.removeEventListener('oauth_success', () => {});
    };
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white backdrop-blur-md"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm md:max-w-md glass-ultra shadow-intense rounded-xl overflow-auto max-h-[90vh] p-4 text-slate-800"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-bold text-slate-900">Sign In</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-white/20"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-300 mb-6">
              <button
                onClick={() => setActiveTab('signin')}
                className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'signin'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-800'
                }`}
              >
                SIGN IN
              </button>
              <button
                onClick={() => setActiveTab('register')}
                className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'register'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-800'
                }`}
              >
                REGISTER
              </button>
            </div>

            {/* Success Message */}
            {showSuccess && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-green-800">
                      {activeTab === 'signin' ? 'Login Successful!' : 'Account Created Successfully!'}
                    </h3>
                    <p className="text-sm text-green-600">
                      {activeTab === 'signin' 
                        ? 'Welcome back! Redirecting to dashboard...' 
                        : 'Account created successfully! A verification email has been sent to your inbox. Please check your email and verify your account.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border ${errors.email ? 'border-red-500' : 'border-indigo-300'} bg-white/90 text-slate-900 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                    placeholder="Enter your email"
                    required
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-10 pr-12 py-2 border ${errors.password ? 'border-red-500' : 'border-indigo-300'} bg-white/90 text-slate-900 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                    placeholder={activeTab === 'register' ? 'Create a password (min 6 characters)' : 'Enter your password'}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
              </div>

              {/* Confirm Password - Only for registration */}
              {activeTab === 'register' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full pl-10 pr-12 py-2 border ${errors.confirmPassword ? 'border-red-500' : 'border-indigo-300'} bg-white/90 text-slate-900 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                      placeholder="Confirm your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
                </div>
              )}

              {/* Remember Me / Terms Agreement */}
              {activeTab === 'signin' ? (
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="remember-me" className="ml-2 text-sm font-medium text-slate-800">
                    Remember me
                  </label>
                </div>
              ) : (
                <div>
                  <div className="flex items-center">
                    <input
                      id="agree-terms"
                      type="checkbox"
                      checked={agreeToTerms}
                      onChange={(e) => setAgreeToTerms(e.target.checked)}
                      className={`h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 ${errors.terms ? 'border-red-500' : ''}`}
                    />
                    <label htmlFor="agree-terms" className="ml-2 text-sm font-medium text-slate-800">
                      I agree to the{' '}
                      <a href="#" className="text-blue-600 hover:text-blue-800 underline">
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a href="#" className="text-blue-600 hover:text-blue-800 underline">
                        Privacy Policy
                      </a>
                    </label>
                  </div>
                  {errors.terms && <p className="mt-1 text-sm text-red-500">{errors.terms}</p>}
                </div>
              )}

              {/* Demo Credentials */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">Demo Credentials</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="font-medium text-blue-800">Admin User:</p>
                    <p className="text-blue-700">admin@migration.com</p>
                    <p className="text-blue-700">Password: admin123</p>
                    <button
                      type="button"
                      onClick={() => fillDemoCredentials('admin')}
                      className="mt-1 text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      Use these credentials
                    </button>
                  </div>
                  <div>
                    <p className="font-medium text-blue-800">Regular User:</p>
                    <p className="text-blue-700">user@migration.com</p>
                    <p className="text-blue-700">Password: user123</p>
                    <button
                      type="button"
                      onClick={() => fillDemoCredentials('user')}
                      className="mt-1 text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      Use these credentials
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium transition-colors ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {activeTab === 'signin' ? 'SIGNING IN...' : 'CREATING ACCOUNT...'}
                  </div>
                ) : (
                  activeTab === 'signin' ? 'SIGN IN' : 'CREATE ACCOUNT'
                )}
              </button>
            </form>

            {/* OAuth Options */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white/90 text-slate-600 font-medium">Or continue with</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleOAuthLogin('google')}
                  className="flex items-center justify-center px-4 py-2 border border-slate-300 rounded-md hover:bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <span className="text-sm font-semibold text-slate-800">GOOGLE</span>
                </button>
                <button
                  onClick={() => handleOAuthLogin('microsoft')}
                  className="flex items-center justify-center px-4 py-2 border border-slate-300 rounded-md hover:bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <span className="text-sm font-semibold text-slate-800">MICROSOFT</span>
                </button>
                <button
                  onClick={() => handleOAuthLogin('github')}
                  className="flex items-center justify-center px-4 py-2 border border-slate-300 rounded-md hover:bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <span className="text-sm font-semibold text-slate-800">GITHUB</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
