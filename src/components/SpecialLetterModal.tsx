import { useState } from 'react'
import { X, Send, CalendarHeart } from 'lucide-react'
import { CARD_MODELS } from '../assets/letters/index'
import type { SpecialLetterLayout } from '../types/board'
import { getAvailableDates, formatMmdd } from '../lib/specialDates'
import type { SpecialDates } from '../lib/specialDates'
import SpecialDatesModal from './SpecialDatesModal'

interface Props {
  myNick: string
  partnerNick: string
  myUid: string
  partnerUid: string
  specialDates: SpecialDates
  onSend: (data: {
    message: string
    cardModel: string
    layout: SpecialLetterLayout
    from: string
    to: string
    fromUid: string
    toUid: string
    specialDate: string
    specialDateMmdd: string
    specialDateLabel: string
  }) => void
  onClose: () => void
  onSaveDates: (dates: SpecialDates) => void
}

export default function SpecialLetterModal({
  myNick,
  partnerNick,
  myUid,
  partnerUid,
  specialDates,
  onSend,
  onClose,
  onSaveDates,
}: Props) {
  const [selectedModel, setSelectedModel] = useState(CARD_MODELS[0].id)
  const [message, setMessage] = useState('')
  const availableDates = getAvailableDates(specialDates)
  const [selectedDateKey, setSelectedDateKey] = useState(availableDates[0]?.key ?? '')
  const [showDatesModal, setShowDatesModal] = useState(false)

  const model = CARD_MODELS.find((m) => m.id === selectedModel)!
  const selectedDateObj = availableDates.find((d) => d.key === selectedDateKey)

  function handleSend() {
    if (!message.trim() || !selectedDateObj) return
    onSend({
      message: message.trim(),
      cardModel: selectedModel,
      layout: model.layout,
      from: myNick,
      to: partnerNick,
      fromUid: myUid,
      toUid: partnerUid,
      specialDate: selectedDateKey,
      specialDateMmdd: selectedDateObj.mmdd,
      specialDateLabel: selectedDateObj.label,
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => setShowDatesModal(true)}
              style={{
                background: 'linear-gradient(145deg, #fce8f5 0%, #e8a0c8 100%)',
                border: '2px solid #c478a8',
                borderRadius: '50%',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#7a3060',
                boxShadow: '0 2px 6px rgba(196,120,168,0.3)',
              }}
              title="editar datas especiais"
            >
              <CalendarHeart size={16} strokeWidth={2} />
            </button>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a06060' }}
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* seletor de data */}
        <p
          style={{
            fontFamily: "'Baloo 2', cursive",
            fontSize: 13,
            color: '#a06060',
            marginBottom: 8,
          }}
        >
          Para qual data especial é essa carta?
        </p>
        {availableDates.length === 0 ? (
          <div
            style={{
              background: '#fff4e0',
              border: '1.5px solid #e8d5b0',
              borderRadius: 10,
              padding: '12px 16px',
              marginBottom: 20,
              fontFamily: "'Baloo 2', cursive",
              fontSize: 13,
              color: '#a06060',
            }}
          >
            Nenhuma data especial cadastrada ainda. Cadastre no calendário primeiro! 🌸
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
            {availableDates.map((d) => (
              <button
                key={d.key}
                onClick={() => setSelectedDateKey(d.key)}
                style={{
                  fontFamily: "'Baloo 2', cursive",
                  fontSize: 12,
                  fontWeight: 700,
                  padding: '6px 14px',
                  borderRadius: 20,
                  cursor: 'pointer',
                  border: selectedDateKey === d.key ? '2px solid #e8a0b0' : '1.5px solid #e8d5b0',
                  background: selectedDateKey === d.key ? '#fce8f0' : '#fffaf4',
                  color: selectedDateKey === d.key ? '#7a3040' : '#a06060',
                  transition: 'all 0.15s',
                }}
              >
                {d.label} · {formatMmdd(d.mmdd)}
              </button>
            ))}
          </div>
        )}

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

          {showDatesModal && (
            <SpecialDatesModal
              initial={specialDates}
              myNick={myNick}
              partnerNick={partnerNick}
              onSave={(d) => {
                onSaveDates(d)
                setShowDatesModal(false)
              }}
              onClose={() => setShowDatesModal(false)}
            />
          )}

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
                disabled={!message.trim() || !selectedDateObj}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: message.trim() && selectedDateObj ? '#e8a0b0' : '#e8d5b0',
                  color: message.trim() && selectedDateObj ? '#5a2a2a' : '#a09080',
                  border: 'none',
                  borderRadius: 12,
                  padding: '10px 24px',
                  fontFamily: "'Baloo 2', cursive",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: message.trim() && selectedDateObj ? 'pointer' : 'not-allowed',
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
