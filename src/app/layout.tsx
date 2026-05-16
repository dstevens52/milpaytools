import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/react';
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
    images: [{ url: '/api/og?type=home&title=MilPayTools&v=2', width: 2400, height: 1260 }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/api/og?type=home&title=MilPayTools&v=2'],
  },
  icons: {
    icon: [
      { url: '/images/logo-shield-simple.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico' },
    ],
    apple: '/images/logo-shield-simple.svg',
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
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
  })(window, document, "clarity", "script", "wpo718gj4q");`}
        </Script>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
