import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

// ─── Guardar resultado de un challenge ───
export async function saveResult({ candidateId, challengeId, scores, feedback, grade, timeUsed }) {
  const { data, error } = await supabase
    .from('challenge_results')
    .insert({
      candidate_id: candidateId,
      challenge_id: challengeId,
      scores,
      feedback,
      grade,
      time_used: timeUsed,
      played_at: new Date().toISOString(),
    })
    .select()

  if (error) console.error('Error guardando resultado:', error)
  return { data, error }
}

// ─── Obtener resultados de un candidato ───
export async function getResults(candidateId) {
  const { data, error } = await supabase
    .from('challenge_results')
    .select('*')
    .eq('candidate_id', candidateId)
    .order('played_at', { ascending: true })

  if (error) console.error('Error obteniendo resultados:', error)
  return { data, error }
}

// ─── Perfil del candidato (insights, uso de IA, historial cross-challenge) ───
export async function saveProfile(candidateId, profile) {
  if (!candidateId) return { error: "no candidateId" }
  const { error } = await supabase
    .from("candidate_profiles")
    .upsert(
      {
        candidate_id: candidateId,
        insights: profile.insights || {},
        challenge_history: profile.challenge_history || [],
        communication_style: profile.communication_style || null,
        ai_coach_usage: profile.ai_coach_usage || { interactions: [], total_calls: 0 },
        updated_at: new Date().toISOString(),
      },
      { onConflict: "candidate_id" }
    )
  if (error) console.error("Error guardando perfil:", error.message)
  return { error }
}

export async function getProfileRow(candidateId) {
  if (!candidateId) return { data: null }
  const { data, error } = await supabase
    .from("candidate_profiles")
    .select("insights, challenge_history, communication_style, ai_coach_usage")
    .eq("candidate_id", candidateId)
    .maybeSingle()
  if (error) console.error("Error obteniendo perfil:", error.message)
  return { data, error }
}

// ─── Obtener todos los resultados (para recruiters) ───
export async function getAllResults() {
  const { data, error } = await supabase
    .from('challenge_results')
    .select('*')
    .order('played_at', { ascending: false })

  if (error) console.error('Error obteniendo resultados:', error)
  return { data, error }
}
