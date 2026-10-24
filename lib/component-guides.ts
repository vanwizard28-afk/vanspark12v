// Terminal-level hookup guides for the interactive schematic.
// Each guide draws the physical unit and walks a first-time builder
// through exactly which wire lands on which terminal.

export type Terminal = {
  label: string   // printed on the diagram, e.g. 'PV +'
  side: 'left' | 'right' | 'top'
  color: string   // pip colour — amber positive, slate negative, emerald AC, cyan signal
  wire: string    // what connects here
}

export type GuideStep = { title: string; detail: string }

export type ComponentGuide = {
  id: string
  name: string
  tag: string
  blurb: string
  terminals: Terminal[]
  steps: GuideStep[]
  safety: string
}

const POS = '#fbbf24'
const NEG = '#64748b'
const AC = '#34d399'
const SIG = '#22d3ee'

export const COMPONENT_GUIDES: Record<string, ComponentGuide> = {
  solar: {
    id: 'solar',
    name: 'Solar Array',
    tag: 'ROOF GENERATION',
    blurb: 'Rigid mono panels wired to a roof gland. MC4 connectors are touch-safe and polarised — check before plugging in.',
    terminals: [
      { label: 'PV +', side: 'left', color: POS, wire: 'MC4 red lead → PV in on MPPT' },
      { label: 'PV −', side: 'left', color: NEG, wire: 'MC4 black lead → PV in on MPPT' },
      { label: 'GLAND', side: 'right', color: SIG, wire: 'IP68 roof entry — seal both cores' },
    ],
    steps: [
      { title: 'Mount and gland', detail: 'Feed both MC4 leads through an IP68 roof gland sealed with Sikaflex 252 — never through a bare hole.' },
      { title: 'Series vs parallel', detail: 'Two 200W panels in series give ~40V into the MPPT (better in shade/low light); parallel keeps 20V but doubles current.' },
      { title: 'Check polarity', detail: 'Multimeter the leads before connecting — reversed PV can kill the controller instantly.' },
      { title: 'Fuse the feed', detail: 'Fit a 15A inline fuse or DC breaker on PV+ before the MPPT.' },
    ],
    safety: 'Cover the panels while wiring — they generate as soon as light hits them.',
  },
  mppt: {
    id: 'mppt',
    name: 'MPPT Solar Controller',
    tag: 'CHARGING',
    blurb: 'Victron SmartSolar class. Critically: the battery side must be connected before the panels, so the controller can detect system voltage.',
    terminals: [
      { label: 'PV +', side: 'left', color: POS, wire: 'From solar array positive' },
      { label: 'PV −', side: 'left', color: NEG, wire: 'From solar array negative' },
      { label: 'BAT +', side: 'right', color: POS, wire: '6–10mm² → + busbar via fuse' },
      { label: 'BAT −', side: 'right', color: NEG, wire: '6–10mm² → − busbar' },
      { label: 'SYNC', side: 'top', color: SIG, wire: 'Bluetooth / VE.Direct app setup' },
    ],
    steps: [
      { title: 'Battery first — always', detail: 'Wire BAT+ and BAT− to the busbars before anything touches the PV side. The MPPT must see 12V to configure itself.' },
      { title: 'Fuse the output', detail: 'Fit a fuse on BAT+ ≤300mm from the busbar — roughly 1.25× the controller rating.' },
      { title: 'Then connect PV', detail: 'Land PV+ and PV−. The unit wakes, runs a sweep and starts charging.' },
      { title: 'Set the profile', detail: 'In VictronConnect (or the vendor app), select the battery chemistry — LiFePO4 and AGM charge at different voltages.' },
    ],
    safety: 'PV before battery is the classic way to destroy an MPPT on day one.',
  },
  dcdc: {
    id: 'dcdc',
    name: 'DC-DC Charger',
    tag: 'ALTERNATOR CHARGING',
    blurb: 'Victron Orion-Tr Smart class. Takes the smart alternator output and delivers a proper multi-stage charge to the leisure bank while driving.',
    terminals: [
      { label: 'IN +', side: 'left', color: POS, wire: '16mm² from starter battery + · fused ≤300mm' },
      { label: 'IN −', side: 'left', color: NEG, wire: '16mm² to chassis earth / starter −' },
      { label: 'OUT +', side: 'right', color: POS, wire: '16mm² → + busbar via 60A fuse' },
      { label: 'OUT −', side: 'right', color: NEG, wire: '16mm² → − busbar' },
      { label: 'REM', side: 'top', color: SIG, wire: 'Ignition-switched +12V trigger' },
    ],
    steps: [
      { title: 'Starter feed', detail: 'Run 16mm² from the starter battery + to IN+. Fuse it at the starter end — this cable passes through the vehicle bulkhead.' },
      { title: 'Input earth', detail: 'IN− goes to a clean chassis earth point or back to the starter negative. Sand the paint, use a star washer, protect with wax.' },
      { title: 'Output to busbar', detail: 'OUT+ lands on the + busbar through a 60A fuse; OUT− goes to the − busbar.' },
      { title: 'Remote trigger', detail: 'Feed REM from an ignition-switched supply so it only charges with the engine running. No ignition feed available? Bridge REM to IN+ or use engine-shutdown detection in the app.' },
    ],
    safety: 'On Euro 6 smart alternators a plain split-charge relay will not work — DC-DC is the correct approach.',
  },
  mains: {
    id: 'mains',
    name: 'Mains / Shore Charger',
    tag: '230V HOOKUP',
    blurb: 'Takes campsite hookup power and tops up the leisure bank. The AC side is a 230V circuit — treat it like household wiring.',
    terminals: [
      { label: 'L', side: 'left', color: AC, wire: 'Live from consumer unit' },
      { label: 'N', side: 'left', color: AC, wire: 'Neutral from consumer unit' },
      { label: '⏚', side: 'left', color: AC, wire: 'Earth bond' },
      { label: 'DC +', side: 'right', color: POS, wire: '6mm² → + busbar via fuse' },
      { label: 'DC −', side: 'right', color: NEG, wire: '6mm² → − busbar' },
    ],
    steps: [
      { title: '230V in via RCD', detail: 'The hookup inlet feeds the consumer unit first — the charger takes its L/N/E from there, behind the RCD. Never wire it straight off the inlet.' },
      { title: 'DC side', detail: 'DC+ to the + busbar via a fuse near the busbar; DC− to the − busbar.' },
      { title: 'Charge profile', detail: 'Set LiFePO4 or AGM before first use — wrong float voltages shorten battery life.' },
    ],
    safety: 'Anything carrying 230V should be installed or checked by a qualified person.',
  },
  battery: {
    id: 'battery',
    name: 'Leisure Battery Bank',
    tag: 'ENERGY STORE',
    blurb: 'The heart of the system. Everything positive leaves through the fuse and isolator; every negative returns through the SmartShunt.',
    terminals: [
      { label: 'BAT +', side: 'right', color: POS, wire: 'Main feed → MEGA fuse → isolator → + bus' },
      { label: 'BAT −', side: 'left', color: NEG, wire: 'To SmartShunt ONLY — nothing else lands here' },
      { label: 'BMS', side: 'top', color: SIG, wire: 'Internal — respect the amp limit' },
    ],
    steps: [
      { title: 'Fuse first', detail: 'The MEGA fuse sits ≤300mm from BAT+ before any other connection — it protects the cable, which is what catches fire.' },
      { title: 'Then the isolator', detail: 'Fuse → master isolator → + busbar, so the whole system can be killed in one action.' },
      { title: 'All negatives via the shunt', detail: 'BAT− connects to the SmartShunt battery side only. Every other negative in the van goes to the − busbar.' },
      { title: 'Paralleling', detail: 'Two batteries? Identical cable lengths, take pos from one end of the bank and neg from the other (diagonal). Check the BMS discharge limit covers your biggest load.' },
    ],
    safety: 'A LiFePO4 bank can push thousands of amps into a short — every cable leaving it must be fused.',
  },
  shunt: {
    id: 'shunt',
    name: 'Battery Monitor Shunt',
    tag: 'MONITORING',
    blurb: 'Measures every amp in and out so the fuel gauge is honest. Has exactly two load-carrying sides — getting them wrong makes readings meaningless.',
    terminals: [
      { label: 'BAT −', side: 'left', color: NEG, wire: 'Marked side → battery negative only' },
      { label: 'SYS −', side: 'right', color: NEG, wire: 'All other negatives → − busbar' },
      { label: 'AUX', side: 'top', color: SIG, wire: 'Temp probe / midpoint monitoring' },
    ],
    steps: [
      { title: 'Orientation matters', detail: 'The terminal marked "to battery minus" bolts to BAT−. The other side goes to the − busbar.' },
      { title: 'Nothing bypasses it', detail: 'If any negative cable touches the battery directly, those amps become invisible to the monitor.' },
      { title: 'Configure capacity', detail: 'Enter the bank Ah and chemistry in the app, then synchronise to 100% after a full charge.' },
    ],
    safety: 'The shunt carries full system current — use the same heavy gauge as the main feed.',
  },
  fuseblock: {
    id: 'fuseblock',
    name: 'Blade Fuse Block',
    tag: '12V DISTRIBUTION',
    blurb: 'Distributes the + bus to individual branch circuits. Each output takes a blade fuse sized to the circuit.',
    terminals: [
      { label: 'FEED +', side: 'left', color: POS, wire: '4–6mm² from + busbar' },
      { label: 'COM −', side: 'left', color: NEG, wire: 'Common negative bar → − busbar' },
      { label: 'OUT 1–6', side: 'right', color: POS, wire: 'Branch + to each appliance' },
    ],
    steps: [
      { title: 'Feed it', detail: '4–6mm² from the + busbar through a master fuse — the branch schedule lists the rating per circuit.' },
      { title: 'Branch positives', detail: 'Each appliance + lands on its own fused output. Red cable, labelled both ends.' },
      { title: 'Fuse per circuit', detail: 'Blade fuse = 1.25× the appliance draw, rounded up to a standard size — never higher than the cable can carry.' },
      { title: 'Negatives return', detail: 'Branch negatives come back to the common − bar or straight to the − busbar.' },
    ],
    safety: 'A fuse protects the cable. If the fuse is bigger than the wire can carry, the wire is the fuse.',
  },
  inverter: {
    id: 'inverter',
    name: 'Pure Sine Inverter',
    tag: '240V OUTPUT',
    blurb: 'Turns 12V DC into 230V AC. The DC side draws enormous current — this feed is sized like a starter motor circuit, not a household appliance.',
    terminals: [
      { label: 'DC +', side: 'left', color: POS, wire: 'Heavy cable → fuse ≤300mm → + bus' },
      { label: 'DC −', side: 'left', color: NEG, wire: 'Same gauge → − busbar' },
      { label: 'AC OUT', side: 'right', color: AC, wire: '2.5mm² 3-core → consumer unit only' },
      { label: '⏚', side: 'right', color: AC, wire: 'Chassis earth stud → van body' },
      { label: 'REM', side: 'top', color: SIG, wire: 'Remote switch / panel' },
    ],
    steps: [
      { title: 'Heavy DC feed', detail: 'Use the cable size shown on your inverter card — typically 35–95mm². Both legs the same gauge, crimped tinned lugs, kept ≤1.5m.' },
      { title: 'Fuse at the source', detail: 'ANL or Class T fuse within 300mm of the battery/busbar, matched to the card rating — e.g. 250A for a 2400W unit.' },
      { title: 'AC output', detail: 'Output goes ONLY to the consumer unit with RCD protection — never straight into a socket strip.' },
      { title: 'Earth and remote', detail: 'Bond the chassis stud to the van body. Wire the remote switch to a convenient dash/panel position.' },
    ],
    safety: 'A 2000W inverter draws ~170A continuously. Undersized cable or a skipped fuse is a fire risk — this is the most dangerous connection in the build.',
  },
  consumer: {
    id: 'consumer',
    name: 'AC Consumer Unit',
    tag: '230V PROTECTION',
    blurb: 'Small garage-style unit with an RCD and breakers between the inverter and your sockets — same job as a house fusebox.',
    terminals: [
      { label: 'IN L/N/E', side: 'left', color: AC, wire: 'From inverter AC out' },
      { label: 'RCD', side: 'top', color: AC, wire: '30mA residual-current device' },
      { label: 'OUT', side: 'right', color: AC, wire: 'To socket circuit(s) · 2.5mm² flex' },
    ],
    steps: [
      { title: 'Feed from inverter', detail: 'Inverter AC out lands on the unit incomer in 2.5mm² 3-core flex.' },
      { title: 'RCD first', detail: 'Everything downstream of the incomer sits behind the 30mA RCD — it is what protects people from shock.' },
      { title: 'Socket circuits', detail: 'Each socket radial gets its own breaker, 16A typical. Label every circuit.' },
    ],
    safety: 'Have the 230V installation inspected and tested by a qualified person before first use.',
  },
  megafuse: {
    id: 'megafuse',
    name: 'MEGA / ANL Fuse',
    tag: 'MAIN PROTECTION',
    blurb: 'The sacrificial link that stops a dead short becoming a fire. Bolted into the main positive feed within 300mm of the battery.',
    terminals: [
      { label: 'IN', side: 'left', color: POS, wire: 'Straight from battery +' },
      { label: 'OUT', side: 'right', color: POS, wire: 'To isolator / + busbar' },
    ],
    steps: [
      { title: 'Position', detail: 'Within 300mm of the battery + terminal — any further and the cable between is unprotected.' },
      { title: 'Rating', detail: 'Size to protect the cable, not the load. The BOM lists the rating for your main feed.' },
      { title: 'Torque it', detail: 'Bolts must be tight — a loose stud is a hot stud. Carry spares.' },
    ],
    safety: 'Never replace a blown main fuse with a bigger one — find out why it blew first.',
  },
}
