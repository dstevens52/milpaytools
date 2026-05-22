import type { Metadata } from 'next';
import Link from 'next/link';
import { lookupBasePay, calculateTotalCompensation } from '@/lib/calculations/total-compensation';
import { lookupBAH } from '@/lib/calculations/bah';
import { BAS_RATES } from '@/data/constants';
import { EmailSignup } from '@/components/EmailSignup';

export const metadata: Metadata = {
  title: 'Starting Military Service: Understand Your Pay & Benefits | MilPayTools',
  description:
    'New to the military? Understand your base pay, BAH, BAS, and TSP match — and make smart money decisions from day one.',
  alternates: { canonical: 'https://www.milpaytools.com/guides/starting-service' },
};

// Example scenario: E-3, 2 years, no dependents, Fort Bragg (ZIP 28310)
const _GRADE = 'E-3';
const _YOS = 2;
const _ZIP = '28310';

const _basePay = lookupBasePay(_GRADE, _YOS);
const _bas = Math.round(BAS_RATES.enlisted);
const _bah = lookupBAH({ payGrade: _GRADE, zipCode: _ZIP, hasDependents: false })?.monthlyRate ?? 0;
const _monthly = _basePay + _bas + _bah;
const _comp = calculateTotalCompensation({
  payGrade: _GRADE,
  yearsOfService: _YOS,
  zipCode: _ZIP,
  hasDependents: false,
  retirementSystem: 'brs',
  tspContributionPct: 5,
  govHousing: false,
  mealCard: false,
});
const _civAnnual = Math.round(_comp.civilianEquivalent / 500) * 500;

function _fmt(n: number) {
  return '$' + n.toLocaleString('en-US');
}

const EX = {
  label: 'Example: E-3 • 2 years • no dependents • Fort Bragg, NC',
  base: _fmt(_basePay),
  bas: _fmt(_bas),
  bah: _fmt(_bah),
  monthly: _fmt(_monthly),
  annual: '≈' + _fmt(_civAnnual),
};

// ─── Arrow icon — uses stroke="currentColor" to inherit parent text color ─────
function ArrowRight() {
  return (
    <svg
      className="w-3.5 h-3.5 flex-none"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

export default function StartingServicePage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden border-b border-zinc-200"
        style={{ background: 'linear-gradient(to bottom, #f2e8d8 0%, #faf8f5 100%)' }}
      >
        {/* Soldier image — full-width background, desktop only */}
        <div className="absolute inset-0 hidden sm:block" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/young-soldier.png"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: 'right center' }}
          />
          {/* Cream overlay: solid on left (text area), fades to transparent on right (soldier) */}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to right, rgba(242,232,212,1) 0%, rgba(242,232,212,1) 30%, rgba(242,232,212,0.85) 45%, rgba(242,232,212,0) 62%)' }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl pt-6 pb-3 sm:pt-9 sm:pb-6 px-4">

          {/* Left column text — constrained so the image stays visible on desktop */}
          <div className="sm:max-w-[58%] mb-5">

            {/* Trust pill */}
            <div className="inline-flex items-center gap-2.5 mb-3 rounded-full bg-zinc-900 px-4 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-none" aria-hidden="true" />
              <span className="text-[11px] font-semibold text-white uppercase tracking-wide">
                Free Calculators &bull; No Account &bull; Official 2026 DoD &amp; VA Data
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-[32px] sm:text-[42px] font-extrabold leading-tight tracking-tight text-zinc-900 mb-3">
              Starting Service: Understand your{' '}
              <span className="text-red-700">military pay and benefits</span>{' '}
              from day one.
            </h1>

            {/* Subtext */}
            <p className="text-sm sm:text-base text-zinc-600 leading-relaxed mb-4">
              Military pay is more than base pay. See the full picture—including BAH, BAS, tax
              advantages, healthcare value, and TSP match—so you can make smart money decisions
              from the start.
            </p>

            {/* Primary CTA */}
            <Link
              href="/calculators/total-compensation?rank=e3&yos=2&zip=28310&dependents=no"
              className="inline-flex items-center gap-2 rounded-md bg-red-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-800 transition-colors"
            >
              Calculate My Total Compensation
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>

          </div>

          {/* ── Example compensation card ── */}
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-md overflow-hidden">
            {/* Card label */}
            <div className="px-4 py-2 border-b border-zinc-100 bg-zinc-50/70 flex items-center gap-3">
              <p className="text-[11px] text-zinc-400 font-medium flex-1">{EX.label}</p>
              <p className="text-[10px] text-zinc-400 sm:hidden flex-none">all monthly</p>
            </div>

            {/* Pay columns */}
            <div className="flex flex-col sm:flex-row">

              {/* Base Pay */}
              <div className="flex-1 flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-1.5 sm:py-3 sm:border-r border-b sm:border-b-0 border-zinc-100">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-50 flex items-center justify-center flex-none">
                  <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex items-center flex-1 min-w-0 sm:block">
                  <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider leading-none flex-1 sm:mb-1">Base Pay</p>
                  <p className="text-sm sm:text-base font-bold text-zinc-900 tabular-nums leading-none">{EX.base}</p>
                  <p className="hidden sm:block text-[10px] text-zinc-400 mt-0.5">monthly</p>
                </div>
              </div>

              {/* BAS */}
              <div className="flex-1 flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-1.5 sm:py-3 sm:border-r border-b sm:border-b-0 border-zinc-100">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-orange-50 flex items-center justify-center flex-none">
                  <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
                  </svg>
                </div>
                <div className="flex items-center flex-1 min-w-0 sm:block">
                  <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider leading-none flex-1 sm:mb-1">BAS</p>
                  <p className="text-sm sm:text-base font-bold text-zinc-900 tabular-nums leading-none">{EX.bas}</p>
                  <p className="hidden sm:block text-[10px] text-zinc-400 mt-0.5">monthly</p>
                </div>
              </div>

              {/* BAH */}
              <div className="flex-1 flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-1.5 sm:py-3 sm:border-r border-b sm:border-b-0 border-zinc-100">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-purple-50 flex items-center justify-center flex-none">
                  <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                  </svg>
                </div>
                <div className="flex items-center flex-1 min-w-0 sm:block">
                  <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider leading-none flex-1 sm:mb-1">BAH</p>
                  <p className="text-sm sm:text-base font-bold text-zinc-900 tabular-nums leading-none">{EX.bah}</p>
                  <p className="hidden sm:block text-[10px] text-zinc-400 mt-0.5">monthly</p>
                </div>
              </div>

              {/* Est. Monthly — green */}
              <div className="flex-1 flex items-center gap-2.5 px-3 sm:px-4 py-1.5 sm:py-3 bg-green-50 sm:border-r border-b sm:border-b-0 border-green-100">
                <div className="flex items-center flex-1 min-w-0 sm:block">
                  <p className="text-[10px] font-semibold text-green-600 uppercase tracking-wider leading-none flex-1 sm:mb-1">Est. Monthly Value</p>
                  <p className="text-sm sm:text-lg font-extrabold text-green-800 tabular-nums leading-none">{EX.monthly}</p>
                  <p className="hidden sm:block text-[10px] text-green-500 mt-0.5">per month</p>
                </div>
              </div>

              {/* Civilian Equivalent — amber */}
              <div className="flex-1 flex items-center gap-2.5 px-3 sm:px-4 py-1.5 sm:py-3 bg-amber-50">
                <div className="flex items-center flex-1 min-w-0 sm:block">
                  <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider leading-none flex-1 sm:mb-1">Civilian Equivalent</p>
                  <p className="text-sm sm:text-lg font-extrabold text-amber-900 tabular-nums leading-none">{EX.annual}</p>
                  <p className="hidden sm:block text-[10px] text-amber-500 mt-0.5">annual, pre-tax</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ── Zone 1: 4 things to do your first month ─────────────────────────── */}
      <section className="bg-white border-b border-zinc-200 py-8 sm:py-10 px-4">
        <div className="mx-auto max-w-5xl">

          {/* Section header */}
          <div className="mb-8">
            <div className="flex items-center gap-2.5 mb-2.5">
              <span className="block h-[3px] w-5 rounded-full bg-red-600" aria-hidden="true" />
              <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-red-600">First Month Checklist</span>
            </div>
            <h2 className="text-[22px] sm:text-[26px] font-bold text-zinc-900 mb-1">
              4 things to do your first month
            </h2>
            <p className="text-sm text-zinc-500">Each one takes less than 2 minutes.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            {/* ── Card 1: PAY / Total Compensation ───────────────────────── */}
            <Link
              href="/calculators/total-compensation"
              className="group relative overflow-hidden rounded-2xl flex flex-col transition-all duration-200 hover:-translate-y-1 shadow-sm hover:shadow-[0_12px_36px_rgba(21,128,61,0.18)]"
              style={{ background: 'linear-gradient(135deg,#f0fdf4 0%,#dcfce7 100%)', borderLeft: '4px solid #15803d', padding: '24px 24px 20px 24px', border: '1px solid #bbf7d0', borderLeftWidth: '4px', borderLeftColor: '#15803d' }}
            >
              {/* Background illustration — line chart, bottom-right */}
              <svg className="absolute bottom-0 right-0 w-[130px] h-[100px] pointer-events-none" viewBox="0 0 130 100" fill="none" stroke="#15803d" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ opacity: 0.10 }}>
                <polyline points="10,80 35,55 60,62 90,30 120,18" />
                <circle cx="35" cy="55" r="4" fill="#15803d" stroke="none" />
                <circle cx="90" cy="30" r="4" fill="#15803d" stroke="none" />
                <circle cx="120" cy="18" r="4" fill="#15803d" stroke="none" />
              </svg>
              {/* Top row: category pill + step counter */}
              <div className="relative z-10 flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em]" style={{ background: 'rgba(21,128,61,0.12)', color: '#15803d' }}>
                  PAY
                </span>
                <span className="text-[11px] font-semibold tabular-nums" style={{ color: 'rgba(21,128,61,0.45)' }}>01 / 04</span>
              </div>
              {/* Icon */}
              <div className="relative z-10 mb-4">
                <div className="w-[52px] h-[52px] rounded-full flex items-center justify-center flex-none" style={{ background: '#15803d', boxShadow: '0 4px 14px rgba(21,128,61,0.32)' }}>
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V13.5zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V18zm2.498-6.75h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V13.5zm0 2.25h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V18zm2.504-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V18zm2.498-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zM8.25 6h7.5v2.25h-7.5V6zM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.626 4.5 4.734V19.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V4.734c0-1.108-.806-2.034-1.907-2.162A48.55 48.55 0 0012 2.25z" />
                  </svg>
                </div>
              </div>
              {/* Title + body */}
              <div className="relative z-10 flex-1">
                <p className="text-[20px] font-semibold leading-snug mb-2" style={{ color: '#14532d' }}>See your real pay</p>
                <p className="text-sm leading-relaxed" style={{ color: '#166534' }}>
                  Most new service members underestimate what they actually earn. See your full compensation in 2 minutes.
                </p>
              </div>
              {/* Outcome chip */}
              <div className="relative z-10 my-4 rounded-lg px-3 py-2" style={{ background: 'rgba(21,128,61,0.07)', border: '1px solid rgba(21,128,61,0.12)' }}>
                <span className="text-[13px] font-semibold" style={{ color: '#15803d' }}>Know your numbers. Plan with confidence.</span>
              </div>
              {/* CTA pill button */}
              <div className="relative z-10">
                <span className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[13px] font-semibold border transition-all duration-150 group-hover:bg-green-700 group-hover:text-white group-hover:border-green-700" style={{ background: '#dcfce7', color: '#15803d', borderColor: '#86efac' }}>
                  Open calculator <ArrowRight />
                </span>
              </div>
            </Link>

            {/* ── Card 2: HOUSING / BAH ──────────────────────────────────── */}
            <Link
              href="/calculators/bah"
              className="group relative overflow-hidden rounded-2xl flex flex-col transition-all duration-200 hover:-translate-y-1 shadow-sm hover:shadow-[0_12px_36px_rgba(29,78,216,0.18)]"
              style={{ background: 'linear-gradient(135deg,#eff6ff 0%,#dbeafe 100%)', border: '1px solid #bfdbfe', borderLeftWidth: '4px', borderLeftColor: '#1d4ed8', padding: '24px 24px 20px 24px' }}
            >
              {/* Background illustration — house outline, bottom-right */}
              <svg className="absolute bottom-0 right-0 w-[120px] h-[110px] pointer-events-none" viewBox="0 0 120 110" fill="none" stroke="#1d4ed8" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ opacity: 0.10 }}>
                <polyline points="8,58 60,10 112,58" />
                <rect x="22" y="58" width="76" height="48" />
                <rect x="47" y="78" width="26" height="28" />
              </svg>
              {/* Top row: category pill + step counter */}
              <div className="relative z-10 flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em]" style={{ background: 'rgba(29,78,216,0.12)', color: '#1d4ed8' }}>
                  HOUSING
                </span>
                <span className="text-[11px] font-semibold tabular-nums" style={{ color: 'rgba(29,78,216,0.45)' }}>02 / 04</span>
              </div>
              {/* Icon */}
              <div className="relative z-10 mb-4">
                <div className="w-[52px] h-[52px] rounded-full flex items-center justify-center flex-none" style={{ background: '#1d4ed8', boxShadow: '0 4px 14px rgba(29,78,216,0.32)' }}>
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                  </svg>
                </div>
              </div>
              {/* Title + body */}
              <div className="relative z-10 flex-1">
                <p className="text-[20px] font-semibold leading-snug mb-2" style={{ color: '#1e3a8a' }}>Look up your BAH</p>
                <p className="text-sm leading-relaxed" style={{ color: '#1e40af' }}>
                  See what housing money you should actually receive before you sign a lease.
                </p>
              </div>
              {/* Outcome chip */}
              <div className="relative z-10 my-4 rounded-lg px-3 py-2" style={{ background: 'rgba(29,78,216,0.07)', border: '1px solid rgba(29,78,216,0.12)' }}>
                <span className="text-[13px] font-semibold" style={{ color: '#1d4ed8' }}>Avoid overpaying. Budget smarter.</span>
              </div>
              {/* CTA pill button */}
              <div className="relative z-10">
                <span className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[13px] font-semibold border transition-all duration-150 group-hover:bg-blue-700 group-hover:text-white group-hover:border-blue-700" style={{ background: '#dbeafe', color: '#1d4ed8', borderColor: '#93c5fd' }}>
                  Open calculator <ArrowRight />
                </span>
              </div>
            </Link>

            {/* ── Card 3: PAYCHECK / LES ─────────────────────────────────── */}
            <Link
              href="/blog/how-to-read-military-les-2026"
              className="group relative overflow-hidden rounded-2xl flex flex-col transition-all duration-200 hover:-translate-y-1 shadow-sm hover:shadow-[0_12px_36px_rgba(180,83,9,0.18)]"
              style={{ background: 'linear-gradient(135deg,#fffbeb 0%,#fef3c7 100%)', border: '1px solid #fde68a', borderLeftWidth: '4px', borderLeftColor: '#b45309', padding: '24px 24px 20px 24px' }}
            >
              {/* Background illustration — document, bottom-right */}
              <svg className="absolute bottom-0 right-0 w-[110px] h-[120px] pointer-events-none" viewBox="0 0 110 120" fill="none" stroke="#b45309" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ opacity: 0.10 }}>
                <rect x="18" y="8" width="62" height="82" rx="6" />
                <line x1="30" y1="32" x2="68" y2="32" />
                <line x1="30" y1="46" x2="58" y2="46" />
                <line x1="30" y1="60" x2="68" y2="60" />
                <line x1="30" y1="74" x2="52" y2="74" />
              </svg>
              {/* Top row: category pill + step counter */}
              <div className="relative z-10 flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em]" style={{ background: 'rgba(180,83,9,0.12)', color: '#b45309' }}>
                  PAYCHECK
                </span>
                <span className="text-[11px] font-semibold tabular-nums" style={{ color: 'rgba(180,83,9,0.45)' }}>03 / 04</span>
              </div>
              {/* Icon */}
              <div className="relative z-10 mb-4">
                <div className="w-[52px] h-[52px] rounded-full flex items-center justify-center flex-none" style={{ background: '#b45309', boxShadow: '0 4px 14px rgba(180,83,9,0.32)' }}>
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
              </div>
              {/* Title + body */}
              <div className="relative z-10 flex-1">
                <p className="text-[20px] font-semibold leading-snug mb-2" style={{ color: '#451a03' }}>Check your first paycheck</p>
                <p className="text-sm leading-relaxed" style={{ color: '#92400e' }}>
                  Learn how to read your LES and catch pay mistakes early before they snowball.
                </p>
              </div>
              {/* Outcome chip */}
              <div className="relative z-10 my-4 rounded-lg px-3 py-2" style={{ background: 'rgba(180,83,9,0.07)', border: '1px solid rgba(180,83,9,0.12)' }}>
                <span className="text-[13px] font-semibold" style={{ color: '#b45309' }}>Fix errors fast and keep more of what you earn.</span>
              </div>
              {/* CTA pill button */}
              <div className="relative z-10">
                <span className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[13px] font-semibold border transition-all duration-150 group-hover:bg-amber-700 group-hover:text-white group-hover:border-amber-700" style={{ background: '#fef3c7', color: '#b45309', borderColor: '#fcd34d' }}>
                  Read guide <ArrowRight />
                </span>
              </div>
            </Link>

            {/* ── Card 4: PROTECTION / SCRA ──────────────────────────────── */}
            <Link
              href="/blog/scra-mla-protections-new-service-members"
              className="group relative overflow-hidden rounded-2xl flex flex-col transition-all duration-200 hover:-translate-y-1 shadow-sm hover:shadow-[0_12px_36px_rgba(185,28,28,0.18)]"
              style={{ background: 'linear-gradient(135deg,#fef2f2 0%,#fee2e2 100%)', border: '1px solid #fecaca', borderLeftWidth: '4px', borderLeftColor: '#b91c1c', padding: '24px 24px 20px 24px' }}
            >
              {/* Background illustration — shield, bottom-right */}
              <svg className="absolute bottom-0 right-0 w-[110px] h-[120px] pointer-events-none" viewBox="0 0 110 120" fill="none" stroke="#b91c1c" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ opacity: 0.10 }}>
                <path d="M55,10 L95,26 L95,56 C95,78 75,96 55,106 C35,96 15,78 15,56 L15,26 Z" />
                <path d="M42,58 L50,66 L70,44" strokeWidth="5" />
              </svg>
              {/* Top row: category pill + step counter */}
              <div className="relative z-10 flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em]" style={{ background: 'rgba(185,28,28,0.12)', color: '#b91c1c' }}>
                  PROTECTION
                </span>
                <span className="text-[11px] font-semibold tabular-nums" style={{ color: 'rgba(185,28,28,0.45)' }}>04 / 04</span>
              </div>
              {/* Icon */}
              <div className="relative z-10 mb-4">
                <div className="w-[52px] h-[52px] rounded-full flex items-center justify-center flex-none" style={{ background: '#b91c1c', boxShadow: '0 4px 14px rgba(185,28,28,0.32)' }}>
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </div>
              </div>
              {/* Title + body */}
              <div className="relative z-10 flex-1">
                <p className="text-[20px] font-semibold leading-snug mb-2" style={{ color: '#450a0a' }}>Avoid a bad car loan</p>
                <p className="text-sm leading-relaxed" style={{ color: '#991b1b' }}>
                  Know your SCRA protections before you finance anything or sign at the dealership.
                </p>
              </div>
              {/* Outcome chip */}
              <div className="relative z-10 my-4 rounded-lg px-3 py-2" style={{ background: 'rgba(185,28,28,0.07)', border: '1px solid rgba(185,28,28,0.12)' }}>
                <span className="text-[13px] font-semibold" style={{ color: '#b91c1c' }}>Save thousands and protect your rights.</span>
              </div>
              {/* CTA pill button */}
              <div className="relative z-10">
                <span className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[13px] font-semibold border transition-all duration-150 group-hover:bg-red-700 group-hover:text-white group-hover:border-red-700" style={{ background: '#fee2e2', color: '#b91c1c', borderColor: '#fca5a5' }}>
                  Read guide <ArrowRight />
                </span>
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* ── Zone 2 + 3 ───────────────────────────────────────────────────────── */}
      <section className="bg-white py-8 sm:py-10 px-4">
        <div className="mx-auto max-w-5xl">

          {/* Zone 2: When you're ready for more */}
          <p className="text-base font-medium text-zinc-900 mb-4">When you&apos;re ready for more</p>
          <ul className="space-y-4 mb-10">

            <li className="flex items-start gap-3">
              <svg className="w-4 h-4 text-zinc-400 mt-0.5 flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
              </svg>
              <span className="text-sm text-zinc-700 leading-relaxed">
                Your TSP is already investing for you —{' '}
                <Link href="/blog/tsp-fund-options-explained" className="text-red-700 hover:text-red-800 underline decoration-red-200 underline-offset-2">
                  see what it&apos;s doing
                </Link>
              </span>
            </li>

            <li className="flex items-start gap-3">
              <svg className="w-4 h-4 text-zinc-400 mt-0.5 flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
              </svg>
              <span className="text-sm text-zinc-700 leading-relaxed">
                You have education benefits you can use now —{' '}
                <Link href="/blog/gi-bill-vs-tuition-assistance" className="text-red-700 hover:text-red-800 underline decoration-red-200 underline-offset-2">
                  learn how to sequence them
                </Link>
              </span>
            </li>

            <li className="flex items-start gap-3">
              <svg className="w-4 h-4 text-zinc-400 mt-0.5 flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
              </svg>
              <span className="text-sm text-zinc-700 leading-relaxed">
                Military credit card perks most people miss —{' '}
                <Link href="/blog/military-credit-card-scra-mla-benefits" className="text-red-700 hover:text-red-800 underline decoration-red-200 underline-offset-2">
                  SCRA fee waivers
                </Link>
              </span>
            </li>

          </ul>

          {/* Zone 3: Email capture */}
          <div className="border-t border-zinc-200 pt-8">
            <div className="max-w-lg mx-auto">
              <div className="flex justify-center mb-4">
                <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                  </svg>
                </div>
              </div>
              <EmailSignup
                source="starting-service"
                headline="Stay in the loop on military pay updates"
                subtext="We only email when it matters — new rates, benefit changes, tools you can use."
                variant="card"
              />
            </div>
          </div>

        </div>
      </section>

    </>
  );
}
