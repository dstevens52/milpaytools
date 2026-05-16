import { NextRequest, NextResponse } from 'next/server';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  let body: { email?: string; source?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
  }

  const { email, source } = body;

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ success: false, error: 'Valid email address required' }, { status: 400 });
  }

  const apiKey = process.env.BEEHIIV_API_KEY;
  const pubId = process.env.BEEHIIV_PUBLICATION_ID;

  if (!apiKey || !pubId) {
    return NextResponse.json({ success: false, error: 'Service unavailable' }, { status: 503 });
  }

  try {
    const res = await fetch(
      `https://api.beehiiv.com/v2/publications/${pubId}/subscriptions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          utm_source: 'milpaytools',
          utm_medium: 'website',
          utm_campaign: source ?? 'unknown',
          reactivate_existing: false,
          send_welcome_email: false,
        }),
      }
    );

    // Beehiiv returns 200/201 for both new and existing subscribers
    if (res.ok) {
      return NextResponse.json({ success: true });
    }

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(
      { success: false, error: (data as { message?: string }).message ?? 'Subscription failed' },
      { status: res.status }
    );
  } catch {
    return NextResponse.json({ success: false, error: 'Network error — please try again' }, { status: 500 });
  }
}
