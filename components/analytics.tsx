import Script from 'next/script'

// Loads Google tag (gtag.js) — works for both GA4 measurement and Google
// Ads conversion tags (AW-…). NEXT_PUBLIC_GA_ID overrides the default so
// the same component can serve other properties without a code change.
const DEFAULT_GA_ID = 'AW-18534450546'

export default function Analytics() {
  const id = process.env.NEXT_PUBLIC_GA_ID ?? DEFAULT_GA_ID
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
