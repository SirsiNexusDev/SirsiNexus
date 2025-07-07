import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ClientLayout } from '@/components/ClientLayout';
import { AIContextProvider } from '@/contexts/AIContextProvider';
import ConditionalAIToolbar from '@/components/ai-assistant/ConditionalAIToolbar';
import { ToastProvider } from '@/components/ui/toast';

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
    <html lang="en" suppressHydrationWarning className="h-full">
      <body className={`${inter.className} h-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100`}>
        <Providers>
          <ToastProvider>
            <AIContextProvider>
              <ErrorBoundary>
                <ClientLayout>
                  {children}
                  <ErrorBoundary>
                    <ConditionalAIToolbar />
                  </ErrorBoundary>
                </ClientLayout>
              </ErrorBoundary>
            </AIContextProvider>
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}
