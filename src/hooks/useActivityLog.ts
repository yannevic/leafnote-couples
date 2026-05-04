import { useState, useEffect } from 'react'
import { ActivityEntry, subscribeActivityLog } from '../lib/widgets'

export function useActivityLog(coupleId: string) {
  const [entries, setEntries] = useState<ActivityEntry[]>([])

  useEffect(() => {
    const unsub = subscribeActivityLog(coupleId, setEntries)
    return unsub
  }, [coupleId])

  return entries
}
