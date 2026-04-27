import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#18181B',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px',
        }}
      >
        {/* Red accent bar */}
        <div
          style={{
            width: '64px',
            height: '6px',
            background: '#B91C1C',
            marginBottom: '32px',
          }}
        />

        {/* Site name */}
        <div
          style={{
            color: '#FFFFFF',
            fontSize: '72px',
            fontWeight: 'bold',
            lineHeight: 1.1,
            letterSpacing: '-1px',
            marginBottom: '20px',
          }}
        >
          MilPayTools
        </div>

        {/* Tagline */}
        <div
          style={{
            color: '#A1A1AA',
            fontSize: '30px',
            fontWeight: 'normal',
            lineHeight: 1.4,
            maxWidth: '760px',
          }}
        >
          Free military pay & benefits calculators
        </div>

        {/* Bottom row */}
        <div
          style={{
            position: 'absolute',
            bottom: '72px',
            left: '80px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: '#15803D',
            }}
          />
          <div style={{ color: '#71717A', fontSize: '20px' }}>
            Official 2026 DoD & VA rate tables
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
