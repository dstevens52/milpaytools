import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

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
          width: '1200px',
          height: '630px',
          background: '#FFFFFF',
          display: 'flex',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Left red accent bar */}
        <div
          style={{
            width: '8px',
            height: '630px',
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
            padding: '52px 72px 52px 64px',
            position: 'relative',
          }}
        >
          {/* Decorative large $ */}
          <div
            style={{
              position: 'absolute',
              top: '-30px',
              right: '36px',
              fontSize: '280px',
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
              gap: '14px',
            }}
          >
            <div
              style={{
                fontSize: '24px',
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
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                background: '#D4D4D8',
              }}
            />
            <div style={{ fontSize: '22px', color: '#A1A1AA' }}>
              milpaytools.com
            </div>
          </div>

          {/* Middle: Badge + Title + Subtitle */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {badge ? (
              <div style={{ display: 'flex', marginBottom: '18px' }}>
                <div
                  style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#B91C1C',
                    background: '#FEF2F2',
                    padding: '6px 18px',
                    borderRadius: '100px',
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
                maxWidth: '900px',
                marginBottom: '20px',
              }}
            >
              {title}
            </div>

            <div
              style={{
                fontSize: '28px',
                color: '#52525B',
                lineHeight: '1.4',
                maxWidth: '800px',
              }}
            >
              {sub}
            </div>
          </div>

          {/* Bottom: Data source indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#15803D',
              }}
            />
            <div style={{ fontSize: '20px', color: '#71717A' }}>
              Official 2026 DoD & VA Rate Data
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );

  image.headers.set('Content-Type', 'image/png');
  return image;
}
