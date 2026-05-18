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

export const SESSION_CONTEXT = "Equipo Setlist, Sprint 1. Nunca estimaron ni priorizaron juntos. 12 historias en backlog. Velocity estimada: ~30 puntos para sprint de 2 semanas."

// ─── PRODUCT BACKLOG ITEMS ───
export const PBIS = [
  { id: "SL-201", title: "Login y registro", desc: "Registro, login, JWT, recuperar contraseña.", pts: 8, category: "must" },
  { id: "SL-202", title: "Listado shows", desc: "Lista paginada de shows, filtros, ordenamiento.", pts: 5, category: "must" },
  { id: "SL-203", title: "Gestión de contratos", desc: "Crear, editar y firmar contratos digitales.", pts: 8, category: "must" },
  { id: "SL-204", title: "Integración MercadoPago", desc: "Pasarela de pago, confirmación, recibo.", pts: 13, category: "must" },
  { id: "SL-205", title: "Panel admin venues", desc: "CRUD venues, dashboard shows.", pts: 8, category: "should" },
  { id: "SL-206", title: "Búsqueda de artistas", desc: "Búsqueda por texto, autocompletado.", pts: 5, category: "should" },
  { id: "SL-207", title: "Notificaciones push", desc: "Confirmación show, recordatorios, cambios.", pts: 5, category: "should" },
  { id: "SL-208", title: "Reviews de shows", desc: "Calificar shows, mostrar promedio.", pts: 5, category: "could" },
  { id: "SL-209", title: "Setlist colaborativo", desc: "Co-crear setlists con fans, votación.", pts: 3, category: "could" },
  { id: "SL-210", title: "Chat en vivo", desc: "Chat artista-venue en tiempo real.", pts: 13, category: "wont" },
  { id: "SL-211", title: "Programa de referidos", desc: "Invitar artistas, descuento por referido.", pts: 8, category: "could" },
  { id: "SL-212", title: "Dark mode", desc: "Tema oscuro, toggle, persistencia.", pts: 3, category: "could" },
]

export const FIBONACCI = [1, 2, 3, 5, 8, 13, 21]
export const TSHIRTS = ["XS", "S", "M", "L", "XL", "XXL"]

// ─── POKER VOTES (pre-set per PBI index) ───
export const POKER_VOTES = {
  0: { eric: 5, david: 8, gian: 8, nacho: 13, alan: 5 },
  1: { eric: 3, david: 5, gian: 5, nacho: 8, alan: 3 },
  2: { eric: 5, david: 8, gian: 8, nacho: 13, alan: 5 },
  3: { eric: 13, david: 13, gian: 13, nacho: 21, alan: 8 },
}

// ─── DETECTION EVENTS (bad behaviors to catch during poker) ───
export const EVENTS = [
  { id: "e1", poker: 0, from: "alan", text: "Yo pongo lo mismo que Eric, él sabe más.", tip: "Sesgo de anclaje", delay: 2500 },
  { id: "e2", poker: 0, from: "nacho", text: "Puse 13 porque me llevaría unos 13 días más o menos.", tip: "Confunde puntos con tiempo", delay: 5500 },
  { id: "e3", poker: 1, from: "gabriela", text: "¿Pero cuándo va a estar todo esto? Simon (Lollapalooza) necesita una fecha.", tip: "Confunde estimación con compromiso", delay: 3000 },
  { id: "e4", poker: 2, from: "david", text: "Le sumo un par de puntos extra porque integrando con Pagos se complica.", tip: "Estima contexto personal, no complejidad", delay: 3000 },
]

// ─── PROACTIVE TEAM QUESTIONS (fire at intervals) ───
export const TEAM_QUESTIONS = [
  { id: "q1", from: "nacho", text: "¿Qué son los story points? No entiendo la diferencia con horas.", delay: 8000, mood: "🤔" },
  { id: "q2", from: "gabriela", text: "¿Podemos empezar a estimar? Necesito saber cuánto entra en el sprint.", delay: 20000 },
  { id: "q3", from: "alan", text: "¿Y si no estamos de acuerdo en la estimación qué hacemos?", delay: 35000 },
  { id: "q4", from: "eric", text: "¿Vamos a usar algún framework para priorizar o decidimos a dedo?", delay: 55000, mood: "🤨" },
  { id: "q5", from: "gian", text: "¿Cómo definimos qué es más importante? ¿Valor de negocio o complejidad técnica?", delay: 70000 },
]

// ─── SCORING DIMENSIONS ───
// Challenge identity: Scrum process mastery + Estimation coaching + Bias detection
export const DIMENSIONS = [
  ["process_mastery", "Process Mastery (Scrum)"],
  ["bias_coaching", "Coaching de Sesgos"],
  ["facilitation", "Facilitación"],
  ["systems_thinking", "Pensamiento Sistémico"],
  ["ai_fluency", "Uso de IA"],
]
