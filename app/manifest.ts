import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'VanSpark 12V Pro — Campervan Electrical Design',
    short_name: 'VanSpark',
    description: 'Size your campervan 12V power system with live load, battery, solar, inverter, and cable calculations.',
    start_url: '/',
    display: 'standalone',
    background_color: '#090d13',
    theme_color: '#090d13',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/icon-dark-32x32.png', sizes: '32x32', type: 'image/png' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  }
}
