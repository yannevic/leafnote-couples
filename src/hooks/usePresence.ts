import { useEffect, useState } from 'react'
import { ref, onValue, off } from 'firebase/database'
import { db } from '../lib/firebase'
import { PresenceData, publishPresence } from '../lib/presence'

export function usePresence(uid: string, displayName: string, partnerUid: string | null) {
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

  const myPresence = allPresence[uid] ?? null
  const partnerPresence = partnerUid ? (allPresence[partnerUid] ?? null) : null

  return { myPresence, partnerPresence, partnerUid: partnerUid ?? '' }
}
