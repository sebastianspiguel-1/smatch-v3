// ═══════════════════════════════════════════════════
// SEED MOCK JOURNEY
// ═══════════════════════════════════════════════════
//
// Pobla un candidato completo con resultados realistas de los 5 challenges
// + profile insights + AI Coach usage. Sirve para validar el reporte
// end-to-end sin tener que jugar todos los challenges manualmente.
//
// Los resultados se guardan en localStorage bajo `smatch_mock_results_<id>`.
// El CandidateReport los lee desde ahí en lugar de Supabase si existen.
// ═══════════════════════════════════════════════════

import {
  resetProfile,
  updateProfile,
  logAICoachUsage,
  DEFAULT_CANDIDATE_ID,
} from "../engine/candidateProfile"

export const MOCK_RESULTS_KEY_PREFIX = "smatch_mock_results_"

// ─── Resultados por challenge (orden cronológico Sprint 1) ───
// Candidato "competente con margen de mejora": fortalezas en facilitación,
// debilidad en coaching/stakeholder. Provoca que el reporte muestre highlights,
// dimensiones mixtas y al menos 1 área a desarrollar.

const JOURNEY = [
  // ─── C04 · Día 1 · Kickoff & Planning ───
  {
    challenge_id: 4,
    minutes_ago: 95,
    time_used: 920,
    scores: [
      { dimension: "Process Mastery", score: 82, fullMark: 100 },
      { dimension: "Bias Coaching", score: 70, fullMark: 100 },
      { dimension: "Facilitación", score: 85, fullMark: 100 },
      { dimension: "Pensamiento Sistémico", score: 72, fullMark: 100 },
      { dimension: "Uso de IA", score: 75, fullMark: 100 },
    ],
    feedback: [
      {
        action: "agreement_proposal",
        target: "team",
        message: "¿Cómo nos comunicamos cuando algo bloquea?",
        scores: { facilitation: 4, process: 3 },
      },
      {
        action: "chat_message",
        target: "Alan",
        message: "Alan, ¿qué te parece este criterio de DoR?",
        scores: { facilitation: 4, safety: 3 },
      },
      {
        action: "tool_explanation",
        target: null,
        message: "T-shirt sizing: estimás relativo, no absoluto",
        scores: { process: 3, facilitation: 3 },
      },
      {
        action: "bias_intervention",
        target: "Eric",
        message: "Esperemos a que voten todos antes de mostrar.",
        scores: { bias_coaching: 3, facilitation: 3 },
      },
    ],
    grade: { letter: "B", avg: 77, color: "#2563eb", label: "Scrum Master Competente" },
    profile_update: {
      communication_style: "balanced",
      insights: {
        patterns: ["invita voces calladas explícitamente"],
        strengths: ["facilita decisión grupal sin imponer"],
        weaknesses: ["pierde algunas oportunidades de coachear sesgos cognitivos"],
        notable_moments: [
          { challenge: "C04", note: "Detectó anclaje cuando Alan iba a copiar la estimación de Eric en SL-105 (Buscar canción)." },
        ],
      },
      challenge_history: [
        {
          challenge: "C04",
          challenge_name: "Día 1 · Kickoff & Planning",
          completed_at: new Date().toISOString(),
          ai_fluency_score: 3,
          ai_fluency_rationale: "Usó el coach 2 veces para estructurar cómo explicar story points. Sintetizó, no copió.",
        },
      ],
    },
    coach_interactions: [
      {
        challenge: "Día 1 · Kickoff & Planning",
        sm_question: "¿Cómo explico story points sin que suene a cátedra?",
        coach_response: "¿Qué intuición tenés vos sobre por qué los puntos no son horas? Si lo explicás desde eso, el equipo lo va a vivir distinto.",
      },
      {
        challenge: "Día 1 · Kickoff & Planning",
        sm_question: "Eric domina la conversación. ¿Cómo bajo el volumen sin ofenderlo?",
        coach_response: "¿Qué pasa si en vez de bajarle a él, le subís a los demás? ¿Quién no habló todavía y por qué?",
      },
    ],
  },

  // ─── C03 · Día 3 · 1-1 con Alan ───
  {
    challenge_id: 3,
    minutes_ago: 75,
    time_used: 840,
    scores: [
      { dimension: "Coaching 1-1", score: 68, fullMark: 100 },
      { dimension: "Empatía", score: 78, fullMark: 100 },
      { dimension: "Seguridad Psicológica", score: 82, fullMark: 100 },
      { dimension: "Discreción / Boundary", score: 80, fullMark: 100 },
      { dimension: "Pensamiento Sistémico", score: 70, fullMark: 100 },
      { dimension: "Uso de IA", score: 75, fullMark: 100 },
    ],
    feedback: [
      {
        action: "chat_message",
        target: "Alan",
        message: "Alan, antes de hablar de tickets, ¿cómo estás vos?",
        scores: { empathy: 4, safety: 4, coaching: 3 },
      },
      {
        action: "chat_message",
        target: "Alan",
        message: "Te escucho. ¿Hace cuánto venís así?",
        scores: { coaching: 3, empathy: 3, safety: 3 },
      },
      {
        action: "chat_message",
        target: "Alan",
        message: "¿Qué necesitarías para sostener esto?",
        scores: { coaching: 3, safety: 3 },
      },
      {
        action: "action_plan",
        target: null,
        message: 'immediate=["time_off","redistribute","pressure_stakeholders"] short=["wip_limit_personal","weekly_checkins"] long=["burnout_signals","culture_boundaries"]',
        scores: { systems_thinking: 3, discretion: 3 },
      },
    ],
    grade: { letter: "B", avg: 75, color: "#2563eb", label: "Scrum Master Competente" },
    profile_update: {
      insights: {
        patterns: ["abre con pregunta personal antes de hablar de performance"],
        strengths: ["crea espacio psicológicamente seguro rápido"],
        weaknesses: ["salta a ofrecer solución antes de profundizar (perdió 1 momento)"],
        notable_moments: [
          { challenge: "C03", note: "Alan se abrió sobre el burnout que traía de su trabajo anterior. SM respetó el silencio en lugar de empujar." },
        ],
      },
      challenge_history: [
        {
          challenge: "C03",
          challenge_name: "Día 3 · 1-1 con Alan",
          completed_at: new Date().toISOString(),
          ai_fluency_score: 4,
          ai_fluency_rationale: "Pidió al coach 1 sola pregunta clave para abrir la conversación. Después siguió por su cuenta. Uso preciso.",
        },
      ],
    },
    coach_interactions: [
      {
        challenge: "El dev que se está apagando",
        sm_question: "¿Cómo abro un 1-1 sin que parezca interrogatorio de performance?",
        coach_response: "¿Qué pregunta haría un amigo, no un manager? Y si esa pregunta te sale natural, ¿por qué no esa?",
      },
    ],
  },

  // ─── C02 · Día 5 · Daily con bloqueo ───
  {
    challenge_id: 2,
    minutes_ago: 55,
    time_used: 720,
    scores: [
      { dimension: "Flow Optimization", score: 85, fullMark: 100 },
      { dimension: "WIP Limits Awareness", score: 90, fullMark: 100 },
      { dimension: "Facilitación", score: 80, fullMark: 100 },
      { dimension: "Empatía", score: 72, fullMark: 100 },
      { dimension: "Pensamiento Sistémico", score: 78, fullMark: 100 },
      { dimension: "Uso de IA", score: 75, fullMark: 100 },
    ],
    feedback: [
      {
        action: "chat_message",
        target: "team",
        message: "Veo 5 tickets en DOING. ¿Antes de seguir, qué creen que pasa con el WIP?",
        scores: { wip_limits_awareness: 4, facilitation: 4, systems_thinking: 3 },
      },
      {
        action: "chat_message",
        target: "David",
        message: "David, ¿qué pasa con SL-105? Llevamos 2 días sin novedad.",
        scores: { flow_optimization: 4, empathy: 3, facilitation: 3 },
      },
      {
        action: "chat_message",
        target: "Eric",
        message: "Eric, ¿podés hacer pair con David hoy a la tarde mientras esperamos Spotify?",
        scores: { flow_optimization: 3, facilitation: 3 },
      },
      {
        action: "chat_message",
        target: "Gabriela",
        message: "Si Spotify no responde hoy, ¿qué historia podemos demostrar con mock en el piloto?",
        scores: { systems_thinking: 4, flow_optimization: 3 },
      },
    ],
    grade: { letter: "A", avg: 80, color: "#059669", label: "Scrum Master Experto" },
    profile_update: {
      insights: {
        patterns: ["lee el board antes de hablar"],
        strengths: ["detecta WIP overflow temprano", "propone planes B sin entrar en pánico"],
        notable_moments: [
          { challenge: "C02", note: "Detectó WIP excedido (5/3 en DOING) y el bloqueo no escalado de SL-105 (Spotify) sin que el equipo lo señalara." },
        ],
      },
      challenge_history: [
        {
          challenge: "C02",
          challenge_name: "Día 5 · Daily con bloqueo",
          completed_at: new Date().toISOString(),
          ai_fluency_score: 3,
          ai_fluency_rationale: "Una consulta al coach al inicio. Después facilitó solo.",
        },
      ],
    },
    coach_interactions: [
      {
        challenge: "El bloqueo que nadie escala",
        sm_question: "David no escala el bloqueo. ¿Lo confronto en público?",
        coach_response: "¿Qué creés que pasaría con la confianza del equipo si lo confrontás en público vs si lo notás vos primero?",
      },
    ],
  },

  // ─── C05 · Día 7 · Reunión con Paula (EM) ───
  {
    challenge_id: 5,
    minutes_ago: 35,
    time_used: 1020,
    scores: [
      { dimension: "Gestión de Stakeholders", score: 65, fullMark: 100 },
      { dimension: "Negociación", score: 70, fullMark: 100 },
      { dimension: "Literacy de Métricas", score: 82, fullMark: 100 },
      { dimension: "Protección del Equipo", score: 85, fullMark: 100 },
      { dimension: "Pensamiento Sistémico", score: 78, fullMark: 100 },
      { dimension: "Uso de IA", score: 80, fullMark: 100 },
    ],
    feedback: [
      {
        action: "chat_message",
        target: "Paula",
        message: "Paula, antes de comprometer un número, mostrame qué proyectaste y con qué supuestos.",
        scores: { metrics_literacy: 4, stakeholder_management: 3, negotiation: 3 },
      },
      {
        action: "chat_message",
        target: "Paula",
        message: "De los 17 pts pendientes, 8 están bloqueados por aprobación externa de Spotify. Si descuento eso, vamos en línea.",
        scores: { metrics_literacy: 4, boundary_setting: 3 },
      },
      {
        action: "chat_message",
        target: "Paula",
        message: "No puedo prometer +30%. Sí puedo proponer: bajar scope del demo a las 4 features votables core y demostrar Spotify con mock.",
        scores: { negotiation: 3, boundary_setting: 4, systems_thinking: 4 },
      },
      {
        action: "chat_message",
        target: "Paula",
        message: "Y necesito que cuando hables con el CEO, transmitas que Sprint 1 no es predictivo. Lo es a partir de Sprint 3.",
        scores: { metrics_literacy: 4, stakeholder_management: 3 },
      },
    ],
    grade: { letter: "B", avg: 76, color: "#2563eb", label: "Scrum Master Competente" },
    profile_update: {
      insights: {
        patterns: ["protege al equipo sin pelearse con el stakeholder"],
        strengths: ["argumenta con métricas concretas", "propone trade-offs en vez de defender"],
        weaknesses: ["puede sonar técnico/defensivo en momentos altos de presión"],
        notable_moments: [
          { challenge: "C05", note: "Rechazó +30% velocity argumentando con el bloqueo de SL-105 + scope creep en SL-104. Propuso mock de Spotify como plan B." },
        ],
      },
      challenge_history: [
        {
          challenge: "C05",
          challenge_name: "Día 7 · Reunión con Paula",
          completed_at: new Date().toISOString(),
          ai_fluency_score: 4,
          ai_fluency_rationale: "Usó el coach para reformular el mensaje antes de presentarlo. Sintetizó la respuesta del coach en sus propias palabras.",
        },
      ],
    },
    coach_interactions: [
      {
        challenge: "La presión de velocidad",
        sm_question: "Paula está en pánico y me pide +30%. ¿Cómo le digo que no sin que se sienta atacada?",
        coach_response: "¿Qué necesita Paula para sentir que la entendiste antes de escuchar un no? Si empezás por ahí, ¿el no es el mismo?",
      },
      {
        challenge: "La presión de velocidad",
        sm_question: "¿Qué métrica le importa más al CEO?",
        coach_response: "Más que adivinarlo, ¿qué métricas le diste a Paula para que ELLA pueda contarle al CEO?",
      },
    ],
  },

  // ─── C01 · Día 10 · Retro del Sprint 1 ───
  {
    challenge_id: 1,
    minutes_ago: 5,
    time_used: 1100,
    scores: [
      { dimension: "Facilitación", score: 88, fullMark: 100 },
      { dimension: "Seguridad Psicológica", score: 84, fullMark: 100 },
      { dimension: "Pensamiento Sistémico", score: 82, fullMark: 100 },
      { dimension: "Diseño de Procesos", score: 72, fullMark: 100 },
      { dimension: "Uso de IA", score: 75, fullMark: 100 },
    ],
    feedback: [
      {
        action: "chat_message",
        target: "team",
        message: "Antes de cerrar, hay 2 stickies con 5 votos cada una. ¿Qué nos están diciendo juntas?",
        scores: { facilitation: 4, systems_thinking: 4 },
      },
      {
        action: "chat_message",
        target: "Eric",
        message: "Eric, no te escuché todavía. ¿Qué ves vos en este tablero?",
        scores: { safety: 4, facilitation: 4 },
      },
      {
        action: "chat_message",
        target: "Gabriela",
        message: "Gabriela, hubo cambios de scope en comentarios. ¿Cómo lo manejamos sin que se pierda la trazabilidad?",
        scores: { facilitation: 4, safety: 3, systems_thinking: 4 },
      },
      {
        action: "chat_message",
        target: "team",
        message: "Action items: (1) Gabriela actualiza AC al final de cada cambio. (2) Gian revisa AC en planning. Owners y fecha next Friday.",
        scores: { process: 3, facilitation: 3 },
      },
    ],
    grade: { letter: "A", avg: 80, color: "#059669", label: "Scrum Master Experto" },
    profile_update: {
      insights: {
        patterns: ["conecta patrones cross-sticky", "invita voces calladas en el cierre"],
        strengths: ["pregunta socrática poderosa al final", "convierte tensión en acuerdo concreto"],
        weaknesses: ["los action items tienen owner pero les falta criterio de éxito"],
        notable_moments: [
          { challenge: "C01", note: "Conectó scope-in-comments (SL-104, SL-106) + deuda de documentación + carry-over de SL-105 en un único insight sistémico." },
          { challenge: "C01", note: "Eric (callado todo el sprint) habló por primera vez después de invitación explícita del SM." },
        ],
      },
      challenge_history: [
        {
          challenge: "C01",
          challenge_name: "Día 10 · Retro del Sprint 1",
          completed_at: new Date().toISOString(),
          ai_fluency_score: 3,
          ai_fluency_rationale: "Una sola consulta para confirmar el cierre con action items. Sintetizó.",
        },
      ],
    },
    coach_interactions: [
      {
        challenge: "La retro que parece perfecta",
        sm_question: "¿Cierro con acuerdos generales o forzando 1-2 concretos?",
        coach_response: "Si volvieras en 2 semanas a mirar la retro, ¿cuál de los dos te diría más sobre si pasó algo?",
      },
    ],
  },
]

// ─── Sembrar resultados + profile ───
export function seedMockJourney(candidateId = DEFAULT_CANDIDATE_ID) {
  // 1. Limpiar estado anterior
  resetProfile(candidateId)
  const resultsKey = MOCK_RESULTS_KEY_PREFIX + candidateId
  localStorage.removeItem(resultsKey)

  // 2. Construir results para el cache de localStorage (forma idéntica a Supabase)
  const now = Date.now()
  const results = JOURNEY.map((j) => ({
    candidate_id: candidateId,
    challenge_id: j.challenge_id,
    scores: j.scores,
    feedback: j.feedback,
    grade: j.grade,
    time_used: j.time_used,
    played_at: new Date(now - j.minutes_ago * 60 * 1000).toISOString(),
  }))
  localStorage.setItem(resultsKey, JSON.stringify(results))

  // 3. Actualizar profile (ordenado igual que jugaría el candidato)
  JOURNEY.forEach((j) => {
    if (j.profile_update) {
      updateProfile(candidateId, j.profile_update)
    }
    ;(j.coach_interactions || []).forEach((interaction) => {
      logAICoachUsage(candidateId, interaction)
    })
  })

  return {
    candidateId,
    results: results.length,
    challenges: JOURNEY.map((j) => j.challenge_id),
  }
}

// ─── Leer resultados mock (usado por CandidateReport) ───
export function getMockResults(candidateId) {
  const stored = localStorage.getItem(MOCK_RESULTS_KEY_PREFIX + candidateId)
  if (!stored) return null
  try {
    return JSON.parse(stored)
  } catch {
    return null
  }
}

// ─── Limpiar mock journey ───
export function clearMockJourney(candidateId = DEFAULT_CANDIDATE_ID) {
  resetProfile(candidateId)
  localStorage.removeItem(MOCK_RESULTS_KEY_PREFIX + candidateId)
}
