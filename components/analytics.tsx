import Script from 'next/script'
import { AWIN_PUBLISHER_ID } from '@/lib/retail'

// Loads Google tag (gtag.js) — works for both GA4 measurement and Google
// Ads conversion tags (AW-…). NEXT_PUBLIC_GA_ID overrides the default so
// the same component can serve other properties without a code change.
const DEFAULT_GA_ID = 'AW-18534450546'

export default function Analytics() {
  const id = process.env.NEXT_PUBLIC_GA_ID ?? process.env.NEXT_PUBLIC_GOOGLE_ADS_ID ?? DEFAULT_GA_ID
  if (!id) return null
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive" />
      <Script id="gtag-init" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${id}');
      `}</Script>
    </>
  )
}

// Awin Publisher MasterTag — loads the publisher toolkit that powers
// Convert-a-Link, so any outbound link to a joined Awin advertiser
// (Renogy, Lush Lobster) is automatically wrapped as a tracked affiliate
// link. Requires the plugin toggled on at Toolbox → Publisher MasterTag
// in the Awin dashboard — the script alone does nothing until enabled.
export function AwinMasterTag() {
  return <Script src={`https://www.dwin2.com/pub.${AWIN_PUBLISHER_ID}.min.js`} strategy="lazyOnload" />
}
