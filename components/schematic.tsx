import { MEGA_FUSES, selectCable, selectFuse, type SystemSizing } from '@/lib/electrical'
import type { BuildState } from '@/lib/build-state'

const AMBER = '#fbbf24'
const AMBER_DIM = '#b45309'
const SLATE = '#64748b'
const PANEL = '#111822'
const BORDER = 'rgba(255,255,255,0.09)'
const TEXT = '#e2e8f0'
const MUTED = '#94a3b8'
const EMERALD = '#34d399'

function Node({ x, y, w, h, title, sub, tone = 'slate', guide, onPick }: { x: number; y: number; w: number; h: number; title: string; sub?: string; tone?: 'amber' | 'slate' | 'emerald'; guide?: string; onPick?: (id: string) => void }) {
  const stroke = tone === 'amber' ? 'rgba(251,191,36,0.45)' : tone === 'emerald' ? 'rgba(52,211,153,0.4)' : BORDER
  const fill = tone === 'amber' ? 'rgba(251,191,36,0.08)' : tone === 'emerald' ? 'rgba(52,211,153,0.07)' : PANEL
  return (
    <g
      onClick={guide ? () => onPick?.(guide) : undefined}
      style={guide ? { cursor: 'pointer' } : undefined}
      role={guide ? 'button' : undefined}
      aria-label={guide ? `Open wiring guide for ${title}` : undefined}
    >
      <rect x={x} y={y} width={w} height={h} rx={10} fill={fill} stroke={stroke} />
      <text x={x + w / 2} y={sub ? y + h / 2 - 2 : y + h / 2 + 4} textAnchor="middle" fontSize={12} fontWeight={600} fill={TEXT}>{title}</text>
      {sub && <text x={x + w / 2} y={y + h / 2 + 14} textAnchor="middle" fontSize={10} fill={MUTED}>{sub}</text>}
      {guide && (
        <g>
          <circle cx={x + w - 4} cy={y + 4} r={8} fill="#0b0f16" stroke={AMBER} strokeWidth={1} />
          <text x={x + w - 4} y={y + 7.5} textAnchor="middle" fontSize={9} fontWeight={700} fill={AMBER}>i</text>
        </g>
      )}
      {guide && <title>{`Click for the ${title} connection guide`}</title>}
    </g>
  )
}

function Wire({ points, color = AMBER, dashed = false, width = 2 }: { points: string; color?: string; dashed?: boolean; width?: number }) {
  return <polyline points={points} fill="none" stroke={color} strokeWidth={width} strokeDasharray={dashed ? '5 4' : undefined} strokeLinejoin="round" />
}

function WireLabel({ x, y, children, anchor = 'middle' }: { x: number; y: number; children: string; anchor?: 'start' | 'middle' | 'end' }) {
  return (
    <text x={x} y={y} textAnchor={anchor} fontSize={9.5} fill={AMBER_DIM} fontWeight={600}>{children}</text>
  )
}

// Small in-line device on a wire (fuse, switch, shunt).
function InlineDevice({ x, y, w = 64, label, tone = 'amber', guide, onPick }: { x: number; y: number; w?: number; label: string; tone?: 'amber' | 'slate'; guide?: string; onPick?: (id: string) => void }) {
  const stroke = tone === 'amber' ? 'rgba(251,191,36,0.5)' : 'rgba(148,163,184,0.4)'
  return (
    <g onClick={guide ? () => onPick?.(guide) : undefined} style={guide ? { cursor: 'pointer' } : undefined} role={guide ? 'button' : undefined}>
      <rect x={x - w / 2} y={y - 11} width={w} height={22} rx={6} fill="#0b0f16" stroke={stroke} />
      <text x={x} y={y + 3.5} textAnchor="middle" fontSize={8.5} fontWeight={700} fill={tone === 'amber' ? AMBER : MUTED}>{label}</text>
      {guide && <text x={x + w / 2 + 6} y={y - 12} fontSize={9} fontWeight={700} fill={AMBER}>i</text>}
      {guide && <title>{`Click for the ${label} connection guide`}</title>}
    </g>
  )
}

export default function Schematic({ sizing, state, onPick }: { sizing: SystemSizing; state: BuildState; onPick?: (id: string) => void }) {
  const POS_X = 452
  const NEG_X = 486
  const BUS_TOP = 70
  const BUS_BOTTOM = 545

  const inverterAmps = sizing.inverterW / 12
  const invCable = sizing.inverterW > 0 ? selectCable(inverterAmps, 1.5).size : 0
  const invFuse = sizing.inverterW > 0 ? selectFuse(inverterAmps, MEGA_FUSES) : 0

  const branches = sizing.branches.slice(0, 7)
  const hidden = sizing.branches.length - branches.length
  const battY = 262 // battery node top
  const battPosY = battY + 22
  const battNegY = battY + 58

  return (
    <svg viewBox="0 0 1060 620" className="h-auto w-full" role="img" aria-label="Single-line wiring schematic of the 12V system">
      {/* Bus bars */}
      <line x1={POS_X} y1={BUS_TOP} x2={POS_X} y2={BUS_BOTTOM} stroke={AMBER} strokeWidth={4} strokeLinecap="round" />
      <line x1={NEG_X} y1={BUS_TOP} x2={NEG_X} y2={BUS_BOTTOM} stroke={SLATE} strokeWidth={4} strokeLinecap="round" strokeDasharray="2 6" />
      <text x={POS_X} y={BUS_TOP - 14} textAnchor="middle" fontSize={9} fontWeight={700} fill={AMBER_DIM}>+ BUS</text>
      <text x={NEG_X} y={BUS_TOP - 14} textAnchor="middle" fontSize={9} fontWeight={700} fill={SLATE}>− BUS</text>

      {/* ── Charge sources ─────────────────────────────── */}
      <Node x={30} y={80} w={150} h={46} title="Solar array" sub={`${sizing.solarW}W · roof mounted`} tone="amber" guide="solar" onPick={onPick} />
      <Node x={225} y={80} w={140} h={46} title="MPPT" sub={`${sizing.mpptA}A SmartSolar`} guide="mppt" onPick={onPick} />
      <Wire points={`180,103 225,103`} />
      <Wire points={`365,103 ${POS_X},103`} />
      <WireLabel x={410} y={96}>6–10mm²</WireLabel>

      <Node x={30} y={205} w={150} h={46} title="Starter battery" sub="vehicle · Euro 6 aware" />
      <Node x={225} y={205} w={140} h={46} title="DC-DC charger" sub="30A · ignition sense" guide="dcdc" onPick={onPick} />
      <Wire points={`180,228 225,228`} />
      <Wire points={`365,228 ${POS_X},228`} />
      <WireLabel x={410} y={221}>fused both ends</WireLabel>

      <Node x={30} y={330} w={150} h={46} title="230V hookup" sub="shore power inlet" />
      <Node x={225} y={330} w={140} h={46} title="Mains charger" sub="20A · RCD protected" guide="mains" onPick={onPick} />
      <Wire points={`180,353 225,353`} color={EMERALD} />
      <Wire points={`365,353 ${POS_X},353`} />
      <WireLabel x={410} y={346}>charger out</WireLabel>

      {/* ── Battery bank ───────────────────────────────── */}
      <Node x={600} y={battY} w={180} h={80} title={`${state.chemistry} bank`} sub={`${sizing.batteryAh}Ah usable · ${sizing.dailyAh.toFixed(0)}Ah/day`} tone="amber" guide="battery" onPick={onPick} />
      <Wire points={`${POS_X},${battPosY} 600,${battPosY}`} />
      <InlineDevice x={495} y={battPosY} w={66} label={`${sizing.mainFuseA}A MEGA`} guide="megafuse" onPick={onPick} />
      <InlineDevice x={556} y={battPosY} w={40} label="ISO" />
      <WireLabel x={530} y={battPosY - 18}>{`${sizing.mainCable.size}mm² × ${state.distance}m`}</WireLabel>
      <Wire points={`${NEG_X},${battNegY} 600,${battNegY}`} color={SLATE} dashed />
      <InlineDevice x={545} y={battNegY} w={70} label="SHUNT" tone="slate" guide="shunt" onPick={onPick} />

      {/* ── 12V fuse block + branch circuits ───────────── */}
      <Wire points={`${POS_X},160 700,160`} />
      <Wire points={`${NEG_X},160 505,160 505,145 700,145`} color={SLATE} dashed width={1.5} />
      <Node x={700} y={80} w={160} h={46} title="Fuse block" sub={`${Math.max(6, sizing.branches.length + 2)}-way blade`} guide="fuseblock" onPick={onPick} />
      <WireLabel x={610} y={152}>4–6mm² feed</WireLabel>
      {branches.map((b, i) => (
        <g key={b.name}>
          <Wire points={`860,103 892,103 892,${150 + i * 26} 906,${150 + i * 26}`} width={1.5} />
          <text x={914} y={154 + i * 26} fontSize={10} fill={MUTED}>{b.name}</text>
          <text x={1040} y={154 + i * 26} textAnchor="end" fontSize={10} fontWeight={700} fill={AMBER_DIM}>{b.fuseA}A</text>
        </g>
      ))}
      {hidden > 0 && (
        <text x={914} y={154 + branches.length * 26} fontSize={10} fill={SLATE}>… +{hidden} more</text>
      )}
      {sizing.branches.length === 0 && (
        <text x={914} y={154} fontSize={10} fill={SLATE}>no 12V loads active</text>
      )}

      {/* ── Inverter + AC side ─────────────────────────── */}
      {sizing.inverterW > 0 ? (
        <g>
          <Wire points={`${POS_X},430 700,430`} />
          <InlineDevice x={560} y={430} w={76} label={`${invFuse}A CLASS T`} />
          <WireLabel x={560} y={412}>{`${invCable}mm² short run`}</WireLabel>
          <Wire points={`${NEG_X},446 700,446`} color={SLATE} dashed width={1.5} />
          <Node x={700} y={406} w={160} h={48} title={`${sizing.inverterW}W inverter`} sub="pure sine wave" tone="amber" guide="inverter" onPick={onPick} />
          <Wire points={`860,430 906,430`} color={EMERALD} />
          <Node x={906} y={406} w={130} h={48} title="Consumer unit" sub="RCD + sockets" tone="emerald" guide="consumer" onPick={onPick} />
        </g>
      ) : (
        <text x={700} y={430} fontSize={10} fill={SLATE}>No 240V loads — inverter not required</text>
      )}

      {/* Legend */}
      <g>
        <line x1={30} y1={585} x2={62} y2={585} stroke={AMBER} strokeWidth={3} />
        <text x={70} y={589} fontSize={9.5} fill={MUTED}>positive conductor</text>
        <line x1={180} y1={585} x2={212} y2={585} stroke={SLATE} strokeWidth={3} strokeDasharray="2 5" />
        <text x={220} y={589} fontSize={9.5} fill={MUTED}>negative return</text>
        <line x1={330} y1={585} x2={362} y2={585} stroke={EMERALD} strokeWidth={3} />
        <text x={370} y={589} fontSize={9.5} fill={MUTED}>230V AC</text>
        <text x={1036} y={589} textAnchor="end" fontSize={9.5} fill={SLATE}>single-line diagram · all negatives return via common busbar + SmartShunt</text>
      </g>
    </svg>
  )
}
