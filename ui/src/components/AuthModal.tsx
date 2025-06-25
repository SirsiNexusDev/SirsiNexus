import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { User, Lock, Mail } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isRegister, setIsRegister] = useState(false);

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 max-h-[90vh] w-[95vw] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-lg bg-white p-6 shadow-xl">
          <Dialog.Title className="text-xl font-bold text-gray-900">
            {isRegister ? 'Register' : 'Sign In'}
          </Dialog.Title>

          <div className="mt-4">
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-sm text-sirsi-500 hover:underline"
            >
              {isRegister ? 'Already have an account? Sign In' : 'New here? Register now'}
            </button>
          </div>

          {/* Form */}
          <form className="mt-6">
            {isRegister && (
              <div className="mb-4">
                <label className="flex items-center text-sm">
                  <Mail className="mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-sirsi-500 focus:outline-none focus:ring-1 focus:ring-sirsi-500"
                  placeholder="you@example.com"
                />
              </div>
            )}

            <div className="mb-4">
              <label className="flex items-center text-sm">
                <User className="mr-2" />
                Username
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-sirsi-500 focus:outline-none focus:ring-1 focus:ring-sirsi-500"
                placeholder="Enter your username"
              />
            </div>

            <div className="mb-4">
              <label className="flex items-center text-sm">
                <Lock className="mr-2" />
                Password
              </label>
              <input
                type="password"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-sirsi-500 focus:outline-none focus:ring-1 focus:ring-sirsi-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-md bg-sirsi-500 px-4 py-2 text-white shadow-sm hover:bg-sirsi-600 focus:outline-none focus:ring-2 focus:ring-sirsi-500"
            >
              {isRegister ? 'Register' : 'Sign In'}
            </button>

            {isRegister ? (
              <p className="mt-4 text-center text-sm text-gray-500">
                By registering, you agree to our{' '}
                <a href="#" className="text-sirsi-500 hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-sirsi-500 hover:underline">
                  Privacy Policy
                </a>
                .
              </p>
            ) : (
              <p className="mt-4 text-center text-sm text-sirsi-500">
                Forgot password?{' '}
                <a href="#" className="hover:underline">
                  Reset here
                </a>
              </p>
            )}
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

