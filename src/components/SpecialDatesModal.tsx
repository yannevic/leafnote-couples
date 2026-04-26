import { useState } from 'react'
import { X, Save } from 'lucide-react'

export interface SpecialDates {
  birthdayMe: string // 'MM-DD'
  birthdayPartner: string
  anniversary: string // aniversário do casal
  metDate: string // dia que se conheceram
  datingDate: string // namoro (pode ficar vazio)
}

interface Props {
  initial: SpecialDates
  onSave: (dates: SpecialDates) => void
  onClose: () => void
}

const FIELDS: { key: keyof SpecialDates; label: string; placeholder: string }[] = [
  { key: 'birthdayMe', label: 'Meu aniversário', placeholder: 'MM-DD' },
  { key: 'birthdayPartner', label: 'Aniversário da pessoa amada', placeholder: 'MM-DD' },
  { key: 'anniversary', label: 'Aniversário do casal', placeholder: 'MM-DD' },
  { key: 'metDate', label: 'Dia que se conheceram', placeholder: 'MM-DD' },
  { key: 'datingDate', label: 'Início do namoro', placeholder: 'MM-DD (opcional)' },
]

export default function SpecialDatesModal({ initial, onSave, onClose }: Props) {
  const [form, setForm] = useState<SpecialDates>(initial)

  function handleChange(key: keyof SpecialDates, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
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
          position: 'relative',
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
                {f.label}
              </label>
              <input
                type="text"
                value={form[f.key]}
                onChange={(e) => handleChange(f.key, e.target.value)}
                placeholder={f.placeholder}
                maxLength={5}
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
