import { db } from './firebase'
import { ref, set, get, update, remove, onValue, off } from 'firebase/database'
import type { CoupleData, CoupleRequest, UserProfile, Sex } from '../types/couple'

function generateCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 5; i += 1) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export async function saveUserProfile(
  uid: string,
  displayName: string,
  sex: Sex | null
): Promise<void> {
  const profile = {
    uid,
    displayName,
    ...(sex !== null && { sex }),
    createdAt: new Date().toISOString(),
  }
  await set(ref(db, `users/${uid}`), profile)
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await get(ref(db, `users/${uid}`))
  if (!snap.exists()) return null
  return snap.val() as UserProfile
}

export async function createCouple(uid: string): Promise<string> {
  let code = generateCode()
  let exists = true

  while (exists) {
    const snap = await get(ref(db, `coupleCodes/${code}`))
    exists = snap.exists()
    if (exists) code = generateCode()
  }

  const coupleId = code
  const now = new Date().toISOString()

  const couple: CoupleData = {
    id: coupleId,
    members: { [uid]: true },
    createdAt: now,
    createdBy: uid,
  }

  await set(ref(db, `couples/${coupleId}`), couple)
  await set(ref(db, `coupleCodes/${coupleId}`), uid)
  await update(ref(db, `users/${uid}`), { coupleId })

  return coupleId
}

export async function requestJoinCouple(
  code: string,
  fromUid: string,
  fromName: string
): Promise<'not_found' | 'already_full' | 'ok'> {
  const snap = await get(ref(db, `couples/${code}`))
  if (!snap.exists()) return 'not_found'

  const couple = snap.val() as CoupleData
  const memberCount = Object.keys(couple.members ?? {}).length
  if (memberCount >= 2) return 'already_full'

  const request: CoupleRequest = {
    fromUid,
    fromName,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }

  await set(ref(db, `couples/${code}/requests/${fromUid}`), request)
  return 'ok'
}

export async function acceptRequest(coupleId: string, fromUid: string): Promise<void> {
  await update(ref(db, `couples/${coupleId}/requests/${fromUid}`), { status: 'accepted' })
  await update(ref(db, `couples/${coupleId}/members`), { [fromUid]: true })
  await update(ref(db, `users/${fromUid}`), { coupleId })
}

export async function refuseRequest(coupleId: string, fromUid: string): Promise<void> {
  await update(ref(db, `couples/${coupleId}/requests/${fromUid}`), { status: 'refused' })
}

export function subscribeToRequests(
  coupleId: string,
  callback: (requests: Record<string, CoupleRequest>) => void
): () => void {
  const r = ref(db, `couples/${coupleId}/requests`)
  const handler = onValue(r, (snap) => {
    callback((snap.val() ?? {}) as Record<string, CoupleRequest>)
  })
  return () => off(r, 'value', handler)
}

export function subscribeToCouple(
  coupleId: string,
  callback: (couple: CoupleData) => void
): () => void {
  const r = ref(db, `couples/${coupleId}`)
  const handler = onValue(r, (snap) => {
    if (snap.exists()) callback(snap.val() as CoupleData)
  })
  return () => off(r, 'value', handler)
}

export async function subscribeUserCoupleId(
  uid: string,
  callback: (coupleId: string | null) => void
): Promise<() => void> {
  const r = ref(db, `users/${uid}/coupleId`)
  const handler = onValue(r, (snap) => {
    callback(snap.exists() ? (snap.val() as string) : null)
  })
  return () => off(r, 'value', handler)
}

export async function dissolveCouple(coupleId: string, memberUids: string[]): Promise<void> {
  await remove(ref(db, `couples/${coupleId}`))
  await remove(ref(db, `coupleCodes/${coupleId}`))
  memberUids.forEach((uid) => {
    void update(ref(db, `users/${uid}`), { coupleId: null })
  })
}
