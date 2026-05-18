import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { T } from "../theme"
import { computeScores, getGrade } from "../engine/ai"
import { saveResult } from "../engine/supabase"
import { Avatar, TopBar } from "../components"
import ChallengeComplete from "../components/ChallengeComplete"
import TeamPanel from "../components/TeamPanel"
import { markChallengeComplete, isLastChallenge } from "../utils/progressTracker"
import {
  TEAM,
  MEMBER_MAP,
  STAKEHOLDERS,
  STAKEHOLDER_MAP,
  VELOCITY_DATA,
  INVESTIGATION_METRICS,
  PREPARATION_ARGUMENTS,
  MEETING_STAGES,
  MEETING_OUTCOMES,
  DIMENSIONS,
} from "../data/challenge05"
import "./Challenge05.css"

export default function Challenge05() {
  const nav = useNavigate()
  const [phase, setPhase] = useState("context")
  const [selectedMetrics, setSelectedMetrics] = useState([])
  const [preparedArguments, setPreparedArguments] = useState([])
  const [currentStage, setCurrentStage] = useState("opening")
  const [paulaMood, setPaulaMood] = useState({ pressure: 70, satisfaction: 30 })
  const [teamMood, setTeamMood] = useState({ morale: 40, confidence: 35 })
  const [meetingHistory, setMeetingHistory] = useState([])
  const [meetingOutcome, setMeetingOutcome] = useState(null)
  const [allScores, setAllScores] = useState([])
  const [timer, setTimer] = useState(1200)
  const [startTime] = useState(Date.now())

  useEffect(() => {
    if (phase !== "context" && phase !== "results") {
      const interval = setInterval(() => setTimer(t => Math.max(0, t - 1)), 1000)
      return () => clearInterval(interval)
    }
  }, [phase])

  const mm = String(Math.floor(timer / 60)).padStart(2, "0")
  const ss = String(timer % 60).padStart(2, "0")
  const currentStep = phase === "context" ? 1 : phase === "results" ? 4 : 2
  const totalSteps = 4

  function startInvestigation() { setPhase("investigation") }

  function toggleMetricSelection(metricId) {
    setSelectedMetrics(prev =>
      prev.includes(metricId) ? prev.filter(id => id !== metricId) : [...prev, metricId]
    )
  }

  function toggleArgumentSelection(argId) {
    setPreparedArguments(prev =>
      prev.includes(argId) ? prev.filter(id => id !== argId) : [...prev, argId]
    )
  }

  function finishInvestigation() {
    const criticalMetrics = INVESTIGATION_METRICS.filter(m => m.dragPriority === "critical")
    const identifiedCritical = criticalMetrics.filter(m => selectedMetrics.includes(m.id))
    const recommendedArgs = PREPARATION_ARGUMENTS.filter(a => a.recommended)
    const preparedRecommended = recommendedArgs.filter(a => preparedArguments.includes(a.id))

    setAllScores(prev => [...prev, {
      detection: Math.min(100, (preparedRecommended.length / recommendedArgs.length) * 100),
      metrics_literacy: Math.round((identifiedCritical.length / criticalMetrics.length) * 100)
    }])

    setPhase("meeting")
  }

  function handleMeetingChoice(optionId) {
    const stage = MEETING_STAGES.find(s => s.id === currentStage)
    const option = stage.options.find(o => o.id === optionId)
    if (!option) return

    setMeetingHistory(prev => [...prev, {
      stage: currentStage,
      choice: option.label,
      text: option.text,
      approach: option.approach
    }])

    const newPaulaMood = {
      pressure: Math.max(0, Math.min(100, paulaMood.pressure + (option.moodChange?.pressure || 0))),
      satisfaction: Math.max(0, Math.min(100, paulaMood.satisfaction + (option.moodChange?.satisfaction || 0)))
    }
    setPaulaMood(newPaulaMood)

    if (option.next) {
      if (option.next.startsWith("resolution_") || option.next === "consequences_bad") {
        const outcome = MEETING_OUTCOMES[option.next]
        setMeetingOutcome(outcome)

        setAllScores(prev => [...prev, {
          stakeholder_management: outcome.outcome === "expert" ? 95 : outcome.outcome === "competent" ? 70 : 20,
          negotiation: outcome.outcome === "expert" ? 90 : outcome.outcome === "competent" ? 65 : 15,
          systemic: outcome.outcome === "expert" ? 85 : 60
        }])

        setTimeout(() => { markChallengeComplete(5); setPhase("results") }, 4000)
      } else {
        setCurrentStage(option.next)
      }
    }
  }

  function handlePresentArguments() {
    const recommendedArgs = PREPARATION_ARGUMENTS.filter(a => a.recommended)
    const preparedRecommended = preparedArguments.filter(id => recommendedArgs.find(a => a.id === id))
    const badArgs = PREPARATION_ARGUMENTS.filter(a => !a.recommended)
    const preparedBad = preparedArguments.filter(id => badArgs.find(a => a.id === id))

    const goodArgsRatio = preparedRecommended.length / recommendedArgs.length
    const hasBadArgs = preparedBad.length > 0

    let moodChange = { pressure: -15, satisfaction: +20 }
    if (goodArgsRatio < 0.5 || hasBadArgs) moodChange = { pressure: 0, satisfaction: +5 }
    if (goodArgsRatio < 0.3) moodChange = { pressure: +10, satisfaction: -10 }

    setPaulaMood(prev => ({
      pressure: Math.max(0, Math.min(100, prev.pressure + moodChange.pressure)),
      satisfaction: Math.max(0, Math.min(100, prev.satisfaction + moodChange.satisfaction))
    }))

    setMeetingHistory(prev => [...prev, {
      stage: "investigation",
      action: "presented_arguments",
      argumentsCount: preparedArguments.length
    }])

    setCurrentStage("negotiation")
  }

  const finalScores = useMemo(() => {
    if (allScores.length === 0) return []
    return computeScores(allScores, DIMENSIONS)
  }, [allScores])

  const gradeData = useMemo(() => {
    if (finalScores.length === 0) return { letter: "F", label: "", color: "#888", avg: 0 }
    return getGrade(finalScores)
  }, [finalScores])

  useEffect(() => {
    if (phase === "results" && finalScores.length > 0) {
      const timeUsed = Math.floor((Date.now() - startTime) / 1000)
      saveResult({
        candidateId: "test@test.com",
        challengeId: 5,
        scores: finalScores,
        feedback: [],
        grade: gradeData,
        timeUsed
      })
    }
  }, [phase, finalScores, gradeData, startTime])

  if (phase === "context") {
    return (
      <div style={{ background: T.bg, minHeight: "100vh", color: T.text, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
        <TopBar currentStep={currentStep} totalSteps={totalSteps} backButton={{ label: "← Volver", onClick: () => nav("/challenges") }} />
        <div style={{ maxWidth: 700, margin: "0 auto", padding: "40px 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: 4, color: "#dc2626", marginBottom: 12 }}>SMATCH · CHALLENGE 05</div>
            <h1 style={{ fontSize: 42, fontWeight: 900, margin: "0 0 12px 0", background: "linear-gradient(135deg, #dc2626, #b91c1c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1.2 }}>La presión de velocidad</h1>
            <p style={{ fontSize: 18, color: T.sub, margin: 0, lineHeight: 1.5 }}>Sprint 6, día 3. El EM quiere 30% más de velocidad. Con gráficos y métricas.</p>
          </div>
          <div style={{ background: "linear-gradient(135deg, rgba(220, 38, 38, 0.06), #ffffff)", borderRadius: 16, padding: 24, marginBottom: 24, border: "2px solid rgba(220, 38, 38, 0.20)" }}>
            <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 3, color: "#dc2626", marginBottom: 16 }}>📋 SITUACIÓN</div>
            <div style={{ fontSize: 16, color: T.sub, lineHeight: 1.7, marginBottom: 16 }}><strong style={{ color: "#dc2626" }}>Paula (Engineering Manager)</strong> convocó reunión urgente. Velocidad cayó 35% en 3 sprints (38 a 25 puntos). Lollapalooza en <strong>2 semanas</strong>. Exige: "30% más de velocidad".</div>
            <div style={{ fontSize: 16, color: T.sub, padding: "16px 20px", background: "rgba(220, 38, 38, 0.08)", borderRadius: 12, borderLeft: "4px solid #dc2626" }}><strong>Tu rol:</strong> Investigar causas reales, preparar argumentos con datos, negociar plan realista.</div>
          </div>
          <div style={{ background: T.panel, borderRadius: 16, padding: 24, marginBottom: 24, border: `2px solid ${T.border}` }}>
            <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 3, color: "#dc2626", marginBottom: 16 }}>📊 VELOCITY TREND</div>
            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              {VELOCITY_DATA.sprints.map(sprint => (
                <div key={sprint.id} style={{ flex: 1, background: "#f8fafc", borderRadius: 10, padding: "12px", textAlign: "center" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: T.dim }}>Sprint {sprint.number}</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: sprint.velocity < 30 ? "#dc2626" : "#0f172a" }}>{sprint.velocity}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 14, color: "#dc2626", fontWeight: 700, textAlign: "center" }}>↓ -35% · EM demanda: +30%</div>
          </div>
          <div style={{ marginBottom: 24 }}>
            <TeamPanel title="Equipo Setlist" showStakeholder={false} />
          </div>
          <button onClick={startInvestigation} style={{ width: "100%", padding: "20px 0", background: "linear-gradient(135deg, #dc2626, #b91c1c)", color: "#ffffff", fontWeight: 900, fontSize: 16, border: "none", borderRadius: 12, cursor: "pointer", textTransform: "uppercase" }}>Iniciar Challenge →</button>
        </div>
      </div>
    )
  }

  if (phase === "investigation") {
    const criticalMetrics = INVESTIGATION_METRICS.filter(m => m.dragPriority === "critical")
    const identifiedCritical = criticalMetrics.filter(m => selectedMetrics.includes(m.id))
    const recommendedArgs = PREPARATION_ARGUMENTS.filter(a => a.recommended)
    const preparedRecommended = preparedArguments.filter(id => recommendedArgs.find(a => a.id === id))

    return (
      <div className="challenge05-container">
        <TopBar title="📊 La presión de velocidad" subtitle="Fase 1: Investigar datos" currentStep={currentStep} totalSteps={totalSteps} timer={{ display: `${mm}:${ss}`, warning: timer < 180 }} />
        <div className="investigation-phase">
          {/* Objective Banner */}
          <div className="phase-objective">
            <div className="objective-icon">🎯</div>
            <div className="objective-content">
              <h3>Objetivo: Preparar argumentos con datos antes del meeting</h3>
              <p>Analizá las 4 métricas críticas y prepará al menos 4 argumentos sólidos para negociar con Paula</p>
              <div className="objective-progress">
                <span className="progress-label">Progreso:</span>
                <span className={`progress-count ${identifiedCritical.length >= 3 && preparedRecommended.length >= 4 ? 'complete' : ''}`}>
                  {identifiedCritical.length}/{criticalMetrics.length} métricas críticas · {preparedRecommended.length}/{recommendedArgs.length} argumentos preparados
                </span>
              </div>
            </div>
          </div>

          <div className="velocity-chart-section">
            <h2>📊 Velocity Trend - Últimos 4 Sprints</h2>
            <div className="velocity-chart">
              {VELOCITY_DATA.sprints.map(sprint => (
                <div key={sprint.id} className="sprint-bar">
                  <div className="bar" style={{ height: `${(sprint.velocity / 45) * 100}%`, background: sprint.velocity < 30 ? "#dc2626" : sprint.velocity < 35 ? "#f59e0b" : "#10b981" }}>
                    <span className="bar-value">{sprint.velocity}</span>
                  </div>
                  <div className="bar-label">S{sprint.number}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="investigation-section">
            <h2>🔍 Identificar Causas Reales</h2>
            <div className="metrics-grid">
              {INVESTIGATION_METRICS.map(metric => (
                <div key={metric.id} className={`investigation-metric ${metric.status} ${selectedMetrics.includes(metric.id) ? 'selected' : ''}`} onClick={() => toggleMetricSelection(metric.id)}>
                  <div className="metric-header">
                    <span>{metric.icon}</span>
                    <span className={`metric-badge ${metric.status}`}>{metric.status === "critical" ? "Crítico" : "Warning"}</span>
                  </div>
                  <h4>{metric.title}</h4>
                  <div className="metric-values">
                    <span className="metric-current">{metric.currentValue}</span>
                    <span className={`metric-trend ${metric.status}`}>{metric.trend}</span>
                  </div>
                  <p>{metric.insight}</p>
                  {selectedMetrics.includes(metric.id) && <div className="selected-check">✓</div>}
                </div>
              ))}
            </div>
          </div>
          <div className="preparation-section">
            <h2>📝 Preparar Argumentos</h2>
            <div className="arguments-list">
              {PREPARATION_ARGUMENTS.map(arg => (
                <label key={arg.id} className={`argument-card ${preparedArguments.includes(arg.id) ? 'selected' : ''}`}>
                  <input type="checkbox" checked={preparedArguments.includes(arg.id)} onChange={() => toggleArgumentSelection(arg.id)} />
                  <div className="argument-content">
                    <div className="argument-header">
                      <span>{arg.title}</span>
                    </div>
                    <p>{arg.text}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <div className="investigation-footer">
            <button className="btn-start-meeting" onClick={finishInvestigation} disabled={preparedArguments.length === 0}>
              {preparedArguments.length === 0
                ? "Prepará al menos 1 argumento para continuar"
                : `Ir al Meeting con Paula (${preparedArguments.length} argumentos preparados) →`}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (phase === "meeting") {
    const stage = MEETING_STAGES.find(s => s.id === currentStage)
    return (
      <div className="challenge05-container">
        <TopBar title="📊 La presión de velocidad" subtitle="Fase 2: Meeting con Paula" currentStep={currentStep} totalSteps={totalSteps} timer={{ display: `${mm}:${ss}`, warning: timer < 180 }} />
        <div className="meeting-phase">
          <div className="meeting-message">
            {stage.narration && <div className="meeting-narration">{stage.narration}</div>}
            <div className="paula-message">
              <Avatar member={STAKEHOLDER_MAP.paula} size={48} />
              <div className="message-bubble">
                <div className="message-author">Paula Ríos</div>
                <div className="message-text">{stage.paulaMessage}</div>
              </div>
            </div>
          </div>
          {meetingOutcome ? (
            <div className="meeting-outcome">
              <div className="paula-final-message">
                <Avatar member={STAKEHOLDER_MAP.paula} size={40} />
                <div className="message-bubble"><div>{meetingOutcome.paulaFinalMessage}</div></div>
              </div>
              <div className="outcome-consequences">
                <h4>Consecuencias:</h4>
                <div><strong>Corto Plazo:</strong><ul>{meetingOutcome.shortTerm.map((item, i) => <li key={i}>{item}</li>)}</ul></div>
                <div><strong>Largo Plazo:</strong><ul>{meetingOutcome.longTerm.map((item, i) => <li key={i}>{item}</li>)}</ul></div>
              </div>
            </div>
          ) : currentStage === "investigation" ? (
            <div className="present-arguments-stage">
              <h3>📋 Presentá argumentos</h3>
              <div className="prepared-args-preview">{preparedArguments.map(argId => {
                const arg = PREPARATION_ARGUMENTS.find(a => a.id === argId)
                return <div key={argId} className="arg-preview-card">{arg.title}</div>
              })}</div>
              <button className="btn-present-arguments" onClick={handlePresentArguments}>Presentar →</button>
            </div>
          ) : (
            <div className="meeting-options">
              <div>¿Cómo respondés?</div>
              <div className="options-list">
                {stage.options.map(option => (
                  <button key={option.id} className={`meeting-option approach-${option.approach}`} onClick={() => handleMeetingChoice(option.id)}>
                    <div>{option.label}</div>
                    <div>"{option.text}"</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (phase === "results") {
    return (
      <ChallengeComplete
        challengeTitle="La presión de velocidad"
        challengeNumber={5}
        accentColor="#dc2626"
        gradientStart="rgba(220, 38, 38, 0.85)"
        gradientEnd="rgba(185, 28, 28, 0.80)"
        isLastChallenge={isLastChallenge(5)}
      />
    )
  }

  return null
}
