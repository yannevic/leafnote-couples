import { useEffect, useState } from 'react'
import { subscribeStreak, calcDays } from '../lib/streak'

export function useStreak() {
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    const unsub = subscribeStreak((data) => {
      if (data?.startDate) setStreak(calcDays(data.startDate))
      else setStreak(0)
    })
    return unsub
  }, [])

  return { streak }
}
