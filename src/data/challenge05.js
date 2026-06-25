import { T } from "../theme"
import { TEAM, MEMBER_MAP, TEAM_DESC_SHORT } from "./setlistSprint1"

// Re-export del equipo SSOT para los componentes que ya lo importan acá.
export { TEAM, MEMBER_MAP }

// ─── CONTEXTO DEL SPRINT ───
export const SPRINT_CONTEXT =
  "Setlist · Sprint 1 cerrando (Día 10/10). Es la PRIMERA retro del equipo. Entregaron 22 de 30 puntos comprometidos. En papel, aceptable. Pero hay tensión que nadie nombra. Nacho entregó SL-103 (Compartir link) tarde sin avisar. Alan hizo trabajo extra para cubrir y no lo dijo. Gian levantó un bug en SL-107 (Votar canciones) que fue ignorado en el planning. Eric está callado. Gabriela celebra el sprint. SL-105 (Buscar canción) sigue bloqueada esperando Spotify API y va a quedar como carry-over. El SM tiene que ir más abajo de la superficie. El piloto con la primera banda arranca en 4 semanas."

export const SPRINT_STATS = [
  { icon: "🎯", label: "Comprometido", value: "30 pts" },
  { icon: "✅", label: "Completado", value: "22 pts" },
]

export const SPRINT_SIGNALS = [
  {
    from: "eric",
    text: "En la estimación, el equipo discutió fuerte la complejidad de SL-107 (Votar). Los devs se plantaron y no cedieron ante la presión.",
    ts: "Día 1",
  },
  {
    from: "gian",
    text: "SL-104 (RSVP) rebotó 2 veces en QA. Los criterios de aceptación cambiaron en comentarios sin actualizar la descripción del ticket.",
    ts: "Día 6",
  },
  {
    from: "david",
    text: "Alan estuvo trabado medio día con un edge case del RSVP. Me metí 30 min y lo resolvimos juntos.",
    ts: "Día 8",
  },
  {
    from: "alan",
    text: "SL-105 (Buscar canción) sigue esperando aprobación de Spotify. Es el bloqueo del sprint.",
    ts: "Día 9",
  },
]

// ─── TENSIONES LATENTES ("lo no dicho") ───
// NO están en el tablero. Son lo personal/emocional que el equipo se calla.
// Solo emergen si el candidato facilita lo suficientemente bien para sacarlas.
// La IA decide si una acción del SM las "gana" (ver buildRetroFacilitationPrompt).
// Este es el núcleo evaluable de la retro: ¿detecta y crea seguridad para lo no dicho?
export const HIDDEN_TENSIONS = [
  {
    id: "gian_bug",
    from: "gian",
    text: "El bug de SL-107 lo reporté en el planning y nadie lo priorizó. Después rebotó dos veces y quedé yo como el que frena todo. Me re calentó, pero no lo dije.",
    hint: "Emerge si el SM le pregunta a Gian directo por el bug, por qué rebotó SL-107, o si nota que está incómodo y le abre espacio. NO emerge si solo se celebra el sprint.",
  },
  {
    id: "nacho_late",
    from: "nacho",
    text: "Entregué SL-103 tarde y no avisé. Me trabé y me dio vergüenza pedir ayuda siendo el nuevo. Alan me cubrió y ni se lo agradecí en público.",
    hint: "Emerge SOLO si el SM toca la entrega tardía SIN culpar, creando seguridad. Si el SM acusa o lo expone, Nacho se cierra y NO se revela.",
  },
  {
    id: "eric_silence",
    from: "eric",
    text: "Estoy callado porque cuando digo lo que pienso se arman roces y prefiero evitarlo. Pero hay varias cosas de este sprint que no comparto.",
    hint: "Emerge si el SM invita explícitamente la voz de Eric ('Eric, ¿vos qué ves?', 'te noto callado'). NO emerge si el SM deja que Gabriela y Nacho dominen la sala.",
  },
]

// ─── TEAM DESCRIPTION (para el prompt de AI) ───
export const TEAM_DESC = TEAM_DESC_SHORT

// ─── FORMATOS DE RETRO ───
export const FORMATS = [
  {
    id: "sailboat",
    name: "Sailboat",
    cols: ["Wind 🌬️", "Anchor ⚓", "Rocks 🪨", "Island 🏝️"],
    desc: "Metáfora del barco: viento que impulsa, ancla que frena, rocas de riesgo, isla como meta.",
    hint: "Ideal para visualizar fuerzas y dirección del equipo.",
  },
  {
    id: "glad_sad_mad",
    name: "Glad / Sad / Mad",
    cols: ["Glad 😊", "Sad 😔", "Mad 😤"],
    desc: "Basado en emociones: abre canales para lo que el equipo siente.",
    hint: "Ideal cuando hay tensión bajo la superficie.",
  },
  {
    id: "start_stop_continue",
    name: "Start / Stop / Continue",
    cols: ["Start", "Stop", "Continue"],
    desc: "Orientado a la acción: impulsa cambios concretos de comportamiento.",
    hint: "Ideal para equipos que necesitan cambiar hábitos.",
  },
]

// ─── STICKIES POR FORMATO (referencian PBIs canónicos del SSOT) ───
export const STICKIES = {
  sailboat: {
    initial: [
      // Wind 🌬️ — Lo que nos impulsa
      { col: 0, author: "gian", text: "SL-101 (Crear show) y SL-102 (Login) salieron limpios. Los fans pueden sumarse al show con 1 tap.", color: T.sY, votes: ["eric", "david", "alan", "gabriela"] },
      { col: 0, author: "eric", text: "El backend de Crear Show quedó armado rápido. Buena arquitectura, endpoints limpios.", color: T.sB, votes: ["david", "gian", "nacho"] },
      { col: 0, author: "david", text: "David y Alan se juntaron 30 min para resolver un edge case del RSVP. Ese pairing nos salvó.", color: T.sY, votes: ["alan", "gian", "eric", "gabriela", "nacho"] },
      { col: 0, author: "gabriela", text: "Buen ritmo. La banda piloto ya vio una demo del flujo de crear show.", color: T.sV, votes: ["gian"] },

      // Anchor ⚓ — Lo que nos frena
      { col: 1, author: "alan", text: "Los criterios de aceptación de SL-104 (RSVP) cambiaron en comentarios. Nadie actualizó la descripción.", color: T.sO, votes: ["eric", "gian", "gabriela"] },
      { col: 1, author: "gian", text: "SL-107 (Votar) llegó tarde con un bug que ya había reportado en el planning. Rebotó 2 veces.", color: T.sP, votes: ["nacho", "eric", "alan"] },
      { col: 1, author: "nacho", text: "SL-106 (Sugerir canción) cambió de alcance solo en comentarios. Los AC nunca se actualizaron.", color: T.sP, votes: ["alan", "gian"] },

      // Rocks 🪨 — Riesgos
      { col: 2, author: "david", text: "SL-105 (Buscar canción / Spotify) sigue bloqueada. Si no aprueban la API en 1 semana, el demo va sin búsqueda.", color: T.sB, votes: ["eric", "gabriela"] },
      { col: 2, author: "eric", text: "Si seguimos sin doc central de features complejas, cada ticket va a tener carry-over.", color: T.sG, votes: ["alan", "gian", "gabriela"] },

      // Island 🏝️ — Meta
      { col: 3, author: "nacho", text: "Piloto con la primera banda en 4 semanas — flujo completo: crear show, RSVP, sugerir, votar.", color: T.sY, votes: ["gian", "eric"] },
      { col: 3, author: "gian", text: "Tener una fuente de verdad para criterios de aceptación. Hoy no existe.", color: T.sG, votes: ["alan", "gabriela", "eric", "david"] },
    ],
  },
  glad_sad_mad: {
    initial: [
      { col: 0, author: "gian", text: "Orgullo: SL-101 + SL-102 + SL-103 en prod. Los fans ya pueden sumarse a un show.", color: T.sY, votes: ["eric", "david", "gabriela"] },
      { col: 0, author: "eric", text: "Contento: el equipo se plantó en la estimación de SL-107 (Votar). Mostramos criterio técnico.", color: T.sG, votes: ["eric", "gian", "david"] },
      { col: 0, author: "nacho", text: "Buen ambiente. Contento de ser parte de este equipo.", color: T.sO, votes: [] },
      { col: 0, author: "david", text: "David y Alan resolviendo el RSVP en 30 min — eso es ownership del equipo de verdad.", color: T.sY, votes: ["alan", "gian", "eric", "gabriela", "nacho"] },
      { col: 1, author: "alan", text: "Triste por SL-105 (Buscar canción) bloqueada todo el sprint. No depende de nosotros y eso frustra.", color: T.sO, votes: ["gabriela", "gian", "eric"] },
      { col: 1, author: "gian", text: "Me entristece que el bug de SL-107 que reporté en el planning no se priorizó. Después rebotó.", color: T.sP, votes: ["alan", "gabriela", "david"] },
      { col: 2, author: "nacho", text: "Me frustra que Gabriela cambie el alcance en comentarios y nadie se entere. Genera retrabajo.", color: T.sP, votes: ["nacho", "gian", "eric"] },
      { col: 2, author: "eric", text: "Me molesta que tengamos carry-over por falta de documentación, no por falta de capacidad.", color: T.sB, votes: ["alan", "david", "gabriela", "gian"] },
    ],
  },
  start_stop_continue: {
    initial: [
      { col: 2, author: "gian", text: "Continuar el pairing espontáneo — David y Alan en el RSVP fue clave.", color: T.sY, votes: ["alan", "eric", "gabriela", "nacho", "david"] },
      { col: 2, author: "eric", text: "Continuar manteniendo el criterio técnico en estimaciones. No ceder ante presión externa.", color: T.sY, votes: ["david", "gian", "nacho"] },
      { col: 2, author: "gabriela", text: "Continuar el buen ritmo de entregas. La banda piloto vio progreso real.", color: T.sV, votes: ["gian"] },
      { col: 0, author: "alan", text: "Empezar a centralizar los criterios de features complejas. Hoy están dispersos en comentarios.", color: T.sO, votes: ["eric", "gabriela", "gian", "david"] },
      { col: 0, author: "gian", text: "Empezar a actualizar los AC cuando el alcance cambia. Que no quede solo en comentarios del PO.", color: T.sP, votes: ["nacho", "eric", "alan"] },
      { col: 0, author: "eric", text: "Empezar a priorizar bugs reportados en planning. No esperar a que reboten en QA.", color: T.sG, votes: ["alan", "david", "gian"] },
      { col: 1, author: "eric", text: "Dejar de asumir que todos leen los comentarios de los tickets. No es un canal confiable.", color: T.sB, votes: ["gian", "nacho", "alan", "gabriela"] },
      { col: 1, author: "gian", text: "Dejar de cerrar retros sin action items con dueño y fecha. Las cosas no cambian solas.", color: T.sP, votes: ["eric", "david", "gabriela"] },
    ],
  },
}

// ─── DIMENSIONES EVALUADAS ───
export const DIMENSIONS = [
  ["facilitation", "Facilitación"],
  ["safety", "Seguridad Psicológica"],
  ["process", "Diseño de Procesos"],
  ["systems_thinking", "Pensamiento Sistémico"],
  ["ai_fluency", "Uso de IA"],
]
