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
