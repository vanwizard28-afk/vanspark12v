import { NextRequest, NextResponse } from 'next/server'

// GET /api/verify?session_id=cs_... — confirms a Stripe Checkout session was
// actually paid before the client generates the paid blueprint. The success
// URL alone is guessable, so delivery is gated on Stripe's record.
export async function GET(req: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim()
  if (!secretKey) {
    return NextResponse.json({ error: 'checkout_not_configured' }, { status: 503 })
  }

  const sessionId = req.nextUrl.searchParams.get('session_id')?.trim()
  if (!sessionId) {
    return NextResponse.json({ error: 'missing_session_id' }, { status: 400 })
  }

  try {
    const { default: Stripe } = await import('stripe')
    const stripe = new Stripe(secretKey)
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    return NextResponse.json({
      paid: session.payment_status === 'paid',
      // Buyer email for Google Ads enhanced conversions — the session id is
      // effectively a bearer token (it already gates PDF delivery), so
      // returning it to that same browser exposes nothing new.
      email: session.customer_details?.email ?? null,
    })
  } catch (err) {
    console.error('Stripe session verification failed:', err)
    return NextResponse.json({ error: 'verify_failed' }, { status: 500 })
  }
}
