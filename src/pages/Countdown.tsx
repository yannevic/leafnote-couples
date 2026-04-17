import { useEffect, useRef, useState } from 'react'

const REVEAL_DATE = new Date('2025-05-02T18:00:00-03:00')
const SECRET_PASSWORD = 'TROCAR_ANTES_DE_ENTREGAR'
const MAX_WRONG = 3

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function calcTimeLeft(): TimeLeft {
  const diff = REVEAL_DATE.getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

const PETALS = ['🌸', '🌺', '🌼', '🍃', '🌷', '🌹']

const petalList = Array.from({ length: 16 }, (_, i) => ({
  id: i,
  emoji: PETALS[i % PETALS.length],
  left: `${(i * 6 + 3) % 100}%`,
  duration: `${6 + (i % 5)}s`,
  delay: `${(i * 0.5) % 5}s`,
  size: `${0.9 + (i % 3) * 0.25}rem`,
}))

export default function Countdown({ onReveal }: { onReveal: () => void }) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calcTimeLeft())
  const [revealed, setRevealed] = useState(false)
  const [showInput, setShowInput] = useState(false)
  const [password, setPassword] = useState('')
  const [wrongCount, setWrongCount] = useState(0)
  const clickCount = useRef(0)
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      const t = calcTimeLeft()
      setTimeLeft(t)
      if (t.days === 0 && t.hours === 0 && t.minutes === 0 && t.seconds === 0) {
        setRevealed(true)
        clearInterval(interval)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (showInput) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [showInput])

  function handleDaysClick() {
    clickCount.current += 1
    if (clickTimer.current) clearTimeout(clickTimer.current)
    clickTimer.current = setTimeout(() => {
      clickCount.current = 0
    }, 600)
    if (clickCount.current >= 3) {
      clickCount.current = 0
      if (wrongCount < MAX_WRONG) setShowInput(true)
    }
  }

  function handlePasswordSubmit(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter') return
    if (password === SECRET_PASSWORD) {
      localStorage.setItem('app-revealed', 'true')
      onReveal()
    } else {
      const next = wrongCount + 1
      setWrongCount(next)
      setPassword('')
      if (next >= MAX_WRONG) setShowInput(false)
    }
  }

  function pad(n: number) {
    return String(n).padStart(2, '0')
  }

  if (revealed) {
    return (
      <div
        className="fixed inset-0 flex flex-col items-center justify-center"
        style={{ background: 'linear-gradient(160deg, #fdf6f0 0%, #fce8ee 50%, #f0f7f0 100%)' }}
      >
        {petalList.map((p) => (
          <span
            key={p.id}
            className="petal"
            style={{
              left: p.left,
              animationDuration: p.duration,
              animationDelay: p.delay,
              fontSize: p.size,
            }}
          >
            {p.emoji}
          </span>
        ))}

        <div className="relative z-10 text-center flex flex-col items-center gap-6">
          {/* Ilustração central */}
          <div className="flex gap-2 text-4xl">
            <span>🌷</span>
          </div>

          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold" style={{ color: '#7a4a5a' }}>
              Chegou a hora...
            </h1>
            <p className="text-sm" style={{ color: '#a07080' }}>
              fiz umas coisinhas com muito carinho para você 🍃
            </p>
          </div>

          <button
            onClick={() => {
              localStorage.setItem('app-revealed', 'true')
              onReveal()
            }}
            className="mt-2 px-10 py-3 rounded-xl font-semibold text-base transition-all hover:scale-105 active:scale-95 shadow-sm"
            style={{ backgroundColor: '#e8a0b0', color: '#5a2a3a', border: '1.5px solid #d4889a' }}
          >
            Vamos lá? 🌱
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #fdf6f0 0%, #fce8ee 60%, #f0f7f0 100%)' }}
    >
      {/* Pétalas caindo */}
      {petalList.map((p) => (
        <span
          key={p.id}
          className="petal"
          style={{
            left: p.left,
            animationDuration: p.duration,
            animationDelay: p.delay,
            fontSize: p.size,
          }}
        >
          {p.emoji}
        </span>
      ))}

      {/* Flores decorativas de canto — opacidade bem suave */}
      <div className="fixed top-6 left-8 text-4xl opacity-30 select-none">🌸</div>
      <div className="fixed top-8 right-10 text-3xl opacity-25 select-none">🌷</div>
      <div className="fixed bottom-8 left-12 text-3xl opacity-25 select-none">🍃</div>
      <div className="fixed bottom-6 right-8 text-4xl opacity-30 select-none">🌺</div>

      <div className="relative z-10 flex flex-col items-center gap-8 text-center px-6">
        {/* Ícone topo */}
        <div className="text-4xl">🌱</div>

        {/* Texto */}
        <div className="flex flex-col gap-2">
          <p
            className="text-sm tracking-widest uppercase font-medium"
            style={{ color: '#b07080', letterSpacing: '0.2em' }}
          >
            algo especial está chegando
          </p>
          <p className="text-xs" style={{ color: '#a0b890', opacity: 0.9 }}>
            aguarda com carinho 🌸
          </p>
        </div>

        {/* Contador */}
        <div className="flex items-center gap-4 select-none">
          <div className="flex flex-col items-center cursor-default" onClick={handleDaysClick}>
            <span className="text-6xl font-bold tabular-nums" style={{ color: '#7a4a5a' }}>
              {pad(timeLeft.days)}
            </span>
            <span
              className="text-xs tracking-widest uppercase mt-1 font-medium"
              style={{ color: '#b07080' }}
            >
              dias
            </span>
          </div>

          <span className="text-5xl font-light mb-5 colon-pulse" style={{ color: '#d4a0b0' }}>
            :
          </span>

          <div className="flex flex-col items-center">
            <span className="text-6xl font-bold tabular-nums" style={{ color: '#7a4a5a' }}>
              {pad(timeLeft.hours)}
            </span>
            <span
              className="text-xs tracking-widest uppercase mt-1 font-medium"
              style={{ color: '#b07080' }}
            >
              horas
            </span>
          </div>

          <span className="text-5xl font-light mb-5 colon-pulse" style={{ color: '#d4a0b0' }}>
            :
          </span>

          <div className="flex flex-col items-center">
            <span className="text-6xl font-bold tabular-nums" style={{ color: '#7a4a5a' }}>
              {pad(timeLeft.minutes)}
            </span>
            <span
              className="text-xs tracking-widest uppercase mt-1 font-medium"
              style={{ color: '#b07080' }}
            >
              min
            </span>
          </div>

          <span className="text-5xl font-light mb-5 colon-pulse" style={{ color: '#d4a0b0' }}>
            :
          </span>

          <div className="flex flex-col items-center">
            <span className="text-6xl font-bold tabular-nums" style={{ color: '#7a4a5a' }}>
              {pad(timeLeft.seconds)}
            </span>
            <span
              className="text-xs tracking-widest uppercase mt-1 font-medium"
              style={{ color: '#b07080' }}
            >
              seg
            </span>
          </div>
        </div>

        {/* Input secreto invisível */}
        {showInput && (
          <input
            ref={inputRef}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handlePasswordSubmit}
            onBlur={() => {
              setShowInput(false)
              setPassword('')
            }}
            className="w-2 h-2 opacity-0 absolute"
            autoComplete="off"
          />
        )}

        {/* Rodapé */}
        <p className="text-xs mt-2" style={{ color: '#c0a8b0', opacity: 0.5 }}>
          🌿 leafnote
        </p>
      </div>
    </div>
  )
}
