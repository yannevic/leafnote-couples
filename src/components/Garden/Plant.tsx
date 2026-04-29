import { PlantData, FLOWERS } from '../../lib/garden'
import { getFlowerImage } from '../../assets/garden'

interface PlantProps {
  plant: PlantData
  onClick: () => void
}

export default function Plant({ plant, onClick }: PlantProps) {
  const imgSrc = getFlowerImage(plant.flowerType, plant.stage)
  const info = FLOWERS[plant.flowerType]

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 cursor-pointer group"
      style={{ background: 'none', border: 'none', padding: 0 }}
      title={`${info.name} — Estágio ${plant.stage}`}
    >
      <span
        className="text-xs"
        style={{
          color: 'var(--color-leaf-600)',
          minHeight: 18,
          display: 'block',
          fontFamily: 'Baloo 2, sans-serif',
          fontWeight: 600,
        }}
      >
        {plant.stage >= 5 ? 'Florescida' : ''}
      </span>
      <img
        src={imgSrc}
        alt={`${info.name} estágio ${plant.stage}`}
        style={{
          width: 80,
          height: 224,
          objectFit: 'contain',
          filter: plant.wilted ? 'grayscale(100%) brightness(0.7)' : 'none',
          transition: 'filter 0.3s',
        }}
      />
      <span
        className="text-xs font-semibold"
        style={{ color: 'var(--color-bark-700)', fontFamily: 'Baloo 2, sans-serif' }}
      >
        {info.emoji} {info.name}
      </span>
      {plant.wilted && (
        <span className="text-xs" style={{ color: '#c87090' }}>
          Murcha
        </span>
      )}
    </button>
  )
}
