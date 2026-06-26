import { useState, useEffect, useRef, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { T } from "../theme"
import { callAI, computeScores, getGrade, buildBlockerChallengePrompt, buildInsightExtractorPrompt } from "../engine/ai"
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
  TEAM,
  MEMBER_MAP,
  SPRINT_CONTEXT,
  SITUACION,
  SPRINT_SUMMARY,
  TEAM_DESC,
  KANBAN_COLUMNS,
  INITIAL_KANBAN_STATE,
  CHAT_TRIGGERS,
  CARD_DETAILS,
  DIMENSIONS
} from "../data/challenge03"
import "./Challenge03.css"

export default function Challenge03() {
  const nav = useNavigate()
  const [phase, setPhase] = useState("context")
  const [kanbanState, setKanbanState] = useState(INITIAL_KANBAN_STATE)
  const [selectedCard, setSelectedCard] = useState(null)
  const [chat, setChat] = useState([])
  const [allScores, setAllScores] = useState([])
  const [allFeedback, setAllFeedback] = useState([])
  const [timer, setTimer] = useState(1200) // 20 minutes
  const [startTime] = useState(Date.now())
  const [draggedCard, setDraggedCard] = useState(null)
  const [draggedFromColumn, setDraggedFromColumn] = useState(null)
  // ─── Chat composer state (new) ───
  const [smInput, setSmInput] = useState("")
  const [replyTarget, setReplyTarget] = useState(null)
  const [loading, setLoading] = useState(false)
  const [actionCount, setActionCount] = useState(0)

  const chatRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight }, [chat])
  useEffect(() => {
    if (phase === "board") {
      timerRef.current = setInterval(() => {
        setTimer(t => {
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

  function startChallenge() {
    setPhase("board")
    setChat([])
    // Trigger initial narration
    setTimeout(() => {
      triggerChatReaction("on_board_view")
    }, 500)
  }

  function triggerChatReaction(triggerKey) {
    const messages = CHAT_TRIGGERS[triggerKey]
    if (messages) {
      const newMsgs = messages.map(m => {
        if (m.from === "narration") {
          return { narration: true, text: m.text }
        }
        return { from: m.from, text: m.text }
      })
      setChat(prev => [...prev, ...newMsgs])
    }
  }

  function handleCardClick(cardId) {
    setSelectedCard(cardId)

    // Trigger specific chat reactions
    if (cardId === "SL-105") {
      triggerChatReaction("on_card_click_SL105")
    } else if (cardId === "SL-106" || cardId === "SL-107") {
      triggerChatReaction("on_card_click_waiting")
    } else if (cardId === "SL-103" || cardId === "SL-106") {
      triggerChatReaction("on_card_click_nacho")
    }

    // Evaluate action
    evaluateAction({
      type: "card_click",
      target: cardId,
      message: null
    })
  }

  // ─── Handler unificado: el SM escribe en su input libre ───
  async function handleSMMessage(message, targetMemberId = null) {
    if (!message.trim() || loading) return

    // Show SM's message immediately in chat
    setChat(p => [...p, {
      isYou: true,
      text: message,
      targetName: targetMemberId ? MEMBER_MAP[targetMemberId]?.name : null
    }])
    setLoading(true)

    await evaluateAction({
      type: "chat_message",
      target: targetMemberId,
      message: message
    })

    setLoading(false)
  }

  // Drag and Drop handlers
  function handleDragStart(card, columnId) {
    setDraggedCard(card)
    setDraggedFromColumn(columnId)
  }

  function handleDragOver(e) {
    e.preventDefault() // Allow drop
  }

  function handleDrop(e, targetColumnId) {
    e.preventDefault()
    if (!draggedCard || !draggedFromColumn) return

    // Don't do anything if dropped in same column
    if (draggedFromColumn === targetColumnId) {
      setDraggedCard(null)
      setDraggedFromColumn(null)
      return
    }

    // Move card from source to target column
    setKanbanState(prev => {
      const newState = { ...prev }
      // Remove from source
      newState[draggedFromColumn] = newState[draggedFromColumn].filter(c => c.id !== draggedCard.id)
      // Add to target
      newState[targetColumnId] = [...newState[targetColumnId], draggedCard]
      return newState
    })

    // Log the action for evaluation
    evaluateAction({
      type: "move_card",
      target: draggedCard.id,
      message: `Moved ${draggedCard.id} from ${draggedFromColumn} to ${targetColumnId}`
    })

    setDraggedCard(null)
    setDraggedFromColumn(null)
  }

  async function evaluateAction(action) {
    const chatContext = chat.slice(-10).map(c =>
      c.narration ? { from: 'narration', text: c.text } :
      c.isYou ? { from: 'sm', text: c.text } :
      { from: MEMBER_MAP[c.from]?.name || c.from, text: c.text }
    )

    // Inject candidate profile context (vacío en primer challenge)
    const candidateContext = buildAIContextString(DEFAULT_CANDIDATE_ID)

    // Use member name as target if specified
    const actionForPrompt = {
      ...action,
      target: action.target ? MEMBER_MAP[action.target]?.name : null
    }

    const sys = buildBlockerChallengePrompt(TEAM_DESC, kanbanState, actionForPrompt, chatContext, candidateContext)
    const res = await callAI(sys, action.message || "Action evaluation")

    if (res) {
      // Add team reactions
      if (res.reactions) {
        const newMsgs = res.reactions.map(r => ({ from: r.from, text: r.text }))
        setChat(p => [...p, ...newMsgs])
      }

      // Store scores SILENTLY (candidato no las ve)
      const vs = {}
      if (res.scores) Object.entries(res.scores).forEach(([k, v]) => { if (v > 0) vs[k] = v })

      setAllScores(s => [...s, vs])
      // Solo guardar la acción + scores para el reporte del recruiter.
      // NO guardar quality/feedback (estaban en versiones anteriores como leak).
      setAllFeedback(f => [...f, {
        action: action.type,
        target: action.target,
        message: action.message,
        scores: vs
      }])

      // Update board if needed
      if (res.boardUpdates && Object.keys(res.boardUpdates).length > 0) {
        applyBoardUpdates(res.boardUpdates)
      }

      setActionCount(c => c + 1)
    }
  }

  function serializeBoard() {
    return Object.entries(kanbanState)
      .map(([column, cards]) => {
        const wipInfo = column === "DOING" && cards.length > KANBAN_COLUMNS.find(c => c.id === "DOING").wipLimit
          ? ` ⚠️ WIP LIMIT EXCEEDED (${cards.length}/${KANBAN_COLUMNS.find(c => c.id === "DOING").wipLimit})`
          : ""
        const cardsText = cards.map(c =>
          `• ${c.id}: ${c.title} (${c.assignee ? MEMBER_MAP[c.assignee]?.name : 'unassigned'}, status: ${c.status}${c.blockedDays ? `, blocked ${c.blockedDays}d` : ''})`
        ).join("\n")
        return `${column}${wipInfo}:\n${cardsText || "  (vacío)"}`
      })
      .join("\n\n")
  }

  function applyBoardUpdates(updates) {
    setKanbanState(prev => {
      const newState = { ...prev }
      Object.entries(updates).forEach(([cardId, changes]) => {
        // Find and update card
        Object.keys(newState).forEach(column => {
          const cardIndex = newState[column].findIndex(c => c.id === cardId)
          if (cardIndex !== -1) {
            newState[column][cardIndex] = { ...newState[column][cardIndex], ...changes }
          }
        })
      })
      return newState
    })
  }

  async function finishChallenge() {
    clearInterval(timerRef.current)
    markChallengeComplete(3)

    // ─── Insight Extraction: corre antes de mostrar resultados
    // para que ai_fluency aparezca en el radar final ───
    setLoading(true)
    await extractAndSaveInsights()
    setLoading(false)

    setPhase("results")
  }

  // ─── Extract insights post-challenge y guardar en profile ───
  async function extractAndSaveInsights() {
    try {
      // Build conversation log for the extractor
      const conversationLog = chat
        .filter(c => !c.narration)
        .map(c => c.isYou
          ? `SM: "${c.text}"${c.targetName ? ` (a ${c.targetName})` : ''}`
          : `${MEMBER_MAP[c.from]?.name || c.from}: "${c.text}"`
        ).join("\n")

      // Coach log (read from profile)
      const profile = getProfile(DEFAULT_CANDIDATE_ID)
      const thisChallengeCoachLog = (profile.ai_coach_usage.interactions || [])
        .filter(i => i.challenge === "Día 5 · Daily con bloqueo")
        .map(i => `SM pregunta: "${i.sm_question}"\nCoach responde: "${i.coach_response}"`)
        .join("\n\n")

      // Actions log (board changes + actions taken)
      const actionsLog = allFeedback
        .map(fb => `${fb.action}${fb.target ? ` → ${fb.target}` : ''}: "${fb.message || ''}"`)
        .join("\n")

      const prompt = buildInsightExtractorPrompt(
        "Día 5 · Daily con bloqueo (C03)",
        conversationLog,
        thisChallengeCoachLog,
        actionsLog
      )

      const insights = await callAI(prompt, "Extraé insights del candidato")
      if (!insights) {
        console.warn("Insight extractor returned null")
        return
      }

      // Inyectar ai_fluency en allScores → aparece en el radar final
      const aiFluencyScore = insights.ai_fluency?.score
      if (aiFluencyScore && aiFluencyScore > 0) {
        setAllScores(s => [...s, { ai_fluency: aiFluencyScore }])
      }

      // Save to profile
      updateProfile(DEFAULT_CANDIDATE_ID, {
        communication_style: insights.communication_style,
        insights: {
          patterns: insights.patterns || [],
          strengths: insights.strengths || [],
          weaknesses: insights.weaknesses || [],
          notable_moments: (insights.notable_moments || []).map(m => ({
            challenge: "C03",
            note: m.note || m,
          })),
        },
        challenge_history: [{
          challenge: "C03",
          challenge_name: "Día 5 · Daily con bloqueo",
          completed_at: new Date().toISOString(),
          ai_fluency_score: aiFluencyScore,
          ai_fluency_rationale: insights.ai_fluency?.rationale,
        }],
      })

      console.log("📊 Insights extraídos:", insights)
    } catch (e) {
      console.error("Error en insight extraction:", e)
    }
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
        candidateId: DEFAULT_CANDIDATE_ID,
        challengeId: 3,
        scores: finalScores,
        feedback: allFeedback,
        grade: gradeData,
        timeUsed
      }).then(() => {
        console.log("Challenge 03 result saved to Supabase")
      })
    }
  }, [phase, finalScores, allFeedback, gradeData, startTime])

  const currentStep = phase === "context" ? 1 : phase === "board" ? 2 : 3
  const totalSteps = 3

  // Calculate WIP warning
  const wipExceeded = kanbanState["DOING"].length > 3

  // ═══════════════════════ CONTEXT PHASE ═══════════════════════
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
            <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: 4, color: T.orange, marginBottom: 12, opacity: 0.9 }}>SMATCH · CHALLENGE 03</div>
            <h1 style={{ fontSize: 42, fontWeight: 900, margin: "0 0 12px 0", background: "linear-gradient(135deg, #fb923c, #f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1.2 }}>
              Día 5 · Daily con bloqueo
            </h1>
            <p style={{ fontSize: 18, color: T.sub, margin: 0, lineHeight: 1.5 }}>Sprint 1 · Día 5/10. Un bloqueo crítico que nadie está manejando.</p>
          </div>

          <div style={{ background: "linear-gradient(135deg, rgba(251, 146, 60, 0.06), #ffffff)", borderRadius: 16, padding: 24, marginBottom: 24, border: "2px solid rgba(251, 146, 60, 0.20)", boxShadow: "0 2px 8px rgba(15, 23, 42, 0.06)" }}>
            <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 3, color: "#fb923c", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 20 }}>📊</span>
              SITUACIÓN DEL SPRINT
            </div>
            <div style={{ fontSize: 14, color: T.sub, lineHeight: 1.6, marginBottom: 18 }}>
              {SITUACION}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              <div style={{ background: T.panel, borderRadius: 12, padding: 16, border: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 11, color: T.dim, marginBottom: 4 }}>Velocity</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: T.orange }}>57%</div>
                <div style={{ fontSize: 10, color: T.sub }}>24/42 points</div>
              </div>
              <div style={{ background: T.panel, borderRadius: 12, padding: 16, border: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 11, color: T.dim, marginBottom: 4 }}>Bloqueado</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: "#ef4444" }}>8 pts</div>
                <div style={{ fontSize: 10, color: T.sub }}>3 días</div>
              </div>
              <div style={{ background: T.panel, borderRadius: 12, padding: 16, border: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 11, color: T.dim, marginBottom: 4 }}>En Riesgo</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: "#f59e0b" }}>16 pts</div>
                <div style={{ fontSize: 10, color: T.sub }}>38% sprint</div>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 32 }}>
            <TeamPanel title="Equipo Setlist" showStakeholder={false} />
          </div>

          <button onClick={startChallenge} style={{ width: "100%", padding: "20px 0", background: "linear-gradient(135deg, #fb923c, #f59e0b)", color: "#ffffff", fontWeight: 900, fontSize: 16, border: "2px solid rgba(251, 146, 60, 0.8)", borderRadius: 12, cursor: "pointer", letterSpacing: 1.5, boxShadow: "0 4px 16px rgba(251, 146, 60, 0.25)", transition: "all 0.3s", textTransform: "uppercase" }}>
            Ver Sprint Board →
          </button>
        </div>
      </div>
    )
  }

  // ═══════════════════════ RESULTS PHASE ═══════════════════════
  if (phase === "results") {
    return (
      <ChallengeComplete
        challengeTitle="Día 5 · Daily con bloqueo"
        challengeNumber={2}
        accentColor="#f59e0b"
        gradientStart="rgba(245, 158, 11, 0.85)"
        gradientEnd="rgba(217, 119, 6, 0.80)"
        isLastChallenge={isLastChallenge(3)}
      />
    )
  }

  // ═══════════════════════ KANBAN BOARD PHASE ═══════════════════════
  return (
    <div className="kanban-container">
      <TopBar
        title="📊 Día 5 · Daily con bloqueo"
        subtitle={`Equipo Setlist · Sprint ${SPRINT_SUMMARY.sprint}, Día ${SPRINT_SUMMARY.day}/${SPRINT_SUMMARY.totalDays}`}
        currentStep={currentStep}
        totalSteps={totalSteps}
        timer={{ display: `${mm}:${ss}`, warning: timer < 180 }}
      />

      <div className="kanban-main">
        {/* Left: Board */}
        <div className="kanban-board-container">
          {/* Metrics Bar */}
          <div className="metrics-bar">
            <div className={`metric-card ${wipExceeded ? 'warning' : ''}`}>
              <div className="metric-label">WIP</div>
              <div className="metric-value">{kanbanState["DOING"].length}/3</div>
              {wipExceeded && <div className="metric-warning">⚠️ Excedido</div>}
            </div>
            <div className="metric-card">
              <div className="metric-label">Bloqueado</div>
              <div className="metric-value">{SPRINT_SUMMARY.blocked} pts</div>
              <div className="metric-sub">3 días</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Velocity</div>
              <div className="metric-value">{SPRINT_SUMMARY.velocity}</div>
              <div className="metric-sub">{SPRINT_SUMMARY.done}/{SPRINT_SUMMARY.committed}</div>
            </div>
            <div className="metric-card danger">
              <div className="metric-label">En Riesgo</div>
              <div className="metric-value">{SPRINT_SUMMARY.atRisk} pts</div>
              <div className="metric-sub">38% sprint</div>
            </div>
          </div>


          {/* Kanban Board */}
          <div className="board-columns">
            {KANBAN_COLUMNS.map(column => (
              <div key={column.id} className="kanban-column" data-column={column.id}>
                <div className="column-header">
                  <div>
                    <h3>{column.label}</h3>
                    <span className="card-count">({kanbanState[column.id].length})</span>
                  </div>
                  {column.wipLimit && (
                    <div className={`wip-limit ${kanbanState[column.id].length > column.wipLimit ? 'exceeded' : ''}`}>
                      WIP: {kanbanState[column.id].length}/{column.wipLimit}
                    </div>
                  )}
                </div>

                <div
                  className="column-cards"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, column.id)}
                >
                  {kanbanState[column.id].map(card => {
                    const member = card.assignee ? MEMBER_MAP[card.assignee] : null
                    const priorityIcon = card.priority === 'high' ? '↑' : card.priority === 'medium' ? '=' : '↓'

                    return (
                      <div
                        key={card.id}
                        className={`kanban-card ${card.status} ${selectedCard === card.id ? 'selected' : ''}`}
                        draggable
                        onDragStart={() => handleDragStart(card, column.id)}
                        onClick={() => handleCardClick(card.id)}
                      >
                        {/* Title */}
                        <div className="card-header">
                          <div className="card-title">{card.title}</div>
                        </div>

                        {/* ID + Assignee + Priority */}
                        <div className="card-meta">
                          <span className="card-id">{card.id}</span>

                          {member && (
                            <div className="card-assignee">
                              <div className="assignee-avatar" style={{ background: member.color }}>
                                {member.init}
                              </div>
                              <span className="assignee-name">{member.name.split(' ')[0]}</span>
                            </div>
                          )}

                          {card.priority && (
                            <div className={`card-priority ${card.priority}`} title={`${card.priority} priority`}>
                              {priorityIcon}
                            </div>
                          )}

                          {card.blockedDays && (
                            <div className="card-badge blocked">
                              🔴 {card.blockedDays}d
                            </div>
                          )}

                          {card.status === "idle" && (
                            <div className="card-badge idle">
                              💤 IDLE
                            </div>
                          )}

                          {card.status === "waiting" && (
                            <div className="card-badge waiting">
                              ⏳ WAIT
                            </div>
                          )}

                          {card.days > 0 && card.status === 'ok' && (
                            <div className="card-days">
                              {card.days}d
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Card Details Panel */}
          {selectedCard && CARD_DETAILS[selectedCard] && (
            <div className="card-details-panel">
              <div className="details-header">
                <h4>{selectedCard} Details</h4>
                <button onClick={() => setSelectedCard(null)}>×</button>
              </div>
              <div className="details-content">
                <p><strong>Description:</strong> {CARD_DETAILS[selectedCard].description}</p>
                {CARD_DETAILS[selectedCard].blockerReason && (
                  <p className="blocker-reason"><strong>Blocker:</strong> {CARD_DETAILS[selectedCard].blockerReason}</p>
                )}
                {CARD_DETAILS[selectedCard].impact && (
                  <p className="impact"><strong>Impact:</strong> {CARD_DETAILS[selectedCard].impact}</p>
                )}
                {CARD_DETAILS[selectedCard].history && (
                  <div>
                    <strong>History:</strong>
                    <ul>
                      {CARD_DETAILS[selectedCard].history.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: Chat */}
        <div className="kanban-chat">
          <div className="chat-header">
            <h3 className="chat-title">💬 Daily Standup</h3>
            <p className="chat-subtitle">Hablale al equipo. Click en un avatar para dirigir tu mensaje.</p>
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
                      Tú (SM){msg.targetName ? ` → ${msg.targetName}` : ''}
                    </div>
                    <div className="chat-message-text">{msg.text}</div>
                  </div>
                )
              }
              const m = MEMBER_MAP[msg.from]
              if (!m) return null
              return (
                <div key={i} className="chat-message team" onClick={() => setReplyTarget(msg.from)} style={{ cursor: "pointer" }}>
                  <Avatar member={m} size={28} />
                  <div>
                    <div className="chat-message-author" style={{ color: m.color }}>{m.name}</div>
                    <div className="chat-message-text">{msg.text}</div>
                  </div>
                </div>
              )
            })}
            {loading && (
              <div className="chat-message narration" style={{ fontStyle: "italic", opacity: 0.7 }}>
                <div className="chat-message-text">El equipo está procesando…</div>
              </div>
            )}
          </div>

          {/* ─── Chat Composer ─── */}
          <div className="chat-composer">
            {replyTarget && MEMBER_MAP[replyTarget] && (
              <div className="reply-target-bar">
                <span>Respondiendo a <strong style={{ color: MEMBER_MAP[replyTarget].color }}>{MEMBER_MAP[replyTarget].name}</strong></span>
                <button onClick={() => setReplyTarget(null)} className="reply-target-clear" aria-label="Quitar destinatario">×</button>
              </div>
            )}
            <div className="team-avatar-row">
              {TEAM.map(m => (
                <button
                  key={m.id}
                  className={`team-avatar-pick ${replyTarget === m.id ? 'active' : ''}`}
                  onClick={() => setReplyTarget(replyTarget === m.id ? null : m.id)}
                  title={`Hablar a ${m.name}`}
                  style={{ borderColor: replyTarget === m.id ? m.color : 'transparent' }}
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
                    : "Hablale al equipo... (Enter para enviar)"
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
            {actionCount >= 4 && (
              <button
                className="composer-finish-btn"
                onClick={finishChallenge}
              >
                Cerrar daily →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* AI Coach flotante */}
      <AICoach
        challengeName="Día 5 · Daily con bloqueo"
        challengeContext="El SM está en un daily standup. Hay un dev bloqueado hace 3 días, el WIP limit está excedido, y el equipo está esperando que el SM facilite."
      />
    </div>
  )
}
