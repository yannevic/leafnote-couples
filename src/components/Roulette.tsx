import { useState, useRef, useEffect, useCallback } from 'react'

const COLORS = [
  '#e8a0b0',
  '#7fb87f',
  '#f5c87a',
  '#89c4e1',
  '#c4956a',
  '#c87090',
  '#a8d8a8',
  '#f5d5dc',
]

export default function Roulette() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [options, setOptions] = useState(['opção 1', 'opção 2', 'opção 3'])
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [resultIdx, setResultIdx] = useState<number | null>(null)
  const currentAngleRef = useRef(0)

  const draw = useCallback(
    (angle: number) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      const cx = 120,
        cy = 120,
        r = 110
      ctx.clearRect(0, 0, 240, 240)

      if (options.length === 0) {
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.fillStyle = '#eaf5ea'
        ctx.fill()
        ctx.strokeStyle = '#a8d8a8'
        ctx.lineWidth = 3
        ctx.stroke()
        ctx.fillStyle = '#4a7a4a'
        ctx.font = 'bold 13px "Baloo 2", sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('adicione opções', cx, cy)
        return
      }

      const slice = (Math.PI * 2) / options.length
      options.forEach((opt, i) => {
        const start = angle + i * slice
        const end = start + slice
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.arc(cx, cy, r, start, end)
        ctx.closePath()
        ctx.fillStyle = COLORS[i % COLORS.length]
        ctx.fill()
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 2
        ctx.stroke()

        ctx.save()
        ctx.translate(cx, cy)
        ctx.rotate(start + slice / 2)
        ctx.textAlign = 'right'
        ctx.fillStyle = '#2d1a08'
        ctx.font = `bold ${options.length > 6 ? 11 : 13}px "Baloo 2", sans-serif`
        const maxLen = 14
        const label = opt.length > maxLen ? `${opt.slice(0, maxLen)}…` : opt
        ctx.fillText(label, r - 10, 4)
        ctx.restore()
      })

      ctx.beginPath()
      ctx.arc(cx, cy, 18, 0, Math.PI * 2)
      ctx.fillStyle = '#fff'
      ctx.fill()
      ctx.strokeStyle = '#c4956a'
      ctx.lineWidth = 3
      ctx.stroke()
    },
    [options]
  )

  useEffect(() => {
    draw(currentAngleRef.current)
  }, [draw])

  const handleSpin = useCallback(() => {
    if (spinning || options.length < 2) return
    setSpinning(true)
    setResult(null)
    setResultIdx(null)

    const slice = (Math.PI * 2) / options.length
    const extraSpins = Math.PI * 2 * (5 + Math.random() * 5)
    const targetIdx = Math.floor(Math.random() * options.length)
    const targetAngle = -(targetIdx * slice + slice / 2) + Math.PI * 1.5
    const startAngle = currentAngleRef.current
    const totalRotation =
      extraSpins + ((((targetAngle - startAngle) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2))
    const duration = 3000
    const startTime = performance.now()

    function animate(now: number) {
      const t = Math.min((now - startTime) / duration, 1)
      const ease = 1 - Math.pow(1 - t, 4)
      currentAngleRef.current = startAngle + totalRotation * ease
      draw(currentAngleRef.current)

      if (t < 1) {
        requestAnimationFrame(animate)
        return
      }

      currentAngleRef.current = startAngle + totalRotation
      draw(currentAngleRef.current)

      const finalSlice = (Math.PI * 2) / options.length
      const normalized =
        (((-currentAngleRef.current + Math.PI * 1.5) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
      const winnerIdx = Math.floor(normalized / finalSlice) % options.length
      setResultIdx(winnerIdx)
      setResult(options[winnerIdx])
      setSpinning(false)
    }

    requestAnimationFrame(animate)
  }, [spinning, options, draw])

  const handleRemoveResult = useCallback(() => {
    if (resultIdx === null) return
    setOptions((prev) => prev.filter((_, i) => i !== resultIdx))
    setResult(null)
    setResultIdx(null)
  }, [resultIdx])

  const handleAddOption = useCallback(() => {
    setOptions((prev) => [...prev, 'nova opção'])
  }, [])

  const handleChangeOption = useCallback((i: number, value: string) => {
    setOptions((prev) => prev.map((opt, idx) => (idx === i ? value : opt)))
  }, [])

  const handleRemoveOption = useCallback((i: number) => {
    setOptions((prev) => prev.filter((_, idx) => idx !== i))
    setResult(null)
    setResultIdx(null)
  }, [])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 14,
        padding: '16px 12px',
        fontFamily: "'Baloo 2', sans-serif",
      }}
    >
      {/* roleta */}
      <div style={{ position: 'relative', width: 240, height: 240, flexShrink: 0 }}>
        <canvas ref={canvasRef} width={240} height={240} style={{ display: 'block' }} />
        <div
          style={{
            position: 'absolute',
            top: -8,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '10px solid transparent',
            borderRight: '10px solid transparent',
            borderTop: '20px solid #7a3040',
            filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.25))',
          }}
        />
      </div>

      {/* resultado */}
      {result !== null && (
        <div
          style={{
            background: '#fdf6f0',
            border: '1.5px solid #e8a0b0',
            borderRadius: 12,
            padding: '8px 24px',
            fontSize: 15,
            fontWeight: 800,
            color: '#5a1028',
            textAlign: 'center',
            animation: 'resultPop 0.3s ease-out',
          }}
        >
          {result} 🎉
        </div>
      )}

      {/* botão remover resultado */}
      {result !== null && options.length > 1 && (
        <button
          type="button"
          onClick={handleRemoveResult}
          style={{
            padding: '5px 16px',
            borderRadius: 10,
            border: '1.5px solid #e8a0b0',
            background: '#fdf6f0',
            color: '#7a3040',
            fontFamily: "'Baloo 2', sans-serif",
            fontWeight: 700,
            fontSize: 11,
            cursor: 'pointer',
          }}
        >
          remover e girar dnv 🔄
        </button>
      )}

      {/* botão girar */}
      <button
        type="button"
        onClick={handleSpin}
        disabled={spinning || options.length < 2}
        style={{
          padding: '9px 32px',
          borderRadius: 12,
          border: 'none',
          cursor: spinning || options.length < 2 ? 'not-allowed' : 'pointer',
          background:
            spinning || options.length < 2
              ? 'var(--color-leaf-400, #7fb87f)'
              : 'var(--color-leaf-600, #4a7a4a)',
          color: '#fff',
          fontSize: 14,
          fontFamily: "'Baloo 2', sans-serif",
          fontWeight: 700,
          boxShadow: spinning ? 'none' : '0 3px 8px rgba(74,122,74,0.35)',
          transition: 'all 0.15s',
        }}
      >
        {spinning ? 'girando...' : 'girar 🎲'}
      </button>

      {/* lista de opções */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {options.map((opt, i) => (
          <div
            key={`opt-${i}`} // eslint-disable-line react/no-array-index-key
            style={{ display: 'flex', gap: 6, alignItems: 'center' }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: COLORS[i % COLORS.length],
                border: '1.5px solid rgba(0,0,0,0.1)',
                flexShrink: 0,
              }}
            />
            <input
              type="text"
              value={opt}
              onChange={(e) => handleChangeOption(i, e.target.value)}
              style={{
                flex: 1,
                padding: '5px 10px',
                borderRadius: 8,
                border: '1.5px solid #a8d8a8',
                background: '#eaf5ea',
                color: '#2d4a2d',
                fontFamily: "'Baloo 2', sans-serif",
                fontSize: 12,
                outline: 'none',
              }}
            />
            <button
              type="button"
              onClick={() => handleRemoveOption(i)}
              style={{
                width: 26,
                height: 26,
                borderRadius: 8,
                border: '1.5px solid #e8a0b0',
                background: '#fdf6f0',
                color: '#7a3040',
                fontSize: 13,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleAddOption}
        style={{
          width: '100%',
          padding: '6px',
          borderRadius: 8,
          border: '1.5px dashed #a8d8a8',
          background: 'transparent',
          color: '#4a7a4a',
          fontFamily: "'Baloo 2', sans-serif",
          fontSize: 12,
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        + adicionar opção
      </button>

      <style>{`
        @keyframes resultPop {
          0%   { transform: scale(0.7); opacity: 0; }
          70%  { transform: scale(1.1); }
          100% { transform: scale(1);   opacity: 1; }
        }
      `}</style>
    </div>
  )
}
