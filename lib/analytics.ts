declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

// Safe no-op until gtag is loaded via NEXT_PUBLIC_GA_ID.
export function trackEvent(action: string, params: Record<string, unknown> = {}) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', action, params)
  }
}

// Google Ads conversion — a plain trackEvent('purchase') never reaches Ads;
// only a 'conversion' event with send_to counts for Smart Bidding. The
// 'AW-…/label' value comes from Ads → Goals → Conversions → the purchase
// action → Tag setup, configured via NEXT_PUBLIC_ADS_CONVERSION.
// No-ops until that's set, so this is safe to ship before the label exists.
const ADS_CONVERSION = process.env.NEXT_PUBLIC_ADS_CONVERSION

export function trackConversion({
  value,
  currency,
  transactionId,
  email,
}: {
  value: number
  currency: string
  transactionId?: string
  email?: string | null
}) {
  if (!ADS_CONVERSION) return
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  window.gtag('event', 'conversion', {
    send_to: ADS_CONVERSION,
    value,
    currency,
    ...(transactionId ? { transaction_id: transactionId } : {}),
    // Enhanced conversions — gtag hashes the email before sending. Requires
    // "enhanced conversions" enabled on the conversion action in Google Ads.
    ...(email ? { user_data: { email } } : {}),
  })
}
