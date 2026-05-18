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
export const SPRINT_CONTEXT = "Setlist · Sprint 2 completado. 22 de 29 puntos entregados. En papel, aceptable. Pero hay tensión que nadie nombra. Nacho entregó SL-103 tarde sin avisar. Alan hizo trabajo extra para cubrir y no lo dijo. Gian levantó un bug en el flujo de firma (SL-103) que fue ignorado en el planning. Eric está callado. Gabriela celebra el sprint. El SM tiene que ir más abajo de la superficie. Contexto del producto: app mobile para artistas independientes. Sprint 2 incluía el módulo de Shows básico. El Lollapalooza espera el piloto en 6 semanas."

export const SPRINT_STATS = [
  { icon: "🎯", label: "Comprometido", value: "29 pts" },
  { icon: "✅", label: "Completado", value: "22 pts" },
  { icon: "🔄", label: "Carry-over", value: "2 tickets" },
]

export const SPRINT_SIGNALS = [
  { from: "eric", text: "En la estimación, el equipo discutió fuerte sobre la complejidad de SL-103. Los devs se plantaron y no cedieron ante la presión. Buena señal.", ts: "Día 2" },
  { from: "gian", text: "El ciclo de QA fue fluido en general, pero SL-103 rebotó dos veces. Los requerimientos del flujo de firma estaban dispersos en comentarios.", ts: "Día 6" },
  { from: "david", text: "Alan estuvo trabado medio día con un edge case del contrato digital. Me metí y en 30 minutos encontramos el problema juntos.", ts: "Día 8" },
  { from: "alan", text: "Testé SL-104 basándome en comentarios del PO que cambiaban el alcance, pero Nacho no los había visto. Tuvimos que rehacer trabajo.", ts: "Día 9" },
]

// ─── TEAM DESCRIPTION (para el prompt de AI) ───
export const TEAM_DESC = `Equipo de Setlist — startup de app mobile para artistas independientes latinoamericanos.

Eric (Tech Lead): brillante y directo, a veces cortante. Construyó el backend casi solo. Desconfía del proceso ágil. Cuando algo técnico le preocupa lo dice; cuando algo humano le preocupa, se calla.

David (Dev de Pagos): sólido y callado. Siempre entrega, pero guarda información crítica en lugar de escalar. Tiene miedo de decepcionar al equipo y eso lo paraliza.

Alan (Dev Mobile): creativo y preciso. Relativamente callado en el equipo. Sus estimaciones son las más exactas pero se autocensura. Eric tomó ideas suyas sin darle crédito y Alan no lo mencionó.

Gian (QA): meticuloso y frustrado. Detecta problemas antes que nadie pero raramente le hacen caso hasta que algo falla en producción. Siempre tiene razón, pero el equipo lo procesa tarde.

Gabriela (Product Owner): conecta bien con artistas y venues pero genera scope creep constantemente. Su intuición de producto es buena; su traducción a historias de usuario, no tanto.

Nacho (Dev Frontend): entusiasta y rápido para aprender, pero sobreestima su velocidad. Acepta compromisos que no puede cumplir y no avisa hasta el último momento.`

// ─── FORMATOS DE RETRO ───
export const FORMATS = [
  { id: "sailboat", name: "Sailboat", cols: ["Wind 🌬️", "Anchor ⚓", "Rocks 🪨", "Island 🏝️"],
    desc: "Metáfora del barco: viento que impulsa, ancla que frena, rocas de riesgo, isla como meta.", hint: "Ideal para visualizar fuerzas y dirección del equipo." },
  { id: "glad_sad_mad", name: "Glad / Sad / Mad", cols: ["Glad 😊", "Sad 😔", "Mad 😤"],
    desc: "Basado en emociones: abre canales para lo que el equipo siente.", hint: "Ideal cuando hay tensión bajo la superficie." },
  { id: "start_stop_continue", name: "Start / Stop / Continue", cols: ["Start", "Stop", "Continue"],
    desc: "Orientado a la acción: impulsa cambios concretos de comportamiento.", hint: "Ideal para equipos que necesitan cambiar hábitos." },
]

// ─── STICKIES POR FORMATO (con votos) ───
export const STICKIES = {
  sailboat: {
    initial: [
      // Wind 🌬️ (col: 0) - Lo que nos impulsa hacia adelante
      { col: 0, author: "gian", text: "Flujo de contratos digitales funcionando. SL-103 está en prod y los artistas pueden firmar desde el celu.", color: T.sY, votes: ["eric","david","alan","gabriela"] },
      { col: 0, author: "eric", text: "El backend de Shows quedó armado rápido. Buena arquitectura, endpoints limpios.", color: T.sB, votes: ["david","gian","nacho"] },
      { col: 0, author: "david", text: "David y Alan trabajaron juntos en el edge case del contrato — 30 min de pairing y lo resolvieron.", color: T.sY, votes: ["alan","gian","eric","gabriela","nacho"] },
      { col: 0, author: "gabriela", text: "Buen ritmo en las primeras 2 semanas. El equipo está entregando features que los artistas necesitan.", color: T.sV, votes: ["gian"] },

      // Anchor ⚓ (col: 1) - Lo que nos frena
      { col: 1, author: "alan", text: "Me costó encontrar los requerimientos reales del flujo de firma. Estaban dispersos en comentarios de tickets viejos.", color: T.sO, votes: ["eric","gian","gabriela"] },
      { col: 1, author: "gian", text: "SL-103 llegó tarde y con un bug que ya había reportado en el planning. Nadie lo priorizó.", color: T.sP, votes: ["nacho","eric","alan"] },
      { col: 1, author: "nacho", text: "SL-104 cambió de alcance solo en comentarios. Los AC nunca se actualizaron. Generó confusión.", color: T.sP, votes: ["alan","gian"] },

      // Rocks 🪨 (col: 2) - Riesgos adelante
      { col: 2, author: "david", text: "SL-105 (integración de pagos) todavía no arrancó. Es el ticket más crítico para el Lollapalooza.", color: T.sB, votes: ["eric","gabriela"] },
      { col: 2, author: "eric", text: "Si seguimos sin documentación central de features complejas, cada ticket va a tener carry-over.", color: T.sG, votes: ["alan","gian","gabriela"] },

      // Island 🏝️ (col: 3) - Nuestra meta
      { col: 3, author: "nacho", text: "Piloto del Lollapalooza en 6 semanas — 60 artistas usando Setlist en vivo.", color: T.sY, votes: ["gian","eric"] },
      { col: 3, author: "gian", text: "Tener una fuente de verdad para requerimientos de features complejas. Hoy no existe.", color: T.sG, votes: ["alan","gabriela","eric","david"] },
    ],
  },
  glad_sad_mad: {
    initial: [
      { col: 0, author: "gian", text: "Orgullo por la entrega del equipo. El módulo de Shows está en prod.", color: T.sY, votes: ["eric","david","gabriela"] },
      { col: 0, author: "eric", text: "Contento de que el equipo se plantó en la estimación de SL-103. Mostramos criterio técnico.", color: T.sG, votes: ["eric","gian","david"] },
      { col: 0, author: "nacho", text: "Buen ambiente. Contento de ser parte de este equipo.", color: T.sO, votes: [] },
      { col: 0, author: "david", text: "David ayudando a Alan con el edge case — eso es ownership del equipo de verdad.", color: T.sY, votes: ["alan","gian","eric","gabriela","nacho"] },
      { col: 1, author: "alan", text: "Triste por no haber podido terminar SL-104 completo. Los requerimientos estaban por todos lados.", color: T.sO, votes: ["gabriela","gian","eric"] },
      { col: 1, author: "gian", text: "Me entristece que el bug de SL-103 que reporté en el planning no se priorizó. Después rebotó en QA.", color: T.sP, votes: ["alan","gabriela","david"] },
      { col: 2, author: "nacho", text: "Me frustra que Gabriela cambie el alcance en comentarios y nadie se entere. Genera retrabajo.", color: T.sP, votes: ["nacho","gian","eric"] },
      { col: 2, author: "eric", text: "Me molesta que tengamos carry-over por falta de documentación, no por falta de capacidad.", color: T.sB, votes: ["alan","david","gabriela","gian"] },
    ],
  },
  start_stop_continue: {
    initial: [
      { col: 2, author: "gian", text: "Continuar el pairing espontáneo — David y Alan fue clave para resolver el edge case rápido.", color: T.sY, votes: ["alan","eric","gabriela","nacho","david"] },
      { col: 2, author: "eric", text: "Continuar manteniendo el criterio técnico en estimaciones. No ceder ante presión externa.", color: T.sY, votes: ["david","gian","nacho"] },
      { col: 2, author: "gabriela", text: "Continuar el buen ritmo de entregas. Los artistas ya están usando el módulo de Shows.", color: T.sV, votes: ["gian"] },
      { col: 0, author: "alan", text: "Empezar a centralizar los requerimientos de features complejas. Hoy están dispersos en comentarios.", color: T.sO, votes: ["eric","gabriela","gian","david"] },
      { col: 0, author: "gian", text: "Empezar a actualizar los AC cuando el alcance cambia. Que no quede solo en comentarios del PO.", color: T.sP, votes: ["nacho","eric","alan"] },
      { col: 0, author: "eric", text: "Empezar a priorizar bugs reportados en planning. No esperar a que reboten en QA.", color: T.sG, votes: ["alan","david","gian"] },
      { col: 1, author: "eric", text: "Dejar de asumir que todos leen los comentarios de los tickets. No es un canal confiable.", color: T.sB, votes: ["gian","nacho","alan","gabriela"] },
      { col: 1, author: "gian", text: "Dejar de cerrar retros sin action items con dueño y fecha. Las cosas no cambian solas.", color: T.sP, votes: ["eric","david","gabriela"] },
    ],
  },
}

// ─── MOMENTOS DEL JUEGO ───
export const MOMENTS = [
  { id: "apertura",
    narration: "El tablero está poblado. Hay muchos puntos positivos sobre el módulo de Shows funcionando, pero también obstáculos y riesgos. Notás que una sticky tiene 5 votos de 6: la de David ayudando a Alan. Gabriela ya está sonriendo mirando los resultados.",
    chat: [
      { from: "gabriela", text: "¡Miren ese tablero! El módulo de Shows está en prod. Tremendo sprint, equipo." },
      { from: "nacho", text: "Sí, los resultados están buenos. Sigamos así." },
      { from: "eric", text: "Buenos resultados. Hay que estar orgullosos." },
    ],
    prompt: "El tablero muestra muchos puntos positivos a pesar de haber entregado 22 de 29 puntos y 2 tickets de carry-over. Hay obstáculos y riesgos que nadie mencionó todavía. El equipo parece listo para cerrar temprano. ¿Cómo abrís la discusión?",
  },
  { id: "problema_oculto",
    narration: "Después de tu intervención, la energía cambia sutilmente. Gian, que venía callado, se acomoda en la silla.",
    chat: [
      { from: "gian", text: "En realidad... yo sí tengo algo." },
      { from: "gian", text: "SL-103 llegó tarde porque nadie priorizó el bug que reporté en el planning. Después rebotó dos veces en QA. Y en algunos tickets, Gabriela agregó cambios de alcance como comentarios — pero nunca actualizó los criterios de aceptación." },
      { from: "nacho", text: "Sí... me acuerdo. SL-104 tenía el cuerpo del ticket diciendo una cosa y los AC otra. Yo fui con los AC. ¿Qué iba a hacer?" },
    ],
    prompt: "Sale un problema real. Gian está frustrado pero es meticuloso. Nacho suena defensivo. Gabriela (PO) no está en esta reunión. ¿Cómo facilitás este momento?",
  },
  { id: "deuda_documentacion",
    narration: "Tu facilitación abrió la puerta. Alan se inclina hacia adelante, animado por lo que compartió Gian.",
    chat: [
      { from: "alan", text: "Yo tuve algo parecido. El flujo de firma tiene decenas de casos borde dispersos en comentarios de tickets viejos. No hay un documento central." },
      { from: "alan", text: "Me pasé horas este sprint buscando en 20+ tickets para entender los requerimientos reales. Por eso SL-104 quedó como carry-over. No fui lento — simplemente no podía encontrar cuál era el comportamiento esperado." },
      { from: "eric", text: "Tenemos un PRD de Gabriela, pero es de alto nivel. Los detalles reales — excepciones, casos borde — están todos enterrados en hilos de tickets." },
      { from: "gian", text: "Yo vengo reportando esto desde el Sprint 1. Los bugs que encuentro están relacionados con requerimientos que nadie documentó." },
    ],
    prompt: "Dos problemas relacionados están sobre la mesa: cambios de alcance en comentarios (Gian, Nacho) y deuda de documentación causando carry-over (Alan). El equipo está enganchado. Estás en el minuto 25. ¿Cómo conectás estos temas, llevás a la acción, o manejás este momento?",
  },
  { id: "action_items",
    narration: "La retro sacó temas reales. El equipo te mira para cerrar. Es momento de definir acciones concretas que el equipo realmente va a cumplir.",
    chat: [
      { from: "eric", text: "Bueno, entonces... ¿qué hacemos concretamente con esto?" },
      { from: "david", text: "No podemos resolver todo de una. ¿Cuál es la cosa que cambiamos para el próximo sprint?" },
      { from: "gian", text: "Solo quiero asegurarme de que esta vez sea diferente. Hemos hablado de cosas parecidas antes y no cambió nada." },
    ],
    prompt: "El equipo te pide que cierres la retro con action items concretos. Eric quiere claridad, David quiere foco, y Gian quiere asegurarse de que esta vez sí se cumpla. ¿Cómo facilitás la definición de action items? ¿Qué proponés?",
    newStickies: [
      { col: 1, author: "gian", text: "Cambios de alcance del PO solo en comentarios — no en AC ni descripción. Generó confusión y retrabajo.", color: T.sP, votes: ["nacho","eric"] },
      { col: 1, author: "alan", text: "Requerimientos críticos dispersos en 20+ tickets viejos. No hay fuente de verdad. Causó carry-over de SL-104.", color: T.sO, votes: ["eric","gian","gabriela","david"] },
    ],
  },
]

// ─── DIMENSIONES EVALUADAS EN ESTE CHALLENGE ───
export const DIMENSIONS = [
  ["facilitation", "Facilitación"],
  ["safety", "Seguridad Psicológica"],
  ["process", "Diseño de Procesos"],
  ["systems_thinking", "Pensamiento Sistémico"],
  ["ai_fluency", "Uso de IA"],
]
