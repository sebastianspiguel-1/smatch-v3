// ─── SMatch Design Tokens ───
// Todos los colores y constantes visuales en un solo lugar.
// Cambiás acá → cambia en toda la app.
//
// ✨ LIGHT THEME - Inspirado en RetroForge
// Paleta clara, profesional, con teal como color principal

export const T = {
  // Backgrounds (claro a más claro)
  bg: "#f0f4f8",          // Fondo principal (RetroForge foundation)
  panel: "#ffffff",        // Superficies elevadas (cards, panels)
  card: "#f9fafb",         // Cards anidados/secciones
  cardHi: "#ffffff",       // Hover/active state

  // Bordes (grises sutiles)
  border: "rgba(30, 41, 59, 0.12)",      // Bordes suaves
  borderHi: "rgba(30, 41, 59, 0.20)",    // Bordes enfatizados

  // Brand Colors
  teal: "#00d4aa",                        // PRIMARY brand color (sin cambio)
  tealDim: "rgba(0, 212, 170, 0.08)",    // Tinte de fondo
  tealGlow: "rgba(0, 212, 170, 0.20)",   // Highlight
  tealText: "#009b7d",                    // Teal oscuro para texto pequeño (WCAG compliant)
  navy: "#0a1f44",                        // Headers fuertes (RetroForge)
  navyLight: "#1e3a5f",                   // Headers secundarios

  // Tipografía (oscuro sobre claro)
  text: "#0f172a",         // Texto primario (slate-900)
  sub: "#475569",          // Texto secundario (slate-600)
  dim: "#64748b",          // Texto terciario/muted (slate-500)

  // Status colors (ajustados para fondo claro, WCAG compliant)
  red: "#dc2626",          // Red-600
  orange: "#ea580c",       // Orange-600
  green: "#059669",        // Emerald-600
  blue: "#2563eb",         // Blue-600
  gold: "#d97706",         // Amber-600 (acento RetroForge)

  // Sticky notes (versiones claras - pasteles desaturados para fondo light)
  sY: "#fef3c7",          // Yellow-100
  sG: "#d1fae5",          // Green-100
  sP: "#fce7f3",          // Pink-100
  sB: "#dbeafe",          // Blue-100
  sO: "#ffedd5",          // Orange-100
  sV: "#ede9fe",          // Violet-100

  // Shadows (sutiles estilo RetroForge)
  shadowCard: "0 1px 3px rgba(15, 23, 42, 0.08), 0 1px 2px rgba(15, 23, 42, 0.06)",
  shadowCardHover: "0 4px 12px rgba(15, 23, 42, 0.10), 0 2px 4px rgba(15, 23, 42, 0.08)",
  shadowModal: "0 20px 60px rgba(15, 23, 42, 0.14), 0 8px 20px rgba(15, 23, 42, 0.10)",

  // Spacing (ritmo 8px como RetroForge)
  space1: "4px",
  space2: "8px",     // Base unit
  space3: "12px",
  space4: "16px",
  space5: "20px",
  space6: "24px",
  space8: "32px",
  space10: "40px",
  space12: "48px",
  space16: "64px",

  // Border radius (suaves)
  radiusBase: "8px",      // Botones, inputs
  radiusMd: "12px",       // Cards, panels
  radiusLg: "16px",       // Secciones grandes
  radiusXl: "20px",       // Hero cards, modals

  // Typography sizes (aumentadas para legibilidad)
  textXs: "11px",         // Meta info, badges
  textSm: "13px",         // Texto secundario
  textBase: "15px",       // Body text (aumentado de 14px)
  textLg: "17px",         // Párrafos enfatizados
  textXl: "20px",         // Section headings
  text2xl: "24px",        // Card titles
  text3xl: "30px",        // Page titles
  text4xl: "48px",        // Hero text

  // Line height (mejorada legibilidad)
  leadingTight: 1.2,      // Headings
  leadingNormal: 1.5,     // Body text (aumentado de 1.4)
  leadingRelaxed: 1.7,    // Long-form content
}

// Quality levels para scoring (colores actualizados para light theme)
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
