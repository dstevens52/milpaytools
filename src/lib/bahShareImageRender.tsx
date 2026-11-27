/**
 * Renders the BAH share images (build W2) from bahShareData(). Kept out of the
 * route file so tests can render every station in-process (including under a
 * mocked year) without a server.
 *
 * Same design language as /api/og (src/app/api/og/route.tsx): navy ground, red
 * top bar, Inter from the committed font files. Increases and decreases share
 * one neutral color: a decrease is shown plainly, not styled as bad news.
 *
 * Satori rules (see /api/og): every element with children needs display:flex,
 * and each text chunk is ONE string (mid-text interpolation splits nodes).
 */

import { ImageResponse } from 'next/og';
import fs from 'node:fs';
import path from 'node:path';
import { BAH_SHARE_FORMATS, type BahShareData, type BahShareFormat } from '@/lib/bahShareImage';

const NAVY = '#0F1B2D';
const CARD_FILL = '#16263D';
const CARD_BORDER = '#2C405C';
const RED = '#B91C1C';
const GREEN = '#4ADE80';
const SLATE_MUTED = '#8CA0B8';
const SLATE_LIGHT = '#C9D6E4';

// Single-expression process.cwd() joins so Vercel's output file tracing bundles
// the .ttf files with the function (the same files /api/og reads).
const interRegular = fs.readFileSync(path.join(process.cwd(), 'src/app/api/og/fonts/Inter-Regular.ttf'));
const interBold = fs.readFileSync(path.join(process.cwd(), 'src/app/api/og/fonts/Inter-Bold.ttf'));

function headlineSize(text: string, format: BahShareFormat): number {
  const steps = format === 'preview' ? [68, 60, 52, 46] : [72, 64, 56, 50];
  if (text.length < 24) return steps[0];
  if (text.length < 34) return steps[1];
  if (text.length < 44) return steps[2];
  return steps[3];
}

function BrandRow() {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '24px' }}>
      <div style={{ fontSize: '30px', fontWeight: 700, color: RED, letterSpacing: '0.06em' }}>MILPAYTOOLS</div>
      <div style={{ fontSize: '24px', fontWeight: 400, color: SLATE_MUTED }}>milpaytools.com</div>
    </div>
  );
}

/** Station headline, E-5 rate and change line — shared by both formats. */
function HeadlineBlock({ data, format }: { data: BahShareData; format: BahShareFormat }) {
  const portrait = format === 'portrait';
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          fontSize: `${headlineSize(data.headline, format)}px`,
          fontWeight: 700,
          color: '#FFFFFF',
          lineHeight: 1.12,
          lineClamp: 2,
        }}
      >
        {data.headline}
      </div>
      <div
        style={{
          fontSize: portrait ? '30px' : '26px',
          fontWeight: 700,
          color: SLATE_MUTED,
          letterSpacing: '0.05em',
          marginTop: portrait ? '40px' : '26px',
        }}
      >
        E-5 WITH DEPENDENTS
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', marginTop: '6px' }}>
        <div style={{ fontSize: portrait ? '124px' : '108px', fontWeight: 700, color: GREEN, lineHeight: 1.05 }}>
          {data.e5.rateText}
        </div>
        <div style={{ fontSize: portrait ? '44px' : '40px', fontWeight: 400, color: SLATE_LIGHT }}>/mo</div>
      </div>
      {data.changeLine ? (
        <div style={{ fontSize: portrait ? '38px' : '36px', fontWeight: 700, color: SLATE_LIGHT, marginTop: '10px' }}>
          {data.changeLine}
        </div>
      ) : null}
    </div>
  );
}

function PreviewBody({ data }: { data: BahShareData }) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '40px 70px 40px',
      }}
    >
      <BrandRow />
      <HeadlineBlock data={data} format="preview" />
      <div style={{ fontSize: '24px', fontWeight: 400, color: SLATE_MUTED }}>Source: DTMO. milpaytools.com</div>
    </div>
  );
}

function GradeTable({ data }: { data: BahShareData }) {
  const cell = { display: 'flex', fontSize: '32px' } as const;
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: CARD_FILL,
        border: `2px solid ${CARD_BORDER}`,
        borderRadius: '22px',
        padding: '26px 40px 20px',
      }}
    >
      <div
        style={{
          display: 'flex',
          fontSize: '22px',
          fontWeight: 700,
          color: SLATE_MUTED,
          letterSpacing: '0.04em',
          paddingBottom: '14px',
          borderBottom: `2px solid ${CARD_BORDER}`,
        }}
      >
        <div style={{ display: 'flex', width: '200px' }}>PAY GRADE</div>
        <div style={{ display: 'flex', flex: 1, justifyContent: data.showChanges ? 'flex-start' : 'flex-end' }}>
          WITH DEPENDENTS
        </div>
        {data.showChanges ? (
          <div style={{ display: 'flex', width: '300px', justifyContent: 'flex-end' }}>
            {`FROM ${data.priorYear}`}
          </div>
        ) : null}
      </div>
      {data.rows.map((row, i) => (
        <div
          key={row.grade}
          style={{
            display: 'flex',
            alignItems: 'baseline',
            padding: '16px 0',
            borderBottom: i === data.rows.length - 1 ? 'none' : `1px solid ${CARD_BORDER}`,
          }}
        >
          <div style={{ ...cell, width: '200px', fontWeight: 700, color: '#FFFFFF' }}>{row.grade}</div>
          <div
            style={{
              ...cell,
              flex: 1,
              fontWeight: 700,
              color: '#FFFFFF',
              justifyContent: data.showChanges ? 'flex-start' : 'flex-end',
            }}
          >
            {`${row.rateText}/mo`}
          </div>
          {data.showChanges ? (
            <div style={{ ...cell, width: '300px', justifyContent: 'flex-end', fontWeight: 400, color: SLATE_LIGHT }}>
              {row.change ? row.change.text : '—'}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function PortraitBody({ data }: { data: BahShareData }) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '52px 70px 52px',
      }}
    >
      <BrandRow />
      <HeadlineBlock data={data} format="portrait" />
      <GradeTable data={data} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ fontSize: '26px', fontWeight: 400, color: SLATE_LIGHT }}>
          {`Source: DTMO, effective ${data.effectiveLabel}`}
        </div>
        <div style={{ fontSize: '26px', fontWeight: 700, color: SLATE_MUTED }}>{data.pageLabel}</div>
      </div>
    </div>
  );
}

/** The PNG for one station and format. The body renders lazily: read it to render. */
export function renderBahShareImage(data: BahShareData, format: BahShareFormat): ImageResponse {
  const { width, height } = BAH_SHARE_FORMATS[format];
  return new ImageResponse(
    (
      <div
        style={{
          width: `${width}px`,
          height: `${height}px`,
          background: NAVY,
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Inter',
        }}
      >
        <div style={{ width: `${width}px`, height: '10px', background: RED, flexShrink: 0 }} />
        {format === 'preview' ? <PreviewBody data={data} /> : <PortraitBody data={data} />}
      </div>
    ),
    {
      width,
      height,
      fonts: [
        { name: 'Inter', data: interRegular, weight: 400, style: 'normal' },
        { name: 'Inter', data: interBold, weight: 700, style: 'normal' },
      ],
    },
  );
}
