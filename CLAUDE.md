# CLAUDE.md — Smatch V2
> Contexto completo para Claude Code. Leer antes de tocar cualquier archivo.

---

## ¿Qué es Smatch?

Smatch es un **marketplace de talento ágil** donde candidatos a roles Scrum Master (SM) y Project Manager (PM) demuestran sus habilidades a través de **assessments gamificados**. Construido por Sebastián Spiguel.

- **Landing pública**: https://smatch-landing.vercel.app/
- **Assessment app**: https://smatch-assessment.vercel.app/
- **Demo**: Email `test@test.com` / Password `test`

### La hipótesis de negocio
La IA comprime equipos de ejecución (de 10 devs a 2 seniors) pero **aumenta la demanda de líderes, facilitadores y orquestadores** — SMs y PMs. Smatch evalúa exactamente eso, en escenarios reales.

**Diferenciador clave**: En vez de *prohibir* el uso de IA durante el assessment, Smatch lo **trackea y evalúa**. Hoy la IA es una herramienta esencial en el trabajo; saber usarla bien es una competencia en sí misma.

---

## Stack técnico

- **Framework**: React + Vite (tiene build step — NO es single-file)
- **Routing**: react-router-dom con BrowserRouter
- **DB / Auth**: Supabase (`/supabase` folder + `.env`)
- **Styling**: CSS por componente + `theme.js` como design system central
- **Deploy**: Vercel — dos apps separadas (landing y assessment)
- **AI**: Anthropic API (`claude-sonnet-4-20250514`) llamada desde el cliente
- **Fonts**: Plus Jakarta Sans

---

## Estructura del proyecto

```
SMATCH-V2/
├── api/                          # Funciones serverless Vercel
├── src/
│   ├── challenges/
│   │   ├── Challenge01.jsx + .css   # Retro Facilitation (Equipo Fenix)
│   │   ├── Challenge02.jsx + .css   # Daily / Bloqueos (Equipo Fenix)
│   │   ├── Challenge03.jsx          # Team Agreements Workshop (Equipo Valkyrie)
│   │   └── Challenge04.jsx          # Estimation & Prioritization (Equipo Valkyrie)
│   ├── components/
│   │   └── index.jsx                # Avatar, StickyCard, ChatBubble, MiniBoard, ScoreBadges
│   ├── data/
│   │   ├── challenge01.js
│   │   ├── challenge02.js
│   │   ├── challenge03.js
│   │   └── challenge04.js
│   ├── engine/                      # Lógica de scoring
│   ├── pages/
│   │   ├── ChallengeMenu.jsx + .css
│   │   └── Landing.jsx + .css
│   ├── App.jsx                      # Root + routing
│   ├── theme.js                     # Design system — SIEMPRE importar de acá
│   ├── index.css                    # Global resets + animaciones
│   └── main.jsx
├── supabase/
├── .env / .env.example
└── vercel.json
```

---

## Routing

```
/             → Landing
/challenges   → ChallengeMenu
/challenge/1  → Challenge01
/challenge/2  → Challenge02
/challenge/3  → Challenge03
/challenge/4  → Challenge04
/report/:id   → CandidateReport (PENDIENTE — crear)
/recruiter    → RecruiterDashboard (PENDIENTE — crear)
```

---

## Design System — theme.js (tokens completos)

```javascript
export const T = {
  bg: "#0a0e1a", panel: "#111827", card: "#1a2235", cardHi: "#243049",
  border: "#1e2d44", borderHi: "#2d4a6f",
  teal: "#00d4aa", tealDim: "rgba(0,212,170,0.12)", tealGlow: "rgba(0,212,170,0.3)",
  text: "#e2e8f0", sub: "#94a3b8", dim: "#64748b",
  red: "#f87171", orange: "#fbbf24", green: "#34d399", blue: "#60a5fa",
  sY: "#fef9c3", sG: "#dcfce7", sP: "#fce7f3",
  sB: "#dbeafe", sO: "#ffedd5", sV: "#ede9fe",
}
export const QUALITY = {
  expert:     { label: "Experto",       color: T.green,  emoji: "🎯" },
  competent:  { label: "Competente",    color: T.blue,   emoji: "👍" },
  developing: { label: "En Desarrollo", color: T.orange, emoji: "📝" },
  red_flag:   { label: "Red Flag",      color: T.red,    emoji: "⚠️" },
}
export const DIM_LABELS = {
  facilitation: "Facilitación",
  systems:      "Pensamiento Sistémico",
  safety:       "Seguridad Psicológica",
  coaching:     "Coaching",
  process:      "Diseño de Procesos",
  conflict:     "Navegación de Conflictos",
  stakeholder:  "Gestión de Stakeholders",
  decision:     "Decisión Bajo Presión",
  ai_fluency:   "Uso de IA",  // ← NUEVA dimensión a integrar
}
```

**Reglas de styling:**
- Colores → SIEMPRE desde `theme.js` (`import { T } from "../theme"`)
- NO usar variables CSS custom (`--var`), usar tokens de `T` directamente
- C01 y C02 tienen CSS files; C03 y C04 usan inline styles → **unificar todo a CSS files**
- Gradiente principal: `linear-gradient(135deg, #ffffff 0%, #00d4aa 50%, #60a5fa 100%)`
- Animaciones globales: `pulse` (opacity 0.4→1), `fadeSlide` (translateY 6px→0)

---

## Los 4 Challenges existentes

### Challenge 01 — Retro Facilitation (~12 min)
- **Equipo Fenix**: Marcus Chen/TL, Diego Herrera/Dev, Valentina Torres/QA, Lucas Vargas/Dev, Mateo Silva/Dev Jr, Sofía Park/QA Lead, Ryan Davies/DevOps
- **Escenario**: Sprint 17, 31/37 pts, 3 carry-overs. Scope creep del PO. Deuda de documentación.
- **Flujo**: Context → elegir formato (Sailboat/Glad Sad Mad/Start Stop Continue) → tablero stickies → 4 MOMENTS → chat AI → score
- **Dimensiones**: facilitation, systems, safety, coaching, process

### Challenge 02 — Daily / Bloqueos (~10 min)
- **Equipo Fenix** (mismo)
- **Escenario**: Sprint 18, día 5/10. FEN-403 bloqueado 2 días. 38% en riesgo.
- **Flujo**: Sprint board visual → DAILY_SEQUENCE animado → 4 MOMENTS → chat AI
- **Dimensiones**: stakeholder, conflict, decision, systems, facilitation

### Challenge 03 — Team Agreements Workshop (~15 min)
- **Equipo Valkyrie**: Gaby Mechiar/TL escéptica, Tomás Dubno/Sr Dev remoto, Camila Ortega/QA, Gian Franco/Dev Jr, Marcos Avelo/Backend pasivo, Lucia Chen/PO
- **Escenario**: Día 1, equipo nuevo. Workshop 45 min.
- **Flujo**: SM propone temas → TOPIC_TRIGGERS → AI evalúa contra QUALITY_CHECKLIST
- **Dimensiones**: facilitation, process, coaching, safety, scrum_maturity

### Challenge 04 — Estimation & Prioritization (~15 min)
- **Equipo Valkyrie** (mismo)
- **Escenario**: Sprint 1. 12 PBIs, velocity ~30 pts.
- **Flujo**: Dock herramientas → Planning Poker → EVENTS con bad behaviors → SM detecta → achievements
- **Bad behaviors**: anclaje (Marcos copia a Gaby), pts vs días (Gianfranco), contexto personal (Tomás), estimación ≠ compromiso (Lucia)
- **Dimensiones**: coaching, scrum_maturity, facilitation, systems, safety

---

## Componentes compartidos

```javascript
Avatar({member, size})           // círculo iniciales + color
StickyCard({sticky, memberMap, delay})  // post-it con rotación, votos
ChatBubble({msg, memberMap})     // narration (italic teal) | isYou | miembro
MiniBoard({cols, active})        // preview tablero C01
ScoreBadges({scores})            // badges dimensiones con semáforo
```

---

## Patrón Anthropic API

```javascript
const res = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    system: "...",
    messages: [{ role: "user", content: userMessage }]
  })
})
const d = await res.json()
const text = d.content?.[0]?.text || ""
```

---

## Estructura MOMENT

```javascript
{
  id: "string",
  narration: "texto narrativo visible al candidato",
  chat: [{ from: "memberId", text: "..." }],
  prompt: "pregunta/situación para el SM",
  newStickies: [...],   // opcional
  phase: "daily|action|retro"  // solo C02
}
```

---

## Roadmap — prioridades activas

### FASE 1 — Cerrar el loop (PRIORIDAD MÁXIMA)
Hoy el candidato termina un challenge y no pasa nada. Hay que cerrar eso.

- [ ] **Score consolidado persistente en Supabase** — guardar resultados de cada challenge por usuario
- [ ] **CandidateReport page** (`/report/:id`) — reporte rico post-assessment con:
  - Score global + por dimensión (radar chart)
  - Evidencia de cada respuesta (qué dijo, cómo fue evaluado)
  - Score de uso de IA (`ai_fluency`)
  - Red flags destacados
  - Nivel general: Experto / Competente / En Desarrollo / Red Flag
- [ ] **Progress bar + timer visible** dentro de cada challenge
- [ ] **Feedback inmediato** después de cada respuesta del SM (antes de pasar al siguiente MOMENT)

### FASE 2 — Evaluación del uso de IA (DIFERENCIADOR ESTRELLA)
- [ ] **AI Usage Tracker**: loguear cuándo el candidato abre el chat AI, qué pregunta, qué hace con la respuesta
- [ ] **Nueva dimensión `ai_fluency`** en el scoring engine:
  - ¿Usó la IA? ¿Con qué intención?
  - ¿La respuesta final mejoró respecto al primer instinto?
  - ¿Copió y pegó sin procesar, o sintetizó?
- [ ] **Mostrar en el reporte**: "Este candidato usó IA en 3 de 4 momentos, principalmente para estructurar sus respuestas" — eso es data valiosa para el recruiter

### FASE 3 — Dashboard del recruiter
- [ ] **RecruiterDashboard** (`/recruiter`) — vista comparativa de candidatos
  - Tabla con scores por dimensión
  - Filtros: por dimensión, nivel, rol aplicado
  - Click en candidato → CandidateReport
- [ ] **Export a PDF** del reporte individual
- [ ] **Comparar 2-3 candidatos** side by side

### FASE 4 — UX/UI refurbish
- [ ] **Unificar styling**: todos los challenges a CSS files (eliminar inline styles de C03/C04)
- [ ] **Transiciones entre pantallas** dentro de cada challenge (fade/slide)
- [ ] **Mobile** — especialmente C02 con el sprint board
- [ ] **Onboarding** para candidatos nuevos (primera vez en la app)
- [ ] **ChallengeMenu stats** conectadas a Supabase (reemplazar hardcoded)

### FASE 5 — Challenges 5 y 6
- [ ] Challenge 05: "La presión de velocidad" (Experto) — crear data + componente
- [ ] Challenge 06: "Acuerdos que no se cumplen" (Intermedio) — crear data + componente

---

## Pain points conocidos — NO romper

- C01 y C02 tienen CSS files propios — no mover estilos a inline
- La API key de Anthropic viene del entorno Vercel — no hardcodear
- El routing usa BrowserRouter — cualquier página nueva necesita su `<Route>` en App.jsx
- Supabase client está inicializado en un archivo central — no crear nuevas instancias

---

## Visión del output final para recruiters

El reporte de un candidato tiene que ser tan bueno que alguien lo imprima o lo comparta en Slack. Debe incluir:

```
┌─────────────────────────────────────────────┐
│  Juan Pérez — Scrum Master Assessment       │
│  Fecha: 25/03/2026  |  Duración: 47 min     │
├─────────────────────────────────────────────┤
│  SCORE GLOBAL: 84/100 — COMPETENTE 👍       │
├─────────────────────────────────────────────┤
│  Por dimensión:                             │
│  Facilitación          ████████░░  82%      │
│  Pensamiento Sistémico █████████░  91%      │
│  Seguridad Psicológica ███████░░░  74%      │
│  Coaching              ████████░░  80%      │
│  Uso de IA             █████████░  88% ✨   │
├─────────────────────────────────────────────┤
│  RED FLAGS: ninguno                         │
│  HIGHLIGHTS: Detectó el bloqueo oculto en  │
│  C02, propuso solución sistémica en C03.   │
├─────────────────────────────────────────────┤
│  Uso de IA: Usó el asistente en 3/4        │
│  momentos. Sintetizó respuestas, no copió. │
└─────────────────────────────────────────────┘
```

---

## Comandos útiles

```bash
npm run dev       # desarrollo local
npm run build     # build producción
npm run preview   # preview del build
```

Deploy automático en Vercel al pushear a main.
