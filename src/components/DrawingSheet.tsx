import { useState, useRef, useCallback, useEffect } from 'react'
import { DrawingItem } from '../types/board'

const SIZES = [2, 5, 10]

const PRESET_COLORS = [
  '#2c1810',
  '#7a3a2a',
  '#c4845a',
  '#e8c49a',
  '#4a7a4a',
  '#2d6e2d',
  '#a8d5a2',
  '#5b8dd9',
  '#1e3a5f',
  '#9b59b6',
  '#e8a0b0',
  '#e74c3c',
  '#f39c12',
  '#fffef8',
]

interface Props {
  item: DrawingItem
  editMode: boolean
  zIndex: number
  onUpdate: (id: string, data: Partial<DrawingItem>) => void
  onDelete: (id: string) => void
  onBringForward: (id: string) => void
  onSendBackward: (id: string) => void
  onFocus: (id: string) => void
}

interface DrawingModalProps {
  initialData: string
  onSave: (dataUrl: string) => void
  onCancel: () => void
}

function DrawingModal({ initialData, onSave, onCancel }: DrawingModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const [color, setColor] = useState('#2c1810')
  const [size, setSize] = useState(3)
  const [eraser, setEraser] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#fffef8'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    if (initialData) {
      const img = new Image()
      img.onload = () => ctx.drawImage(img, 0, 0)
      img.src = initialData
    }
  }, [initialData])

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    drawing.current = true
    const ctx = canvasRef.current!.getContext('2d')!
    const pos = getPos(e)
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
  }

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return
    const ctx = canvasRef.current!.getContext('2d')!
    const pos = getPos(e)
    ctx.lineWidth = eraser ? size * 4 : size
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = eraser ? '#fffef8' : color
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
  }

  const onMouseUp = () => {
    drawing.current = false
  }

  const handleClear = () => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#fffef8'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  const handleSave = () => {
    const dataUrl = canvasRef.current!.toDataURL('image/png')
    onSave(dataUrl)
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(44,20,8,0.55)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        style={{
          background: '#fdf6f0',
          borderRadius: 18,
          boxShadow: '0 8px 40px rgba(44,20,8,0.35)',
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          fontFamily: 'Baloo 2, sans-serif',
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 800, color: '#3d2408' }}>✏️ Desenho</div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Cores predefinidas + picker */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              flexWrap: 'wrap',
              maxWidth: 320,
            }}
          >
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setColor(c)
                  setEraser(false)
                }}
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: c,
                  border: color === c && !eraser ? '2.5px solid #3d2408' : '1.5px solid #c4a88288',
                  cursor: 'pointer',
                  outline: 'none',
                  flexShrink: 0,
                  boxShadow: color === c && !eraser ? '0 0 0 1.5px #fff' : 'none',
                }}
              />
            ))}
            <div style={{ position: 'relative', width: 18, height: 18 }}>
              <input
                type="color"
                value={color}
                onChange={(e) => {
                  setColor(e.target.value)
                  setEraser(false)
                }}
                style={{
                  opacity: 0,
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  cursor: 'pointer',
                  border: 'none',
                  padding: 0,
                }}
                title="mais cores"
              />
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)',
                  border: '1.5px solid #c4a88288',
                  pointerEvents: 'none',
                }}
              />
            </div>
          </div>

          <div style={{ width: 1, height: 20, background: '#c4a882', opacity: 0.5 }} />

          {/* Tamanhos */}
          <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
            {SIZES.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                style={{
                  width: s * 3 + 8,
                  height: s * 3 + 8,
                  borderRadius: '50%',
                  background: '#2c1810',
                  border: size === s ? '2px solid #c4845a' : '2px solid transparent',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              />
            ))}
          </div>

          <div style={{ width: 1, height: 20, background: '#c4a882', opacity: 0.5 }} />

          <button
            onClick={() => setEraser((v) => !v)}
            style={{
              padding: '2px 10px',
              borderRadius: 8,
              background: eraser ? '#e8a0b0' : '#f0e8d8',
              border: eraser ? '1.5px solid #c4845a' : '1.5px solid #c4a882',
              cursor: 'pointer',
              fontSize: 11,
              fontWeight: 700,
              color: '#3d2408',
              fontFamily: 'Baloo 2, sans-serif',
            }}
          >
            borracha
          </button>

          <button
            onClick={handleClear}
            style={{
              padding: '2px 10px',
              borderRadius: 8,
              background: '#f0e8d8',
              border: '1.5px solid #c4a882',
              cursor: 'pointer',
              fontSize: 11,
              fontWeight: 700,
              color: '#3d2408',
              fontFamily: 'Baloo 2, sans-serif',
            }}
          >
            limpar
          </button>
        </div>

        <canvas
          ref={canvasRef}
          width={500}
          height={340}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          style={{
            borderRadius: 10,
            border: '2px solid #c4a882',
            cursor: eraser ? 'cell' : 'crosshair',
            display: 'block',
            background: '#fffef8',
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button
            onClick={onCancel}
            style={{
              padding: '6px 18px',
              borderRadius: 10,
              background: '#f0e8d8',
              border: '1.5px solid #c4a882',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 700,
              color: '#3d2408',
              fontFamily: 'Baloo 2, sans-serif',
            }}
          >
            cancelar
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '6px 18px',
              borderRadius: 10,
              background: 'linear-gradient(180deg, #d4956a 0%, #b8744e 100%)',
              border: '1.5px solid #8b5a2a',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 700,
              color: '#5a2e0e',
              fontFamily: 'Baloo 2, sans-serif',
            }}
          >
            salvar
          </button>
        </div>
      </div>
    </div>
  )
}

export default function DrawingSheet({
  item,
  editMode,
  zIndex,
  onUpdate,
  onDelete,
  onBringForward,
  onSendBackward,
  onFocus,
}: Props) {
  const [modalOpen, setModalOpen] = useState(!item.drawingData)
  const [showMenu, setShowMenu] = useState(false)
  const dragRef = useRef({ dragging: false, moved: false, sx: 0, sy: 0, px: 0, py: 0 })
  const resizeRef = useRef({ resizing: false, sx: 0, sy: 0, sw: 0, sh: 0 })
  const rotateRef = useRef({ rotating: false, startAngle: 0, currentRotation: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const w = item.width || 500
  const h = item.height || 340
  const rotation = item.rotation ?? 0

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

  const onRotateMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()

      // centro do item na tela
      const rect = containerRef.current!.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2

      // ângulo inicial entre o centro e o mouse
      const startAngle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI)

      rotateRef.current = {
        rotating: true,
        startAngle,
        currentRotation: rotation,
      }

      const onMove = (ev: MouseEvent) => {
        const r = rotateRef.current
        if (!r.rotating) return
        const rect2 = containerRef.current!.getBoundingClientRect()
        const cx2 = rect2.left + rect2.width / 2
        const cy2 = rect2.top + rect2.height / 2
        const angle = Math.atan2(ev.clientY - cy2, ev.clientX - cx2) * (180 / Math.PI)
        const delta = angle - r.startAngle
        const newRotation = (r.currentRotation + delta + 360) % 360
        onUpdate(item.id, { rotation: newRotation })
      }

      const onUp = () => {
        rotateRef.current.rotating = false
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)
      }

      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
    },
    [item.id, rotation, onUpdate]
  )

  const onResizeMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()
      const ratio = (item.width || 500) / (item.height || 340)
      resizeRef.current = {
        resizing: true,
        sx: e.clientX,
        sy: e.clientY,
        sw: item.width || 500,
        sh: item.height || 340,
      }
      const onMove = (ev: MouseEvent) => {
        const r = resizeRef.current
        if (!r.resizing) return
        const dx = ev.clientX - r.sx
        const dy = ev.clientY - r.sy
        const delta = Math.abs(dx) > Math.abs(dy) ? dx : dy
        const newW = Math.max(120, r.sw + delta)
        const newH = Math.max(80, newW / ratio)
        onUpdate(item.id, { width: newW, height: newH })
      }
      const onUp = () => {
        resizeRef.current.resizing = false
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)
      }
      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
    },
    [item.id, item.width, item.height, onUpdate]
  )

  const handleSave = useCallback(
    (dataUrl: string) => {
      onUpdate(item.id, {
        drawingData: dataUrl,
        width: item.width || 500,
        height: item.height || 340,
      })
      setModalOpen(false)
    },
    [item.id, item.width, item.height, onUpdate]
  )

  const handleCancel = useCallback(() => {
    if (!item.drawingData) onDelete(item.id)
    setModalOpen(false)
  }, [item.id, item.drawingData, onDelete])

  return (
    <>
      {modalOpen && (
        <DrawingModal initialData={item.drawingData} onSave={handleSave} onCancel={handleCancel} />
      )}

      {item.drawingData && (
        // wrapper externo só pra posicionar — sem overflow hidden
        <div
          style={{
            position: 'absolute',
            left: item.x,
            top: item.y,
            width: w,
            height: h,
            zIndex,
            transform: `rotate(${rotation}deg)`,
            transformOrigin: 'center center',
          }}
          onMouseEnter={() => setShowMenu(true)}
          onMouseLeave={() => setShowMenu(false)}
        >
          {/* item visual com overflow hidden */}
          <div
            data-item
            ref={containerRef}
            onMouseDown={onMouseDown}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: 10,
              border: '2px solid #c4a882',
              overflow: 'hidden',
              cursor: editMode ? 'grab' : 'default',
              boxShadow: '3px 4px 18px rgba(44,20,8,0.22)',
            }}
          >
            <img
              src={item.drawingData}
              alt="desenho"
              style={{ width: '100%', height: '100%', display: 'block', pointerEvents: 'none' }}
            />
          </div>

          {/* Alça de rotação — bolinha no topo central */}
          {editMode && (
            <div
              onMouseDown={onRotateMouseDown}
              style={{
                position: 'absolute',
                top: -28,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: 'linear-gradient(180deg, #d4956a 0%, #b8744e 100%)',
                border: '2px solid #8b5a2a',
                cursor: 'grab',
                boxShadow: '0 2px 6px rgba(44,20,8,0.3)',
                zIndex: 2,
              }}
            />
          )}

          {/* Linha da alça de rotação */}
          {editMode && (
            <div
              style={{
                position: 'absolute',
                top: -12,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 1,
                height: 12,
                background: '#8b5a2a88',
                pointerEvents: 'none',
              }}
            />
          )}

          {/* Botões de contexto */}
          {editMode && showMenu && (
            <div style={{ position: 'absolute', top: 6, right: 6, display: 'flex', gap: 3 }}>
              <CtxBtn
                label="✏️"
                onClick={(e) => {
                  e.stopPropagation()
                  setModalOpen(true)
                }}
              />
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

          {/* Alça de redimensionar — canto inferior direito */}
          {editMode && (
            <div
              onMouseDown={onResizeMouseDown}
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 18,
                height: 18,
                cursor: 'nwse-resize',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path
                  d="M2 9 L9 2 M5 9 L9 5 M8 9 L9 8"
                  stroke="#8b5a2a"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          )}
        </div>
      )}
    </>
  )
}

function CtxBtn({ label, onClick }: { label: string; onClick: (e: React.MouseEvent) => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 22,
        height: 22,
        borderRadius: '50%',
        background: 'rgba(44,20,8,0.65)',
        border: 'none',
        cursor: 'pointer',
        fontSize: 10,
        color: '#fdf0e0',
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
