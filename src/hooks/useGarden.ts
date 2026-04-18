import { useState, useEffect } from 'react'
import { PlantData, subscribePlant, waterPlant, checkWilt } from '../lib/garden'

export function useGarden(nick: 'nana' | 'gueguel') {
  const [plant, setPlant] = useState<PlantData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = subscribePlant((data) => {
      setPlant(data)
      setLoading(false)
    })
    return unsub
  }, [])

  useEffect(() => {
    checkWilt()
  }, [])

  const water = async () => {
    await waterPlant(nick)
  }

  const today = new Date().toISOString().split('T')[0]
  const alreadyWatered = plant
    ? plant.lastWateredDate === today
      ? nick === 'nana'
        ? plant.water.nana
        : plant.water.gueguel
      : false
    : false

  return { plant, loading, water, alreadyWatered }
}
