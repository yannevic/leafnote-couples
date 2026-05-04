import { useState } from 'react'
import { CalendarEvent, CalendarTheme, THEME_COLORS, MONTH_NAMES, DAY_NAMES } from '../lib/calendar'
import { X, Pin } from 'lucide-react'

interface Props {
  dateKey: string
  entries: CalendarEvent[]
  theme: CalendarTheme
  onClose: () => void
  onAdd: (text: string, time: string | null) => void
  onRemove: (id: string) => void
  onPinToBoard: (entry: CalendarEvent, dateKey: string) => void
  onPinCycleToBoard: () => void
  isFemale: boolean
  currentUser: string
}

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number)
  return { year, month: month - 1, day }
}

export default function WeekCalendarModal({
  dateKey,
  entries,
  theme,
  onClose,
  onAdd,
  onRemove,
  onPinToBoard,
  onPinCycleToBoard,
  currentUser,
}: Props) {
  const [newText, setNewText] = useState('')
  const [newTime, setNewTime] = useState('')
  const t = THEME_COLORS[theme]

  const { year, month, day } = parseDateKey(dateKey)
  const weekday = new Date(year, month, day).getDay()
  const label = `${DAY_NAMES[weekday]}, ${day} de ${MONTH_NAMES[month]}`

  function handleAdd() {
    const trimmed = newText.trim()
    if (!trimmed) return
    onAdd(trimmed, newTime || null)
    setNewText('')
    setNewTime('')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(26,42,26,0.55)' }}
      onClick={(e) => {
        e.stopPropagation()
        onClose()
      }}
    >
      <div
        className="relative rounded-2xl shadow-2xl flex flex-col"
        style={{
          width: 500,
          maxWidth: '92vw',
          height: 560,
          background: t.bg,
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div
          className="flex items-center justify-between shrink-0"
          style={{
            borderBottom: `2px dashed ${t.border}`,
            padding: '20px 28px',
          }}
        >
          <span
            className="font-bold text-xl"
            style={{ color: t.accent, fontFamily: 'Baloo 2, sans-serif' }}
          >
            🌸 {label}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              className="text-sm font-bold hover:opacity-80 transition-opacity"
              style={{
                background: '#fce8f528',
                color: '#c87090',
                fontFamily: 'Baloo 2, sans-serif',
                border: '1.5px solid #e8a0b0',
                borderRadius: 12,
                padding: '5px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
              }}
              onClick={(e) => {
                e.stopPropagation()
                onPinCycleToBoard()
              }}
              title="fixar pin de ciclo no mural"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#c87090"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
              </svg>
              ciclo
            </button>
            <button
              className="rounded-full w-9 h-9 flex items-center justify-center text-sm hover:opacity-70 transition-opacity"
              style={{ background: `${t.accent}33`, color: t.accent }}
              onClick={onClose}
            >
              ✕
            </button>
          </div>
        </div>

        {/* lista */}
        <div
          className="flex-1 overflow-y-auto flex flex-col"
          style={{ padding: '16px 28px', gap: 12 }}
        >
          {entries.length === 0 && (
            <p
              className="text-center text-sm"
              style={{
                fontFamily: 'Baloo 2, sans-serif',
                color: t.text,
                opacity: 0.5,
                marginTop: 32,
              }}
            >
              Nenhum evento ainda 🌱
            </p>
          )}
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="rounded-xl flex items-start justify-between"
              style={{
                background: `${t.accent}18`,
                border: `1.5px solid ${t.border}`,
                padding: '14px 16px',
                gap: 12,
              }}
            >
              <div className="flex flex-col" style={{ gap: 4 }}>
                {entry.time && (
                  <span
                    className="text-xs font-bold"
                    style={{ color: t.accent, fontFamily: 'Baloo 2, sans-serif' }}
                  >
                    {entry.time}
                  </span>
                )}
                <span
                  className="text-sm"
                  style={{ fontFamily: 'Baloo 2, sans-serif', color: t.text }}
                >
                  {entry.text}
                </span>
                <span
                  className="text-xs"
                  style={{ fontFamily: 'Baloo 2, sans-serif', color: t.text, opacity: 0.4 }}
                >
                  por {entry.createdBy}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0, marginTop: 2 }}>
                <button
                  className="rounded-lg text-xs font-bold hover:opacity-70 transition-opacity"
                  style={{
                    background: '#e8f5e8',
                    color: '#4A7A4A',
                    padding: '6px 10px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                  onClick={() => onPinToBoard(entry, dateKey)}
                  title="fixar no mural"
                >
                  <Pin size={12} />
                </button>
                {entry.createdBy === currentUser && (
                  <button
                    className="rounded-lg text-xs font-bold hover:opacity-70 transition-opacity"
                    style={{
                      background: '#f5d5dc',
                      color: '#e8607a',
                      padding: '6px 10px',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    onClick={() => onRemove(entry.id)}
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* input */}
        <div
          className="shrink-0 flex flex-col"
          style={{
            borderTop: `2px dashed ${t.border}`,
            padding: '20px 28px',
            gap: 12,
          }}
        >
          <div className="flex" style={{ gap: 12 }}>
            <input
              type="time"
              className="rounded-xl text-sm outline-none"
              style={{
                background: t.bg,
                border: `1.5px solid ${t.border}`,
                fontFamily: 'Baloo 2, sans-serif',
                width: 110,
                flexShrink: 0,
                color: t.text,
                padding: '10px 12px',
              }}
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
            />
            <input
              className="flex-1 rounded-xl text-sm outline-none"
              style={{
                background: t.bg,
                border: `1.5px solid ${t.border}`,
                fontFamily: 'Baloo 2, sans-serif',
                color: t.text,
                padding: '10px 16px',
              }}
              placeholder="Novo evento..."
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd()
              }}
            />
          </div>
          <button
            className="w-full rounded-xl font-bold text-sm transition-opacity hover:opacity-80"
            style={{
              background: t.accent,
              color: '#fff',
              fontFamily: 'Baloo 2, sans-serif',
              padding: '12px 0',
            }}
            onClick={handleAdd}
          >
            Adicionar 🌸
          </button>
        </div>
      </div>
    </div>
  )
}
