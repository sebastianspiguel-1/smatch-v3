import { useState, useRef, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { T } from "../theme"
import { computeScores, getGrade } from "../engine/ai"
import { saveResult } from "../engine/supabase"
import { Avatar, TopBar } from "../components"
import ChallengeComplete from "../components/ChallengeComplete"
import TeamPanel from "../components/TeamPanel"
import { markChallengeComplete, isLastChallenge } from "../utils/progressTracker"
import {
  TEAM, MEMBER_MAP, PBIS, FIBONACCI, TSHIRTS,
  POKER_VOTES, EVENTS, TEAM_QUESTIONS, ACHIEVEMENTS,
  DOCK_ITEMS, MOSCOW_MUSTS, CHAT_RESPONSES, DIMENSIONS,
} from "../data/challenge04"

// ═══════════════════ INTERACTIVE TOOL COMPONENTS ═══════════════════

function PokerStepsTool({ onComplete, onReaction }) {
  const hints = ["El PO _______ el PBI al equipo", "El equipo _______ dudas", "Cada uno _______ su carta individualmente", "Se _______ todas las cartas al mismo tiempo", "Los _______ explican por qué votaron distinto"]
  const [answers, setAnswers] = useState(["", "", "", "", ""])
  const [checked, setChecked] = useState(false)
  const [results, setResults] = useState([])
  function check() {
    const r = answers.map((a, i) => {
      const l = a.toLowerCase().trim()
      if (i === 0 && (l.includes("presenta") || l.includes("muestra") || l.includes("explica") || l.includes("lee"))) return true
      if (i === 1 && (l.includes("clarific") || l.includes("pregunt") || l.includes("debate") || l.includes("duda") || l.includes("discute"))) return true
      if (i === 2 && (l.includes("vota") || l.includes("elige") || l.includes("seleccion") || l.includes("pone"))) return true
      if (i === 3 && (l.includes("revel") || l.includes("muestra") || l.includes("da vuelta") || l.includes("destapa"))) return true
      if (i === 4 && (l.includes("extrem") || l.includes("mayor") || l.includes("diferencia") || l.includes("explican") || l.includes("distinto"))) return true
      return false
    })
    setResults(r); setChecked(true)
    const c = r.filter(Boolean).length
    if (c >= 4) { onReaction("gianfranco", "Ahora entendí los pasos! Tiene sentido.", "💡"); onReaction("gaby", "Bien explicado.", "🤝") }
    else if (c >= 2) onReaction("gaby", "Mmm, te faltaron algunos pasos...", "🤨")
    else { onReaction("gaby", "Eso no es correcto.", "😤"); onReaction("gianfranco", "Estoy más confundido.", "🤔") }
    onComplete(c >= 4 ? "expert" : "ok", c * 10)
  }
  return (
    <div style={{ padding: 12 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#e84393", marginBottom: 10 }}>Si tuvieras que explicar Planning Poker en 5 pasos:</div>
      {hints.map((h, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: checked ? (results[i] ? "#d5f5e3" : "#fadbd8") : "#f8f8f8", border: `2px solid ${checked ? (results[i] ? "#27ae60" : "#e74c3c") : "#e0e0e0"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: checked ? (results[i] ? "#27ae60" : "#e74c3c") : "#aaa", flexShrink: 0 }}>
            {checked ? (results[i] ? "✓" : "✗") : i + 1}
          </div>
          <div style={{ flex: 1, fontSize: 15, color: "#555", lineHeight: 1.5 }}>
            {h.split("_______")[0]}
            <input disabled={checked} value={answers[i]} onChange={e => { const n = [...answers]; n[i] = e.target.value; setAnswers(n) }}
              style={{ width: 140, padding: "6px 10px", margin: "0 3px", border: `2px solid ${checked ? (results[i] ? "#27ae60" : "#e74c3c") : "#ddd"}`, borderRadius: 6, fontSize: 15, fontFamily: "inherit", outline: "none", background: checked ? (results[i] ? "#eafaf1" : "#fdedec") : "#fff", color: "#333" }} placeholder="..." />
            {h.split("_______")[1]}
          </div>
        </div>
      ))}
      {!checked && <button onClick={check} style={{ marginTop: 6, padding: "10px 28px", borderRadius: 8, border: "none", background: "#e84393", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>Verificar</button>}
    </div>
  )
}

function FibonacciTool({ onComplete, onReaction }) {
  const shuffled = [8, 2, 21, 5, 1, 13, 3]
  const [slots, setSlots] = useState(Array(7).fill(null))
  const [pool, setPool] = useState([...shuffled])
  const [checked, setChecked] = useState(false)
  const [results, setResults] = useState([])
  function place(num) { const i = slots.indexOf(null); if (i === -1) return; setSlots(p => { const n = [...p]; n[i] = num; return n }); setPool(p => p.filter((_, j) => j !== p.indexOf(num))) }
  function remove(idx) { if (checked || slots[idx] === null) return; setPool(p => [...p, slots[idx]]); setSlots(p => { const n = [...p]; n[idx] = null; return n }) }
  function check() { const r = slots.map((v, i) => v === FIBONACCI[i]); setResults(r); setChecked(true); const c = r.filter(Boolean).length; if (c === 7) { onReaction("gianfranco", "1, 2, 3, 5, 8... la suma de los dos anteriores!", "💡"); onComplete("expert", 30) } else { onReaction("gaby", "Esa no es la secuencia correcta.", "🤨"); onComplete("ok", 10) } }
  return (
    <div style={{ padding: 12 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#00b894", marginBottom: 10 }}>Ordená la secuencia Fibonacci de menor a mayor:</div>
      <div style={{ display: "flex", gap: 5, marginBottom: 10 }}>
        {slots.map((v, i) => (
          <div key={i} onClick={() => remove(i)} style={{ width: 50, height: 62, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: checked ? (results[i] ? "#d5f5e3" : "#fadbd8") : (v !== null ? "#e8f8f5" : "#f8f8f8"), border: `2px ${v !== null ? "solid" : "dashed"} ${checked ? (results[i] ? "#27ae60" : "#e74c3c") : (v !== null ? "#00b894" : "#ddd")}`, fontSize: 22, fontWeight: 900, color: checked ? (results[i] ? "#27ae60" : "#e74c3c") : "#00b894", cursor: v && !checked ? "pointer" : "default" }}>{v ?? ""}</div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 8 }}>
        {pool.map((n, i) => <button key={i} onClick={() => place(n)} disabled={checked} style={{ width: 50, height: 50, borderRadius: 8, border: "2px solid #ccc", background: "#fff", fontSize: 20, fontWeight: 800, color: "#333", cursor: "pointer", fontFamily: "inherit" }}>{n}</button>)}
      </div>
      {!checked && slots.every(s => s !== null) && <button onClick={check} style={{ padding: "10px 28px", borderRadius: 8, border: "none", background: "#00b894", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>Verificar</button>}
    </div>
  )
}

function RelAbsTool({ onComplete, onReaction }) {
  const items = [{ t: "Story Points", c: "rel" }, { t: "Horas", c: "abs" }, { t: "Comparación", c: "rel" }, { t: "Días", c: "abs" }, { t: "Equipo decide junto", c: "rel" }, { t: "Varía por persona", c: "abs" }]
  const [placed, setPlaced] = useState({}); const [sel, setSel] = useState(null); const [checked, setChecked] = useState(false)
  function place(side) { if (sel === null) return; setPlaced(p => ({ ...p, [sel]: side })); setSel(null) }
  function check() { setChecked(true); const c = items.filter((it, i) => placed[i] === it.c).length; if (c >= 5) { onReaction("gaby", "Perfecto, esa es la diferencia clave.", "🤝"); onReaction("gianfranco", "Ahora entiendo por qué no estimamos en horas!", "💡"); onComplete("expert", 25) } else { onReaction("gaby", "No está del todo bien.", "🤨"); onComplete("ok", 10) } }
  const unplaced = items.map((_, i) => i).filter(i => placed[i] === undefined)
  return (
    <div style={{ padding: 12 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#0984e3", marginBottom: 10 }}>Clasificá: ¿Relativa o Absoluta?</div>
      <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
        {[{ s: "abs", l: "⏰ Absoluta", bg: "#fdedec", bc: "#e74c3c" }, { s: "rel", l: "📐 Relativa", bg: "#eafaf1", bc: "#27ae60" }].map(side => (
          <div key={side.s} onClick={() => place(side.s)} style={{ flex: 1, minHeight: 98, padding: 14, borderRadius: 12, background: side.bg, border: `2px dashed ${sel !== null ? side.bc : side.bc + "40"}`, cursor: sel !== null ? "pointer" : "default" }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: side.bc, marginBottom: 8 }}>{side.l}</div>
            {Object.entries(placed).filter(([_, s]) => s === side.s).map(([idx]) => { const ok = checked && items[idx].c === side.s; return <div key={idx} style={{ fontSize: 14, padding: "4px 11px", margin: "4px 0", borderRadius: 5, background: checked ? (ok ? "#d5f5e3" : "#fadbd8") : "#fff", color: "#333" }}>{items[idx].t}{checked && (ok ? " ✓" : " ✗")}</div> })}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 8 }}>
        {unplaced.map(i => <button key={i} onClick={() => setSel(sel === i ? null : i)} style={{ fontSize: 14, padding: "7px 14px", borderRadius: 9, border: `2px solid ${sel === i ? "#0984e3" : "#ddd"}`, background: sel === i ? "#ebf5fb" : "#fff", color: "#333", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>{items[i].t}</button>)}
      </div>
      {!checked && unplaced.length === 0 && <button onClick={check} style={{ padding: "10px 28px", borderRadius: 8, border: "none", background: "#0984e3", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>Verificar</button>}
    </div>
  )
}

function KanoTool({ onComplete, onReaction }) {
  const items = [{ t: "Login funciona", c: "basic" }, { t: "Búsqueda rápida", c: "perf" }, { t: "Dark mode", c: "delight" }, { t: "Se puede pagar", c: "basic" }, { t: "Referidos", c: "delight" }, { t: "Filtros avanzados", c: "perf" }]
  const cats = [{ id: "basic", l: "🏨 Basic Needs", bg: "#fdedec", bc: "#e74c3c" }, { id: "perf", l: "📈 Performance", bg: "#ebf5fb", bc: "#0984e3" }, { id: "delight", l: "🍪 Delighters", bg: "#fef9e7", bc: "#f39c12" }]
  const [placed, setPlaced] = useState({}); const [sel, setSel] = useState(null); const [checked, setChecked] = useState(false)
  function place(cat) { if (sel === null) return; setPlaced(p => ({ ...p, [sel]: cat })); setSel(null) }
  function check() { setChecked(true); const c = items.filter((it, i) => placed[i] === it.c).length; if (c >= 5) { onReaction("lucia", "Exacto! Login y pago son basic needs."); onReaction("gianfranco", "Como el baño del hotel, si no hay me voy!", "💡"); onComplete("expert", 30) } else { onReaction("camila", "No está bien clasificado.", "🤨"); onComplete("ok", 10) } }
  const unplaced = items.map((_, i) => i).filter(i => placed[i] === undefined)
  return (
    <div style={{ padding: 12 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#f39c12", marginBottom: 10 }}>Clasificá según el modelo Kano:</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
        {cats.map(cat => (
          <div key={cat.id} onClick={() => place(cat.id)} style={{ padding: 14, borderRadius: 12, background: cat.bg, border: `2px dashed ${sel !== null ? cat.bc : cat.bc + "30"}`, cursor: sel !== null ? "pointer" : "default" }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: cat.bc }}>{cat.l}</div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 6 }}>
              {Object.entries(placed).filter(([_, c]) => c === cat.id).map(([idx]) => { const ok = checked && items[idx].c === cat.id; return <span key={idx} style={{ fontSize: 14, padding: "4px 11px", borderRadius: 5, background: checked ? (ok ? "#d5f5e3" : "#fadbd8") : "#fff", color: "#333" }}>{items[idx].t}{checked && (ok ? " ✓" : " ✗")}</span> })}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 8 }}>
        {unplaced.map(i => <button key={i} onClick={() => setSel(sel === i ? null : i)} style={{ fontSize: 14, padding: "7px 14px", borderRadius: 9, border: `2px solid ${sel === i ? "#f39c12" : "#ddd"}`, background: sel === i ? "#fef9e7" : "#fff", color: "#333", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>{items[i].t}</button>)}
      </div>
      {!checked && unplaced.length === 0 && <button onClick={check} style={{ padding: "10px 28px", borderRadius: 8, border: "none", background: "#f39c12", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>Verificar</button>}
    </div>
  )
}

function MoscowTool({ onComplete, onReaction }) {
  const items = PBIS.slice(0, 8)
  const [placed, setPlaced] = useState({}); const [sel, setSel] = useState(null); const [checked, setChecked] = useState(false)
  function place(cat) { if (sel === null) return; setPlaced(p => ({ ...p, [sel]: cat })); setSel(null) }
  function check() { setChecked(true); const musts = Object.entries(placed).filter(([_, c]) => c === "must").map(([id]) => id); const c = musts.filter(id => MOSCOW_MUSTS.includes(id)).length; const pts = musts.reduce((s, id) => s + (items.find(i => i.id === id)?.pts || 0), 0); if (c >= 3 && pts <= 35) { onReaction("gaby", `Bien, Must suman ${pts}pts. Entra en el sprint.`, "🤝"); onReaction("lucia", "De acuerdo con esa priorización.", "✅"); onComplete("expert", 30) } else { onReaction("lucia", "Login y pago tienen que ser Must sí o sí...", "😤"); onComplete("ok", 10) } }
  const categories = [{ c: "must", l: "🔴 MUST", cl: "#e74c3c" }, { c: "should", l: "🟠 SHOULD", cl: "#e67e22" }, { c: "could", l: "🔵 COULD", cl: "#3498db" }, { c: "wont", l: "⚪ WON'T", cl: "#95a5a6" }]
  const unplaced = items.filter(p => !placed[p.id])
  return (
    <div style={{ padding: 12 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#e74c3c", marginBottom: 10 }}>Priorizá (velocity ~30pts):</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
        {categories.map(cat => { const catItems = Object.entries(placed).filter(([_, c]) => c === cat.c); const pts = catItems.reduce((s, [id]) => s + (items.find(i => i.id === id)?.pts || 0), 0); return (
          <div key={cat.c} onClick={() => place(cat.c)} style={{ padding: 11, borderRadius: 10, background: `${cat.cl}08`, border: `2px dashed ${sel ? cat.cl : cat.cl + "25"}`, cursor: sel ? "pointer" : "default", minHeight: 77 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 15, fontWeight: 800, color: cat.cl }}>{cat.l}</span>{pts > 0 && <span style={{ fontSize: 14, color: cat.cl, fontWeight: 700 }}>{pts}p</span>}</div>
            {catItems.map(([id]) => { const p = items.find(i => i.id === id); return <div key={id} style={{ fontSize: 13, padding: "4px 8px", marginTop: 4, borderRadius: 5, background: "#fff", color: "#333" }}>{p?.title} ({p?.pts}p)</div> })}
          </div>
        ) })}
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
        {unplaced.map(p => <button key={p.id} onClick={() => setSel(sel === p.id ? null : p.id)} style={{ fontSize: 13, padding: "6px 11px", borderRadius: 8, border: `2px solid ${sel === p.id ? "#e74c3c" : "#ddd"}`, background: sel === p.id ? "#fdedec" : "#fff", color: "#333", cursor: "pointer", fontFamily: "inherit" }}>{p.title} ({p.pts}p)</button>)}
      </div>
      {!checked && unplaced.length === 0 && <button onClick={check} style={{ padding: "10px 28px", borderRadius: 8, border: "none", background: "#e74c3c", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>Verificar</button>}
    </div>
  )
}

function TshirtTool({ onComplete, onReaction }) {
  const teamVotes = { gaby: "M", tomas: "L", camila: "L", gianfranco: "XL", marcos: "M" }
  const [step, setStep] = useState(0)
  const [choice, setChoice] = useState(null)
  const [revealed, setRevealed] = useState(false)
  function reveal() { setRevealed(true); setStep(1); setTimeout(() => setStep(2), 1500) }
  function makeChoice(c) {
    setChoice(c); setStep(3)
    if (c === "extremes") { onReaction("gianfranco", "Ah, yo puse XL porque pensé en cuánto me iba a llevar a mí solo.", "🤔"); onReaction("gaby", "Yo dije M porque la lógica la conozco. Pero Camila tiene razón con QA.", "🤝"); setTimeout(() => onReaction("camila", "Bien, ¿L como consenso?", "✅"), 1500); onComplete("expert", 30) }
    else if (c === "revote") { onReaction("gaby", "Pero ni sabemos por qué votamos distinto. ¿No deberían explicar primero?", "😤"); onComplete("ok", 10) }
    else if (c === "average") { onReaction("gaby", "No, no promediamos. Eso no tiene sentido. Hay que discutir.", "😤"); onReaction("camila", "Estoy de acuerdo, promediar no es estimar.", "😤"); onComplete("fail", 0) }
    else if (c === "senior") { onReaction("marcos", "¿Y para qué estimamos entonces si decide uno solo?", "🤨"); onReaction("gianfranco", "Me hacen sentir que mi opinión no vale...", "😤"); onComplete("fail", 0) }
  }
  return (
    <div style={{ padding: 17, minWidth: 420 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#6c5ce7", marginBottom: 8 }}>👕 Simulación: T-Shirt Sizing</div>
      <div style={{ fontSize: 14, color: "#888", marginBottom: 14, lineHeight: 1.4 }}>El equipo estima <strong style={{ color: "#333" }}>VAL-101: Login y registro</strong> con T-Shirt sizes.</div>
      <div style={{ display: "flex", justifyContent: "center", gap: 11, marginBottom: 14 }}>
        {Object.entries(teamVotes).map(([mid, size]) => { const m = MEMBER_MAP[mid]; return (
          <div key={mid} style={{ textAlign: "center" }}>
            <div style={{ width: 67, height: 81, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", background: revealed ? "#fff" : `${m.color}15`, border: `2px solid ${revealed ? m.color : m.color + "40"}`, fontSize: revealed ? 22 : 20, fontWeight: 900, color: revealed ? m.color : m.color + "50", transition: "all 0.5s" }}>{revealed ? size : "👕"}</div>
            <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>{m.name.split(" ")[0]}</div>
          </div>
        ) })}
      </div>
      {step === 0 && <div style={{ textAlign: "center" }}><button onClick={reveal} style={{ padding: "11px 34px", background: "#6c5ce7", color: "#fff", border: "none", borderRadius: 14, fontWeight: 800, fontSize: 17, cursor: "pointer" }}>👕 Revelar Talles</button></div>}
      {step === 1 && <div style={{ textAlign: "center", fontSize: 15, color: "#e67e22", fontWeight: 600, padding: 8 }}>Hay desacuerdo: M, L y XL. ¿Qué hacés?</div>}
      {step === 2 && !choice && (
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#555", marginBottom: 3 }}>¿Cómo facilitás este desacuerdo?</div>
          {[
            { id: "extremes", label: "Pedirle al que puso M y al que puso XL que expliquen su razonamiento", icon: "🎯" },
            { id: "revote", label: "Pedir que voten de nuevo sin discutir", icon: "🔄" },
            { id: "average", label: "Promediar los votos y usar L como estimación", icon: "📊" },
            { id: "senior", label: "Usar la estimación de Gaby porque es la Tech Lead", icon: "👑" },
          ].map(opt => (
            <button key={opt.id} onClick={() => makeChoice(opt.id)}
              style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 17px", borderRadius: 14, border: "2px solid #e0e0e0", background: "#fff", cursor: "pointer", textAlign: "left", fontFamily: "inherit", transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#6c5ce7"; e.currentTarget.style.background = "#f8f6ff" }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#e0e0e0"; e.currentTarget.style.background = "#fff" }}>
              <span style={{ fontSize: 22 }}>{opt.icon}</span>
              <span style={{ fontSize: 14, color: "#333", lineHeight: 1.3 }}>{opt.label}</span>
            </button>
          ))}
        </div>
      )}
      {step === 3 && (
        <div style={{ padding: 11, borderRadius: 11, background: choice === "extremes" ? "#eafaf1" : "#fdedec", border: `1px solid ${choice === "extremes" ? "#27ae60" : "#e74c3c"}40`, marginTop: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: choice === "extremes" ? "#27ae60" : "#e74c3c" }}>
            {choice === "extremes" ? "✅ Correcta! Los extremos explican → el equipo converge." : choice === "revote" ? "⚠️ Regular. Sin discusión el revote repite el mismo resultado." : choice === "average" ? "❌ Promediar no es estimar. Se pierde la discusión." : "❌ Si decide uno solo, no es estimación en equipo."}
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════ SCORE CONVERSION ═══════════════════
function statsToScores(stats) {
  const gr = stats.goodReplies, tc = stats.toolsCompleted, det = stats.detected, est = stats.estimated
  return {
    coaching:     Math.min(4, Math.max(1, gr >= 3 ? 4 : gr >= 2 ? 3 : gr >= 1 ? 2 : 1)),
    maturity:     Math.min(4, Math.max(1, tc >= 5 ? 4 : tc >= 3 ? 3 : tc >= 1 ? 2 : 1)),
    facilitation: Math.min(4, Math.max(1, (det + est) >= 5 ? 4 : (det + est) >= 3 ? 3 : (det + est) >= 1 ? 2 : 1)),
    systems:      Math.min(4, Math.max(1, (tc + gr) >= 6 ? 4 : (tc + gr) >= 4 ? 3 : (tc + gr) >= 2 ? 2 : 1)),
    safety:       Math.min(4, Math.max(1, (det + gr) >= 5 ? 4 : (det + gr) >= 3 ? 3 : (det + gr) >= 1 ? 2 : 1)),
  }
}

// ═══════════════════ MAIN COMPONENT ═══════════════════
export default function Challenge04() {
  const nav = useNavigate()
  const [phase, setPhase] = useState("context")
  const [moods, setMoods] = useState({ gaby: "🤨", tomas: "😐", camila: "😐", gianfranco: "🤔", marcos: "😴", lucia: "😐" })
  const [bubbles, setBubbles] = useState({})
  const [boardItems, setBoardItems] = useState([])
  const [dragging, setDragging] = useState(null)
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 })
  const [completedTools, setCompletedTools] = useState([])
  const [pokerActive, setPokerActive] = useState(false)
  const [pokerIdx, setPokerIdx] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [estimated, setEstimated] = useState({})
  const [popups, setPopups] = useState([])
  const [stats, setStats] = useState({ toolsCompleted: 0, detected: 0, missed: 0, goodReplies: 0, estimated: 0, notes: 0 })
  const [score, setScore] = useState(0)
  const [achievements, setAchievements] = useState([])
  const [newAch, setNewAch] = useState(null)
  const [replyTo, setReplyTo] = useState(null)
  const [chatInput, setChatInput] = useState("")
  const [timer, setTimer] = useState(2400)
  const [wrapUpMode, setWrapUpMode] = useState(false)
  const [wrapUpText, setWrapUpText] = useState("")
  const [wrapUpSent, setWrapUpSent] = useState(false)
  const [firedQuestions, setFiredQuestions] = useState([])
  const boardRef = useRef(null)
  const nextId = useRef(100)
  const startTime = useRef(null)

  useEffect(() => { if (phase === "play") { const t = setInterval(() => setTimer(v => Math.max(0, v - 1)), 1000); startTime.current = Date.now(); return () => clearInterval(t) } }, [phase])
  useEffect(() => { ACHIEVEMENTS.forEach(a => { if (!achievements.includes(a.id) && a.cond(stats)) { setAchievements(p => [...p, a.id]); setNewAch(a); setTimeout(() => setNewAch(null), 3000) } }) }, [stats, achievements])
  useEffect(() => {
    if (phase !== "play") return
    const interval = setInterval(() => {
      const elapsed = Date.now() - (startTime.current || Date.now())
      TEAM_QUESTIONS.forEach(q => {
        if (!firedQuestions.includes(q.id) && elapsed >= q.delay) {
          setFiredQuestions(p => [...p, q.id])
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
  const readyForWrapUp = (completedTools.length >= 3 || Object.keys(estimated).length >= 3) && !wrapUpMode && !wrapUpSent

  function bubble(from, text, dur = 7000) { setBubbles(p => ({ ...p, [from]: text })); setTimeout(() => setBubbles(p => { const n = { ...p }; if (n[from] === text) delete n[from]; return n }), dur) }
  function setMood(id, m) { setMoods(p => ({ ...p, [id]: m })) }
  function toolReaction(from, text, mood) { bubble(from, text, 6000); if (mood) setMood(from, mood) }
  function toolComplete(toolId, q, pts) { setCompletedTools(p => [...p, toolId]); setScore(p => p + pts); setStats(p => ({ ...p, toolsCompleted: p.toolsCompleted + 1 })) }

  function onDockStart(item, e) {
    if (item.type === "divider") return
    if (item.type === "action") { if (item.id === "poker_start") { setPokerActive(true); bubble("lucia", `${PBIS[0].id}: ${PBIS[0].title}`); setScore(p => p + 10) } return }
    if (completedTools.includes(item.id) && item.type === "challenge") return
    setDragging(item); setDragPos({ x: e.clientX, y: e.clientY })
  }
  function onMove(e) { if (dragging) setDragPos({ x: e.clientX, y: e.clientY }) }
  function onUp(e) {
    if (!dragging || !boardRef.current) { setDragging(null); return }
    const r = boardRef.current.getBoundingClientRect(); const x = e.clientX - r.left, y = e.clientY - r.top
    if (x > 0 && y > 0 && x < r.width && y < r.height) {
      setBoardItems(p => [...p, { id: nextId.current++, toolId: dragging.id, type: dragging.type, x, y, text: "" }])
      if (dragging.type === "postit" || dragging.type === "textbox") setStats(p => ({ ...p, notes: p.notes + 1 }))
    }
    setDragging(null)
  }
  function removeItem(id) { setBoardItems(p => p.filter(i => i.id !== id)) }
  function onItemDrag(itemId, e) {
    e.stopPropagation(); const sx = e.clientX, sy = e.clientY, item = boardItems.find(i => i.id === itemId); if (!item) return; const ox = item.x, oy = item.y
    const mv = ev => setBoardItems(p => p.map(i => i.id === itemId ? { ...i, x: ox + ev.clientX - sx, y: oy + ev.clientY - sy } : i))
    const up = () => { window.removeEventListener("mousemove", mv); window.removeEventListener("mouseup", up) }
    window.addEventListener("mousemove", mv); window.addEventListener("mouseup", up)
  }

  function revealCards() {
    setRevealed(true); setScore(p => p + 5)
    EVENTS.filter(e => e.poker === pokerIdx).forEach(e => {
      setTimeout(() => {
        setPopups(p => [...p, e]); bubble(e.from, e.text, 10000)
        setTimeout(() => setPopups(p => { if (p.find(x => x.id === e.id)) { setStats(s => ({ ...s, missed: s.missed + 1 })); return p.filter(x => x.id !== e.id) } return p }), 8000)
      }, e.delay)
    })
  }
  function catchEvent(evtId) { const evt = popups.find(p => p.id === evtId); if (!evt) return; setPopups(p => p.filter(x => x.id !== evtId)); setStats(p => ({ ...p, detected: p.detected + 1 })); setReplyTo(evt.from); setScore(p => p + 30) }
  function confirmPts(pts) {
    setEstimated(p => ({ ...p, [pokerIdx]: pts })); setRevealed(false); setStats(p => ({ ...p, estimated: p.estimated + 1 })); setScore(p => p + 10); setPopups([])
    bubble("camila", `✅ ${PBIS[pokerIdx].id} → ${pts}pts`)
    if (pokerIdx < 3) { setPokerIdx(p => p + 1); setTimeout(() => bubble("lucia", `Siguiente: ${PBIS[pokerIdx + 1].id}: ${PBIS[pokerIdx + 1].title}`), 800) }
    else { setTimeout(() => { bubble("gaby", "Estimación lista. ¿Priorizamos?"); setPokerActive(false) }, 800) }
  }

  function submitChat() {
    if (!chatInput.trim()) return; const txt = chatInput.trim().toLowerCase(), target = replyTo; setChatInput(""); setReplyTo(null); setScore(p => p + 5)
    setTimeout(() => {
      const resp = CHAT_RESPONSES[target]
      if (resp && resp.keywords.some(k => txt.includes(k))) {
        bubble(target, resp.text); if (resp.mood) setMood(target, resp.mood); setScore(p => p + 20); setStats(p => ({ ...p, goodReplies: p.goodReplies + 1 }))
      } else if (target === "gaby" && txt.length > 15) { bubble("gaby", "Ok, tiene sentido."); setMood("gaby", "😐"); setStats(p => ({ ...p, goodReplies: p.goodReplies + 1 })) }
      else if (target) { bubble(target, "Ok...") }
      else if (txt.length > 30) { bubble("tomas", "¿Podés ser más concreto?") }
      else { bubble("camila", "¿Seguimos?") }
    }, 600)
  }

  function submitWrapUp() {
    if (!wrapUpText.trim()) return; const txt = wrapUpText.toLowerCase(); setWrapUpSent(true); setWrapUpMode(false); setScore(p => p + 20)
    const reactions = []; let q = 0
    if (txt.includes("relativ") || txt.includes("story point") || txt.includes("estim")) { reactions.push(["gianfranco", "Me queda más claro lo de los puntos."]); q++ }
    if (txt.includes("poker") || txt.includes("consenso") || txt.includes("juntos")) { reactions.push(["camila", "Me gustó estimar en equipo."]); q++ }
    if (txt.includes("kano") || txt.includes("basic") || txt.includes("prioriz") || txt.includes("moscow") || txt.includes("must")) { reactions.push(["lucia", "Tengo claro qué entra en el sprint."]); q++ }
    if (txt.includes("velocity") || txt.includes("sprint") || txt.includes("30")) { reactions.push(["tomas", "Buen plan para las 2 semanas."]); q++ }
    if (txt.includes("gracias") || txt.includes("equipo") || txt.includes("buen trabajo")) { reactions.push(["marcos", "Estuvo buena la sesión."]); setMood("marcos", "😐"); q++ }
    if (q >= 4) { reactions.push(["gaby", "Buena sesión. Productiva y clara."]); setMood("gaby", "🤝"); setScore(p => p + 30) }
    else if (q >= 2) reactions.push(["gaby", "Fue útil. Podría haber sido más conciso."])
    else reactions.push(["gaby", "Sentí que faltó resumir mejor."])
    reactions.forEach(([from, text], i) => { setTimeout(() => bubble(from, text, 8000), (i + 1) * 1200) })
    setTimeout(() => { markChallengeComplete(4); setPhase("results") }, reactions.length * 1200 + 4000)
  }

  // ─── Scoring for results ───
  const allScores = useMemo(() => [statsToScores(stats)], [stats])
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
        candidateId: "test@test.com",
        challengeId: 4,
        scores: finalScores,
        feedback: [{ phase: "game", scores: statsToScores(stats), feedback: `Score: ${score}, Achievements: ${achievements.length}/${ACHIEVEMENTS.length}` }],
        grade: gradeData,
        timeUsed
      }).then(() => {
        console.log("Challenge 04 result saved to Supabase")
      })
    }
  }, [phase, finalScores, stats, score, achievements, gradeData])

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

  // ═══════════════════ MAIN GAME ═══════════════════
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", fontFamily: "'Segoe UI',system-ui,sans-serif", userSelect: "none" }} onMouseMove={onMove} onMouseUp={onUp}>
      <TopBar
        title="📊 Estimación & Priorización"
        subtitle={`Proyecto Valkyrie · ${completedTools.length}/${DOCK_ITEMS.filter(i => i.type !== "divider").length} herramientas completadas`}
        currentStep={currentStep}
        totalSteps={totalSteps}
        timer={{ display: `${mm}:${ss}`, warning: timer < 300 }}
        score={score}
      />

      {newAch && <div style={{ position: "fixed", top: 84, left: "50%", transform: "translateX(-50%)", zIndex: 999, background: T.panel, border: `3px solid ${T.orange}`, borderRadius: 20, padding: "14px 28px", display: "flex", alignItems: "center", gap: 14, boxShadow: `0 8px 24px rgba(234,88,12,0.20), 0 0 56px rgba(234,88,12,0.15)` }}><span style={{ fontSize: 39 }}>{newAch.icon}</span><div><div style={{ fontSize: 11, fontWeight: 700, color: T.orange, letterSpacing: 2 }}>LOGRO</div><div style={{ fontSize: 18, fontWeight: 800, color: T.text }}>{newAch.label}</div></div></div>}

      {popups.map((evt, idx) => (
        <div key={evt.id} onClick={() => catchEvent(evt.id)} style={{
          position: "fixed", [idx === 0 ? "top" : "bottom"]: idx === 0 ? 70 : 78, left: "50%", transform: "translateX(-50%)", zIndex: 998 - idx,
          background: T.panel, border: "3px solid #e67e22", borderRadius: 22, padding: "20px 28px", display: "flex", alignItems: "center", gap: 20, cursor: "pointer",
          boxShadow: "0 8px 24px rgba(230,126,34,0.20), 0 0 56px rgba(230,126,34,0.15)", maxWidth: 700, minWidth: 532, animation: "popIn 0.3s ease, glow 2s ease infinite",
        }}>
          <Avatar member={MEMBER_MAP[evt.from]} size={56} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#e67e22", letterSpacing: 1, marginBottom: 4 }}>⚠️ {MEMBER_MAP[evt.from]?.name.toUpperCase()} DIJO ALGO SOSPECHOSO</div>
            <div style={{ fontSize: 17, color: T.text, lineHeight: 1.4 }}>"{evt.text}"</div>
          </div>
          <div style={{ padding: "14px 25px", borderRadius: 14, background: "#e67e22", color: "#ffffff", fontWeight: 900, fontSize: 15, flexShrink: 0 }}>🎯 INTERVENIR</div>
        </div>
      ))}

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* LEFT PANEL */}
        <div style={{ width: 238, background: T.bg, borderRight: `1px solid ${T.border}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
          <div style={{ padding: "8px 7px", borderBottom: `1px solid ${T.border}` }}>
            {TEAM.map(m => {
              const bbl = bubbles[m.id]; const isTarget = replyTo === m.id
              return (
                <div key={m.id} style={{ position: "relative", marginBottom: 1 }}>
                  <div onClick={() => setReplyTo(replyTo === m.id ? null : m.id)}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 13, cursor: "pointer", background: isTarget ? `${m.color}18` : "transparent", border: `2px solid ${isTarget ? m.color : "transparent"}`, transition: "all 0.15s" }}>
                    <Avatar member={m} size={42} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: isTarget ? m.color : T.text }}>{m.name.split(" ")[0]}</div>
                      <div style={{ fontSize: 10, color: T.dim }}>{m.role}</div>
                    </div>
                    <span style={{ fontSize: 25, flexShrink: 0 }}>{moods[m.id]}</span>
                  </div>
                  {bbl && (
                    <div style={{ position: "absolute", left: "105%", top: "50%", transform: "translateY(-50%)", padding: "14px 20px", borderRadius: 20, borderTopLeftRadius: 6, background: "#fff", color: "#333", fontSize: 17, lineHeight: 1.5, boxShadow: "0 8px 35px rgba(0,0,0,0.18)", border: `3px solid ${m.color}40`, zIndex: 50, whiteSpace: "nowrap" }}>
                      <div style={{ position: "absolute", left: -10, top: "50%", transform: "translateY(-50%)", width: 0, height: 0, borderTop: "10px solid transparent", borderBottom: "10px solid transparent", borderRight: `10px solid ${m.color}40` }} />
                      <span style={{ fontWeight: 700, color: m.color, fontSize: 14, marginRight: 8 }}>{m.name.split(" ")[0]}:</span><span>{bbl}</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "8px 7px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.dim, letterSpacing: 2, marginBottom: 6, textAlign: "center" }}>🧰 HERRAMIENTAS</div>
            {DOCK_ITEMS.map(item => {
              if (item.type === "divider") return <div key={item.id} style={{ height: 1, background: T.border, margin: "7px 0" }} />
              const done = completedTools.includes(item.id)
              return (
                <div key={item.id} onMouseDown={e => onDockStart(item, e)} style={{ padding: "8px 10px", marginBottom: 3, borderRadius: 11, cursor: done ? "default" : "grab", background: done ? T.tealDim : T.panel, border: `1px solid ${done ? T.teal + "30" : T.border}`, opacity: done ? 0.35 : 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: done ? T.teal : T.text }}>{item.label}{done && " ✓"}</div>
                  <div style={{ fontSize: 11, color: T.dim }}>{item.desc}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* WHITEBOARD */}
        <div ref={boardRef} style={{ flex: 1, position: "relative", overflow: "hidden", background: "#ffffff", backgroundImage: "radial-gradient(circle, rgba(15,23,42,0.04) 1px, transparent 1px)", backgroundSize: "24px 24px" }}>
          {boardItems.map(item => (
            <div key={item.id} onMouseDown={e => onItemDrag(item.id, e)} style={{ position: "absolute", left: item.x, top: item.y, cursor: "grab", zIndex: 20, transform: "translate(-50%,-50%)" }}>
              {item.type === "postit" && (
                <div style={{ width: 210, minHeight: 133, background: T.sY, borderRadius: 4, padding: 17, boxShadow: "4px 6px 20px rgba(0,0,0,0.12)", borderBottom: "4px solid #f0e68c", position: "relative" }}>
                  <button onClick={e => { e.stopPropagation(); removeItem(item.id) }} style={{ position: "absolute", top: 4, right: 7, background: "none", border: "none", color: "#ccc", cursor: "pointer", fontSize: 17 }}>✕</button>
                  <textarea defaultValue={item.text} onBlur={e => setBoardItems(p => p.map(i => i.id === item.id ? { ...i, text: e.target.value } : i))} style={{ width: "100%", height: 98, background: "transparent", border: "none", color: "#555", fontSize: 17, fontFamily: "'Segoe UI',sans-serif", resize: "none", outline: "none", lineHeight: 1.4 }} placeholder="Escribí tu nota..." />
                </div>
              )}
              {item.type === "textbox" && (
                <div style={{ width: 336, minHeight: 98, background: "#fff", borderRadius: 17, padding: 17, boxShadow: "3px 4px 20px rgba(0,0,0,0.1)", border: "1px solid #e0e0e0", position: "relative" }}>
                  <button onClick={e => { e.stopPropagation(); removeItem(item.id) }} style={{ position: "absolute", top: 4, right: 7, background: "none", border: "none", color: "#ccc", cursor: "pointer", fontSize: 17 }}>✕</button>
                  <textarea defaultValue={item.text} onBlur={e => setBoardItems(p => p.map(i => i.id === item.id ? { ...i, text: e.target.value } : i))} style={{ width: "100%", height: 77, background: "transparent", border: "none", color: "#333", fontSize: 17, fontFamily: "'Segoe UI',sans-serif", resize: "none", outline: "none", lineHeight: 1.5 }} placeholder="Escribí lo que quieras explicar..." />
                </div>
              )}
              {item.type === "challenge" && (
                <div style={{ background: "#fff", borderRadius: 20, boxShadow: "3px 6px 28px rgba(0,0,0,0.12)", border: "1px solid #e8e8e8", overflow: "hidden", position: "relative" }}>
                  <button onClick={e => { e.stopPropagation(); removeItem(item.id) }} style={{ position: "absolute", top: 6, right: 8, background: "none", border: "none", color: "#bbb", cursor: "pointer", fontSize: 17, zIndex: 5 }}>✕</button>
                  <div style={{ padding: "8px 17px", background: "#fafafa", borderBottom: "1px solid #f0f0f0" }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: "#555" }}>{DOCK_ITEMS.find(d => d.id === item.toolId)?.label}</span>
                  </div>
                  {item.toolId === "poker5" && <PokerStepsTool onComplete={(q, p) => toolComplete("poker5", q, p)} onReaction={toolReaction} />}
                  {item.toolId === "fib" && <FibonacciTool onComplete={(q, p) => toolComplete("fib", q, p)} onReaction={toolReaction} />}
                  {item.toolId === "relabs" && <RelAbsTool onComplete={(q, p) => toolComplete("relabs", q, p)} onReaction={toolReaction} />}
                  {item.toolId === "kano" && <KanoTool onComplete={(q, p) => toolComplete("kano", q, p)} onReaction={toolReaction} />}
                  {item.toolId === "moscow" && <MoscowTool onComplete={(q, p) => toolComplete("moscow", q, p)} onReaction={toolReaction} />}
                  {item.toolId === "tshirt" && <TshirtTool onComplete={(q, p) => toolComplete("tshirt", q, p)} onReaction={toolReaction} />}
                </div>
              )}
            </div>
          ))}

          {pokerActive && (
            <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", background: "#fff", borderRadius: 22, padding: 25, boxShadow: "0 11px 49px rgba(0,0,0,0.2)", border: `3px solid ${T.teal}40`, zIndex: 25, minWidth: 504 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: T.teal }}>{PBIS[pokerIdx]?.id}: {PBIS[pokerIdx]?.title}</span>
                <span style={{ fontSize: 14, color: "#999", background: "#f0f0f0", padding: "3px 11px", borderRadius: 7 }}>{pokerIdx + 1}/4</span>
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: 14, marginBottom: 14 }}>
                {Object.entries(POKER_VOTES[pokerIdx] || {}).map(([mid, val]) => { const m = MEMBER_MAP[mid]; return (
                  <div key={mid} style={{ textAlign: "center" }}>
                    <div style={{ width: 67, height: 87, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", background: revealed ? "#fff" : m.color + "15", border: `3px solid ${revealed ? m.color : m.color + "35"}`, fontSize: revealed ? 31 : 22, fontWeight: 900, color: revealed ? m.color : m.color + "50", transition: "all 0.5s" }}>{revealed ? val : "?"}</div>
                    <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>{m.name.split(" ")[0]}</div>
                  </div>
                ) })}
              </div>
              {!revealed ? <div style={{ textAlign: "center" }}><button onClick={revealCards} style={{ padding: "13px 39px", background: T.teal, color: "#000", border: "none", borderRadius: 14, fontWeight: 800, fontSize: 18, cursor: "pointer" }}>🃏 REVELAR</button></div> : (
                <div style={{ display: "flex", justifyContent: "center", gap: 7 }}>{FIBONACCI.map(n => <button key={n} onClick={() => confirmPts(n)} style={{ width: 48, height: 48, borderRadius: 10, border: `1px solid ${T.teal}40`, background: "#f8f8f8", color: T.teal, fontWeight: 800, fontSize: 20, cursor: "pointer" }} onMouseEnter={e => { e.target.style.background = T.teal; e.target.style.color = "#fff" }} onMouseLeave={e => { e.target.style.background = "#f8f8f8"; e.target.style.color = T.teal }}>{n}</button>)}</div>
              )}
            </div>
          )}

          {wrapUpMode && (
            <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", background: "#fff", borderRadius: 22, padding: 31, boxShadow: "0 11px 56px rgba(0,0,0,0.25)", border: `3px solid ${T.teal}`, zIndex: 30, width: 616 }}>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 39 }}>📋</div>
                <div style={{ fontSize: 21, fontWeight: 800, color: "#333" }}>Cierre de Sesión</div>
                <div style={{ fontSize: 15, color: "#888", marginTop: 6, lineHeight: 1.5 }}>El equipo te mira. Resumí qué hicimos, qué aprendimos, y próximos pasos.</div>
              </div>
              <textarea value={wrapUpText} onChange={e => setWrapUpText(e.target.value)} placeholder="Equipo, para cerrar quiero repasar lo que hicimos hoy..." rows={6} style={{ width: "100%", padding: 17, borderRadius: 14, border: "3px solid #e0e0e0", fontSize: 17, fontFamily: "'Segoe UI',sans-serif", lineHeight: 1.5, resize: "none", outline: "none", boxSizing: "border-box", color: "#333" }} onFocus={e => e.target.style.borderColor = T.teal} onBlur={e => e.target.style.borderColor = "#e0e0e0"} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 17 }}>
                <button onClick={() => setWrapUpMode(false)} style={{ padding: "10px 22px", borderRadius: 11, border: "1px solid #ddd", background: "#f5f5f5", color: "#666", fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}>Volver</button>
                <button onClick={submitWrapUp} disabled={!wrapUpText.trim()} style={{ padding: "13px 39px", borderRadius: 14, border: "none", background: wrapUpText.trim() ? T.teal : "#e0e0e0", color: wrapUpText.trim() ? "#000" : "#999", fontWeight: 800, fontSize: 17, cursor: wrapUpText.trim() ? "pointer" : "not-allowed", fontFamily: "inherit" }}>Cerrar Sesión →</button>
              </div>
            </div>
          )}

          {boardItems.length === 0 && !pokerActive && !wrapUpMode && (
            <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", textAlign: "center", pointerEvents: "none" }}>
              <div style={{ fontSize: 67, marginBottom: 14, opacity: 0.2 }}>🧰</div>
              <div style={{ fontSize: 21, color: "#aaa" }}>Arrastrá herramientas desde la izquierda al board</div>
              <div style={{ fontSize: 15, color: "#ccc", marginTop: 6 }}>El equipo te va a ir haciendo preguntas</div>
            </div>
          )}
        </div>
      </div>

      {/* CHAT BAR */}
      <div style={{ height: 70, background: T.bg, borderTop: `1px solid ${T.border}`, display: "flex", alignItems: "center", padding: "0 17px", gap: 11, flexShrink: 0 }}>
        {readyForWrapUp && <button onClick={() => setWrapUpMode(true)} style={{ padding: "10px 22px", borderRadius: 14, border: `3px solid ${T.teal}`, background: T.tealDim, color: T.teal, fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", animation: "pulse 2s infinite" }}>📋 Cerrar Sesión</button>}
        {wrapUpSent && <div style={{ fontSize: 15, color: T.teal, fontWeight: 600 }}>✅ Sesión cerrada</div>}
        {replyTo && <div style={{ display: "flex", alignItems: "center", gap: 7, background: `${MEMBER_MAP[replyTo]?.color}15`, padding: "6px 11px", borderRadius: 11 }}><Avatar member={MEMBER_MAP[replyTo]} size={28} /><span style={{ fontSize: 14, color: MEMBER_MAP[replyTo]?.color, fontWeight: 700 }}>→ {MEMBER_MAP[replyTo]?.name.split(" ")[0]}</span><button onClick={() => setReplyTo(null)} style={{ background: "none", border: "none", color: T.dim, cursor: "pointer", fontSize: 14 }}>✕</button></div>}
        <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") submitChat() }} placeholder={replyTo ? `Respondele a ${MEMBER_MAP[replyTo]?.name.split(" ")[0]}...` : "Hablale al equipo..."} style={{ flex: 1, padding: "13px 20px", borderRadius: 14, border: `3px solid ${replyTo ? MEMBER_MAP[replyTo]?.color + "40" : T.border}`, background: T.panel, color: T.text, fontSize: 17, fontFamily: "inherit", outline: "none" }} />
        <button onClick={submitChat} disabled={!chatInput.trim()} style={{ padding: "10px 22px", borderRadius: 14, border: "none", background: chatInput.trim() ? T.teal : T.panel, color: "#000", fontWeight: 800, fontSize: 20, cursor: chatInput.trim() ? "pointer" : "not-allowed" }}>→</button>
      </div>

      {dragging && <div style={{ position: "fixed", left: dragPos.x - 56, top: dragPos.y - 28, padding: "10px 17px", background: "#fff", borderRadius: 14, boxShadow: "0 11px 42px rgba(0,0,0,0.2)", border: `3px solid ${T.teal}`, fontSize: 15, fontWeight: 700, color: "#333", pointerEvents: "none", zIndex: 1000, transform: "rotate(-3deg)" }}>{dragging.label}</div>}
      <style>{`
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.85;transform:scale(1.03)}}
        @keyframes popIn{from{opacity:0;transform:translateX(-50%) scale(0.9)}to{opacity:1;transform:translateX(-50%) scale(1)}}
        @keyframes glow{0%,100%{box-shadow:0 0 30px rgba(230,126,34,0.4)}50%{box-shadow:0 0 50px rgba(230,126,34,0.7)}}
      `}</style>
    </div>
  )
}
