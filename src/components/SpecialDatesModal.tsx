import { useState } from 'react'
import { X, Save } from 'lucide-react'
import type { SpecialDates } from '../lib/specialDates'

interface Props {
  initial: SpecialDates
  myUid: string
  myNick: string
  partnerNick: string
  onSave: (dates: SpecialDates) => void
  onClose: () => void
}

export default function SpecialDatesModal({
  initial,
  myUid,
  myNick,
  partnerNick: rawPartner,
  onSave,
  onClose,
}: Props) {
  const partnerNick = !rawPartner || rawPartner === '...' ? 'parceiro(a)' : rawPartner

  const [birthdayMe, setBirthdayMe] = useState(initial.birthdayOf?.[myUid] ?? '')
  const [anniversary, setAnniversary] = useState(initial.anniversary ?? '')
  const [metDate, setMetDate] = useState(initial.metDate ?? '')
  const [datingDate, setDatingDate] = useState(initial.datingDate ?? '')

  function clean(v: string) {
    return v.replace(/[^\d-]/g, '')
  }

  function handleSave() {
    const next: SpecialDates = {
      birthdayOf: { ...(initial.birthdayOf ?? {}), [myUid]: birthdayMe },
      anniversary,
      metDate,
      datingDate,
    }
    onSave(next)
    onClose()
  }

  const fields = [
    {
      label: `Aniversário de ${myNick}`,
      value: birthdayMe,
      set: setBirthdayMe,
      placeholder: 'DD-MM',
      max: 5,
    },
    {
      label: `Aniversário de ${partnerNick}`,
      value: '',
      set: () => {},
      placeholder: 'preenchido pelo parceiro',
      max: 5,
      disabled: true,
    },
    {
      label: 'Aniversário do casal',
      value: anniversary,
      set: setAnniversary,
      placeholder: 'DD-MM-AAAA',
      max: 10,
    },
    {
      label: 'Dia que se conheceram',
      value: metDate,
      set: setMetDate,
      placeholder: 'DD-MM-AAAA',
      max: 10,
    },
    {
      label: 'Início do namoro (opcional)',
      value: datingDate,
      set: setDatingDate,
      placeholder: 'DD-MM-AAAA',
      max: 10,
    },
  ]

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
          width: 420,
          boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
          border: '2px solid #e8d5b0',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 24,
          }}
        >
          <h2
            style={{ fontFamily: "'Baloo 2', cursive", fontSize: 20, color: '#5a2a2a', margin: 0 }}
          >
            🌸 Datas especiais
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a06060' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {fields.map((f) => (
            <div key={f.label}>
              <label
                style={{
                  fontFamily: "'Baloo 2', cursive",
                  fontSize: 13,
                  color: '#a06060',
                  display: 'block',
                  marginBottom: 4,
                }}
              >
                {f.label}
              </label>
              <input
                type="text"
                value={f.value}
                onChange={(e) => f.set(clean(e.target.value))}
                placeholder={f.placeholder}
                maxLength={f.max}
                disabled={f.disabled}
                style={{
                  width: '100%',
                  borderRadius: 10,
                  border: '1.5px solid #e8d5b0',
                  background: f.disabled ? '#f0ece4' : '#fffaf4',
                  padding: '8px 14px',
                  fontFamily: "'Baloo 2', cursive",
                  fontSize: 14,
                  color: f.disabled ? '#b0a090' : '#5a2a2a',
                  outline: 'none',
                  boxSizing: 'border-box',
                  letterSpacing: '0.05em',
                  cursor: f.disabled ? 'not-allowed' : 'text',
                }}
              />
              {f.disabled && (
                <span style={{ fontSize: 10, color: '#c4a080', fontFamily: "'Baloo 2', cursive" }}>
                  só {partnerNick} pode preencher o próprio aniversário 🌸
                </span>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={handleSave}
          style={{
            marginTop: 24,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            background: '#e8a0b0',
            color: '#5a2a2a',
            border: 'none',
            borderRadius: 12,
            padding: '12px',
            fontFamily: "'Baloo 2', cursive",
            fontSize: 15,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <Save size={16} /> Salvar datas
        </button>
      </div>
    </div>
  )
}
