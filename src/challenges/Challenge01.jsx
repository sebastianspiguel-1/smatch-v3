import { useState, useEffect, useRef, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { T } from "../theme"
import {
  callAI,
  buildRetroFacilitationPrompt,
  buildInsightExtractorPrompt,
  computeScores,
  getGrade,
} from "../engine/ai"
import { saveResult } from "../engine/supabase"
import { Avatar, StickyCard, MiniBoard, TopBar, ProgressBar } from "../components"
import TeamPanel from "../components/TeamPanel"
import ChallengeComplete from "../components/ChallengeComplete"
import AICoach from "../components/AICoach"
import { markChallengeComplete, isLastChallenge } from "../utils/progressTracker"
import {
  buildAIContextString,
  updateProfile,
  getProfile,
  DEFAULT_CANDIDATE_ID,
} from "../engine/candidateProfile"
import {
  TEAM,
  MEMBER_MAP,
  SPRINT_CONTEXT,
  SPRINT_STATS,
  SPRINT_SIGNALS,
  TEAM_DESC,
  FORMATS,
  STICKIES,
  DIMENSIONS,
} from "../data/challenge01"
import "./Challenge01.css"
import "./Challenge02.css"

const OPENING_NARRATION =
  "Llegan todos a la sala. El tablero está poblado con stickies del equipo. Gabriela sonríe mirando los positivos. Eric mira el celu. Gian se acomoda en la silla. Es tu primera retro con este equipo. El SM abre."

const OPENING_CHAT = [
  { from: "gabriela", text: "¡Miren ese tablero! Entregamos un montón. Tremendo sprint, equipo." },
  { from: "nacho", text: "Sí, los resultados están buenos. Sigamos así." },
  { from: "eric", text: "Buenos resultados. Hay que estar orgullosos." },
]

export default function Challenge01() {
  const nav = useNavigate()
  const [phase, setPhase] = useState("context")
  const [fmt, setFmt] = useState(null)
  const [justif, setJustif] = useState("")
  const [chat, setChat] = useState([])
  const [stickies, setStickies] = useState([])
  const [smInput, setSmInput] = useState("")
  const [replyTarget, setReplyTarget] = useState(null)
  const [loading, setLoading] = useState(false)
  const [allScores, setAllScores] = useState([])
  const [allFeedback, setAllFeedback] = useState([])
  const [timer, setTimer] = useState(1200) // 20 minutes
  const [startTime] = useState(Date.now())
  const [actionCount, setActionCount] = useState(0)
  const [evaling, setEvaling] = useState(false)

  const chatRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [chat, loading])

  useEffect(() => {
    if (phase === "board") {
      timerRef.current = setInterval(() => {
        setTimer((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current)
            finishChallenge()
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
  const chosenFmt = FORMATS.find((f) => f.id === fmt)

  // ───── Format selection (validates justification only; no leak) ─────
  async function startBoard() {
    setEvaling(true)
    // Guardar la elección como acción para el reporte, sin mostrar feedback.
    setAllFeedback((f) => [
      ...f,
      {
        action: "format_choice",
        target: fmt,
        message: justif,
        scores: {},
      },
    ])
    setEvaling(false)
    proceedToBoard()
  }

  function proceedToBoard() {
    setStickies(STICKIES[fmt]?.initial || [])
    setPhase("board")
    // Apertura de la retro
    setTimeout(() => {
      setChat([
        { narration: true, text: OPENING_NARRATION },
        ...OPENING_CHAT.map((c) => ({ from: c.from, text: c.text })),
      ])
    }, 400)
  }

  // ───── Chat libre + AI per turn ─────
  async function handleSMMessage(message, targetMemberId = null) {
    if (!message.trim() || loading) return

    setChat((p) => [
      ...p,
      {
        isYou: true,
        text: message,
        targetName: targetMemberId ? MEMBER_MAP[targetMemberId]?.name : null,
      },
    ])
    setLoading(true)
    await evaluateAction({
      type: "chat_message",
      target: targetMemberId,
      message,
    })
    setLoading(false)
  }

  function serializeBoard() {
    if (!chosenFmt) return ""
    return chosenFmt.cols
      .map((colName, ci) => {
        const cs = stickies.filter((s) => s.col === ci)
        const items = cs
          .map(
            (s) =>
              `  • [${MEMBER_MAP[s.author]?.name || s.author}] ${s.text} (${
                s.votes?.length || 0
              } votos)`
          )
          .join("\n")
        return `${colName}:\n${items || "  (vacío)"}`
      })
      .join("\n\n")
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

    const boardSummary = serializeBoard()
    const formatName = chosenFmt?.name || "Retro"
    const sys = buildRetroFacilitationPrompt(
      TEAM_DESC,
      boardSummary,
      formatName,
      actionForPrompt,
      chatContext,
      candidateContext
    )
    const res = await callAI(sys, action.message || "Retro turn")
    if (!res) return

    if (res.reactions) {
      setChat((p) => [
        ...p,
        ...res.reactions.map((r) => ({ from: r.from, text: r.text })),
      ])
    }
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
    if (res.newStickies && res.newStickies.length > 0) {
      setStickies((p) => [...p, ...res.newStickies])
    }
    setActionCount((c) => c + 1)
  }

  async function finishChallenge() {
    clearInterval(timerRef.current)
    markChallengeComplete(1)
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
        .filter((i) => i.challenge === "La retro que parece perfecta")
        .map((i) => `SM pregunta: "${i.sm_question}"\nCoach responde: "${i.coach_response}"`)
        .join("\n\n")

      const actionsLog = allFeedback
        .map((fb) => `${fb.action}${fb.target ? ` → ${fb.target}` : ""}: "${fb.message || ""}"`)
        .join("\n")

      const prompt = buildInsightExtractorPrompt(
        "La retro que parece perfecta (C01)",
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
            challenge: "C01",
            note: m.note || m,
          })),
        },
        challenge_history: [
          {
            challenge: "C01",
            challenge_name: "La retro que parece perfecta",
            completed_at: new Date().toISOString(),
            ai_fluency_score: aiFluencyScore,
            ai_fluency_rationale: insights.ai_fluency?.rationale,
          },
        ],
      })
    } catch (e) {
      console.error("Error en insight extraction C01:", e)
    }
  }

  const progressSteps = [
    { label: "Contexto" },
    { label: "Formato" },
    { label: "Facilitación" },
    { label: "Resultados" },
  ]
  const currentStep =
    phase === "context" ? 0 : phase === "format" ? 1 : phase === "board" ? 2 : 3

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
        challengeId: 1,
        scores: finalScores,
        feedback: allFeedback,
        grade: gradeData,
        timeUsed,
      }).then(() => console.log("Challenge 01 result saved to Supabase"))
    }
  }, [phase, finalScores, allFeedback, gradeData, startTime])

  // ═══════════════════════ CONTEXT ═══════════════════════
  if (phase === "context")
    return (
      <div className="challenge-context">
        <TopBar
          backButton={{ label: "← Back to Challenges", onClick: () => nav("/challenges") }}
          progress={<ProgressBar steps={progressSteps} current={currentStep} />}
        />
        <div className="context-container">
          <div className="context-header">
            <h1 className="context-title">Sprint 1 · Día 10 — Briefing</h1>
            <p className="context-subtitle">
              Primera retro del equipo Setlist. Leé el contexto antes de facilitar.
            </p>
          </div>

          <div className="sprint-stats-grid">
            {SPRINT_STATS.map((s) => (
              <div key={s.label} className="stat-card">
                <span className="stat-icon">{s.icon}</span>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="team-section">
            <TeamPanel title="Equipo Setlist" showStakeholder={false} compact />
          </div>

          <div className="signals-section">
            <div className="signals-header">SEÑALES DEL SPRINT</div>
            {SPRINT_SIGNALS.map((e, i) => (
              <div key={i} className="signal-item">
                <Avatar member={MEMBER_MAP[e.from]} size={32} />
                <div className="signal-content">
                  <div className="signal-meta">
                    {MEMBER_MAP[e.from]?.name} · {e.ts}
                  </div>
                  <div className="signal-text">{e.text}</div>
                </div>
              </div>
            ))}
          </div>

          <button onClick={() => setPhase("format")} className="context-start-btn">
            ELEGIR FORMATO DE RETRO →
          </button>
        </div>
      </div>
    )

  // ═══════════════════════ FORMAT ═══════════════════════
  if (phase === "format")
    return (
      <div className="format-selection">
        <TopBar
          backButton={{ label: "← Briefing", onClick: () => setPhase("context") }}
          progress={<ProgressBar steps={progressSteps} current={currentStep} />}
        />
        <div className="format-container">
          <div className="format-header">
            <div className="format-badge">PUNTO DE DECISIÓN</div>
            <h1 className="format-title">Elegí el formato de retro</h1>
            <p className="format-subtitle">
              Basándote en el contexto del sprint, ¿cuál formato le viene a este equipo?
            </p>
          </div>

          <div className="format-cards-grid">
            {FORMATS.map((f) => (
              <div
                key={f.id}
                onClick={() => setFmt(f.id)}
                className={`format-card ${fmt === f.id ? "selected" : ""}`}
                style={{ position: "relative" }}
              >
                <div className="format-info">
                  <h3 className="format-name">{f.name}</h3>
                  <p className="format-desc">{f.desc}</p>
                </div>
                <div className="format-preview">
                  <MiniBoard cols={f.cols} active={fmt === f.id} />
                </div>
              </div>
            ))}
          </div>

          {fmt && (
            <>
              <div className="justification-section">
                <label className="justification-label">¿POR QUÉ ESTE FORMATO?</label>
                <textarea
                  value={justif}
                  onChange={(e) => setJustif(e.target.value)}
                  placeholder="Explicá tu razonamiento. ¿Qué del contexto del sprint o la dinámica del equipo te llevó a elegir este formato?"
                  className="justification-textarea"
                />
              </div>
              <button
                onClick={() => {
                  if (!evaling && justif.trim()) startBoard()
                }}
                disabled={evaling || !justif.trim()}
                className="format-start-btn"
              >
                {evaling ? "CARGANDO..." : "INICIAR RETROSPECTIVA →"}
              </button>
            </>
          )}
        </div>
      </div>
    )

  // ═══════════════════════ RESULTS ═══════════════════════
  if (phase === "results")
    return (
      <ChallengeComplete
        challengeTitle="La retro que parece perfecta"
        challengeNumber={1}
        accentColor="#00d4aa"
        gradientStart="rgba(0, 212, 170, 0.85)"
        gradientEnd="rgba(5, 150, 105, 0.80)"
        isLastChallenge={isLastChallenge(1)}
      />
    )

  // ═══════════════════════ BOARD (chat libre) ═══════════════════════
  const cols = chosenFmt?.cols || ["Keep Doing", "Improve"]
  const colColors = ["#16a34a", "#dc2626", "#d97706", "#2563eb"]

  return (
    <div
      style={{
        background: T.bg,
        height: "100vh",
        color: T.text,
        fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* TopBar */}
      <div
        style={{
          background: T.navy,
          height: 52,
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          gap: 12,
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => nav("/challenges")}
          style={{
            padding: "4px 10px",
            fontSize: 11,
            background: "rgba(255,255,255,.1)",
            color: "#fff",
            border: "1px solid rgba(255,255,255,.15)",
            borderRadius: 6,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          ← Volver
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 15 }}>🎯</span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "rgba(255,255,255,.9)",
              letterSpacing: ".5px",
            }}
          >
            SPRINT 1 · DÍA 10 · {chosenFmt?.name?.toUpperCase() || "RETRO"}
          </span>
          <span style={{ color: "rgba(255,255,255,.3)" }}>·</span>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,.6)" }}>Equipo Setlist</span>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 16,
              fontWeight: 700,
              color: timer < 120 ? "#fca5a5" : "rgba(255,255,255,.8)",
              background: "rgba(0,0,0,.2)",
              padding: "4px 12px",
              borderRadius: 6,
            }}
          >
            {mm}:{ss}
          </div>
          {actionCount >= 4 && (
            <button
              onClick={finishChallenge}
              disabled={loading}
              style={{
                padding: "6px 14px",
                fontSize: 12,
                background: T.teal,
                color: T.bg,
                border: "none",
                borderRadius: 6,
                cursor: loading ? "not-allowed" : "pointer",
                fontWeight: 800,
                letterSpacing: ".3px",
              }}
            >
              {loading ? "Cerrando..." : "Cerrar retro →"}
            </button>
          )}
        </div>
      </div>

      {/* Color bar */}
      <div style={{ display: "flex", height: 3, flexShrink: 0 }}>
        {cols.map((_, i) => (
          <div key={i} style={{ flex: 1, background: colColors[i % colColors.length] }} />
        ))}
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Board */}
        <div
          style={{
            flex: 1,
            padding: 8,
            overflowY: "auto",
            borderRight: `1px solid ${T.border}`,
          }}
        >
          {fmt === "sailboat" ? (
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                minHeight: 650,
                background:
                  "linear-gradient(to bottom, #e0f2fe 0%, #bae6fd 35%, #7dd3fc 60%, #38bdf8 100%)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "40%",
                  background:
                    "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.5), transparent 40%), radial-gradient(circle at 70% 15%, rgba(255,255,255,0.4), transparent 35%)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "55%",
                  background:
                    "linear-gradient(to bottom, rgba(56,189,248,0.2), rgba(3,105,161,0.15))",
                  borderRadius: "50% 50% 0 0 / 40px 40px 0 0",
                }}
              />

              {/* Wind */}
              <div
                style={{ position: "absolute", top: "8%", left: "3%", textAlign: "center", zIndex: 10 }}
              >
                <div style={{ fontSize: 56, marginBottom: 4 }}>🌬️</div>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: "#059669",
                    marginBottom: 10,
                    letterSpacing: 1.5,
                    textTransform: "uppercase",
                  }}
                >
                  Wind
                </div>
                <div style={{ width: 170 }}>
                  {stickies
                    .filter((s) => s.col === 0)
                    .map((s, i) => (
                      <StickyCard
                        key={`wind-${i}`}
                        sticky={s}
                        memberMap={MEMBER_MAP}
                        delay={i * 200}
                      />
                    ))}
                </div>
              </div>

              {/* Island */}
              <div
                style={{
                  position: "absolute",
                  top: "48%",
                  right: "5%",
                  transform: "translateY(-50%)",
                  textAlign: "center",
                  zIndex: 10,
                }}
              >
                <div style={{ fontSize: 70, marginBottom: 4 }}>🏝️</div>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: "#059669",
                    marginBottom: 10,
                    letterSpacing: 1.5,
                    textTransform: "uppercase",
                  }}
                >
                  Island
                </div>
                <div style={{ width: 170 }}>
                  {stickies
                    .filter((s) => s.col === 3)
                    .map((s, i) => (
                      <StickyCard
                        key={`island-${i}`}
                        sticky={s}
                        memberMap={MEMBER_MAP}
                        delay={i * 200}
                      />
                    ))}
                </div>
              </div>

              {/* Boat */}
              <div
                style={{
                  position: "absolute",
                  top: "45%",
                  left: "25%",
                  transform: "translate(-50%, -50%)",
                  textAlign: "center",
                  zIndex: 15,
                }}
              >
                <div style={{ fontSize: 140, transform: "rotate(5deg)" }}>⛵</div>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#0a1f44",
                    marginTop: 8,
                    background: "rgba(255,255,255,0.85)",
                    padding: "4px 12px",
                    borderRadius: 12,
                  }}
                >
                  Equipo Setlist
                </div>
              </div>

              {/* Rocks */}
              <div
                style={{ position: "absolute", top: "52%", right: "28%", textAlign: "center", zIndex: 12 }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: "#ea580c",
                    marginBottom: 4,
                    letterSpacing: 1.5,
                    textTransform: "uppercase",
                  }}
                >
                  Rocks
                </div>
                <div style={{ fontSize: 60, marginBottom: 4 }}>🪨</div>
                <div style={{ width: 170 }}>
                  {stickies
                    .filter((s) => s.col === 2)
                    .map((s, i) => (
                      <StickyCard
                        key={`rocks-${i}`}
                        sticky={s}
                        memberMap={MEMBER_MAP}
                        delay={i * 200}
                      />
                    ))}
                </div>
              </div>

              {/* Anchor */}
              <div
                style={{
                  position: "absolute",
                  bottom: "3%",
                  left: "25%",
                  transform: "translateX(-50%)",
                  textAlign: "center",
                  zIndex: 10,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: "#dc2626",
                    marginBottom: 4,
                    letterSpacing: 1.5,
                    textTransform: "uppercase",
                  }}
                >
                  Anchor
                </div>
                <div style={{ fontSize: 60, marginBottom: 4 }}>⚓</div>
                <div style={{ width: 190 }}>
                  {stickies
                    .filter((s) => s.col === 1)
                    .map((s, i) => (
                      <StickyCard
                        key={`anchor-${i}`}
                        sticky={s}
                        memberMap={MEMBER_MAP}
                        delay={i * 200}
                      />
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 6, height: "100%" }}>
              {cols.map((colName, ci) => {
                const cs = stickies.filter((s) => s.col === ci)
                const neg = ["Improve", "Sad 😔", "Mad 😤", "Start", "Stop", "Anchor ⚓", "Rocks 🪨"]
                const isNeg = neg.includes(colName)
                return (
                  <div key={ci} style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: 1.5,
                        color: isNeg ? T.orange : T.teal,
                        textAlign: "center",
                        padding: "5px 0",
                        marginBottom: 5,
                        background: isNeg ? `${T.orange}18` : T.tealDim,
                        borderRadius: 5,
                        textTransform: "uppercase",
                        border: isNeg ? `1px dashed ${T.orange}30` : "1px solid transparent",
                      }}
                    >
                      {colName}{" "}
                      <span style={{ fontSize: 8, opacity: 0.6 }}>({cs.length})</span>
                    </div>
                    <div>
                      {cs.map((s, i) => (
                        <StickyCard
                          key={`${ci}-${i}-${s.text.slice(0, 8)}`}
                          sticky={s}
                          memberMap={MEMBER_MAP}
                          delay={i * 200}
                        />
                      ))}
                    </div>
                    {cs.length === 0 && (
                      <div
                        style={{
                          fontSize: 9,
                          color: T.dim,
                          textAlign: "center",
                          padding: 16,
                          opacity: 0.4,
                          fontStyle: "italic",
                        }}
                      >
                        Sin items todavía
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Chat libre (estilo Challenge02) */}
        <div className="kanban-chat" style={{ width: 360, flexShrink: 0 }}>
          <div className="chat-header">
            <h3 className="chat-title">💬 Retro en vivo</h3>
            <p className="chat-subtitle">
              Facilitá la conversación. Click en un avatar para dirigir tu mensaje.
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
                    <div className="chat-message-author">
                      Tú (SM){msg.targetName ? ` → ${msg.targetName}` : ""}
                    </div>
                    <div className="chat-message-text">{msg.text}</div>
                  </div>
                )
              }
              const m = MEMBER_MAP[msg.from]
              if (!m) return null
              return (
                <div
                  key={i}
                  className="chat-message team"
                  onClick={() => setReplyTarget(msg.from)}
                  style={{ cursor: "pointer" }}
                >
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
              <div
                className="chat-message narration"
                style={{ fontStyle: "italic", opacity: 0.7 }}
              >
                <div className="chat-message-text">El equipo está procesando…</div>
              </div>
            )}
          </div>

          <div className="chat-composer">
            {replyTarget && MEMBER_MAP[replyTarget] && (
              <div className="reply-target-bar">
                <span>
                  Respondiendo a{" "}
                  <strong style={{ color: MEMBER_MAP[replyTarget].color }}>
                    {MEMBER_MAP[replyTarget].name}
                  </strong>
                </span>
                <button
                  onClick={() => setReplyTarget(null)}
                  className="reply-target-clear"
                  aria-label="Quitar destinatario"
                >
                  ×
                </button>
              </div>
            )}
            <div className="team-avatar-row">
              {TEAM.map((m) => (
                <button
                  key={m.id}
                  className={`team-avatar-pick ${replyTarget === m.id ? "active" : ""}`}
                  onClick={() => setReplyTarget(replyTarget === m.id ? null : m.id)}
                  title={`Hablar a ${m.name}`}
                  style={{ borderColor: replyTarget === m.id ? m.color : "transparent" }}
                >
                  <Avatar member={m} size={28} />
                </button>
              ))}
            </div>
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
                      const target = replyTarget
                      setSmInput("")
                      setReplyTarget(null)
                      handleSMMessage(msg, target)
                    }
                  }
                }}
                placeholder={
                  replyTarget && MEMBER_MAP[replyTarget]
                    ? `Hablale a ${MEMBER_MAP[replyTarget].name}...`
                    : "Facilitá la retro... (Enter para enviar)"
                }
                rows={2}
                disabled={loading}
              />
              <button
                className="composer-send"
                disabled={!smInput.trim() || loading}
                onClick={() => {
                  const msg = smInput
                  const target = replyTarget
                  setSmInput("")
                  setReplyTarget(null)
                  handleSMMessage(msg, target)
                }}
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      </div>

      <AICoach
        challengeName="La retro que parece perfecta"
        challengeContext={`El SM está facilitando la PRIMERA retro del equipo Setlist (Sprint 1, Día 10/10). Entregaron 22 de 29 pts. El tablero (${
          chosenFmt?.name || "retro"
        }) muestra muchos positivos pero también tensiones que nadie nombra: scope creep del PO en comentarios, deuda de documentación, un bug ignorado en planning, voces calladas (Eric, Alan, David). Gabriela y Nacho quieren cerrar rápido.`}
      />
    </div>
  )
}
