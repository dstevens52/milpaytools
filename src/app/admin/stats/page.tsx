import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Redis } from '@upstash/redis';

export const metadata: Metadata = {
  title: 'Calculation Stats | MilPayTools',
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

  const date = new Date().toISOString().slice(0, 10);

  const [total, today, ...perCalc] = await Promise.all([
    redis.get<number>('calc:total'),
    redis.get<number>(`calc:daily:${date}`),
    ...CALCULATOR_NAMES.map((name) => redis.get<number>(`calc:${name}`)),
  ]);

  const breakdown = CALCULATOR_NAMES.map((name, i) => ({
    name,
    count: perCalc[i] ?? 0,
  })).sort((a, b) => b.count - a.count);

  return (
    <div style={{ fontFamily: 'monospace', maxWidth: 640, margin: '48px auto', padding: '0 24px' }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 32 }}>MilPayTools — Calculation Stats</h1>

      <div style={{ display: 'flex', gap: 32, marginBottom: 40 }}>
        <div>
          <p style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>All time</p>
          <p style={{ fontSize: 40, fontWeight: 700, lineHeight: 1 }}>{(total ?? 0).toLocaleString()}</p>
        </div>
        <div>
          <p style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Today ({date})</p>
          <p style={{ fontSize: 40, fontWeight: 700, lineHeight: 1 }}>{(today ?? 0).toLocaleString()}</p>
        </div>
      </div>

      <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#444' }}>By calculator</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
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

      <p style={{ marginTop: 32, fontSize: 11, color: '#bbb' }}>
        Refreshes on each page load. Daily counts expire after 30 days.
      </p>
    </div>
  );
}
