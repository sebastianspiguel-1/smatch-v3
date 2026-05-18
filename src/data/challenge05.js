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

// ─── STAKEHOLDERS ───
export const STAKEHOLDERS = [
  { id: "paula", name: "Paula Ríos", role: "Engineering Manager", color: "#dc2626", init: "PR" },
  { id: "simon", name: "Simon", role: "Lollapalooza · Stakeholder", color: "#8b5cf6", init: "SI" }
]

export const STAKEHOLDER_MAP = Object.fromEntries(STAKEHOLDERS.map(s => [s.id, s]))

// ─── CONTEXTO DEL SPRINT ───
export const SPRINT_CONTEXT = "Equipo Setlist, Sprint 6, día 3 de 10. Paula (Engineering Manager) convocó una reunión urgente. Lollapalooza es en 2 semanas y la velocidad cayó 35% en los últimos 3 sprints (de 38 pts/sprint a 25 pts/sprint). Paula trajo gráficos y pregunta: '¿Por qué estamos entregando menos? Necesito que vuelvan al ritmo anterior o mejor — 30% más de velocidad para llegar a Lollapalooza.' El equipo está tenso. Alan (recién recuperándose de burnout) está callado. Gian se cruza de brazos."

// ─── FASE 1: VELOCITY CHART & DATA INVESTIGATION ───

export const VELOCITY_DATA = {
  sprints: [
    {
      id: "sprint3",
      number: 3,
      committed: 38,
      completed: 38,
      carryover: 0,
      velocity: 38,
      healthScore: 95,
      technicalDebt: 10,
      defectRate: 2,
      deploymentTime: 12, // minutes
      leadTime: 2.5, // days
      weeksSinceStart: 6
    },
    {
      id: "sprint4",
      number: 4,
      committed: 36,
      completed: 32,
      carryover: 4,
      velocity: 32,
      healthScore: 78,
      technicalDebt: 18,
      defectRate: 5,
      deploymentTime: 22,
      leadTime: 3.5,
      weeksSinceStart: 4
    },
    {
      id: "sprint5",
      number: 5,
      committed: 34,
      completed: 28,
      carryover: 6,
      velocity: 28,
      healthScore: 65,
      technicalDebt: 28,
      defectRate: 8,
      deploymentTime: 35,
      leadTime: 4.8,
      weeksSinceStart: 2
    },
    {
      id: "sprint6",
      number: 6,
      committed: 30,
      completed: 0, // En curso
      carryover: 0,
      velocity: 25, // Proyectado
      healthScore: 58,
      technicalDebt: 35,
      defectRate: 10,
      deploymentTime: 45,
      leadTime: 5.5,
      weeksSinceStart: 0,
      inProgress: true
    }
  ],
  velocityTrend: "↓ -35%",
  emDemand: "+30% velocidad (volver a ~38 pts/sprint)",
  lollapaloozaDeadline: "2 semanas"
}

export const INVESTIGATION_METRICS = [
  {
    id: "technical_debt",
    title: "Technical Debt",
    icon: "⚠️",
    currentValue: "35%",
    previousValue: "10%",
    trend: "↑ +250%",
    status: "critical",
    insight: "La deuda técnica se triplicó en 3 sprints. Cada feature nueva toma más tiempo porque trabajamos alrededor de código legacy no refactorizado. La velocity cayó porque el sistema es más lento, no el equipo.",
    dragPriority: "critical"
  },
  {
    id: "deployment_time",
    title: "Deployment Time",
    icon: "🚀",
    currentValue: "45 min",
    previousValue: "12 min",
    trend: "↑ +275%",
    status: "critical",
    insight: "Los deploys pasaron de 12 a 45 minutos (+275%). Infraestructura colapsando, nadie priorizó arreglarlo. Cada deploy consume casi 1 hora de trabajo. Esto explica parte de la 'velocity baja'.",
    dragPriority: "critical"
  },
  {
    id: "team_morale",
    title: "Team Morale & Burnout Risk",
    icon: "😰",
    currentValue: "4/10",
    previousValue: "8/10",
    trend: "↓ -50%",
    status: "critical",
    insight: "Alan recién salió de burnout (Challenge 3). Presión por Lollapalooza es insostenible. Equipo exhausto. Si aumentamos presión sin resolver causas sistémicas, vamos a perder gente.",
    dragPriority: "critical"
  },
  {
    id: "defect_rate",
    title: "Defect Rate",
    icon: "🐛",
    currentValue: "10%",
    previousValue: "2%",
    trend: "↑ +400%",
    status: "critical",
    insight: "Bugs aumentaron 5x. Presión por velocidad sacrificó quality. Gian (QA) está frustrado. Si aceleramos más sin pagar deuda, vamos a entregar más bugs a producción y Lollapalooza.",
    dragPriority: "critical"
  }
]

// Argumentos para preparar antes del meeting
export const PREPARATION_ARGUMENTS = [
  {
    id: "arg_technical_debt",
    title: "Deuda Técnica triplicada",
    text: "La deuda técnica creció 250% en 3 sprints. Cada feature nueva toma más tiempo porque trabajamos alrededor de código legacy.",
    impact: "critical",
    evidence: ["Technical Debt", "Lead Time", "Defect Rate"],
    recommended: true
  },
  {
    id: "arg_infrastructure",
    title: "Infraestructura colapsando",
    text: "Deploys pasaron de 12 a 45 minutos (+275%). Infraestructura nunca fue priorizada. No es falta de esfuerzo, es el sistema.",
    impact: "critical",
    evidence: ["Deployment Time", "Lead Time"],
    recommended: true
  },
  {
    id: "arg_scope_changes",
    title: "Cambios mid-sprint constantes",
    text: "8 cambios de requerimientos mid-sprint vs 1 antes. Rehacemos trabajo constantemente. Simon presiona cada 2 días.",
    impact: "high",
    evidence: ["Mid-Sprint Scope Changes", "Story Points Velocity"],
    recommended: true
  },
  {
    id: "arg_quality_sacrifice",
    title: "Quality sacrificada por velocidad",
    text: "Defect rate subió 400%. Si aceleramos más sin pagar deuda, vamos a entregar más bugs a Lollapalooza.",
    impact: "high",
    evidence: ["Defect Rate", "Technical Debt"],
    recommended: true
  },
  {
    id: "arg_burnout_risk",
    title: "Riesgo de burnout del equipo",
    text: "Alan recién salió de burnout. Team morale bajó 50%. Presión por Lollapalooza es insostenible. No podemos trabajar más horas.",
    impact: "critical",
    evidence: ["Team Morale"],
    recommended: true
  },
  {
    id: "arg_realistic_plan",
    title: "Plan realista: 2 sprints de deuda",
    text: "Propuesta: 2 sprints enfocados en deuda técnica + infra. Después, proyectamos volver a 32-35 pts/sprint de forma sostenible.",
    impact: "solution",
    evidence: ["Technical Debt", "Deployment Time"],
    recommended: true
  },
  {
    id: "arg_bad_work_more_hours",
    title: "❌ 'Trabajar más horas' (no usar)",
    text: "Podríamos trabajar más horas para aumentar velocity. (Insostenible, ya tuvimos burnout)",
    impact: "negative",
    evidence: [],
    recommended: false
  },
  {
    id: "arg_bad_cut_scope",
    title: "❌ 'Cortar scope para maquillar números' (no usar)",
    text: "Podríamos entregar features más chicas para subir story points. (Maquilla números, no resuelve problema real)",
    impact: "negative",
    evidence: [],
    recommended: false
  }
]

// ─── FASE 2: MEETING SIMULATOR ───

export const MEETING_STAGES = [
  {
    id: "opening",
    stage: 1,
    paulaMessage: "Entonces, ¿cuál es el plan? Necesito llevarlo a la reunión con el CEO mañana. ¿Van a poder volver a 38 puntos por sprint o no?",
    paulaMood: { pressure: 70, satisfaction: 30 }, // High pressure, low satisfaction
    teamMood: { morale: 40, confidence: 35 },
    options: [
      {
        id: "opening_realistic",
        label: "Approach realista y basado en datos",
        text: "Paula, entiendo la presión. Pero antes de comprometer números, necesito mostrarte por qué cayó la velocidad. No es falta de esfuerzo.",
        approach: "realistic",
        paulaReaction: "positive",
        moodChange: { pressure: -10, satisfaction: +15 },
        next: "investigation"
      },
      {
        id: "opening_defensive",
        label: "Defensivo: culpar a scope changes",
        text: "El problema es que Gabriela y Simon cambian requerimientos mid-sprint constantemente. No podemos trabajar así.",
        approach: "defensive",
        paulaReaction: "neutral",
        moodChange: { pressure: +5, satisfaction: -5 },
        next: "investigation"
      },
      {
        id: "opening_commit_fast",
        label: "Comprometer rápido sin investigar",
        text: "Sí, vamos a volver a 38 puntos. El equipo va a enfocarse más.",
        approach: "commitment_fast",
        paulaReaction: "negative",
        moodChange: { pressure: +15, satisfaction: +5 },
        next: "consequences_bad"
      },
      {
        id: "opening_avoid",
        label: "Evitar el tema, cambiar de enfoque",
        text: "Antes de hablar de números, ¿cómo está el equipo de otros proyectos? ¿Tienen recursos?",
        approach: "avoidant",
        paulaReaction: "negative",
        moodChange: { pressure: +20, satisfaction: -15 },
        next: "investigation"
      }
    ]
  },
  {
    id: "investigation",
    stage: 2,
    narration: "Paula escucha. Está esperando que presentes datos y argumentos sólidos.",
    paulaMessage: "Ok, te escucho. Mostrámelo.",
    // SM presenta los argumentos preparados en Fase 1
    evaluatePresentedArguments: true
  },
  {
    id: "negotiation",
    stage: 3,
    paulaMessage: "Entiendo que hay deuda técnica. Todos los equipos la tienen. Pero el CEO pregunta por qué Engineering entrega menos. ¿Qué le digo?",
    options: [
      {
        id: "neg_realistic_plan",
        label: "Proponer plan realista con tradeoff claro",
        text: "Propongo: 2 sprints enfocados en deuda técnica + infra (velocity ~20 pts). Después, proyectamos volver a 32-35 pts de forma sostenible. Es mejor que prometer 38 y no cumplir.",
        approach: "realistic_tradeoff",
        paulaReaction: "positive",
        outcome: "good",
        next: "resolution_good"
      },
      {
        id: "neg_half_measure",
        label: "Proponer medida a medias",
        text: "Podemos dedicar 30% del sprint a deuda técnica y 70% a features. Así seguimos entregando mientras arreglamos.",
        approach: "compromise",
        paulaReaction: "neutral",
        outcome: "mixed",
        next: "resolution_mixed"
      },
      {
        id: "neg_cave_to_pressure",
        label: "Ceder a la presión sin plan real",
        text: "Ok, vamos a volver a 38 puntos. El equipo se va a esforzar más y vamos a trabajar horas extra si hace falta.",
        approach: "cave",
        paulaReaction: "negative",
        outcome: "bad",
        next: "resolution_bad"
      }
    ]
  }
]

export const MEETING_OUTCOMES = {
  resolution_good: {
    id: "resolution_good",
    outcome: "expert",
    paulaFinalMessage: "Ok. Me gusta que trajiste datos y un plan realista. Voy a presentarlo al CEO así: '2 sprints de inversión técnica, después proyección sostenible de 32-35 pts'. Gracias por el profesionalismo.",
    paulaMood: { pressure: 40, satisfaction: 80 },
    teamMood: { morale: 75, confidence: 80 },
    shortTerm: [
      "Paula acepta el plan",
      "Equipo tiene 2 sprints para pagar deuda técnica",
      "Presión se reduce significativamente"
    ],
    longTerm: [
      "Velocity vuelve a 32-35 pts de forma sostenible",
      "Equipo evita burnout",
      "Paula confía en tu juicio para futuras decisiones"
    ]
  },
  resolution_mixed: {
    id: "resolution_mixed",
    outcome: "competent",
    paulaFinalMessage: "Está bien. Vamos con 30% deuda técnica y 70% features. Pero necesito que en 4 semanas estemos viendo mejora en velocity. Sino, vamos a tener que revisar el approach.",
    paulaMood: { pressure: 55, satisfaction: 50 },
    teamMood: { morale: 55, confidence: 50 },
    shortTerm: [
      "Paula acepta pero escépticamente",
      "Equipo dividido entre features y deuda (no resuelve ninguno bien)",
      "Presión moderada sigue"
    ],
    longTerm: [
      "Velocity mejora levemente (a ~30 pts)",
      "Deuda técnica sigue creciendo lentamente",
      "Problema va a volver en 2-3 meses"
    ]
  },
  resolution_bad: {
    id: "resolution_bad",
    outcome: "red_flag",
    paulaFinalMessage: "Perfecto. Entonces en el próximo sprint esperamos ver 38 puntos. Si no llegan, vamos a tener que revisar si el equipo tiene los recursos correctos.",
    paulaMood: { pressure: 85, satisfaction: 40 },
    teamMood: { morale: 25, confidence: 20 },
    shortTerm: [
      "Equipo trabaja horas extra insostenibles",
      "Alan colapsa de nuevo (burnout severo)",
      "Quality cae aún más, bugs en Lollapalooza"
    ],
    longTerm: [
      "Equipo no cumple los 38 pts prometidos",
      "Paula pierde confianza en ti y el equipo",
      "2-3 personas renuncian en los próximos meses",
      "Lollapalooza tiene bugs críticos"
    ]
  },
  consequences_bad: {
    id: "consequences_bad",
    outcome: "red_flag",
    narration: "Comprometiste 38 puntos sin investigar las causas. Paula está satisfecha momentáneamente, pero el equipo está en shock.",
    paulaMessage: "Excelente. Entonces confirmamos 38 puntos para el próximo sprint. Se lo comunico al CEO.",
    teamReaction: [
      { from: "alan", text: "(después del meeting) ...¿Acabás de prometer 38 puntos? Yo... no puedo volver a quemarme." },
      { from: "gian", text: "¿Cómo vamos a llegar a 38 si ni siquiera sabemos por qué caímos a 25?" },
      { from: "eric", text: "(decepcionado) Esperaba que investigaras las causas reales antes de comprometer." }
    ],
    shortTerm: [
      "Equipo no confía en vos",
      "Presión insostenible",
      "Nadie sabe cómo cumplir la promesa"
    ],
    longTerm: [
      "Sprint falla, no cumplen 38 pts",
      "Paula pierde confianza",
      "Burnout masivo"
    ]
  }
}

// ─── TEAM DESCRIPTION (para AI) ───
export const TEAM_DESC = `- Eric (Tech Lead) — reflexivo, basado en datos. Cree que la caída es por deuda técnica acumulada, no por "trabajar menos".
- David (Dev de Pagos) — pragmático, callado. Sugiere cortar scope para entregar más rápido, pero eso no resuelve la raíz.
- Alan (Dev Mobile) — recién salió de burnout (Challenge 3). Callado, cauteloso, traumatizado. No quiere volver a quemarse.
- Gian (QA) — frustrado. Ve que la presión de velocity ignora quality. "Si aceleramos sin arreglar deuda, vamos a entregar más bugs".
- Gabriela (Product Owner) — preocupada. Simon (Lollapalooza) presiona cada 2 días. Genera scope changes mid-sprint sin darse cuenta del impacto.
- Nacho (Dev Frontend) — sugiere "trabajar más horas" o "saltar ceremonies" para aumentar velocity. No entiende que eso es insostenible.
- Paula Ríos (Engineering Manager) — bajo presión del CEO. Mira solo números (velocity), no contexto. Cree que "más foco" = más velocity. No entiende métricas ágiles ni causas sistémicas. Pero es razonable si le presentás datos bien.`

// ─── DIMENSIONES EVALUADAS ───
// Challenge identity: Stakeholder management + Negotiation + Metrics literacy
export const DIMENSIONS = [
  ["stakeholder_management", "Gestión de Stakeholders"],
  ["negotiation", "Negociación"],
  ["metrics_literacy", "Literacy de Métricas"],
  ["boundary_setting", "Protección del Equipo"],
  ["systems_thinking", "Pensamiento Sistémico"],
  ["ai_fluency", "Uso de IA"],
]
