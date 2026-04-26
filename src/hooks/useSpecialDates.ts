import { useEffect, useState, useCallback } from 'react'
import { ref, onValue, set } from 'firebase/database'
import { db } from '../lib/firebase'
import type { SpecialDates } from '../lib/specialDates'

const EMPTY: SpecialDates = {
  birthdayMe: '',
  birthdayPartner: '',
  anniversary: '',
  metDate: '',
  datingDate: '',
}

export function useSpecialDates() {
  const [dates, setDates] = useState<SpecialDates>(EMPTY)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const r = ref(db, 'specialDates')
    const unsub = onValue(r, (snap) => {
      const val = snap.val() as SpecialDates | null
      setDates(val ?? EMPTY)
      setLoaded(true)
    })
    return () => unsub()
  }, [])

  const saveDates = useCallback((d: SpecialDates) => {
    set(ref(db, 'specialDates'), d)
  }, [])

  return { dates, loaded, saveDates }
}
