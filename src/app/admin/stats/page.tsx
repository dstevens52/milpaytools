import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Redis } from '@upstash/redis';

export const metadata: Metadata = {
  title: 'Calculation Stats',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

const CALCULATOR_NAMES = [
  'total-compensation',
  'bah',
  'va-disability',
  'tsp',
  'retirement',
  'pcs',
  'guard-reserve',
  'education',
  'cola',
  'compare',
  'deployment',
  'pay-charts',
  'dual-military-bah',
  'transition-readiness',
  'separation-timeline',
  'healthcare-comparison',
];

const TRACKING_SINCE = '2026-05-26';

function getCentralDate(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Chicago' }).format(new Date());
}

function getLast30CentralDates(): string[] {
  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Chicago' });
  const now = Date.now();
  return Array.from({ length: 30 }, (_, i) => fmt.format(new Date(now - i * 86_400_000)));
}

export default async function StatsPage({
  searchParams,
}: {
  searchParams: Promise<{ secret?: string }>;
}) {
  const { secret } = await searchParams;

  if (!secret || secret !== process.env.STATS_SECRET) {
    redirect('/');
  }

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

  const today = getCentralDate();
  const last30 = getLast30CentralDates();

  const [total, ...rest] = await Promise.all([
    redis.get<number>('calc:total'),
    ...CALCULATOR_NAMES.map((name) => redis.get<number>(`calc:${name}`)),
    ...last30.map((d) => redis.get<number>(`calc:daily:${d}`)),
  ]);

  const perCalcRaw = rest.slice(0, CALCULATOR_NAMES.length) as (number | null)[];
  const dailyRaw = rest.slice(CALCULATOR_NAMES.length) as (number | null)[];

  const breakdown = CALCULATOR_NAMES.map((name, i) => ({
    name,
    count: perCalcRaw[i] ?? 0,
  })).sort((a, b) => b.count - a.count);

  const dailyRows = last30.map((date, i) => ({
    date,
    count: dailyRaw[i] ?? 0,
  }));

  const todayCount = dailyRows[0]?.count ?? 0;

  // Discover share keys via SCAN
  const shareKeys: string[] = [];
  let cursor = 0;
  do {
    const [next, batch] = await redis.scan(cursor, { match: 'calc:share:*', count: 200 });
    cursor = Number(next);
    shareKeys.push(...(batch as string[]));
  } while (cursor !== 0);

  const shareValues = shareKeys.length > 0
    ? await Promise.all(shareKeys.map((k) => redis.get<number>(k)))
    : [];

  const shareBreakdown = shareKeys
    .map((key, i) => ({ name: key.replace('calc:share:', ''), count: shareValues[i] ?? 0 }))
    .sort((a, b) => b.count - a.count);

  return (
    <div style={{ fontFamily: 'monospace', maxWidth: 680, margin: '48px auto', padding: '0 24px' }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>MilPayTools — Calculation Stats</h1>
      <p style={{ fontSize: 11, color: '#aaa', marginBottom: 36 }}>
        Tracking since {TRACKING_SINCE} · All times Central (America/Chicago)
      </p>

      {/* Summary row */}
      <div style={{ display: 'flex', gap: 40, marginBottom: 48 }}>
        <div>
          <p style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>All time</p>
          <p style={{ fontSize: 40, fontWeight: 700, lineHeight: 1 }}>{(total ?? 0).toLocaleString()}</p>
          <p style={{ fontSize: 11, color: '#ccc', marginTop: 4 }}>since {TRACKING_SINCE}</p>
        </div>
        <div>
          <p style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Today ({today})</p>
          <p style={{ fontSize: 40, fontWeight: 700, lineHeight: 1 }}>{todayCount.toLocaleString()}</p>
          <p style={{ fontSize: 11, color: '#ccc', marginTop: 4 }}>Central time</p>
        </div>
      </div>

      {/* By calculator */}
      <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#444' }}>By calculator</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 48 }}>
        <tbody>
          {breakdown.map(({ name, count }) => (
            <tr key={name} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '8px 0', fontSize: 14 }}>{name}</td>
              <td style={{ padding: '8px 0', fontSize: 14, fontWeight: 600, textAlign: 'right' }}>
                {count.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Shares */}
      <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#444' }}>Shares</h2>
      {shareBreakdown.length === 0 ? (
        <p style={{ fontSize: 13, color: '#bbb', marginBottom: 48 }}>No share clicks recorded yet.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 48 }}>
          <tbody>
            {shareBreakdown.map(({ name, count }) => (
              <tr key={name} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '8px 0', fontSize: 14 }}>{name}</td>
                <td style={{ padding: '8px 0', fontSize: 14, fontWeight: 600, textAlign: 'right' }}>
                  {count.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Daily history */}
      <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#444' }}>Daily (last 30 days)</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ddd' }}>
            <th style={{ padding: '6px 0', fontSize: 12, color: '#888', textAlign: 'left', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Date</th>
            <th style={{ padding: '6px 0', fontSize: 12, color: '#888', textAlign: 'right', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Calculations</th>
          </tr>
        </thead>
        <tbody>
          {dailyRows.map(({ date, count }) => (
            <tr key={date} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td style={{ padding: '7px 0', fontSize: 13, color: count === 0 ? '#ccc' : '#222' }}>{date}</td>
              <td style={{ padding: '7px 0', fontSize: 13, fontWeight: count > 0 ? 600 : 400, color: count === 0 ? '#ccc' : '#222', textAlign: 'right' }}>
                {count > 0 ? count.toLocaleString() : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ marginTop: 24, fontSize: 11, color: '#bbb' }}>
        Refreshes on each page load. Daily counts expire after 30 days.
      </p>
    </div>
  );
}
