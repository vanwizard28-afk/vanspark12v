import { NextRequest, NextResponse } from 'next/server'

// POST /api/subscribe — lead capture for the "email me my spec" form. The
// address is forwarded to LEAD_WEBHOOK_URL, which can point at any
// webhook-capable email tool (Zapier/Make webhook → your ESP or Google Sheet,
// a MailerLite/ConvertKit form endpoint, etc.). Sending the spec back to the
// lead is the automation's job — the payload carries `summary` for exactly
// that. Without the env var the route 503s and the client degrades to a
// copy-your-spec fallback rather than silently dropping signups.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  const webhook = process.env.LEAD_WEBHOOK_URL?.trim()
  if (!webhook) {
    return NextResponse.json({ error: 'subscribe_not_configured' }, { status: 503 })
  }

  let body: { email?: unknown; build?: unknown; summary?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  }

  const email = typeof body.email === 'string' ? body.email.trim() : ''
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 })
  }

  try {
    await fetch(webhook, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email,
        source: 'vanspark-spec',
        // Encoded ?build= payload — reconstructs the full calculator state.
        build: typeof body.build === 'string' ? body.build.slice(0, 2000) : null,
        // One-line spec for the auto-reply, e.g. "230Ah LiFePO4 · 420W solar".
        summary: typeof body.summary === 'string' ? body.summary.slice(0, 500) : null,
        ts: new Date().toISOString(),
      }),
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Lead webhook failed:', err)
    return NextResponse.json({ error: 'subscribe_failed' }, { status: 502 })
  }
}
