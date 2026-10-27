import type { MetadataRoute } from 'next'
import { GUIDES } from '@/lib/guides'

const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/guides`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    ...GUIDES.map((g) => ({ url: `${base}/guides/${g.slug}`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 })),
    { url: `${base}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
  ]
}
