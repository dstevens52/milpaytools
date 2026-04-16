import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.milpaytools.com'),
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
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-YQFJ5J3P52" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-YQFJ5J3P52');
          `}
        </Script>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
