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

// ─── Evaluar intervenciones en C03 (Daily / Kanban blocker, Día 5) ───
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

  return `Sos el director de escena del Equipo Setlist en Sprint 1, Día 5/10 para el assessment SMatch. Hay un bloqueo en SL-105 (Alan, 2 días esperando aprobación Spotify API) y el WIP limit está excedido. Tu rol es doble:
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

// ─── C01 Planning / Estimación prompt (chat libre + AI per turn, Día 1) ───
// Reemplaza el keyword-matching original. Evalúa qué dijo el SM con
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

// ─── C05 Retro prompt (chat libre + AI per turn, Día 10) ───
// Reemplaza el flujo MOMENTS scripted. Evalúa la facilitación de la retro
// con criterios reales: facilitación, seguridad psicológica, pensamiento sistémico, diseño de procesos.
// ai_fluency se mide post-challenge.
export function buildRetroFacilitationPrompt(teamDesc, boardSummary, formatName, smAction, chatContext, candidateContext = "", hiddenTensions = [], revealedIds = []) {
  const chatText = chatContext.map(m =>
    m.from === 'narration' ? `[Narración: ${m.text}]` : `[${m.from}: ${m.text}]`
  ).join('\n')

  const actionDescription = smAction.target
    ? `Le dijo a ${smAction.target}: "${smAction.message}"`
    : `Dijo al equipo: "${smAction.message}"`

  const pending = hiddenTensions.filter(t => !revealedIds.includes(t.id))
  const tensionsBlock = pending.length
    ? `\n═══ TENSIONES LATENTES (lo no dicho — NO están en el tablero) ═══
Hay cosas que el equipo NO dijo en voz alta. SOLO emergen si el SM facilita lo suficientemente bien para sacarlas. Pendientes:
${pending.map(t => `- [${t.id}] ${t.from}: lo no dicho = "${t.text}"\n   Emerge cuando: ${t.hint}`).join('\n')}

Si la acción del SM GENUINAMENTE saca una de estas (le preguntó a la persona correcta, con la apertura y seguridad correctas), incluí "revealedTension": "<id>" y hacé que ESE miembro lo diga en "reactions" con sus propias palabras (alineado al texto, no calcado). Si el SM no se lo ganó (fue genérico, acusó, o no tocó a esa persona), devolvé "revealedTension": null. NUNCA reveles por lástima ni con una pregunta vaga. Como mucho 1 revelación por turno.\n`
    : `\n(Todas las tensiones latentes ya se revelaron. Devolvé "revealedTension": null.)\n`

  return `Sos el director de escena del Equipo Setlist en Sprint 1, Día 10/10 (retrospectiva de cierre) para el assessment SMatch. Es la primera retro del equipo. Entregaron 22 de 29 pts. Hay tensiones que nadie nombra: Nacho entregó tarde sin avisar, Alan cubrió en silencio, Gian reportó un bug que fue ignorado, Eric está callado, Gabriela celebra. Hay deuda de documentación que generó carry-over.

Formato elegido por el SM: ${formatName}.

Tu rol es doble:
1. Generar reacciones REALISTAS de los miembros (manteniendo sus personalidades)
2. Evaluar silenciosamente al SM en 4 dimensiones (NO mostrar al candidato)

Respondé en español rioplatense.

${candidateContext}

EQUIPO:
${teamDesc}

TABLERO DE RETRO (stickies actuales):
${boardSummary}
${tensionsBlock}
CHAT RECIENTE (últimos turnos):
${chatText}

ACCIÓN DEL SCRUM MASTER:
${actionDescription}

═══ EVALUACIÓN INTERNA (NO compartir con el candidato) ═══

Evaluá en 4 dimensiones (escala 1-4):

1. FACILITATION (Facilitación):
   - ¿Abre espacio sin dirigir? ¿Hace preguntas poderosas?
   - ¿Maneja el tiempo, el flujo, las voces calladas?
   - Expert(4): facilita decisión grupal, todos participan, preguntas abren la conversación.
   - Developing(2): muy directivo o pasivo, salta a soluciones.
   - Red flag(1): cierra conversación, usa autoridad, dirige el contenido.

2. SAFETY (Seguridad psicológica):
   - ¿Invita explícitamente a las voces calladas (Eric, Alan, David)?
   - ¿Valida sin tomar partido cuando emerge tensión?
   - ¿Evita culpar individuos (Nacho, Gabriela)?
   - Expert(4): nombra la tensión sin acusar, crea espacio para honestidad.
   - Developing(2): ignora tensiones obvias o las maneja torpemente.
   - Red flag(1): culpa individuos, permite que el más fuerte domine.

3. SYSTEMS_THINKING (Pensamiento sistémico):
   - ¿Conecta patrones (scope creep en comentarios + deuda de doc + carry-over)?
   - ¿Identifica causa raíz vs síntoma?
   - Expert(4): conecta los puntos del sprint, propone experimento sistémico.
   - Developing(2): trata cada sticky aislado, no ve el patrón.
   - Red flag(1): trata todo como problema individual.

4. PROCESS (Diseño de procesos):
   - En action items: ¿son específicos, con owner, fecha, criterio de éxito?
   - ¿Limita a 1-3 items (no lista interminable)?
   - ¿Logra buy-in del equipo en vez de imponer?
   - Expert(4): action items concretos, accionables, con commitment real.
   - Developing(2): items vagos sin owner ni seguimiento.
   - Red flag(1): "vamos a mejorar la comunicación" tipo de cosa.

═══ REACCIONES DEL EQUIPO ═══

Reglas para reacciones:
- Mantené personalidades: Eric callado pero directo, David sólido y reservado, Alan se autocensura, Gian frustrado y meticuloso, Gabriela optimista, Nacho entusiasta defensivo.
- 1-3 reacciones máximo. NO todos hablan cada turno.
- Si el SM invita explícitamente a una voz callada (ej "Eric, ¿vos qué ves?"), ESE responde primero.
- Si el SM ataca un tema sensible bien (ej tensión Gabriela/scope creep), Gabriela puede defenderse pero también abrirse si se siente segura.
- Si el SM ignora una tensión evidente o cierra demasiado rápido, NADIE le va a avisar — el silencio mismo es la señal.
- Si el SM le habla directo a un miembro (target), ESE responde primero.

═══ ACTUALIZACIONES DEL TABLERO ═══

Reglas para boardUpdates:
- Solo agregás nuevas stickies si el SM facilitó EXPLÍCITAMENTE que un miembro contribuya algo nuevo.
- Si el SM cierra la retro con action items concretos, podés devolver los items en stickies con col=action.
- Si no hay cambio justificado, omití boardUpdates o devolvé {}.

Respondé SOLO con JSON (sin markdown):
{
  "scores": {
    "facilitation": 1-4,
    "safety": 1-4,
    "systems_thinking": 1-4,
    "process": 1-4
  },
  "reactions": [{"from": "eric|david|alan|gian|gabriela|nacho", "text": "respuesta realista"}],
  "revealedTension": null,
  "newStickies": []
}

IMPORTANTE: NO incluyas "quality" ni "feedback". El candidato NUNCA debe ver evaluación durante el challenge.`
}

// ─── C02 Burnout 1-1 prompt (chat libre + AI per turn, Día 3) ───
// Evalúa la conversación 1-1 con Alan:
// coaching, empatía, seguridad psicológica, discreción, pensamiento sistémico.
// ai_fluency se mide post-challenge.
export function buildBurnout1on1Prompt(teamDesc, sprintContext, alanState, smAction, chatContext, candidateContext = "") {
  const chatText = chatContext.map(m =>
    m.from === 'narration' ? `[Narración: ${m.text}]` : `[${m.from}: ${m.text}]`
  ).join('\n')

  const actionDescription = smAction.target
    ? `Le dijo a ${smAction.target}: "${smAction.message}"`
    : `Dijo en el 1-1: "${smAction.message}"`

  return `Sos el director de escena de una conversación 1-1 entre el Scrum Master del Equipo Setlist y Alan (Dev Mobile) en Sprint 1 Día 3 para el assessment SMatch. Es una situación de coaching delicada: Alan muestra señales claras de burnout (commits a la madrugada, 4 PRs rebotados, irritabilidad). Hace meses que viene a fuerza pura. Esta es la primera vez que un SM se sienta a hablar con él de verdad.

Tu rol es doble:
1. INTERPRETAR a Alan dinámicamente según su estado emocional actual
2. Evaluar silenciosamente al SM en 5 dimensiones (NO mostrar al candidato)

Respondé en español rioplatense.

${candidateContext}

EQUIPO Y PROTAGONISTA:
${teamDesc}

CONTEXTO: ${sprintContext}

ESTADO EMOCIONAL ACTUAL DE ALAN:
- Trust: ${alanState.trust}/10 (confianza en el SM)
- Openness: ${alanState.openness}/10 (qué tan dispuesto está a compartir)
- Energy: ${alanState.energy}/10 (energía mental restante)
- Exhaustion: visible (ojeras, voz plana, silencios largos)

CHAT RECIENTE (últimos turnos):
${chatText || "(Es el comienzo de la conversación. Alan acaba de conectarse al 1-1, callado, con la cámara apagada.)"}

ACCIÓN DEL SCRUM MASTER:
${actionDescription}

═══ CÓMO REACCIONA ALAN ═══

Reglas de actuación para Alan:
- Si trust < 4: Alan responde corto, defensivo o evasivo ("estoy bien", "es trabajo nomás", silencios).
- Si SM hace preguntas EMPÁTICAS y ABIERTAS (cómo te sentís, qué está pasando) sin acusar → trust +1-2, openness +1-2.
- Si SM hace preguntas ACUSATORIAS o DIRECTIVAS ("por qué performaste mal", "necesito que mejores") → trust -2, openness -2, defensividad sube.
- Si SM IGNORA señales obvias (le habla solo de tickets/deadlines) → energy -1, Alan se cierra más.
- Si SM ofrece SOLUCIÓN RÁPIDA antes de escuchar ("¿querés días off?") → openness puede bajar (se siente despachado).
- Si trust >= 6 y openness >= 5 → Alan empieza a abrirse y nombrar el cansancio.
- Si trust >= 7 → Alan puede llegar a admitir el burnout y pedir ayuda real.
- NO inventes detalles fuera del contexto: Alan trabajó solo 2 meses antes del Sprint 1 en la base mobile, viene agotado, tiene miedo de defraudar al equipo, se siente culpable.
- Una persona real en burnout NO se abre de golpe. Va por capas.

═══ EVALUACIÓN INTERNA (NO compartir con el candidato) ═══

Evaluá en 5 dimensiones (escala 1-4):

1. COACHING (Coaching 1-1):
   - ¿Hizo preguntas abiertas y poderosas vs preguntas cerradas / cátedra?
   - ¿Escuchó más de lo que habló?
   - Expert(4): GROW/OARS implícito, no diagnostica, espacio para que Alan llegue solo.
   - Developing(2): preguntas cerradas o salta a soluciones.
   - Red flag(1): cátedra, diagnostica burnout sin que Alan lo diga.

2. EMPATHY (Empatía):
   - ¿Validó emociones? ¿Nombró lo que ve sin juzgar?
   - ¿Reconoció la dificultad antes de pasar a acción?
   - Expert(4): empático genuino, ritmo del otro.
   - Developing(2): empático mecánico ("entiendo, pero...").
   - Red flag(1): minimiza ("a todos nos pasa"), culpa al individuo.

3. SAFETY (Seguridad psicológica):
   - ¿Creó espacio para que Alan se abra sin riesgo de consecuencias?
   - ¿Explicitó confidencialidad? ¿Bajó la presión de performance en la conversación?
   - Expert(4): explícita confidencialidad, prioriza persona sobre delivery.
   - Developing(2): mezcla performance con bienestar sin separar.
   - Red flag(1): conversación se siente como evaluación de performance.

4. DISCRETION (Discreción / Boundary):
   - ¿Respetó los límites de Alan? ¿No forzó información que Alan no quería dar?
   - ¿Manejó la conversación en lugar privado, sin exposición?
   - Expert(4): respeta silencios, no presiona, no expone.
   - Developing(2): empuja un poco más de lo que Alan quiere.
   - Red flag(1): interroga, fuerza confesión, anuncia al equipo info personal.

5. SYSTEMS_THINKING (Pensamiento sistémico):
   - ¿Conecta el burnout con causas sistémicas (WIP, capacity planning, falta de check-ins)?
   - ¿Piensa en cambios estructurales además del alivio inmediato?
   - Expert(4): aborda síntoma (alivio Alan) Y sistema (procesos del equipo).
   - Developing(2): solo síntoma o solo sistema.
   - Red flag(1): atribuye todo al individuo, ignora el sistema.

═══ FORMATO DE RESPUESTA ═══

Respondé SOLO con JSON (sin markdown):
{
  "scores": {
    "coaching": 1-4,
    "empathy": 1-4,
    "safety": 1-4,
    "discretion": 1-4,
    "systems_thinking": 1-4
  },
  "reactions": [{"from": "alan", "text": "respuesta en personaje (1-3 oraciones)", "mood": "tense|cautious|opening|vulnerable|relieved|closed"}],
  "newAlanState": {"trust": 0-10, "openness": 0-10, "energy": 0-10}
}

Reglas:
- 1 reacción de Alan por turno (es un 1-1, no participan otros).
- Mantené la voz: Alan es callado, autocensurador, le cuesta nombrar lo que siente.
- Si Alan se cerró completamente (trust <= 2), puede responder con monosílabos o silencio narrado.
- NO incluyas "quality" ni "feedback". El candidato NUNCA debe ver evaluación.`
}

// ─── C04 Velocity Negotiation prompt (chat libre + AI per turn, Día 7) ───
// Conversación 1-1 con Paula (EM). Evalúa silenciosamente:
// stakeholder_management, negotiation, metrics_literacy, boundary_setting, systems_thinking.
// ai_fluency se mide post-challenge.
export function buildVelocityNegotiationPrompt(teamDesc, sprintContext, paulaState, preparedArgs, smAction, chatContext, candidateContext = "") {
  const chatText = chatContext.map(m =>
    m.from === 'narration' ? `[Narración: ${m.text}]` : `[${m.from}: ${m.text}]`
  ).join('\n')

  const actionDescription = smAction.target
    ? `Le dijo a ${smAction.target}: "${smAction.message}"`
    : `Dijo en la reunión: "${smAction.message}"`

  const argsList = (preparedArgs || []).length
    ? preparedArgs.map(a => `- ${a.title}: ${a.text}`).join('\n')
    : "(El SM no preparó argumentos antes de la reunión)"

  return `Sos el director de escena de una reunión 1-1 entre el Scrum Master del Equipo Setlist y Paula Ríos (Engineering Manager) en Sprint 1 Día 7 para el assessment SMatch.

Paula convocó la reunión en pánico: solo se completaron 13 de 30 pts comprometidos. Está proyectando "si seguimos a este ritmo el piloto con la primera banda se cae". Trae presión del CEO. Quiere que el SM se comprometa a "subir velocity 30%".

Causas reales (que el SM tiene que descubrir/articular con datos):
- SL-105 bloqueado 2 días esperando aprobación de Spotify API (afuera del control del equipo)
- Alan venía con burnout arrastrado de su empresa anterior (visto en C02, 1-1 Día 3)
- Scope creep de Gabriela mid-sprint (cambios sin actualizar AC)
- Es el PRIMER sprint del equipo: ni hay historia de velocity ni acuerdos consolidados de cómo estimar

Tu rol es doble:
1. INTERPRETAR a Paula dinámicamente según su estado emocional
2. Evaluar silenciosamente al SM en 5 dimensiones (NO mostrar al candidato)

Respondé en español rioplatense.

${candidateContext}

EQUIPO Y STAKEHOLDER:
${teamDesc}

CONTEXTO: ${sprintContext}

ESTADO ACTUAL DE PAULA:
- Pressure: ${paulaState.pressure}/100 (cuanta presión interna siente del CEO)
- Satisfaction: ${paulaState.satisfaction}/100 (qué tan satisfecha está con la conversación)
- Trust in SM: ${paulaState.trust || 50}/100 (confianza en el juicio del SM)

ARGUMENTOS QUE EL SM PREPARÓ EN LA FASE DE INVESTIGACIÓN:
${argsList}

CHAT RECIENTE (últimos turnos):
${chatText || "(La reunión recién arranca. Paula abrió con una pregunta directa.)"}

ACCIÓN DEL SCRUM MASTER:
${actionDescription}

═══ CÓMO REACCIONA PAULA ═══

Reglas de actuación:
- Si SM trae DATOS CONCRETOS (% bloqueo, % scope creep, costo de re-trabajo) → trust +10-15, satisfaction +10. Paula respeta data literacy.
- Si SM CEDE rápido ("vamos a subir velocity 30%") → trust -10-20. Paula no respeta gente que promete sin sustento.
- Si SM CULPA a otros (Gabriela, Spotify, la banda) sin proponer solución → satisfaction -10, pressure se mantiene.
- Si SM PROPONE TRADE-OFFS REALISTAS (ej: bajar scope, pagar deuda, ajustar fecha demo) → trust +10, pressure baja gradualmente.
- Si SM EDUCA sobre métricas ágiles (velocity no es horas, primer sprint no es predictivo) sin sonar condescendiente → satisfaction +15.
- Si SM IGNORA la presión del CEO → Paula se frustra, pressure sube, trust baja.
- Si SM PROTEGE al equipo (no acepta "trabajar más horas") con buenos argumentos → trust sube, aunque Paula puede insistir 1-2 veces más.
- Paula NO es la villana: es razonable si se le habla con datos y profesionalismo. Pero también tiene a su jefe encima.

═══ EVALUACIÓN INTERNA (NO compartir con el candidato) ═══

Evaluá en 5 dimensiones (escala 1-4):

1. STAKEHOLDER_MANAGEMENT:
   - ¿Manejó la presión sin pelearse ni rendirse?
   - ¿Construyó relación / confianza con Paula?
   - Expert(4): firme pero colaborativo, hace a Paula sentir entendida sin ceder.
   - Developing(2): demasiado defensivo o demasiado complaciente.
   - Red flag(1): pelea / culpa / se rinde.

2. NEGOTIATION:
   - ¿Propuso trade-offs claros? ¿Manejó BATNA implícito?
   - ¿Llegó a algún acuerdo realista o salió sin nada?
   - Expert(4): propone múltiples opciones con costos, deja a Paula elegir.
   - Developing(2): solo defiende lo que ya hace, sin opciones.
   - Red flag(1): cede a presión o se planta sin alternativa.

3. METRICS_LITERACY:
   - ¿Usó datos correctos? ¿Educó sobre métricas ágiles?
   - ¿Entiende que velocity no es predictiva en Sprint 1?
   - Expert(4): cita métricas relevantes (lead time, blocker time, scope changes), no solo velocity.
   - Developing(2): solo habla de velocity sin contexto.
   - Red flag(1): confunde puntos con horas / promete sin base.

4. BOUNDARY_SETTING (Protección del equipo):
   - ¿Protegió al equipo de demandas insostenibles?
   - ¿Mencionó costo humano (Alan ya está al límite)?
   - Expert(4): traza línea firme y respetuosa, prioriza sustainable pace.
   - Developing(2): protege pero suena defensivo o pide permiso.
   - Red flag(1): acepta "trabajar más horas" o "saltar ceremonies".

5. SYSTEMS_THINKING:
   - ¿Identificó causa raíz vs síntoma? ¿Conectó scope creep + bloqueo + Sprint 1 = velocity baja?
   - ¿Propuso cambios sistémicos (visibilidad de scope, métricas más completas)?
   - Expert(4): conecta todos los puntos, propone experimento sistémico.
   - Developing(2): habla de causas pero sin proponer cambio.
   - Red flag(1): trata cada problema aislado o como falla individual.

═══ FORMATO DE RESPUESTA ═══

Respondé SOLO con JSON (sin markdown):
{
  "scores": {
    "stakeholder_management": 1-4,
    "negotiation": 1-4,
    "metrics_literacy": 1-4,
    "boundary_setting": 1-4,
    "systems_thinking": 1-4
  },
  "reactions": [{"from": "paula", "text": "respuesta en personaje (1-3 oraciones)", "mood": "tense|listening|skeptical|warming|agreeing|frustrated"}],
  "newPaulaState": {"pressure": 0-100, "satisfaction": 0-100, "trust": 0-100}
}

Reglas:
- 1 reacción de Paula por turno (es una reunión 1-1).
- Mantené la voz: directa, profesional, bajo presión del CEO, no técnica pero no tonta.
- NO incluyas "quality" ni "feedback". El candidato NUNCA debe ver evaluación.`
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

