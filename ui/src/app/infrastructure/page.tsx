'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Breadcrumb } from '@/components/Breadcrumb';
import { InfrastructureBuilder } from '@/components/InfrastructureBuilder';
import { useAppSelector } from '@/store';

export default function InfrastructurePage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('query') || '';
  
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  // Load dark mode preference from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(savedDarkMode);
  }, []);

  // Save dark mode preference to localStorage
  const handleThemeToggle = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
  };

  // Add dark mode class to body
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    
    return () => {
      document.body.classList.remove('dark');
    };
  }, [isDarkMode]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">
            Authentication Required
          </h1>
          <p className="text-gray-600 mb-6">
            Please sign in to access the Infrastructure Builder.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <Breadcrumb />
      <InfrastructureBuilder 
        isDarkMode={isDarkMode}
        onThemeToggle={handleThemeToggle}
      />
    </div>
  );
}
