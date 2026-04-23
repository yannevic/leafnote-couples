import { db } from './firebase'
import { ref, set, onValue, off, query, orderByChild, limitToLast } from 'firebase/database'

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type DiceMode = 'together' | 'versus'

export interface DiceValues {
  nana?: number
  gueguel?: number
}

export interface SharedDiceState {
  mode: DiceMode
  values: DiceValues
  rolledBy: string
  rolledAt: number
}

export type TimerMode = 'stopwatch' | 'countdown'

export interface SharedTimerState {
  running: boolean
  mode: TimerMode
  startedAt: number // timestamp ms quando começou (ou retomou)
  pausedAt: number // timestamp ms quando pausou (0 se rodando)
  elapsed: number // segundos acumulados antes do último start
  target: number // segundos do countdown (0 no stopwatch)
  startedBy: string
}

// ─── Paths ────────────────────────────────────────────────────────────────────

const DICE_PATH = 'widgets/dice'
const TIMER_PATH = 'widgets/timer'

// ─── Dice ─────────────────────────────────────────────────────────────────────

export function saveDiceState(state: SharedDiceState): Promise<void> {
  return set(ref(db, DICE_PATH), state)
}

export function subscribeDice(cb: (state: SharedDiceState | null) => void): () => void {
  const r = ref(db, DICE_PATH)
  onValue(r, (snap) => cb(snap.exists() ? (snap.val() as SharedDiceState) : null))
  return () => off(r)
}

// ─── Timer ────────────────────────────────────────────────────────────────────

export function saveTimerState(state: SharedTimerState): Promise<void> {
  return set(ref(db, TIMER_PATH), state)
}

export function subscribeTimer(cb: (state: SharedTimerState | null) => void): () => void {
  const r = ref(db, TIMER_PATH)
  onValue(r, (snap) => cb(snap.exists() ? (snap.val() as SharedTimerState) : null))
  return () => off(r)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function makeDefaultDice(nick: string): SharedDiceState {
  return {
    mode: 'together',
    values: {},
    rolledBy: nick,
    rolledAt: Date.now(),
  }
}

export function makeDefaultTimer(): SharedTimerState {
  return {
    running: false,
    mode: 'stopwatch',
    startedAt: 0,
    pausedAt: 0,
    elapsed: 0,
    target: 60,
    startedBy: '',
  }
}

// Calcula quantos segundos se passaram considerando startedAt e elapsed
export function computeElapsed(state: SharedTimerState): number {
  if (!state.running) return state.elapsed
  const now = Date.now()
  const sinceStart = Math.floor((now - state.startedAt) / 1000)
  return state.elapsed + sinceStart
}

// ─── Activity Log ─────────────────────────────────────────────────────────────

export interface ActivityEntry {
  id: string
  nick: string
  message: string // ex: "girou um 5 no dado 🎲"
  createdAt: number
}

export function pushActivityLog(nick: string, message: string): void {
  const id = Math.random().toString(36).slice(2) + Date.now().toString(36)
  const entry: ActivityEntry = { id, nick, message, createdAt: Date.now() }
  set(ref(db, `/widgets/log/${id}`), entry)
}

export function subscribeActivityLog(cb: (entries: ActivityEntry[]) => void): () => void {
  const r = ref(db, '/widgets/log')
  // pega só os últimos 20, ordenados por createdAt
  const q = query(r, orderByChild('createdAt'), limitToLast(20))
  const unsub = onValue(q, (snap) => {
    const entries: ActivityEntry[] = []
    snap.forEach((child) => {
      entries.push(child.val() as ActivityEntry)
    })
    cb(entries.reverse()) // mais recente primeiro
  })
  return () => off(q, 'value', unsub)
}
