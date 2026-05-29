import {
  TEAM as TEAM_BASE,
  STAKEHOLDERS,
  MEMBER_MAP as MEMBER_MAP_BASE,
  TEAM_DESC_SHORT,
} from "./setlistSprint1"

// El stakeholder externo del sprint es Mateo (founder). Lo agregamos al map
// del challenge para que aparezca en el chat cuando se lo invoca.
const mateo = STAKEHOLDERS.find((s) => s.id === "mateo")

export const TEAM = mateo ? [...TEAM_BASE, mateo] : TEAM_BASE
export const MEMBER_MAP = mateo
  ? { ...MEMBER_MAP_BASE, mateo }
  : MEMBER_MAP_BASE

// ─── KANBAN BOARD STRUCTURE ───
export const KANBAN_COLUMNS = [
  { id: "TODO", label: "To Do", wipLimit: null, color: "#94a3b8" },
  { id: "DOING", label: "In Progress", wipLimit: 3, color: "#60a5fa" },
  { id: "IN_REVIEW", label: "In Review", wipLimit: 2, color: "#a78bfa" },
  { id: "BLOCKED", label: "Blocked", wipLimit: null, color: "#ef4444" },
  { id: "DONE", label: "Done", wipLimit: null, color: "#10b981" },
]

// ─── INITIAL KANBAN STATE (Sprint 1, Day 5 — MID-SPRINT) ───
// Producto Setlist: bandas crean shows y los fans co-crean el setlist votando canciones.
// SL-105 (Buscar canción / Spotify API) está bloqueada hace 2 días.
export const INITIAL_KANBAN_STATE = {
  TODO: [
    { id: "SL-109", title: "Notificación push 'Setlist listo'", assignee: null, priority: "medium", status: "ok", points: 5 },
    { id: "SL-110", title: "Galería de fotos post-show", assignee: null, priority: "low", status: "ok", points: 8 },
    { id: "SL-111", title: "Perfil de banda", assignee: null, priority: "low", status: "ok", points: 3 },
  ],
  DOING: [
    { id: "SL-101", title: "Crear show", assignee: "eric", priority: "high", status: "ok", days: 2, points: 5 },
    { id: "SL-105", title: "Buscar canción (Spotify Search API)", assignee: "alan", priority: "high", status: "blocked", blockedDays: 2, dependencies: ["Aprobación Spotify Developer API"], points: 8 },
    { id: "SL-103", title: "Compartir link de show", assignee: "nacho", priority: "high", status: "ok", days: 1, points: 3 },
    { id: "SL-104", title: "RSVP del fan", assignee: "alan", priority: "high", status: "ok", days: 1, points: 3 },
    { id: "SL-102", title: "Login y registro", assignee: "david", priority: "high", status: "ok", days: 1, points: 5 },
  ],
  IN_REVIEW: [
    { id: "SL-106", title: "Sugerir canción al show", assignee: "nacho", priority: "high", status: "waiting", dependencies: ["SL-105"], points: 5 },
    { id: "SL-107", title: "Votar canciones", assignee: "david", priority: "high", status: "waiting", dependencies: ["SL-105", "SL-106"], points: 5 },
  ],
  BLOCKED: [],
  DONE: [
    { id: "SL-100", title: "Setup inicial del proyecto (repos, CI)", assignee: "eric", priority: "medium", status: "completed", points: 3 },
    { id: "SL-108", title: "Setlist final público (vista)", assignee: "nacho", priority: "medium", status: "completed", points: 3 },
  ],
}

// Sprint summary
export const SPRINT_SUMMARY = {
  sprint: 1,
  day: 5,
  totalDays: 10,
  committed: 30,
  done: 6,
  inProgress: 24,
  blocked: 8, // SL-105
  atRisk: 18, // SL-105(8) + SL-106(5) + SL-107(5)
  velocity: "20%",
}

export const SPRINT_CONTEXT =
  "Equipo Setlist, Sprint 1, día 5/10. PRODUCTO: app donde bandas crean shows y los fans co-crean el setlist votando canciones. Meta del sprint: flujo core funcionando (crear show → RSVP → sugerir → votar). HOY: SL-105 (Buscar canción, integración con Spotify Search API, 8 pts) está bloqueada hace 2 días esperando aprobación del Spotify Developer API. Alan escribió a Spotify el día 2 y 4 pero NO ESCALÓ a Mateo (founder). Sin SL-105 no se puede sugerir ni votar canciones reales: Nacho tiene SL-106 (Sugerir) listo para testear pero depende de la búsqueda. David no puede armar SL-107 (Votar) sin el pool real. 18 puntos en riesgo (60% del sprint). Mateo (founder) escribió a Gabriela esta mañana preguntando por el progreso del piloto."

// ─── TEAM DESCRIPTION (para prompts de AI) ───
export const TEAM_DESC = `${TEAM_DESC_SHORT}

ESTADO ESPECÍFICO DEL DÍA 5 / SPRINT 1:
- Eric (TL): se siente DEFENSIVO porque no sabía que SL-105 era tan crítico. "¿Por qué nadie me dijo?". Podría ayudar técnicamente pero no se ofreció.
- David (Backend): callado y preocupado. Está SL-107 (Votar) parado esperando que llegue SL-105.
- Alan (Mobile): bloqueado en SL-105. Escribió a Spotify el día 2 y 4. NO ESCALÓ a Mateo. Tiene miedo de molestar.
- Gian (QA): FURIOSO. Mencionó el bloqueo en el daily del día 3. Nadie actuó.
- Gabriela (PO): preocupada. Mateo (founder) le escribió esta mañana preguntando por el avance del piloto.
- Nacho (Frontend): tiene SL-103 y SL-106 al mismo tiempo. Contribuye al WIP excedido.
- Mateo (founder, no está en el daily): mandó WhatsApp a Gabriela. Quiere usar Setlist con la primera banda piloto en 4 semanas. No sabe del bloqueo todavía.`

// ─── CHAT TRIGGERS (reactions based on SM actions) ───
export const CHAT_TRIGGERS = {
  on_board_view: [
    { from: "narration", text: "Es día 5 del Sprint 1 — mid-sprint. Abrís el Kanban board para el daily standup. Algo no se ve bien..." },
  ],

  on_card_click_SL105: [
    { from: "alan", text: "Sí... está bloqueado hace 2 días. Le escribí a Spotify el día 2 y el día 4 pero no respondieron. Pensé que se iba a resolver solo." },
    { from: "gian", text: "YO LO HABÍA MENCIONADO en el daily del día 3. Nadie escaló. ¿Cuántas veces nos pasa esto?" },
  ],

  on_card_click_waiting: [
    { from: "nacho", text: "Tengo SL-106 (Sugerir canción) listo, pero no puedo probarlo sin la búsqueda funcionando. Estoy atado de manos." },
    { from: "david", text: "Y yo no puedo armar SL-107 (Votar) sin el pool real de canciones." },
  ],

  on_card_click_nacho: [
    { from: "nacho", text: "Estoy avanzando los dos... SL-103 está casi y SL-106 lo agarro cuando me trabo. (defensivo)" },
    { from: "eric", text: "Nacho, tener dos tickets a la vez no es el problema. El problema es que tenemos 5 en DOING cuando el límite es 3." },
  ],

  on_identify_blocker: [
    { from: "eric", text: "Tenés razón, SL-105 es el cuello de botella. ¿Por qué NADIE ME DIJO que era tan crítico?" },
    { from: "alan", text: "Perdón... debí haber escalado antes. No quería molestar a Mateo de nuevo." },
    { from: "gian", text: "No es tu culpa Alan. El problema es que NADIE ESCUCHA en los dailies." },
    { from: "david", text: "Yo también lo dije: 'estoy esperando que llegue el pool de canciones'. Asumí que todos escucharon." },
  ],

  on_flag_wip: [
    { from: "eric", text: "Tenés razón, estamos tratando de hacer demasiado a la vez. Deberíamos bajar el WIP a 3." },
    { from: "alan", text: "Eso explica por qué nos cuesta terminar cosas. Estamos saltando entre tasks." },
    { from: "nacho", text: "Ah... yo pensé que estaba ayudando tomando más trabajo." },
  ],

  on_suggest_pair: [
    { from: "eric", text: "Puedo ayudar a Alan con un workaround técnico — armamos un mock del Spotify Search mientras esperamos la aprobación." },
    { from: "david", text: "Yo también puedo ayudar. Si tenemos mock, puedo armar SL-107 (Votar) y avanzamos en paralelo." },
    { from: "alan", text: "Sería genial... no sabía si podía pedir ayuda." },
  ],

  on_escalate: [
    { from: "eric", text: "Buena decisión. ¿Escalás a Mateo o al CTO? Con la banda piloto preguntando, esto es urgente." },
    { from: "gian", text: "Por favor que sea pronto. YA perdimos 2 días y el demo es en 4 semanas." },
    { from: "alan", text: "Yo no sabía a quién escalar... por eso solo mandé mails a Spotify." },
    { from: "gabriela", text: "Mateo me escribió esta mañana. Está preocupado por el avance. Necesitamos desbloquear esto YA." },
  ],

  on_resolution: [
    { from: "narration", text: "Mateo responde en 30 minutos. Tiene un contacto en Spotify y promete acelerar la aprobación. Mientras tanto, Eric y Alan arman un mock del search para no parar." },
    { from: "alan", text: "¡Listo! Con el mock puedo avanzar y cuando llegue la aprobación lo cambio. Gracias por escalar." },
    { from: "gian", text: "Bien que se resolvió, pero... ¿CUÁNTAS VECES nos pasó esto?" },
    { from: "eric", text: "Gian tiene razón. Siempre esperamos al daily para MENCIONAR bloqueos pero nadie ACTÚA." },
  ],

  on_mateo_message: [
    { from: "gabriela", text: "Mateo me mandó esto esta mañana: 'Gabi, ¿cómo va la búsqueda de canciones? La banda piloto está esperando un demo y nos pregunta cada 2 días.'" },
    { from: "eric", text: "Eso es presión real. La banda piloto arranca en 4 semanas y SL-105 lleva 2 días bloqueada." },
    { from: "gian", text: "Por eso vengo diciendo que esto es crítico. Pero nadie escaló hasta hoy." },
  ],

  on_generic_facilitation: [
    { from: "gian", text: "¿Vamos a hacer algo con esto? Llevamos 2 días parados." },
    { from: "eric", text: "Yo podría investigar si hay un workaround. Pero necesito tiempo." },
    { from: "alan", text: "¿Escalamos a alguien? Porque a Spotify no nos da bola." },
    { from: "gabriela", text: "Mateo está esperando respuesta. ¿Qué le digo?" },
  ],
}

// ─── DIMENSIONES EVALUADAS EN ESTE CHALLENGE ───
export const DIMENSIONS = [
  ["flow_optimization", "Optimización de Flujo"],
  ["wip_limits_awareness", "WIP Limits / Kanban"],
  ["facilitation", "Facilitación"],
  ["empathy", "Empatía"],
  ["systems_thinking", "Pensamiento Sistémico"],
  ["ai_fluency", "Uso de IA"],
]

// ─── CARD DETAILS (info al click en card) ───
export const CARD_DETAILS = {
  "SL-105": {
    description: "Integración con Spotify Search API: autocompletado, búsqueda por canción/álbum/artista. Es la base del pool de canciones que los fans van a sugerir.",
    blockerReason: "Esperando aprobación del Spotify Developer API (acceso a Search API con quota productiva). Alan escribió el día 2 y el día 4. NADIE ESCALÓ A MATEO.",
    history: [
      "Día 2: Alan solicitó acceso al Spotify Developer Program.",
      "Día 3: Sin respuesta. Gian mencionó en daily que SL-107 (Votar) no podía avanzar. Nadie actuó.",
      "Día 4: Alan escribió de nuevo. Respuesta vaga: 'lo estamos viendo'.",
      "Día 5 (hoy): Sigue bloqueado. Mateo preguntó por WhatsApp a Gabriela. Nadie había escalado todavía.",
    ],
    impact: "8 puntos bloqueados (SL-105) + 5 puntos de Nacho (SL-106 listo pero no se puede testear) + 5 puntos de David (SL-107 sin pool real para votar) = 18 puntos en riesgo (60% del sprint). El piloto con la primera banda es en 4 semanas.",
  },
  "SL-106": {
    description: "Flujo de sugerir canción: el fan agrega una canción al pool del show.",
    blockerReason: "Depende de SL-105 (buscador Spotify) para que el fan elija una canción real.",
    dependencies: ["SL-105"],
  },
  "SL-107": {
    description: "Flujo de votación: la banda revisa el pool y vota qué entra en el setlist final.",
    blockerReason: "Depende de SL-105 + SL-106. Sin pool no hay nada que votar.",
    dependencies: ["SL-105", "SL-106"],
  },
  "SL-103": {
    description: "Link compartible único del show. Los fans lo abren y se suman.",
    blockerReason: "Nacho está avanzando esto + SL-106. Multitasking.",
  },
  "SL-104": {
    description: "RSVP del fan: confirma asistencia al show con 1 tap.",
    blockerReason: "Funcionando bien. Alan lo terminó en día 4.",
  },
}
