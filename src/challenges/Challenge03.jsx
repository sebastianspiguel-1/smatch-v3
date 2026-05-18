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
  SPRINT_CONTEXT,
  DASHBOARD_METRICS,
  CONVERSATION_BRANCHES,
  ACTION_PLAN_CATEGORIES,
  ACTION_PLAN_OPTIONS,
  DIMENSIONS,
  BOARD_STATE,
} from "../data/challenge03"
import "./Challenge03.css"

export default function Challenge03() {
  const nav = useNavigate()

  // Phase management
  const [phase, setPhase] = useState("context") // context | dashboard | conversation | action_plan | results

  // Dashboard phase state
  const [selectedMetric, setSelectedMetric] = useState(null)
  const [identifiedFlags, setIdentifiedFlags] = useState([])

  // Conversation phase state
  const [currentBranch, setCurrentBranch] = useState("start")
  const [conversationHistory, setConversationHistory] = useState([])
  const [conversationOutcome, setConversationOutcome] = useState(null)

  // Action plan phase state
  const [selectedActions, setSelectedActions] = useState({
    immediate: [],
    short_term: [],
    long_term: []
  })

  // Scoring
  const [allScores, setAllScores] = useState([])
  const [timer, setTimer] = useState(1200) // 20 minutes
  const [startTime] = useState(Date.now())

  // Timer
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

  // ─────────────────────────────────────────────────────────────
  // PHASE 1: DASHBOARD - Identify signals
  // ─────────────────────────────────────────────────────────────

  function startDashboard() {
    setPhase("dashboard")
  }

  function handleMetricClick(metric) {
    setSelectedMetric(metric)
  }

  function toggleRedFlag(metricId) {
    setIdentifiedFlags(prev =>
      prev.includes(metricId)
        ? prev.filter(id => id !== metricId)
        : [...prev, metricId]
    )
  }

  function finishDashboard() {
    // Evaluate detection
    const criticalMetrics = DASHBOARD_METRICS.filter(m => m.status === "critical")
    const identifiedCritical = criticalMetrics.filter(m => identifiedFlags.includes(m.id))

    const detectionScore = Math.round((identifiedCritical.length / criticalMetrics.length) * 100)
    const systemsScore = identifiedFlags.length >= 3 ? 85 : identifiedFlags.length === 2 ? 60 : 35

    setAllScores(prev => [...prev, {
      detection: detectionScore,
      systemic: systemsScore
    }])

    setPhase("conversation")
  }

  // ─────────────────────────────────────────────────────────────
  // PHASE 2: CONVERSATION - Branched narrative
  // ─────────────────────────────────────────────────────────────

  function handleConversationChoice(optionId) {
    const branch = CONVERSATION_BRANCHES[currentBranch]
    const option = branch.options.find(o => o.id === optionId)

    if (!option) return

    // Add to history
    setConversationHistory(prev => [
      ...prev,
      {
        branch: currentBranch,
        choice: option.label,
        text: option.text,
        approach: option.approach
      }
    ])

    // Move to next branch
    const nextBranch = CONVERSATION_BRANCHES[option.next]
    if (nextBranch) {
      setCurrentBranch(option.next)

      // Check if this is a resolution branch
      if (nextBranch.outcome) {
        setConversationOutcome(nextBranch)

        // Evaluate coaching & empathy
        const coachingScore =
          nextBranch.outcome === "expert" ? 95 :
          nextBranch.outcome === "competent" ? 70 :
          nextBranch.outcome === "developing" ? 45 : 20

        const empathyScore =
          nextBranch.outcome === "expert" ? 90 :
          nextBranch.outcome === "competent" ? 65 :
          nextBranch.outcome === "developing" ? 40 : 15

        setAllScores(prev => [...prev, {
          coaching: coachingScore,
          empathy: empathyScore
        }])

        // Auto-advance to action plan after 3 seconds
        setTimeout(() => {
          setPhase("action_plan")
        }, 3000)
      }
    }
  }

  // ─────────────────────────────────────────────────────────────
  // PHASE 3: ACTION PLAN - Select actions
  // ─────────────────────────────────────────────────────────────

  function toggleAction(category, actionId) {
    setSelectedActions(prev => ({
      ...prev,
      [category]: prev[category].includes(actionId)
        ? prev[category].filter(id => id !== actionId)
        : [...prev[category], actionId]
    }))
  }

  function finishActionPlan() {
    // Evaluate leadership & systemic thinking
    const immediateActions = ACTION_PLAN_OPTIONS.immediate.filter(a =>
      selectedActions.immediate.includes(a.id) && a.recommended
    )
    const longTermActions = ACTION_PLAN_OPTIONS.long_term.filter(a =>
      selectedActions.long_term.includes(a.id) && a.recommended
    )

    const leadershipScore = Math.min(100, (immediateActions.length / 4) * 100)
    const systemicScore = Math.min(100, (longTermActions.length / 4) * 100)

    setAllScores(prev => [...prev, {
      leadership: leadershipScore,
      systemic: systemicScore
    }])

    markChallengeComplete(3)
    setPhase("results")
  }

  // ─────────────────────────────────────────────────────────────
  // COMPUTED SCORES
  // ─────────────────────────────────────────────────────────────

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
        challengeId: 3,
        scores: finalScores,
        feedback: [],
        grade: gradeData,
        timeUsed
      }).then(() => {
        console.log("Challenge 03 result saved")
      })
    }
  }, [phase, finalScores, gradeData, startTime])

  // ═════════════════════════════════════════════════════════════
  // RENDER: CONTEXT / BRIEFING
  // ═════════════════════════════════════════════════════════════

  if (phase === "context") {
    return (
      <div style={{ background: T.bg, minHeight: "100vh", color: T.text, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
        <TopBar
          currentStep={currentStep}
          totalSteps={totalSteps}
          backButton={{ label: "← Volver", onClick: () => nav("/challenges") }}
        />
        <div style={{ maxWidth: 700, margin: "0 auto", padding: "40px 24px" }}>

          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: 4, color: "#ff8a80", marginBottom: 12, opacity: 0.9 }}>SMATCH · CHALLENGE 03</div>
            <h1 style={{ fontSize: 42, fontWeight: 900, margin: "0 0 12px 0", background: "linear-gradient(135deg, #ff8a80, #fa8072)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1.2 }}>
              El dev que se está apagando
            </h1>
          </div>

          <div style={{ background: "linear-gradient(135deg, rgba(255, 138, 128, 0.06), #ffffff)", borderRadius: 16, padding: 24, marginBottom: 24, border: "2px solid rgba(255, 138, 128, 0.20)", boxShadow: "0 2px 8px rgba(15, 23, 42, 0.06)" }}>
            <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 3, color: "#ff8a80", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 20 }}>📋</span>
              SITUACIÓN
            </div>
            <div style={{ fontSize: 16, color: T.sub, lineHeight: 1.7 }}>
              Alan tiene 3 tickets críticos en "In Progress" hace 4 días. Sus últimos 4 PRs tuvieron bugs básicos. Hace 4 semanas era uno de los devs más sólidos. Lollapalooza es en 3 semanas y Alan está a cargo de features importantes y el equipo está frustrado.
            </div>
          </div>

          {/* Board State */}
          <div style={{ background: T.panel, borderRadius: 16, padding: 24, marginBottom: 24, border: `2px solid ${T.border}`, boxShadow: "0 2px 8px rgba(15, 23, 42, 0.06)" }}>
            <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 3, color: "#f472b6", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 20 }}>📊</span>
              BOARD - TICKETS DE ALAN
            </div>
            {BOARD_STATE.doing.map(ticket => (
              <div key={ticket.id} style={{ background: "rgba(244,114,182,0.08)", borderRadius: 12, padding: "12px 16px", marginBottom: 10, borderLeft: "4px solid #f472b6" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#f472b6" }}>{ticket.id}</span>
                  <span style={{ fontSize: 11, color: "#f87171", fontWeight: 600 }}>⏱️ 4 días en In Progress</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 4 }}>{ticket.title}</div>
                <div style={{ fontSize: 12, color: T.dim }}>{ticket.status}</div>
              </div>
            ))}
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#f87171", marginTop: 16, marginBottom: 8 }}>BLOQUEADOS ESPERANDO A ALAN:</div>
            {BOARD_STATE.blocked.map(ticket => (
              <div key={ticket.id} style={{ background: "rgba(248,113,113,0.06)", borderRadius: 10, padding: "10px 14px", marginBottom: 8, borderLeft: "3px solid #f87171" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{ticket.id}: {ticket.title}</div>
                <div style={{ fontSize: 11, color: "#f87171" }}>Bloqueado por {ticket.blockedBy}</div>
              </div>
            ))}
          </div>

          {/* Team */}
          <div style={{ marginBottom: 32 }}>
            <TeamPanel title="Equipo Setlist" showStakeholder={false} />
          </div>

          <button onClick={startDashboard} style={{ width: "100%", padding: "20px 0", background: "linear-gradient(135deg, #ff8a80, #fa8072)", color: "#ffffff", fontWeight: 900, fontSize: 16, border: "2px solid rgba(255, 138, 128, 0.8)", borderRadius: 12, cursor: "pointer", letterSpacing: 1.5, boxShadow: "0 4px 16px rgba(255, 138, 128, 0.25)", transition: "all 0.3s", textTransform: "uppercase" }}>
            Iniciar Challenge →
          </button>
        </div>
      </div>
    )
  }

  // ═════════════════════════════════════════════════════════════
  // RENDER: PHASE 1 - DASHBOARD
  // ═════════════════════════════════════════════════════════════

  if (phase === "dashboard") {
    return (
      <div className="challenge03-container">
        <TopBar
          title="🔥 El dev que se está apagando"
          subtitle="Fase 1: Investigar señales"
          currentStep={currentStep}
          totalSteps={totalSteps}
          timer={{ display: `${mm}:${ss}`, warning: timer < 180 }}
        />

        <div className="dashboard-phase">
          <div className="dashboard-header">
            <h2>📊 Dashboard de Performance - Alan (últimas 4 semanas)</h2>
            <p><strong>Objetivo:</strong> Identificar señales críticas de burnout. Analizá las 3 métricas de Alan y marcá las que consideres red flags antes de la conversación 1-1.</p>
          </div>

          <div className="metrics-grid">
            {DASHBOARD_METRICS.map(metric => (
              <div
                key={metric.id}
                className={`metric-card ${metric.status} ${identifiedFlags.includes(metric.id) ? 'flagged' : ''}`}
                onClick={() => handleMetricClick(metric)}
              >
                <div className="metric-header">
                  <span className="metric-icon">{metric.icon}</span>
                  <span className={`metric-status-badge ${metric.status}`}>
                    {metric.status === "critical" ? "🔴" : metric.status === "warning" ? "⚠️ Warning" : "✓ OK"}
                  </span>
                </div>
                <h3 className="metric-title">{metric.title}</h3>
                <p className="metric-summary">{metric.summary}</p>
                <button
                  className={`flag-button ${identifiedFlags.includes(metric.id) ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleRedFlag(metric.id)
                  }}
                >
                  {identifiedFlags.includes(metric.id) ? "✓ Señal identificada" : "Marcar como red flag"}
                </button>
              </div>
            ))}
          </div>

          <div className="dashboard-actions">
            <button
              className="btn-finish-dashboard"
              onClick={finishDashboard}
              disabled={identifiedFlags.length === 0}
            >
              {identifiedFlags.length === 0
                ? "Marcá al menos 1 señal para continuar"
                : `Continuar al 1-1 con Alan (${identifiedFlags.length} señales identificadas) →`}
            </button>
          </div>
        </div>

        {/* Metric Detail Modal */}
        {selectedMetric && (
          <div className="metric-modal-backdrop" onClick={() => setSelectedMetric(null)}>
            <div className="metric-modal" onClick={e => e.stopPropagation()}>
              <div className="metric-modal-header">
                <h3>{selectedMetric.icon} {selectedMetric.title}</h3>
                <button onClick={() => setSelectedMetric(null)}>×</button>
              </div>
              <div className="metric-modal-body">
                <div className="metric-detail-summary">
                  <span className={`metric-status-badge ${selectedMetric.status}`}>
                    {selectedMetric.status === "critical" ? "🔴" : selectedMetric.status === "warning" ? "⚠️ Warning" : "✓ OK"}
                  </span>
                  <p>{selectedMetric.summary}</p>
                </div>
                <div className="metric-detail-list">
                  {selectedMetric.details.map((detail, i) => (
                    <div key={i} className="metric-detail-item">
                      {detail}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ═════════════════════════════════════════════════════════════
  // RENDER: PHASE 2 - CONVERSATION
  // ═════════════════════════════════════════════════════════════

  if (phase === "conversation") {
    const branch = CONVERSATION_BRANCHES[currentBranch]

    return (
      <div className="challenge03-container">
        <TopBar
          title="🔥 El dev que se está apagando"
          subtitle="Fase 2: Conversación 1-1 con Alan"
          currentStep={currentStep}
          totalSteps={totalSteps}
          timer={{ display: `${mm}:${ss}`, warning: timer < 180 }}
        />

        <div className="conversation-phase">
          {/* Conversation History */}
          <div className="conversation-history">
            {branch.narration && (
              <div className="narration-bubble">
                {branch.narration}
              </div>
            )}

            <div className="alan-message">
              <Avatar member={MEMBER_MAP.alan} size={40} />
              <div className="message-content">
                <div className="message-author">Alan (Dev Mobile)</div>
                <div className="message-text">{branch.alanMessage}</div>
              </div>
            </div>

            {conversationHistory.length > 0 && (
              <div className="history-recap">
                {conversationHistory.slice(-3).map((entry, i) => (
                  <div key={i} className="history-entry">
                    <div className="history-you">
                      <strong>Tú:</strong> {entry.text}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Outcome Resolution (if reached) */}
          {conversationOutcome ? (
            <div className="conversation-outcome">
              <div className="outcome-narration">
                {conversationOutcome.narration}
              </div>
              <div className="outcome-resolution">
                <h4>Resolución:</h4>
                <div className="resolution-section">
                  <strong>Inmediato:</strong>
                  <ul>
                    {conversationOutcome.resolution.immediate.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="resolution-section">
                  <strong>Corto plazo:</strong>
                  <ul>
                    {conversationOutcome.resolution.shortTerm.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
                {conversationOutcome.resolution.longTerm && (
                  <div className="resolution-section">
                    <strong>Largo plazo:</strong>
                    <ul>
                      {conversationOutcome.resolution.longTerm.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div style={{ textAlign: "center", marginTop: 20, color: T.dim, fontSize: 14 }}>
                Avanzando a Action Plan en 3 segundos...
              </div>
            </div>
          ) : (
            /* Conversation Options */
            <div className="conversation-options">
              <div className="options-header">¿Cómo respondés?</div>
              <div className="options-grid">
                {branch.options.map(option => (
                  <button
                    key={option.id}
                    className="option-card"
                    onClick={() => handleConversationChoice(option.id)}
                  >
                    <div className="option-text">"{option.text}"</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ═════════════════════════════════════════════════════════════
  // RENDER: PHASE 3 - ACTION PLAN
  // ═════════════════════════════════════════════════════════════

  if (phase === "action_plan") {
    return (
      <div className="challenge03-container">
        <TopBar
          title="🔥 El dev que se está apagando"
          subtitle="Fase 3: Action Plan"
          currentStep={currentStep}
          totalSteps={totalSteps}
          timer={{ display: `${mm}:${ss}`, warning: timer < 180 }}
        />

        <div className="action-plan-phase">
          <div className="action-plan-header">
            <h2>📋 Action Plan: Prevenir burnout y manejar la situación</h2>
            <p>Seleccioná las acciones que tomarías. Las recomendadas están marcadas con ✓</p>
          </div>

          {ACTION_PLAN_CATEGORIES.map(category => (
            <div key={category.id} className="action-category" style={{ borderLeftColor: category.color }}>
              <div className="category-header" style={{ color: category.color }}>
                <h3>{category.title}</h3>
                <p>{category.description}</p>
              </div>

              <div className="action-checklist">
                {ACTION_PLAN_OPTIONS[category.id].map(action => (
                  <label
                    key={action.id}
                    className={`action-item ${selectedActions[category.id].includes(action.id) ? 'selected' : ''} ${action.impact === 'negative' ? 'negative' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedActions[category.id].includes(action.id)}
                      onChange={() => toggleAction(category.id, action.id)}
                    />
                    <div className="action-content">
                      <span className="action-text">{action.text}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div className="action-plan-footer">
            <div className="actions-counter">
              {Object.values(selectedActions).flat().length} acciones seleccionadas
            </div>
            <button
              className="btn-finish-action-plan"
              onClick={finishActionPlan}
              disabled={Object.values(selectedActions).flat().length === 0}
            >
              Finalizar Challenge →
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ═════════════════════════════════════════════════════════════
  // RENDER: RESULTS
  // ═════════════════════════════════════════════════════════════

  if (phase === "results") {
    return (
      <ChallengeComplete
        challengeTitle="El dev que se está apagando"
        challengeNumber={3}
        accentColor="#ff8a80"
        gradientStart="rgba(255, 138, 128, 0.85)"
        gradientEnd="rgba(250, 128, 114, 0.80)"
        isLastChallenge={isLastChallenge(3)}
      />
    )
  }

  return null
}
