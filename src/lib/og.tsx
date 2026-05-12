import { ImageResponse } from 'next/og';

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = 'image/png';

export type OgVariant = 'calculator' | 'guide' | 'blog' | 'transition' | 'home';

interface OgProps {
  label?: string;
  title: string;
  subtitle?: string;
  accent?: string;
  variant?: OgVariant;
  features?: string[];
}

function titleFontSize(title: string): number {
  if (title.length < 22) return 74;
  if (title.length < 34) return 64;
  if (title.length < 50) return 54;
  if (title.length < 66) return 46;
  return 40;
}

function badgeStyle(variant: OgVariant) {
  const styles: Record<OgVariant, { bg: string; border: string; text: string }> = {
    calculator: { bg: 'rgba(220,38,38,0.18)',  border: 'rgba(220,38,38,0.45)',  text: '#FCA5A5' },
    guide:      { bg: 'rgba(29,78,216,0.18)',  border: 'rgba(29,78,216,0.45)',  text: '#93C5FD' },
    blog:       { bg: 'rgba(21,128,61,0.18)',  border: 'rgba(21,128,61,0.45)',  text: '#86EFAC' },
    transition: { bg: 'rgba(217,119,6,0.18)',  border: 'rgba(217,119,6,0.45)',  text: '#FCD34D' },
    home:       { bg: 'rgba(220,38,38,0.18)',  border: 'rgba(220,38,38,0.45)',  text: '#FCA5A5' },
  };
  return styles[variant];
}

function ShieldLogo() {
  return (
    <svg width="46" height="58" viewBox="0 0 256 320" style={{ flexShrink: 0 }}>
      <path
        d="M128 40 L190 62 V126 C190 192 154 240 128 266 C102 240 66 192 66 126 V62 Z"
        fill="none"
        stroke="rgba(255,255,255,0.9)"
        strokeWidth="9"
        strokeLinejoin="round"
      />
      <rect x="84" y="76" width="88" height="112" rx="8" fill="rgba(255,255,255,0.92)" />
      <rect x="96" y="88" width="64" height="22" rx="4" fill="#0F172A" />
      <rect x="96"  y="122" width="14" height="14" rx="3" fill="#0F172A" />
      <rect x="121" y="122" width="14" height="14" rx="3" fill="#0F172A" />
      <rect x="146" y="122" width="14" height="14" rx="3" fill="#DC2626" />
      <rect x="96"  y="146" width="14" height="14" rx="3" fill="#0F172A" />
      <rect x="121" y="146" width="14" height="14" rx="3" fill="#0F172A" />
      <rect x="146" y="146" width="14" height="14" rx="3" fill="#0F172A" />
    </svg>
  );
}

// Calculator: mini horizontal bar chart suggesting data output
function BarChartGraphic() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ width: '4px', height: '28px', background: '#DC2626', borderRadius: '2px', marginRight: '10px', flexShrink: 0 }} />
        <div style={{ width: '188px', height: '28px', background: '#DC2626', borderRadius: '5px', opacity: 0.9 }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ width: '4px', height: '28px', background: '#DC2626', borderRadius: '2px', marginRight: '10px', flexShrink: 0, opacity: 0.35 }} />
        <div style={{ width: '122px', height: '28px', background: '#DC2626', borderRadius: '5px', opacity: 0.28 }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ width: '4px', height: '28px', background: '#DC2626', borderRadius: '2px', marginRight: '10px', flexShrink: 0, opacity: 0.6 }} />
        <div style={{ width: '210px', height: '28px', background: '#DC2626', borderRadius: '5px', opacity: 0.52 }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ width: '4px', height: '28px', background: '#DC2626', borderRadius: '2px', marginRight: '10px', flexShrink: 0, opacity: 0.22 }} />
        <div style={{ width: '78px', height: '28px', background: '#DC2626', borderRadius: '5px', opacity: 0.18 }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ width: '4px', height: '28px', background: '#DC2626', borderRadius: '2px', marginRight: '10px', flexShrink: 0, opacity: 0.48 }} />
        <div style={{ width: '154px', height: '28px', background: '#DC2626', borderRadius: '5px', opacity: 0.42 }} />
      </div>
    </div>
  );
}

// Guide: checklist lines with bullets
function ChecklistGraphic() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(29,78,216,0.55)', border: '2px solid rgba(147,197,253,0.55)', flexShrink: 0 }} />
        <div style={{ width: '148px', height: '14px', background: 'rgba(255,255,255,0.18)', borderRadius: '4px' }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'transparent', border: '2px solid rgba(147,197,253,0.38)', flexShrink: 0 }} />
        <div style={{ width: '104px', height: '14px', background: 'rgba(255,255,255,0.12)', borderRadius: '4px' }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(29,78,216,0.55)', border: '2px solid rgba(147,197,253,0.55)', flexShrink: 0 }} />
        <div style={{ width: '172px', height: '14px', background: 'rgba(255,255,255,0.18)', borderRadius: '4px' }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'transparent', border: '2px solid rgba(147,197,253,0.38)', flexShrink: 0 }} />
        <div style={{ width: '84px', height: '14px', background: 'rgba(255,255,255,0.09)', borderRadius: '4px' }} />
      </div>
    </div>
  );
}

// Blog: large opening quotation mark
function QuoteGraphic() {
  return (
    <div
      style={{
        display: 'flex',
        color: 'rgba(255,255,255,0.07)',
        fontSize: '240px',
        fontWeight: '900',
        lineHeight: '1',
        letterSpacing: '-4px',
      }}
    >
      {'"'}
    </div>
  );
}

// Transition: large right-pointing arrow
function ArrowGraphic() {
  return (
    <div
      style={{
        display: 'flex',
        color: 'rgba(255,255,255,0.07)',
        fontSize: '200px',
        fontWeight: '900',
        lineHeight: '1',
      }}
    >
      {'→'}
    </div>
  );
}

// Homepage: 4×2 grid of colored calculator-category squares
function GridGraphic() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', gap: '12px' }}>
        <div style={{ width: '54px', height: '54px', borderRadius: '10px', background: '#DC2626', opacity: 0.68 }} />
        <div style={{ width: '54px', height: '54px', borderRadius: '10px', background: '#1D4ED8', opacity: 0.68 }} />
        <div style={{ width: '54px', height: '54px', borderRadius: '10px', background: '#15803D', opacity: 0.68 }} />
        <div style={{ width: '54px', height: '54px', borderRadius: '10px', background: '#D97706', opacity: 0.68 }} />
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        <div style={{ width: '54px', height: '54px', borderRadius: '10px', background: '#7C3AED', opacity: 0.52 }} />
        <div style={{ width: '54px', height: '54px', borderRadius: '10px', background: '#0891B2', opacity: 0.52 }} />
        <div style={{ width: '54px', height: '54px', borderRadius: '10px', background: '#BE185D', opacity: 0.52 }} />
        <div style={{ width: '54px', height: '54px', borderRadius: '10px', background: '#475569', opacity: 0.52 }} />
      </div>
    </div>
  );
}

function RightGraphic({ variant }: { variant: OgVariant }) {
  if (variant === 'guide')      return <ChecklistGraphic />;
  if (variant === 'blog')       return <QuoteGraphic />;
  if (variant === 'transition') return <ArrowGraphic />;
  if (variant === 'home')       return <GridGraphic />;
  return <BarChartGraphic />;
}

function OgLayout({ label, title, subtitle, accent, variant = 'calculator', features }: OgProps) {
  const badge = badgeStyle(variant);

  return (
    <div
      style={{
        width: '1200px',
        height: '630px',
        display: 'flex',
        flexDirection: 'column',
        background: '#0F172A',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* Brand accent bar */}
      <div style={{ width: '1200px', height: '5px', background: '#DC2626', flexShrink: 0 }} />

      {/* Main content */}
      <div style={{ display: 'flex', flex: 1, padding: '44px 64px 0 64px', overflow: 'hidden' }}>

        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, overflow: 'hidden' }}>

          {/* Logo row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '26px' }}>
            <ShieldLogo />
            <span style={{ color: '#FFFFFF', fontSize: '26px', fontWeight: '700', letterSpacing: '-0.3px' }}>
              {'MilPay'}
              <span style={{ color: '#EF4444' }}>{'Tools'}</span>
            </span>
          </div>

          {/* Category badge */}
          {label ? (
            <div style={{ display: 'flex', marginBottom: '14px' }}>
              <span
                style={{
                  background: badge.bg,
                  color: badge.text,
                  fontSize: '12px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                  padding: '5px 14px',
                  borderRadius: '100px',
                  border: `1px solid ${badge.border}`,
                }}
              >
                {label}
              </span>
            </div>
          ) : null}

          {/* Title */}
          <div
            style={{
              color: '#FFFFFF',
              fontSize: `${titleFontSize(title)}px`,
              fontWeight: '800',
              lineHeight: '1.15',
              marginBottom: '18px',
              letterSpacing: '-1px',
            }}
          >
            {title}
          </div>

          {/* Feature pills — homepage only */}
          {features && features.length > 0 ? (
            <div style={{ display: 'flex', gap: '10px', marginBottom: '18px' }}>
              {features.map((f, i) => (
                <span
                  key={i}
                  style={{
                    color: '#CBD5E1',
                    fontSize: '16px',
                    fontWeight: '600',
                    background: 'rgba(255,255,255,0.08)',
                    padding: '6px 16px',
                    borderRadius: '6px',
                    border: '1px solid rgba(255,255,255,0.13)',
                  }}
                >
                  {f}
                </span>
              ))}
            </div>
          ) : null}

          {/* Subtitle */}
          {subtitle ? (
            <div style={{ color: '#94A3B8', fontSize: '19px', lineHeight: '1.5', maxWidth: '640px' }}>
              {subtitle}
            </div>
          ) : null}

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Bottom bar: accent dot + milpaytools.com */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '38px',
            }}
          >
            {accent ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22C55E', flexShrink: 0 }} />
                <span style={{ color: '#64748B', fontSize: '14px' }}>{accent}</span>
              </div>
            ) : (
              <div style={{ display: 'flex' }} />
            )}
            <span style={{ color: '#475569', fontSize: '15px', fontWeight: '500' }}>milpaytools.com</span>
          </div>
        </div>

        {/* Right graphic column */}
        <div
          style={{
            display: 'flex',
            width: '290px',
            flexShrink: 0,
            alignItems: 'center',
            justifyContent: 'center',
            paddingBottom: '38px',
          }}
        >
          <RightGraphic variant={variant} />
        </div>
      </div>
    </div>
  );
}

export function makeOgResponse(props: OgProps): ImageResponse {
  return new ImageResponse(<OgLayout {...props} />, OG_SIZE);
}
