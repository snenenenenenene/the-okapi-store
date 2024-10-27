import type { Metadata } from "next";
import "./globals.css";
import Providers from "./components/providers";
import { Header } from "./components/header";
import { Footer } from "./components/footer";

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
        className={`antialiased bg-base-100 text-neutral flex flex-col min-h-screen`}
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