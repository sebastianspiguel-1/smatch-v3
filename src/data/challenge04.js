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

// ─── ACHIEVEMENTS ───
export const ACHIEVEMENTS = [
  { id: "first_tool", label: "Primer Desafío", icon: "🔧", cond: s => s.toolsCompleted >= 1 },
  { id: "board_master", label: "Board Master", icon: "📋", cond: s => s.toolsCompleted >= 4 },
  { id: "detective", label: "Detective", icon: "🕵️", cond: s => s.detected >= 1 },
  { id: "eagle", label: "Ojo de Águila", icon: "🦅", cond: s => s.detected >= 3 },
  { id: "coach", label: "Coach", icon: "🎓", cond: s => s.goodReplies >= 2 },
  { id: "estimator", label: "Estimador", icon: "🃏", cond: s => s.estimated >= 2 },
  { id: "noter", label: "Post-it King", icon: "📝", cond: s => s.notes >= 3 },
]

// ─── DOCK TOOLS ───
export const DOCK_ITEMS = [
  { id: "postit", label: "📝 Post-it", desc: "Nota libre", type: "postit" },
  { id: "textbox", label: "📄 Texto libre", desc: "Explicá algo", type: "textbox" },
  { id: "div0", type: "divider" },
  { id: "poker5", label: "🃏 5 Pasos Poker", desc: "Completá los pasos", type: "challenge" },
  { id: "fib", label: "🔢 Fibonacci", desc: "Ordená la secuencia", type: "challenge" },
  { id: "relabs", label: "⚖️ Rel vs Abs", desc: "Clasificá conceptos", type: "challenge" },
  { id: "tshirt", label: "👕 T-Shirt Sizing", desc: "Facilitá el desacuerdo", type: "challenge" },
  { id: "div1", type: "divider" },
  { id: "kano", label: "🏨 Kano", desc: "Clasificá features", type: "challenge" },
  { id: "moscow", label: "🎯 MoSCoW", desc: "Priorizá el backlog", type: "challenge" },
  { id: "div2", type: "divider" },
  { id: "poker_start", label: "🃏 Iniciar Poker", desc: "Estimar historias", type: "action" },
]

export const MOSCOW_MUSTS = ["SL-201", "SL-202", "SL-203", "SL-204"]

// ─── CHAT RESPONSES ───
export const CHAT_RESPONSES = {
  nacho: { keywords: ["relativ", "compar", "complejidad", "no son hora", "story point"], text: "Ahh! No son horas, es comparación. Creo que entiendo!", mood: "💡" },
  alan: { keywords: ["independ", "sesgo", "propi", "anclaje"], text: "Tenés razón, debería pensar por mi cuenta.", mood: "😐" },
  gabriela: { keywords: ["velocity", "no es fecha", "proyect", "no es compromiso"], text: "Entiendo, con velocity proyectamos pero no prometemos.", mood: "💡" },
  david: { keywords: ["complejidad", "del item", "técnic"], text: "Cierto, estimo complejidad no mi situación.", mood: "✅" },
}

// ─── SCORING DIMENSIONS ───
export const DIMENSIONS = [
  ["coaching", "Coaching"],
  ["maturity", "Madurez Scrum"],
  ["facilitation", "Facilitación"],
  ["systems", "Pensamiento Sistémico"],
  ["safety", "Seguridad Psicológica"],
]
