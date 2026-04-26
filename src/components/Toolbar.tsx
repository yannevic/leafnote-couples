import { useState, useRef, useCallback, useEffect } from 'react'
import {
  StickyNote,
  CheckSquare,
  Pencil,
  Tag as TagIcon,
  Mail,
  Trash2,
  Hand,
  Plus,
} from 'lucide-react'
import { BoardItemType } from '../types/board'

interface Tool {
  type: BoardItemType
  icon: React.ReactNode
  label: string
  color: string
  shadow: string
}

const TOOLS: Tool[] = [
  {
    type: 'postit',
    icon: <StickyNote size={18} strokeWidth={2} />,
    label: 'Post-it',
    color: 'linear-gradient(145deg, #fef9c3, #d4a84b)',
    shadow: '0 3px 10px #d4a84b33',
  },
  {
    type: 'checklist',
    icon: <CheckSquare size={18} strokeWidth={2} />,
    label: 'Checklist',
    color: 'linear-gradient(145deg, #d1fae5, #5a9e80)',
    shadow: '0 3px 10px #5a9e8033',
  },
  {
    type: 'drawing',
    icon: <Pencil size={18} strokeWidth={2} />,
    label: 'Desenho',
    color: 'linear-gradient(145deg, #ede9fe, #8b72c8)',
    shadow: '0 3px 10px #8b72c833',
  },
  {
    type: 'tag',
    icon: <TagIcon size={18} strokeWidth={2} />,
    label: 'Tag',
    color: 'linear-gradient(145deg, #dbeafe, #6494c4)',
    shadow: '0 3px 10px #6494c433',
  },
  {
    type: 'letter',
    icon: <Mail size={18} strokeWidth={2} />,
    label: 'Cartinha',
    color: 'linear-gradient(145deg, #fce8ee, #d4809a)',
    shadow: '0 3px 10px #d4809a33',
  },
]

const LABEL_STYLE: React.CSSProperties = {
  position: 'absolute',
  left: 50,
  top: '50%',
  transform: 'translateY(-50%)',
  background: '#1e1208cc',
  color: '#fdf0e0',
  fontSize: 10,
  fontWeight: 700,
  padding: '3px 9px',
  borderRadius: 7,
  whiteSpace: 'nowrap',
  pointerEvents: 'none',
  letterSpacing: '0.04em',
  fontFamily: 'Baloo 2, sans-serif',
  backdropFilter: 'blur(4px)',
}

interface Props {
  selected: BoardItemType | null
  editMode: boolean
  onSelect: (tool: BoardItemType | null) => void
  onToggleEdit: () => void
  onOpenTrash: () => void
  trashCount: number
}

export default function Toolbar({
  selected,
  editMode,
  onSelect,
  onToggleEdit,
  onOpenTrash,
  trashCount,
}: Props) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ x: 20, y: -1 })
  const wrapRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef({ dragging: false, moved: false, sx: 0, sy: 0, px: 0, py: 0 })

  useEffect(() => {
    setPos((p) => ({ ...p, y: window.innerHeight / 2 - 27 }))
  }, [])

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      dragRef.current = {
        dragging: true,
        moved: false,
        sx: e.clientX,
        sy: e.clientY,
        px: pos.x,
        py: pos.y,
      }
      e.preventDefault()
    },
    [pos]
  )

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const d = dragRef.current
      if (!d.dragging) return
      const dx = e.clientX - d.sx
      const dy = e.clientY - d.sy
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) d.moved = true
      setPos({
        x: Math.max(0, Math.min(window.innerWidth - 70, d.px + dx)),
        y: Math.max(0, Math.min(window.innerHeight - 70, d.py + dy)),
      })
    }
    const onUp = () => {
      dragRef.current.dragging = false
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  const handleMainClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (dragRef.current.moved) return
    setOpen((o) => !o)
  }

  const handleChildClick = (e: React.MouseEvent, tool: BoardItemType) => {
    e.stopPropagation()
    onSelect(tool)
    setOpen(false)
  }

  const handleBoardClick = useCallback(() => {
    setOpen(false)
  }, [])
  useEffect(() => {
    window.addEventListener('click', handleBoardClick)
    return () => window.removeEventListener('click', handleBoardClick)
  }, [handleBoardClick])

  if (pos.y < 0) return null

  return (
    <>
      {/* Badge modo mover */}
      <div
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          width: '100%',
          pointerEvents: 'none',
          zIndex: 49,
          display: 'flex',
          justifyContent: 'center',
          paddingTop: 14,
        }}
      >
        {editMode && (
          <div
            style={{
              background: 'rgba(30,18,8,0.78)',
              color: '#fdf0e0',
              fontSize: 11,
              fontWeight: 700,
              padding: '5px 16px',
              borderRadius: 20,
              fontFamily: 'Baloo 2, sans-serif',
              letterSpacing: '0.04em',
              boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Hand size={12} />
            modo mover — clique nos itens pra arrastar
          </div>
        )}
      </div>

      {/* Toolbar flutuante */}
      <div
        ref={wrapRef}
        onMouseDown={onMouseDown}
        style={{
          position: 'fixed',
          left: pos.x,
          top: pos.y,
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
          cursor: dragRef.current.dragging ? 'grabbing' : 'grab',
          userSelect: 'none',
        }}
      >
        {/* Ferramentas */}
        {TOOLS.map((tool, i) => {
          const isSelected = tool.type === selected
          return (
            <div
              key={tool.type}
              onClick={(e) => handleChildClick(e, tool.type)}
              style={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                border: isSelected && open ? '2.5px solid rgba(255,255,255,0.9)' : 'none',
                background: tool.color,
                boxShadow:
                  isSelected && open
                    ? `0 0 0 3px rgba(255,255,255,0.3), ${tool.shadow}`
                    : tool.shadow,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                position: 'relative',
                transition: 'transform 0.22s cubic-bezier(.34,1.56,.64,1), opacity 0.18s',
                transitionDelay: open ? `${i * 0.04}s` : '0s',
                transform: open ? `scale(${isSelected ? 1.15 : 1})` : 'translateY(20px) scale(0.7)',
                opacity: open ? 1 : 0,
                pointerEvents: open ? 'auto' : 'none',
              }}
            >
              {tool.icon}
              <span style={LABEL_STYLE}>{tool.label}</span>
            </div>
          )
        })}

        {/* Lixeira */}
        <div
          onClick={(e) => {
            e.stopPropagation()
            onOpenTrash()
            setOpen(false)
          }}
          style={{
            width: 42,
            height: 42,
            borderRadius: '50%',
            border: 'none',
            background: 'linear-gradient(145deg, #fee2e2, #c47a7a)',
            boxShadow: '0 3px 10px #c47a7a33',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            position: 'relative',
            transition: 'transform 0.22s cubic-bezier(.34,1.56,.64,1), opacity 0.18s',
            transitionDelay: open ? `${(TOOLS.length + 1) * 0.04}s` : '0s',
            transform: open ? 'scale(1)' : 'translateY(20px) scale(0.7)',
            opacity: open ? 1 : 0,
            pointerEvents: open ? 'auto' : 'none',
          }}
        >
          <Trash2 size={18} strokeWidth={2} />
          {trashCount > 0 && (
            <div
              style={{
                position: 'absolute',
                top: -4,
                right: -4,
                width: 15,
                height: 15,
                borderRadius: '50%',
                background: '#1e1208',
                border: '2px solid #fff',
                fontSize: 8,
                fontWeight: 700,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Baloo 2, sans-serif',
              }}
            >
              {trashCount}
            </div>
          )}
          <span style={LABEL_STYLE}>lixeira {trashCount > 0 ? `(${trashCount})` : ''}</span>
        </div>

        {/* Mover itens */}
        <div
          onClick={(e) => {
            e.stopPropagation()
            onToggleEdit()
          }}
          style={{
            width: 42,
            height: 42,
            borderRadius: '50%',
            border: editMode ? '2.5px solid rgba(255,255,255,0.9)' : 'none',
            background: editMode
              ? 'linear-gradient(145deg, #ccfbf1, #4a9e8a)'
              : 'linear-gradient(145deg, #d4f5ee, #7abfb0)',
            boxShadow: editMode
              ? '0 0 0 3px rgba(255,255,255,0.25), 0 3px 12px #4a9e8a33'
              : '0 3px 10px #7abfb033',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            position: 'relative',
            transition: 'transform 0.22s cubic-bezier(.34,1.56,.64,1), opacity 0.18s',
            transitionDelay: open ? `${TOOLS.length * 0.04}s` : '0s',
            transform: open ? 'scale(1)' : 'translateY(20px) scale(0.7)',
            opacity: open ? 1 : 0,
            pointerEvents: open ? 'auto' : 'none',
          }}
        >
          <Hand size={18} strokeWidth={2} />
          <span style={LABEL_STYLE}>{editMode ? 'modo mover ativo' : 'mover itens'}</span>
        </div>

        {/* Botão principal */}
        <div
          onClick={handleMainClick}
          style={{
            width: 54,
            height: 54,
            borderRadius: '50%',
            border: 'none',
            background: open
              ? 'linear-gradient(145deg, #e0d7f8, #7c6ab8)'
              : 'linear-gradient(145deg, #ede9fe, #9b8ac4)',
            boxShadow: open
              ? '0 6px 20px #7c6ab833, 0 0 0 4px rgba(180,160,240,0.2)'
              : '0 4px 14px #9b8ac433',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            position: 'relative',
            zIndex: 2,
            flexShrink: 0,
            transition: 'transform 0.2s, box-shadow 0.2s, background 0.2s',
            transform: open ? 'scale(1.08)' : 'scale(1)',
          }}
        >
          <div
            style={{
              transition: 'transform 0.25s cubic-bezier(.34,1.56,.64,1)',
              transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {editMode ? <Hand size={24} strokeWidth={2} /> : <Plus size={24} strokeWidth={2.5} />}
          </div>
        </div>
      </div>
    </>
  )
}
