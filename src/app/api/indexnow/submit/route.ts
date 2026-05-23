import { NextRequest, NextResponse } from 'next/server';
import { submitToIndexNow } from '@/lib/indexnow';

export async function POST(req: NextRequest) {
  const secret = process.env.INDEXNOW_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'INDEXNOW_SECRET not configured' }, { status: 500 });
  }

  const auth = req.headers.get('authorization') ?? '';
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let urls: unknown;
  try {
    ({ urls } = await req.json());
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!Array.isArray(urls) || urls.length === 0 || urls.some((u) => typeof u !== 'string')) {
    return NextResponse.json({ error: 'Body must contain a non-empty "urls" array of strings' }, { status: 400 });
  }

  const result = await submitToIndexNow(urls as string[]);
  if (!result.ok) {
    return NextResponse.json({ error: result.error, status: result.status }, { status: 502 });
  }

  return NextResponse.json({ submitted: urls.length, indexNowStatus: result.status });
}
