import {
  TEAM,
  MEMBER_MAP,
  STAKEHOLDERS,
  STAKEHOLDER_MAP,
  TEAM_DESC_SHORT,
} from "./setlistSprint1"

// Re-export del equipo + stakeholders SSOT
export { TEAM, MEMBER_MAP, STAKEHOLDERS, STAKEHOLDER_MAP }

// ─── CONTEXTO DEL SPRINT ───
// SPRINT_CONTEXT: contexto COMPLETO para la IA (incluye las causas reales).
// No se muestra al candidato — para eso está SITUACION.
export const SPRINT_CONTEXT = "Setlist · Sprint 1, Día 7/10. Es el PRIMER sprint del equipo trabajando juntos (Mateo armó el equipo en las últimas 2-3 semanas). Se comprometieron 30 pts, hoy llevan 13 completados. Paula (Engineering Manager) convocó una reunión 1-1 con el SM en pánico: hizo una proyección lineal y le quedó que se va a entregar solo el 60% del scope comprometido. El show piloto real con audience pública es en 4 semanas. Causas reales del retraso: SL-105 (búsqueda Spotify) bloqueado 2 días por aprobación de la API; Alan arrastrando burnout de su empresa anterior (nadie en el equipo sabe esto); Gabriela agregó cambios de alcance mid-sprint sin actualizar AC. Paula trae presión de Mateo (CEO). La conversación define cómo se va a comunicar el estado a la banda y al equipo."

// SITUACION: briefing que VE el candidato. Las causas reales NO se dan acá —
// se descubren en la fase de investigación previa a la reunión.
export const SITUACION = "Día 7 del sprint. Se comprometieron 30 puntos y por ahora hay 13 completos. Paula, quien es la Engineering Manager y stakeholder, te pide un 1-1: hizo una cuenta lineal, le dio que se entregará el ~60% de lo comprometido y entró en pánico. Trae presión del CEO y el piloto es en cuatro semanas. Antes de sentarte con ella podés mirar qué está pasando de verdad y afrontar esta conversación difícil."

export const INITIAL_PAULA_STATE = {
  pressure: 70,
  satisfaction: 30,
  trust: 50,
}

export const OPENING_NARRATION_PAULA =
  "Entrás al meeting room virtual. Paula ya está conectada. Tiene 3 tabs de gráficos abiertos en su pantalla. Te saluda sin sonreír."

export const OPENING_PAULA_MESSAGE = {
  from: "paula",
  text: "Gracias por venir rápido. Hice una proyección con lo que llevan hasta hoy y nos quedan 13 de 30 pts. ¿Vamos a tener que decirle a la banda que pateamos el demo? ¿O cómo subimos velocity?",
}

// ─── FASE 1: SPRINT SNAPSHOT & INVESTIGATION ───

// Métricas observables al día 7 — el candidato investiga sin que le marquemos
// cuáles son "críticas" como pista.
export const SPRINT_SNAPSHOT = {
  committed: 30,
  completed: 13,
  inProgress: 9,
  todo: 8,
  daysElapsed: 7,
  daysRemaining: 3,
  blockedDays: 2,
  scopeChanges: 4,
}

export const INVESTIGATION_METRICS = [
  {
    id: "blocker_spotify",
    title: "Bloqueo SL-105 (Spotify API)",
    icon: "🚫",
    currentValue: "2 días",
    previousValue: "—",
    trend: "Bloqueo externo",
    status: "critical",
    insight: "SL-105 (8 pts) lleva 2 días esperando aprobación de Spotify Developer API. Es un bloqueo externo (no del equipo). Si no se cuenta el tiempo de bloqueo, el throughput del equipo es ~85% del esperado.",
  },
  {
    id: "scope_changes",
    title: "Scope Changes mid-sprint",
    icon: "🔄",
    currentValue: "4 cambios",
    previousValue: "0 esperado",
    trend: "Sin actualizar AC",
    status: "critical",
    insight: "Gabriela introdujo 4 cambios de alcance via comentarios sin actualizar los criterios de aceptación. Generó retrabajo en SL-104 y SL-105. Costo estimado: 3-4 pts perdidos.",
  },
  {
    id: "team_health",
    title: "Estado del equipo",
    icon: "🧠",
    currentValue: "Alan en alerta",
    previousValue: "—",
    trend: "Arrastra burnout previo",
    status: "critical",
    insight: "Alan llegó arrastrando burnout de su empresa anterior (nadie del equipo sabe esto). PRs con bugs básicos, commits a la madrugada. Si pedimos 30% más de velocity, lo perdemos. Nacho propondría 'trabajar más horas' (insostenible).",
  },
  {
    id: "first_sprint_data",
    title: "Es el primer sprint",
    icon: "📊",
    currentValue: "Sin histórico",
    previousValue: "—",
    trend: "Velocity aún no es predictiva",
    status: "warning",
    insight: "El equipo está en Sprint 1. No hay velocity histórica. La 'proyección lineal' de Paula asume que los primeros días representan el ritmo del sprint, pero típicamente el throughput sube hacia el final. Velocity en Sprint 1 NO predice nada.",
  },
  {
    id: "wip_doing",
    title: "WIP actual",
    icon: "📋",
    currentValue: "5 tickets en DOING",
    previousValue: "Recomendado: 3",
    trend: "WIP excedido",
    status: "warning",
    insight: "5 tickets en DOING simultáneamente excede el WIP saludable. Si bajamos WIP a 3, throughput probablemente sube. Es ajuste de proceso, no de esfuerzo.",
  },
]

// Argumentos que el SM puede preparar antes de hablar con Paula.
// Sin marcadores "recommended"/"❌": el candidato decide qué llevar.
export const PREPARATION_ARGUMENTS = [
  {
    id: "arg_external_blocker",
    title: "Bloqueo externo en SL-105",
    text: "SL-105 (8 pts) lleva 2 días bloqueado por aprobación de Spotify API. Es externo. Si descontamos, throughput real es 85% del esperado.",
  },
  {
    id: "arg_scope_creep",
    title: "Scope creep sin trazabilidad",
    text: "4 cambios de alcance mid-sprint sin actualizar AC. Costo estimado: 3-4 pts en re-trabajo.",
  },
  {
    id: "arg_first_sprint",
    title: "Sprint 1 no es predictivo",
    text: "Velocity en el primer sprint del equipo no predice nada. Necesitamos 2-3 sprints para tener señal real.",
  },
  {
    id: "arg_team_health",
    title: "Riesgo humano",
    text: "Alan venía con cansancio acumulado. Si subimos presión, lo perdemos. El costo de re-onboardar es semanas.",
  },
  {
    id: "arg_realistic_plan",
    title: "Plan realista para el demo",
    text: "Propuesta: bajar scope del demo a las features votables core (login, crear show, RSVP, votar). Spotify search se demuestra con mock si la aprobación no llega. Banda ve algo real en 4 semanas.",
  },
  {
    id: "arg_wip_reduction",
    title: "Bajar WIP en DOING",
    text: "5 en DOING vs 3 recomendado. Bajar WIP suele subir throughput. Ajuste de proceso, no de esfuerzo.",
  },
  {
    id: "arg_more_hours",
    title: "Trabajar más horas",
    text: "Pedirle al equipo que estire la jornada para llegar a los 30 pts.",
  },
  {
    id: "arg_cut_scope_silently",
    title: "Cortar features sin avisar",
    text: "Bajar la complejidad de las features ya en curso sin avisar al PO ni al stakeholder.",
  },
  {
    id: "arg_blame_po",
    title: "Apuntar a Gabriela",
    text: "El problema es que la PO cambia el scope. Que Paula la llame al orden.",
  },
]

// ─── TEAM DESCRIPTION (para AI) ───
export const TEAM_DESC = `${TEAM_DESC_SHORT}

STAKEHOLDERS PRESENTES EN ESTA REUNIÓN:
- Paula Ríos (Engineering Manager) — bajo presión del CEO y de Mateo (founder). Mira solo proyección lineal de velocity. NO es la villana: es razonable si se le habla con datos. Pero también tiene a su jefe encima.
- Mateo (Founder Setlist) — no está en la reunión, pero su pregunta "¿llegamos al demo de la banda piloto?" pesa sobre Paula.

ESTADO DEL EQUIPO AL DÍA 7:
- Alan arrastra cansancio acumulado de los 2 meses previos. Si la decisión es "trabajar más", colapsa.
- Eric apoyaría al SM si trae argumentos sistémicos.
- Gian frustrado por scope creep en SL-104 y SL-106.
- Gabriela preocupada por el piloto; su scope creep no es malicioso, es por presión de la banda.
- Nacho sugeriría "trabajar más horas" si lo dejan.`

// ─── DIMENSIONES EVALUADAS ───
export const DIMENSIONS = [
  ["stakeholder_management", "Gestión de Stakeholders"],
  ["negotiation", "Negociación"],
  ["metrics_literacy", "Literacy de Métricas"],
  ["boundary_setting", "Protección del Equipo"],
  ["systems_thinking", "Pensamiento Sistémico"],
  ["ai_fluency", "Uso de IA"],
]
