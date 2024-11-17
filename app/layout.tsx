// app/layout.tsx
import { Analytics } from "@vercel/analytics/react";
import { headers } from 'next/headers';
import { Suspense } from 'react';
import AnalyticsProvider from "./components/analytics/analytics-provider";
import { Footer } from './components/footer';
import { Header } from './components/header';
import Providers from "./components/providers";
import "./globals.css";

interface LayoutProps {
  children: React.ReactNode;
}

export async function generateMetadata() {
  const headersList = headers();
  const domain = headersList.get('host') || 'https://the-okapi-webstore.vercel.app/';
  const baseUrl = `https://${domain}`;

  return {
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: '/',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="en" data-theme="okapilight">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="preload"
          href="/fonts/your-main-font.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="antialiased bg-base-100 text-neutral flex flex-col min-h-screen">
        <Providers>
          <Suspense fallback={<div>Loading...</div>}>
            <Header />
          </Suspense>
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
          <Suspense fallback={<div>Loading...</div>}>
            <Footer />
          </Suspense>
          <Analytics />
          <AnalyticsProvider />
        </Providers>
      </body>
    </html>
  );
}