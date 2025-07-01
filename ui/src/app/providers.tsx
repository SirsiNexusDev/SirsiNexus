'use client';

import { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { store } from '@/store';

export function Providers({ children }: PropsWithChildren) {
  return (
    <SessionProvider>
      <Provider store={store}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange={false}>
          {children}
        </ThemeProvider>
      </Provider>
    </SessionProvider>
  );
}
