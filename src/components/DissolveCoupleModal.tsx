import { useState } from 'react'
import { Trash2 } from 'lucide-react'

const CONFIRMATION_PHRASE = 'encerrar nosso cantinho'

interface Props {
  onConfirm: () => Promise<void>
  onClose: () => void
}

export default function DissolveCoupleModal({ onConfirm, onClose }: Props) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const isMatch = input.trim().toLowerCase() === CONFIRMATION_PHRASE

  async function handleConfirm() {
    if (!isMatch) return
    setLoading(true)
    await onConfirm()
    setLoading(false)
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: 'rgba(26,20,8,0.65)',
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
          padding: '2rem 2.5rem',
          width: 380,
          boxShadow: '0 8px 40px rgba(44,24,16,0.35)',
          fontFamily: "'Baloo 2', cursive",
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Trash2 size={18} color="#c0504a" />
          <span style={{ fontSize: 15, fontWeight: 800, color: '#2C1810' }}>
            encerrar o cantinho
          </span>
        </div>

        <p style={{ fontSize: 12, color: '#5a3010', lineHeight: 1.6, margin: 0 }}>
          isso vai apagar <strong>tudo</strong> — mural, jardim, cartas, streaks, histórico. essa
          ação é <strong>irreversível</strong>.
        </p>

        <p style={{ fontSize: 12, color: '#8b6914', margin: 0 }}>
          para confirmar, digite exatamente:
          <br />
          <span
            style={{
              fontWeight: 800,
              color: '#c0504a',
              letterSpacing: '0.02em',
            }}
          >
            {CONFIRMATION_PHRASE}
          </span>
        </p>

        <input
          autoFocus
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={CONFIRMATION_PHRASE}
          style={{
            background: '#fdf0f0',
            border: `1.5px solid ${isMatch ? '#4A7A4A' : '#d4aa80'}`,
            borderRadius: 10,
            padding: '0.75rem 1rem',
            fontSize: 13,
            color: '#2C1810',
            outline: 'none',
            fontFamily: "'Baloo 2', cursive",
            transition: 'border-color 0.2s',
          }}
        />

        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '0.65rem',
              background: 'none',
              border: '1.5px solid #d4aa80',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              color: '#8b6914',
              cursor: 'pointer',
              fontFamily: "'Baloo 2', cursive",
            }}
          >
            cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isMatch || loading}
            style={{
              flex: 1,
              padding: '0.65rem',
              background: isMatch ? '#c0504a' : 'rgba(192,80,74,0.25)',
              border: '1.5px solid #c0504a',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              color: isMatch ? '#fff' : 'rgba(192,80,74,0.5)',
              cursor: isMatch && !loading ? 'pointer' : 'not-allowed',
              fontFamily: "'Baloo 2', cursive",
              transition: 'all 0.2s',
            }}
          >
            {loading ? '...' : 'encerrar'}
          </button>
        </div>
      </div>
    </div>
  )
}
