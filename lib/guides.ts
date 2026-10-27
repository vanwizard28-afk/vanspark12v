import { PRESET_APPLIANCES } from './electrical'
import { DEFAULT_STATE, encodeState } from './build-state'

// SEO guide content — each guide targets a real search query and deep-links
// into the calculator pre-loaded with the relevant build.
export type GuideSection = {
  heading: string
  body?: string[]
  table?: { head: string[]; rows: string[][] }
  list?: string[]
}

export type Guide = {
  slug: string
  title: string
  metaTitle: string
  description: string
  intro: string
  sections: GuideSection[]
  faqs: [string, string][]
  buildIds: string[]
  ctaLabel: string
}

// Encodes a calculator URL pre-loaded with the given preset appliances active.
export function buildLink(activeIds: string[]): string {
  const state = {
    ...DEFAULT_STATE,
    appliances: PRESET_APPLIANCES.map((a) => ({ ...a, active: activeIds.includes(a.id) })),
  }
  return `/?build=${encodeState(state)}`
}

export const GUIDES: Guide[] = [
  {
    slug: 'campervan-cable-size-chart',
    title: 'Campervan Cable Size Chart: What mm² Do You Actually Need?',
    metaTitle: 'Campervan Cable Size Chart (12V) — mm² by Amps & Distance | VanSpark',
    description: 'The complete 12V campervan cable size chart. Worked out on the full round trip — positive out and negative back — keeping voltage drop under 3%.',
    intro: 'Cable sizing is where most self-builds quietly go wrong. Get it right and your lights stay bright, your fridge stays cold, and nothing gets warm that should not be. This guide gives you the chart, the maths behind it, and the rules of thumb installers actually use.',
    sections: [
      {
        heading: 'The rule that matters: current goes there AND back',
        body: [
          'Every circuit has two conductors. A 60A load 3 metres from the battery is not a 3-metre problem — it is a 6-metre problem, because the current travels out on the positive cable and returns on the negative. Cable charts that only price the positive leg undersize your wiring by roughly half.',
          'The formula: required cross-sectional area A = (2 × I × L × ρ) ÷ ΔV, where I is current, L is one-way length, ρ is 0.0175 Ω·mm²/m for copper, and ΔV is the acceptable drop — 3% of 12V, or 0.36V.',
        ],
      },
      {
        heading: '12V cable size chart (3% drop, copper, round trip)',
        table: {
          head: ['Load', '1m run', '3m run', '5m run', 'Fuse (1.25×)'],
          rows: [
            ['5A — lights, fans', '1mm²', '2.5mm²', '4mm²', '7.5A'],
            ['10A — pump, USB, fridge', '1.5mm²', '4mm²', '6mm²', '15A'],
            ['20A — heater, sockets', '2.5mm²', '6mm²', '10mm²', '25A'],
            ['40A — DC-DC input', '6mm²', '16mm²', '25mm²', '50A'],
            ['60A — main feed', '10mm²', '25mm²', '35mm²', '80A'],
            ['100A — small inverter', '16mm²', '50mm²', '95mm²', '125A'],
            ['170A — 2000W inverter', '35mm²', '70mm²*', '95mm²*', '200A'],
            ['250A — 3000W inverter', '50mm²*', '95mm²*', '—', '350A'],
          ],
        },
        body: [
          '*At these currents ampacity (heat), not voltage drop, sets the size — keep runs under 1.5m regardless.',
        ],
      },
      {
        heading: 'Two numbers, not one',
        body: [
          'Cable must satisfy two checks. Voltage drop keeps your devices running properly — a fridge that sees 11.2V instead of 12.5V cycles badly and dies early. Ampacity keeps the cable cool enough not to melt its insulation. A cable that passes the drop check on a short run can still be too small for the current.',
          'Rough continuous ampacity for tri-rated copper in a van: 2.5mm² ≈ 20A, 4mm² ≈ 30A, 6mm² ≈ 42A, 10mm² ≈ 55A, 16mm² ≈ 75A, 25mm² ≈ 100A, 35mm² ≈ 135A, 50mm² ≈ 170A, 70mm² ≈ 210A, 95mm² ≈ 250A.',
        ],
      },
      {
        heading: 'Mistakes that show up months later',
        list: [
          'Sizing from the one-way distance — always double it for the return leg',
          'Using the load amps but forgetting the fuse protects the cable, not the device',
          'CCA (copper-clad aluminium) "welding cable" in fine-strand sizes — it carries ~60% of the current of real copper',
          'A fuse fitted far from the battery — anything before the fuse is an unfused short risk; 300mm is the accepted limit',
          'Reusing the same fuse size for every circuit — each branch is sized individually',
        ],
      },
    ],
    faqs: [
      ['What size cable for a 12V fridge in a campervan?', 'A compressor fridge draws around 4A running with higher surge. For a typical 4m run use 2.5–4mm², fused at 10A — and check the drop, not just ampacity.'],
      ['Is 10mm² enough for a campervan main feed?', 'At 60A over a 3m one-way run, 10mm² drops roughly 6% — too much. 25mm² brings it back under 3%. Check your actual current and distance in the calculator.'],
      ['Can I mix cable sizes in one van build?', 'Yes — and you should. The main battery feed is heavy gauge, each branch circuit is sized to its own load and fuse.'],
    ],
    buildIds: ['fridge', 'heater', 'lights'],
    ctaLabel: 'Check your cable sizes live',
  },
  {
    slug: 'leisure-battery-calculator',
    title: 'What Size Leisure Battery Do You Need for a Campervan?',
    metaTitle: 'Leisure Battery Size Calculator — Campervan Ah Explained | VanSpark',
    description: 'Work out exactly what size leisure battery your campervan needs: daily watt-hours to amp-hours, depth of discharge, autonomy, and LiFePO4 vs AGM.',
    intro: 'Battery sizing is a chain of four numbers: what you use in a day, how many days you want off-grid, how much of the battery you are allowed to use, and the voltage. Get the chain right and the answer falls out.',
    sections: [
      {
        heading: 'Step 1 — your daily watt-hours',
        body: [
          'Multiply each appliance\'s watts by the hours it runs, then add them up. A 45W compressor fridge cycling 10 hours is 450Wh. A 35W diesel heater on 4 hours is 140Wh. LED lighting at 12W for 5 hours is 60Wh. A modest weekend build lands around 800–1200Wh per day.',
          'The trap is the fridge: "8 hours" is a guess people get wrong. In a warm van a compressor fridge cycles 30–50% of the time — 10–14h of run time is realistic in summer.',
        ],
      },
      {
        heading: 'Step 2 — convert to amp-hours and multiply by autonomy',
        body: [
          'Divide daily Wh by 12 to get daily Ah, then multiply by the days you want to last without charging: 900Wh/day ÷ 12 = 75Ah × 2 days = 150Ah needed from the bank.',
        ],
      },
      {
        heading: 'Step 3 — divide by usable depth of discharge',
        table: {
          head: ['Chemistry', 'Usable DoD', '150Ah needed means', 'Cycles (roughly)'],
          rows: [
            ['LiFePO4', '80%', '190Ah bank', '3,000–5,000'],
            ['AGM / lead-acid', '50%', '300Ah bank', '400–800'],
          ],
        },
        body: [
          'This is why lithium wins on weight: the same usable capacity needs barely half the rated bank. AGM looks cheaper per Ah until you buy twice as many.',
        ],
      },
      {
        heading: 'Don\'t forget the BMS limit',
        body: [
          'Amp-hours is capacity; the BMS rating is how fast you can draw it. A 100Ah battery with a 100A BMS cannot safely run a 2000W inverter that pulls 170A — either a bigger bank or a high-discharge model is required. Check the inverter card for your DC draw.',
        ],
      },
    ],
    faqs: [
      ['Is 100Ah enough for a campervan?', 'For lights, USB and a coolbox weekend build, yes. Add a compressor fridge and diesel heater and 100Ah lasts about a day — most weekend builds land at 150–250Ah of lithium.'],
      ['LiFePO4 or AGM for a campervan?', 'LiFePO4 for almost everyone: 80% usable depth, a quarter of the weight, 5–10× the cycle life. AGM only makes sense for very occasional use or extreme cold without a heated battery.'],
      ['How many solar watts per 100Ah of lithium?', 'Roughly 100–150W per 100Ah for UK conditions with a 30% real-world derate — more if you stay off-grid through winter.'],
    ],
    buildIds: ['fridge', 'heater', 'lights', 'usb'],
    ctaLabel: 'Size your battery bank live',
  },
  {
    slug: 'what-size-inverter-campervan',
    title: 'What Size Inverter Do You Need for a Campervan?',
    metaTitle: 'What Size Inverter for a Campervan? — Watts, Surge & Cable | VanSpark',
    description: 'How to size a campervan inverter: add your 240V loads, apply the surge margin, then cable and fuse the DC side properly — the part most guides skip.',
    intro: 'Inverter sizing is really three questions: what will you run at once, what is the startup surge, and can your 12V system actually feed it? The third one is where builds go wrong.',
    sections: [
      {
        heading: 'Step 1 — add up what runs at the same time',
        body: [
          'Only count 240V appliances, and only the ones on simultaneously. A 2000W kettle plus an 1800W induction hob used together means a 3800W draw — but if you never run them together, size for the larger single load.',
          'Induction hobs and kettles are the usual drivers. Laptops and TVs barely register.',
        ],
      },
      {
        heading: 'Step 2 — apply the surge margin',
        body: [
          'Size the inverter at ~1.2× your peak simultaneous watts — motors and induction can surge above their rating on startup. 2000W of kettle means a 2400W+ inverter. And always pure sine: modified sine inverters are cheaper but can damage electronics and run motors hot.',
        ],
      },
      {
        heading: 'Step 3 — the DC side is the dangerous side',
        body: [
          'At 12V the current is brutal: a 2000W inverter pulls ~170A continuously, and 3000W wants 250A+ — starter-motor territory. The DC feed needs 50–95mm² cable, an ANL or Class T fuse within 300mm of the battery, and a run kept under 1.5m.',
          'This is also why 3000W at 12V is the practical ceiling — above that, a 24V bank halves the current and the cable size.',
        ],
        table: {
          head: ['Inverter', 'DC draw', 'Cable', 'Fuse'],
          rows: [
            ['1000W', '83A', '25mm²', '125A MEGA'],
            ['1500W', '125A', '35mm²', '175A MEGA'],
            ['2400W', '200A', '70mm²', '250A ANL'],
            ['3000W', '250A', '95mm²', '350A ANL / Class T'],
          ],
        },
      },
      {
        heading: 'Do you even need one?',
        body: [
          'If everything runs on 12V or USB-C — fridge, lights, fans, laptops, Starlink (DC-modded) — an inverter is dead weight that idles power away. The calculator tells you when no AC loads are active.',
        ],
      },
    ],
    faqs: [
      ['Will a 2000W inverter run a kettle?', 'A standard 2000W kettle at full draw leaves no margin — a 2400W+ unit is the comfortable choice. A 1600W travel kettle is the easier fix.'],
      ['What size fuse for a 2000W inverter at 12V?', 'Roughly 200A (load × 1.25) in ANL or MEGA format, within 300mm of the battery — with cable that can carry it.'],
      ['Pure sine or modified sine?', 'Pure sine, always. Modified sine can damage sensitive electronics and makes motors run hot.'],
    ],
    buildIds: ['fridge', 'heater', 'lights', 'kettle', 'induction'],
    ctaLabel: 'Size your inverter + DC feed live',
  },
]
