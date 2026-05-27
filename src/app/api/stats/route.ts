import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

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

export async function GET(req: Request) {
  const secret = process.env.STATS_SECRET;
  const auth = req.headers.get('authorization');

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Chicago' }).format(new Date());

  const [total, today, ...perCalc] = await Promise.all([
    redis.get<number>('calc:total'),
    redis.get<number>(`calc:daily:${date}`),
    ...CALCULATOR_NAMES.map((name) => redis.get<number>(`calc:${name}`)),
  ]);

  const breakdown: Record<string, number> = {};
  CALCULATOR_NAMES.forEach((name, i) => {
    breakdown[name] = perCalc[i] ?? 0;
  });

  return NextResponse.json({ total: total ?? 0, today: today ?? 0, breakdown });
}
