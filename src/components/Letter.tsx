import { useState, useRef, useCallback } from 'react'
import { LetterItem } from '../types/board'

interface Props {
  item: LetterItem
  editMode: boolean
  currentUid: string
  displayName: string
  otherName: string
  zIndex: number
  onUpdate: (id: string, data: Partial<LetterItem>) => void
  onDelete: (id: string) => void
  onBringForward: (id: string) => void
  onSendBackward: (id: string) => void
  onFocus: (id: string) => void
}

export default function Letter({
  item,
  editMode,
  currentUid,
  displayName,
  otherName,
  zIndex,
  onUpdate,
  onDelete,
  onBringForward,
  onSendBackward,
  onFocus,
}: Props) {
  const [opening, setOpening] = useState(false)
  const [showModal, setShowModal] = useState(false)
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
    if (!item.opened) {
      setOpening(true)
      setTimeout(() => {
        onUpdate(item.id, { opened: true, openedAt: new Date().toISOString() })
        setOpening(false)
        setShowModal(true)
      }, 900)
    } else {
      setShowModal(true)
    }
  }

  const isSealed = !item.opened && !opening

  // envelope: 110×70 proporcional (largura × altura do corpo)
  const ENV_W = 110
  const ENV_H = 70
  // tampa: ponto central desce até 40% quando fechada, sobe pra 15% abrindo
  const flapY = opening ? ENV_H * 0.15 : ENV_H * 0.42
  // papel: quando aberto/abrindo, sobe acima do envelope
  const paperTop = item.opened ? -44 : opening ? -20 : ENV_H - 12
  const containerH = item.opened ? ENV_H + 48 : opening ? ENV_H + 24 : ENV_H + 18

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
          width: ENV_W,
          height: ENV_H + 50,
          cursor: editMode ? 'grab' : 'pointer',
          userSelect: 'none',
          zIndex,
        }}
      >
        {/* envelope SVG — papel integrado */}
        <svg
          viewBox={`0 0 ${ENV_W} ${ENV_H + 50}`}
          xmlns="http://www.w3.org/2000/svg"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: ENV_W,
            height: ENV_H + 50,
            overflow: 'visible',
          }}
        >
          {/* sombra */}
          <rect x="3" y="5" width="104" height="62" rx="6" fill="rgba(44,20,8,0.1)" />
          {/* corpo */}
          <rect
            x="1"
            y="3"
            width="104"
            height="62"
            rx="6"
            fill="#fdf6f0"
            stroke="#e8a0b0"
            strokeWidth="1.5"
          />
          {/* diagonais */}
          <line x1="1" y1="3" x2="55" y2={ENV_H * 0.52} stroke="#f0c0d4" strokeWidth="1.2" />
          <line x1="105" y1="3" x2="55" y2={ENV_H * 0.52} stroke="#f0c0d4" strokeWidth="1.2" />
          <line x1="1" y1="65" x2="55" y2={ENV_H * 0.52} stroke="#f0c0d4" strokeWidth="1.2" />
          <line x1="105" y1="65" x2="55" y2={ENV_H * 0.52} stroke="#f0c0d4" strokeWidth="1.2" />
          {/* papel — depois do corpo e diagonais, na frente do envelope mas atrás da tampa */}
          {(item.opened || opening) && (
            <g
              style={{ transition: 'transform 0.65s cubic-bezier(.34,1.56,.64,1)' }}
              transform={`translate(0, ${item.opened ? -38 : opening ? -16 : 0})`}
            >
              <rect
                x="18"
                y="10"
                width="74"
                height="60"
                rx="4"
                fill="#fff8f0"
                stroke="#e8d0b0"
                strokeWidth="1"
              />
              <line x1="26" y1="22" x2="84" y2="22" stroke="#e8c0a0" strokeWidth="0.9" />
              <line x1="26" y1="30" x2="80" y2="30" stroke="#e8c0a0" strokeWidth="0.9" />
              <line x1="26" y1="38" x2="82" y2="38" stroke="#e8c0a0" strokeWidth="0.9" />
              <line x1="26" y1="46" x2="74" y2="46" stroke="#e8c0a0" strokeWidth="0.9" />
            </g>
          )}
          {/* tampa fechada — na frente de tudo (selada) */}
          {!item.opened && !opening && (
            <path
              d={`M1 3 L55 ${flapY} L105 3`}
              fill="#f9d0e0"
              stroke="#e8a0b0"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          )}
          {/* lacre */}
          {isSealed && (
            <g transform={`translate(55,${ENV_H * 0.54})`}>
              <path
                d="M0,-9 C-10,-16 -20,-9 -20,0 C-20,9 0,22 0,22 C0,22 20,9 20,0 C20,-9 10,-16 0,-9Z"
                fill="#e8a0b0"
                stroke="#c87090"
                strokeWidth="1"
                transform="scale(0.45)"
              />
            </g>
          )}
          {/* hint */}
          {isSealed && (
            <text
              x="55"
              y={ENV_H + 10}
              textAnchor="middle"
              fontSize="7"
              fill="#c87090"
              fontFamily="Baloo 2, sans-serif"
              opacity="0.85"
            >
              clique pra abrir 💌
            </text>
          )}
        </svg>

        {/* botões de contexto */}
        {editMode && showMenu && (
          <div
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              display: 'flex',
              gap: 3,
              zIndex: 10,
            }}
          >
            <CtxBtn
              label="↑"
              title="à frente"
              onClick={(e) => {
                e.stopPropagation()
                onBringForward(item.id)
              }}
            />
            <CtxBtn
              label="↓"
              title="atrás"
              onClick={(e) => {
                e.stopPropagation()
                onSendBackward(item.id)
              }}
            />
            <CtxBtn
              label="✕"
              title="deletar"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(item.id)
              }}
            />
          </div>
        )}
      </div>

      {showModal && (
        <LetterModal
          item={item}
          currentUid={currentUid}
          displayName={displayName}
          otherName={otherName}
          onUpdate={onUpdate}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}

function CtxBtn({
  label,
  title,
  onClick,
}: {
  label: string
  title: string
  onClick: (e: React.MouseEvent) => void
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        width: 20,
        height: 20,
        borderRadius: '50%',
        background: 'rgba(253,214,228,0.9)',
        border: '1px solid #e8a0b0',
        cursor: 'pointer',
        fontSize: 10,
        color: '#7a3040',
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

function LetterModal({
  item,
  currentUid,
  displayName,
  otherName,
  onUpdate,
  onClose,
}: {
  item: LetterItem
  currentUid: string
  displayName: string
  otherName: string
  onUpdate: (id: string, data: Partial<LetterItem>) => void
  onClose: () => void
}) {
  const isAuthor = item.createdBy === currentUid
  const [editing, setEditing] = useState(item.content === '' && isAuthor)
  const [content, setContent] = useState(item.content)
  const [from, setFrom] = useState(item.from || displayName)
  const [to, setTo] = useState(item.to || otherName)

  // apelidos: tira tudo depois de @ se houver
  const clean = (name: string) => (name.includes('@') ? name.split('@')[0] : name)
  const nameOptions = [displayName, otherName].map(clean).filter(Boolean)
  const fromClean = clean(from)
  const toClean = clean(to)

  const handleSave = () => {
    onUpdate(item.id, { content, from, to })
    setEditing(false)
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(44,20,8,0.45)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 380,
          background: '#fff8f0',
          border: '2px solid #e8a0b0',
          borderRadius: 14,
          boxShadow: '0 12px 40px rgba(44,20,8,0.3)',
          overflow: 'hidden',
          fontFamily: 'Baloo 2, sans-serif',
          animation: 'letterPop 0.3s cubic-bezier(.34,1.56,.64,1)',
        }}
      >
        <style>{`@keyframes letterPop { from { transform: scale(0.85) translateY(20px); opacity:0; } to { transform:scale(1); opacity:1; } }`}</style>

        {/* cabeçalho */}
        <div
          style={{
            background: 'linear-gradient(135deg, #fda4b4 0%, #f9d0e0 100%)',
            padding: '16px 20px 14px',
            borderBottom: '1.5px solid #e8a0b0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, color: '#7a3040', fontWeight: 700, minWidth: 26 }}>
                de
              </span>
              <NameSelect
                value={fromClean}
                options={nameOptions}
                onChange={(v) => setFrom(v)}
                disabled={!editing}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, color: '#7a3040', fontWeight: 700, minWidth: 26 }}>
                pra
              </span>
              <NameSelect
                value={toClean}
                options={nameOptions}
                onChange={(v) => setTo(v)}
                disabled={!editing}
              />
            </div>
            {item.openedAt && (
              <div style={{ fontSize: 10, color: '#c87090', marginTop: 2 }}>
                aberta em {new Date(item.openedAt).toLocaleDateString('pt-BR')}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.4)',
              border: '1px solid #e8a0b0',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 14,
              color: '#c87090',
              padding: '6px 12px',
              fontFamily: 'Baloo 2, sans-serif',
              fontWeight: 700,
            }}
          >
            fechar
          </button>
        </div>

        {/* corpo — linhas de papel */}
        <div style={{ position: 'relative', padding: '18px 20px 20px', minHeight: 200 }}>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 20,
                right: 20,
                height: 1,
                background: '#f0d8c8',
                top: 18 + i * 24,
                pointerEvents: 'none',
              }}
            />
          ))}

          {editing ? (
            <>
              <textarea
                autoFocus
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="escreva sua cartinha aqui... 🌸"
                style={{
                  width: '100%',
                  minHeight: 192,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: 13,
                  color: '#3d2408',
                  fontFamily: 'Baloo 2, sans-serif',
                  lineHeight: '24px',
                  resize: 'vertical',
                  position: 'relative',
                  zIndex: 1,
                  boxSizing: 'border-box',
                }}
              />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 10,
                  marginTop: 12,
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                <button
                  onClick={() => {
                    setContent(item.content)
                    setEditing(false)
                  }}
                  style={{
                    background: 'none',
                    border: '1px solid #e8a0b0',
                    borderRadius: 8,
                    padding: '8px 18px',
                    fontSize: 12,
                    color: '#c87090',
                    cursor: 'pointer',
                    fontFamily: 'Baloo 2, sans-serif',
                  }}
                >
                  cancelar
                </button>
                <button
                  onClick={handleSave}
                  style={{
                    background: 'linear-gradient(135deg, #fda4b4, #e8607a)',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 20px',
                    fontSize: 12,
                    color: '#fff',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'Baloo 2, sans-serif',
                  }}
                >
                  salvar 💌
                </button>
              </div>
            </>
          ) : (
            <>
              <div
                style={{
                  fontSize: 13,
                  color: '#3d2408',
                  lineHeight: '24px',
                  minHeight: 144,
                  whiteSpace: 'pre-wrap',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                {content || <span style={{ opacity: 0.35 }}>carta vazia...</span>}
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 14,
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                <button
                  onClick={onClose}
                  style={{
                    background: 'none',
                    border: '1px solid #e8a0b0',
                    borderRadius: 8,
                    padding: '8px 18px',
                    fontSize: 12,
                    color: '#c87090',
                    cursor: 'pointer',
                    fontFamily: 'Baloo 2, sans-serif',
                  }}
                >
                  fechar
                </button>
                {isAuthor && (
                  <button
                    onClick={() => setEditing(true)}
                    style={{
                      background: 'linear-gradient(135deg, #fda4b4, #e8607a)',
                      border: 'none',
                      borderRadius: 8,
                      padding: '8px 20px',
                      fontSize: 12,
                      color: '#fff',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: 'Baloo 2, sans-serif',
                    }}
                  >
                    editar ✏️
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function NameSelect({
  value,
  options,
  onChange,
  disabled,
}: {
  value: string
  options: string[]
  onChange: (v: string) => void
  disabled: boolean
}) {
  if (disabled) {
    return (
      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: '#6b1030',
          background: 'rgba(255,255,255,0.45)',
          borderRadius: 6,
          padding: '3px 10px',
          border: '1px solid #e8a0b0',
        }}
      >
        {value}
      </span>
    )
  }
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        fontSize: 12,
        fontWeight: 700,
        color: '#6b1030',
        background: 'rgba(255,255,255,0.7)',
        border: '1px solid #e8a0b0',
        borderRadius: 6,
        padding: '3px 8px',
        fontFamily: 'Baloo 2, sans-serif',
        cursor: 'pointer',
        outline: 'none',
      }}
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  )
}
