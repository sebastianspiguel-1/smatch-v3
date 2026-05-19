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
  DIMENSIONS, DOCK_ITEMS,
  KANO_ITEMS, RELABS_ITEMS, TSHIRT_TEAM_VOTES, TSHIRT_VOTE_REASONS, TSHIRT_PBI_INFO, POKER_STEPS_PROMPTS,
  TEAM_AGREEMENT_TOPICS,
} from "../data/challenge04"
import { SETLIST_TEAM } from "../data/team"

// Team description para el prompt AI (usa las bios ricas del data central)
const TEAM_DESC = SETLIST_TEAM.map(m => `- ${m.name} (${m.role}): ${m.bio}`).join("\n")

// ═══════════════════ SM AGREEMENT INPUT — Compacto inline para cada columna ═══════════════════
function SMAgreementInput({ topicId, onAdd }) {
  const [text, setText] = useState("")
  const [expanded, setExpanded] = useState(false)

  function submit() {
    if (!text.trim()) return
    onAdd(text.trim())
    setText("")
    setExpanded(false)
  }

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        style={{
          width: "100%",
          padding: "8px 10px",
          marginTop: 4,
          borderRadius: 8,
          border: "1.5px dashed rgba(0,212,170,0.40)",
          background: "rgba(0,212,170,0.04)",
          color: "#059669",
          fontWeight: 700,
          fontSize: 12,
          cursor: "pointer",
          fontFamily: "inherit",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,212,170,0.10)"; e.currentTarget.style.borderColor = "rgba(0,212,170,0.70)" }}
        onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,212,170,0.04)"; e.currentTarget.style.borderColor = "rgba(0,212,170,0.40)" }}
      >
        + Agregar mi acuerdo
      </button>
    )
  }

  return (
    <div style={{ marginTop: 4, padding: 8, background: "rgba(0,212,170,0.04)", borderRadius: 8, border: "1.5px solid rgba(0,212,170,0.30)" }}>
      <textarea
        autoFocus
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => {
          if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit() }
          if (e.key === "Escape") { setExpanded(false); setText("") }
        }}
        placeholder="Tu propuesta de acuerdo..."
        rows={2}
        style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid rgba(0,212,170,0.30)", fontSize: 12, fontFamily: "inherit", resize: "none", outline: "none", boxSizing: "border-box", color: "#0f172a", background: "#ffffff", lineHeight: 1.4 }}
      />
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, marginTop: 6 }}>
        <button
          onClick={() => { setExpanded(false); setText("") }}
          style={{ padding: "5px 10px", borderRadius: 6, border: "none", background: "transparent", color: "#64748b", fontWeight: 600, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}
        >
          Cancelar
        </button>
        <button
          onClick={submit}
          disabled={!text.trim()}
          style={{ padding: "5px 12px", borderRadius: 6, border: "none", background: text.trim() ? "#00d4aa" : "#e5e7eb", color: text.trim() ? "#ffffff" : "#9ca3af", fontWeight: 700, fontSize: 11, cursor: text.trim() ? "pointer" : "not-allowed", fontFamily: "inherit" }}
        >
          Agregar al board
        </button>
      </div>
    </div>
  )
}

// ═══════════════════ EXPLAIN STEP — Paso 2 compartido ═══════════════════
// Después de completar la mecánica visual de cada tool, el SM escribe su
// explicación al equipo. La AI evalúa esa explicación al cierre.
function ExplainStep({ accent, prompt, onSubmit }) {
  const [text, setText] = useState("")
  return (
    <div style={{ padding: 14, background: "#f8fafc", borderRadius: 10, marginTop: 10, border: `1.5px solid ${accent}30` }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: accent, marginBottom: 6, letterSpacing: 0.5, textTransform: "uppercase" }}>
        💬 Explicale al equipo
      </div>
      <div style={{ fontSize: 13, color: "#475569", marginBottom: 8, lineHeight: 1.5 }}>{prompt}</div>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Escribí tu explicación como se la darías al equipo..."
        rows={3}
        style={{ width: "100%", padding: 10, borderRadius: 8, border: "1.5px solid #d1d5db", fontSize: 14, fontFamily: "inherit", resize: "none", outline: "none", boxSizing: "border-box", color: "#0f172a", background: "#ffffff" }}
        onFocus={e => e.target.style.borderColor = accent}
        onBlur={e => e.target.style.borderColor = "#d1d5db"}
      />
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
        <button
          onClick={() => text.trim() && onSubmit(text.trim())}
          disabled={!text.trim()}
          style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: text.trim() ? accent : "#e5e7eb", color: text.trim() ? "#ffffff" : "#9ca3af", fontWeight: 700, fontSize: 13, cursor: text.trim() ? "pointer" : "not-allowed", fontFamily: "inherit" }}
        >
          Explicar al equipo →
        </button>
      </div>
    </div>
  )
}

// ═══════════════════ 1. POKER STEPS TOOL ═══════════════════
function PokerStepsTool({ onComplete }) {
  const [answers, setAnswers] = useState(["", "", "", "", ""])
  const [mechanicDone, setMechanicDone] = useState(false)
  const filled = answers.filter(a => a.trim()).length
  const accent = "#e84393"

  function finishMechanic() { setMechanicDone(true) }

  return (
    <div style={{ padding: 12, minWidth: 380 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: accent, marginBottom: 10 }}>🃏 5 Pasos del Planning Poker</div>
      <div style={{ fontSize: 12, color: "#666", marginBottom: 10, lineHeight: 1.4 }}>Completá cada paso en tus propias palabras:</div>
      {POKER_STEPS_PROMPTS.map((h, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: answers[i] ? `${accent}15` : "#f8f8f8", border: `2px solid ${answers[i] ? accent : "#e0e0e0"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: answers[i] ? accent : "#aaa", flexShrink: 0 }}>{i + 1}</div>
          <div style={{ flex: 1, fontSize: 13, color: "#555", lineHeight: 1.4 }}>
            {h.split("______")[0]}
            <input disabled={mechanicDone} value={answers[i]} onChange={e => { const n = [...answers]; n[i] = e.target.value; setAnswers(n) }}
              style={{ width: 130, padding: "4px 8px", margin: "0 3px", border: "1.5px solid #d0d0d0", borderRadius: 5, fontSize: 13, fontFamily: "inherit", outline: "none", color: "#0f172a" }} placeholder="..." />
            {h.split("______")[1]}
          </div>
        </div>
      ))}
      {!mechanicDone && filled === 5 && (
        <button onClick={finishMechanic} style={{ marginTop: 8, padding: "8px 22px", borderRadius: 8, border: "none", background: accent, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Guardar</button>
      )}
      {mechanicDone && (
        <ExplainStep
          accent={accent}
          prompt="Nacho te mira: '¿Por qué es importante que primero los extremos expliquen su voto?'"
          onSubmit={explanation => onComplete({ answers, explanation })}
        />
      )}
    </div>
  )
}

// ═══════════════════ 2. FIBONACCI TOOL ═══════════════════
function FibonacciTool({ onComplete }) {
  const shuffled = [8, 2, 21, 5, 1, 13, 3]
  const [slots, setSlots] = useState(Array(7).fill(null))
  const [pool, setPool] = useState([...shuffled])
  const [mechanicDone, setMechanicDone] = useState(false)
  const accent = "#00b894"

  function place(num) {
    const i = slots.indexOf(null); if (i === -1) return
    setSlots(p => { const n = [...p]; n[i] = num; return n })
    setPool(p => { const idx = p.indexOf(num); return p.filter((_, j) => j !== idx) })
  }
  function remove(idx) {
    if (mechanicDone || slots[idx] === null) return
    setPool(p => [...p, slots[idx]])
    setSlots(p => { const n = [...p]; n[idx] = null; return n })
  }
  function finishMechanic() { setMechanicDone(true) }

  return (
    <div style={{ padding: 12 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: accent, marginBottom: 10 }}>🔢 Secuencia Fibonacci</div>
      <div style={{ fontSize: 12, color: "#666", marginBottom: 10, lineHeight: 1.4 }}>Ordená los números como creas que va la secuencia que se usa en Planning Poker:</div>
      <div style={{ display: "flex", gap: 5, marginBottom: 10, flexWrap: "wrap" }}>
        {slots.map((v, i) => (
          <div key={i} onClick={() => remove(i)} style={{ width: 46, height: 56, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: v !== null ? `${accent}15` : "#f8f8f8", border: `2px ${v !== null ? "solid" : "dashed"} ${v !== null ? accent : "#ddd"}`, fontSize: 18, fontWeight: 900, color: accent, cursor: v && !mechanicDone ? "pointer" : "default" }}>{v ?? ""}</div>
        ))}
      </div>
      {!mechanicDone && (
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 8 }}>
          {pool.map((n, i) => <button key={i} onClick={() => place(n)} style={{ width: 46, height: 46, borderRadius: 8, border: "2px solid #ccc", background: "#fff", fontSize: 17, fontWeight: 800, color: "#333", cursor: "pointer", fontFamily: "inherit" }}>{n}</button>)}
        </div>
      )}
      {!mechanicDone && pool.length === 0 && (
        <button onClick={finishMechanic} style={{ padding: "8px 22px", borderRadius: 8, border: "none", background: accent, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Guardar</button>
      )}
      {mechanicDone && (
        <ExplainStep
          accent={accent}
          prompt="Nacho pregunta: '¿Por qué Fibonacci y no 1-2-3-4-5? ¿Qué significan los saltos cada vez más grandes?'"
          onSubmit={explanation => onComplete({ order: slots, explanation })}
        />
      )}
    </div>
  )
}

// ═══════════════════ 3. REL VS ABS TOOL ═══════════════════
function RelAbsTool({ onComplete }) {
  const [placed, setPlaced] = useState({})
  const [sel, setSel] = useState(null)
  const [mechanicDone, setMechanicDone] = useState(false)
  const accent = "#0984e3"

  function place(side) { if (sel === null) return; setPlaced(p => ({ ...p, [sel]: side })); setSel(null) }
  function finishMechanic() { setMechanicDone(true) }
  const unplaced = RELABS_ITEMS.filter(item => placed[item.id] === undefined)

  return (
    <div style={{ padding: 12 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: accent, marginBottom: 10 }}>⚖️ Relativo vs Absoluto</div>
      <div style={{ fontSize: 12, color: "#666", marginBottom: 10, lineHeight: 1.4 }}>Clasificá cada concepto según tu criterio:</div>
      <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
        {[{ s: "abs", l: "⏰ Absoluta", bg: "#fef2f2", bc: "#dc2626" }, { s: "rel", l: "📐 Relativa", bg: "#ecfdf5", bc: "#059669" }].map(side => (
          <div key={side.s} onClick={() => place(side.s)} style={{ flex: 1, minHeight: 90, padding: 12, borderRadius: 10, background: side.bg, border: `2px dashed ${sel !== null ? side.bc : side.bc + "40"}`, cursor: sel !== null ? "pointer" : "default" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: side.bc, marginBottom: 6 }}>{side.l}</div>
            {Object.entries(placed).filter(([_, s]) => s === side.s).map(([id]) => {
              const item = RELABS_ITEMS.find(i => i.id === id)
              return <div key={id} style={{ fontSize: 12, padding: "3px 9px", margin: "3px 0", borderRadius: 5, background: "#fff", color: "#333" }}>{item?.text}</div>
            })}
          </div>
        ))}
      </div>
      {!mechanicDone && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
          {unplaced.map(item => <button key={item.id} onClick={() => setSel(sel === item.id ? null : item.id)} style={{ fontSize: 12, padding: "6px 11px", borderRadius: 8, border: `2px solid ${sel === item.id ? accent : "#ddd"}`, background: sel === item.id ? "#ebf5ff" : "#fff", color: "#333", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>{item.text}</button>)}
        </div>
      )}
      {!mechanicDone && unplaced.length === 0 && (
        <button onClick={finishMechanic} style={{ padding: "8px 22px", borderRadius: 8, border: "none", background: accent, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Guardar</button>
      )}
      {mechanicDone && (
        <ExplainStep
          accent={accent}
          prompt="Alan pregunta: '¿Cuál es la diferencia entre estimación relativa y absoluta? ¿Por qué nos importa?'"
          onSubmit={explanation => onComplete({ placed, explanation })}
        />
      )}
    </div>
  )
}

// ═══════════════════ 4. T-SHIRT SIZING TOOL ═══════════════════
function TshirtTool({ onComplete }) {
  const [step, setStep] = useState(0) // 0: pre-reveal, 1: revealed, 2: razones visibles
  const [revealed, setRevealed] = useState(false)
  const [showReasons, setShowReasons] = useState(false)
  const [mechanicDone, setMechanicDone] = useState(false)
  const accent = "#6c5ce7"

  function reveal() { setRevealed(true); setStep(1) }
  function revealReasons() { setShowReasons(true); setStep(2); setTimeout(() => setMechanicDone(true), 1500) }

  return (
    <div style={{ padding: 14, minWidth: 460, maxWidth: 520 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: accent, marginBottom: 6 }}>👕 T-Shirt Sizing</div>
      <div style={{ fontSize: 12, color: "#666", marginBottom: 8, lineHeight: 1.4 }}>El equipo estima <strong style={{ color: "#0f172a" }}>{TSHIRT_PBI_INFO.id}: {TSHIRT_PBI_INFO.title}</strong>:</div>
      <div style={{ fontSize: 11, color: "#777", padding: 8, background: "#f8fafc", borderRadius: 6, marginBottom: 10, lineHeight: 1.4 }}>
        <strong>Alcance:</strong> {TSHIRT_PBI_INFO.scope}
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
        {Object.entries(TSHIRT_TEAM_VOTES).map(([mid, size]) => {
          const m = MEMBER_MAP[mid]
          return (
            <div key={mid} style={{ textAlign: "center" }}>
              <div style={{ width: 52, height: 66, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: revealed ? "#fff" : `${m.color}15`, border: `2px solid ${revealed ? m.color : m.color + "40"}`, fontSize: revealed ? 18 : 16, fontWeight: 900, color: revealed ? m.color : m.color + "50", transition: "all 0.5s" }}>{revealed ? size : "👕"}</div>
              <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>{m.name.split(" ")[0]}</div>
            </div>
          )
        })}
      </div>

      {step === 0 && (
        <div style={{ textAlign: "center" }}>
          <button onClick={reveal} style={{ padding: "10px 28px", background: accent, color: "#fff", border: "none", borderRadius: 10, fontWeight: 800, fontSize: 14, cursor: "pointer" }}>Revelar talles</button>
        </div>
      )}

      {step === 1 && (
        <>
          <div style={{ textAlign: "center", fontSize: 13, color: "#92400e", padding: 8, background: "#fef3c7", borderRadius: 8, marginBottom: 10 }}>
            ⚠️ Hay desacuerdo: <strong>M, L y XL</strong>
          </div>
          <div style={{ textAlign: "center" }}>
            <button onClick={revealReasons} style={{ padding: "10px 22px", background: accent, color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
              Escuchar las razones del equipo →
            </button>
          </div>
        </>
      )}

      {showReasons && (
        <div style={{ marginTop: 6, marginBottom: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: accent, marginBottom: 6, letterSpacing: 0.5 }}>POR QUÉ VOTARON ASÍ:</div>
          {Object.entries(TSHIRT_VOTE_REASONS).map(([mid, reason]) => {
            const m = MEMBER_MAP[mid]
            const vote = TSHIRT_TEAM_VOTES[mid]
            return (
              <div key={mid} style={{ display: "flex", gap: 8, padding: "6px 8px", marginBottom: 4, borderRadius: 6, background: "#fafafa", border: "1px solid #eee" }}>
                <div style={{ flexShrink: 0, fontWeight: 800, color: m.color, fontSize: 13, minWidth: 60 }}>
                  {m.name.split(" ")[0]} <span style={{ background: m.color + "20", padding: "1px 6px", borderRadius: 4, fontSize: 11 }}>{vote}</span>
                </div>
                <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.4, fontStyle: "italic" }}>"{reason}"</div>
              </div>
            )
          })}
        </div>
      )}

      {mechanicDone && (
        <ExplainStep
          accent={accent}
          prompt="Ahora que sabés POR QUÉ votaron distinto, ¿cómo facilitás este desacuerdo? Escribí cómo lo manejarías paso a paso."
          onSubmit={explanation => onComplete({ votes: TSHIRT_TEAM_VOTES, reasons: TSHIRT_VOTE_REASONS, explanation })}
        />
      )}
    </div>
  )
}

// ═══════════════════ 5. KANO TOOL ═══════════════════
function KanoTool({ onComplete }) {
  const cats = [
    { id: "basic", l: "🏨 Basic Needs (si falta, frustra)", bg: "#fef2f2", bc: "#dc2626" },
    { id: "perf", l: "📈 Performance (más es mejor)", bg: "#eff6ff", bc: "#2563eb" },
    { id: "delight", l: "🍪 Delighters (sorprende positivo)", bg: "#fef9c3", bc: "#ca8a04" },
  ]
  const [placed, setPlaced] = useState({})
  const [sel, setSel] = useState(null)
  const [mechanicDone, setMechanicDone] = useState(false)
  const accent = "#f39c12"

  function place(cat) { if (sel === null) return; setPlaced(p => ({ ...p, [sel]: cat })); setSel(null) }
  function finishMechanic() { setMechanicDone(true) }
  const unplaced = KANO_ITEMS.filter(item => placed[item.id] === undefined)

  return (
    <div style={{ padding: 12 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: accent, marginBottom: 10 }}>🏨 Modelo Kano</div>
      <div style={{ fontSize: 12, color: "#666", marginBottom: 10, lineHeight: 1.4 }}>Clasificá las features de Setlist:</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
        {cats.map(cat => (
          <div key={cat.id} onClick={() => place(cat.id)} style={{ padding: 10, borderRadius: 10, background: cat.bg, border: `2px dashed ${sel !== null ? cat.bc : cat.bc + "30"}`, cursor: sel !== null ? "pointer" : "default" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: cat.bc }}>{cat.l}</div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 4 }}>
              {Object.entries(placed).filter(([_, c]) => c === cat.id).map(([id]) => {
                const item = KANO_ITEMS.find(i => i.id === id)
                return <span key={id} style={{ fontSize: 12, padding: "3px 9px", borderRadius: 5, background: "#fff", color: "#333" }}>{item?.text}</span>
              })}
            </div>
          </div>
        ))}
      </div>
      {!mechanicDone && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
          {unplaced.map(item => <button key={item.id} onClick={() => setSel(sel === item.id ? null : item.id)} style={{ fontSize: 12, padding: "6px 11px", borderRadius: 8, border: `2px solid ${sel === item.id ? accent : "#ddd"}`, background: sel === item.id ? "#fef9c3" : "#fff", color: "#333", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>{item.text}</button>)}
        </div>
      )}
      {!mechanicDone && unplaced.length === 0 && (
        <button onClick={finishMechanic} style={{ padding: "8px 22px", borderRadius: 8, border: "none", background: accent, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Guardar</button>
      )}
      {mechanicDone && (
        <ExplainStep
          accent={accent}
          prompt="Gian pregunta: '¿Cómo decidís qué es Basic, Performance o Delighter? ¿Y por qué importa para priorizar?'"
          onSubmit={explanation => onComplete({ placed, explanation })}
        />
      )}
    </div>
  )
}

// ═══════════════════ 6. MOSCOW TOOL ═══════════════════
function MoscowTool({ onComplete }) {
  const items = PBIS.slice(0, 8)
  const [placed, setPlaced] = useState({})
  const [sel, setSel] = useState(null)
  const [mechanicDone, setMechanicDone] = useState(false)
  const accent = "#e74c3c"

  function place(cat) { if (sel === null) return; setPlaced(p => ({ ...p, [sel]: cat })); setSel(null) }
  function finishMechanic() { setMechanicDone(true) }
  const categories = [
    { c: "must", l: "🔴 MUST (sin esto no sale)", cl: "#dc2626" },
    { c: "should", l: "🟠 SHOULD (importante)", cl: "#ea580c" },
    { c: "could", l: "🔵 COULD (si hay tiempo)", cl: "#2563eb" },
    { c: "wont", l: "⚪ WON'T (este sprint no)", cl: "#6b7280" },
  ]
  const unplaced = items.filter(p => !placed[p.id])
  const totalPts = Object.entries(placed).filter(([_, c]) => c !== "wont").reduce((s, [id]) => s + (items.find(i => i.id === id)?.pts || 0), 0)

  return (
    <div style={{ padding: 12, minWidth: 500, maxWidth: 580 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: accent, marginBottom: 6 }}>🎯 MoSCoW</div>
      <div style={{ fontSize: 12, color: "#666", marginBottom: 10, lineHeight: 1.4 }}>Priorizá los 8 PBIs principales. Velocity proyectada: <strong>~30 pts</strong>. Lo que entra en Must + Should + Could debe ser realista.</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
        {categories.map(cat => {
          const catItems = Object.entries(placed).filter(([_, c]) => c === cat.c)
          const pts = catItems.reduce((s, [id]) => s + (items.find(i => i.id === id)?.pts || 0), 0)
          return (
            <div key={cat.c} onClick={() => place(cat.c)} style={{ padding: 10, borderRadius: 10, background: `${cat.cl}08`, border: `2px dashed ${sel ? cat.cl : cat.cl + "25"}`, cursor: sel ? "pointer" : "default", minHeight: 80 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 12, fontWeight: 800, color: cat.cl }}>{cat.l}</span>{pts > 0 && <span style={{ fontSize: 12, color: cat.cl, fontWeight: 700 }}>{pts}p</span>}</div>
              {catItems.map(([id]) => { const p = items.find(i => i.id === id); return <div key={id} style={{ fontSize: 11, padding: "3px 7px", marginTop: 3, borderRadius: 5, background: "#fff", color: "#333" }}>{p?.title} ({p?.pts}p)</div> })}
            </div>
          )
        })}
      </div>

      <div style={{ fontSize: 11, color: totalPts > 35 ? "#dc2626" : totalPts > 30 ? "#ea580c" : "#475569", textAlign: "center", marginBottom: 8, fontWeight: 700 }}>
        Comprometido (no-Won't): <strong>{totalPts} pts</strong> {totalPts > 35 ? "(⚠️ excede velocity)" : totalPts > 30 ? "(en el límite)" : ""}
      </div>

      {!mechanicDone && (
        <>
          <div style={{ fontSize: 10, color: "#888", marginBottom: 6, fontWeight: 600 }}>📋 Backlog disponible (click para seleccionar):</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 10 }}>
            {unplaced.map(p => (
              <button
                key={p.id}
                onClick={() => setSel(sel === p.id ? null : p.id)}
                style={{ fontSize: 12, padding: "8px 11px", borderRadius: 7, border: `2px solid ${sel === p.id ? accent : "#ddd"}`, background: sel === p.id ? "#fef2f2" : "#fff", color: "#333", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: "#0f172a" }}>{p.id}: {p.title}</div>
                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 2, lineHeight: 1.3 }}>{p.desc}</div>
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: accent, background: "#fef2f2", padding: "2px 8px", borderRadius: 4, marginLeft: 6 }}>{p.pts}p</div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {!mechanicDone && unplaced.length === 0 && (
        <button onClick={finishMechanic} style={{ padding: "8px 22px", borderRadius: 8, border: "none", background: accent, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Guardar priorización</button>
      )}
      {mechanicDone && (
        <ExplainStep
          accent={accent}
          prompt={`Gabriela pregunta: '¿Qué criterios usaste para decidir qué es Must vs Should? Tu propuesta tiene ${totalPts} pts comprometidos. ¿Cómo defendés esta priorización ante Simon (Lollapalooza)?'`}
          onSubmit={explanation => onComplete({ placed, totalPts, explanation })}
        />
      )}
    </div>
  )
}

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
  // ─── Tool explanations: lo que el SM escribe después de usar cada herramienta ───
  const [toolExplanations, setToolExplanations] = useState({})
  // ─── Team agreements (Parte 1 del Día 1) ───
  // state: { topicId: [{text, source: "sm"|<memberId>}, ...] }
  const [teamAgreements, setTeamAgreements] = useState({})
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

  // ─── Tool completion: guarda mecánica + explicación, reacción genérica del equipo ───
  function onToolComplete(toolId, data) {
    setToolExplanations(p => ({ ...p, [toolId]: { ...data, finishedAt: Date.now() } }))
    // Equipo reacciona genéricamente — sin revelar si fue correcto o no
    const reactions = [
      { from: "nacho", text: "Gracias por explicarlo así.", mood: "🙂" },
      { from: "gabriela", text: "Entiendo, sigamos con la sesión.", mood: "🤝" },
      { from: "alan", text: "Tomo nota.", mood: "🤔" },
      { from: "gian", text: "Ok, claro.", mood: "🙂" },
    ]
    const reaction = reactions[Math.floor(Math.random() * reactions.length)]
    setChat(p => [...p, { from: reaction.from, text: reaction.text }])
    bubble(reaction.from, reaction.text, 5000)
    setMood(reaction.from, reaction.mood)
    // Remove the tool from the board after a short delay
    setTimeout(() => {
      setBoardItems(p => p.filter(item => !(item.type === "challenge" && item.toolId === toolId)))
    }, 1500)
    setActionCount(c => c + 1)
  }

  function onDockStart(item, e) {
    if (item.type === "divider") return
    if (item.type === "action") {
      if (item.id === "poker_start" && !pokerActive && Object.keys(estimated).length < 4) startPoker()
      return
    }
    // No volver a abrir si ya se completó
    if (toolExplanations[item.id]) return
    // No drag, abrir el tool directo en el board en posición centrada
    setDragging(item)
    setDragPos({ x: e.clientX, y: e.clientY })
  }

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
    // Construir el contexto de team agreements para el prompt
    // Cada categoría tiene un array de acuerdos. La AI los usa para
    // evaluar si el SM hace cumplir lo que él mismo facilitó.
    const hasAgreements = TEAM_AGREEMENT_TOPICS.some(t => (teamAgreements[t.id] || []).length > 0)
    const agreementsContext = hasAgreements
      ? "\n\n═══ TEAM AGREEMENTS (acordados al inicio del Día 1) ═══\n" +
        TEAM_AGREEMENT_TOPICS.filter(t => (teamAgreements[t.id] || []).length > 0).map(t => {
          const lines = teamAgreements[t.id].map(a => {
            const sourceTag = a.source === "sm" ? "[propuesta del SM]" : `[propuesto por ${MEMBER_MAP[a.source]?.name || a.source}, aceptado por el SM]`
            return `   - "${a.text}" ${sourceTag}`
          }).join("\n")
          return `• ${t.title}:\n${lines}`
        }).join("\n") +
        "\n\nEvaluá si el SM hace cumplir estos acuerdos durante el Planning. Si los acordó pero NO los hace respetar (ej: acordó 'story points' pero deja que Nacho hable en días sin coachearlo), bajá puntaje en facilitation y bias_coaching. Si NO acordó algo (categoría vacía), eso también es info — el equipo no tiene guía en ese aspecto."
      : ""

    const sessionState = { pokerActive, pokerIdx, revealed }
    const sys = buildEstimationFacilitationPrompt(TEAM_DESC, sessionState, actionForPrompt, chatContext, candidateContext + agreementsContext)
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

      // ─── Tool explanations: lo más importante en C04 — el SM explicó cada herramienta ───
      const TOOL_LABELS = {
        poker5: "5 pasos de Planning Poker",
        fib: "Secuencia Fibonacci",
        relabs: "Estimación Relativa vs Absoluta",
        tshirt: "T-shirt sizing + facilitación de desacuerdo",
        kano: "Modelo Kano",
        moscow: "Priorización MoSCoW",
      }
      const toolExplanationsLog = Object.entries(toolExplanations)
        .map(([toolId, data]) =>
          `[${TOOL_LABELS[toolId] || toolId}]\nExplicación del SM: "${data.explanation}"`
        ).join("\n\n")

      const fullActionsLog = [
        actionsLog,
        toolExplanationsLog
          ? `\n═══ HERRAMIENTAS USADAS Y EXPLICACIONES DEL SM ═══\n${toolExplanationsLog}\n\nEVALUAR PROCESS_MASTERY y BIAS_COACHING contra estas explicaciones. ¿Entiende el SM las herramientas? ¿Las sabría enseñar? ¿Conexión con sesgos relevantes?`
          : ""
      ].filter(Boolean).join("\n")

      const prompt = buildInsightExtractorPrompt(
        "Estimación & Priorización (C04)",
        conversationLog,
        thisChallengeCoachLog,
        fullActionsLog
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
  const currentStep = phase === "context" ? 1 : phase === "agreements" ? 2 : phase === "play" ? 3 : 4
  const totalSteps = 4

  // ═══════════════════ CONTEXT ═══════════════════
  if (phase === "context") return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.text, fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif" }}>
      <TopBar
        currentStep={currentStep}
        totalSteps={totalSteps}
        backButton={{ label: "← Volver a challenges", onClick: () => nav("/challenges") }}
      />
      <div style={{ maxWidth: 920, margin: "0 auto", padding: "34px 22px" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: 3, color: T.teal }}>SMATCH · CHALLENGE 04</div>
          <div style={{ fontSize: 31, fontWeight: 800, marginTop: 8 }}>Estimación & Priorización</div>
          <div style={{ fontSize: 15, color: T.dim, marginTop: 3 }}>Equipo Setlist · Sprint 1 · Whiteboard Session</div>
        </div>

        {/* SITUACIÓN */}
        <div style={{ background: T.panel, borderRadius: 14, padding: 22, marginBottom: 16, border: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: T.orange, marginBottom: 10 }}>📋 SITUACIÓN</div>
          <div style={{ fontSize: 15, color: T.sub, lineHeight: 1.6 }}>
            Primer Planning del equipo Setlist. <strong style={{ color: T.text }}>Nunca estimaron ni priorizaron juntos</strong> — seniorities mixtas, criterios distintos. Sos el SM de la sesión. Tu rol: <strong style={{ color: T.teal }}>enseñar frameworks (Planning Poker, Kano, MoSCoW) y facilitar la conversación</strong>, sin imponer decisiones.
          </div>
        </div>

        {/* PRODUCTO + SPRINT GOAL */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
          <div style={{ background: T.panel, borderRadius: 12, padding: 18, border: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#60a5fa", marginBottom: 8 }}>🎸 EL PRODUCTO</div>
            <div style={{ fontSize: 14, color: T.text, fontWeight: 700, marginBottom: 4 }}>Setlist</div>
            <div style={{ fontSize: 13, color: T.sub, lineHeight: 1.5 }}>App mobile que conecta <strong>artistas independientes</strong> con <strong>venues</strong> en Latinoamérica. Permite gestionar shows de principio a fin: contacto inicial → contrato digital → pago.</div>
          </div>
          <div style={{ background: T.panel, borderRadius: 12, padding: 18, border: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#f59e0b", marginBottom: 8 }}>🎯 SPRINT GOAL</div>
            <div style={{ fontSize: 14, color: T.text, fontWeight: 700, marginBottom: 4 }}>MVP funcional para Lollapalooza</div>
            <div style={{ fontSize: 13, color: T.sub, lineHeight: 1.5 }}>Simon (organizador) confirmó <strong>60 artistas</strong> usando Setlist en vivo durante el festival, en <strong>6 semanas</strong>. Hay que llegar con flujo end-to-end.</div>
          </div>
        </div>

        {/* MÉTRICAS DEL SPRINT */}
        <div style={{ background: T.panel, borderRadius: 12, padding: 18, marginBottom: 16, border: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#a78bfa", marginBottom: 10 }}>📊 DATOS DEL SPRINT</div>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            <div><span style={{ fontSize: 11, color: T.dim }}>Duración</span><br /><span style={{ fontSize: 16, fontWeight: 800, color: T.text }}>2 semanas</span></div>
            <div><span style={{ fontSize: 11, color: T.dim }}>Velocity proyectada</span><br /><span style={{ fontSize: 16, fontWeight: 800, color: T.teal }}>~30 pts</span></div>
            <div><span style={{ fontSize: 11, color: T.dim }}>Backlog</span><br /><span style={{ fontSize: 16, fontWeight: 800, color: T.text }}>12 historias</span></div>
            <div><span style={{ fontSize: 11, color: T.dim }}>Stakeholders</span><br /><span style={{ fontSize: 13, color: T.sub }}>Gabriela (PO), Simon (Lollapalooza)</span></div>
          </div>
        </div>

        {/* BACKLOG */}
        <div style={{ background: T.panel, borderRadius: 12, padding: 18, marginBottom: 16, border: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#34d399", marginBottom: 10 }}>📋 PRODUCT BACKLOG (12 PBIs)</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {PBIS.map(p => (
              <div key={p.id} style={{ padding: 10, borderRadius: 8, background: T.bg, border: `1px solid ${T.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: T.teal }}>{p.id}</span>
                  <span style={{ fontSize: 11, color: T.dim, background: T.panel, padding: "2px 8px", borderRadius: 8 }}>{p.pts} pts</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginTop: 2 }}>{p.title}</div>
                <div style={{ fontSize: 12, color: T.sub, marginTop: 3, lineHeight: 1.4 }}>{p.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* EQUIPO */}
        <div style={{ marginBottom: 16 }}>
          <TeamPanel title="Equipo Setlist" showStakeholder={false} />
        </div>

        {/* DISCLAIMER de evaluación */}
        <div style={{ background: "rgba(0,212,170,0.05)", borderLeft: "3px solid #00d4aa", borderRadius: 8, padding: 14, marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: T.text, lineHeight: 1.5 }}>
            💡 <strong>Cómo te evaluamos</strong>: tenés un whiteboard con herramientas (Planning Poker, Kano, MoSCoW, etc.). Cada una mide si <strong>sabés usarlas y explicarlas</strong> al equipo. No hay respuesta única correcta — se evalúa tu razonamiento y tu capacidad de coaching.
          </div>
        </div>

        <button onClick={() => setPhase("agreements")} style={{ width: "100%", padding: "18px 0", background: "linear-gradient(135deg, #00d4aa, #059669)", color: "#fff", fontWeight: 900, fontSize: 18, border: "none", borderRadius: 12, cursor: "pointer", letterSpacing: 1 }}>EMPEZAR CON TEAM AGREEMENTS →</button>
      </div>
    </div>
  )

  // ═══════════════════ PHASE: TEAM AGREEMENTS (Parte 1 del Día 1) ═══════════════════
  if (phase === "agreements") {
    const topicsWithAgreements = TEAM_AGREEMENT_TOPICS.filter(t => (teamAgreements[t.id] || []).length > 0)
    const allDone = topicsWithAgreements.length === TEAM_AGREEMENT_TOPICS.length
    const totalAgreements = TEAM_AGREEMENT_TOPICS.reduce((s, t) => s + (teamAgreements[t.id] || []).length, 0)

    function addAgreement(topicId, text, source) {
      setTeamAgreements(prev => ({
        ...prev,
        [topicId]: [...(prev[topicId] || []), { text, source, addedAt: Date.now() }]
      }))
      // Si la sugerencia vino de un miembro, reacción del miembro
      if (source !== "sm" && MEMBER_MAP[source]) {
        const m = MEMBER_MAP[source]
        const msg = `Gracias, lo tomamos.`
        setChat(p => [...p, { from: source, text: msg }])
        bubble(source, msg, 4000)
      }
    }

    function removeAgreement(topicId, index) {
      setTeamAgreements(prev => ({
        ...prev,
        [topicId]: (prev[topicId] || []).filter((_, i) => i !== index)
      }))
    }

    return (
      <div style={{ background: T.bg, minHeight: "100vh", color: T.text, fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif" }}>
        <TopBar
          title="Día 1 · Kickoff del equipo"
          subtitle={`Parte 1/2 · Team Agreements Board (${topicsWithAgreements.length}/${TEAM_AGREEMENT_TOPICS.length} categorías · ${totalAgreements} acuerdos)`}
          currentStep={currentStep}
          totalSteps={totalSteps}
        />
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "24px 22px" }}>
          {/* Intro */}
          <div style={{ background: "linear-gradient(135deg, rgba(0,212,170,0.06), rgba(96,165,250,0.04))", borderLeft: "4px solid #00d4aa", borderRadius: 10, padding: 16, marginBottom: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: 2, color: "#00d4aa", marginBottom: 4 }}>🤝 PARTE 1 — WORKSHOP DE TEAM AGREEMENTS</div>
            <div style={{ fontSize: 14, color: T.text, lineHeight: 1.55, fontWeight: 600 }}>
              Facilitá un mini-workshop para definir <strong>3 categorías</strong> de acuerdos básicos. El equipo trajo propuestas — tomá las que te parezcan o agregá las tuyas.
            </div>
            <div style={{ fontSize: 12, color: T.sub, marginTop: 6, lineHeight: 1.5 }}>
              📌 Click en sugerencias del equipo para "tomarlas" como acuerdo · botón <strong>+ Agregar mi acuerdo</strong> para texto libre · todo lo que decidas se evalúa en el Planning después.
            </div>
          </div>

          {/* Workshop Board — 3 columnas en desktop, stack en mobile */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(330px, 1fr))", gap: 14, marginBottom: 20 }}>
            {TEAM_AGREEMENT_TOPICS.map(topic => {
              const agreements = teamAgreements[topic.id] || []
              const usedSuggestionTexts = new Set(agreements.filter(a => a.source !== "sm").map(a => a.text))
              const availableSuggestions = topic.teamSuggestions.filter(s => !usedSuggestionTexts.has(s.text))

              return (
                <div key={topic.id} style={{
                  background: T.panel,
                  border: `1.5px solid ${agreements.length > 0 ? "rgba(0,212,170,0.30)" : T.border}`,
                  borderRadius: 14,
                  padding: 16,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  minHeight: 460,
                }}>
                  {/* Header */}
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <div style={{ fontSize: 22 }}>{topic.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 800, color: T.text, lineHeight: 1.2 }}>{topic.title}</div>
                      </div>
                      {agreements.length > 0 && (
                        <span style={{ fontSize: 11, fontWeight: 900, color: "#059669", background: "rgba(0,212,170,0.10)", padding: "3px 8px", borderRadius: 6 }}>{agreements.length}</span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: T.sub, lineHeight: 1.4 }}>{topic.question}</div>
                  </div>

                  {/* Tension chip */}
                  <div style={{ fontSize: 11, color: "#92400e", padding: 8, background: "rgba(245,158,11,0.08)", borderLeft: "3px solid rgba(245,158,11,0.5)", borderRadius: 4, lineHeight: 1.45 }}>
                    <strong>⚠️ Tensión:</strong> {topic.tension}
                  </div>

                  {/* AGREEMENTS BOARD (post-its agregados) */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: "#059669", letterSpacing: 1, marginBottom: 6, textTransform: "uppercase" }}>
                      ACUERDOS DEL EQUIPO ({agreements.length})
                    </div>
                    {agreements.length === 0 && (
                      <div style={{ fontSize: 12, color: T.dim, padding: "10px 8px", textAlign: "center", border: "1.5px dashed rgba(15,23,42,0.10)", borderRadius: 8, fontStyle: "italic" }}>
                        Agregá al menos 1 acuerdo para continuar
                      </div>
                    )}
                    {agreements.map((a, i) => {
                      const sourceMember = a.source !== "sm" ? MEMBER_MAP[a.source] : null
                      return (
                        <div key={i} style={{
                          background: a.source === "sm" ? "#fef9c3" : "#dbeafe",
                          borderRadius: 8,
                          padding: "8px 10px",
                          marginBottom: 6,
                          position: "relative",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
                          border: a.source === "sm" ? "1px solid rgba(202,138,4,0.25)" : "1px solid rgba(37,99,235,0.20)",
                        }}>
                          <div style={{ fontSize: 9, fontWeight: 800, color: a.source === "sm" ? "#92400e" : "#1e40af", letterSpacing: 0.5, marginBottom: 3, textTransform: "uppercase" }}>
                            {a.source === "sm" ? "📝 Tu propuesta" : `💡 ${sourceMember?.name}`}
                          </div>
                          <div style={{ fontSize: 12, color: "#0f172a", lineHeight: 1.4 }}>{a.text}</div>
                          <button
                            onClick={() => removeAgreement(topic.id, i)}
                            style={{ position: "absolute", top: 4, right: 6, background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 14, padding: 2 }}
                            title="Quitar"
                          >×</button>
                        </div>
                      )
                    })}

                    {/* SM custom input */}
                    <SMAgreementInput topicId={topic.id} onAdd={(text) => addAgreement(topic.id, text, "sm")} />
                  </div>

                  {/* TEAM SUGGESTIONS (chips clickeables) */}
                  {availableSuggestions.length > 0 && (
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 800, color: "#7c3aed", letterSpacing: 1, marginBottom: 6, textTransform: "uppercase" }}>
                        💡 SUGERENCIAS DEL EQUIPO
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                        {availableSuggestions.map((s, i) => {
                          const m = MEMBER_MAP[s.from]
                          return (
                            <button
                              key={i}
                              onClick={() => addAgreement(topic.id, s.text, s.from)}
                              style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 8,
                                padding: "7px 9px",
                                borderRadius: 7,
                                border: `1px solid ${m?.color || "#ddd"}30`,
                                background: "#ffffff",
                                cursor: "pointer",
                                textAlign: "left",
                                fontFamily: "inherit",
                                transition: "all 0.15s",
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = `${m?.color || "#ddd"}10`; e.currentTarget.style.borderColor = `${m?.color || "#ddd"}80` }}
                              onMouseLeave={e => { e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.borderColor = `${m?.color || "#ddd"}30` }}
                            >
                              <span style={{ fontSize: 10, fontWeight: 800, color: m?.color, flexShrink: 0, marginTop: 1 }}>{m?.name.split(" ")[0]}:</span>
                              <span style={{ fontSize: 12, color: "#334155", lineHeight: 1.35 }}>"{s.text}"</span>
                              <span style={{ fontSize: 14, color: m?.color, fontWeight: 700, marginLeft: "auto" }}>+</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* CTA al Planning */}
          {allDone ? (
            <button
              onClick={() => {
                setPhase("play")
                setTimeout(() => { setChat(p => [...p, { from: "nacho", text: "Ya está. ¿Arrancamos con el Planning?" }]); bubble("nacho", "Ya está. ¿Arrancamos con el Planning?") }, 1500)
                setTimeout(() => { setChat(p => [...p, { from: "gabriela", text: "Tengo el backlog listo, son 12 historias. Velocity proyectada ~30 pts." }]); bubble("gabriela", "Tengo el backlog listo, son 12 historias. Velocity proyectada ~30 pts.") }, 4500)
              }}
              style={{ width: "100%", padding: "16px 0", marginTop: 4, background: "linear-gradient(135deg, #00d4aa, #059669)", color: "#fff", fontWeight: 900, fontSize: 16, border: "none", borderRadius: 12, cursor: "pointer", letterSpacing: 1 }}
            >
              ABRIR WHITEBOARD — PARTE 2 (PLANNING) →
            </button>
          ) : (
            <div style={{ textAlign: "center", fontSize: 13, color: T.dim, padding: 12, background: "rgba(15,23,42,0.03)", borderRadius: 8 }}>
              Necesitás al menos 1 acuerdo por categoría para continuar al Planning ({topicsWithAgreements.length}/{TEAM_AGREEMENT_TOPICS.length}).
            </div>
          )}
        </div>
      </div>
    )
  }

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

          <div style={{ flex: 1, overflowY: "auto", padding: "10px 8px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.dim, letterSpacing: 2, marginBottom: 6, textAlign: "center" }}>🧰 HERRAMIENTAS</div>
            {DOCK_ITEMS.map(item => {
              if (item.type === "divider") return <div key={item.id} style={{ height: 1, background: T.border, margin: "6px 0" }} />
              const done = item.type === "challenge" && toolExplanations[item.id]
              const isPokerDisabled = item.id === "poker_start" && (pokerActive || Object.keys(estimated).length >= 4)
              return (
                <div
                  key={item.id}
                  onMouseDown={e => done || isPokerDisabled ? null : onDockStart(item, e)}
                  style={{
                    padding: "8px 10px",
                    marginBottom: 4,
                    borderRadius: 8,
                    cursor: done || isPokerDisabled ? "default" : (item.type === "action" ? "pointer" : "grab"),
                    background: done ? T.tealDim : T.panel,
                    border: `1px solid ${done ? T.teal + "40" : T.border}`,
                    opacity: done ? 0.5 : 1,
                    transition: "all 0.15s",
                  }}
                  onClick={item.type === "action" && !isPokerDisabled ? () => onDockStart(item, { clientX: 0, clientY: 0 }) : undefined}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, color: done ? T.teal : T.text }}>
                    {item.label}{done && " ✓"}
                  </div>
                  <div style={{ fontSize: 10, color: T.dim }}>{item.desc}</div>
                </div>
              )
            })}
          </div>

          <div style={{ padding: 8, borderTop: `1px solid ${T.border}` }}>
            {(actionCount >= 4 || Object.keys(estimated).length >= 2 || Object.keys(toolExplanations).length >= 3) && (
              <button
                onClick={finishChallenge}
                disabled={loading}
                style={{ width: "100%", padding: "12px 12px", borderRadius: 8, background: "linear-gradient(135deg, #00d4aa, #059669)", color: "#ffffff", border: "none", fontWeight: 800, fontSize: 13, cursor: loading ? "wait" : "pointer", textAlign: "center", opacity: loading ? 0.6 : 1 }}
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
            <div key={item.id} onMouseDown={e => item.type !== "challenge" && onItemDrag(item.id, e)} style={{ position: "absolute", left: item.x, top: item.y, cursor: item.type === "challenge" ? "default" : "grab", zIndex: 20, transform: "translate(-50%,-50%)" }}>
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
              {item.type === "challenge" && (
                <div style={{ background: "#fff", borderRadius: 16, boxShadow: "3px 6px 28px rgba(0,0,0,0.15)", border: "1px solid #e8e8e8", overflow: "hidden", position: "relative" }}>
                  <button onClick={e => { e.stopPropagation(); removeItem(item.id) }} style={{ position: "absolute", top: 6, right: 8, background: "none", border: "none", color: "#bbb", cursor: "pointer", fontSize: 17, zIndex: 5 }}>✕</button>
                  {item.toolId === "poker5" && <PokerStepsTool onComplete={data => onToolComplete("poker5", data)} />}
                  {item.toolId === "fib" && <FibonacciTool onComplete={data => onToolComplete("fib", data)} />}
                  {item.toolId === "relabs" && <RelAbsTool onComplete={data => onToolComplete("relabs", data)} />}
                  {item.toolId === "kano" && <KanoTool onComplete={data => onToolComplete("kano", data)} />}
                  {item.toolId === "moscow" && <MoscowTool onComplete={data => onToolComplete("moscow", data)} />}
                  {item.toolId === "tshirt" && <TshirtTool onComplete={data => onToolComplete("tshirt", data)} />}
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

