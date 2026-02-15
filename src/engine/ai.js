// ─── Motor de AI ───
// Todas las llamadas a Claude pasan por acá.
// En local llama directo a Anthropic, en prod usa el proxy /api/chat.

const API_URL = import.meta.env.PROD
  ? "/api/chat"
  : "https://api.anthropic.com/v1/messages"

export async function callAI(systemPrompt, userMessage) {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      }),
    })

    const data = await res.json()
    const text = data.content?.map(b => b.text || "").join("") || ""
    const clean = text.replace(/```json|```/g, "").trim()
    return JSON.parse(clean)
  } catch (e) {
    console.error("Error en llamada AI:", e)
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
{"quality":"expert|competent|developing|red_flag","scores":{${isActionPhase ? '"facilitation":1-4,"process":1-4,"coaching":1-4' : '"facilitation":1-4,"safety":1-4,"coaching":1-4,"systems":1-4,"process":1-4'}},"reactions":[{"from":"member_id","text":"respuesta realista en español"}],"feedback":"Evaluación breve en español de esta intervención","narration":"Descripción atmosférica en español de cómo reaccionó la sala"}

SCORING: Expert(4)=crea espacio sin dirigir, preguntas poderosas, conecta patrones, propone experimentos no mandatos, valida sin tomar partido. Competent(3)=buenos instintos pero pierde matices. Developing(2)=muy directivo/pasivo, salta a soluciones, trata síntomas. RedFlag(1)=cierra conversación, culpa individuos, usa autoridad, ignora temas.

Generá 2-4 reacciones realistas y en personaje. Que suenen como gente real hablando en una reunión.`
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
