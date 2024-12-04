'use client';

import { ReactNode } from 'react';
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { CheckoutProvider } from './checkout/CheckoutContext';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <CheckoutProvider>
          {children}
        </CheckoutProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}

Providers.displayName = "Providers";
