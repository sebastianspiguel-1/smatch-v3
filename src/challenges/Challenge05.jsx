import { useState, useEffect, useRef, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { T } from "../theme"
import {
  callAI,
  getLastAIError,
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
  SITUACION,
  SPRINT_STATS,
  SPRINT_SIGNALS,
  TEAM_DESC,
  FORMATS,
  STICKIES,
  DIMENSIONS,
  HIDDEN_TENSIONS,
} from "../data/challenge05"
import {
  INTENTS,
  INTENT_SCORES,
  MEMBER_BEHAVIORS,
  initialMemberStates,
} from "../data/retroBehaviorBase"
import { buildIntentClassifierPrompt, classifyLocal, resolveTurn, resolveCardIntent } from "../engine/behaviorEngine"
import "./Challenge05.css"
import "./Challenge03.css"

const OPENING_NARRATION =
  "Llegan todos a la sala. El tablero está poblado con stickies del equipo. Gabriela sonríe mirando los positivos. Eric mira el celu. Gian se acomoda en la silla. Es tu primera retro con este equipo. El SM abre."

const OPENING_CHAT = [
  { from: "gabriela", text: "¡Miren ese tablero! Entregamos un montón. Tremendo sprint, equipo." },
  { from: "nacho", text: "Sí, los resultados están buenos. Sigamos así." },
  { from: "eric", text: "Buenos resultados. Hay que estar orgullosos." },
]

const OPENING_PUSH =
  "Todos celebran y Gabriela ya quiere cerrar. Si nadie lo frena, la retro termina en 2 minutos sin tocar lo que importa. Te toca a vos: escribí abajo para abrir la conversación de verdad."

export default function Challenge05() {
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
  // ─── "Lo no dicho": tensiones latentes que el candidato saca facilitando ───
  const [revealedTensions, setRevealedTensions] = useState([])
  // ─── Movimiento de facilitación: stickies que el SM marca para profundizar
  // (judgment: ¿elige lo que importa o lo cómodo?) + el patrón que los conecta.
  const [focusKeys, setFocusKeys] = useState([])
  const [focusPattern, setFocusPattern] = useState("")
  // ─── Estado de cada personaje (base de comportamientos) ───
  const [memberStates, setMemberStates] = useState(initialMemberStates())
  // Último miembro que habló (para que "dale, contame más" le siga a ESA persona)
  const [lastSpeaker, setLastSpeaker] = useState(null)
  // Frases ya dichas → no repetir la misma respuesta
  const [usedLines, setUsedLines] = useState([])
  // Tarjeta "activa": sobre la que el candidato está conversando ahora
  const [activeCard, setActiveCard] = useState(null)
  // ─── Action items (el artefacto de cierre): {id, what, owner, metric, date} ───
  const [actionItems, setActionItems] = useState([
    { id: 1, what: "", owner: "", metric: "", date: "" },
    { id: 2, what: "", owner: "", metric: "", date: "" },
    { id: 3, what: "", owner: "", metric: "", date: "" },
  ])

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
            goToActions()
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
    // El intro arranca como primer mensaje del chat (queda en el historial)
    setChat([
      {
        system: true,
        text: "Retro en vivo. Empezá vos: escribí abajo para abrir la conversación. Tocá un avatar para hablarle a alguien puntual, o tocá una tarjeta del tablero para traerla acá y profundizarla.",
      },
    ])
    // Apertura de la retro
    setTimeout(() => {
      setChat((p) => [
        ...p,
        { narration: true, text: OPENING_NARRATION },
        ...OPENING_CHAT.map((c) => ({ from: c.from, text: c.text })),
        { narration: true, text: OPENING_PUSH },
      ])
    }, 400)
  }

  // ───── Chat libre + AI per turn ─────
  async function handleSMMessage(message, targetMemberId = null) {
    if (!message.trim() || loading) return

    commitPending() // comentar = lockear lo pendiente y limpiar selección
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

  // Muestra las reacciones de a una, con "pensada" + tipeo progresivo (más orgánico).
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
  async function streamReactions(items) {
    for (const it of items) {
      await sleep(700 + Math.floor(Math.random() * 600)) // "está escribiendo…"
      const isNarr = it.from === "narration"
      setChat((p) => [...p, { from: it.from, narration: isNarr, text: "" }])
      const words = (it.text || "").split(" ")
      const per = Math.max(38, Math.min(110, Math.round(1300 / Math.max(1, words.length))))
      for (let i = 1; i <= words.length; i++) {
        const partial = words.slice(0, i).join(" ")
        setChat((p) => {
          const n = [...p]
          n[n.length - 1] = { ...n[n.length - 1], text: partial }
          return n
        })
        await sleep(per)
      }
    }
  }

  async function evaluateAction(action) {
    const chatContext = chat.slice(-12).map((c) =>
      c.narration
        ? { from: "narration", text: c.text }
        : c.isYou
        ? { from: "sm", text: c.text }
        : { from: MEMBER_MAP[c.from]?.name || c.from, text: c.text }
    )

    // ═══ 1. CLASIFICAR el movimiento ═══
    // 1a. Clasificador LOCAL (sin API) — esto solo ya hace andar todo.
    const local = classifyLocal(action.message || "", action.target, MEMBER_MAP, lastSpeaker)
    let intent = local.intent
    let target = local.target || action.target || null

    // 1b. Si el local DUDA y hay red, la IA desambigua (opcional, nunca bloquea).
    if (local.confidence < 0.6) {
      const recentForClassifier = [
        ...chatContext.slice(-6),
        { from: "sm", text: action.message || "" },
      ]
      const targetHint = action.target ? MEMBER_MAP[action.target]?.name : null
      const cls = await callAI(
        buildIntentClassifierPrompt(INTENTS, recentForClassifier, MEMBER_MAP, targetHint),
        action.message || ""
      )
      if (cls?.intent && Object.prototype.hasOwnProperty.call(INTENT_SCORES, cls.intent)) {
        intent = cls.intent
        target = cls.target || target
      }
    }

    // ═══ 1c. ¿La jugada es sobre la tarjeta activa? → respuesta de la tarjeta ═══
    if (activeCard) {
      if (target && target !== activeCard.author) {
        setActiveCard(null) // cambió de interlocutor → la tarjeta deja de estar activa
      } else {
        let kind = null
        if (intent === "ask_action" && activeCard.action) kind = "action"
        else if (intent === "probe_deeper" && activeCard.probe) kind = "probe"
        else if ((intent === "encourage" || intent === "name_tension") && activeCard.deepen) kind = "deepen"
        if (kind) {
          const cardOut = resolveCardIntent({ sticky: activeCard, kind, usedTexts: usedLines })
          await streamReactions(cardOut.reactions)
          cardOut.reveals.forEach((id) => {
            if (HIDDEN_TENSIONS.some((t) => t.id === id)) setRevealedTensions((p) => (p.includes(id) ? p : [...p, id]))
          })
          if (Object.keys(cardOut.stateChanges).length) setMemberStates((p) => ({ ...p, ...cardOut.stateChanges }))
          const cvs = {}
          Object.entries(cardOut.scores).forEach(([k, v]) => { if (v > 0) cvs[k] = v })
          setAllScores((s) => [...s, cvs])
          setAllFeedback((f) => [...f, { action: `card_${kind}`, target: activeCard.author, message: action.message, scores: cvs }])
          const lm = [...cardOut.reactions].reverse().find((r) => r.from !== "narration")?.from
          if (lm) setLastSpeaker(lm)
          setUsedLines((prev) => [...prev, ...cardOut.reactions.filter((r) => r.from !== "narration").map((r) => r.text)])
          setActionCount((c) => c + 1)
          return
        }
      }
    }

    // ═══ 2. RESOLVER determinístico desde la base (SIEMPRE responde, sin API) ═══
    const out = resolveTurn({
      memberBehaviors: MEMBER_BEHAVIORS,
      intentScores: INTENT_SCORES,
      memberStates,
      intent,
      target,
      usedTexts: usedLines,
    })
    if (out.reactions.length) {
      await streamReactions(out.reactions)
      const lastMember = [...out.reactions].reverse().find((r) => r.from !== "narration")?.from
      if (lastMember) setLastSpeaker(lastMember)
      setUsedLines((prev) => [
        ...prev,
        ...out.reactions.filter((r) => r.from !== "narration").map((r) => r.text),
      ])
    }
    out.reveals.forEach((id) => {
      if (HIDDEN_TENSIONS.some((t) => t.id === id)) {
        setRevealedTensions((p) => (p.includes(id) ? p : [...p, id]))
      }
    })
    if (Object.keys(out.stateChanges).length) {
      setMemberStates((p) => ({ ...p, ...out.stateChanges }))
    }
    const vs = {}
    Object.entries(out.scores).forEach(([k, v]) => {
      if (v > 0) vs[k] = v
    })
    setAllScores((s) => [...s, vs])
    setAllFeedback((f) => [
      ...f,
      { action: action.type, target: action.target, message: action.message, scores: vs, intent },
    ])
    setActionCount((c) => c + 1)
  }

  // ─── Cierre: de la facilitación al artefacto (action items) ───
  function goToActions() {
    clearInterval(timerRef.current)
    setPhase("actions")
  }

  function updateItem(id, field, value) {
    setActionItems((items) =>
      items.map((it) => (it.id === id ? { ...it, [field]: value } : it))
    )
  }

  const isValidItem = (it) =>
    it.what.trim() && it.owner && it.metric.trim() && it.date.trim()

  const validItems = actionItems.filter(isValidItem)

  function serializeActionItems() {
    return validItems
      .map(
        (a) =>
          `• ${a.what} — dueño: ${MEMBER_MAP[a.owner]?.name || a.owner}, señal de éxito: ${a.metric}, fecha: ${a.date}`
      )
      .join("\n")
  }

  // Cierra desde la pantalla de action items: puntúa el artefacto y termina.
  async function finishFromActions() {
    if (validItems.length < 2 || loading) return
    setLoading(true)
    const serialized = serializeActionItems()
    setAllFeedback((f) => [
      ...f,
      { action: "action_items", target: null, message: serialized, scores: {} },
    ])
    // Puntúa la CALIDAD del artefacto (process + systems) sin tocar el chat.
    try {
      const sys = buildRetroFacilitationPrompt(
        TEAM_DESC,
        serializeBoard(),
        chosenFmt?.name || "Retro",
        {
          type: "action_items",
          target: null,
          message: `ACTION ITEMS DE CIERRE (artefacto final de la retro):\n${serialized}`,
        },
        [],
        buildAIContextString(DEFAULT_CANDIDATE_ID),
        HIDDEN_TENSIONS,
        revealedTensions
      )
      const res = await callAI(sys, "Evaluá los action items de cierre")
      if (res?.scores) {
        const vs = {}
        Object.entries(res.scores).forEach(([k, v]) => {
          if (v > 0) vs[k] = v
        })
        setAllScores((s) => [...s, vs])
      }
    } catch (e) {
      console.error("Error puntuando action items C05:", e)
    }
    setLoading(false)
    await finishChallenge()
  }

  async function finishChallenge() {
    clearInterval(timerRef.current)
    markChallengeComplete(5)
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
        .filter((i) => i.challenge === "Día 10 · Retro del Sprint 1")
        .map((i) => `SM pregunta: "${i.sm_question}"\nCoach responde: "${i.coach_response}"`)
        .join("\n\n")

      const actionsLog = allFeedback
        .map((fb) => `${fb.action}${fb.target ? ` → ${fb.target}` : ""}: "${fb.message || ""}"`)
        .join("\n")

      // Tensiones latentes que el SM logró sacar (lo no dicho) + artefacto final.
      const revealedLog = revealedTensions.length
        ? `\n═══ TENSIONES LATENTES QUE EL SM SACÓ (${revealedTensions.length}/${HIDDEN_TENSIONS.length}) ═══\n` +
          revealedTensions
            .map((id) => {
              const t = HIDDEN_TENSIONS.find((x) => x.id === id)
              return `- ${MEMBER_MAP[t.from]?.name || t.from}: "${t.text}"`
            })
            .join("\n")
        : `\n(El SM NO logró sacar ninguna de las ${HIDDEN_TENSIONS.length} tensiones latentes — se quedó en la superficie.)`
      const actionItemsLog = validItems.length
        ? `\n═══ ACTION ITEMS DE CIERRE ═══\n${serializeActionItems()}`
        : "\n(No cerró con action items accionables.)"
      // Movimiento de facilitación: qué tarjetas profundizó (quedaron lockeadas).
      const profundizedNow = chat.filter((m) => m.card && m.pending === false).map((m) => m.card)
      const focusLog = profundizedNow.length
        ? `\n═══ TARJETAS QUE EL SM PROFUNDIZÓ (${profundizedNow.length}) ═══\n` +
          profundizedNow.map((s) => `- [${MEMBER_MAP[s.author]?.name || s.author}] ${s.text}`).join("\n") +
          "\n\nEvaluá el CRITERIO: ¿fue a las tarjetas que esconden tensión real (entregas tardías, bug ignorado, scope creep en comentarios) o se quedó con los positivos cómodos?"
        : "\n(El SM NO profundizó ninguna tarjeta — se quedó en la superficie.)"
      const fullActionsLog = actionsLog + focusLog + revealedLog + actionItemsLog

      const prompt = buildInsightExtractorPrompt(
        "Día 10 · Retro del Sprint 1 (C05)",
        conversationLog,
        coachLog,
        fullActionsLog
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
            challenge: "C05",
            note: m.note || m,
          })),
        },
        challenge_history: [
          {
            challenge: "C05",
            challenge_name: "Día 10 · Retro del Sprint 1",
            completed_at: new Date().toISOString(),
            ai_fluency_score: aiFluencyScore,
            ai_fluency_rationale: insights.ai_fluency?.rationale,
          },
        ],
      })
    } catch (e) {
      console.error("Error en insight extraction C05:", e)
    }
  }

  const progressSteps = [
    { label: "Contexto" },
    { label: "Formato" },
    { label: "Facilitación" },
    { label: "Cierre" },
    { label: "Resultados" },
  ]
  const currentStep =
    phase === "context"
      ? 0
      : phase === "format"
      ? 1
      : phase === "board"
      ? 2
      : phase === "actions"
      ? 3
      : 4

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
        challengeId: 5,
        scores: finalScores,
        feedback: allFeedback,
        grade: gradeData,
        timeUsed,
      }).then(() => console.log("Challenge 05 result saved to Supabase"))
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
            <h1 className="context-title">Retrospectiva — Sprint 1</h1>
          </div>

          <div style={{ background: "#ffffff", border: "2px solid rgba(0,212,170,0.25)", borderRadius: 20, padding: "20px 24px", marginBottom: 20, boxShadow: "0 2px 8px rgba(15,23,42,0.06)" }}>
            <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: 3, color: "#059669", marginBottom: 12 }}>📋 SITUACIÓN</div>
            <div style={{ fontSize: 15, color: "#475569", lineHeight: 1.7 }}>{SITUACION}</div>
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

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginBottom: 28 }}>
            {FORMATS.map((f) => {
              const selected = fmt === f.id
              const colColors = ["#fde68a", "#bbf7d0", "#fbcfe8", "#bfdbfe"]
              return (
                <div
                  key={f.id}
                  onClick={() => setFmt(f.id)}
                  style={{
                    cursor: "pointer",
                    borderRadius: 18,
                    padding: 20,
                    background: "#ffffff",
                    border: `2px solid ${selected ? "#00d4aa" : "#e2e8f0"}`,
                    boxShadow: selected ? "0 10px 30px rgba(0,212,170,0.20)" : "0 2px 10px rgba(15,23,42,0.06)",
                    transition: "all 0.15s",
                    position: "relative",
                  }}
                >
                  {selected && (
                    <div style={{ position: "absolute", top: 12, right: 14, width: 26, height: 26, borderRadius: "50%", background: "#00d4aa", color: "#fff", fontSize: 15, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>✓</div>
                  )}
                  <div style={{ fontSize: 19, fontWeight: 800, color: "#0f172a", marginBottom: 14 }}>{f.name}</div>

                  {/* Preview del tablero: columnas reales + stickies fantasma */}
                  <div style={{ display: "flex", gap: 8, background: "#f1f5f9", borderRadius: 12, padding: 11, marginBottom: 14, minHeight: 160 }}>
                    {f.cols.map((c, i) => (
                      <div key={i} style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: "#475569", textAlign: "center", marginBottom: 8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c}</div>
                        {[0, 1, 2].map((j) => (
                          <div key={j} style={{ height: 18, borderRadius: 4, marginBottom: 5, background: colColors[i % colColors.length], opacity: 1 - j * 0.26, border: "1px solid rgba(15,23,42,0.05)" }} />
                        ))}
                      </div>
                    ))}
                  </div>

                  <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>{f.desc}</div>
                </div>
              )
            })}
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
        challengeTitle="Día 10 · Retro del Sprint 1"
        challengeNumber={1}
        accentColor="#00d4aa"
        gradientStart="rgba(0, 212, 170, 0.85)"
        gradientEnd="rgba(5, 150, 105, 0.80)"
        isLastChallenge={isLastChallenge(5)}
      />
    )

  // ═══════════════════════ ACTIONS (cierre: action items medibles) ═══════════════════════
  if (phase === "actions") {
    const fieldStyle = {
      padding: "8px 10px",
      borderRadius: 8,
      border: `1px solid ${T.border}`,
      background: T.panel,
      color: T.text,
      fontSize: 13,
      fontFamily: "inherit",
      outline: "none",
      width: "100%",
      boxSizing: "border-box",
    }
    return (
      <div
        style={{
          background: T.bg,
          minHeight: "100vh",
          color: T.text,
          fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif",
        }}
      >
        <TopBar
          backButton={{ label: "← Volver al tablero", onClick: () => setPhase("board") }}
          progress={<ProgressBar steps={progressSteps} current={currentStep} />}
        />
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 22px" }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 2, color: T.teal, marginBottom: 6 }}>
              CIERRE DE LA RETRO
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 8px" }}>
              Convertí lo que salió en acuerdos medibles
            </h1>
            <p style={{ fontSize: 14, color: T.sub, lineHeight: 1.55, margin: 0 }}>
              Mínimo 2 acuerdos. Cada uno necesita{" "}
              <strong style={{ color: T.text }}>dueño</strong>,{" "}
              <strong style={{ color: T.text }}>señal de éxito</strong> y{" "}
              <strong style={{ color: T.text }}>fecha</strong> — si no, no es accionable.
            </p>
          </div>

          {revealedTensions.length > 0 && (
            <div
              style={{
                marginBottom: 18,
                padding: 14,
                borderRadius: 10,
                background: "rgba(0,212,170,0.06)",
                border: `1px solid ${T.border}`,
              }}
            >
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, color: T.teal, marginBottom: 8 }}>
                LO QUE LOGRASTE SACAR — convertilo en acción
              </div>
              {revealedTensions.map((id) => {
                const t = HIDDEN_TENSIONS.find((x) => x.id === id)
                const m = MEMBER_MAP[t.from]
                return (
                  <div key={id} style={{ fontSize: 12, color: T.sub, marginBottom: 4, lineHeight: 1.4 }}>
                    <strong style={{ color: m.color }}>{m.name.split(" ")[0]}:</strong> {t.text}
                  </div>
                )
              })}
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.6fr 1fr 1.4fr 0.8fr 28px",
              gap: 8,
              fontSize: 10,
              color: T.dim,
              letterSpacing: 1,
              textTransform: "uppercase",
              padding: "0 2px 8px",
            }}
          >
            <span>Qué cambia</span>
            <span>Dueño</span>
            <span>Señal de éxito</span>
            <span>Fecha</span>
            <span />
          </div>

          {actionItems.map((it) => {
            const ok = isValidItem(it)
            const touched = it.what || it.owner || it.metric || it.date
            return (
              <div
                key={it.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.6fr 1fr 1.4fr 0.8fr 28px",
                  gap: 8,
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <input
                  value={it.what}
                  onChange={(e) => updateItem(it.id, "what", e.target.value)}
                  placeholder="ej: actualizar AC en el ticket"
                  style={fieldStyle}
                />
                <select
                  value={it.owner}
                  onChange={(e) => updateItem(it.id, "owner", e.target.value)}
                  style={fieldStyle}
                >
                  <option value="">—</option>
                  {TEAM.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name.split(" ")[0]}
                    </option>
                  ))}
                </select>
                <input
                  value={it.metric}
                  onChange={(e) => updateItem(it.id, "metric", e.target.value)}
                  placeholder="ej: 0 reboteos por AC"
                  style={fieldStyle}
                />
                <input
                  value={it.date}
                  onChange={(e) => updateItem(it.id, "date", e.target.value)}
                  placeholder="día 5"
                  style={fieldStyle}
                />
                <span style={{ textAlign: "center", fontSize: 15 }}>
                  {ok ? "✅" : touched ? "⚠️" : "·"}
                </span>
              </div>
            )
          })}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 18,
              paddingTop: 16,
              borderTop: `1px solid ${T.border}`,
            }}
          >
            <span style={{ fontSize: 13, color: validItems.length >= 2 ? T.green : T.sub }}>
              {validItems.length} de 3 acuerdos válidos
              {validItems.length < 2 && " · necesitás al menos 2"}
            </span>
            <button
              onClick={finishFromActions}
              disabled={validItems.length < 2 || loading}
              style={{
                padding: "12px 26px",
                borderRadius: 10,
                border: "none",
                background:
                  validItems.length >= 2 && !loading
                    ? "linear-gradient(135deg,#00d4aa,#059669)"
                    : T.panel,
                color: validItems.length >= 2 && !loading ? "#fff" : T.dim,
                fontWeight: 800,
                fontSize: 14,
                cursor: validItems.length >= 2 && !loading ? "pointer" : "not-allowed",
              }}
            >
              {loading ? "Cerrando..." : "Cerrar retro →"}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ═══════════════════════ BOARD (chat libre) ═══════════════════════
  const cols = chosenFmt?.cols || ["Keep Doing", "Improve"]
  const colColors = ["#16a34a", "#dc2626", "#d97706", "#2563eb"]

  // Sticky clickeable: marcar/desmarcar para profundizar (movimiento de facilitación)
  const toggleFocus = (k) =>
    setFocusKeys((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k]))

  // Tocar una tarjeta la trae al chat como PENDIENTE (removible). Tocarla de
  // nuevo (o la ✕) la deselecciona y desaparece. Recién queda LOCKEADA en el
  // historial cuando el candidato pregunta o comenta sobre ella.
  function bringCardToChat(s) {
    if (focusKeys.includes(s.text)) {
      deselectCard(s)
    } else {
      setFocusKeys((p) => [...p, s.text])
      setChat((p) => [...p, { card: s, pending: true }])
    }
  }
  function deselectCard(s) {
    setFocusKeys((p) => p.filter((x) => x !== s.text))
    setChat((p) => p.filter((m) => !(m.card && m.pending && m.card.text === s.text)))
  }
  // Al preguntar/comentar: lo pendiente queda lockeado en el historial y se
  // limpia la selección (para poder elegir otras y seguir profundizando).
  function commitPending() {
    if (focusKeys.length === 0) return
    const lastPending = [...chat].reverse().find((m) => m.card && m.pending)?.card
    setChat((p) => p.map((m) => (m.card && m.pending ? { ...m, pending: false } : m)))
    setFocusKeys([])
    if (lastPending) setActiveCard(lastPending)
  }

  // Preguntarle al AUTOR sobre su tarjeta, según el tipo de movimiento.
  // kind: "deepen" (contar más) · "probe" (causa) · "action" (qué hacer).
  async function askCard(s, kind = "deepen") {
    if (loading) return
    commitPending() // preguntar = lockear lo pendiente y limpiar selección
    setActiveCard(s)
    const m = MEMBER_MAP[s.author]
    const fn = m?.name.split(" ")[0]
    const short = s.text.length > 60 ? s.text.slice(0, 58) + "…" : s.text
    const q =
      kind === "probe"
        ? `${fn}, ¿qué hay detrás de esto? ¿Cuál es la causa de fondo?`
        : kind === "action"
        ? `${fn}, ¿qué deberíamos hacer al respecto? ¿Lo dejamos como action item?`
        : `${fn}, contame más sobre tu tarjeta: "${short}"`
    setChat((p) => [...p, { isYou: true, text: q, targetName: m?.name }])
    setLoading(true)
    const out = resolveCardIntent({ sticky: s, kind, usedTexts: usedLines })
    await streamReactions(out.reactions)
    out.reveals.forEach((id) => {
      if (HIDDEN_TENSIONS.some((t) => t.id === id)) {
        setRevealedTensions((p) => (p.includes(id) ? p : [...p, id]))
      }
    })
    if (Object.keys(out.stateChanges).length) {
      setMemberStates((p) => ({ ...p, ...out.stateChanges }))
    }
    const vs = {}
    Object.entries(out.scores).forEach(([k, v]) => { if (v > 0) vs[k] = v })
    setAllScores((arr) => [...arr, vs])
    setAllFeedback((f) => [
      ...f,
      { action: "card_ask", target: s.author, message: `Preguntó a ${m?.name.split(" ")[0]} por su tarjeta: "${s.text}"`, scores: vs },
    ])
    const lastMember = [...out.reactions].reverse().find((r) => r.from !== "narration")?.from
    if (lastMember) setLastSpeaker(lastMember)
    setUsedLines((prev) => [...prev, ...out.reactions.filter((r) => r.from !== "narration").map((r) => r.text)])
    setActionCount((c) => c + 1)
    setLoading(false)
  }

  const renderSticky = (s, i, prefix, accent = "#94a3b8") => {
    const on = focusKeys.includes(s.text)
    const m = MEMBER_MAP[s.author]
    const votes = s.votes?.length || 0
    return (
      <div
        key={`${prefix}-${i}`}
        onClick={() => bringCardToChat(s)}
        title="Traer al chat para profundizar"
        style={{
          position: "relative",
          cursor: "pointer",
          marginBottom: 12,
          background: "#ffffff",
          borderRadius: 12,
          border: "1px solid #e6e8eb",
          borderTop: `3px solid ${accent}`,
          boxShadow: on ? "0 0 0 2px #00d4aa, 0 2px 6px rgba(15,23,42,0.10)" : "0 1px 3px rgba(15,23,42,0.08)",
          padding: "12px 14px 13px",
          transition: "box-shadow .15s",
        }}
      >
        {on && (
          <div style={{ position: "absolute", top: -8, right: -8, width: 22, height: 22, borderRadius: "50%", background: "#00d4aa", color: "#fff", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.25)", zIndex: 5 }}>🔍</div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
          <Avatar member={m} size={26} />
          <span style={{ fontSize: 14, fontWeight: 700, color: "#172b4d" }}>{m?.name || s.author}</span>
        </div>
        <div style={{ fontSize: 13.5, color: "#3c4257", lineHeight: 1.55 }}>{s.text}</div>
        {votes > 0 && (
          <div style={{ marginTop: 10, paddingTop: 9, borderTop: "1px solid #f1f3f5", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "#9aa3af", fontSize: 12, fontWeight: 600 }}>👍 {votes}</span>
          </div>
        )}
      </div>
    )
  }
  const focusedStickies = stickies.filter((s) => focusKeys.includes(s.text))

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
              onClick={goToActions}
              style={{
                padding: "6px 14px",
                fontSize: 12,
                background: T.teal,
                color: T.bg,
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontWeight: 800,
                letterSpacing: ".3px",
              }}
            >
              Ir al cierre →
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

      {/* Objetivo + Lo no dicho (mecánica central) */}
      <div
        style={{
          flexShrink: 0,
          padding: "8px 14px",
          background: T.panel,
          borderBottom: `1px solid ${T.border}`,
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <span style={{ fontSize: 14 }}>🎯</span>
          <span style={{ fontSize: 12, color: T.sub, maxWidth: 360, lineHeight: 1.35 }}>
            Tu objetivo: <strong style={{ color: T.text }}>sacá lo que nadie nombra</strong> y cerralo en acuerdos accionables.
          </span>
        </div>
        <div style={{ display: "flex", gap: 7, marginLeft: "auto", alignItems: "center" }}>
          <span style={{ fontSize: 10, color: T.dim, letterSpacing: 1, textTransform: "uppercase", marginRight: 2 }}>
            Lo no dicho {revealedTensions.length}/{HIDDEN_TENSIONS.length}
          </span>
          {HIDDEN_TENSIONS.map((t) => {
            const open = revealedTensions.includes(t.id)
            const m = MEMBER_MAP[t.from]
            return (
              <div
                key={t.id}
                title={open ? `${m.name}: ${t.text}` : "Tensión latente — se revela si facilitás bien"}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 10px",
                  borderRadius: 20,
                  background: open ? `${m.color}24` : "rgba(255,255,255,0.03)",
                  border: `1px ${open ? "solid" : "dashed"} ${open ? m.color : T.border}`,
                  transition: "all 0.3s",
                }}
              >
                {open ? <Avatar member={m} size={18} /> : <span style={{ fontSize: 11 }}>🔒</span>}
                <span style={{ fontSize: 11, fontWeight: 700, color: open ? m.color : T.dim }}>
                  {open ? m.name.split(" ")[0] : "oculto"}
                </span>
                {open && <span style={{ fontSize: 11, color: T.green }}>✓</span>}
              </div>
            )
          })}
        </div>
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
            <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 600, background: "linear-gradient(to bottom, #eaf6fe, #d6ecfb)", borderRadius: 12, overflow: "hidden", border: "1px solid rgba(3,105,161,0.12)" }}>
              {/* Banner: velero rumbo a la isla */}
              <div style={{ position: "relative", height: 92, flexShrink: 0, background: "linear-gradient(to bottom, #bae6fd, #7dd3fc)", overflow: "hidden", borderBottom: "1px solid rgba(3,105,161,0.18)" }}>
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 22% 32%, rgba(255,255,255,0.65), transparent 38%), radial-gradient(circle at 68% 18%, rgba(255,255,255,0.5), transparent 30%)" }} />
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 30, background: "linear-gradient(to bottom, rgba(56,189,248,0.45), rgba(3,105,161,0.35))" }} />
                <div style={{ position: "absolute", left: 26, bottom: 12, fontSize: 50, transform: "rotate(4deg)" }}>⛵</div>
                <div style={{ position: "absolute", right: 30, bottom: 6, fontSize: 44 }}>🏝️</div>
                <div style={{ position: "absolute", top: 12, left: 0, right: 0, textAlign: "center", fontSize: 12, fontWeight: 800, letterSpacing: 2, color: "#0c4a6e", textTransform: "uppercase" }}>Equipo Setlist · rumbo a la meta</div>
              </div>

              {/* 4 columnas temáticas scrolleables */}
              <div style={{ flex: 1, display: "flex", gap: 8, padding: 10, overflow: "hidden" }}>
                {[
                  { ci: 0, label: "Wind", emoji: "🌬️", sub: "Lo que nos impulsa", head: "#0369a1", bg: "rgba(186,230,253,0.4)", bd: "rgba(3,105,161,0.22)" },
                  { ci: 1, label: "Anchor", emoji: "⚓", sub: "Lo que nos frena", head: "#b91c1c", bg: "rgba(254,226,226,0.5)", bd: "rgba(185,28,28,0.20)" },
                  { ci: 2, label: "Rocks", emoji: "🪨", sub: "Riesgos", head: "#c2410c", bg: "rgba(255,237,213,0.6)", bd: "rgba(194,65,12,0.20)" },
                  { ci: 3, label: "Island", emoji: "🏝️", sub: "Nuestra meta", head: "#047857", bg: "rgba(209,250,229,0.55)", bd: "rgba(4,120,87,0.20)" },
                ].map((z) => {
                  const cs = stickies.filter((s) => s.col === z.ci)
                  return (
                    <div key={z.ci} style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", background: z.bg, border: `1px solid ${z.bd}`, borderRadius: 12 }}>
                      <div style={{ padding: "8px 6px", textAlign: "center", borderBottom: `1px solid ${z.bd}` }}>
                        <div style={{ fontSize: 22, lineHeight: 1 }}>{z.emoji}</div>
                        <div style={{ fontSize: 11, fontWeight: 800, color: z.head, letterSpacing: 1, textTransform: "uppercase", marginTop: 3 }}>{z.label}</div>
                        <div style={{ fontSize: 9, color: "#64748b", marginTop: 1 }}>{z.sub} · {cs.length}</div>
                      </div>
                      <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
                        {cs.map((s, i) => renderSticky(s, i, z.label, z.head))}
                        {cs.length === 0 && (
                          <div style={{ fontSize: 10, color: "#94a3b8", textAlign: "center", padding: 14, fontStyle: "italic" }}>—</div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 14, height: "100%", padding: 14, background: "#eef1f5", borderRadius: 12 }}>
              {cols.map((colName, ci) => {
                const cs = stickies.filter((s) => s.col === ci)
                const neg = ["Improve", "Sad 😔", "Mad 😤", "Stop", "Anchor ⚓", "Rocks 🪨"]
                const isNeg = neg.includes(colName)
                const accent = isNeg ? "#e8590c" : "#16a34a"
                return (
                  <div key={ci} style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", background: "#f4f5f7", borderRadius: 14, padding: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12 }}>
                      <span style={{ width: 9, height: 9, borderRadius: "50%", background: accent, flexShrink: 0 }} />
                      <span style={{ fontSize: 15, fontWeight: 800, color: "#172b4d" }}>{colName}</span>
                      <span style={{ fontSize: 12, color: "#9aa3af", fontWeight: 700 }}>({cs.length})</span>
                    </div>
                    <div style={{ flex: 1, overflowY: "auto", paddingRight: 2 }}>
                      {cs.map((s, i) => renderSticky(s, i, ci, accent))}
                      {cs.length === 0 && (
                        <div style={{ fontSize: 12, color: "#b0b7c0", textAlign: "center", padding: 18, fontStyle: "italic" }}>Sin items todavía</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Chat libre (estilo Challenge03 — daily) */}
        <div className="kanban-chat" style={{ width: 540, flexShrink: 0 }}>
          <div className="chat-messages" ref={chatRef}>
            {chat.map((msg, i) => {
              if (msg.system) {
                return (
                  <div key={i} style={{ background: "rgba(0,212,170,0.10)", border: "1px solid rgba(0,212,170,0.30)", borderRadius: 12, padding: "11px 14px", color: "#475569", fontSize: 13, lineHeight: 1.55, marginBottom: 12 }}>
                    {msg.text}
                  </div>
                )
              }
              if (msg.card) {
                const cs = msg.card
                const cm = MEMBER_MAP[cs.author]
                if (!cm) return null
                return (
                  <div key={i} style={{ background: `${cm.color}14`, border: `1px ${msg.pending ? "dashed" : "solid"} ${cm.color}55`, borderRadius: 14, padding: "13px 15px", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <Avatar member={cm} size={24} />
                      <span style={{ fontSize: 11, fontWeight: 800, color: cm.color, textTransform: "uppercase", letterSpacing: 0.5 }}>📌 Tarjeta de {cm.name.split(" ")[0]}</span>
                      {msg.pending && (
                        <button
                          onClick={() => deselectCard(cs)}
                          title="Deseleccionar"
                          style={{ marginLeft: "auto", background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 16, lineHeight: 1, padding: 2 }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <div style={{ fontSize: 14, color: "#1f2937", lineHeight: 1.5, marginBottom: 12 }}>"{cs.text}"</div>
                    {cs.deepen ? (
                      <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                        {[
                          { kind: "deepen", label: "💬 Contar más", solid: true },
                          cs.probe && { kind: "probe", label: "🔎 Profundizar" },
                          cs.action && { kind: "action", label: "✅ ¿Qué hacemos?" },
                        ].filter(Boolean).map((b) => (
                          <button
                            key={b.kind}
                            onClick={() => askCard(cs, b.kind)}
                            disabled={loading}
                            style={{
                              background: b.solid ? cm.color : "transparent",
                              color: b.solid ? "#fff" : cm.color,
                              border: b.solid ? "none" : `1px solid ${cm.color}80`,
                              borderRadius: 9, padding: "7px 13px", fontWeight: 700, fontSize: 12.5,
                              cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit",
                            }}
                          >
                            {b.label}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div style={{ fontSize: 12, color: T.dim, fontStyle: "italic" }}>Escribile abajo para preguntarle sobre esto.</div>
                    )}
                  </div>
                )
              }
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
                <div className="chat-message-text">El equipo está escribiendo…</div>
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
        challengeName="Día 10 · Retro del Sprint 1"
        challengeContext={`El SM está facilitando la PRIMERA retro del equipo Setlist (Sprint 1, Día 10/10). Entregaron 22 de 29 pts. El tablero (${
          chosenFmt?.name || "retro"
        }) muestra muchos positivos pero también tensiones que nadie nombra: scope creep del PO en comentarios, deuda de documentación, un bug ignorado en planning, voces calladas (Eric, Alan, David). Gabriela y Nacho quieren cerrar rápido.`}
      />
    </div>
  )
}
