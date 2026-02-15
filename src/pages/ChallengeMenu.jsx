import { useNavigate } from "react-router-dom"
import { T } from "../theme"

const CHALLENGES = [
  { id: 1, title: "La retro que parece perfecta", desc: "Facilitá una retrospectiva donde todo parece ir bien... pero hay tensión oculta bajo la superficie.", time: "~12 min", ready: true },
  { id: 2, title: "El ticket que nadie quiere", desc: "Día 7 del sprint. Un dev trabado, otro sin trabajo, QA bloqueado. ¿Cómo facilitás sin ser project manager?", time: "~10 min", ready: false },
  { id: 3, title: "El debate de la demo", desc: "Dos miembros del equipo en desacuerdo público sobre el formato de demos. Los dos tienen razón.", time: "~10 min", ready: false },
  { id: 4, title: "Spikes vs negocio", desc: "El equipo pide trabajo técnico, management solo quiere features. ¿Cómo traducís entre los dos mundos?", time: "~12 min", ready: false },
  { id: 5, title: "La presión de velocidad", desc: "El Engineering Manager quiere 30% más de velocidad. Con gráficos. El equipo te mira.", time: "~12 min", ready: false },
  { id: 6, title: "Acuerdos que no se cumplen", desc: "Los working agreements del equipo existen en papel. Nadie los sigue. Los nuevos no los conocen.", time: "~10 min", ready: false },
]

export default function ChallengeMenu() {
  const nav = useNavigate()

  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.text, fontFamily: "'Segoe UI',system-ui,sans-serif" }}>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "32px 16px" }}>
        <button onClick={() => nav("/")} style={{ background: "none", border: "none", color: T.dim, fontSize: 11, cursor: "pointer", marginBottom: 12 }}>← Volver al inicio</button>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: T.teal }}>SMATCH</div>
          <div style={{ fontSize: 26, fontWeight: 800, marginTop: 6 }}>Challenges</div>
          <div style={{ fontSize: 12, color: T.dim, marginTop: 4 }}>Simulaciones basadas en situaciones reales de Scrum Masters</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {CHALLENGES.map(c => (
            <button key={c.id}
              onClick={() => c.ready && nav(`/challenge/${c.id}`)}
              style={{
                textAlign: "left", padding: 16, borderRadius: 10, cursor: c.ready ? "pointer" : "default",
                background: T.panel, border: `1px solid ${c.ready ? T.border : "#1a1a2e"}`,
                color: T.text, transition: "all 0.2s", opacity: c.ready ? 1 : 0.45,
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}
              onMouseEnter={e => { if (c.ready) { e.currentTarget.style.borderColor = T.teal; e.currentTarget.style.background = T.card } }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = T.panel }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: T.teal, background: T.tealDim, padding: "2px 8px", borderRadius: 4 }}>
                    {String(c.id).padStart(2, "0")}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>{c.title}</span>
                </div>
                <div style={{ fontSize: 11, color: T.sub, lineHeight: 1.4 }}>{c.desc}</div>
              </div>
              <div style={{ textAlign: "right", marginLeft: 12, flexShrink: 0 }}>
                <div style={{ fontSize: 10, color: T.dim }}>{c.time}</div>
                {c.ready
                  ? <div style={{ fontSize: 10, fontWeight: 700, color: T.teal, marginTop: 2 }}>JUGAR →</div>
                  : <div style={{ fontSize: 10, fontWeight: 700, color: T.dim, marginTop: 2 }}>PRÓXIMAMENTE</div>
                }
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
