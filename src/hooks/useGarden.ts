import { useState, useEffect } from 'react'
import { ref, onValue, off } from 'firebase/database'
import { db } from '../lib/firebase'
import {
  PlantData,
  SeedData,
  StageEvent,
  FlowerType,
  subscribePlants,
  subscribeSeeds,
  subscribeStageEvents,
  subscribePanicMode,
  subscribeWelcomeSeedGiven,
  waterPlant,
  plantSeed,
  addSeed,
  checkWiltAll,
  canPlantToday,
  saveEventRoll,
  saveWelcomeRoll,
  setPanicMode,
  resetPlantWater,
} from '../lib/garden'

export function useGarden(coupleId: string, uid: string, partnerUid: string) {
  const [plants, setPlants] = useState<PlantData[]>([])
  const [seeds, setSeeds] = useState<SeedData[]>([])
  const [stageEvents, setStageEvents] = useState<StageEvent[]>([])
  const [panicMode, setPanicModeState] = useState(false)
  const [welcomeGiven, setWelcomeGiven] = useState(true)
  const [welcomeRolls, setWelcomeRolls] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!coupleId) return
    const unsubPlants = subscribePlants(coupleId, (data) => {
      const today = new Date().toLocaleDateString('en-CA')
      data.forEach((plant) => {
        if (
          plant.water &&
          Object.keys(plant.water).length > 0 &&
          (plant as PlantData & { waterDate?: string }).waterDate !== today
        ) {
          resetPlantWater(coupleId, plant.id)
        }
      })
      setPlants(data)
      setLoading(false)
    })
    const unsubSeeds = subscribeSeeds(coupleId, setSeeds)
    const unsubEvents = subscribeStageEvents(coupleId, setStageEvents)
    const unsubPanic = subscribePanicMode(coupleId, setPanicModeState)
    const unsubWelcome = subscribeWelcomeSeedGiven(coupleId, setWelcomeGiven)
    checkWiltAll(coupleId)
    return () => {
      unsubPlants()
      unsubSeeds()
      unsubEvents()
      unsubPanic()
      unsubWelcome()
    }
  }, [coupleId])

  useEffect(() => {
    if (!coupleId) return
    const r = ref(db, `couples/${coupleId}/garden/welcomeRolls`)
    const handler = onValue(r, (snap) => {
      setWelcomeRolls((snap.val() as Record<string, number>) ?? {})
    })
    return () => off(r, 'value', handler)
  }, [coupleId])

  const water = async (plantId: string) => {
    await waterPlant(coupleId, plantId, uid, partnerUid, panicMode)
  }

  const plant = async (seedId: string, flowerType: FlowerType) => {
    await plantSeed(coupleId, seedId, flowerType)
  }

  const addNewSeed = async (flowerType: FlowerType) => {
    await addSeed(coupleId, flowerType)
  }

  const alreadyWatered = (plantId: string) => {
    const p = plants.find((x) => x.id === plantId)
    if (!p) return false
    const today = new Date().toLocaleDateString('en-CA')
    if (p.waterDate === today && !p.water?.[uid] && !p.water?.[partnerUid]) return true
    return (p.water ?? {})[uid] === true
  }

  const partnerWatered = (plantId: string) => {
    const p = plants.find((x) => x.id === plantId)
    if (!p) return false
    const today = new Date().toLocaleDateString('en-CA')
    if (p.waterDate === today && !p.water?.[uid] && !p.water?.[partnerUid]) return true
    return (p.water ?? {})[partnerUid] === true
  }

  const pendingEvents = stageEvents.filter((e) => e.rolls?.[uid] == null)
  const currentEvent = pendingEvents[0] ?? null

  const rollForEvent = async (
    eventId: string,
    roll: number
  ): Promise<{ done: boolean; flowerType: FlowerType | null }> => {
    return saveEventRoll(coupleId, eventId, uid, roll, partnerUid, panicMode)
  }

  const rollForWelcome = async (
    roll: number
  ): Promise<{ done: boolean; flowerType: FlowerType | null }> => {
    return saveWelcomeRoll(coupleId, uid, roll, partnerUid, panicMode)
  }

  const togglePanic = async () => {
    await setPanicMode(coupleId, !panicMode)
  }

  const partnerRolledEvent = (eventId: string) => {
    const event = stageEvents.find((e) => e.id === eventId)
    return event ? event.rolls?.[partnerUid] != null : false
  }

  const canPlant = canPlantToday(plants)
  const welcomePending = !welcomeGiven
  const partnerRolledWelcome = welcomeRolls[partnerUid] != null
  const iAlreadyRolledWelcome = welcomeRolls[uid] != null

  return {
    plants,
    seeds,
    loading,
    water,
    plant,
    addNewSeed,
    alreadyWatered,
    partnerWatered,
    canPlant,
    currentEvent,
    pendingEvents,
    rollForEvent,
    rollForWelcome,
    panicMode,
    togglePanic,
    welcomePending,
    partnerRolledEvent,
    partnerRolledWelcome,
    iAlreadyRolledWelcome,
  }
}
