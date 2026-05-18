import { useState, useEffect, useRef, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { T } from "../theme"
import { callAI, buildFormatPrompt, buildInterventionPrompt, computeScores, getGrade } from "../engine/ai"
import { saveResult } from "../engine/supabase"
import { Avatar, StickyCard, ChatBubble, MiniBoard, TopBar, ProgressBar } from "../components"
import TeamPanel from "../components/TeamPanel"
import ChallengeComplete from "../components/ChallengeComplete"
import { markChallengeComplete, isLastChallenge } from "../utils/progressTracker"
import { TEAM, MEMBER_MAP, SPRINT_CONTEXT, SPRINT_STATS, SPRINT_SIGNALS, TEAM_DESC, FORMATS, STICKIES, MOMENTS, DIMENSIONS } from "../data/challenge01"
import "./Challenge01.css"

export default function Challenge01() {
  const nav = useNavigate()
  const [phase, setPhase] = useState("context")
  const [fmt, setFmt] = useState(null)
  const [justif, setJustif] = useState("")
  const [mIdx, setMIdx] = useState(0)
  const [chat, setChat] = useState([])
  const [stickies, setStickies] = useState([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [allScores, setAllScores] = useState([])
  const [allFeedback, setAllFeedback] = useState([])
  const [timer, setTimer] = useState(900)
  const [waiting, setWaiting] = useState(false)
  const [prompt, setPrompt] = useState("")
  const [evaling, setEvaling] = useState(false)
  const [startTime] = useState(Date.now())
  const chatRef = useRef(null)
  const inputRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight }, [chat, waiting, loading])
  useEffect(() => { if (phase === "board") { timerRef.current = setInterval(() => setTimer(t => Math.max(0, t - 1)), 1000); return () => clearInterval(timerRef.current) } }, [phase])

  const mm = String(Math.floor(timer / 60)).padStart(2, "0")
  const ss = String(timer % 60).padStart(2, "0")
  const chosenFmt = FORMATS.find(f => f.id === fmt)
  const phaseLabels = { "Elección de formato": "Elección de formato", apertura: "Apertura de la retro", problema_oculto: "Facilitación del conflicto", deuda_documentacion: "Conexión de patrones", action_items: "Action Items" }

  async function startBoard() {
    setEvaling(true)
    const ch = FORMATS.find(f => f.id === fmt)
    const sys = buildFormatPrompt(ch.name, ch.desc, justif, SPRINT_CONTEXT)
    const res = await callAI(sys, `${ch.name}: ${justif}`)
    setEvaling(false)
    if (res) {
      const feedbackData = { phase: "Elección de formato", ...res }
      setAllScores(s => [...s, res.scores])
      setAllFeedback(f => [...f, feedbackData])
    }
    // Proceed automatically
    setTimeout(() => proceedToBoard(), 1500)
  }

  function proceedToBoard() {
    setStickies(STICKIES[fmt]?.initial || [])
    setPhase("board")
    setTimeout(() => triggerMoment(0), 2500)
  }

  function triggerMoment(idx) {
    if (idx >= MOMENTS.length) { clearInterval(timerRef.current); markChallengeComplete(1); setPhase("results"); return }
    const mo = MOMENTS[idx]
    setChat(p => [...p, { narration: true, text: mo.narration }, ...mo.chat.map(c => ({ from: c.from, text: c.text }))])
    setPrompt(mo.prompt)
    setWaiting(true)
    setTimeout(() => inputRef.current?.focus(), 300)
  }

  async function submit() {
    if (!input.trim() || loading) return
    const txt = input.trim(); setInput(""); setWaiting(false); setLoading(true)
    setChat(p => [...p, { isYou: true, text: txt }])
    const mo = MOMENTS[mIdx]
    const ctx = chat.slice(-12).map(c => c.narration ? `[${c.text}]` : c.isYou ? `[SM: ${c.text}]` : `[${MEMBER_MAP[c.from]?.name}: ${c.text}]`).join("\n")
    const isAction = mo.id === "action_items"
    const sys = buildInterventionPrompt(TEAM_DESC, SPRINT_CONTEXT, mo.prompt, ctx, txt, isAction)
    const res = await callAI(sys, txt)
    setLoading(false)
    if (res) {
      const msgs = []
      if (res.narration) msgs.push({ narration: true, text: res.narration })
      if (res.reactions) res.reactions.forEach(r => msgs.push({ from: r.from, text: r.text }))
      setChat(p => [...p, ...msgs])
      const vs = {}; if (res.scores) Object.entries(res.scores).forEach(([k, v]) => { if (v > 0) vs[k] = v })
      const feedbackData = { phase: mo.id, quality: res.quality, feedback: res.feedback, scores: vs }
      setAllScores(s => [...s, vs])
      setAllFeedback(f => [...f, feedbackData])
      if (mo.newStickies) setStickies(p => [...p, ...mo.newStickies])
    }
    // Continue automatically after short delay
    setTimeout(() => continueToNextMoment(), 1500)
  }

  function continueToNextMoment() {
    const next = mIdx + 1
    setMIdx(next)
    setTimeout(() => triggerMoment(next), 1000)
  }

  // Progress steps for the challenge
  const progressSteps = [
    { label: "Contexto" },
    { label: "Formato" },
    { label: "Facilitación" },
    { label: "Resultados" }
  ]

  const currentStep = phase === "context" ? 0 : phase === "format" ? 1 : phase === "board" ? 2 : 3

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
      const timeUsed = Math.floor((Date.now() - startTime) / 1000)
      saveResult({
        candidateId: "test@test.com",
        challengeId: 1,
        scores: finalScores,
        feedback: allFeedback,
        grade: gradeData,
        timeUsed
      }).then(() => {
        console.log("Challenge 01 result saved to Supabase")
      })
    }
  }, [phase, finalScores, allFeedback, gradeData, startTime])

  // ═══════════════════════ CONTEXT ═══════════════════════
  if (phase === "context") return (
    <div className="challenge-context">
      <TopBar
        backButton={{ label: "← Back to Challenges", onClick: () => nav("/challenges") }}
        progress={<ProgressBar steps={progressSteps} current={currentStep} />}
      />
      <div className="context-container">
        <div className="context-header">
          <h1 className="context-title">Sprint 17 — Briefing</h1>
          <p className="context-subtitle">Leé el contexto del sprint antes de facilitar</p>
        </div>

        <div className="sprint-stats-grid">
          {SPRINT_STATS.map(s => (
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
                <div className="signal-meta">{MEMBER_MAP[e.from]?.name} · {e.ts}</div>
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
  if (phase === "format") return (
    <div className="format-selection">
      <TopBar
        backButton={{ label: "← Briefing", onClick: () => setPhase("context") }}
        progress={<ProgressBar steps={progressSteps} current={currentStep} />}
      />
      <div className="format-container">
        <div className="format-header">
          <div className="format-badge">PUNTO DE DECISIÓN</div>
          <h1 className="format-title">Elegí el formato de retro</h1>
          <p className="format-subtitle">Basándote en el contexto del sprint, ¿cuál formato le viene a este equipo?</p>
        </div>

        <div className="format-cards-grid">
          {FORMATS.map(f => (
            <div
              key={f.id}
              onClick={() => setFmt(f.id)}
              className={`format-card ${fmt === f.id ? 'selected' : ''}`}
              style={{ position: 'relative' }}
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
                onChange={e => setJustif(e.target.value)}
                placeholder="Explicá tu razonamiento. ¿Qué del contexto del sprint o la dinámica del equipo te llevó a elegir este formato?"
                className="justification-textarea"
              />
            </div>
            <button
              onClick={() => { if (!evaling) startBoard() }}
              disabled={evaling}
              className="format-start-btn"
            >
              {evaling ? "EVALUANDO..." : "INICIAR RETROSPECTIVA →"}
            </button>
          </>
        )}
      </div>

    </div>
  )

  // ═══════════════════════ RESULTS ═══════════════════════
  if (phase === "results") return (
    <ChallengeComplete
      challengeTitle="La retro que parece perfecta"
      challengeNumber={1}
      accentColor="#00d4aa"
      gradientStart="rgba(0, 212, 170, 0.85)"
      gradientEnd="rgba(5, 150, 105, 0.80)"
      isLastChallenge={isLastChallenge(1)}
    />
  )

  // ═══════════════════════ BOARD ═══════════════════════
  const cols = chosenFmt?.cols || ["Keep Doing", "Improve"]

  // Column colors for better visual differentiation
  const colColors = ["#16a34a", "#dc2626", "#d97706", "#2563eb"]

  return (
    <div style={{ background: T.bg, height: "100vh", color: T.text, fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif", display: "flex", flexDirection: "column" }}>
      {/* TopBar - Navy style */}
      <div style={{ background: T.navy, height: 52, display: "flex", alignItems: "center", padding: "0 20px", gap: 12, flexShrink: 0 }}>
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
            transition: "all 0.15s"
          }}
        >← Volver</button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 15 }}>🎯</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,.9)", letterSpacing: ".5px" }}>
            SPRINT 17 · {chosenFmt?.name?.toUpperCase() || "RETRO"}
          </span>
          <span style={{ color: "rgba(255,255,255,.3)" }}>·</span>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,.6)" }}>Equipo Fenix</span>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            fontFamily: "monospace",
            fontSize: 16,
            fontWeight: 700,
            color: timer < 120 ? "#fca5a5" : "rgba(255,255,255,.8)",
            background: "rgba(0,0,0,.2)",
            padding: "4px 12px",
            borderRadius: 6
          }}>{mm}:{ss}</div>
        </div>
      </div>

      {/* Color bar - 3px strip with column colors */}
      <div style={{ display: "flex", height: 3, flexShrink: 0 }}>
        {cols.map((_, i) => (
          <div key={i} style={{ flex: 1, background: colColors[i % colColors.length] }} />
        ))}
      </div>

      {/* Step bar - Moments progress */}
      <div style={{
        background: "#fff",
        borderBottom: `1px solid ${T.border}`,
        height: 44,
        display: "flex",
        alignItems: "center",
        padding: "0 20px",
        gap: 16,
        flexShrink: 0,
        boxShadow: "0 1px 4px rgba(0,0,0,.06)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1 }}>
          {MOMENTS.map((mo, i) => {
            const active = i === mIdx
            const done = i < mIdx
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                {i > 0 && <span style={{ color: T.gray300, fontSize: 11 }}>›</span>}
                <div style={{
                  padding: "3px 10px",
                  borderRadius: 100,
                  background: active ? T.navy : done ? "#dcfce7" : "#f8fafc",
                  border: `1px solid ${active ? T.navy : done ? "#16a34a" : T.border}`
                }}>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: ".3px",
                    color: active ? "#fff" : done ? "#16a34a" : T.dim
                  }}>
                    {done ? "✓ " : ""}{phaseLabels[mo.id]?.toUpperCase() || `M${i + 1}`}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Board */}
        <div style={{ flex: 1, padding: 8, overflowY: "auto", borderRight: `1px solid ${T.border}` }}>
          {fmt === "sailboat" ? (
            // Sailboat visual layout - Light theme redesign
            <div style={{ position: "relative", width: "100%", height: "100%", minHeight: 650, background: "linear-gradient(to bottom, #e0f2fe 0%, #bae6fd 35%, #7dd3fc 60%, #38bdf8 100%)", overflow: "hidden" }}>

              {/* Soft clouds in sky */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "40%", background: "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.5), transparent 40%), radial-gradient(circle at 70% 15%, rgba(255,255,255,0.4), transparent 35%)" }} />

              {/* Ocean waves (lighter water effect) */}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "55%", background: "linear-gradient(to bottom, rgba(56,189,248,0.2), rgba(3,105,161,0.15))", borderRadius: "50% 50% 0 0 / 40px 40px 0 0" }}>
                {/* Wave foam (white caps) */}
                <div style={{ position: "absolute", top: "20%", left: "10%", width: 60, height: 3, background: "rgba(255, 255, 255, 0.7)", borderRadius: 2 }} />
                <div style={{ position: "absolute", top: "35%", right: "15%", width: 50, height: 3, background: "rgba(255, 255, 255, 0.6)", borderRadius: 2 }} />
                <div style={{ position: "absolute", top: "50%", left: "30%", width: 40, height: 3, background: "rgba(255, 255, 255, 0.5)", borderRadius: 2 }} />
              </div>

              {/* Wind 🌬️ - Top Left (Propelling Forces) */}
              <div style={{ position: "absolute", top: "8%", left: "3%", textAlign: "center", zIndex: 10 }}>
                <div style={{ fontSize: 56, marginBottom: 4, filter: "drop-shadow(0 2px 8px rgba(5,150,105,0.2))" }}>🌬️</div>
                <div style={{ fontSize: 10, fontWeight: 800, color: "#059669", marginBottom: 10, letterSpacing: 1.5, textTransform: "uppercase", textShadow: "0 1px 2px rgba(255,255,255,0.8)" }}>
                  Wind
                </div>
                <div style={{ fontSize: 8, color: "rgba(15,23,42,0.70)", marginBottom: 8, fontStyle: "italic", maxWidth: 160, textShadow: "0 1px 1px rgba(255,255,255,0.5)" }}>
                  Lo que nos impulsa
                </div>
                <div style={{ width: 170 }}>
                  {stickies.filter(s => s.col === 0).map((s, i) => (
                    <StickyCard key={`wind-${i}`} sticky={s} memberMap={MEMBER_MAP} delay={i * 250} />
                  ))}
                </div>
              </div>

              {/* Island 🏝️ - Right Horizon (Goal) */}
              <div style={{ position: "absolute", top: "48%", right: "5%", transform: "translateY(-50%)", textAlign: "center", zIndex: 10 }}>
                <div style={{ fontSize: 70, marginBottom: 4, filter: "drop-shadow(0 4px 12px rgba(5,150,105,0.25))" }}>🏝️</div>
                <div style={{ fontSize: 10, fontWeight: 800, color: "#059669", marginBottom: 10, letterSpacing: 1.5, textTransform: "uppercase", textShadow: "0 1px 2px rgba(255,255,255,0.8)" }}>
                  Island
                </div>
                <div style={{ fontSize: 8, color: "rgba(15,23,42,0.70)", marginBottom: 8, fontStyle: "italic", maxWidth: 160, textShadow: "0 1px 1px rgba(255,255,255,0.5)" }}>
                  Nuestra meta
                </div>
                <div style={{ width: 170 }}>
                  {stickies.filter(s => s.col === 3).map((s, i) => (
                    <StickyCard key={`island-${i}`} sticky={s} memberMap={MEMBER_MAP} delay={i * 250} />
                  ))}
                </div>
              </div>

              {/* Boat ⛵ - Center Left (The Team) */}
              <div style={{ position: "absolute", top: "45%", left: "25%", transform: "translate(-50%, -50%)", textAlign: "center", zIndex: 15 }}>
                <div style={{ fontSize: 140, filter: "drop-shadow(0 6px 20px rgba(15,23,42,0.25))", transform: "rotate(5deg)" }}>⛵</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#0a1f44", marginTop: 8, background: "rgba(255,255,255,0.85)", padding: "4px 12px", borderRadius: 12, backdropFilter: "blur(4px)", border: "1px solid rgba(0,212,170,0.20)" }}>
                  Equipo Fenix
                </div>
              </div>

              {/* Rocks 🪨 - Center (Between boat and island - Risks) */}
              <div style={{ position: "absolute", top: "52%", right: "28%", textAlign: "center", zIndex: 12 }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: "#ea580c", marginBottom: 4, letterSpacing: 1.5, textTransform: "uppercase", textShadow: "0 1px 2px rgba(255,255,255,0.8)" }}>
                  Rocks
                </div>
                <div style={{ fontSize: 60, marginBottom: 4, filter: "drop-shadow(0 3px 10px rgba(234,88,12,0.2))" }}>🪨</div>
                <div style={{ fontSize: 8, color: "rgba(15,23,42,0.70)", marginBottom: 8, fontStyle: "italic", maxWidth: 160, textShadow: "0 1px 1px rgba(255,255,255,0.5)" }}>
                  Riesgos adelante
                </div>
                <div style={{ width: 170 }}>
                  {stickies.filter(s => s.col === 2).map((s, i) => (
                    <StickyCard key={`rocks-${i}`} sticky={s} memberMap={MEMBER_MAP} delay={i * 250} />
                  ))}
                </div>
              </div>

              {/* Anchor ⚓ - Bottom (Under boat - Obstacles) */}
              <div style={{ position: "absolute", bottom: "3%", left: "25%", transform: "translateX(-50%)", textAlign: "center", zIndex: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: "#dc2626", marginBottom: 4, letterSpacing: 1.5, textTransform: "uppercase", textShadow: "0 1px 2px rgba(255,255,255,0.8)" }}>
                  Anchor
                </div>
                <div style={{ fontSize: 60, marginBottom: 4, filter: "drop-shadow(0 3px 10px rgba(220,38,38,0.2))" }}>⚓</div>
                <div style={{ fontSize: 8, color: "rgba(15,23,42,0.70)", marginBottom: 8, fontStyle: "italic", maxWidth: 180, textShadow: "0 1px 1px rgba(255,255,255,0.5)" }}>
                  Lo que nos frena
                </div>
                <div style={{ width: 190 }}>
                  {stickies.filter(s => s.col === 1).map((s, i) => (
                    <StickyCard key={`anchor-${i}`} sticky={s} memberMap={MEMBER_MAP} delay={i * 250} />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // Traditional column layout for other formats
            <div style={{ display: "flex", gap: 6, height: "100%" }}>
              {cols.map((colName, ci) => {
                const cs = stickies.filter(s => s.col === ci)
                const neg = ["Improve","Sad 😔","Mad 😤","Start","Stop","Anchor ⚓","Rocks 🪨"]
                const isNeg = neg.includes(colName)
                return (
                  <div key={ci} style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, color: isNeg ? T.orange : T.teal, textAlign: "center", padding: "5px 0", marginBottom: 5, background: isNeg ? `${T.orange}18` : T.tealDim, borderRadius: 5, textTransform: "uppercase", border: isNeg ? `1px dashed ${T.orange}30` : "1px solid transparent" }}>
                      {colName} <span style={{ fontSize: 8, opacity: 0.6 }}>({cs.length})</span>
                    </div>
                    <div>{cs.map((s, i) => <StickyCard key={`${ci}-${i}-${s.text.slice(0,8)}`} sticky={s} memberMap={MEMBER_MAP} delay={i * 250} />)}</div>
                    {cs.length === 0 && <div style={{ fontSize: 9, color: T.dim, textAlign: "center", padding: 16, opacity: 0.4, fontStyle: "italic" }}>Sin items todavía</div>}
                  </div>
                )
              })}
            </div>
          )}
        </div>
        {/* Chat */}
        <div style={{ width: 340, display: "flex", flexDirection: "column", flexShrink: 0 }}>
          <div ref={chatRef} style={{ flex: 1, overflowY: "auto", padding: "6px 8px" }}>
            {chat.map((msg, i) => <ChatBubble key={i} msg={msg} memberMap={MEMBER_MAP} />)}
            {loading && <div style={{ padding: "8px", fontSize: 10, color: T.dim, fontStyle: "italic" }}><span style={{ animation: "pulse 1s ease infinite", display: "inline-block" }}>El equipo está reaccionando...</span></div>}
          </div>
          <div style={{ borderTop: `1px solid ${T.border}`, padding: 7, flexShrink: 0 }}>
            {waiting && !loading ? (
              <>
                <div style={{ fontSize: 9, color: T.teal, fontWeight: 600, marginBottom: 4, padding: "3px 6px", background: T.tealDim, borderRadius: 4, lineHeight: 1.3 }}>
                  💬 {prompt}
                </div>
                <div style={{ display: "flex", gap: 5 }}>
                  <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit() } }}
                    placeholder="Escribí lo que dirías como Scrum Master..."
                    rows={3} style={{ flex: 1, padding: 7, borderRadius: 7, border: `1px solid ${T.border}`, background: T.card, color: T.text, fontSize: 11.5, fontFamily: "inherit", lineHeight: 1.4, resize: "none", outline: "none" }}
                    onFocus={e => e.target.style.borderColor = T.teal} onBlur={e => e.target.style.borderColor = T.border} />
                  <button onClick={submit} disabled={!input.trim()}
                    style={{ width: 42, borderRadius: 7, border: "none", cursor: input.trim() ? "pointer" : "not-allowed", background: input.trim() ? T.teal : T.card, color: T.bg, fontWeight: 800, fontSize: 15, flexShrink: 0 }}>→</button>
                </div>
              </>
            ) : (
              <div style={{ fontSize: 10, color: T.dim, textAlign: "center", padding: 6, fontStyle: "italic" }}>
                {loading ? "Evaluando tu intervención..." : "Esperando el próximo momento..."}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
