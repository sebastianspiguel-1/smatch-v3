// ═══════════════════════════════════════════════════
// SETLIST · SPRINT 1 — SINGLE SOURCE OF TRUTH
// ═══════════════════════════════════════════════════
//
// Todo el universo del assessment vive acá: producto, equipo, PBIs,
// ceremonias del sprint y tensiones canónicas. Los 5 challenges importan
// de este archivo para garantizar consistencia.
//
// REGLA: nadie hardcodea PBIs ni miembros del equipo en data/challengeXX.js.
// Si necesitan información sobre el sprint, viene de acá.
// ═══════════════════════════════════════════════════

// ─── PRODUCTO ───
export const PRODUCT = {
  name: "Setlist",
  tagline: "App colaborativa: las bandas crean shows y los fans votan qué canciones se tocan.",
  mechanic: "Vox populi pura — la banda toca exactamente lo que más voto recibe. Cero veto.",
  pilotPartner: "la banda piloto",
  pilotInWeeks: 4,
  pilotStakes: "Show real público con audience real. Si la app falla, falla en público.",
}

// ─── EQUIPO ───
// Enriquecido con tagline + bio + emoji para TeamPanel.
export const TEAM = [
  {
    id: "eric",
    name: "Eric",
    role: "Tech Lead",
    color: "#60a5fa",
    init: "ER",
    emoji: "⚡",
    tagline: "Pragmático, prioriza velocidad sobre procesos",
    bio: "Brillante y directo, a veces cortante. Construyó el backend casi solo en sus primeras semanas. Viene de una startup donde 'velocidad > todo'. Desconfía de procesos que frenen el delivery. Cuando algo técnico le preocupa lo dice; cuando algo humano le preocupa, se calla.",
  },
  {
    id: "david",
    name: "David",
    role: "Dev Backend / APIs",
    color: "#34d399",
    init: "DV",
    emoji: "🔇",
    tagline: "Callado y práctico, no escala bloqueos",
    bio: "Práctico, callado, no le gustan las discusiones filosóficas. Responsable de las APIs y las integraciones externas (Spotify search, auth, push). Tiende a no escalar bloqueos rápido y se traba solo en lugar de pedir ayuda. Buena ética de trabajo pero le cuesta comunicar.",
  },
  {
    id: "alan",
    name: "Alan",
    role: "Dev Mobile",
    color: "#f472b6",
    init: "AL",
    emoji: "🤐",
    tagline: "Inseguro, viene quebrado de su trabajo anterior",
    bio: "Callado, inseguro. Background mobile fuerte pero no se anima a opinar mucho. Llegó a Setlist arrastrando burnout de su empresa anterior (1+ año a 14h/día, nadie del equipo sabe esto). Detecta problemas pero no los nombra. Necesita ser invitado a la conversación.",
  },
  {
    id: "gian",
    name: "Gian",
    role: "QA",
    color: "#fb923c",
    init: "GI",
    emoji: "🔍",
    tagline: "Meticuloso, calidad sobre velocidad",
    bio: "Meticuloso, orientado a calidad. Viene de una fintech donde cualquier bug era crítico. Propone 'Calidad sobre velocidad' y tests obligatorios en DoD. Ya anticipa que el equipo va a ignorar sus warnings, pero los levanta igual.",
  },
  {
    id: "gabriela",
    name: "Gabriela",
    role: "Product Owner",
    color: "#a78bfa",
    init: "GA",
    emoji: "🎯",
    tagline: "Conecta con bandas y fans, mete scope creep",
    bio: "Conecta bien con bandas y fans, quiere iterar rápido. Apoya a Eric en velocidad. Tiende a meter scope creep en el sprint y cambiar requirements en comentarios sin avisar a todos. Foco fuerte en la entrega externa.",
  },
  {
    id: "nacho",
    name: "Nacho",
    role: "Dev Frontend",
    color: "#fbbf24",
    init: "NA",
    emoji: "🚀",
    tagline: "Entusiasta, dice sí a todo sin pensar",
    bio: "Entusiasta, rápido para aprender, acepta todo sin pensar. Propone acuerdos sin considerar consecuencias. Dice 'sí' a todo y se sobrecompromete. Termina entregando tarde sin avisar porque no quiere quedar mal.",
  },
]

export const MEMBER_MAP = Object.fromEntries(TEAM.map((t) => [t.id, t]))

// ─── FOUNDER / EM (stakeholders no-equipo) ───

export const SETLIST_FOUNDER = {
  id: "mateo",
  name: "Mateo",
  role: "Founder & CEO · Setlist",
  color: "#a855f7",
  init: "MA",
  emoji: "🚀",
  tagline: "Founder + CEO. Cerró el show piloto con la banda.",
  bio: "Fundador y CEO de Setlist. Cerró con la banda piloto un show público real en 4 semanas — Setlist va a estar en escena frente a una audience real. Está obsesionado con la experiencia del fan. Define la dirección estratégica pero deja la ejecución al equipo. Paula (EM) reporta a él.",
}

export const SETLIST_EM = {
  id: "paula",
  name: "Paula",
  role: "Engineering Manager",
  color: "#dc2626",
  init: "PA",
  emoji: "👔",
  tagline: "Jefa directa del SM, presiona por velocity",
  bio: "Engineering Manager. Es la jefa directa del Scrum Master y reporta a Mateo (CEO). Le prometió a Mateo llegar al show piloto sin sorpresas. Pragmática, data-driven, puede ser dura cuando los números no cierran. Aparece en el assessment cuando el equipo va lento.",
}

// Lista para TeamPanel (paginate / mostrar todos los stakeholders externos)
export const STAKEHOLDERS = [SETLIST_FOUNDER, SETLIST_EM]
export const STAKEHOLDER_MAP = Object.fromEntries(
  STAKEHOLDERS.map((s) => [s.id, s])
)

// ─── BACKLOG CANÓNICO DEL SPRINT 1 ───
// 12 PBIs. Sprint commit = 30 pts (las "must" de C04 Planning).
// SL-105 (Buscar canción / Spotify) es el "hilo rojo" del sprint:
// estimada en C04, bloqueada en C02, causa de presión en C05, mencionada en C01.
export const PBIS = [
  { id: "SL-101", title: "Crear show", desc: "Banda crea show: fecha, lugar, repertorio inicial.", pts: 5, category: "must", owner: "eric" },
  { id: "SL-102", title: "Login y registro", desc: "Login y registro de bandas y fans con email + password.", pts: 5, category: "must", owner: "david" },
  { id: "SL-103", title: "Compartir link de show", desc: "Link único compartible que los fans abren para sumarse.", pts: 3, category: "must", owner: "nacho" },
  { id: "SL-104", title: "RSVP del fan", desc: "El fan confirma asistencia al show con 1 tap.", pts: 3, category: "must", owner: "alan" },
  { id: "SL-105", title: "Buscar canción", desc: "Buscador integrando Spotify Search API (autocompletado, álbum, artista).", pts: 8, category: "must", owner: "alan" },
  { id: "SL-106", title: "Sugerir canción al show", desc: "Fan agrega una canción al pool de sugerencias.", pts: 5, category: "must", owner: "nacho" },
  { id: "SL-107", title: "Votar canciones", desc: "Los fans votan las canciones del pool. Las más votadas entran al setlist.", pts: 5, category: "should", owner: "david" },
  { id: "SL-108", title: "Ver setlist final público", desc: "Vista pública del setlist más votado, accesible vía link.", pts: 3, category: "should", owner: "nacho" },
  { id: "SL-109", title: "Notificación push 'Setlist listo'", desc: "Push a los fans cuando se cierra la votación y se publica el setlist.", pts: 5, category: "should", owner: "alan" },
  { id: "SL-110", title: "Galería de fotos post-show", desc: "Fans suben fotos del show, se muestran en grilla.", pts: 8, category: "could", owner: "alan" },
  { id: "SL-111", title: "Perfil de banda", desc: "Bio, foto, links a redes y plataformas de música.", pts: 3, category: "could", owner: "nacho" },
  { id: "SL-112", title: "Dark mode", desc: "Tema oscuro toggle con persistencia.", pts: 3, category: "could", owner: "eric" },
]

export const PBI_MAP = Object.fromEntries(PBIS.map((p) => [p.id, p]))

export function getPBI(id) {
  return PBI_MAP[id] || null
}

// Sprint goal y compromiso
export const SPRINT_COMMIT = {
  totalPoints: 30, // suma de los "must"
  goal: "Flujo core funcionando para el show piloto: banda crea show, fans se suman, sugieren canciones y las votan. El setlist más votado se toca en escena.",
}

// ─── TIMELINE DEL SPRINT ───
export const SPRINT_DAYS = {
  D1: { label: "Día 1 · Kickoff & Planning", challenge: 4 },
  D3: { label: "Día 3 · 1-1 con Alan", challenge: 3 },
  D5: { label: "Día 5 · Daily con bloqueo", challenge: 2 },
  D7: { label: "Día 7 · Reunión con Paula (EM)", challenge: 5 },
  D10: { label: "Día 10 · Retro del Sprint 1", challenge: 1 },
}

// ─── TENSIONES CANÓNICAS DEL SPRINT ───
// Estos son los conflictos/dinámicas que viven cross-challenge. Los prompts
// y data files pueden referenciarlos como hechos compartidos.
export const SPRINT_TENSIONS = {
  teamGelZero: {
    summary:
      "Es el PRIMER sprint del equipo trabajando juntos. Mateo armó el equipo en las últimas 2-3 semanas. Casi no se conocen entre sí — Day 1 es literalmente primera reunión grupal.",
    challenges: ["C04", "C03", "C02", "C05", "C01"],
  },
  alanBurnoutPrevio: {
    summary:
      "Alan vino a Setlist arrastrando burnout de su empresa anterior (1+ año trabajando 14h/día). Nadie del equipo sabe esto. En Day 3 muestra señales (commits a la madrugada, PRs rebotados, irritable) pero el equipo no tiene contexto histórico — el SM debe leer las señales sin pista obvia.",
    challenges: ["C03"],
  },
  spotifyBlocker: {
    summary:
      "SL-105 (Buscar canción) está bloqueada esperando aprobación del Spotify Developer API. Lleva 2-3 días sin avanzar. Es el ticket más crítico del sprint y el de mayor riesgo para el show piloto.",
    challenges: ["C04", "C02", "C05", "C01"],
    affectedPBI: "SL-105",
  },
  scopeCreepGabriela: {
    summary:
      "Gabriela (PO) introduce cambios de alcance en SL-104 (RSVP) y SL-106 vía comentarios sin actualizar los criterios de aceptación. Generó retrabajo.",
    challenges: ["C04", "C02", "C01"],
    affectedPBIs: ["SL-104", "SL-106"],
  },
  ericSilent: {
    summary:
      "Eric es el TL pero se calla en momentos críticos. Cuando algo técnico le preocupa lo dice; cuando algo humano le preocupa, no.",
    challenges: ["C04", "C02", "C01"],
  },
  gianFrustrated: {
    summary:
      "Gian (QA) tuvo que rebotar 2 PRs de Alan por bugs básicos en SL-104 y SL-105. Está perdiendo la paciencia.",
    challenges: ["C03", "C02", "C01"],
  },
  nachoOverpromise: {
    summary:
      "Nacho (Frontend) sobreestima su velocidad. Entregó SL-103 tarde sin avisar y Alan tuvo que cubrir en silencio.",
    challenges: ["C04", "C01"],
  },
  showPublicoStakes: {
    summary:
      "La banda piloto va a tocar un show público real en 4 semanas usando Setlist en escena frente a su audience. Si la app falla, falla en público. Mateo cerró el deal y Paula es responsable de delivery.",
    challenges: ["C04", "C02", "C05", "C01"],
  },
}

// ─── CONTEXTO COMPARTIDO ───
// Descripción breve del equipo, usable en cualquier prompt.
export const TEAM_DESC_SHORT = `Equipo Setlist — startup que construye una app colaborativa: las bandas crean shows y los fans votan qué canciones se tocan. La banda toca exactamente las más votadas, sin veto. Show piloto real en 4 semanas frente a audience pública.

Sprint 1 es el primer sprint del equipo trabajando juntos. Mateo (Founder/CEO) los contrató uno por uno en las últimas 2-3 semanas. Casi no se conocen.

Eric (Tech Lead): brillante y directo, a veces cortante. Construyó el backend casi solo. Desconfía del proceso ágil. Cuando algo técnico le preocupa lo dice; cuando algo humano le preocupa, se calla.

David (Dev Backend / APIs): sólido y callado. Siempre entrega, pero guarda información crítica en lugar de escalar. Tiene miedo de decepcionar al equipo.

Alan (Dev Mobile): creativo y preciso. Relativamente callado. Llegó a Setlist arrastrando burnout de su empresa anterior (1+ año a 14h/día) — el equipo no sabe esto. Sus estimaciones son las más exactas pero se autocensura.

Gian (QA): meticuloso y frustrado. Detecta problemas antes que nadie pero raramente le hacen caso hasta que algo falla en producción.

Gabriela (Product Owner): conecta bien con bandas y fans pero genera scope creep constantemente. Su intuición de producto es buena; su traducción a historias de usuario, no tanto.

Nacho (Dev Frontend): entusiasta y rápido para aprender, pero sobreestima su velocidad. Acepta compromisos que no puede cumplir y no avisa hasta el último momento.`

// Helper para obtener una versión textual del backlog (para inyectar en prompts)
export function getBacklogSummary() {
  return PBIS.map(
    (p) =>
      `${p.id} (${p.pts}pts, ${p.category}, ${MEMBER_MAP[p.owner]?.name || p.owner}): ${p.title}`
  ).join("\n")
}
