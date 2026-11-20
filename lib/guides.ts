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
  {
    slug: 'campervan-solar-calculator',
    title: 'How Much Solar Power Does a Campervan Need?',
    metaTitle: 'Campervan Solar Calculator — How Many Watts Do You Need? | VanSpark',
    description: 'Work out how many watts of solar your campervan needs: daily demand, UK peak sun hours by season, the real-world derate, and MPPT sizing.',
    intro: 'Solar sizing is a matching exercise: your panels have to replace, each day, what your appliances took out — in the season you actually travel. UK sun is the awkward part of that equation, so let us start with honest numbers.',
    sections: [
      {
        heading: 'Step 1 — your daily demand sets the target',
        body: [
          'Everything comes back to watt-hours. Add up your loads (watts × hours) to get daily demand — the battery calculator guide covers this in detail. A weekend build lands around 800–1,200Wh/day; a full-time setup with induction cooking can pass 2,000Wh.',
          'Your array only needs to cover demand on the days you are not driving — alternator charging via a DC-DC unit covers transit days, so size solar for the parked-up days.',
        ],
      },
      {
        heading: 'Step 2 — UK peak sun hours, by season',
        table: {
          head: ['Season', 'Peak sun hours', '400W array yields (derated)'],
          rows: [
            ['Summer', '4.8 h', '~1,900 Wh/day'],
            ['Spring / Autumn', '3.2 h', '~1,280 Wh/day'],
            ['Winter', '1.5 h', '~600 Wh/day'],
          ],
        },
        body: [
          'A panel\'s "400W" rating is a laboratory figure. Flat mounting on a roof, UK cloud, heat and dirt cost roughly 30% — the calculator builds that derate in, which is why the yield column above is what you actually get.',
        ],
      },
      {
        heading: 'Step 3 — watts needed = demand ÷ sun hours ÷ 0.7',
        body: [
          'Say you use 1,000Wh/day and travel mostly in spring and autumn: 1,000 ÷ 3.2h ≈ 313W of rated output ÷ 0.7 derate ≈ 450W of panels. Round up to the sizes panels actually come in — two 200–220W rigid panels, or a single 400W+ module.',
          'Winter changes the picture completely: the same 1,000Wh needs ~950W of roof. Most people either accept a battery buffer that alternator driving tops up, or treat deep-winter solar as a bonus rather than the plan.',
        ],
      },
      {
        heading: 'Size the MPPT to the array, not the other way round',
        body: [
          'The MPPT rating is output current into the battery: array watts ÷ ~14V charging voltage. A 450W array needs ~32A — a 40A controller like a Victron 100/30 or Renogy Rover 40 with headroom.',
          'Check the controller\'s input voltage limit too (75V, 100V, 150V) before wiring panels in series — two "12V" panels in series exceed a 75V-unit\'s limit on a cold morning.',
        ],
      },
      {
        heading: 'Rigid or flexible panels?',
        list: [
          'Rigid mono — cheaper per watt, runs cooler, outlasts the van; needs roof rack or Z-brackets',
          'Flexible — low profile and light, but runs hot (less output), and many fail within a few UK summers',
          'Portable/suitcase — no roof holes, angle it at the sun, but it lives in your living space and can walk off a campsite',
        ],
      },
    ],
    faqs: [
      ['Is 200W of solar enough for a campervan?', 'For a weekend build with a fridge, lights and USB in summer, usually yes. For a compressor fridge plus heater in spring/autumn, 300–450W is the comfortable range.'],
      ['How many watts of solar per 100Ah of lithium?', 'A handy UK rule is 100–150W per 100Ah LiFePO4 for three-season use — double it if you genuinely camp off-grid through winter.'],
      ['Can solar fully replace a DC-DC charger?', 'Not reliably in the UK. Winter peak sun is ~1.5h/day, so even a large array yields little. Solar and a 30A DC-DC cover each other\'s weak days — that is why the calculator sizes both.'],
    ],
    buildIds: ['fridge', 'heater', 'lights', 'usb', 'fan'],
    ctaLabel: 'Size your solar array live',
  },
  {
    slug: 'campervan-wiring-diagram',
    title: 'Campervan Electrical Wiring Diagram: How a 12V System Fits Together',
    metaTitle: 'Campervan Wiring Diagram (12V) — Every Part Explained | VanSpark',
    description: 'A clear campervan 12V wiring diagram explained: battery at the centre, solar, DC-DC and shore charging in, fuse board and inverter out — and where every fuse goes.',
    intro: 'Most van wiring diagrams look like spaghetti because they show every circuit at once. Strip it back and every 12V system is the same shape: energy goes into a battery through three charging paths, and comes out through protected circuits. Understand that skeleton and the detail fills itself in.',
    sections: [
      {
        heading: 'The skeleton every diagram shares',
        body: [
          'Battery bank sits at the centre. On the input side: solar via an MPPT controller, the starter battery via a DC-DC charger, and shore power via a mains charger. On the output side: a fused distribution board for 12V branches, and optionally an inverter for 240V sockets.',
          'All heavy connections meet on busbars — a positive and a negative — rather than stacking rings on the battery terminals. The negative side carries the battery monitor shunt: everything returns through it so the monitor sees the whole picture.',
        ],
      },
      {
        heading: 'Where every fuse goes (the part that matters for safety)',
        list: [
          'Main fuse — within 300mm of battery positive, protecting the main feed to the busbar',
          'Solar MPPT — fused on the battery side; panel side only needs a breaker if you want an isolator',
          'DC-DC charger — fused at BOTH ends: starter battery end and leisure battery end',
          'Inverter — ANL or Class T within 300mm of the battery, sized to the cable',
          'Each branch circuit — a blade fuse at the board, sized to 1.25× the circuit load',
        ],
        body: [
          'The rule: a fuse protects the cable downstream of it, not the appliance. Any length of cable between a battery and its fuse is a potential unfused short — that is why the 300mm rule exists.',
        ],
      },
      {
        heading: 'Cable runs: plan the van before the diagram',
        body: [
          'Battery, charger and inverter sit close together — every metre of heavy cable costs money and voltage drop. The inverter feed especially should stay under 1.5m. Branch circuits radiate out to lights, pump, fridge and sockets through the fuse board.',
          'Keep DC cable pairs together (positive and negative side by side reduces interference), protect runs through metalwork with grommets, and leave the battery monitor shunt as the single path for all negatives back to the battery.',
        ],
      },
      {
        heading: 'Reading a single-line diagram',
        body: [
          'The live schematic above this guide draws your system as a single line: generation left, battery centre, loads right, with cable size and fuse rating labelled on each run. Click any marked component for a terminal-by-terminal wiring view — it is generated from your actual load list, not a stock image.',
          'A drawn-from-your-numbers diagram beats a generic one because fuse ratings and cable gauges shift with your inverter size and run lengths — the difference between a plan and a fire risk.',
        ],
      },
    ],
    faqs: [
      ['Where does the main fuse go in a campervan?', 'Within 300mm of the leisure battery positive terminal, rated above your maximum continuous draw but below the main cable\'s ampacity — typically a MEGA fuse.'],
      ['Do I need busbars in a campervan electrical system?', 'Not strictly, but strongly recommended once you have more than two connections per terminal — they keep heavy joints clean, serviceable and mechanically sound.'],
      ['Can I wire a campervan electrical system myself?', 'The 12V DC side is a well-trodden DIY path if you size cables and fuses correctly — that is exactly what the calculator produces. The 240V hookup side should be installed or at least inspected by a qualified person.'],
    ],
    buildIds: ['fridge', 'heater', 'lights', 'usb', 'pump', 'laptop'],
    ctaLabel: 'Generate your own wiring diagram',
  },
  {
    slug: 'campervan-electrical-system-cost',
    title: 'How Much Does a Campervan Electrical System Cost in the UK?',
    metaTitle: 'Campervan Electrical System Cost (UK) — Budget to Pro | VanSpark',
    description: 'What a campervan 12V electrical system really costs in the UK: budget, mid-range and premium breakdowns by component, plus where to save and where never to.',
    intro: 'Ask ten van builders what their electrics cost and you will get answers from £400 to £4,000 — all true, for different systems. The honest way to estimate is per component, and one component dominates everything: the battery.',
    sections: [
      {
        heading: 'The three honest price bands',
        table: {
          head: ['Component', 'Budget (Eco-Worthy/generic)', 'Mid (Renogy)', 'Premium (Victron/Fogstar)'],
          rows: [
            ['Battery, 100Ah LiFePO4', '£160–300', '£200–380', '£250–450'],
            ['Solar panel, ~200W', '£65–110', '£90–160', '£110–190'],
            ['MPPT controller', '£30–70', '£45–90', '£60–140'],
            ['DC-DC charger, 30A', '£65–130', '£90–160', '£130–230'],
            ['Inverter, 2000W', '£140–320', '£240–500', '£400–700'],
            ['Monitor/shunt', '£25–55', '£50–90', '£90–130'],
            ['Cable, fuses, lugs, board', '£150–300', '£200–350', '£250–400'],
          ],
        },
        body: [
          'A typical fridge-and-heater weekend build lands roughly £600–900 budget, £1,000–1,600 mid-range, or £1,800–3,000 premium. Add an inverter and the high-current cabling it needs and each band steps up a bracket.',
        ],
      },
      {
        heading: 'The battery is half the decision',
        body: [
          'Battery capacity is the single biggest line item, so oversizing is expensive. A bank sized to your real daily Wh — rather than "the biggest that fits" — is often the difference between a £700 and a £1,200 build.',
          'This is where the calculator pays for itself several times over: size the bank first, then shop. Heater-equipped lithium (Fogstar Drift class) is worth the premium only if you genuinely camp below freezing — LiFePO4 cannot accept charge under 0°C without it.',
        ],
      },
      {
        heading: 'Where to save — and where never to',
        list: [
          'Save on: the inverter brand (a budget pure-sine unit works fine for occasional kettles)',
          'Save on: the monitor (a £30 shunt display tells you 90% of what a SmartShunt does)',
          'Never save on: cable gauge, fuses and terminations — undersized protection is how vans burn',
          'Never save on: the DC-DC charger on a Euro 6 van — a £20 split-charge relay will simply not charge properly',
        ],
      },
      {
        heading: 'The hidden line items people forget',
        body: [
          'Busbar pairs, an isolator switch, the blade fuse board, roof entry glands, heat-shrink, crimp lugs and a proper crimper add £100–200 that never appears in "cost of a leisure battery" posts. The bill of materials in the calculator itemises these so the number you see is the number you will actually spend.',
        ],
      },
    ],
    faqs: [
      ['What is the cheapest campervan electrical setup?', 'A single 100Ah LiFePO4, one 100–200W panel, a basic MPPT and a fuse board covers lights, USB and a coolbox for roughly £400–550 — skip the inverter entirely and run everything on 12V/USB-C.'],
      ['Is lithium worth the extra cost for a campervan?', 'Almost always yes now: 80% usable capacity vs 50% for AGM, a quarter of the weight, and 5–10× the cycle life means cost per usable cycle is lower despite the higher sticker price.'],
      ['How much does professional installation add?', 'A full professional install typically doubles parts cost — £1,500–3,000 labour depending on complexity. DIY the 12V side is very achievable with a proper wiring plan; have the 240V hookup checked regardless.'],
    ],
    buildIds: ['fridge', 'heater', 'lights', 'usb'],
    ctaLabel: 'Price your exact build live',
  },
  {
    slug: 'dc-dc-charger-vs-split-charge',
    title: 'DC-DC Charger vs Split Charge Relay: What Your Van Actually Needs',
    metaTitle: 'DC-DC Charger vs Split Charge Relay — Campervan Guide | VanSpark',
    description: 'Split charge relay or DC-DC (battery-to-battery) charger? Why smart alternators changed the answer, what amp rating to pick, and how to fuse both ends.',
    intro: 'Charging a leisure battery from the engine used to be a £20 relay and a thick wire. Euro 6 smart alternators changed that — and it is now the single most common reason a new van build "mysteriously" never charges while driving.',
    sections: [
      {
        heading: 'What each device actually does',
        body: [
          'A split charge relay (VSR) simply connects the two batteries once the starter is above ~13.3V — the batteries equalise, sharing whatever voltage the alternator happens to output.',
          'A DC-DC charger is an active charger: it takes whatever the alternator gives it and delivers a proper multi-stage charging profile at the right voltage for your battery chemistry — including the ~14.4–14.6V LiFePO4 wants.',
        ],
      },
      {
        heading: 'The Euro 6 problem',
        body: [
          'Smart alternators on Euro 6 / BlueMotion vehicles deliberately drop output once the starter battery is charged — sometimes to 12.4V or lower. A relay then connects your leisure battery to a voltage too low to charge it, and a lithium bank barely accepts anything below ~13.6V anyway.',
          'On an older alternator a VSR half-works — AGM will accept a decent charge. On any modern van, or with lithium at any age, a DC-DC with ignition/D+ sensing is effectively mandatory.',
        ],
      },
      {
        heading: 'What amp rating do you need?',
        table: {
          head: ['Charger rating', 'Charge rate', 'Good for'],
          rows: [
            ['18–20A', '~250Wh per hour of driving', 'Weekend builds, small banks, standard alternators'],
            ['30A', '~360Wh per hour of driving', 'The sweet spot for most vans and 150–300Ah banks'],
            ['50A+', '~600Wh per hour of driving', 'Large banks, heavy use — check your alternator can spare it'],
          ],
        },
        body: [
          'Do not oversize: a 50A charger pulls real load from the alternator. Most manufacturers suggest keeping DC-DC draw under ~40% of alternator rating — 30A is the default answer for a reason.',
        ],
      },
      {
        heading: 'Fusing it properly — both ends',
        body: [
          'A DC-DC charger sits between two batteries, so both cable ends need protection within 300mm of each positive terminal: a 30A charger typically gets 40A fuses. The cable is sized for the full round trip just like any other run.',
          'Popular picks: Victron Orion-Tr Smart (ignition detection built in) at the premium end, Renogy DCC30S mid-range — the DCC30S also takes a solar input, which can simplify wiring on tight builds.',
        ],
      },
    ],
    faqs: [
      ['Do I need a DC-DC charger with a smart alternator?', 'Yes — a basic split-charge relay on a Euro 6 van undercharges the leisure bank because the alternator drops its output early. Use a DC-DC with ignition or D+ sensing.'],
      ['Can a DC-DC charge lithium and AGM batteries?', 'Yes — that is the point of it. Set the profile to match your chemistry; LiFePO4 typically wants ~14.4V absorption with little or no float.'],
      ['Is a 30A DC-DC charger enough?', 'For most weekend and week-a-way builds, yes — an hour of driving returns ~360Wh, roughly a day of fridge use. Only constant full-timers with big banks need 50A.'],
    ],
    buildIds: ['fridge', 'heater', 'lights', 'usb'],
    ctaLabel: 'Check your charging setup live',
  },
]
