# 📊 SMatch v2 - Comprehensive Platform Overview

**Version:** 2.0
**Tech Stack:** React + Vite + Supabase + Anthropic Claude API
**Purpose:** Evaluación interactiva de Scrum Masters mediante simulaciones realistas con AI

---

## 🎯 Concepto General

**SMatch** es una plataforma de evaluación de competencias para Scrum Masters que simula situaciones reales del día a día mediante **challenges interactivos gamificados**. Cada challenge evalúa diferentes dimensiones (skills) del rol y usa **AI (Claude) para simular equipos**, generar reacciones realistas y evaluar las decisiones del candidato.

### Key Features
- ✅ **6 Challenges diferentes** (cada uno evalúa 5-7 dimensiones específicas)
- ✅ **AI-powered team simulation** (Claude genera respuestas del equipo en tiempo real)
- ✅ **Evaluación multidimensional** (facilitation, empathy, systems thinking, coaching, etc.)
- ✅ **UI gamificada** (cards, progress bars, visual feedback, animations)
- ✅ **Grading system** (A/B/C/D basado en performance)
- ✅ **Results dashboard** con radar charts y feedback detallado
- ✅ **AI Coach opcional** en algunos challenges (hints/sugerencias)

---

## 📚 Challenges Overview

### **Challenge 1: La retro que parece perfecta** 🟢
**Tipo:** Chat-based retrospective simulation
**Escenario:** Retrospectiva aparentemente positiva pero con tensión oculta bajo la superficie
**UI:** Chat lateral con 4 opciones de retro (Sailboat, Start-Stop-Continue, 4Ls, Mad-Sad-Glad)

**Dimensiones Evaluadas:**
1. **Facilitation** - Cómo facilita la retrospectiva sin imponer
2. **Systems Thinking** - Identifica patrones sistémicos (no solo síntomas)
3. **Psychological Safety** - Crea espacio seguro para conflictos ocultos
4. **Coaching** - Hace preguntas poderosas vs dar soluciones
5. **Process Design** - Diseña ceremonias efectivas

**Key Mechanics:**
- Selector de formato de retro (4 opciones visuales)
- Chat de equipo con reacciones dinámicas generadas por AI
- AI evalúa cada mensaje del SM en tiempo real
- 3 etapas: setup → facilitación → cierre

**Data Structure:**
```javascript
RETRO_FORMATS = [
  { id: "sailboat", name: "Sailboat", emoji: "⛵" },
  { id: "start-stop-continue", name: "Start-Stop-Continue", emoji: "🔄" },
  { id: "4ls", name: "4Ls", emoji: "📋" },
  { id: "mad-sad-glad", name: "Mad-Sad-Glad", emoji: "😊" }
]

TEAM = [
  { id: "joaquin", name: "Joaquín Ruiz", role: "Tech Lead", color: "#60a5fa" },
  { id: "clara", name: "Clara Mendoza", role: "Senior Dev", color: "#34d399" },
  // ... 5 more members
]
```

**AI Evaluation:**
- Input: retro format, SM message, conversation context
- Output: scores (1-4 per dimension), team reactions, feedback

---

### **Challenge 2: El bloqueo que nadie escala** 🟡
**Tipo:** **Visual Kanban board + Chat**
**Escenario:** Sprint día 7/10, un dev bloqueado hace 3 días, WIP limit excedido, QA esperando
**UI:** Kanban board interactivo (5 columnas) + Chat lateral + Action buttons

**Dimensiones Evaluadas:**
1. **Detection** - Detección temprana de bloqueos y problemas
2. **Facilitation** - Facilita sin ser project manager
3. **Empathy** - Muestra empatía con Mateo (bloqueado) y QA frustrado
4. **Coordination** - Coordina recursos (pair programming, escalación)
5. **AI Judgment** - Uso crítico de AI coach (si lo usa)
6. **WIP Limits Awareness** ⭐ - Identifica que 5/3 excede límite
7. **Flow Optimization** ⭐ - Identifica bottlenecks y propone soluciones

**Key Mechanics:**
- **Visual Kanban board**: 5 columnas (TODO, DOING, IN REVIEW, BLOCKED, DONE)
- **Interactive cards**: Click para ver detalles (blocker reason, history, impact)
- **Story points visible** en cada card (badge destacado)
- **WIP limit warning**: Visual indicator cuando se excede (5/3 ⚠️)
- **Action buttons**: Identify Blocker, Flag WIP, Suggest Pair Programming, Escalate
- **Metrics bar**: WIP, Blocked pts, Velocity, En Riesgo
- **AI evaluation per action** (no por momento/fase)

**Data Structure:**
```javascript
KANBAN_COLUMNS = [
  { id: "TODO", label: "To Do", wipLimit: null },
  { id: "DOING", label: "In Progress", wipLimit: 3 }, // ⚠️ LIMIT!
  { id: "IN_REVIEW", label: "In Review", wipLimit: null },
  { id: "BLOCKED", label: "Blocked", wipLimit: null },
  { id: "DONE", label: "Done", wipLimit: null }
]

INITIAL_KANBAN_STATE = {
  "DOING": [
    { id: "FEN-401", title: "Auth endpoint refactor", assignee: "marcus",
      priority: "high", status: "ok", days: 2, points: 5 },
    { id: "FEN-403", title: "Data propagation v2", assignee: "mateo",
      priority: "high", status: "blocked", blockedDays: 3, points: 8,
      dependencies: ["Platform team endpoint"] },
    // ... 3 more (total 5, WIP exceeded!)
  ]
}

CARD_DETAILS = {
  "FEN-403": {
    description: "Implementar sincronización de datos...",
    blockerReason: "Esperando endpoint de Platform. Escribí por Slack día 4 y 6, sin respuesta.",
    history: ["Día 4: Mateo escribió...", "Día 5: Sin respuesta...", ...],
    impact: "8 puntos bloqueados + 8 puntos QA = 16 pts en riesgo (38% sprint)"
  }
}
```

**Visual Design:**
- **Compact cards** (10px padding, 13px title font)
- **Story points badge** (top-right, gradient background, border)
- **Priority icons**: 🔴 High, 🟡 Medium, 🔵 Low
- **Status badges**: `🔴 3d` (blocked), `💤 IDLE`, `⏳ WAIT`
- **Assignee**: Avatar (20px) + first name only
- **Border-left color-coded** by status (green/yellow/red/gray)

**AI Evaluation:**
```javascript
// Input to AI
{
  teamDesc: "...",
  kanbanState: { TODO: [...], DOING: [...], ... },
  smAction: { type: "card_click", target: "FEN-403", message: null },
  chatContext: [last 10 messages]
}

// Output from AI
{
  quality: "expert|competent|developing|red_flag",
  scores: {
    detection: 3,
    facilitation: 4,
    empathy: 4,
    coordination: 3,
    ai_judgment: 3,
    wip_limits_awareness: 4, // ⭐ Did SM identify 5/3 exceeded?
    flow_optimization: 4      // ⭐ Did SM propose solutions?
  },
  reactions: [{ from: "mateo", text: "Sí, ese ticket..." }],
  feedback: "El SM identificó el blocker...",
  boardUpdates: { "FEN-403": { status: "escalated" } } // optional
}
```

---

### **Challenge 3: El dev que se está apagando** 🔴
**Tipo:** Chat-based 1-1 coaching simulation
**Escenario:** Sprint 12, día 5. Dev senior (Javier) con bajo performance. ¿Burnout o falta de compromiso?
**UI:** Chat 1-1 con Javier + AI Coach para sugerencias de preguntas empáticas

**Dimensiones Evaluadas:**
1. **Detection** - Detecta señales de burnout vs. falta de compromiso
2. **Coaching** - Hace preguntas poderosas, crea espacio seguro
3. **Empathy** - Muestra empatía genuina, no juzga
4. **Team Leadership** - Balancea necesidades individuales con equipo
5. **Systemic Thinking** - Identifica causas sistémicas (no culpa al individuo)

**Key Mechanics:**
- **1-1 conversation** con Javier (AI simula las respuestas)
- **AI Coach optional**: Sugerencias de preguntas empáticas
- **Critical decision moment**: ¿Cómo respondes cuando Javier revela problema personal?
- **AI evalúa**: calidad de preguntas, empatía, timing de intervenciones

**Data Structure:**
```javascript
TEAM_MEMBER = {
  id: "javier",
  name: "Javier Sosa",
  role: "Senior Developer",
  situation: "burnout_personal_issues",
  signals: ["Late to dailies", "PRs slow", "Withdrawn in retro"]
}

AI_COACH_MOMENTS = {
  one_on_one: {
    type: "coaching",
    title: "🤖 AI Coaching Assistant",
    description: "Pedí sugerencias de preguntas empáticas..."
  }
}
```

---

### **Challenge 4: Estimación & Priorización** 🔵
**Tipo:** Interactive Planning Poker + Backlog prioritization
**Escenario:** Equipo nuevo, primer sprint. Enseñar Planning Poker y facilitar priorización
**UI:** Cards de user stories + Planning Poker visual + Priorización drag-and-drop (o selector)

**Dimensiones Evaluadas:**
1. **Coaching** - Enseña story points sin imponer
2. **Scrum Maturity** - Facilita Planning Poker correctamente
3. **Facilitation** - Maneja desacuerdos en estimación
4. **Systems Thinking** - Conecta estimación con capacidad del sprint
5. **Psychological Safety** - Permite discusiones abiertas sobre estimaciones

**Key Mechanics:**
- **Planning Poker simulation**: Equipo vota, hay desacuerdos, SM facilita
- **Story prioritization**: Product Owner vs Tech Lead tienen prioridades distintas
- **Sprint capacity**: Ayudar a equipo a comprometerse realísticamente

**Data Structure:**
```javascript
USER_STORIES = [
  { id: "US-101", title: "Login OAuth", complexity: "?", businessValue: "high" },
  { id: "US-102", title: "Dashboard widgets", complexity: "?", businessValue: "medium" },
  // ...
]

PLANNING_POKER_VOTES = {
  "US-101": { clara: 5, diego: 8, mateo: 5 } // Desacuerdo!
}
```

---

### **Challenge 5: La presión de velocidad** 🔴
**Tipo:** Chat-based stakeholder management
**Escenario:** Engineering Manager pide 30% más velocidad. Con gráficos. El equipo te mira.
**UI:** Chat con EM + Chat con equipo + Gráficos de métricas + AI Coach para comunicación

**Dimensiones Evaluadas:**
1. **Detection** - Detecta presión inapropiada sobre velocity
2. **Metrics Literacy** - Entiende métricas ágiles (velocity, cycle time, throughput)
3. **Stakeholder Management** - Maneja expectativas del EM sin comprometer al equipo
4. **Negotiation** - Negocia alternativas realistas
5. **Systemic Thinking** - Identifica causas sistémicas (deuda técnica, WIP, interrupciones)

**Key Mechanics:**
- **Conversation con EM**: Pedido de 30% más velocity
- **Team conversation**: Equipo menciona deuda técnica, interrupciones
- **Metrics analysis**: Gráficos de velocity, cycle time, lead time
- **AI Coach**: Ayuda a comunicar impacto de deuda técnica al EM
- **Negotiation moment**: ¿Qué propones como alternativa?

**Data Structure:**
```javascript
METRICS_DATA = {
  velocity: [28, 32, 30, 29, 31], // Last 5 sprints
  cycleTime: [8, 10, 12, 14, 15], // Increasing!
  leadTime: [15, 18, 20, 22, 25],  // Increasing!
  techDebt: "40% of capacity"
}

AI_COACH_MOMENTS = {
  investigar_raiz: {
    type: "communication",
    title: "✉️ AI Communication Coach",
    description: "Pedí ayuda para comunicar impacto de deuda técnica al EM"
  }
}
```

---

### **Challenge 6: Team Agreements Workshop** 🟣
**Tipo:** Visual workshop con bulletpoints editables
**Escenario:** Equipo nuevo, primer día. Facilitar creación de Team Agreements (DoR, DoD, Values, etc.)
**UI:** Grid de 6 sections con 5 bulletpoints editables cada uno + Chat lateral + Progress tracking

**Dimensiones Evaluadas:**
1. **Facilitation** - Facilita sin imponer acuerdos
2. **Consensus Building** - Construye consenso genuino (no solo acepta primeras ideas)
3. **Inclusivity** - Incluye todas las voces (devs, QA, PO)
4. **Clarity** - Acuerdos claros y accionables (no genéricos)
5. **Systems Thinking** - Conecta acuerdos con cultura y procesos

**Key Mechanics:**
- **6 sections**: Team Values, Definition of Ready, Definition of Done, Communication, Estimation, Ceremonies
- **5 bulletpoints per section** (editable inline)
- **Team proposals**: Equipo propone ideas en chat, SM las agrega al board
- **Progress tracking**: % complete per section
- **Completion badges**: Visual feedback cuando completas una sección

**Data Structure:**
```javascript
BOARD_SECTIONS = [
  { id: "team_values", title: "Team Values", icon: "💎", color: "#fbbf24" },
  { id: "dor", title: "Definition of Ready", icon: "✅", color: "#60a5fa" },
  { id: "dod", title: "Definition of Done", icon: "🎯", color: "#34d399" },
  { id: "communication", title: "Communication", icon: "💬", color: "#f472b6" },
  { id: "estimation", title: "Estimation", icon: "📊", color: "#818cf8" },
  { id: "ceremonies", title: "Ceremonies", icon: "📅", color: "#fb923c" }
]

INITIAL_BOARD_STATE = {
  team_values: ["", "", "", "", ""],
  dor: ["", "", "", "", ""],
  // ... 5 bulletpoints per section (all empty initially)
}

TEAM_PROPOSALS = [
  { time: 15000, from: "clara", text: "Propongo: 'Feedback honesto sin culpar personas'", section: "team_values" },
  { time: 30000, from: "diego", text: "Para DoR: 'Requisitos claros con acceptance criteria'", section: "dor" },
  // ...
]
```

**Visual Design:**
- **Colorful grid cards** (3 columns responsive)
- **Editable bulletpoints** (inline input fields)
- **Progress bars** per section
- **Completion badges** (appear with animation)
- **Team proposals** appear in chat over time

---

## 🏗️ Technical Architecture

### **Frontend Stack**
```
React 18 + Vite
React Router (navigation)
CSS Modules (scoped styles)
Recharts (radar charts, metrics viz)
```

### **Backend/Services**
```
Supabase (results storage)
Anthropic Claude API (AI team simulation + evaluation)
```

### **Key Folders**
```
src/
├── challenges/          # Challenge components (Challenge01.jsx, Challenge02.jsx, ...)
├── data/               # Challenge data (challenge01.js, challenge02.js, ...)
├── engine/             # AI + Supabase logic
│   ├── ai.js          # Claude API calls, prompt building, scoring
│   └── supabase.js    # Save results to DB
├── components/         # Shared components (Avatar, TopBar, RadarChart, ...)
├── pages/             # Landing, ChallengeMenu, Report
└── theme.js           # Color palette, design tokens
```

### **Data Flow**
```
User Action (click card, send message, etc.)
    ↓
Challenge Component (Challenge02.jsx)
    ↓
Build AI Prompt (buildBlockerChallengePrompt in ai.js)
    ↓
Call Claude API (callAI in ai.js)
    ↓
Parse Response (scores, reactions, feedback)
    ↓
Update UI (chat messages, scores, board state)
    ↓
Results Phase → Save to Supabase
```

---

## 🎨 UI/UX Patterns & Consistency

### **Common Patterns Across Challenges**

#### **Phase Structure**
Most challenges follow: **Context → Active → Results**
- **Context**: Setup, scenario description, metrics
- **Active**: Interactive simulation (chat, board, workshop)
- **Results**: Scores, radar chart, feedback, grade

#### **Evaluation System**
- **Scores**: 1-4 per dimension (RedFlag=1, Developing=2, Competent=3, Expert=4)
- **Quality**: "expert" | "competent" | "developing" | "red_flag"
- **Final Grade**: A (≥80%), B (≥60%), C (≥40%), D (<40%)

#### **Visual Components**
- **TopBar**: Progress indicator (step X/Y), title, subtitle, timer (if applicable)
- **Chat**: Right sidebar (450px), team reactions, user input
- **Cards**: Rounded corners, shadows, hover effects, status colors
- **Buttons**: Gradient backgrounds, hover animations
- **Badges**: Small, rounded, colored by status/priority
- **Progress Bars**: Smooth animations, color-coded by performance

#### **Color Palette**
```javascript
// Status Colors
✅ Green (#10b981, #34d399) - OK, completed, expert
🟡 Yellow (#f59e0b, #fbbf24) - Warning, developing
🔴 Red (#ef4444, #dc2626) - Blocked, red flag, danger
🔵 Blue (#60a5fa, #3b82f6) - Info, competent
🟣 Purple (#8b5cf6, #7c3aed) - Special, pair programming
🟠 Orange (#fb923c, #f59e0b) - Medium priority, attention

// Neutrals
Gray scale: #f8fafc → #f1f5f9 → #e2e8f0 → #cbd5e1 → #94a3b8 → #64748b → #475569 → #0f172a
```

#### **Typography**
- **Font Family**: 'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif
- **Titles**: 900 weight, gradient backgrounds (via -webkit-background-clip)
- **Labels**: 11-12px, uppercase, letter-spacing 0.5px
- **Body Text**: 13-15px, 1.5-1.6 line-height

#### **Spacing & Layout**
- **Gap**: 8px (compact), 12px (normal), 24px (generous)
- **Padding**: 10-14px (compact cards), 20-24px (sections)
- **Border Radius**: 10-12px (cards), 14-16px (containers), 20-24px (modals)
- **Max Width**: 1200-1800px (main content), 450-700px (modals)

---

## 🤖 AI Integration

### **AI Roles**
1. **Team Simulation**: Genera respuestas realistas de team members
2. **Evaluation**: Evalúa cada acción del SM (scores + quality + feedback)
3. **Coach (optional)**: Sugerencias de preguntas, drafts de mensajes

### **Prompt Structure** (General Pattern)
```
System: "Simulás un equipo Scrum real para SMatch. Respondé en español."

Context:
- EQUIPO: [descriptions of team members]
- SITUACIÓN: [current sprint, day, problem]
- CONVERSACIÓN RECIENTE: [last 10 messages]

User Action:
- EL SCRUM MASTER DIJO: "..." or ACCIÓN: [action description]

Instructions:
- Evaluá X dimensiones: [list with scoring criteria]
- Respondé SOLO con JSON: { quality, scores, reactions, feedback }

Scoring:
- Expert(4): [criteria for expert]
- Competent(3): [criteria for competent]
- Developing(2): [criteria for developing]
- RedFlag(1): [criteria for red flag]
```

### **API Calls** (via `ai.js`)
```javascript
// Main function
export async function callAI(systemPrompt, userInput) {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    system: systemPrompt,
    messages: [{ role: "user", content: userInput }]
  })
  return JSON.parse(response.content[0].text)
}

// Challenge-specific prompt builders
buildRetroPrompt(teamDesc, format, conversation, smInput)
buildBlockerChallengePrompt(teamDesc, kanbanState, smAction, chatContext)
buildBurnoutPrompt(situation, conversation, smInput)
buildPlanningPrompt(teamDesc, stories, conversation, smInput)
buildVelocityPrompt(teamDesc, metrics, conversation, smInput)
buildWorkshopPrompt(teamDesc, boardState, conversation, smAction)
```

---

## 📊 Results & Scoring

### **Score Calculation**
```javascript
// Average scores across all actions
function computeScores(allScores, dimensions) {
  return dimensions.map(([key, label]) => {
    const vals = allScores.map(s => s[key]).filter(v => v > 0)
    const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0
    return {
      dimension: label,
      score: Math.round((avg / 4) * 100), // Convert 1-4 to 0-100%
      fullMark: 100
    }
  })
}

// Final grade
function getGrade(finalScores) {
  const avg = finalScores.reduce((a, x) => a + x.score, 0) / finalScores.length
  if (avg >= 80) return { letter: "A", label: "Scrum Master Experto", color: "#34d399" }
  if (avg >= 60) return { letter: "B", label: "Scrum Master Competente", color: "#60a5fa" }
  if (avg >= 40) return { letter: "C", label: "Scrum Master en Desarrollo", color: "#fbbf24" }
  return { letter: "D", label: "Necesita Crecimiento Significativo", color: "#f87171" }
}
```

### **Supabase Schema**
```sql
table: challenge_results
columns:
  - id (uuid, primary key)
  - candidate_id (text)
  - challenge_id (int, 1-6)
  - scores (jsonb) -- [{ dimension, score, fullMark }]
  - feedback (jsonb) -- [{ action, target, quality, feedback, scores }]
  - grade (jsonb) -- { letter, label, color, avg }
  - time_used (int, seconds)
  - created_at (timestamp)
```

---

## 🎯 Design Principles

### **1. Realism Over Gamification**
- Situaciones basadas en casos reales (no fantasía)
- Team members con personalidades auténticas
- Dilemas sin "respuesta correcta obvia"

### **2. Show, Don't Tell**
- **Challenge 2**: Visual Kanban board (no solo descripción de bloqueo)
- **Challenge 5**: Gráficos de métricas (no solo números)
- **Challenge 6**: Bulletpoints editables (no solo acordar en chat)

### **3. Multiple Valid Approaches**
- AI evalúa calidad, no match exacto con respuesta esperada
- Expert = detecta temprano + facilita sin dirigir + empodera
- Competent = buenos instintos pero timing imperfecto
- Developing = muy directivo o muy pasivo

### **4. Progressive Difficulty**
- Challenge 1: Básico (facilitation, coaching)
- Challenge 2-3: Intermedio (detection, empathy, coordination)
- Challenge 4-6: Avanzado (metrics literacy, stakeholder mgmt, consensus building)

### **5. Consistency in Evaluation**
- Todas las dimensiones son 1-4 scale
- Siempre hay feedback cualitativo + cuantitativo
- Scoring criteria explícito en prompts

---

## 🔄 Next Steps / Improvements

### **Pending Enhancements**
1. **Challenge 2**: Test complete flow (AI evaluation funcionando bien?)
2. **Challenge 3-6**: Verificar que AI evaluation sea consistente con Challenge 1-2
3. **Metrics Dashboard**: Agregar analytics de candidatos (promedio por dimensión, comparación con peers)
4. **LinkedIn Badge**: Export visual badge para compartir en LinkedIn
5. **Report Page**: Mejorar diseño del reporte completo

### **Known Issues**
- [ ] Challenge 2: Verificar que boardUpdates se apliquen correctamente
- [ ] Challenge 5: Gráficos de métricas pendiente de implementar
- [ ] Challenge 6: Team proposals timing (¿aparecen muy rápido/lento?)

---

## 📝 Consistency Checklist

Para mantener consistencia al agregar nuevos challenges o modificar existentes:

### **Data Structure**
- [ ] `TEAM` array con 5-7 members (id, name, role, color, init)
- [ ] `MEMBER_MAP` = Object.fromEntries(TEAM.map(t => [t.id, t]))
- [ ] `DIMENSIONS` array con 5-7 dimensiones ([key, label])
- [ ] `SPRINT_CONTEXT` o `SITUATION` (texto descriptivo)
- [ ] `AI_COACH_MOMENTS` (si aplica)

### **Component Structure**
- [ ] 3 phases: Context → Active → Results
- [ ] TopBar con currentStep/totalSteps
- [ ] Chat lateral (450px, team reactions)
- [ ] Loading states durante AI calls
- [ ] Error handling para API failures

### **AI Integration**
- [ ] Prompt builder function en `ai.js`
- [ ] Input: teamDesc, situation, conversation, smAction
- [ ] Output: { quality, scores, reactions, feedback }
- [ ] Scoring criteria explícito en prompt (Expert/Competent/Developing/RedFlag)

### **Styling**
- [ ] Usar theme.js colors (T.green, T.orange, T.blue, etc.)
- [ ] Border radius: 10-12px cards, 20-24px containers
- [ ] Hover effects: translateY(-2px), box-shadow increase
- [ ] Animations: fadeIn, slideIn (0.3-0.4s ease)
- [ ] Responsive: max-width 1200-1800px, mobile breakpoints

### **Results**
- [ ] RadarChart con finalScores
- [ ] Grade badge (A/B/C/D con color)
- [ ] Feedback list por acción
- [ ] Botones: Volver al Menú, Ver Reporte Completo
- [ ] Save to Supabase con saveResult()

---

## 🎓 Summary Table

| Challenge | Type | UI Approach | Key Features | Dimensions | Complexity |
|-----------|------|-------------|--------------|------------|------------|
| **1. Retro Perfecta** | Chat | Retro selector + Chat | 4 retro formats, dynamic reactions | 5 (facilitation, systems, safety, coaching, process) | ⭐⭐ |
| **2. Bloqueo Nadie Escala** | Visual Board | Kanban + Cards + Chat | Story points, WIP limits, action buttons | 7 (detection, facilitation, empathy, coordination, ai_judgment, wip_limits, flow_optimization) | ⭐⭐⭐⭐ |
| **3. Dev Apagándose** | Chat 1-1 | 1-1 coaching + AI Coach | Burnout detection, coaching questions | 5 (detection, coaching, empathy, leadership, systemic) | ⭐⭐⭐ |
| **4. Estimación** | Interactive | Planning Poker + Prioritization | Story points, voting, disagreements | 5 (coaching, maturity, facilitation, systems, safety) | ⭐⭐⭐ |
| **5. Presión Velocidad** | Chat + Metrics | Stakeholder chat + Graphs | Metrics analysis, negotiation | 5 (detection, metrics_literacy, stakeholder_mgmt, negotiation, systemic) | ⭐⭐⭐⭐ |
| **6. Team Agreements** | Visual Workshop | Editable grid + Chat | 6 sections, 5 bulletpoints each, proposals | 5 (facilitation, consensus, inclusivity, clarity, systems) | ⭐⭐⭐ |

---

## 🚀 Quick Start Guide (For New Developers)

### **Setup**
```bash
npm install
npm run dev
# Open http://localhost:5179
```

### **Add New Challenge**
1. Create `/src/data/challenge0X.js` with TEAM, DIMENSIONS, etc.
2. Create `/src/challenges/Challenge0X.jsx` with 3 phases
3. Create `/src/challenges/Challenge0X.css` for styling
4. Add route in `/src/App.jsx`
5. Add to CHALLENGES array in `/src/pages/ChallengeMenu.jsx`
6. Create prompt builder in `/src/engine/ai.js`

### **Test AI Integration**
```javascript
const prompt = buildYourPrompt(teamDesc, situation, message)
const result = await callAI(prompt, "Test message")
console.log(result) // { quality, scores, reactions, feedback }
```

---

**Document Version:** 1.0
**Last Updated:** 2026-03-30
**Contact:** sebastian.spiguel@example.com
