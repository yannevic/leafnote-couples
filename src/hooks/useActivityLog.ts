import { useState, useEffect } from 'react'
import { ActivityEntry, subscribeActivityLog } from '../lib/widgets'

export function useActivityLog() {
  const [entries, setEntries] = useState<ActivityEntry[]>([])

  useEffect(() => {
    const unsub = subscribeActivityLog(setEntries)
    return unsub
  }, [])

  return entries
}
