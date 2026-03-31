import { T } from "../theme"

// ─── EQUIPO SETLIST ───
export const TEAM = [
  { id: "eric", name: "Eric", role: "Tech Lead", color: "#60a5fa", init: "ER" },
  { id: "david", name: "David", role: "Dev de Pagos", color: "#34d399", init: "DV" },
  { id: "alan", name: "Alan", role: "Dev Mobile", color: "#f472b6", init: "AL" },
  { id: "gian", name: "Gian", role: "QA", color: "#fb923c", init: "GI" },
  { id: "gabriela", name: "Gabriela", role: "Product Owner", color: "#a78bfa", init: "GA" },
  { id: "nacho", name: "Nacho", role: "Dev Frontend", color: "#fbbf24", init: "NA" },
]

export const MEMBER_MAP = Object.fromEntries(TEAM.map(t => [t.id, t]))

// ─── CONTEXTO DEL SPRINT ───
export const SPRINT_CONTEXT = "Equipo Setlist, Sprint 5, día 6 de 10. Alan (Dev Mobile) era uno de los devs más sólidos del equipo. Hace 4 semanas su performance empezó a caer dramáticamente. PRs con bugs básicos, commits a medianoche, respuestas cortantes en Slack. Lollapalooza es en 3 semanas y Alan está a cargo de features críticas de la app mobile. El equipo empieza a frustrarse. Nadie sabe qué le pasa."

// ─── TEAM DESCRIPTION (para prompts de AI) ───
export const TEAM_DESC = `- Eric (Tech Lead) — brillante, directo, pragmático. Observa pero no suele intervenir en temas personales a menos que le pidas opinión. Nota que Alan está raro pero no sabe cómo abordar.
- David (Dev de Pagos) — sólido, callado, guarda información. Empático pero no se mete en problemas de otros. Preocupado por Alan pero no dice nada.
- Alan (Dev Mobile) — PROTAGONISTA. Lleva 2 meses trabajando 14 horas por día en las features críticas de mobile para Lollapalooza. Agotado física y mentalmente. Performance cayó dramáticamente. Se siente culpable y avergonzado. No se anima a decir que no puede más. En el daily dice "está todo controlado" pero no es verdad. Trabaja hasta la madrugada, comete bugs básicos, está irritable.
- Gian (QA) — meticuloso, frustrado. Ha tenido que rechazar 4 PRs de Alan esta semana por bugs que Alan nunca cometería. Está perdiendo la paciencia.
- Gabriela (Product Owner) — preocupada. Simon (Lollapalooza) pregunta por el mobile cada 2 días. Alan es clave para el lanzamiento pero está performando mal.
- Nacho (Dev Frontend) — confundido. Alan siempre fue el más sólido y ahora está trabajando mal. No entiende qué pasó.`

// ─── FASE 1: DASHBOARD DE SEÑALES ───

export const DASHBOARD_METRICS = [
  {
    id: "commits",
    title: "Commits & Horarios de Trabajo",
    icon: "📊",
    status: "critical", // ok, warning, critical
    summary: "Patrón irregular, commits a horas inusuales (18 commits entre 11pm-3am esta semana)",
    chartType: "timeline",
    data: [
      { week: "Semana 1 (4w ago)", commits: 28, avgHour: 14, quality: "high" },
      { week: "Semana 2 (3w ago)", commits: 35, avgHour: 16, quality: "high" },
      { week: "Semana 3 (2w ago)", commits: 42, avgHour: 20, quality: "medium" },
      { week: "Semana 4 (1w ago)", commits: 51, avgHour: 23, quality: "low" },
      { week: "Esta semana", commits: 38, avgHour: 1, quality: "low" },
    ],
    details: [
      "🔴 18 commits entre 11pm - 3am esta semana",
      "🔴 Commits incrementaron 82% en 4 semanas (28 → 38 commits)",
      "🔴 Promedio de commit hour: 1:30am (antes era 2pm)",
      "🔴 Commit messages menos descriptivos ('fix', 'wip', 'update')",
      "⚠️ Trabajando 14+ horas por día regularmente",
    ],
    redFlag: "Alan está trabajando hasta la madrugada regularmente. Señal clara de sobrecarga y burnout."
  },
  {
    id: "prs",
    title: "Code Quality & PRs Rechazados",
    icon: "🔍",
    status: "critical",
    summary: "4/7 PRs rechazados esta semana (57%) por bugs básicos que Alan nunca cometería",
    chartType: "bar",
    data: [
      { week: "Semana 1", prsCreated: 8, prsRejected: 0, avgReviewRounds: 1.2 },
      { week: "Semana 2", prsCreated: 10, prsRejected: 1, avgReviewRounds: 1.5 },
      { week: "Semana 3", prsCreated: 12, prsRejected: 2, avgReviewRounds: 2.8 },
      { week: "Semana 4", prsCreated: 9, prsRejected: 4, avgReviewRounds: 3.5 },
      { week: "Esta semana", prsCreated: 7, prsRejected: 4, avgReviewRounds: 4.2 },
    ],
    details: [
      "🔴 4/7 PRs rechazados esta semana (57% rejection rate)",
      "🔴 Bugs básicos: null checks, validation, error handling",
      "🔴 PRs sin tests (antes siempre incluía tests)",
      "🔴 3 tickets críticos en DOING hace 4-6 días sin avanzar",
      "⚠️ Gian comentó: 'Alan nunca cometía estos errores'",
    ],
    redFlag: "Calidad de código cayó drásticamente. Performance de un senior dev está en niveles de junior. Señal de agotamiento mental."
  },
  {
    id: "wellbeing",
    title: "Wellbeing & Señales de Burnout",
    icon: "🧠",
    status: "critical",
    summary: "6/6 señales de burnout detectadas. Comportamiento aislado, irritable, exhausto",
    chartType: "checklist",
    data: [
      { signal: "Horarios irregulares de trabajo", detected: true, severity: "high" },
      { signal: "Calidad de trabajo disminuyó", detected: true, severity: "high" },
      { signal: "Aislamiento del equipo", detected: true, severity: "medium" },
      { signal: "Irritabilidad / tono negativo", detected: true, severity: "medium" },
      { signal: "Sobrecarga de tickets (3 críticos simultáneos)", detected: true, severity: "high" },
      { signal: "Falta de autocuidado (descanso)", detected: true, severity: "high" },
    ],
    details: [
      "🔴 6/6 señales de burnout detectadas",
      "🔴 Patrón: alta carga → horarios extremos → baja calidad → más frustración → ciclo vicioso",
      "🔴 En daily solo dice 'sigo con SL-XXX, sin bloqueantes'",
      "🔴 Respuestas en Slack cortantes: 'no tengo tiempo'",
      "⚠️ Eric comentó en privado: 'Alan se ve cansado en las calls'",
      "⚠️ Gabriela preocupada: 'Alan es clave para Lollapalooza, ¿está bien?'",
    ],
    redFlag: "Burnout severo confirmado. 6/6 señales presentes. Necesita intervención inmediata o colapsará."
  },
]

// ─── FASE 2: CONVERSATION BRANCHES (Decision Tree) ───

export const CONVERSATION_BRANCHES = {
  start: {
    id: "start",
    narration: "Agendaste un 1-1 con Alan. Se conecta a la call. Se lo ve cansado, con ojeras. Hay silencio incómodo.",
    alanMessage: "Hola. ¿Querías hablar de algo?",
    alanMood: { trust: 3, openness: 2, energy: 2 }, // Starts closed
    options: [
      {
        id: "empathetic_open",
        label: "Empático & Abierto",
        text: "Alan, te veo cansado. Antes de hablar de trabajo... ¿cómo estás vos?",
        approach: "empathetic",
        next: "empathetic_path_1"
      },
      {
        id: "direct_performance",
        label: "Directo al problema",
        text: "Alan, necesitamos hablar sobre tu performance. Tuviste 4 PRs rechazados esta semana. ¿Qué está pasando?",
        approach: "direct",
        next: "direct_path_1"
      },
      {
        id: "observational",
        label: "Observación sin juicio",
        text: "Alan, noté algunos cambios en las últimas semanas. Commits tarde, menos participación en daily. ¿Hay algo que quieras compartir?",
        approach: "observational",
        next: "observational_path_1"
      },
      {
        id: "avoidant",
        label: "Evitar el tema personal",
        text: "Alan, necesito que te concentres en terminar SL-201 y SL-202 esta semana. Lollapalooza es en 3 semanas.",
        approach: "avoidant",
        next: "avoidant_path_1"
      },
    ]
  },

  // ──── EMPATHETIC PATH (mejor approach) ────
  empathetic_path_1: {
    id: "empathetic_path_1",
    alanMessage: "(silencio largo... respira hondo) Estoy... estoy cansado. Muy cansado.",
    alanMood: { trust: 5, openness: 4, energy: 2 },
    narration: "Alan está empezando a abrirse. Su tono es vulnerable.",
    options: [
      {
        id: "emp_validate",
        label: "Validar y profundizar",
        text: "Te escucho. ¿Hace cuánto que venís sintiéndote así?",
        next: "empathetic_path_2"
      },
      {
        id: "emp_offer_solution",
        label: "Ofrecer solución rápida",
        text: "Entiendo. ¿Querés tomarte unos días off?",
        next: "empathetic_path_2_rush" // Mistake: too fast
      },
    ]
  },

  empathetic_path_2: {
    id: "empathetic_path_2",
    alanMessage: "(voz quebrándose) Hace como 2 meses. Desde que arrancamos con las features de Lollapalooza. Estoy trabajando 14 horas por día, todos los días. No puedo más... pero tampoco puedo parar porque el equipo depende de mí.",
    alanMood: { trust: 7, openness: 7, energy: 2 },
    narration: "Alan se abrió completamente. Está al borde de llorar.",
    options: [
      {
        id: "emp_acknowledge_pause",
        label: "Reconocer y pausar presión",
        text: "Gracias por confiar en mí, Alan. Primero: vos sos más importante que cualquier feature. Segundo: necesitamos hacer cambios ahora mismo. ¿Qué necesitás?",
        next: "empathetic_resolution_good"
      },
      {
        id: "emp_focus_work",
        label: "Volver al trabajo",
        text: "Entiendo que es difícil. Pero ¿qué necesitás para poder terminar SL-201 y SL-202?",
        next: "empathetic_resolution_mixed"
      },
    ]
  },

  empathetic_resolution_good: {
    id: "empathetic_resolution_good",
    alanMessage: "(aliviado, casi llorando) Necesito... necesito parar. Aunque sea unos días. Y cuando vuelva, no puedo tener 3 tickets críticos a la vez.",
    alanMood: { trust: 9, openness: 9, energy: 3 },
    narration: "EXCELENTE. Alan confió en vos y pudo expresar sus necesidades.",
    outcome: "expert",
    resolution: {
      immediate: ["Alan toma 5 días off inmediatamente", "SL-201 reasignado a Eric y Nacho (pair)", "SL-202 pospuesto 1 sprint"],
      shortTerm: ["Alan vuelve con carga reducida (1 ticket a la vez)", "Check-ins semanales 1-1 con vos"],
      longTerm: ["Establecer WIP limit personal (1-2 tickets max)", "Revisión de capacity planning en retro"],
    }
  },

  empathetic_resolution_mixed: {
    id: "empathetic_resolution_mixed",
    alanMessage: "(decepcionado) No sé... tal vez ayuda si alguien me ayuda con SL-203. Pero igual estoy muy cansado.",
    alanMood: { trust: 5, openness: 6, energy: 2 },
    narration: "Perdiste la oportunidad de abordar el burnout directamente. Alan sigue agotado.",
    outcome: "competent",
    resolution: {
      immediate: ["Nacho ayuda a Alan con SL-203", "Alan sigue trabajando sin descanso"],
      shortTerm: ["Performance mejora temporalmente pero burnout sigue"],
      longTerm: ["Problema va a volver a surgir pronto"],
    }
  },

  // ──── DIRECT PATH (confrontacional) ────
  direct_path_1: {
    id: "direct_path_1",
    alanMessage: "(defensivo, tenso) ¿Mi performance? Estoy trabajando 14 horas por día. No sé qué más querés que haga.",
    alanMood: { trust: 2, openness: 1, energy: 1 },
    narration: "Alan se cerró. Se siente atacado.",
    options: [
      {
        id: "dir_soften",
        label: "Suavizar el approach",
        text: "Perdón, no quise sonar acusatorio. Me preocupa que estés trabajando tanto y aún así los tickets no avanzan. ¿Qué está pasando?",
        next: "direct_path_2_recover"
      },
      {
        id: "dir_double_down",
        label: "Insistir en performance",
        text: "Alan, entiendo que trabajás muchas horas pero la calidad cayó. Necesito que te concentres más.",
        next: "direct_path_2_fail"
      },
    ]
  },

  direct_path_2_recover: {
    id: "direct_path_2_recover",
    alanMessage: "(un poco más abierto) Es que... tengo demasiado trabajo. 3 tickets críticos, Lollapalooza en 3 semanas, Gabriela pregunta todos los días. No llego.",
    alanMood: { trust: 4, openness: 4, energy: 2 },
    narration: "Alan se abrió un poco después de que suavizaste el tono.",
    options: [
      {
        id: "dir_rec_empathize",
        label: "Empatizar",
        text: "Entiendo. Tenés demasiada presión encima. ¿Qué necesitás para poder respirar?",
        next: "direct_resolution_ok"
      },
    ]
  },

  direct_resolution_ok: {
    id: "direct_resolution_ok",
    alanMessage: "Necesito que alguien me ayude. Y tal vez... tal vez tomarme un descanso cuando termine SL-201.",
    alanMood: { trust: 6, openness: 6, energy: 2 },
    narration: "Lograste recuperarte pero el approach inicial dañó la confianza.",
    outcome: "competent",
    resolution: {
      immediate: ["Eric ayuda a Alan con SL-202", "Alan sigue trabajando"],
      shortTerm: ["Alan toma 2 días off después de completar SL-201"],
      longTerm: ["La relación quedó dañada. Alan no va a volver a abrirse fácilmente."],
    }
  },

  direct_path_2_fail: {
    id: "direct_path_2_fail",
    alanMessage: "(frío, cerrado) Ok. Voy a concentrarme más.",
    alanMood: { trust: 1, openness: 1, energy: 1 },
    narration: "Alan se cerró completamente. Dijo lo que querías oír pero no va a cambiar nada.",
    outcome: "red_flag",
    resolution: {
      immediate: ["Alan sigue trabajando igual", "Performance sigue cayendo"],
      shortTerm: ["Burnout se agrava", "Alan eventualmente renuncia o colapsa"],
      longTerm: ["Perdiste completamente la confianza del equipo"],
    }
  },

  // ──── OBSERVATIONAL PATH (neutral, efectivo) ────
  observational_path_1: {
    id: "observational_path_1",
    alanMessage: "(silencio... piensa) Sí, supongo que estoy trabajando bastante tarde últimamente.",
    alanMood: { trust: 4, openness: 3, energy: 2 },
    narration: "Alan reconoce los cambios pero todavía no se abre.",
    options: [
      {
        id: "obs_dig_deeper",
        label: "Profundizar con curiosidad",
        text: "¿Qué te está llevando a trabajar tan tarde? ¿Es la cantidad de trabajo, complejidad, o algo más?",
        next: "observational_path_2"
      },
      {
        id: "obs_jump_solution",
        label: "Saltar a solución",
        text: "Bueno, tal vez necesitás ayuda con tus tickets. ¿Quién puede ayudarte?",
        next: "observational_path_2_rush"
      },
    ]
  },

  observational_path_2: {
    id: "observational_path_2",
    alanMessage: "Es... es todo. Tengo 3 tickets críticos, Lollapalooza en 3 semanas, y siento que si no lo hago yo nadie lo va a hacer. Estoy trabajando 14 horas por día y aún así no llego.",
    alanMood: { trust: 6, openness: 6, energy: 2 },
    narration: "Alan se está abriendo. Muestra presión y agotamiento.",
    options: [
      {
        id: "obs_validate_needs",
        label: "Validar y preguntar necesidades",
        text: "Eso suena insostenible, Alan. ¿Qué necesitás para que esto sea manejable?",
        next: "observational_resolution_good"
      },
    ]
  },

  observational_resolution_good: {
    id: "observational_resolution_good",
    alanMessage: "Necesito ayuda. Y necesito parar, aunque sea unos días. Pero me da culpa porque el equipo está esperando...",
    alanMood: { trust: 7, openness: 7, energy: 2 },
    narration: "Buen approach. Alan confió lo suficiente para expresar sus necesidades.",
    outcome: "expert",
    resolution: {
      immediate: ["Alan toma 3 días off", "SL-202 reasignado a Eric", "SL-203 pospuesto"],
      shortTerm: ["Alan vuelve con 1 ticket a la vez", "Check-ins 1-1 regulares"],
      longTerm: ["Equipo aprende sobre límites de capacity y burnout prevention"],
    }
  },

  // ──── AVOIDANT PATH (peor approach) ────
  avoidant_path_1: {
    id: "avoidant_path_1",
    alanMessage: "(voz plana, resignado) Sí. Entendido.",
    alanMood: { trust: 1, openness: 1, energy: 1 },
    narration: "Alan se cerró completamente. Ignoraste todas las señales de burnout.",
    outcome: "red_flag",
    resolution: {
      immediate: ["Alan sigue trabajando igual o peor", "Performance sigue cayendo"],
      shortTerm: ["Burnout se agrava", "Alan renuncia en 2 semanas"],
      longTerm: ["Equipo pierde confianza en vos como SM", "Lollapalooza en riesgo"],
    }
  },
}

// ─── FASE 3: ACTION PLAN CHECKLIST ───

export const ACTION_PLAN_CATEGORIES = [
  {
    id: "immediate",
    title: "🚨 Acciones Inmediatas (hoy)",
    description: "Medidas urgentes para aliviar la presión sobre Alan",
    color: "#ef4444"
  },
  {
    id: "short_term",
    title: "📅 Corto Plazo (próxima semana)",
    description: "Soporte continuo para recuperación de Alan",
    color: "#f59e0b"
  },
  {
    id: "long_term",
    title: "🌱 Sistémico / Largo Plazo",
    description: "Cambios para prevenir burnout en el futuro",
    color: "#10b981"
  },
]

export const ACTION_PLAN_OPTIONS = {
  immediate: [
    { id: "time_off", text: "Alan toma días off inmediatamente (3-5 días)", impact: "high", recommended: true },
    { id: "redistribute", text: "Redistribuir tickets críticos a Eric/Nacho", impact: "high", recommended: true },
    { id: "postpone", text: "Posponer SL-203 para próximo sprint", impact: "medium", recommended: true },
    { id: "reduce_meetings", text: "Liberar a Alan de meetings no esenciales", impact: "medium", recommended: true },
    { id: "pair_programming", text: "Asignar pair programming para tickets bloqueantes", impact: "medium", recommended: false },
    { id: "pressure_stakeholders", text: "Hablar con Gabriela/Simon sobre expectativas realistas", impact: "high", recommended: true },
    { id: "nothing_immediate", text: "No tomar acciones inmediatas (dejar que Alan siga)", impact: "negative", recommended: false },
  ],
  short_term: [
    { id: "wip_limit_personal", text: "Establecer WIP limit personal para Alan (1 ticket a la vez)", impact: "high", recommended: true },
    { id: "weekly_checkins", text: "Check-ins 1-1 semanales con Alan", impact: "high", recommended: true },
    { id: "capacity_review", text: "Revisar capacity planning del equipo en próxima retro", impact: "medium", recommended: true },
    { id: "pair_rotation", text: "Rotar pair programming para distribuir conocimiento mobile", impact: "medium", recommended: true },
    { id: "gradual_return", text: "Carga gradual cuando Alan vuelva (50% → 75% → 100%)", impact: "medium", recommended: true },
    { id: "ignore_short", text: "Volver a carga normal inmediatamente", impact: "negative", recommended: false },
  ],
  long_term: [
    { id: "burnout_signals", text: "Establecer sistema de detección temprana de burnout (metrics dashboard)", impact: "high", recommended: true },
    { id: "culture_boundaries", text: "Crear cultura donde esté bien decir 'no puedo más'", impact: "high", recommended: true },
    { id: "wip_team", text: "Establecer WIP limits a nivel equipo (no solo individual)", impact: "medium", recommended: true },
    { id: "workload_visibility", text: "Hacer workload visible en dailies (no solo 'estoy bien')", impact: "medium", recommended: true },
    { id: "capacity_buffer", text: "Buffer de 20% en capacity planning para imprevistos", impact: "medium", recommended: true },
    { id: "retro_topic", text: "Agregar 'Sustainable pace' como tema fijo en retros", impact: "low", recommended: true },
    { id: "ignore_systemic", text: "No implementar cambios sistémicos", impact: "negative", recommended: false },
  ]
}

// ─── CHARACTER STATES (para Phase 2 - conversation) ───
export const INITIAL_CHARACTER_STATE = {
  alan: { trust: 3, openness: 2, energy: 2 }, // Starts closed and exhausted
}

// ─── DIMENSIONES EVALUADAS ───
export const DIMENSIONS = [
  ["detection", "Detección de Señales"],
  ["coaching", "Coaching Empático"],
  ["empathy", "Empatía"],
  ["leadership", "Liderazgo"],
  ["systemic", "Pensamiento Sistémico"],
]

// ─── BOARD STATE (usado en dashboard) ───
export const BOARD_STATE = {
  doing: [
    { id: "SL-201", title: "Artist profile mobile", assignee: "alan", days: 6, prs: 2, status: "Bugs en review", priority: "high", points: 8 },
    { id: "SL-202", title: "Payment flow mobile", assignee: "alan", days: 5, prs: 1, status: "Bloqueado por bugs SL-201", priority: "critical", points: 13 },
    { id: "SL-203", title: "Offline mode sync", assignee: "alan", days: 4, prs: 0, status: "Sin PRs aún", priority: "high", points: 8 },
  ],
  blocked: [
    { id: "SL-210", title: "QA mobile regression", assignee: "gian", blockedBy: "SL-201", priority: "high", points: 5 },
    { id: "SL-211", title: "Mobile-web integration", assignee: "nacho", blockedBy: "SL-202", priority: "medium", points: 5 },
  ]
}
