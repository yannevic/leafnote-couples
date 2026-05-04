import { useRef, useCallback } from 'react'
import { X, CloudRain, AlertTriangle } from 'lucide-react'
import type { CyclePinItem as CyclePinItemType } from '../types/board'
import { useCycle } from '../hooks/useCycle'

interface Props {
  item: CyclePinItemType
  zIndex: number
  onUpdate: (id: string, data: Partial<CyclePinItemType>) => void
  onDelete: (id: string) => void
  onFocus: (id: string) => void
}

function DropletFilled({ color }: { color: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="1">
      <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
    </svg>
  )
}

const STATE_CONFIG = {
  chegando: {
    color: '#F5C542',
    sublabel: 'chegando',
    icon: 'alert',
  },
  tpm: {
    color: '#9B7FD4',
    sublabel: 'tpm',
    icon: 'cloud',
  },
  active: {
    color: '#D94F4F',
    sublabel: 'menstruada',
    icon: 'droplet',
  },
  ended: null,
  none: null,
} as const

export default function CyclePinItem({ item, zIndex, onUpdate, onDelete, onFocus }: Props) {
  const dragRef = useRef({ dragging: false, moved: false, sx: 0, sy: 0, px: 0, py: 0 })
  const { currentCycle } = useCycle()

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      onFocus(item.id)
      dragRef.current = {
        dragging: true,
        moved: false,
        sx: e.clientX,
        sy: e.clientY,
        px: item.x,
        py: item.y,
      }
      e.preventDefault()
      const onMove = (ev: MouseEvent) => {
        const d = dragRef.current
        if (!d.dragging) return
        const dx = ev.clientX - d.sx
        const dy = ev.clientY - d.sy
        if (Math.abs(dx) > 4 || Math.abs(dy) > 4) d.moved = true
        onUpdate(item.id, { x: d.px + dx, y: d.py + dy })
      }
      const onUp = () => {
        dragRef.current.dragging = false
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)
      }
      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
    },
    [item.x, item.y, item.id, onUpdate, onFocus]
  )

  if (!currentCycle || currentCycle.state === 'none' || currentCycle.state === 'ended') {
    return null
  }

  const config = STATE_CONFIG[currentCycle.state]
  if (!config) return null

  return (
    <div
      data-item
      onMouseDown={onMouseDown}
      style={{
        position: 'absolute',
        left: item.x,
        top: item.y,
        width: 210,
        zIndex,
        cursor: 'grab',
        userSelect: 'none',
        fontFamily: 'Baloo 2, sans-serif',
        background: 'var(--color-background-primary, #fffaf4)',
        border: `1.5px solid ${config.color}`,
        borderRadius: 12,
        padding: '10px 16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
      }}
    >
      <div style={{ height: 3, borderRadius: 2, background: config.color, marginBottom: 9 }} />

      <div
        style={{
          fontSize: 11,
          color: 'rgba(0,0,0,0.35)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        {currentCycle.state === 'tpm' && (
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#F5C542"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        )}
        {currentCycle.state === 'chegando' && (
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="#D94F4F"
            stroke="#D94F4F"
            strokeWidth="1"
          >
            <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
          </svg>
        )}
        {config.sublabel}
      </div>

      <div
        style={{
          fontSize: 15,
          fontWeight: 700,
          color: '#2C1810',
          marginBottom: 7,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {currentCycle.state === 'tpm'
          ? 'semana de tpm'
          : currentCycle.state === 'active'
            ? 'menstruada'
            : 'vem aí'}
      </div>

      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: config.color,
          display: 'flex',
          alignItems: 'center',
          gap: 5,
        }}
      >
        {config.icon === 'alert' && <AlertTriangle size={13} color={config.color} />}
        {config.icon === 'cloud' && <CloudRain size={13} color={config.color} />}
        {config.icon === 'droplet' && <DropletFilled color={config.color} />}
        {currentCycle.label}
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation()
          onDelete(item.id)
        }}
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 2,
          opacity: 0.4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        title="desfixar"
      >
        <X size={11} color="#2C1810" />
      </button>
    </div>
  )
}
