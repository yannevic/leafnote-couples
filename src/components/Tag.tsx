import { useState, useRef, useCallback } from 'react'
import { TagItem } from '../types/board'

const TAG_COLORS = [
  { bg: '#f5d5dc', border: '#e8a0b0', text: '#7a3040' },
  { bg: '#d1fae5', border: '#6ee7b7', text: '#065f46' },
  { bg: '#dbeafe', border: '#93c5fd', text: '#1e3a5f' },
  { bg: '#fef9c3', border: '#fde047', text: '#713f12' },
  { bg: '#ede9fe', border: '#c4b5fd', text: '#4c1d95' },
  { bg: '#fee2e2', border: '#fca5a5', text: '#7f1d1d' },
]

interface Props {
  item: TagItem
  editMode: boolean
  zIndex: number
  onUpdate: (id: string, data: Partial<TagItem>) => void
  onDelete: (id: string) => void
  onBringForward: (id: string) => void
  onSendBackward: (id: string) => void
  onFocus: (id: string) => void
}

export default function Tag({
  item,
  editMode,
  zIndex,
  onUpdate,
  onDelete,
  onBringForward,
  onSendBackward,
  onFocus,
}: Props) {
  const [editing, setEditing] = useState(false)
  const [label, setLabel] = useState(item.label)
  const [showMenu, setShowMenu] = useState(false)
  const dragRef = useRef({ dragging: false, moved: false, sx: 0, sy: 0, px: 0, py: 0 })

  const colorIdx = parseInt(item.color, 10) % TAG_COLORS.length
  const colors = TAG_COLORS[colorIdx] ?? TAG_COLORS[0]

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!editMode || editing) return
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
    [editMode, editing, item.x, item.y, item.id, onUpdate, onFocus]
  )

  const handleBlur = () => {
    setEditing(false)
    onUpdate(item.id, { label: label.trim() || 'tag' })
  }

  return (
    <div
      data-item
      onMouseDown={onMouseDown}
      onDoubleClick={() => {
        if (!editMode) setEditing(true)
      }}
      onMouseEnter={() => setShowMenu(true)}
      onMouseLeave={() => setShowMenu(false)}
      style={{
        position: 'absolute',
        left: item.x,
        top: item.y,
        background: colors.bg,
        border: `1.5px solid ${colors.border}`,
        borderRadius: 20,
        padding: '4px 14px',
        boxShadow: '2px 2px 8px rgba(44,20,8,0.15)',
        cursor: editMode ? 'grab' : 'default',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontFamily: 'Baloo 2, sans-serif',
        zIndex,
      }}
    >
      {editing ? (
        <input
          autoFocus
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleBlur()
          }}
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: 11,
            fontWeight: 700,
            color: colors.text,
            width: Math.max(60, label.length * 8),
            fontFamily: 'Baloo 2, sans-serif',
          }}
        />
      ) : (
        <span style={{ fontSize: 11, fontWeight: 700, color: colors.text }}>{label}</span>
      )}

      {editMode && showMenu && !editing && (
        <div style={{ display: 'flex', gap: 2, marginLeft: 4 }}>
          <CtxBtn
            label="↑"
            onClick={(e) => {
              e.stopPropagation()
              onBringForward(item.id)
            }}
          />
          <CtxBtn
            label="↓"
            onClick={(e) => {
              e.stopPropagation()
              onSendBackward(item.id)
            }}
          />
          <CtxBtn
            label="✕"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(item.id)
            }}
          />
        </div>
      )}
    </div>
  )
}

function CtxBtn({ label, onClick }: { label: string; onClick: (e: React.MouseEvent) => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 14,
        height: 14,
        borderRadius: '50%',
        background: 'rgba(44,20,8,0.15)',
        border: 'none',
        cursor: 'pointer',
        fontSize: 8,
        color: '#3d2408',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
      }}
    >
      {label}
    </button>
  )
}
