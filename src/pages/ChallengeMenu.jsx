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
    sprintDay: "Día 1",
    desc: "Primer día del equipo trabajando juntos. Sesión 2 en 1: primero facilitás 3 team agreements básicos (comunicación, DoR, cómo estimamos), después arrancás el Planning con las herramientas de estimación. Lo que acuerdes en la Parte 1 se va a poner a prueba en la Parte 2.",
    ready: true,
    icon: "■",
    accentColor: "#0891b2",
    gradientStart: "rgba(8, 145, 178, 0.85)",
    gradientEnd: "rgba(6, 182, 212, 0.80)"
  },
  {
    id: 2,
    title: "Día 3 · 1-1 con Alan",
    sprintDay: "Día 3",
    desc: "Alan estuvo callado en el Planning. Sus métricas vienen cayendo desde antes. Convocás un 1-1. Generá un espacio seguro para una conversación de coaching difícil.",
    ready: true,
    icon: "⬢",
    accentColor: "#ff8a80",
    gradientStart: "rgba(255, 138, 128, 0.85)",
    gradientEnd: "rgba(250, 128, 114, 0.80)"
  },
  {
    id: 3,
    title: "Día 5 · Daily con bloqueo",
    sprintDay: "Día 5",
    desc: "Mid-sprint. Alan tiene una task bloqueada hace 2 días esperando aprobación de Spotify Developer API y no escaló. WIP excedido, sprint en riesgo. Facilitá el daily.",
    ready: true,
    icon: "◆",
    accentColor: "#f59e0b",
    gradientStart: "rgba(245, 158, 11, 0.85)",
    gradientEnd: "rgba(217, 119, 6, 0.80)"
  },
  {
    id: 4,
    title: "Día 7 · Reunión con Paula (EM)",
    sprintDay: "Día 7",
    desc: "Paula (Engineering Manager) escuchó que el sprint va lento. Te convoca a 1-1. Hizo una proyección lineal y entró en pánico: piensa que no llegamos al show piloto. El equipo te mira. ¿Cómo manejás la situación?",
    ready: true,
    icon: "▲",
    accentColor: "#dc2626",
    gradientStart: "rgba(220, 38, 38, 0.85)",
    gradientEnd: "rgba(185, 28, 28, 0.80)"
  },
  {
    id: 5,
    title: "Día 10 · Retro del Sprint 1",
    sprintDay: "Día 10",
    desc: "Sprint 1 cierra: 22/30 puntos entregados (3 carry-overs por SL-105). Hay tensión entre Eric (velocidad) y Gian (calidad). En superficie todos están OK, pero hay algo no dicho. Facilitá la retro.",
    ready: true,
    icon: "◉",
    accentColor: "#00d4aa",
    gradientStart: "rgba(0, 212, 170, 0.85)",
    gradientEnd: "rgba(5, 150, 105, 0.80)"
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
  const allCompleted = completedCount >= 5

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
                Sos el nuevo Scrum Master, recién contratado. El equipo arranca su primer sprint juntos y hay problemas reales que necesitan resolverse.
              </p>
            </div>

            {/* Company & Mission */}
            <div className="intro-section">
              <div className="mission-card">
                <div className="mission-header">
                  <h2>🎸 El Producto</h2>
                  <p className="mission-tagline">
                    <strong>Setlist</strong> es una app donde <strong>las bandas</strong> crean shows y <strong>los fans</strong> votan qué canciones se tocan.
                    Vox populi pura: la banda toca exactamente las más votadas, sin veto. Es la app que querés tener en cada recital.
                  </p>
                </div>
                <div className="mission-grid">
                  <div className="mission-item">
                    <h3>🎯 La meta del Sprint 1</h3>
                    <p>Tener el <strong>flujo core funcionando</strong>: banda crea show → fans se suman → sugieren canciones → votan → el más votado se toca.</p>
                  </div>
                  <div className="mission-item">
                    <h3>🔧 Lo que se va a bloquear</h3>
                    <p>La <strong>búsqueda de canciones (Spotify Search API)</strong> queda trabada esperando aprobación. Sin eso, no hay sugerencias.</p>
                  </div>
                  <div className="mission-item">
                    <h3>🎪 El compromiso externo</h3>
                    <p><strong>Show real público en 4 semanas.</strong> Mateo (CEO) cerró con la banda piloto: la app va a estar en escena frente a audience real. Si falla, falla en público.</p>
                  </div>
                  <div className="mission-item">
                    <h3>⚠️ La presión interna</h3>
                    <p>Es el <strong>primer sprint del equipo juntos</strong>. Mateo armó el equipo en las últimas 2-3 semanas. Casi no se conocen entre sí. Paula (EM) es responsable de que lleguen al show.</p>
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
                  Vas a vivir <strong>los 5 momentos clave del Sprint 1</strong> con el equipo Setlist. Un sprint completo de 10 días, contado en los 5 puntos donde más se necesita un buen Scrum Master.
                </p>
                <div className="situations-preview">
                  <div className="situation-badge">Día 1 · Kickoff + Planning</div>
                  <div className="situation-badge">Día 3 · 1-1 con un dev callado</div>
                  <div className="situation-badge">Día 5 · Daily con bloqueo crítico</div>
                  <div className="situation-badge">Día 7 · Tu Engineering Manager exige +30%</div>
                  <div className="situation-badge">Día 10 · Retro con tensión real</div>
                </div>
                <p className="role-description">
                  Cada situación evalúa diferentes skills: <strong>facilitación, coaching 1-1, gestión de stakeholders, navegación de conflictos, pensamiento sistémico.</strong> No hay respuestas únicas correctas — se evalúa tu proceso de pensamiento y decisiones.
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

      {/* Finish Challenge Modal - aparece automáticamente cuando completaste los 5 */}
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
              Acabás de vivir el Sprint 1 completo con el equipo Setlist.
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
              <p>Vas a vivir <strong>los 5 momentos clave del Sprint 1</strong> con un equipo real. Un sprint completo, contado en 5 situaciones donde un buen SM marca la diferencia.</p>
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
              <div className="stat-value">{completedCount}/5</div>
              <div className="stat-label">Completados</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{completionPct}%</div>
              <div className="stat-label">Progreso</div>
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
              const isCompleted = isChallengeCompleted(c.id)
              const isUnlocked = isChallengeUnlocked(c.id)
              const isNext = isUnlocked && !isCompleted && CHALLENGES.slice(0, idx).every(prev => isChallengeCompleted(prev.id))
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
            const isCompleted = isChallengeCompleted(c.id)
            const isUnlocked = isChallengeUnlocked(c.id)
            const isClickable = isUnlocked && !isCompleted
            const isNext = isClickable && CHALLENGES.slice(0, idx).every(prev => isChallengeCompleted(prev.id))
            const status = isCompleted ? "completed" : isNext ? "next" : isUnlocked ? "available" : "locked"

            return (
              <div
                key={c.id}
                className={`challenge-card ${status}`}
                onClick={() => isClickable && nav(`/challenge/${c.id}`)}
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
                  CHALLENGE_ORDER.forEach(id => markChallengeComplete(id))
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
