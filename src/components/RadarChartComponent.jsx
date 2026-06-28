// Radar de competencias en SVG propio (sin recharts) — control total de
// labels (no se cortan) y manejo honesto de "sin datos": las dimensiones no
// medidas van en gris (dot hueco + eje punteado) y NO entran al polígono, así
// no se desploma al centro. data: [{ dimension, score (0-100), sampleCount }]

const scoreColor = (s) =>
  s >= 75 ? "#059669" : s >= 50 ? "#2563eb" : s >= 25 ? "#ea580c" : "#dc2626"

const GHOST = "#cbd5e1"
const GHOST_TEXT = "#94a3b8"

export default function RadarChartComponent({ data = [] }) {
  if (!data.length) return null

  // viewBox más ancho que alto para dar aire a las etiquetas laterales
  const VW = 460
  const VH = 320
  const cx = VW / 2
  const cy = 158
  const R = 92
  const n = data.length
  const ang = (i) => ((-90 + (360 / n) * i) * Math.PI) / 180
  const pt = (i, r) => [cx + r * Math.cos(ang(i)), cy + r * Math.sin(ang(i))]
  const fmt = (p) => p.map((v) => v.toFixed(1)).join(",")
  const ringPts = (r) => data.map((_, i) => fmt(pt(i, r))).join(" ")

  const has = (d) => d.sampleCount > 0
  const measured = data.map((d, i) => ({ d, i })).filter((o) => has(o.d))
  const polyPts = measured
    .map((o) => fmt(pt(o.i, (R * Math.max(0, Math.min(100, o.d.score))) / 100)))
    .join(" ")

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" style={{ maxWidth: VW, display: "block", margin: "0 auto", fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      {/* anillos */}
      {[0.25, 0.5, 0.75, 1].map((f, ri) => (
        <polygon key={`r${ri}`} points={ringPts(R * f)} fill={ri === 3 ? "rgba(15,23,42,0.015)" : "none"} stroke="rgba(15,23,42,0.09)" strokeWidth="1" />
      ))}
      {/* ejes (punteado si no hay datos) */}
      {data.map((d, i) => {
        const [x, y] = pt(i, R)
        return <line key={`a${i}`} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(15,23,42,0.06)" strokeWidth="1" strokeDasharray={has(d) ? "0" : "3 3"} />
      })}
      {/* polígono solo sobre dimensiones medidas */}
      {measured.length >= 3 && (
        <polygon points={polyPts} fill="rgba(0,212,170,0.16)" stroke="#00d4aa" strokeWidth="2.5" strokeLinejoin="round" />
      )}
      {measured.length === 2 && (
        <polyline points={polyPts} fill="none" stroke="#00d4aa" strokeWidth="2.5" />
      )}
      {/* puntos medidos */}
      {measured.map((o) => {
        const [x, y] = pt(o.i, (R * Math.max(0, Math.min(100, o.d.score))) / 100)
        return <circle key={`d${o.i}`} cx={x} cy={y} r="3.8" fill="#00d4aa" stroke="#ffffff" strokeWidth="1.5" />
      })}
      {/* dots huecos grises para no-data, sobre el borde */}
      {data.map((d, i) =>
        has(d) ? null : (
          <circle key={`g${i}`} cx={pt(i, R)[0]} cy={pt(i, R)[1]} r="4" fill="#ffffff" stroke={GHOST} strokeWidth="1.5" />
        )
      )}
      {/* labels (nombre en hasta 2 líneas + score% o 'sin datos') */}
      {data.map((d, i) => {
        const [lx, ly] = pt(i, R + 16)
        const c = Math.cos(ang(i))
        const s = Math.sin(ang(i))
        const anchor = Math.abs(c) < 0.35 ? "middle" : c > 0 ? "start" : "end"
        const words = d.dimension.split(" ")
        const startY = s < -0.35 ? ly - words.length * 12 : ly
        const ok = has(d)
        return (
          <text key={`l${i}`} x={lx} y={startY} textAnchor={anchor} fontSize="11" fontWeight="700" fill="#475569">
            {words.map((w, wi) => (
              <tspan key={wi} x={lx} dy={wi === 0 ? 0 : 12}>{w}</tspan>
            ))}
            <tspan x={lx} dy="13" fontSize={ok ? "12" : "10"} fontWeight="800" fill={ok ? scoreColor(d.score) : GHOST_TEXT}>
              {ok ? `${Math.round(d.score)}%` : "sin datos"}
            </tspan>
          </text>
        )
      })}
    </svg>
  )
}
