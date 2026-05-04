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

export function useStreak(coupleId: string | null) {
  const [streakData, setStreakData] = useState<StreakData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!coupleId) return
    const unsub = subscribeStreak(coupleId, (data) => {
      setStreakData(data)
      setLoading(false)
    })
    return unsub
  }, [coupleId])

  const days = streakData?.startDate ? calcDays(streakData.startDate) : 0
  const checkedRef = useRef(false)

  useEffect(() => {
    if (!coupleId || checkedRef.current || days < 30) return
    checkedRef.current = true
    checkSpecialSeedReward(coupleId, days).then(async (eligible) => {
      if (!eligible) return
      const { addSeed } = await import('../lib/garden')
      await addSeed(coupleId, 'especial')
      await claimSpecialSeedReward(coupleId)
    })
  }, [coupleId, days])

  const setStart = useCallback(
    async (iso: string) => {
      if (!coupleId) return
      await setStreakStart(coupleId, iso)
    },
    [coupleId]
  )

  const reset = useCallback(async () => {
    if (!coupleId) return
    await resetStreak(coupleId)
  }, [coupleId])

  return {
    streak: streakData,
    loading,
    days,
    setStart,
    reset,
  }
}
