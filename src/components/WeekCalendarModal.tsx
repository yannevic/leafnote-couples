import { useState } from 'react'
import { CalendarEvent, CalendarTheme, THEME_COLORS, MONTH_NAMES, DAY_NAMES } from '../lib/calendar'

interface Props {
  dateKey: string
  entries: CalendarEvent[]
  theme: CalendarTheme
  onClose: () => void
  onAdd: (text: string, time: string | null) => void
  onRemove: (id: string) => void
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
          <button
            className="rounded-full w-9 h-9 flex items-center justify-center text-sm hover:opacity-70 transition-opacity"
            style={{ background: `${t.accent}33`, color: t.accent }}
            onClick={onClose}
          >
            ✕
          </button>
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
                    🕐 {entry.time}
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
              {entry.createdBy === currentUser && (
                <button
                  className="rounded-lg text-xs font-bold hover:opacity-70 transition-opacity shrink-0"
                  style={{
                    background: '#f5d5dc',
                    color: '#e8607a',
                    padding: '6px 12px',
                    marginTop: 2,
                  }}
                  onClick={() => onRemove(entry.id)}
                >
                  🗑️
                </button>
              )}
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
