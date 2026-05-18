// ─── Motor de AI ───
// Todas las llamadas a Claude pasan por acá.
// En local llama directo a Anthropic, en prod usa el proxy /api/chat.

const API_URL = import.meta.env.PROD
  ? "/api/chat"
  : "https://api.anthropic.com/v1/messages"

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY || "YOUR_API_KEY_HERE"

export async function callAI(systemPrompt, userMessage) {
  try {
    const headers = {
      "Content-Type": "application/json",
    }

    // En desarrollo, usar API key directa
    if (!import.meta.env.PROD) {
      headers["x-api-key"] = API_KEY
      headers["anthropic-version"] = "2023-06-01"
      headers["anthropic-dangerous-direct-browser-access"] = "true"
    }

    const res = await fetch(API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      }),
    })

    if (!res.ok) {
      const error = await res.json()
      console.error("API Error:", error)
      return null
    }

    const data = await res.json()
    const text = data.content?.map(b => b.text || "").join("") || ""
    const clean = text.replace(/```json|```/g, "").trim()
    return JSON.parse(clean)
  } catch (e) {
    console.error("Error en llamada AI:", e)
    return null
  }
}

// ─── Llamada AI que devuelve texto plano (no JSON) — para el AI Coach ───
export async function callAIText(systemPrompt, userMessage, maxTokens = 300) {
  try {
    const headers = { "Content-Type": "application/json" }
    if (!import.meta.env.PROD) {
      headers["x-api-key"] = API_KEY
      headers["anthropic-version"] = "2023-06-01"
      headers["anthropic-dangerous-direct-browser-access"] = "true"
    }
    const res = await fetch(API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      }),
    })
    if (!res.ok) {
      console.error("API Error:", await res.json())
      return null
    }
    const data = await res.json()
    return (data.content?.map(b => b.text || "").join("") || "").trim()
  } catch (e) {
    console.error("Error en llamada AI text:", e)
    return null
  }
}

// ─── Evaluar elección de formato de retro ───
export function buildFormatPrompt(formatName, formatDesc, justification, sprintContext) {
  return `Sos un evaluador experto de Scrum Masters para SMatch. Evaluá la elección de formato de retrospectiva del candidato y su justificación. Respondé en español.

Contexto: ${sprintContext}

El candidato eligió: "${formatName}" — ${formatDesc}
Justificación: "${justification}"

Respondé SOLO con JSON:
{"quality":"expert|competent|developing|red_flag","scores":{"facilitation":1-4,"process":1-4},"feedback":"Una oración específica sobre su elección y razonamiento","insight":"Qué revela esta elección sobre el SM"}

Cualquier formato puede ser expert si la justificación muestra awareness del contexto del equipo.`
}

// ─── Evaluar intervención del SM ───
export function buildInterventionPrompt(teamDesc, sprintContext, situation, conversation, smInput, isActionPhase) {
  return `Simulás una retrospectiva Scrum real para la evaluación SMatch. Interpretás a TODOS los miembros del equipo reaccionando al Scrum Master. Respondé todo en español.

EQUIPO:
${teamDesc}

CONTEXTO: ${sprintContext}

SITUACIÓN ACTUAL: ${situation}

CONVERSACIÓN RECIENTE:
${conversation}

EL SCRUM MASTER DIJO: "${smInput}"

${isActionPhase ? `Esta es la fase de ACTION ITEMS. Evaluá si el SM:
- Propone items específicos, medibles y alcanzables (no objetivos vagos)
- Asigna owners claros
- Pone fecha de revisión o criterios de éxito
- Limita a 1-3 items (no una lista interminable)
- Logra buy-in del equipo en vez de dictar
- Aborda las causas raíz identificadas en la retro
- Hace que el equipo sienta que decidió, no que le impusieron` : ""}

Respondé SOLO con JSON:
{"quality":"expert|competent|developing|red_flag","scores":{${isActionPhase ? '"facilitation":1-4,"process":1-4,"safety":1-4' : '"facilitation":1-4,"safety":1-4,"systems_thinking":1-4,"process":1-4'}},"reactions":[{"from":"member_id","text":"respuesta realista en español"}],"feedback":"Evaluación breve en español de esta intervención","narration":"Descripción atmosférica en español de cómo reaccionó la sala"}

SCORING: Expert(4)=crea espacio sin dirigir, preguntas poderosas, conecta patrones, propone experimentos no mandatos, valida sin tomar partido. Competent(3)=buenos instintos pero pierde matices. Developing(2)=muy directivo/pasivo, salta a soluciones, trata síntomas. RedFlag(1)=cierra conversación, culpa individuos, usa autoridad, ignora temas.

Generá 2-4 reacciones realistas y en personaje. Que suenen como gente real hablando en una reunión.`
}

// ─── AI Facilitation Assistant (Challenge02) ───
export function buildFacilitationQuestionsPrompt(teamDesc, situation, context) {
  return `Sos un AI Facilitation Assistant para Scrum Masters en SMatch. Tu rol es sugerir PREGUNTAS poderosas, no dar soluciones. Respondé en español.

EQUIPO:
${teamDesc}

SITUACIÓN:
${situation}

CONTEXTO RECIENTE:
${context}

El Scrum Master te pidió ayuda para facilitar esta conversación. Sugerí 3-4 preguntas poderosas que:
- Ayuden al equipo a reflexionar (no a defenderse)
- Abran la conversación en vez de cerrarla
- Sean específicas al contexto (no genéricas)
- Faciliten, no dirijan

Respondé SOLO con JSON:
{"questions":["Pregunta 1","Pregunta 2","Pregunta 3"],"coaching_note":"Una oración sobre el enfoque de estas preguntas"}

Las preguntas deben sonar como algo que un SM real diría en el momento.`
}

// ─── AI Communication Coach (Challenge02) ───
export function buildEscalationCoachPrompt(situation, context, smDraft) {
  return `Sos un AI Communication Coach para Scrum Masters en SMatch. Tu rol es ayudar a redactar mensajes de escalación profesionales y efectivos. Respondé en español.

SITUACIÓN:
${situation}

CONTEXTO:
${context}

${smDraft ? `El SM escribió este borrador:\n"${smDraft}"` : "El SM aún no escribió nada."}

Sugerí un mensaje de escalación que:
- Sea claro sobre el impacto en el sprint (datos concretos)
- No culpe a individuos ni equipos
- Pida acción concreta con fecha límite
- Mantenga tono colaborativo pero firme
- Explique qué ya se intentó

Respondé SOLO con JSON:
{"suggested_message":"El mensaje sugerido","to":"A quién enviar (rol/equipo)","coaching_note":"Por qué este enfoque funciona","improvements":"Qué mejorar si había un borrador"}

El mensaje debe ser profesional, directo, y accionable.`
}

// ─── Evaluar intervenciones en Challenge02 (Kanban blocker) ───
export function buildBlockerChallengePrompt(teamDesc, kanbanState, smAction, chatContext, candidateContext = "") {
  // Serialize board state
  const boardSummary = Object.entries(kanbanState)
    .map(([column, cards]) => {
      const cardsText = cards.map(c => {
        let status = `• ${c.id}: ${c.title} (${c.assignee || 'unassigned'}, ${c.priority} priority, ${c.points}pts)`
        if (c.status === 'blocked') status += ` 🔴 BLOCKED ${c.blockedDays || 0} days`
        if (c.status === 'idle') status += ' 💤 IDLE'
        if (c.status === 'waiting') status += ' ⏳ WAITING'
        if (c.dependencies?.length) status += ` (depends on: ${c.dependencies.join(', ')})`
        return status
      }).join('\n')

      const wipInfo = column === "DOING" && cards.length > 3
        ? ` ⚠️ WIP LIMIT EXCEEDED (${cards.length}/3)`
        : column === "DOING"
        ? ` (${cards.length}/3)`
        : ""

      return `${column}${wipInfo}:\n${cardsText || "  (vacío)"}`
    })
    .join('\n\n')

  const chatText = chatContext.map(m =>
    m.from === 'narration' ? `[Narración: ${m.text}]` : `[${m.from}: ${m.text}]`
  ).join('\n')

  // Mensaje libre del SM. Si tiene target, incluirlo.
  const actionDescription = smAction.target
    ? `Le dijo a ${smAction.target}: "${smAction.message}"`
    : `Dijo al equipo: "${smAction.message}"`

  return `Sos el director de escena del Equipo Setlist en Sprint 3, Día 7/10 para el assessment SMatch. Hay un bloqueo en SL-105 (David, 3 días) y el WIP limit está excedido. Tu rol es doble:
1. Generar reacciones REALISTAS de los miembros del equipo según sus personalidades
2. Evaluar silenciosamente al SM en 7 dimensiones (NO mostrar evaluación al candidato)

Respondé todo en español rioplatense.

${candidateContext}

EQUIPO:
${teamDesc}

KANBAN BOARD ACTUAL:
${boardSummary}

CHAT RECIENTE (últimos turnos):
${chatText}

ACCIÓN DEL SCRUM MASTER:
${actionDescription}

═══ EVALUACIÓN INTERNA (no compartir con candidato) ═══

Evaluá en 5 dimensiones (escala 1-4). El SM no las ve.

1. FLOW_OPTIMIZATION: ¿Propuso solución concreta para desbloquear (escalar, pair, re-priorizar, identificar bottleneck)?
2. WIP_LIMITS_AWARENESS: ¿Notó 5/3 en DOING? ¿Abordó el sobrepaso? ¿Entiende Little's Law?
3. FACILITATION: ¿Coordinó sin imponer? ¿Empoderó al equipo? ¿Hizo preguntas o solo dio órdenes?
4. EMPATHY: ¿Empatizó con David (bloqueado), Alan (inseguro)? ¿Evitó culpar?
5. SYSTEMS_THINKING: ¿Identificó la causa raíz sistémica (no solo el síntoma)? ¿Entiende feedback loops, leverage points?

NOTA: AI_FLUENCY se evalúa post-challenge mirando el log del coach, NO en este prompt.

═══ REACCIONES DEL EQUIPO ═══

Reglas para generar las reacciones:
- Cada miembro tiene una personalidad consistente (ver EQUIPO arriba). Mantenela.
- Si el SM le habla DIRECTAMENTE a un miembro (con target), ESE miembro responde primero (siempre).
- 1-3 reacciones totales. No más. NO TODOS responden cada turno.
- David (callado) NO escala su bloqueo solo. Solo lo hace si el SM lo invita explícitamente.
- Alan (inseguro) NO opina sin que le pregunten directamente.
- Eric (pragmático) puede intervenir si ve algo técnicamente errado.
- Si el SM ignora a alguien que debería invitar (ej: no habla con David sobre el bloqueo), nadie le va a decir "deberías hablar con David" — el silencio mismo es la señal.

═══ ACTUALIZACIONES DEL BOARD ═══

Reglas para boardUpdates:
- Solo cambian si el SM facilitó EXPLÍCITAMENTE un cambio. Si dijo "escalar a Platform" y Platform respondió, SL-105 puede pasar a "escalated". Si solo dijo "qué pasa con SL-105", no cambia.
- Si el SM sugirió pair programming y el equipo aceptó, asignar a 2 personas.
- Si no hay cambio justificado, omití boardUpdates o devolvé {}.

Respondé SOLO con JSON (sin markdown):
{
  "scores": {
    "flow_optimization": 1-4,
    "wip_limits_awareness": 1-4,
    "facilitation": 1-4,
    "empathy": 1-4,
    "systems_thinking": 1-4
  },
  "reactions": [{"from": "eric|david|alan|gian|gabriela|nacho", "text": "respuesta realista"}],
  "boardUpdates": {}
}

IMPORTANTE: NO incluyas el campo "quality" en el JSON. NO incluyas feedback. El candidato NUNCA debe ver evaluación durante el challenge.`
}

// ─── C04 Planning / Estimación prompt (chat libre + AI per turn) ───
// Reemplaza el keyword-matching que tenía C04. Evalúa qué dijo el SM con
// criterios reales: process mastery (Scrum), bias coaching, facilitation,
// systems thinking. ai_fluency se mide post-challenge.
export function buildEstimationFacilitationPrompt(teamDesc, sessionState, smAction, chatContext, candidateContext = "") {
  const chatText = chatContext.map(m =>
    m.from === 'narration' ? `[Narración: ${m.text}]` : `[${m.from}: ${m.text}]`
  ).join('\n')

  const actionDescription = smAction.target
    ? `Le dijo a ${smAction.target}: "${smAction.message}"`
    : `Dijo al equipo: "${smAction.message}"`

  const pokerInfo = sessionState.pokerActive
    ? `\nPLANNING POKER ACTIVO: PBI #${(sessionState.pokerIdx ?? 0) + 1} en discusión.${sessionState.revealed ? ' Cartas reveladas.' : ' Cartas ocultas.'}`
    : ''

  return `Sos el director de escena del Equipo Setlist en Sprint 1 Planning para el assessment SMatch. Es la primera vez que estiman y priorizan juntos. El equipo tiene seniorities mixtas y comportamientos riesgosos típicos (anclaje, confundir puntos con tiempo, estimación = compromiso, sesgo personal).

Tu rol es doble:
1. Generar reacciones REALISTAS de los miembros (manteniendo sus personalidades)
2. Evaluar silenciosamente al SM en 4 dimensiones (NO mostrar al candidato)

Respondé en español rioplatense.

${candidateContext}

EQUIPO:
${teamDesc}

ESTADO DE LA SESIÓN:
${pokerInfo}

CHAT RECIENTE (últimos turnos):
${chatText}

ACCIÓN DEL SCRUM MASTER:
${actionDescription}

═══ EVALUACIÓN INTERNA (NO compartir con el candidato) ═══

Evaluá en 4 dimensiones (escala 1-4):

1. PROCESS_MASTERY (Scrum process mastery):
   - ¿Explicó correctamente story points (relativos, no horas)?
   - ¿Diferenció estimación de compromiso?
   - ¿Mencionó velocity vs forecasting?
   - Expert(4): explica con claridad, usa analogías, evita jerga vacía.
   - Developing(2): jerga sin sustancia ("son puntos") o explicación errada.
   - Red flag(1): confunde puntos con horas, promete fechas como compromiso.

2. BIAS_COACHING (Coaching de sesgos cognitivos):
   - ¿Notó anclaje (Alan copia a Eric)? ¿Sesgo personal (David sube su estimación)?
   - ¿Confusión puntos/tiempo (Nacho)? ¿Estimación = compromiso (Gabriela)?
   - ¿Lo abordó con preguntas socráticas, no con cátedra?
   - Expert(4): detecta sesgo + pregunta para que el equipo se dé cuenta solo.
   - Developing(2): no detecta o lo señala sin generar aprendizaje.
   - Red flag(1): refuerza el sesgo o lo ignora completamente.

3. FACILITATION (Facilitación):
   - ¿Coordinó sin imponer? ¿Empoderó vs dirigir?
   - ¿Hizo preguntas o solo dio órdenes?
   - ¿Manejó disensos productivamente?
   - Expert(4): facilita decisión grupal, todos participan.
   - Developing(2): muy directivo o muy pasivo.
   - Red flag(1): impone estimación o deja que se imponga el más fuerte.

4. SYSTEMS_THINKING (Pensamiento sistémico):
   - ¿Conectó estimación con velocity, con sprint goal, con priorización?
   - ¿Pensó en consecuencias de errores de estimación (deuda, scope creep)?
   - Expert(4): conecta puntos en el sistema (estimar mal → velocity rota → planning roto).
   - Developing(2): mira solo el item, no el flujo.
   - Red flag(1): trata cada PBI aislado.

═══ REACCIONES DEL EQUIPO ═══

Reglas para reacciones:
- Mantené las personalidades: Eric pragmático, David callado y práctico, Alan inseguro,
  Gian meticuloso, Gabriela enfocada en delivery, Nacho entusiasta sí-a-todo.
- 1-3 reacciones máximo. NO todos hablan cada turno.
- Si el SM ataca un sesgo específico (anclaje, confusión puntos/tiempo, etc.),
  el miembro responsable reacciona en consecuencia (insight si fue bien manejado,
  defensividad si fue confrontado mal).
- Si el SM ignora un sesgo evidente, NADIE le va a avisar "ojo con el anclaje" — el silencio es la señal.
- Si el SM le habla directo a un miembro (target), ESE responde primero.

Respondé SOLO con JSON (sin markdown):
{
  "scores": {
    "process_mastery": 1-4,
    "bias_coaching": 1-4,
    "facilitation": 1-4,
    "systems_thinking": 1-4
  },
  "reactions": [{"from": "eric|david|alan|gian|gabriela|nacho", "text": "respuesta realista", "mood": "🤔|💡|✅|🤨|😐"}],
  "moodUpdates": {}
}

IMPORTANTE: NO incluyas el campo "quality" ni "feedback". El candidato NUNCA debe ver evaluación durante el challenge.`
}

// ─── AI Coach prompt (socrático puro) ───
export function buildAICoachPrompt(candidateContext, challengeContext, smQuestion, coachHistory) {
  const historyText = (coachHistory || []).slice(-6).map(t =>
    `${t.from === "sm" ? "SM" : "Coach"}: ${t.text}`
  ).join("\n")

  return `Sos un AI Coach que ayuda a un Scrum Master durante un assessment. Tu rol es enseñar pensando, NO dar respuestas.

REGLAS ABSOLUTAS:
1. NO le digas al SM qué hacer. NUNCA.
2. NO menciones nombres de personajes específicos (Eric, David, Alan, etc.) — usá descripciones genéricas ("el dev bloqueado", "el TL pragmático").
3. NO menciones frameworks ni teoría a menos que el SM los traiga primero.
4. Hacé 1 sola pregunta socrática por respuesta. Corta.
5. Si el SM te pregunta "¿qué hago?", reformulá la pregunta de vuelta: "¿Qué creés que pasaría si lo intentaras de X manera?"
6. Si el SM hace una pregunta trivial que un SM senior debería saber, mostrá curiosidad por su razonamiento ("Interesante que preguntés eso. ¿Por qué te surge la duda ahora?").
7. Si el SM intenta copiar tu respuesta literal a un personaje, no te ofendas, pero esperá a su próxima pregunta — no le des más material.
8. Hablás en español rioplatense (vos, decís, podés).

${candidateContext}

CONTEXTO DEL CHALLENGE ACTUAL:
${challengeContext}

HISTORIAL DE LA CONVERSACIÓN CON EL COACH:
${historyText || "(Es la primera vez que te consulta en este challenge)"}

EL SM TE PREGUNTA AHORA:
"${smQuestion}"

Respondé en máximo 2 oraciones. Una sola pregunta socrática. SOLO el texto de tu respuesta, sin JSON, sin formato.`
}

// ─── Insight extractor prompt ───
export function buildInsightExtractorPrompt(challengeName, conversationLog, coachLog, smActions) {
  return `Sos un evaluador experto de Scrum Masters. Acabás de observar a un SM completar el challenge "${challengeName}". Tu tarea: extraer insights sobre el candidato.

NO inventes patrones que no se ven en la evidencia. Si la evidencia es escasa, devolvé pocos insights.

CONVERSACIÓN CON EL EQUIPO:
${conversationLog}

INTERACCIONES CON EL AI COACH:
${coachLog || "(No usó el coach)"}

ACCIONES DEL SM (cards movidas, decisiones explícitas):
${smActions || "(Ninguna acción registrada en el board)"}

Extraé insights en 4 categorías. Sé específico, no genérico. Cada item: 3-7 palabras.

Respondé SOLO con JSON:
{
  "communication_style": "directive|empathic|analytical|balanced|passive",
  "patterns": ["máx 4 patrones observables, ej: 'pregunta antes de actuar', 'ignora voces calladas'"],
  "strengths": ["máx 3 fortalezas, ej: 'detecta WIP overflow rápido'"],
  "weaknesses": ["máx 3 áreas de oportunidad, ej: 'falta seguimiento con dev callado'"],
  "ai_fluency": {
    "score": 1-4,
    "rationale": "1 oración: cómo usó el coach (o por qué no lo usó)"
  },
  "notable_moments": [{"note": "1 oración sobre algo destacable o problemático"}]
}

CRITERIOS:
- ai_fluency score 4: Usó coach para estructurar pensamiento, sintetizó, no copy-paste
- ai_fluency score 3: Usó coach con buena intención pero copió alguna respuesta literal
- ai_fluency score 2: Pidió respuestas directas o no usó coach cuando claramente lo necesitaba
- ai_fluency score 1: Copy-paste descarado o uso desproporcionado para todo`
}

// ─── Calcular scores finales ───
export function computeScores(allScores, dimensions) {
  return dimensions.map(([key, label]) => {
    const vals = allScores.map(s => s[key]).filter(v => v > 0)
    const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0
    return { dimension: label, score: Math.round((avg / 4) * 100), fullMark: 100 }
  })
}

export function getGrade(finalScores) {
  const avg = finalScores.reduce((a, x) => a + x.score, 0) / finalScores.length
  if (avg >= 80) return { letter: "A", label: "Scrum Master Experto", color: "#34d399", avg }
  if (avg >= 60) return { letter: "B", label: "Scrum Master Competente", color: "#60a5fa", avg }
  if (avg >= 40) return { letter: "C", label: "Scrum Master en Desarrollo", color: "#fbbf24", avg }
  return { letter: "D", label: "Necesita Crecimiento Significativo", color: "#f87171", avg }
}

// ─── AI Coaching Assistant (Challenge03 - Burnout) ───
export function buildCoachingQuestionsPrompt(teamDesc, situation, context) {
  return `Sos un AI Coaching Assistant para Scrum Masters en SMatch. Tu rol es sugerir PREGUNTAS empáticas para coaching 1-1, especialmente para detectar burnout o problemas personales. Respondé en español.

EQUIPO: ${teamDesc}

SITUACIÓN: ${situation}

CONTEXTO DE LA CONVERSACIÓN:
${context}

El SM está en un 1-1 con un dev que muestra señales de burnout o performance issues. Necesita crear un espacio seguro para que el dev se abra.

Generá 3-4 preguntas de coaching empáticas que:
- Sean abiertas (no cerradas)
- No sean acusatorias ni juzguen
- Exploren cómo se siente la persona, no solo qué hizo
- Creen espacio para compartir sin presionar
- Eviten asumir o diagnosticar

BUENAS: "¿Cómo te sentís con la carga de trabajo últimamente?" / "¿Qué está pasando que pueda estar afectándote?"
MALAS: "¿Por qué performaste tan mal esta semana?" / "¿Estás quemado?" (cerrada, diagnóstico)

Respondé SOLO con JSON:
{"questions":["Pregunta 1","Pregunta 2","Pregunta 3","Pregunta 4"],"coaching_note":"Recordá que el objetivo es crear un espacio seguro, no forzar respuestas. Escuchá más de lo que hablás."}

Nota de coaching: enfocate en curiosidad genuina, no interrogatorio. El dev debe sentir que puede ser honesto sin consecuencias.`
}

// ─── AI ACTOR: Generar respuesta de UN personaje dinámicamente ───
export function buildActorPrompt(characterId, characterDesc, characterState, situation, conversation, smLastMessage) {
  return `Sos un ACTOR interpretando a un miembro de un equipo Scrum en SMatch. Tu trabajo es responder EN PERSONAJE de forma realista. Respondé todo en español.

PERSONAJE QUE INTERPRETÁS:
${characterDesc}

ESTADO EMOCIONAL ACTUAL:
- Openness: ${characterState.openness}/10 (qué tan dispuesto está a compartir)
- Trust: ${characterState.trust}/10 (confianza en el SM)
- Frustration: ${characterState.frustration}/10 (nivel de frustración)
- Energy: ${characterState.energy}/10 (energía/motivación)

SITUACIÓN ACTUAL:
${situation}

CONVERSACIÓN RECIENTE:
${conversation}

EL SCRUM MASTER ACABA DE DECIR:
"${smLastMessage}"

Tu trabajo es responder EN PERSONAJE considerando:
1. Tu personalidad (del character desc)
2. Tu estado emocional actual (si trust es bajo, no te vas a abrir fácil)
3. El contexto de la situación
4. Lo que acaba de decir el SM

IMPORTANTE:
- Si el SM hace preguntas empáticas y crea espacio seguro → aumentá openness/trust gradualmente
- Si el SM presiona, acusa, o es directivo → bajá trust, aumentá frustration
- Si el SM ignora señales obvias → aumentá frustration
- Respondé como una PERSONA REAL, no como un manual de texto

Respondé SOLO con JSON:
{"from":"${characterId}","text":"Tu respuesta en personaje (1-3 oraciones)","newState":{"openness":0-10,"trust":0-10,"frustration":0-10,"energy":0-10},"emotion":"calm|hopeful|frustrated|defensive|relieved"}

La respuesta debe sonar natural, como algo que dirías en una videollamada o chat real.`
}

// ─── Evaluar challenge de burnout/performance ───
export function buildBurnoutChallengePrompt(teamDesc, sprintContext, situation, conversation, smInput, phase) {
  const phaseInstructions = {
    detection: `Fase de DETECCIÓN. Evaluá si el SM:
- Detectó las señales de burnout más allá del performance issue (bugs básicos, cansancio visible, evasivas)
- Reconoció el patrón (era productivo antes, cambio drástico)
- No culpó al dev ni asumió "vagancia" o falta de compromiso
- Decidió hablar 1-1 en vez de presionar públicamente`,

    understanding: `Fase de ENTENDIMIENTO. Evaluá la preparación del SM:
- Formuló hipótesis empáticas (burnout, problema personal) no punitivas
- Planteó la conversación como exploración, no confrontación
- Consideró múltiples causas posibles`,

    coaching: `Fase de COACHING 1-1. Evaluá si el SM:
- Creó un espacio seguro para que el dev se abra
- Hizo preguntas empáticas y abiertas (no acusatorias)
- Escuchó más de lo que habló
- No juzgó ni minimizó lo que el dev compartió
- Validó los sentimientos del dev
- Propuso apoyo concreto (días off, reducir carga) sin ser salvador
- No forzó información, dejó que el dev decida qué compartir`,

    leadership: `Fase de LIDERAZGO. Evaluá si el SM:
- Manejó el impacto en el sprint de forma práctica (redistribuir trabajo)
- NO expuso la situación personal de Martín al equipo
- Mantuvo la confianza del dev sin mentir al equipo
- Fue transparente sobre el "qué" (tickets se redistribuyen) sin el "por qué personal"
- Evitó que el equipo especule o culpe al dev`,

    systemic: `Fase SISTÉMICA. Evaluá si el SM:
- Identificó el patrón (burnout silencioso, no detectado a tiempo)
- Propuso cambios de proceso para detectar burnout temprano (check-ins, workload visibility)
- Propuso cambios de cultura (seguridad psicológica para decir "no puedo más")
- Empoderó al equipo para prevenir, no solo reaccionar
- Consideró múltiples niveles (individual, team, org)`
  }

  return `Simulás un equipo Scrum real donde un dev tiene burnout y performance issues. Interpretás a TODOS los miembros del equipo reaccionando al Scrum Master. Respondé todo en español.

EQUIPO:
${teamDesc}

CONTEXTO DEL SPRINT: ${sprintContext}

SITUACIÓN ACTUAL: ${situation}

CONVERSACIÓN RECIENTE:
${conversation}

EL SCRUM MASTER DIJO: "${smInput}"

${phaseInstructions[phase] || ""}

Respondé SOLO con JSON:
{"quality":"expert|competent|developing|red_flag","scores":{"coaching":1-4,"empathy":1-4,"safety":1-4,"discretion":1-4,"systems_thinking":1-4},"reactions":[{"from":"member_id","text":"respuesta realista en español"}],"feedback":"Evaluación breve en español","narration":"Descripción de cómo reaccionó el equipo/dev"}

SCORING: Expert(4)=detecta temprano, coaching empático, crea espacio seguro, maneja impacto sin exponer, piensa sistémico. Competent(3)=detecta tarde o con ayuda, coaching decente pero mecánico, maneja bien. Developing(2)=no detecta burnout, trata solo como performance issue, presiona al dev. RedFlag(1)=culpa al dev, expone situación personal, no ofrece apoyo, ignora patrón.

IMPORTANTE: Si el SM está en el 1-1 (fase coaching) y hace preguntas empáticas y abiertas, Martín debe ABRIRSE gradualmente. Si presiona o acusa, Martín se cierra. Si crea espacio seguro, Martín eventualmente admite el burnout.

Generá 1-3 reacciones realistas y en personaje.`
}

// ─── Evaluar challenge de velocity pressure ───
export function buildVelocityPressurePrompt(teamDesc, sprintContext, situation, conversation, smInput, phase) {
  const phaseInstructions = {
    detection: `Fase de DETECCIÓN. Evaluá si el SM:
- Detectó el contexto de presión vs calidad (no solo "trabajar más")
- Reconoció que los números no cuentan toda la historia
- No culpó al equipo ni asumió "vagancia" o falta de esfuerzo
- Evitó reacciones defensivas o promesas vacías
- Creó espacio para investigar causas reales`,

    understanding: `Fase de ENTENDIMIENTO. Evaluá si el SM:
- Ayudó al equipo a articular causas sistémicas (deuda técnica, infra, cambios mid-sprint)
- Comunicó el impacto al stakeholder de forma que genere empatía (no solo excusas)
- Usó datos y ejemplos concretos
- Evitó culpar al PO, otras áreas, o factores externos sin proponer soluciones
- Educó sobre métricas ágiles (velocity no es lo único)`,

    facilitation: `Fase de FACILITACIÓN. Evaluá si el SM:
- Facilitó al equipo para llegar a soluciones reales (no reactivas como "trabajar más horas")
- Protegió al equipo de propuestas insostenibles
- Empoderó al equipo para proponer alternativas
- No impuso soluciones pero guió hacia opciones sustentables
- Manejó la tensión entre presión del negocio y bienestar del equipo`,

    negotiation: `Fase de NEGOCIACIÓN. Evaluá si el SM:
- Negoció compromisos realistas con el stakeholder
- Balanceó presión del negocio con capacidad real del equipo
- Propuso plan concreto con timelines y trade-offs claros
- No prometió imposibles ni cedió completamente
- Mantuvo integridad del equipo y del proceso ágil`,

    systemic: `Fase SISTÉMICA. Evaluá si el SM:
- Identificó el patrón (optimizar solo velocity sin visibilidad de deuda/calidad genera crisis)
- Propuso métricas más completas (lead time, defect rate, % tiempo en deuda técnica)
- Propuso comunicación proactiva de estas métricas a stakeholders
- Empoderó al equipo para prevenir, no solo reaccionar
- Consideró cambios de proceso, cultura y visibilidad`
  }

  return `Simulás un equipo Scrum real bajo presión de velocity del Engineering Manager. Interpretás a TODOS los miembros del equipo y al EM reaccionando al Scrum Master. Respondé todo en español.

EQUIPO:
${teamDesc}

CONTEXTO DEL SPRINT: ${sprintContext}

SITUACIÓN ACTUAL: ${situation}

CONVERSACIÓN RECIENTE:
${conversation}

EL SCRUM MASTER DIJO: "${smInput}"

${phaseInstructions[phase] || ""}

Respondé SOLO con JSON:
{"quality":"expert|competent|developing|red_flag","scores":{"stakeholder_management":1-4,"negotiation":1-4,"metrics_literacy":1-4,"boundary_setting":1-4,"systems_thinking":1-4},"reactions":[{"from":"member_id","text":"respuesta realista en español"}],"feedback":"Evaluación breve en español","narration":"Descripción de cómo reaccionó el equipo/stakeholder"}

SCORING:
Expert(4)=detecta presión vs calidad temprano, investiga causas reales, facilita diálogo productivo, negocia compromisos realistas, propone métricas sistémicas.
Competent(3)=detecta el problema pero reacciona defensivamente, comunica bien pero sin datos, facilita decentemente, negocia pero cede mucho.
Developing(2)=no detecta el contexto de presión, culpa factores externos, no protege al equipo, promete imposibles, ignora causas sistémicas.
RedFlag(1)=culpa al equipo, acepta "trabajar más horas", no negocia con stakeholder, ignora el patrón.

IMPORTANTE:
- Si el SM propone "trabajar más horas" o soluciones insostenibles, el equipo (especialmente Sofía) debe resistir recordando el burnout previo.
- Si el SM negocia bien con el EM, Daniel puede ceder SI el plan tiene datos y timelines claros.
- Si el SM propone métricas sistémicas, el equipo debe apoyar activamente.
- El EM (Daniel) está bajo presión del CEO, no es villano — puede ser educado sobre métricas ágiles si el SM comunica bien.

Generá 1-3 reacciones realistas y en personaje del equipo/stakeholder.`
}

// ─── Evaluar challenge de team agreements workshop ───
export function buildTeamAgreementsPrompt(teamDesc, sprintContext, boardSummary, chatContext) {
  return `Sos un evaluador experto de facilitación de workshops de Team Agreements. Evaluás cómo el Scrum Master está facilitando la creación de acuerdos de equipo. Respondé todo en español.

EQUIPO:
${teamDesc}

CONTEXTO: ${sprintContext}

BOARD ACTUAL (acuerdos documentados por el SM):
${boardSummary}

CONVERSACIÓN RECIENTE DEL EQUIPO:
${chatContext}

Tu tarea: Evaluar la facilitación del SM basándote en:

1. **FACILITATION** (1-4): ¿El SM está escuchando activamente las propuestas del equipo y facilitando el diálogo? ¿Maneja conflictos sin tomar partido? ¿Permite que las voces se escuchen?

2. **CONSENSUS_BUILDING** (1-4): ¿Los acuerdos en el board reflejan consenso real? ¿Son concretos y accionables, no vagos? ¿El SM está sintetizando bien las propuestas?

3. **INCLUSIVITY** (1-4): ¿El SM está documentando propuestas de todos los miembros? ¿Nota si alguien (especialmente Sofía, junior) no participa? ¿Crea espacio seguro?

4. **CLARITY** (1-4): ¿Los acuerdos son claros y específicos? ¿Evita abstracciones como "trabajar con calidad" sin definición? ¿Pregunta "¿qué significa esto en la práctica?"?

5. **SYSTEMS_THINKING** (1-4): ¿El SM está pensando en el sistema completo? ¿Los acuerdos cubren las 6 áreas necesarias? ¿Propone mecanismos de follow-through y revisión?

Respondé SOLO con JSON:
{
  "quality": "expert|competent|developing|red_flag",
  "scores": {
    "facilitation": 1-4,
    "consensus_building": 1-4,
    "inclusivity": 1-4,
    "clarity": 1-4,
    "systems_thinking": 1-4
  },
  "feedback": "Evaluación breve en español de 2-3 oraciones sobre qué está haciendo bien y qué podría mejorar"
}

SCORING GUIDE:
Expert (4): Facilita sin imponer, escucha activamente, sintetiza bien, acuerdos concretos, todos participan, piensa sistémicamente.
Competent (3): Facilita decentemente, algunos acuerdos vagos, no todos participan igualmente, seguimiento básico.
Developing (2): Documenta pero no facilita, acuerdos poco claros, ignora dinámicas de poder, no piensa en follow-through.
Red Flag (1): Solo transcribe sin facilitar, permite dominancia de voces, acuerdos que nadie seguirá, no crea consenso.

CONTEXTO DE EVALUACIÓN:
- Evaluá la CALIDAD de los acuerdos documentados en el board: ¿son concretos o vagos?
- Evaluá la COBERTURA: ¿está documentando propuestas de las 6 áreas (Values, DoR, DoD, Communication, Estimation, Ceremonies)?
- Evaluá la FACILITACIÓN: ¿los acuerdos reflejan lo que el equipo está proponiendo en el chat?
- Si hay conflictos en el chat (Laura vs Juan sobre velocidad/calidad), ¿el SM los refleja en el board de forma balanceada?
- Si Sofía (junior) propone algo, ¿el SM lo documenta o lo ignora?
- ¿Los acuerdos tienen follow-through (revisión periódica, ownership, etc.) o quedarán olvidados?`
}
