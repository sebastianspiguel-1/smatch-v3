import { useNavigate } from "react-router-dom"
import { getCompletedCount, CHALLENGE_ORDER } from "../utils/progressTracker"
import "./ChallengeComplete.css"

export default function ChallengeComplete({
  challengeTitle,
  challengeNumber,
  accentColor,
  gradientStart,
  gradientEnd,
  grade,
}) {
  const nav = useNavigate()

  // Detectar si completó todos los challenges del recorrido
  const totalChallenges = CHALLENGE_ORDER.length
  const completedCount = getCompletedCount()
  const isAllCompleted = completedCount >= totalChallenges

  function handleContinue() {
    // Siempre volver al menú para que elija el siguiente
    nav("/challenges")
  }

  function handleFinishAll() {
    // Ir a la página de gracias (mensaje final)
    nav("/gracias")
  }

  return (
    <div className="challenge-complete-overlay">
      <div
        className="challenge-complete-card"
        style={{
          background: `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})`,
          borderColor: accentColor
        }}
      >
        {/* Checkmark animado */}
        <div className="complete-checkmark">
          <svg viewBox="0 0 52 52" className="checkmark-svg">
            <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
            <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
          </svg>
        </div>

        {/* Título */}
        <h1 className="complete-title">Challenge Completado</h1>

        {/* Nombre del challenge */}
        <p className="complete-challenge-name">
          {challengeNumber ? `Challenge ${challengeNumber} · ` : ""}{challengeTitle}
        </p>

        {/* Score — la recompensa: cómo le fue */}
        {grade && grade.avg > 0 && (
          <div style={{ margin: "6px 0 10px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{ fontSize: 56, fontWeight: 900, lineHeight: 1, color: "#ffffff", letterSpacing: "-0.03em" }}>
              {Math.round(grade.avg)}
              <span style={{ fontSize: 22, fontWeight: 700, opacity: 0.55 }}>/100</span>
            </div>
            {grade.label && (
              <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.92)", background: "rgba(255,255,255,0.16)", padding: "4px 12px", borderRadius: 999 }}>
                {grade.label.replace("Scrum Master ", "")}
              </div>
            )}
          </div>
        )}

        {/* Mensaje */}
        <p className="complete-message">
          {isAllCompleted
            ? "¡Completaste todos los challenges! 🎉"
            : `${completedCount}/${totalChallenges} challenges completados`
          }
        </p>

        {/* Botones */}
        <div className="complete-actions">
          {isAllCompleted ? (
            <button
              className="complete-btn complete-btn-primary"
              onClick={handleFinishAll}
              style={{
                background: `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})`,
                borderColor: accentColor
              }}
            >
              Terminar Setlist Challenge →
            </button>
          ) : (
            <button
              className="complete-btn complete-btn-primary"
              onClick={handleContinue}
              style={{
                background: `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})`,
                borderColor: accentColor
              }}
            >
              Volver al menú →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
