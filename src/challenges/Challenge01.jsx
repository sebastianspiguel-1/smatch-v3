import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from "recharts"
import { T, DIM_LABELS } from "../theme"
import { callAI, buildFormatPrompt, buildInterventionPrompt, computeScores, getGrade } from "../engine/ai"
import { Avatar, StickyCard, ChatBubble, MiniBoard, ScoreBadges } from "../components"
import { TEAM, MEMBER_MAP, SPRINT_CONTEXT, SPRINT_STATS, SPRINT_SIGNALS, TEAM_DESC, FORMATS, STICKIES, MOMENTS, DIMENSIONS } from "../data/challenge01"

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
    if (res) { setAllScores(s => [...s, res.scores]); setAllFeedback(f => [...f, { phase: "Elección de formato", ...res }]) }
    setStickies(STICKIES[fmt]?.initial || [])
    setPhase("board")
    setTimeout(() => triggerMoment(0), 2500)
  }

  function triggerMoment(idx) {
    if (idx >= MOMENTS.length) { clearInterval(timerRef.current); setPhase("results"); return }
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
      setAllScores(s => [...s, vs])
      setAllFeedback(f => [...f, { phase: mo.id, quality: res.quality, feedback: res.feedback, scores: vs }])
      if (mo.newStickies) setStickies(p => [...p, ...mo.newStickies])
    }
    const next = mIdx + 1; setMIdx(next)
    setTimeout(() => triggerMoment(next), 3000)
  }

  const finalScores = computeScores(allScores, DIMENSIONS)
  const gradeData = getGrade(finalScores)

  // ═══════════════════════ CONTEXT ═══════════════════════
  if (phase === "context") return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.text, fontFamily: "'Segoe UI',system-ui,sans-serif" }}>
      <div style={{ maxWidth: 500, margin: "0 auto", padding: "24px 16px" }}>
        <button onClick={() => nav("/")} style={{ background: "none", border: "none", color: T.dim, fontSize: 11, cursor: "pointer", marginBottom: 12 }}>← Volver al menú</button>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, color: T.teal }}>SMATCH · SIMULACIÓN</div>
          <div style={{ fontSize: 22, fontWeight: 800, marginTop: 6 }}>Sprint 17 — Briefing</div>
          <div style={{ fontSize: 11, color: T.dim, marginTop: 2 }}>Leé el contexto del sprint antes de facilitar</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
          {SPRINT_STATS.map(s => (
            <div key={s.label} style={{ background: T.panel, borderRadius: 8, padding: 10, border: `1px solid ${T.border}`, textAlign: "center" }}>
              <div style={{ fontSize: 16 }}>{s.icon}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: s.label === "Carry-over" ? T.orange : T.teal }}>{s.value}</div>
              <div style={{ fontSize: 9, color: T.sub }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ background: T.panel, borderRadius: 8, padding: 12, marginBottom: 14, border: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, color: T.teal, marginBottom: 8 }}>EQUIPO FENIX</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {TEAM.map(m => (
              <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 5, background: T.card, borderRadius: 5, padding: "3px 7px" }}>
                <Avatar member={m} size={20} />
                <div><div style={{ fontSize: 10, fontWeight: 600 }}>{m.name}</div><div style={{ fontSize: 8, color: T.dim }}>{m.role}</div></div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: T.panel, borderRadius: 8, padding: 12, marginBottom: 18, border: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, color: T.teal, marginBottom: 8 }}>SEÑALES DEL SPRINT</div>
          {SPRINT_SIGNALS.map((e, i) => (
            <div key={i} style={{ display: "flex", gap: 6, marginBottom: 8 }}>
              <Avatar member={MEMBER_MAP[e.from]} size={20} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 9, color: T.dim }}>{MEMBER_MAP[e.from]?.name} · {e.ts}</div>
                <div style={{ fontSize: 11, color: T.sub, lineHeight: 1.35 }}>{e.text}</div>
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => setPhase("format")} style={{ width: "100%", padding: "13px 0", background: T.teal, color: T.bg, fontWeight: 800, fontSize: 13, border: "none", borderRadius: 9, cursor: "pointer", letterSpacing: 1 }}>
          ELEGIR FORMATO DE RETRO →
        </button>
      </div>
    </div>
  )

  // ═══════════════════════ FORMAT ═══════════════════════
  if (phase === "format") return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.text, fontFamily: "'Segoe UI',system-ui,sans-serif" }}>
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "24px 16px" }}>
        <button onClick={() => setPhase("context")} style={{ background: "none", border: "none", color: T.dim, fontSize: 11, cursor: "pointer", marginBottom: 12 }}>← Volver al briefing</button>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, color: T.teal }}>PUNTO DE DECISIÓN</div>
          <div style={{ fontSize: 20, fontWeight: 800, marginTop: 4 }}>Elegí el formato de retro</div>
          <div style={{ fontSize: 11, color: T.dim, marginTop: 2 }}>Basándote en el contexto del sprint, ¿cuál formato le viene a este equipo?</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
          {FORMATS.map(f => (
            <button key={f.id} onClick={() => setFmt(f.id)} style={{
              textAlign: "left", padding: 12, borderRadius: 9, cursor: "pointer",
              background: fmt === f.id ? T.cardHi : T.panel,
              border: `2px solid ${fmt === f.id ? T.teal : T.border}`, color: T.text, transition: "all 0.2s",
              display: "flex", gap: 12, alignItems: "flex-start",
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: fmt === f.id ? T.teal : T.text }}>{f.name}</div>
                <div style={{ fontSize: 11, color: T.sub, marginTop: 3, lineHeight: 1.35 }}>{f.desc}</div>
                <div style={{ fontSize: 9, color: T.dim, marginTop: 3 }}>{f.hint}</div>
              </div>
              <div style={{ width: 100, flexShrink: 0 }}><MiniBoard cols={f.cols} active={fmt === f.id} /></div>
            </button>
          ))}
        </div>
        {fmt && (
          <>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, color: T.teal, marginBottom: 5 }}>¿POR QUÉ ESTE FORMATO?</div>
              <textarea value={justif} onChange={e => setJustif(e.target.value)}
                placeholder="Explicá tu razonamiento. ¿Qué del contexto del sprint o la dinámica del equipo te llevó a elegir este formato?"
                rows={4} style={{ width: "100%", padding: 10, borderRadius: 7, border: `1px solid ${T.border}`, background: T.card, color: T.text, fontSize: 12, resize: "vertical", fontFamily: "inherit", lineHeight: 1.45, boxSizing: "border-box", outline: "none" }}
                onFocus={e => e.target.style.borderColor = T.teal} onBlur={e => e.target.style.borderColor = T.border} />
            </div>
            <button onClick={() => { if (justif.trim().length > 15 && !evaling) startBoard() }}
              disabled={justif.trim().length < 15 || evaling}
              style={{ width: "100%", padding: "13px 0", fontWeight: 800, fontSize: 13, border: "none", borderRadius: 9, letterSpacing: 1, color: T.bg, cursor: justif.trim().length > 15 ? "pointer" : "not-allowed", background: justif.trim().length > 15 ? T.teal : T.border, opacity: justif.trim().length > 15 ? 1 : 0.5 }}>
              {evaling ? "EVALUANDO..." : "INICIAR RETROSPECTIVA →"}
            </button>
          </>
        )}
      </div>
    </div>
  )

  // ═══════════════════════ RESULTS ═══════════════════════
  if (phase === "results") return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.text, fontFamily: "'Segoe UI',system-ui,sans-serif" }}>
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "20px 16px" }}>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, color: T.teal }}>EVALUACIÓN COMPLETA</div>
          <div style={{ fontSize: 52, fontWeight: 900, color: gradeData.color, marginTop: 6 }}>{gradeData.letter}</div>
          <div style={{ fontSize: 13, color: T.sub }}>{gradeData.label}</div>
          <div style={{ fontSize: 10, color: T.dim }}>Puntaje general: {Math.round(gradeData.avg)}%</div>
        </div>
        <div style={{ background: T.panel, borderRadius: 10, padding: 14, marginBottom: 14, border: `1px solid ${T.border}` }}>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={finalScores} cx="50%" cy="50%" outerRadius="66%">
              <PolarGrid stroke={T.border} />
              <PolarAngleAxis dataKey="dimension" tick={{ fill: T.sub, fontSize: 9 }} />
              <Radar dataKey="score" stroke={T.teal} fill={T.teal} fillOpacity={0.2} strokeWidth={2} dot={{ r: 3, fill: T.teal }} />
            </RadarChart>
          </ResponsiveContainer>
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
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, color: T.teal, marginBottom: 6 }}>ANÁLISIS DE INTERVENCIONES</div>
        {allFeedback.map((fb, i) => {
          const qc = fb.quality === "expert" ? T.green : fb.quality === "competent" ? T.blue : fb.quality === "developing" ? T.orange : T.red
          return (
            <div key={i} style={{ background: T.panel, borderRadius: 7, padding: 10, marginBottom: 6, border: `1px solid ${T.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: T.dim, textTransform: "uppercase" }}>{phaseLabels[fb.phase] || fb.phase}</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: qc }}>{fb.quality?.toUpperCase()}</span>
              </div>
              <div style={{ fontSize: 11, color: T.sub, lineHeight: 1.35 }}>{fb.feedback}</div>
              {fb.scores && <ScoreBadges scores={fb.scores} />}
            </div>
          )
        })}
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <button onClick={() => nav("/")} style={{ flex: 1, padding: "13px 0", background: T.card, color: T.teal, fontWeight: 700, fontSize: 13, border: `1px solid ${T.teal}`, borderRadius: 9, cursor: "pointer" }}>
            VOLVER AL MENÚ
          </button>
          <button onClick={() => window.location.reload()} style={{ flex: 1, padding: "13px 0", background: T.teal, color: T.bg, fontWeight: 700, fontSize: 13, border: "none", borderRadius: 9, cursor: "pointer" }}>
            JUGAR DE NUEVO
          </button>
        </div>
      </div>
    </div>
  )

  // ═══════════════════════ BOARD ═══════════════════════
  const cols = chosenFmt?.cols || ["Keep Doing", "Improve"]
  return (
    <div style={{ background: T.bg, height: "100vh", color: T.text, fontFamily: "'Segoe UI',system-ui,sans-serif", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "7px 12px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, background: T.panel }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: T.teal }}>RETRO EN VIVO</div>
          <div style={{ fontSize: 10, color: T.dim }}>Equipo Fenix · Sprint 17 · {chosenFmt?.name}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", gap: 3 }}>
            {MOMENTS.map((_, i) => <div key={i} style={{ width: 18, height: 4, borderRadius: 2, background: i < mIdx ? T.teal : i === mIdx && waiting ? T.tealGlow : T.card, transition: "background 0.3s" }} />)}
          </div>
          <div style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: timer < 120 ? T.red : T.sub }}>{mm}:{ss}</div>
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Board */}
        <div style={{ flex: 1, padding: 8, overflowY: "auto", borderRight: `1px solid ${T.border}` }}>
          <div style={{ display: "flex", gap: 6, height: "100%" }}>
            {cols.map((colName, ci) => {
              const cs = stickies.filter(s => s.col === ci)
              const neg = ["Improve","Sad 😔","Mad 😤","Start","Stop"]
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
