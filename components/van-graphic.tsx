const CYAN = '#22d3ee'
const CYAN_DIM = 'rgba(34,211,238,0.55)'
const CYAN_FAINT = 'rgba(34,211,238,0.28)'
const LINE = 'rgba(226,232,240,0.85)'
const FAINT = 'rgba(148,163,184,0.35)'
const AMBER = '#fbbf24'
const AMBER_DIM = 'rgba(251,191,36,0.55)'
const MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace'

function Leader({ x1, y1, x2, y2, label, labelX, labelY, anchor = 'start' }: { x1: number; y1: number; x2: number; y2: number; label: string; labelX: number; labelY: number; anchor?: 'start' | 'end' }) {
  return (
    <g>
      <line x1={labelX} y1={labelY - 3} x2={x1} y2={y1} stroke={AMBER_DIM} strokeWidth={0.8} strokeDasharray="3 2" />
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={AMBER_DIM} strokeWidth={0.8} />
      <circle cx={x2} cy={y2} r={2.4} fill="#090d13" stroke={AMBER} strokeWidth={1.2} />
      <text x={labelX} y={labelY} textAnchor={anchor} fontSize={9.5} fontWeight={700} fill={AMBER} fontFamily={MONO}>{label}</text>
    </g>
  )
}

export default function VanGraphic({ batteryAh, solarW, inverterW }: { batteryAh: number; solarW: number; inverterW: number }) {
  return (
    <svg viewBox="0 0 560 340" className="h-auto w-full" role="img" aria-label="Technical blueprint drawing of a camper van">
      <defs>
        <pattern id="bpMinor" width="18" height="18" patternUnits="userSpaceOnUse">
          <path d="M18 0H0V18" fill="none" stroke="rgba(56,189,248,0.05)" strokeWidth={0.5} />
        </pattern>
        <pattern id="bpMajor" width="90" height="90" patternUnits="userSpaceOnUse">
          <path d="M90 0H0V90" fill="none" stroke="rgba(56,189,248,0.10)" strokeWidth={0.5} />
        </pattern>
      </defs>

      {/* blueprint grid */}
      <rect width="560" height="340" fill="url(#bpMinor)" />
      <rect width="560" height="340" fill="url(#bpMajor)" />
      <rect x="0.5" y="0.5" width="559" height="339" fill="none" stroke={CYAN_FAINT} strokeWidth={1} />

      {/* title block */}
      <g fontFamily={MONO} fontSize={8} fill={FAINT}>
        <text x="16" y="22">DWG NO. VS-12V-001</text>
        <text x="16" y="34">SCALE 1:25</text>
        <text x="16" y="46">SHEET A1 · REV C</text>
        <text x="544" y="22" textAnchor="end" fill={CYAN_DIM}>VANSPARK TECHNICAL</text>
        <text x="544" y="34" textAnchor="end">MWB H2 · SIDE ELEVATION</text>
      </g>

      {/* ── solar array on roof ─────────────────────────── */}
      <line x1="144" y1="102" x2="408" y2="102" stroke={FAINT} strokeWidth={1} />
      {[150, 236, 322].map((x) => (
        <g key={x}>
          <rect x={x} y={82} width={80} height={16} fill="rgba(34,211,238,0.05)" stroke={AMBER_DIM} strokeWidth={1} />
          <line x1={x + 26.7} y1={82} x2={x + 26.7} y2={98} stroke={CYAN_FAINT} strokeWidth={0.7} />
          <line x1={x + 53.3} y1={82} x2={x + 53.3} y2={98} stroke={CYAN_FAINT} strokeWidth={0.7} />
          <line x1={x} y1={90} x2={x + 80} y2={90} stroke={CYAN_FAINT} strokeWidth={0.7} />
        </g>
      ))}
      {/* roof vent */}
      <rect x="98" y="96" width="26" height="9" fill="none" stroke={FAINT} strokeWidth={1} />

      {/* ── van body (Sprinter-style silhouette) ─────────── */}
      <path
        d="M70 240 L70 118 L80 110 L398 110 L452 168 L486 176 L494 182 L494 232 L486 240 L454 240 A34 34 0 0 0 386 240 L179 240 A32 32 0 0 0 111 240 Z"
        fill="rgba(9,13,19,0.55)"
        stroke={LINE}
        strokeWidth={1.6}
      />

      {/* glazing — crisp technical panes */}
      <polygon points="398,118 444,162 424,162 398,124" fill="rgba(34,211,238,0.07)" stroke={CYAN_DIM} strokeWidth={1} />
      <polygon points="362,124 402,124 414,162 362,162" fill="rgba(34,211,238,0.07)" stroke={CYAN_DIM} strokeWidth={1} />
      <rect x="212" y="124" width="104" height="38" fill="rgba(34,211,238,0.07)" stroke={CYAN_DIM} strokeWidth={1} />
      <rect x="96" y="124" width="76" height="38" fill="rgba(34,211,238,0.07)" stroke={CYAN_DIM} strokeWidth={1} />

      {/* panel gaps / body lines */}
      <line x1="190" y1="110" x2="190" y2="240" stroke={FAINT} strokeWidth={0.8} />
      <line x1="352" y1="110" x2="352" y2="240" stroke={FAINT} strokeWidth={0.8} />
      <line x1="362" y1="170" x2="362" y2="240" stroke={FAINT} strokeWidth={0.8} />
      <line x1="190" y1="176" x2="352" y2="176" stroke={FAINT} strokeWidth={0.8} />
      <rect x="330" y="182" width="16" height="4" fill="none" stroke={FAINT} strokeWidth={0.9} />
      <line x1="70" y1="200" x2="486" y2="200" stroke="rgba(148,163,184,0.22)" strokeWidth={0.8} />

      {/* front + rear detail */}
      <rect x="486" y="190" width="8" height="15" fill="none" stroke={AMBER_DIM} strokeWidth={1} />
      <rect x="70" y="196" width="6" height="20" fill="none" stroke="rgba(248,113,113,0.55)" strokeWidth={1} />
      <rect x="458" y="160" width="12" height="8" fill="none" stroke={FAINT} strokeWidth={1} />
      <line x1="452" y1="164" x2="458" y2="164" stroke={FAINT} strokeWidth={1} />
      <line x1="486" y1="218" x2="494" y2="218" stroke={FAINT} strokeWidth={0.8} />

      {/* ── wheels — alloy style with spokes + centerlines ── */}
      {[145, 420].map((cx) => (
        <g key={cx}>
          <line x1={cx} y1={238} x2={cx} y2={284} stroke={CYAN_FAINT} strokeWidth={0.8} strokeDasharray="10 3 2 3" />
          <circle cx={cx} cy={240} r={28} fill="#070a0f" stroke={LINE} strokeWidth={1.4} />
          <circle cx={cx} cy={240} r={17} fill="none" stroke={FAINT} strokeWidth={1} />
          {[0, 1, 2, 3, 4].map((i) => {
            const a = (i * 72 - 90) * (Math.PI / 180)
            return <line key={i} x1={cx} y1={240} x2={cx + 16 * Math.cos(a)} y2={240 + 16 * Math.sin(a)} stroke={CYAN_DIM} strokeWidth={1.4} />
          })}
          <circle cx={cx} cy={240} r={3.2} fill={AMBER} />
          <line x1={cx - 5} y1={240} x2={cx + 5} y2={240} stroke={CYAN_FAINT} strokeWidth={0.7} />
        </g>
      ))}

      {/* ── technical callouts ──────────────────────────── */}
      <Leader x1={150} y1={46} x2={268} y2={80} label={`PV ARRAY ${solarW}W`} labelX={64} labelY={50} />
      <Leader x1={212} y1={276} x2={252} y2={222} label={`LEISURE BANK ${batteryAh}Ah`} labelX={104} labelY={280} />
      {inverterW > 0 ? (
        <Leader x1={446} y1={58} x2={446} y2={150} label={`INVERTER ${inverterW}W`} labelX={452} labelY={62} />
      ) : (
        <Leader x1={446} y1={58} x2={446} y2={150} label="DC ONLY" labelX={452} labelY={62} />
      )}
      <Leader x1={530} y1={120} x2={500} y2={186} label="FUSE/DB" labelX={536} labelY={122} anchor="end" />

      {/* ── dimension lines ─────────────────────────────── */}
      <g stroke={CYAN_DIM} strokeWidth={0.9}>
        <line x1="70" y1="300" x2="494" y2="300" />
        <line x1="70" y1="295" x2="70" y2="305" />
        <line x1="494" y1="295" x2="494" y2="305" />
        <line x1="530" y1="110" x2="530" y2="240" />
        <line x1="525" y1="110" x2="535" y2="110" />
        <line x1="525" y1="240" x2="535" y2="240" />
      </g>
      <text x="282" y="293" textAnchor="middle" fontSize={9} fill={CYAN} fontFamily={MONO}>L1 5995</text>
      <text x="544" y="175" textAnchor="middle" fontSize={9} fill={CYAN} fontFamily={MONO} transform="rotate(-90 544 175)">H1 2790</text>

      {/* ── live spec chips ─────────────────────────────── */}
      <g fontFamily={MONO} fontSize={10} fontWeight={700}>
        <rect x="120" y="314" width="102" height="20" fill="rgba(251,191,36,0.08)" stroke={AMBER_DIM} />
        <text x="171" y="328" textAnchor="middle" fill={AMBER}>{batteryAh}Ah BANK</text>
        <rect x="230" y="314" width="102" height="20" fill="rgba(251,191,36,0.08)" stroke={AMBER_DIM} />
        <text x="281" y="328" textAnchor="middle" fill={AMBER}>{solarW}W SOLAR</text>
        <rect x="340" y="314" width="124" height="20" fill="rgba(251,191,36,0.08)" stroke={AMBER_DIM} />
        <text x="402" y="328" textAnchor="middle" fill={AMBER}>{inverterW > 0 ? `${inverterW}W INVERTER` : '12V ONLY'}</text>
      </g>
    </svg>
  )
}
