import { PresenceData } from '../lib/presence'

interface Props {
  nanaPresence: PresenceData | null
  gueguelPresence: PresenceData | null
}

export default function PresenceBadge({ nanaPresence, gueguelPresence }: Props) {
  const nanaOnline = nanaPresence?.online === true
  const gueguelOnline = gueguelPresence?.online === true

  return (
    <div
      style={{
        position: 'fixed',
        top: 14,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 48,
        background: 'linear-gradient(180deg, #fdf6f0 0%, #fce8ee 100%)',
        border: '1.5px solid #e8a0b0',
        borderRadius: 14,
        padding: '6px 16px',
        fontFamily: 'Baloo 2, sans-serif',
        boxShadow: '0 2px 12px rgba(44,20,8,0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        userSelect: 'none',
      }}
    >
      {/* Nana — esquerda */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: '#7a3040' }}>nana</span>
        <span
          style={{
            fontSize: 20,
            lineHeight: 1,
            filter: nanaOnline ? 'none' : 'grayscale(1) opacity(0.45)',
          }}
        >
          {nanaOnline ? '🙆🏻‍♀️' : '🙇🏻‍♀️'}
        </span>
      </div>

      {/* divisor */}
      <div style={{ width: 1, height: 24, background: '#e8a0b0', opacity: 0.5 }} />

      {/* Gueguel — direita */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span
          style={{
            fontSize: 20,
            lineHeight: 1,
            filter: gueguelOnline ? 'none' : 'grayscale(1) opacity(0.45)',
          }}
        >
          {gueguelOnline ? '🙆🏻‍♂️' : '🙇🏻‍♂️'}
        </span>
        <span style={{ fontSize: 11, fontWeight: 800, color: '#7a3040' }}>gueguel</span>
      </div>
    </div>
  )
}
