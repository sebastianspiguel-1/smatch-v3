// ─── SMatch Design Tokens ───
// Todos los colores y constantes visuales en un solo lugar.
// Cambiás acá → cambia en toda la app.

export const T = {
  // Backgrounds
  bg: "#0a0e1a",
  panel: "#111827",
  card: "#1a2235",
  cardHi: "#243049",

  // Borders
  border: "#1e2d44",
  borderHi: "#2d4a6f",

  // Brand
  teal: "#00d4aa",
  tealDim: "rgba(0,212,170,0.12)",
  tealGlow: "rgba(0,212,170,0.3)",

  // Text
  text: "#e2e8f0",
  sub: "#94a3b8",
  dim: "#64748b",

  // Status
  red: "#f87171",
  orange: "#fbbf24",
  green: "#34d399",
  blue: "#60a5fa",

  // Sticky note colors
  sY: "#fef9c3",
  sG: "#dcfce7",
  sP: "#fce7f3",
  sB: "#dbeafe",
  sO: "#ffedd5",
  sV: "#ede9fe",
}

// Quality levels para scoring
export const QUALITY = {
  expert:     { label: "Experto",      color: T.green,  emoji: "🎯" },
  competent:  { label: "Competente",   color: T.blue,   emoji: "👍" },
  developing: { label: "En Desarrollo", color: T.orange, emoji: "📝" },
  red_flag:   { label: "Red Flag",     color: T.red,    emoji: "⚠️" },
}

// Labels de dimensiones en español
export const DIM_LABELS = {
  facilitation: "Facilitación",
  systems:      "Pensamiento Sistémico",
  safety:       "Seguridad Psicológica",
  coaching:     "Coaching",
  process:      "Diseño de Procesos",
  conflict:     "Navegación de Conflictos",
  stakeholder:  "Gestión de Stakeholders",
  decision:     "Decisión Bajo Presión",
}
