'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { AgentChat } from '@/components/AgentChat';
import { NotificationCenter } from '@/components/NotificationCenter';
import { CommandPalette } from '@/components/CommandPalette';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const pathname = usePathname();
  
  // Infrastructure builder uses its own dark mode
  const isInfrastructurePage = pathname === '/infrastructure';
  
  // Handle navigation to infrastructure with query
  const handleNavigateToInfrastructure = () => {
    window.location.href = '/infrastructure';
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Cmd+K or Ctrl+K to open command palette
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Don't render layout for infrastructure page (it has its own layout)
  if (isInfrastructurePage) {
    return (
      <>
        {children}
        <CommandPalette 
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      <Header />
      <div className="flex">
        <Sidebar 
          aiAssistant 
          onNavigateToInfrastructure={handleNavigateToInfrastructure}
        />
        <main className="flex-1 p-6 ml-0 lg:ml-64 transition-all duration-300 bg-transparent">
          {children}
        </main>
      </div>
      <AgentChat />
      <NotificationCenter />
      <CommandPalette 
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </div>
  );
};
