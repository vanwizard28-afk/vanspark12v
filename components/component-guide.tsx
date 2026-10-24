import { X, ShieldCheck } from 'lucide-react'
import { COMPONENT_GUIDES } from '@/lib/component-guides'

const BODY = { x: 110, y: 30, w: 140, h: 140 }

// Positions terminals evenly along their edge of the device body.
function terminalPos(side: 'left' | 'right' | 'top', index: number, total: number) {
  if (side === 'top') return { x: BODY.x + ((index + 1) * BODY.w) / (total + 1), y: BODY.y }
  const y = BODY.y + ((index + 1) * BODY.h) / (total + 1)
  return { x: side === 'left' ? BODY.x : BODY.x + BODY.w, y }
}

export default function ComponentGuide({ id, onClose }: { id: string; onClose: () => void }) {
  const guide = COMPONENT_GUIDES[id]
  if (!guide) return null

  const sides = { left: guide.terminals.filter((t) => t.side === 'left'), right: guide.terminals.filter((t) => t.side === 'right'), top: guide.terminals.filter((t) => t.side === 'top') }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/80 p-5 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="guide-title" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-amber-400/25 bg-[#111822] p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.18em] text-amber-400">{guide.tag} · connection guide</p>
            <h2 id="guide-title" className="mt-1 text-xl font-semibold text-white">{guide.name}</h2>
            <p className="mt-1 max-w-md text-xs leading-5 text-slate-400">{guide.blurb}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white" aria-label="Close guide"><X /></button>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-[300px_1fr]">
          {/* Device body with terminal pips */}
          <div>
            <svg viewBox="0 0 360 200" className="w-full rounded-xl border border-white/[0.08] bg-slate-950/40" role="img" aria-label={`Terminal layout of the ${guide.name}`}>
              <rect x={BODY.x} y={BODY.y} width={BODY.w} height={BODY.h} rx={10} fill="#0b0f16" stroke="rgba(251,191,36,0.35)" />
              <rect x={BODY.x + 8} y={BODY.y + 8} width={BODY.w - 16} height={BODY.h - 16} rx={7} fill="none" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
              <text x={BODY.x + BODY.w / 2} y={BODY.y + BODY.h / 2 - 6} textAnchor="middle" fontSize={11} fontWeight={700} fill="#e2e8f0" style={{ textTransform: 'uppercase', letterSpacing: 1 }}>{guide.tag}</text>
              <text x={BODY.x + BODY.w / 2} y={BODY.y + BODY.h / 2 + 12} textAnchor="middle" fontSize={9} fill="#64748b">front / terminal face</text>
              {guide.terminals.map((t) => {
                const list = sides[t.side]
                const { x, y } = terminalPos(t.side, list.indexOf(t), list.length)
                const stub = t.side === 'left' ? `M ${x} ${y} h -16` : t.side === 'right' ? `M ${x} ${y} h 16` : `M ${x} ${y} v -16`
                const labelX = t.side === 'left' ? x - 22 : t.side === 'right' ? x + 22 : x
                const labelY = t.side === 'top' ? y - 20 : y + 3
                const anchor = t.side === 'left' ? 'end' : t.side === 'right' ? 'start' : 'middle'
                return (
                  <g key={t.label}>
                    <path d={stub} stroke={t.color} strokeWidth={2} />
                    <circle cx={x} cy={y} r={6} fill={t.color} stroke="#0b0f16" strokeWidth={1.5} />
                    <text x={labelX} y={labelY} textAnchor={anchor} fontSize={9} fontWeight={700} fill={t.color}>{t.label}</text>
                  </g>
                )
              })}
            </svg>
            <ul className="mt-3 space-y-1.5">
              {guide.terminals.map((t) => (
                <li key={t.label} className="flex items-baseline gap-2 text-[11px]">
                  <span className="size-2 shrink-0 translate-y-[-1px] rounded-full" style={{ background: t.color }} />
                  <span className="font-semibold text-slate-200">{t.label}</span>
                  <span className="text-slate-500">{t.wire}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Step-by-step hookup */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">How to wire it</p>
            <ol className="mt-3 space-y-3">
              {guide.steps.map((s, i) => (
                <li key={i} className="flex gap-3">
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-amber-400/15 text-[10px] font-bold text-amber-300">{i + 1}</span>
                  <div>
                    <p className="text-xs font-semibold text-slate-200">{s.title}</p>
                    <p className="mt-0.5 text-[11px] leading-4 text-slate-400">{s.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-400/25 bg-amber-400/[0.07] px-3 py-2.5">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-amber-300" />
              <p className="text-[11px] leading-4 text-amber-200/90">{guide.safety}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
