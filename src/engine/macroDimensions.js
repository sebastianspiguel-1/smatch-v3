// ═══════════════════════════════════════════════════
// MACRO DIMENSIONS
// ═══════════════════════════════════════════════════
//
// Los challenges generan scores granulares (4-5 sub-dimensiones cada uno).
// Para el reporte y el radar consolidamos en 6 dimensiones macro que cubren
// todas las habilidades de un Scrum Master.
//
// Las sub-dimensiones siguen disponibles a nivel challenge para el recruiter
// que quiere mirar el detalle (cards de challenge breakdown).
// ═══════════════════════════════════════════════════

export const MACRO_DIMENSIONS = [
  "Facilitación",
  "Coaching & Empatía",
  "Pensamiento Sistémico",
  "Procesos & Estimación",
  "Stakeholders & Negociación",
  "Uso de IA",
]

// Mapeo de label específica (en español, como vienen de cada challenge)
// hacia su dimensión macro.
const MAP = {
  // ─── Facilitación ───
  "Facilitación": "Facilitación",
  "Facilitation": "Facilitación",

  // ─── Coaching & Empatía ───
  "Coaching 1-1": "Coaching & Empatía",
  "Coaching": "Coaching & Empatía",
  "Empatía": "Coaching & Empatía",
  "Empathy": "Coaching & Empatía",
  "Seguridad Psicológica": "Coaching & Empatía",
  "Psychological Safety": "Coaching & Empatía",
  "Discreción / Boundary": "Coaching & Empatía",
  "Discretion": "Coaching & Empatía",

  // ─── Pensamiento Sistémico ───
  "Pensamiento Sistémico": "Pensamiento Sistémico",
  "Systems Thinking": "Pensamiento Sistémico",
  "Systems": "Pensamiento Sistémico",

  // ─── Procesos & Estimación ───
  "Diseño de Procesos": "Procesos & Estimación",
  "Process": "Procesos & Estimación",
  "Process Mastery": "Procesos & Estimación",
  "Bias Coaching": "Procesos & Estimación",
  "Flow Optimization": "Procesos & Estimación",
  "WIP Limits Awareness": "Procesos & Estimación",

  // ─── Stakeholders & Negociación ───
  "Gestión de Stakeholders": "Stakeholders & Negociación",
  "Stakeholder Management": "Stakeholders & Negociación",
  "Negociación": "Stakeholders & Negociación",
  "Negotiation": "Stakeholders & Negociación",
  "Literacy de Métricas": "Stakeholders & Negociación",
  "Metrics Literacy": "Stakeholders & Negociación",
  "Protección del Equipo": "Stakeholders & Negociación",
  "Boundary Setting": "Stakeholders & Negociación",

  // ─── Uso de IA ───
  "Uso de IA": "Uso de IA",
  "AI Fluency": "Uso de IA",
}

// Mapea una dimensión granular a la macro. Si no hay mapping, devuelve null
// (el reporte la ignora para el radar).
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
