/* eslint-disable @typescript-eslint/no-explicit-any */
import { Analytics } from "@vercel/analytics/react";
import { Metadata } from "next";
import { Suspense } from "react";
import { Footer } from "./components/footer";
import { Header } from "./components/header";
import Providers from "./components/providers";
import { ThemeProvider } from "./providers/theme-provider";
import "./globals.css";

// Helper function to safely escape JSON for injection into <script> tags
const safeJsonLd = (json: any) => {
  return JSON.stringify(json).replace(/</g, "\\u003c").replace(/>/g, "\\u003e");
};

// Define metadata
export const metadata: Metadata = {
  title: {
    default: "The Okapi Store | Unique Okapi-themed Apparel",
    template: "%s | The Okapi Store",
  },
  description:
    "Discover unique Okapi-themed apparel and accessories. Each purchase supports Okapi conservation efforts.",
  keywords: [
    "okapi",
    "conservation",
    "apparel",
    "eco-friendly",
    "sustainable fashion",
    "wildlife conservation",
  ],
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_BASE_URL || "https://theokapistore.com",
    siteName: "The Okapi Store",
    title: "The Okapi Store | Unique Okapi-themed Apparel",
    description:
      "Discover unique Okapi-themed apparel and accessories. Each purchase supports Okapi conservation efforts.",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://theokapistore.com"}/images/og-image.svg`,
        width: 1200,
        height: 630,
        alt: "The Okapi Store - Unique Okapi-themed Apparel",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Okapi Store | Unique Okapi-themed Apparel",
    description:
      "Discover unique Okapi-themed apparel and accessories. Each purchase supports Okapi conservation efforts.",
    images: [`${process.env.NEXT_PUBLIC_BASE_URL || "https://theokapistore.com"}/images/og-image.svg`],
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_BASE_URL || "https://theokapistore.com",
  },
};

interface LayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: LayoutProps) {
  // JSON-LD for the store
  const storeJsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: "The Okapi Store",
    url: process.env.NEXT_PUBLIC_BASE_URL || "https://theokapistore.com",
    logo: `${process.env.NEXT_PUBLIC_BASE_URL || "https://theokapistore.com"}/images/logo.png`,
    description:
      "Unique Okapi-themed apparel supporting wildlife conservation.",
    sameAs: ["https://twitter.com/sennebels"],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">{safeJsonLd(storeJsonLd)}</script>
        {/* Additional Meta Tags */}
        <meta name="robots" content="index, follow" />
        <meta name="author" content="The Okapi Store" />
        <link rel="canonical" href={process.env.NEXT_PUBLIC_BASE_URL || "https://theokapistore.com"} />
      </head>
      <body className="antialiased bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors">
        <ThemeProvider>
          <Providers>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-grow">
                <Suspense>
                  {children}
                </Suspense>
              </main>
              <Footer />
            </div>
          </Providers>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
