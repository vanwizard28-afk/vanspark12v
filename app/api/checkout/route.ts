import { NextRequest, NextResponse } from 'next/server'

// POST /api/checkout — creates a Stripe Checkout Session for the £7.99
// blueprint. Until STRIPE_SECRET_KEY + STRIPE_PRICE_ID are configured the
// route returns 503 and the client shows an error instead of the PDF.
export async function POST(req: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY
  const priceId = process.env.STRIPE_PRICE_ID

  if (!secretKey || !priceId) {
    return NextResponse.json({ error: 'checkout_not_configured' }, { status: 503 })
  }

  // Stripe rejects non-HTTPS return URLs except localhost. A phone browsing
  // the dev server over the LAN IP (http://192.168.x.x:3000) fails session
  // creation, so non-local http origins fall back to the canonical site URL.
  const origin = req.headers.get('origin') ?? ''
  const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
  const base = isLocal || origin.startsWith('https://') ? origin : (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000')

  try {
    const { default: Stripe } = await import('stripe')
    const stripe = new Stripe(secretKey)
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      // The client restores the build from localStorage on return, so the
      // URLs stay short — Stripe caps metadata at 500 chars and oversized
      // success/cancel URLs get rejected.
      success_url: `${base}/?purchase=success`,
      cancel_url: `${base}/?purchase=cancelled`,
    })
    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout failed:', err)
    return NextResponse.json({ error: 'checkout_failed' }, { status: 500 })
  }
}
