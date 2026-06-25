import { useNavigate } from "react-router-dom"
import { getCompletedCount, CHALLENGE_ORDER } from "../utils/progressTracker"
import "./ChallengeComplete.css"

export default function ChallengeComplete({
  challengeTitle,
  challengeNumber,
  accentColor,
  gradientStart,
  gradientEnd,
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
        <p className="complete-challenge-name">"{challengeTitle}"</p>

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
