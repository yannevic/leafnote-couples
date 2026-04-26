import { useState } from 'react'
import { X, Save } from 'lucide-react'
import type { SpecialDates } from '../lib/specialDates'

interface Props {
  initial: SpecialDates
  myNick: string
  partnerNick: string
  onSave: (dates: SpecialDates) => void
  onClose: () => void
}

const FIELDS: {
  key: keyof SpecialDates
  labelFn: (my: string, partner: string) => string
  placeholder: string
  withYear: boolean
}[] = [
  {
    key: 'birthdayMe',
    labelFn: (my) => `Aniversário de ${my}`,
    placeholder: 'DD-MM',
    withYear: false,
  },
  {
    key: 'birthdayPartner',
    labelFn: (_, partner) => `Aniversário de ${partner}`,
    placeholder: 'DD-MM',
    withYear: false,
  },
  {
    key: 'metDate',
    labelFn: () => 'Dia que se conheceram',
    placeholder: 'DD-MM-AAAA',
    withYear: true,
  },
  {
    key: 'anniversary',
    labelFn: () => 'Aniversário do casal',
    placeholder: 'DD-MM-AAAA',
    withYear: true,
  },
  {
    key: 'datingDate',
    labelFn: () => 'Início do namoro (opcional)',
    placeholder: 'DD-MM-AAAA',
    withYear: true,
  },
]

export default function SpecialDatesModal({
  initial,
  myNick: rawMy,
  partnerNick: rawPartner,
  onSave,
  onClose,
}: Props) {
  const myNick = !rawMy || rawMy === '...' ? 'você' : rawMy
  const partnerNick = !rawPartner || rawPartner === '...' ? 'parceiro(a)' : rawPartner
  const [form, setForm] = useState<SpecialDates>(initial)

  function handleChange(key: keyof SpecialDates, value: string) {
    // permite só números e hífen
    const clean = value.replace(/[^\d-]/g, '')
    setForm((prev) => ({ ...prev, [key]: clean }))
  }

  function handleSave() {
    onSave(form)
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
          {FIELDS.map((f) => (
            <div key={f.key}>
              <label
                style={{
                  fontFamily: "'Baloo 2', cursive",
                  fontSize: 13,
                  color: '#a06060',
                  display: 'block',
                  marginBottom: 4,
                }}
              >
                {f.labelFn(myNick, partnerNick)}
              </label>
              <input
                type="text"
                value={form[f.key]}
                onChange={(e) => handleChange(f.key, e.target.value)}
                placeholder={f.placeholder}
                maxLength={f.withYear ? 10 : 5}
                style={{
                  width: '100%',
                  borderRadius: 10,
                  border: '1.5px solid #e8d5b0',
                  background: '#fffaf4',
                  padding: '8px 14px',
                  fontFamily: "'Baloo 2', cursive",
                  fontSize: 14,
                  color: '#5a2a2a',
                  outline: 'none',
                  boxSizing: 'border-box',
                  letterSpacing: '0.05em',
                }}
              />
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
