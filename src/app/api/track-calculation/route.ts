import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const calculator = typeof body?.calculator === 'string' ? body.calculator.slice(0, 64) : null;
    if (!calculator) return new NextResponse(null, { status: 200 });

    const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const dailyKey = `calc:daily:${date}`;

    await Promise.all([
      redis.incr('calc:total'),
      redis.incr(`calc:${calculator}`),
      redis.incr(dailyKey),
    ]);

    // Daily key expires after 30 days
    await redis.expire(dailyKey, 60 * 60 * 24 * 30);

    return new NextResponse(null, { status: 200 });
  } catch {
    // Never let tracking failures surface to the user
    return new NextResponse(null, { status: 200 });
  }
}
