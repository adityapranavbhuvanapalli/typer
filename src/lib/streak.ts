/**
 * Calculates the effective current streak for a user.
 * A streak is considered active if the last daily challenge was completed 
 * either today or yesterday (in UTC).
 */
export function getEffectiveStreak(user: { currentStreak: number; lastDailyDate: Date | null }): number {
  if (!user.lastDailyDate || user.currentStreak === 0) {
    return 0;
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const lastDailyStr = new Date(user.lastDailyDate).toISOString().split('T')[0];

  // If they did it today, the streak is definitely active and current.
  if (todayStr === lastDailyStr) {
    return user.currentStreak;
  }

  const lastDailyTime = new Date(lastDailyStr + "T00:00:00.000Z").getTime();
  const todayTime = new Date(todayStr + "T00:00:00.000Z").getTime();
  
  // Difference in full days
  const daysDiff = Math.floor((todayTime - lastDailyTime) / (1000 * 60 * 60 * 24));

  // If daysDiff is 1, it means they did it yesterday. The streak is still "active"
  // (they have until the end of today to complete the next one).
  if (daysDiff <= 1) {
    return user.currentStreak;
  }

  // Otherwise, the streak is broken.
  return 0;
}
