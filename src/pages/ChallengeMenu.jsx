import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { TEAM } from "../data/challenge01"
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
              <div className="people-card">
                <h2>El Equipo & Stakeholders</h2>
                <div className="people-grid">
                  {TEAM.map((member) => (
                    <div key={member.id} className="person-item">
                      <div className="person-avatar" style={{ background: member.color }}>
                        {member.init}
                      </div>
                      <div className="person-info">
                        <h4>{member.name}</h4>
                        <p>{member.role}</p>
                      </div>
                    </div>
                  ))}
                  <div className="person-item stakeholder">
                    <div className="person-avatar" style={{ background: "#8b5cf6" }}>
                      SI
                    </div>
                    <div className="person-info">
                      <h4>Simon</h4>
                      <p>Lollapalooza · Stakeholder</p>
                    </div>
                  </div>
                </div>
              </div>
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
              <div className="stat-value">4/6</div>
              <div className="stat-label">Completados</div>
            </div>
            <div className="stat-item stat-item-clickable" onClick={() => nav("/mi-progreso")}>
              <div className="stat-value">67%</div>
              <div className="stat-label">Progreso</div>
              <div className="stat-cta">Ver detalle →</div>
            </div>
          </div>
        </div>

        <div className="challenge-grid">
          {CHALLENGES.map((c) => (
            <div
              key={c.id}
              className={`challenge-card ${c.ready ? 'available' : 'locked'}`}
              onClick={() => c.ready && nav(`/challenge/${c.challengeFile || c.id}`)}
            >
              {!c.ready && (
                <div className="lock-overlay">
                  <div className="lock-icon">🔒</div>
                </div>
              )}

              <div className="card-header">
                <div className="header-top">
                  <div className="card-number" style={{ color: c.accentColor, borderColor: c.accentColor, background: `${c.accentColor}15` }}>
                    #{String(c.id).padStart(2, "0")}
                  </div>
                </div>
                <h3 className="card-title" style={{ color: c.accentColor }}>{c.title}</h3>
              </div>

              <div className="card-content">

                <div
                  className="card-desc-box"
                  style={{
                    background: `linear-gradient(135deg, ${c.gradientStart}, ${c.gradientEnd})`,
                    borderLeft: `4px solid ${c.accentColor}`
                  }}
                >
                  <p className="card-desc-text">{c.desc}</p>
                </div>

                <div className="card-footer">
                  {c.ready ? (
                    <div
                      className="play-button"
                      style={{
                        background: `linear-gradient(135deg, ${c.gradientStart}, ${c.gradientEnd})`,
                        borderColor: c.accentColor
                      }}
                    >
                      <span>INICIAR CHALLENGE</span>
                      <span className="arrow">→</span>
                    </div>
                  ) : (
                    <div className="coming-soon">PRÓXIMAMENTE</div>
                  )}
                </div>
              </div>

              {c.ready && <div className="card-glow"></div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
