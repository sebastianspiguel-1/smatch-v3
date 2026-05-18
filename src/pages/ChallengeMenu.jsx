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

const CHALLENGES = [
  {
    id: 1,
    challengeFile: 6, // Maps to Challenge06 component
    title: "Team Agreements Workshop",
    desc: "Sprint 0. El equipo necesita establecer acuerdos de trabajo. Facilitá la sesión para poder llegar a un consenso de equipo sobre diversos temas centrales.",
    ready: true,
    icon: "□",
    accentColor: "#7c3aed",
    gradientStart: "rgba(124, 58, 237, 0.85)",
    gradientEnd: "rgba(109, 40, 217, 0.80)"
  },
  {
    id: 2,
    challengeFile: 4, // Maps to Challenge04 component
    title: "Estimación & Priorización",
    desc: "El equipo tiene diferentes seniorities. Muchos no saben de estimación y priorización. Facilitá una sesión para que el equipo tenga claro todo lo necesario a la hora de estimar y priorizar.",
    ready: true,
    icon: "■",
    accentColor: "#0891b2",
    gradientStart: "rgba(8, 145, 178, 0.85)",
    gradientEnd: "rgba(6, 182, 212, 0.80)"
  },
  {
    id: 3,
    challengeFile: 1, // Maps to Challenge01 component
    title: "La retro que parece perfecta",
    desc: "Retrospectiva del Sprint. Pareciese haber cierta tensión entre el equipo. Facilitá la Retro para poder sacar el mayor valor posible de la misma.",
    ready: true,
    icon: "◉",
    accentColor: "#00d4aa",
    gradientStart: "rgba(0, 212, 170, 0.85)",
    gradientEnd: "rgba(5, 150, 105, 0.80)"
  },
  {
    id: 4,
    challengeFile: 2, // Maps to Challenge02 component
    title: "El bloqueo que nadie escala",
    desc: "El equipo comenzó a utilizar un tablero kanban, pero pareciese que no está funcionando como esperaba. Miembros del equipo bloqueados, poco escalamiento de riesgos, WIP excedidos... ¡Ayudá al equipo a avanzar!",
    ready: true,
    icon: "◆",
    accentColor: "#f59e0b",
    gradientStart: "rgba(245, 158, 11, 0.85)",
    gradientEnd: "rgba(217, 119, 6, 0.80)"
  },
  {
    id: 5,
    challengeFile: 3, // Maps to Challenge03 component
    title: "El dev que se está apagando",
    desc: "Un miembro del equipo con buen historial está performando mal sin razón aparente. Generá un espacio seguro para una conversación difícil de coaching 1-1.",
    ready: true,
    icon: "⬢",
    accentColor: "#ff8a80",
    gradientStart: "rgba(255, 138, 128, 0.85)",
    gradientEnd: "rgba(250, 128, 114, 0.80)"
  },
  {
    id: 6,
    challengeFile: 5, // Maps to Challenge05 component
    title: "La presión de velocidad",
    desc: "El Engineering Manager exige acelerar 30% la velocidad y muestra métricas de \"bajo rendimiento\". El equipo te mira esperando que los defiendas. ¿Cómo manejás la situación?",
    ready: true,
    icon: "▲",
    accentColor: "#dc2626",
    gradientStart: "rgba(220, 38, 38, 0.85)",
    gradientEnd: "rgba(185, 28, 28, 0.80)"
  },
]

export default function ChallengeMenu() {
  const nav = useNavigate()
  const [showIntro, setShowIntro] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(() => {
    // Only show onboarding if user hasn't seen it before
    return !localStorage.getItem("smatch_onboarding_seen")
  })

  // Dynamic progress from localStorage
  const completedCount = getCompletedCount()
  const completionPct = getCompletionPercentage()
  const allCompleted = completedCount >= 6

  // Popup automático cuando todos están completados
  const [showFinishModal, setShowFinishModal] = useState(allCompleted)

  const handleCloseOnboarding = () => {
    localStorage.setItem("smatch_onboarding_seen", "true")
    setShowOnboarding(false)
  }

  if (showIntro) {
    return (
      <div className="challenge-journey">
        <div className="journey-bg"></div>

        <div className="journey-container">
          <button onClick={() => nav("/")} className="back-button">
            ← Volver al inicio
          </button>

          {/* INTRO SECTION */}
          <div className="setlist-intro">
            {/* Hero */}
            <div className="intro-hero">
              <div className="intro-logo">🎸 Setlist</div>
              <h1 className="intro-title">
                Bienvenido al equipo de <span className="gradient-text">Setlist</span>
              </h1>
              <p className="intro-subtitle">
                Sos el nuevo Scrum Master. El equipo está en Sprint 3 y hay problemas que necesitan resolverse urgentemente.
              </p>
            </div>

            {/* Company & Mission */}
            <div className="intro-section">
              <div className="mission-card">
                <div className="mission-header">
                  <h2>🎸 El Producto</h2>
                  <p className="mission-tagline">
                    Setlist es una app mobile que conecta artistas independientes con venues en toda Latinoamérica.
                    Permite gestionar shows de principio a fin: desde el contacto inicial hasta el pago final.
                  </p>
                </div>
                <div className="mission-grid">
                  <div className="mission-item">
                    <h3>✓ Listo</h3>
                    <p>Gestión de shows, contratos digitales firmables desde el celu, notificaciones push.</p>
                  </div>
                  <div className="mission-item">
                    <h3>🔧 En desarrollo</h3>
                    <p>Pagos online con Mercado Pago — <strong className="blocked">actualmente bloqueado hace 3 días</strong> esperando API keys.</p>
                  </div>
                  <div className="mission-item">
                    <h3>🎯 La meta</h3>
                    <p><strong>Lollapalooza 2026 en 6 semanas.</strong> 60 artistas van a usar Setlist en vivo durante el festival. Simon (organizador) pregunta por avances cada 2 días.</p>
                  </div>
                  <div className="mission-item">
                    <h3>⚠️ El problema</h3>
                    <p>Sprint 3, día 7/10. Bloqueos técnicos, presión externa, tensión interna que nadie nombra. El equipo nunca estableció acuerdos claros de trabajo.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Team & Stakeholders */}
            <div className="intro-section">
              <TeamPanel
                title="El Equipo & Stakeholders"
                showStakeholder={true}
              />
            </div>

            {/* Your Role */}
            <div className="intro-section">
              <div className="role-card">
                <h2>🎯 Tu Rol como Scrum Master</h2>
                <p className="role-description">
                  Vas a enfrentar <strong>6 situaciones críticas</strong> del equipo Setlist. Algunas ocurren ahora (Sprint 3), otras son <strong>flashbacks</strong> que explican cómo llegamos hasta acá.
                </p>
                <div className="situations-preview">
                  <div className="situation-badge">Team Agreements que nunca hicieron</div>
                  <div className="situation-badge">Coaching 1-1 con dev apagado</div>
                  <div className="situation-badge">Planning Poker bajo presión</div>
                  <div className="situation-badge">Management pidiendo más velocidad</div>
                  <div className="situation-badge">Bloqueo que nadie escala</div>
                  <div className="situation-badge">Retro donde nadie dice la verdad</div>
                </div>
                <p className="role-description">
                  Cada situación evalúa diferentes skills: <strong>facilitación, coaching, coordinación, manejo de stakeholders, pensamiento sistémico.</strong> No hay respuestas únicas correctas — se evalúa tu proceso de pensamiento y decisiones.
                </p>
                <div className="role-format">
                  <div className="format-item">
                    <span className="format-icon">🎮</span>
                    <span>Simulaciones con AI</span>
                  </div>
                  <div className="format-item">
                    <span className="format-icon">⏱️</span>
                    <span>60-90 min total</span>
                  </div>
                  <div className="format-item">
                    <span className="format-icon">📊</span>
                    <span>Feedback inmediato</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="intro-cta">
              <button className="btn-start-journey" onClick={() => setShowIntro(false)}>
                <span>Comenzar Journey</span>
                <span className="arrow">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="challenge-journey">
      <div className="journey-bg"></div>

      {/* Finish Challenge Modal - aparece automáticamente cuando completaste los 6 */}
      {showFinishModal && (
        <div className="finish-modal-overlay" onClick={() => setShowFinishModal(false)}>
          <div className="finish-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="finish-modal-close"
              onClick={() => setShowFinishModal(false)}
              aria-label="Cerrar"
            >
              ×
            </button>

            <div className="finish-modal-emoji">🎉</div>
            <div className="finish-modal-badge">¡COMPLETASTE TODOS LOS CHALLENGES!</div>
            <h2 className="finish-modal-title">¡Felicitaciones!</h2>
            <p className="finish-modal-text">
              Acabás de terminar las 6 situaciones del equipo Setlist.
            </p>

            <button
              className="finish-modal-btn"
              onClick={() => nav("/gracias")}
            >
              <span>Terminar Setlist Challenge</span>
              <span className="arrow">→</span>
            </button>

            <p className="finish-modal-hint">
              Tu reporte va a ser evaluado por el equipo de recruiting
            </p>
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
              <p>Vas a completar <strong>6 challenges situacionales</strong> que simulan escenarios reales de un Scrum Master.</p>
              <ul className="onboarding-list">
                <li>⏱️ <strong>60-90 minutos</strong> en total</li>
                <li>🎯 <strong>Sin respuestas únicas correctas</strong> — se evalúa tu proceso de pensamiento</li>
                <li>📊 <strong>Feedback inmediato</strong> con score detallado al final</li>
              </ul>
              <p className="onboarding-tip">💡 Tip: Respondé con naturalidad, como lo harías en tu día a día.</p>
            </div>
            <div className="onboarding-footer">
              <button className="btn-start-assessment" onClick={handleCloseOnboarding}>
                Entendido, comenzar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="journey-container">
        <button onClick={() => nav("/")} className="back-button">
          ← Volver al inicio
        </button>

        <div className="journey-header">
          <div className="journey-badge">SMATCH</div>
          <h1 className="journey-title">Tu Journey de Scrum Master</h1>
          <p className="journey-subtitle">Demuestra tus skills en simulaciones basadas en situaciones reales. Cada challenge evaluará diferentes dimensiones de tu rol como Scrum Master.</p>

          <div className="journey-stats">
            <div className="stat-item">
              <div className="stat-value">{completedCount}/6</div>
              <div className="stat-label">Completados</div>
            </div>
            <div className="stat-item stat-item-clickable" onClick={() => nav("/mi-progreso")}>
              <div className="stat-value">{completionPct}%</div>
              <div className="stat-label">Progreso</div>
              <div className="stat-cta">Ver detalle →</div>
            </div>
          </div>

          {/* Botón "Terminar Setlist Challenge" cuando todos están completados */}
          {allCompleted && (
            <div className="finish-challenge-section">
              <div className="finish-challenge-badge">🎉 ¡COMPLETASTE TODOS LOS CHALLENGES!</div>
              <button
                className="finish-challenge-btn"
                onClick={() => nav("/gracias")}
              >
                <span>Terminar Setlist Challenge</span>
                <span className="arrow">→</span>
              </button>
              <p className="finish-challenge-hint">
                Tu reporte va a ser evaluado por el equipo de recruiting
              </p>
            </div>
          )}
        </div>

        {/* Journey Stepper - visualización compacta del progreso */}
        <div className="journey-stepper">
          <div className="stepper-track">
            {CHALLENGES.map((c, idx) => {
              const isCompleted = isChallengeCompleted(c.challengeFile)
              const isUnlocked = isChallengeUnlocked(c.challengeFile)
              const isNext = isUnlocked && !isCompleted && CHALLENGES.slice(0, idx).every(prev => isChallengeCompleted(prev.challengeFile))
              const dotStatus = isCompleted ? "completed" : isNext ? "next" : isUnlocked ? "available" : "locked"

              return (
                <div key={c.id} className="stepper-step">
                  <div className={`stepper-dot ${dotStatus}`}>
                    {isCompleted ? "✓" : c.id}
                  </div>
                  <div className="stepper-label">{c.title.length > 22 ? c.title.slice(0, 20) + "…" : c.title}</div>
                  {idx < CHALLENGES.length - 1 && (
                    <div className={`stepper-line ${isCompleted ? "completed" : ""}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="challenge-grid">
          {CHALLENGES.map((c, idx) => {
            const isCompleted = isChallengeCompleted(c.challengeFile)
            const isUnlocked = isChallengeUnlocked(c.challengeFile)
            const isClickable = isUnlocked && !isCompleted
            const isNext = isClickable && CHALLENGES.slice(0, idx).every(prev => isChallengeCompleted(prev.challengeFile))
            const status = isCompleted ? "completed" : isNext ? "next" : isUnlocked ? "available" : "locked"

            return (
              <div
                key={c.id}
                className={`challenge-card ${status}`}
                onClick={() => isClickable && nav(`/challenge/${c.challengeFile || c.id}`)}
              >
                {isCompleted && (
                  <div className="completed-badge">
                    <span className="completed-badge-icon">✓</span>
                    <span className="completed-badge-text">Completado</span>
                  </div>
                )}

                {isNext && (
                  <div className="next-badge">PRÓXIMO</div>
                )}

                {!isUnlocked && !isCompleted && (
                  <div className="lock-badge">
                    <span className="lock-badge-icon">🔒</span>
                  </div>
                )}

                <div className="card-header">
                  <div className="card-number">
                    #{String(c.id).padStart(2, "0")}
                  </div>
                  <h3 className="card-title">{c.title}</h3>
                </div>

                <div className="card-content">
                  <div className="card-desc-box">
                    <p className="card-desc-text">{c.desc}</p>
                  </div>

                  <div className="card-footer">
                    {isClickable && (
                      <div className="play-button">
                        <span>Iniciar challenge</span>
                        <span className="arrow">→</span>
                      </div>
                    )}
                    {isCompleted && (
                      <div className="completed-button">
                        <span>✓ Completado</span>
                      </div>
                    )}
                    {!isUnlocked && !isCompleted && (
                      <div className="locked-button">
                        <span>🔒 Bloqueado</span>
                      </div>
                    )}
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
                style={{
                  padding: "10px 20px",
                  background: "rgba(220, 38, 38, 0.08)",
                  color: "#dc2626",
                  border: "1px solid rgba(220, 38, 38, 0.25)",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 700,
                  fontFamily: "inherit"
                }}
              >
                🔄 Reset progress (dev only)
              </button>
            )}
            {!allCompleted && (
              <button
                onClick={() => {
                  CHALLENGE_ORDER.forEach(challengeFile => markChallengeComplete(challengeFile))
                  setShowFinishModal(true)
                }}
                style={{
                  padding: "10px 20px",
                  background: "rgba(0, 212, 170, 0.08)",
                  color: "#00d4aa",
                  border: "1px solid rgba(0, 212, 170, 0.25)",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 700,
                  fontFamily: "inherit"
                }}
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
