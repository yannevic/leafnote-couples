import { ref, set, get, push, remove, onValue, off, update } from 'firebase/database'
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

export interface SeedData {
  id: string
  flowerType: FlowerType
  gainedAt: string
}

export interface PlantData {
  id: string
  flowerType: FlowerType
  stage: number
  daysWatered: number
  lastWateredDate: string
  waterDate?: string
  water: Record<string, boolean>
  wilted: boolean
  plantedAt: string
}

export interface StageEvent {
  id: string
  plantId: string
  plantName: string
  newStage: number
  rolls: Record<string, number>
  claimedBy: Record<string, boolean>
  createdAt: string
}

// ─── Subscribes ──────────────────────────────────────────────────────────────

export function subscribePlants(
  coupleId: string,
  callback: (plants: PlantData[]) => void
): () => void {
  const r = ref(db, `couples/${coupleId}/garden/plants`)
  const handler = onValue(r, (snap) => {
    const val = snap.val() as Record<string, PlantData> | null
    const list = val ? Object.entries(val).map(([id, p]) => ({ ...p, id })) : []
    callback(list)
  })
  return () => off(r, 'value', handler)
}

export function subscribeSeeds(
  coupleId: string,
  callback: (seeds: SeedData[]) => void
): () => void {
  const r = ref(db, `couples/${coupleId}/garden/seeds`)
  const handler = onValue(r, (snap) => {
    const val = snap.val() as Record<string, SeedData> | null
    const list = val ? Object.entries(val).map(([id, s]) => ({ ...s, id })) : []
    callback(list)
  })
  return () => off(r, 'value', handler)
}

export function subscribeStageEvents(
  coupleId: string,
  callback: (events: StageEvent[]) => void
): () => void {
  const r = ref(db, `couples/${coupleId}/garden/stageEvents`)
  const handler = onValue(r, (snap) => {
    const val = snap.val() as Record<string, StageEvent> | null
    const list = val ? Object.entries(val).map(([id, e]) => ({ ...e, id })) : []
    callback(list)
  })
  return () => off(r, 'value', handler)
}

export function subscribePanicMode(
  coupleId: string,
  callback: (active: boolean) => void
): () => void {
  const r = ref(db, `couples/${coupleId}/garden/panicMode`)
  const handler = onValue(r, (snap) => {
    callback(snap.val() === true)
  })
  return () => off(r, 'value', handler)
}

export function subscribeWelcomeSeedGiven(
  coupleId: string,
  callback: (given: boolean) => void
): () => void {
  const r = ref(db, `couples/${coupleId}/garden/welcomeSeedGiven`)
  const handler = onValue(r, (snap) => {
    callback(snap.val() === true)
  })
  return () => off(r, 'value', handler)
}

// ─── Seeds ────────────────────────────────────────────────────────────────────

export async function addSeed(coupleId: string, flowerType: FlowerType): Promise<void> {
  const seedsRef = ref(db, `couples/${coupleId}/garden/seeds`)
  const newRef = push(seedsRef)
  const seed: SeedData = {
    id: newRef.key!,
    flowerType,
    gainedAt: new Date().toISOString(),
  }
  await set(newRef, seed)
}

// ─── Plants ───────────────────────────────────────────────────────────────────

export async function plantSeed(
  coupleId: string,
  seedId: string,
  flowerType: FlowerType
): Promise<void> {
  const plantsRef = ref(db, `couples/${coupleId}/garden/plants`)
  const newRef = push(plantsRef)
  const plant: PlantData = {
    id: newRef.key!,
    flowerType,
    stage: 1,
    daysWatered: 0,
    lastWateredDate: '',
    water: {},
    wilted: false,
    plantedAt: new Date().toISOString(),
  }
  await set(newRef, plant)
  await remove(ref(db, `couples/${coupleId}/garden/seeds/${seedId}`))
}

export async function waterPlant(
  coupleId: string,
  plantId: string,
  uid: string,
  partnerUid: string,
  panicMode: boolean
): Promise<void> {
  const plantRef = ref(db, `couples/${coupleId}/garden/plants/${plantId}`)
  const snap = await get(plantRef)
  if (!snap.exists()) return
  const plant = snap.val() as PlantData

  if (plant.stage >= 5) return

  const today = new Date().toLocaleDateString('en-CA')
  if (plant.water?.[uid] === true && plant.waterDate === today) return

  await update(plantRef, {
    [`water/${uid}`]: true,
    waterDate: today,
  })

  const snapAfter = await get(plantRef)
  if (!snapAfter.exists()) return
  const updated = snapAfter.val() as PlantData

  const bothWatered = panicMode
    ? true
    : updated.water?.[uid] === true && updated.water?.[partnerUid] === true

  if (!bothWatered) return

  const newDaysWatered = plant.daysWatered + 1
  const newStage = Math.min(5, Math.floor(newDaysWatered / 3) + 1)

  await update(plantRef, {
    lastWateredDate: today,
    waterDate: today,
    daysWatered: newDaysWatered,
    stage: newStage,
    wilted: false,
    [`water/${uid}`]: null,
    [`water/${partnerUid}`]: null,
  })

  if (newStage > plant.stage) {
    await createStageEvent(coupleId, plantId, plant.flowerType, newStage)
  }
}

export async function resetPlantWater(coupleId: string, plantId: string): Promise<void> {
  const plantRef = ref(db, `couples/${coupleId}/garden/plants/${plantId}`)
  await update(plantRef, { water: null, waterDate: null })
}

async function createStageEvent(
  coupleId: string,
  plantId: string,
  flowerType: FlowerType,
  newStage: number
): Promise<void> {
  const eventsRef = ref(db, `couples/${coupleId}/garden/stageEvents`)
  const newRef = push(eventsRef)
  const event: StageEvent = {
    id: newRef.key!,
    plantId,
    plantName: FLOWERS[flowerType].name,
    newStage,
    rolls: {},
    claimedBy: {},
    createdAt: new Date().toISOString(),
  }
  await set(newRef, event)
}

export async function saveEventRoll(
  coupleId: string,
  eventId: string,
  uid: string,
  roll: number,
  partnerUid: string,
  panicMode: boolean
): Promise<{ done: boolean; flowerType: FlowerType | null }> {
  const eventRef = ref(db, `couples/${coupleId}/garden/stageEvents/${eventId}`)
  const snap = await get(eventRef)
  if (!snap.exists()) return { done: false, flowerType: null }
  const event = snap.val() as StageEvent

  const updatedRolls = { ...(event.rolls ?? {}), [uid]: roll }
  await update(eventRef, { rolls: updatedRolls })

  const partnerRoll = updatedRolls[partnerUid]
  const myRoll = updatedRolls[uid]
  const bothRolled = panicMode ? true : partnerRoll != null && myRoll != null

  if (!bothRolled) return { done: false, flowerType: null }

  const sum = panicMode ? myRoll : myRoll + partnerRoll
  const flowerType = getFlowerFromSum(sum)

  await addSeed(coupleId, flowerType)
  await remove(eventRef)

  return { done: true, flowerType }
}

export async function checkWelcomeSeed(coupleId: string): Promise<boolean> {
  const snap = await get(ref(db, `couples/${coupleId}/garden/welcomeSeedGiven`))
  return snap.val() === true
}

export async function saveWelcomeRoll(
  coupleId: string,
  uid: string,
  roll: number,
  partnerUid: string,
  panicMode: boolean
): Promise<{ done: boolean; flowerType: FlowerType | null }> {
  const rollsRef = ref(db, `couples/${coupleId}/garden/welcomeRolls`)
  await update(rollsRef, { [uid]: roll })

  const snap = await get(rollsRef)
  const rolls = (snap.val() ?? {}) as Record<string, number>

  const myRoll = rolls[uid]
  const partnerRoll = rolls[partnerUid]
  const bothRolled = panicMode ? true : myRoll != null && partnerRoll != null

  if (!bothRolled) return { done: false, flowerType: null }

  const sum = panicMode ? myRoll * 2 : myRoll + partnerRoll
  const flowerType = getFlowerFromSum(sum)

  await addSeed(coupleId, flowerType)
  await set(ref(db, `couples/${coupleId}/garden/welcomeSeedGiven`), true)
  await remove(rollsRef)

  return { done: true, flowerType }
}

export async function setPanicMode(coupleId: string, active: boolean): Promise<void> {
  await set(ref(db, `couples/${coupleId}/garden/panicMode`), active)
}

export async function checkWiltAll(coupleId: string): Promise<void> {
  const plantsRef = ref(db, `couples/${coupleId}/garden/plants`)
  const snap = await get(plantsRef)
  if (!snap.exists()) return
  const plants = snap.val() as Record<string, PlantData>
  const now = new Date()
  await Promise.all(
    Object.entries(plants).map(async ([id, plant]) => {
      if (plant.stage >= 5) return
      if (!plant.lastWateredDate) return
      const last = new Date(plant.lastWateredDate)
      const diffHours = (now.getTime() - last.getTime()) / (1000 * 60 * 60)
      if (diffHours >= 48 && !plant.wilted) {
        const newDaysWatered = Math.max(0, plant.daysWatered - 1)
        const today = now.toISOString().split('T')[0]
        await update(ref(db, `couples/${coupleId}/garden/plants/${id}`), {
          wilted: true,
          daysWatered: newDaysWatered,
          lastWateredDate: today,
          waterDate: today,
        })
      }
    })
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function rollDice(): number {
  return Math.floor(Math.random() * 6) + 1
}

export function getFlowerFromSum(sum: number): FlowerType {
  if (sum <= 2) return 'rosa'
  if (sum <= 4) return 'margarida'
  if (sum <= 6) return 'tulipa'
  if (sum <= 8) return 'girassol'
  return 'orquidea'
}

export function canPlantToday(plants: PlantData[]): boolean {
  const today = new Date().toLocaleDateString('en-CA')
  return !plants.some((p) => p.plantedAt.startsWith(today))
}
