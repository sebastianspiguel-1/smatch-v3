// ─── CHALLENGE METADATA ───
// Los 5 challenges del Sprint 1 (orden cronológico real).
// id = orden en el menú; fileId = qué archivo Challenge0X.jsx renderiza.

export const CHALLENGES_METADATA = {
  1: {
    id: 1,
    fileId: 4,
    title: "Día 1 · Kickoff & Planning",
    shortTitle: "Kickoff & Planning",
    sprint: "Sprint 1",
    context: "Día 1 — Team agreements + Estimación",
    icon: "■",
    color: "#0891b2",
    gradient: "linear-gradient(135deg, #0891b2, #06b6d4)",
  },
  2: {
    id: 2,
    fileId: 3,
    title: "Día 3 · 1-1 con Alan",
    shortTitle: "Coaching 1-1",
    sprint: "Sprint 1",
    context: "Día 3 — El dev que se está apagando",
    icon: "⬢",
    color: "#ff8a80",
    gradient: "linear-gradient(135deg, #ff8a80, #fa8072)",
  },
  3: {
    id: 3,
    fileId: 2,
    title: "Día 5 · Daily con bloqueo",
    shortTitle: "Kanban Bloqueado",
    sprint: "Sprint 1",
    context: "Día 5 — Bloqueo de Spotify API",
    icon: "◆",
    color: "#f59e0b",
    gradient: "linear-gradient(135deg, #f59e0b, #d97706)",
  },
  4: {
    id: 4,
    fileId: 5,
    title: "Día 7 · Reunión con Paula",
    shortTitle: "Velocity Pressure",
    sprint: "Sprint 1",
    context: "Día 7 — Stakeholder management",
    icon: "▲",
    color: "#dc2626",
    gradient: "linear-gradient(135deg, #dc2626, #b91c1c)",
  },
  5: {
    id: 5,
    fileId: 1,
    title: "Día 10 · Retro del Sprint 1",
    shortTitle: "Retro Oculta",
    sprint: "Sprint 1",
    context: "Día 10 — La retro que parece perfecta",
    icon: "◉",
    color: "#00d4aa",
    gradient: "linear-gradient(135deg, #00d4aa, #059669)",
  },
}

export function getChallengeById(id) {
  return CHALLENGES_METADATA[id] || null
}

export function getChallengeByFileId(fileId) {
  return Object.values(CHALLENGES_METADATA).find((c) => c.fileId === fileId) || null
}

export function getAllChallenges() {
  return Object.values(CHALLENGES_METADATA).sort((a, b) => a.id - b.id)
}
