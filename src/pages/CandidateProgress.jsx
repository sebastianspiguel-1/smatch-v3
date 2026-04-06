import { useNavigate } from "react-router-dom"
import "./CandidateProgress.css"

export default function CandidateProgress() {
  const nav = useNavigate()

  // Mock progress data (in real app, this would come from backend/localStorage)
  const progressData = {
    completed: 4,
    total: 6,
    averageScore: 78,
    highlights: 12,
    redFlags: 2,
    challenges: [
      { id: 1, title: "Team Agreements Workshop", completed: true, score: 82 },
      { id: 2, title: "Estimación & Priorización", completed: true, score: 76 },
      { id: 3, title: "La retro que parece perfecta", completed: true, score: 85 },
      { id: 4, title: "El bloqueo que nadie escala", completed: true, score: 70 },
      { id: 5, title: "El dev que se está apagando", completed: false, score: null },
      { id: 6, title: "La presión de velocidad", completed: false, score: null },
    ]
  }

  const { completed, total, averageScore, highlights, redFlags, challenges } = progressData
  const progressPercentage = (completed / total) * 100
  const isComplete = completed === total

  return (
    <div className="candidate-progress">
      <div className="progress-bg"></div>

      <div className="progress-container">
        <button onClick={() => nav("/challenges")} className="back-btn-progress">
          ← Volver a Challenges
        </button>

        <div className="progress-header">
          <div className="progress-badge">MI PROGRESO</div>
          <h1 className="progress-title">Tu Avance en el Assessment</h1>
          <p className="progress-subtitle">
            {isComplete
              ? "¡Completaste todos los challenges! Tu reporte está listo."
              : `Completaste ${completed} de ${total} challenges. ¡Seguí adelante!`
            }
          </p>
        </div>

        {/* Main Progress Card */}
        <div className="progress-main-card">
          <div className="progress-circle-section">
            <div className="circle-container">
              <svg className="progress-ring" width="180" height="180">
                <circle
                  className="progress-ring-bg"
                  cx="90"
                  cy="90"
                  r="75"
                  fill="none"
                  stroke="rgba(0, 212, 170, 0.1)"
                  strokeWidth="14"
                />
                <circle
                  className="progress-ring-fill"
                  cx="90"
                  cy="90"
                  r="75"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 75}`}
                  strokeDashoffset={`${2 * Math.PI * 75 * (1 - progressPercentage / 100)}`}
                  transform="rotate(-90 90 90)"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00d4aa" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="progress-circle-text">
                <div className="progress-percentage">{Math.round(progressPercentage)}%</div>
                <div className="progress-label">{completed}/{total} Completados</div>
              </div>
            </div>
          </div>

          <div className="progress-stats-section">
            <div className="stat-card-progress">
              <div className="stat-icon-progress">📊</div>
              <div className="stat-content-progress">
                <div className="stat-value-progress">{averageScore}%</div>
                <div className="stat-label-progress">Score Promedio</div>
              </div>
            </div>

            <div className="stat-card-progress">
              <div className="stat-icon-progress">⭐</div>
              <div className="stat-content-progress">
                <div className="stat-value-progress">{highlights}</div>
                <div className="stat-label-progress">Highlights</div>
              </div>
            </div>

            <div className="stat-card-progress">
              <div className="stat-icon-progress">⚠️</div>
              <div className="stat-content-progress">
                <div className="stat-value-progress">{redFlags}</div>
                <div className="stat-label-progress">Red Flags</div>
              </div>
            </div>
          </div>
        </div>

        {/* Challenges List */}
        <div className="challenges-list-section">
          <h2 className="section-title-progress">Detalle por Challenge</h2>
          <div className="challenges-grid-progress">
            {challenges.map((challenge) => (
              <div
                key={challenge.id}
                className={`challenge-item-progress ${challenge.completed ? 'completed' : 'pending'}`}
              >
                <div className="challenge-status-icon">
                  {challenge.completed ? '✓' : '○'}
                </div>
                <div className="challenge-info-progress">
                  <div className="challenge-title-progress">{challenge.title}</div>
                  <div className="challenge-meta-progress">
                    {challenge.completed ? (
                      <span className="challenge-score-progress">{challenge.score}% obtenido</span>
                    ) : (
                      <span className="challenge-pending-progress">Pendiente</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="progress-cta">
          {isComplete ? (
            <button className="btn-view-full-report" onClick={() => nav("/report/demo")}>
              📄 Ver Reporte Completo
            </button>
          ) : (
            <button className="btn-continue-challenges" onClick={() => nav("/challenges")}>
              Continuar Challenges →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
