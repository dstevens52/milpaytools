import type { Metadata } from 'next';
import { ogImage } from '@/lib/og';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import { AnalyticsWrapper } from '@/components/AnalyticsWrapper';
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
    images: ogImage({ type: 'home', title: 'MilPayTools' }),
  },
  twitter: {
    card: 'summary_large_image',
    images: ogImage({ type: 'home', title: 'MilPayTools' }),
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
        {/* GA4 — production + allowed hostname only.
            Server-side VERCEL_ENV guard prevents rendering on preview/dev/local.
            Client-side IIFE hostname check prevents any network request to
            googletagmanager.com on non-production hostnames (localhost, *.vercel.app, etc.). */}
        {process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' && (
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              (function() {
                var ALLOWED = ['milpaytools.com', 'www.milpaytools.com'];
                if (!ALLOWED.includes(window.location.hostname)) return;
                var s = document.createElement('script');
                s.src = 'https://www.googletagmanager.com/gtag/js?id=G-YQFJ5J3P52';
                s.async = true;
                document.head.appendChild(s);
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                window.gtag = gtag;
                gtag('js', new Date());
                gtag('config', 'G-YQFJ5J3P52');
              })();
            `}
          </Script>
        )}
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
        <AnalyticsWrapper />
      </body>
    </html>
  );
}
