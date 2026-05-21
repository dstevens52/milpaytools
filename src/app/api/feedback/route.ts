import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, message, email, url, page } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    }

    const entry = {
      timestamp: new Date().toISOString(),
      type: (type as string) || 'General feedback',
      message: message.trim(),
      email: (email as string)?.trim() || null,
      url: (url as string) || null,
      page: (page as string) || null,
    };

    // Visible in Vercel dashboard → Functions → Logs
    console.log('[MILPAYTOOLS FEEDBACK]', JSON.stringify(entry));

    // TODO: Add email delivery.
    // Recommended: Resend (resend.com — free tier, simple Vercel integration)
    //
    // 1. npm install resend
    // 2. Add RESEND_API_KEY to Vercel env vars
    // 3. Uncomment:
    //
    // const { Resend } = await import('resend');
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from: 'feedback@milpaytools.com',
    //   to: 'dan@milpaytools.com',
    //   subject: `MilPayTools Feedback: ${entry.type}`,
    //   text: [
    //     `Type: ${entry.type}`,
    //     `Page: ${entry.page ?? 'unknown'}`,
    //     `URL: ${entry.url ?? 'unknown'}`,
    //     '',
    //     entry.message,
    //     '',
    //     `Reply-to: ${entry.email ?? 'not provided'}`,
    //     `Timestamp: ${entry.timestamp}`,
    //   ].join('\n'),
    // });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to process feedback.' }, { status: 500 });
  }
}
