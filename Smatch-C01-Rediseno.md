# Challenge 01 — Rediseño (Kickoff & Planning)

> Spec corto para implementar. Principio rector: **menos texto, más decisión.** El candidato cura y sintetiza, no lee tutoriales.

---

## Parte 1 — Team Agreements: una pantalla por acuerdo

3 pantallas, una por tema: **Comunicación · Definition of Ready · Cómo estimamos.** Cada pantalla es igual:

- **Arriba:** la pregunta en 1 línea. Sin explicación extra.
- **Centro (muro de sugerencias):** 6–8 tarjetas del equipo, cada una con autor. **Algunas se contradicen** entre sí y **algunas son ruido / anti-patrón** mezcladas a propósito.
- **Tarea del candidato:** elegir (arrastrar/clickear) las que entran al acuerdo → zona **"Nuestro acuerdo"**, descartar el resto, y **escribir el acuerdo final** (puede combinar dos contradictorias en una síntesis). Avanza al siguiente.

**Qué evalúa esta mecánica (mejor que la actual):**
- Discernimiento: distinguir aporte real del equipo vs ruido/anti-patrón.
- Síntesis: reconciliar lo contradictorio en un acuerdo único.
- Calidad: que el acuerdo (sobre todo DoR) tenga criterios concretos.

### Tarjetas por pantalla

**Comunicación** — _"¿Cómo y cuándo se comunica el equipo?"_
- Eric: "Slack a cualquier hora, si no urge no respondo." ⟷ contradice ↓
- Alan: "Horario fijo 10–18. Después no respondo."
- Gabriela: "Si es urgente, llamada directa."
- Gian: "Lo no-urgente va al daily, no a Slack."
- _ruido:_ "Reunión diaria de 1h para alinear." (anti-patrón)
- _ruido:_ "Todo por mail formal." (no aplica al equipo)

> Síntesis esperada (ejemplo): async por defecto, horario core 10–18, urgencias por llamada, lo no-urgente al daily.

**Definition of Ready** — _"¿Cuándo un PBI está listo para entrar al sprint?"_
- Gian: "Criterios de aceptación escritos."
- Eric: "Estimado en story points por el equipo."
- David: "Dependencias externas identificadas."
- Alan: "Mockup/wireframe si es UI."
- Gabriela: "Aprobado por PO sin scope creep oculto."
- _ruido:_ "El PO decide solo, sin el equipo." (anti-patrón)

**Cómo estimamos** — _"¿Story points u horas? ¿Quién vota?"_
- Eric: "Story points relativos." ⟷ contradice ↓
- Nacho: "Estimamos en horas, es más directo."
- Gian: "Voto secreto, después discusión."
- Alan: "Si hay desacuerdo, los extremos explican primero."
- David: "Estima quien va a hacer la tarea."
- _ruido:_ "El más senior decide la estimación." (anti-patrón)

---

## Parte 2 — Estimación: conversación en pestaña aparte

El problema actual: los globos de texto del equipo aparecen inline y se pierde el hilo de la estimación. Solución: **separar trabajo y conversación.**

- **Zona principal:** el PBI en discusión + Planning Poker (cartas y votos). Acá pasa el trabajo de estimar.
- **Panel/pestaña lateral "Equipo":** la conversación viva (preguntas de Nacho, anclaje de Alan, presión de Gabriela por fecha) con **badge de mensajes nuevos**. El SM responde desde ahí.
- La conversación **no interrumpe** el board. Se sigue el hilo en su pestaña.

---

## Qué se recorta (menos texto en todo)

- Tooltips y textos explicativos largos → al mínimo. La contradicción y el ruido **son** la lección; no hay que explicarlos.
- **Dock de herramientas: de 8 a 3** (Planning Poker, Rel vs Abs, MoSCoW). El resto se va.
- Globos inline durante la estimación → reemplazados por la pestaña "Equipo".

---

## Resumen del flujo nuevo

`context (1 pantalla corta) → acuerdo 1 → acuerdo 2 → acuerdo 3 → estimación (board + pestaña Equipo) → results`
