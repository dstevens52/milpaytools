/**
 * Shared OG image layout for opengraph-image.tsx files.
 * Returns an ImageResponse — import and call makeOgResponse() in each route.
 * Uses only div/span/svg primitives compatible with satori (next/og).
 */

import { ImageResponse } from 'next/og';

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = 'image/png';

// Simplified shield SVG — no gradients or filters, satori-safe.
function ShieldIcon() {
  return (
    <svg width="38" height="48" viewBox="0 0 256 320" style={{ flexShrink: 0 }}>
      {/* Outer shield fill */}
      <path
        d="M128 20 L206 50 V128 C206 206 165 258 128 290 C91 258 50 206 50 128 V50 Z"
        fill="rgba(255,255,255,0.08)"
      />
      {/* Inner white outline */}
      <path
        d="M128 40 L190 62 V126 C190 192 154 240 128 266 C102 240 66 192 66 126 V62 Z"
        fill="none"
        stroke="rgba(255,255,255,0.85)"
        strokeWidth="9"
        strokeLinejoin="round"
      />
      {/* Calculator body */}
      <rect x="84" y="76" width="88" height="112" rx="8" fill="rgba(255,255,255,0.92)" />
      {/* Screen */}
      <rect x="96" y="88" width="64" height="22" rx="4" fill="#1a365d" />
      {/* Buttons */}
      <rect x="96" y="122" width="14" height="14" rx="3" fill="#1a365d" />
      <rect x="121" y="122" width="14" height="14" rx="3" fill="#1a365d" />
      <rect x="146" y="122" width="14" height="14" rx="3" fill="#1a365d" />
      <rect x="96" y="146" width="14" height="14" rx="3" fill="#1a365d" />
      <rect x="121" y="146" width="14" height="14" rx="3" fill="#1a365d" />
      <rect x="146" y="146" width="14" height="14" rx="3" fill="#1a365d" />
      {/* Dollar badge */}
      <circle cx="128" cy="204" r="30" fill="#DC2626" stroke="rgba(255,255,255,0.85)" strokeWidth="5" />
    </svg>
  );
}

interface OgProps {
  label?: string;
  title: string;
  subtitle?: string;
  accent?: string;
}

function titleFontSize(title: string): number {
  if (title.length < 28) return 58;
  if (title.length < 44) return 50;
  if (title.length < 60) return 42;
  return 36;
}

function OgLayout({ label, title, subtitle, accent }: OgProps) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#0F172A',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Main content */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          padding: '52px 64px 36px 64px',
        }}
      >
        {/* Left column */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
          }}
        >
          {/* Logo row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '36px',
            }}
          >
            <ShieldIcon />
            <span
              style={{
                color: '#FFFFFF',
                fontSize: '24px',
                fontWeight: '700',
                letterSpacing: '-0.3px',
              }}
            >
              MilPay
              <span style={{ color: '#EF4444' }}>Tools</span>
            </span>
          </div>

          {/* Label badge */}
          {label ? (
            <div style={{ display: 'flex', marginBottom: '16px' }}>
              <span
                style={{
                  background: 'rgba(220,38,38,0.18)',
                  color: '#FCA5A5',
                  fontSize: '13px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                  padding: '6px 14px',
                  borderRadius: '100px',
                  border: '1px solid rgba(220,38,38,0.35)',
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
              lineHeight: '1.2',
              marginBottom: '18px',
              maxWidth: '760px',
            }}
          >
            {title}
          </div>

          {/* Subtitle */}
          {subtitle ? (
            <div
              style={{
                color: '#94A3B8',
                fontSize: '20px',
                lineHeight: '1.5',
                maxWidth: '700px',
              }}
            >
              {subtitle}
            </div>
          ) : null}

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Accent / data badge */}
          {accent ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#64748B',
                fontSize: '15px',
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#22C55E',
                  flexShrink: 0,
                }}
              />
              {accent}
            </div>
          ) : null}
        </div>

        {/* Right: large shield watermark */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '240px',
            flexShrink: 0,
            opacity: 0.05,
          }}
        >
          <svg width="200" height="250" viewBox="0 0 256 320">
            <path
              d="M128 16 L210 48 V126 C210 208 167 262 128 294 C89 262 46 208 46 126 V48 Z"
              fill="#FFFFFF"
            />
          </svg>
        </div>
      </div>

      {/* Bottom strip */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '14px 64px',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(255,255,255,0.02)',
        }}
      >
        <span style={{ color: '#475569', fontSize: '14px' }}>
          Free · No Account · Official 2026 Data · milpaytools.com
        </span>
      </div>
    </div>
  );
}

export function makeOgResponse(props: OgProps): ImageResponse {
  return new ImageResponse(<OgLayout {...props} />, OG_SIZE);
}
