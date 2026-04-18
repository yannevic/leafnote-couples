import { useEffect, useState } from 'react'
import { ref, onValue, off } from 'firebase/database'
import { db } from '../lib/firebase'
import { PresenceData, publishPresence } from '../lib/presence'

export function usePresence(uid: string, displayName: string) {
  const [allPresence, setAllPresence] = useState<Record<string, PresenceData>>({})

  useEffect(() => {
    if (!uid || !displayName) return
    publishPresence(uid, displayName)
  }, [uid, displayName])

  useEffect(() => {
    const presRef = ref(db, 'presence')
    onValue(presRef, (snap) => {
      setAllPresence((snap.val() as Record<string, PresenceData>) ?? {})
    })
    return () => off(presRef, 'value')
  }, [])

  const nanaPresence =
    Object.values(allPresence).find((p) => p.displayName?.toLowerCase() === 'nana') ?? null

  const gueguelPresence =
    Object.values(allPresence).find((p) => p.displayName?.toLowerCase() === 'gueguel') ?? null

  return { nanaPresence, gueguelPresence }
}
