// ═══════════════════════════════════════════════════
// EQUIPO SETLIST - Fuente de verdad para el componente TeamPanel
// ═══════════════════════════════════════════════════
//
// Cada miembro tiene:
//   - id: identificador único
//   - name: nombre visible
//   - role: rol en el equipo
//   - color: color del avatar
//   - init: iniciales (2 letras)
//   - tagline: 1 línea descriptiva visible (hover)
//   - bio: descripción extendida (modal)
//   - emoji: emoji que representa su personalidad
//
// ═══════════════════════════════════════════════════

export const SETLIST_TEAM = [
  {
    id: "eric",
    name: "Eric",
    role: "Tech Lead",
    color: "#60a5fa",
    init: "ER",
    emoji: "⚡",
    tagline: "Pragmático, prioriza velocidad sobre procesos",
    bio: "Brillante y directo, a veces cortante. Construyó el backend casi solo y viene de una startup donde 'velocidad > todo'. Desconfía de procesos que frenen el delivery. Cuando algo técnico le preocupa lo dice; cuando algo humano le preocupa, se calla."
  },
  {
    id: "david",
    name: "David",
    role: "Dev Backend / APIs",
    color: "#34d399",
    init: "DV",
    emoji: "🔇",
    tagline: "Callado y práctico, no escala bloqueos",
    bio: "Práctico, callado, no le gustan las discusiones filosóficas. Responsable de las APIs y las integraciones externas (Spotify search, auth, push). Tiende a no escalar bloqueos rápido y se traba solo en lugar de pedir ayuda. Buena ética de trabajo pero le cuesta comunicar."
  },
  {
    id: "alan",
    name: "Alan",
    role: "Dev Mobile",
    color: "#f472b6",
    init: "AL",
    emoji: "🤐",
    tagline: "Inseguro, escucha más de lo que habla",
    bio: "Callado, inseguro. Tiene background mobile pero no se anima a opinar mucho. Escucha pero no participa activamente a menos que la SM lo invite. Detecta problemas pero no los nombra. Necesita ser invitado a la conversación."
  },
  {
    id: "gian",
    name: "Gian",
    role: "QA",
    color: "#fb923c",
    init: "GI",
    emoji: "🔍",
    tagline: "Meticuloso, calidad sobre velocidad",
    bio: "Meticuloso, orientado a calidad. Viene de una fintech donde cualquier bug era crítico. Propone 'Calidad sobre velocidad' y tests obligatorios en DoD. Ya anticipa que el equipo va a ignorar sus warnings, pero los levanta igual."
  },
  {
    id: "gabriela",
    name: "Gabriela",
    role: "Product Owner",
    color: "#a78bfa",
    init: "GA",
    emoji: "🎯",
    tagline: "Conecta con stakeholders, mete scope creep",
    bio: "Conecta bien con artistas y venues, quiere iterar rápido. Apoya a Eric en velocidad. Tiende a meter scope creep en el sprint y cambiar requirements en comentarios sin avisar a todos. Foco fuerte en la entrega externa."
  },
  {
    id: "nacho",
    name: "Nacho",
    role: "Dev Frontend",
    color: "#fbbf24",
    init: "NA",
    emoji: "🚀",
    tagline: "Entusiasta, dice sí a todo sin pensar",
    bio: "Entusiasta, rápido para aprender, acepta todo sin pensar. Propone acuerdos sin considerar consecuencias. Dice 'sí' a todo y se sobrecompromete. Termina entregando tarde sin avisar porque no quiere quedar mal."
  },
]

// Map útil para lookups por id
export const SETLIST_TEAM_MAP = Object.fromEntries(
  SETLIST_TEAM.map(m => [m.id, m])
)

// Stakeholders externos del producto
export const SETLIST_STAKEHOLDER = {
  id: "simon",
  name: "Simon",
  role: "Productor · Lollapalooza",
  color: "#8b5cf6",
  init: "SI",
  emoji: "🎪",
  tagline: "Quiere usar Setlist como piloto del festival 2026",
  bio: "Productor del Lollapalooza 2026. Negoció con Mateo usar Setlist como piloto oficial del festival: 60 bandas indies van a estrenar la app en vivo. Pregunta por avances cada 2 días. Genera la presión externa más fuerte sobre el equipo."
}

// Founder/CEO de Setlist — voz del producto
export const SETLIST_FOUNDER = {
  id: "mateo",
  name: "Mateo",
  role: "Founder & CEO · Setlist",
  color: "#a855f7",
  init: "MA",
  emoji: "🚀",
  tagline: "Visión del producto, le prometió a Simon el piloto",
  bio: "Fundador de Setlist. Le prometió a Simon que el MVP estaría listo para Lollapalooza. Está obsesionado con la experiencia del fan. Voz del producto: define la dirección estratégica pero deja la ejecución al equipo."
}

// Engineering Manager — jefa directa del SM
export const SETLIST_EM = {
  id: "paula",
  name: "Paula",
  role: "Engineering Manager",
  color: "#dc2626",
  init: "PA",
  emoji: "👔",
  tagline: "Jefa del SM, presiona por velocity",
  bio: "Engineering Manager. Es la jefa directa del Scrum Master y reporta a Mateo. Le prometió a Mateo +30% de velocity para Sprint 2. Pragmática, data-driven, puede ser dura cuando los números no cierran. Aparece en el assessment cuando el equipo va lento."
}

// Todos los stakeholders en un solo array para iterar fácil
export const SETLIST_STAKEHOLDERS = [SETLIST_STAKEHOLDER, SETLIST_FOUNDER, SETLIST_EM]
