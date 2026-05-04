import { ref, get, set, onValue, off } from 'firebase/database'
import { db } from './firebase'

export interface StreakData {
  startDate: string
  resetAt?: string
}

export function subscribeStreak(coupleId: string, callback: (data: StreakData | null) => void) {
  const streakRef = ref(db, `couples/${coupleId}/streak`)
  onValue(streakRef, (snap) => {
    callback(snap.val() as StreakData | null)
  })
  return () => off(streakRef, 'value')
}

export async function setStreakStart(coupleId: string, startDate: string): Promise<void> {
  const streakRef = ref(db, `couples/${coupleId}/streak`)
  const snap = await get(streakRef)
  const current = snap.val() as StreakData | null
  await set(streakRef, { ...current, startDate })
}

export async function resetStreak(coupleId: string): Promise<void> {
  const now = new Date().toISOString()
  await set(ref(db, `couples/${coupleId}/streak`), {
    startDate: now,
    resetAt: now,
  })
  await set(ref(db, `couples/${coupleId}/garden/specialSeedGiven`), false)
}

export function calcDays(startDate: string): number {
  const start = new Date(startDate)
  const now = new Date()
  const diff = now.getTime() - start.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export async function checkSpecialSeedReward(coupleId: string, days: number): Promise<boolean> {
  if (days < 30) return false
  const snap = await get(ref(db, `couples/${coupleId}/garden/specialSeedGiven`))
  if (snap.val() === true) return false
  return true
}

export async function claimSpecialSeedReward(coupleId: string): Promise<void> {
  await set(ref(db, `couples/${coupleId}/garden/specialSeedGiven`), true)
}
