import { useEffect, useState } from 'react'
import { ref, onValue, off } from 'firebase/database'
import { db } from '../lib/firebase'
import { PresenceData, publishPresence } from '../lib/presence'

export function usePresence(
  uid: string,
  displayName: string,
  partnerUid: string | null,
  coupleId: string | null
) {
  const [allPresence, setAllPresence] = useState<Record<string, PresenceData>>({})

  useEffect(() => {
    if (!uid || !displayName || !coupleId) return
    publishPresence(coupleId, uid, displayName)
  }, [uid, displayName, coupleId])

  useEffect(() => {
    if (!coupleId) return
    const presRef = ref(db, `couples/${coupleId}/presence`)
    onValue(presRef, (snap) => {
      setAllPresence((snap.val() as Record<string, PresenceData>) ?? {})
    })
    return () => off(presRef, 'value')
  }, [coupleId])

  const myPresence = allPresence[uid] ?? null
  const partnerPresence = partnerUid ? (allPresence[partnerUid] ?? null) : null

  return { myPresence, partnerPresence, partnerUid: partnerUid ?? '' }
}
