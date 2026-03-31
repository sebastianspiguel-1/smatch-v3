# SMatch v2 - Contexto Completo del Proyecto

**Fecha:** Marzo 2026
**Proyecto:** SMatch v2 - Plataforma de Assessment para Scrum Masters
**Stack:** React + Vite, Tailwind-inspired design system, Supabase backend

---

## 🎯 ¿Qué es SMatch?

SMatch es una plataforma innovadora para **evaluar Scrum Masters** mediante challenges interactivos simulados con IA. En lugar de tests teóricos tradicionales, los candidatos enfrentan situaciones reales de facilitación ágil donde deben tomar decisiones y gestionar equipos virtuales.

### Propuesta de Valor

**Para Hiring Managers:**
- Evaluación objetiva basada en data real (no solo CV)
- Insights de 4 dimensiones: Facilitation, Process, Coaching, Systems Thinking
- Reportes detallados con red flags y highlights
- Dashboard comparativo de candidatos

**Para Candidatos:**
- Experiencia gamificada y profesional
- Feedback inmediato con IA
- Badge/certificado compartible en LinkedIn
- Reporte de strengths/areas de mejora

**Para Recruiters:**
- Reduce time-to-hire con pre-screening automático
- Filtra candidatos por scores/grades
- Dashboard centralizado con métricas

---

## 📐 Arquitectura del Proyecto

### Stack Tecnológico

```
Frontend:
- React 18 (con hooks: useState, useEffect, useRef, useMemo)
- Vite (HMR, dev server)
- React Router DOM (navegación)
- Recharts (gráficos radar)
- CSS Modules + Inline Styles

Backend/Services:
- Supabase (base de datos, autenticación)
- OpenAI API / Claude API (evaluación con IA)

Diseño:
- Sistema de design tokens custom (theme.js)
- Light theme (#f0f4f8 foundation, #00d4aa teal brand)
- Tipografía: Plus Jakarta Sans
- Responsive design (mobile-first)
```

### Estructura de Directorios

```
smatch-v2/
├── src/
│   ├── challenges/          # Los 4 challenges interactivos
│   │   ├── Challenge01.jsx  # Sprint Retrospective (Sailboat)
│   │   ├── Challenge02.jsx  # Team Agreements Workshop
│   │   ├── Challenge03.jsx  # Negotiation/Conflict Workshop
│   │   └── Challenge04.jsx  # Estimation Whiteboard
│   ├── components/          # Componentes reutilizables
│   │   ├── TopBar.jsx       # Barra superior con progress
│   │   ├── SuccessModal.jsx # Modal de celebración post-challenge
│   │   ├── FeedbackToast.jsx
│   │   ├── FeedbackModal.jsx
│   │   ├── RadarChartComponent.jsx
│   │   └── index.jsx        # Barrel export
│   ├── pages/
│   │   ├── Landing.jsx      # Homepage con hero, features, social proof
│   │   ├── ChallengeMenu.jsx # Selector de challenges
│   │   ├── CandidateReport.jsx # Reporte individual detallado
│   │   └── RecruiterDashboard.jsx # Dashboard para recruiters
│   ├── data/                # Data estática de challenges
│   │   ├── challenge01.js
│   │   ├── challenge02.js
│   │   ├── challenge03.js
│   │   └── challenge04.js
│   ├── engine/
│   │   ├── ai.js            # Integración con OpenAI/Claude
│   │   └── supabase.js      # Cliente Supabase
│   ├── theme.js             # Design tokens (colores, spacing, etc)
│   └── App.jsx              # Router principal
├── public/
└── package.json
```

---

## 🛠️ Historial de Desarrollo

### **Sesión 1: Análisis Estratégico y Quick Wins**

**Objetivo:** Identificar gaps para hacer SMatch una "joya" desde perspectiva de hiring managers, inversores, y emprendedores.

**Análisis realizado:**
- Hiring Managers necesitan: credibilidad social, data accionable, anti-fraude
- Inversores buscan: social proof, tracción, modelo de negocio claro, moat
- Entrepreneur needs: landing conversion, candidate experience, recruiter tools

**Quick Wins Implementados (4/4):**

1. ✅ **Social Proof en Landing**
   - Sección "Trusted by" con logos de empresas
   - Stats: "1,200+ Scrum Masters evaluados", "89% accuracy vs performance real"
   - Testimonios con avatars y companies
   - Archivo: `src/pages/Landing.jsx` + `Landing.css`

2. ✅ **Recruiter CTA Banner**
   - Banner prominente en Challenge Menu
   - Call-to-action para recruiters: "Ver Planes →"
   - Archivo: `src/pages/ChallengeMenu.jsx` + `ChallengeMenu.css`

3. ✅ **Success Modal Component**
   - Modal de celebración post-challenge
   - Muestra grade + score con animaciones
   - Botones: Share LinkedIn, Download Badge, Ver Reporte
   - Archivo: `src/components/SuccessModal.jsx` + `SuccessModal.css`

4. ✅ **Recruiter Dashboard**
   - Dashboard completo con tabla de candidatos
   - Stats cards: candidatos evaluados, completos, avg score, grado A
   - Tabla filtrable/searchable con columnas: candidato, score, grade, progreso, red flags, highlights
   - Comparación side-by-side (seleccionar 2+ candidatos)
   - Archivo: `src/pages/RecruiterDashboard.jsx` + `RecruiterDashboard.css`
   - Ruta agregada: `/dashboard`

---

### **Sesión 2: Mejoras de Challenges (UX Enhancement)**

**Objetivo:** Mejorar la experiencia de usuario en los 4 challenges con 3 quick wins.

**Quick Wins Implementados (3/3):**

1. ✅ **Progress Bar en TopBar**
   - Actualizado `TopBar.jsx` con parámetros `currentStep` y `totalSteps`
   - Indicador visual: "Paso X de Y" con dots de progreso
   - Integrado en todos los challenges:
     - Challenge01: Ya tenía ProgressBar custom (mantenido)
     - Challenge02: TopBar con 3 pasos (context, board, results)
     - Challenge03: TopBar con 4 pasos (context, opening, workshop, results)
     - Challenge04: TopBar con 3 pasos (context, play, results)

2. ✅ **Success Modal Integration**
   - Integrado `SuccessModal` en los 4 challenges
   - Aparece automáticamente 800ms después de llegar a resultados
   - State: `showSuccessModal` con useEffect trigger on `phase === "results"`
   - Handlers: LinkedIn share, badge download (placeholder), navigate to report

3. ✅ **Intro Screens**
   - Ya existían como fase "context" en todos los challenges
   - Cada uno tiene: situación, equipo, objetivos, CTA "Comenzar"
   - No requirió cambios adicionales

---

## 🎨 Sistema de Diseño (Light Theme)

### Paleta de Colores

```javascript
// Backgrounds
bg: "#f0f4f8"           // Fondo principal (RetroForge-inspired)
panel: "#ffffff"        // Cards y superficies elevadas
card: "#f9fafb"         // Cards anidados
cardHi: "#ffffff"       // Hover/active

// Bordes
border: "rgba(30, 41, 59, 0.12)"
borderHi: "rgba(30, 41, 59, 0.20)"

// Brand
teal: "#00d4aa"         // Color principal (unchanged)
tealDim: "rgba(0, 212, 170, 0.08)"
tealGlow: "rgba(0, 212, 170, 0.20)"
navy: "#0a1f44"         // Headers fuertes
navyLight: "#1e3a5f"

// Tipografía (oscuro sobre claro)
text: "#0f172a"         // Texto primario (slate-900)
sub: "#475569"          // Secundario (slate-600)
dim: "#64748b"          // Terciario (slate-500)

// Status
red: "#dc2626", orange: "#ea580c", green: "#059669"
blue: "#2563eb", gold: "#d97706"

// Sticky notes
sY: "#fef3c7", sG: "#d1fae5", sP: "#fce7f3"
sB: "#dbeafe", sO: "#ffedd5", sV: "#ede9fe"
```

### Tipografía

- Font: **Plus Jakarta Sans** (fallback: Inter, system-ui)
- Escala: 11px (xs) → 48px (4xl)
- Spacing: Base 8px (ritmo vertical)
- Border radius: 8px (base), 12px (md), 16px (lg)

---

## 🎮 Los 4 Challenges

### Challenge 01: Sprint Retrospective (Sailboat)

**Formato:** Retrospectiva de Sprint 17 con equipo Fenix

**Fases:**
1. Context - Briefing del sprint
2. Format - Elegir formato de retro (Sailboat, Mad/Sad/Glad, etc.)
3. Board - Facilitación con chat en tiempo real + whiteboard
4. Results - Evaluación y feedback

**Características técnicas:**
- 5 momentos clave con intervenciones del SM
- IA evalúa cada intervención (quality: expert/competent/developing/red_flag)
- Timer de 15 minutos
- Sticky notes interactivos
- Visualización Sailboat con cielo/océano gradients
- FeedbackToast y FeedbackTimeline integrados

**Archivo:** `src/challenges/Challenge01.jsx` + `Challenge01.css`

---

### Challenge 02: Team Agreements Workshop

**Formato:** Workshop de definición de acuerdos con equipo nuevo

**Fases:**
1. Context - Situación y equipo
2. Board - Facilitación con tablero editable
3. Results - Evaluación

**Tablero de Agreements:**
- Team Values (amber)
- Definition of Ready (pink)
- Definition of Done (green)
- Communication (blue)
- Estimation (purple)
- Ceremonies (teal)

**Características técnicas:**
- Bulletpoints editables inline
- Descriptions editables por categoría
- Chat con equipo en tiempo real
- IA evalúa facilitación de consenso
- Timer de 15 minutos

**Archivo:** `src/challenges/Challenge02.jsx` + `Challenge02.css`

---

### Challenge 03: Conflict/Negotiation Workshop

**Formato:** Workshop de team agreements con equipo Valkyrie (primer día)

**Fases:**
1. Context - Presentación de equipo y situación
2. Opening - Apertura del workshop
3. Workshop - Múltiples rondas de proponer/debatir/escribir agreements
4. Results - Evaluación

**Características técnicas:**
- Board de 6 categorías (ceremonies, definitions, communication, estimation, values, conflict-resolution)
- Sistema de rounds (proponer tema → facilitar debate → escribir agreement)
- Chatbot AI helper (opcional)
- Toggle board visibility
- Timer de 45 minutos
- Cobertura de temas (covered/total)

**Archivo:** `src/challenges/Challenge03.jsx`

---

### Challenge 04: Estimation & Priorization Whiteboard

**Formato:** Sesión interactiva de whiteboard con herramientas drag-and-drop

**Fases:**
1. Context - Briefing de situación
2. Play - Whiteboard gamificado con herramientas
3. Results - Score, achievements, evaluación

**Herramientas en el Dock:**
- 📝 Planning Poker Quiz
- 🔢 Fibonacci Sequence
- ⚖️ Relativa vs Absoluta
- 🎯 Modelo Kano
- 🎲 MoSCoW Prioritization
- 👕 T-Shirt Sizing Simulation

**Características técnicas:**
- Drag & drop de herramientas al whiteboard
- Chat con equipo (bubbles flotantes)
- Eventos/preguntas dinámicos del equipo
- Sistema de achievements (8 logros posibles)
- Mood tracking del equipo
- Planning Poker interactivo con reveal
- Score acumulativo
- Timer de 40 minutos

**Archivo:** `src/challenges/Challenge04.jsx`

---

## 🤖 Integración con IA

### Engine AI (`src/engine/ai.js`)

**Funciones principales:**

```javascript
callAI(systemPrompt, userMessage)
// Llama a OpenAI/Claude con prompts estructurados
// Retorna JSON: { quality, scores, feedback, reactions, narration }

buildFormatPrompt(formatName, formatDesc, justification, context)
// Construye prompt para evaluar elección de formato de retro

buildInterventionPrompt(teamDesc, context, situation, conversation, smInput, isActionItems)
// Construye prompt para evaluar intervención del SM

computeScores(allScores)
// Agrega scores de múltiples intervenciones en 4 dimensiones
// Retorna array con promedios ponderados

getGrade(avgScore)
// Convierte score numérico a letter grade (A/B/C/D)
// Retorna { letter, label, color, avg }
```

**Dimensiones evaluadas:**
1. **Facilitation** (facilitación de conversaciones)
2. **Process** (conocimiento de procesos ágiles)
3. **Coaching** (habilidades de coaching)
4. **Systems Thinking** (pensamiento sistémico)

**Quality Levels:**
- `expert` → 4 pts (verde)
- `competent` → 3 pts (azul)
- `developing` → 2 pts (naranja)
- `red_flag` → 1 pt (rojo)

---

## 💾 Backend (Supabase)

### Engine Supabase (`src/engine/supabase.js`)

**Función principal:**

```javascript
saveResult(data)
// Guarda resultado del challenge en Supabase
// Estructura:
{
  candidateId: string,
  challengeId: 1-4,
  scores: { facilitation, process, coaching, systems },
  feedback: array,
  timeUsed: seconds,
  grade: "A"/"B"/"C"/"D",
  avgScore: number,
  completedAt: timestamp
}
```

**Schema de DB (inferido):**
- Tabla: `challenge_results`
- Índices: candidateId, challengeId, completedAt
- Queries esperadas: filtrar por candidato, ordenar por fecha, agregar scores

---

## 🚀 Estado Actual del Proyecto

### ✅ Completado

**Landing & Marketing:**
- Landing page con hero, features, social proof
- Trusted by section con logos y stats
- Responsive design
- Navegación clara

**Challenges (4/4 completos):**
- Challenge 01: Sprint Retrospective ✅
- Challenge 02: Team Agreements ✅
- Challenge 03: Conflict Workshop ✅
- Challenge 04: Estimation Whiteboard ✅

**UX Improvements:**
- TopBar con progress tracking en todos los challenges ✅
- Success Modal post-challenge ✅
- Intro screens (context phases) ✅
- Feedback real-time (toasts + timeline) ✅

**Recruiter Tools:**
- Dashboard completo ✅
- Tabla de candidatos con filtros ✅
- Comparación side-by-side ✅
- Stats cards ✅
- Recruiter CTA banner en challenge menu ✅

**Reports:**
- Candidate Report con radar chart ✅
- Dimensiones breakdown ✅
- Feedback timeline ✅
- Red flags & highlights ✅

**Routing:**
```
/ → Landing
/challenges → ChallengeMenu
/challenge/1 → Challenge01
/challenge/2 → Challenge02
/challenge/3 → Challenge03
/challenge/4 → Challenge04
/report/:id → CandidateReport
/dashboard → RecruiterDashboard
```

---

### 🎯 Próximos Pasos Sugeridos

**Prioridad Alta:**

1. **Autenticación de Candidatos**
   - Login/signup con Supabase Auth
   - Email verification
   - Password reset
   - Protected routes (solo challenges si logged in)

2. **Anti-Fraud Mechanisms**
   - Webcam proctoring (opcional)
   - Time limits estrictos
   - Detección de tab switching
   - Consistency checks (IA detecta copy-paste)

3. **LinkedIn Integration**
   - OAuth para compartir badge
   - Post automático con template
   - Badge generation (canvas/svg con grade)

4. **Email Notifications**
   - Candidato: confirmación, reminder, results ready
   - Recruiter: new candidate completed, weekly digest

**Prioridad Media:**

5. **Recruiter Onboarding**
   - Signup flow para recruiters
   - Team/company setup
   - Invitar candidatos por email
   - Custom branding (logo, colors)

6. **Analytics Dashboard**
   - Métricas de uso (candidates started, completed, avg time)
   - Funnel de conversión
   - Most challenging moments
   - Grade distribution

7. **More Challenges**
   - Challenge 05: Sprint Planning
   - Challenge 06: Stakeholder Management
   - Challenge 07: Team Coaching 1-on-1
   - Challenge 08: Scaling/Multi-team

**Prioridad Baja:**

8. **Mobile App**
   - React Native version
   - Challenges adaptados a mobile
   - Push notifications

9. **Internationalization**
   - i18n setup (react-i18next)
   - English version
   - Portuguese version

10. **Premium Features**
    - Advanced reports con comparativas de mercado
    - Custom challenges por empresa
    - Video responses (grabar respuestas en video)
    - AI-powered coaching post-assessment

---

## 🐛 Issues Conocidos

**Ninguno crítico actualmente.**

El dev server está funcionando correctamente con HMR en todos los archivos modificados.

---

## 📊 Métricas de Negocio Actuales (Mock Data)

**En RecruiterDashboard:**
- 4 candidatos evaluados (demo)
- 3 assessments completos
- 80% score promedio
- 2 candidatos grado A

**Testimonios (Landing):**
- María González, Talent Lead @ TechCorp
- Carlos Ramírez, Head of Engineering @ StartupX
- Ana Torres, HR Director @ ScaleUp

**Stats:**
- 1,200+ Scrum Masters evaluados
- 89% accuracy vs performance real
- 47 empresas confían en SMatch
- Reduce 70% el tiempo de screening

---

## 🔧 Comandos Útiles

```bash
# Desarrollo
npm run dev           # Inicia dev server en localhost:5173

# Build
npm run build         # Genera dist/ para producción

# Preview
npm run preview       # Preview del build de producción

# Linting
npm run lint          # ESLint check
```

---

## 📝 Notas Técnicas Importantes

### Patrones de Código

**State Management:**
- useState para state local de componentes
- useRef para referencias DOM y valores que no causan re-render
- useMemo para cálculos derivados costosos
- No Redux/Zustand (no necesario por ahora)

**Data Flow:**
- Props drilling (no context API aún)
- Callbacks para comunicación hijo → padre
- Local storage para persistencia básica (candidateId)

**Styling:**
- Inline styles con theme tokens: `style={{ color: T.teal }}`
- CSS modules para layouts complejos (`.board-challenge`, etc)
- No Tailwind classes (solo inspiración)

**AI Prompting:**
- System prompts detallados con contexto del equipo
- User message = intervención del SM
- JSON response forzado con instrucciones específicas
- Temperature baja para consistencia (0.7)

**Routing:**
- React Router DOM v6
- useNavigate hook para navigation
- No lazy loading (bundle pequeño)

---

## 💡 Decisiones de Diseño Clave

1. **Light Theme sobre Dark:** Mejor accesibilidad, más profesional para recruiters
2. **Teal (#00d4aa) como brand:** Color distintivo, energético pero profesional
3. **IA evaluación real-time:** No esperar al final, feedback inmediato mejora UX
4. **Gamification moderada:** Achievements y score sin ser infantil
5. **Mobile-responsive pero Desktop-first:** Los challenges son complejos, mejor en desktop
6. **No auth requerido para demo:** Permite probar sin fricción, conversión en landing
7. **Mock data hardcoded:** Prototipo funcional sin backend completo aún

---

## 🎓 Filosofía del Producto

**SMatch no es un quiz de certificación.**

Es una **simulación realista** donde el candidato demuestra habilidades de facilitación en contextos auténticos:
- Equipos con personalidades diversas
- Conflictos emergentes
- Time pressure
- Decisiones con trade-offs

La IA actúa como el equipo, reaccionando de forma natural a las intervenciones del SM. El assessment mide **cómo facilita**, no solo **qué sabe**.

**Ventaja competitiva:**
- Behavioral assessment > Knowledge quiz
- Data objetiva > Impresión subjetiva de entrevista
- Scalable > Manual screening
- Engaging > Aburridos tests tradicionales

---

## 👥 Stakeholders

**Candidatos (Scrum Masters):**
- Buscan: certificación reconocida, feedback de valor, oportunidades laborales
- Pain points: Entrevistas subjetivas, no pueden demostrar skills en CV

**Recruiters/Hiring Managers:**
- Buscan: filtro objetivo, reducir time-to-hire, evitar malas contrataciones
- Pain points: Muchos candidatos "certificados" sin skills reales, entrevistas caras

**Empresas Tech:**
- Buscan: SMs de calidad, hiring process eficiente, data para decisiones
- Pain points: Rotación alta por mal fit, costo de oportunidad de SMs mediocres

---

## 🗺️ Roadmap Tentativo

**Q1 2026 (Actual):**
- ✅ MVP con 4 challenges
- ✅ Landing + Dashboard básico
- ✅ IA evaluation working

**Q2 2026:**
- [ ] Auth + User profiles
- [ ] LinkedIn integration
- [ ] Email notifications
- [ ] Anti-fraud básico

**Q3 2026:**
- [ ] Recruiter onboarding completo
- [ ] Payment integration (Stripe)
- [ ] Analytics dashboard
- [ ] 2 challenges adicionales

**Q4 2026:**
- [ ] Mobile app (React Native)
- [ ] Internationalization (EN, PT)
- [ ] Enterprise features
- [ ] API para integraciones

---

## 📞 Contacto del Proyecto

**Owner:** Sebastián Spiguel
**Repo:** `/Users/sebastian.spiguel/Documents/smatch-v2`
**Status:** En desarrollo activo
**Última actualización:** Marzo 25, 2026

---

**Este documento debe ser suficiente para que Claude Web entienda TODO el contexto del proyecto y pueda ayudarte con cualquier feature, bug fix, o mejora sin necesidad de re-explicar. ¡Suerte con el proyecto! 🚀**
