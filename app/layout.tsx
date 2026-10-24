import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import GoogleTag from '@/components/analytics'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: 'VanSpark 12V Pro | Campervan Electrical Design',
  description: 'Size your campervan 12V power system with live load, battery, solar, inverter, and cable calculations.',
  openGraph: {
    title: 'VanSpark 12V Pro | Campervan Electrical Design',
    description: 'Size your campervan 12V system — battery, solar, inverter, cable and fuse schedules — with live BS 7671 aware calculations.',
    type: 'website',
    siteName: 'VanSpark 12V Pro',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VanSpark 12V Pro | Campervan Electrical Design',
    description: 'Size your campervan 12V system with live BS 7671 aware calculations.',
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
        <GoogleTag />
      </body>
    </html>
  )
}
