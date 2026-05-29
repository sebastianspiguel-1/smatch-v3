// Progress Tracker para challenges
// Mantiene track de qué challenges se completaron y en qué orden

const STORAGE_KEY = "smatch_challenge_progress"

// Challenge order — Sprint 1 cronológico
// C01 (Day 1 Planning) → C02 (Day 3 1-1 Alan) → C03 (Day 5 Daily) → C04 (Day 7 Paula) → C05 (Day 10 Retro)
export const CHALLENGE_ORDER = [1, 2, 3, 4, 5]

// Get progress from localStorage
export function getProgress() {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    return {
      completed: [], // Array de challengeFile numbers completados
      currentIndex: 0, // Índice en CHALLENGE_ORDER del siguiente challenge
      startedAt: null,
      lastCompletedAt: null
    }
  }
  return JSON.parse(stored)
}

// Mark challenge as completed
export function markChallengeComplete(challengeFile) {
  const progress = getProgress()

  // Si es el primer challenge, guardar timestamp de inicio
  if (progress.completed.length === 0) {
    progress.startedAt = new Date().toISOString()
  }

  // Agregar a completed si no está ya
  if (!progress.completed.includes(challengeFile)) {
    progress.completed.push(challengeFile)
    progress.lastCompletedAt = new Date().toISOString()

    // Avanzar currentIndex
    const index = CHALLENGE_ORDER.indexOf(challengeFile)
    if (index !== -1 && index === progress.currentIndex) {
      progress.currentIndex = index + 1
    }
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  return progress
}

// Check if a challenge is completed
export function isChallengeCompleted(challengeFile) {
  const progress = getProgress()
  return progress.completed.includes(challengeFile)
}

// Check if a challenge is unlocked (can be played)
export function isChallengeUnlocked(challengeFile) {
  const progress = getProgress()

  // Si ya está completado, no se puede repetir (queda locked)
  if (progress.completed.includes(challengeFile)) return false

  // Todos los challenges están desbloqueados desde el inicio
  return true
}

// Get next challenge file number
export function getNextChallenge(currentChallengeFile) {
  const currentIndex = CHALLENGE_ORDER.indexOf(currentChallengeFile)
  if (currentIndex < CHALLENGE_ORDER.length - 1) {
    return CHALLENGE_ORDER[currentIndex + 1]
  }
  return null // Es el último
}

// Check if current challenge is the last one
export function isLastChallenge(challengeFile) {
  return challengeFile === CHALLENGE_ORDER[CHALLENGE_ORDER.length - 1]
}

// Get completion percentage
export function getCompletionPercentage() {
  const progress = getProgress()
  return Math.round((progress.completed.length / CHALLENGE_ORDER.length) * 100)
}

// Reset progress (for testing or retry)
export function resetProgress() {
  localStorage.removeItem(STORAGE_KEY)
}

// Get total completed count
export function getCompletedCount() {
  const progress = getProgress()
  return progress.completed.length
}
