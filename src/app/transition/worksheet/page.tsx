import type { Metadata } from 'next';
import Link from 'next/link';
import { PrintButton } from './PrintButton';

export const metadata: Metadata = {
  title: { absolute: 'TAP Student Worksheet | MilPayTools' },
  description: 'Printable military transition planning worksheet for TAP classes. Fill in your numbers, deadlines, and action items.',
  robots: { index: false }, // worksheet is a utility page, not an SEO target
};

function Field({ label }: { label: string }) {
  return (
    <div className="mb-3">
      <p className="text-xs font-medium text-zinc-500 mb-0.5 leading-tight">{label}</p>
      <div className="h-7 border-b-2 border-zinc-400" />
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-900 mb-3 pb-1 border-b border-zinc-900">
      {children}
    </h2>
  );
}

export default function WorksheetPage() {
  return (
    <div className="bg-zinc-100 min-h-screen py-8 print:bg-white print:py-0 print:min-h-0">

      {/* Screen-only controls */}
      <div className="print:hidden max-w-3xl mx-auto px-4 mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/transition"
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors inline-flex items-center gap-1"
        >
          ← Back to Transition Guide
        </Link>
        <div className="flex items-center gap-3">
          <p className="text-xs text-zinc-500">Opens your browser print dialog — choose &ldquo;Save as PDF&rdquo;</p>
          <PrintButton />
        </div>
      </div>

      {/* Worksheet paper */}
      <div className="max-w-3xl mx-auto bg-white shadow-lg print:shadow-none print:max-w-none px-8 py-8 print:px-6 print:py-4">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4 pb-4 mb-5 border-b-2 border-zinc-900">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase text-red-700">MilPayTools.com</p>
            <h1 className="text-xl font-extrabold text-zinc-900 leading-tight mt-0.5">
              Military Transition Planning Worksheet
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">Use with the Transition Readiness Calculator at milpaytools.com/calculators/transition-readiness</p>
          </div>
          <div className="flex-none text-right space-y-2 min-w-[160px]">
            <div>
              <p className="text-xs text-zinc-500 mb-0.5">Name</p>
              <div className="h-6 border-b-2 border-zinc-400 w-40" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-0.5">Separation date</p>
              <div className="h-6 border-b-2 border-zinc-400 w-40" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-0.5">Rank / Branch</p>
              <div className="h-6 border-b-2 border-zinc-400 w-40" />
            </div>
          </div>
        </div>

        {/* ── Top two columns ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-6 mb-5">

          {/* Military Compensation */}
          <div>
            <SectionHeading>My Current Military Compensation</SectionHeading>
            <Field label="Base pay (monthly)" />
            <Field label="BAH — housing allowance" />
            <Field label="BAS — subsistence allowance" />
            <Field label="Tax advantage estimate" />
            <Field label="Total monthly value" />
          </div>

          {/* Post-Military Estimate */}
          <div>
            <SectionHeading>My Post-Military Estimate</SectionHeading>
            <Field label="Target civilian salary (annual gross)" />
            <Field label="Expected net monthly take-home" />
            <Field label="Spouse / partner income (annual)" />
            <Field label="Expected VA disability compensation" />
            <Field label="Healthcare replacement cost (monthly)" />
            <Field label="Monthly expenses (excluding healthcare)" />
          </div>

        </div>

        {/* Gap row */}
        <div className="grid grid-cols-2 gap-6 mb-2">
          <div>
            <p className="text-xs font-medium text-zinc-500 mb-0.5">Monthly surplus or shortfall</p>
            <div className="h-8 border-b-2 border-zinc-900 bg-zinc-50" />
            <p className="text-xs text-zinc-400 mt-0.5">Income minus adjusted expenses</p>
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-500 mb-0.5">Emergency fund runway</p>
            <div className="h-8 border-b-2 border-zinc-900 bg-zinc-50" />
            <p className="text-xs text-zinc-400 mt-0.5">Liquid savings ÷ monthly expenses = _____ months</p>
          </div>
        </div>

        <div className="border-t border-zinc-200 my-4" />

        {/* ── Bottom two columns ───────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-6 mb-4">

          {/* Key Deadlines */}
          <div>
            <SectionHeading>My Key Deadlines</SectionHeading>
            <Field label="BDD filing window (180–90 days before separation)" />
            <Field label="SHPE / SHA medical appointment" />
            <Field label="Final dental exam" />
            <Field label="SGLI → VGLI conversion deadline (120 days after sep)" />
            <Field label="TRICARE / TAMP end date" />
            <Field label="Final PCS move deadline" />
          </div>

          {/* Action Items */}
          <div>
            <SectionHeading>My 3 Priority Action Items</SectionHeading>
            <div className="space-y-4">
              {['1', '2', '3'].map((n) => (
                <div key={n}>
                  <p className="text-xs font-bold text-zinc-700 mb-1">{n}.</p>
                  <div className="h-6 border-b border-zinc-400 mb-1" />
                  <div className="h-6 border-b border-zinc-300" />
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-200">
              <SectionHeading>Notes</SectionHeading>
              <div className="space-y-2.5">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-5 border-b border-zinc-300" />
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* ── Footer ─────────────────────────────────────────────────── */}
        <div className="border-t border-zinc-300 pt-3 flex items-center justify-between">
          <p className="text-xs text-zinc-500">
            Generated from <strong>MilPayTools.com</strong> — Free military financial calculators at{' '}
            <span className="font-medium">www.milpaytools.com/calculators</span>
          </p>
          <p className="text-xs text-zinc-400">Data current as of January 1, 2026</p>
        </div>

      </div>

      {/* Screen-only bottom note */}
      <div className="print:hidden max-w-3xl mx-auto px-4 mt-4 text-center">
        <p className="text-xs text-zinc-500">
          In the print dialog: set paper size to Letter, margins to Default or Normal, and check &ldquo;Background graphics&rdquo; if fields appear blank.
        </p>
      </div>

    </div>
  );
}
