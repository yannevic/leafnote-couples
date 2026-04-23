import { ref, set, get, onValue, off } from 'firebase/database'
import { db } from './firebase'

export type FlowerType = 'rosa' | 'margarida' | 'tulipa' | 'girassol' | 'orquidea' | 'especial'

export type FlowerRarity = 'comum' | 'incomum' | 'rara' | 'epica'

export interface FlowerInfo {
  type: FlowerType
  name: string
  rarity: FlowerRarity
  emoji: string
}

export const FLOWERS: Record<FlowerType, FlowerInfo> = {
  rosa: { type: 'rosa', name: 'Rosa', rarity: 'comum', emoji: '🌸' },
  margarida: { type: 'margarida', name: 'Margarida', rarity: 'comum', emoji: '🌼' },
  tulipa: { type: 'tulipa', name: 'Tulipa', rarity: 'incomum', emoji: '🌷' },
  girassol: { type: 'girassol', name: 'Girassol', rarity: 'incomum', emoji: '🌻' },
  orquidea: { type: 'orquidea', name: 'Orquídea', rarity: 'rara', emoji: '🌺' },
  especial: { type: 'especial', name: 'Flor Épica', rarity: 'epica', emoji: '🌸' },
}

export const RARITY_COLORS: Record<FlowerRarity, string> = {
  comum: '#7fb87f',
  incomum: '#8b6914',
  rara: '#c87090',
  epica: '#7a3040',
}

export interface WaterEntry {
  [uid: string]: boolean
}

export interface PlantData {
  flowerType: FlowerType
  stage: number
  daysWatered: number
  lastWateredDate: string | null
  water: WaterEntry
  wilted: boolean
  unlockedAt: string
}

const GARDEN_PATH = 'garden/plant'

export function subscribePlant(callback: (data: PlantData | null) => void) {
  const plantRef = ref(db, GARDEN_PATH)
  onValue(plantRef, (snap) => {
    callback(snap.val() as PlantData | null)
  })
  return () => off(plantRef, 'value')
}

export async function initPlant(flowerType: FlowerType): Promise<void> {
  const plantRef = ref(db, GARDEN_PATH)
  const snap = await get(plantRef)
  if (snap.exists()) return
  const data: PlantData = {
    flowerType,
    stage: 0,
    daysWatered: 0,
    lastWateredDate: '',
    water: { nana: false, gueguel: false },
    wilted: false,
    unlockedAt: new Date().toISOString(),
  }
  await set(plantRef, data)
}

export async function waterPlant(uid: string, partnerUid: string): Promise<void> {
  const plantRef = ref(db, GARDEN_PATH)
  const snap = await get(plantRef)
  if (!snap.exists()) return
  const plant = snap.val() as PlantData

  const today = new Date().toISOString().split('T')[0]
  const isNewDay = !plant.lastWateredDate || plant.lastWateredDate !== today

  const currentWater: WaterEntry = isNewDay ? {} : { ...plant.water }
  currentWater[uid] = true

  const bothWatered = currentWater[uid] === true && currentWater[partnerUid] === true
  const newDaysWatered = bothWatered ? plant.daysWatered + 1 : plant.daysWatered
  const newStage = Math.min(5, Math.floor(newDaysWatered / 3))

  await set(plantRef, {
    ...plant,
    water: currentWater,
    lastWateredDate: bothWatered ? today : plant.lastWateredDate,
    daysWatered: newDaysWatered,
    stage: newStage,
    wilted: false,
  })
}

export async function checkWilt(): Promise<void> {
  const plantRef = ref(db, GARDEN_PATH)
  const snap = await get(plantRef)
  if (!snap.exists()) return
  const plant = snap.val() as PlantData
  if (!plant.lastWateredDate) return

  const last = new Date(plant.lastWateredDate)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays >= 2 && !plant.wilted) {
    await set(plantRef, { ...plant, wilted: true })
  }
}

export function rollDice(): number {
  return Math.floor(Math.random() * 6)
}

export function getFlowerFromSum(sum: number): FlowerType {
  if (sum <= 1) return 'rosa'
  if (sum <= 3) return 'margarida'
  if (sum <= 5) return 'tulipa'
  if (sum <= 7) return 'girassol'
  return 'orquidea'
}
