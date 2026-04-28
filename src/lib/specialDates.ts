import { ref, set, onValue, off } from 'firebase/database'
import { db } from './firebase'

export interface SpecialDates {
  birthdayOf: Record<string, string> // { [uid]: 'DD-MM' }
  anniversary: string
  metDate: string
  datingDate: string
}

export const EMPTY_SPECIAL_DATES: SpecialDates = {
  birthdayOf: {},
  anniversary: '',
  metDate: '',
  datingDate: '',
}

export const DATE_LABELS: Record<string, string> = {
  anniversary: 'Aniversário do casal',
  metDate: 'Dia que se conheceram',
  datingDate: 'Início do namoro',
  christmas: 'Natal',
  valentines: 'Dia dos Namorados',
}

export const FIXED_DATES: Record<string, string> = {
  christmas: '25-12',
  valentines: '12-06',
}

export function saveSpecialDates(dates: SpecialDates) {
  return set(ref(db, 'specialDates'), dates)
}

export function subscribeSpecialDates(cb: (dates: SpecialDates) => void) {
  const r = ref(db, 'specialDates')
  onValue(r, (snap) => {
    const val = snap.val() as SpecialDates | null
    cb(val ?? EMPTY_SPECIAL_DATES)
  })
  return () => off(r)
}

export function getAvailableDates(
  dates: SpecialDates,
  myUid: string,
  partnerUid: string,
  myNick: string,
  partnerNick: string
) {
  const result: { key: string; label: string; mmdd: string; dayOnly?: boolean }[] = []

  Object.entries(FIXED_DATES).forEach(([key, mmdd]) => {
    result.push({ key, label: DATE_LABELS[key], mmdd })
  })

  const birthdayOf = dates.birthdayOf ?? {}
  if (birthdayOf[myUid]) {
    result.push({
      key: `birthday-${myUid}`,
      label: `Aniversário de ${myNick}`,
      mmdd: birthdayOf[myUid],
    })
  }
  if (birthdayOf[partnerUid]) {
    result.push({
      key: `birthday-${partnerUid}`,
      label: `Aniversário de ${partnerNick}`,
      mmdd: birthdayOf[partnerUid],
    })
  }

  if (dates.anniversary?.length >= 5)
    result.push({
      key: 'anniversary',
      label: DATE_LABELS.anniversary,
      mmdd: dates.anniversary,
      dayOnly: true,
    })
  if (dates.metDate?.length >= 5)
    result.push({ key: 'metDate', label: DATE_LABELS.metDate, mmdd: dates.metDate, dayOnly: true })
  if (dates.datingDate?.length >= 5)
    result.push({
      key: 'datingDate',
      label: DATE_LABELS.datingDate,
      mmdd: dates.datingDate,
      dayOnly: true,
    })

  return result
}

export function isToday(ddmm: string) {
  if (!ddmm || ddmm.length < 5) return false
  const parts = ddmm.split('-')
  if (parts.length < 2) return false
  const dd = parts[0]
  const mm = parts[1]
  const now = new Date()
  const todayMm = String(now.getMonth() + 1).padStart(2, '0')
  const todayDd = String(now.getDate()).padStart(2, '0')
  return dd === todayDd && mm === todayMm
}

export function isTodayDay(ddmmaaaa: string) {
  if (!ddmmaaaa) return false
  const dd = ddmmaaaa.split('-')[0]
  const todayDd = String(new Date().getDate()).padStart(2, '0')
  return dd === todayDd
}

export function formatMmdd(ddmm: string) {
  if (!ddmm || ddmm.length < 5) return ''
  const parts = ddmm.split('-')
  if (parts.length === 3) return `${parts[0]}/${parts[1]}/${parts[2]}`
  return `${parts[0]}/${parts[1]}`
}
