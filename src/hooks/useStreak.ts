import { useEffect, useState, useCallback } from 'react'
import { subscribeStreak, setStreakStart, resetStreak, calcDays } from '../lib/streak'
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
