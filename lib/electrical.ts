export const SYSTEM_VOLTAGE = 12
export const COPPER_RESISTIVITY = 0.0175 // Ω·mm² per metre, copper
export const MAX_DROP_PCT = 3
export const SOLAR_DERATE = 1.3 // real-world factor: flat mounting, heat, cloud, dirt

export const CABLE_SIZES = [0.5, 0.75, 1, 1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95] as const

// Conservative continuous-current guidance per cross-section for 12V DC
// campervan wiring (tri-rated / thin-wall copper, short bundled runs).
export const CABLE_AMPACITY: Record<number, number> = {
  0.5: 6, 0.75: 9, 1: 11, 1.5: 15, 2.5: 20, 4: 30, 6: 42,
  10: 55, 16: 75, 25: 100, 35: 135, 50: 170, 70: 210, 95: 250,
}

export const BLADE_FUSES = [3, 5, 7.5, 10, 15, 20, 25, 30]
export const MEGA_FUSES = [40, 60, 80, 100, 125, 150, 175, 200, 225, 250, 300, 350, 400]
export const MPPT_RATINGS = [15, 20, 30, 40, 50, 60, 70, 85, 100]

export type Appliance = {
  id: string
  name: string
  icon: string
  watts: number
  hours: number
  active: boolean
  ac?: boolean      // 240V appliance fed through the inverter
  noBranch?: boolean // wired to the inverter/battery, not a 12V branch circuit
  custom?: boolean
  fuseHint?: number  // recommended branch fuse (A), accounts for inrush
  minWire?: number   // recommended minimum mm² for the branch
}

export const PRESET_APPLIANCES: Appliance[] = [
  { id: 'fridge', name: '12V Compressor Fridge', icon: 'thermometer', watts: 45, hours: 8, active: true, fuseHint: 10, minWire: 2.5 },
  { id: 'heater', name: 'Diesel Heater', icon: 'wind', watts: 35, hours: 4, active: true, fuseHint: 15, minWire: 2.5 },
  { id: 'lights', name: 'LED Lighting', icon: 'lightbulb', watts: 12, hours: 5, active: true, fuseHint: 5, minWire: 1.5 },
  { id: 'usb', name: 'USB Device Charging', icon: 'usb', watts: 18, hours: 3, active: true, fuseHint: 10, minWire: 2.5 },
  { id: 'fan', name: 'Roof Vent Fan', icon: 'fan', watts: 24, hours: 6, active: false, fuseHint: 5, minWire: 1.5 },
  { id: 'starlink', name: 'Starlink / Router', icon: 'satellite', watts: 50, hours: 4, active: false, fuseHint: 10, minWire: 2.5 },
  { id: 'laptop', name: 'Laptop Charging', icon: 'laptop', watts: 60, hours: 3, active: false, fuseHint: 10, minWire: 2.5 },
  { id: 'pump', name: 'Water Pump', icon: 'waves', watts: 60, hours: 0.5, active: false, fuseHint: 10, minWire: 1.5 },
  { id: 'invstandby', name: 'Inverter Standby', icon: 'zap', watts: 8, hours: 24, active: false, noBranch: true },
  { id: 'induction', name: 'Induction Hob', icon: 'zap', watts: 1800, hours: 0.5, active: false, ac: true, noBranch: true },
  { id: 'kettle', name: '2000W Kettle', icon: 'zap', watts: 2000, hours: 0.3, active: false, ac: true, noBranch: true },
]

// Voltage drop across the full circuit: current travels out on the
// positive and returns on the negative, so conductor length is 2 × one-way run.
export function voltageDropPct(amps: number, oneWayM: number, areaMm2: number, voltage = SYSTEM_VOLTAGE) {
  const deltaV = (amps * 2 * oneWayM * COPPER_RESISTIVITY) / areaMm2
  return (deltaV / voltage) * 100
}

export function requiredAreaMm2(amps: number, oneWayM: number, maxDropPct = MAX_DROP_PCT, voltage = SYSTEM_VOLTAGE) {
  return (amps * 2 * oneWayM * COPPER_RESISTIVITY) / (voltage * (maxDropPct / 100))
}

export type CablePick = { size: number; dropPct: number; pass: boolean }

// Smallest standard cable that satisfies BOTH the 3% voltage-drop limit
// and the ampacity floor for the load.
export function selectCable(amps: number, oneWayM: number, minArea = 0): CablePick {
  const required = requiredAreaMm2(amps, oneWayM)
  for (const size of CABLE_SIZES) {
    if (size >= required && size >= minArea && (CABLE_AMPACITY[size] ?? 0) >= amps) {
      return { size, dropPct: voltageDropPct(amps, oneWayM, size), pass: true }
    }
  }
  const size = CABLE_SIZES[CABLE_SIZES.length - 1]
  return { size, dropPct: voltageDropPct(amps, oneWayM, size), pass: false }
}

export function selectFuse(amps: number, sizes: number[] = BLADE_FUSES, hint = 0) {
  const needed = Math.max(amps * 1.25, hint)
  return sizes.find((s) => s >= needed) ?? sizes[sizes.length - 1]
}

// Inverters sit on their own dedicated feed straight off the battery —
// kept deliberately short because 12V inverter currents are huge.
export const INVERTER_RUN_M = 1.5 // one-way metres, battery to inverter

export type InverterSupply = {
  amps: number        // continuous DC draw at 12V
  cable: CablePick    // heavy-duty feed: 35–95mm² for big inverters
  fuseA: number       // high-current fuse within 300mm of battery +
  fuseType: string    // MEGA / MIDI vs ANL / Class T
  heavyDuty: boolean  // over 1000W — extra safety callout warranted
}

export function sizeInverterSupply(inverterW: number): InverterSupply | null {
  if (inverterW <= 0) return null
  const amps = inverterW / SYSTEM_VOLTAGE
  const cable = selectCable(amps, INVERTER_RUN_M)
  const fuseA = selectFuse(amps, MEGA_FUSES)
  return { amps, cable, fuseA, fuseType: fuseA > 200 ? 'ANL / Class T' : 'MEGA / MIDI', heavyDuty: inverterW > 1000 }
}

export type SizingInput = {
  appliances: Appliance[]
  autonomy: number
  chemistry: 'LiFePO4' | 'AGM'
  sunHours: number
  distance: number   // one-way metres, battery to main consumer
  current: number    // continuous amps on the main run
  branchRun: number  // assumed one-way metres per branch circuit
}

export type BranchSpec = {
  name: string
  amps: number
  wireMm2: number
  fuseA: number
  metres: number // red + black combined
}

export type SystemSizing = {
  dailyWh: number
  dailyAh: number
  batteryAh: number
  solarW: number
  mpptA: number
  inverterW: number
  inverterSupply: InverterSupply | null
  heavyLoad: boolean
  mainCable: CablePick
  mainFuseA: number
  branches: BranchSpec[]
  cableMetres: Record<number, number> // gauge -> total metres incl. main run
  bladeFuseCount: Record<number, number>
}

export function sizeSystem(input: SizingInput): SystemSizing {
  const { appliances, autonomy, chemistry, sunHours, distance, current, branchRun } = input
  const live = appliances.filter((a) => a.active)

  const dailyWh = live.reduce((s, a) => s + a.watts * a.hours, 0)
  const dailyAh = dailyWh / SYSTEM_VOLTAGE
  const usableDod = chemistry === 'LiFePO4' ? 0.8 : 0.5
  const batteryAh = Math.ceil((dailyAh * autonomy) / usableDod / 10) * 10

  const solarW = Math.ceil(((dailyWh / sunHours) * SOLAR_DERATE) / 10) * 10
  const mpptA = MPPT_RATINGS.find((r) => r >= (solarW / SYSTEM_VOLTAGE) * 1.25) ?? MPPT_RATINGS[MPPT_RATINGS.length - 1]

  const acPeakW = live.filter((a) => a.ac).reduce((s, a) => s + a.watts, 0)
  const inverterW = acPeakW > 0 ? Math.ceil((acPeakW * 1.2) / 50) * 50 : 0
  const heavyLoad = live.some((a) => a.ac && a.watts >= 1500)

  const mainCable = selectCable(current, distance, 6)
  const mainFuseA = selectFuse(current, MEGA_FUSES)

  const branches: BranchSpec[] = live
    .filter((a) => !a.noBranch)
    .map((a) => {
      const amps = a.watts / SYSTEM_VOLTAGE
      const wireMm2 = selectCable(amps, branchRun, a.minWire ?? 0).size
      const fuseA = selectFuse(amps, BLADE_FUSES, a.fuseHint ?? 0)
      return { name: a.name, amps, wireMm2, fuseA, metres: branchRun * 2 }
    })

  const cableMetres: Record<number, number> = {}
  const addMetres = (gauge: number, m: number) => { cableMetres[gauge] = (cableMetres[gauge] ?? 0) + m }
  addMetres(mainCable.size, Math.ceil(distance * 2 * 1.1)) // pos + neg + 10% waste
  for (const b of branches) addMetres(b.wireMm2, b.metres)

  const bladeFuseCount: Record<number, number> = {}
  for (const b of branches) bladeFuseCount[b.fuseA] = (bladeFuseCount[b.fuseA] ?? 0) + 1

  return { dailyWh, dailyAh, batteryAh, solarW, mpptA, inverterW, inverterSupply: sizeInverterSupply(inverterW), heavyLoad, mainCable, mainFuseA, branches, cableMetres, bladeFuseCount }
}
