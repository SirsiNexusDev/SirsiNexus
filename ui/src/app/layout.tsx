import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { AgentChat } from '@/components/AgentChat';
import { NotificationCenter } from '@/components/NotificationCenter';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sirsi Nexus',
  description: 'Agent-embedded migration & infrastructure platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <ErrorBoundary>
            <div className="min-h-screen bg-background">
              <Header />
              <div className="flex">
                <Sidebar />
                <main className="flex-1 p-6">
                  {children}
                </main>
              </div>
              <AgentChat />
              <NotificationCenter />
            </div>
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}
