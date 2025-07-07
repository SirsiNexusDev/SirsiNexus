'use client';

import React from 'react';
import { useAppSelector } from '@/store';
import AIContextToolbar from './AIContextToolbar';

export default function ConditionalAIToolbar() {
  const authModalOpen = useAppSelector((state) => state.ui.modals.auth);
  const journeySelectionModalOpen = useAppSelector((state) => state.ui.modals.journeySelection);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  // Hide AI toolbar during authentication flow
  if (!isAuthenticated || authModalOpen || journeySelectionModalOpen) {
    return null;
  }

  return <AIContextToolbar />;
}
