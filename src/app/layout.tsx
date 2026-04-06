import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'MilPayTools — Military Pay & Benefits Calculators',
    template: '%s | MilPayTools',
  },
  description:
    'Free military pay and benefits calculators for active-duty, Guard/Reserve, and veterans. Total compensation, BAH, VA disability ratings, and TSP projections using official 2026 rate tables.',
  keywords: [
    'military pay calculator',
    'BAH calculator',
    'VA disability calculator',
    'total military compensation',
    'TSP calculator',
    'military benefits',
  ],
  openGraph: {
    siteName: 'MilPayTools',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
