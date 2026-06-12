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
  if (title.length < 22) return 80;
  if (title.length < 34) return 68;
  if (title.length < 50) return 56;
  if (title.length < 66) return 46;
  return 40;
}

function headerBg(variant: OgVariant): string {
  const colors: Record<OgVariant, string> = {
    calculator: '#991B1B',
    home:       '#991B1B',
    guide:      '#1E3A8A',
    blog:       '#14532D',
    transition: '#92400E',
  };
  return colors[variant];
}

function chipStyle(variant: OgVariant) {
  const styles: Record<OgVariant, { bg: string; border: string; text: string }> = {
    calculator: { bg: '#FEF2F2', border: '#FECACA', text: '#B91C1C' },
    home:       { bg: '#FEF2F2', border: '#FECACA', text: '#B91C1C' },
    guide:      { bg: '#EFF6FF', border: '#BFDBFE', text: '#1D4ED8' },
    blog:       { bg: '#F0FDF4', border: '#BBF7D0', text: '#15803D' },
    transition: { bg: '#FFFBEB', border: '#FDE68A', text: '#B45309' },
  };
  return styles[variant];
}

function ShieldLogo() {
  return (
    <svg width="44" height="55" viewBox="0 0 256 320" style={{ flexShrink: 0 }}>
      <path
        d="M128 40 L190 62 V126 C190 192 154 240 128 266 C102 240 66 192 66 126 V62 Z"
        fill="none"
        stroke="rgba(255,255,255,0.9)"
        strokeWidth="9"
        strokeLinejoin="round"
      />
      <rect x="84" y="76" width="88" height="112" rx="8" fill="rgba(255,255,255,0.92)" />
      <rect x="96" y="88" width="64" height="22" rx="4" fill="#7F1D1D" />
      <rect x="96"  y="122" width="14" height="14" rx="3" fill="#7F1D1D" />
      <rect x="121" y="122" width="14" height="14" rx="3" fill="#7F1D1D" />
      <rect x="146" y="122" width="14" height="14" rx="3" fill="rgba(255,255,255,0.65)" />
      <rect x="96"  y="146" width="14" height="14" rx="3" fill="#7F1D1D" />
      <rect x="121" y="146" width="14" height="14" rx="3" fill="#7F1D1D" />
      <rect x="146" y="146" width="14" height="14" rx="3" fill="#7F1D1D" />
    </svg>
  );
}

function OgLayout({ label, title, subtitle, accent, variant = 'calculator', features }: OgProps) {
  const chip = chipStyle(variant);
  const hdrBg = headerBg(variant);

  return (
    <div
      style={{
        width: '1200px',
        height: '630px',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(150deg, #F8FAFC 0%, #EEF2F7 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* Header band */}
      <div
        style={{
          width: '1200px',
          height: '116px',
          background: hdrBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 64px',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <ShieldLogo />
          <span
            style={{
              color: '#FFFFFF',
              fontSize: '34px',
              fontWeight: '800',
              letterSpacing: '-0.5px',
            }}
          >
            MilPayTools
          </span>
        </div>
        <span
          style={{
            color: 'rgba(255,255,255,0.65)',
            fontSize: '18px',
            fontWeight: '500',
          }}
        >
          milpaytools.com
        </span>
      </div>

      {/* Body */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          padding: '52px 64px 48px 64px',
        }}
      >
        {label ? (
          <div style={{ display: 'flex', marginBottom: '18px' }}>
            <span
              style={{
                background: chip.bg,
                color: chip.text,
                fontSize: '13px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                padding: '6px 16px',
                borderRadius: '100px',
                border: `1.5px solid ${chip.border}`,
              }}
            >
              {label}
            </span>
          </div>
        ) : null}

        <div
          style={{
            color: '#0F172A',
            fontSize: `${titleFontSize(title)}px`,
            fontWeight: '800',
            lineHeight: '1.12',
            marginBottom: subtitle ? '20px' : '0',
            letterSpacing: '-1.5px',
            maxWidth: '980px',
          }}
        >
          {title}
        </div>

        {subtitle ? (
          <div
            style={{
              color: '#475569',
              fontSize: '22px',
              lineHeight: '1.5',
              maxWidth: '820px',
            }}
          >
            {subtitle}
          </div>
        ) : null}

        <div style={{ flex: 1 }} />

        {/* Bottom: feature pills or accent line */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {features && features.length > 0
            ? features.map((f, i) => (
                <span
                  key={i}
                  style={{
                    color: '#334155',
                    fontSize: '17px',
                    fontWeight: '600',
                    background: '#F1F5F9',
                    padding: '9px 22px',
                    borderRadius: '8px',
                    border: '1.5px solid #CBD5E1',
                  }}
                >
                  {f}
                </span>
              ))
            : accent
            ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#22C55E',
                    flexShrink: 0,
                  }}
                />
                <span style={{ color: '#64748B', fontSize: '16px', fontWeight: '500' }}>
                  {accent}
                </span>
              </div>
            )
            : null}
        </div>
      </div>
    </div>
  );
}

export function makeOgResponse(props: OgProps): ImageResponse {
  return new ImageResponse(<OgLayout {...props} />, OG_SIZE);
}
