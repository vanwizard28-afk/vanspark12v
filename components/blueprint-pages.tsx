import type { SystemSizing } from '@/lib/electrical'
import type { BuildState } from '@/lib/build-state'

// Miniature mock pages of the paid blueprint — rendered from the visitor's
// live sizing, not stock imagery, so the preview honestly reflects the
// document structure they'll receive after checkout.
export default function BlueprintPages({ sizing, state }: { sizing: SystemSizing; state: BuildState }) {
  const rows = [
    [`Main feed`, `${sizing.mainCable.size}mm² · ${sizing.mainFuseA}A MEGA`],
    ...(sizing.inverterSupply
      ? [[`Inverter ${sizing.inverterW}W`, `${sizing.inverterSupply.cable.size}mm² · ${sizing.inverterSupply.fuseA}A`]]
      : []),
    ...sizing.branches.slice(0, 3).map((b) => [b.name, `${b.wireMm2}mm² · ${b.fuseA}A`]),
  ].slice(0, 5)

  return (
    <div className="grid grid-cols-3 gap-2.5">
      {/* Page 1 — system diagram & summary */}
      <div className="aspect-[3/4] overflow-hidden rounded-md border border-white/10 bg-white p-2 text-slate-700 shadow-sm">
        <p className="text-[6px] font-bold uppercase tracking-[.16em] text-slate-400">VanSpark 12V Pro</p>
        <p className="mt-0.5 text-[7px] font-bold uppercase text-amber-700">1 · Diagram &amp; summary</p>
        <div className="mt-1.5 flex items-center gap-1">
          <div className="flex-1 space-y-0.5">
            <div className="rounded-sm border border-slate-300 bg-slate-50 px-0.5 py-0.5 text-center text-[5.5px] leading-tight text-slate-600">{sizing.solarW}W solar</div>
            <div className="rounded-sm border border-slate-300 bg-slate-50 px-0.5 py-0.5 text-center text-[5.5px] leading-tight text-slate-600">30A DC-DC</div>
            <div className="rounded-sm border border-slate-300 bg-slate-50 px-0.5 py-0.5 text-center text-[5.5px] leading-tight text-slate-600">Shore power</div>
          </div>
          <span className="text-[6px] text-slate-400">→</span>
          <div className="rounded-sm border border-amber-400 bg-amber-50 px-1 py-1 text-center text-[5.5px] font-bold leading-tight text-amber-800">{sizing.batteryAh}Ah {state.chemistry}</div>
          <span className="text-[6px] text-slate-400">→</span>
          <div className="flex-1 rounded-sm border border-slate-300 bg-slate-50 px-0.5 py-0.5 text-center text-[5.5px] leading-tight text-slate-600">{sizing.branches.length}× circuits</div>
        </div>
        <div className="mt-1.5 space-y-0.5 border-t border-slate-200 pt-1 font-mono text-[5.5px] leading-[1.6] text-slate-600">
          <p>Demand {sizing.dailyWh.toFixed(0)}Wh/day</p>
          <p>Solar {sizing.solarW}W · {sizing.mpptA}A MPPT</p>
          {sizing.inverterW > 0 && <p>Inverter {sizing.inverterW}W pure sine</p>}
          <p>Main {sizing.mainCable.size}mm² · {sizing.mainCable.dropPct.toFixed(1)}% drop</p>
        </div>
      </div>

      {/* Page 2 — cable & fuse schedule */}
      <div className="aspect-[3/4] overflow-hidden rounded-md border border-white/10 bg-white p-2 text-slate-700 shadow-sm">
        <p className="text-[6px] font-bold uppercase tracking-[.16em] text-slate-400">VanSpark 12V Pro</p>
        <p className="mt-0.5 text-[7px] font-bold uppercase text-amber-700">3–4 · Cable &amp; fuse schedule</p>
        <div className="mt-1.5 space-y-0.5">
          {rows.map(([name, spec]) => (
            <div key={name} className="flex items-center justify-between gap-1 rounded-sm border-b border-slate-100 pb-0.5 text-[5.5px] leading-tight">
              <span className="truncate text-slate-600">{name}</span>
              <span className="shrink-0 font-semibold text-slate-800">{spec}</span>
            </div>
          ))}
        </div>
        <div className="mt-1.5 space-y-0.5 border-t border-slate-200 pt-1">
          <div className="h-1 w-3/4 rounded-sm bg-slate-200" />
          <div className="h-1 w-full rounded-sm bg-slate-200" />
          <div className="h-1 w-2/3 rounded-sm bg-slate-200" />
          <div className="h-1 w-5/6 rounded-sm bg-slate-200" />
        </div>
        <p className="mt-1.5 text-[5px] italic leading-tight text-slate-400">Every run listed with voltage drop and protection.</p>
      </div>

      {/* Page 3 — installation checklist */}
      <div className="aspect-[3/4] overflow-hidden rounded-md border border-white/10 bg-white p-2 text-slate-700 shadow-sm">
        <p className="text-[6px] font-bold uppercase tracking-[.16em] text-slate-400">VanSpark 12V Pro</p>
        <p className="mt-0.5 text-[7px] font-bold uppercase text-amber-700">5 · Install checklist</p>
        <div className="mt-1.5 space-y-1">
          {['Plan & mount', 'Run cable', 'Protect & terminate', 'Test & energise'].map((phase) => (
            <div key={phase}>
              <p className="text-[5.5px] font-bold uppercase tracking-wide text-slate-500">{phase}</p>
              <div className="mt-0.5 flex items-center gap-1">
                <span className="size-1.5 shrink-0 rounded-[1px] border border-slate-400" />
                <div className="h-0.5 w-full rounded-sm bg-slate-200" />
              </div>
              <div className="mt-0.5 flex items-center gap-1">
                <span className="size-1.5 shrink-0 rounded-[1px] border border-slate-400" />
                <div className="h-0.5 w-4/5 rounded-sm bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-1.5 text-[5px] italic leading-tight text-slate-400">Staged tick-off sequence for the workshop.</p>
      </div>
    </div>
  )
}
