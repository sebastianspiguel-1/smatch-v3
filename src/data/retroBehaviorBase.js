// ═══════════════════════════════════════════════════════════════════
// BASE DE COMPORTAMIENTOS — Retro (C05)  ·  PROTOTIPO del motor
// ───────────────────────────────────────────────────────────────────
// Idea: la IA NO improvisa la conversación entera. Solo CLASIFICA lo que
// dice el SM en un "intent" (un movimiento de facilitación). De ahí en
// adelante, la respuesta del equipo, el cambio de estado y el puntaje
// salen de ACÁ (determinístico) → misma vara para todos los candidatos.
//
// 3 piezas:
//   1. INTENTS         → taxonomía finita de movimientos del SM (para el clasificador)
//   2. INTENT_SCORES   → qué dimensiones premia/penaliza cada movimiento (el score)
//   3. MEMBER_BEHAVIORS→ cómo responde cada personaje según su estado actual
// ═══════════════════════════════════════════════════════════════════

// ─── 1. Taxonomía de intents (lo que el clasificador puede devolver) ───
export const INTENTS = [
  { id: "invite_voice", label: "Invitar a una voz callada", desc: "Le pregunta DIRECTO a alguien que no está hablando (típico: Eric, David, Gian). Ej: 'Eric, ¿vos qué viste?'." },
  { id: "redirect_dominant", label: "Redirigir al que domina", desc: "Frena con tacto a quien acapara o apura el cierre (típico: Gabriela, Nacho). Ej: 'Gaby, antes de cerrar, quiero escuchar al resto'." },
  { id: "name_tension", label: "Nombrar una tensión sin culpar", desc: "Pone sobre la mesa algo incómodo (entrega tardía, bug ignorado, scope creep en comentarios) SIN señalar a una persona como culpable." },
  { id: "blame", label: "Acusar / exponer a alguien", desc: "Señala a una persona puntual como responsable o la pone en evidencia. Ej: 'Nacho, vos entregaste tarde y nos frenaste'." },
  { id: "jump_solution", label: "Saltar a la solución", desc: "Propone arreglos o action items ANTES de entender qué pasó." },
  { id: "create_safety", label: "Crear seguridad / validar", desc: "Reconoce, normaliza, agradece, baja la guardia. Ej: 'Tranquilos, esto es para mejorar, no para buscar culpables'." },
  { id: "probe_deeper", label: "Profundizar con pregunta abierta", desc: "Pregunta abierta que invita a ir más hondo sin dirigir la respuesta. Ej: '¿Qué hizo que eso pasara?'." },
  { id: "ask_action", label: "Pedir compromiso / action item", desc: "Pide acordar un próximo paso concreto, idealmente con dueño." },
  { id: "rush_close", label: "Cerrar rápido / quedarse en la superficie", desc: "Acepta el 'salió todo bien' y cierra sin profundizar." },
  { id: "encourage", label: "Animar a seguir / dar pie", desc: "Le da pie a quien está hablando para que siga o amplíe. Ej: 'dale, contame más', 'compartilo', 'seguí'." },
  { id: "smalltalk", label: "Genérico / sin movimiento claro", desc: "Comentario neutro que no es una jugada de facilitación clara." },
]

// ─── 2. Score por intent (1-4 por dimensión; se acumula en allScores) ───
// Es el corazón de la consistencia: el puntaje se ata al MOVIMIENTO, no a las palabras.
export const INTENT_SCORES = {
  invite_voice:      { facilitation: 4, safety: 3 },
  redirect_dominant: { facilitation: 4 },
  name_tension:      { facilitation: 4, safety: 3, systems_thinking: 3 },
  blame:             { safety: 1, facilitation: 2 },
  jump_solution:     { facilitation: 2, process: 2 },
  create_safety:     { safety: 4, facilitation: 3 },
  probe_deeper:      { facilitation: 4, systems_thinking: 3 },
  ask_action:        { process: 4 },
  rush_close:        { facilitation: 1, process: 1 },
  encourage:         { facilitation: 3, safety: 2 },
  smalltalk:         {},
}

// ─── 3. Comportamiento por miembro ───
// Cada miembro: estado inicial + tells (no-verbal por estado) + reactions[intent].
// reactions[intent] = {
//   variants: [textos posibles],   // diversidad: el engine elige uno
//   to: nuevoEstado,               // transición (opcional)
//   reveal: "tensionId",           // desbloquea tensión latente (opcional)
//   directedOnly: true,            // SOLO reacciona si el SM lo dirigió a él
//   ambient: true,                 // reacciona aunque no se lo dirijan (presión de sala)
// }
export const MEMBER_BEHAVIORS = {
  eric: {
    default: "withdrawn",
    tells: { withdrawn: "🙄 mira el teléfono", warming: "🤨 levanta la vista", engaged: "🤔 se endereza en la silla" },
    reactions: {
      invite_voice: {
        directedOnly: true, to: "engaged", reveal: "eric_silence",
        variants: [
          "Duda un segundo. 'Ya que preguntás… hay varias cosas de este sprint que no comparto. Me las callo porque cuando opino se arma quilombo.'",
          "'Mirá, te soy honesto: prefiero callarme antes que generar roce. Pero no, no estuvo todo tan redondo.'",
        ],
      },
      create_safety: { to: "warming", variants: ["Afloja un poco los hombros, pero todavía no suelta nada."] },
      blame: { variants: ["Frunce el ceño y se cierra más. Esto no le gusta."] , to: "withdrawn" },
      encourage: { to: "engaged", reveal: "eric_silence", variants: [
        "'Mirá… el bug que avisó Gian y nadie priorizó. Los cambios de alcance que aparecen en comentarios y nadie marca. Son cosas que suman bronca y nadie las dice.'",
        "'No es algo puntual. Cuando algo no va, lo charlamos por afuera en vez de ponerlo acá. Y así se va pudriendo.'",
      ]},
    },
  },

  gabriela: {
    default: "celebrating",
    tells: { celebrating: "👏 sonríe, quiere cerrar", redirected: "😬 baja un cambio", engaged: "🙂 presta atención" },
    reactions: {
      rush_close: { ambient: true, variants: [
        "'Bueno, ¿cerramos? Fue un gran sprint, no le busquemos la quinta pata.'",
        "'Para mí está, salió todo bien. ¿Pasamos a la próxima?'",
      ]},
      encourage: { variants: ["'Y… para mí lo importante es que entregamos un montón. Pero bueno, te escucho.'"] },
      redirect_dominant: { directedOnly: true, to: "redirected", variants: [
        "'Ok, ok, tenés razón. Escuchemos al resto.'",
        "Levanta las manos. 'Dale, me callo. Que hablen los demás.'",
      ]},
      name_tension: { variants: ["Se pone un poco a la defensiva: '¿Lo de los cambios de alcance lo decís por mí?' — pero te escucha."] },
    },
  },

  gian: {
    default: "frustrated_quiet",
    tells: { frustrated_quiet: "😤 cruza los brazos", venting: "😮‍💨 suelta lo que tenía guardado", engaged: "🙂 más suelto" },
    reactions: {
      probe_deeper: { to: "venting", reveal: "gian_bug", variants: [
        "Respira hondo. '¿Querés saber? El bug de SL-107 lo reporté en el planning y nadie lo priorizó. Después rebotó dos veces y quedé yo como el que frena todo.'",
      ]},
      invite_voice: { directedOnly: true, to: "venting", reveal: "gian_bug", variants: [
        "Descruza los brazos. 'Ya que preguntás… el bug que rebotó lo había avisado en el planning. Me re calentó que lo ignoraran y no dije nada.'",
      ]},
      name_tension: { to: "venting", reveal: "gian_bug", variants: [
        "Asiente fuerte. 'Eso. Y de paso: el bug que rebotó lo avisé en el planning. Nadie lo priorizó.'",
      ]},
      create_safety: { to: "engaged", variants: ["Afloja los brazos. Algo se destrabó."] },
      encourage: { to: "venting", reveal: "gian_bug", variants: [
        "'Lo avisé en el planning, quedó en la nada, y cuando rebotó en QA el lento fui yo. Me la banco, pero molesta.'",
      ]},
    },
  },

  nacho: {
    default: "defensive",
    tells: { defensive: "😅 sonríe nervioso", shutdown: "😶 se cierra, mira la mesa", open: "🙏 agradecido, baja la guardia" },
    reactions: {
      blame: { directedOnly: true, to: "shutdown", variants: [
        "Se pone colorado y mira la mesa. 'Sí, bueno… ya está, no sé qué querés que diga.'",
        "Se tensa. 'Perdón, ¿estamos buscando culpables ahora?' — y no habla más.",
      ]},
      create_safety: { to: "open", variants: ["Afloja. 'Gracias por decirlo así. Me estaba haciendo el bola, la verdad.'"] },
      name_tension: { to: "open", reveal: "nacho_late", variants: [
        "Traga saliva. 'Ok… la entrega tardía fue mía. Me trabé y me dio vergüenza pedir ayuda siendo el nuevo. Alan me cubrió y ni se lo agradecí.'",
      ]},
      probe_deeper: { variants: ["Se rasca la nuca. 'Eeh… sí, hubo un par de cosas que no salieron como esperaba.'"] },
      encourage: { to: "open", reveal: "nacho_late", variants: [
        "'Y… me trabé con el link y no avisé a tiempo. Me dio cosa pedir ayuda recién entrando. Alan me bancó y ni gracias le dije.'",
      ]},
    },
  },

  david: {
    default: "reserved",
    tells: { reserved: "😐 escucha, callado", engaged: "🙂 aporta" },
    reactions: {
      invite_voice: { directedOnly: true, to: "engaged", variants: [
        "Medido: 'Para mí lo que más nos frenó fue la falta de doc central. Cada feature compleja terminó en carry-over.'",
      ]},
      probe_deeper: { variants: ["Asiente y suma un dato técnico, sin dramatizar."] },
      encourage: { to: "engaged", variants: ["'Lo que más nos frenó fue la falta de doc central. Cada feature compleja terminó en carry-over por eso.'"] },
    },
  },

  alan: {
    default: "tired_helpful",
    tells: { tired_helpful: "🙂 cansado pero presente", engaged: "🙂 se prende" },
    reactions: {
      invite_voice: { directedOnly: true, to: "engaged", variants: [
        "'Yo banco lo que dijo David. Y cubrí algunas cosas que no estaban en mi cancha, pero bueno, es lo que hay.'",
      ]},
      create_safety: { variants: ["Sonríe un poco, agradecido de que se note el laburo invisible."] },
      encourage: { to: "engaged", variants: ["Medio tímido: 'Cubrí un par de cosas que no eran mías y no lo dije. Pero bueno, salió.'"] },
    },
  },
}

// Estado inicial de la sala (deriva de los defaults).
export function initialMemberStates() {
  const s = {}
  for (const [id, b] of Object.entries(MEMBER_BEHAVIORS)) s[id] = b.default
  return s
}
