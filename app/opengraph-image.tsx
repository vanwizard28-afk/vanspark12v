import { ImageResponse } from 'next/og'

export const alt = 'VanSpark 12V Pro — campervan electrical design tool'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 80,
          background: '#090d13',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: 22,
              background: '#fbbf24',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 48,
              fontWeight: 800,
              color: '#090d13',
            }}
          >
            ⚡
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 56, fontWeight: 800, color: '#ffffff', letterSpacing: -2 }}>
              VanSpark <span style={{ color: '#fbbf24' }}>12V Pro</span>
            </span>
            <span style={{ fontSize: 20, color: '#64748b', textTransform: 'uppercase', letterSpacing: 6, marginTop: 4 }}>
              Electrical design system
            </span>
          </div>
        </div>
        <p style={{ fontSize: 34, color: '#94a3b8', marginTop: 48, lineHeight: 1.4, maxWidth: 900 }}>
          Size your campervan 12V system — battery, solar, inverter, cable and fuse schedules — with live BS 7671 aware calculations.
        </p>
        <div style={{ display: 'flex', gap: 16, marginTop: 32 }}>
          {['Live load estimator', 'Wiring schematic', 'Full BOM'].map((chip) => (
            <span
              key={chip}
              style={{
                fontSize: 20,
                color: '#fbbf24',
                border: '1px solid rgba(251,191,36,0.35)',
                background: 'rgba(251,191,36,0.08)',
                borderRadius: 999,
                padding: '10px 22px',
              }}
            >
              {chip}
            </span>
          ))}
        </div>
      </div>
    ),
    size
  )
}
