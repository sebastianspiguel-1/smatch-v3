import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { T, QUALITY, DIM_LABELS } from "../theme"
import { getResults } from "../engine/supabase"
import { RadarChartComponent } from "../components"
import { getChallengeById } from "../data/challengesMetadata"
import { getProfile, syncProfileFromCloud } from "../engine/candidateProfile"
import { getMockResults, seedMockJourney } from "../dev/seedMockJourney"
import { consolidateToMacro } from "../engine/macroDimensions"

// ID público de la demo. Entrar a /report/demo siembra automáticamente
// si no hay data y muestra el reporte sample.
const DEMO_CANDIDATE_ID = "demo"
import "./CandidateReport.css"

// Deriva la "calidad" de una respuesta. Los mocks traen fb.quality; la data
// real trae fb.scores (sub-dimensiones 1-4) → la promediamos a un nivel.
function deriveQuality(fb) {
  if (fb.quality) return fb.quality
  const vals = fb.scores ? Object.values(fb.scores).filter((v) => typeof v === "number" && v > 0) : []
  if (!vals.length) return null
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length
  if (avg <= 1.6) return "red_flag"
  if (avg >= 3.5) return "expert"
  if (avg >= 2.6) return "competent"
  return "developing"
}

// Texto visible de una respuesta: el feedback del mock, o lo que dijo/hizo el candidato.
const fbText = (fb) => fb.feedback || fb.message || ""

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

      // Cargar profile del candidato: primero Supabase (cross-device), fallback local
      try {
        const candidateProfile = await syncProfileFromCloud(id)
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
    if (!r.feedback) return
    r.feedback.forEach(fb => {
      const q = deriveQuality(fb)
      const text = fbText(fb)
      if (!text) return
      if (q === "red_flag") {
        redFlags.push({ challenge: idx + 1, ...fb, feedback: text })
      } else if (q === "expert") {
        highlights.push({ challenge: idx + 1, ...fb, feedback: text })
      }
    })
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

        {/* ═══ VEREDICTO — tarjeta ejecutiva (ancla visual) ═══ */}
        <div className="report-verdict">
          <div className="verdict-eyebrow">Reporte de Assessment · Sprint 1 · Equipo Setlist</div>

          <div className="verdict-main">
            <div className="verdict-score">
              <span className="verdict-score-num">{globalScore}</span>
              <span className="verdict-score-max">/100</span>
              <span className="verdict-level-pill" style={{ background: globalGrade.color }}>
                {globalGrade.label.replace("Scrum Master ", "")}
              </span>
            </div>
            <div className="verdict-seniority">
              <div className="verdict-seniority-label">{seniorityLevel.label}</div>
              <div className="verdict-seniority-desc">{seniorityLevel.description}</div>
            </div>
          </div>

          <div className="verdict-divider" />

          <div className="verdict-hiring">
            <span className="verdict-dot" style={{ background: hiringRecommendation.color }} />
            <div className="verdict-hiring-text">
              <span className="verdict-hiring-label">{hiringRecommendation.label}</span>
              <span className="verdict-hiring-reason">
                {redFlags.length > 0 ? `${redFlags.length} red flag${redFlags.length > 1 ? 's' : ''}` : "Sin red flags"}
                {" · "}
                {highlights.length} highlight{highlights.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* PERFIL DE COMPETENCIAS — radar + barras (clave para el recruiter) */}
        <div className="competency-section">
          <div className="competency-head">
            <h3 className="section-title-compact">Perfil de competencias</h3>
            <div className="competency-legend">
              <span style={{ color: T.green }}>● Fuerte</span>
              <span style={{ color: T.blue }}>● Sólido</span>
              <span style={{ color: T.orange }}>● En desarrollo</span>
              <span style={{ color: T.red }}>● A reforzar</span>
            </div>
          </div>
          <div className="competency-grid">
            <div className="competency-radar">
              <RadarChartComponent data={consolidatedScores} size={320} />
            </div>
            <div className="competency-bars">
              {[...consolidatedScores]
                .sort((a, b) => (b.sampleCount === 0 ? -1 : a.sampleCount === 0 ? 1 : b.score - a.score))
                .map((s) => {
                  const noData = s.sampleCount === 0
                  const col = noData ? "#94a3b8" : s.score >= 75 ? T.green : s.score >= 50 ? T.blue : s.score >= 25 ? T.orange : T.red
                  return (
                    <div key={s.dimension} className="dimension-row-compact">
                      <div className="dimension-name-compact">{s.dimension}</div>
                      <div className="dimension-bar-compact">
                        <div className="dimension-fill-compact" style={{ width: noData ? "0%" : `${s.score}%`, background: noData ? "#cbd5e1" : col }} />
                      </div>
                      <div className="dimension-score-compact" style={{ color: col }}>{noData ? "n/a" : `${s.score}%`}</div>
                    </div>
                  )
                })}
            </div>
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
            <div className="ai-eyebrow">El diferenciador Smatch</div>
            <h3 className="ai-headline">Cómo usó la IA durante el assessment</h3>
            <p className="ai-synthesis">
              {(() => {
                const calls = profile.ai_coach_usage?.total_calls || 0
                const hist = profile.challenge_history || []
                const eff = hist.filter((c) => c.ai_fluency_score >= 3).length
                const styleMap = { directive: "directivo", empathic: "empático", analytical: "analítico", balanced: "balanceado", passive: "pasivo" }
                const parts = []
                if (calls > 0) parts.push(`Consultó al asistente ${calls} ${calls === 1 ? "vez" : "veces"} durante el assessment.`)
                if (hist.length > 0) parts.push(`En ${eff} de ${hist.length} challenges el uso de IA fue eficiente.`)
                if (styleMap[profile.communication_style]) parts.push(`Estilo de trabajo ${styleMap[profile.communication_style]}.`)
                return parts.join(" ") || "Sin uso de IA registrado en este assessment."
              })()}
            </p>

            <div className="ai-stats">
              <div className="ai-stat">
                <div className="ai-stat-num">
                  {(profile.challenge_history || []).filter((c) => c.ai_fluency_score >= 3).length}
                  <span className="ai-stat-den">/{(profile.challenge_history || []).length || 5}</span>
                </div>
                <div className="ai-stat-label">Uso eficiente de IA</div>
              </div>
              <div className="ai-stat-sep" />
              <div className="ai-stat">
                <div className="ai-stat-num">{profile.ai_coach_usage?.total_calls || 0}</div>
                <div className="ai-stat-label">Consultas a Lyra</div>
              </div>
              <div className="ai-stat-sep" />
              <div className="ai-stat">
                <div className="ai-stat-num">
                  {profile.communication_style === "directive" && "Directivo"}
                  {profile.communication_style === "empathic" && "Empático"}
                  {profile.communication_style === "analytical" && "Analítico"}
                  {profile.communication_style === "balanced" && "Balanceado"}
                  {profile.communication_style === "passive" && "Pasivo"}
                  {!profile.communication_style && "—"}
                </div>
                <div className="ai-stat-label">Estilo de comunicación</div>
              </div>
            </div>

            <div className="ai-cols">
              <div className="ai-col">
                <div className="ai-col-title" style={{ color: "#059669" }}>Fortalezas</div>
                <ul className="ai-col-list strengths">
                  {(profile.insights?.strengths || []).slice(0, 4).map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                  {(profile.insights?.strengths || []).length === 0 && (
                    <li className="muted">Sin fortalezas destacadas</li>
                  )}
                </ul>
              </div>
              <div className="ai-col">
                <div className="ai-col-title" style={{ color: "#ea580c" }}>Oportunidades</div>
                <ul className="ai-col-list weaknesses">
                  {(profile.insights?.weaknesses || []).slice(0, 4).map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                  {(profile.insights?.weaknesses || []).length === 0 && (
                    <li className="muted">Sin áreas críticas</li>
                  )}
                </ul>
              </div>
              <div className="ai-col">
                <div className="ai-col-title" style={{ color: "#2563eb" }}>Momentos destacados</div>
                <ul className="ai-col-list moments">
                  {(profile.insights?.notable_moments || []).slice(-4).map((m, i) => (
                    <li key={i}>
                      <span className="ai-moment-tag">{m.challenge}</span> {m.note}
                    </li>
                  ))}
                  {(profile.insights?.notable_moments || []).length === 0 && (
                    <li className="muted">Sin momentos cross-challenge</li>
                  )}
                </ul>
              </div>
            </div>

            {(profile.challenge_history || []).filter((c) => c.ai_fluency_rationale).length > 0 && (
              <div className="ai-bychallenge">
                <div className="ai-bychallenge-title">Uso de IA por challenge</div>
                <div className="ai-bychallenge-list">
                  {(profile.challenge_history || [])
                    .filter((c) => c.ai_fluency_rationale)
                    .map((c, i) => {
                      const sc = c.ai_fluency_score
                      const scol = sc >= 3 ? "#059669" : sc >= 2 ? "#ea580c" : "#dc2626"
                      return (
                        <div key={i} className="ai-bychallenge-row">
                          <span className="ai-bychallenge-name">{c.challenge_name || c.challenge}</span>
                          <span className="ai-bychallenge-score" style={{ color: scol }}>{sc}/4</span>
                          <span className="ai-bychallenge-rationale">{c.ai_fluency_rationale}</span>
                        </div>
                      )
                    })}
                </div>
              </div>
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
          {/* Insights Column */}
          <div className="insights-compact">
            {/* Strengths */}
            <div className="insight-card-compact strengths">
              <div className="insight-header-compact">
                <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: T.green }} />
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
                <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: T.orange }} />
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
                <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: T.blue }} />
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
                  <span style={{ display: "inline-block", width: 9, height: 9, borderRadius: "50%", background: T.red, marginRight: 8, verticalAlign: "middle" }} />
                  Red Flags ({redFlags.length})
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
                  <span style={{ display: "inline-block", width: 9, height: 9, borderRadius: "50%", background: T.green, marginRight: 8, verticalAlign: "middle" }} />
                  Highlights ({highlights.length})
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

        {/* Evidencia por respuesta — qué dijo y cómo se evaluó */}
        <div className="challenges-section">
          <h3 className="section-title-compact">Evidencia — qué dijo y cómo se evaluó</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {results.sort((a, b) => a.challenge_id - b.challenge_id).map((result) => {
              const challenge = getChallengeById(result.challenge_id)
              if (!challenge) return null
              const items = (result.feedback || []).filter((fb) => fbText(fb).trim())
              if (!items.length) return null
              return (
                <details key={result.challenge_id} style={{ background: T.panel, border: `1px solid ${T.border}`, borderLeft: `4px solid ${challenge.color}`, borderRadius: T.radiusMd, padding: "12px 16px", boxShadow: T.shadowCard }}>
                  <summary style={{ cursor: "pointer", fontWeight: 800, color: T.navy, fontSize: 14, display: "flex", alignItems: "center", gap: 8, listStyle: "none" }}>
                    <span style={{ color: challenge.color }}>{challenge.icon}</span>
                    {challenge.shortTitle}
                    <span style={{ marginLeft: "auto", fontSize: 12, color: T.dim, fontWeight: 600 }}>{items.length} respuestas</span>
                  </summary>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
                    {items.map((fb, i) => {
                      const q = deriveQuality(fb)
                      const qm = q ? QUALITY[q] : null
                      const subs = fb.scores ? Object.entries(fb.scores).filter(([, v]) => typeof v === "number" && v > 0) : []
                      return (
                        <div key={i} style={{ background: T.card, borderRadius: 8, padding: "10px 12px", border: `1px solid ${T.border}` }}>
                          <div style={{ fontSize: 13, color: T.text, lineHeight: 1.5, marginBottom: subs.length || qm ? 8 : 0 }}>"{fbText(fb)}"</div>
                          {(qm || subs.length > 0) && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                              {qm && (
                                <span style={{ fontSize: 11, fontWeight: 800, color: qm.color, background: `${qm.color}1a`, border: `1px solid ${qm.color}40`, borderRadius: 6, padding: "2px 8px" }}>{qm.label}</span>
                              )}
                              {subs.map(([k, v]) => (
                                <span key={k} style={{ fontSize: 11, color: T.dim, background: "rgba(15,23,42,0.04)", borderRadius: 6, padding: "2px 8px" }}>{DIM_LABELS[k] || k} · {v}/4</span>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </details>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="report-footer">
          <p className="footer-brand">Smatch · Assessment de Scrum Master</p>
          <div className="footer-actions">
            <button onClick={() => nav("/challenges")} className="btn-secondary">
              Volver a Challenges
            </button>
            <button onClick={() => window.print()} className="btn-primary">
              Exportar PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
