import { ref, set, onValue, off, onDisconnect } from 'firebase/database'
import { db } from './firebase'

export interface PresenceData {
  online: boolean
  displayName: string
  lastSeen: string
}

export function publishPresence(coupleId: string, uid: string, displayName: string) {
  const presRef = ref(db, `couples/${coupleId}/presence/${uid}`)
  set(presRef, { online: true, displayName, lastSeen: new Date().toISOString() })
  onDisconnect(presRef).set({ online: false, displayName, lastSeen: new Date().toISOString() })
}

export function subscribePresence(
  coupleId: string,
  uid: string,
  callback: (data: PresenceData | null) => void
) {
  const presRef = ref(db, `couples/${coupleId}/presence/${uid}`)
  onValue(presRef, (snap) => {
    callback(snap.val() as PresenceData | null)
  })
  return () => off(presRef, 'value')
}
