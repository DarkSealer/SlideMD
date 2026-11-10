/**
 * POST /api/contact — Vercel serverless function.
 *
 * The browser only ever talks to this endpoint. The Resend API key and the
 * destination inbox live in server-side environment variables and are never
 * bundled into the client (do NOT prefix them with VITE_).
 *
 * Required env vars (Vercel → Project → Settings → Environment Variables):
 *   RESEND_API_KEY      Resend key, ideally "Sending access" only
 *   CONTACT_TO_EMAIL    Inbox that receives the reports
 * Optional:
 *   CONTACT_FROM_EMAIL  Verified sender, e.g. "SlideMD <feedback@yourdomain.com>"
 */

const SUBJECTS = {
  bug: '[SlideMD] Bug report',
  feedback: '[SlideMD] Feedback',
  contact: '[SlideMD] Contact message',
} as const;

type ContactType = keyof typeof SUBJECTS;

const MAX_BODY_BYTES = 10_000;
const MIN_MESSAGE_LENGTH = 10;
const MAX_MESSAGE_LENGTH = 4_000;
const MAX_EMAIL_LENGTH = 254;
const EMAIL_PATTERN = /^[^\s@<>"',;]+@[^\s@<>"',;]+\.[^\s@<>"',;]+$/;

// Best-effort limiter: state is per warm function instance, so it slows down
// casual abuse but is not a hard guarantee. Pair it with a Vercel Firewall
// rate-limit rule on /api/contact for a real ceiling.
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const recentRequests = new Map<string, number[]>();

function isRateLimited(key: string, now: number): boolean {
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const hits = (recentRequests.get(key) ?? []).filter((t) => t > windowStart);
  if (hits.length >= RATE_LIMIT_MAX) {
    recentRequests.set(key, hits);
    return true;
  }
  hits.push(now);
  recentRequests.set(key, hits);

  if (recentRequests.size > 5_000) {
    for (const [k, times] of recentRequests) {
      if (times.every((t) => t <= windowStart)) recentRequests.delete(k);
    }
  }
  return false;
}

function json(status: number, body: Record<string, unknown>, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...headers,
    },
  });
}

/** Drop control characters (keeps newlines and tabs) so nothing odd reaches the mail body. */
function cleanText(value: string): string {
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim();
}

/** Single-line variant for values that sit on one line of the mail body. */
function cleanLine(value: string, maxLength: number): string {
  return cleanText(value).replace(/[\r\n\t]+/g, ' ').slice(0, maxLength);
}

function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function POST(request: Request): Promise<Response> {
  // Browsers always send Origin on a POST fetch; rejecting mismatches stops
  // other websites from using visitors' browsers to hit this endpoint.
  if (!isSameOrigin(request)) {
    return json(403, { ok: false, error: 'forbidden' });
  }

  // Requiring JSON forces a CORS preflight for cross-origin callers, which
  // fails because this endpoint sends no CORS headers.
  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.toLowerCase().startsWith('application/json')) {
    return json(415, { ok: false, error: 'unsupported_media_type' });
  }

  // On Vercel these headers are set by the platform and cannot be spoofed by the client.
  const ip =
    request.headers.get('x-real-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown';
  if (isRateLimited(ip, Date.now())) {
    return json(429, { ok: false, error: 'rate_limited' }, { 'Retry-After': '600' });
  }

  let payload: Record<string, unknown>;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return json(413, { ok: false, error: 'too_large' });
    }
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return json(400, { ok: false, error: 'invalid_request' });
    }
    payload = parsed as Record<string, unknown>;
  } catch {
    return json(400, { ok: false, error: 'invalid_request' });
  }

  // Honeypot: real users never fill this hidden field. Pretend it worked so
  // bots get no signal to adapt to.
  if (typeof payload.website === 'string' && payload.website.trim() !== '') {
    return json(200, { ok: true });
  }

  const type = payload.type;
  if (typeof type !== 'string' || !Object.hasOwn(SUBJECTS, type)) {
    return json(400, { ok: false, error: 'invalid_type' });
  }

  if (typeof payload.message !== 'string') {
    return json(400, { ok: false, error: 'invalid_message' });
  }
  const message = cleanText(payload.message);
  if (message.length < MIN_MESSAGE_LENGTH || message.length > MAX_MESSAGE_LENGTH) {
    return json(400, { ok: false, error: 'invalid_message' });
  }

  let replyTo: string | undefined;
  if (payload.email !== undefined && payload.email !== null && payload.email !== '') {
    if (typeof payload.email !== 'string') {
      return json(400, { ok: false, error: 'invalid_email' });
    }
    const email = payload.email.trim();
    if (email.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(email)) {
      return json(400, { ok: false, error: 'invalid_email' });
    }
    replyTo = email;
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  // Resend's shared sender only delivers to the Resend account owner's own
  // address, which is enough until a custom domain is verified.
  const from = process.env.CONTACT_FROM_EMAIL || 'SlideMD Feedback <onboarding@resend.dev>';
  if (!apiKey || !to) {
    console.error('[contact] Missing RESEND_API_KEY or CONTACT_TO_EMAIL');
    return json(503, { ok: false, error: 'unavailable' });
  }

  const text = [
    message,
    '',
    '---',
    `Type: ${type}`,
    `Reply to: ${replyTo ?? '(not provided)'}`,
    `Page: ${cleanLine(typeof payload.page === 'string' ? payload.page : '', 200) || '(unknown)'}`,
    `User agent: ${cleanLine(request.headers.get('user-agent') ?? '', 300) || '(unknown)'}`,
    `Sent: ${new Date().toISOString()}`,
  ].join('\n');

  try {
    // Recipient, sender and subject are all server-controlled. User input only
    // ever lands in the plain-text body and in Reply-To (validated above).
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: SUBJECTS[type as ContactType],
        text,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
      signal: AbortSignal.timeout(8_000),
    });

    if (!resendResponse.ok) {
      // Log details server-side only; the client gets a generic error.
      console.error('[contact] Resend rejected the request', resendResponse.status, await resendResponse.text());
      return json(502, { ok: false, error: 'send_failed' });
    }
  } catch (err) {
    console.error('[contact] Failed to reach Resend', err);
    return json(502, { ok: false, error: 'send_failed' });
  }

  return json(200, { ok: true });
}
