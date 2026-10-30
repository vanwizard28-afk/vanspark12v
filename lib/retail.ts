import { trackEvent } from './analytics'

// Affiliate plumbing: every outbound shopping link carries UTM tags for
// analytics attribution and a click event so you can measure CTR per item.
// BOM rows and hardware cards carry their own deep links; these storefront
// URLs are the fallback. When you join a program, swap in tagged URLs.
export const RETAILERS = {
  fogstar: { name: 'Fogstar', href: 'https://www.fogstar.co.uk/search?q=drift+lifepo4' },
  renogy: { name: 'Renogy UK', href: 'https://uk.renogy.com/search?q=lifepo4' },
  victron: { name: 'Victron dealer', href: 'https://www.12voltplanet.co.uk/victron.html' },
  ecoworthy: { name: 'Eco-Worthy', href: 'https://uk.eco-worthy.com/search?q=lifepo4' },
  '12vp': { name: '12 Volt Planet', href: 'https://www.12voltplanet.co.uk/' },
  screwfix: { name: 'Screwfix', href: 'https://www.screwfix.com/' },
  amazon: { name: 'Amazon UK', href: 'https://www.amazon.co.uk/' },
} as const

export type RetailerKey = keyof typeof RETAILERS

const AMAZON_ASSOCIATE_TAG = 'vanspark21-20'

// Per-domain affiliate params, injected automatically into every outbound
// link. Add your ID when each program approves you — same pattern as Amazon.
const AFFILIATE_TAGS: Record<string, string> = {
  'amazon.co.uk': `tag=${AMAZON_ASSOCIATE_TAG}`,
  // 'uk.renogy.com': 'aff=YOUR_RENOGY_ID',
  // 'fogstar.co.uk': 'ref=YOUR_FOGSTAR_CODE',
  // 'uk.eco-worthy.com': 'ref=YOUR_ECOWORTHY_ID',
  // '12voltplanet.co.uk': 'aff=YOUR_12VP_ID',
}

export function withUtm(href: string, campaign: string) {
  let url = href
  // Affiliate params attribute the commission — appended automatically so
  // every BOM row and hardware card inherits them with no per-link work.
  for (const [domain, param] of Object.entries(AFFILIATE_TAGS)) {
    const key = param.split('=')[0]
    if (url.includes(domain) && !url.includes(`${key}=`)) {
      url += `${url.includes('?') ? '&' : '?'}${param}`
    }
  }
  return `${url}${url.includes('?') ? '&' : '?'}utm_source=vanspark&utm_medium=affiliate&utm_campaign=${campaign}`
}

// Spread onto <a> tags: adds UTM, sponsored rel (Google-compliant), and a
// click event for conversion tracking.
export function affiliateProps(href: string, item: string, campaign = 'hardware') {
  return {
    href: withUtm(href, campaign),
    target: '_blank' as const,
    rel: 'noreferrer sponsored',
    onClick: () => trackEvent('affiliate_click', { item, campaign }),
  }
}

// Rough UK guide prices per metre of tri-rated copper cable by gauge.
export const CABLE_PRICE_PER_M: Record<number, number> = {
  0.5: 0.6, 0.75: 0.7, 1: 0.8, 1.5: 1.0, 2.5: 1.5, 4: 2.5, 6: 3.5,
  10: 5, 16: 8, 25: 11, 35: 14, 50: 18, 70: 24, 95: 30,
}

export function cableGuide(gaugeMm2: number, metres: number): [number, number] {
  const rate = CABLE_PRICE_PER_M[gaugeMm2] ?? 5
  const mid = rate * metres
  return [Math.round(mid * 0.8), Math.round(mid * 1.3)]
}
