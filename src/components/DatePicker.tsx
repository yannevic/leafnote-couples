import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const MONTH_NAMES = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
]
const DAY_NAMES = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

interface Props {
  value: string // YYYY-MM-DD
  onChange: (value: string) => void
  label?: string
}

export default function DatePicker({ value, onChange, label }: Props) {
  const [open, setOpen] = useState(false)

  const today = new Date()
  const parsed = value ? new Date(value + 'T12:00:00') : today
  const [viewYear, setViewYear] = useState(parsed.getFullYear())
  const [viewMonth, setViewMonth] = useState(parsed.getMonth())

  const selectedKey = value

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay()

  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  function toKey(y: number, m: number, d: number) {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  }

  function formatDisplay(dateStr: string) {
    if (!dateStr) return 'selecionar data'
    const [y, m, d] = dateStr.split('-')
    return `${d}/${m}/${y}`
  }

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear((v) => v - 1)
    } else setViewMonth((v) => v - 1)
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear((v) => v + 1)
    } else setViewMonth((v) => v + 1)
  }

  function handleSelect(day: number) {
    const key = toKey(viewYear, viewMonth, day)
    onChange(key)
    setOpen(false)
  }

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {label && (
        <label
          style={{
            fontFamily: "'Baloo 2', cursive",
            fontSize: 13,
            color: '#a06060',
            display: 'block',
            marginBottom: 4,
          }}
        >
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%',
          borderRadius: 10,
          border: '1.5px solid #e8d5b0',
          background: '#fffaf4',
          padding: '8px 14px',
          fontFamily: "'Baloo 2', cursive",
          fontSize: 14,
          color: value ? '#5a2a2a' : '#c4a080',
          outline: 'none',
          boxSizing: 'border-box',
          textAlign: 'left',
          cursor: 'pointer',
        }}
      >
        {formatDisplay(value)}
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            zIndex: 9999,
            background: '#fdf6ec',
            border: '1.5px solid #e8d5b0',
            borderRadius: 14,
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            padding: '14px',
            width: 260,
            fontFamily: "'Baloo 2', cursive",
          }}
        >
          {/* Navegação */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10,
            }}
          >
            <button
              type="button"
              onClick={prevMonth}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#c87090',
                padding: 4,
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#5a2a2a' }}>
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#c87090',
                padding: 4,
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Dias da semana */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 6 }}>
            {DAY_NAMES.map((d, i) => (
              <div
                key={`dn-${i}`}
                style={{
                  textAlign: 'center',
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#c87090',
                  opacity: 0.7,
                  padding: '2px 0',
                }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Grid de dias */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
            {cells.map((day, idx) => {
              if (day === null) return <div key={`e-${idx}`} />
              const key = toKey(viewYear, viewMonth, day)
              const isSelected = key === selectedKey
              const isToday = key === toKey(today.getFullYear(), today.getMonth(), today.getDate())
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleSelect(day)}
                  style={{
                    borderRadius: 8,
                    border: isToday && !isSelected ? '1.5px solid #e8a0b0' : 'none',
                    background: isSelected ? '#e8a0b0' : 'transparent',
                    color: isSelected ? '#5a2a2a' : '#5a2a2a',
                    fontFamily: "'Baloo 2', cursive",
                    fontSize: 12,
                    fontWeight: isSelected || isToday ? 700 : 400,
                    padding: '5px 0',
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  {day}
                </button>
              )
            })}
          </div>

          {/* Limpar */}
          <button
            type="button"
            onClick={() => {
              onChange('')
              setOpen(false)
            }}
            style={{
              marginTop: 10,
              width: '100%',
              background: 'none',
              border: '1px solid #e8d5b0',
              borderRadius: 8,
              padding: '6px 0',
              fontSize: 12,
              color: '#a06060',
              fontFamily: "'Baloo 2', cursive",
              cursor: 'pointer',
            }}
          >
            limpar
          </button>
        </div>
      )}
    </div>
  )
}
