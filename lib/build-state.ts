import { Appliance, PRESET_APPLIANCES } from './electrical'

export type BuildState = {
  v: 1 | 2
  appliances: Appliance[]
  autonomy: number
  chemistry: 'LiFePO4' | 'AGM'
  season: 'Summer' | 'Spring / Autumn' | 'Winter'
  sunHours: number
  distance: number
  current: number
  branchRun: number
  circuit: string
  circuitDistance: number
}

export const DEFAULT_STATE: BuildState = {
  v: 2,
  appliances: PRESET_APPLIANCES,
  autonomy: 2,
  chemistry: 'LiFePO4',
  season: 'Spring / Autumn',
  sunHours: 3.2,
  distance: 3,
  current: 60,
  branchRun: 4,
  circuit: 'Water Pump',
  circuitDistance: 4,
}

export const STORAGE_KEY = 'vanspark-build-v1'
export const URL_PARAM = 'build'

const SEASONS = ['Summer', 'Spring / Autumn', 'Winter'] as const
const CHEMISTRIES = ['LiFePO4', 'AGM'] as const
const CIRCUITS = ['Water Pump', 'LED Lighting Circuit', '12V Sockets / USB'] as const

function num(value: unknown, fallback: number, min: number, max: number) {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback
}

function sanitizeAppliances(raw: unknown): Appliance[] {
  if (!Array.isArray(raw)) return PRESET_APPLIANCES.map((a) => ({ ...a }))
  const clean: Appliance[] = []
  for (const item of raw.slice(0, 60)) {
    if (!item || typeof item !== 'object') continue
    const a = item as Record<string, unknown>
    if (typeof a.id !== 'string' || typeof a.name !== 'string') continue
    const watts = num(a.watts, 0, 0, 5000)
    const hours = num(a.hours, 0, 0, 24)
    if (watts <= 0 || hours <= 0) continue
    const preset = PRESET_APPLIANCES.find((p) => p.id === a.id)
    clean.push({
      id: a.id.slice(0, 40),
      name: a.name.slice(0, 60),
      icon: typeof a.icon === 'string' ? a.icon.slice(0, 20) : 'zap',
      watts,
      hours,
      active: Boolean(a.active),
      ac: Boolean(a.ac),
      noBranch: Boolean(a.noBranch),
      custom: preset ? false : true,
      fuseHint: preset?.fuseHint,
      minWire: preset?.minWire,
    })
  }
  for (const p of PRESET_APPLIANCES) {
    if (!clean.some((a) => a.id === p.id)) clean.push({ ...p, active: false })
  }
  return clean
}

// Legacy v1 payloads stored the whole appliance list; still supported so old
// share links and saved builds keep working.
export function sanitizeState(raw: unknown): BuildState {
  const r = (raw ?? {}) as Record<string, unknown>
  const season = SEASONS.includes(r.season as (typeof SEASONS)[number]) ? (r.season as BuildState['season']) : DEFAULT_STATE.season
  return {
    v: 2,
    appliances: sanitizeAppliances(r.appliances),
    autonomy: Math.round(num(r.autonomy, DEFAULT_STATE.autonomy, 1, 3)),
    chemistry: CHEMISTRIES.includes(r.chemistry as (typeof CHEMISTRIES)[number]) ? (r.chemistry as BuildState['chemistry']) : DEFAULT_STATE.chemistry,
    season,
    sunHours: num(r.sunHours, DEFAULT_STATE.sunHours, 0.5, 8),
    distance: Math.round(num(r.distance, DEFAULT_STATE.distance, 1, 10)),
    current: num(r.current, DEFAULT_STATE.current, 20, 120),
    branchRun: Math.round(num(r.branchRun, DEFAULT_STATE.branchRun, 2, 10)),
    circuit: typeof r.circuit === 'string' ? r.circuit : DEFAULT_STATE.circuit,
    circuitDistance: Math.round(num(r.circuitDistance, DEFAULT_STATE.circuitDistance, 1, 10)),
  }
}

// v2 wire format: only the diff from defaults, keeping share links short.
type CompactState = {
  v: 2
  on?: number                  // bitmask of active preset appliances
  ph?: [number, number][]      // [presetIndex, hours] for presets whose runtime was edited
  cu?: [string, number, number, number, number][] // [name, watts, hours, active, ac]
  a?: number
  c?: number
  s?: number
  h?: number
  d?: number
  i?: number
  r?: number
  k?: number
  m?: number
}

export function encodeState(state: BuildState): string {
  const diff: CompactState = { v: 2 }
  const presets = state.appliances.filter((a) => !a.custom)
  const mask = presets.reduce((m, a, i) => m | (a.active ? 1 << i : 0), 0)
  if (mask !== PRESET_APPLIANCES.reduce((m, a, i) => m | (a.active ? 1 << i : 0), 0)) diff.on = mask
  const editedHours = presets.map((a, i) => [i, a.hours] as [number, number]).filter(([i, h]) => h !== PRESET_APPLIANCES[i].hours)
  if (editedHours.length) diff.ph = editedHours
  const customs = state.appliances.filter((a) => a.custom)
  if (customs.length) diff.cu = customs.map((a) => [a.name, a.watts, a.hours, a.active ? 1 : 0, a.ac ? 1 : 0])
  if (state.autonomy !== DEFAULT_STATE.autonomy) diff.a = state.autonomy
  if (state.chemistry !== DEFAULT_STATE.chemistry) diff.c = CHEMISTRIES.indexOf(state.chemistry)
  if (state.season !== DEFAULT_STATE.season) diff.s = SEASONS.indexOf(state.season)
  if (state.sunHours !== DEFAULT_STATE.sunHours) diff.h = state.sunHours
  if (state.distance !== DEFAULT_STATE.distance) diff.d = state.distance
  if (state.current !== DEFAULT_STATE.current) diff.i = state.current
  if (state.branchRun !== DEFAULT_STATE.branchRun) diff.r = state.branchRun
  const circuitIdx = CIRCUITS.indexOf(state.circuit as (typeof CIRCUITS)[number])
  if (circuitIdx > 0) diff.k = circuitIdx
  if (state.circuitDistance !== DEFAULT_STATE.circuitDistance) diff.m = state.circuitDistance

  const json = JSON.stringify(diff)
  return btoa(unescape(encodeURIComponent(json))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function decodeCompact(raw: CompactState): BuildState {
  const hourEdits = new Map((raw.ph ?? []).filter(([i, h]) => Number.isInteger(i) && typeof h === 'number'))
  const appliances = PRESET_APPLIANCES.map((a, i) => ({
    ...a,
    active: raw.on === undefined ? a.active : Boolean(raw.on! & (1 << i)),
    hours: hourEdits.get(i) ?? a.hours,
  }))
  for (const c of (raw.cu ?? []).slice(0, 40)) {
    const [name, watts, hours, active, ac] = c
    if (typeof name !== 'string' || !name.trim()) continue
    const w = num(watts, 0, 0, 5000)
    const h = num(hours, 0, 0, 24)
    if (w <= 0 || h <= 0) continue
    appliances.push({
      id: `c${name.length}${Math.round(w)}${Math.round(h * 10)}`,
      name: name.slice(0, 60),
      icon: 'zap',
      watts: w,
      hours: h,
      active: Boolean(active),
      ac: Boolean(ac),
      noBranch: Boolean(ac),
      custom: true,
    })
  }
  return sanitizeState({
    appliances,
    autonomy: raw.a,
    chemistry: CHEMISTRIES[raw.c ?? -1],
    season: SEASONS[raw.s ?? -1],
    sunHours: raw.h,
    distance: raw.d,
    current: raw.i,
    branchRun: raw.r,
    circuit: CIRCUITS[raw.k ?? -1] ?? DEFAULT_STATE.circuit,
    circuitDistance: raw.m,
  })
}

export function decodeState(encoded: string): BuildState | null {
  try {
    const b64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(escape(atob(b64)))
    const raw = JSON.parse(json)
    if (raw?.v === 2) return decodeCompact(raw as CompactState)
    return sanitizeState(raw) // v1 full-state payload
  } catch {
    return null
  }
}
