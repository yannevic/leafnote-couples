import { useState, useEffect } from 'react'
import { PlantData, subscribePlant, waterPlant, checkWilt } from '../lib/garden'

export function useGarden(uid: string, partnerUid: string) {
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
    await waterPlant(uid, partnerUid)
  }

  const alreadyWatered = plant ? plant.water[uid] === true : false

  return { plant, loading, water, alreadyWatered }
}
