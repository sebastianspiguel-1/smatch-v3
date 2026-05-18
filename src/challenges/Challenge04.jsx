import { useState, useRef, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { T } from "../theme"
import { callAI, computeScores, getGrade, buildEstimationFacilitationPrompt, buildInsightExtractorPrompt } from "../engine/ai"
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
  TEAM, MEMBER_MAP, PBIS, FIBONACCI,
  POKER_VOTES, EVENTS, TEAM_QUESTIONS,
  DIMENSIONS,
} from "../data/challenge04"
import { SETLIST_TEAM } from "../data/team"

// Team description para el prompt AI (usa las bios ricas del data central)
const TEAM_DESC = SETLIST_TEAM.map(m => `- ${m.name} (${m.role}): ${m.bio}`).join("\n")

export default function Challenge04() {
  const nav = useNavigate()
  const [phase, setPhase] = useState("context")
  const [moods, setMoods] = useState({ eric: "🤨", david: "😐", alan: "😐", gian: "🤔", gabriela: "🤨", nacho: "🤔" })
  const [bubbles, setBubbles] = useState({})
  const [boardItems, setBoardItems] = useState([])
  const [dragging, setDragging] = useState(null)
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 })
  const [pokerActive, setPokerActive] = useState(false)
  const [pokerIdx, setPokerIdx] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [estimated, setEstimated] = useState({})
  const [chat, setChat] = useState([])
  const [allScores, setAllScores] = useState([])
  const [allFeedback, setAllFeedback] = useState([])
  const [replyTarget, setReplyTarget] = useState(null)
  const [smInput, setSmInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [actionCount, setActionCount] = useState(0)
  const [timer, setTimer] = useState(2400)
  const [firedQuestions, setFiredQuestions] = useState([])
  const boardRef = useRef(null)
  const nextId = useRef(100)
  const startTime = useRef(null)

  useEffect(() => { if (phase === "play") { const t = setInterval(() => setTimer(v => Math.max(0, v - 1)), 1000); startTime.current = Date.now(); return () => clearInterval(t) } }, [phase])
  useEffect(() => {
    if (phase !== "play") return
    const interval = setInterval(() => {
      const elapsed = Date.now() - (startTime.current || Date.now())
      TEAM_QUESTIONS.forEach(q => {
        if (!firedQuestions.includes(q.id) && elapsed >= q.delay) {
          setFiredQuestions(p => [...p, q.id])
          // Push team question to chat as a member message
          setChat(p => [...p, { from: q.from, text: q.text }])
          bubble(q.from, q.text, 12000)
          if (q.mood) setMood(q.from, q.mood)
        }
      })
    }, 2000)
    return () => clearInterval(interval)
  }, [phase, firedQuestions])

  const mm = String(Math.floor(timer / 60)).padStart(2, "0")
  const ss = String(timer % 60).padStart(2, "0")
  const totalEst = Object.values(estimated).reduce((a, b) => a + b, 0)

  function bubble(from, text, dur = 7000) { setBubbles(p => ({ ...p, [from]: text })); setTimeout(() => setBubbles(p => { const n = { ...p }; if (n[from] === text) delete n[from]; return n }), dur) }
  function setMood(id, m) { setMoods(p => ({ ...p, [id]: m })) }

  function startPoker() {
    setPokerActive(true)
    const initialMsg = `${PBIS[0].id}: ${PBIS[0].title}`
    setChat(p => [...p, { from: "gabriela", text: initialMsg }])
    bubble("gabriela", initialMsg)
  }

  function revealCards() {
    setRevealed(true)
    EVENTS.filter(e => e.poker === pokerIdx).forEach(e => {
      // Bad behaviors aparecen como mensajes de chat normales (no popups gritando)
      setTimeout(() => {
        setChat(p => [...p, { from: e.from, text: e.text }])
        bubble(e.from, e.text, 10000)
      }, e.delay)
    })
  }

  function confirmPts(pts) {
    setEstimated(p => ({ ...p, [pokerIdx]: pts }))
    setRevealed(false)
    const confirmMsg = `${PBIS[pokerIdx].id} → ${pts} pts`
    setChat(p => [...p, { from: "narration", text: `Acuerdo: ${confirmMsg}` }])
    if (pokerIdx < 3) {
      setPokerIdx(p => p + 1)
      setTimeout(() => {
        const next = `Siguiente: ${PBIS[pokerIdx + 1].id}: ${PBIS[pokerIdx + 1].title}`
        setChat(p => [...p, { from: "gabriela", text: next }])
        bubble("gabriela", next)
      }, 800)
    } else {
      setTimeout(() => {
        const done = "Estimación lista. ¿Priorizamos juntos?"
        setChat(p => [...p, { from: "gabriela", text: done }])
        bubble("gabriela", done)
        setPokerActive(false)
      }, 800)
    }
  }

  // ─── Handler unificado: el SM escribe libre, AI evalúa y el equipo reacciona ───
  async function handleSMMessage(message, targetMemberId = null) {
    if (!message.trim() || loading) return
    setChat(p => [...p, {
      isYou: true,
      text: message,
      targetName: targetMemberId ? MEMBER_MAP[targetMemberId]?.name : null,
    }])
    setLoading(true)
    await evaluateAction({ type: "chat_message", target: targetMemberId, message })
    setLoading(false)
  }

  async function evaluateAction(action) {
    const chatContext = chat.slice(-10).map(c =>
      c.narration ? { from: 'narration', text: c.text } :
      c.isYou ? { from: 'sm', text: c.text } :
      { from: MEMBER_MAP[c.from]?.name || c.from, text: c.text }
    )

    const candidateContext = buildAIContextString(DEFAULT_CANDIDATE_ID)
    const actionForPrompt = {
      ...action,
      target: action.target ? MEMBER_MAP[action.target]?.name : null,
    }
    const sessionState = { pokerActive, pokerIdx, revealed }
    const sys = buildEstimationFacilitationPrompt(TEAM_DESC, sessionState, actionForPrompt, chatContext, candidateContext)
    const res = await callAI(sys, action.message || "")

    if (res) {
      if (res.reactions) {
        const newMsgs = res.reactions.map(r => ({ from: r.from, text: r.text }))
        setChat(p => [...p, ...newMsgs])
        res.reactions.forEach(r => {
          bubble(r.from, r.text, 7000)
          if (r.mood) setMood(r.from, r.mood)
        })
      }
      const vs = {}
      if (res.scores) Object.entries(res.scores).forEach(([k, v]) => { if (v > 0) vs[k] = v })
      setAllScores(s => [...s, vs])
      setAllFeedback(f => [...f, {
        action: action.type,
        target: action.target,
        message: action.message,
        scores: vs,
      }])
      setActionCount(c => c + 1)
    }
  }

  // ─── Drag & drop for post-it / textbox board items (conservado) ───
  function onMove(e) { if (dragging) setDragPos({ x: e.clientX, y: e.clientY }) }
  function onUp(e) {
    if (!dragging || !boardRef.current) { setDragging(null); return }
    const r = boardRef.current.getBoundingClientRect()
    const x = e.clientX - r.left, y = e.clientY - r.top
    if (x > 0 && y > 0 && x < r.width && y < r.height) {
      setBoardItems(p => [...p, { id: nextId.current++, toolId: dragging.id, type: dragging.type, x, y, text: "" }])
    }
    setDragging(null)
  }
  function removeItem(id) { setBoardItems(p => p.filter(i => i.id !== id)) }
  function onItemDrag(itemId, e) {
    e.stopPropagation(); const sx = e.clientX, sy = e.clientY
    const item = boardItems.find(i => i.id === itemId); if (!item) return
    const ox = item.x, oy = item.y
    const mv = ev => setBoardItems(p => p.map(i => i.id === itemId ? { ...i, x: ox + ev.clientX - sx, y: oy + ev.clientY - sy } : i))
    const up = () => { window.removeEventListener("mousemove", mv); window.removeEventListener("mouseup", up) }
    window.addEventListener("mousemove", mv); window.addEventListener("mouseup", up)
  }

  const finalScores = useMemo(() => {
    if (allScores.length === 0) return []
    return computeScores(allScores, DIMENSIONS)
  }, [allScores])

  const gradeData = useMemo(() => {
    if (finalScores.length === 0) return { letter: "F", label: "", color: "#888", avg: 0 }
    return getGrade(finalScores)
  }, [finalScores])

  // Save to Supabase when results are ready
  useEffect(() => {
    if (phase === "results" && finalScores.length > 0) {
      const timeUsed = startTime.current ? Math.floor((Date.now() - startTime.current) / 1000) : 0
      saveResult({
        candidateId: DEFAULT_CANDIDATE_ID,
        challengeId: 4,
        scores: finalScores,
        feedback: allFeedback,
        grade: gradeData,
        timeUsed
      }).then(() => {
        console.log("Challenge 04 result saved to Supabase")
      })
    }
  }, [phase, finalScores, allFeedback, gradeData])

  async function finishChallenge() {
    markChallengeComplete(4)
    setLoading(true)
    await extractAndSaveInsights()
    setLoading(false)
    setPhase("results")
  }

  async function extractAndSaveInsights() {
    try {
      const conversationLog = chat
        .filter(c => !c.narration)
        .map(c => c.isYou
          ? `SM: "${c.text}"${c.targetName ? ` (a ${c.targetName})` : ''}`
          : `${MEMBER_MAP[c.from]?.name || c.from}: "${c.text}"`
        ).join("\n")

      const profile = getProfile(DEFAULT_CANDIDATE_ID)
      const thisChallengeCoachLog = (profile.ai_coach_usage.interactions || [])
        .filter(i => i.challenge === "Estimación & Priorización")
        .map(i => `SM pregunta: "${i.sm_question}"\nCoach responde: "${i.coach_response}"`)
        .join("\n\n")

      const actionsLog = allFeedback
        .map(fb => `${fb.action}${fb.target ? ` → ${fb.target}` : ''}: "${fb.message || ''}"`)
        .join("\n")

      const prompt = buildInsightExtractorPrompt(
        "Estimación & Priorización (C04)",
        conversationLog,
        thisChallengeCoachLog,
        actionsLog
      )
      const insights = await callAI(prompt, "Extraé insights del candidato")
      if (!insights) return

      const aiFluencyScore = insights.ai_fluency?.score
      if (aiFluencyScore && aiFluencyScore > 0) {
        setAllScores(s => [...s, { ai_fluency: aiFluencyScore }])
      }

      updateProfile(DEFAULT_CANDIDATE_ID, {
        communication_style: insights.communication_style,
        insights: {
          patterns: insights.patterns || [],
          strengths: insights.strengths || [],
          weaknesses: insights.weaknesses || [],
          notable_moments: (insights.notable_moments || []).map(m => ({
            challenge: "C04",
            note: m.note || m,
          })),
        },
        challenge_history: [{
          challenge: "C04",
          challenge_name: "Estimación & Priorización",
          completed_at: new Date().toISOString(),
          ai_fluency_score: aiFluencyScore,
          ai_fluency_rationale: insights.ai_fluency?.rationale,
        }],
      })

      console.log("📊 Insights C04:", insights)
    } catch (e) {
      console.error("Error en insight extraction C04:", e)
    }
  }

  // Calculate current step for progress indicator
  const currentStep = phase === "context" ? 1 : phase === "play" ? 2 : 3
  const totalSteps = 3

  // ═══════════════════ CONTEXT ═══════════════════
  if (phase === "context") return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.text, fontFamily: "'Segoe UI',system-ui,sans-serif" }}>
      <TopBar
        currentStep={currentStep}
        totalSteps={totalSteps}
        backButton={{ label: "← Back to Challenges", onClick: () => nav("/challenges") }}
      />
      <div style={{ maxWidth: 840, margin: "0 auto", padding: "34px 22px" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: 3, color: T.teal }}>SMATCH · CHALLENGE 04</div>
          <div style={{ fontSize: 31, fontWeight: 800, marginTop: 8 }}>Estimación & Priorización</div>
          <div style={{ fontSize: 15, color: T.dim, marginTop: 3 }}>Proyecto Valkyrie · Sprint 1 · Whiteboard Session</div>
        </div>
        <div style={{ background: T.panel, borderRadius: 14, padding: 20, marginBottom: 20, border: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 2, color: T.orange, marginBottom: 8 }}>SITUACIÓN</div>
          <div style={{ fontSize: 15, color: T.sub, lineHeight: 1.6 }}>Equipo nuevo, nunca estimaron ni priorizaron juntos. Tenés un <strong style={{ color: T.teal }}>whiteboard</strong> con herramientas-desafío. Cada una evalúa si sabés facilitar. El equipo te va a hacer preguntas.</div>
        </div>
        <div style={{ marginBottom: 25 }}>
          <TeamPanel title="Equipo Setlist" showStakeholder={false} />
        </div>
        <button onClick={() => { setPhase("play"); setTimeout(() => bubble("gianfranco", "Hola, ¿qué vamos a hacer hoy?"), 2000); setTimeout(() => bubble("gaby", "Dale, ¿arrancamos?"), 5000) }} style={{ width: "100%", padding: "20px 0", background: T.teal, color: T.bg, fontWeight: 900, fontSize: 20, border: "none", borderRadius: 14, cursor: "pointer", letterSpacing: 1 }}>ABRIR WHITEBOARD →</button>
      </div>
    </div>
  )

  // ═══════════════════ RESULTS ═══════════════════
  if (phase === "results") return (
    <ChallengeComplete
      challengeTitle="Estimación & Priorización"
      challengeNumber={4}
      accentColor="#0891b2"
      gradientStart="rgba(8, 145, 178, 0.85)"
      gradientEnd="rgba(6, 182, 212, 0.80)"
      isLastChallenge={isLastChallenge(4)}
    />
  )

  // ═══════════════════ MAIN GAME (chat libre + Planning Poker) ═══════════════════
  return (
    <div
      style={{ height: "100vh", display: "flex", flexDirection: "column", fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif", userSelect: "none" }}
      onMouseMove={onMove}
      onMouseUp={onUp}
    >
      <TopBar
        title="📊 Estimación & Priorización"
        subtitle={`Sprint 1 Planning · ${Object.keys(estimated).length}/4 PBIs estimados`}
        currentStep={currentStep}
        totalSteps={totalSteps}
        timer={{ display: `${mm}:${ss}`, warning: timer < 300 }}
      />

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* LEFT PANEL */}
        <div style={{ width: 238, background: T.bg, borderRight: `1px solid ${T.border}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
          <div style={{ padding: "8px 7px", borderBottom: `1px solid ${T.border}` }}>
            {TEAM.map(m => {
              const bbl = bubbles[m.id]
              const isTarget = replyTarget === m.id
              return (
                <div key={m.id} style={{ position: "relative", marginBottom: 1 }}>
                  <div
                    onClick={() => setReplyTarget(replyTarget === m.id ? null : m.id)}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 13, cursor: "pointer", background: isTarget ? `${m.color}18` : "transparent", border: `2px solid ${isTarget ? m.color : "transparent"}`, transition: "all 0.15s" }}
                  >
                    <Avatar member={m} size={42} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: isTarget ? m.color : T.text }}>{m.name.split(" ")[0]}</div>
                      <div style={{ fontSize: 10, color: T.dim }}>{m.role}</div>
                    </div>
                    <span style={{ fontSize: 22, flexShrink: 0 }}>{moods[m.id]}</span>
                  </div>
                  {bbl && (
                    <div style={{ position: "absolute", left: "105%", top: "50%", transform: "translateY(-50%)", padding: "12px 16px", borderRadius: 16, borderTopLeftRadius: 6, background: "#fff", color: "#333", fontSize: 14, lineHeight: 1.5, boxShadow: "0 6px 24px rgba(0,0,0,0.15)", border: `2px solid ${m.color}40`, zIndex: 50, maxWidth: 360 }}>
                      <span style={{ fontWeight: 700, color: m.color, fontSize: 12, marginRight: 6 }}>{m.name.split(" ")[0]}:</span>
                      <span>{bbl}</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div style={{ padding: "10px 8px", display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.dim, letterSpacing: 2, marginBottom: 4, textAlign: "center" }}>HERRAMIENTAS</div>
            <button
              onMouseDown={e => { setDragging({ id: "postit", type: "postit", label: "📝 Post-it" }); setDragPos({ x: e.clientX, y: e.clientY }) }}
              style={{ padding: "10px 12px", borderRadius: 8, background: T.panel, border: `1px solid ${T.border}`, color: T.text, fontWeight: 600, fontSize: 13, cursor: "grab", textAlign: "left" }}
            >
              📝 Post-it (arrastrar)
            </button>
            <button
              onMouseDown={e => { setDragging({ id: "textbox", type: "textbox", label: "📄 Nota" }); setDragPos({ x: e.clientX, y: e.clientY }) }}
              style={{ padding: "10px 12px", borderRadius: 8, background: T.panel, border: `1px solid ${T.border}`, color: T.text, fontWeight: 600, fontSize: 13, cursor: "grab", textAlign: "left" }}
            >
              📄 Nota libre (arrastrar)
            </button>
            <button
              onClick={startPoker}
              disabled={pokerActive || Object.keys(estimated).length >= 4}
              style={{ padding: "10px 12px", borderRadius: 8, background: pokerActive ? T.tealDim : T.teal, color: pokerActive ? T.teal : "#000", border: "none", fontWeight: 800, fontSize: 13, cursor: pokerActive || Object.keys(estimated).length >= 4 ? "default" : "pointer", textAlign: "left" }}
            >
              🃏 {pokerActive ? "Poker activo" : "Iniciar Planning Poker"}
            </button>
            {(actionCount >= 4 || Object.keys(estimated).length >= 2) && (
              <button
                onClick={finishChallenge}
                disabled={loading}
                style={{ padding: "12px 12px", marginTop: 8, borderRadius: 8, background: "linear-gradient(135deg, #00d4aa, #059669)", color: "#ffffff", border: "none", fontWeight: 800, fontSize: 13, cursor: loading ? "wait" : "pointer", textAlign: "center", opacity: loading ? 0.6 : 1 }}
              >
                {loading ? "Procesando..." : "Cerrar sesión →"}
              </button>
            )}
          </div>
        </div>

        {/* WHITEBOARD */}
        <div
          ref={boardRef}
          style={{ flex: 1, position: "relative", overflow: "hidden", background: "#ffffff", backgroundImage: "radial-gradient(circle, rgba(15,23,42,0.04) 1px, transparent 1px)", backgroundSize: "24px 24px" }}
        >
          {boardItems.map(item => (
            <div key={item.id} onMouseDown={e => onItemDrag(item.id, e)} style={{ position: "absolute", left: item.x, top: item.y, cursor: "grab", zIndex: 20, transform: "translate(-50%,-50%)" }}>
              {item.type === "postit" && (
                <div style={{ width: 210, minHeight: 133, background: T.sY, borderRadius: 4, padding: 17, boxShadow: "4px 6px 20px rgba(0,0,0,0.12)", borderBottom: "4px solid #f0e68c", position: "relative" }}>
                  <button onClick={e => { e.stopPropagation(); removeItem(item.id) }} style={{ position: "absolute", top: 4, right: 7, background: "none", border: "none", color: "#ccc", cursor: "pointer", fontSize: 17 }}>✕</button>
                  <textarea defaultValue={item.text} onBlur={e => setBoardItems(p => p.map(i => i.id === item.id ? { ...i, text: e.target.value } : i))} style={{ width: "100%", height: 98, background: "transparent", border: "none", color: "#555", fontSize: 16, fontFamily: "inherit", resize: "none", outline: "none", lineHeight: 1.4 }} placeholder="Escribí tu nota..." />
                </div>
              )}
              {item.type === "textbox" && (
                <div style={{ width: 336, minHeight: 98, background: "#fff", borderRadius: 12, padding: 17, boxShadow: "3px 4px 20px rgba(0,0,0,0.1)", border: "1px solid #e0e0e0", position: "relative" }}>
                  <button onClick={e => { e.stopPropagation(); removeItem(item.id) }} style={{ position: "absolute", top: 4, right: 7, background: "none", border: "none", color: "#ccc", cursor: "pointer", fontSize: 17 }}>✕</button>
                  <textarea defaultValue={item.text} onBlur={e => setBoardItems(p => p.map(i => i.id === item.id ? { ...i, text: e.target.value } : i))} style={{ width: "100%", height: 77, background: "transparent", border: "none", color: "#333", fontSize: 16, fontFamily: "inherit", resize: "none", outline: "none", lineHeight: 1.5 }} placeholder="Escribí lo que quieras explicar..." />
                </div>
              )}
            </div>
          ))}

          {/* Planning Poker Modal */}
          {pokerActive && (
            <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", background: "#fff", borderRadius: 20, padding: 24, boxShadow: "0 12px 48px rgba(0,0,0,0.18)", border: `2px solid ${T.teal}40`, zIndex: 25, minWidth: 504 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                <span style={{ fontSize: 17, fontWeight: 800, color: T.teal }}>{PBIS[pokerIdx]?.id}: {PBIS[pokerIdx]?.title}</span>
                <span style={{ fontSize: 13, color: "#999", background: "#f0f0f0", padding: "3px 11px", borderRadius: 7 }}>{pokerIdx + 1}/4</span>
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: 14, marginBottom: 14 }}>
                {Object.entries(POKER_VOTES[pokerIdx] || {}).map(([mid, val]) => {
                  const m = MEMBER_MAP[mid]
                  return (
                    <div key={mid} style={{ textAlign: "center" }}>
                      <div style={{ width: 60, height: 80, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: revealed ? "#fff" : m.color + "15", border: `3px solid ${revealed ? m.color : m.color + "35"}`, fontSize: revealed ? 28 : 22, fontWeight: 900, color: revealed ? m.color : m.color + "50", transition: "all 0.5s" }}>
                        {revealed ? val : "?"}
                      </div>
                      <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>{m.name.split(" ")[0]}</div>
                    </div>
                  )
                })}
              </div>
              {!revealed ? (
                <div style={{ textAlign: "center" }}>
                  <button onClick={revealCards} style={{ padding: "12px 36px", background: T.teal, color: "#000", border: "none", borderRadius: 12, fontWeight: 800, fontSize: 16, cursor: "pointer" }}>🃏 REVELAR</button>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 11, color: T.dim, textAlign: "center", marginBottom: 8 }}>Después de discusión, ¿con qué puntaje queda?</div>
                  <div style={{ display: "flex", justifyContent: "center", gap: 7 }}>
                    {FIBONACCI.map(n => (
                      <button key={n} onClick={() => confirmPts(n)} style={{ width: 44, height: 44, borderRadius: 8, border: `1px solid ${T.teal}40`, background: "#f8f8f8", color: T.teal, fontWeight: 800, fontSize: 18, cursor: "pointer" }}>
                        {n}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {boardItems.length === 0 && !pokerActive && (
            <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", textAlign: "center", pointerEvents: "none" }}>
              <div style={{ fontSize: 58, marginBottom: 14, opacity: 0.2 }}>🧰</div>
              <div style={{ fontSize: 18, color: "#aaa" }}>Hablale al equipo desde el chat de abajo</div>
              <div style={{ fontSize: 14, color: "#ccc", marginTop: 6 }}>O iniciá Planning Poker desde la izquierda</div>
            </div>
          )}
        </div>
      </div>

      {/* CHAT BAR (composer) */}
      <div style={{ minHeight: 70, background: T.bg, borderTop: `1px solid ${T.border}`, display: "flex", alignItems: "center", padding: "12px 17px", gap: 11, flexShrink: 0 }}>
        {replyTarget && (
          <div style={{ display: "flex", alignItems: "center", gap: 7, background: `${MEMBER_MAP[replyTarget]?.color}15`, padding: "6px 11px", borderRadius: 11 }}>
            <Avatar member={MEMBER_MAP[replyTarget]} size={28} />
            <span style={{ fontSize: 13, color: MEMBER_MAP[replyTarget]?.color, fontWeight: 700 }}>→ {MEMBER_MAP[replyTarget]?.name.split(" ")[0]}</span>
            <button onClick={() => setReplyTarget(null)} style={{ background: "none", border: "none", color: T.dim, cursor: "pointer", fontSize: 14 }}>✕</button>
          </div>
        )}
        <input
          value={smInput}
          onChange={e => setSmInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey && smInput.trim() && !loading) {
              const msg = smInput
              const target = replyTarget
              setSmInput("")
              setReplyTarget(null)
              handleSMMessage(msg, target)
            }
          }}
          disabled={loading}
          placeholder={loading ? "El equipo está procesando..." : (replyTarget ? `Respondele a ${MEMBER_MAP[replyTarget]?.name.split(" ")[0]}...` : "Hablale al equipo... (Enter para enviar)")}
          style={{ flex: 1, padding: "12px 18px", borderRadius: 12, border: `2px solid ${replyTarget ? MEMBER_MAP[replyTarget]?.color + "40" : T.border}`, background: T.panel, color: T.text, fontSize: 15, fontFamily: "inherit", outline: "none" }}
        />
        <button
          onClick={() => {
            if (!smInput.trim() || loading) return
            const msg = smInput
            const target = replyTarget
            setSmInput("")
            setReplyTarget(null)
            handleSMMessage(msg, target)
          }}
          disabled={!smInput.trim() || loading}
          style={{ padding: "10px 22px", borderRadius: 12, border: "none", background: smInput.trim() && !loading ? T.teal : T.panel, color: "#000", fontWeight: 800, fontSize: 16, cursor: smInput.trim() && !loading ? "pointer" : "not-allowed" }}
        >
          Enviar
        </button>
      </div>

      {dragging && (
        <div style={{ position: "fixed", left: dragPos.x - 56, top: dragPos.y - 28, padding: "10px 17px", background: "#fff", borderRadius: 12, boxShadow: "0 10px 32px rgba(0,0,0,0.2)", border: `2px solid ${T.teal}`, fontSize: 14, fontWeight: 700, color: "#333", pointerEvents: "none", zIndex: 1000, transform: "rotate(-3deg)" }}>
          {dragging.label}
        </div>
      )}

      {/* AI Coach flotante */}
      <AICoach
        challengeName="Estimación & Priorización"
        challengeContext={`El SM está facilitando un Sprint 1 Planning. El equipo nunca estimó ni priorizó juntos. 12 PBIs en el backlog, velocity estimada 30 pts. ${pokerActive ? `Está corriendo Planning Poker, PBI ${pokerIdx + 1} de 4.` : ''}`}
      />
    </div>
  )
}

