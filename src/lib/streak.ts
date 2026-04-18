import { ref, get, set, onValue, off } from 'firebase/database'
import { db } from './firebase'

export interface StreakData {
  startDate: string // ISO string da data que escolheram
  resetAt?: string // última vez que brigaram
}

const STREAK_PATH = 'streak'

export function subscribeStreak(callback: (data: StreakData | null) => void) {
  const streakRef = ref(db, STREAK_PATH)
  onValue(streakRef, (snap) => {
    const val = snap.val() as StreakData | null
    callback(val)
  })
  return () => off(streakRef, 'value')
}

export async function setStreakStart(startDate: string): Promise<void> {
  const streakRef = ref(db, STREAK_PATH)
  const snap = await get(streakRef)
  const current = snap.val() as StreakData | null
  await set(streakRef, { ...current, startDate })
}

export async function resetStreak(): Promise<void> {
  const now = new Date().toISOString()
  await set(ref(db, STREAK_PATH), {
    startDate: now,
    resetAt: now,
  })
}

export function calcDays(startDate: string): number {
  const start = new Date(startDate)
  const now = new Date()
  const diff = now.getTime() - start.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}
