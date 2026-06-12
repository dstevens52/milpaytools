import type { Metadata } from 'next';
import Link from 'next/link';
import { ogImage } from '@/lib/og';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for MilPayTools.com, operated by DPS Digital LLC. Educational military pay calculators and financial information.',
  alternates: { canonical: 'https://www.milpaytools.com/terms' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Terms of Service | MilPayTools',
    description: 'Terms of Service for MilPayTools.com, operated by DPS Digital LLC. Educational military pay calculators and financial information.',
    type: 'website',
    url: 'https://www.milpaytools.com/terms',
    siteName: 'MilPayTools',
    images: ogImage({ type: 'default', title: 'Terms of Service' }),
  },
};

export default function TermsPage() {
  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-white border-b border-zinc-100">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-3">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-sm text-zinc-500">
              <li><Link href="/" className="hover:text-zinc-700 transition-colors">Home</Link></li>
              <li aria-hidden="true">/</li>
              <li className="text-zinc-800 font-medium">Terms of Service</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-zinc-50 border-b border-zinc-200 py-10 sm:py-14 px-4">
        <div className="mx-auto max-w-3xl">
          <div className="w-8 h-0.5 bg-red-700 rounded-full mb-5" aria-hidden="true" />
          <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight text-zinc-900 mb-3">
            Terms of Service
          </h1>
          <p className="text-sm text-zinc-500">Effective: May 2026 · MilPayTools.com is operated by DPS Digital LLC</p>
        </div>
      </section>

      {/* Content */}
      <section className="bg-white py-10 sm:py-14 px-4">
        <div className="mx-auto max-w-3xl prose prose-zinc prose-sm sm:prose-base max-w-none">

          <h2>Overview</h2>
          <p>
            MilPayTools.com is operated by DPS Digital LLC. By accessing or using this website, you agree to
            be bound by these Terms of Service. If you do not agree to these terms, please do not use the site.
          </p>

          <h2>Educational Purpose Only</h2>
          <p>
            All content, calculators, and tools on MilPayTools.com are provided for educational and informational
            purposes only. Nothing on this site constitutes financial, tax, legal, insurance, or benefits advice.
            Calculator outputs are estimates intended to help you understand how military pay and benefits work —
            they are not a substitute for professional guidance. Users should consult qualified professionals,
            including military financial counselors, tax professionals, and benefits specialists, before making
            financial decisions based on information found on this site.
          </p>

          <h2>Calculator Accuracy</h2>
          <p>
            Calculators use official published data from the Department of Defense (DFAS), Department of Veterans
            Affairs (VA.gov), Defense Travel Management Office (DTMO), and other government sources. While we
            strive for accuracy and verify data against official sources, we cannot guarantee that all calculations
            are error-free. Military pay, benefits, and regulations are complex and subject to change without
            notice. Always verify important financial decisions against official government sources including your
            LES, MyPay, and your unit's Finance Office.
          </p>

          <h2>No Account Required / No Personal Data</h2>
          <p>
            MilPayTools does not require user accounts. All calculator inputs are processed entirely in your
            browser and are never transmitted to or stored on our servers. We do not collect Social Security
            numbers, military ID numbers, service records, bank account information, or any personally
            identifiable financial data through calculator use.
          </p>

          <h2>Email Communications</h2>
          <p>
            Users who voluntarily subscribe to email updates via our newsletter signup consent to receive
            periodic emails about military pay rate updates, new tools, and related content. Email subscriptions
            are powered by Beehiiv. You can unsubscribe at any time using the link in any email we send.
          </p>

          <h2>Intellectual Property</h2>
          <p>
            All content, designs, calculators, code, and original text on MilPayTools.com are the property of
            DPS Digital LLC unless otherwise noted. You are welcome to share links to any page on this site.
            You may not reproduce, scrape, frame, redistribute, or republish substantial portions of site
            content without prior written permission from DPS Digital LLC. Government-sourced data (pay tables,
            BAH rates, VA compensation rates) is in the public domain.
          </p>

          <h2>Third-Party Links</h2>
          <p>
            The site may contain links to external websites, government resources, and third-party services.
            These links are provided for convenience and informational purposes. DPS Digital LLC is not
            responsible for the content, accuracy, availability, or practices of any third-party website.
            Linking to a site does not constitute endorsement.
          </p>

          <h2>Limitation of Liability</h2>
          <p>
            DPS Digital LLC, its owner, and contributors shall not be liable for any direct, indirect,
            incidental, consequential, or punitive damages arising from the use of or reliance on information
            or calculations provided on this site. This includes but is not limited to financial losses, missed
            benefit claims, incorrect tax estimates, incorrect pay calculations, or any decision made based on
            calculator outputs. The site is provided &ldquo;as is&rdquo; without warranty of any kind.
          </p>

          <h2>Affiliate Disclosure</h2>
          <p>
            MilPayTools may contain affiliate links to financial products and services. If you click through an
            affiliate link and take action, DPS Digital LLC may receive compensation at no additional cost to
            you. Affiliate relationships never influence calculator outputs, data sources, or the accuracy of
            educational content. We only reference products or services that we believe are relevant and
            potentially useful to the military community.
          </p>

          <h2>Not a Government Website</h2>
          <p>
            MilPayTools.com is an independently operated website and is not affiliated with, endorsed by, or
            connected to the U.S. Department of Defense, any branch of the U.S. military, the Department of
            Veterans Affairs, DFAS, DTMO, or any other federal or state government agency. References to
            &ldquo;military,&rdquo; &ldquo;DoD,&rdquo; &ldquo;VA,&rdquo; and related terms are used solely
            for educational and descriptive context.
          </p>

          <h2>Modifications</h2>
          <p>
            DPS Digital LLC reserves the right to update or modify these Terms of Service at any time without
            prior notice. Changes will be reflected on this page with an updated effective date. Your continued
            use of MilPayTools.com following any changes constitutes acceptance of the updated terms.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about these Terms of Service can be directed to{' '}
            <a href="mailto:dan@milpaytools.com" className="text-red-700 hover:text-red-800 transition-colors">
              dan@milpaytools.com
            </a>.
          </p>

        </div>
      </section>

      {/* Bottom link strip */}
      <section className="bg-zinc-50 border-t border-zinc-200 py-6 px-4">
        <div className="mx-auto max-w-3xl flex flex-wrap gap-4 text-sm text-zinc-500">
          <Link href="/privacy" className="hover:text-zinc-700 transition-colors">Privacy Policy</Link>
          <Link href="/" className="hover:text-zinc-700 transition-colors">← Back to MilPayTools</Link>
        </div>
      </section>
    </>
  );
}
