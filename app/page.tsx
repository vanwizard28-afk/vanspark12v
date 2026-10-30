'use client'

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  ArrowRight,
  BatteryCharging,
  Check,
  ChevronDown,
  CircleHelp,
  CircuitBoard,
  ClipboardList,
  ExternalLink,
  Fan,
  Gauge,
  Info,
  Laptop,
  Leaf,
  Lightbulb,
  Link2,
  Menu,
  Plus,
  Radio,
  RotateCcw,
  Satellite,
  ShieldCheck,
  ShoppingCart,
  Sun,
  Thermometer,
  Trash2,
  Usb,
  Waves,
  Wind,
  X,
  Zap,
} from 'lucide-react'
import {
  BLADE_FUSES,
  PRESET_APPLIANCES,
  selectCable,
  sizeSystem,
  INVERTER_RUN_M,
  SOLAR_DERATE,
  type Appliance,
} from '@/lib/electrical'
import {
  DEFAULT_STATE,
  STORAGE_KEY,
  URL_PARAM,
  decodeState,
  encodeState,
  sanitizeState,
  type BuildState,
} from '@/lib/build-state'
import { downloadBlueprint } from '@/lib/pdf'
import { trackEvent } from '@/lib/analytics'
import { RETAILERS, affiliateProps, cableGuide, type RetailerKey } from '@/lib/retail'
import Schematic from '@/components/schematic'
import ComponentGuide from '@/components/component-guide'
import VanGraphic from '@/components/van-graphic'

const ICONS: Record<string, typeof Thermometer> = {
  thermometer: Thermometer,
  wind: Wind,
  lightbulb: Lightbulb,
  usb: Usb,
  fan: Fan,
  satellite: Satellite,
  laptop: Laptop,
  waves: Waves,
  zap: Zap,
}

const inverterFuseRows = [
  ['300W', 'MEGA slow-blow', '40A', '10–16mm²'],
  ['600W', 'MEGA slow-blow', '80A', '16–25mm²'],
  ['1000W', 'MEGA / ANL slow-blow', '125–150A', '25–35mm²'],
  ['1500W', 'MEGA / Class T', '200A', '35–50mm²'],
  ['2000W', 'Class T preferred', '250A', '50mm²'],
  ['2500W', 'Class T / ANL', '300A', '70mm²'],
  ['3000W', 'ANL / Class T', '350–400A', '70–95mm²'],
]

const bladeFuseRows = [
  ['LED lighting', '3–5A', '1.0–1.5mm²'],
  ['Water pump', '5–10A', '1.5–2.5mm²'],
  ['Diesel heater', '15A', '2.5–4.0mm²'],
  ['USB / 12V sockets', '10–15A', '2.5mm²'],
  ['Compressor fridge', '10–15A', '2.5–4.0mm²'],
]

const cableReferenceRows = [
  ['0.5mm²', 'LED lighting', '3A', '3m'],
  ['1.0mm²', 'LED lighting', '6A', '5m'],
  ['1.5mm²', 'Water pump', '10A', '6m'],
  ['2.5mm²', 'USB sockets', '16A', '7m'],
  ['4.0mm²', '12V sockets / USB', '25A', '8m'],
  ['16mm²', 'Main inverter', '60A', '3m'],
  ['25mm²', 'Main inverter', '90A', '4m'],
  ['35mm²', 'Large inverter', '120A', '5m'],
  ['50mm²', 'Large inverter', '150A', '6m'],
]

const hardwarePremium = [
  { name: 'Fogstar Drift Heated LiFePO4', spec: '105Ah · built-in heater', type: 'BATTERY', href: 'https://www.fogstar.co.uk/search?q=drift+lifepo4' },
  { name: 'Aluminium Z-Brackets', spec: 'Universal · 4-piece set', type: 'SOLAR & ROOF', href: 'https://www.12voltplanet.co.uk/solar-power.html' },
  { name: 'Flexible Solar Panel', spec: '100W · low-profile option', type: 'SOLAR & ROOF', href: 'https://www.12voltplanet.co.uk/solar-power.html' },
  { name: 'IP68 Roof Entry Gland', spec: 'Twin cable · UV stable', type: 'SOLAR & ROOF', href: 'https://www.12voltplanet.co.uk/solar-power.html' },
  { name: 'Victron SmartSolar MPPT', spec: '75/15 · Bluetooth', type: 'CHARGING', href: 'https://www.12voltplanet.co.uk/victron.html' },
  { name: 'Victron Orion-Tr Smart DC-DC', spec: '30A · isolated', type: 'CHARGING', href: 'https://www.12voltplanet.co.uk/victron.html' },
  { name: 'Victron Phoenix Inverter', spec: 'Pure sine · heavy-load ready', type: 'INVERTER', href: 'https://www.12voltplanet.co.uk/victron.html' },
  { name: 'Blue Sea Systems Fuse Block', spec: 'MIDI / MEGA compatible', type: 'SAFETY & DISTRIBUTION', href: 'https://www.12voltplanet.co.uk/power-distribution.html' },
  { name: 'MIDI / MEGA Heavy-Duty Fuses', spec: 'High-current circuit protection', type: 'SAFETY & DISTRIBUTION', href: 'https://www.12voltplanet.co.uk/power-distribution.html' },
  { name: 'Battery Isolator Switch', spec: 'Continuous-duty master cut-off', type: 'SAFETY & DISTRIBUTION', href: 'https://www.12voltplanet.co.uk/power-distribution.html' },
  { name: 'Tri-Rated Copper Cables', spec: '16 · 25 · 35 · 50mm²', type: 'CABLING', href: 'https://www.12voltplanet.co.uk/cable.html' },
  { name: 'Tinned Marine Copper Lugs', spec: 'Crimp terminals · corrosion resistant', type: 'CABLING', href: 'https://www.12voltplanet.co.uk/terminals-connectors.html' },
  { name: '12 Volt Planet', spec: 'Best for wiring, terminals & marine accessories', type: 'UK SUPPLIER', href: 'https://www.12voltplanet.co.uk/' },
  { name: 'Fogstar / Fogstar Drift', spec: 'UK heated LiFePO4 specialists', type: 'UK SUPPLIER', href: 'https://www.fogstar.co.uk/' },
  { name: 'Van Junkies / Wired Campers', spec: 'Victron gear & complete off-grid kits', type: 'UK SUPPLIER', href: 'https://vanjunkies.co.uk/' },
]

const hardwareMid = [
  { name: 'Renogy Core LiFePO4 Battery', spec: '100Ah · 12.8V · Bluetooth option', type: 'BATTERY', href: 'https://uk.renogy.com/search?q=100ah+core+lifepo4' },
  { name: 'Renogy 200W Solar Kit', spec: 'Rigid mono · MC4 leads + brackets', type: 'SOLAR & ROOF', href: 'https://uk.renogy.com/search?q=200w+solar+kit' },
  { name: 'Renogy Rover MPPT', spec: '40A · LCD + Bluetooth', type: 'CHARGING', href: 'https://uk.renogy.com/search?q=rover+mppt' },
  { name: 'Renogy DCC30S DC-DC', spec: '30A · MPPT dual input', type: 'CHARGING', href: 'https://uk.renogy.com/search?q=dcc30s' },
  { name: 'Renogy Pure Sine Inverter', spec: '2000W · 12V · induction-ready', type: 'INVERTER', href: 'https://uk.renogy.com/search?q=2000w+pure+sine+inverter' },
  { name: 'Renogy 500A Battery Monitor', spec: 'Shunt-based · 2.4in display', type: 'MONITORING', href: 'https://uk.renogy.com/search?q=battery+monitor' },
]

const hardwareBudget = [
  { name: 'Eco-Worthy LiFePO4 Battery', spec: '100Ah · 12.8V · budget pick', type: 'BATTERY', href: 'https://uk.eco-worthy.com/search?q=100ah+lifepo4+battery' },
  { name: 'Eco-Worthy Pure Sine Inverter', spec: '2000W · 12V · budget pick', type: 'INVERTER', href: 'https://uk.eco-worthy.com/search?q=2000w+inverter' },
  { name: 'Eco-Worthy Solar Panel Kit', spec: '195W mono · mounts included', type: 'SOLAR & ROOF', href: 'https://uk.eco-worthy.com/search?q=solar+panel+kit' },
  { name: 'Generic MPPT Controller', spec: '30–40A · budget class', type: 'CHARGING', href: 'https://www.amazon.co.uk/s?k=mppt+solar+charge+controller+40a' },
  { name: 'Budget DC-DC Charger', spec: '20–40A · battery-to-battery', type: 'CHARGING', href: 'https://uk.eco-worthy.com/search?q=dc+to+dc+charger' },
  { name: 'Generic Battery Monitor', spec: 'Shunt + LCD display', type: 'MONITORING', href: 'https://www.amazon.co.uk/s?k=battery+monitor+shunt' },
  { name: 'Welding Cable 35–70mm²', spec: 'Heavy inverter feed · cut to length', type: 'CABLING', href: 'https://www.12voltplanet.co.uk/cable.html' },
  { name: 'MEGA / MIDI Fuse + Holder Kit', spec: '80–400A · high-current', type: 'SAFETY & DISTRIBUTION', href: 'https://www.amazon.co.uk/s?k=mega+fuse+holder+kit' },
  { name: 'Heavy-Duty Isolator Switch', spec: '275A continuous rating', type: 'SAFETY & DISTRIBUTION', href: 'https://www.amazon.co.uk/s?k=battery+isolator+switch+275a' },
]

const CIRCUIT_PROFILES: Record<string, { amps: number; fuse: number; minWire: number }> = {
  'Water Pump': { amps: 5, fuse: 10, minWire: 1.5 },
  'LED Lighting Circuit': { amps: 2, fuse: 5, minWire: 1 },
  '12V Sockets / USB': { amps: 15, fuse: 20, minWire: 2.5 },
}

const FAQS: [string, string][] = [
  [
    'What size leisure battery do I need for a campervan?',
    'Add up your daily watt-hours and divide by 12 to get daily amp-hours, then multiply by the days of autonomy you want and divide by usable depth of discharge — 80% for LiFePO4, 50% for AGM. A typical weekend build with a fridge, heater and lights lands around 150–250Ah of lithium.',
  ],
  [
    'What cable size should I use for 12V campervan wiring?',
    'Size cable on the full round trip — positive out and negative back — keeping voltage drop under 3%. As a guide: 1.5mm² for lighting, 2.5mm² for pumps and USB sockets, 16–25mm² for inverter feeds up to 1000W, and 50–95mm² for 2000–3000W inverters on short runs. Always check both drop and ampacity.',
  ],
  [
    'Do I need a DC-DC charger with a smart alternator?',
    'Almost always, yes. Euro 6 and BlueMotion vehicles reduce alternator output once the starter battery is charged, so a basic split-charge relay undercharges the leisure bank. A DC-DC charger such as the Victron Orion-Tr Smart with ignition sensing maintains proper multi-stage charging.',
  ],
  [
    'Is a 2000W inverter enough for an induction hob?',
    'Just about — a single-zone induction hob draws 1500–1800W, so a 2000W pure sine inverter covers it with a thin margin. It will pull 150–170A from a 12V battery, so you need at least a 200Ah LiFePO4 bank with a 200A+ BMS, Class T protection, and 50mm²+ cable kept as short as possible.',
  ],
  [
    'Where should the main fuse go in a campervan electrical system?',
    'Within 300mm of the battery positive terminal. The fuse protects the cable, not the appliance, so it must sit before any cable run that could short to the chassis. High-current inverter feeds should use MEGA, ANL, or Class T fuses rated above the inverter draw but below the cable ampacity.',
  ],
]

function freshDefaults(): BuildState {
  return { ...DEFAULT_STATE, appliances: PRESET_APPLIANCES.map((a) => ({ ...a })) }
}

export default function Page() {
  const [state, setState] = useState<BuildState>(freshDefaults)
  const [hydrated, setHydrated] = useState(false)
  const [copied, setCopied] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [blueprintOpen, setBlueprintOpen] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const purchaseHandled = useRef(false)

  const [newName, setNewName] = useState('')
  const [newPower, setNewPower] = useState('')
  const [newUnit, setNewUnit] = useState<'W' | 'A'>('W')
  const [newHours, setNewHours] = useState('')
  const [newAc, setNewAc] = useState(false)
  const [tier, setTier] = useState<'premium' | 'mid' | 'budget'>('premium')
  const [guideId, setGuideId] = useState<string | null>(null)

  // Restore the build from a shared URL (?build=...) or localStorage once on mount.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const fromUrl = params.get(URL_PARAM)
    const decoded = fromUrl ? decodeState(fromUrl) : null
    let restored: BuildState | null = decoded
    if (decoded) {
      setState(decoded)
    } else {
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
          restored = sanitizeState(JSON.parse(saved))
          setState(restored)
        }
      } catch {
        // corrupted storage — fall back to defaults
      }
    }
    setHydrated(true)

    // Returning from Stripe: deliver the paid blueprint automatically so a
    // paying customer never lands back on the calculator empty-handed.
    const purchase = params.get('purchase')
    if (purchase === 'success' && !purchaseHandled.current) {
      purchaseHandled.current = true
      const paid = restored ?? DEFAULT_STATE
      downloadBlueprint(paid, sizeSystem(paid))
        .then(() => trackEvent('purchase', { value: 7.99, currency: 'GBP' }))
        .catch(() => {})
    } else if (purchase === 'cancelled') {
      setBlueprintOpen(true)
    }
  }, [])

  // Persist every change to the URL (shareable) and localStorage (refresh-safe).
  useEffect(() => {
    if (!hydrated) return
    const id = setTimeout(() => {
      const encoded = encodeState(state)
      window.history.replaceState(null, '', `${window.location.pathname}?${URL_PARAM}=${encoded}`)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      } catch {
        // storage full/blocked — URL still carries the build
      }
    }, 250)
    return () => clearTimeout(id)
  }, [state, hydrated])

  const totals = useMemo(() => sizeSystem(state), [state])

  const circuitResult = useMemo(() => {
    const profile = CIRCUIT_PROFILES[state.circuit] ?? CIRCUIT_PROFILES['Water Pump']
    const pick = selectCable(profile.amps, state.circuitDistance, profile.minWire)
    return { ...pick, fuse: profile.fuse }
  }, [state.circuit, state.circuitDistance])

  const update = (patch: Partial<BuildState>) => setState((s) => ({ ...s, ...patch }))

  const toggleAppliance = (id: string) =>
    setState((s) => ({ ...s, appliances: s.appliances.map((a) => (a.id === id ? { ...a, active: !a.active } : a)) }))

  // Editable daily runtime per appliance — snap to 0.5h on steppers,
  // free-type on the input, always clamped to 0.5–24h.
  const setApplianceHours = (id: string, hours: number, snap = false) =>
    setState((s) => ({
      ...s,
      appliances: s.appliances.map((a) => {
        if (a.id !== id || !Number.isFinite(hours)) return a
        const snapped = snap ? Math.round(hours * 2) / 2 : hours
        return { ...a, hours: Math.min(24, Math.max(0.5, snapped)) }
      }),
    }))

  const removeAppliance = (id: string) =>
    setState((s) => ({ ...s, appliances: s.appliances.filter((a) => a.id !== id) }))

  const addAppliance = () => {
    const power = Number(newPower)
    const hours = Number(newHours)
    const name = newName.trim()
    if (!name || !Number.isFinite(power) || power <= 0 || !Number.isFinite(hours) || hours <= 0 || hours > 24) return
    const watts = newUnit === 'A' ? power * 12 : power
    const appliance: Appliance = {
      id: `c${Date.now().toString(36)}`,
      name: name.slice(0, 60),
      icon: 'zap',
      watts,
      hours,
      active: true,
      ac: newAc,
      noBranch: newAc, // 240V loads hang off the inverter, not the fuse board
      custom: true,
    }
    setState((s) => ({ ...s, appliances: [...s.appliances, appliance] }))
    setNewName('')
    setNewPower('')
    setNewHours('')
    setNewAc(false)
  }

  const [checkoutError, setCheckoutError] = useState(false)

  const handleBlueprint = async () => {
    setDownloading(true)
    setCheckoutError(false)
    trackEvent('blueprint_click', { daily_wh: Math.round(totals.dailyWh), inverter_w: totals.inverterW })
    try {
      const res = await fetch('/api/checkout', { method: 'POST' })
      const { url } = await res.json().catch(() => ({}))
      if (res.ok && url) {
        window.location.href = url
        return
      }
      // Stripe not configured or session failed — do NOT give the PDF away;
      // it is only delivered after a paid checkout returns with ?purchase=success.
      setCheckoutError(true)
    } catch {
      setCheckoutError(true)
    } finally {
      setDownloading(false)
    }
  }

  const shareBuild = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      trackEvent('share_build', { daily_wh: Math.round(totals.dailyWh) })
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard unavailable (non-secure context) — URL bar still holds the build
    }
  }

  const mainCableMetres = Math.ceil(state.distance * 2 * 1.1)
  const branchFuseSummary = Object.entries(totals.bladeFuseCount)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([fuse, count]) => `${count}× ${fuse}A`)
    .join(' · ')
  const batteryUnits = Math.max(1, Math.ceil(totals.batteryAh / 100))
  const solarPanels = Math.max(1, Math.ceil(totals.solarW / 200))
  const hasAc = state.appliances.some((a) => a.active && a.ac)

  // Seasonal energy balance: real-world array yield (solarW was sized WITH a
  // 30% derate, so divide it back out) vs daily demand at each season's sun hours.
  const solarYieldWh = (sunH: number) => (totals.solarW / SOLAR_DERATE) * sunH
  const energyBalance = [
    { name: 'Summer', sunHours: 4.8 },
    { name: 'Spring / Autumn', sunHours: 3.2 },
    { name: 'Winter', sunHours: 1.5 },
  ].map((s) => ({ ...s, coverage: totals.dailyWh > 0 ? (solarYieldWh(s.sunHours) / totals.dailyWh) * 100 : 0 }))
  const winter = energyBalance[2]
  const usableWh = totals.batteryAh * (state.chemistry === 'LiFePO4' ? 0.8 : 0.5) * 12
  const winterDeficit = Math.max(0, totals.dailyWh - solarYieldWh(winter.sunHours))
  const bufferDays = winterDeficit > 0 ? usableWh / winterDeficit : 0
  const energyVerdict =
    totals.dailyWh <= 0
      ? 'Add some loads above to see how your seasons stack up.'
      : winter.coverage >= 100
        ? 'Your array covers daily demand even in midwinter — genuinely self-sufficient all year on solar alone.'
        : `Winter solar covers ${Math.round(winter.coverage)}% of your daily use — the bank buffers ~${bufferDays.toFixed(1)} days before you need alternator driving or shore hookup. Summer is self-sufficient.`

  type BomVariant = { spec?: string; guide: [number, number]; shop: RetailerKey; href?: string }
  type BomRow = { item: string; spec: string; qtyN: number; guide: [number, number]; shop: RetailerKey; href?: string; mid?: BomVariant; budget?: BomVariant }
  const coreRows: BomRow[] = [
    { item: 'Leisure battery', spec: `${state.chemistry} · Fogstar Drift · ${batteryUnits}× 100Ah`, qtyN: batteryUnits, guide: [250, 450], shop: 'fogstar', href: 'https://www.fogstar.co.uk/search?q=drift+lifepo4',
      mid: { spec: `${state.chemistry} · Renogy Core · ${batteryUnits}× 100Ah`, guide: [200, 380], shop: 'renogy', href: 'https://uk.renogy.com/search?q=100ah+core+lifepo4' },
      budget: { spec: `${state.chemistry} · Eco-Worthy · ${batteryUnits}× 100Ah`, guide: [160, 300], shop: 'ecoworthy', href: 'https://uk.eco-worthy.com/search?q=100ah+lifepo4+battery' } },
    { item: 'Solar panels', spec: `Victron BlueSolar rigid · ${solarPanels}× 215W`, qtyN: solarPanels, guide: [110, 190], shop: 'victron', href: 'https://www.12voltplanet.co.uk/solar-power.html',
      mid: { spec: `Renogy rigid mono · MC4 · ${solarPanels}× 200W`, guide: [90, 160], shop: 'renogy', href: 'https://uk.renogy.com/search?q=200w+solar+panel' },
      budget: { spec: `Eco-Worthy rigid mono · ${solarPanels}× 195W`, guide: [65, 110], shop: 'ecoworthy', href: 'https://uk.eco-worthy.com/search?q=solar+panel+195w' } },
    { item: 'MPPT controller', spec: `Victron SmartSolar · ${totals.mpptA}A`, qtyN: 1, guide: [60, 140], shop: 'victron', href: 'https://www.12voltplanet.co.uk/victron.html',
      mid: { spec: `Renogy Rover · ${totals.mpptA}A`, guide: [45, 90], shop: 'renogy', href: 'https://uk.renogy.com/search?q=rover+mppt' },
      budget: { spec: `Generic MPPT · ${totals.mpptA}A`, guide: [30, 70], shop: 'amazon', href: 'https://www.amazon.co.uk/s?k=mppt+solar+charge+controller+40a' } },
    ...(totals.inverterW > 0 ? [{ item: 'Pure sine inverter', spec: `Victron Phoenix class · ${totals.inverterW}W`, qtyN: 1, guide: [Math.round(totals.inverterW * 0.2), Math.round(totals.inverterW * 0.35)] as [number, number], shop: 'victron' as RetailerKey, href: 'https://www.12voltplanet.co.uk/victron.html',
      mid: { spec: `Renogy pure sine · ${totals.inverterW}W`, guide: [Math.round(totals.inverterW * 0.12), Math.round(totals.inverterW * 0.25)] as [number, number], shop: 'renogy' as RetailerKey, href: 'https://uk.renogy.com/search?q=2000w+pure+sine+inverter' },
      budget: { spec: `Eco-Worthy pure sine · ${totals.inverterW}W`, guide: [Math.round(totals.inverterW * 0.07), Math.round(totals.inverterW * 0.16)] as [number, number], shop: 'ecoworthy' as RetailerKey, href: 'https://uk.eco-worthy.com/search?q=2000w+inverter' } }] : []),
    { item: 'DC-DC charger', spec: 'Victron Orion-Tr Smart · 30A', qtyN: 1, guide: [130, 230], shop: 'victron', href: 'https://www.12voltplanet.co.uk/victron.html',
      mid: { spec: 'Renogy DCC30S · 30A', guide: [90, 160], shop: 'renogy', href: 'https://uk.renogy.com/search?q=dcc30s' },
      budget: { spec: 'Eco-Worthy DC-DC · 20A', guide: [65, 130], shop: 'ecoworthy', href: 'https://uk.eco-worthy.com/search?q=dc+to+dc+charger' } },
    { item: 'Mains charger', spec: 'Victron Blue Smart IP65 · 12/25', qtyN: 1, guide: [110, 190], shop: 'victron', href: 'https://www.12voltplanet.co.uk/victron.html',
      mid: { spec: 'Smart mains charger · 20A', guide: [60, 110], shop: '12vp', href: 'https://www.12voltplanet.co.uk/battery-chargers.html' },
      budget: { spec: 'Generic smart charger · 20A', guide: [40, 85], shop: 'amazon', href: 'https://www.amazon.co.uk/s?k=smart+battery+charger+12v+20a' } },
    { item: 'Battery monitor', spec: 'Victron SmartShunt · 500A', qtyN: 1, guide: [90, 130], shop: 'victron', href: 'https://www.12voltplanet.co.uk/victron.html',
      mid: { spec: 'Renogy 500A shunt monitor', guide: [50, 90], shop: 'renogy', href: 'https://uk.renogy.com/search?q=battery+monitor' },
      budget: { spec: 'Generic LCD shunt monitor', guide: [25, 55], shop: 'amazon', href: 'https://www.amazon.co.uk/s?k=battery+monitor+shunt' } },
    { item: 'Isolator + busbars', spec: 'Master cut-off · pos/neg pair', qtyN: 1, guide: [30, 70], shop: '12vp', href: 'https://www.12voltplanet.co.uk/power-distribution.html', budget: { guide: [20, 45], shop: 'amazon', href: 'https://www.amazon.co.uk/s?k=12v+battery+isolator+switch+busbar' } },
    { item: 'Blade fuse block', spec: `${totals.branches.length} circuits + spares · ${Math.max(6, totals.branches.length + 2)}-way`, qtyN: 1, guide: [15, 35], shop: '12vp', href: 'https://www.12voltplanet.co.uk/power-distribution.html' },
  ]
  const supplyRows: BomRow[] = [
    ...Object.entries(totals.cableMetres).sort(([a], [b]) => Number(b) - Number(a)).map(([gauge, metres]): BomRow => ({
      item: `${gauge}mm² tri-rated cable`,
      spec: `${Number(gauge) === totals.mainCable.size ? 'Main + branches' : 'Branches'} · red + black · ${metres}m`,
      qtyN: 1,
      guide: cableGuide(Number(gauge), metres),
      shop: '12vp',
      href: 'https://www.12voltplanet.co.uk/cable.html',
    })),
    { item: 'MEGA fuse + holder', spec: `≤300mm from battery + · ${totals.mainFuseA}A`, qtyN: 1, guide: [15, 30], shop: '12vp', href: 'https://www.12voltplanet.co.uk/power-distribution.html' },
    ...(totals.inverterSupply
      ? [
          { item: 'Inverter DC supply cable', spec: `${totals.inverterSupply.cable.size}mm² heavy-duty · ${Math.round(totals.inverterSupply.amps)}A draw · ≤${INVERTER_RUN_M}m run`, qtyN: 1, guide: cableGuide(totals.inverterSupply.cable.size, INVERTER_RUN_M * 2), shop: '12vp' as RetailerKey, href: 'https://www.12voltplanet.co.uk/cable.html' },
          { item: 'Inverter high-current fuse', spec: `${totals.inverterSupply.fuseA}A ${totals.inverterSupply.fuseType} · ≤300mm from battery +`, qtyN: 1, guide: [18, 45] as [number, number], shop: '12vp' as RetailerKey, href: 'https://www.12voltplanet.co.uk/power-distribution.html' },
        ]
      : []),
    { item: 'Tinned copper lugs', spec: `${totals.mainCable.size}mm² main run · ×4`, qtyN: 1, guide: [2, 6], shop: '12vp', href: 'https://www.12voltplanet.co.uk/terminals-connectors.html' },
    ...(branchFuseSummary ? [{ item: 'Blade fuses', spec: `1.25× circuit load · ${branchFuseSummary}`, qtyN: 1, guide: [5, 12] as [number, number], shop: 'amazon' as RetailerKey, href: 'https://www.amazon.co.uk/s?k=automotive+blade+fuse+assortment' }] : []),
    ...(hasAc ? [{ item: 'AC consumer unit', spec: 'RCD + 2.5mm² 3-core flex', qtyN: 1, guide: [60, 120] as [number, number], shop: 'screwfix' as RetailerKey, href: 'https://www.screwfix.com/search?search=garage+consumer+unit' }] : []),
  ]
  const rowVariant = (r: BomRow) => (tier !== 'premium' && r[tier] ? r[tier] : undefined)
  const rowSpec = (r: BomRow) => rowVariant(r)?.spec ?? r.spec
  const rowGuide = (r: BomRow) => rowVariant(r)?.guide ?? r.guide
  const rowShop = (r: BomRow) => rowVariant(r)?.shop ?? r.shop
  const rowHref = (r: BomRow) => rowVariant(r)?.href ?? r.href ?? RETAILERS[rowShop(r)].href
  const estLow = [...coreRows, ...supplyRows].reduce((s, r) => s + rowGuide(r)[0] * r.qtyN, 0)
  const estHigh = [...coreRows, ...supplyRows].reduce((s, r) => s + rowGuide(r)[1] * r.qtyN, 0)

  return (
    <main className="min-h-screen bg-[#090d13] text-slate-100 selection:bg-amber-400/30">
      <header className="sticky top-0 z-20 border-b border-white/[0.07] bg-[#090d13]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-5 py-4 lg:px-8">
          <a href="#top" className="flex items-center gap-3" aria-label="VanSpark home">
            <span className="grid size-9 place-items-center rounded-xl bg-amber-400 text-slate-950 shadow-[0_0_24px_rgba(251,191,36,.25)]"><Zap className="size-5 fill-current" /></span>
            <span>
              <span className="block text-sm font-bold tracking-tight">VanSpark <span className="text-amber-400">12V Pro</span></span>
              <span className="hidden text-[10px] uppercase tracking-[.18em] text-slate-500 sm:block">Electrical design system</span>
            </span>
          </a>
          <nav className="hidden items-center gap-7 text-xs font-medium text-slate-400 md:flex">
            <a className="transition hover:text-amber-300" href="#estimator">Estimator</a>
            <a className="transition hover:text-amber-300" href="#sizing">System sizing</a>
            <a className="transition hover:text-amber-300" href="#schematic">Schematic</a>
            <a className="transition hover:text-amber-300" href="#bom">BOM</a>
            <a className="transition hover:text-amber-300" href="#hardware">Hardware</a>
            <a className="transition hover:text-amber-300" href="/guides">Guides</a>
          </nav>
          <div className="hidden items-center gap-3 sm:flex">
            <button onClick={shareBuild} className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-300 transition hover:border-amber-400/40 hover:text-amber-300">
              {copied ? <Check className="size-3.5 text-emerald-400" /> : <Link2 className="size-3.5" />}
              {copied ? 'Link copied' : 'Share build'}
            </button>
            <button onClick={() => setState(freshDefaults())} className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-300 transition hover:border-amber-400/40 hover:text-amber-300" title="Reset to defaults">
              <RotateCcw className="size-3.5" /> Reset
            </button>
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300"><ShieldCheck className="size-3.5" /> BS EN 1648</span>
          </div>
          <button className="grid size-9 place-items-center rounded-lg border border-white/10 text-slate-300 md:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle navigation">
            {mobileOpen ? <X /> : <Menu />}
          </button>
        </div>
        {mobileOpen && (
          <nav className="flex flex-col gap-4 border-t border-white/[0.07] px-5 py-4 text-sm text-slate-300 md:hidden">
            <a href="#estimator">Estimator</a>
            <a href="#sizing">System sizing</a>
            <a href="#schematic">Wiring schematic</a>
            <a href="#bom">Bill of materials</a>
            <a href="#hardware">Hardware</a>
          </nav>
        )}
      </header>

      <div id="top" className="mx-auto max-w-[1240px] px-5 pb-16 pt-12 lg:px-8 lg:pt-20">
        <section className="relative mb-12 grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
          <div className="relative max-w-3xl">
            <div className="pointer-events-none absolute -left-20 -top-24 size-64 rounded-full bg-amber-500/10 blur-[90px]" />
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/[0.07] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[.16em] text-amber-300"><Leaf className="size-3.5" /> Built for the modern campervan</div>
            <h1 className="max-w-2xl text-4xl font-semibold tracking-[-.045em] text-white sm:text-5xl lg:text-6xl">Design your <span className="text-amber-400">12V system</span> with confidence.</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-400">A practical, regulation-aware toolkit for sizing the power system behind your next adventure. Adjust your load below and get a clear architecture in seconds.</p>
            <div className="mt-7 flex flex-wrap items-center gap-5 text-xs text-slate-500">
              <span className="flex items-center gap-2"><Check className="size-4 text-emerald-400" /> Live calculations</span>
              <span className="flex items-center gap-2"><Check className="size-4 text-emerald-400" /> BS EN 1648 aware</span>
              <span className="flex items-center gap-2"><Check className="size-4 text-emerald-400" /> Shareable builds</span>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-amber-400/20 bg-gradient-to-br from-[#141d2b] to-[#0c1119] p-6 shadow-2xl shadow-black/20">
            <div className="absolute -right-16 -top-16 size-52 rounded-full bg-amber-400/10 blur-3xl" />
            <VanGraphic batteryAh={totals.batteryAh} solarW={totals.solarW} inverterW={totals.inverterW} />
            <p className="relative mt-2 text-center text-[10px] uppercase tracking-[.2em] text-slate-600">Live build preview — updates with your loads</p>
          </div>
        </section>

        <div className="print-notice" role="note">
          <h2 className="text-xl font-bold">Official VanSpark 12V Pro Blueprint</h2>
          <p className="mt-3">Thanks for printing — the on-screen grids are optimised for live use, so they print as a summary only. For the full build-ready documentation, formatted for the workshop and generated from your exact configuration, the £7.99 PDF Blueprint has everything below.</p>
          <p className="mt-3 font-semibold">Includes the Master Wiring Schematic, Full Circuit Fuse/Cable Schedule, Equipment BOM, and Safety &amp; Compliance Checklist.</p>
        </div>

        <section id="estimator" className="print-protected grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
          <div className="rounded-2xl border border-white/[0.08] bg-[#111822] shadow-2xl shadow-black/10">
            <div className="flex items-start justify-between border-b border-white/[0.07] px-6 py-5">
              <div>
                <p className="mb-1 text-[10px] font-bold uppercase tracking-[.18em] text-amber-400">01 / Daily load breakdown</p>
                <h2 className="text-lg font-semibold text-white">What are you powering?</h2>
              </div>
              <div className="rounded-lg bg-slate-800/80 p-2 text-slate-400"><Gauge className="size-5" /></div>
            </div>
            <div className="grid gap-2 p-4 sm:grid-cols-2 sm:p-5">
              {state.appliances.map((item) => {
                const Icon = ICONS[item.icon] ?? Zap
                return (
                  <div key={item.id} className="relative">
                    <button
                      onClick={() => toggleAppliance(item.id)}
                      className={`group flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${item.active ? 'border-amber-400/40 bg-amber-400/[0.07]' : 'border-white/[0.07] bg-slate-900/30 hover:border-white/15'}`}
                    >
                      <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${item.active ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-500'}`}><Icon className="size-[18px]" /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-slate-200">{item.name}</span>
                        <span className="mt-0.5 block text-[11px] text-slate-500">{item.watts}W · {item.hours} hrs/day{item.ac ? ' · 240V' : ''}</span>
                      </span>
                      <span className={`relative h-5 w-9 shrink-0 rounded-full transition ${item.active ? 'bg-amber-400' : 'bg-slate-700'}`}>
                        <span className={`absolute top-1 size-3 rounded-full bg-white transition ${item.active ? 'left-5' : 'left-1'}`} />
                      </span>
                    </button>
                    {item.custom && (
                      <button
                        onClick={() => removeAppliance(item.id)}
                        title={`Remove ${item.name}`}
                        aria-label={`Remove ${item.name}`}
                        className="absolute -right-1.5 -top-1.5 z-10 grid size-5 place-items-center rounded-full border border-white/10 bg-slate-800 text-slate-400 transition hover:border-red-400/40 hover:bg-red-400/20 hover:text-red-300"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    )}
                    {item.active && (
                      <div className="mt-1.5 flex items-center gap-1.5 rounded-lg border border-amber-400/15 bg-slate-950/40 px-2 py-1.5">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">hrs/day</span>
                        <button
                          onClick={() => setApplianceHours(item.id, item.hours - 0.5, true)}
                          aria-label={`Decrease ${item.name} hours`}
                          className="grid size-5 place-items-center rounded border border-white/10 text-xs text-slate-400 transition hover:border-amber-400/40 hover:text-amber-300"
                        >−</button>
                        <input
                          value={item.hours}
                          onChange={(e) => setApplianceHours(item.id, Number(e.target.value))}
                          inputMode="decimal"
                          aria-label={`${item.name} hours per day`}
                          className="w-10 rounded bg-transparent text-center text-xs font-semibold text-slate-200 outline-none focus:bg-slate-800"
                        />
                        <button
                          onClick={() => setApplianceHours(item.id, item.hours + 0.5, true)}
                          aria-label={`Increase ${item.name} hours`}
                          className="grid size-5 place-items-center rounded border border-white/10 text-xs text-slate-400 transition hover:border-amber-400/40 hover:text-amber-300"
                        >+</button>
                        <span className="ml-auto text-[9px] font-medium text-amber-300/80">{Math.round(item.watts * item.hours)} Wh</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            <div className="border-t border-white/[0.07] p-4 sm:p-5">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Add a custom load</p>
              <div className="flex flex-wrap items-end gap-3">
                <label className="min-w-[150px] flex-1 text-[11px] text-slate-500">
                  Appliance name
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Diesel water heater"
                    className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-xs text-slate-200 outline-none placeholder:text-slate-600 focus:border-amber-400"
                  />
                </label>
                <label className="w-24 text-[11px] text-slate-500">
                  Power
                  <input
                    value={newPower}
                    onChange={(e) => setNewPower(e.target.value)}
                    inputMode="decimal"
                    placeholder="60"
                    className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-xs text-slate-200 outline-none placeholder:text-slate-600 focus:border-amber-400"
                  />
                </label>
                <label className="w-[72px] text-[11px] text-slate-500">
                  Unit
                  <select
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value as 'W' | 'A')}
                    className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-2 py-2 text-xs text-slate-200 outline-none focus:border-amber-400"
                  >
                    <option value="W">W</option>
                    <option value="A">A</option>
                  </select>
                </label>
                <label className="w-24 text-[11px] text-slate-500">
                  Hrs / day
                  <input
                    value={newHours}
                    onChange={(e) => setNewHours(e.target.value)}
                    inputMode="decimal"
                    placeholder="2"
                    className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-xs text-slate-200 outline-none placeholder:text-slate-600 focus:border-amber-400"
                  />
                </label>
                <label className="flex items-center gap-2 pb-2 text-[11px] text-slate-400">
                  <input type="checkbox" checked={newAc} onChange={(e) => setNewAc(e.target.checked)} className="size-3.5 accent-amber-400" />
                  240V via inverter
                </label>
                <button
                  onClick={addAppliance}
                  className="flex items-center gap-1.5 rounded-lg bg-amber-400 px-3.5 py-2 text-xs font-bold text-slate-950 transition hover:bg-amber-300"
                >
                  <Plus className="size-3.5" /> Add load
                </button>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-between rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-400/[0.12] via-[#111822] to-[#111822] p-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.18em] text-amber-400">Your estimated daily use</p>
              <div className="mt-5 flex items-end gap-2">
                <span className="text-6xl font-semibold tracking-[-.06em] text-white">{totals.dailyAh.toFixed(1)}</span>
                <span className="mb-2 text-sm text-slate-400">Ah / day</span>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                <span className="size-2 rounded-full bg-amber-400" /> {totals.dailyWh.toFixed(0)} Wh energy demand
              </div>
            </div>
            <div className="mt-8 rounded-xl border border-white/[0.08] bg-slate-950/30 p-4">
              <div className="flex items-start gap-3">
                <Info className="mt-0.5 size-4 shrink-0 text-amber-400" />
                <p className="text-xs leading-5 text-slate-400">Tap any appliance to include or exclude it from your system sizing. Add your own loads below the grid — watts or amps both work. Estimates use 12V nominal voltage.</p>
              </div>
            </div>
          </div>
        </section>

        {totals.heavyLoad && (
          <section className="print-protected mt-5 rounded-2xl border border-red-400/30 bg-red-400/[0.07] p-5" role="alert">
            <div className="flex items-start gap-3">
              <Zap className="mt-0.5 size-5 shrink-0 text-red-300" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.18em] text-red-300">High-draw load detected</p>
                <h2 className="mt-1 text-base font-semibold text-white">Protect the battery and inverter from nuisance trips</h2>
                <p className="mt-2 max-w-3xl text-xs leading-5 text-slate-300">Induction hobs and 2000W kettles can demand 167A or more from a 12V bank — a 3000W inverter pulls 250A+. Plan for a <span className="font-semibold text-amber-300">200Ah+ LiFePO4 battery with a BMS rated above the inverter draw</span>, a pure-sine inverter, and <span className="font-semibold text-amber-300">50–95mm² copper cable with Class T or ANL protection in the 250–400A range</span>. At 3000W, keep the battery run under 1.5m — or consider a 24V architecture.</p>
              </div>
            </div>
          </section>
        )}

        <section id="sizing" className="print-protected mt-14">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[.18em] text-amber-400">02 / Architecture grid</p>
              <h2 className="text-2xl font-semibold tracking-tight text-white">Your system, sized instantly.</h2>
            </div>
            <span className="hidden items-center gap-1.5 text-xs text-slate-500 sm:flex"><Radio className="size-3.5 text-emerald-400" /> Live model</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              icon={BatteryCharging}
              label={`${state.chemistry} battery bank`}
              value={`${totals.batteryAh} Ah`}
              note={`${state.autonomy} day${state.autonomy > 1 ? 's' : ''} autonomy · ${state.chemistry === 'LiFePO4' ? '80%' : '50%'} usable DoD`}
              accent
            >
              <div className="mt-5 grid gap-3">
                <label className="text-[11px] text-slate-500">
                  Battery chemistry
                  <select value={state.chemistry} onChange={(e) => update({ chemistry: e.target.value as BuildState['chemistry'] })} className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-xs text-slate-200 outline-none focus:border-amber-400">
                    <option>LiFePO4</option>
                    <option>AGM</option>
                  </select>
                </label>
                <label className="text-[11px] text-slate-500">
                  Off-grid autonomy <span className="float-right font-medium text-amber-300">{state.autonomy} days</span>
                  <input className="mt-2 w-full accent-amber-400" type="range" min="1" max="3" step="1" value={state.autonomy} onChange={(e) => update({ autonomy: Number(e.target.value) })} />
                </label>
              </div>
            </MetricCard>
            <MetricCard
              icon={Sun}
              label="Solar array output"
              value={`${totals.solarW} W`}
              note={`${state.season} · ${state.sunHours.toFixed(1)} peak sun hrs`}
            >
              <div className="mt-5">
                <label className="mb-2 block text-[11px] text-slate-500">
                  UK seasonal preset
                  <select
                    value={state.season}
                    onChange={(e) => {
                      const season = e.target.value as BuildState['season']
                      update({ season, sunHours: season === 'Summer' ? 4.8 : season === 'Winter' ? 1.5 : 3.2 })
                    }}
                    className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-xs text-slate-200 outline-none focus:border-amber-400"
                  >
                    <option>Summer</option>
                    <option>Spring / Autumn</option>
                    <option>Winter</option>
                  </select>
                </label>
                <p className="mt-3 text-[10px] leading-4 text-slate-500">Includes a 30% real-world derate: flat mounting, heat, cloud and dirt all cut brochure yield.</p>
              </div>
            </MetricCard>
            <MetricCard
              icon={Zap}
              label="Inverter rating"
              value={totals.inverterW > 0 ? `${totals.inverterW} W` : 'Not needed'}
              note={totals.inverterW > 0 ? '20% inductive surge margin' : 'No 240V loads selected'}
            >
              {totals.inverterSupply ? (
                <div className="mt-5 space-y-1.5 text-[11px]">
                  <p className="flex items-center gap-2 text-emerald-300"><Check className="size-3.5" /> Suitable for peak AC load</p>
                  <p className="text-slate-400">
                    DC feed {Math.round(totals.inverterSupply.amps)}A · <span className="font-semibold text-amber-300">{totals.inverterSupply.cable.size}mm²</span> cable · <span className="font-semibold text-amber-300">{totals.inverterSupply.fuseA}A {totals.inverterSupply.fuseType}</span>
                  </p>
                  {totals.inverterSupply.heavyDuty && (
                    <p className="leading-4 text-amber-300/90">High current — fuse within 300mm of battery +, crimped lugs, run ≤{INVERTER_RUN_M}m</p>
                  )}
                </div>
              ) : (
                <div className="mt-5 flex items-center gap-2 text-[11px] text-emerald-300">
                  <Check className="size-3.5" /> 12V-only build
                </div>
              )}
            </MetricCard>
            <MetricCard
              icon={ShieldCheck}
              label="Main supply cable"
              value={`${totals.mainCable.size} mm²`}
              note={`${totals.mainCable.dropPct.toFixed(1)}% drop at ${state.current}A over ${state.distance}m`}
            >
              <div className={`mt-5 flex items-center gap-2 text-[11px] ${totals.mainCable.pass ? 'text-emerald-300' : 'text-red-300'}`}>
                {totals.mainCable.pass ? <Check className="size-3.5" /> : <X className="size-3.5" />}
                {totals.mainCable.pass ? 'Under 3% drop · BS EN 1648 aware' : 'Over 3% drop — increase cable'}
              </div>
            </MetricCard>
          </div>
        </section>

        <section className="print-protected mt-5 rounded-2xl border border-white/[0.08] bg-[#111822] p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[.18em] text-amber-400">03 / Triple-charging pillar</p>
              <h2 className="text-lg font-semibold text-white">Balance every source of energy</h2>
              <p className="mt-2 max-w-3xl text-xs leading-5 text-slate-500">Build the system around three complementary charging paths: harvest daylight, recover energy while driving, and top up safely when parked.</p>
            </div>
            <BatteryCharging className="size-5 shrink-0 text-amber-400" />
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.06] p-4">
              <Sun className="size-5 text-amber-300" />
              <h3 className="mt-3 text-sm font-semibold text-white">Solar</h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">{totals.solarW}W array on a {totals.mpptA}A MPPT, sized against the {state.season.toLowerCase()} yield preset.</p>
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-slate-950/30 p-4">
              <Radio className="size-5 text-emerald-300" />
              <h3 className="mt-3 text-sm font-semibold text-white">DC-DC alternator</h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">Victron Orion-Tr Smart, fused at both batteries for smart alternator vehicles.</p>
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-slate-950/30 p-4">
              <Zap className="size-5 text-slate-300" />
              <h3 className="mt-3 text-sm font-semibold text-white">Shore power</h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">A mains charger and RCD-protected hookup provide a reliable parked-up top-up.</p>
            </div>
          </div>
          {/* Daily energy balance — solar coverage by season */}
          <div className="mt-5 rounded-xl border border-white/[0.07] bg-slate-950/30 p-5">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Daily energy balance — can your solar keep up?</p>
              <span className="text-[10px] text-slate-500">{Math.round(totals.dailyWh)} Wh/day demand</span>
            </div>
            <div className="mt-4 space-y-2.5">
              {energyBalance.map((s) => (
                <div key={s.name} className="flex items-center gap-3">
                  <span className="w-24 shrink-0 text-[10px] font-medium text-slate-400">{s.name}</span>
                  <div className="relative h-4 flex-1 rounded-full bg-slate-800/80">
                    <div
                      className={`h-full rounded-full transition-all ${s.coverage >= 100 ? 'bg-emerald-400' : s.coverage >= 60 ? 'bg-amber-400' : 'bg-red-400/80'}`}
                      style={{ width: `${Math.min(100, s.coverage)}%` }}
                    />
                    <span className="absolute inset-y-0 left-full ml-0 w-px bg-white/40" style={{ left: '100%' }} />
                  </div>
                  <span className={`w-24 shrink-0 text-right text-[10px] font-bold ${s.coverage >= 100 ? 'text-emerald-300' : s.coverage >= 60 ? 'text-amber-300' : 'text-red-300'}`}>
                    {Math.round(s.coverage)}% {s.coverage >= 100 ? '· covered' : '· deficit'}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[11px] leading-4 text-slate-400">{energyVerdict}</p>
            <p className="mt-1.5 text-[10px] text-slate-600">Assumes real-world derated yield. As a rule of thumb, 1 hour of driving adds ~360Wh via the 30A DC-DC, and shore hookup refills the bank overnight.</p>
          </div>
        </section>

        <section className="print-protected mt-14 grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
          <div className="rounded-2xl border border-white/[0.08] bg-[#111822] p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="mb-1 text-[10px] font-bold uppercase tracking-[.18em] text-amber-400">04 / Cable check</p>
                <h2 className="text-lg font-semibold text-white">Voltage drop calculator</h2>
              </div>
              <ShieldCheck className="size-5 text-emerald-400" />
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-500">Set your run length and continuous current to validate the main cable. Drop is calculated on the full round trip — out on the positive and back on the negative.</p>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
              <label className="text-xs text-slate-400">
                One-way distance <span className="float-right font-medium text-slate-200">{state.distance} m</span>
                <input className="mt-3 w-full accent-amber-400" type="range" min="1" max="10" value={state.distance} onChange={(e) => update({ distance: Number(e.target.value) })} />
              </label>
              <label className="text-xs text-slate-400">
                Continuous current <span className="float-right font-medium text-slate-200">{state.current} A</span>
                <input className="mt-3 w-full accent-amber-400" type="range" min="20" max="120" step="5" value={state.current} onChange={(e) => update({ current: Number(e.target.value) })} />
              </label>
            </div>
            <div className={`mt-6 flex items-center justify-between rounded-xl border px-4 py-3 ${totals.mainCable.pass ? 'border-emerald-400/20 bg-emerald-400/[0.06]' : 'border-red-400/20 bg-red-400/[0.06]'}`}>
              <span className="text-xs text-slate-400">Recommended gauge</span>
              <span className="font-semibold text-amber-300">
                {totals.mainCable.size} mm²
                <span className={`ml-2 text-[10px] font-normal ${totals.mainCable.pass ? 'text-emerald-400' : 'text-red-300'}`}>
                  {totals.mainCable.dropPct.toFixed(1)}% · {totals.mainCable.pass ? 'PASS' : 'FAIL'}
                </span>
              </span>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-amber-400/20 bg-gradient-to-br from-[#211b11] to-[#111822] p-7">
            <div className="absolute -right-10 -top-10 size-48 rounded-full bg-amber-400/10 blur-3xl" />
            <div className="relative flex h-full flex-col justify-between">
              <div>
                <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-amber-400 text-slate-950"><Leaf className="size-5" /></div>
                <h2 className="max-w-md text-2xl font-semibold tracking-tight text-white">Take the guesswork out of your build.</h2>
                <p className="mt-3 max-w-md text-sm leading-6 text-slate-400">Get the complete printable blueprint with wiring diagrams, fuse schedules, component links, and an installation checklist.</p>
              </div>
              <a href="#download" className="mt-8 flex w-full items-center justify-between rounded-xl bg-amber-400 px-5 py-4 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/10 transition hover:bg-amber-300 sm:w-fit sm:min-w-[330px]">
                <span>Download PDF Blueprint · £7.99</span>
                <ArrowRight className="size-4" />
              </a>
            </div>
          </div>
        </section>

        <section className="print-protected mt-14 grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
          <div className="rounded-2xl border border-white/[0.08] bg-[#111822] p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="mb-1 text-[10px] font-bold uppercase tracking-[.18em] text-amber-400">05 / Quick reference</p>
                <h2 className="text-lg font-semibold text-white">Cable sizing at a glance</h2>
              </div>
              <Zap className="size-5 text-amber-400" />
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-500">Typical copper cable guidance for 12V campervan runs. Keep positive and negative runs together.</p>
            <div className="mt-5 overflow-hidden rounded-xl border border-white/[0.07]">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/50 text-[10px] uppercase tracking-wider text-slate-500">
                  <tr><th className="px-3 py-3 font-semibold">Cross-section</th><th className="px-3 py-3 font-semibold">Typical load</th><th className="px-3 py-3 font-semibold">Max amps</th><th className="px-3 py-3 font-semibold">Safe run</th></tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06] text-slate-300">
                  {cableReferenceRows.map(([size, load, amps, run]) => (
                    <tr key={size}>
                      <td className="px-3 py-3 font-medium text-amber-300">{size}</td>
                      <td className="px-3 py-3 text-slate-400">{load}</td>
                      <td className="px-3 py-3">{amps}</td>
                      <td className="px-3 py-3">{run}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] p-4">
              <div className="flex items-start gap-3">
                <Info className="mt-0.5 size-4 shrink-0 text-amber-400" />
                <p className="text-xs leading-5 text-slate-400"><span className="font-semibold text-slate-200">12V DC only.</span> Extra-low voltage DC guidance follows BS EN 1648-1 / ISO 10133 — BS 7671 (Section 721) applies to the 230V AC hookup side. Ratings are indicative; confirm installation method, ambient temperature, grouping and voltage drop before selecting final protection.</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-400/[0.1] to-[#111822] p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="mb-1 text-[10px] font-bold uppercase tracking-[.18em] text-amber-400">06 / Circuit guide</p>
                <h2 className="text-lg font-semibold text-white">Individual circuit sizing</h2>
              </div>
              <ShieldCheck className="size-5 text-emerald-400" />
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-500">Select a branch circuit and run length for an instant recommendation.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-xs text-slate-400">
                Circuit
                <select value={state.circuit} onChange={(e) => update({ circuit: e.target.value })} className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-amber-400">
                  {Object.keys(CIRCUIT_PROFILES).map((name) => <option key={name}>{name}</option>)}
                </select>
              </label>
              <label className="text-xs text-slate-400">
                One-way run <span className="float-right font-medium text-slate-200">{state.circuitDistance} m</span>
                <input className="mt-4 w-full accent-amber-400" type="range" min="1" max="10" value={state.circuitDistance} onChange={(e) => update({ circuitDistance: Number(e.target.value) })} />
              </label>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-950/50 p-4">
                <p className="text-[10px] uppercase tracking-wider text-slate-500">Recommended wire</p>
                <p className="mt-1 text-xl font-semibold text-amber-300">{circuitResult.size} mm²</p>
              </div>
              <div className="rounded-xl bg-slate-950/50 p-4">
                <p className="text-[10px] uppercase tracking-wider text-slate-500">Fuse size</p>
                <p className="mt-1 text-xl font-semibold text-amber-300">{circuitResult.fuse} A</p>
              </div>
            </div>
            <div className={`mt-3 flex items-center justify-between rounded-xl border px-4 py-3 ${circuitResult.pass ? 'border-emerald-400/20 bg-emerald-400/[0.06]' : 'border-red-400/20 bg-red-400/[0.06]'}`}>
              <span className="text-xs text-slate-400">Voltage drop at {state.circuitDistance}m</span>
              <span className={`font-semibold ${circuitResult.pass ? 'text-emerald-300' : 'text-red-300'}`}>{circuitResult.dropPct.toFixed(1)}% · {circuitResult.pass ? 'PASS' : 'FAIL — increase cable'}</span>
            </div>
          </div>
        </section>

        <section id="schematic" className="print-protected mt-14 rounded-2xl border border-white/[0.08] bg-[#111822] p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[.18em] text-amber-400">07 / Wiring schematic</p>
              <h2 className="text-lg font-semibold text-white">Your system, drawn live</h2>
              <p className="mt-2 max-w-3xl text-xs leading-5 text-slate-500">Single-line diagram generated from your configuration — cable sizes, fuse ratings and branch circuits update as you change the load list.</p>
            </div>
            <CircuitBoard className="size-5 shrink-0 text-amber-400" />
          </div>
          <div className="mt-6 overflow-x-auto rounded-xl border border-white/[0.07] bg-slate-950/40 p-4">
            <Schematic sizing={totals} state={state} onPick={setGuideId} />
          </div>
          <p className="mt-3 flex items-center gap-2 text-[11px] text-slate-500">
            <Info className="size-3.5 shrink-0 text-amber-400" />
            Click any component marked ⓘ — MPPT, DC-DC, fuse block, inverter, shunt — for an exploded view with terminal-by-terminal wiring steps.
          </p>
        </section>

        <section id="bom" className="print-protected mt-14 rounded-2xl border border-white/[0.08] bg-[#111822] p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[.18em] text-amber-400">08 / Live bill of materials</p>
              <h2 className="text-lg font-semibold text-white">Everything you need to buy</h2>
              <p className="mt-2 max-w-3xl text-xs leading-5 text-slate-500">Quantities update with your load list. Branch circuits assume a typical one-way run of {state.branchRun}m — adjust it below to match your van.</p>
            </div>
            <ClipboardList className="size-5 shrink-0 text-amber-400" />
          </div>
          <div className="mt-5 flex flex-wrap items-end gap-x-6 gap-y-4">
            <label className="block max-w-xs text-xs text-slate-400">
              Typical branch run <span className="float-right font-medium text-slate-200">{state.branchRun} m</span>
              <input className="mt-3 w-44 accent-amber-400" type="range" min="2" max="10" value={state.branchRun} onChange={(e) => update({ branchRun: Number(e.target.value) })} />
            </label>
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Component tier</p>
              <div className="inline-flex rounded-full border border-white/10 bg-white/[0.04] p-0.5">
                {(['premium', 'mid', 'budget'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTier(t)}
                    className={`rounded-full px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider transition ${tier === t ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    {t === 'premium' ? 'Pro · Victron' : t === 'mid' ? 'Mid · Renogy' : 'Budget · Eco-Worthy'}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] px-4 py-3">
            <span className="text-xs text-slate-400">Estimated parts cost</span>
            <span className="text-lg font-semibold tracking-tight text-amber-300">£{estLow.toLocaleString('en-GB')}–£{estHigh.toLocaleString('en-GB')}</span>
            <span className="text-[10px] text-slate-500">{tier === 'premium' ? 'Victron / Fogstar pricing' : tier === 'mid' ? 'Renogy class pricing' : 'Eco-Worthy / generic pricing'} · compare suppliers</span>
          </div>
          <p className="mt-3 flex items-start gap-2 text-[11px] leading-5 text-slate-500">
            <Info className="mt-0.5 size-3.5 shrink-0 text-slate-500" />
            Capacities, panel counts and fuse ratings are rounded up to the nearest available retail size — real-world quantities step up slightly from the exact calculated figures. That headroom is deliberate, not an error.
          </p>
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <div className="overflow-hidden rounded-xl border border-white/[0.07]">
              <div className="border-b border-white/[0.07] bg-slate-950/40 px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-amber-300">Core system</div>
              <table className="w-full text-left text-xs">
                <thead className="text-[10px] uppercase tracking-wider text-slate-500">
                  <tr><th className="px-4 py-2.5">Item</th><th className="px-4 py-2.5">Spec</th><th className="px-4 py-2.5">Guide</th><th className="px-4 py-2.5">Buy</th></tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06] text-slate-300">
                  {coreRows.map((row) => (
                    <tr key={row.item}>
                      <td className="px-4 py-2.5 text-slate-200">{row.item}</td>
                      <td className="px-4 py-2.5 text-slate-400">{rowSpec(row)}</td>
                      <td className="px-4 py-2.5 text-amber-300">£{rowGuide(row)[0]}–{rowGuide(row)[1]}</td>
                      <td className="px-4 py-2.5">
                        <a {...affiliateProps(rowHref(row), row.item, 'bom')} className="inline-flex items-center gap-1 font-medium text-slate-300 transition hover:text-amber-300">
                          {RETAILERS[rowShop(row)].name} <ExternalLink className="size-3" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="overflow-hidden rounded-xl border border-white/[0.07]">
              <div className="border-b border-white/[0.07] bg-slate-950/40 px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-amber-300">Cable, fuses & terminations</div>
              <table className="w-full text-left text-xs">
                <thead className="text-[10px] uppercase tracking-wider text-slate-500">
                  <tr><th className="px-4 py-2.5">Item</th><th className="px-4 py-2.5">Detail</th><th className="px-4 py-2.5">Guide</th><th className="px-4 py-2.5">Buy</th></tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06] text-slate-300">
                  {supplyRows.map((row) => (
                    <tr key={row.item}>
                      <td className="px-4 py-2.5 text-slate-200">{row.item}</td>
                      <td className="px-4 py-2.5 text-slate-400">{rowSpec(row)}</td>
                      <td className="px-4 py-2.5 text-amber-300">£{rowGuide(row)[0]}–{rowGuide(row)[1]}</td>
                      <td className="px-4 py-2.5">
                        <a {...affiliateProps(rowHref(row), row.item, 'bom')} className="inline-flex items-center gap-1 font-medium text-slate-300 transition hover:text-amber-300">
                          {RETAILERS[rowShop(row)].name} <ExternalLink className="size-3" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {totals.branches.length > 0 && (
            <div className="mt-5 overflow-hidden rounded-xl border border-white/[0.07]">
              <div className="border-b border-white/[0.07] bg-slate-950/40 px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-amber-300">Branch circuit schedule — {totals.branches.length} live circuits</div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-[10px] uppercase tracking-wider text-slate-500">
                    <tr><th className="px-4 py-2.5">Circuit</th><th className="px-4 py-2.5">Load</th><th className="px-4 py-2.5">Wire</th><th className="px-4 py-2.5">Fuse</th><th className="px-4 py-2.5">Cable needed</th></tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06] text-slate-300">
                    {totals.branches.map((b) => (
                      <tr key={b.name}>
                        <td className="px-4 py-2.5 font-medium text-slate-200">{b.name}</td>
                        <td className="px-4 py-2.5 text-slate-400">{b.amps.toFixed(1)}A</td>
                        <td className="px-4 py-2.5 text-amber-300">{b.wireMm2}mm²</td>
                        <td className="px-4 py-2.5 text-amber-300">{b.fuseA}A blade</td>
                        <td className="px-4 py-2.5 text-slate-400">{b.metres}m</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <div className="mt-4 rounded-xl border border-white/[0.07] bg-slate-950/30 p-4">
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 size-4 shrink-0 text-amber-400" />
              <p className="text-xs leading-5 text-slate-400">Cable lengths include positive and negative runs ({mainCableMetres}m on the main feed). Add your own margin for routing around the van, grommets, heat-shrink and a few spare fuses. Guide prices are estimates — compare suppliers before buying. Some links are affiliate links: we may earn a commission at no extra cost to you, which keeps the tool free.</p>
            </div>
          </div>
        </section>

        <section className="print-protected mt-5 rounded-2xl border border-amber-400/20 bg-gradient-to-br from-[#211b11] to-[#111822] p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[.18em] text-amber-400">09 / 240V AC mains sizing</p>
              <h2 className="text-lg font-semibold text-white">Inverter output to 3-pin sockets</h2>
            </div>
            <ShieldCheck className="size-5 shrink-0 text-emerald-400" />
          </div>
          <p className="mt-2 max-w-3xl text-xs leading-5 text-slate-400">This is a separate AC circuit and must not be sized like the 12V DC wiring above. Use <span className="font-semibold text-amber-300">2.5mm² 3-core flexible cable</span> from the inverter output to a proper consumer unit with RCD protection, installed and tested by a qualified person.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-950/45 p-4"><p className="text-[10px] uppercase tracking-wider text-slate-500">Cable</p><p className="mt-1 text-sm font-semibold text-slate-200">2.5mm² 3-core flex</p></div>
            <div className="rounded-xl bg-slate-950/45 p-4"><p className="text-[10px] uppercase tracking-wider text-slate-500">Protection</p><p className="mt-1 text-sm font-semibold text-slate-200">Consumer unit + RCD</p></div>
            <div className="rounded-xl bg-slate-950/45 p-4"><p className="text-[10px] uppercase tracking-wider text-slate-500">Scope</p><p className="mt-1 text-sm font-semibold text-slate-200">240V AC only</p></div>
          </div>
        </section>

        <section className="print-protected mt-5 rounded-2xl border border-white/[0.08] bg-[#111822] p-6">
          <div className="flex items-start gap-3">
            <Radio className="mt-0.5 size-5 shrink-0 text-amber-400" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.18em] text-amber-400">10 / Smart alternator advisor</p>
              <h2 className="mt-1 text-lg font-semibold text-white">Euro 6 and BlueMotion charging</h2>
              <p className="mt-2 max-w-4xl text-xs leading-5 text-slate-400">Modern Euro 6 / BlueMotion vehicles use smart alternators that reduce output once the starter battery is charged. A conventional split-charge relay may undercharge the leisure bank; use a smart DC-DC charger such as <span className="font-semibold text-slate-200">Victron Orion-Tr Smart or Renogy</span> with ignition/D+ sensing, correctly fused at both batteries.</p>
            </div>
          </div>
        </section>

        <section className="print-protected mt-5 rounded-2xl border border-amber-400/20 bg-gradient-to-br from-[#211b11] to-[#111822] p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[.18em] text-amber-400">11 / Fuse & protection schedule</p>
              <h2 className="text-lg font-semibold text-white">Protect every cable and connection</h2>
            </div>
            <ShieldCheck className="size-5 shrink-0 text-emerald-400" />
          </div>
          <p className="mt-2 max-w-4xl text-xs leading-5 text-slate-400">The fuse protects the cable, not the appliance. Place high-current protection within 300mm of the battery positive terminal, use correctly rated interrupt capacity, and have AC work installed and tested by a qualified person.</p>
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <div className="overflow-hidden rounded-xl border border-white/[0.07]">
              <div className="border-b border-white/[0.07] bg-slate-950/40 px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-amber-300">Inverter & high-current fuses</div>
              <table className="w-full text-left text-xs">
                <thead className="text-[10px] uppercase tracking-wider text-slate-500">
                  <tr><th className="px-3 py-2.5">Inverter</th><th className="px-3 py-2.5">Fuse type</th><th className="px-3 py-2.5">Rating</th><th className="px-3 py-2.5">Cable</th></tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06] text-slate-300">
                  {inverterFuseRows.map(([inverter, type, rating, cable]) => (
                    <tr key={inverter}>
                      <td className="px-3 py-2.5 font-medium text-slate-200">{inverter}</td>
                      <td className="px-3 py-2.5 text-slate-400">{type}</td>
                      <td className="px-3 py-2.5 text-amber-300">{rating}</td>
                      <td className="px-3 py-2.5">{cable}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="overflow-hidden rounded-xl border border-white/[0.07]">
              <div className="border-b border-white/[0.07] bg-slate-950/40 px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-amber-300">ATC / ATM branch fuse schedule</div>
              <table className="w-full text-left text-xs">
                <thead className="text-[10px] uppercase tracking-wider text-slate-500">
                  <tr><th className="px-3 py-2.5">Circuit</th><th className="px-3 py-2.5">Fuse</th><th className="px-3 py-2.5">Wire</th></tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06] text-slate-300">
                  {bladeFuseRows.map(([circuitName, fuse, cable]) => (
                    <tr key={circuitName}>
                      <td className="px-3 py-2.5 text-slate-200">{circuitName}</td>
                      <td className="px-3 py-2.5 text-amber-300">{fuse}</td>
                      <td className="px-3 py-2.5">{cable}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-950/45 p-4"><p className="text-[10px] uppercase tracking-wider text-slate-500">Solar protection</p><p className="mt-1 text-xs leading-5 text-slate-300">Panel side: 1.25 × I<sub>sc</sub>. Battery side: match MPPT output and cable; a 100/30 typically uses 40A.</p></div>
            <div className="rounded-xl bg-slate-950/45 p-4"><p className="text-[10px] uppercase tracking-wider text-slate-500">DC-DC chargers</p><p className="mt-1 text-xs leading-5 text-slate-300">Fuse both starter and leisure battery ends: 30A/40A/70–80A for 20A/30A/50A chargers.</p></div>
            <div className="rounded-xl bg-slate-950/45 p-4"><p className="text-[10px] uppercase tracking-wider text-slate-500">System management</p><p className="mt-1 text-xs leading-5 text-slate-300">SmartShunt stays in the full negative return with a 1A supply fuse. BatteryProtect guards loads; isolate the main positive with a heavy-duty cut-off.</p></div>
          </div>
        </section>

        <section id="download" className="mt-14 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
          <div className="rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-400/[0.1] to-[#111822] p-6">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[.18em] text-amber-400">Blueprint preview</p>
            <h2 className="text-lg font-semibold text-white">Your professional build blueprint</h2>
            <p className="mt-2 max-w-xl text-xs leading-5 text-slate-400">A concise, build-ready PDF with the decisions behind this estimate, prepared for a qualified installer to review.</p>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {['Master Wiring Schematic', 'Full Circuit Fuse/Cable Schedule', 'Equipment BOM', 'Safety & Compliance Checklist'].map((item) => (
                <div key={item} className="flex items-center gap-2 rounded-lg bg-slate-950/40 px-3 py-2.5 text-xs text-slate-300"><Check className="size-3.5 text-emerald-400" />{item}</div>
              ))}
            </div>
            <button onClick={() => setBlueprintOpen(true)} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-amber-300">
              Preview £7.99 blueprint <ArrowRight className="size-4" />
            </button>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-[#111822] p-6">
            <p className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">Secure checkout</p>
            <h3 className="mt-2 text-xl font-semibold text-white">Download the full plan</h3>
            <p className="mt-2 text-xs leading-5 text-slate-500">Stripe-secured purchase for the complete PDF blueprint.</p>
            <button onClick={() => setBlueprintOpen(true)} className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-amber-400 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-amber-300">
              Buy blueprint · £7.99 <ShoppingCart className="size-4" />
            </button>
          </div>
        </section>

        {guideId && <ComponentGuide id={guideId} onClose={() => setGuideId(null)} />}

        {blueprintOpen && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/80 p-5 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="blueprint-title" onClick={() => setBlueprintOpen(false)}>
            <div className="max-h-[90vh] max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-2xl border border-amber-400/25 bg-[#111822] p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[.18em] text-amber-400">Blueprint preview</p>
                  <h2 id="blueprint-title" className="mt-1 text-xl font-semibold text-white">VanSpark 12V Pro PDF</h2>
                </div>
                <button onClick={() => setBlueprintOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white" aria-label="Close preview"><X /></button>
              </div>
              {/* Live excerpt — rendered from their actual build so the preview
                  proves the document is generated, not a stock template. */}
              <div className="relative mt-5 overflow-hidden rounded-xl border border-white/[0.08] bg-white p-4 text-slate-800">
                <div className="pointer-events-none absolute inset-0 grid place-items-center">
                  <span className="rotate-[-16deg] text-4xl font-black tracking-[.3em] text-slate-900/[0.06]">SAMPLE</span>
                </div>
                <p className="text-[9px] font-bold uppercase tracking-[.2em] text-slate-400">VanSpark 12V Pro — Build Blueprint</p>
                <p className="mt-1 text-xs font-bold">System schedule · {state.season}</p>
                <div className="mt-2 space-y-1 font-mono text-[10px] leading-4 text-slate-600">
                  <p>Battery bank ....... {totals.batteryAh}Ah {state.chemistry}</p>
                  <p>Solar array ........ {totals.solarW}W → {totals.mpptA}A MPPT</p>
                  {totals.inverterW > 0 && <p>Inverter ............ {totals.inverterW}W pure sine</p>}
                  <p>Main cable ......... {totals.mainCable.size}mm² · {totals.mainFuseA}A MEGA fuse</p>
                  <p>Branch circuits .... {totals.branches.length} fused runs</p>
                </div>
                <p className="mt-2 border-t border-slate-200 pt-1.5 text-[8px] leading-3 text-slate-400">Live excerpt from your build — the full PDF includes the wiring schematic, complete fuse/cable schedule and compliance checklist.</p>
              </div>
              <div className="mt-5 rounded-xl border border-white/[0.08] bg-slate-950/50 p-5">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-lg bg-amber-400 text-slate-950"><ShoppingCart className="size-5" /></div>
                  <div>
                    <p className="text-sm font-semibold text-white">Professional electrical blueprint</p>
                    <p className="text-xs text-slate-500">Instant PDF download · £7.99</p>
                  </div>
                </div>
                <ul className="mt-5 grid gap-3 text-sm text-slate-300">
                  {['Master Wiring Schematic', 'Full Circuit Fuse/Cable Schedule', 'Equipment BOM', 'Safety & Compliance Checklist'].map((item) => (
                    <li key={item} className="flex items-center gap-2"><Check className="size-4 text-emerald-400" />{item}</li>
                  ))}
                </ul>
              </div>
              <button
                onClick={handleBlueprint}
                disabled={downloading}
                className="mt-5 w-full rounded-lg bg-amber-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-300 disabled:cursor-wait disabled:opacity-60"
              >
                {downloading ? 'Redirecting to checkout…' : 'Buy blueprint · £7.99'}
              </button>
              {checkoutError && (
                <p className="mt-3 rounded-lg border border-red-400/25 bg-red-400/[0.08] px-3 py-2 text-center text-[11px] text-red-300">
                  Checkout isn't available just yet — please try again shortly.
                </p>
              )}
              <p className="mt-3 text-center text-[10px] text-slate-600">Secure payment via Stripe. Your PDF generates automatically once payment completes.</p>
            </div>
          </div>
        )}

        <section id="hardware" className="print-protected mt-14">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[.18em] text-amber-400">12 / Tested hardware</p>
              <h2 className="text-2xl font-semibold tracking-tight text-white">A reliable parts shortlist.</h2>
            </div>
            <span className="hidden text-xs text-slate-500 sm:block">Curated for 12V builds · affiliate links</span>
          </div>
          <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Premium picks — Victron / Fogstar / Blue Sea</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {hardwarePremium.map((item) => (
              <a key={item.name} {...affiliateProps(item.href, item.name)} className="group rounded-xl border border-white/[0.08] bg-[#111822] p-5 transition hover:-translate-y-0.5 hover:border-amber-400/30 hover:bg-[#141e2a]">
                <div className="flex items-start justify-between">
                  <span className="rounded-md bg-slate-800 px-2 py-1 text-[9px] font-bold tracking-wider text-slate-500">{item.type}</span>
                  <ExternalLink className="size-4 text-slate-600 transition group-hover:text-amber-400" />
                </div>
                <h3 className="mt-5 text-sm font-semibold text-slate-200">{item.name}</h3>
                <p className="mt-1 text-xs text-slate-500">{item.spec}</p>
              </a>
            ))}
          </div>
          <p className="mb-3 mt-7 text-[10px] font-bold uppercase tracking-wider text-slate-500">Mid-tier picks — Renogy</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {hardwareMid.map((item) => (
              <a key={item.name} {...affiliateProps(item.href, item.name)} className="group rounded-xl border border-white/[0.08] bg-[#111822] p-5 transition hover:-translate-y-0.5 hover:border-amber-400/30 hover:bg-[#141e2a]">
                <div className="flex items-start justify-between">
                  <span className="rounded-md bg-slate-800 px-2 py-1 text-[9px] font-bold tracking-wider text-slate-500">{item.type}</span>
                  <ExternalLink className="size-4 text-slate-600 transition group-hover:text-amber-400" />
                </div>
                <h3 className="mt-5 text-sm font-semibold text-slate-200">{item.name}</h3>
                <p className="mt-1 text-xs text-slate-500">{item.spec}</p>
              </a>
            ))}
          </div>
          <p className="mb-3 mt-7 text-[10px] font-bold uppercase tracking-wider text-slate-500">Budget-friendly picks — Eco-Worthy / generic</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {hardwareBudget.map((item) => (
              <a key={item.name} {...affiliateProps(item.href, item.name)} className="group rounded-xl border border-white/[0.08] bg-[#111822] p-5 transition hover:-translate-y-0.5 hover:border-amber-400/30 hover:bg-[#141e2a]">
                <div className="flex items-start justify-between">
                  <span className="rounded-md bg-slate-800 px-2 py-1 text-[9px] font-bold tracking-wider text-slate-500">{item.type}</span>
                  <ExternalLink className="size-4 text-slate-600 transition group-hover:text-amber-400" />
                </div>
                <h3 className="mt-5 text-sm font-semibold text-slate-200">{item.name}</h3>
                <p className="mt-1 text-xs text-slate-500">{item.spec}</p>
              </a>
            ))}
          </div>
        </section>

        <section className="print-protected mt-14">
          <div className="mb-5">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[.18em] text-amber-400">13 / Common questions</p>
            <h2 className="text-2xl font-semibold tracking-tight text-white">Campervan electrics, answered.</h2>
          </div>
          <div className="grid gap-3">
            {FAQS.map(([q, a]) => (
              <details key={q} className="group rounded-xl border border-white/[0.08] bg-[#111822] px-5 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-slate-200 [&::-webkit-details-marker]:hidden">
                  {q}
                  <ChevronDown className="size-4 shrink-0 text-slate-500 transition group-open:rotate-180" />
                </summary>
                <p className="mt-3 max-w-3xl text-xs leading-5 text-slate-400">{a}</p>
              </details>
            ))}
          </div>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: FAQS.map(([q, a]) => ({
                  '@type': 'Question',
                  name: q,
                  acceptedAnswer: { '@type': 'Answer', text: a },
                })),
              }),
            }}
          />
        </section>

        <section className="mt-14 rounded-2xl border border-white/[0.08] bg-[#111822] p-6">
          <p className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">About VanSpark</p>
          <p className="mt-3 max-w-3xl text-xs leading-5 text-slate-400">
            VanSpark is an independent design tool built for campervan self-builders. Sizing guidance follows BS EN 1648-1 / ISO 10133 for extra-low voltage 12V DC systems and BS 7671 Section 721 for the 230V AC hookup side. All figures are guidance only — have your finished installation inspected by a qualified auto-electrician before energising.
          </p>
          <p className="mt-3 max-w-3xl text-xs leading-5 text-slate-500">
            Some outbound links are affiliate links — if you buy through them we may earn a small commission at no extra cost to you. It keeps the calculator free.
          </p>
        </section>

        <footer className="mt-16 flex flex-col gap-3 border-t border-white/[0.07] pt-6 text-[11px] text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <span>VanSpark 12V Pro · For guidance only. Always verify with a qualified installer.</span>
          <span className="flex items-center gap-2"><CircleHelp className="size-3.5" /> Calculations use nominal 12V values</span>
          <span className="flex items-center gap-4">
            <a href="/guides" className="transition hover:text-slate-400">Guides</a>
            <a href="/privacy" className="transition hover:text-slate-400">Privacy</a>
            <a href="/terms" className="transition hover:text-slate-400">Terms</a>
          </span>
        </footer>
      </div>
    </main>
  )
}

function MetricCard({ icon: Icon, label, value, note, children, accent = false }: { icon: typeof Gauge; label: string; value: string; note: string; children?: ReactNode; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 ${accent ? 'border-amber-400/30 bg-gradient-to-br from-amber-400/[0.08] to-[#111822]' : 'border-white/[0.08] bg-[#111822]'}`}>
      <div className="flex items-center justify-between">
        <span className={`grid size-9 place-items-center rounded-lg ${accent ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-amber-300'}`}><Icon className="size-[18px]" /></span>
        {accent && <span className="text-[9px] font-bold uppercase tracking-wider text-amber-300">Recommended</span>}
      </div>
      <p className="mt-5 text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-white">{value}</p>
      <p className="mt-1 text-[11px] text-slate-500">{note}</p>
      {children}
    </div>
  )
}
