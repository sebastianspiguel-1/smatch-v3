import { useNavigate } from "react-router-dom"
import "./ChallengeComplete.css"

export default function ChallengeComplete({
  challengeTitle,
  challengeNumber,
  accentColor,
  gradientStart,
  gradientEnd,
  isLastChallenge = false
}) {
  const nav = useNavigate()

  // Challenge order: [6, 4, 1, 2, 3, 5]
  const CHALLENGE_ORDER = [6, 4, 1, 2, 3, 5]
  const currentIndex = CHALLENGE_ORDER.indexOf(challengeNumber)
  const nextChallengeFile = currentIndex < CHALLENGE_ORDER.length - 1
    ? CHALLENGE_ORDER[currentIndex + 1]
    : null

  function handleContinue() {
    if (isLastChallenge || !nextChallengeFile) {
      // Ir a página de resultados finales
      nav("/resultados")
    } else {
      // Ir al siguiente challenge
      nav(`/challenge/${nextChallengeFile}`)
    }
  }

  function handleBackToMenu() {
    nav("/challenges")
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
          {isLastChallenge || !nextChallengeFile
            ? "¡Completaste todos los challenges! 🎉"
            : "Completado con éxito"
          }
        </p>

        {/* Botones */}
        <div className="complete-actions">
          <button
            className="complete-btn complete-btn-primary"
            onClick={handleContinue}
            style={{
              background: `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})`,
              borderColor: accentColor
            }}
          >
            {isLastChallenge || !nextChallengeFile
              ? "Ver mis resultados →"
              : "Continuar al siguiente →"
            }
          </button>

          <button
            className="complete-btn complete-btn-secondary"
            onClick={handleBackToMenu}
          >
            Volver al menú principal
          </button>
        </div>
      </div>
    </div>
  )
}
