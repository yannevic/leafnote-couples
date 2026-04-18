import { PlantData, FlowerType } from '../../lib/garden'

interface Props {
  plant: PlantData
}

function TulipSVG({ stage, wilted }: { stage: number; wilted: boolean }) {
  const gray = wilted ? 'grayscale(1) opacity(0.5)' : 'none'
  return (
    <svg
      viewBox="0 0 100 200"
      width="160"
      height="280"
      style={{ filter: gray, transition: 'filter 0.8s' }}
    >
      <defs>
        <linearGradient id="soil-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8B5E3C" />
          <stop offset="100%" stopColor="#5C3A1E" />
        </linearGradient>
        <linearGradient id="pot-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C4956A" />
          <stop offset="100%" stopColor="#8B5A2A" />
        </linearGradient>
      </defs>

      {/* vaso */}
      <path
        d="M18 125 L8 160 Q8 168 18 168 L82 168 Q92 168 92 160 L82 125Z"
        fill="url(#pot-g)"
        stroke="#7a4a20"
        strokeWidth="1"
      />
      <ellipse
        cx="50"
        cy="125"
        rx="32"
        ry="8"
        fill="url(#soil-g)"
        stroke="#7a4a20"
        strokeWidth="1"
      />

      {/* semente */}
      {stage >= 1 && (
        <g>
          <ellipse cx="50" cy="121" rx="7" ry="5" fill="#8B6914" stroke="#5C3A1E" strokeWidth="1" />
          <path
            d="M50 121 Q54 116 58 118"
            stroke="#4a7a4a"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      )}

      {/* caule */}
      {stage >= 2 && (
        <path d="M50 123 L50 90" stroke="#4a7a4a" strokeWidth="2.5" strokeLinecap="round" />
      )}
      {stage >= 3 && (
        <path d="M50 123 L50 65" stroke="#4a7a4a" strokeWidth="2.5" strokeLinecap="round" />
      )}
      {stage >= 4 && (
        <path d="M50 123 L50 50" stroke="#4a7a4a" strokeWidth="2.5" strokeLinecap="round" />
      )}
      {stage >= 5 && (
        <path d="M50 123 L50 45" stroke="#4a7a4a" strokeWidth="2.5" strokeLinecap="round" />
      )}

      {/* broto folhinhas */}
      {stage === 2 && (
        <g>
          <path
            d="M50 98 Q42 92 40 85 Q48 88 50 95"
            fill="#7fb87f"
            stroke="#4a7a4a"
            strokeWidth="0.8"
          />
          <path
            d="M50 98 Q58 92 60 85 Q52 88 50 95"
            fill="#7fb87f"
            stroke="#4a7a4a"
            strokeWidth="0.8"
          />
        </g>
      )}

      {/* jovem folhas */}
      {stage === 3 && (
        <g>
          <path
            d="M50 100 Q36 88 30 72 Q44 80 50 95"
            fill="#7fb87f"
            stroke="#4a7a4a"
            strokeWidth="0.8"
          />
          <path
            d="M50 100 Q64 88 70 72 Q56 80 50 95"
            fill="#7fb87f"
            stroke="#4a7a4a"
            strokeWidth="0.8"
          />
          <path
            d="M50 82 Q40 72 38 60 Q50 66 50 79"
            fill="#a0d080"
            stroke="#4a7a4a"
            strokeWidth="0.8"
          />
          <path
            d="M50 82 Q60 72 62 60 Q50 66 50 79"
            fill="#a0d080"
            stroke="#4a7a4a"
            strokeWidth="0.8"
          />
        </g>
      )}

      {/* adulta — folhas completas */}
      {stage >= 4 && (
        <g>
          <path
            d="M50 98 Q38 90 28 86"
            stroke="#4a7a4a"
            strokeWidth="1.8"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M50 98 Q62 90 72 86"
            stroke="#4a7a4a"
            strokeWidth="1.8"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M50 108 Q32 96 24 80 Q42 88 50 103"
            fill="#7fb87f"
            stroke="#4a7a4a"
            strokeWidth="0.8"
          />
          <path
            d="M50 108 Q68 96 76 80 Q58 88 50 103"
            fill="#7fb87f"
            stroke="#4a7a4a"
            strokeWidth="0.8"
          />
          <path
            d="M28 86 Q18 76 16 62 Q28 70 30 84"
            fill="#a0d080"
            stroke="#4a7a4a"
            strokeWidth="0.8"
          />
          <path
            d="M72 86 Q82 76 84 62 Q72 70 70 84"
            fill="#a0d080"
            stroke="#4a7a4a"
            strokeWidth="0.8"
          />
          <path
            d="M50 72 Q38 62 36 48 Q50 56 50 69"
            fill="#c8e8a0"
            stroke="#4a7a4a"
            strokeWidth="0.8"
          />
          <path
            d="M50 72 Q62 62 64 48 Q50 56 50 69"
            fill="#c8e8a0"
            stroke="#4a7a4a"
            strokeWidth="0.8"
          />
        </g>
      )}

      {/* flor florescida */}
      {stage >= 5 && (
        <g>
          <path
            d="M50 55 Q40 38 40 20 Q50 30 50 52"
            fill="#fda4b4"
            stroke="#c04060"
            strokeWidth="0.8"
          />
          <path
            d="M50 55 Q60 38 60 20 Q50 30 50 52"
            fill="#fda4b4"
            stroke="#c04060"
            strokeWidth="0.8"
          />
          <path
            d="M50 55 Q34 42 30 22 Q46 34 50 52"
            fill="#e8607a"
            stroke="#c04060"
            strokeWidth="0.8"
          />
          <path
            d="M50 55 Q66 42 70 22 Q54 34 50 52"
            fill="#e8607a"
            stroke="#c04060"
            strokeWidth="0.8"
          />
          <path
            d="M50 55 Q44 40 46 24 Q50 34 50 53"
            fill="#fbc8d8"
            stroke="#c04060"
            strokeWidth="0.6"
          />
          <path
            d="M50 55 Q56 40 54 24 Q50 34 50 53"
            fill="#fbc8d8"
            stroke="#c04060"
            strokeWidth="0.6"
          />
          <path
            d="M50 55 Q47 40 50 22 Q53 40 50 55"
            fill="#fff0f5"
            stroke="#e8a0b0"
            strokeWidth="0.8"
          />
          <circle cx="46" cy="28" r="3" fill="white" opacity="0.45" />
          <circle cx="54" cy="32" r="2" fill="white" opacity="0.3" />
        </g>
      )}
    </svg>
  )
}

function getPlantSVG(flowerType: FlowerType, stage: number, wilted: boolean) {
  return <TulipSVG stage={stage} wilted={wilted} />
}

export default function Plant({ plant }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      {getPlantSVG(plant.flowerType, plant.stage, plant.wilted)}
      {plant.wilted && (
        <div
          style={{
            background: '#f0e8e8',
            border: '1.5px solid #e8a0b0',
            borderRadius: 12,
            padding: '8px 18px',
            fontSize: 12,
            color: '#7a3040',
            fontFamily: 'Baloo 2, sans-serif',
            fontWeight: 700,
            textAlign: 'center',
          }}
        >
          🥀 reguem juntos pra recuperar a plantinha!
        </div>
      )}
    </div>
  )
}
