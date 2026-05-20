// ═══════════════════════════════════════════════════
// MACRO DIMENSIONS
// ═══════════════════════════════════════════════════
//
// Los challenges generan scores granulares (4-5 sub-dimensiones cada uno).
// Para el reporte y el radar consolidamos en 6 dimensiones macro que cubren
// todas las habilidades de un Scrum Master / PM.
//
// Las sub-dimensiones siguen disponibles a nivel challenge para el recruiter
// que quiere mirar el detalle (cards de challenge breakdown).
// ═══════════════════════════════════════════════════

export const MACRO_DIMENSIONS = [
  "Facilitación",
  "Coaching Humano",
  "Pensamiento Sistémico",
  "Dominio Scrum",
  "Stakeholders",
  "Fluidez IA",
]

// Mapeo de label específica (como vienen de cada challenge) a su dimensión macro.
const MAP = {
  // ─── Facilitación ───
  "Facilitación": "Facilitación",
  "Facilitation": "Facilitación",

  // ─── Coaching Humano ───
  "Coaching 1-1": "Coaching Humano",
  "Coaching": "Coaching Humano",
  "Empatía": "Coaching Humano",
  "Empathy": "Coaching Humano",
  "Seguridad Psicológica": "Coaching Humano",
  "Psychological Safety": "Coaching Humano",
  "Discreción / Boundary": "Coaching Humano",
  "Discretion": "Coaching Humano",

  // ─── Pensamiento Sistémico ───
  "Pensamiento Sistémico": "Pensamiento Sistémico",
  "Systems Thinking": "Pensamiento Sistémico",
  "Systems": "Pensamiento Sistémico",

  // ─── Dominio Scrum (procesos, estimación, flujo, sesgos cognitivos) ───
  "Diseño de Procesos": "Dominio Scrum",
  "Process": "Dominio Scrum",
  "Process Mastery": "Dominio Scrum",
  "Process Mastery (Scrum)": "Dominio Scrum",
  "Bias Coaching": "Dominio Scrum",
  "Coaching de Sesgos": "Dominio Scrum",
  "Flow Optimization": "Dominio Scrum",
  "Optimización de Flujo": "Dominio Scrum",
  "WIP Limits Awareness": "Dominio Scrum",
  "WIP Limits / Kanban": "Dominio Scrum",

  // ─── Stakeholders (gestión, negociación, métricas, protección equipo) ───
  "Gestión de Stakeholders": "Stakeholders",
  "Stakeholder Management": "Stakeholders",
  "Negociación": "Stakeholders",
  "Negotiation": "Stakeholders",
  "Literacy de Métricas": "Stakeholders",
  "Metrics Literacy": "Stakeholders",
  "Protección del Equipo": "Stakeholders",
  "Boundary Setting": "Stakeholders",

  // ─── Fluidez IA ───
  "Uso de IA": "Fluidez IA",
  "AI Fluency": "Fluidez IA",
  "Fluidez IA": "Fluidez IA",
}

// Mapea una dimensión granular a la macro. Si no hay mapping, devuelve null.
export function toMacroDimension(label) {
  return MAP[label] || null
}

// Recibe el array de scores por challenge (todos los resultados) y devuelve
// el array consolidado de 6 dimensiones macro listo para el radar.
export function consolidateToMacro(results) {
  const buckets = {}
  for (const macro of MACRO_DIMENSIONS) buckets[macro] = []

  for (const r of results) {
    for (const s of r.scores || []) {
      const macro = toMacroDimension(s.dimension)
      if (macro && typeof s.score === "number") {
        buckets[macro].push(s.score)
      }
    }
  }

  return MACRO_DIMENSIONS.map((macro) => {
    const scores = buckets[macro]
    const avg = scores.length
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0
    return { dimension: macro, score: avg, fullMark: 100, sampleCount: scores.length }
  })
}
