import { NextRequest, NextResponse } from 'next/server'

// POST /api/checkout — creates a Stripe Checkout Session for the £7.99
// blueprint. Until STRIPE_SECRET_KEY + STRIPE_PRICE_ID are configured the
// route returns 503 and the client falls back to the free PDF download.
export async function POST(req: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY
  const priceId = process.env.STRIPE_PRICE_ID

  if (!secretKey || !priceId) {
    return NextResponse.json({ error: 'checkout_not_configured' }, { status: 503 })
  }

  let build = ''
  try {
    const body = await req.json()
    if (typeof body?.build === 'string' && body.build.length < 4000) build = body.build
  } catch {
    // empty body is fine — build state is optional
  }

  const origin = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const resume = build ? `?build=${encodeURIComponent(build)}` : ''

  try {
    const { default: Stripe } = await import('stripe')
    const stripe = new Stripe(secretKey)
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      // After payment, return the user to their exact build so nothing is lost.
      success_url: `${origin}/${resume}${resume ? '&' : '?'}purchase=success`,
      cancel_url: `${origin}/${resume}${resume ? '&' : '?'}purchase=cancelled`,
      metadata: { build },
    })
    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout failed:', err)
    return NextResponse.json({ error: 'checkout_failed' }, { status: 500 })
  }
}
