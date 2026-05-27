import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const CALCULATOR_NAMES = [
  'total-compensation', 'bah', 'va-disability', 'tsp', 'retirement',
  'pcs', 'guard-reserve', 'education', 'cola', 'compare', 'deployment',
  'pay-charts', 'dual-military-bah', 'transition-readiness',
  'separation-timeline', 'healthcare-comparison',
];

function getLast30Dates(): string[] {
  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Chicago' });
  const now = Date.now();
  return Array.from({ length: 30 }, (_, i) => fmt.format(new Date(now - i * 86_400_000)));
}

export async function POST(req: Request) {
  const secret = process.env.STATS_SECRET;
  const auth = req.headers.get('authorization');
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

  const keys = [
    'calc:total',
    ...CALCULATOR_NAMES.map((n) => `calc:${n}`),
    ...getLast30Dates().map((d) => `calc:daily:${d}`),
  ];

  await Promise.all(keys.map((k) => redis.del(k)));

  return NextResponse.json({ deleted: keys.length, keys });
}
