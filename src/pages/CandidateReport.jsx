import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { T, QUALITY, DIM_LABELS } from "../theme"
import { getResults } from "../engine/supabase"
import { RadarChartComponent } from "../components"
import { getChallengeById } from "../data/challengesMetadata"
import { getProfile } from "../engine/candidateProfile"
import { getMockResults, seedMockJourney } from "../dev/seedMockJourney"
import { consolidateToMacro } from "../engine/macroDimensions"

// ID público de la demo. Entrar a /report/demo siembra automáticamente
// si no hay data y muestra el reporte sample.
const DEMO_CANDIDATE_ID = "demo"
import "./CandidateReport.css"

export default function CandidateReport() {
  const { id } = useParams()
  const nav = useNavigate()
  const finalView = false // ahora siempre se accede desde el dashboard del recruiter
  const [results, setResults] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadResults() {
      setLoading(true)

      // /report/demo: auto-siembra el journey mock si no hay data.
      // Garantiza que cualquier visitante (inversor, recruiter, prospect)
      // vea el reporte poblado al instante.
      if (id === DEMO_CANDIDATE_ID && !getMockResults(DEMO_CANDIDATE_ID)) {
        seedMockJourney(DEMO_CANDIDATE_ID)
      }

      // Mock candidates data hardcodeados (legacy demo del dashboard del recruiter)
      const candidatesData = {
        "candidate2": {
          name: "Carlos Ramírez",
          score: 78,
          dimensions: { facilitation: 82, process: 76, coaching: 75, systems: 79 },
          redFlags: 1,
          highlights: 4,
          completed: 6
        },
        "candidate3": {
          name: "Ana Torres",
          score: 92,
          dimensions: { facilitation: 94, process: 91, coaching: 90, systems: 93 },
          redFlags: 0,
          highlights: 8,
          completed: 6
        },
        "candidate4": {
          name: "Jorge Sánchez",
          score: 65,
          dimensions: { facilitation: 68, process: 64, coaching: 62, systems: 66 },
          redFlags: 2,
          highlights: 2,
          completed: 5
        },
        "candidate5": {
          name: "Laura Martínez",
          score: 81,
          dimensions: { facilitation: 85, process: 80, coaching: 78, systems: 82 },
          redFlags: 0,
          highlights: 5,
          completed: 6
        },
        "candidate6": {
          name: "Diego Fernández",
          score: 88,
          dimensions: { facilitation: 90, process: 87, coaching: 86, systems: 89 },
          redFlags: 0,
          highlights: 7,
          completed: 6
        },
        "candidate7": {
          name: "Patricia Ruiz",
          score: 72,
          dimensions: { facilitation: 76, process: 71, coaching: 70, systems: 73 },
          redFlags: 1,
          highlights: 3,
          completed: 6
        },
        "candidate8": {
          name: "Roberto Silva",
          score: 58,
          dimensions: { facilitation: 62, process: 58, coaching: 55, systems: 60 },
          redFlags: 3,
          highlights: 1,
          completed: 4
        }
      }

      // Generate mock results for all candidates
      const candidateData = candidatesData[id]
      if (candidateData) {
        // Helper to generate scores with variation
        const generateScores = (baseDims, variation = 5) => {
          return [
            { dimension: "Facilitation", score: Math.max(0, Math.min(100, baseDims.facilitation + (Math.random() - 0.5) * variation * 2)) },
            { dimension: "Process", score: Math.max(0, Math.min(100, baseDims.process + (Math.random() - 0.5) * variation * 2)) },
            { dimension: "Coaching", score: Math.max(0, Math.min(100, baseDims.coaching + (Math.random() - 0.5) * variation * 2)) },
            { dimension: "Systems", score: Math.max(0, Math.min(100, baseDims.systems + (Math.random() - 0.5) * variation * 2)) }
          ].map(s => ({ ...s, score: Math.round(s.score) }))
        }

        const getGrade = (avg) => {
          if (avg >= 80) return { letter: "A", avg, color: "#059669" }
          if (avg >= 60) return { letter: "B", avg, color: "#2563eb" }
          return { letter: "C", avg, color: "#ea580c" }
        }

        const generateFeedback = (avg, hasRedFlag) => {
          if (hasRedFlag && candidateData.redFlags > 0) {
            return [
              { phase: "context", quality: "red_flag", feedback: "Mostró dificultad para identificar señales clave del equipo" },
              { phase: "action", quality: "developing", feedback: "Las intervenciones no fueron del todo efectivas" }
            ]
          } else if (avg >= 85) {
            return [
              { phase: "context", quality: "expert", feedback: "Demostró excelente comprensión del contexto" },
              { phase: "action", quality: "expert", feedback: "Intervenciones altamente efectivas y bien fundamentadas" }
            ]
          } else if (avg >= 70) {
            return [
              { phase: "context", quality: "competent", feedback: "Buena lectura de la situación del equipo" },
              { phase: "action", quality: "competent", feedback: "Propuestas sólidas con margen de mejora" }
            ]
          } else {
            return [
              { phase: "context", quality: "developing", feedback: "Comprensión básica pero incompleta" },
              { phase: "action", quality: "developing", feedback: "Las intervenciones necesitan más profundidad" }
            ]
          }
        }

        const challenges = []
        for (let i = 1; i <= candidateData.completed; i++) {
          const scores = generateScores(candidateData.dimensions, 8)
          const avg = Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length)
          const hasRedFlag = candidateData.redFlags > 0 && i === candidateData.completed && Math.random() < 0.5

          challenges.push({
            challenge_id: i,
            played_at: new Date(Date.now() - (i * 3600000)).toISOString(),
            time_used: Math.floor(600 + Math.random() * 600),
            scores,
            feedback: generateFeedback(avg, hasRedFlag),
            grade: getGrade(avg)
          })
        }

        const mockResults = challenges
        setResults(mockResults)
        setLoading(false)
        return
      }

      // 1. Intentar leer mock results sembrados (modo dev / E2E)
      const mocked = getMockResults(id)
      if (mocked && mocked.length > 0) {
        setResults(mocked)
        try {
          setProfile(getProfile(id))
        } catch (e) {
          console.warn("Profile not found:", e)
        }
        setLoading(false)
        return
      }

      // 2. Fallback a Supabase
      const { data, error } = await getResults(id)
      if (error) {
        console.error("Error loading results:", error)
      } else {
        setResults(data || [])
      }

      // Cargar profile del candidato (localStorage por ahora, Supabase en MVP)
      try {
        const candidateProfile = getProfile(id)
        setProfile(candidateProfile)
      } catch (e) {
        console.warn("Profile not found:", e)
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

  // Consolidated scores: 6 macro dimensions SIEMPRE (radar + bars).
  // Si una dimensión no tiene data en ningún challenge se muestra con score 0
  // y se etiqueta como n/a en la card; en el radar queda en 0 para mantener
  // los 6 vértices del polígono.
  const consolidatedScores = consolidateToMacro(results)

  // El score global solo considera dimensiones con data (sampleCount > 0).
  const scoredDims = consolidatedScores.filter((d) => d.sampleCount > 0)
  const globalScore = scoredDims.length
    ? Math.round(scoredDims.reduce((a, b) => a + b.score, 0) / scoredDims.length)
    : 0

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
          <div className="back-buttons">
            {finalView ? (
              <button onClick={() => nav("/")} className="back-btn">
                ← Volver al inicio
              </button>
            ) : (
              <>
                <button onClick={() => nav("/dashboard")} className="back-btn">
                  ← Dashboard
                </button>
                <button onClick={() => nav("/challenges")} className="back-btn secondary">
                  Menú de Challenges
                </button>
              </>
            )}
          </div>

          <div className="candidate-info">
            <div className="candidate-avatar">
              {finalView ? "🎉" : id === DEMO_CANDIDATE_ID ? "✨" : id.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="candidate-name">
                {finalView
                  ? "¡Assessment completado!"
                  : id === DEMO_CANDIDATE_ID
                  ? "Reporte de demostración"
                  : id}
                {id === DEMO_CANDIDATE_ID && (
                  <span className="demo-badge">DEMO</span>
                )}
              </h1>
              <p className="candidate-subtitle">
                {finalView
                  ? "Acá están tus resultados consolidados"
                  : id === DEMO_CANDIDATE_ID
                  ? "Candidato de muestra del Sprint 1 del Equipo Setlist"
                  : "Scrum Master Assessment Report"}
              </p>
            </div>
          </div>

          <div className="report-meta">
            <div className="meta-item">
              <span className="meta-label">Challenges Completados</span>
              <span className="meta-value">{results.length}/5</span>
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

        {/* ═══ AI INSIGHTS — unificado y compacto ═══ */}
        {profile && (
          profile.communication_style ||
          (profile.insights?.patterns || []).length > 0 ||
          (profile.insights?.notable_moments || []).length > 0 ||
          (profile.ai_coach_usage?.total_calls || 0) > 0
        ) && (
          <div className="ai-insights-section">
            <h3 className="section-title-compact">
              <span className="ai-badge">🤖 AI</span> Insights generados durante el assessment
            </h3>

            {/* Row 1: 4 chips de stats rápidos */}
            <div className="ai-insights-stats-row">
              {profile.communication_style && (
                <div className="ai-insight-stat-chip">
                  <div className="ai-insight-stat-label">Estilo</div>
                  <div className="ai-insight-stat-value">
                    {profile.communication_style === "directive" && "🎯 Directivo"}
                    {profile.communication_style === "empathic" && "💚 Empático"}
                    {profile.communication_style === "analytical" && "📊 Analítico"}
                    {profile.communication_style === "balanced" && "⚖️ Balanceado"}
                    {profile.communication_style === "passive" && "🌫️ Pasivo"}
                  </div>
                </div>
              )}
              <div className="ai-insight-stat-chip">
                <div className="ai-insight-stat-label">Consultas al coach</div>
                <div className="ai-insight-stat-value">
                  {profile.ai_coach_usage?.total_calls || 0}
                </div>
              </div>
              <div className="ai-insight-stat-chip">
                <div className="ai-insight-stat-label">Uso eficiente de IA</div>
                <div className="ai-insight-stat-value">
                  {(profile.challenge_history || []).filter((c) => c.ai_fluency_score >= 3).length}
                  /{(profile.challenge_history || []).length || 5}
                </div>
              </div>
              <div className="ai-insight-stat-chip">
                <div className="ai-insight-stat-label">Patrones</div>
                <div className="ai-insight-stat-value">
                  {(profile.insights?.patterns || []).length}
                </div>
              </div>
            </div>

            {/* Row 2: 3 columnas — Fortalezas · Oportunidades · Momentos */}
            <div className="ai-insights-cols">
              <div className="ai-insights-col strengths">
                <div className="ai-insights-col-title" style={{ color: "#059669" }}>
                  ✓ Fortalezas
                </div>
                <ul className="ai-insights-col-list">
                  {(profile.insights?.strengths || []).slice(0, 4).map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                  {(profile.insights?.strengths || []).length === 0 && (
                    <li className="muted">Sin fortalezas destacadas</li>
                  )}
                </ul>
              </div>

              <div className="ai-insights-col weaknesses">
                <div className="ai-insights-col-title" style={{ color: "#ea580c" }}>
                  ⚠ Oportunidades
                </div>
                <ul className="ai-insights-col-list">
                  {(profile.insights?.weaknesses || []).slice(0, 4).map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                  {(profile.insights?.weaknesses || []).length === 0 && (
                    <li className="muted">Sin áreas críticas</li>
                  )}
                </ul>
              </div>

              <div className="ai-insights-col moments">
                <div className="ai-insights-col-title" style={{ color: "#2563eb" }}>
                  ⭐ Momentos destacados
                </div>
                <ul className="ai-insights-col-list">
                  {(profile.insights?.notable_moments || []).slice(-4).map((m, i) => (
                    <li key={i}>
                      <span className="moment-tag">{m.challenge}</span> {m.note}
                    </li>
                  ))}
                  {(profile.insights?.notable_moments || []).length === 0 && (
                    <li className="muted">Sin momentos cross-challenge</li>
                  )}
                </ul>
              </div>
            </div>

            {/* Row 3: AI Coach por challenge (1 línea cada uno) */}
            {(profile.challenge_history || []).filter((c) => c.ai_fluency_rationale).length > 0 && (
              <details className="ai-coach-details">
                <summary>
                  Cómo usó el AI Coach en cada challenge ({(profile.challenge_history || []).length})
                </summary>
                <div className="ai-coach-list">
                  {(profile.challenge_history || [])
                    .filter((c) => c.ai_fluency_rationale)
                    .map((c, i) => (
                      <div key={i} className="ai-coach-list-item">
                        <span className="ai-coach-challenge">{c.challenge_name || c.challenge}</span>
                        <span
                          className={`ai-fluency-score score-${
                            c.ai_fluency_score >= 3
                              ? "high"
                              : c.ai_fluency_score >= 2
                              ? "mid"
                              : "low"
                          }`}
                        >
                          {c.ai_fluency_score}/4
                        </span>
                        <span className="ai-coach-rationale">{c.ai_fluency_rationale}</span>
                      </div>
                    ))}
                </div>
              </details>
            )}
          </div>
        )}

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
            {[...consolidatedScores]
              .sort((a, b) => (b.sampleCount === 0 ? -1 : a.sampleCount === 0 ? 1 : b.score - a.score))
              .map((s) => {
                const noData = s.sampleCount === 0
                return (
                  <div key={s.dimension} className="dimension-row-compact">
                    <div className="dimension-name-compact">{s.dimension}</div>
                    <div className="dimension-bar-compact">
                      <div
                        className="dimension-fill-compact"
                        style={{
                          width: noData ? "0%" : `${s.score}%`,
                          background: noData
                            ? "#cbd5e1"
                            : s.score >= 75
                            ? T.green
                            : s.score >= 50
                            ? T.blue
                            : s.score >= 25
                            ? T.orange
                            : T.red,
                        }}
                      />
                    </div>
                    <div
                      className="dimension-score-compact"
                      style={{
                        color: noData
                          ? "#94a3b8"
                          : s.score >= 75
                          ? T.green
                          : s.score >= 50
                          ? T.blue
                          : s.score >= 25
                          ? T.orange
                          : T.red,
                      }}
                    >
                      {noData ? "n/a" : `${s.score}%`}
                    </div>
                  </div>
                )
              })}
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
