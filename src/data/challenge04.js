import { T } from "../theme"
import { TEAM, MEMBER_MAP, PBIS as SSOT_PBIS } from "./setlistSprint1"

// Re-export del equipo SSOT
export { TEAM, MEMBER_MAP }

export const SESSION_CONTEXT = "Equipo Setlist, Sprint 1, Día 1 — Kickoff + Planning. Es la primera vez que el equipo trabaja junto y la primera vez que estiman y priorizan en común. La sesión tiene dos partes: PARTE 1 — Team Agreements rápidos (3 acuerdos básicos para arrancar bien); PARTE 2 — Planning Session (estimar y priorizar 12 PBIs con velocity proyectada ~30 pts). La meta del Sprint 1: MVP usable con flujo end-to-end (banda crea show → fan sugiere canciones → banda elige setlist)."

// ─── TEAM AGREEMENT TOPICS (Parte 1 del Día 1) ───
// 3 acuerdos básicos que el SM facilita antes de arrancar el Planning.
// Cada topic tiene:
//   - tensión real entre miembros del equipo
//   - teamSuggestions: ideas que cada miembro propone (el SM puede tomarlas
//     como acuerdo o ignorarlas — refleja la facilitación real)
//   - El SM puede agregar sus propios acuerdos en texto libre además
export const TEAM_AGREEMENT_TOPICS = [
  {
    id: "communication",
    icon: "💬",
    title: "Comunicación & Working Hours",
    question: "¿Cómo se comunica el equipo durante el sprint? ¿Slack? ¿Daily? ¿Horarios respetados?",
    tension: "Eric vive online y responde de noche. Alan trabaja 9-18 y no le gusta que le pinguen tarde. Gabriela mete asks urgentes a las 22hs.",
    teamSuggestions: [
      { from: "eric", text: "Slack en cualquier momento — si no urge no respondo." },
      { from: "alan", text: "Horario fijo 10-18hs. Después no respondo." },
      { from: "gabriela", text: "Si es urgente, llamada directa." },
      { from: "gian", text: "Todo lo no-urgente al daily, no Slack." },
    ]
  },
  {
    id: "dor",
    icon: "📋",
    title: "Definition of Ready",
    question: "¿Cuándo un PBI está LISTO para entrar al sprint?",
    tension: "Gabriela mete PBIs sin criterios claros. El equipo descubre el alcance real en pleno desarrollo. Hoy 'Buscar canción' parece simple, pero ¿incluye autocompletado? ¿búsqueda por álbum?",
    teamSuggestions: [
      { from: "gian", text: "Tener criterios de aceptación escritos." },
      { from: "eric", text: "Estimado en story points por el equipo." },
      { from: "david", text: "Dependencias externas identificadas." },
      { from: "alan", text: "Mockup/wireframe si es UI." },
      { from: "gabriela", text: "Aprobado por PO sin scope creep oculto." },
    ]
  },
  {
    id: "estimation",
    icon: "🃏",
    title: "Cómo estimamos",
    question: "¿Story points o tiempo? ¿Quién vota? ¿Qué hacemos con los desacuerdos?",
    tension: "Nacho viene del mundo freelance y estima en horas. Eric quiere story points relativos. Alan no se anima a estimar fuerte por inseguridad.",
    teamSuggestions: [
      { from: "eric", text: "Story points relativos, comparando con PBIs conocidos." },
      { from: "nacho", text: "Estimamos en horas, es más directo." },
      { from: "gian", text: "Voto secreto Planning Poker, después discusión." },
      { from: "alan", text: "Si hay desacuerdo grande, los extremos explican primero." },
      { from: "david", text: "El estimado lo da quien vaya a hacer la tarea." },
    ]
  }
]

// ─── PRODUCT BACKLOG ITEMS — Setlist MVP Sprint 1 ───
// El catálogo vive en setlistSprint1.js. Re-export para mantener compat con
// el resto del módulo y los componentes que importan de acá.
export const PBIS = SSOT_PBIS

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
  { id: "e3", poker: 1, from: "gabriela", text: "¿Pero cuándo va a estar todo esto? Mateo necesita una fecha para la banda piloto.", tip: "Confunde estimación con compromiso", delay: 3000 },
  { id: "e4", poker: 2, from: "david", text: "Le sumo un par de puntos extra porque integrando con Spotify se complica.", tip: "Estima contexto personal, no complejidad", delay: 3000 },
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
// Features de Setlist para clasificar Basic/Performance/Delighter
export const KANO_ITEMS = [
  { id: "k1", text: "Login funciona sin bugs" },
  { id: "k2", text: "Búsqueda de canciones rápida" },
  { id: "k3", text: "Dark mode" },
  { id: "k4", text: "La banda recibe la sugerencia del fan al instante" },
  { id: "k5", text: "Galería post-show con fotos colaborativas" },
  { id: "k6", text: "Recomendar canciones según género de la banda" },
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
  id: "SL-105",
  title: "Buscar canción",
  scope: "Buscador de canciones integrando Spotify Search API. Incluye autocompletado, info de álbum y artista, manejo de errores cuando el API no responde, y cache local para reducir llamadas.",
}

export const TSHIRT_VOTE_REASONS = {
  eric:  "Ya integré Spotify API en proyectos anteriores. No le veo complejidad real, hay SDKs oficiales.",
  david: "Si Spotify rate-limita o cambia la API, todo el flujo de sugerir canciones cae. Lo siento más arriesgado.",
  gian:  "Hay edge cases de QA: queries vacíos, caracteres especiales, idiomas, API caída. Necesita tiempo de testing.",
  nacho: "Es la primera vez que toco una API externa. No sé cómo manejar el cache ni el rate limit. Lo siento enorme.",
  alan:  "En mobile el buscador es solo UI sobre lo que devuelva la API. Si David me lo expone bien, no es tanto.",
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
