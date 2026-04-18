import { useState, useRef, useCallback } from 'react'
import { ChecklistItem, ChecklistEntry } from '../types/board'

interface Props {
  item: ChecklistItem
  editMode: boolean
  zIndex: number
  onUpdate: (id: string, data: Partial<ChecklistItem>) => void
  onDelete: (id: string) => void
  onBringForward: (id: string) => void
  onSendBackward: (id: string) => void
  onFocus: (id: string) => void
}

function makeEntryId() {
  return Math.random().toString(36).slice(2)
}

export default function Checklist({
  item,
  editMode,
  zIndex,
  onUpdate,
  onDelete,
  onBringForward,
  onSendBackward,
  onFocus,
}: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const dragRef = useRef({ dragging: false, moved: false, sx: 0, sy: 0, px: 0, py: 0 })

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!editMode) return
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
    [editMode, item.x, item.y, item.id, onUpdate, onFocus]
  )

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (editMode || dragRef.current.moved) return
    setModalOpen(true)
  }

  const done = item.entries.filter((e) => e.done).length
  const total = item.entries.length

  return (
    <>
      <div
        data-item
        onMouseDown={onMouseDown}
        onClick={handleClick}
        onMouseEnter={() => setShowMenu(true)}
        onMouseLeave={() => setShowMenu(false)}
        style={{
          position: 'absolute',
          left: item.x,
          top: item.y,
          width: item.width,
          minHeight: item.height,
          background: '#fef9f0',
          border: '1.5px solid #d4aa80',
          borderRadius: 8,
          padding: '14px 12px 12px',
          boxShadow: '3px 5px 14px rgba(44,20,8,0.18)',
          cursor: editMode ? 'grab' : 'pointer',
          userSelect: 'none',
          fontFamily: 'Baloo 2, sans-serif',
          zIndex,
          overflow: 'visible',
        }}
      >
        {/* fita */}
        <div
          style={{
            position: 'absolute',
            top: -8,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 38,
            height: 16,
            background: 'rgba(255,255,200,0.6)',
            border: '1px solid rgba(200,180,0,0.25)',
            borderRadius: 3,
          }}
        />

        {editMode && showMenu && (
          <div style={{ position: 'absolute', top: 4, right: 4, display: 'flex', gap: 3 }}>
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

        {item.title && (
          <div style={{ fontWeight: 700, fontSize: 11, color: '#8b6914', marginBottom: 5 }}>
            {item.title}
          </div>
        )}

        {/* todas as entradas */}
        {item.entries.map((entry) => (
          <div
            key={entry.id}
            style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}
          >
            <div
              style={{
                width: 11,
                height: 11,
                borderRadius: 3,
                border: '1.5px solid #d4aa80',
                background: entry.done ? '#8b6914' : 'transparent',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {entry.done && <span style={{ color: '#fff', fontSize: 7, lineHeight: 1 }}>✓</span>}
            </div>
            <span
              style={{
                fontSize: 10,
                color: '#3d2408',
                lineHeight: 1.4,
                textDecoration: entry.done ? 'line-through' : 'none',
                opacity: entry.done ? 0.5 : 1,
              }}
            >
              {entry.text || '...'}
            </span>
          </div>
        ))}

        {null}

        {total > 0 && (
          <div style={{ fontSize: 9, color: '#8b6914', marginTop: 4, opacity: 0.7 }}>
            {done}/{total} feitos
          </div>
        )}

        {total === 0 && (
          <div style={{ fontSize: 10, color: '#3d2408', opacity: 0.35 }}>clique pra adicionar</div>
        )}
      </div>

      {modalOpen && (
        <ChecklistModal item={item} onUpdate={onUpdate} onClose={() => setModalOpen(false)} />
      )}
    </>
  )
}

function CtxBtn({ label, onClick }: { label: string; onClick: (e: React.MouseEvent) => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 18,
        height: 18,
        borderRadius: '50%',
        background: 'rgba(44,20,8,0.18)',
        border: 'none',
        cursor: 'pointer',
        fontSize: 9,
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

function ChecklistModal({
  item,
  onUpdate,
  onClose,
}: {
  item: ChecklistItem
  onUpdate: (id: string, data: Partial<ChecklistItem>) => void
  onClose: () => void
}) {
  const isNew = item.entries.length === 0 && !item.title
  const [editing, setEditing] = useState(isNew)
  const [title, setTitle] = useState(item.title ?? '')
  const [entries, setEntries] = useState<ChecklistEntry[]>(
    item.entries.length > 0 ? item.entries : [{ id: makeEntryId(), text: '', done: false }]
  )

  const toggleDone = (id: string) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, done: !e.done } : e)))
  }

  const updateText = (id: string, text: string) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, text } : e)))
  }

  const addEntry = () => {
    setEntries((prev) => [...prev, { id: makeEntryId(), text: '', done: false }])
  }

  const removeEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }

  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (idx === entries.length - 1) addEntry()
    }
    if (e.key === 'Backspace' && entries[idx].text === '' && entries.length > 1) {
      e.preventDefault()
      removeEntry(entries[idx].id)
    }
  }

  const handleSave = () => {
    onUpdate(item.id, {
      title: title.trim() || undefined,
      entries: entries.filter((e) => e.text.trim() !== '' || e.done),
    })
    setEditing(false)
  }

  const handleCancel = () => {
    if (isNew) {
      onClose()
    } else {
      setTitle(item.title ?? '')
      setEntries(
        item.entries.length > 0 ? item.entries : [{ id: makeEntryId(), text: '', done: false }]
      )
      setEditing(false)
    }
  }

  const done = entries.filter((e) => e.done).length

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(44,20,8,0.4)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 360,
          background: '#fef9f0',
          border: '2px solid #d4aa80',
          borderRadius: 12,
          boxShadow: '0 16px 48px rgba(44,20,8,0.28)',
          fontFamily: 'Baloo 2, sans-serif',
          overflow: 'hidden',
          animation: 'popIn 0.25s cubic-bezier(.34,1.56,.64,1)',
        }}
      >
        <style>{`@keyframes popIn { from { transform: scale(0.88) translateY(16px); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>

        {/* fita */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 6, marginBottom: -8 }}>
          <div
            style={{
              width: 52,
              height: 18,
              background: 'rgba(255,255,200,0.65)',
              border: '1px solid rgba(200,180,0,0.3)',
              borderRadius: 3,
            }}
          />
        </div>

        <div style={{ padding: '20px 22px 22px' }}>
          {editing ? (
            <>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="título da lista (opcional)"
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.5)',
                  border: '1px solid #d4aa80',
                  borderRadius: 8,
                  padding: '8px 12px',
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#8b6914',
                  outline: 'none',
                  fontFamily: 'Baloo 2, sans-serif',
                  marginBottom: 14,
                  boxSizing: 'border-box',
                }}
              />

              {/* barra de progresso */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 10, color: '#8b6914' }}>
                    {done} de {entries.length} feitos
                  </span>
                  <span style={{ fontSize: 10, color: '#8b6914', opacity: 0.6 }}>
                    {entries.length > 0 ? Math.round((done / entries.length) * 100) : 0}%
                  </span>
                </div>
                <div
                  style={{ height: 4, background: '#e8d8c0', borderRadius: 4, overflow: 'hidden' }}
                >
                  <div
                    style={{
                      height: '100%',
                      borderRadius: 4,
                      background: 'linear-gradient(90deg, #8b6914, #c4956a)',
                      width: `${entries.length > 0 ? (done / entries.length) * 100 : 0}%`,
                      transition: 'width 0.3s',
                    }}
                  />
                </div>
              </div>

              {/* entradas */}
              <div
                style={{
                  maxHeight: 240,
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                {entries.map((entry, idx) => (
                  <div key={entry.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      onClick={() => toggleDone(entry.id)}
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 5,
                        flexShrink: 0,
                        border: '1.5px solid #d4aa80',
                        background: entry.done ? '#8b6914' : 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {entry.done && <span style={{ color: '#fff', fontSize: 10 }}>✓</span>}
                    </button>
                    <input
                      autoFocus={idx === entries.length - 1 && entry.text === ''}
                      value={entry.text}
                      onChange={(e) => updateText(entry.id, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, idx)}
                      placeholder="item..."
                      style={{
                        flex: 1,
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        fontSize: 12,
                        color: '#3d2408',
                        fontFamily: 'Baloo 2, sans-serif',
                        textDecoration: entry.done ? 'line-through' : 'none',
                        opacity: entry.done ? 0.5 : 1,
                      }}
                    />
                    <button
                      onClick={() => removeEntry(entry.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 11,
                        color: '#8b6914',
                        opacity: 0.4,
                        padding: 0,
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={addEntry}
                style={{
                  marginTop: 10,
                  background: 'none',
                  border: '1px dashed #d4aa80',
                  borderRadius: 8,
                  padding: '5px 14px',
                  fontSize: 11,
                  color: '#8b6914',
                  cursor: 'pointer',
                  fontFamily: 'Baloo 2, sans-serif',
                  width: '100%',
                }}
              >
                + adicionar item
              </button>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 14 }}>
                <button
                  onClick={handleCancel}
                  style={{
                    background: 'none',
                    border: '1px solid #d4aa80',
                    borderRadius: 8,
                    padding: '8px 16px',
                    fontSize: 12,
                    color: '#8b6914',
                    cursor: 'pointer',
                    fontFamily: 'Baloo 2, sans-serif',
                  }}
                >
                  cancelar
                </button>
                <button
                  onClick={handleSave}
                  style={{
                    background: '#8b6914',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 18px',
                    fontSize: 12,
                    color: '#fff',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'Baloo 2, sans-serif',
                  }}
                >
                  salvar ✓
                </button>
              </div>
            </>
          ) : (
            <>
              {item.title && (
                <div style={{ fontWeight: 700, fontSize: 14, color: '#8b6914', marginBottom: 10 }}>
                  {item.title}
                </div>
              )}

              {/* barra de progresso visualização */}
              {item.entries.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}
                  >
                    <span style={{ fontSize: 10, color: '#8b6914' }}>
                      {item.entries.filter((e) => e.done).length} de {item.entries.length} feitos
                    </span>
                    <span style={{ fontSize: 10, color: '#8b6914', opacity: 0.6 }}>
                      {Math.round(
                        (item.entries.filter((e) => e.done).length / item.entries.length) * 100
                      )}
                      %
                    </span>
                  </div>
                  <div
                    style={{
                      height: 4,
                      background: '#e8d8c0',
                      borderRadius: 4,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        borderRadius: 4,
                        background: 'linear-gradient(90deg, #8b6914, #c4956a)',
                        width: `${(item.entries.filter((e) => e.done).length / item.entries.length) * 100}%`,
                        transition: 'width 0.3s',
                      }}
                    />
                  </div>
                </div>
              )}

              {/* lista só leitura — pode marcar done */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  maxHeight: 260,
                  overflowY: 'auto',
                }}
              >
                {item.entries.length === 0 && (
                  <div style={{ fontSize: 12, color: '#3d2408', opacity: 0.35 }}>
                    lista vazia...
                  </div>
                )}
                {item.entries.map((entry) => (
                  <div key={entry.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      onClick={() => {
                        const updated = item.entries.map((e) =>
                          e.id === entry.id ? { ...e, done: !e.done } : e
                        )
                        onUpdate(item.id, { entries: updated })
                      }}
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 4,
                        flexShrink: 0,
                        border: '1.5px solid #d4aa80',
                        background: entry.done ? '#8b6914' : 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {entry.done && <span style={{ color: '#fff', fontSize: 9 }}>✓</span>}
                    </button>
                    <span
                      style={{
                        fontSize: 12,
                        color: '#3d2408',
                        lineHeight: 1.5,
                        textDecoration: entry.done ? 'line-through' : 'none',
                        opacity: entry.done ? 0.5 : 1,
                      }}
                    >
                      {entry.text}
                    </span>
                  </div>
                ))}
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 16,
                }}
              >
                <button
                  onClick={onClose}
                  style={{
                    background: 'none',
                    border: '1px solid #d4aa80',
                    borderRadius: 8,
                    padding: '8px 16px',
                    fontSize: 12,
                    color: '#8b6914',
                    cursor: 'pointer',
                    fontFamily: 'Baloo 2, sans-serif',
                  }}
                >
                  fechar
                </button>
                <button
                  onClick={() => setEditing(true)}
                  style={{
                    background: '#8b6914',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 18px',
                    fontSize: 12,
                    color: '#fff',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'Baloo 2, sans-serif',
                  }}
                >
                  editar ✏️
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
