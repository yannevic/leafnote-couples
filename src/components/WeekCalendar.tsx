import { useState, useEffect, useRef } from 'react'
import useCalendar from '../hooks/useCalendar'
import { THEME_COLORS, DAY_NAMES, MONTH_NAMES, CalendarTheme, toDateKey } from '../lib/calendar'
import WeekCalendarModal from './WeekCalendarModal'

const THEME_OPTIONS: { key: CalendarTheme; label: string }[] = [
  { key: 'rosa', label: 'Rosa 🌸' },
  { key: 'tulipa', label: 'Tulipa 🌷' },
  { key: 'margarida', label: 'Margarida 🌼' },
  { key: 'girassol', label: 'Girassol 🌻' },
  { key: 'orquidea', label: 'Orquídea 🌺' },
  { key: 'especial', label: 'Especial 🌿' },
]

interface Props {
  displayName: string
  onClose: () => void
}

export default function WeekCalendar({ displayName, onClose }: Props) {
  const {
    theme,
    dayEntries,
    viewYear,
    viewMonth,
    subscribeDayEntries,
    addEvent,
    removeEvent,
    changeTheme,
    goToPrevMonth,
    goToNextMonth,
  } = useCalendar(displayName)

  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null)
  const [showThemePicker, setShowThemePicker] = useState(false)
  const [themePickerPos, setThemePickerPos] = useState({ top: 0, right: 0 })
  const themeButtonRef = useRef<HTMLButtonElement>(null)

  const t = theme ? THEME_COLORS[theme] : null

  const today = new Date()
  const todayKey = toDateKey(today.getFullYear(), today.getMonth(), today.getDate())

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay()

  useEffect(() => {
    const unsubs: (() => void)[] = []
    Array.from({ length: daysInMonth }, (_, i) => {
      const key = toDateKey(viewYear, viewMonth, i + 1)
      unsubs.push(subscribeDayEntries(key))
    })
    return () => unsubs.forEach((u) => u())
  }, [viewYear, viewMonth, daysInMonth, subscribeDayEntries])

  if (!t) return null

  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const selectedEntries = selectedDateKey ? (dayEntries[selectedDateKey] ?? []) : []

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(26,42,26,0.65)' }}
      onClick={onClose}
    >
      <div
        className="relative rounded-3xl shadow-2xl flex flex-col"
        style={{
          width: '92vw',
          maxWidth: 1000,
          height: '90vh',
          background: t.bg,
          backgroundImage: `url(./src/assets/patterns/${theme}.png)`,
          backgroundSize: '160px',
          backgroundRepeat: 'repeat',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* overlay legibilidade */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `${t.bg}e8`, zIndex: 1 }}
        />

        {/* ── HEADER ── */}
        <div
          className="relative z-10 flex items-center justify-between px-10 py-6 shrink-0"
          style={{ borderBottom: `2px dashed ${t.border}` }}
        >
          <div className="flex items-center gap-4">
            <button
              className="flex items-center justify-center text-2xl font-bold hover:opacity-70 transition-opacity"
              style={{ color: t.accent, padding: '0 30px' }}
              onClick={goToPrevMonth}
            >
              ‹
            </button>
            <h2
              className="text-2xl font-bold min-w-56 text-center"
              style={{ fontFamily: 'Baloo 2, sans-serif', color: t.accent }}
            >
              {MONTH_NAMES[viewMonth]} {viewYear}
            </h2>
            <button
              className="flex items-center justify-center text-2xl font-bold hover:opacity-70 transition-opacity"
              style={{ color: t.accent, padding: '0 8px' }}
              onClick={goToNextMonth}
            >
              ›
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              ref={themeButtonRef}
              className="rounded-xl px-5 py-2.5 text-sm font-bold hover:opacity-80 transition-opacity"
              style={{
                background: `${t.accent}22`,
                color: t.accent,
                fontFamily: 'Baloo 2, sans-serif',
                border: `1.5px solid ${t.border}`,
              }}
              onClick={() => {
                if (themeButtonRef.current) {
                  const rect = themeButtonRef.current.getBoundingClientRect()
                  setThemePickerPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right })
                }
                setShowThemePicker((v) => !v)
              }}
            >
              🎨 tema
            </button>

            <button
              className="rounded-full w-10 h-10 flex items-center justify-center text-base hover:opacity-70 transition-opacity"
              style={{ background: `${t.accent}33`, color: t.accent }}
              onClick={onClose}
            >
              ✕
            </button>
          </div>
        </div>

        {/* ── CABEÇALHO DIAS DA SEMANA ── */}
        <div
          className="relative z-10 grid grid-cols-7 shrink-0"
          style={{ padding: '16px 24px 8px', gap: '8px' }}
        >
          {DAY_NAMES.map((name) => (
            <div
              key={name}
              className="text-center text-xs font-bold uppercase tracking-widest"
              style={{ fontFamily: 'Baloo 2, sans-serif', color: t.accent, opacity: 0.55 }}
            >
              {name}
            </div>
          ))}
        </div>

        {/* ── GRID DE DIAS ── */}
        <div className="relative z-10 flex-1 overflow-y-auto" style={{ padding: '0 24px 24px' }}>
          <div className="grid grid-cols-7" style={{ gap: '8px' }}>
            {cells.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} style={{ minHeight: 88 }} />
              }

              const dateKey = toDateKey(viewYear, viewMonth, day)
              const isToday = dateKey === todayKey
              const entries = dayEntries[dateKey] ?? []

              return (
                <button
                  key={dateKey}
                  className="flex flex-col rounded-2xl text-left transition-all hover:scale-[1.03] hover:shadow-md active:scale-95"
                  style={{
                    background: isToday ? `${t.accent}28` : `${t.accent}0d`,
                    border: isToday ? `2px solid ${t.accent}` : `1.5px dashed ${t.border}`,
                    minHeight: 95,
                    padding: '10px 12px',
                    fontFamily: 'Baloo 2, sans-serif',
                    cursor: 'pointer',
                  }}
                  onClick={() => setSelectedDateKey(dateKey)}
                >
                  <span
                    className="text-sm font-bold"
                    style={{
                      color: isToday ? t.accent : t.text,
                      marginBottom: 6,
                      paddingLeft: 2,
                    }}
                  >
                    {day}
                  </span>

                  <div className="flex flex-col w-full" style={{ gap: 3 }}>
                    {entries.slice(0, 3).map((entry) => (
                      <div
                        key={entry.id}
                        className="rounded-md truncate"
                        style={{
                          background: `${t.accent}28`,
                          color: t.text,
                          fontSize: 10,
                          fontFamily: 'Baloo 2, sans-serif',
                          padding: '2px 6px',
                        }}
                      >
                        {entry.time && (
                          <span className="font-bold mr-1" style={{ color: t.accent }}>
                            {entry.time}
                          </span>
                        )}
                        {entry.text}
                      </div>
                    ))}
                    {entries.length > 3 && (
                      <div style={{ fontSize: 10, color: t.accent, paddingLeft: 4 }}>
                        +{entries.length - 3} mais
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {showThemePicker && (
        <div
          className="fixed flex flex-col rounded-2xl"
          onClick={(e) => e.stopPropagation()}
          style={{
            top: themePickerPos.top,
            right: themePickerPos.right,
            background: t.bg,
            border: `1.5px solid ${t.border}`,
            minWidth: 180,
            padding: '10px 8px',
            gap: 4,
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
            zIndex: 9999,
          }}
        >
          {THEME_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              className="rounded-xl text-sm font-bold text-left hover:opacity-80 transition-opacity"
              style={{
                fontFamily: 'Baloo 2, sans-serif',
                background: theme === key ? `${THEME_COLORS[key].accent}33` : 'transparent',
                color: THEME_COLORS[key].accent,
                padding: '8px 14px',
              }}
              onClick={(e) => {
                e.stopPropagation()
                changeTheme(key)
                setShowThemePicker(false)
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {selectedDateKey !== null && (
        <WeekCalendarModal
          dateKey={selectedDateKey}
          entries={selectedEntries}
          theme={theme!}
          onClose={() => setSelectedDateKey(null)}
          onAdd={(text, time) => addEvent(selectedDateKey, text, time)}
          onRemove={(id) => removeEvent(selectedDateKey, id)}
          currentUser={displayName}
        />
      )}
    </div>
  )
}
