import { useState, useEffect, useRef, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { T } from "../theme"
import { callAI, computeScores, getGrade, buildTeamAgreementsPrompt } from "../engine/ai"
import { saveResult } from "../engine/supabase"
import { Avatar, TopBar } from "../components"
import ChallengeComplete from "../components/ChallengeComplete"
import TeamPanel from "../components/TeamPanel"
import { markChallengeComplete, isLastChallenge } from "../utils/progressTracker"
import { TEAM, MEMBER_MAP, SPRINT_CONTEXT, TEAM_DESC, TEAM_PROPOSALS, DIMENSIONS, BOARD_SECTIONS, INITIAL_BOARD_STATE } from "../data/challenge06"
import "./Challenge06.css"

export default function Challenge06() {
  const nav = useNavigate()
  const [phase, setPhase] = useState("context")
  const [chat, setChat] = useState([])
  const [boardState, setBoardState] = useState(INITIAL_BOARD_STATE)
  const [allScores, setAllScores] = useState([])
  const [allFeedback, setAllFeedback] = useState([])
  const [timer, setTimer] = useState(900) // 15 minutos
  const [startTime] = useState(Date.now())
  const [proposalIdx, setProposalIdx] = useState(0)
  const [evaluationCount, setEvaluationCount] = useState(0)
  const [lastEvaluation, setLastEvaluation] = useState(null)

  const chatRef = useRef(null)
  const timerRef = useRef(null)
  const proposalTimerRef = useRef(null)

  useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight }, [chat])

  // Timer countdown
  useEffect(() => {
    if (phase === "workshop") {
      timerRef.current = setInterval(() => {
        setTimer(t => {
          if (t <= 1) {
            clearInterval(timerRef.current)
            clearTimeout(proposalTimerRef.current)
            finishWorkshop()
            return 0
          }
          return t - 1
        })
      }, 1000)
      return () => clearInterval(timerRef.current)
    }
  }, [phase])

  // Team proposals over time
  useEffect(() => {
    if (phase === "workshop" && proposalIdx < TEAM_PROPOSALS.length) {
      const proposal = TEAM_PROPOSALS[proposalIdx]
      proposalTimerRef.current = setTimeout(() => {
        setChat(p => [...p, { from: proposal.from, text: proposal.text }])
        setProposalIdx(i => i + 1)
      }, proposal.delay)
    }
    return () => clearTimeout(proposalTimerRef.current)
  }, [phase, proposalIdx])


  const mm = String(Math.floor(timer / 60)).padStart(2, "0")
  const ss = String(timer % 60).padStart(2, "0")

  function startChallenge() {
    setPhase("workshop")
    setChat([])
    setProposalIdx(0)
  }

  // Update bulletpoint text
  function updateBulletpoint(section, id, text) {
    setBoardState(prev => ({
      ...prev,
      [section]: prev[section].map(item =>
        item.id === id ? { ...item, text } : item
      )
    }))
  }

  // Evaluate periodically (every 4 board changes)
  useEffect(() => {
    if (phase === "workshop" && evaluationCount > 0 && evaluationCount % 4 === 0) {
      evaluateFacilitation()
    }
  }, [evaluationCount])

  // Track board changes (count filled bulletpoints)
  useEffect(() => {
    if (phase === "workshop") {
      const filledItems = Object.values(boardState).reduce((sum, section) =>
        sum + section.filter(item => item.text.trim().length > 0).length, 0
      )
      if (filledItems > 0) {
        setEvaluationCount(filledItems)
      }
    }
  }, [boardState, phase])

  async function evaluateFacilitation() {
    const boardSummary = Object.entries(boardState)
      .map(([section, items]) => {
        const itemsText = items.map(i => `• ${i.text || "(vacío)"}`).join("\n")
        return `${section}:\n${itemsText || "  (vacío)"}`
      })
      .join("\n\n")

    const chatContext = chat.slice(-15).map(c =>
      `[${MEMBER_MAP[c.from]?.name || "Narración"}: ${c.text}]`
    ).join("\n")

    const sys = buildTeamAgreementsPrompt(TEAM_DESC, SPRINT_CONTEXT, boardSummary, chatContext)
    const res = await callAI(sys, "Evaluando facilitación del workshop")

    if (res && res.scores) {
      const vs = {}
      Object.entries(res.scores).forEach(([k, v]) => { if (v > 0) vs[k] = v })
      setAllScores(s => [...s, vs])
      setAllFeedback(f => [...f, { feedback: res.feedback, quality: res.quality, scores: vs }])
      setLastEvaluation(res)
    }
  }

  async function finishWorkshop() {
    // Final evaluation
    await evaluateFacilitation()
    markChallengeComplete(6)
    setPhase("results")
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
        challengeId: 6,
        scores: finalScores,
        feedback: allFeedback,
        grade: gradeData,
        timeUsed,
        boardState
      }).then(() => {
        console.log("Challenge 06 result saved to Supabase")
      })
    }
  }, [phase, finalScores, allFeedback, gradeData, startTime, boardState])

  const currentStep = phase === "context" ? 1 : phase === "workshop" ? 2 : 3
  const totalSteps = 3

  // Iconos por sección
  const sectionIcons = {
    "Team Values": "⭐",
    "Definition of Ready": "✅",
    "Definition of Done": "🎯",
    "Communication": "💬",
    "Estimation": "📊",
    "Ceremonies": "🗓️"
  }

  // Calcular progreso por sección
  function getSectionProgress(section) {
    const items = boardState[section]
    const filled = items.filter(item => item.text.trim().length > 0).length
    return { filled, total: items.length, percentage: (filled / items.length) * 100 }
  }

  // ═══════════════════════ CONTEXT / BRIEFING ═══════════════════════
  if (phase === "context") {
    return (
      <div style={{ background: T.bg, minHeight: "100vh", color: T.text, fontFamily: "'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif" }}>
        <TopBar
          currentStep={currentStep}
          totalSteps={totalSteps}
          backButton={{ label: "← Back to Challenges", onClick: () => nav("/challenges") }}
        />
        <div style={{ maxWidth: 700, margin: "0 auto", padding: "40px 24px" }}>

          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: 4, color: T.teal, marginBottom: 12, opacity: 0.9 }}>SMATCH · CHALLENGE 06</div>
            <h1 style={{ fontSize: 42, fontWeight: 900, margin: "0 0 12px 0", background: "linear-gradient(135deg, #0a1f44, #7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1.2 }}>
              Team Agreements Workshop
            </h1>
            <p style={{ fontSize: 18, color: T.sub, margin: 0, lineHeight: 1.5 }}>Equipo nuevo, primer día. Facilitá la creación de acuerdos sin imponer.</p>
          </div>

          <div style={{ background: "linear-gradient(135deg, rgba(124, 58, 237, 0.06), #ffffff)", borderRadius: 16, padding: 24, marginBottom: 24, border: "2px solid rgba(124, 58, 237, 0.20)", boxShadow: "0 2px 8px rgba(15, 23, 42, 0.06)" }}>
            <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 3, color: "#7c3aed", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 20 }}>📋</span>
              SITUACIÓN
            </div>
            <div style={{ fontSize: 16, color: T.sub, lineHeight: 1.7, marginBottom: 16 }}>
              Equipo <strong style={{ color: "#7c3aed" }}>Valkyrie</strong> — 7 personas de diferentes backgrounds, primer día juntos. Van a trabajar en un proyecto greenfield. Necesitan establecer <strong>Team Values, DoR, DoD, Communication, Estimation, y Ceremonies</strong> antes de arrancar Sprint 1.
            </div>
            <div style={{ fontSize: 16, color: T.sub, lineHeight: 1.7, padding: "16px 20px", background: "rgba(124, 58, 237, 0.08)", borderRadius: 12, borderLeft: "4px solid #7c3aed" }}>
              Tu rol: <strong style={{ color: T.navy }}>facilitar consenso real</strong> (no superficial). Manejar conflictos cuando surjan. Asegurar que todos participen (especialmente juniors). Crear acuerdos concretos que el equipo realmente va a seguir. Tenés <strong style={{color: "#7c3aed"}}>15 minutos</strong> de workshop.
            </div>
          </div>

          <div style={{ marginBottom: 32 }}>
            <TeamPanel title="Equipo Setlist" showStakeholder={false} />
          </div>

          <button onClick={startChallenge} style={{ width: "100%", padding: "20px 0", background: "linear-gradient(135deg, #7c3aed, #a78bfa)", color: "#ffffff", fontWeight: 900, fontSize: 16, border: "2px solid rgba(124, 58, 237, 0.8)", borderRadius: 12, cursor: "pointer", letterSpacing: 1.5, boxShadow: "0 4px 16px rgba(124, 58, 237, 0.25)", transition: "all 0.3s", textTransform: "uppercase" }} onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 8px 24px rgba(124, 58, 237, 0.35)" }} onMouseLeave={e => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "0 4px 16px rgba(124, 58, 237, 0.25)" }}>
            Iniciar Workshop →
          </button>
        </div>
      </div>
    )
  }

  // ═══════════════════════ RESULTS ═══════════════════════
  if (phase === "results") {
    return (
      <ChallengeComplete
        challengeTitle="Team Agreements Workshop"
        challengeNumber={6}
        accentColor="#7c3aed"
        gradientStart="rgba(124, 58, 237, 0.85)"
        gradientEnd="rgba(109, 40, 217, 0.80)"
        isLastChallenge={isLastChallenge(6)}
      />
    )
  }

  // ═══════════════════════ WORKSHOP VIEW (Board + Chat) ═══════════════════════
  return (
    <div className="workshop-container">
      <TopBar
        title="📋 Team Agreements Workshop"
        subtitle="Equipo Valkyrie · Facilitá la creación de acuerdos"
        currentStep={currentStep}
        totalSteps={totalSteps}
        timer={{ display: `${mm}:${ss}`, warning: timer < 180 }}
      />

      <div className="workshop-main">
        {/* Left: Board Grid */}
        <div className="workshop-board">
          <div className="board-header">
            <h3>🎲 Acuerdos del Equipo</h3>
            <p>Escuchá al equipo en el chat y completá los acuerdos en cada card</p>
          </div>

          <div className="board-grid">
            {BOARD_SECTIONS.map(section => {
              const progress = getSectionProgress(section)
              const isComplete = progress.filled === progress.total

              return (
                <div key={section} className="board-section" data-section={section}>
                  {isComplete && (
                    <div className="section-complete-badge">
                      ✓ COMPLETO
                    </div>
                  )}

                  <div className="section-header">
                    <div className="section-icon">{sectionIcons[section]}</div>
                    <div className="section-header-content">
                      <h4>{section}</h4>
                      <div className="section-progress">
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: `${progress.percentage}%` }}
                          />
                        </div>
                        <span className="progress-text">
                          {progress.filled}/{progress.total}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="section-items">
                    {boardState[section].map((item) => (
                      <div
                        key={item.id}
                        className={`board-item-editable ${item.text.trim() ? 'filled' : ''}`}
                      >
                        <div className="bullet">{item.text.trim() ? '✓' : '○'}</div>
                        <input
                          type="text"
                          className="board-item-input"
                          value={item.text}
                          onChange={(e) => updateBulletpoint(section, item.id, e.target.value)}
                          placeholder="Escribí el acuerdo..."
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right: Chat */}
        <div className="workshop-chat">
          <div className="chat-header">
            <div>
              <h3 className="chat-title">Workshop Chat</h3>
              <p className="chat-subtitle">El equipo está proponiendo ideas</p>
            </div>
          </div>

          <div className="chat-messages" ref={chatRef}>
            <div className="chat-message narration">
              <div className="chat-message-text">
                El equipo está en la sala de Zoom. Algunos se conocen, otros no. Hay expectativa y algo de tensión nerviosa. Laura te mira esperando que arranques el workshop.
              </div>
            </div>
            {chat.map((msg, i) => {
              const m = MEMBER_MAP[msg.from]
              if (!m) return null
              return (
                <div key={i} className="chat-message team">
                  <Avatar member={m} size={28} />
                  <div>
                    <div className="chat-message-author" style={{ color: m.color }}>{m.name}</div>
                    <div className="chat-message-text">{msg.text}</div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="chat-input-area">
            <div style={{ fontSize: 13, color: T.dim, textAlign: "center", padding: "12px", fontStyle: "italic", lineHeight: 1.4 }}>
              El equipo está proponiendo ideas en el chat. Escuchá y documentá los acuerdos en el board de la izquierda.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
