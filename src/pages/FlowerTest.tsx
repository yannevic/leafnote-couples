import { useState } from 'react'
import Plant from '../components/Garden/Plant'
import { FlowerType, PlantData } from '../lib/garden'

const FLOWERS: FlowerType[] = ['rosa', 'tulipa', 'margarida', 'girassol', 'orquidea', 'especial']

export default function FlowerTest() {
  const [flower, setFlower] = useState<FlowerType>('rosa')
  const [stage, setStage] = useState(0)
  const [wilted, setWilted] = useState(false)

  const plant: PlantData = {
    flowerType: flower,
    stage,
    daysWatered: 0,
    lastWateredDate: null,
    water: { nana: false, gueguel: false },
    wilted,
    unlockedAt: '',
  }

  return (
    <div
      style={{
        padding: 32,
        fontFamily: 'Baloo 2, sans-serif',
        background: '#F5ECD7',
        minHeight: '100vh',
      }}
    >
      <h1 style={{ color: '#8B6914', marginBottom: 24 }}>🌸 Teste de Flores</h1>

      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        {FLOWERS.map((f) => (
          <button
            key={f}
            onClick={() => setFlower(f)}
            style={{
              padding: '8px 18px',
              borderRadius: 12,
              border: '2px solid',
              borderColor: flower === f ? '#4A7A4A' : '#C4956A',
              background: flower === f ? '#4A7A4A' : 'white',
              color: flower === f ? 'white' : '#4A7A4A',
              fontFamily: 'Baloo 2, sans-serif',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24, alignItems: 'center' }}>
        <span style={{ color: '#2D4A2D', fontWeight: 700 }}>Estágio:</span>
        {[0, 1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            onClick={() => setStage(s)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              border: '2px solid',
              borderColor: stage === s ? '#4A7A4A' : '#C4956A',
              background: stage === s ? '#4A7A4A' : 'white',
              color: stage === s ? 'white' : '#4A7A4A',
              fontFamily: 'Baloo 2, sans-serif',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {s}
          </button>
        ))}

        <button
          onClick={() => setWilted(!wilted)}
          style={{
            marginLeft: 16,
            padding: '8px 18px',
            borderRadius: 12,
            border: '2px solid',
            borderColor: wilted ? '#c04060' : '#C4956A',
            background: wilted ? '#c04060' : 'white',
            color: wilted ? 'white' : '#c04060',
            fontFamily: 'Baloo 2, sans-serif',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {wilted ? '🥀 murchada' : '💧 saudável'}
        </button>
      </div>

      <Plant plant={plant} />
    </div>
  )
}
