# SMATCH — Setlist Narrative Retrofit Brief
## Instrucciones completas para Claude Code

> Leé este documento completo antes de tocar cualquier archivo.
> El objetivo es unificar los 6 challenges bajo la historia de Setlist —
> una app mobile para artistas independientes latinoamericanos.
> NO romper ninguna mecánica existente.

---

## 🎯 QUÉ HAY QUE HACER (resumen ejecutivo)

Reemplazar todos los datos narrativos (equipos, personajes, tickets, contextos de sprint)
en los 6 archivos `/src/data/challenge0X.js` para que cuenten una sola historia continua.
Los archivos `.jsx` NO se tocan salvo Challenge03.jsx (un cambio de ID documentado abajo).

---

## 🌍 EL UNIVERSO — Setlist

### La empresa
**Setlist** — App mobile (iOS/Android) para artistas independientes latinoamericanos.
Desde el celu, el artista gestiona toda su carrera: consigue shows, firma contratos digitales,
cobra y analiza su crecimiento. Todo en un lugar.

**Usuarios:** artistas que hacen 2-20 shows por mes + venues que los contratan.
**Estado:** construyendo el MVP desde cero. Sprint 1 acaba de arrancar.
**La presión:** el Lollapalooza Argentina confirmó que va a usar Setlist para gestionar
los 60 artistas del festival. Tienen 8 semanas (4 sprints de 2 semanas). O llegan o no.
**Prefijo de tickets:** SL-XXX

### La ironía dramática
Un equipo que construye la app para que los artistas sean escuchados y valorados...
donde nadie escucha a nadie y el dev más valioso está cargando un secreto solo.

### El rol del candidato
Es el nuevo SM de Setlist. Llegó hace 2 semanas.
El SM anterior se fue "por diferencias con el equipo técnico" — nadie explica bien qué pasó.

---

## 👥 EL EQUIPO UNIFICADO

Estos son los personajes que van en el array TEAM de TODOS los challenges.
**IDs exactos para el código** (no cambiar):

```javascript
export const TEAM = [
  {
    id: "eric",
    name: "Eric",
    role: "Tech Lead",
    color: "#60a5fa",
    init: "ER",
    personality: "Brillante, directo, a veces cortante. Construyó el backend de Setlist casi solo. Desconfía del proceso ágil. Cuando algo técnico le preocupa lo dice. Cuando algo humano le preocupa, se calla."
  },
  {
    id: "david",
    name: "David",
    role: "Dev de Pagos",
    color: "#34d399",
    init: "DV",
    personality: "Sólido y callado. El módulo de pagos es suyo. Sabe que SL-105 tiene un problema de compatibilidad que va a demorar 2 sprints más. No lo dijo porque no quiere decepcionar al equipo."
  },
  {
    id: "alan",
    name: "Alan",
    role: "Dev Mobile",
    color: "#f472b6",
    init: "AL",
    personality: "Construye la app que los artistas van a usar. Sus decisiones de UX son brillantes pero se las guarda. Eric tomó dos de sus ideas sin darle crédito y Alan no dijo nada. Sus estimaciones son las más precisas del equipo."
  },
  {
    id: "gian",
    name: "Gian",
    role: "QA",
    color: "#fb923c",
    init: "GI",
    personality: "Meticuloso. Percibido como el que frena todo. Pero siempre tiene razón. Encontró 3 bugs críticos en el flujo de contratos que nadie quiso priorizar. Cuando algo falla en prod, él lo había dicho antes."
  },
  {
    id: "gabriela",
    name: "Gabriela",
    role: "Product Owner",
    color: "#a78bfa",
    init: "GA",
    personality: "Habló con 40 artistas para entender qué necesitan. Intuición de producto muy buena. Pero traduce mal los pedidos en historias de usuario y agrega scope sin medir el impacto en el equipo."
  },
  {
    id: "nacho",
    name: "Nacho",
    role: "Dev Frontend",
    color: "#fbbf24",
    init: "NA",
    personality: "Rápido, entusiasta, aprende en el camino. Siempre dice que puede con todo. Lleva 2 sprints con 3 tickets en DOING al mismo tiempo y ninguno terminado."
  }
]
```

### Personaje externo
```javascript
// Simon — Head of Artists, Lollapalooza Argentina
// NO está en TEAM. Aparece como mensajes de WhatsApp/Slack en los challenges.
// Estilo: cordial, usa emojis, genera ansiedad sin querer.
// Agregar a MEMBER_MAP en challenges donde aparezca (C2, C5):
{ id: "simon", name: "Simon", role: "Lollapalooza · Head of Artists", color: "#ef4444", init: "SI" }
// Ejemplo de mensaje: "Hola Gabriela! Solo confirmar que el módulo de pagos va a estar listo para el piloto del 15, ¿verdad? 🎸"
```

---

## 📝 TEAM_DESC estándar para todos los prompts de AI

Usá este texto exacto en el campo `TEAM_DESC` de los 6 challenges:

```javascript
export const TEAM_DESC = `Equipo de Setlist — startup de app mobile para artistas independientes latinoamericanos.

Eric (Tech Lead): brillante y directo, a veces cortante. Construyó el backend casi solo. Desconfía del proceso ágil. Cuando algo técnico le preocupa lo dice; cuando algo humano le preocupa, se calla.

David (Dev de Pagos): sólido y callado. Siempre entrega, pero guarda información crítica en lugar de escalar. Tiene miedo de decepcionar al equipo y eso lo paraliza.

Alan (Dev Mobile): creativo y preciso. Relativamente callado en el equipo. Sus estimaciones son las más exactas pero se autocensura. Eric tomó ideas suyas sin darle crédito y Alan no lo mencionó.

Gian (QA): meticuloso y frustrado. Detecta problemas antes que nadie pero raramente le hacen caso hasta que algo falla en producción. Siempre tiene razón, pero el equipo lo procesa tarde.

Gabriela (Product Owner): conecta bien con artistas y venues pero genera scope creep constantemente. Su intuición de producto es buena; su traducción a historias de usuario, no tanto.

Nacho (Dev Frontend): entusiasta y rápido para aprender, pero sobreestima su velocidad. Acepta compromisos que no puede cumplir y no avisa hasta el último momento.`
```

---

## 🎫 LOS TICKETS DE SETLIST (SL-XXX)

Reemplazar TODOS los tickets FEN-XXX, NVM-XXX o cualquier otro prefijo por estos:

### Módulo Shows
- **SL-101** — Formulario de publicación de fecha (venue) · 5 pts
- **SL-102** — Flujo de aplicación del artista a una fecha · 5 pts
- **SL-103** — Generación automática de contrato digital · 8 pts · ⚠️ tiene bug conocido (Gian lo reportó)
- **SL-104** — Upload y visualización del rider técnico · 3 pts

### Módulo Pagos (el más crítico)
- **SL-105** — Integración con procesador de pagos (Mercado Pago) · 13 pts · 🔴 BLOQUEADO
  - Blocker: problema de compatibilidad con la API de Mercado Pago versión regional LATAM
  - David lo sabe hace 3 días. No lo escaló.
  - Impact: sin este ticket, el Lollapalooza no puede usar Setlist.
- **SL-106** — Split automático de pago con manager · 8 pts
- **SL-107** — Historial de pagos y descarga de facturas · 5 pts

### Módulo Perfil del artista
- **SL-108** — Perfil público del artista (bio, foto, links) · 5 pts
- **SL-109** — Stats de carrera en el perfil · 8 pts
- **SL-110** — Sistema de reviews de venues · 8 pts · ⭐ requerido por el Lollapalooza

---

## 📺 LOS 6 EPISODIOS

### EPISODIO 1 → challenge01.js (Retro)
**Título:** "Lo que no sonó bien"
**Sprint:** Sprint 2 · Retrospectiva

**SPRINT_CONTEXT:**
```
Setlist · Sprint 2 completado. 22 de 29 puntos entregados.
En papel, aceptable. Pero hay tensión que nadie nombra.
Nacho entregó SL-103 tarde sin avisar. Alan hizo trabajo extra para cubrir y no lo dijo.
Gian levantó un bug en el flujo de firma (SL-103) que fue ignorado en el planning.
Eric está callado. Gabriela celebra el sprint. El SM tiene que ir más abajo de la superficie.
Contexto del producto: app mobile para artistas independientes. Sprint 2 incluía
el módulo de Shows básico. El Lollapalooza espera el piloto en 6 semanas.
```

**SPRINT_STATS:** `{ total: 29, completed: 22, carryOver: 2, bugs: 1 }`

**STICKIES — contenido de Setlist:**
- Viento (lo que nos impulsa): "Flujo de contratos funcionando", "Eric armó el backend de Shows muy rápido", "Buen ritmo en las primeras 2 semanas"
- Ancla (lo que nos frena): "SL-103 llegó tarde", "No supimos del bug hasta el final", "Los dailies son muy largos"
- Rocas (riesgos): "SL-105 (pagos) todavía no arrancó", "Dependencia del procesador de pagos externo"
- Isla (meta): "Piloto del Lollapalooza en 6 semanas", "60 artistas usando Setlist en vivo"

**MOMENTS — misma estructura, nuevos nombres y contexto:**
- Momento "apertura": Eric dice algo genérico positivo. El SM tiene que ir más profundo.
- Momento "problema_oculto": Nacho se defiende sin que nadie lo atacara todavía.
- Momento "deuda": Gian menciona el bug de SL-103 que fue ignorado.
- Momento "action_items": Alan habla por primera vez si el SM creó seguridad psicológica.

---

### EPISODIO 2 → challenge02.js (Kanban)
**Título:** "El pago que nadie desbloqueó"
**Sprint:** Sprint 3 · Día 6/10

**SPRINT_CONTEXT:**
```
Setlist · Sprint 3 · Día 6 de 10.
Simon (Lollapalooza) mandó un WhatsApp a las 8:47am:
"Hola Gabriela! Solo confirmar que el módulo de pagos va a estar listo para el piloto del 15, ¿verdad? 🎸"
Nadie respondió todavía.
SL-105 lleva 3 días bloqueado. David sabe exactamente por qué pero no lo dijo en el daily.
Nacho tiene SL-101, SL-102 y SL-104 en DOING al mismo tiempo. WIP: 5/3.
Gian encontró anoche un edge case en SL-103 que rompe el contrato en iOS. Lo mandó por Slack pero nadie leyó.
```

**KANBAN — renombrar tickets:**
- FEN-403 → **SL-105** (integración pagos, David, BLOQUEADO 3 días, 13 pts)
- FEN-401 → **SL-103** (contratos digitales, Eric, DOING, 8 pts)
- FEN-406 → **SL-106** (split de pagos, Nacho, IDLE/WAITING, 8 pts)
- FEN-405 → **SL-104** (rider técnico, Alan, IN REVIEW, 3 pts)
- FEN-409 → **SL-107** (historial pagos, Gian, WAITING on SL-105, 5 pts)

**CARD_DETAILS["SL-105"]:**
```javascript
{
  description: "Integrar Mercado Pago para procesar pagos entre venues y artistas",
  blockerReason: "La API de Mercado Pago LATAM usa una versión regional diferente a la documentación principal. Escribí al soporte técnico el día 4 y el día 5. Sin respuesta.",
  history: [
    "Día 4: David escribió al soporte de Mercado Pago",
    "Día 5: Sin respuesta. David no lo mencionó en el daily.",
    "Día 6: Simon pregunta por los pagos. El equipo no sabe que hay un blocker."
  ],
  impact: "13 puntos bloqueados + SL-107 de Gian en espera = 18 pts en riesgo (62% del sprint). Sin pagos, el Lollapalooza no puede usar Setlist."
}
```

**CHAT_TRIGGERS:**
- "on_board_view": narración + mensaje de Simon en WhatsApp
- "on_card_click_SL105": David finalmente explica el blocker
- "on_identify_blocker": reacción del equipo (Eric: "¿Por qué no lo dijiste antes?")
- "on_flag_wip": Eric dice "ya lo sabía, nadie quiso escuchar"
- "on_card_click_waiting": Gian menciona el edge case de SL-103

---

### EPISODIO 3 → challenge03.js (1-1 Coaching)
**Título:** "El costo de guardarlo todo"
**Sprint:** Sprint 3 · Día 8 · 1-1 con David

**SPRINT_CONTEXT:**
```
Después del caos del día 6, el SM pidió un 1-1 con David.
"Solo para ver cómo estás", le dijo.
David lleva 3 sprints llegando 10 minutos tarde al daily.
Sus PRs están más lentos. En la retro del Sprint 2 no habló nada.
SL-105 sigue bloqueado y es su ticket.
```

**Cambio en Challenge03.jsx — línea ~89:**
```javascript
// ANTES:
one_on_one: ["martin"],
// DESPUÉS:
one_on_one: ["david"],
```

**TEAM_MEMBER principal:** David (id: "david")

**INITIAL_CHARACTER_STATES:**
```javascript
{
  david: { mood: "guarded", trust: 2, openness: 1 },
  eric: { mood: "frustrated", trust: 3, openness: 2 },
  alan: { mood: "worried", trust: 3, openness: 3 }
}
```

**Arco de David en este challenge:**
No es burnout dramático. Es miedo a decepcionar. Siente que SL-105 es su responsabilidad
personal y que fallarlo es fallarle a todo el equipo. El SM tiene que crear el espacio
sin presionar, sin diagnosticar, sin convertirse en terapeuta.

**respondersMap actualizado:**
```javascript
{
  one_on_one: ["david"],
  sprint_impact: ["eric", "alan", "gabriela"],
  systemic: ["eric", "alan", "david", "nacho"],
  daily_standup: [],
  observation: []
}
```

---

### EPISODIO 4 → challenge04.js (Planning Poker)
**Título:** "Apostar con lo que hay"
**Sprint:** Sprint 3→4 · Sprint Planning

**SPRINT_CONTEXT:**
```
Setlist · Sprint Planning del Sprint 4.
Rodrigo — perdón, Simon — confirmó: si el Sprint 4 entrega pagos + contratos funcionando,
el Lollapalooza firma. Si no, buscan otra solución.
Gabriela quiere comprometer 44 puntos. La velocity real del equipo es 26.
```

**TEAM:** mismo equipo Setlist (reemplazar Gaby→Gabriela, Gianfranco→Gian, etc.)

**PBIS — historias de Setlist:**
```javascript
{ id: "SL-105", title: "Integración con Mercado Pago", points: 13, module: "Pagos" },
{ id: "SL-106", title: "Split automático de pago con manager", points: 8, module: "Pagos" },
{ id: "SL-107", title: "Historial de pagos y facturas", points: 5, module: "Pagos" },
{ id: "SL-108", title: "Perfil público del artista", points: 5, module: "Perfil" },
{ id: "SL-109", title: "Stats de carrera en el perfil", points: 8, module: "Perfil" },
{ id: "SL-110", title: "Sistema de reviews de venues", points: 8, module: "Perfil" },
{ id: "SL-103-fix", title: "Fix bug contratos en iOS (Gian)", points: 3, module: "Shows" },
{ id: "SL-104", title: "Upload rider técnico", points: 3, module: "Shows" },
// + 4 más opcionales para tener backlog amplio
```

**POKER_VOTES — bad behaviors con los personajes correctos:**
- **Gabriela:** vota siempre 1-2 puntos menos que todos ("¿No podemos ponerle 5? Si le ponemos 8 no entra en el sprint")
- **Nacho:** vota siempre optimista, 3 para tickets de 8 ("Yo lo hago en 2 días")
- **David:** copia el voto de Eric sin revelar su carta primero (anchoring)
- **Alan:** vota correcto pero en voz baja — nadie lo escucha de entrada
- **Eric:** vota correcto y confronta cuando hay dispersión grande
- **Gian:** insiste en agregar puntos de QA a cada estimación ("Eso es un 8 si no contamos el testing")

**EVENTS — bad behaviors a detectar:**
```javascript
[
  { trigger: "SL-105", character: "nacho", behavior: "Yo lo ayudo a David, juntos lo hacemos en 3 días. Ponele 5.", type: "time_vs_complexity" },
  { trigger: "SL-109", character: "gabriela", behavior: "¿No podemos ponerle 5? Si le ponemos 8 no entra en el sprint y Simon espera esto.", type: "po_pressure" },
  { trigger: "SL-106", character: "david", behavior: "[Muestra la misma carta que Eric antes de que todos revelen]", type: "anchoring" },
  { trigger: "SL-110", character: "gian", behavior: "Eso es un 8 si no contamos el tiempo de testing. Que siempre se ignora.", type: "qа_buffer" }
]
```

---

### EPISODIO 5 → challenge05.js (Presión de Velocidad)
**Título:** "Cuando el negocio empuja"
**Sprint:** Sprint 4 · Día 5

**SPRINT_CONTEXT:**
```
Setlist · Sprint 4 · Día 5 de 10.
El equipo está en buen ritmo. 14 de 26 puntos completados.
Y entonces Simon manda un mensaje nuevo:
"Hola Gabriela! El director artístico del Lolla también quiere el módulo de reviews
para el piloto. ¿Lo podemos incluir? Solo son unas reseñitas 😅"
SL-110 (reviews) son 8 puntos. El sprint ya tiene 26 comprometidos.
```

**STAKEHOLDERS:**
```javascript
{ id: "simon", name: "Simon", role: "Head of Artists · Lollapalooza", color: "#ef4444" }
```

**SPRINT_METRICS:**
```javascript
{
  sprint: 4,
  day: 5,
  committed: 26,
  completed: 14,
  inProgress: 8,
  blocked: 0,
  velocity_last_sprint: 22,
  velocity_sprint_before: 26
}
```

**MOMENTS:**
- Momento 1: Simon manda el mensaje. Gabriela quiere decir que sí.
- Momento 2: Eric dice que si meten SL-110, los pagos no salen. Tensión en el equipo.
- Momento 3: El SM tiene que decidir cómo responde a Simon — sin prometer lo imposible, sin perder el deal.
- Momento 4: Cierre — el equipo necesita saber que el SM los protegió.

---

### EPISODIO 6 → challenge06.js (Team Agreements)
**Título:** "Las reglas del juego"
**Sprint:** Post-Sprint 3 · Workshop convocado por Eric

**SPRINT_CONTEXT:**
```
Setlist · Workshop de team agreements.
Después del caos del Sprint 3, Eric pidió una reunión:
"Necesitamos acordar cómo trabajamos o no llegamos al Lolla."
El SM tiene 45 minutos con el equipo completo.
```

**TEAM_PROPOSALS — propuestas con los personajes correctos:**
```javascript
[
  { from: "eric", text: "Propongo que ningún PR se mergee sin al menos un reviewer. No importa la urgencia.", delay: 8000 },
  { from: "gian", text: "QA tiene derecho a bloquear un release si hay regresiones en funcionalidad crítica.", delay: 18000 },
  { from: "david", text: "Todo bloqueo de más de 1 día se escala al SM — sin excepciones. Lo digo por experiencia.", delay: 30000 },
  { from: "gabriela", text: "El PO puede proponer cambios de prioridad mid-sprint, pero el equipo vota si entra.", delay: 42000 },
  { from: "nacho", text: "¿Podemos acordar que las dependencias externas (como APIs de terceros) se investigan antes del sprint?", delay: 55000 },
  { from: "alan", text: "Me gustaría que después de cada retro haya una forma de dar feedback anónimo. Para los que no siempre hablan.", delay: 70000 }
]
```

**BOARD_SECTIONS:**
```javascript
["Ceremonies", "Definition of Done", "Communication", "Estimation", "Conflicts", "External dependencies"]
```

---

## 🔗 HILOS NARRATIVOS — referencias cruzadas

| Hilo | C1 | C2 | C3 | C4 | C5 | C6 |
|------|----|----|----|----|----|----|
| SL-105 bloqueado (David) | Mencionado | Ocurre | Se trabaja | Estimado | Resuelto | Regla nueva |
| La voz de Alan | No habla | Idea ignorada | SM le da espacio | Estima correcto | Presente | Propone algo |
| Simon / Lollapalooza | Contexto | Primer mensaje | Presión de fondo | Meta del sprint | Presión directa | Motivación |
| Eric vs proceso | Resistente | Confronta | Preocupado | Vota correcto | Protege al equipo | Propone DoD |
| Nacho over-commitment | Mencionado | WIP excedido | — | Sobreestima | — | Propone regla |
| Gian ignorado | Bug ignorado | Edge case | — | QA buffer | — | Derecho de veto |

---

## ⚠️ REGLAS — qué NO cambiar

1. **Los .jsx NO se tocan** salvo Challenge03.jsx línea ~89: `"martin"` → `"david"`
2. **Las dimensiones de evaluación NO cambian** — solo el contexto narrativo
3. **IDs exactos del equipo:** `"eric"`, `"david"`, `"alan"`, `"gian"`, `"gabriela"`, `"nacho"`
4. **Prefijo de tickets en todo el código:** cualquier FEN-XXX o NVM-XXX → SL-XXX
5. **MEMBER_MAP** debe incluir a simon en C2 y C5
6. **No agregar dependencias nuevas**

---

## ✅ ORDEN DE EJECUCIÓN

1. **challenge01.js** — referencia de estructura
2. **challenge02.js** — renombrar tickets y equipo
3. **challenge06.js** — proposals y board
4. **challenge04.js** — PBIs y poker votes
5. **challenge03.js** + cambio en Challenge03.jsx línea ~89
6. **challenge05.js** — stakeholders y métricas

Verificar con `npm run dev` después de cada uno.

---

## 🧪 CHECKLIST DE VERIFICACIÓN

Para cada challenge:
- [ ] `TEAM.map(m => m.id)` = `["eric","david","alan","gian","gabriela","nacho"]`
- [ ] No aparece ningún nombre viejo: Joaquín, Clara, Marcus, Mateo, Gaby, Gianfranco, Martin, Javier, Sofia, Marco, Aisha, Daniel, Priya, Tom
- [ ] No aparece ningún ticket FEN-XXX o NVM-XXX
- [ ] `SPRINT_CONTEXT` menciona Setlist y el número de sprint correcto
- [ ] `TEAM_DESC` usa el texto estándar de este documento
- [ ] `npm run dev` corre sin errores de consola

---

**Fin del documento.**
**Ante cualquier duda sobre la narrativa, referirse al CLAUDE.md en la raíz del proyecto.**
