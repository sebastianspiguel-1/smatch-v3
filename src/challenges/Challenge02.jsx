import { useState, useEffect, useRef, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { T } from "../theme"
import { callAI, computeScores, getGrade, buildBlockerChallengePrompt } from "../engine/ai"
import { saveResult } from "../engine/supabase"
import { Avatar, ScoreBadges, RadarChartComponent, TopBar, SuccessModal } from "../components"
import {
  TEAM,
  MEMBER_MAP,
  SPRINT_CONTEXT,
  SPRINT_SUMMARY,
  TEAM_DESC,
  KANBAN_COLUMNS,
  INITIAL_KANBAN_STATE,
  CHAT_TRIGGERS,
  CARD_DETAILS,
  DIMENSIONS
} from "../data/challenge02"
import "./Challenge02.css"

export default function Challenge02() {
  const nav = useNavigate()
  const [phase, setPhase] = useState("context")
  const [kanbanState, setKanbanState] = useState(INITIAL_KANBAN_STATE)
  const [selectedCard, setSelectedCard] = useState(null)
  const [chat, setChat] = useState([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [allScores, setAllScores] = useState([])
  const [allFeedback, setAllFeedback] = useState([])
  const [timer, setTimer] = useState(900) // 15 minutes
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [startTime] = useState(Date.now())
  const [actionCount, setActionCount] = useState(0)

  const chatRef = useRef(null)
  const inputRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight }, [chat, loading])
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
  useEffect(() => { if (phase === "results") { setTimeout(() => setShowSuccessModal(true), 800) } }, [phase])

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
    if (cardId === "FEN-403") {
      triggerChatReaction("on_card_click_FEN403")
    } else if (cardId === "FEN-406") {
      triggerChatReaction("on_card_click_FEN406")
    } else if (cardId === "FEN-405" || cardId === "FEN-409") {
      triggerChatReaction("on_card_click_waiting")
    }

    // Evaluate action
    evaluateAction({
      type: "card_click",
      target: cardId,
      message: null
    })
  }

  function handleIdentifyBlocker() {
    triggerChatReaction("on_identify_blocker")
    evaluateAction({
      type: "identify_blocker",
      target: "FEN-403",
      message: "Identifiqué FEN-403 como el bloqueador principal"
    })
  }

  function handleFlagWIP() {
    triggerChatReaction("on_flag_wip")
    evaluateAction({
      type: "flag_wip",
      target: "DOING",
      message: "El WIP limit está excedido (5/3)"
    })
  }

  function handleSuggestPair() {
    triggerChatReaction("on_suggest_pair")
    evaluateAction({
      type: "suggest_pair",
      target: null,
      message: "Propongo pair programming para desbloquear"
    })
  }

  function handleEscalate() {
    triggerChatReaction("on_escalate")
    evaluateAction({
      type: "escalate",
      target: "Platform",
      message: "Voy a escalar al equipo Platform"
    })

    // Simulate resolution after escalation
    setTimeout(() => {
      triggerChatReaction("on_resolution")
    }, 2000)
  }

  async function handleChatSubmit() {
    if (!input.trim() || loading) return
    const txt = input.trim()
    setInput("")
    setLoading(true)
    setChat(p => [...p, { isYou: true, text: txt }])

    // Generic facilitation
    triggerChatReaction("on_generic_facilitation")

    // Evaluate action
    await evaluateAction({
      type: "chat_message",
      target: null,
      message: txt
    })

    setLoading(false)
  }

  async function evaluateAction(action) {
    const boardSummary = serializeBoard()
    const chatContext = chat.slice(-10).map(c =>
      c.narration ? `[Narración: ${c.text}]` :
      c.isYou ? `[SM: ${c.text}]` :
      `[${MEMBER_MAP[c.from]?.name}: ${c.text}]`
    ).join("\n")

    const sys = buildBlockerChallengePrompt(TEAM_DESC, kanbanState, action, chatContext)
    const res = await callAI(sys, action.message || "Action evaluation")

    if (res) {
      // Add team reactions
      if (res.reactions) {
        const newMsgs = res.reactions.map(r => ({ from: r.from, text: r.text }))
        setChat(p => [...p, ...newMsgs])
      }

      // Store scores
      const vs = {}
      if (res.scores) Object.entries(res.scores).forEach(([k, v]) => { if (v > 0) vs[k] = v })

      setAllScores(s => [...s, vs])
      setAllFeedback(f => [...f, {
        action: action.type,
        target: action.target,
        quality: res.quality,
        feedback: res.feedback,
        scores: vs
      }])

      // Update board if needed
      if (res.boardUpdates) {
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

  function finishChallenge() {
    clearInterval(timerRef.current)
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
        challengeId: 2,
        scores: finalScores,
        feedback: allFeedback,
        grade: gradeData,
        timeUsed
      }).then(() => {
        console.log("Challenge 02 result saved to Supabase")
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
            <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: 4, color: T.orange, marginBottom: 12, opacity: 0.9 }}>SMATCH · CHALLENGE 02</div>
            <h1 style={{ fontSize: 42, fontWeight: 900, margin: "0 0 12px 0", background: "linear-gradient(135deg, #fb923c, #f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1.2 }}>
              El bloqueo que nadie escala
            </h1>
            <p style={{ fontSize: 18, color: T.sub, margin: 0, lineHeight: 1.5 }}>Sprint día 7/10. Un bloqueo crítico que nadie está manejando.</p>
          </div>

          <div style={{ background: "linear-gradient(135deg, rgba(251, 146, 60, 0.06), #ffffff)", borderRadius: 16, padding: 24, marginBottom: 24, border: "2px solid rgba(251, 146, 60, 0.20)", boxShadow: "0 2px 8px rgba(15, 23, 42, 0.06)" }}>
            <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 3, color: "#fb923c", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 20 }}>📊</span>
              SITUACIÓN DEL SPRINT
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 16 }}>
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
            <div style={{ fontSize: 14, color: T.sub, lineHeight: 1.6 }}>
              {SPRINT_CONTEXT}
            </div>
          </div>

          <div style={{ background: T.panel, borderRadius: 16, padding: 24, marginBottom: 32, border: `2px solid ${T.border}`, boxShadow: "0 2px 8px rgba(15, 23, 42, 0.06)" }}>
            <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 3, color: "#fb923c", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 20 }}>👥</span>
              EQUIPO FENIX
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
              {TEAM.map(m => (
                <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 10, background: T.card, borderRadius: 12, padding: "12px 14px", border: `1px solid ${T.border}`, transition: "all 0.3s" }}>
                  <Avatar member={m} size={32} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{m.name}</div>
                    <div style={{ fontSize: 12, color: T.dim, marginTop: 2 }}>{m.role}</div>
                  </div>
                </div>
              ))}
            </div>
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
      <div style={{ background: T.bg, minHeight: "100vh", color: T.text, fontFamily: "'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif" }}>
        <TopBar
          title="📊 El bloqueo que nadie escala"
          subtitle="Resultados"
          currentStep={currentStep}
          totalSteps={totalSteps}
          score={Math.round(gradeData.avg)}
        />
        <div style={{ maxWidth: 520, margin: "0 auto", padding: "20px 16px" }}>
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, color: T.orange }}>EVALUACIÓN COMPLETA</div>
            <div style={{ fontSize: 52, fontWeight: 900, color: gradeData.color, marginTop: 6 }}>{gradeData.letter}</div>
            <div style={{ fontSize: 13, color: T.sub }}>{gradeData.label}</div>
            <div style={{ fontSize: 10, color: T.dim }}>Puntaje general: {Math.round(gradeData.avg)}%</div>
            <div style={{ fontSize: 10, color: T.dim, marginTop: 4 }}>{actionCount} acciones evaluadas</div>
          </div>
          <div style={{ background: T.panel, borderRadius: 10, padding: 14, marginBottom: 14, border: `1px solid ${T.border}` }}>
            <RadarChartComponent data={finalScores} height={220} />
          </div>
          <div style={{ marginBottom: 14 }}>
            {finalScores.map(s => (
              <div key={s.dimension} style={{ marginBottom: 7 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 2 }}>
                  <span style={{ color: T.sub }}>{s.dimension}</span>
                  <span style={{ fontWeight: 700, color: s.score >= 75 ? T.green : s.score >= 50 ? T.blue : s.score >= 25 ? T.orange : T.red }}>{s.score}%</span>
                </div>
                <div style={{ height: 4, background: T.card, borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 2, width: `${s.score}%`, background: s.score >= 75 ? T.green : s.score >= 50 ? T.blue : s.score >= 25 ? T.orange : T.red, transition: "width 0.8s" }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, color: T.orange, marginBottom: 6 }}>ANÁLISIS DE ACCIONES</div>
          {allFeedback.map((fb, i) => {
            const qc = fb.quality === "expert" ? T.green : fb.quality === "competent" ? T.blue : fb.quality === "developing" ? T.orange : T.red
            return (
              <div key={i} style={{ background: T.panel, borderRadius: 7, padding: 10, marginBottom: 6, border: `1px solid ${T.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: T.dim, textTransform: "uppercase" }}>{fb.action} {fb.target ? `→ ${fb.target}` : ''}</span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: qc }}>{fb.quality?.toUpperCase()}</span>
                </div>
                <div style={{ fontSize: 11, color: T.sub, lineHeight: 1.35 }}>{fb.feedback}</div>
                {fb.scores && <ScoreBadges scores={fb.scores} />}
              </div>
            )
          })}
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <button onClick={() => nav("/challenges")} style={{ flex: 1, padding: "13px 0", background: T.card, color: T.orange, fontWeight: 700, fontSize: 13, border: `1px solid ${T.orange}`, borderRadius: 9, cursor: "pointer" }}>
              VOLVER AL MENÚ
            </button>
            <button onClick={() => nav("/report/test@test.com")} style={{ flex: 1, padding: "13px 0", background: T.orange, color: T.bg, fontWeight: 700, fontSize: 13, border: "none", borderRadius: 9, cursor: "pointer" }}>
              VER REPORTE COMPLETO →
            </button>
          </div>
        </div>
        {showSuccessModal && (
          <SuccessModal
            grade={gradeData.letter}
            score={Math.round(gradeData.avg)}
            onClose={() => setShowSuccessModal(false)}
            onShareLinkedIn={() => {
              window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin + '/report/test@test.com')}`, '_blank')
            }}
            onDownloadBadge={() => {
              alert('Descarga de badge próximamente!')
            }}
            candidateId="test@test.com"
          />
        )}
      </div>
    )
  }

  // ═══════════════════════ KANBAN BOARD PHASE ═══════════════════════
  return (
    <div className="kanban-container">
      <TopBar
        title="📊 El bloqueo que nadie escala"
        subtitle={`Equipo Fenix · Sprint ${SPRINT_SUMMARY.sprint}, Día ${SPRINT_SUMMARY.day}/${SPRINT_SUMMARY.totalDays}`}
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

          {/* Action Buttons */}
          <div className="action-buttons">
            <button onClick={handleIdentifyBlocker} className="action-btn primary">
              🎯 Identificar Bloqueador
            </button>
            <button onClick={handleFlagWIP} className="action-btn warning">
              ⚠️ Flag WIP Limit
            </button>
            <button onClick={handleSuggestPair} className="action-btn">
              🤝 Sugerir Pair Programming
            </button>
            <button onClick={handleEscalate} className="action-btn danger">
              📢 Escalar a Platform
            </button>
          </div>

          {/* Kanban Board */}
          <div className="board-columns">
            {KANBAN_COLUMNS.map(column => (
              <div key={column.id} className="kanban-column">
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

                <div className="column-cards">
                  {kanbanState[column.id].map(card => {
                    const member = card.assignee ? MEMBER_MAP[card.assignee] : null
                    const priorityIcon = card.priority === 'high' ? '🔴' : card.priority === 'medium' ? '🟡' : '🔵'

                    return (
                      <div
                        key={card.id}
                        className={`kanban-card ${card.status} ${selectedCard === card.id ? 'selected' : ''}`}
                        onClick={() => handleCardClick(card.id)}
                      >
                        {/* Header: ID + Points */}
                        <div className="card-header">
                          <span className="card-id">{card.id}</span>
                          <span className="card-points">{card.points}</span>
                        </div>

                        {/* Title */}
                        <div className="card-title">{card.title}</div>

                        {/* Footer: Assignee + Status badges */}
                        <div className="card-meta">
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
            <h3 className="chat-title">💬 Team Chat</h3>
            <p className="chat-subtitle">El equipo está reaccionando a tus acciones</p>
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
                    <div className="chat-message-author">Tú (SM)</div>
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
                    <div className="chat-message-author" style={{ color: m.color }}>{m.name}</div>
                    <div className="chat-message-text">{msg.text}</div>
                  </div>
                </div>
              )
            })}
            {loading && (
              <div className="chat-message narration">
                <div className="chat-message-text">El equipo está reaccionando...</div>
              </div>
            )}
          </div>

          <div className="chat-input-area">
            <textarea
              ref={inputRef}
              className="chat-textarea"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleChatSubmit() } }}
              placeholder="Escr ibí para facilitar con el equipo..."
              rows={3}
              disabled={loading}
            />
            <button
              className="chat-submit-btn"
              onClick={handleChatSubmit}
              disabled={!input.trim() || loading}
            >
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
