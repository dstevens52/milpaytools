import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { lookupBAH } from '@/lib/calculations/bah';
import { calculateTotalCompensation } from '@/lib/calculations/total-compensation';
import { formatCurrency } from '@/lib/utils';
import { OG_WIDTH, OG_HEIGHT } from '@/lib/og';
import type { TotalCompensationInput } from '@/types/calculator';

// Node.js runtime: lets the route import the BAH dataset (~166KB) and read the
// committed Inter font files from disk — no network font fetches at request time.
export const runtime = 'nodejs';

const W = OG_WIDTH;   // 1200
const H = OG_HEIGHT;  // 630

// ─── Palette ─────────────────────────────────────────────────────────────────
const NAVY = '#0F1B2D';
const CARD_FILL = '#16263D';
const CARD_BORDER = '#2C405C';
const RED = '#B91C1C';
const GREEN = '#4ADE80';
const SLATE_MUTED = '#8CA0B8';
const SLATE_LIGHT = '#C9D6E4';

// ─── Fonts (committed adjacent to this route; read once at module scope) ─────
// Single-expression process.cwd() joins so Vercel's output file tracing
// statically detects and bundles the .ttf files with the function.
const interRegular = fs.readFileSync(
  path.join(process.cwd(), 'src/app/api/og/fonts/Inter-Regular.ttf'),
);
const interBold = fs.readFileSync(
  path.join(process.cwd(), 'src/app/api/og/fonts/Inter-Bold.ttf'),
);

// ─── Sample result for type=home ─────────────────────────────────────────────
// Computed from the same lib functions the total-compensation calculator uses,
// with the calculator's exact default inputs for an E-5 @ 8 YOS in San Diego
// (Naval Station San Diego ZIP 92106 → MHA CA038). Never hand-key these figures.
const SAMPLE_INPUT: TotalCompensationInput = {
  payGrade: 'E-5',
  yearsOfService: 8,
  hasDependents: true,
  zipCode: '92106',
  retirementSystem: 'brs',
  tspContributionPct: 5,
  govHousing: false,
  mealCard: false,
};

const sampleComp = (() => {
  const bah = lookupBAH({
    payGrade: SAMPLE_INPUT.payGrade,
    zipCode: SAMPLE_INPUT.zipCode,
    hasDependents: SAMPLE_INPUT.hasDependents,
  });
  const result = calculateTotalCompensation(SAMPLE_INPUT, bah?.monthlyRate ?? 0);
  return {
    monthly: formatCurrency(result.totalMonthly),
    civilianAnnual: formatCurrency(result.civilianEquivalent),
  };
})();

// ─── Per-type copy ───────────────────────────────────────────────────────────
function titleFontSize(title: string): number {
  if (title.length < 25) return 72;
  if (title.length < 40) return 64;
  if (title.length < 55) return 56;
  return 48;
}

function defaultSubtitle(type: string): string {
  switch (type) {
    case 'calculator': return 'Free 2026 Calculator • Official DoD Data';
    case 'blog': return 'MilPayTools.com';
    case 'guide': return 'Comprehensive Guide • MilPayTools';
    case 'station': return 'All Ranks • With & Without Dependents • 2026 DTMO Rates';
    default: return 'Military Pay & Benefits';
  }
}

// ─── Shared building blocks ──────────────────────────────────────────────────
function BrandRow() {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '24px' }}>
      <div style={{ fontSize: '30px', fontWeight: 700, color: RED, letterSpacing: '0.06em' }}>
        MILPAYTOOLS
      </div>
      <div style={{ fontSize: '24px', fontWeight: 400, color: SLATE_MUTED }}>
        milpaytools.com
      </div>
    </div>
  );
}

function TrustRows({ secondLine }: { secondLine: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ fontSize: '28px', fontWeight: 700, color: SLATE_LIGHT }}>
        Free · No Account · Official 2026 DoD &amp; VA Data
      </div>
      {secondLine ? (
        <div style={{ fontSize: '24px', fontWeight: 400, color: SLATE_MUTED }}>
          16 calculators for pay, BAH, VA disability, TSP &amp; transition
        </div>
      ) : null}
    </div>
  );
}

// ─── type=home: headline + computed sample result card ──────────────────────
function HomeCard() {
  // Explicit column wrapper: satori lays fragments out as a default flex row.
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      <div style={{ fontSize: '92px', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.1 }}>
        Know Your Worth.
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          background: CARD_FILL,
          border: `2px solid ${CARD_BORDER}`,
          borderRadius: '22px',
          padding: '34px 40px 38px',
        }}
      >
        <div style={{ fontSize: '24px', fontWeight: 700, color: SLATE_MUTED, letterSpacing: '0.04em' }}>
          E-5 · 8 YRS · SAN DIEGO · WITH DEPENDENTS
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '22px', marginTop: '14px' }}>
          <div style={{ fontSize: '80px', fontWeight: 700, color: GREEN }}>
            {sampleComp.monthly}
          </div>
          <div style={{ fontSize: '30px', fontWeight: 400, color: SLATE_LIGHT }}>
            /month total compensation
          </div>
        </div>
        <div style={{ fontSize: '26px', fontWeight: 400, color: '#FFFFFF', marginTop: '22px' }}>
          {`Civilian equivalent ≈ ${sampleComp.civilianAnnual} / yr`}
        </div>
      </div>
    </div>
  );
}

// ─── Other types: page title + one-line subline ──────────────────────────────
function PageCard({ title, sub }: { title: string; sub: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div
        style={{
          fontSize: `${titleFontSize(title)}px`,
          fontWeight: 700,
          color: '#FFFFFF',
          lineHeight: 1.15,
          maxWidth: '1060px',
          lineClamp: 2,
        }}
      >
        {title}
      </div>
      <div style={{ fontSize: '32px', fontWeight: 400, color: SLATE_LIGHT, maxWidth: '1060px', lineClamp: 1 }}>
        {sub}
      </div>
    </div>
  );
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') ?? 'default';
  const title = searchParams.get('title') ?? 'MilPayTools';
  const sub = searchParams.get('sub') ?? defaultSubtitle(type);
  const isHome = type === 'home';

  const image = new ImageResponse(
    (
      <div
        style={{
          width: `${W}px`,
          height: `${H}px`,
          background: NAVY,
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Inter',
        }}
      >
        {/* Top accent bar */}
        <div style={{ width: `${W}px`, height: '10px', background: RED, flexShrink: 0 }} />

        {/* Content */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '46px 70px 44px',
          }}
        >
          <BrandRow />
          {isHome ? <HomeCard /> : <PageCard title={title} sub={sub} />}
          <TrustRows secondLine={isHome} />
        </div>
      </div>
    ),
    {
      width: W,
      height: H,
      fonts: [
        { name: 'Inter', data: interRegular, weight: 400, style: 'normal' },
        { name: 'Inter', data: interBold, weight: 700, style: 'normal' },
      ],
    },
  );

  image.headers.set('Content-Type', 'image/png');
  // Link-preview fetchers (Facebot, Twitterbot, iMessage) time out fast — serve
  // from the CDN for a day. Design changes are cache-busted via the v= param.
  image.headers.set(
    'Cache-Control',
    'public, immutable, no-transform, s-maxage=86400, max-age=86400',
  );
  return image;
}
