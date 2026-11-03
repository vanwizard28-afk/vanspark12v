import type { jsPDF } from 'jspdf'
import type { BuildState } from './build-state'
import { INVERTER_RUN_M, voltageDropPct, type SystemSizing } from './electrical'
import { ECOWORTHY_AFFILIATE_URL } from './retail'

const AMBER: [number, number, number] = [217, 119, 6]
const SLATE: [number, number, number] = [71, 85, 105]
const INK: [number, number, number] = [15, 23, 42]

const HEAD = {
  fillColor: [30, 41, 59] as [number, number, number],
  textColor: [226, 232, 240] as [number, number, number],
  fontStyle: 'bold' as const,
  fontSize: 8.5,
}
const TABLE = { fontSize: 8.5, textColor: INK, cellPadding: 2.2 }
const ZEBRA = { fillColor: [248, 250, 252] as [number, number, number] }

const SAFETY_TITLE = 'IMPORTANT — CALCULATED GUIDANCE, NOT AN INSTALLATION DESIGN'
const SAFETY_BODY =
  'This blueprint is generated from the loads, distances and settings you entered. It provides theoretical sizing ' +
  'guidance — cable cross-sections, fuse ratings, battery and solar capacity — calculated to BS EN 1648 / ' +
  'BS 7671 §721-aware rules of thumb. It is not a finished physical installation design. Cable ampacity, fuse ' +
  'selection and all 230V protection depend on real-world conditions — ambient temperature, cable bundling, ' +
  'routing paths and enclosure — that can only be verified on site. A competent person must verify every cable, ' +
  'fuse and protective device against the actual installation before energising, and all 230V work must be ' +
  'installed and tested by a qualified person.'

// Simplified single-line block diagram: charging sources → battery → protected distribution.
function systemDiagram(doc: jsPDF, x: number, y: number, w: number, s: SystemSizing, state: BuildState) {
  const colA = 46
  const colB = 42
  const gap = 10
  const colC = w - colA - colB - gap * 2
  const bh = 13
  const bx = x + colA + gap
  const cx = bx + colB + gap
  const batMid = y + 24

  const box = (bx0: number, by0: number, bw: number, bh0: number, lines: string[]) => {
    doc.setFillColor(248, 250, 252)
    doc.setDrawColor(148, 163, 184)
    doc.setLineWidth(0.3)
    doc.roundedRect(bx0, by0, bw, bh0, 1.5, 1.5, 'FD')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.2)
    doc.setTextColor(...INK)
    const lh = 3.8
    const ty = by0 + bh0 / 2 - ((lines.length - 1) * lh) / 2 + 1.3
    lines.forEach((line, i) => doc.text(line, bx0 + bw / 2, ty + i * lh, { align: 'center' }))
  }
  const wire = (x1: number, y1: number, x2: number, y2: number) => {
    doc.setDrawColor(100, 116, 139)
    doc.setLineWidth(0.5)
    doc.line(x1, y1, x2, y2)
  }

  const sources = [
    [`${s.solarW}W solar array`, `${s.mpptA}A MPPT`],
    ['Starter battery', '30A DC-DC'],
    ['Shore power', '20A charger'],
  ]
  sources.forEach((lines, i) => {
    const by = y + i * (bh + 4.5)
    box(x, by, colA, bh, lines)
    wire(x + colA, by + bh / 2, bx, batMid)
  })

  box(bx, y + 9, colB, 30, ['Leisure battery', `${s.batteryAh}Ah ${state.chemistry}`])
  wire(bx + colB / 2, y + 39, bx + colB / 2, y + 43)
  box(bx, y + 43, colB, 7, ['Negatives via SmartShunt'])

  const consumers = [
    [`${s.mainFuseA}A fuse » isolator`, 'positive busbar'],
    [`Fuse block ${Math.max(6, s.branches.length + 2)}-way`, `${s.branches.length} × 12V circuits`],
    s.inverterSupply
      ? [`${s.inverterSupply.fuseA}A fuse » inverter ${s.inverterW}W`, '230V via RCD']
      : ['(no inverter)', '12V-only build'],
  ]
  consumers.forEach((lines, i) => {
    const by = y + i * (bh + 4.5)
    box(cx, by, colC, bh, lines)
    wire(bx + colB, batMid, cx, by + bh / 2)
  })
}

export async function downloadBlueprint(state: BuildState, s: SystemSizing) {
  const [{ jsPDF }, { autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')])
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const margin = 14
  const contentW = pageW - margin * 2
  let y = 20

  // Header
  doc.setFillColor(9, 13, 19)
  doc.rect(0, 0, pageW, 34, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(17)
  doc.setTextColor(255, 255, 255)
  doc.text('VanSpark 12V Pro', margin, 15)
  doc.setFontSize(10)
  doc.setTextColor(251, 191, 36)
  doc.text('WORKSHOP BUILD BLUEPRINT', margin, 23)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(148, 163, 184)
  const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  doc.text(`Generated ${date} · ${state.season} preset · BS EN 1648 / BS 7671 §721 aware guidance`, margin, 29)

  y = 40
  const need = (h: number) => {
    if (y + h > 279) {
      doc.addPage()
      y = 20
    }
  }
  const section = (title: string) => {
    need(16)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(...AMBER)
    doc.text(title.toUpperCase(), margin, y)
    y += 2.5
  }
  const afterTable = () => {
    y = ((doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? y) + 9
  }

  // Contents strip
  doc.setFontSize(8)
  doc.setTextColor(...SLATE)
  doc.text('Inside this pack: system diagram & summary · equipment list · cable schedule · fuse schedule · installation checklist', margin, y)
  y += 6

  // 0 — Safety & scope notice
  doc.setFontSize(8.5)
  const safetyLines = doc.splitTextToSize(SAFETY_BODY, contentW - 10) as string[]
  const boxH = 8 + safetyLines.length * 3.8 + 4
  need(boxH)
  doc.setFillColor(255, 251, 235)
  doc.setDrawColor(245, 158, 11)
  doc.roundedRect(margin, y, contentW, boxH, 1.5, 1.5, 'FD')
  doc.setFillColor(...AMBER)
  doc.rect(margin, y, 2.5, boxH, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...AMBER)
  doc.text(SAFETY_TITLE, margin + 6, y + 6)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...INK)
  doc.text(safetyLines, margin + 6, y + 11)
  y += boxH + 8

  // 1 — System diagram & summary
  section('1 · System diagram & summary')
  need(58)
  systemDiagram(doc, margin, y, contentW, s, state)
  y += 52
  doc.setFontSize(7.5)
  doc.setTextColor(...SLATE)
  doc.text('Simplified single-line diagram — indicative layout only, not to scale. Route and mount to suit your vehicle.', margin, y)
  y += 5
  doc.text(
    `Basis of calculation: ${state.autonomy} day${state.autonomy > 1 ? 's' : ''} autonomy · ${state.sunHours}h peak sun (${state.season}) · ` +
      `${state.current}A main load · ${state.distance}m main run · ${state.branchRun}m branch runs · ${state.chemistry}`,
    margin,
    y,
  )
  y += 7
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Component', 'Specification']],
    body: [
      ['Daily energy demand', `${s.dailyWh.toFixed(0)} Wh · ${s.dailyAh.toFixed(1)} Ah`],
      ['Battery bank', `${s.batteryAh}Ah ${state.chemistry} · ${state.autonomy} day${state.autonomy > 1 ? 's' : ''} autonomy`],
      ['Solar charging', `${s.solarW}W array · ${s.mpptA}A MPPT · incl. 30% real-world derate`],
      ['Inverter', s.inverterW > 0 ? `${s.inverterW}W pure sine · 20% surge margin` : 'Not required — 12V-only build'],
      ['Main battery feed', `${s.mainCable.size}mm² over ${state.distance}m one-way (${s.mainCable.dropPct.toFixed(1)}% drop, limit 3%) · ${s.mainFuseA}A MEGA fuse`],
      ['DC-DC charging', '30A smart charger, fused at both batteries'],
      ['Shore power', '20A mains charger · RCD-protected hookup'],
    ],
    headStyles: HEAD,
    styles: TABLE,
    alternateRowStyles: ZEBRA,
  })
  afterTable()

  // 2 — Equipment list
  const bomCableRows = Object.entries(s.cableMetres)
    .sort(([a], [b]) => Number(b) - Number(a))
    .map(([g, m]) => [`${g}mm² tri-rated cable`, 'red + black', `${m}m`])
  const fuseSummary = Object.entries(s.bladeFuseCount)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([f, c]) => `${c}× ${f}A`)
    .join(' · ')
  section('2 · Equipment list')
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Item', 'Detail', 'Qty']],
    body: [
      ['Leisure battery', `${state.chemistry} · ${s.batteryAh}Ah min bank`, `${Math.max(1, Math.ceil(s.batteryAh / 100))}× 100Ah`],
      ['Solar panels', 'rigid mono · MC4', `${Math.max(1, Math.ceil(s.solarW / 200))}× 200W`],
      ['MPPT controller', 'SmartSolar class', `1× ${s.mpptA}A`],
      ...(s.inverterW > 0 ? [['Pure sine inverter', '12V continuous', `1× ${s.inverterW}W`]] : []),
      ['DC-DC charger', 'ignition sense', '1× 30A'],
      ['Mains charger', 'shore top-up', '1× 20A'],
      ['Battery monitor', 'SmartShunt in negative', '1'],
      ['Isolator + busbars', 'cut-off + pos/neg pair', '1 set'],
      ['Fuse block', `${s.branches.length} circuits + spares`, `${Math.max(6, s.branches.length + 2)}-way`],
      ...bomCableRows,
      ['MEGA fuse + holder', 'within 300mm of battery +', `1× ${s.mainFuseA}A`],
      ['Tinned copper lugs', `${s.mainCable.size}mm² main run`, '4'],
      ...(fuseSummary ? [['Blade fuses', '1.25× circuit load', fuseSummary]] : []),
      ...(s.inverterW > 0 ? [['AC consumer unit', 'RCD + 2.5mm² 3-core flex', '1']] : []),
    ],
    headStyles: HEAD,
    styles: TABLE,
    alternateRowStyles: ZEBRA,
  })
  afterTable()
  need(9)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...SLATE)
  doc.textWithLink('Shop this kit at our hardware partner: uk.eco-worthy.com', margin, y, { url: ECOWORTHY_AFFILIATE_URL })
  y += 9

  // 3 — Cable schedule
  const cableRows: string[][] = [
    [
      'Battery » isolator » +ve busbar (main feed)',
      `${s.mainCable.size}mm²`,
      `${state.distance}m`,
      `~${Math.ceil(state.distance * 2 * 1.1)}m`,
      `${s.mainCable.dropPct.toFixed(1)}%`,
      `${s.mainFuseA}A MEGA`,
    ],
  ]
  if (s.inverterSupply) {
    const inv = s.inverterSupply
    cableRows.push([
      `Battery » inverter (${s.inverterW}W)`,
      `${inv.cable.size}mm²`,
      `${INVERTER_RUN_M}m`,
      `~${Math.ceil(INVERTER_RUN_M * 2 * 1.1)}m`,
      `${inv.cable.dropPct.toFixed(1)}%`,
      `${inv.fuseA}A ${inv.fuseType}`,
    ])
  }
  for (const b of s.branches) {
    cableRows.push([
      `Fuse block » ${b.name}`,
      `${b.wireMm2}mm²`,
      `${state.branchRun}m`,
      `${b.metres}m`,
      `${voltageDropPct(b.amps, state.branchRun, b.wireMm2).toFixed(1)}%`,
      `${b.fuseA}A blade`,
    ])
  }
  section('3 · Cable schedule')
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Run', 'Cable', 'One-way', 'Pos + neg', 'Drop', 'Protected by']],
    body: cableRows,
    headStyles: HEAD,
    styles: TABLE,
    alternateRowStyles: ZEBRA,
  })
  afterTable()

  // 4 — Fuse schedule
  const fuseRows: string[][] = [
    ['Main feed — within 300mm of battery +', 'MEGA + holder', `${s.mainFuseA}A`, `${s.mainCable.size}mm² main run`],
  ]
  if (s.inverterSupply) {
    fuseRows.push([
      `Inverter feed — within 300mm of battery +`,
      s.inverterSupply.fuseType,
      `${s.inverterSupply.fuseA}A`,
      `${s.inverterSupply.cable.size}mm² inverter run`,
    ])
  }
  for (const b of s.branches) {
    fuseRows.push([`Fuse block — ${b.name}`, 'Blade', `${b.fuseA}A`, `${b.wireMm2}mm² · ${b.amps.toFixed(1)}A load`])
  }
  fuseRows.push(['DC-DC charger — both ends', 'MIDI / MEGA', '40A', 'starter + leisure battery sides'])
  if (s.inverterW > 0) {
    fuseRows.push(['230V consumer unit', '30mA RCD + MCBs', '—', 'specify & test by qualified person'])
  }
  section('4 · Fuse schedule')
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Location / circuit', 'Device', 'Rating', 'Protects']],
    body: fuseRows,
    headStyles: HEAD,
    styles: TABLE,
    alternateRowStyles: ZEBRA,
  })
  afterTable()

  // 5 — Installation checklist
  section('5 · Installation checklist')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...SLATE)
  doc.text('Work through in order. Tick each step only once physically verified — not just planned.', margin, y + 3)
  y += 7
  const phases: { phase: string; steps: string[] }[] = [
    {
      phase: 'Stage 1 — Plan & mount',
      steps: [
        'Confirm final positions for battery, chargers, inverter and fuse block — keep the inverter within 1.5m of the battery',
        `Securely mount the ${s.batteryAh}Ah battery bank in a ventilated compartment`,
        'Mount busbars, master isolator, SmartShunt and fuse block; label every circuit before wiring',
      ],
    },
    {
      phase: 'Stage 2 — Run cable',
      steps: [
        `Run the ${s.mainCable.size}mm² main feed via the isolator — keep positive and negative together`,
        'Run each branch circuit to the cable schedule lengths; support cable roughly every 300mm',
        'Fit grommets where cables pass through metal and conduit in abrasion-prone areas',
        ...(s.inverterSupply
          ? [`Run the ${s.inverterSupply.cable.size}mm² inverter feed — short, direct, and away from signal wiring`]
          : []),
      ],
    },
    {
      phase: 'Stage 3 — Protect & terminate',
      steps: [
        `Fit the ${s.mainFuseA}A MEGA fuse within 300mm of the battery positive terminal`,
        'Fit fuses per the fuse schedule — every cable protected at or below its ampacity',
        'Crimp heavy lugs with a hex/indent tool and seal with adhesive heat-shrink',
        'Connect all negative returns through the SmartShunt — nothing directly to battery negative',
      ],
    },
    {
      phase: 'Stage 4 — Test & energise',
      steps: [
        'Verify polarity on every termination before first power-up',
        'Measure voltage drop at the furthest branch under load — confirm within 3%',
        ...(s.inverterW > 0 ? ['Have all 230V AC work inspected and tested by a qualified person'] : []),
        'Energise via the master isolator; confirm the monitor reads correctly under charge and load',
      ],
    },
  ]
  let step = 0
  for (const { phase, steps } of phases) {
    need(10)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...INK)
    doc.text(phase, margin, y)
    y += 2
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['Done', '#', 'Step']],
      body: steps.map((text) => {
        step += 1
        return ['', String(step).padStart(2, '0'), text]
      }),
      headStyles: HEAD,
      styles: TABLE,
      columnStyles: { 0: { cellWidth: 9 }, 1: { cellWidth: 9 } },
      alternateRowStyles: ZEBRA,
      didDrawCell: (data) => {
        if (data.section === 'body' && data.column.index === 0) {
          doc.setDrawColor(100, 116, 139)
          doc.setLineWidth(0.3)
          doc.rect(data.cell.x + 2.5, data.cell.y + (data.cell.height - 3.2) / 2, 3.2, 3.2)
        }
      },
    })
    afterTable()
    y -= 3
  }

  // Footer on every page
  const pages = doc.getNumberOfPages()
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...SLATE)
    doc.text('VanSpark 12V Pro · Calculated guidance only — verify all protection and 230V work on site with a competent installer.', margin, 290)
    doc.text(`${i} / ${pages}`, pageW - margin, 290, { align: 'right' })
  }

  doc.save(`vanspark-12v-blueprint-${new Date().toISOString().slice(0, 10)}.pdf`)
}
