import { TEAM, MEMBER_MAP, TEAM_DESC_SHORT } from "./setlistSprint1"

// Re-export del equipo SSOT
export { TEAM, MEMBER_MAP }

// ─── CONTEXTO DEL SPRINT ───
export const SPRINT_CONTEXT = "Setlist · Sprint 1, Día 3/10. El equipo arrancó hace 3 días. Alan (Dev Mobile) viene trabajando 2 meses SOLO en la base mobile antes de que el equipo se formara — fue contratado primero para dejar el shell listo. Está agotado. En el board sus tickets del Sprint 1 (SL-104 RSVP, SL-105 Buscar canción / Spotify, SL-110 Galería de fotos) están en DOING sin avanzar. Los últimos commits son a las 2-3am. Gian ya rebotó 2 PRs por bugs básicos que Alan nunca cometería. En el daily Alan dice 'está todo controlado'. El piloto con la primera banda arranca en 4 semanas y Alan es clave para el mobile. Es la primera semana del equipo y el SM ya empieza a ver señales."

// ─── TEAM DESCRIPTION (para prompts de AI) ───
export const TEAM_DESC = `${TEAM_DESC_SHORT}

ESTADO ESPECÍFICO DEL DÍA 3 / SPRINT 1:
- Alan (PROTAGONISTA): bloqueado en SL-105 (Spotify), también con SL-104 (RSVP) y SL-110 (Galería) en DOING. Trabajó 2 meses SOLO en la base mobile antes del Sprint 1. Trabaja 14h/día. PRs con bugs básicos. Se siente culpable, no se anima a pedir ayuda. En el daily dice "está todo controlado".
- Eric (TL): nota que Alan está raro pero no sabe cómo abordarlo; espera que el SM lo haga.
- David (Backend): empático pero no se mete en problemas de otros. Preocupado por Alan pero no dice nada.
- Gian (QA): tuvo que rechazar 2 PRs de Alan en 3 días por bugs simples (en SL-104 y SL-105). Está perdiendo la paciencia pero percibe que algo más pasa.
- Gabriela (PO): preocupada. La banda piloto pregunta cada 2 días por el mobile. Alan es clave para el lanzamiento.
- Nacho (Frontend): confundido. Alan le parece un crack y no entiende qué está pasando estos últimos días.`

// ─── FASE 1: DASHBOARD DE SEÑALES ───
// Las métricas describen comportamiento OBSERVABLE. No marcamos cuáles son "críticas"
// como pista — el candidato debe leer las señales por su cuenta.

export const DASHBOARD_METRICS = [
  {
    id: "commits",
    title: "Commits & Horarios de Trabajo",
    icon: "📊",
    status: "critical",
    summary: "Patrón irregular: 14 commits entre 11pm-3am en los últimos 3 días.",
    chartType: "timeline",
    data: [
      { week: "Semana -8", commits: 28, avgHour: 14, quality: "high" },
      { week: "Semana -6", commits: 35, avgHour: 18, quality: "high" },
      { week: "Semana -4", commits: 42, avgHour: 21, quality: "medium" },
      { week: "Semana -2", commits: 51, avgHour: 23, quality: "low" },
      { week: "Sprint 1 (días 1-3)", commits: 22, avgHour: 1.5, quality: "low" },
    ],
    details: [
      "14 commits entre 11pm - 3am en los primeros 3 días del sprint",
      "Patrón viene de las 8 semanas previas (construcción solitaria de la base mobile)",
      "Hora promedio de commit: 1:30am (antes del proyecto era 2pm)",
      "Commit messages cada vez más cortos ('fix', 'wip', 'try')",
      "No tuvo descanso entre los 2 meses solos y el Sprint 1",
    ],
  },
  {
    id: "prs",
    title: "Code Quality & PRs",
    icon: "🔍",
    status: "critical",
    summary: "2/3 PRs rebotados en 3 días por bugs básicos que Alan nunca cometía.",
    chartType: "bar",
    data: [
      { week: "Semana -4 (solo)", prsCreated: 8, prsRejected: 0, avgReviewRounds: 1.2 },
      { week: "Semana -2 (solo)", prsCreated: 10, prsRejected: 1, avgReviewRounds: 1.5 },
      { week: "Sprint 1 día 1-3", prsCreated: 3, prsRejected: 2, avgReviewRounds: 3.5 },
    ],
    details: [
      "PR-12: null checks faltantes en RSVP form",
      "PR-15: validación de input rota en búsqueda Spotify",
      "Sin tests adjuntos (antes Alan siempre incluía tests)",
      "Gian comentó en privado al SM: 'no entiendo, estos errores no son de Alan'",
      "3 tickets en DOING sin avanzar después de 3 días",
    ],
  },
  {
    id: "wellbeing",
    title: "Wellbeing & Comportamiento",
    icon: "🧠",
    status: "critical",
    summary: "Cámara apagada en dailies, respuestas cortantes en Slack, aislamiento.",
    chartType: "checklist",
    data: [
      { signal: "Horarios extremos de trabajo", detected: true, severity: "high" },
      { signal: "Calidad de trabajo cayendo", detected: true, severity: "high" },
      { signal: "Aislamiento del equipo", detected: true, severity: "medium" },
      { signal: "Tono más cortante / irritable", detected: true, severity: "medium" },
      { signal: "Sobrecarga: 3 tickets simultáneos", detected: true, severity: "high" },
      { signal: "Sin descanso visible entre proyectos", detected: true, severity: "high" },
    ],
    details: [
      "En el daily de hoy: cámara apagada, voz baja, respuestas de 5 palabras",
      "En Slack: respuestas cortantes ('no tengo tiempo', 'después miro')",
      "No participa en el chat del equipo desde que arrancó el sprint",
      "Eric comentó en privado: 'se ve cansado'",
      "Gabriela preocupada: 'Alan es clave, ¿algo le pasa?'",
    ],
  },
]

// ─── ESTADO INICIAL DEL 1-1 CON ALAN ───
export const INITIAL_ALAN_STATE = {
  trust: 3,
  openness: 2,
  energy: 2,
}

export const OPENING_NARRATION_1ON1 =
  "Agendaste un 1-1 con Alan. Se conecta a la call, cámara apagada. Hay un silencio incómodo de unos segundos. Es la primera vez que hablan a solas."

export const OPENING_ALAN_MESSAGE = {
  from: "alan",
  text: "Hola. ¿Querías hablar de algo?",
}

// ─── FASE 3: ACTION PLAN CHECKLIST ───
// Eliminamos `recommended: true` — el candidato decide qué hacer.
// El insight extractor lee las acciones elegidas como evidencia.

export const ACTION_PLAN_CATEGORIES = [
  {
    id: "immediate",
    title: "🚨 Acciones Inmediatas (hoy)",
    description: "¿Qué harías HOY después del 1-1?",
    color: "#ef4444",
  },
  {
    id: "short_term",
    title: "📅 Corto Plazo (este sprint)",
    description: "¿Qué cambios hay que hacer en el sprint actual?",
    color: "#f59e0b",
  },
  {
    id: "long_term",
    title: "🌱 Sistémico / Procesos",
    description: "¿Qué cambios estructurales propondrías?",
    color: "#10b981",
  },
]

export const ACTION_PLAN_OPTIONS = {
  immediate: [
    { id: "time_off", text: "Alan toma días off inmediatamente (3-5 días)" },
    { id: "redistribute", text: "Redistribuir tickets críticos de Alan a Eric/Nacho" },
    { id: "postpone", text: "Posponer SL-110 (galería) para próximo sprint" },
    { id: "reduce_meetings", text: "Liberar a Alan de meetings no esenciales" },
    { id: "pair_programming", text: "Asignar pair programming en sus tickets bloqueantes" },
    { id: "pressure_stakeholders", text: "Hablar con Gabriela sobre expectativas realistas con la banda piloto" },
    { id: "nothing_immediate", text: "No tomar acciones inmediatas (esperar a ver cómo evoluciona)" },
    { id: "force_off", text: "Forzarle el descanso aunque no lo pida" },
    { id: "share_with_team", text: "Contarle al equipo la situación personal de Alan" },
  ],
  short_term: [
    { id: "wip_limit_personal", text: "WIP limit personal para Alan (1 ticket a la vez)" },
    { id: "weekly_checkins", text: "Check-ins 1-1 semanales con Alan" },
    { id: "capacity_review", text: "Revisar capacity planning en la próxima retro" },
    { id: "pair_rotation", text: "Rotar pair programming para distribuir conocimiento mobile" },
    { id: "gradual_return", text: "Carga gradual cuando Alan vuelva (1 → 2 tickets)" },
    { id: "ignore_short", text: "Volver a carga normal apenas Alan dé señales" },
    { id: "performance_plan", text: "Plan de mejora de performance formalizado" },
  ],
  long_term: [
    { id: "burnout_signals", text: "Sistema de detección temprana (workload metrics)" },
    { id: "culture_boundaries", text: "Cultura donde esté bien decir 'no puedo más'" },
    { id: "wip_team", text: "WIP limits a nivel equipo (no solo individual)" },
    { id: "workload_visibility", text: "Workload visible en dailies (no solo 'estoy bien')" },
    { id: "capacity_buffer", text: "Buffer de 20% en capacity planning para imprevistos" },
    { id: "retro_topic", text: "Sustainable pace como tema fijo en retros" },
    { id: "ignore_systemic", text: "No implementar cambios sistémicos" },
  ],
}

// ─── DIMENSIONES EVALUADAS ───
export const DIMENSIONS = [
  ["coaching", "Coaching 1-1"],
  ["empathy", "Empatía"],
  ["safety", "Seguridad Psicológica"],
  ["discretion", "Discreción / Boundary"],
  ["systems_thinking", "Pensamiento Sistémico"],
  ["ai_fluency", "Uso de IA"],
]

// ─── BOARD STATE (usado en context briefing) ───
// Todos los IDs vienen del catálogo SSOT (SL-101 a SL-112).
export const BOARD_STATE = {
  doing: [
    { id: "SL-104", title: "RSVP del fan", assignee: "alan", days: 3, prs: 1, status: "PR rebotado por null checks", priority: "high", points: 3 },
    { id: "SL-105", title: "Buscar canción (Spotify Search API)", assignee: "alan", days: 3, prs: 1, status: "PR rebotado por validación rota", priority: "high", points: 8 },
    { id: "SL-110", title: "Galería de fotos post-show", assignee: "alan", days: 2, prs: 0, status: "Sin PRs aún", priority: "medium", points: 8 },
  ],
  blocked: [
    { id: "SL-106", title: "Sugerir canción al show", assignee: "nacho", blockedBy: "SL-105", priority: "high", points: 5 },
    { id: "SL-107", title: "Votar canciones", assignee: "david", blockedBy: "SL-105", priority: "high", points: 5 },
  ],
}
