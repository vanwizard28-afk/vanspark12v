import type { BuildState } from './build-state'
import type { SystemSizing } from './electrical'

const AMBER: [number, number, number] = [217, 119, 6]
const SLATE: [number, number, number] = [71, 85, 105]
const INK: [number, number, number] = [15, 23, 42]

const CHECKLIST = [
  'Main fuse fitted within 300mm of the battery positive terminal',
  'Every cable protected by a fuse rated at or below its ampacity',
  'All negative returns pass through the SmartShunt — nothing connects directly to battery negative',
  'Positive and negative runs kept together throughout the vehicle',
  'Heavy lugs crimped with a hex/indent tool and sealed with adhesive heat-shrink',
  'All 230V AC work installed and tested by a qualified person',
  'Master isolator accessible, labelled, and checked before energising',
  'Polarity verified on every termination before first power-up',
]

export async function downloadBlueprint(state: BuildState, s: SystemSizing) {
  const [{ jsPDF }, { autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')])
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const margin = 14
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
  doc.text('BUILD BLUEPRINT', margin, 23)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(148, 163, 184)
  const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  doc.text(`Generated ${date} · ${state.season} preset · BS EN 1648 / BS 7671 §721 aware guidance`, margin, 29)

  y = 44
  const section = (title: string) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(...AMBER)
    doc.text(title.toUpperCase(), margin, y)
    y += 2.5
  }
  const afterTable = () => {
    y = ((doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? y) + 9
  }
  const head = { fillColor: [30, 41, 59] as [number, number, number], textColor: [226, 232, 240] as [number, number, number], fontStyle: 'bold' as const, fontSize: 8.5 }
  const tableStyle = { fontSize: 8.5, textColor: INK, cellPadding: 2.2 }

  // 1 — System summary
  section('System summary')
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
    headStyles: head,
    styles: tableStyle,
    alternateRowStyles: { fillColor: [248, 250, 252] },
  })
  afterTable()

  // 2 — Branch circuit schedule
  if (s.branches.length > 0) {
    section(`Branch circuit schedule (${s.branches.length} circuits · ${state.branchRun}m typical run)`)
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['Circuit', 'Load', 'Wire', 'Fuse', 'Cable req.']],
      body: s.branches.map((b) => [b.name, `${b.amps.toFixed(1)}A`, `${b.wireMm2}mm²`, `${b.fuseA}A blade`, `${b.metres}m`]),
      headStyles: head,
      styles: tableStyle,
      alternateRowStyles: { fillColor: [248, 250, 252] },
    })
    afterTable()
  }

  // 3 — Bill of materials
  const cableRows = Object.entries(s.cableMetres)
    .sort(([a], [b]) => Number(b) - Number(a))
    .map(([g, m]) => [`${g}mm² tri-rated cable`, 'red + black', `${m}m`])
  const fuseSummary = Object.entries(s.bladeFuseCount)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([f, c]) => `${c}× ${f}A`)
    .join(' · ')
  section('Bill of materials')
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Item', 'Detail', 'Qty']],
    body: [
      ['Leisure battery', `${state.chemistry} · ≥${s.batteryAh}Ah bank`, `${Math.max(1, Math.ceil(s.batteryAh / 100))}× 100Ah`],
      ['Solar panels', 'rigid mono · MC4', `${Math.max(1, Math.ceil(s.solarW / 200))}× 200W`],
      ['MPPT controller', 'SmartSolar class', `1× ${s.mpptA}A`],
      ...(s.inverterW > 0 ? [['Pure sine inverter', '12V continuous', `1× ${s.inverterW}W`]] : []),
      ['DC-DC charger', 'ignition sense', '1× 30A'],
      ['Mains charger', 'shore top-up', '1× 20A'],
      ['Battery monitor', 'SmartShunt in negative', '1'],
      ['Isolator + busbars', 'cut-off + pos/neg pair', '1 set'],
      ['Fuse block', `${s.branches.length} circuits + spares`, `${Math.max(6, s.branches.length + 2)}-way`],
      ...cableRows,
      ['MEGA fuse + holder', '≤300mm from battery +', `1× ${s.mainFuseA}A`],
      ['Tinned copper lugs', `${s.mainCable.size}mm² main run`, '4'],
      ...(fuseSummary ? [['Blade fuses', '1.25× circuit load', fuseSummary]] : []),
      ...(s.inverterW > 0 ? [['AC consumer unit', 'RCD + 2.5mm² 3-core flex', '1']] : []),
    ],
    headStyles: head,
    styles: tableStyle,
    alternateRowStyles: { fillColor: [248, 250, 252] },
  })
  afterTable()

  // 4 — Compliance checklist
  section('Pre-energise checklist (BS EN 1648 / BS 7671 §721 aware)')
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['#', 'Check']],
    body: CHECKLIST.map((c, i) => [String(i + 1).padStart(2, '0'), c]),
    headStyles: head,
    styles: tableStyle,
    columnStyles: { 0: { cellWidth: 10 } },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  })

  // Footer on every page
  const pages = doc.getNumberOfPages()
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...SLATE)
    doc.text('VanSpark 12V Pro · Guidance only — always verify with a qualified installer.', margin, 290)
    doc.text(`${i} / ${pages}`, pageW - margin, 290, { align: 'right' })
  }

  doc.save(`vanspark-12v-blueprint-${new Date().toISOString().slice(0, 10)}.pdf`)
}
