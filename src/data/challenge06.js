import { T } from "../theme"

// ─── EQUIPO SETLIST (Sprint 0, primer día juntos) ───
export const TEAM = [
  { id: "eric", name: "Eric", role: "Tech Lead", color: "#60a5fa", init: "ER" },
  { id: "david", name: "David", role: "Dev de Pagos", color: "#34d399", init: "DV" },
  { id: "alan", name: "Alan", role: "Dev Mobile", color: "#f472b6", init: "AL" },
  { id: "gian", name: "Gian", role: "QA", color: "#fb923c", init: "GI" },
  { id: "gabriela", name: "Gabriela", role: "Product Owner", color: "#a78bfa", init: "GA" },
  { id: "nacho", name: "Nacho", role: "Dev Frontend", color: "#fbbf24", init: "NA" },
]

export const MEMBER_MAP = Object.fromEntries(TEAM.map(t => [t.id, t]))

// ─── CONTEXTO ───
export const SPRINT_CONTEXT = "Equipo Setlist, Sprint 0, primer día juntos. 6 personas de diferentes backgrounds y empresas anteriores. Van a trabajar en una app mobile para artistas independientes latinoamericanos. Es un producto greenfield. Necesitan establecer acuerdos de equipo antes de arrancar el Sprint 1. Workshop de 15 minutos. Tu rol: facilitar la creación de acuerdos sin imponer tus propias opiniones. Crear consenso real, no superficial. Manejar conflictos cuando surjan. [FLASHBACK: Este workshop ocurre ANTES de los Challenges 1-2. Los acuerdos que creen aquí se romperán después.]"

// ─── SECCIONES DEL BOARD (6 secciones) ───
export const BOARD_SECTIONS = [
  "Team Values",
  "Definition of Ready",
  "Definition of Done",
  "Communication",
  "Estimation",
  "Ceremonies"
]

// ─── INITIAL BOARD STATE (5 bulletpoints vacíos por sección) ───
export const INITIAL_BOARD_STATE = {
  "Team Values": [
    { id: "tv1", text: "" },
    { id: "tv2", text: "" },
    { id: "tv3", text: "" },
    { id: "tv4", text: "" },
    { id: "tv5", text: "" }
  ],
  "Definition of Ready": [
    { id: "dor1", text: "" },
    { id: "dor2", text: "" },
    { id: "dor3", text: "" },
    { id: "dor4", text: "" },
    { id: "dor5", text: "" }
  ],
  "Definition of Done": [
    { id: "dod1", text: "" },
    { id: "dod2", text: "" },
    { id: "dod3", text: "" },
    { id: "dod4", text: "" },
    { id: "dod5", text: "" }
  ],
  "Communication": [
    { id: "com1", text: "" },
    { id: "com2", text: "" },
    { id: "com3", text: "" },
    { id: "com4", text: "" },
    { id: "com5", text: "" }
  ],
  "Estimation": [
    { id: "est1", text: "" },
    { id: "est2", text: "" },
    { id: "est3", text: "" },
    { id: "est4", text: "" },
    { id: "est5", text: "" }
  ],
  "Ceremonies": [
    { id: "cer1", text: "" },
    { id: "cer2", text: "" },
    { id: "cer3", text: "" },
    { id: "cer4", text: "" },
    { id: "cer5", text: "" }
  ]
}

// ─── TEAM DESCRIPTION (para prompts de AI) ───
export const TEAM_DESC = `- Eric (Tech Lead) — brillante, directo, pragmático. Viene de una startup donde "velocidad > todo". Construyó backends solo. Propone "Velocidad como valor principal". Desconfía de procesos que frenen el delivery.
- Gian (QA) — meticuloso, orientado a calidad. Viene de una fintech donde cualquier bug era crítico. Propone "Calidad sobre velocidad" y tests obligatorios en DoD. Ya anticipa que el equipo va a ignorar sus warnings (y tiene razón — ver Challenges 1-2).
- David (Dev de Pagos) — práctico, callado, no le gustan discusiones filosóficas. Quiere acuerdos concretos y accionables. Propone "Definition of Ready: dependencias externas identificadas" y "Escalar bloqueos inmediatamente, no esperar al daily". [Ironía: en Challenge 2, él no escala SL-105 por 3 días.]
- Alan (Dev Mobile) — callado, inseguro. Viene de mobile pero no se anima a opinar mucho. Escucha pero no participa activamente a menos que la SM lo invite. [Patrón establecido desde día 1 — explica su silencio en Challenges 1-2.]
- Gabriela (Product Owner) — conecta bien con artistas y venues, quiere iterar rápido. Apoya a Eric en velocidad. Propone "Stories pequeñas para completar en 1-2 días". [Su scope creep empieza aquí — ver Challenge 1.]
- Nacho (Dev Frontend) — entusiasta, rápido para aprender, acepta todo sin pensar. Propone acuerdos sin considerar consecuencias. Dice "sí" a todo. [Su patrón de sobrecomprometerse empieza aquí — ver Challenges 1-2.]`

// ─── PROPUESTAS DEL EQUIPO (lo que van a proponer durante el workshop) ───
export const TEAM_PROPOSALS = [
  // Arranque del workshop
  { from: "eric", delay: 3000, text: "Bueno equipo, bienvenidos a Setlist. Antes de meternos en código, necesitamos alinearnos en cómo vamos a trabajar. Empecemos por Team Values." },
  { from: "gian", delay: 5000, text: "Totalmente. Para mí, calidad sobre velocidad. Mejor lento y bien que rápido y mal. Vengo de fintech y cualquier bug nos costaba caro." },
  { from: "eric", delay: 4000, text: "Entiendo el punto, Gian. Pero si no entregamos rápido, no hay producto. Los artistas necesitan features. La velocidad tiene que estar primero." },
  { from: "nacho", delay: 6000, text: "¿Podemos poner ambos? (risas nerviosas) Velocidad Y calidad." },
  { from: "david", delay: 5000, text: "Creo que necesitamos encontrar un balance pragmático. ¿Qué tal 'Iteración rápida con quality gates'?" },
  { from: "gabriela", delay: 4000, text: "Me gusta. Y agregar: 'Entregar valor a los artistas en cada sprint'." },

  // Definition of Ready
  { from: "gian", delay: 8000, text: "Para DoR, yo propongo: acceptance criteria claros y testeables. Nada de 'ver qué sale'." },
  { from: "david", delay: 6000, text: "Y dependencias externas identificadas. Si necesitamos algo de Finance o infra, tiene que estar mapeado antes." },
  { from: "gabriela", delay: 7000, text: "Story pequeña — completable en 1-2 días máximo. No queremos carry-over." },
  { from: "eric", delay: 5000, text: "Y criterios de aceptación con ejemplos concretos, no solo texto genérico." },

  // Definition of Done
  { from: "gian", delay: 9000, text: "Para DoD: tests unitarios + tests de integración obligatorios. Sin excepciones." },
  { from: "eric", delay: 5000, text: "Ok pero eso nos va a agregar 2-3 horas por feature. ¿Seguro? Tenemos timeline ajustado con Lollapalooza." },
  { from: "gian", delay: 6000, text: "Prefiero 2-3 horas extra ahora que bugs en producción después. Los artistas van a usar esto en vivo." },
  { from: "gabriela", delay: 6000, text: "Estoy de acuerdo con Gian. Y regression tests — al menos los críticos del flujo de shows." },
  { from: "david", delay: 5000, text: "Documentación técnica actualizada si es necesario. Especialmente integraciones con Mercado Pago y servicios externos." },
  { from: "nacho", delay: 7000, text: "¡Y código revieweado + deployado a staging! Suena bien." },

  // Communication
  { from: "david", delay: 8000, text: "Para comunicación: Slack para async, videocalls solo cuando es realmente necesario." },
  { from: "nacho", delay: 5000, text: "No @ channel a menos que sea urgente. Como 'producción caída' urgente." },
  { from: "eric", delay: 6000, text: "Mensajes en Slack con contexto claro — no solo 'hola, tenés un minuto?'. Perdemos tiempo con eso." },
  { from: "gabriela", delay: 4000, text: "Usar threads para mantener conversaciones organizadas. Especialmente feedback de artistas." },
  { from: "david", delay: 6000, text: "Y MUY IMPORTANTE: si alguien está bloqueado, escalar inmediatamente. No esperar al daily. [Ironía: en Challenge 2, David no cumple esto con SL-105.]" },

  // Estimation
  { from: "david", delay: 10000, text: "¿Cómo vamos a estimar? ¿Story points? ¿Horas?" },
  { from: "eric", delay: 5000, text: "Story points. Fibonacci. Y Planning Poker para consenso. Nada de que yo decida solo." },
  { from: "gian", delay: 6000, text: "De acuerdo. Y nada de presión para llegar a un número específico. Si sale 13 en lugar de 8, sale 13." },
  { from: "nacho", delay: 5000, text: "Si alguien estima muy diferente, tiene que explicar por qué. Para aprender todos." },
  { from: "gabriela", delay: 4000, text: "Y re-estimar si descubrimos complejidad oculta. No nos casamos con el número inicial." },

  // Ceremonies
  { from: "eric", delay: 9000, text: "Daily a las 9:30am sharp — máximo 15 minutos. Tres preguntas clásicas." },
  { from: "gian", delay: 5000, text: "Retro cada 2 semanas, al final del sprint. Y que tenga action items reales, no solo quejarnos." },
  { from: "david", delay: 6000, text: "Planning el lunes, sin excepciones. Y refinement mid-sprint para adelantarnos." },
  { from: "nacho", delay: 5000, text: "¡Y si alguien está bloqueado, avisar inmediatamente — no esperar al daily! (repite lo que dijo David)" },
  { from: "gabriela", delay: 4000, text: "Sprint review con demos reales a stakeholders. Simon (Lollapalooza) va a querer ver progreso." },

  // Alan participation (callado, no participa)
  { from: "nacho", delay: 12000, text: "Creo que tenemos bastante... ¿algo más?" },
  { from: "david", delay: 6000, text: "Alan, vos que venís de mobile... ¿hay algo que funcionaba bien allá que querés proponer?" },
  { from: "alan", delay: 8000, text: "(silencio... está callado, no se anima a participar)"},
  { from: "gabriela", delay: 5000, text: "(con tono amable) Alan, cualquier cosa que quieras agregar está bien. Estamos todos aprendiendo." },
  { from: "alan", delay: 6000, text: "Eh... no sé. Me parece que está todo bien así. (voz baja)" },

  // Cierre
  { from: "eric", delay: 15000, text: "Bueno, creo que tenemos todo. Buen workshop. Empecemos el Sprint 1 con esto claro." },
  { from: "david", delay: 6000, text: "La pregunta es... ¿realmente vamos a seguir esto o es otro documento más que queda en Google Docs?" },
  { from: "gian", delay: 5000, text: "Tiene razón David. Necesitamos algún mecanismo para asegurarnos de que esto se cumpla. [Spoiler: en Challenges 1-2, no se cumple.]" },
  { from: "gabriela", delay: 5000, text: "Y también revisarlo periódicamente. Los acuerdos tienen que evolucionar con el equipo y el producto." },
  { from: "nacho", delay: 4000, text: "¡Sí! Podemos revisarlo en cada retro. Suena bien." },
]

// ─── DIMENSIONES EVALUADAS EN ESTE CHALLENGE ───
// Challenge identity: Team formation (Tuckman) + Consensus building + Inclusivity
export const DIMENSIONS = [
  ["facilitation", "Facilitación"],
  ["consensus_building", "Construcción de Consenso"],
  ["inclusivity", "Inclusividad"],
  ["team_formation", "Team Formation (Tuckman)"],
  ["systems_thinking", "Pensamiento Sistémico"],
  ["ai_fluency", "Uso de IA"],
]
