import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

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

    // Always log — visible in Vercel dashboard → Functions → Logs
    console.log('[MILPAYTOOLS FEEDBACK]', JSON.stringify(entry));

    // Send email notification via Resend (non-blocking — failure does not affect API response)
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: 'MilPayTools Feedback <onboarding@resend.dev>',
          to: 'danielstevens52@gmail.com',
          replyTo: entry.email ?? undefined,
          subject: `[MilPayTools] ${entry.type}`,
          html: `
<table style="font-family:sans-serif;font-size:14px;color:#18181b;max-width:560px;width:100%;border-collapse:collapse">
  <tr><td style="padding:20px 24px 8px">
    <p style="margin:0 0 16px;font-size:18px;font-weight:700">New Feedback — MilPayTools</p>

    <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
      <tr>
        <td style="padding:6px 10px;background:#f4f4f5;font-weight:600;white-space:nowrap;border:1px solid #e4e4e7">Type</td>
        <td style="padding:6px 10px;border:1px solid #e4e4e7">${entry.type}</td>
      </tr>
      <tr>
        <td style="padding:6px 10px;background:#f4f4f5;font-weight:600;white-space:nowrap;border:1px solid #e4e4e7">Page</td>
        <td style="padding:6px 10px;border:1px solid #e4e4e7">${entry.page ?? '—'}</td>
      </tr>
      <tr>
        <td style="padding:6px 10px;background:#f4f4f5;font-weight:600;white-space:nowrap;border:1px solid #e4e4e7">URL</td>
        <td style="padding:6px 10px;border:1px solid #e4e4e7">${entry.url ? `<a href="${entry.url}" style="color:#b91c1c">${entry.url}</a>` : '—'}</td>
      </tr>
      <tr>
        <td style="padding:6px 10px;background:#f4f4f5;font-weight:600;white-space:nowrap;border:1px solid #e4e4e7">Email</td>
        <td style="padding:6px 10px;border:1px solid #e4e4e7">${entry.email ? `<a href="mailto:${entry.email}" style="color:#b91c1c">${entry.email}</a>` : '—'}</td>
      </tr>
      <tr>
        <td style="padding:6px 10px;background:#f4f4f5;font-weight:600;white-space:nowrap;border:1px solid #e4e4e7">Timestamp</td>
        <td style="padding:6px 10px;border:1px solid #e4e4e7">${entry.timestamp}</td>
      </tr>
    </table>

    <p style="margin:0 0 6px;font-weight:600">Message</p>
    <div style="background:#f9fafb;border:1px solid #e4e4e7;border-radius:6px;padding:12px 14px;white-space:pre-wrap;line-height:1.6">${entry.message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>

    <p style="margin:24px 0 0;font-size:12px;color:#a1a1aa">Sent by MilPayTools feedback system · milpaytools.com</p>
  </td></tr>
</table>`,
        });
      } catch (emailErr) {
        // Log but don't surface to user — the feedback was still captured in logs
        console.error('[MILPAYTOOLS FEEDBACK] Resend error:', emailErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to process feedback.' }, { status: 500 });
  }
}
