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
export async function calculateSingleAttemptPower(challengeId: string, wpm: number, accuracy: number) {
  const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } })
  if (!challenge) return 0

  const [betterThan, total] = await Promise.all([
    prisma.attempt.count({ where: { challengeId, wpm: { lt: wpm } } }),
    prisma.attempt.count({ where: { challengeId } })
  ])
  const perc = total <= 1 ? 100 : (betterThan / (total - 1)) * 100

  const acc = accuracy / 100
  const chars = challenge.content.length
  const diffIndex = DIFF_INDEX[challenge.difficulty] || 1
  
  const intensity = wpm * Math.pow(acc, 4) * (perc / 100) * Math.sqrt(chars / 100)
  const diffPower = Math.log(1 + diffIndex * 2)
  
  return intensity * diffPower
}

/**
 * The Titan Engine (MVAR-15)
 */
export async function calculateUserRating(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { 
      attempts: { 
        include: { challenge: true },
        orderBy: { wpm: 'desc' }
      }
    }
  })

  if (!user || user.attempts.length === 0) return 0

  // --- Parameter Gathering ---
  const attempts = user.attempts
  const totalAttempts = attempts.length
  const uniqueChallenges = new Set(attempts.map(a => a.challengeId)).size
  const nHard = attempts.filter(a => a.challenge.difficulty === 'HARD').length
  const nSuper = attempts.filter(a => a.challenge.difficulty === 'SUPER_HARD').length
  const totalTimeSeconds = attempts.reduce((acc, a) => acc + (a.timeSeconds || 0), 0)
  const topWpm = user.topWpm || 0
  const avgWpm = user.averageWpm || 0
  
  // Consistency Calculation (StdDev proxy)
  const wpms = attempts.map(a => a.wpm)
  const meanWpm = wpms.reduce((a, b) => a + b, 0) / totalAttempts
  const variance = wpms.reduce((a, b) => a + Math.pow(b - meanWpm, 2), 0) / totalAttempts
  const stdDev = Math.sqrt(variance)
  const consistency = 1 - (stdDev / (meanWpm || 1))

  // Recent Trend (Last 10)
  const recentAttempts = [...attempts].sort((a, b) => 
    new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  ).slice(0, 10)
  const recentAvgWpm = recentAttempts.reduce((a, b) => a + b.wpm, 0) / (recentAttempts.length || 1)

  // --- Pillar 1: Intensity Vector ---
  // We need percentiles for each attempt. For the backfill/calc, we'll use a cached/fast approach.
  const attemptPowers = await Promise.all(attempts.map(async (a) => {
    // For performance in big calculations, we'll simplify percentile slightly here
    // or fetch it if needed. Let's fetch for accuracy.
    const [betterThan, total] = await Promise.all([
      prisma.attempt.count({ where: { challengeId: a.challengeId, wpm: { lt: a.wpm } } }),
      prisma.attempt.count({ where: { challengeId: a.challengeId } })
    ])
    const perc = total <= 1 ? 100 : (betterThan / (total - 1)) * 100
    
    // Inline calculation logic to match calculateSingleAttemptPower but with pre-fetched data
    const acc = (a.trueAccuracy ?? a.accuracy) / 100
    const chars = a.challenge.content.length
    const diffIndex = DIFF_INDEX[a.challenge.difficulty] || 1
    const intensity = a.wpm * Math.pow(acc, 4) * (perc / 100) * Math.sqrt(chars / 100)
    const diffPower = Math.log(1 + diffIndex * 2)
    return intensity * diffPower
  }))

  const sortedPowers = attemptPowers.sort((a, b) => b - a)
  let skillIndex = 0
  sortedPowers.forEach((p, i) => {
    skillIndex += p * Math.pow(0.85, i)
  })

  // --- Pillar 2: Saturation Vector (Diminishing Experience) ---
  const vs = (30 * Math.log(1 + uniqueChallenges)) + 
             (15 * Math.sqrt(nHard)) + 
             (25 * Math.pow(nSuper, 0.6))

  // --- Pillar 3: Mechanical Identity ---
  const vm = (topWpm * 0.3) + (avgWpm * 0.1) + (100 * consistency)

  // --- Pillar 4: Momentum Vector ---
  const vt = Math.sqrt(totalTimeSeconds / 3600) * 5 + (recentAvgWpm - avgWpm) * 0.2

  // --- Final Aggregation ---
  // Calibrated for Magnus = 3500, Above Average = 2000-2500
  const tr = (skillIndex * 1.8) + vs + vm + vt
  
  return Math.max(0, tr * 2.8)
}

/** Legacy placeholder */
export async function calculateAttemptScore(challengeId: string, wpm: number, accuracy: number, difficulty: string) {
  return 0 // No longer used as a standalone return
}

export async function updateChallengeDifficulty(challengeId: string) {
  return 1.0 
}
