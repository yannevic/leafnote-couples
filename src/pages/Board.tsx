import { useState, useCallback, useRef } from 'react'
import { useBoard } from '../hooks/useBoard'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../lib/firebase'
import { updateProfile } from 'firebase/auth'
import {
  BoardItemType,
  AnyBoardItem,
  PostItItem,
  ChecklistItem,
  TagItem,
  LetterItem,
} from '../types/board'
import Toolbar from '../components/Toolbar'
import StreakCounter from '../components/StreakCounter'
import PostIt from '../components/PostIt'
import Checklist from '../components/Checklist'
import Tag from '../components/Tag'
import Letter from '../components/Letter'
import DrawingSheet from '../components/DrawingSheet'
import { DrawingItem } from '../types/board'

function makeId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

const POSTIT_COLORS = ['yellow', 'pink', 'green', 'blue', 'lavender', 'peach'] as const
let colorCursor = 0

// z-index: cada item tem um order; frente/trás troca orders
function bringForward(items: AnyBoardItem[], id: string): AnyBoardItem[] {
  const sorted = [...items].sort((a, b) => (a.zOrder ?? 0) - (b.zOrder ?? 0))
  const idx = sorted.findIndex((i) => i.id === id)
  if (idx === sorted.length - 1) return items
  const next = sorted[idx + 1]
  const cur = sorted[idx]
  const tmp = cur.zOrder ?? idx
  return items.map((item) => {
    if (item.id === cur.id) return { ...item, zOrder: next.zOrder ?? idx + 1 }
    if (item.id === next.id) return { ...item, zOrder: tmp }
    return item
  })
}

function sendBackward(items: AnyBoardItem[], id: string): AnyBoardItem[] {
  const sorted = [...items].sort((a, b) => (a.zOrder ?? 0) - (b.zOrder ?? 0))
  const idx = sorted.findIndex((i) => i.id === id)
  if (idx === 0) return items
  const prev = sorted[idx - 1]
  const cur = sorted[idx]
  const tmp = cur.zOrder ?? idx
  return items.map((item) => {
    if (item.id === cur.id) return { ...item, zOrder: prev.zOrder ?? idx - 1 }
    if (item.id === prev.id) return { ...item, zOrder: tmp }
    return item
  })
}

export default function Board() {
  const [user] = useAuthState(auth)
  const [items, setItems] = useState<AnyBoardItem[]>([])
  const [selectedTool, setSelectedTool] = useState<BoardItemType | null>(null)
  const [editMode, setEditMode] = useState(false)
  const { saveItem, deleteItem } = useBoard(items, setItems)
  const boardRef = useRef<HTMLDivElement>(null)

  const uid = user?.uid ?? 'anon'
  const displayName = user?.displayName ?? ''
  // nome do outro usuário: se eu sou "nana" o outro é "gueguel" e vice-versa (simples por ora)
  const otherName = displayName.toLowerCase() === 'nana' ? 'gueguel' : 'nana'
  const [nickSaved, setNickSaved] = useState(!!user?.displayName)
  const [nickInput, setNickInput] = useState('')
  const [nickLoading, setNickLoading] = useState(false)

  const handleSaveNick = async () => {
    if (!nickInput.trim() || !user) return
    setNickLoading(true)
    await updateProfile(user, { displayName: nickInput.trim() })
    setNickSaved(true)
    setNickLoading(false)
  }

  const nextZOrder = () => Math.max(0, ...items.map((i) => i.zOrder ?? 0)) + 1

  const makeBase = (type: BoardItemType, x: number, y: number) => {
    const now = new Date().toISOString()
    return {
      id: makeId(),
      type,
      x,
      y,
      width: type === 'postit' ? 150 : type === 'checklist' ? 160 : type === 'tag' ? 100 : 110,
      height: type === 'postit' ? 120 : type === 'checklist' ? 130 : type === 'tag' ? 32 : 80,
      createdBy: uid,
      updatedBy: uid,
      createdAt: now,
      updatedAt: now,
      zOrder: nextZOrder(),
    }
  }

  const handleBoardClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (editMode) return
      if (!selectedTool) return
      const target = e.target as HTMLElement
      const tag = target.tagName.toLowerCase()
      const isBackground =
        ['div', 'svg', 'rect', 'path', 'line', 'g', 'stop', 'radialgradient'].includes(tag) &&
        (target === boardRef.current || !target.closest('[data-item]'))
      if (!isBackground) return

      const rect = boardRef.current!.getBoundingClientRect()
      const x = e.clientX - rect.left - 75
      const y = e.clientY - rect.top - 40

      if (selectedTool === 'postit') {
        const postitColor = POSTIT_COLORS[colorCursor % POSTIT_COLORS.length]
        colorCursor += 1
        const item: PostItItem = {
          ...makeBase('postit', x, y),
          type: 'postit',
          content: '',
          color: postitColor,
        }
        setItems((prev) => [...prev, item])
        saveItem(item)
        setSelectedTool(null)
      } else if (selectedTool === 'checklist') {
        const item: ChecklistItem = {
          ...makeBase('checklist', x, y),
          type: 'checklist',
          entries: [],
          color: 'yellow',
        }
        setItems((prev) => [...prev, item])
        saveItem(item)
        setSelectedTool(null)
      } else if (selectedTool === 'tag') {
        const item: TagItem = {
          ...makeBase('tag', x, y),
          type: 'tag',
          label: 'nova tag',
          color: String(Math.floor(Math.random() * 6)),
        }
        setItems((prev) => [...prev, item])
        saveItem(item)
        setSelectedTool(null)
      } else if (selectedTool === 'letter') {
        const item: LetterItem = {
          ...makeBase('letter', x, y),
          type: 'letter',
          from: displayName,
          to: otherName,
          content: '',
          opened: false,
        }
        setItems((prev) => [...prev, item])
        saveItem(item)
        setSelectedTool(null)
      } else if (selectedTool === 'drawing') {
        const item: DrawingItem = {
          ...makeBase('drawing', x, y),
          type: 'drawing',
          drawingData: '',
        }
        setItems((prev) => [...prev, item])
        saveItem(item)
        setSelectedTool(null)
      }
    },
    [editMode, selectedTool, uid, displayName, otherName, items]
  )

  const handleUpdate = useCallback(
    (id: string, data: Partial<AnyBoardItem>) => {
      setItems((prev) => {
        const next = prev.map((item) =>
          item.id === id
            ? ({
                ...item,
                ...data,
                updatedAt: new Date().toISOString(),
                updatedBy: uid,
              } as AnyBoardItem)
            : item
        )
        const updated = next.find((item) => item.id === id)
        if (updated) saveItem(updated)
        return next
      })
    },
    [uid, saveItem]
  )

  const handleDelete = useCallback(
    (id: string) => {
      setItems((prev) => prev.filter((item) => item.id !== id))
      deleteItem(id)
    },
    [deleteItem]
  )

  const handleBringForward = useCallback(
    (id: string) => {
      setItems((prev) => {
        const next = bringForward(prev, id)
        next.forEach((item) => {
          const old = prev.find((p) => p.id === item.id)
          if (old?.zOrder !== item.zOrder) saveItem(item)
        })
        return next
      })
    },
    [saveItem]
  )

  const handleSendBackward = useCallback(
    (id: string) => {
      setItems((prev) => {
        const next = sendBackward(prev, id)
        next.forEach((item) => {
          const old = prev.find((p) => p.id === item.id)
          if (old?.zOrder !== item.zOrder) saveItem(item)
        })
        return next
      })
    },
    [saveItem]
  )

  const handleFocus = useCallback(
    (id: string) => {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, zOrder: nextZOrder() } : item))
      )
    },
    [items]
  )

  const sortedItems = [...items].sort((a, b) => (a.zOrder ?? 0) - (b.zOrder ?? 0))
  if (!nickSaved) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center"
        style={{ background: 'linear-gradient(160deg, #f0f7f0 0%, #e8f5e8 60%, #f5f0e8 100%)' }}
      >
        <div
          style={{
            background: '#f2faf2',
            border: '1px solid #d8eed8',
            borderRadius: 20,
            padding: '2rem 2.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            alignItems: 'center',
            fontFamily: 'Baloo 2, sans-serif',
            minWidth: 300,
          }}
        >
          <span style={{ fontSize: 36 }}>🌱</span>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#2d4a2d' }}>
            qual é o seu apelido?
          </div>
          <input
            autoFocus
            type="text"
            placeholder="ex: nana, gueguel"
            value={nickInput}
            onChange={(e) => setNickInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveNick()
            }}
            style={{
              background: '#eaf5ea',
              border: '1.5px solid #a8d8a8',
              borderRadius: 10,
              padding: '0.75rem 1.1rem',
              fontSize: 13,
              color: '#2d4a2d',
              outline: 'none',
              width: '100%',
              fontFamily: 'Baloo 2, sans-serif',
            }}
          />
          <button
            onClick={handleSaveNick}
            disabled={nickLoading}
            style={{
              padding: '0.45rem 1.4rem',
              color: '#5a2e0e',
              fontWeight: 700,
              borderRadius: 10,
              background: 'linear-gradient(180deg, #d4956a 0%, #c4845a 40%, #b8744e 100%)',
              boxShadow: '0 3px 10px #8b5a2a44',
              border: '2px solid #8b5a2a',
              cursor: 'pointer',
              fontFamily: 'Baloo 2, sans-serif',
              fontSize: 13,
            }}
          >
            {nickLoading ? '...' : 'salvar 🌿'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={boardRef}
      className="fixed inset-0 overflow-hidden"
      style={{ background: '#c8a882', cursor: editMode ? 'default' : 'crosshair' }}
      onClick={handleBoardClick}
    >
      {/* Textura de madeira */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <filter id="grain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves="4"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
            <feBlend in="SourceGraphic" mode="multiply" />
          </filter>
        </defs>
        <rect width="100%" height="100%" fill="#c8a882" />
        <g stroke="#8b5a2a" fill="none" opacity="0.18">
          <path d="M-100 120 Q300 100 700 130 Q1100 160 1500 120 Q1900 90 2200 125" />
          <path d="M-100 240 Q400 220 800 255 Q1200 280 1600 245 Q1900 220 2200 250" />
          <path d="M-100 380 Q350 360 750 390 Q1150 415 1550 385 Q1850 360 2200 380" />
          <path d="M-100 500 Q300 480 700 510 Q1100 535 1500 505 Q1850 480 2200 500" />
          <path d="M-100 640 Q400 620 800 648 Q1200 670 1600 642 Q1900 620 2200 640" />
          <path d="M-100 760 Q350 740 750 768 Q1150 790 1550 762 Q1850 742 2200 760" />
          <path d="M-100 60  Q300 42  700 68  Q1100 90  1500 62  Q1900 40  2200 62" />
          <path d="M-100 880 Q400 862 800 888 Q1200 908 1600 882 Q1900 862 2200 880" />
        </g>
        <g stroke="#7a4a20" fill="none" opacity="0.12">
          <path d="M-100 180 Q500 165 900 185 Q1300 205 1700 178 Q2000 160 2200 182" />
          <path d="M-100 310 Q450 295 850 318 Q1250 338 1650 312 Q1950 293 2200 315" />
          <path d="M-100 450 Q400 435 800 458 Q1200 478 1600 452 Q1900 432 2200 455" />
          <path d="M-100 590 Q350 575 750 595 Q1150 615 1550 590 Q1850 572 2200 592" />
          <path d="M-100 720 Q500 705 900 725 Q1300 745 1700 718 Q2000 700 2200 722" />
        </g>
        <g stroke="#7a4a20" fill="none" opacity="0.28">
          <path
            d="M100 268 Q140 252 185 258 Q225 263 248 278 Q228 298 185 302 Q140 306 100 292 Q82 282 100 268Z"
            strokeWidth="1.5"
          />
          <path
            d="M118 272 Q150 262 183 266 Q212 270 228 280 Q212 294 183 297 Q150 300 118 288 Q104 281 118 272Z"
            strokeWidth="1"
          />
          <path d="M100 280 Q50 276 -100 272" strokeWidth="1.2" />
          <path d="M248 278 Q400 274 650 278" strokeWidth="1.2" />
        </g>
        <g stroke="#7a4a20" fill="none" opacity="0.22">
          <path
            d="M1020 506 Q1065 488 1118 494 Q1168 499 1192 516 Q1170 538 1118 542 Q1065 546 1020 530 Q998 520 1020 506Z"
            strokeWidth="1.5"
          />
          <path d="M1020 518 Q880 514 650 518" strokeWidth="1.2" />
          <path d="M1192 516 Q1380 512 1700 516" strokeWidth="1.2" />
        </g>
        <g stroke="#7a4a20" fill="none" opacity="0.18">
          <path
            d="M340 738 Q368 728 398 732 Q424 736 436 748 Q422 762 398 765 Q368 768 340 756 Q326 748 340 738Z"
            strokeWidth="1.2"
          />
          <path d="M340 748 Q200 744 -100 748" strokeWidth="1" />
          <path d="M436 748 Q600 744 820 748" strokeWidth="1" />
        </g>
        <rect width="100%" height="100%" fill="url(#grain)" opacity="0.04" filter="url(#grain)" />
        <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
          <stop offset="60%" stopColor="transparent" />
          <stop offset="100%" stopColor="#5a3010" stopOpacity="0.18" />
        </radialGradient>
        <rect width="100%" height="100%" fill="url(#vignette)" />
      </svg>

      {/* Itens do mural */}
      <div className="relative z-10">
        {sortedItems.map((item) => {
          const z = (item.zOrder ?? 0) + 10
          const commonProps = {
            key: item.id,
            editMode,
            zIndex: z,
            onUpdate: handleUpdate as never,
            onDelete: handleDelete,
            onBringForward: handleBringForward,
            onSendBackward: handleSendBackward,
            onFocus: handleFocus,
          }

          if (item.type === 'postit') {
            return <PostIt {...commonProps} item={item as PostItItem} />
          }
          if (item.type === 'checklist') {
            return <Checklist {...commonProps} item={item as ChecklistItem} />
          }
          if (item.type === 'tag') {
            return <Tag {...commonProps} item={item as TagItem} />
          }
          if (item.type === 'letter') {
            return (
              <Letter
                {...commonProps}
                item={item as LetterItem}
                currentUid={uid}
                displayName={displayName}
                otherName={otherName}
              />
            )
          }
          if (item.type === 'drawing') {
            return <DrawingSheet {...commonProps} item={item as DrawingItem} />
          }
          return null
        })}
      </div>

      {/* Dica inicial */}
      {!editMode && items.length === 0 && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ zIndex: 5 }}
        >
          <p
            style={{
              color: '#3a1a08',
              opacity: 0.35,
              fontSize: 15,
              fontFamily: 'Baloo 2, sans-serif',
              letterSpacing: '0.02em',
            }}
          >
            clique no mural pra adicionar algo 🌿
          </p>
        </div>
      )}

      {/* Toolbar */}
      <Toolbar
        selected={selectedTool}
        editMode={editMode}
        onSelect={setSelectedTool}
        onToggleEdit={() => setEditMode((e) => !e)}
      />
      <StreakCounter />
    </div>
  )
}
