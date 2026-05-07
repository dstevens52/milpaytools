'use client';

import { useState } from 'react';
import Link from 'next/link';

// ─── State shape ──────────────────────────────────────────────────────────────

interface FormState {
  // Header
  name: string;
  separationDate: string;
  rankBranch: string;
  yearsOfService: string;
  // Military compensation
  basePay: string;
  bah: string;
  bas: string;
  taxAdvantage: string;
  totalMilitary: string;
  // Post-military estimate
  targetSalary: string;
  netMonthly: string;
  spouseIncome: string;
  vaComp: string;
  healthcareCost: string;
  monthlyExpenses: string;
  // Gap row
  surplus: string;
  emergencyRunway: string;
  // Key deadlines
  bddWindow: string;
  shpeDate: string;
  dentalExam: string;
  sgliDeadline: string;
  tricareEnd: string;
  pcsDeadline: string;
  dd214Review: string;
  // Action items
  action1: string;
  action2: string;
  action3: string;
  // Notes
  note1: string;
  note2: string;
  note3: string;
}

const EMPTY: FormState = {
  name: '', separationDate: '', rankBranch: '', yearsOfService: '',
  basePay: '', bah: '', bas: '', taxAdvantage: '', totalMilitary: '',
  targetSalary: '', netMonthly: '', spouseIncome: '', vaComp: '',
  healthcareCost: '', monthlyExpenses: '',
  surplus: '', emergencyRunway: '',
  bddWindow: '', shpeDate: '', dentalExam: '', sgliDeadline: '',
  tricareEnd: '', pcsDeadline: '', dd214Review: '',
  action1: '', action2: '', action3: '',
  note1: '', note2: '', note3: '',
};

// ─── Field components ─────────────────────────────────────────────────────────

function Field({
  label,
  value,
  onChange,
  hint,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  placeholder?: string;
}) {
  return (
    <div className="mb-3">
      <label className="block text-xs font-medium text-zinc-500 mb-0.5 leading-tight">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? ''}
        className="worksheet-input w-full bg-transparent border-0 border-b-2 border-zinc-300 text-sm text-zinc-900 py-0.5 px-0 focus:outline-none focus:border-red-600 placeholder:text-zinc-300 transition-colors"
      />
      {hint && <p className="text-xs text-zinc-400 mt-0.5">{hint}</p>}
    </div>
  );
}

function ResultField({
  label,
  value,
  onChange,
  hint,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-zinc-500 mb-0.5 leading-tight">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? ''}
        className="worksheet-input worksheet-input-result w-full bg-zinc-50 border-0 border-b-2 border-zinc-900 text-sm font-semibold text-zinc-900 py-1 px-1.5 focus:outline-none focus:border-red-700 placeholder:text-zinc-300 transition-colors"
      />
      {hint && <p className="text-xs text-zinc-400 mt-0.5">{hint}</p>}
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

// ─── Main component ───────────────────────────────────────────────────────────

export function WorksheetInteractive() {
  const [fields, setFields] = useState<FormState>(EMPTY);

  function set(key: keyof FormState) {
    return (val: string) => setFields((prev) => ({ ...prev, [key]: val }));
  }

  function clearAll() {
    if (window.confirm('Are you sure you want to clear all entries? This cannot be undone.')) {
      setFields(EMPTY);
    }
  }

  return (
    <div className="bg-zinc-100 min-h-screen py-8 print:bg-white print:py-0 print:min-h-0">

      {/* ── Screen-only controls ───────────────────────────────────────── */}
      <div className="print:hidden max-w-3xl mx-auto px-4 mb-5 space-y-3">

        <Link
          href="/transition"
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors inline-flex items-center gap-1"
        >
          ← Back to Transition Guide
        </Link>

        <p className="text-sm text-zinc-700 leading-relaxed">
          Fill this out during TAP or at home. Use estimates if you don&apos;t know exact numbers yet.{' '}
          <strong className="font-semibold text-zinc-900">Print or save a copy before you leave the page</strong> — your entries are not saved when you close this tab.
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4 flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              Print / Save as PDF
            </button>

            <button
              type="button"
              onClick={clearAll}
              className="inline-flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:border-zinc-400 hover:text-zinc-900 transition-colors"
            >
              <svg className="w-4 h-4 flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
              Clear All Entries
            </button>

            <a
              href="/calculators/transition-readiness"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:border-zinc-400 hover:text-zinc-900 transition-colors"
            >
              <svg className="w-4 h-4 flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              Open Transition Readiness Calculator
            </a>
          </div>

          <p className="text-xs text-zinc-500 sm:ml-auto max-w-xs">
            No account required. Your entries stay in your browser and are not submitted to or stored by MilPayTools.
          </p>
        </div>

      </div>

      {/* ── Worksheet paper ────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto bg-white shadow-lg print:shadow-none print:max-w-none px-8 py-8 print:px-6 print:py-4">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 mb-5 border-b-2 border-zinc-900">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold tracking-widest uppercase text-red-700">MilPayTools.com</p>
            <h1 className="text-xl font-extrabold text-zinc-900 leading-tight mt-0.5">
              Military Transition Planning Worksheet
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Use with the Transition Readiness Calculator at milpaytools.com/calculators/transition-readiness
            </p>
          </div>
          <div className="flex-none space-y-2 w-44">
            <Field label="Name" value={fields.name} onChange={set('name')} placeholder="Your name" />
            <Field label="Separation / retirement date" value={fields.separationDate} onChange={set('separationDate')} placeholder="DD MMM YYYY" />
            <Field label="Rank / Branch" value={fields.rankBranch} onChange={set('rankBranch')} placeholder="E.g. SSG, USA" />
            <Field label="Years of service" value={fields.yearsOfService} onChange={set('yearsOfService')} placeholder="E.g. 8" />
          </div>
        </div>

        {/* Top two columns */}
        <div className="grid grid-cols-2 gap-6 mb-5">

          <div>
            <SectionHeading>My Current Military Compensation</SectionHeading>
            <Field label="Base pay (monthly)" value={fields.basePay} onChange={set('basePay')} placeholder="$0,000" />
            <Field label="BAH — housing allowance" value={fields.bah} onChange={set('bah')} placeholder="$0,000" />
            <Field label="BAS — subsistence allowance" value={fields.bas} onChange={set('bas')} placeholder="$477 enlisted / $316 officer" />
            <Field label="Tax advantage estimate" value={fields.taxAdvantage} onChange={set('taxAdvantage')} placeholder="From the calculator" />
            <Field label="Total monthly value" value={fields.totalMilitary} onChange={set('totalMilitary')} placeholder="$0,000" />
          </div>

          <div>
            <SectionHeading>My Post-Military Estimate</SectionHeading>
            <Field label="Target civilian salary (annual gross)" value={fields.targetSalary} onChange={set('targetSalary')} placeholder="$00,000" />
            <Field label="Expected net monthly take-home" value={fields.netMonthly} onChange={set('netMonthly')} placeholder="$0,000" />
            <Field label="Spouse / partner income (annual)" value={fields.spouseIncome} onChange={set('spouseIncome')} placeholder="$0 if N/A" />
            <Field label="Expected VA disability compensation" value={fields.vaComp} onChange={set('vaComp')} placeholder="$0 if none filed" />
            <Field label="Healthcare replacement cost (monthly)" value={fields.healthcareCost} onChange={set('healthcareCost')} placeholder="TRICARE → marketplace" />
            <Field label="Monthly expenses (excluding healthcare)" value={fields.monthlyExpenses} onChange={set('monthlyExpenses')} placeholder="$0,000" />
          </div>

        </div>

        {/* Gap row */}
        <div className="grid grid-cols-2 gap-6 mb-4">
          <ResultField
            label="Monthly surplus or shortfall"
            value={fields.surplus}
            onChange={set('surplus')}
            hint="Income minus adjusted expenses"
            placeholder="+ surplus or − shortfall"
          />
          <ResultField
            label="Emergency fund runway"
            value={fields.emergencyRunway}
            onChange={set('emergencyRunway')}
            hint="Liquid savings ÷ monthly expenses = _____ months"
            placeholder="_____ months"
          />
        </div>

        <div className="border-t border-zinc-200 my-4" />

        {/* Bottom two columns */}
        <div className="grid grid-cols-2 gap-6 mb-4">

          <div>
            <SectionHeading>My Key Deadlines</SectionHeading>
            <Field label="BDD filing window (180–90 days before separation)" value={fields.bddWindow} onChange={set('bddWindow')} placeholder="Opens: _______ Closes: _______" />
            <Field label="SHPE / SHA medical appointment" value={fields.shpeDate} onChange={set('shpeDate')} placeholder="Date" />
            <Field label="Final dental exam" value={fields.dentalExam} onChange={set('dentalExam')} placeholder="Date" />
            <Field label="SGLI → VGLI conversion deadline (120 days after sep)" value={fields.sgliDeadline} onChange={set('sgliDeadline')} placeholder="Date" />
            <Field label="TRICARE / TAMP end date" value={fields.tricareEnd} onChange={set('tricareEnd')} placeholder="Date" />
            <Field label="Final PCS move deadline" value={fields.pcsDeadline} onChange={set('pcsDeadline')} placeholder="Date" />
            <Field label="DD-214 review date" value={fields.dd214Review} onChange={set('dd214Review')} placeholder="Date" />
          </div>

          <div>
            <SectionHeading>My 3 Priority Action Items</SectionHeading>
            <div className="space-y-3 mb-5">
              {(
                [
                  { n: '1', key: 'action1' },
                  { n: '2', key: 'action2' },
                  { n: '3', key: 'action3' },
                ] as const
              ).map(({ n, key }) => (
                <div key={n} className="flex items-start gap-2">
                  <span className="text-xs font-bold text-zinc-700 mt-1.5 flex-none">{n}.</span>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={fields[key]}
                      onChange={(e) => set(key)(e.target.value)}
                      placeholder="Write your next step here"
                      className="worksheet-input w-full bg-transparent border-0 border-b-2 border-zinc-300 text-sm text-zinc-900 py-0.5 px-0 focus:outline-none focus:border-red-600 placeholder:text-zinc-300 transition-colors"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-zinc-200">
              <SectionHeading>Notes</SectionHeading>
              <div className="space-y-3">
                {(
                  [
                    { key: 'note1' },
                    { key: 'note2' },
                    { key: 'note3' },
                  ] as const
                ).map(({ key }) => (
                  <input
                    key={key}
                    type="text"
                    value={fields[key]}
                    onChange={(e) => set(key)(e.target.value)}
                    placeholder=""
                    className="worksheet-input w-full bg-transparent border-0 border-b border-zinc-300 text-sm text-zinc-700 py-0.5 px-0 focus:outline-none focus:border-red-600 placeholder:text-zinc-200 transition-colors"
                  />
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
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
