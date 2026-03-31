// ─── CHALLENGE METADATA ───
// Maps challenge IDs to their names, colors, and context
// Used for reports, navigation, and display

export const CHALLENGES_METADATA = {
  1: {
    id: 1,
    fileId: 6,
    title: "Team Agreements Workshop",
    shortTitle: "Team Agreements",
    sprint: "Sprint 0",
    context: "Primer día del equipo",
    icon: "□",
    color: "#7c3aed",
    gradient: "linear-gradient(135deg, #7c3aed, #6d28d9)"
  },
  2: {
    id: 2,
    fileId: 4,
    title: "Estimación & Priorización",
    shortTitle: "Planning Poker",
    sprint: "Sprint 1",
    context: "Sprint Planning",
    icon: "■",
    color: "#0891b2",
    gradient: "linear-gradient(135deg, #0891b2, #06b6d4)"
  },
  3: {
    id: 3,
    fileId: 1,
    title: "La retro que parece perfecta",
    shortTitle: "Retro Oculta",
    sprint: "Sprint 2",
    context: "Sprint retrospective",
    icon: "◉",
    color: "#00d4aa",
    gradient: "linear-gradient(135deg, #00d4aa, #059669)"
  },
  4: {
    id: 4,
    fileId: 2,
    title: "El bloqueo que nadie escala",
    shortTitle: "Kanban Bloqueado",
    sprint: "Sprint 3",
    context: "Día 7 - Bloqueos críticos",
    icon: "◆",
    color: "#f59e0b",
    gradient: "linear-gradient(135deg, #f59e0b, #d97706)"
  },
  5: {
    id: 5,
    fileId: 3,
    title: "El dev que se está apagando",
    shortTitle: "Burnout",
    sprint: "Sprint 5",
    context: "Día 6 - Coaching 1-1",
    icon: "⬢",
    color: "#ff8a80",
    gradient: "linear-gradient(135deg, #ff8a80, #fa8072)"
  },
  6: {
    id: 6,
    fileId: 5,
    title: "La presión de velocidad",
    shortTitle: "Velocity Pressure",
    sprint: "Sprint 6",
    context: "Día 3 - Management",
    icon: "▲",
    color: "#dc2626",
    gradient: "linear-gradient(135deg, #dc2626, #b91c1c)"
  }
}

// Helper function to get challenge by ID
export function getChallengeById(id) {
  return CHALLENGES_METADATA[id] || null
}

// Helper function to get challenge by file ID
export function getChallengeByFileId(fileId) {
  return Object.values(CHALLENGES_METADATA).find(c => c.fileId === fileId) || null
}

// Get all challenges in order
export function getAllChallenges() {
  return Object.values(CHALLENGES_METADATA).sort((a, b) => a.id - b.id)
}
