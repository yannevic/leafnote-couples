import { useState, useEffect } from 'react'
import { getUserProfile, subscribeToRequests, subscribeUserCoupleId } from '../lib/couple'
import type { CoupleRequest, UserProfile } from '../types/couple'

interface UseCoupleReturn {
  coupleId: string | null
  partnerUid: string | null
  partnerProfile: UserProfile | null
  pendingRequests: Record<string, CoupleRequest>
  loading: boolean
}

export function useCouple(uid: string, myProfile: UserProfile | null): UseCoupleReturn {
  const [coupleId, setCoupleId] = useState<string | null>(myProfile?.coupleId ?? null)
  const [partnerUid, setPartnerUid] = useState<string | null>(null)
  const [partnerProfile, setPartnerProfile] = useState<UserProfile | null>(null)
  const [pendingRequests, setPendingRequests] = useState<Record<string, CoupleRequest>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let unsub: (() => void) | null = null

    async function init() {
      const unsubFn = await subscribeUserCoupleId(uid, (id) => {
        setCoupleId(id)
        setLoading(false)
      })
      unsub = unsubFn
    }

    void init()
    return () => {
      if (unsub) unsub()
    }
  }, [uid])

  useEffect(() => {
    if (!coupleId) return

    const unsub = subscribeToRequests(coupleId, (requests) => {
      const pending: Record<string, CoupleRequest> = {}
      Object.entries(requests).forEach(([k, v]) => {
        if (v.status === 'pending') pending[k] = v
      })
      setPendingRequests(pending)
    })

    return unsub
  }, [coupleId])

  useEffect(() => {
    if (!coupleId || !myProfile) return

    async function loadPartner() {
      if (!myProfile?.coupleId) return
      const snap = await import('../lib/firebase').then(({ db }) =>
        import('firebase/database').then(({ ref, get }) =>
          get(ref(db, `couples/${myProfile.coupleId}/members`))
        )
      )
      const members = (snap.val() ?? {}) as Record<string, true>
      const partner = Object.keys(members).find((k) => k !== uid) ?? null
      setPartnerUid(partner)

      if (partner) {
        const profile = await getUserProfile(partner)
        setPartnerProfile(profile)
      }
    }

    void loadPartner()
  }, [coupleId, myProfile, uid])

  return { coupleId, partnerUid, partnerProfile, pendingRequests, loading }
}
