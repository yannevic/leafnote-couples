import { useEffect, useState, useCallback, useRef } from 'react'
import {
  subscribeStreak,
  setStreakStart,
  resetStreak,
  calcDays,
  checkSpecialSeedReward,
  claimSpecialSeedReward,
} from '../lib/streak'
import type { StreakData } from '../lib/streak'

export function useStreak() {
  const [streakData, setStreakData] = useState<StreakData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = subscribeStreak((data) => {
      setStreakData(data)
      setLoading(false)
    })
    return unsub
  }, [])

  const days = streakData?.startDate ? calcDays(streakData.startDate) : 0
  const checkedRef = useRef(false)

  useEffect(() => {
    if (checkedRef.current || days < 30) return
    checkedRef.current = true
    checkSpecialSeedReward(days).then(async (eligible) => {
      if (!eligible) return
      const { addSeed } = await import('../lib/garden')
      await addSeed('especial')
      await claimSpecialSeedReward()
    })
  }, [days])

  const setStart = useCallback(async (iso: string) => {
    await setStreakStart(iso)
  }, [])

  const reset = useCallback(async () => {
    await resetStreak()
  }, [])

  return {
    streak: streakData,
    loading,
    days,
    setStart,
    reset,
  }
}
