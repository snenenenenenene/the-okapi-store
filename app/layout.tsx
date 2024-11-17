// app/layout.tsx
import { Analytics } from "@vercel/analytics/react";
import { Suspense } from 'react';
import AnalyticsProvider from "./components/analytics/analytics-provider";
import { Footer } from './components/footer';
import { Header } from './components/header';
import { LoadingSpinner } from './components/loadingStates';
import Providers from "./components/providers";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="okapilight">
      <body className="antialiased bg-base-100 text-neutral flex flex-col min-h-screen">
        <Providers>
          <Suspense fallback={<LoadingSpinner />}>
            <Header />
          </Suspense>
          <Suspense fallback={<LoadingSpinner />}>
            <main className="flex-grow container mx-auto px-4 py-8">
              {children}
            </main>
          </Suspense>
          <Suspense fallback={<LoadingSpinner />}>
            <Footer />
          </Suspense>
          <Analytics />
          <AnalyticsProvider />
        </Providers>
      </body>
    </html>
  );
}