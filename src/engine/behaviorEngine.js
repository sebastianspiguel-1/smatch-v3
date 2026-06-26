// ═══════════════════════════════════════════════════════════════════
// BEHAVIOR ENGINE — clasificador + resolución determinística
// ───────────────────────────────────────────────────────────────────
// Flujo de un turno de facilitación:
//   1. buildIntentClassifierPrompt → la IA SOLO clasifica el texto del SM
//      en un intent (+ a quién va dirigido). NO genera la conversación.
//   2. resolveTurn → con ese intent, la respuesta del equipo, las
//      transiciones de estado, las tensiones que se revelan y el puntaje
//      salen de la base de comportamientos (determinístico).
// Si la clasificación falla o tiene baja confianza, el caller hace
// fallback a la IA libre (no hay callejón sin salida).
// ═══════════════════════════════════════════════════════════════════

// ─── 1. Prompt del clasificador (IA = oídos, no boca) ───
export function buildIntentClassifierPrompt(intents, recentChat, memberMap, targetHint) {
  const intentList = intents
    .map((i) => `- ${i.id}: ${i.label}. ${i.desc}`)
    .join("\n")
  const members = Object.values(memberMap)
    .map((m) => `${m.id} (${m.name.split(" ")[0]}, ${m.role})`)
    .join(", ")
  const chatText = recentChat
    .map((c) => (c.from === "sm" ? `SM: ${c.text}` : `${c.from}: ${c.text}`))
    .join("\n")

  return `Sos un CLASIFICADOR de movimientos de facilitación en una retrospectiva ágil. NO generás conversación. Solo etiquetás la última intervención del Scrum Master.

INTENTS POSIBLES (elegí exactamente UNO):
${intentList}

MIEMBROS DEL EQUIPO (para el target): ${members}

CONVERSACIÓN RECIENTE:
${chatText || "(recién arranca)"}
${targetHint ? `\nEl SM marcó que le habla a: ${targetHint}` : ""}

Devolvé SOLO este JSON, sin markdown:
{
  "intent": "<uno de los ids de arriba>",
  "target": "<id del miembro al que se dirige, o null si es al equipo entero>",
  "confidence": <0.0 a 1.0>
}

Reglas:
- Si el SM le pregunta directo a una persona callada → invite_voice (target = esa persona).
- Si nombra algo incómodo SIN culpar a nadie → name_tension. Si señala a una persona como responsable → blame.
- Si acepta "salió todo bien" y empuja a cerrar → rush_close.
- Si no es una jugada de facilitación clara → smalltalk.
- confidence < 0.5 si dudás mucho.`
}

// ─── 1b. Clasificador LOCAL (sin API) — reglas/keywords ───
// Mapea el texto del SM a un intent sin llamar a nadie. La IA queda como
// mejora opcional para casos ambiguos, pero esto solo ya hace andar todo.
const norm = (s) => (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
const has = (t, words) => words.some((w) => t.includes(w))

export function classifyLocal(message, targetId, memberMap, lastSpeaker) {
  const t = norm(message)
  const isQuestion = message.includes("?") || has(t, ["que ves", "que pensas", "como lo viviste", "que opinas", "vos que", "te noto"])

  // ¿A quién menciona? (nombre en el texto) + el target explícito del UI
  const members = Object.values(memberMap).map((m) => ({ id: m.id, fn: norm(m.name.split(" ")[0]) }))
  const mentioned = members.find((m) => m.fn && t.includes(m.fn))?.id
  const target = targetId || mentioned || null

  const quiet = ["eric", "david", "gian"]
  const dominant = ["gabriela", "nacho"]

  const r = (intent, confidence, tgt = target) => ({ intent, target: tgt, confidence })

  // Orden = prioridad
  if (has(t, ["tranquil", "sin culpa", "no buscamos culp", "no es para buscar culp", "buen laburo", "valoro", "gracias por", "espacio seguro", "esta bien equivocar"]))
    return r("create_safety", 0.7)

  if (has(t, ["acordemos", "action item", "compromet", "proximo paso", "quien se hace cargo", "para la proxima", "dueno", "owner", "nos comprometemos"]))
    return r("ask_action", 0.7)

  if (has(t, ["cerramos", "cerrar", "salio todo bien", "salio bien", "siguiente tema", "terminamos", "ya esta", "todo bien?"]))
    return r("rush_close", 0.65)

  // Acusar: dirigido a alguien + lenguaje de reproche
  if (target && has(t, ["vos ", "tu culpa", "por tu", "fuiste vos", "entregaste tarde", "frenaste", "no hiciste", "fallaste", "es tu respons", "por culpa"]))
    return r("blame", 0.7)

  // Animar a seguir / dar pie → a quien hablás o al último que habló
  if (has(t, ["dale", "contame", "contanos", "segui", "compartil", "ampli", "explica", "te escucho", "profundiz", "solta", "que mas", "y eso"]))
    return r("encourage", 0.72, target || lastSpeaker || null)

  // Invitar voz callada: dirigido a alguien + pregunta
  if (target && isQuestion)
    return r("invite_voice", quiet.includes(target) ? 0.78 : 0.6)

  // Redirigir al dominante
  if (has(t, ["escuchemos al resto", "antes de cerrar", "dejemos que", "espera,", "un toque", "para,"]) && (mentioned ? dominant.includes(mentioned) : true))
    return r("redirect_dominant", 0.65)

  // Si le hablás directo a alguien y no fue otra cosa → darle pie a ESA persona (no que se meta otro)
  if (target) return r("encourage", 0.62, target)

  // Nombrar tensión: menciona un tema espinoso, sin acusar a una persona
  if (has(t, ["tarde", "bug", "rebot", "alcance", "comentarios", "carry", "documentac", "ignor", "scope", "retras"]))
    return r("name_tension", 0.6)

  // Profundizar: pregunta abierta sin target puntual
  if (isQuestion || has(t, ["por que", "que paso", "que hizo que", "como llegamos"]))
    return r("probe_deeper", 0.55)

  return r("smalltalk", 0.4)
}

// ─── 2. Resolución determinística del turno ───
// Devuelve { reactions, scores, reveals, stateChanges, tells } a partir
// de la base de comportamientos. Sin IA.
const FILLERS = [
  "Se hace un breve silencio; no hay mucho más para agregar por ahora.",
  "El equipo asiente, pero nadie suma nada nuevo.",
  "Quedó algo flotando, pero por ahora nadie lo retoma.",
]

function genericDirected(intent) {
  if (intent === "create_safety") return "Afloja un poco, se lo ve más cómodo."
  if (intent === "ask_action") return "Asiente. 'Dale, lo anotamos.'"
  return "Te sigue, atento."
}

export function resolveTurn({ memberBehaviors, intentScores, memberStates, intent, target, usedTexts = [] }) {
  const used = new Set(usedTexts)
  // Elige una variante NO usada todavía; si se agotaron, devuelve null (no repetir).
  const pick = (arr) => {
    const fresh = arr.filter((v) => !used.has(v))
    if (!fresh.length) return null
    return fresh[Math.floor(Math.random() * fresh.length)]
  }
  const fillerLine = () => {
    const fresh = FILLERS.filter((v) => !used.has(v))
    const pool = fresh.length ? fresh : FILLERS
    return pool[Math.floor(Math.random() * pool.length)]
  }
  const reactions = []
  const stateChanges = {}
  const reveals = []
  const tells = {}

  const apply = (memberId, cfg) => {
    const text = pick(cfg.variants)
    if (text == null) {
      // Todas las variantes ya se dijeron → no repetir: narración neutra.
      reactions.push({ from: "narration", text: fillerLine() })
      if (cfg.to) stateChanges[memberId] = cfg.to
      if (cfg.reveal) reveals.push(cfg.reveal)
      return
    }
    reactions.push({ from: memberId, text })
    if (cfg.to) {
      stateChanges[memberId] = cfg.to
      const tell = memberBehaviors[memberId]?.tells?.[cfg.to]
      if (tell) tells[memberId] = tell
    }
    if (cfg.reveal) reveals.push(cfg.reveal)
  }

  // a) Si hay target, ESE responde siempre (su reacción al intent, o algo genérico).
  //    Nunca lo pisa otro (se acabó el "Gabriela se mete sola").
  if (target && memberBehaviors[target]) {
    const cfg = memberBehaviors[target].reactions?.[intent]
    if (cfg) apply(target, cfg)
    else reactions.push({ from: target, text: genericDirected(intent) })
  }

  // b) Sin target → reacción ambient (presión de sala: rush_close → Gabriela)
  if (reactions.length === 0) {
    for (const [memberId, b] of Object.entries(memberBehaviors)) {
      const cfg = b.reactions?.[intent]
      if (cfg?.ambient) { apply(memberId, cfg); break }
    }
  }

  // c) Sin target ni ambient → un miembro con reacción no-dirigida (ej: name_tension)
  if (reactions.length === 0) {
    for (const [memberId, b] of Object.entries(memberBehaviors)) {
      const cfg = b.reactions?.[intent]
      if (cfg && !cfg.directedOnly && !cfg.ambient) { apply(memberId, cfg); break }
    }
  }

  // d) Nunca dejar la sala muda
  if (reactions.length === 0) {
    reactions.push({ from: "narration", text: "El equipo te mira, esperando que sigas." })
  }

  return {
    reactions,
    scores: intentScores[intent] || {},
    reveals,
    stateChanges,
    tells,
  }
}

// ─── Respuesta del autor SOBRE SU tarjeta, según el tipo de movimiento ───
// kind: "deepen" (contar más) · "probe" (ir a la causa) · "action" (qué hacer).
// Cada tarjeta responde consistente con su propio contenido. Si esconde una
// tensión, contar/profundizar la destapa.
export function resolveCardIntent({ sticky, kind = "deepen", usedTexts = [] }) {
  const used = new Set(usedTexts)
  const variants = sticky[kind] || sticky.deepen || []
  const fresh = variants.filter((v) => !used.has(v))
  const pool = fresh.length ? fresh : variants
  const text = pool.length ? pool[Math.floor(Math.random() * pool.length)] : null
  if (!text) {
    return { reactions: [{ from: "narration", text: "No tiene mucho más para agregar sobre eso por ahora." }], reveals: [], stateChanges: {}, scores: {} }
  }
  const digging = kind !== "action"
  const scores =
    kind === "action"
      ? { process: 4, systems_thinking: 2 }
      : kind === "probe"
      ? { facilitation: 3, systems_thinking: 3 }
      : { facilitation: 3, systems_thinking: 2 }
  const reveals = digging && sticky.reveal ? [sticky.reveal] : []
  if (reveals.length) scores.safety = 3
  return {
    reactions: [{ from: sticky.author, text }],
    reveals,
    stateChanges: digging && sticky.to ? { [sticky.author]: sticky.to } : {},
    scores,
  }
}
