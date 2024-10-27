import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "./components/providers";
import { Header } from "./components/header";
import { Footer } from "./components/footer";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const remindSerif = localFont({
  src: "./fonts/Remind.ttf",
  variable: "--font-remind-serif",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const integralCFMedium = localFont({
  src: "./fonts/Integralcf-medium.otf",
  variable: "--font-integral-medium",
  weight: "400",
});

export const metadata: Metadata = {
  title: "The Okapi Store",
  description: "The Okapi Store",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="okapilight">
      <body
        className={`${integralCFMedium.variable} ${geistSans.variable} ${remindSerif.variable} ${geistMono.variable} antialiased bg-base-100 text-neutral flex flex-col min-h-screen`}
      >
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