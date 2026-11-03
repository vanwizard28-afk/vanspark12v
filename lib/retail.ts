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
const AWIN_PUBLISHER_ID = '3139749'

// Eco-Worthy direct affiliate program — appended to every uk.eco-worthy.com
// link, including the partner CTAs and the PDF blueprint's shop link.
const ECOWORTHY_REF = '12677554.ensDeXBrrQ'
export const ECOWORTHY_URL = 'https://uk.eco-worthy.com/'
export const ECOWORTHY_AFFILIATE_URL = `${ECOWORTHY_URL}?sca_ref=${ECOWORTHY_REF}`

// Merchants on the Awin network: domain → advertiser ID (the awinmid shown
// in your Awin dashboard for each joined program). Outbound links to these
// domains are routed through awin1.com/cread.php so the sale attributes to
// AWIN_PUBLISHER_ID — deep links carry the full destination in `ued`.
// Eco-Worthy moved to their direct program (sca_ref below) — a link can't
// carry both networks' tracking, so it no longer routes via Awin.
const AWIN_MERCHANT_MIDS: Record<string, string> = {
  'uk.renogy.com': '127461',
  'lushlobster.com': '130141',
}

// Per-domain affiliate params for direct programs (no network), injected
// automatically into every outbound link on that domain.
const AFFILIATE_TAGS: Record<string, string> = {
  'amazon.co.uk': `tag=${AMAZON_ASSOCIATE_TAG}`,
  'uk.eco-worthy.com': `sca_ref=${ECOWORTHY_REF}`,
  // Fogstar runs on GoAffPro — swap in your referral code once approved:
  // 'fogstar.co.uk': 'ref=YOUR_FOGSTAR_CODE',
  // 12 Volt Planet: no published program — partnership via enquiry form only.
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
  url = `${url}${url.includes('?') ? '&' : '?'}utm_source=vanspark&utm_medium=affiliate&utm_campaign=${campaign}`
  // Awin merchants: wrap the fully-tagged destination in a tracking link.
  for (const [domain, mid] of Object.entries(AWIN_MERCHANT_MIDS)) {
    if (url.includes(domain)) {
      return `https://www.awin1.com/cread.php?awinmid=${mid}&awinaffid=${AWIN_PUBLISHER_ID}&ued=${encodeURIComponent(url)}`
    }
  }
  return url
}

// Spread onto <a> tags: adds UTM, sponsored rel (Google-compliant), and a
// click event for conversion tracking.
export function affiliateProps(href: string, item: string, campaign = 'hardware') {
  return {
    href: withUtm(href, campaign),
    target: '_blank' as const,
    rel: 'noopener noreferrer sponsored',
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
