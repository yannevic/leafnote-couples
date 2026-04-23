import { useState, useEffect, useRef } from 'react'
import { useActivityLog } from '../hooks/useActivityLog'
import { ActivityEntry } from '../lib/widgets'

function timeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000)
  if (diff < 60) return 'agora'
  if (diff < 3600) return `${Math.floor(diff / 60)}min`
  return `${Math.floor(diff / 3600)}h`
}

interface VisibleEntry extends ActivityEntry {
  dying: boolean
}

export default function ActivityFeed() {
  const entries = useActivityLog()
  const [visible, setVisible] = useState<VisibleEntry[]>([])
  const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  const sessionStart = useRef<number>(
    (() => {
      const key = 'leafnote_feed_session'
      const stored = sessionStorage.getItem(key)
      if (stored) return Number(stored)
      const now = Date.now()
      sessionStorage.setItem(key, String(now))
      return now
    })()
  )

  useEffect(() => {
    entries
      .slice(0, 5)
      .filter((entry) => entry.createdAt >= sessionStart.current)
      .forEach((entry) => {
        setVisible((prev) => {
          if (prev.some((e) => e.id === entry.id)) return prev
          return [{ ...entry, dying: false }, ...prev].slice(0, 5)
        })

        // Começa a morrer em 27s, some em 30s
        if (!timersRef.current[entry.id]) {
          timersRef.current[entry.id] = setTimeout(() => {
            // Marca como dying (fade out)
            setVisible((prev) => prev.map((e) => (e.id === entry.id ? { ...e, dying: true } : e)))
            // Remove depois do fade (300ms)
            setTimeout(() => {
              setVisible((prev) => prev.filter((e) => e.id !== entry.id))
              delete timersRef.current[entry.id]
            }, 400)
          }, 27000)
        }
      })
  }, [entries])

  if (visible.length === 0) return null

  return (
    <>
      <style>{`
        @keyframes feedSlideIn {
          from { opacity: 0; transform: translateX(-16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
      <div
        style={{
          position: 'fixed',
          bottom: 24,
          left: 24,
          zIndex: 48,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          maxWidth: 260,
          pointerEvents: 'none',
        }}
      >
        {visible.map((entry, i) => (
          <div
            key={entry.id}
            style={{
              background: 'rgba(245, 236, 215, 0.92)',
              border: '1px solid var(--color-wood-300)',
              borderRadius: 12,
              padding: '5px 12px',
              fontFamily: "'Baloo 2', sans-serif",
              fontSize: 12,
              color: 'var(--color-leaf-950)',
              display: 'flex',
              gap: 6,
              alignItems: 'center',
              backdropFilter: 'blur(4px)',
              boxShadow: '0 2px 8px rgba(44,24,16,0.12)',
              animation: 'feedSlideIn 0.3s ease-out',
              opacity: entry.dying ? 0 : i === 0 ? 1 : Math.max(0.45, 1 - i * 0.18),
              transition: 'opacity 0.4s ease-out',
            }}
          >
            <span style={{ fontWeight: 800, color: 'var(--color-leaf-600)' }}>{entry.nick}</span>
            <span style={{ flex: 1 }}>{entry.message}</span>
            <span
              style={{
                fontSize: 10,
                color: 'var(--color-bark-700)',
                opacity: 0.7,
                flexShrink: 0,
              }}
            >
              {timeAgo(entry.createdAt)}
            </span>
          </div>
        ))}
      </div>
    </>
  )
}
