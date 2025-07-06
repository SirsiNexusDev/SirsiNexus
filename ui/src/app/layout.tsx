import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ClientLayout } from '@/components/ClientLayout';
import { AIContextProvider } from '@/contexts/AIContextProvider';
import AIContextToolbar from '@/components/ai-assistant/AIContextToolbar';

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
          <AIContextProvider>
            <ErrorBoundary>
              <ClientLayout>
              {children}
                <AIContextToolbar position="embedded" showWhenIdle autoHide={true} duration={5000} placement="sidebar" />
              </ClientLayout>
            </ErrorBoundary>
          </AIContextProvider>
        </Providers>
      </body>
    </html>
  );
}
