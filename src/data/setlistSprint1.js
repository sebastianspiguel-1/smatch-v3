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
  tagline: "App donde bandas crean shows y los fans co-crean el setlist votando canciones.",
  pilotPartner: "una banda piloto",
  pilotInWeeks: 4,
}

// ─── EQUIPO ───
export const TEAM = [
  { id: "eric", name: "Eric", role: "Tech Lead", color: "#60a5fa", init: "ER" },
  { id: "david", name: "David", role: "Dev Backend / APIs", color: "#34d399", init: "DV" },
  { id: "alan", name: "Alan", role: "Dev Mobile", color: "#f472b6", init: "AL" },
  { id: "gian", name: "Gian", role: "QA", color: "#fb923c", init: "GI" },
  { id: "gabriela", name: "Gabriela", role: "Product Owner", color: "#a78bfa", init: "GA" },
  { id: "nacho", name: "Nacho", role: "Dev Frontend", color: "#fbbf24", init: "NA" },
]

export const MEMBER_MAP = Object.fromEntries(TEAM.map((t) => [t.id, t]))

// ─── STAKEHOLDERS ───
export const STAKEHOLDERS = [
  { id: "paula", name: "Paula Ríos", role: "Engineering Manager", color: "#dc2626", init: "PR" },
  { id: "mateo", name: "Mateo", role: "Founder · Setlist", color: "#8b5cf6", init: "MA" },
]

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
  { id: "SL-107", title: "Votar canciones", desc: "La banda revisa el pool y vota qué entra en el setlist final.", pts: 5, category: "should", owner: "david" },
  { id: "SL-108", title: "Ver setlist final público", desc: "Vista pública del setlist confirmado, accesible vía link.", pts: 3, category: "should", owner: "nacho" },
  { id: "SL-109", title: "Notificación push 'Setlist listo'", desc: "Push a los fans cuando la banda confirma el setlist final.", pts: 5, category: "should", owner: "alan" },
  { id: "SL-110", title: "Galería de fotos post-show", desc: "Fans suben fotos del show, se muestran en grilla.", pts: 8, category: "could", owner: "alan" },
  { id: "SL-111", title: "Perfil de banda", desc: "Bio, foto, links a redes y plataformas de música.", pts: 3, category: "could", owner: "nacho" },
  { id: "SL-112", title: "Dark mode", desc: "Tema oscuro toggle con persistencia.", pts: 3, category: "could", owner: "eric" },
]

export const PBI_MAP = Object.fromEntries(PBIS.map((p) => [p.id, p]))

// Helpers
export function getPBI(id) {
  return PBI_MAP[id] || null
}

// Sprint goal y compromiso
export const SPRINT_COMMIT = {
  totalPoints: 30, // suma de los "must"
  goal: "Tener el flujo core funcionando: banda crea show, fans se suman, sugieren canciones y la banda vota el setlist final.",
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
  alanBurnout: {
    summary:
      "Alan trabajó solo 2 meses construyendo la base mobile antes del Sprint 1. Arrastra cansancio acumulado: commits a la madrugada, PRs rebotados.",
    challenges: ["C03", "C05", "C01"],
  },
  spotifyBlocker: {
    summary:
      "SL-105 (Buscar canción) está bloqueada esperando aprobación del Spotify Developer API. Lleva 2-3 días sin avanzar.",
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
}

// ─── CONTEXTO COMPARTIDO ───
// Descripción breve del equipo, usable en cualquier prompt.
export const TEAM_DESC_SHORT = `Equipo Setlist — startup que construye una app donde bandas crean shows y los fans co-crean el setlist votando canciones.

Eric (Tech Lead): brillante y directo, a veces cortante. Construyó el backend casi solo. Desconfía del proceso ágil. Cuando algo técnico le preocupa lo dice; cuando algo humano le preocupa, se calla.

David (Dev Backend / APIs): sólido y callado. Siempre entrega, pero guarda información crítica en lugar de escalar. Tiene miedo de decepcionar al equipo.

Alan (Dev Mobile): creativo y preciso. Relativamente callado. Trabajó 2 meses solo construyendo la base mobile antes del Sprint 1 — arrastra cansancio acumulado. Sus estimaciones son las más exactas pero se autocensura.

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
