// app/layout.tsx
import { defaultMetadata } from './metadata';
import { Metadata } from 'next';
import "./globals.css";
import Providers from "./components/providers";
import { Header } from "./components/header";
import { Footer } from "./components/footer";
import { WebsiteSchema, OrganizationSchema } from './components/seo';

export const metadata: Metadata = defaultMetadata;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://theokapistore.com';

  return (
    <html lang="en" data-theme="okapilight">
      <head>
        <WebsiteSchema siteUrl={siteUrl} />
        <OrganizationSchema siteUrl={siteUrl} />
      </head>
      <body className="antialiased bg-base-100 text-neutral flex flex-col min-h-screen">
        <Providers>
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}