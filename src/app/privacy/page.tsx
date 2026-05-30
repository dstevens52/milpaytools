import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for MilPayTools.com, operated by DPS Digital LLC. How we collect, use, and protect information when you use our military pay calculators.',
  alternates: { canonical: 'https://www.milpaytools.com/privacy' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Privacy Policy | MilPayTools',
    description: 'Privacy Policy for MilPayTools.com, operated by DPS Digital LLC. How we collect, use, and protect information when you use our military pay calculators.',
    type: 'website',
    url: 'https://www.milpaytools.com/privacy',
    siteName: 'MilPayTools',
  },
};

export default function PrivacyPage() {
  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-white border-b border-zinc-100">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-3">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-sm text-zinc-500">
              <li><Link href="/" className="hover:text-zinc-700 transition-colors">Home</Link></li>
              <li aria-hidden="true">/</li>
              <li className="text-zinc-800 font-medium">Privacy Policy</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-zinc-50 border-b border-zinc-200 py-10 sm:py-14 px-4">
        <div className="mx-auto max-w-3xl">
          <div className="w-8 h-0.5 bg-red-700 rounded-full mb-5" aria-hidden="true" />
          <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight text-zinc-900 mb-3">
            Privacy Policy
          </h1>
          <p className="text-sm text-zinc-500">Effective: May 2026 · DPS Digital LLC (&ldquo;we,&rdquo; &ldquo;us,&rdquo; &ldquo;our&rdquo;)</p>
        </div>
      </section>

      {/* Content */}
      <section className="bg-white py-10 sm:py-14 px-4">
        <div className="mx-auto max-w-3xl prose prose-zinc prose-sm sm:prose-base max-w-none">

          <h2>Overview</h2>
          <p>
            This Privacy Policy describes how DPS Digital LLC collects, uses, and protects information when
            you use MilPayTools.com. We are committed to being transparent about our data practices. In short:
            we collect very little information, we don&rsquo;t sell it, and your calculator inputs never leave
            your browser.
          </p>

          <h2>Information We Collect</h2>

          <h3>Analytics data</h3>
          <p>
            We use Google Analytics (GA4) and Microsoft Clarity to understand how visitors use the site. This
            includes anonymized data such as pages visited, time on site, device type, browser, and general
            location (city or region level). This data is aggregated and used only to improve the site. We do
            not collect names, addresses, or financial information through analytics tools.
          </p>

          <h3>Email addresses</h3>
          <p>
            If you voluntarily subscribe to our email list using a signup form on the site, we collect your
            email address for the sole purpose of sending periodic updates about military pay rate changes,
            new calculators, and related content. Email subscriptions are managed by Beehiiv. We do not sell,
            rent, or share email addresses with third parties for marketing purposes.
          </p>

          <h3>Feedback submissions</h3>
          <p>
            If you submit feedback through our feedback form, we collect the message content and, optionally,
            your email address if you choose to provide it. Feedback is used solely to improve the site and
            respond to your submission.
          </p>

          <h2>Information We Do NOT Collect</h2>
          <ul>
            <li>Social Security numbers, military ID numbers, or service records</li>
            <li>Bank account, routing numbers, or credit card information</li>
            <li>Personal financial data or military pay information</li>
            <li>
              Calculator inputs — all calculations run entirely in your browser and are never sent to
              our servers
            </li>
          </ul>

          <h2>Cookies and Tracking</h2>
          <ul>
            <li>Google Analytics (GA4) uses cookies to analyze site traffic and usage patterns</li>
            <li>Microsoft Clarity uses cookies for heatmaps and session replay analytics</li>
            <li>Beehiiv may use cookies for email subscription management</li>
            <li>We do not use advertising cookies or sell behavioral data to advertisers</li>
            <li>
              You can disable cookies through your browser settings. Some site functionality may be
              affected if cookies are disabled, but all calculators will continue to work.
            </li>
          </ul>

          <h2>Third-Party Services</h2>
          <p>
            MilPayTools uses the following third-party services, each of which has its own privacy policy
            governing their data practices:
          </p>
          <ul>
            <li><strong>Google Analytics (GA4)</strong> — site analytics and traffic measurement</li>
            <li><strong>Microsoft Clarity</strong> — heatmaps and session analytics</li>
            <li><strong>Beehiiv</strong> — email newsletter management and delivery</li>
            <li><strong>Resend</strong> — transactional email delivery (e.g. feedback notifications)</li>
            <li><strong>Vercel</strong> — website hosting and edge network delivery</li>
          </ul>
          <p>
            We are not responsible for the privacy practices of these third-party services.
          </p>

          <h2>Data Security</h2>
          <p>
            We take reasonable technical and organizational measures to protect information collected through
            the site. However, no internet transmission or electronic storage system is 100% secure. We
            encourage you to take appropriate steps to protect your personal information when using any
            online service.
          </p>

          <h2>Children&rsquo;s Privacy</h2>
          <p>
            MilPayTools.com is not directed at children under 13. We do not knowingly collect personal
            information from children under 13. If you believe we have inadvertently collected information
            from a child, please contact us at{' '}
            <a href="mailto:dan@milpaytools.com" className="text-red-700 hover:text-red-800 transition-colors">
              dan@milpaytools.com
            </a>{' '}
            and we will promptly delete it.
          </p>

          <h2>Your Rights</h2>
          <p>
            You may unsubscribe from email communications at any time using the unsubscribe link included in
            every email we send. To request deletion of a feedback submission or any other data you have
            provided, contact us at{' '}
            <a href="mailto:dan@milpaytools.com" className="text-red-700 hover:text-red-800 transition-colors">
              dan@milpaytools.com
            </a>.
          </p>

          <h2>Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Changes will be posted on this page with
            an updated effective date. Continued use of the site following any changes constitutes acceptance
            of the updated policy.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about this Privacy Policy can be directed to{' '}
            <a href="mailto:dan@milpaytools.com" className="text-red-700 hover:text-red-800 transition-colors">
              dan@milpaytools.com
            </a>.
          </p>

        </div>
      </section>

      {/* Bottom link strip */}
      <section className="bg-zinc-50 border-t border-zinc-200 py-6 px-4">
        <div className="mx-auto max-w-3xl flex flex-wrap gap-4 text-sm text-zinc-500">
          <Link href="/terms" className="hover:text-zinc-700 transition-colors">Terms of Service</Link>
          <Link href="/" className="hover:text-zinc-700 transition-colors">← Back to MilPayTools</Link>
        </div>
      </section>
    </>
  );
}
