import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { T, QUALITY, DIM_LABELS } from "../theme"
import { getResults } from "../engine/supabase"
import { RadarChartComponent } from "../components"
import { getChallengeById } from "../data/challengesMetadata"
import "./CandidateReport.css"

export default function CandidateReport() {
  const { id } = useParams()
  const nav = useNavigate()
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadResults() {
      setLoading(true)

      // Mock data for demo/test candidate
      if (id === "demo" || id === "test") {
        const mockResults = [
          {
            challenge_id: 1,
            played_at: new Date().toISOString(),
            time_used: 720,
            scores: [
              { dimension: "Facilitation", score: 85 },
              { dimension: "Process", score: 78 },
              { dimension: "Coaching", score: 82 },
              { dimension: "Systems", score: 75 }
            ],
            feedback: [
              { phase: "context", quality: "expert", feedback: "Excelente lectura del contexto del equipo" },
              { phase: "action", quality: "competent", feedback: "Buenas preguntas abiertas, podría profundizar más" }
            ],
            grade: { letter: "A", avg: 80, color: "#059669" }
          },
          {
            challenge_id: 2,
            played_at: new Date(Date.now() - 3600000).toISOString(),
            time_used: 900,
            scores: [
              { dimension: "Facilitation", score: 92 },
              { dimension: "Process", score: 88 },
              { dimension: "Coaching", score: 85 },
              { dimension: "Systems", score: 80 }
            ],
            feedback: [
              { phase: "workshop", quality: "expert", feedback: "Facilitación excepcional del workshop" },
              { phase: "agreements", quality: "expert", feedback: "Acuerdos claros y concretos" }
            ],
            grade: { letter: "A", avg: 86, color: "#059669" }
          },
          {
            challenge_id: 3,
            played_at: new Date(Date.now() - 7200000).toISOString(),
            time_used: 600,
            scores: [
              { dimension: "Facilitation", score: 70 },
              { dimension: "Process", score: 75 },
              { dimension: "Coaching", score: 68 },
              { dimension: "Systems", score: 72 }
            ],
            feedback: [
              { phase: "context", quality: "developing", feedback: "Podría hacer preguntas más profundas" },
              { phase: "action", quality: "competent", feedback: "Buen manejo de la situación" }
            ],
            grade: { letter: "B", avg: 71, color: "#2563eb" }
          },
          {
            challenge_id: 4,
            played_at: new Date(Date.now() - 10800000).toISOString(),
            time_used: 840,
            scores: [
              { dimension: "Facilitation", score: 88 },
              { dimension: "Process", score: 90 },
              { dimension: "Coaching", score: 82 },
              { dimension: "Systems", score: 85 }
            ],
            feedback: [
              { phase: "estimation", quality: "expert", feedback: "Excelente facilitación del planning poker" },
              { phase: "prioritization", quality: "expert", feedback: "Ayudó al equipo a priorizar efectivamente" }
            ],
            grade: { letter: "A", avg: 86, color: "#059669" }
          }
        ]
        setResults(mockResults)
        setLoading(false)
        return
      }

      const { data, error } = await getResults(id)
      if (error) {
        console.error("Error loading results:", error)
      } else {
        setResults(data || [])
      }
      setLoading(false)
    }
    loadResults()
  }, [id])

  if (loading) {
    return (
      <div className="report-loading">
        <div className="loading-spinner"></div>
        <p>Cargando reporte...</p>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="report-empty">
        <h2>No hay resultados para este candidato</h2>
        <p>El candidato aún no ha completado ningún challenge.</p>
        <button onClick={() => nav("/challenges")} className="btn-primary">
          Ir a Challenges
        </button>
      </div>
    )
  }

  // Calculate consolidated scores
  const allDimensions = {}
  results.forEach(r => {
    r.scores.forEach(s => {
      if (!allDimensions[s.dimension]) {
        allDimensions[s.dimension] = []
      }
      allDimensions[s.dimension].push(s.score)
    })
  })

  const consolidatedScores = Object.entries(allDimensions).map(([dimension, scores]) => ({
    dimension,
    score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    fullMark: 100
  }))

  const globalScore = Math.round(
    consolidatedScores.reduce((a, b) => a + b.score, 0) / consolidatedScores.length
  )

  const globalGrade = globalScore >= 80 ? { letter: "A", label: "Scrum Master Experto", color: T.green }
    : globalScore >= 60 ? { letter: "B", label: "Scrum Master Competente", color: T.blue }
    : globalScore >= 40 ? { letter: "C", label: "Scrum Master en Desarrollo", color: T.orange }
    : { letter: "D", label: "Necesita Crecimiento Significativo", color: T.red }

  // Extract red flags and highlights
  const redFlags = []
  const highlights = []
  results.forEach((r, idx) => {
    if (r.feedback) {
      r.feedback.forEach(fb => {
        if (fb.quality === "red_flag") {
          redFlags.push({ challenge: idx + 1, ...fb })
        } else if (fb.quality === "expert") {
          highlights.push({ challenge: idx + 1, ...fb })
        }
      })
    }
  })

  const totalTime = results.reduce((sum, r) => sum + (r.time_used || 0), 0)
  const avgTime = results.length > 0 ? Math.round(totalTime / results.length / 60) : 0

  // Seniority level classification
  const seniorityLevel = (() => {
    const consistentPerformance = results.every(r => r.grade.avg >= 70)
    const hasExpertDimensions = consolidatedScores.filter(s => s.score >= 85).length >= 2
    const lowVariance = Math.max(...consolidatedScores.map(s => s.score)) - Math.min(...consolidatedScores.map(s => s.score)) < 25

    if (globalScore >= 85 && redFlags.length === 0 && hasExpertDimensions && consistentPerformance) {
      return { level: "lead", label: "Scrum Master Lead", color: "#7c3aed", description: "Nivel experto en múltiples dimensiones, listo para liderar equipos y mentorar otros SMs" }
    } else if (globalScore >= 75 && redFlags.length <= 1 && consistentPerformance) {
      return { level: "senior", label: "Scrum Master Senior", color: "#059669", description: "Performance sólida y consistente, capaz de manejar situaciones complejas de forma autónoma" }
    } else if (globalScore >= 60 && globalScore < 75) {
      return { level: "semisenior", label: "Scrum Master Semi-Senior", color: "#2563eb", description: "Competencias fundamentales establecidas, requiere mentoría en situaciones complejas" }
    } else {
      return { level: "junior", label: "Scrum Master Junior", color: "#f59e0b", description: "En desarrollo, requiere supervisión y entrenamiento continuo" }
    }
  })()

  // Hiring recommendation logic
  const hiringRecommendation =
    globalScore >= 80 && redFlags.length === 0 ? { status: "recommend", label: "Recomendar para contratar", icon: "✅", color: "#059669" }
    : globalScore >= 70 && redFlags.length <= 1 ? { status: "maybe", label: "Recomendar con reservas", icon: "⚠️", color: "#f59e0b" }
    : { status: "no", label: "No recomendar", icon: "❌", color: "#dc2626" }

  return (
    <div className="candidate-report">
      <div className="report-container">
        {/* Header */}
        <div className="report-header">
          <button onClick={() => nav("/challenges")} className="back-btn">
            ← Volver al menú
          </button>

          <div className="candidate-info">
            <div className="candidate-avatar">
              {id.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="candidate-name">{id}</h1>
              <p className="candidate-subtitle">Scrum Master Assessment Report</p>
            </div>
          </div>

          <div className="report-meta">
            <div className="meta-item">
              <span className="meta-label">Challenges Completados</span>
              <span className="meta-value">{results.length}/4</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Tiempo Promedio</span>
              <span className="meta-value">{avgTime} min</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Fecha</span>
              <span className="meta-value">{new Date(results[0].played_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Compact Score + Seniority + Hiring Decision */}
        <div className="score-hiring-row">
          <div className="score-card-compact">
            <div className="score-badge-compact" style={{ borderColor: globalGrade.color }}>
              <div className="score-letter-compact" style={{ color: globalGrade.color }}>{globalGrade.letter}</div>
              <div className="score-percentage-compact">{globalScore}%</div>
            </div>
            <div className="score-label-compact">{globalGrade.label}</div>
          </div>

          <div className="seniority-card" style={{ borderColor: seniorityLevel.color, background: `${seniorityLevel.color}10` }}>
            <div className="seniority-header">
              <div className="seniority-badge" style={{ background: seniorityLevel.color }}>
                {seniorityLevel.level.toUpperCase()}
              </div>
              <div className="seniority-label" style={{ color: seniorityLevel.color }}>
                {seniorityLevel.label}
              </div>
            </div>
            <div className="seniority-description">
              {seniorityLevel.description}
            </div>
          </div>

          <div className="hiring-decision" style={{ borderColor: hiringRecommendation.color, background: `${hiringRecommendation.color}10` }}>
            <div className="hiring-icon" style={{ color: hiringRecommendation.color }}>{hiringRecommendation.icon}</div>
            <div className="hiring-text">
              <div className="hiring-label" style={{ color: hiringRecommendation.color }}>{hiringRecommendation.label}</div>
              <div className="hiring-reason">
                {redFlags.length > 0 ? `${redFlags.length} red flag${redFlags.length > 1 ? 's' : ''}` : "Sin red flags"}
                {" • "}
                {highlights.length} highlight{highlights.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          <div className="radar-chart-compact">
            <RadarChartComponent data={consolidatedScores} height={140} />
          </div>
        </div>

        {/* Journey Cards */}
        <div className="journey-section">
          <h3 className="section-title-compact">Journey através del Equipo Setlist</h3>
          <div className="journey-cards-grid">
            {results.sort((a, b) => a.challenge_id - b.challenge_id).map((result) => {
              const challenge = getChallengeById(result.challenge_id)
              if (!challenge) return null

              const gradeColor = result.grade.avg >= 75 ? "#059669" : result.grade.avg >= 50 ? "#2563eb" : result.grade.avg >= 25 ? "#ea580c" : "#dc2626"

              // Generate qualitative insights based on scores
              const topDimension = result.scores.sort((a, b) => b.score - a.score)[0]
              const weakDimension = result.scores.sort((a, b) => a.score - b.score)[0]

              const insights = {
                strength: topDimension.score >= 80
                  ? `Destacó en ${topDimension.dimension} (${topDimension.score}%) mostrando capacidad para manejar ${challenge.context.toLowerCase()}.`
                  : `Nivel competente en ${topDimension.dimension} (${topDimension.score}%) durante ${challenge.context.toLowerCase()}.`,
                development: weakDimension.score < 60
                  ? `Necesita reforzar ${weakDimension.dimension} (${weakDimension.score}%) en contextos similares.`
                  : weakDimension.score < 75
                  ? `${weakDimension.dimension} (${weakDimension.score}%) es un área de desarrollo potencial.`
                  : `Performance balanceada sin gaps significativos en esta situación.`
              }

              return (
                <div key={result.challenge_id} className="journey-card" style={{ borderTopColor: challenge.color }}>
                  <div className="journey-card-header">
                    <div className="journey-card-left">
                      <div className="journey-card-icon" style={{ color: challenge.color }}>{challenge.icon}</div>
                      <div className="journey-card-info">
                        <div className="journey-card-sprint" style={{ color: challenge.color }}>{challenge.sprint}</div>
                        <div className="journey-card-title">{challenge.title}</div>
                        <div className="journey-card-context">{challenge.context}</div>
                      </div>
                    </div>
                    <div className="journey-card-grade" style={{ background: gradeColor }}>
                      <div className="journey-grade-letter">{result.grade.letter}</div>
                      <div className="journey-grade-score">{Math.round(result.grade.avg)}%</div>
                    </div>
                  </div>

                  <div className="journey-card-insights">
                    <div className="journey-insight-item">
                      <span className="journey-insight-icon" style={{ color: "#059669" }}>✓</span>
                      <span className="journey-insight-text">{insights.strength}</span>
                    </div>
                    <div className="journey-insight-item">
                      <span className="journey-insight-icon" style={{ color: weakDimension.score < 60 ? "#dc2626" : "#64748b" }}>
                        {weakDimension.score < 60 ? "!" : "→"}
                      </span>
                      <span className="journey-insight-text">{insights.development}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Compact Dimensions + Insights Grid */}
        <div className="insights-grid">
          {/* Dimensions Column */}
          <div className="dimensions-compact">
            <h3 className="section-title-compact">Dimensiones</h3>
            {consolidatedScores.sort((a, b) => b.score - a.score).map(s => (
              <div key={s.dimension} className="dimension-row-compact">
                <div className="dimension-name-compact">{s.dimension}</div>
                <div className="dimension-bar-compact">
                  <div
                    className="dimension-fill-compact"
                    style={{
                      width: `${s.score}%`,
                      background: s.score >= 75 ? T.green : s.score >= 50 ? T.blue : s.score >= 25 ? T.orange : T.red
                    }}
                  />
                </div>
                <div className="dimension-score-compact" style={{
                  color: s.score >= 75 ? T.green : s.score >= 50 ? T.blue : s.score >= 25 ? T.orange : T.red
                }}>{s.score}%</div>
              </div>
            ))}
          </div>

          {/* Insights Column */}
          <div className="insights-compact">
            {/* Strengths */}
            <div className="insight-card-compact strengths">
              <div className="insight-header-compact">
                <span className="insight-icon">✅</span>
                <span className="insight-title">Top Skills</span>
              </div>
              <div className="insight-list-compact">
                {consolidatedScores
                  .filter(s => s.score >= 75)
                  .sort((a, b) => b.score - a.score)
                  .slice(0, 2)
                  .map(s => (
                    <div key={s.dimension} className="insight-item-compact">
                      <strong>{s.dimension}</strong> <span style={{ color: T.green }}>{s.score}%</span>
                    </div>
                  ))}
                {consolidatedScores.filter(s => s.score >= 75).length === 0 && (
                  <div className="insight-item-compact">Competencia sólida general</div>
                )}
              </div>
            </div>

            {/* Areas to develop */}
            <div className="insight-card-compact attention">
              <div className="insight-header-compact">
                <span className="insight-icon">⚠️</span>
                <span className="insight-title">A Desarrollar</span>
              </div>
              <div className="insight-list-compact">
                {consolidatedScores
                  .filter(s => s.score < 60)
                  .sort((a, b) => a.score - b.score)
                  .slice(0, 2)
                  .map(s => (
                    <div key={s.dimension} className="insight-item-compact">
                      <strong>{s.dimension}</strong> <span style={{ color: T.orange }}>{s.score}%</span>
                    </div>
                  ))}
                {consolidatedScores.filter(s => s.score < 60).length === 0 && (
                  <div className="insight-item-compact">Sin áreas críticas</div>
                )}
              </div>
            </div>

            {/* Interview questions */}
            <div className="insight-card-compact questions">
              <div className="insight-header-compact">
                <span className="insight-icon">💬</span>
                <span className="insight-title">Preguntas Clave</span>
              </div>
              <div className="insight-list-compact">
                {consolidatedScores.find(s => s.score < 60) ? (
                  <div className="insight-item-compact">
                    Profundizar en <strong>{consolidatedScores.find(s => s.score < 60)?.dimension}</strong>
                  </div>
                ) : (
                  <div className="insight-item-compact">
                    Desafíos como SM y métricas de éxito
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Flags and Highlights - Compact Side by Side */}
        {(redFlags.length > 0 || highlights.length > 0) && (
          <div className="flags-highlights-grid">
            {redFlags.length > 0 && (
              <div className="flags-compact red-flags">
                <h3 className="section-title-compact">
                  ⚠️ Red Flags ({redFlags.length})
                </h3>
                {redFlags.slice(0, 3).map((flag, i) => {
                  const challenge = getChallengeById(flag.challenge)
                  return (
                    <div key={i} className="flag-item-compact">
                      <div className="flag-header-compact">
                        <span style={{ color: challenge?.color || "#666" }}>{challenge?.shortTitle || `Challenge ${flag.challenge}`}</span>
                      </div>
                      <p className="flag-text-compact">{flag.feedback}</p>
                    </div>
                  )
                })}
              </div>
            )}

            {highlights.length > 0 && (
              <div className="flags-compact highlights">
                <h3 className="section-title-compact">
                  ⭐ Highlights ({highlights.length})
                </h3>
                {highlights.slice(0, 3).map((highlight, i) => {
                  const challenge = getChallengeById(highlight.challenge)
                  return (
                    <div key={i} className="flag-item-compact">
                      <div className="flag-header-compact">
                        <span style={{ color: challenge?.color || "#666" }}>{challenge?.shortTitle || `Challenge ${highlight.challenge}`}</span>
                      </div>
                      <p className="flag-text-compact">{highlight.feedback}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Challenges Breakdown - Compact Grid */}
        <div className="challenges-section">
          <h3 className="section-title-compact">Challenges Completados</h3>
          <div className="challenges-grid">
            {results.sort((a, b) => a.challenge_id - b.challenge_id).map((result) => {
              const challenge = getChallengeById(result.challenge_id)
              if (!challenge) return null

              return (
                <div key={result.challenge_id} className="challenge-card-compact" style={{ borderLeftColor: challenge.color }}>
                  <div className="challenge-header-compact">
                    <div className="challenge-icon-compact" style={{ color: challenge.color }}>{challenge.icon}</div>
                    <div className="challenge-info-compact">
                      <div className="challenge-title-compact">{challenge.shortTitle}</div>
                      <div className="challenge-context-compact">{challenge.sprint}</div>
                    </div>
                    <div className="challenge-grade-compact" style={{ color: result.grade.color }}>
                      {result.grade.letter}
                    </div>
                  </div>

                  <div className="challenge-scores-compact">
                    {result.scores.slice(0, 3).map(s => (
                      <div key={s.dimension} className="score-chip-compact">
                        <span className="chip-label-compact">{s.dimension}</span>
                        <span className="chip-value-compact" style={{
                          color: s.score >= 75 ? T.green : s.score >= 50 ? T.blue : s.score >= 25 ? T.orange : T.red
                        }}>{s.score}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="report-footer">
          <p className="footer-brand">🤖 Generated with Claude Code & SMatch</p>
          <div className="footer-actions">
            <button onClick={() => nav("/challenges")} className="btn-secondary">
              Volver a Challenges
            </button>
            <button onClick={() => window.print()} className="btn-primary">
              📄 Exportar PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
