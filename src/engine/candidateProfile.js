// ═══════════════════════════════════════════════════
// CANDIDATE PROFILE SERVICE
// ═══════════════════════════════════════════════════
//
// Mantiene un perfil dinámico del candidato que persiste entre challenges.
// Captura insights, patrones de comunicación, y uso del AI Coach.
//
// Para el PoC: storage en localStorage.
// Para el MVP: migrar a Supabase con este schema:
//
//   CREATE TABLE candidate_profiles (
//     candidate_id TEXT PRIMARY KEY,
//     insights JSONB DEFAULT '{}'::jsonb,
//     challenge_history JSONB DEFAULT '[]'::jsonb,
//     communication_style TEXT,
//     ai_coach_usage JSONB DEFAULT '{"interactions": [], "total_calls": 0}'::jsonb,
//     created_at TIMESTAMPTZ DEFAULT NOW(),
//     updated_at TIMESTAMPTZ DEFAULT NOW()
//   );
//
// ═══════════════════════════════════════════════════

const STORAGE_PREFIX = "smatch_profile_"

// Default empty profile
function emptyProfile(candidateId) {
  return {
    candidate_id: candidateId,
    insights: {
      patterns: [],         // ej: ["directive", "empathic", "ignores_quiet_voices"]
      strengths: [],        // ej: ["systems_thinking", "psychological_safety"]
      weaknesses: [],       // ej: ["stakeholder_management", "low_empathy"]
      notable_moments: [],  // ej: [{ challenge: "C02", note: "Detectó WIP overflow temprano" }]
    },
    challenge_history: [],  // [{ challenge: "C02", completed_at: "...", summary: "..." }]
    communication_style: null, // "directive" | "empathic" | "analytical" | "balanced"
    ai_coach_usage: {
      interactions: [],     // [{ challenge, sm_question, coach_response, timestamp, copy_pasted: bool }]
      total_calls: 0,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

// ─── Get profile (creates if doesn't exist) ───
export function getProfile(candidateId) {
  if (!candidateId) return emptyProfile("anonymous")
  const key = STORAGE_PREFIX + candidateId
  const stored = localStorage.getItem(key)
  if (!stored) {
    const empty = emptyProfile(candidateId)
    localStorage.setItem(key, JSON.stringify(empty))
    return empty
  }
  return JSON.parse(stored)
}

// ─── Update profile (deep merge for insights, append for arrays) ───
export function updateProfile(candidateId, partial) {
  const current = getProfile(candidateId)
  const updated = {
    ...current,
    ...partial,
    insights: {
      ...current.insights,
      ...(partial.insights || {}),
      // Append-only arrays (de-duplicated)
      patterns: dedupe([...(current.insights.patterns || []), ...((partial.insights || {}).patterns || [])]),
      strengths: dedupe([...(current.insights.strengths || []), ...((partial.insights || {}).strengths || [])]),
      weaknesses: dedupe([...(current.insights.weaknesses || []), ...((partial.insights || {}).weaknesses || [])]),
      notable_moments: [
        ...(current.insights.notable_moments || []),
        ...((partial.insights || {}).notable_moments || []),
      ],
    },
    challenge_history: [
      ...(current.challenge_history || []),
      ...(partial.challenge_history || []),
    ],
    updated_at: new Date().toISOString(),
  }
  localStorage.setItem(STORAGE_PREFIX + candidateId, JSON.stringify(updated))
  return updated
}

// ─── Log AI Coach interaction ───
export function logAICoachUsage(candidateId, interaction) {
  const current = getProfile(candidateId)
  const updated = {
    ...current,
    ai_coach_usage: {
      total_calls: (current.ai_coach_usage.total_calls || 0) + 1,
      interactions: [
        ...(current.ai_coach_usage.interactions || []),
        {
          ...interaction,
          timestamp: new Date().toISOString(),
        },
      ],
    },
    updated_at: new Date().toISOString(),
  }
  localStorage.setItem(STORAGE_PREFIX + candidateId, JSON.stringify(updated))
  return updated
}

// ─── Build AI context string to inject in prompts ───
// Devuelve un string para incluir en system prompts. Si el profile está vacío,
// retorna un placeholder neutral (primer challenge del candidato).
export function buildAIContextString(candidateId) {
  const profile = getProfile(candidateId)
  const { insights, challenge_history, communication_style, ai_coach_usage } = profile

  // Si es el primer challenge del candidato, retornar placeholder
  if ((challenge_history || []).length === 0 &&
      (insights.patterns || []).length === 0) {
    return `[PERFIL DEL CANDIDATO]\nEs su primer challenge. Sin patrones previos detectados.`
  }

  const parts = ["[PERFIL DEL CANDIDATO]"]

  if (communication_style) {
    parts.push(`Estilo de comunicación: ${communication_style}`)
  }
  if ((insights.patterns || []).length > 0) {
    parts.push(`Patrones detectados: ${insights.patterns.join(", ")}`)
  }
  if ((insights.strengths || []).length > 0) {
    parts.push(`Fortalezas: ${insights.strengths.join(", ")}`)
  }
  if ((insights.weaknesses || []).length > 0) {
    parts.push(`Áreas de oportunidad: ${insights.weaknesses.join(", ")}`)
  }
  if ((insights.notable_moments || []).length > 0) {
    parts.push("Momentos notables previos:")
    insights.notable_moments.slice(-5).forEach(m => {
      parts.push(`  - ${m.challenge}: ${m.note}`)
    })
  }
  if (ai_coach_usage.total_calls > 0) {
    parts.push(`Uso del AI Coach: ${ai_coach_usage.total_calls} consultas`)
  }
  if ((challenge_history || []).length > 0) {
    parts.push(`Challenges completados: ${challenge_history.map(c => c.challenge).join(", ")}`)
  }

  return parts.join("\n")
}

// ─── Reset (testing / dev) ───
export function resetProfile(candidateId) {
  localStorage.removeItem(STORAGE_PREFIX + candidateId)
}

// ─── Helpers ───
function dedupe(arr) {
  return [...new Set(arr)]
}

// ─── Default candidate ID (para PoC sin auth) ───
export const DEFAULT_CANDIDATE_ID = "test@test.com"
