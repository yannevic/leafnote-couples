import { useState, useRef, useCallback, useEffect } from 'react'
import { BoardItemType } from '../types/board'

interface Tool {
  type: BoardItemType
  icon: string
  label: string
}

const TOOLS: Tool[] = [
  { type: 'postit', icon: '🗒️', label: 'Post-it' },
  { type: 'checklist', icon: '✅', label: 'Checklist' },
  { type: 'drawing', icon: '✏️', label: 'Desenho' },
  { type: 'tag', icon: '🏷️', label: 'Tag' },
  { type: 'letter', icon: '💌', label: 'Cartinha' },
]

interface Props {
  selected: BoardItemType | null
  editMode: boolean
  onSelect: (tool: BoardItemType | null) => void
  onToggleEdit: () => void
}

export default function Toolbar({ selected, editMode, onSelect, onToggleEdit }: Props) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ x: 20, y: -1 })
  const wrapRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef({ dragging: false, moved: false, sx: 0, sy: 0, px: 0, py: 0 })

  useEffect(() => {
    setPos((p) => ({ ...p, y: window.innerHeight / 2 - 27 }))
  }, [])

  const currentTool = TOOLS.find((t) => t.type === selected) ?? null
  const mainIcon = editMode ? '🖐️' : (currentTool?.icon ?? '❤️')

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
      {/* Badge modo mover — topo centralizado */}
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
              background: 'rgba(44,20,8,0.72)',
              color: '#fdf0e0',
              fontSize: 11,
              fontWeight: 700,
              padding: '5px 16px',
              borderRadius: 20,
              fontFamily: 'Baloo 2, sans-serif',
              letterSpacing: '0.04em',
              boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            }}
          >
            🖐️ modo mover — clique nos itens pra arrastar
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
        {/* Botões filhos — aparecem ACIMA do principal */}
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
                border:
                  isSelected && open && selected !== null
                    ? '2.5px solid rgba(255,255,255,0.8)'
                    : '2px solid #8b5a2a',
                background: 'linear-gradient(180deg, #d4956a 0%, #c4845a 40%, #b8744e 100%)',
                boxShadow:
                  isSelected && open
                    ? '0 0 0 3px rgba(255,255,255,0.35), 0 3px 10px #8b5a2a44'
                    : '0 3px 10px #8b5a2a44, inset 0 1px 0 #e8b07844',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 19,
                position: 'relative',
                transition: 'transform 0.22s cubic-bezier(.34,1.56,.64,1), opacity 0.18s',
                transitionDelay: open ? `${i * 0.04}s` : '0s',
                transform: open ? `scale(${isSelected ? 1.1 : 1})` : 'translateY(20px) scale(0.7)',
                opacity: open ? 1 : 0,
                pointerEvents: open ? 'auto' : 'none',
              }}
            >
              {tool.icon}
              <span
                style={{
                  position: 'absolute',
                  left: 50,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: '#3d2408ee',
                  color: '#fdf0e0',
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '3px 9px',
                  borderRadius: 7,
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                  letterSpacing: '0.04em',
                  fontFamily: 'Baloo 2, sans-serif',
                }}
              >
                {tool.label}
              </span>
            </div>
          )
        })}

        {/* Botão mover itens */}
        <div
          onClick={(e) => {
            e.stopPropagation()
            onToggleEdit()
          }}
          style={{
            width: 42,
            height: 42,
            borderRadius: '50%',
            border: editMode ? '2.5px solid rgba(255,255,255,0.8)' : '2px solid #8b5a2a',
            background: editMode
              ? 'linear-gradient(180deg, #7FB87F 0%, #4A7A4A 100%)'
              : 'linear-gradient(180deg, #d4956a 0%, #c4845a 40%, #b8744e 100%)',
            boxShadow: editMode
              ? '0 0 0 3px rgba(255,255,255,0.3), 0 3px 10px #2D4A2D55'
              : '0 3px 10px #8b5a2a44, inset 0 1px 0 #e8b07844',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 19,
            position: 'relative',
            transition: 'transform 0.22s cubic-bezier(.34,1.56,.64,1), opacity 0.18s',
            transitionDelay: open ? `${TOOLS.length * 0.04}s` : '0s',
            transform: open ? 'scale(1)' : 'translateY(20px) scale(0.7)',
            opacity: open ? 1 : 0,
            pointerEvents: open ? 'auto' : 'none',
          }}
        >
          🖐️
          <span
            style={{
              position: 'absolute',
              left: 50,
              top: '50%',
              transform: 'translateY(-50%)',
              background: '#3d2408ee',
              color: '#fdf0e0',
              fontSize: 10,
              fontWeight: 700,
              padding: '3px 9px',
              borderRadius: 7,
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              letterSpacing: '0.04em',
              fontFamily: 'Baloo 2, sans-serif',
            }}
          >
            {editMode ? 'modo mover ativo' : 'mover itens'}
          </span>
        </div>

        {/* Botão principal */}
        <div
          onClick={handleMainClick}
          style={{
            width: 54,
            height: 54,
            borderRadius: '50%',
            border: '2.5px solid #8b5a2a',
            background: 'linear-gradient(180deg, #d4956a 0%, #c4845a 40%, #b8744e 100%)',
            boxShadow: open
              ? '0 6px 18px #8b5a2a66, inset 0 1px 0 #e8b07844'
              : '0 4px 14px #8b5a2a55, inset 0 1px 0 #e8b07844',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 26,
            position: 'relative',
            zIndex: 2,
            flexShrink: 0,
            transition: 'transform 0.2s, box-shadow 0.2s',
            transform: open ? 'scale(1.08)' : 'scale(1)',
          }}
        >
          <span style={{ position: 'relative', zIndex: 2, lineHeight: 1, marginTop: 6 }}>
            {mainIcon}
          </span>
          <svg
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              overflow: 'hidden',
            }}
            viewBox="0 0 54 54"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 32 Q16 24 28 30 Q38 35 48 27"
              stroke="#5a2e0e"
              strokeWidth="1.2"
              fill="none"
              opacity="0.5"
            />
            <path
              d="M5 40 Q18 34 30 38 Q40 42 50 36"
              stroke="#5a2e0e"
              strokeWidth="1"
              fill="none"
              opacity="0.4"
            />
          </svg>
        </div>
      </div>
    </>
  )
}
