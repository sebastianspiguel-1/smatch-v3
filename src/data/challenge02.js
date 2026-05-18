import { T } from "../theme"

// ─── EQUIPO SETLIST + CONTACTO EXTERNO ───
export const TEAM = [
  { id: "eric", name: "Eric", role: "Tech Lead", color: "#60a5fa", init: "ER" },
  { id: "david", name: "David", role: "Dev de Pagos", color: "#34d399", init: "DV" },
  { id: "alan", name: "Alan", role: "Dev Mobile", color: "#f472b6", init: "AL" },
  { id: "gian", name: "Gian", role: "QA", color: "#fb923c", init: "GI" },
  { id: "gabriela", name: "Gabriela", role: "Product Owner", color: "#a78bfa", init: "GA" },
  { id: "nacho", name: "Nacho", role: "Dev Frontend", color: "#fbbf24", init: "NA" },
  { id: "simon", name: "Simon (Lollapalooza)", role: "Contacto externo", color: "#8b5cf6", init: "SI" },
]

export const MEMBER_MAP = Object.fromEntries(TEAM.map(t => [t.id, t]))

// ─── KANBAN BOARD STRUCTURE ───
export const KANBAN_COLUMNS = [
  { id: "TODO", label: "To Do", wipLimit: null, color: "#94a3b8" },
  { id: "DOING", label: "In Progress", wipLimit: 3, color: "#60a5fa" },
  { id: "IN_REVIEW", label: "In Review", wipLimit: 2, color: "#a78bfa" },
  { id: "BLOCKED", label: "Blocked", wipLimit: null, color: "#ef4444" },
  { id: "DONE", label: "Done", wipLimit: null, color: "#10b981" }
]

// ─── INITIAL KANBAN STATE (Sprint 3, Day 7) ───
export const INITIAL_KANBAN_STATE = {
  "TODO": [
    { id: "SL-110", title: "Refactorizar editor de setlists para mejor UX", assignee: null, priority: "low", status: "ok", points: 3 },
    { id: "SL-111", title: "Actualizar documentación onboarding artistas", assignee: null, priority: "low", status: "ok", points: 2 },
    { id: "SL-112", title: "Crear widgets dashboard para venues", assignee: null, priority: "medium", status: "ok", points: 5 }
  ],
  "DOING": [
    { id: "SL-101", title: "Implementar rate limiting en endpoints de API", assignee: "eric", priority: "high", status: "ok", days: 2, points: 5 },
    { id: "SL-105", title: "Integrar procesamiento de pagos con Mercado Pago", assignee: "david", priority: "high", status: "blocked", blockedDays: 3, dependencies: ["API keys Finance team"], points: 8 },
    { id: "SL-103", title: "Implementar firma digital de contratos artista-venue", assignee: "nacho", priority: "high", status: "ok", days: 1, points: 5 },
    { id: "SL-104", title: "Configurar notificaciones push para iOS y Android", assignee: "nacho", priority: "medium", status: "ok", days: 1, points: 3 },
    { id: "SL-109", title: "Habilitar carga de fotos de perfil de artistas", assignee: "alan", priority: "low", status: "ok", days: 1, points: 2 }
  ],
  "IN_REVIEW": [
    { id: "SL-106", title: "Desarrollar flujo completo de pago en app mobile", assignee: "alan", priority: "high", status: "waiting", dependencies: ["SL-105"], points: 5 },
    { id: "SL-107", title: "Crear tests E2E para flujo de transacciones", assignee: "gian", priority: "high", status: "waiting", dependencies: ["SL-105"], points: 3 }
  ],
  "BLOCKED": [],
  "DONE": [
    { id: "SL-100", title: "Desarrollar CRUD básico del módulo de shows", assignee: "alan", priority: "medium", status: "completed", points: 3 },
    { id: "SL-102", title: "Implementar validación de perfiles de artistas", assignee: "eric", priority: "high", status: "completed", points: 3 },
    { id: "SL-108", title: "Configurar pipeline CI/CD con GitHub Actions", assignee: "eric", priority: "medium", status: "completed", points: 2 },
    { id: "SL-113", title: "Auditar y aplicar security headers en backend", assignee: "david", priority: "high", status: "completed", points: 5 }
  ]
}

// Sprint summary
export const SPRINT_SUMMARY = {
  sprint: 3,
  day: 7,
  totalDays: 10,
  committed: 38,
  done: 21,
  inProgress: 23, // Cards in DOING
  blocked: 8,     // SL-105
  atRisk: 16,     // SL-105(8) + SL-106(5) + SL-107(3)
  velocity: "55%"
}

export const SPRINT_CONTEXT = "Equipo Setlist, Sprint 3, día 7/10. CONTEXT PREVIO: En Sprint 2, Nacho entregó SL-103 TARDE sin avisar. Alan hizo trabajo extra para cubrir pero NO lo mencionó en la retro. Simon (Lollapalooza) preguntó por el módulo de pagos y el equipo PROMETIÓ tenerlo en Sprint 3. HOY: Sprint 3 está en riesgo. SL-105 (integración Mercado Pago, 8 pts) bloqueado hace 3 días esperando API keys. David escribió al Finance team pero no escaló. Gian lo mencionó en el daily del día 5 pero nadie actuó. Alan y Gian están bloqueados esperando (16 puntos en riesgo, 42% del sprint). Simon mandó WhatsApp esta mañana preguntando por el estado. Nadie escaló hasta hoy."

// ─── TEAM DESCRIPTION (para prompts de AI) ───
export const TEAM_DESC = `Equipo de Setlist — startup de app mobile para artistas independientes latinoamericanos.

Eric (Tech Lead): brillante y directo, a veces cortante. Construyó el backend casi solo. Se siente DEFENSIVO porque no sabía que SL-105 era tan crítico. "¿Por qué nadie me dijo?" Podría ayudar a David técnicamente pero no se ofreció porque nadie le pidió.

David (Dev de Pagos): sólido y callado. Siempre entrega, pero está ASUSTADO de escalar porque teme decepcionar al equipo y eso lo paraliza. Bloqueado hace 3 días en SL-105 esperando API keys. Escribió al Finance team el día 4 y 6 pero NO ESCALÓ al CTO porque "no quería molestar".

Alan (Dev Mobile): creativo y preciso. Está FRUSTRADO porque tiene SL-106 listo para testear hace días pero nadie ve su trabajo. Dijo "cuando David termine" en el daily pero asumió que todos lo escucharon. En Sprint 2 hizo trabajo extra cuando Nacho entregó tarde, pero no lo mencionó en la retro.

Gian (QA): meticuloso y FURIOSO. Detecta problemas antes que nadie pero raramente le hacen caso hasta que algo falla en producción. MENCIONÓ el bloqueo de SL-105 en el daily del día 5 pero nadie actuó. Se siente invisible en el equipo.

Gabriela (Product Owner): conecta bien con artistas y venues pero genera scope creep constantemente. Recibió un WhatsApp de Simon (Lollapalooza) esta mañana preguntando por el módulo de pagos. Está preocupada porque el equipo PROMETIÓ tenerlo en Sprint 3.

Nacho (Dev Frontend): entusiasta y rápido, pero sobreestima su velocidad. Tiene 2 tickets en DOING (SL-103 y SL-104), contribuyendo al WIP limit excedido. En Sprint 2 entregó SL-103 TARDE, obligando a Alan a hacer trabajo extra.

Simon (Contacto Lollapalooza): organizador del festival, contacto externo. Le mandó WhatsApp a Gabriela esta mañana preguntando por el estado del módulo de pagos. El piloto es en 5 semanas y está preocupado.`

// ─── CHAT TRIGGERS (reactions based on SM actions) ───
export const CHAT_TRIGGERS = {
  // Initial board view
  on_board_view: [
    { from: "narration", text: "Es día 7 del Sprint 3. Abrís el Kanban board para el daily standup. Algo no se ve bien..." }
  ],

  // Click on blocked card SL-105
  on_card_click_SL105: [
    { from: "david", text: "Sí... ese ticket está bloqueado hace 3 días. Le escribí al Finance team el día 4 pero no respondieron. Pensé que se iba a resolver solo." },
    { from: "gian", text: "YO LO HABÍA MENCIONADO en el daily del día 5. Nadie escaló. ¿Cuántas veces nos pasa esto?" }
  ],

  // Click on waiting cards (SL-106 or SL-107)
  on_card_click_waiting: [
    { from: "alan", text: "Tengo el flujo de pago mobile listo, pero no puedo probarlo sin la integración de Mercado Pago funcionando. Estoy atado de manos." },
    { from: "gian", text: "Exacto. No puedo correr los tests de transacciones sin SL-105. Y Simon está preguntando por esto..." }
  ],

  // Click on Nacho's cards (WIP issue)
  on_card_click_nacho: [
    { from: "nacho", text: "Estoy avanzando los dos... SL-103 está casi y SL-104 lo agarro cuando me trabo. (defensivo)" },
    { from: "eric", text: "Nacho, tener dos tickets a la vez no es el problema. El problema es que tenemos 5 en DOING cuando el límite es 3." }
  ],

  // Identify blocker action
  on_identify_blocker: [
    { from: "eric", text: "Tenés razón, SL-105 es el cuello de botella. ¿Por qué NADIE ME DIJO que era tan crítico?" },
    { from: "david", text: "Perdón... debí haber escalado antes. No quería molestar al Finance team de nuevo." },
    { from: "gian", text: "No es tu culpa David. El problema es que NADIE ESCUCHA en los dailies." },
    { from: "alan", text: "Yo lo dije: 'cuando David termine'. Asumí que todos escucharon que estaba bloqueado." }
  ],

  // Flag WIP limit
  on_flag_wip: [
    { from: "eric", text: "Tenés razón, estamos tratando de hacer demasiado a la vez. Deberíamos bajar el WIP a 3." },
    { from: "alan", text: "Eso explica por qué nos cuesta terminar cosas. Estamos saltando entre tasks." },
    { from: "nacho", text: "Ah... yo pensé que estaba ayudando tomando más trabajo." }
  ],

  // Suggest pair programming
  on_suggest_pair: [
    { from: "eric", text: "Puedo ayudar a David con un workaround técnico si hace falta. Mientras esperamos al Finance team." },
    { from: "alan", text: "Yo también puedo ayudar si necesitan. Tengo tiempo hasta que SL-105 se desbloquee." },
    { from: "david", text: "Sería genial... no sabía si podía pedir ayuda." }
  ],

  // Escalate to Finance team
  on_escalate: [
    { from: "eric", text: "Buena decisión. ¿Le escribís al CTO o directamente al Head of Finance? Con Simon preguntando, esto es urgente." },
    { from: "gian", text: "Por favor que sea pronto. YA perdimos 3 días y Lollapalooza es en 5 semanas." },
    { from: "david", text: "Yo no sabía A QUIÉN escalar... por eso solo mandé email al Finance team." },
    { from: "gabriela", text: "Simon me mandó WhatsApp esta mañana. Está preocupado por el módulo de pagos. Necesitamos desbloquear esto YA." }
  ],

  // After escalation resolved (AI can trigger this)
  on_resolution: [
    { from: "narration", text: "El CTO respondió en 20 minutos. Las API keys fueron generadas y enviadas a David. SL-105 está desbloqueada." },
    { from: "david", text: "¡Listo! Ya puedo seguir. Gracias por escalar." },
    { from: "gian", text: "Bien que se resolvió, pero... ¿CUÁNTAS VECES nos pasó esto?" },
    { from: "eric", text: "Gian tiene razón. Siempre esperamos al daily para MENCIONAR bloqueos pero nadie ACTÚA." },
    { from: "alan", text: "Y David escribió hace 3 días... nadie sabía que estaba bloqueado hasta hoy. El sistema falló." }
  ],

  // Simon's WhatsApp (external pressure)
  on_simon_whatsapp: [
    { from: "gabriela", text: "Simon me mandó esto esta mañana: 'Gabi, ¿cómo va el módulo de pagos? Los artistas me están preguntando. Necesitamos confirmación.'" },
    { from: "eric", text: "Eso es presión real. El Lollapalooza es en 5 semanas y SL-105 lleva 3 días bloqueada." },
    { from: "gian", text: "Por eso vengo diciendo que esto es crítico. Pero nadie escaló hasta hoy." }
  ],

  // Generic facilitation (when SM writes in chat without specific action)
  on_generic_facilitation: [
    { from: "gian", text: "¿Vamos a hacer algo con esto? Llevamos 3 días parados." },
    { from: "eric", text: "Yo podría investigar si hay un workaround técnico. Pero necesito tiempo." },
    { from: "alan", text: "¿Escalamos a alguien? Porque a nosotros Finance no nos da bola." },
    { from: "gabriela", text: "Simon está esperando respuesta. ¿Qué le digo?" }
  ]
}

// ─── DIMENSIONES EVALUADAS EN ESTE CHALLENGE ───
// Challenge identity: Flow management + Escalation + Decision under pressure
export const DIMENSIONS = [
  ["flow_optimization", "Optimización de Flujo"],
  ["wip_limits_awareness", "WIP Limits / Kanban"],
  ["facilitation", "Facilitación"],
  ["empathy", "Empatía"],
  ["systems_thinking", "Pensamiento Sistémico"],
  ["ai_fluency", "Uso de IA"],
]

// ─── CARD DETAILS (additional info shown when clicking) ───
export const CARD_DETAILS = {
  "SL-105": {
    description: "Integración completa con Mercado Pago para procesar pagos de artistas. Incluye tokenización, webhooks y reconciliación. CRÍTICO para Lollapalooza.",
    blockerReason: "Esperando API keys (client_id y client_secret) del Finance team. David escribió por email el día 4 y 6, sin respuesta clara. NADIE ESCALÓ AL CTO.",
    history: [
      "Día 4: David escribió al Finance team solicitando API keys",
      "Día 5: Sin respuesta. Gian MENCIONÓ en daily que no podía avanzar SL-107. Nadie actuó.",
      "Día 6: David escribió de nuevo. Respuesta vaga: 'lo estamos viendo'",
      "Día 7 (hoy): Sigue bloqueado. Simon preguntó por WhatsApp. Nadie había escalado al CTO."
    ],
    impact: "8 puntos bloqueados (SL-105) + 5 puntos de Alan (SL-106 listo pero no se puede testear) + 3 puntos de Gian (SL-107 bloqueado) = 16 puntos en riesgo (42% del sprint). Lollapalooza es en 5 semanas. El equipo PROMETIÓ tener el módulo de pagos en Sprint 3."
  },
  "SL-106": {
    description: "Flujo mobile completo para que artistas procesen pagos desde la app.",
    blockerReason: "Depende de SL-105 (integración Mercado Pago) para funcionar.",
    dependencies: ["SL-105"]
  },
  "SL-107": {
    description: "Suite de tests E2E para flujo de transacciones y reconciliación.",
    blockerReason: "Depende de SL-105 para validar flujo de pagos end-to-end.",
    dependencies: ["SL-105"]
  },
  "SL-103": {
    description: "Flujo de firma digital de contratos para artistas y venues.",
    blockerReason: "Nacho está trabajando en esto, pero también tiene SL-104. Multitasking."
  },
  "SL-104": {
    description: "Sistema de notificaciones push para mobile (iOS y Android).",
    blockerReason: "Nacho también está en SL-103. Dos tickets a la vez contribuye al WIP limit excedido."
  }
}
