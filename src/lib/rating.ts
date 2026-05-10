import prisma from './db'

const DIFF_INDEX: Record<string, number> = {
  'EASY': 1,
  'MEDIUM': 2,
  'HARD': 3,
  'SUPER_HARD': 4
}

/**
 * Pillar 1: Intensity Vector (Peak Performance)
 * AP = (WPM * (Acc/100)^4 * (Perc/100) * sqrt(Chars/100)) * ln(1 + DiffIndex * 2)
 */
/**
 * Pillar 1: Intensity Vector (Peak Performance)
 * AP = (WPM * (Acc/100)^4 * (Perc/100)) * (1 + ln(DiffIndex))
 */
export async function calculateSingleAttemptPower(challengeId: string, wpm: number, accuracy: number) {
  const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } })
  if (!challenge) return 0

  const [betterThan, total] = await Promise.all([
    prisma.attempt.count({ where: { challengeId, wpm: { lt: wpm } } }),
    prisma.attempt.count({ where: { challengeId } })
  ])
  const perc = total <= 1 ? 100 : (betterThan / (total - 1)) * 100

  const acc = accuracy / 100
  const diffIndex = DIFF_INDEX[challenge.difficulty] || 1
  
  // High-fidelity intensity without length spikes
  const intensity = wpm * Math.pow(acc, 4) * (perc / 100)
  const diffMultiplier = 1 + Math.log(diffIndex)
  
  return intensity * diffMultiplier
}

/**
 * The Titan Engine (MVAR-15) - Production Optimized
 * Instead of re-calculating all percentiles, we use the stored ratingChange (Power Score)
 */
export async function calculateUserRating(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { 
      attempts: { 
        select: { 
          ratingChange: true, 
          wpm: true, 
          timeSeconds: true, 
          completedAt: true,
          challenge: { select: { difficulty: true } }
        },
        orderBy: { ratingChange: 'desc' }
      }
    }
  })

  if (!user || user.attempts.length === 0) return 0

  const attempts = user.attempts
  const totalAttempts = attempts.length
  
  // Use pre-calculated Power Scores (stored in ratingChange)
  // This avoids the N*2 query problem that causes connection pool timeouts
  const sortedPowers = attempts
    .map(a => a.ratingChange || 0)
    .sort((a, b) => b - a)
    .slice(0, 30)

  let skillIndex = 0
  sortedPowers.forEach((p, i) => {
    skillIndex += p * Math.pow(0.75, i)
  })

  // --- Parameter Gathering (Optimized) ---
  const uniqueChallengesCount = await prisma.attempt.groupBy({
    by: ['challengeId'],
    where: { userId },
    _count: true
  }).then(res => res.length)

  const nHard = attempts.filter(a => a.challenge.difficulty === 'HARD').length
  const nSuper = attempts.filter(a => a.challenge.difficulty === 'SUPER_HARD').length
  const totalTimeSeconds = attempts.reduce((acc, a) => acc + (a.timeSeconds || 0), 0)
  
  const wpms = attempts.map(a => a.wpm)
  const meanWpm = wpms.reduce((a, b) => a + b, 0) / totalAttempts
  const stdDev = Math.sqrt(wpms.reduce((a, b) => a + Math.pow(b - meanWpm, 2), 0) / totalAttempts)
  const consistency = 1 - (stdDev / (meanWpm || 1))

  const recentAttempts = [...attempts].sort((a, b) => 
    new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  ).slice(0, 10)
  const recentAvgWpm = recentAttempts.reduce((a, b) => a + b.wpm, 0) / (recentAttempts.length || 1)

  // --- Pillar 2: Saturation ---
  const vs = (20 * Math.log(1 + uniqueChallengesCount)) + 
             (10 * Math.sqrt(nHard)) + 
             (15 * Math.pow(nSuper, 0.5)) + 300

  // --- Pillar 3: Mechanical ---
  const vm = (user.topWpm * 0.25) + (user.averageWpm * 0.05) + (50 * consistency) + 300

  // --- Pillar 4: Momentum ---
  const vt = Math.sqrt(totalTimeSeconds / 3600) * 3 + (recentAvgWpm - user.averageWpm) * 0.1

  // --- Final Aggregation ---
  const tr = (skillIndex * 3.5) + vs + vm + vt
  
  return Math.max(0, tr)
}

/** Legacy placeholder */
export async function calculateAttemptScore(challengeId: string, wpm: number, accuracy: number, difficulty: string) {
  return 0 // No longer used as a standalone return
}

export async function updateChallengeDifficulty(challengeId: string) {
  return 1.0 
}
