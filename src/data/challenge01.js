import { T } from "../theme"

// ─── EQUIPO ───
export const TEAM = [
  { id: "marcus", name: "Marcus Chen", role: "Tech Lead", color: "#60a5fa", init: "MC" },
  { id: "diego", name: "Diego Herrera", role: "Senior Dev", color: "#34d399", init: "DH" },
  { id: "valentina", name: "Valentina Torres", role: "QA", color: "#f472b6", init: "VT" },
  { id: "lucas", name: "Lucas Vargas", role: "Developer", color: "#fb923c", init: "LV" },
  { id: "mateo", name: "Mateo Silva", role: "Dev (6 meses)", color: "#22d3ee", init: "MS" },
  { id: "sofia", name: "Sofía Park", role: "QA Lead", color: "#fbbf24", init: "SP" },
  { id: "ryan", name: "Ryan Davies", role: "DevOps", color: "#f87171", init: "RD" },
]

export const MEMBER_MAP = Object.fromEntries(TEAM.map(t => [t.id, t]))

// ─── CONTEXTO DEL SPRINT ───
export const SPRINT_CONTEXT = "Equipo Fenix, Sprint 17. Comprometieron 37 puntos, completaron 31. 3 tickets de carry-over. Sprint anterior también fue exitoso. Durante el sprint: pushback sano en estimación, senior dev ayudó a junior con bloqueo, QA encontró cambios de alcance solo en comentarios (no en AC), un dev pasó horas buscando requerimientos en tickets viejos."

export const SPRINT_STATS = [
  { icon: "🎯", label: "Comprometido", value: "37 pts" },
  { icon: "✅", label: "Completado", value: "31 pts" },
  { icon: "🔄", label: "Carry-over", value: "3 tickets" },
]

export const SPRINT_SIGNALS = [
  { from: "marcus", text: "En la estimación, el equipo discutió fuerte sobre la complejidad de un ticket. Los devs se plantaron y no cedieron ante la presión. Buena señal.", ts: "Día 2" },
  { from: "sofia", text: "El ciclo de QA fue mayormente fluido, pero el ticket de propagación rebotó dos veces. Los requerimientos estaban dispersos.", ts: "Día 6" },
  { from: "diego", text: "Mateo estuvo trabado 2 días con una migración de datos. Me metí y en 20 minutos encontramos el problema de configuración juntos.", ts: "Día 8" },
  { from: "valentina", text: "Testé un ticket basándome en comentarios del PO que cambiaban el alcance, pero el dev no los había visto. Tuvimos que rehacer trabajo.", ts: "Día 9" },
]

// ─── TEAM DESCRIPTION (para el prompt de AI) ───
export const TEAM_DESC = `- Marcus Chen (Tech Lead) — reflexivo, estratégico, habla con calma
- Diego Herrera (Senior Dev) — seguro, experimentado, valora la madurez del equipo
- Valentina Torres (QA) — diplomática pero firme, frustrada por gaps de proceso
- Lucas Vargas (Developer) — tiende a minimizar problemas, algo defensivo cuando lo cuestionan
- Mateo Silva (Dev, 6 meses) — entusiasmado pero a veces inseguro, preocupado por la documentación
- Sofía Park (QA Lead) — energía positiva, orientada a la acción, quiere centralizar docs de test
- Ryan Davies (DevOps) — callado, práctico, habla cuando tiene algo concreto`

// ─── FORMATOS DE RETRO ───
export const FORMATS = [
  { id: "keep_improve", name: "Keep Doing / Improve", cols: ["Keep Doing", "Improve"],
    desc: "Dos columnas: reforzar lo que funciona y detectar mejoras.", hint: "Ideal para equipos con racha positiva." },
  { id: "glad_sad_mad", name: "Glad / Sad / Mad", cols: ["Glad 😊", "Sad 😔", "Mad 😤"],
    desc: "Basado en emociones: abre canales para lo que el equipo siente.", hint: "Ideal cuando hay tensión bajo la superficie." },
  { id: "start_stop_continue", name: "Start / Stop / Continue", cols: ["Start", "Stop", "Continue"],
    desc: "Orientado a la acción: impulsa cambios concretos de comportamiento.", hint: "Ideal para equipos que necesitan cambiar hábitos." },
]

// ─── STICKIES POR FORMATO (con votos) ───
export const STICKIES = {
  keep_improve: {
    initial: [
      { col: 0, author: "sofia", text: "Comunicación excelente entre devs y QA. Syncs rápidos y efectivos.", color: T.sY, votes: ["marcus","diego","mateo","valentina"] },
      { col: 0, author: "lucas", text: "Nada que agregar. Sigamos así como Fenix. 💪", color: T.sG, votes: [] },
      { col: 0, author: "diego", text: "En la estimación mantuvimos el criterio técnico aunque había presión. Eso es madurez.", color: T.sB, votes: ["marcus","sofia","ryan"] },
      { col: 0, author: "ryan", text: "Deploys sin incidentes. Requerimientos de backend claros esta vez.", color: T.sV, votes: ["sofia"] },
      { col: 0, author: "diego", text: "Diego ayudó a Mateo a destrabar su ticket de migración — 20 min de pairing y encontraron el problema juntos.", color: T.sY, votes: ["mateo","sofia","marcus","valentina","lucas","ryan"] },
      { col: 1, author: "mateo", text: "Me costó mucho encontrar los requerimientos reales de propagación. Están dispersos en comentarios de tickets viejos.", color: T.sO, votes: ["marcus","sofia","valentina"] },
      { col: 1, author: "valentina", text: "Algunos tickets cambiaron de alcance solo en comentarios. Los AC nunca se actualizaron.", color: T.sP, votes: ["lucas","sofia","marcus"] },
      { col: 1, author: "ryan", text: "El pipeline de staging se rompió dos veces porque no había tests de integración para los nuevos endpoints.", color: T.sB, votes: ["marcus"] },
    ],
  },
  glad_sad_mad: {
    initial: [
      { col: 0, author: "sofia", text: "Orgullo por la entrega del equipo. Mejor sprint en meses.", color: T.sY, votes: ["marcus","diego","valentina"] },
      { col: 0, author: "diego", text: "Contento de que el equipo se plantó en la estimación. Mostramos carácter.", color: T.sG, votes: ["marcus","sofia","ryan"] },
      { col: 0, author: "lucas", text: "Buen ambiente. Contento de ser parte de este equipo.", color: T.sO, votes: [] },
      { col: 0, author: "diego", text: "Diego ayudando a Mateo con el bloqueo — eso es ownership del equipo de verdad.", color: T.sY, votes: ["mateo","sofia","marcus","valentina","lucas","ryan"] },
      { col: 1, author: "mateo", text: "Triste por no haber podido terminar mi ticket de propagación. Los requerimientos estaban por todos lados.", color: T.sO, votes: ["valentina","sofia","marcus"] },
      { col: 1, author: "sofia", text: "Me entristece que estoy centralizando reglas de negocio sola, en mis ratos libres. Nadie lo priorizó.", color: T.sP, votes: ["mateo","valentina","diego"] },
      { col: 2, author: "valentina", text: "Me frustra que el PO cambie el alcance en comentarios y nadie se entere. Genera retrabajo.", color: T.sP, votes: ["lucas","sofia","marcus"] },
      { col: 2, author: "marcus", text: "Me molesta que tengamos carry-over por falta de documentación, no por falta de capacidad.", color: T.sB, votes: ["mateo","diego","valentina","sofia"] },
    ],
  },
  start_stop_continue: {
    initial: [
      { col: 2, author: "sofia", text: "Continuar la comunicación fuerte y los syncs rápidos dev-QA.", color: T.sY, votes: ["marcus","diego","valentina"] },
      { col: 2, author: "diego", text: "Continuar el pairing espontáneo — Diego y Mateo fue clave.", color: T.sY, votes: ["mateo","sofia","marcus","valentina","lucas","ryan"] },
      { col: 2, author: "ryan", text: "Continuar el sync fluido backend-DevOps.", color: T.sV, votes: ["sofia"] },
      { col: 0, author: "mateo", text: "Empezar a centralizar los requerimientos de features complejas. Hoy no existe un documento central.", color: T.sO, votes: ["marcus","valentina","sofia","diego"] },
      { col: 0, author: "valentina", text: "Empezar a actualizar los AC cuando el alcance cambia. Que no quede solo en comentarios.", color: T.sP, votes: ["lucas","sofia","marcus"] },
      { col: 0, author: "sofia", text: "Empezar a reservar tiempo del sprint para documentación técnica. No hacerlo 'en los ratos libres'.", color: T.sG, votes: ["mateo","diego","valentina"] },
      { col: 1, author: "marcus", text: "Dejar de asumir que todos leen los comentarios de los tickets. No es un canal confiable.", color: T.sB, votes: ["valentina","lucas","sofia","mateo"] },
      { col: 1, author: "valentina", text: "Dejar de cerrar retros sin action items con dueño y fecha. Las cosas no cambian solas.", color: T.sP, votes: ["marcus","diego","sofia"] },
    ],
  },
}

// ─── MOMENTOS DEL JUEGO ───
export const MOMENTS = [
  { id: "apertura",
    narration: "El tablero está poblado. La gran mayoría de las stickies son positivas. Hay una o dos en la columna de mejoras, pero el equipo parece satisfecho. Notás que una sticky tiene 6 votos de 7: la de Diego ayudando a Mateo. Sofía ya está sonriendo mirando los resultados.",
    chat: [
      { from: "sofia", text: "¡Miren ese tablero! Casi todo positivo. Tremendo sprint, equipo." },
      { from: "lucas", text: "La verdad, no tengo nada para mejorar. Sigamos así." },
      { from: "marcus", text: "Buenos resultados. Hay que estar orgullosos." },
    ],
    prompt: "El tablero es mayormente positivo a pesar de haber tenido 6 puntos sin entregar y 3 tickets de carry-over. Hay una o dos stickies en la columna de mejoras que nadie mencionó todavía. El equipo parece listo para cerrar temprano. ¿Cómo abrís la discusión?",
  },
  { id: "problema_oculto",
    narration: "Después de tu intervención, la energía cambia sutilmente. Valentina, que venía callada, se acomoda en la silla.",
    chat: [
      { from: "valentina", text: "En realidad... yo sí tengo algo." },
      { from: "valentina", text: "En algunos tickets de este sprint, el PO agregó cambios de alcance como comentarios — pero nunca actualizó los criterios de aceptación. Yo testé en base a esos comentarios, pero Lucas no los vió. Terminamos rehaciendo trabajo." },
      { from: "lucas", text: "Sí... me acuerdo. El cuerpo del ticket decía una cosa y los AC otra. Yo fui con los AC. ¿Qué iba a hacer?" },
    ],
    prompt: "Sale un problema real. Valentina está frustrada pero es diplomática. Lucas suena defensivo. El PO que hizo los cambios no está en esta reunión. ¿Cómo facilitás este momento?",
    newStickies: [
      { col: 1, author: "valentina", text: "Cambios de alcance del PO solo en comentarios — no en AC ni descripción. Generó confusión y retrabajo.", color: T.sP, votes: ["lucas","sofia"] },
    ],
  },
  { id: "deuda_documentacion",
    narration: "Tu facilitación abrió la puerta. Mateo se inclina hacia adelante, animado por lo que compartió Valentina.",
    chat: [
      { from: "mateo", text: "Yo tuve algo parecido. La feature de propagación tiene decenas de casos borde dispersos en comentarios de tickets viejos. No hay un documento central. Me pasé horas este sprint buscando en 30+ tickets para entender los requerimientos reales." },
      { from: "mateo", text: "Por eso el ticket FEN-342 quedó como carry-over. No fui lento — simplemente no podía encontrar cuál era el comportamiento esperado." },
      { from: "marcus", text: "Tenemos un PRD del PO, pero es de alto nivel. Los detalles reales — excepciones, casos borde — están todos enterrados en hilos de tickets." },
      { from: "sofia", text: "Yo estoy trabajando en centralizar los test cases y las reglas de negocio. Pero es un esfuerzo enorme y lo hago en mis ratos libres." },
    ],
    prompt: "Dos problemas relacionados están sobre la mesa: cambios de alcance en comentarios (Valentina) y deuda de documentación causando carry-over (Mateo). El equipo está enganchado. Estás en el minuto 25. ¿Cómo conectás estos temas, llevás a la acción, o manejás este momento?",
    newStickies: [
      { col: 1, author: "mateo", text: "Requerimientos críticos dispersos en 30+ tickets viejos. No hay fuente de verdad. Causó carry-over.", color: T.sO, votes: ["marcus","sofia","valentina","diego"] },
    ],
  },
  { id: "action_items",
    narration: "La retro sacó temas reales. El equipo te mira para cerrar. Es momento de definir acciones concretas que el equipo realmente va a cumplir.",
    chat: [
      { from: "marcus", text: "Bueno, entonces... ¿qué hacemos concretamente con esto?" },
      { from: "diego", text: "No podemos resolver todo de una. ¿Cuál es la cosa que cambiamos para el próximo sprint?" },
      { from: "valentina", text: "Solo quiero asegurarme de que esta vez sea diferente. Hemos hablado de cosas parecidas antes y no cambió nada." },
    ],
    prompt: "El equipo te pide que cierres la retro con action items concretos. Marcus quiere claridad, Diego quiere foco, y Valentina quiere asegurarse de que esta vez sí se cumpla. ¿Cómo facilitás la definición de action items? ¿Qué proponés?",
  },
]

// ─── DIMENSIONES EVALUADAS EN ESTE CHALLENGE ───
export const DIMENSIONS = [
  ["facilitation", "Facilitación"],
  ["systems", "Pensamiento Sistémico"],
  ["safety", "Seguridad Psicológica"],
  ["coaching", "Coaching"],
  ["process", "Diseño de Procesos"],
]
