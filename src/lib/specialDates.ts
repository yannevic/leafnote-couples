import { ref, set, onValue, off } from 'firebase/database'
import { db } from './firebase'

export interface SpecialDates {
  birthdayMe: string
  birthdayPartner: string
  anniversary: string
  metDate: string
  datingDate: string
}

export const EMPTY_SPECIAL_DATES: SpecialDates = {
  birthdayMe: '',
  birthdayPartner: '',
  anniversary: '',
  metDate: '',
  datingDate: '',
}

export const DATE_LABELS: Record<string, string> = {
  birthdayMe: 'Meu aniversário',
  birthdayPartner: 'Aniversário da pessoa amada',
  anniversary: 'Aniversário do casal',
  metDate: 'Dia que se conheceram',
  datingDate: 'Início do namoro',
  christmas: 'Natal',
  valentines: 'Dia dos Namorados',
}

// Datas fixas que não precisam de cadastro
export const FIXED_DATES: Record<string, string> = {
  christmas: '25-12',
  valentines: '12-06',
}

export function saveSpecialDates(dates: SpecialDates) {
  const r = ref(db, 'specialDates')
  return set(r, dates)
}

export function subscribeSpecialDates(cb: (dates: SpecialDates) => void) {
  const r = ref(db, 'specialDates')
  onValue(r, (snap) => {
    const val = snap.val() as SpecialDates | null
    cb(val ?? EMPTY_SPECIAL_DATES)
  })
  return () => off(r)
}

// Retorna todas as datas disponíveis (fixas + cadastradas) como { key, label, mmdd }
export function getAvailableDates(dates: SpecialDates) {
  const result: { key: string; label: string; mmdd: string }[] = []

  Object.entries(FIXED_DATES).forEach(([key, mmdd]) => {
    result.push({ key, label: DATE_LABELS[key], mmdd })
  })

  Object.entries(dates).forEach(([key, value]) => {
    if (value && value.length >= 5) {
      result.push({ key, label: DATE_LABELS[key] ?? key, mmdd: value })
    }
  })

  return result
}

// Verifica se hoje é a data (DD-MM ou DD-MM-AAAA)
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

// Formata DD-MM ou DD-MM-AAAA pra exibição
export function formatMmdd(ddmm: string) {
  if (!ddmm || ddmm.length < 5) return ''
  const parts = ddmm.split('-')
  if (parts.length === 3) return `${parts[0]}/${parts[1]}/${parts[2]}`
  return `${parts[0]}/${parts[1]}`
}
