import { useState, useRef, useCallback, useEffect } from 'react'
import { DrawingItem } from '../types/board'

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
  '#ffffff',
  '#000000',
]

type Tool =
  | 'pen'
  | 'eraser'
  | 'rect'
  | 'ellipse'
  | 'triangle'
  | 'line'
  | 'arrow'
  | 'star'
  | 'heart'
  | 'diamond'
  | 'pentagon'
  | 'hexagon'

const TOOLS: { id: Tool; label: string }[] = [
  { id: 'pen', label: '✏️' },
  { id: 'eraser', label: '⬜' },
  { id: 'line', label: '╱' },
  { id: 'arrow', label: '→' },
  { id: 'rect', label: '▭' },
  { id: 'ellipse', label: '⬭' },
  { id: 'triangle', label: '△' },
  { id: 'diamond', label: '◇' },
  { id: 'pentagon', label: '⬠' },
  { id: 'hexagon', label: '⬡' },
  { id: 'star', label: '☆' },
  { id: 'heart', label: '♡' },
]

const SIZES = [2, 4, 8, 14]
const CANVAS_W = 780
const CANVAS_H = 520

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

function drawShape(
  ctx: CanvasRenderingContext2D,
  tool: Tool,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  size: number,
  fill: boolean
) {
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = size
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  const cx = (x1 + x2) / 2
  const cy = (y1 + y2) / 2
  const rx = Math.abs(x2 - x1) / 2
  const ry = Math.abs(y2 - y1) / 2
  const r = Math.min(rx, ry)

  ctx.beginPath()

  if (tool === 'line') {
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
    return
  }

  if (tool === 'arrow') {
    const dx = x2 - x1
    const dy = y2 - y1
    const angle = Math.atan2(dy, dx)
    const headLen = Math.max(14, size * 4)
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x2, y2)
    ctx.lineTo(
      x2 - headLen * Math.cos(angle - Math.PI / 6),
      y2 - headLen * Math.sin(angle - Math.PI / 6)
    )
    ctx.moveTo(x2, y2)
    ctx.lineTo(
      x2 - headLen * Math.cos(angle + Math.PI / 6),
      y2 - headLen * Math.sin(angle + Math.PI / 6)
    )
    ctx.stroke()
    return
  }

  if (tool === 'rect') {
    ctx.rect(x1, y1, x2 - x1, y2 - y1)
  } else if (tool === 'ellipse') {
    ctx.ellipse(cx, cy, rx || 1, ry || 1, 0, 0, Math.PI * 2)
  } else if (tool === 'triangle') {
    ctx.moveTo(cx, y1)
    ctx.lineTo(x2, y2)
    ctx.lineTo(x1, y2)
    ctx.closePath()
  } else if (tool === 'diamond') {
    ctx.moveTo(cx, y1)
    ctx.lineTo(x2, cy)
    ctx.lineTo(cx, y2)
    ctx.lineTo(x1, cy)
    ctx.closePath()
  } else if (tool === 'pentagon') {
    const pts = 5
    for (let i = 0; i < pts; i += 1) {
      const a = (Math.PI * 2 * i) / pts - Math.PI / 2
      const px = cx + r * Math.cos(a)
      const py = cy + r * Math.sin(a)
      if (i === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    ctx.closePath()
  } else if (tool === 'hexagon') {
    const pts = 6
    for (let i = 0; i < pts; i += 1) {
      const a = (Math.PI * 2 * i) / pts
      const px = cx + r * Math.cos(a)
      const py = cy + r * Math.sin(a)
      if (i === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    ctx.closePath()
  } else if (tool === 'star') {
    const outer = r
    const inner = r * 0.4
    for (let i = 0; i < 10; i += 1) {
      const a = (Math.PI * i) / 5 - Math.PI / 2
      const rad = i % 2 === 0 ? outer : inner
      const px = cx + rad * Math.cos(a)
      const py = cy + rad * Math.sin(a)
      if (i === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    ctx.closePath()
  } else if (tool === 'heart') {
    const w = rx * 2
    const h = ry * 2
    ctx.moveTo(cx, y2)
    ctx.bezierCurveTo(x1 - w * 0.1, cy + h * 0.1, x1 - w * 0.1, y1, cx - w * 0.25, y1)
    ctx.bezierCurveTo(x1 + w * 0.1, y1, cx, y1 + h * 0.15, cx, y1 + h * 0.3)
    ctx.bezierCurveTo(cx, y1 + h * 0.15, cx + w * 0.4, y1, cx + w * 0.25, y1)
    ctx.bezierCurveTo(x2 + w * 0.1, y1, x2 + w * 0.1, cy + h * 0.1, cx, y2)
    ctx.closePath()
  }

  if (fill) ctx.fill()
  ctx.stroke()
}

function DrawingModal({ initialData, onSave, onCancel }: DrawingModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const snapshotRef = useRef<ImageData | null>(null)
  const drawing = useRef(false)
  const startPos = useRef({ x: 0, y: 0 })
  const history = useRef<string[]>([])
  const historyIdx = useRef(-1)

  const [color, setColor] = useState('#2c1810')
  const [size, setSize] = useState(3)
  const [tool, setTool] = useState<Tool>('pen')
  const [fill, setFill] = useState(false)
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null)

  const pushHistory = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dataUrl = canvas.toDataURL()
    history.current = history.current.slice(0, historyIdx.current + 1)
    history.current.push(dataUrl)
    historyIdx.current = history.current.length - 1
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#fffef8'
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)
    if (initialData) {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0)
        pushHistory()
      }
      img.src = initialData
    } else {
      pushHistory()
    }
  }, [initialData, pushHistory])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey
      if (ctrl && !e.shiftKey && e.key === 'z') {
        e.preventDefault()
        handleUndo()
      }
      if (ctrl && ((e.shiftKey && e.key === 'z') || e.key === 'y')) {
        e.preventDefault()
        handleRedo()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  })

  const handleUndo = () => {
    if (historyIdx.current <= 0) return
    historyIdx.current -= 1
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const img = new Image()
    img.onload = () => {
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)
      ctx.drawImage(img, 0, 0)
    }
    img.src = history.current[historyIdx.current]
  }

  const handleRedo = () => {
    if (historyIdx.current >= history.current.length - 1) return
    historyIdx.current += 1
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const img = new Image()
    img.onload = () => {
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)
      ctx.drawImage(img, 0, 0)
    }
    img.src = history.current[historyIdx.current]
  }

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY }
  }

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    drawing.current = true
    const pos = getPos(e)
    startPos.current = pos
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    if (tool === 'pen' || tool === 'eraser') {
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
    } else {
      snapshotRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height)
    }
  }

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect()
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    if (!drawing.current) return
    const ctx = canvasRef.current!.getContext('2d')!
    const pos = getPos(e)

    if (tool === 'pen') {
      ctx.lineWidth = size
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.strokeStyle = color
      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
    } else if (tool === 'eraser') {
      ctx.lineWidth = size * 4
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.strokeStyle = '#fffef8'
      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
    } else {
      const canvas = canvasRef.current!
      ctx.putImageData(snapshotRef.current!, 0, 0)
      drawShape(ctx, tool, startPos.current.x, startPos.current.y, pos.x, pos.y, color, size, fill)
    }
  }

  const onMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return
    drawing.current = false
    if (tool !== 'pen' && tool !== 'eraser') {
      const pos = getPos(e)
      const ctx = canvasRef.current!.getContext('2d')!
      ctx.putImageData(snapshotRef.current!, 0, 0)
      drawShape(ctx, tool, startPos.current.x, startPos.current.y, pos.x, pos.y, color, size, fill)
    }
    pushHistory()
  }

  const handleClear = () => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#fffef8'
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)
    pushHistory()
  }

  const handleSave = () => {
    const dataUrl = canvasRef.current!.toDataURL('image/png')
    onSave(dataUrl)
  }

  const eraser = tool === 'eraser'

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

        <div style={{ display: 'flex', gap: 12 }}>
          {/* painel lateral de ferramentas */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              background: '#f0e8d8',
              borderRadius: 12,
              padding: 8,
              border: '1px solid #c4a882',
              width: 48,
              alignItems: 'center',
            }}
          >
            {/* desfazer / refazer */}
            <button onClick={handleUndo} title="desfazer (Ctrl+Z)" style={toolBtnStyle(false)}>
              ↩
            </button>
            <button onClick={handleRedo} title="refazer (Ctrl+Y)" style={toolBtnStyle(false)}>
              ↪
            </button>

            <div style={{ width: '100%', height: 1, background: '#c4a882', margin: '2px 0' }} />

            {/* ferramentas */}
            {TOOLS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTool(t.id)}
                title={t.id}
                style={toolBtnStyle(tool === t.id)}
              >
                {t.label}
              </button>
            ))}

            <div style={{ width: '100%', height: 1, background: '#c4a882', margin: '2px 0' }} />

            {/* preencher */}
            <button
              onClick={() => setFill((v) => !v)}
              title="preencher forma"
              style={toolBtnStyle(fill)}
            >
              ◼
            </button>

            {/* limpar */}
            <button onClick={handleClear} title="limpar tudo" style={toolBtnStyle(false)}>
              🗑
            </button>
          </div>

          {/* canvas + cores + tamanhos */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* cores */}
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', maxWidth: 560 }}>
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setColor(c)
                    setTool('pen')
                  }}
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: c,
                    border:
                      color === c && !eraser ? '2.5px solid #3d2408' : '1.5px solid #c4a88288',
                    cursor: 'pointer',
                    outline: 'none',
                    flexShrink: 0,
                    boxShadow: color === c && !eraser ? '0 0 0 1.5px #fff' : 'none',
                  }}
                />
              ))}
              {/* color picker */}
              <div style={{ position: 'relative', width: 20, height: 20 }}>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => {
                    setColor(e.target.value)
                    setTool('pen')
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
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)',
                    border: '1.5px solid #c4a88288',
                    pointerEvents: 'none',
                  }}
                />
              </div>

              <div
                style={{
                  width: 1,
                  height: 20,
                  background: '#c4a882',
                  opacity: 0.5,
                  margin: '0 4px',
                }}
              />

              {/* tamanhos */}
              {SIZES.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  style={{
                    width: s * 2 + 10,
                    height: s * 2 + 10,
                    borderRadius: '50%',
                    background: color,
                    border: size === s ? '2px solid #c4845a' : '2px solid transparent',
                    cursor: 'pointer',
                    outline: 'none',
                    flexShrink: 0,
                    alignSelf: 'center',
                  }}
                />
              ))}
            </div>

            {/* canvas */}
            <div style={{ position: 'relative', width: CANVAS_W, height: CANVAS_H }}>
              <canvas
                ref={canvasRef}
                width={CANVAS_W}
                height={CANVAS_H}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={() => {
                  drawing.current = false
                  setMousePos(null)
                }}
                style={{
                  borderRadius: 10,
                  border: '2px solid #c4a882',
                  cursor: 'none',
                  display: 'block',
                  background: '#fffef8',
                  width: CANVAS_W,
                  height: CANVAS_H,
                }}
              />
              {mousePos && (
                <div
                  style={{
                    position: 'absolute',
                    left: mousePos.x,
                    top: mousePos.y,
                    width: eraser ? size * 4 : size + 4,
                    height: eraser ? size * 4 : size + 4,
                    borderRadius: '50%',
                    background: eraser ? 'transparent' : color,
                    border: eraser ? '1.5px solid #3d2408' : 'none',
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none',
                    opacity: 0.85,
                  }}
                />
              )}
            </div>
          </div>
        </div>

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

function toolBtnStyle(active: boolean): React.CSSProperties {
  return {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: active ? '#c4845a' : '#fdf6f0',
    border: active ? '2px solid #8b5a2a' : '1.5px solid #c4a882',
    cursor: 'pointer',
    fontSize: 14,
    color: active ? '#fff' : '#3d2408',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    padding: 0,
    flexShrink: 0,
  }
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

  const w = item.width || CANVAS_W
  const h = item.height || CANVAS_H
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
      const rect = containerRef.current!.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const startAngle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI)
      rotateRef.current = { rotating: true, startAngle, currentRotation: rotation }
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
      const ratio = (item.width || 560) / (item.height || 400)
      resizeRef.current = {
        resizing: true,
        sx: e.clientX,
        sy: e.clientY,
        sw: item.width || 560,
        sh: item.height || 400,
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
        width: item.width || CANVAS_W,
        height: item.height || CANVAS_H,
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
