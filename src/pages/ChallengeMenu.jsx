import { useState } from "react"
import { useNavigate } from "react-router-dom"
import TeamPanel from "../components/TeamPanel"
import {
  isChallengeUnlocked,
  isChallengeCompleted,
  getCompletedCount,
  getCompletionPercentage,
  resetProgress,
  markChallengeComplete,
  CHALLENGE_ORDER,
} from "../utils/progressTracker"
import "./ChallengeMenu.css"

// ─── Los 5 challenges del Sprint 1 (orden cronológico real) ───
// id = numero del archivo Challenge0X.jsx que renderiza esta tarjeta.
const CHALLENGES = [
  {
    id: 1,
    title: "Día 1 · Kickoff & Planning",
    desc: "Primer día del equipo juntos. Facilitás 3 team agreements y arrancás el Planning con la estimación.",
    skill: "Facilitación + Procesos",
    icon: "■",
    accentColor: "#0891b2",
  },
  {
    id: 2,
    title: "Día 3 · 1-1 con Alan",
    desc: "Alan estuvo callado y sus métricas caen. Convocás un 1-1: una conversación de coaching difícil.",
    skill: "Coaching humano",
    icon: "⬢",
    accentColor: "#ff8a80",
  },
  {
    id: 3,
    title: "Día 5 · Daily con bloqueo",
    desc: "Mid-sprint: una task bloqueada hace 2 días que nadie escaló. Facilitá el daily y destrabá el flujo.",
    skill: "Flujo + Kanban",
    icon: "◆",
    accentColor: "#f59e0b",
  },
  {
    id: 4,
    title: "Día 7 · Reunión con Paula (EM)",
    desc: "Paula entró en pánico con la proyección del sprint. Te convoca a un 1-1 tenso. Manejá la situación.",
    skill: "Stakeholders",
    icon: "▲",
    accentColor: "#dc2626",
  },
  {
    id: 5,
    title: "Día 10 · Retro del Sprint 1",
    desc: "Cierra el Sprint 1. En superficie todo OK, pero hay algo que nadie nombra. Facilitá la retro.",
    skill: "Facilitación + Safety",
    icon: "◉",
    accentColor: "#00d4aa",
  },
]

export default function ChallengeMenu() {
  const nav = useNavigate()
  const [showOnboarding, setShowOnboarding] = useState(
    () => !localStorage.getItem("smatch_onboarding_seen")
  )

  const completedCount = getCompletedCount()
  const completionPct = getCompletionPercentage()
  const allCompleted = completedCount >= 5

  const [showFinishModal, setShowFinishModal] = useState(allCompleted)

  const handleCloseOnboarding = () => {
    localStorage.setItem("smatch_onboarding_seen", "true")
    setShowOnboarding(false)
  }

  return (
    <div className="challenge-journey">
      <div className="journey-bg"></div>

      {/* Finish Challenge Modal */}
      {showFinishModal && (
        <div className="finish-modal-overlay" onClick={() => setShowFinishModal(false)}>
          <div className="finish-modal" onClick={(e) => e.stopPropagation()}>
            <button className="finish-modal-close" onClick={() => setShowFinishModal(false)} aria-label="Cerrar">×</button>
            <div className="finish-modal-emoji">🎉</div>
            <div className="finish-modal-badge">¡COMPLETASTE TODOS LOS CHALLENGES!</div>
            <h2 className="finish-modal-title">¡Felicitaciones!</h2>
            <p className="finish-modal-text">Acabás de vivir el Sprint 1 completo con el equipo Setlist.</p>
            <button className="finish-modal-btn" onClick={() => nav("/gracias")}>
              <span>Terminar Setlist Challenge</span>
              <span className="arrow">→</span>
            </button>
            <p className="finish-modal-hint">Tu reporte va a ser evaluado por el equipo de recruiting</p>
          </div>
        </div>
      )}

      {/* Onboarding Modal */}
      {showOnboarding && (
        <div className="onboarding-overlay" onClick={handleCloseOnboarding}>
          <div className="onboarding-modal" onClick={(e) => e.stopPropagation()}>
            <div className="onboarding-header">
              <h2>👋 Bienvenido a tu Assessment</h2>
            </div>
            <div className="onboarding-content">
              <p>Vas a vivir <strong>los 5 momentos clave del Sprint 1</strong> con el equipo Setlist. Un sprint completo, contado en 5 situaciones donde un buen SM marca la diferencia.</p>
              <ul className="onboarding-list">
                <li>⏱️ <strong>60-90 minutos</strong> en total</li>
                <li>🎯 <strong>Sin respuestas únicas correctas</strong> — se evalúa tu proceso de pensamiento</li>
                <li>📊 <strong>Feedback inmediato</strong> con score detallado al final</li>
              </ul>
              <p className="onboarding-tip">💡 Tip: Respondé con naturalidad, como lo harías en tu día a día.</p>
            </div>
            <div className="onboarding-footer">
              <button className="btn-start-assessment" onClick={handleCloseOnboarding}>Entendido, comenzar</button>
            </div>
          </div>
        </div>
      )}

      <div className="journey-container">
        <button onClick={() => nav("/")} className="back-button">← Volver al inicio</button>

        {/* HEADER compacto */}
        <div className="menu-header">
          <div className="menu-badge">🎸 SETLIST · SPRINT 1</div>
          <h1 className="menu-title">Tu Sprint como <span className="gradient-text">Scrum Master</span></h1>
          <p className="menu-subtitle">5 momentos clave del Sprint 1 con el equipo Setlist. Un sprint completo, en las situaciones donde más se nota un buen SM.</p>
        </div>

        {/* SOBRE SETLIST (desplegado, arriba) */}
        <div className="about-setlist">
          <div className="about-head">🎸 Sobre Setlist y tu rol</div>
          <p className="about-tagline">
            <strong>Setlist</strong> es una app que convierte al público en parte del show: la banda publica su recital y los fans eligen, con sus votos, <strong>qué canciones quieren escuchar</strong> — y la banda toca las más votadas. Detrás de la idea hay una startup chica, todavía en MVP, con una fecha comprometida: un <strong>show real en cuatro semanas</strong> con una banda piloto, a la que el CEO ya le prometió el producto funcionando. Sos el <strong>Scrum Master</strong> recién llegado a un equipo que apenas se conoce, y tu rol es <strong>facilitar, hacer coaching y cuidar al equipo</strong> para que lleguen a ese show de la mejor forma posible.
          </p>
        </div>

        {/* TEAM strip */}
        <div className="menu-section">
          <TeamPanel strip showStakeholder={true} />
        </div>

        {/* PROGRESO unificado */}
        <div className="menu-progress">
          <div className="menu-progress-row">
            <span className="menu-progress-label">Tu avance</span>
            <span className="menu-progress-count">{completedCount}/5 challenges · {completionPct}%</span>
          </div>
          <div className="menu-progress-track">
            <div className="menu-progress-fill" style={{ width: `${completionPct}%` }} />
          </div>
        </div>

        {allCompleted && (
          <div className="finish-challenge-section">
            <div className="finish-challenge-badge">🎉 ¡COMPLETASTE TODOS LOS CHALLENGES!</div>
            <button className="finish-challenge-btn" onClick={() => nav("/gracias")}>
              <span>Terminar Setlist Challenge</span>
              <span className="arrow">→</span>
            </button>
            <p className="finish-challenge-hint">Tu reporte va a ser evaluado por el equipo de recruiting</p>
          </div>
        )}

        {/* CHALLENGE GRID */}
        <div className="challenge-grid">
          {CHALLENGES.map((c, idx) => {
            const isCompleted = isChallengeCompleted(c.id)
            const isUnlocked = isChallengeUnlocked(c.id)
            const isClickable = isUnlocked && !isCompleted
            const isNext = isClickable && CHALLENGES.slice(0, idx).every((prev) => isChallengeCompleted(prev.id))
            const status = isCompleted ? "completed" : isNext ? "next" : isUnlocked ? "available" : "locked"
            const topColor = status === "locked" ? "rgba(148,163,184,0.4)" : c.accentColor

            return (
              <div
                key={c.id}
                className={`challenge-card ${status}`}
                style={{ borderTop: `4px solid ${topColor}` }}
                onClick={() => isClickable && nav(`/challenge/${c.id}`)}
              >
                {isCompleted && (
                  <div className="completed-badge">
                    <span className="completed-badge-icon">✓</span>
                    <span className="completed-badge-text">Completado</span>
                  </div>
                )}
                {isNext && <div className="next-badge">PRÓXIMO</div>}
                {!isUnlocked && !isCompleted && (
                  <div className="lock-badge"><span className="lock-badge-icon">🔒</span></div>
                )}

                <div className="card-header">
                  <div className="card-meta">
                    <span
                      className="card-number"
                      style={{ color: topColor, background: `${topColor}1a`, borderColor: `${topColor}33` }}
                    >
                      #{String(c.id).padStart(2, "0")}
                    </span>
                    <span className="card-skill">{c.skill}</span>
                  </div>
                  <h3 className="card-title">{c.title}</h3>
                </div>

                <div className="card-content">
                  <p className="card-desc-text">{c.desc}</p>
                  <div className="card-footer">
                    {isClickable && (
                      <div className="play-button">
                        <span>Iniciar challenge</span>
                        <span className="arrow">→</span>
                      </div>
                    )}
                    {isCompleted && <div className="completed-button"><span>✓ Completado · volver a verlo</span></div>}
                    {!isUnlocked && !isCompleted && <div className="locked-button"><span>🔒 Se desbloquea al anterior</span></div>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Dev buttons (only visible in dev mode) */}
        {import.meta.env.DEV && (
          <div style={{ textAlign: "center", marginTop: 40, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            {completedCount > 0 && (
              <button
                onClick={() => { resetProgress(); window.location.reload() }}
                style={{ padding: "10px 20px", background: "rgba(220, 38, 38, 0.08)", color: "#dc2626", border: "1px solid rgba(220, 38, 38, 0.25)", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "inherit" }}
              >
                🔄 Reset progress (dev only)
              </button>
            )}
            {!allCompleted && (
              <button
                onClick={() => { CHALLENGE_ORDER.forEach((id) => markChallengeComplete(id)); setShowFinishModal(true) }}
                style={{ padding: "10px 20px", background: "rgba(0, 212, 170, 0.08)", color: "#00d4aa", border: "1px solid rgba(0, 212, 170, 0.25)", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "inherit" }}
              >
                ⚡ Mark all as completed (dev only)
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
