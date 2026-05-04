import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

const CHANGELOG: Record<string, string[]> = {}

export default function ChangelogModal() {
  const [open, setOpen] = useState(false)
  const [version, setVersion] = useState('')

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).api.getVersion().then((v: string) => {
      setVersion(v)
      const key = `leafnote-couples-changelog-${v}`
      if (!localStorage.getItem(key) && CHANGELOG[v]) {
        setOpen(true)
        localStorage.setItem(key, '1')
      }
    })
  }, [])

  if (!open || !CHANGELOG[version]) return null

  return (
    <div
      onClick={() => setOpen(false)}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(26,42,26,0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(160deg, #fdf6f0 0%, #f5ecd7 100%)',
          border: '2px solid #c4956a',
          borderRadius: 20,
          padding: '28px 32px',
          minWidth: 340,
          maxWidth: 480,
          boxShadow: '0 8px 40px rgba(44,24,16,0.35)',
          fontFamily: "'Baloo 2', cursive",
          position: 'relative',
        }}
      >
        <button
          onClick={() => setOpen(false)}
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#8b6914',
          }}
        >
          <X size={20} />
        </button>

        <div style={{ fontSize: 22, fontWeight: 800, color: '#2d4a2d', marginBottom: 16 }}>
          o que há de novo
        </div>

        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {CHANGELOG[version].map((item, i) => (
            <li
              key={item}
              style={{
                fontSize: i === 0 ? 15 : 13,
                fontWeight: i === 0 ? 800 : 500,
                color: i === 0 ? '#5a3010' : '#3d2408',
                borderBottom: i === 0 ? '1px solid #d4aa8066' : 'none',
                paddingBottom: i === 0 ? 10 : 0,
              }}
            >
              {item}
            </li>
          ))}
        </ul>

        <button
          onClick={() => setOpen(false)}
          style={{
            marginTop: 20,
            width: '100%',
            padding: '10px 0',
            background: 'linear-gradient(135deg, #d4956a, #c4845a)',
            border: 'none',
            borderRadius: 12,
            color: '#fff',
            fontFamily: "'Baloo 2', cursive",
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          que fofo! 🌿
        </button>
      </div>
    </div>
  )
}
