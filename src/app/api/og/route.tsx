import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

// Rendered at 2x (2400×1260) so LinkedIn/Twitter downscale to sharp 1200×630.
// All px values are 2× what they would be for a 1200×630 canvas.
const W = 2400;
const H = 1260;

function titleFontSize(title: string): number {
  if (title.length < 25) return 144;
  if (title.length < 40) return 128;
  if (title.length < 55) return 112;
  return 96;
}

function defaultSubtitle(type: string): string {
  switch (type) {
    case 'calculator': return 'Free 2026 Calculator • Official DoD Data';
    case 'blog': return 'MilPayTools.com';
    case 'guide': return 'Comprehensive Guide • MilPayTools';
    case 'station': return 'All Ranks • With & Without Dependents • 2026 DTMO Rates';
    case 'home': return 'Free • Official 2026 Data • No Account Required';
    default: return 'Military Pay & Benefits';
  }
}

function badgeLabel(type: string): string {
  switch (type) {
    case 'calculator': return 'Free Calculator';
    case 'blog': return 'Article';
    case 'guide': return 'Guide';
    case 'station': return 'Duty Station';
    default: return '';
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') ?? 'default';
  const title = searchParams.get('title') ?? 'MilPayTools';
  const sub = searchParams.get('sub') ?? defaultSubtitle(type);
  const badge = badgeLabel(type);
  const fontSize = titleFontSize(title);

  const image = new ImageResponse(
    (
      <div
        style={{
          width: `${W}px`,
          height: `${H}px`,
          background: '#FFFFFF',
          display: 'flex',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Left red accent bar */}
        <div
          style={{
            width: '16px',
            height: `${H}px`,
            background: '#B91C1C',
            flexShrink: 0,
          }}
        />

        {/* Content area */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '104px 144px 104px 128px',
            position: 'relative',
          }}
        >
          {/* Decorative large $ */}
          <div
            style={{
              position: 'absolute',
              top: '-60px',
              right: '72px',
              fontSize: '560px',
              fontWeight: '900',
              color: '#F4F4F5',
              lineHeight: '1',
            }}
          >
            $
          </div>

          {/* Top: Brand */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '28px',
            }}
          >
            <div
              style={{
                fontSize: '48px',
                fontWeight: '800',
                color: '#B91C1C',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              MilPayTools
            </div>
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#D4D4D8',
              }}
            />
            <div style={{ fontSize: '44px', color: '#A1A1AA' }}>
              milpaytools.com
            </div>
          </div>

          {/* Middle: Badge + Title + Subtitle */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {badge ? (
              <div style={{ display: 'flex', marginBottom: '36px' }}>
                <div
                  style={{
                    fontSize: '36px',
                    fontWeight: '700',
                    color: '#B91C1C',
                    background: '#FEF2F2',
                    padding: '12px 36px',
                    borderRadius: '200px',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  {badge}
                </div>
              </div>
            ) : null}

            <div
              style={{
                fontSize: `${fontSize}px`,
                fontWeight: '800',
                color: '#18181B',
                lineHeight: '1.15',
                maxWidth: '1800px',
                marginBottom: '40px',
              }}
            >
              {title}
            </div>

            <div
              style={{
                fontSize: '56px',
                color: '#52525B',
                lineHeight: '1.4',
                maxWidth: '1600px',
              }}
            >
              {sub}
            </div>
          </div>

          {/* Bottom: Data source indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: '#15803D',
              }}
            />
            <div style={{ fontSize: '40px', color: '#71717A' }}>
              Official 2026 DoD & VA Rate Data
            </div>
          </div>
        </div>
      </div>
    ),
    { width: W, height: H },
  );

  image.headers.set('Content-Type', 'image/png');
  return image;
}
