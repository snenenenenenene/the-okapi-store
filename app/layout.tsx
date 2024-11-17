// app/layout.tsx
import { Analytics } from "@vercel/analytics/react";
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { LoadingSpinner } from './components/loadingStates';
import "./globals.css";

const Providers = dynamic(() => import('./components/providers'), {
  ssr: false
});

const Header = dynamic(() => import('./components/header').then(mod => mod.Header), {
  ssr: false
});

const Footer = dynamic(() => import('./components/footer').then(mod => mod.Footer), {
  ssr: false
});

const AnalyticsProvider = dynamic(() => import('./components/analytics/analytics-provider'), {
  ssr: false
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="okapilight">
      <body className="antialiased bg-base-100 text-neutral flex flex-col min-h-screen">
        <Suspense fallback={<LoadingSpinner />}>
          <Providers>
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
              {children}
            </main>
            <Footer />
            <Analytics />
            <AnalyticsProvider />
          </Providers>
        </Suspense>
      </body>
    </html>
  );
}