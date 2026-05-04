import { PresenceData } from '../lib/presence'

interface Props {
  myPresence: PresenceData | null
  partnerPresence: PresenceData | null
  mySex: 'female' | 'male' | null
  partnerSex: 'female' | 'male' | null
}

export default function PresenceBadge({ myPresence, partnerPresence, mySex, partnerSex }: Props) {
  const myOnline = myPresence?.online === true
  const partnerOnline = partnerPresence?.online === true
  const myName = myPresence?.displayName ?? '...'
  const partnerName = partnerPresence?.displayName ?? '...'

  return (
    <div
      style={{
        position: 'fixed',
        top: 48,
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
      {/* eu — esquerda */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: '#7a3040' }}>{myName}</span>
        <span
          style={{
            fontSize: 20,
            lineHeight: 1,
            filter: myOnline ? 'none' : 'grayscale(1) opacity(0.45)',
          }}
        >
          {mySex === 'male' ? (myOnline ? '🙆🏻‍♂️' : '🙇🏻‍♂️') : myOnline ? '🙆🏻‍♀️' : '🙇🏻‍♀️'}
        </span>
      </div>

      {/* divisor */}
      <div style={{ width: 1, height: 24, background: '#e8a0b0', opacity: 0.5 }} />

      {/* parceiro — direita */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span
          style={{
            fontSize: 20,
            lineHeight: 1,
            filter: partnerOnline ? 'none' : 'grayscale(1) opacity(0.45)',
          }}
        >
          {partnerSex === 'female' ? (partnerOnline ? '🙆🏻‍♀️' : '🙇🏻‍♀️') : partnerOnline ? '🙆🏻‍♂️' : '🙇🏻‍♂️'}
        </span>
        <span style={{ fontSize: 11, fontWeight: 800, color: '#7a3040' }}>{partnerName}</span>
      </div>
    </div>
  )
}
