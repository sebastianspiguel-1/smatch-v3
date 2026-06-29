import { useState, useEffect, useMemo, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { T } from "../theme"
import {
  callAI,
  buildVelocityNegotiationPrompt,
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
  STAKEHOLDER_MAP,
  MEMBER_MAP,
  SPRINT_CONTEXT,
  SITUACION,
  SPRINT_SNAPSHOT,
  TEAM_DESC,
  INVESTIGATION_METRICS,
  PREPARATION_ARGUMENTS,
  INITIAL_PAULA_STATE,
  OPENING_NARRATION_PAULA,
  OPENING_PAULA_MESSAGE,
  DIMENSIONS,
} from "../data/challenge04"
import "./Challenge04.css"
import "./Challenge03.css"

export default function Challenge04() {
  const nav = useNavigate()
  const [phase, setPhase] = useState("context") // context | investigation | meeting | results

  // Investigation
  const [selectedMetrics, setSelectedMetrics] = useState([])
  const [preparedArguments, setPreparedArguments] = useState([])

  // Meeting (chat libre)
  const [chat, setChat] = useState([])
  const [smInput, setSmInput] = useState("")
  const [paulaState, setPaulaState] = useState(INITIAL_PAULA_STATE)
  const [loading, setLoading] = useState(false)
  const [turnCount, setTurnCount] = useState(0)

  // Scoring
  const [allScores, setAllScores] = useState([])
  const [allFeedback, setAllFeedback] = useState([])
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
            if (phase === "meeting") finishChallenge()
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
    phase === "context" ? 1 : phase === "investigation" ? 2 : phase === "meeting" ? 3 : 4
  const totalSteps = 4

  function toggleMetricSelection(metricId) {
    setSelectedMetrics((prev) =>
      prev.includes(metricId) ? prev.filter((id) => id !== metricId) : [...prev, metricId]
    )
  }

  function toggleArgumentSelection(argId) {
    setPreparedArguments((prev) =>
      prev.includes(argId) ? prev.filter((id) => id !== argId) : [...prev, argId]
    )
  }

  function startMeeting() {
    setPhase("meeting")
    setTimeout(() => {
      setChat([
        { narration: true, text: OPENING_NARRATION_PAULA },
        { from: OPENING_PAULA_MESSAGE.from, text: OPENING_PAULA_MESSAGE.text, isPaula: true },
      ])
    }, 400)
  }

  async function handleSMMessage(message) {
    if (!message.trim() || loading) return
    setChat((p) => [...p, { isYou: true, text: message, targetName: "Paula" }])
    setLoading(true)
    await evaluateAction({ type: "chat_message", target: "paula", message })
    setLoading(false)
  }

  async function evaluateAction(action) {
    const chatContext = chat.slice(-12).map((c) =>
      c.narration
        ? { from: "narration", text: c.text }
        : c.isYou
        ? { from: "sm", text: c.text }
        : { from: c.isPaula ? "Paula" : MEMBER_MAP[c.from]?.name || c.from, text: c.text }
    )
    const candidateContext = buildAIContextString(DEFAULT_CANDIDATE_ID)
    const argsForPrompt = preparedArguments
      .map((id) => PREPARATION_ARGUMENTS.find((a) => a.id === id))
      .filter(Boolean)

    const sys = buildVelocityNegotiationPrompt(
      TEAM_DESC,
      SPRINT_CONTEXT,
      paulaState,
      argsForPrompt,
      { ...action, target: "Paula" },
      chatContext,
      candidateContext
    )
    const res = await callAI(sys, action.message || "Meeting turn")
    if (!res) return

    if (res.reactions) {
      setChat((p) => [
        ...p,
        ...res.reactions.map((r) => ({ from: r.from, text: r.text, isPaula: r.from === "paula" })),
      ])
    }
    if (res.newPaulaState) setPaulaState(res.newPaulaState)

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

  async function finishChallenge() {
    clearInterval(timerRef.current)
    markChallengeComplete(4)
    setAllFeedback((f) => [
      ...f,
      {
        action: "preparation",
        target: null,
        message: `metrics=[${selectedMetrics.join(",")}] args=[${preparedArguments.join(",")}]`,
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
            : `${c.isPaula ? "Paula" : MEMBER_MAP[c.from]?.name || c.from}: "${c.text}"`
        )
        .join("\n")

      const profile = getProfile(DEFAULT_CANDIDATE_ID)
      const coachLog = (profile.ai_coach_usage.interactions || [])
        .filter((i) => i.challenge === "Día 7 · Reunión con Paula")
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
        .join("\n")

      const prompt = buildInsightExtractorPrompt(
        "Día 7 · Reunión con Paula (C04)",
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
            challenge: "C04",
            note: m.note || m,
          })),
        },
        challenge_history: [
          {
            challenge: "C04",
            challenge_name: "Día 7 · Reunión con Paula",
            completed_at: new Date().toISOString(),
            ai_fluency_score: aiFluencyScore,
            ai_fluency_rationale: insights.ai_fluency?.rationale,
          },
        ],
      })
    } catch (e) {
      console.error("Error en insight extraction C04:", e)
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
        challengeId: 4,
        scores: finalScores,
        feedback: allFeedback,
        grade: gradeData,
        timeUsed,
      })
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
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: 4, color: "#dc2626", marginBottom: 12 }}>SMATCH · CHALLENGE 04</div>
            <h1 style={{ fontSize: 42, fontWeight: 900, margin: "0 0 12px 0", background: "linear-gradient(135deg, #dc2626, #b91c1c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1.2 }}>
              Día 7 · Reunión con Paula
            </h1>
            <p style={{ fontSize: 18, color: T.sub, margin: 0, lineHeight: 1.5 }}>
              Sprint 1 · Día 7. Paula hizo una proyección y entró en pánico.
            </p>
          </div>

          <div style={{ background: "linear-gradient(135deg, rgba(220, 38, 38, 0.06), #ffffff)", borderRadius: 16, padding: 24, marginBottom: 24, border: "2px solid rgba(220, 38, 38, 0.20)" }}>
            <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 3, color: "#dc2626", marginBottom: 16 }}>📋 SITUACIÓN</div>
            <div style={{ fontSize: 15, color: T.sub, lineHeight: 1.7 }}>
              {SITUACION}
            </div>
          </div>

          <div style={{ background: T.panel, borderRadius: 16, padding: 24, marginBottom: 24, border: `2px solid ${T.border}` }}>
            <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 3, color: "#dc2626", marginBottom: 16 }}>📊 SPRINT 1 — DÍA 7</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              <div style={{ background: "#f8fafc", borderRadius: 10, padding: "12px", textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.dim }}>Comprometido</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: "#0f172a" }}>{SPRINT_SNAPSHOT.committed}</div>
              </div>
              <div style={{ background: "#f8fafc", borderRadius: 10, padding: "12px", textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.dim }}>Completado</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: "#dc2626" }}>{SPRINT_SNAPSHOT.completed}</div>
              </div>
              <div style={{ background: "#f8fafc", borderRadius: 10, padding: "12px", textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.dim }}>En curso</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: "#f59e0b" }}>{SPRINT_SNAPSHOT.inProgress}</div>
              </div>
              <div style={{ background: "#f8fafc", borderRadius: 10, padding: "12px", textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.dim }}>Días restantes</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: "#0f172a" }}>{SPRINT_SNAPSHOT.daysRemaining}</div>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <TeamPanel strip showStakeholder={true} />
          </div>

          <button
            onClick={() => setPhase("investigation")}
            style={{ width: "100%", padding: "20px 0", background: "linear-gradient(135deg, #dc2626, #b91c1c)", color: "#ffffff", fontWeight: 900, fontSize: 16, border: "none", borderRadius: 12, cursor: "pointer", textTransform: "uppercase" }}
          >
            Investigar antes del meeting →
          </button>
        </div>
      </div>
    )
  }

  // ═════════════════════════════════════════════════════════════
  // INVESTIGATION (sin "recommended" markers)
  // ═════════════════════════════════════════════════════════════

  if (phase === "investigation") {
    return (
      <div className="challenge05-container">
        <TopBar
          title="📊 Día 7 · Reunión con Paula"
          subtitle="Investigá los datos y prepará tus argumentos"
          currentStep={currentStep}
          totalSteps={totalSteps}
          timer={{ display: `${mm}:${ss}`, warning: timer < 180 }}
        />
        <div className="investigation-phase">
          <div className="phase-objective">
            <div className="objective-icon">🎯</div>
            <div className="objective-content">
              <h3>Antes de hablar con Paula</h3>
              <p>
                Mirá los datos del sprint. Marcá las señales que vas a usar y los argumentos que vas
                a llevar al meeting. No hay respuestas marcadas — elegís bajo tu criterio.
              </p>
            </div>
          </div>

          <div className="investigation-section">
            <h2>🔍 Datos observables al Día 7</h2>
            <div className="metrics-grid">
              {INVESTIGATION_METRICS.map((metric) => (
                <div
                  key={metric.id}
                  className={`investigation-metric ${metric.status} ${
                    selectedMetrics.includes(metric.id) ? "selected" : ""
                  }`}
                  onClick={() => toggleMetricSelection(metric.id)}
                >
                  <div className="metric-header">
                    <span>{metric.icon}</span>
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
            <h2>📝 Argumentos que vas a llevar</h2>
            <div className="arguments-list">
              {PREPARATION_ARGUMENTS.map((arg) => (
                <label
                  key={arg.id}
                  className={`argument-card ${
                    preparedArguments.includes(arg.id) ? "selected" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={preparedArguments.includes(arg.id)}
                    onChange={() => toggleArgumentSelection(arg.id)}
                  />
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
            <button
              className="btn-start-meeting"
              onClick={startMeeting}
              disabled={preparedArguments.length === 0}
            >
              {preparedArguments.length === 0
                ? "Marcá al menos 1 argumento"
                : `Ir al meeting con Paula (${preparedArguments.length} argumentos) →`}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ═════════════════════════════════════════════════════════════
  // MEETING (chat libre con Paula)
  // ═════════════════════════════════════════════════════════════

  if (phase === "meeting") {
    return (
      <div className="challenge05-container">
        <TopBar
          title="📊 Día 7 · Reunión con Paula"
          subtitle="Meeting 1-1 con Paula"
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
              <h3 className="chat-title">💬 Meeting con Paula Ríos · EM</h3>
              <p className="chat-subtitle">
                Está en pánico por la proyección. Tiene presión del CEO. Llevá tus argumentos.
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
                      <div className="chat-message-author">Tú (SM) → Paula</div>
                      <div className="chat-message-text">{msg.text}</div>
                    </div>
                  )
                }
                const sh = msg.isPaula ? STAKEHOLDER_MAP.paula : MEMBER_MAP[msg.from]
                if (!sh) return null
                return (
                  <div key={i} className="chat-message team">
                    <Avatar member={sh} size={28} />
                    <div>
                      <div className="chat-message-author" style={{ color: sh.color }}>
                        {sh.name}
                      </div>
                      <div className="chat-message-text">{msg.text}</div>
                    </div>
                  </div>
                )
              })}
              {loading && (
                <div className="chat-message narration" style={{ fontStyle: "italic", opacity: 0.7 }}>
                  <div className="chat-message-text">Paula está pensando…</div>
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
                  placeholder="Respondele a Paula... (Enter para enviar)"
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
                <button
                  className="composer-finish-btn"
                  onClick={finishChallenge}
                  disabled={loading}
                >
                  {loading ? "Cerrando..." : "Cerrar meeting →"}
                </button>
              )}
            </div>
          </div>
        </div>

        <AICoach
          challengeName="Día 7 · Reunión con Paula"
          challengeContext="El SM está en un meeting con Paula (Engineering Manager) en Sprint 1 Día 7. Paula hizo una proyección lineal y le dio que se va a entregar 60% del sprint. Trae presión del CEO. Las causas reales del 'retraso' son: bloqueo externo (Spotify API), scope creep mid-sprint del PO, y un dev arrastrando burnout. Sprint 1 no es predictivo. El SM debe defender al equipo con datos sin pelearse ni rendirse."
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
        challengeTitle="Día 7 · Reunión con Paula"
        challengeNumber={4}
        accentColor="#dc2626"
        gradientStart="rgba(220, 38, 38, 0.85)"
        gradientEnd="rgba(185, 28, 28, 0.80)"
        grade={gradeData}
      />
    )
  }

  return null
}
