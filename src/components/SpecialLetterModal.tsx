import { useState } from 'react'
import { X, Send } from 'lucide-react'
import { CARD_MODELS } from '../assets/letters/index'
import type { SpecialLetterLayout } from '../types/board'

interface Props {
  myNick: string
  partnerNick: string
  myUid: string
  partnerUid: string
  onSend: (data: {
    message: string
    cardModel: string
    layout: SpecialLetterLayout
    from: string
    to: string
    fromUid: string
    toUid: string
  }) => void
  onClose: () => void
}

export default function SpecialLetterModal({
  myNick,
  partnerNick,
  myUid,
  partnerUid,
  onSend,
  onClose,
}: Props) {
  const [selectedModel, setSelectedModel] = useState(CARD_MODELS[0].id)
  const [message, setMessage] = useState('')

  const model = CARD_MODELS.find((m) => m.id === selectedModel)!

  function handleSend() {
    if (!message.trim()) return
    onSend({
      message: message.trim(),
      cardModel: selectedModel,
      layout: model.layout,
      from: myNick,
      to: partnerNick,
      fromUid: myUid,
      toUid: partnerUid,
    })
    onClose()
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(26,42,26,0.55)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          background: '#fdf6ec',
          borderRadius: 20,
          padding: '28px 32px',
          width: 640,
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
          position: 'relative',
          border: '2px solid #e8d5b0',
        }}
      >
        {/* header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
          }}
        >
          <h2
            style={{ fontFamily: "'Baloo 2', cursive", fontSize: 22, color: '#5a2a2a', margin: 0 }}
          >
            💌 Carta especial para {partnerNick}
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a06060' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* escolha do modelo */}
        <p
          style={{
            fontFamily: "'Baloo 2', cursive",
            fontSize: 13,
            color: '#a06060',
            marginBottom: 10,
          }}
        >
          Escolha o modelo:
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
          {CARD_MODELS.map((card) => (
            <button
              key={card.id}
              onClick={() => setSelectedModel(card.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 4,
                borderRadius: 8,
                outline: selectedModel === card.id ? '3px solid #e8a0b0' : '2px solid transparent',
                transition: 'outline 0.2s',
              }}
            >
              <img
                src={card.image}
                alt={card.label}
                style={{
                  width: 52,
                  height: 72,
                  objectFit: 'fill',
                  borderRadius: 6,
                  display: 'block',
                }}
              />
              <span
                style={{
                  fontFamily: "'Baloo 2', cursive",
                  fontSize: 10,
                  color: '#a06060',
                  display: 'block',
                  textAlign: 'center',
                  marginTop: 2,
                }}
              >
                {card.label}
              </span>
            </button>
          ))}
        </div>

        {/* preview + escrita */}
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          {/* preview da carta */}
          <div style={{ flexShrink: 0 }}>
            <img
              src={model.image}
              alt={model.label}
              style={{
                width: 160,
                display: 'block',
                borderRadius: 10,
                boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
              }}
            />
          </div>

          {/* textarea */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Escreva sua carta para ${partnerNick}... 🌸`}
              maxLength={600}
              style={{
                width: '100%',
                height: 200,
                resize: 'none',
                borderRadius: 12,
                border: '1.5px solid #e8d5b0',
                background: '#fffaf4',
                padding: '14px 16px',
                fontFamily: "'Baloo 2', cursive",
                fontSize: 14,
                color: '#5a2a2a',
                outline: 'none',
                lineHeight: 1.6,
                boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: "'Baloo 2', cursive", fontSize: 11, color: '#c4956a' }}>
                {message.length}/600
              </span>
              <button
                onClick={handleSend}
                disabled={!message.trim()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: message.trim() ? '#e8a0b0' : '#e8d5b0',
                  color: message.trim() ? '#5a2a2a' : '#a09080',
                  border: 'none',
                  borderRadius: 12,
                  padding: '10px 24px',
                  fontFamily: "'Baloo 2', cursive",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: message.trim() ? 'pointer' : 'not-allowed',
                  transition: 'background 0.2s',
                }}
              >
                <Send size={16} /> Enviar carta
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
