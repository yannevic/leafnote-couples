import { useState, useRef, useEffect } from 'react'
import { Plus, Trash2, LayoutDashboard } from 'lucide-react'
import { BoardMeta, DEFAULT_BOARD_ID } from '../lib/boards'

interface BoardSwitcherProps {
  extraBoards: BoardMeta[]
  activeBoardId: string
  onSwitch: (id: string) => void
  onAdd: (name: string) => void
  onRemove: (id: string) => void
}

export default function BoardSwitcher({
  extraBoards,
  activeBoardId,
  onSwitch,
  onAdd,
  onRemove,
}: BoardSwitcherProps) {
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Fecha ao clicar fora
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
        setCreating(false)
        setNewName('')
        setConfirmDelete(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Foca o input ao abrir criação
  useEffect(() => {
    if (creating) inputRef.current?.focus()
  }, [creating])

  const activeLabel =
    activeBoardId === DEFAULT_BOARD_ID
      ? 'início'
      : (extraBoards.find((b) => b.id === activeBoardId)?.name ?? 'mural')

  const handleAdd = () => {
    if (!newName.trim()) return
    onAdd(newName.trim())
    setNewName('')
    setCreating(false)
    setOpen(false)
  }

  const handleRemove = (id: string) => {
    if (confirmDelete === id) {
      onRemove(id)
      setConfirmDelete(null)
    } else {
      setConfirmDelete(id)
    }
  }

  return (
    <div ref={panelRef} style={{ position: 'relative' }}>
      {/* Botão principal */}
      <button
        onClick={() => {
          setOpen((v) => !v)
          setCreating(false)
          setNewName('')
          setConfirmDelete(null)
        }}
        title="trocar de mural"
        style={
          {
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            background: open ? 'rgba(196,149,106,0.25)' : 'rgba(196,149,106,0.12)',
            border: '1px solid rgba(196,149,106,0.4)',
            borderRadius: 8,
            padding: '3px 9px',
            cursor: 'pointer',
            fontFamily: 'Baloo 2, sans-serif',
            fontSize: 11,
            fontWeight: 700,
            color: '#f5ecd7',
            transition: 'background 0.15s',
            WebkitAppRegion: 'no-drag',
          } as React.CSSProperties
        }
      >
        <LayoutDashboard size={12} strokeWidth={2.5} />
        <span
          style={{
            maxWidth: 80,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {activeLabel}
        </span>
        <span style={{ fontSize: 8, opacity: 0.6, marginLeft: 1 }}>{open ? '▲' : '▼'}</span>
      </button>

      {/* Painel dropdown */}
      {open && (
        <div
          style={{
            position: 'fixed',
            top: 44,
            // alinha pelo centro do botão — aproximado
            left: 'auto',
            zIndex: 9999,
            background: 'linear-gradient(160deg, #2d1a0e 0%, #3d2408 100%)',
            border: '1.5px solid #8b5a2a',
            borderRadius: 12,
            boxShadow: '0 8px 28px rgba(0,0,0,0.55)',
            minWidth: 200,
            padding: '8px 0',
            fontFamily: 'Baloo 2, sans-serif',
          }}
        >
          {/* Mural padrão — sempre primeiro, não pode apagar */}
          <BoardItem
            label="🏠 início"
            active={activeBoardId === DEFAULT_BOARD_ID}
            canDelete={false}
            onSelect={() => {
              onSwitch(DEFAULT_BOARD_ID)
              setOpen(false)
            }}
            onDelete={() => {}}
            confirmDelete={false}
          />

          {/* Murais extras */}
          {extraBoards.map((b, idx) => (
            <BoardItem
              key={b.id}
              label={`${idx + 2}. ${b.name}`}
              active={activeBoardId === b.id}
              canDelete
              onSelect={() => {
                onSwitch(b.id)
                setOpen(false)
                setConfirmDelete(null)
              }}
              onDelete={() => handleRemove(b.id)}
              confirmDelete={confirmDelete === b.id}
            />
          ))}

          {/* Divisor */}
          <div style={{ margin: '6px 12px', borderTop: '1px solid rgba(196,149,106,0.2)' }} />

          {/* Criação de novo mural */}
          {creating ? (
            <div style={{ padding: '6px 12px', display: 'flex', gap: 6, alignItems: 'center' }}>
              <input
                ref={inputRef}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAdd()
                  if (e.key === 'Escape') {
                    setCreating(false)
                    setNewName('')
                  }
                }}
                placeholder="nome do mural"
                maxLength={24}
                style={{
                  flex: 1,
                  background: 'rgba(245,236,215,0.1)',
                  border: '1px solid rgba(196,149,106,0.5)',
                  borderRadius: 7,
                  padding: '5px 8px',
                  fontSize: 11,
                  color: '#f5ecd7',
                  fontFamily: 'Baloo 2, sans-serif',
                  outline: 'none',
                }}
              />
              <button
                onClick={handleAdd}
                disabled={!newName.trim()}
                style={{
                  background: newName.trim() ? '#c4956a' : 'rgba(196,149,106,0.2)',
                  border: 'none',
                  borderRadius: 7,
                  padding: '5px 10px',
                  fontSize: 11,
                  color: newName.trim() ? '#3d2408' : '#8b6914',
                  fontWeight: 700,
                  cursor: newName.trim() ? 'pointer' : 'default',
                  fontFamily: 'Baloo 2, sans-serif',
                }}
              >
                criar
              </button>
            </div>
          ) : (
            <button
              onClick={() => setCreating(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                width: '100%',
                background: 'none',
                border: 'none',
                padding: '7px 16px',
                cursor: 'pointer',
                fontFamily: 'Baloo 2, sans-serif',
                fontSize: 11,
                fontWeight: 700,
                color: '#c4956a',
                textAlign: 'left',
              }}
            >
              <Plus size={13} strokeWidth={2.5} />
              novo mural
            </button>
          )}
        </div>
      )}
    </div>
  )
}

interface BoardItemProps {
  label: string
  active: boolean
  canDelete: boolean
  onSelect: () => void
  onDelete: () => void
  confirmDelete: boolean
}

function BoardItem({
  label,
  active,
  canDelete,
  onSelect,
  onDelete,
  confirmDelete,
}: BoardItemProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        padding: '1px 8px 1px 12px',
        background: active ? 'rgba(196,149,106,0.18)' : 'transparent',
      }}
    >
      <button
        onClick={onSelect}
        style={{
          flex: 1,
          background: 'none',
          border: 'none',
          padding: '6px 4px',
          cursor: 'pointer',
          fontFamily: 'Baloo 2, sans-serif',
          fontSize: 11,
          fontWeight: active ? 800 : 600,
          color: active ? '#f5ecd7' : 'rgba(245,236,215,0.7)',
          textAlign: 'left',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
        {active && <span style={{ marginLeft: 5, fontSize: 9, color: '#c4956a' }}>●</span>}
      </button>

      {canDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          title={confirmDelete ? 'clique de novo para confirmar' : 'apagar mural'}
          style={{
            background: confirmDelete ? 'rgba(232,96,122,0.2)' : 'none',
            border: confirmDelete ? '1px solid rgba(232,96,122,0.5)' : 'none',
            borderRadius: 6,
            padding: '4px 6px',
            cursor: 'pointer',
            color: confirmDelete ? '#e8607a' : 'rgba(245,236,215,0.3)',
            display: 'flex',
            alignItems: 'center',
            transition: 'all 0.15s',
            flexShrink: 0,
          }}
        >
          {confirmDelete ? (
            <span style={{ fontSize: 9, fontFamily: 'Baloo 2, sans-serif', fontWeight: 700 }}>
              confirmar?
            </span>
          ) : (
            <Trash2 size={11} strokeWidth={2} />
          )}
        </button>
      )}
    </div>
  )
}
