import { useState, useEffect, useMemo, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { T } from "../theme"
import {
  callAI,
  buildBurnout1on1Prompt,
  buildInsightExtractorPrompt,
  computeScores,
  getGrade,
} from "../engine/ai"
import { saveResult } from "../engine/supabase"
import { Avatar, TopBar } from "../components"
import ChallengeComplete from "../components/ChallengeComplete"
import TeamPanel from "../components/TeamPanel"
import AICoach from "../components/AICoach"
import { markChallengeComplete, isLastChallenge } from "../utils/progressTracker"
import {
  buildAIContextString,
  updateProfile,
  getProfile,
  DEFAULT_CANDIDATE_ID,
} from "../engine/candidateProfile"
import {
  MEMBER_MAP,
  SPRINT_CONTEXT,
  SITUACION,
  TEAM_DESC,
  DASHBOARD_METRICS,
  INITIAL_ALAN_STATE,
  OPENING_NARRATION_1ON1,
  OPENING_ALAN_MESSAGE,
  ACTION_PLAN_CATEGORIES,
  ACTION_PLAN_OPTIONS,
  DIMENSIONS,
  BOARD_STATE,
} from "../data/challenge02"
import "./Challenge02.css"
import "./Challenge03.css"

export default function Challenge02() {
  const nav = useNavigate()
  const [phase, setPhase] = useState("context") // context | dashboard | conversation | action_plan | results
  const [selectedMetric, setSelectedMetric] = useState(null)

  // Conversation state (chat libre)
  const [chat, setChat] = useState([])
  const [smInput, setSmInput] = useState("")
  const [alanState, setAlanState] = useState(INITIAL_ALAN_STATE)
  const [loading, setLoading] = useState(false)
  const [allScores, setAllScores] = useState([])
  const [allFeedback, setAllFeedback] = useState([])
  const [turnCount, setTurnCount] = useState(0)

  // Action plan
  const [selectedActions, setSelectedActions] = useState({
    immediate: [],
    short_term: [],
    long_term: [],
  })

  const [timer, setTimer] = useState(1200)
  const [startTime] = useState(Date.now())
  const chatRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [chat, loading])

  useEffect(() => {
    if (phase !== "context" && phase !== "results") {
      timerRef.current = setInterval(() => {
        setTimer((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current)
            if (phase === "action_plan") finishChallenge()
            return 0
          }
          return t - 1
        })
      }, 1000)
      return () => clearInterval(timerRef.current)
    }
  }, [phase])

  const mm = String(Math.floor(timer / 60)).padStart(2, "0")
  const ss = String(timer % 60).padStart(2, "0")
  const currentStep =
    phase === "context" ? 1 : phase === "dashboard" ? 2 : phase === "conversation" ? 3 : 4
  const totalSteps = 4

  // ─────────────────────────────────────────────────────────────
  // PHASE TRANSITIONS
  // ─────────────────────────────────────────────────────────────

  function startDashboard() {
    setPhase("dashboard")
  }

  function startConversation() {
    setPhase("conversation")
    setTimeout(() => {
      setChat([
        { narration: true, text: OPENING_NARRATION_1ON1 },
        { from: OPENING_ALAN_MESSAGE.from, text: OPENING_ALAN_MESSAGE.text },
      ])
    }, 400)
  }

  function startActionPlan() {
    setPhase("action_plan")
  }

  // ─────────────────────────────────────────────────────────────
  // CHAT LIBRE 1-1 con Alan
  // ─────────────────────────────────────────────────────────────

  async function handleSMMessage(message) {
    if (!message.trim() || loading) return
    setChat((p) => [
      ...p,
      { isYou: true, text: message, targetName: "Alan" },
    ])
    setLoading(true)
    await evaluateAction({ type: "chat_message", target: "alan", message })
    setLoading(false)
  }

  async function evaluateAction(action) {
    const chatContext = chat.slice(-12).map((c) =>
      c.narration
        ? { from: "narration", text: c.text }
        : c.isYou
        ? { from: "sm", text: c.text }
        : { from: MEMBER_MAP[c.from]?.name || c.from, text: c.text }
    )
    const candidateContext = buildAIContextString(DEFAULT_CANDIDATE_ID)
    const actionForPrompt = {
      ...action,
      target: action.target ? MEMBER_MAP[action.target]?.name : null,
    }
    const sys = buildBurnout1on1Prompt(
      TEAM_DESC,
      SPRINT_CONTEXT,
      alanState,
      actionForPrompt,
      chatContext,
      candidateContext
    )
    const res = await callAI(sys, action.message || "1-1 turn")
    if (!res) return

    if (res.reactions) {
      setChat((p) => [
        ...p,
        ...res.reactions.map((r) => ({ from: r.from, text: r.text })),
      ])
    }
    if (res.newAlanState) setAlanState(res.newAlanState)

    const vs = {}
    if (res.scores)
      Object.entries(res.scores).forEach(([k, v]) => {
        if (v > 0) vs[k] = v
      })
    setAllScores((s) => [...s, vs])
    setAllFeedback((f) => [
      ...f,
      {
        action: action.type,
        target: action.target,
        message: action.message,
        scores: vs,
      },
    ])
    setTurnCount((c) => c + 1)
  }

  // ─────────────────────────────────────────────────────────────
  // ACTION PLAN
  // ─────────────────────────────────────────────────────────────

  function toggleAction(category, actionId) {
    setSelectedActions((prev) => ({
      ...prev,
      [category]: prev[category].includes(actionId)
        ? prev[category].filter((id) => id !== actionId)
        : [...prev[category], actionId],
    }))
  }

  async function finishChallenge() {
    clearInterval(timerRef.current)
    markChallengeComplete(2)

    // Log action plan choices for the insight extractor
    setAllFeedback((f) => [
      ...f,
      {
        action: "action_plan",
        target: null,
        message: JSON.stringify(selectedActions),
        scores: {},
      },
    ])

    setLoading(true)
    await extractAndSaveInsights()
    setLoading(false)
    setPhase("results")
  }

  async function extractAndSaveInsights() {
    try {
      const conversationLog = chat
        .filter((c) => !c.narration)
        .map((c) =>
          c.isYou
            ? `SM: "${c.text}"${c.targetName ? ` (a ${c.targetName})` : ""}`
            : `${MEMBER_MAP[c.from]?.name || c.from}: "${c.text}"`
        )
        .join("\n")

      const profile = getProfile(DEFAULT_CANDIDATE_ID)
      const coachLog = (profile.ai_coach_usage.interactions || [])
        .filter((i) => i.challenge === "Día 3 · 1-1 con Alan")
        .map(
          (i) =>
            `SM pregunta: "${i.sm_question}"\nCoach responde: "${i.coach_response}"`
        )
        .join("\n\n")

      const actionsLog = allFeedback
        .map(
          (fb) =>
            `${fb.action}${fb.target ? ` → ${fb.target}` : ""}: "${
              fb.message || ""
            }"`
        )
        .concat([
          `Action plan elegido: ${Object.entries(selectedActions)
            .map(([cat, ids]) => `${cat}=[${ids.join(", ")}]`)
            .join(" | ")}`,
        ])
        .join("\n")

      const prompt = buildInsightExtractorPrompt(
        "Día 3 · 1-1 con Alan (C03)",
        conversationLog,
        coachLog,
        actionsLog
      )
      const insights = await callAI(prompt, "Extraé insights del candidato")
      if (!insights) return

      const aiFluencyScore = insights.ai_fluency?.score
      if (aiFluencyScore && aiFluencyScore > 0) {
        setAllScores((s) => [...s, { ai_fluency: aiFluencyScore }])
      }

      updateProfile(DEFAULT_CANDIDATE_ID, {
        communication_style: insights.communication_style,
        insights: {
          patterns: insights.patterns || [],
          strengths: insights.strengths || [],
          weaknesses: insights.weaknesses || [],
          notable_moments: (insights.notable_moments || []).map((m) => ({
            challenge: "C02",
            note: m.note || m,
          })),
        },
        challenge_history: [
          {
            challenge: "C02",
            challenge_name: "Día 3 · 1-1 con Alan",
            completed_at: new Date().toISOString(),
            ai_fluency_score: aiFluencyScore,
            ai_fluency_rationale: insights.ai_fluency?.rationale,
          },
        ],
      })
    } catch (e) {
      console.error("Error en insight extraction C02:", e)
    }
  }

  const finalScores = useMemo(() => {
    if (allScores.length === 0) return []
    return computeScores(allScores, DIMENSIONS)
  }, [allScores])

  const gradeData = useMemo(() => {
    if (finalScores.length === 0)
      return { letter: "F", label: "", color: "#888", avg: 0 }
    return getGrade(finalScores)
  }, [finalScores])

  useEffect(() => {
    if (phase === "results" && finalScores.length > 0) {
      const timeUsed = Math.floor((Date.now() - startTime) / 1000)
      saveResult({
        candidateId: DEFAULT_CANDIDATE_ID,
        challengeId: 2,
        scores: finalScores,
        feedback: allFeedback,
        grade: gradeData,
        timeUsed,
      }).then(() => console.log("Challenge 02 result saved"))
    }
  }, [phase, finalScores, allFeedback, gradeData, startTime])

  // ═════════════════════════════════════════════════════════════
  // CONTEXT
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
            <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: 4, color: "#ff8a80", marginBottom: 12, opacity: 0.9 }}>SMATCH · CHALLENGE 02</div>
            <h1 style={{ fontSize: 42, fontWeight: 900, margin: "0 0 12px 0", background: "linear-gradient(135deg, #ff8a80, #fa8072)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1.2 }}>
              Día 3 · 1-1 con Alan
            </h1>
            <p style={{ fontSize: 18, color: T.sub, margin: 0, lineHeight: 1.5 }}>
              Sprint 1 · Día 3. Alan está mostrando señales antes de tiempo.
            </p>
          </div>

          <div style={{ background: "linear-gradient(135deg, rgba(255, 138, 128, 0.06), #ffffff)", borderRadius: 16, padding: 24, marginBottom: 24, border: "2px solid rgba(255, 138, 128, 0.20)" }}>
            <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 3, color: "#ff8a80", marginBottom: 16 }}>📋 SITUACIÓN</div>
            <div style={{ fontSize: 15, color: T.sub, lineHeight: 1.7 }}>
              {SITUACION}
            </div>
          </div>

          <div style={{ background: T.panel, borderRadius: 16, padding: 24, marginBottom: 24, border: `2px solid ${T.border}` }}>
            <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 3, color: "#f472b6", marginBottom: 16 }}>📊 BOARD - TICKETS DE ALAN</div>
            {BOARD_STATE.doing.map((ticket) => (
              <div key={ticket.id} style={{ background: "rgba(244,114,182,0.08)", borderRadius: 12, padding: "12px 16px", marginBottom: 10, borderLeft: "4px solid #f472b6" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#f472b6" }}>{ticket.id}</span>
                  <span style={{ fontSize: 11, color: "#f87171", fontWeight: 600 }}>⏱️ {ticket.days} días en DOING</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 4 }}>{ticket.title}</div>
                <div style={{ fontSize: 12, color: T.dim }}>{ticket.status}</div>
              </div>
            ))}
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#f87171", marginTop: 16, marginBottom: 8 }}>BLOQUEADOS ESPERANDO A ALAN:</div>
            {BOARD_STATE.blocked.map((ticket) => (
              <div key={ticket.id} style={{ background: "rgba(248,113,113,0.06)", borderRadius: 10, padding: "10px 14px", marginBottom: 8, borderLeft: "3px solid #f87171" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{ticket.id}: {ticket.title}</div>
                <div style={{ fontSize: 11, color: "#f87171" }}>Bloqueado por {ticket.blockedBy}</div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 32 }}>
            <TeamPanel title="Equipo Setlist" showStakeholder={false} />
          </div>

          <button onClick={startDashboard} style={{ width: "100%", padding: "20px 0", background: "linear-gradient(135deg, #ff8a80, #fa8072)", color: "#ffffff", fontWeight: 900, fontSize: 16, border: "2px solid rgba(255, 138, 128, 0.8)", borderRadius: 12, cursor: "pointer", letterSpacing: 1.5, textTransform: "uppercase" }}>
            Investigar las señales →
          </button>
        </div>
      </div>
    )
  }

  // ═════════════════════════════════════════════════════════════
  // DASHBOARD (exploración read-only, sin score leak)
  // ═════════════════════════════════════════════════════════════

  if (phase === "dashboard") {
    return (
      <div className="challenge03-container">
        <TopBar
          title="🔥 Día 3 · 1-1 con Alan"
          subtitle="Investigá las señales antes del 1-1"
          currentStep={currentStep}
          totalSteps={totalSteps}
          timer={{ display: `${mm}:${ss}`, warning: timer < 180 }}
        />
        <div className="dashboard-phase">
          <div className="dashboard-header">
            <h2>📊 Lo que se ve en los últimos meses + Sprint 1</h2>
            <p>
              Mirá las señales y armá tu hipótesis antes de hablar con Alan. No hay respuestas
              marcadas: lo que detectes lo vas a usar en la conversación.
            </p>
          </div>

          <div className="metrics-grid">
            {DASHBOARD_METRICS.map((metric) => (
              <div
                key={metric.id}
                className={`metric-card ${metric.status}`}
                onClick={() => setSelectedMetric(metric)}
              >
                <div className="metric-header">
                  <span className="metric-icon">{metric.icon}</span>
                </div>
                <h3 className="metric-title">{metric.title}</h3>
                <p className="metric-summary">{metric.summary}</p>
                <div style={{ fontSize: 11, color: T.dim, marginTop: 8, fontStyle: "italic" }}>
                  Click para ver detalle
                </div>
              </div>
            ))}
          </div>

          <div className="dashboard-actions">
            <button className="btn-finish-dashboard" onClick={startConversation}>
              Agendar 1-1 con Alan →
            </button>
          </div>
        </div>

        {selectedMetric && (
          <div className="metric-modal-backdrop" onClick={() => setSelectedMetric(null)}>
            <div className="metric-modal" onClick={(e) => e.stopPropagation()}>
              <div className="metric-modal-header">
                <h3>
                  {selectedMetric.icon} {selectedMetric.title}
                </h3>
                <button onClick={() => setSelectedMetric(null)}>×</button>
              </div>
              <div className="metric-modal-body">
                <div className="metric-detail-summary">
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
  // CONVERSATION 1-1 con Alan (chat libre)
  // ═════════════════════════════════════════════════════════════

  if (phase === "conversation") {
    return (
      <div className="challenge03-container">
        <TopBar
          title="🔥 Día 3 · 1-1 con Alan"
          subtitle="1-1 con Alan"
          currentStep={currentStep}
          totalSteps={totalSteps}
          timer={{ display: `${mm}:${ss}`, warning: timer < 180 }}
        />

        <div
          style={{
            maxWidth: 760,
            margin: "0 auto",
            padding: "20px 16px",
            display: "flex",
            flexDirection: "column",
            height: "calc(100vh - 120px)",
          }}
        >
          <div className="kanban-chat" style={{ flex: 1, minHeight: 0 }}>
            <div className="chat-header">
              <h3 className="chat-title">💬 1-1 con Alan</h3>
              <p className="chat-subtitle">
                Es una conversación privada. Cámara apagada del lado de Alan. Cada palabra cuenta.
              </p>
            </div>

            <div className="chat-messages" ref={chatRef}>
              {chat.map((msg, i) => {
                if (msg.narration) {
                  return (
                    <div key={i} className="chat-message narration">
                      <div className="chat-message-text">{msg.text}</div>
                    </div>
                  )
                }
                if (msg.isYou) {
                  return (
                    <div key={i} className="chat-message user">
                      <div className="chat-message-author">Tú (SM) → Alan</div>
                      <div className="chat-message-text">{msg.text}</div>
                    </div>
                  )
                }
                const m = MEMBER_MAP[msg.from]
                if (!m) return null
                return (
                  <div key={i} className="chat-message team">
                    <Avatar member={m} size={28} />
                    <div>
                      <div className="chat-message-author" style={{ color: m.color }}>
                        {m.name}
                      </div>
                      <div className="chat-message-text">{msg.text}</div>
                    </div>
                  </div>
                )
              })}
              {loading && (
                <div className="chat-message narration" style={{ fontStyle: "italic", opacity: 0.7 }}>
                  <div className="chat-message-text">Alan está pensando…</div>
                </div>
              )}
            </div>

            <div className="chat-composer">
              <div className="composer-input-row">
                <textarea
                  className="composer-input"
                  value={smInput}
                  onChange={(e) => setSmInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      if (smInput.trim() && !loading) {
                        const msg = smInput
                        setSmInput("")
                        handleSMMessage(msg)
                      }
                    }
                  }}
                  placeholder="Escribí lo que le dirías a Alan... (Enter para enviar)"
                  rows={2}
                  disabled={loading}
                />
                <button
                  className="composer-send"
                  disabled={!smInput.trim() || loading}
                  onClick={() => {
                    const msg = smInput
                    setSmInput("")
                    handleSMMessage(msg)
                  }}
                >
                  Enviar
                </button>
              </div>
              {turnCount >= 4 && (
                <button className="composer-finish-btn" onClick={startActionPlan}>
                  Cerrar 1-1 y armar plan →
                </button>
              )}
            </div>
          </div>
        </div>

        <AICoach
          challengeName="Día 3 · 1-1 con Alan"
          challengeContext="El SM está en un 1-1 con un dev que muestra señales claras de burnout. El dev llegó a Setlist arrastrando burnout de 1+ año a 14h/día en su empresa anterior — nadie del equipo sabe esto. Está agotado, callado, se siente culpable. Es la primera conversación a solas entre el SM y este dev."
        />
      </div>
    )
  }

  // ═════════════════════════════════════════════════════════════
  // ACTION PLAN (sin "recommended" leak)
  // ═════════════════════════════════════════════════════════════

  if (phase === "action_plan") {
    return (
      <div className="challenge03-container">
        <TopBar
          title="🔥 Día 3 · 1-1 con Alan"
          subtitle="Tu plan después del 1-1"
          currentStep={currentStep}
          totalSteps={totalSteps}
          timer={{ display: `${mm}:${ss}`, warning: timer < 180 }}
        />
        <div className="action-plan-phase">
          <div className="action-plan-header">
            <h2>📋 ¿Qué hacés después de hablar con Alan?</h2>
            <p>Marcá las acciones que tomarías. No hay respuestas correctas marcadas — elegí según lo que pasó en la conversación.</p>
          </div>

          {ACTION_PLAN_CATEGORIES.map((category) => (
            <div
              key={category.id}
              className="action-category"
              style={{ borderLeftColor: category.color }}
            >
              <div className="category-header" style={{ color: category.color }}>
                <h3>{category.title}</h3>
                <p>{category.description}</p>
              </div>
              <div className="action-checklist">
                {ACTION_PLAN_OPTIONS[category.id].map((action) => (
                  <label
                    key={action.id}
                    className={`action-item ${
                      selectedActions[category.id].includes(action.id) ? "selected" : ""
                    }`}
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
              onClick={finishChallenge}
              disabled={
                Object.values(selectedActions).flat().length === 0 || loading
              }
            >
              {loading ? "Cerrando..." : "Finalizar Challenge →"}
            </button>
          </div>
        </div>

        <AICoach
          challengeName="Día 3 · 1-1 con Alan"
          challengeContext="El SM acaba de tener el 1-1 con Alan y ahora está decidiendo qué acciones tomar: inmediatas, de corto plazo, y sistémicas. La elección debe reflejar lo que escuchó en la conversación."
        />
      </div>
    )
  }

  // ═════════════════════════════════════════════════════════════
  // RESULTS
  // ═════════════════════════════════════════════════════════════

  if (phase === "results") {
    return (
      <ChallengeComplete
        challengeTitle="Día 3 · 1-1 con Alan"
        challengeNumber={3}
        accentColor="#ff8a80"
        gradientStart="rgba(255, 138, 128, 0.85)"
        gradientEnd="rgba(250, 128, 114, 0.80)"
        isLastChallenge={isLastChallenge(2)}
      />
    )
  }

  return null
}
