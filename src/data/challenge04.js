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

// ─── DOCK TOOLS (estaciones de coaching: el SM las usa + las explica) ───
export const DOCK_ITEMS = [
  { id: "postit", label: "📝 Post-it", desc: "Nota libre", type: "postit" },
  { id: "textbox", label: "📄 Nota libre", desc: "Explicá algo extenso", type: "textbox" },
  { id: "div0", type: "divider" },
  { id: "poker5", label: "🃏 5 pasos Poker", desc: "Procesos de PP", type: "challenge", color: "#e84393" },
  { id: "fib", label: "🔢 Fibonacci", desc: "Por qué la secuencia", type: "challenge", color: "#00b894" },
  { id: "relabs", label: "⚖️ Rel vs Abs", desc: "Estimación relativa", type: "challenge", color: "#0984e3" },
  { id: "tshirt", label: "👕 T-shirt sizing", desc: "Facilitá desacuerdo", type: "challenge", color: "#6c5ce7" },
  { id: "div1", type: "divider" },
  { id: "kano", label: "🏨 Modelo Kano", desc: "Clasificá features", type: "challenge", color: "#f39c12" },
  { id: "moscow", label: "🎯 MoSCoW", desc: "Priorizá el backlog", type: "challenge", color: "#e74c3c" },
  { id: "div2", type: "divider" },
  { id: "poker_start", label: "🃏 Iniciar Planning Poker", desc: "Estimar historias en vivo", type: "action" },
]

// ─── KANO ITEMS (no hay respuesta única correcta — el SM clasifica y EXPLICA) ───
export const KANO_ITEMS = [
  { id: "k1", text: "Login funciona" },
  { id: "k2", text: "Búsqueda rápida" },
  { id: "k3", text: "Dark mode" },
  { id: "k4", text: "Se puede pagar" },
  { id: "k5", text: "Referidos" },
  { id: "k6", text: "Filtros avanzados" },
]

// ─── REL/ABS ITEMS ───
export const RELABS_ITEMS = [
  { id: "r1", text: "Story Points" },
  { id: "r2", text: "Horas" },
  { id: "r3", text: "Comparación entre items" },
  { id: "r4", text: "Días en el calendario" },
  { id: "r5", text: "Equipo decide juntos" },
  { id: "r6", text: "Varía según la persona" },
]

// ─── T-SHIRT votes (simulan desacuerdo, el SM facilita) ───
// Cada voto tiene una RAZÓN realista que el SM necesita conocer para facilitar.
// Esto le da material concreto para el coaching.
export const TSHIRT_TEAM_VOTES = {
  eric: "M",
  david: "L",
  gian: "L",
  nacho: "XL",
  alan: "M",
}

export const TSHIRT_PBI_INFO = {
  id: "SL-201",
  title: "Login y registro",
  scope: "Registro de usuarios (artistas y venues), login con JWT, recuperar contraseña por email, y validación básica.",
}

export const TSHIRT_VOTE_REASONS = {
  eric:  "Ya implementé JWT en una startup anterior. No le veo complejidad real, son flujos conocidos.",
  david: "Pago tiene login propio. Si esto rompe, mi módulo cae también. Lo siento más arriesgado.",
  gian:  "Hay edge cases de QA: emails inválidos, contraseñas viejas, expiración de token. Necesita tiempo de testing.",
  nacho: "Es la primera vez que armo flujo de auth en mobile. Lo siento enorme, no sé por dónde empezar.",
  alan:  "En mobile he hecho login varias veces. Tirando de librerías estándar, no es taaan grave.",
}

// ─── POKER STEPS prompts (sin keyword matching, el SM completa libre) ───
export const POKER_STEPS_PROMPTS = [
  "El PO ______ el PBI al equipo",
  "El equipo ______ dudas",
  "Cada uno ______ su carta individualmente",
  "Se ______ todas las cartas al mismo tiempo",
  "Los ______ explican por qué votaron distinto",
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
