import { useRef, useState } from 'react'
import type { TimerState } from './Timer'

function computeDisplay(state: TimerState): number {
  const elapsed = state.running
    ? state.elapsed + Math.floor((Date.now() - state.startedAt) / 1000)
    : state.elapsed
  return state.mode === 'countdown' ? Math.max(0, state.target - elapsed) : elapsed
}

function formatTime(totalSeconds: number): string {
  const m = Math.floor(Math.abs(totalSeconds) / 60)
  const s = Math.abs(totalSeconds) % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

interface TimerBarProps {
  timerState: TimerState
  onOpen: () => void
}

export default function TimerBar({ timerState, onOpen }: TimerBarProps) {
  const [pos, setPos] = useState({ x: 16, y: 16 })
  const dragRef = useRef<{ startX: number; startY: number; ox: number; oy: number } | null>(null)

  const { mode, running, elapsed, target, finished } = timerState
  const hasActivity = running || finished || elapsed > 0
  if (!hasActivity) return null

  const displaySeconds = computeDisplay(timerState)
  const progress =
    mode === 'countdown' && target > 0 ? Math.max(0, Math.min(1, displaySeconds / target)) : 0
  const isUrgent = mode === 'countdown' && displaySeconds <= 10 && displaySeconds > 0 && running

  const dotColor = finished
    ? 'var(--color-leaf-400)'
    : isUrgent
      ? 'var(--color-petal-400)'
      : running
        ? 'var(--color-leaf-600)'
        : 'var(--color-wood-400)'

  function onMouseDown(e: React.MouseEvent) {
    e.preventDefault()
    dragRef.current = { startX: e.clientX, startY: e.clientY, ox: pos.x, oy: pos.y }
    function onMove(ev: MouseEvent) {
      if (!dragRef.current) return
      setPos({
        x: Math.max(0, dragRef.current.ox + ev.clientX - dragRef.current.startX),
        y: Math.max(0, dragRef.current.oy + ev.clientY - dragRef.current.startY),
      })
    }
    function onUp() {
      dragRef.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  return (
    <>
      <style>{`
        @keyframes timerFloatPulse {
          0%,100%{box-shadow:0 4px 16px rgba(44,24,16,0.18)}
          50%{box-shadow:0 4px 20px rgba(232,160,176,0.5)}
        }
      `}</style>
      <div
        style={{
          position: 'fixed',
          left: pos.x,
          top: pos.y,
          zIndex: 55,
          background: 'rgba(245,236,215,0.97)',
          border: '1.5px solid var(--color-wood-300)',
          borderRadius: 14,
          backdropFilter: 'blur(6px)',
          userSelect: 'none',
          minWidth: 180,
          boxShadow: isUrgent
            ? '0 4px 20px rgba(232,160,176,0.5)'
            : '0 4px 16px rgba(44,24,16,0.18)',
          animation: isUrgent ? 'timerFloatPulse 1s ease-in-out infinite' : 'none',
          overflow: 'hidden',
        }}
      >
        {mode === 'countdown' && (
          <div style={{ height: 3, background: 'var(--color-wood-300)', position: 'relative' }}>
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                height: '100%',
                width: `${progress * 100}%`,
                background: isUrgent ? 'var(--color-petal-400)' : 'var(--color-leaf-600)',
                transition: 'width 0.9s linear',
              }}
            />
          </div>
        )}
        <div
          onMouseDown={onMouseDown}
          style={{
            cursor: 'grab',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span style={{ fontSize: 13 }}>{finished ? '✅' : running ? '⏱' : '⏸'}</span>
          <span
            style={{
              fontSize: 15,
              fontWeight: 800,
              fontFamily: "'Baloo 2',sans-serif",
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: 0.5,
              color: isUrgent ? 'var(--color-petal-400)' : 'var(--color-leaf-950)',
            }}
          >
            {finished ? 'pronto! 🌸' : formatTime(displaySeconds)}
          </span>
          <span
            style={{
              fontSize: 10,
              fontFamily: "'Baloo 2',sans-serif",
              fontWeight: 600,
              color: 'var(--color-leaf-600)',
              opacity: 0.75,
            }}
          >
            {mode === 'countdown' ? 'contagem' : 'cronômetro'}
          </span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: dotColor,
                boxShadow: running ? `0 0 5px ${dotColor}` : 'none',
              }}
            />
            <button
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={onOpen}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 11,
                color: 'var(--color-bark-700)',
                fontFamily: "'Baloo 2',sans-serif",
                fontWeight: 600,
                padding: '2px 6px',
                borderRadius: 6,
                opacity: 0.8,
              }}
            >
              abrir
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
