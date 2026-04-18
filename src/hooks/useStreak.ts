import { useState, useEffect } from 'react'
import { StreakData, subscribeStreak, setStreakStart, resetStreak, calcDays } from '../lib/streak'

export function useStreak() {
  const [streak, setStreak] = useState<StreakData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = subscribeStreak((data) => {
      setStreak(data)
      setLoading(false)
    })
    return unsub
  }, [])

  const days = streak?.startDate ? calcDays(streak.startDate) : 0

  return {
    streak,
    loading,
    days,
    setStart: setStreakStart,
    reset: resetStreak,
  }
}
