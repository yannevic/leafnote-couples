interface Props {
  alreadyWatered: boolean
  partnerWatered: boolean
  onWater: () => void
}

export default function WaterButton({ alreadyWatered, partnerWatered, onWater }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <button
        onClick={onWater}
        disabled={alreadyWatered}
        style={{
          padding: '10px 28px',
          borderRadius: 14,
          background: alreadyWatered
            ? 'linear-gradient(180deg, #a0d080 0%, #7fb87f 100%)'
            : 'linear-gradient(180deg, #4a7a4a 0%, #2d4a2d 100%)',
          border: '2px solid #2d4a2d',
          color: '#fff',
          fontFamily: 'Baloo 2, sans-serif',
          fontWeight: 800,
          fontSize: 14,
          cursor: alreadyWatered ? 'default' : 'pointer',
          boxShadow: '0 3px 12px rgba(44,74,44,0.3)',
          opacity: alreadyWatered ? 0.75 : 1,
          transition: 'all 0.2s',
        }}
      >
        {alreadyWatered ? 'regado hoje 💧' : 'regar 🪣'}
      </button>
      <div
        style={{
          fontSize: 11,
          color: '#4a7a4a',
          fontFamily: 'Baloo 2, sans-serif',
          fontWeight: 600,
        }}
      >
        {partnerWatered ? 'par já regou hoje 🌿' : 'par ainda não regou hoje'}
      </div>
    </div>
  )
}
