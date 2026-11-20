import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import GoogleTag, { AwinMasterTag } from '@/components/analytics'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: 'VanSpark 12V Pro | Free Campervan Electrical Calculator & Wiring Diagram',
  description: 'Free campervan 12V calculator — size your leisure battery, solar array, inverter and cables live, then get a build-ready wiring diagram, parts list and safety checklist.',
  openGraph: {
    title: 'VanSpark 12V Pro | Free Campervan Electrical Calculator & Wiring Diagram',
    description: 'Size your campervan 12V system — battery, solar, inverter, cable and fuse schedules — with live standards-aware calculations.',
    type: 'website',
    siteName: 'VanSpark 12V Pro',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VanSpark 12V Pro | Free Campervan Electrical Calculator & Wiring Diagram',
    description: 'Size your campervan 12V system with live standards-aware calculations.',
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
        <AwinMasterTag />
      </body>
    </html>
  )
}
