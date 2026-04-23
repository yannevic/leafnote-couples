import { useState, useCallback } from 'react'
import { useSharedDice } from '../hooks/useSharedDice'

interface DieFace {
  dots: { cx: number; cy: number }[]
}

const FACES: DieFace[] = [
  { dots: [{ cx: 50, cy: 50 }] },
  {
    dots: [
      { cx: 28, cy: 28 },
      { cx: 72, cy: 72 },
    ],
  },
  {
    dots: [
      { cx: 28, cy: 28 },
      { cx: 50, cy: 50 },
      { cx: 72, cy: 72 },
    ],
  },
  {
    dots: [
      { cx: 28, cy: 28 },
      { cx: 72, cy: 28 },
      { cx: 28, cy: 72 },
      { cx: 72, cy: 72 },
    ],
  },
  {
    dots: [
      { cx: 28, cy: 28 },
      { cx: 72, cy: 28 },
      { cx: 50, cy: 50 },
      { cx: 28, cy: 72 },
      { cx: 72, cy: 72 },
    ],
  },
  {
    dots: [
      { cx: 28, cy: 22 },
      { cx: 72, cy: 22 },
      { cx: 28, cy: 50 },
      { cx: 72, cy: 50 },
      { cx: 28, cy: 78 },
      { cx: 72, cy: 78 },
    ],
  },
]

function DieFaceDisplay({ value, isRolling }: { value: number; isRolling: boolean }) {
  const face = FACES[value - 1]
  return (
    <svg
      viewBox="0 0 100 100"
      width="100%"
      height="100%"
      style={{ opacity: isRolling ? 0 : 1, transition: 'opacity 0.1s' }}
    >
      {face.dots.map((dot) => (
        <circle
          key={`${dot.cx}-${dot.cy}`}
          cx={dot.cx}
          cy={dot.cy}
          r={8}
          fill="var(--color-leaf-800)"
        />
      ))}
    </svg>
  )
}

function SingleDie({
  value,
  isRolling,
  label,
}: {
  value: number
  isRolling: boolean
  label?: string
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      {label && (
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--color-leaf-600)',
            fontFamily: "'Baloo 2', sans-serif",
          }}
        >
          {label}
        </span>
      )}
      <div
        style={{
          width: 90,
          height: 90,
          background: 'var(--color-bark-100)',
          border: '2px solid var(--color-wood-300)',
          borderRadius: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 10,
          boxShadow: '0 4px 12px rgba(44,24,16,0.15), inset 0 1px 0 rgba(255,255,255,0.6)',
          animation: isRolling ? 'diceShake 0.5s ease-in-out' : 'none',
        }}
      >
        <DieFaceDisplay value={value} isRolling={isRolling} />
      </div>
    </div>
  )
}

interface DiceProps {
  nick: 'nana' | 'gueguel'
  shared?: boolean
}

export default function Dice({ nick, shared = false }: DiceProps) {
  const [localValues, setLocalValues] = useState<number[]>([1, 1])
  const [localRolling, setLocalRolling] = useState(false)
  const [localDiceCount, setLocalDiceCount] = useState(2)
  const [localHasRolled, setLocalHasRolled] = useState(false)

  const {
    remote,
    isRolling: sharedRolling,
    rollTogether,
    rollVersus,
    setMode,
  } = useSharedDice(nick)

  const diceMode = remote?.mode ?? 'together'

  // ─── Roll local ──────────────────────────────────────────────────────────────
  const rollLocal = useCallback(() => {
    if (localRolling) return
    setLocalRolling(true)
    let frame = 0
    const frames = 8
    const interval = setInterval(() => {
      setLocalValues(
        Array.from({ length: localDiceCount }, () => Math.floor(Math.random() * 6) + 1)
      )
      frame += 1
      if (frame >= frames) {
        clearInterval(interval)
        setLocalValues(
          Array.from({ length: localDiceCount }, () => Math.floor(Math.random() * 6) + 1)
        )
        setLocalRolling(false)
        setLocalHasRolled(true)
      }
    }, 60)
  }, [localRolling, localDiceCount])

  const handleLocalDiceCount = useCallback((n: number) => {
    setLocalDiceCount(n)
    setLocalHasRolled(false)
    setLocalValues(Array.from({ length: n }, () => 1))
  }, [])

  // ─── Modo local ───────────────────────────────────────────────────────────────
  if (!shared) {
    const total = localValues.reduce((a, b) => a + b, 0)
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
          padding: '24px 16px',
          fontFamily: "'Baloo 2', sans-serif",
        }}
      >
        <DiceKeyframes />
        <div
          style={{
            display: 'flex',
            gap: 8,
            background: 'var(--color-bark-100)',
            borderRadius: 12,
            padding: 4,
            border: '1px solid var(--color-wood-300)',
          }}
        >
          {[1, 2, 3, 4].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => handleLocalDiceCount(n)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                fontSize: 14,
                fontFamily: "'Baloo 2', sans-serif",
                fontWeight: 600,
                background: localDiceCount === n ? 'var(--color-leaf-600)' : 'transparent',
                color: localDiceCount === n ? '#fff' : 'var(--color-leaf-800)',
                transition: 'all 0.15s',
              }}
            >
              {n}
            </button>
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            gap: 16,
            flexWrap: 'wrap',
            justifyContent: 'center',
            minHeight: 90,
          }}
        >
          {localValues.map((v, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <div key={`local-die-${i}`}>
              <SingleDie value={v} isRolling={localRolling} />
            </div>
          ))}
        </div>

        {localHasRolled && localDiceCount > 1 && (
          <div
            style={{
              fontSize: 15,
              color: 'var(--color-leaf-600)',
              fontWeight: 600,
              animation: 'totalPop 0.3s ease-out',
            }}
          >
            Total: {total}
          </div>
        )}

        <button
          type="button"
          onClick={rollLocal}
          disabled={localRolling}
          style={{
            padding: '10px 32px',
            borderRadius: 12,
            border: 'none',
            cursor: localRolling ? 'not-allowed' : 'pointer',
            background: localRolling ? 'var(--color-leaf-400)' : 'var(--color-leaf-600)',
            color: '#fff',
            fontSize: 15,
            fontFamily: "'Baloo 2', sans-serif",
            fontWeight: 700,
            transition: 'all 0.15s',
            boxShadow: localRolling ? 'none' : '0 3px 8px rgba(74,122,74,0.35)',
          }}
        >
          {localRolling ? 'Rolando...' : '🎲 Rolar'}
        </button>
      </div>
    )
  }

  // ─── Modo compartilhado ───────────────────────────────────────────────────────
  const nanaVal = remote?.values?.nana ?? 1
  const gueguelVal = remote?.values?.gueguel ?? 1
  const rolling = sharedRolling

  function getVersusResult() {
    const hasNana = remote?.values?.nana != null
    const hasGueguel = remote?.values?.gueguel != null
    if (!hasNana || !hasGueguel) return null
    const nana = remote!.values.nana!
    const gueg = remote!.values.gueguel!
    if (nana > gueg) return <span style={{ color: 'var(--color-leaf-600)' }}>nana ganhou! 🌸</span>
    if (gueg > nana)
      return <span style={{ color: 'var(--color-petal-400)' }}>gueguel ganhou! 🎉</span>
    return <span style={{ color: 'var(--color-bark-700)' }}>empate! 🤝</span>
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
        padding: '20px 16px',
        fontFamily: "'Baloo 2', sans-serif",
      }}
    >
      <DiceKeyframes />

      {/* Toggle modo */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          background: 'var(--color-bark-100)',
          borderRadius: 12,
          padding: 4,
          border: '1px solid var(--color-wood-300)',
        }}
      >
        {(
          [
            { id: 'together', label: '🎲 juntos' },
            { id: 'versus', label: '⚔️ disputa' },
          ] as const
        ).map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            style={{
              padding: '5px 14px',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              fontSize: 12,
              fontFamily: "'Baloo 2', sans-serif",
              fontWeight: 700,
              background: diceMode === m.id ? 'var(--color-leaf-600)' : 'transparent',
              color: diceMode === m.id ? '#fff' : 'var(--color-leaf-800)',
              transition: 'all 0.15s',
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Dados */}
      {diceMode === 'together' ? (
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          <SingleDie value={nanaVal} isRolling={rolling} />
          <SingleDie value={gueguelVal} isRolling={rolling} />
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', alignItems: 'flex-end' }}>
          <SingleDie
            value={nanaVal}
            isRolling={rolling && remote?.rolledBy === 'nana'}
            label="nana 🌸"
          />
          <SingleDie
            value={gueguelVal}
            isRolling={rolling && remote?.rolledBy === 'gueguel'}
            label="gueguel 🌿"
          />
        </div>
      )}

      {/* Resultado disputa */}
      {diceMode === 'versus' && (
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            minHeight: 20,
            animation: 'totalPop 0.3s ease-out',
          }}
        >
          {getVersusResult()}
        </div>
      )}

      {/* Botões */}
      {diceMode === 'together' ? (
        <button
          type="button"
          onClick={() => rollTogether(2)}
          disabled={rolling}
          style={{
            padding: '10px 32px',
            borderRadius: 12,
            border: 'none',
            cursor: rolling ? 'not-allowed' : 'pointer',
            background: rolling ? 'var(--color-leaf-400)' : 'var(--color-leaf-600)',
            color: '#fff',
            fontSize: 15,
            fontFamily: "'Baloo 2', sans-serif",
            fontWeight: 700,
            boxShadow: rolling ? 'none' : '0 3px 8px rgba(74,122,74,0.35)',
            transition: 'all 0.15s',
          }}
        >
          {rolling ? 'Rolando...' : '🎲 Rolar juntos'}
        </button>
      ) : (
        <button
          type="button"
          onClick={rollVersus}
          disabled={rolling}
          style={{
            padding: '10px 28px',
            borderRadius: 12,
            border: 'none',
            cursor: rolling ? 'not-allowed' : 'pointer',
            background: rolling ? 'var(--color-leaf-400)' : 'var(--color-petal-400)',
            color: '#fff',
            fontSize: 15,
            fontFamily: "'Baloo 2', sans-serif",
            fontWeight: 700,
            boxShadow: rolling ? 'none' : '0 3px 8px rgba(232,160,176,0.4)',
            transition: 'all 0.15s',
          }}
        >
          {rolling ? 'Rolando...' : `⚔️ Minha vez (${nick})`}
        </button>
      )}
    </div>
  )
}

function DiceKeyframes() {
  return (
    <style>{`
      @keyframes diceShake {
        0%   { transform: rotate(0deg)   scale(1);    }
        15%  { transform: rotate(-12deg) scale(1.08); }
        30%  { transform: rotate(10deg)  scale(1.1);  }
        45%  { transform: rotate(-8deg)  scale(1.08); }
        60%  { transform: rotate(6deg)   scale(1.05); }
        75%  { transform: rotate(-4deg)  scale(1.02); }
        90%  { transform: rotate(2deg)   scale(1.01); }
        100% { transform: rotate(0deg)   scale(1);    }
      }
      @keyframes totalPop {
        0%   { transform: scale(0.7); opacity: 0; }
        70%  { transform: scale(1.15); }
        100% { transform: scale(1);   opacity: 1; }
      }
    `}</style>
  )
}
