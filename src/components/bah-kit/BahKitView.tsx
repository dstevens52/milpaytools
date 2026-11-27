import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { CollapsibleRateTable } from '@/components/calculators/bah/CollapsibleRateTable';
import { KitCopyButton, KitDownloadLink, KitViewEvent } from '@/components/bah-kit/BahKitClient';
import type { BahKitData } from '@/lib/bahKit';

/**
 * The BAH kit page body (build W3), sections top to bottom as in the build
 * spec. Renders only what src/lib/bahKit.ts computed, so tests can render it
 * from a mocked data year (tests/e2e/bah-kit-unit.spec.ts).
 */

function Section({ title, children, testId }: { title: string; children: ReactNode; testId?: string }) {
  return (
    <section className="bg-white rounded-lg border border-zinc-200 p-5 sm:p-6" data-testid={testId}>
      <h2 className="text-lg font-semibold text-zinc-900 mb-3">{title}</h2>
      {children}
    </section>
  );
}

export function BahKitView({ kit }: { kit: BahKitData }) {
  const { slug, name, year, priorYear } = kit;

  return (
    <div className="bg-zinc-50 min-h-screen">
      <KitViewEvent station={slug} year={year} />
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8 space-y-5">
        {/* 1. Header */}
        <header>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900">{`${name} BAH ${year} kit`}</h1>
          <p className="text-sm text-zinc-600 mt-2">Free to use. Please link back to the source.</p>
        </header>

        {/* 2. The image */}
        <Section title="The image" testId="kit-image">
          <Image
            src={kit.image.src}
            alt={`${name} BAH ${year}: monthly rates by pay grade`}
            width={kit.image.width}
            height={kit.image.height}
            unoptimized
            className="w-full max-w-sm h-auto rounded-md border border-zinc-200"
          />
          <div className="mt-4">
            <KitDownloadLink href={kit.image.downloadHref} filename={kit.image.filename} station={slug} year={year} />
          </div>
          <p className="text-xs text-zinc-500 mt-2">{`${kit.image.width} x ${kit.image.height}, for Instagram and Facebook.`}</p>
        </Section>

        {/* 3. Sentences to paste */}
        <Section title="Sentences to paste" testId="kit-sentences">
          <ul className="space-y-4">
            {kit.sentences.map((s) => (
              <li key={s.id} className="rounded-md bg-zinc-50 border border-zinc-200 p-4" data-testid={`kit-sentence-${s.id}`}>
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-1.5">{s.label}</p>
                <p className="text-sm text-zinc-800 leading-relaxed" data-testid={`kit-sentence-${s.id}-text`}>
                  {s.text}
                </p>
                <div className="mt-3">
                  <KitCopyButton text={s.text} item={s.id} station={slug} year={year}>
                    Copy
                  </KitCopyButton>
                </div>
              </li>
            ))}
          </ul>
          {kit.sentences.length > 1 && (
            <div className="mt-4">
              <KitCopyButton text={kit.allText} item="all" station={slug} year={year} primary>
                Copy all
              </KitCopyButton>
            </div>
          )}
        </Section>

        {/* 4. Numbers table (the station page's table component) */}
        <CollapsibleRateTable
          locationName={kit.mhaLabel}
          ratesW={kit.table.ratesW}
          ratesWO={kit.table.ratesWO}
          ratesWPrev={kit.table.ratesWPrev}
          ratesWOPrev={kit.table.ratesWOPrev}
          currentYear={year}
          priorYear={priorYear}
          effectiveLabel={kit.effectiveLabel}
        />

        {/* 5. Credit link */}
        <Section title="Credit link" testId="kit-credit">
          <p className="text-sm text-zinc-600 mb-3">
            A link back is appreciated, never required. Paste this where you post the numbers:
          </p>
          <pre
            className="whitespace-pre-wrap break-all rounded-md bg-zinc-900 text-zinc-100 text-xs p-3 font-mono"
            data-testid="kit-credit-html"
          >
            {kit.credit.html}
          </pre>
          <div className="mt-3 flex flex-wrap gap-2">
            <KitCopyButton text={kit.credit.html} item="html" station={slug} year={year}>
              Copy HTML
            </KitCopyButton>
            <KitCopyButton text={kit.credit.url} item="link" station={slug} year={year}>
              Copy plain link
            </KitCopyButton>
          </div>
        </Section>

        {/* 6. For their clients */}
        <Section title="For your clients" testId="kit-clients">
          <p className="text-sm text-zinc-700">
            Anyone can look up their exact rate here:{' '}
            <Link href={kit.pageHref} className="font-medium text-red-700 hover:text-red-800 underline">
              {`${name} BAH rates`}
            </Link>
          </p>
        </Section>

        {/* 7. Other markets */}
        <Section title="Other markets" testId="kit-other-markets">
          <p className="text-sm text-zinc-700">
            <Link href="/bah/changes" className="font-medium text-red-700 hover:text-red-800 underline">
              {`See every housing area's change from ${priorYear} to ${year}`}
            </Link>
          </p>
        </Section>

        {/* 8. Source and disclaimer (the station page's wording) */}
        <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 text-xs text-slate-500 leading-relaxed space-y-2" data-testid="kit-disclaimer">
          <p className="font-semibold text-slate-600">Data Source &amp; Disclaimer</p>
          <p>
            {`BAH rates are from the Defense Travel Management Office (DTMO) ${year} BAH data, effective ${kit.effectiveLabel}. Rates are set by Military Housing Area (MHA), not individual ZIP code — all ZIPs in the same MHA receive identical rates. This page is for informational purposes only and is not affiliated with DoD, DTMO, or any government agency. Verify your entitlement at`}{' '}
            <a
              href="https://www.travel.dod.mil/Allowances/Basic-Allowance-for-Housing/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              travel.dod.mil
            </a>
            .
          </p>
          {kit.rentSourceLabel && (
            <>
              <p>
                {`${kit.rentSourceLabel}. Rent figures are HUD Small Area Fair Market Rents matched to this installation's Military Housing Area by ZIP code. MHA boundaries and HUD rent areas don't align perfectly, so these are area-level reference figures, not a personalized rent estimate. FMR is a gross-rent figure that includes tenant-paid utilities — the same basis BAH is built on.`}
              </p>
              <p>
                Rent and cost figures on this page are approximate and provided for informational and educational purposes only. They reflect market estimates at time of publication and may not reflect current conditions. This is not financial, tax, or housing advice. Always verify figures independently and consult a qualified professional before making financial commitments.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
