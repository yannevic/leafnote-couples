import { useState } from 'react'
import { useStreak } from '../hooks/useStreak'
import { Bird } from 'lucide-react'

const MILESTONES = [
  {
    days: 7,
    emoji: '💌',
    title: '1 semana!',
    prize: 'Escrevam uma cartinha fofa um pro outro e escolham juntos um prêmio especial',
  },
  {
    days: 14,
    emoji: '🍕',
    title: '2 semanas!',
    prize: 'Peçam a comida favorita de cada um e jantem juntos em chamada',
  },
  {
    days: 21,
    emoji: '🎮',
    title: '3 semanas!',
    prize: 'Noite de jogos relaxantes juntos em chamada — escolham um jogo fofo pra jogar',
  },
  {
    days: 30,
    emoji: '🌙',
    title: '1 mês! Super prêmio!',
    prize: 'Filme com pipoca ao mesmo tempo em chamada, caminhas combinadas e noite especial',
  },
]

function getMilestone(days: number) {
  return [...MILESTONES].reverse().find((m) => days >= m.days) ?? null
}

function getNext(days: number) {
  return MILESTONES.find((m) => days < m.days) ?? null
}

export default function StreakCounter() {
  const { streak, loading, days, setStart, reset } = useStreak()
  const [showPanel, setShowPanel] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [dateInput, setDateInput] = useState('')
  const [showMilestone, setShowMilestone] = useState(false)

  const milestone = getMilestone(days)
  const next = getNext(days)

  const handleSetDate = async () => {
    if (!dateInput) return
    await setStart(new Date(dateInput).toISOString())
    setShowDatePicker(false)
  }

  const handleReset = async () => {
    await reset()
    setShowConfirm(false)
    setShowPanel(false)
  }

  const progressPct = next
    ? Math.min(100, ((days - (milestone?.days ?? 0)) / (next.days - (milestone?.days ?? 0))) * 100)
    : 100

  if (loading) return null

  return (
    <>
      {/* Botão flutuante no topo esquerdo */}
      <div
        data-item
        onClick={(e) => {
          e.stopPropagation()
          setShowPanel((v) => !v)
        }}
        style={{
          position: 'fixed',
          top: 48,
          left: 14,
          zIndex: 48,
          background: 'linear-gradient(180deg, #fdf6f0 0%, #fce8ee 100%)',
          border: '1.5px solid #e8a0b0',
          borderRadius: 14,
          padding: '6px 14px',
          cursor: 'pointer',
          fontFamily: 'Baloo 2, sans-serif',
          boxShadow: '0 2px 12px rgba(44,20,8,0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          userSelect: 'none',
          transition: 'transform 0.15s',
        }}
      >
        <Bird size={18} strokeWidth={2} color="#c87090" />
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#7a3040' }}>
            {streak?.startDate ? `${days} dia${days !== 1 ? 's' : ''}` : 'definir data'}
          </span>
          <span style={{ fontSize: 9, color: '#c87090', fontWeight: 600 }}>sem brigar 🌸</span>
        </div>
      </div>

      {/* Painel expandido */}
      {showPanel && (
        <div
          style={{
            position: 'fixed',
            top: 96,
            left: 14,
            zIndex: 48,
            width: 280,
            background: '#fdf6f0',
            border: '1.5px solid #e8a0b0',
            borderRadius: 16,
            boxShadow: '0 8px 32px rgba(44,20,8,0.2)',
            fontFamily: 'Baloo 2, sans-serif',
            overflow: 'hidden',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, #fda4b4 0%, #f9d0e0 100%)',
              padding: '14px 16px 12px',
              borderBottom: '1px solid #e8a0b0',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 800, color: '#5a1028' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 13,
                  fontWeight: 800,
                  color: '#5a1028',
                }}
              >
                <Bird size={14} strokeWidth={2} /> dias sem brigar
              </div>
            </div>
            <div
              style={{
                fontSize: 36,
                fontWeight: 900,
                color: '#7a3040',
                lineHeight: 1.1,
                marginTop: 4,
              }}
            >
              {streak?.startDate ? days : '—'}
              <span style={{ fontSize: 14, fontWeight: 600, marginLeft: 6 }}>
                {streak?.startDate ? `dia${days !== 1 ? 's' : ''}` : ''}
              </span>
            </div>

            {/* Barra de progresso pro próximo marco */}
            {streak?.startDate && next && (
              <div style={{ marginTop: 8 }}>
                <div
                  style={{
                    fontSize: 9,
                    color: '#c87090',
                    fontWeight: 700,
                    marginBottom: 4,
                  }}
                >
                  próximo marco: {next.emoji} {next.days} dias
                </div>
                <div
                  style={{
                    height: 6,
                    background: 'rgba(255,255,255,0.4)',
                    borderRadius: 10,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${progressPct}%`,
                      background: 'linear-gradient(90deg, #e8607a, #fda4b4)',
                      borderRadius: 10,
                      transition: 'width 0.6s ease',
                    }}
                  />
                </div>
              </div>
            )}

            {streak?.startDate && !next && (
              <div style={{ fontSize: 10, color: '#c87090', fontWeight: 700, marginTop: 6 }}>
                todos os marcos conquistados! 🌟
              </div>
            )}
          </div>

          {/* Marco atual */}
          {milestone && (
            <div
              onClick={() => setShowMilestone(true)}
              style={{
                padding: '10px 16px',
                borderBottom: '1px solid #f0d0dc',
                cursor: 'pointer',
                background: '#fff8fb',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <span style={{ fontSize: 22 }}>{milestone.emoji}</span>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#7a3040' }}>
                  {milestone.title}
                </div>
                <div style={{ fontSize: 10, color: '#c87090' }}>toque pra ver o prêmio 🎁</div>
              </div>
            </div>
          )}

          {/* Marcos futuros */}
          <div style={{ padding: '10px 16px', borderBottom: '1px solid #f0d0dc' }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: '#c87090', marginBottom: 6 }}>
              marcos
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {MILESTONES.map((m) => {
                const reached = days >= m.days
                return (
                  <div
                    key={m.days}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      opacity: reached ? 1 : 0.45,
                    }}
                  >
                    <span style={{ fontSize: 14 }}>{reached ? m.emoji : '🔒'}</span>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: reached ? '#7a3040' : '#c4a0a8',
                      }}
                    >
                      {m.days} dias — {m.title}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Ações */}
          <div style={{ padding: '10px 16px', display: 'flex', flexDirection: 'column', gap: 7 }}>
            {!streak?.startDate ? (
              <button
                onClick={() => setShowDatePicker(true)}
                style={{
                  padding: '8px 0',
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #fda4b4, #e8607a)',
                  border: 'none',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: 12,
                  cursor: 'pointer',
                  fontFamily: 'Baloo 2, sans-serif',
                  width: '100%',
                }}
              >
                definir data de início 📅
              </button>
            ) : (
              <button
                onClick={() => setShowDatePicker(true)}
                style={{
                  padding: '6px 0',
                  borderRadius: 10,
                  background: 'none',
                  border: '1.5px solid #e8a0b0',
                  color: '#c87090',
                  fontWeight: 700,
                  fontSize: 11,
                  cursor: 'pointer',
                  fontFamily: 'Baloo 2, sans-serif',
                  width: '100%',
                }}
              >
                alterar data 📅
              </button>
            )}

            {streak?.startDate && (
              <button
                onClick={() => setShowConfirm(true)}
                style={{
                  padding: '6px 0',
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #ff6b6b, #c0392b)',
                  border: 'none',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: 11,
                  cursor: 'pointer',
                  fontFamily: 'Baloo 2, sans-serif',
                  width: '100%',
                }}
              >
                brigamos 💔
              </button>
            )}
          </div>
        </div>
      )}

      {/* Modal: escolher data */}
      {showDatePicker && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(44,20,8,0.45)',
            zIndex: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setShowDatePicker(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fdf6f0',
              borderRadius: 16,
              padding: '24px 28px',
              boxShadow: '0 8px 40px rgba(44,20,8,0.3)',
              fontFamily: 'Baloo 2, sans-serif',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              minWidth: 280,
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 800, color: '#3d2408' }}>
              📅 quando foi o último desentendimento?
            </div>
            <div style={{ fontSize: 11, color: '#c87090' }}>
              escolha a data de início do contador
            </div>
            <input
              type="date"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              style={{
                padding: '8px 12px',
                borderRadius: 10,
                border: '1.5px solid #e8a0b0',
                fontSize: 13,
                fontFamily: 'Baloo 2, sans-serif',
                color: '#3d2408',
                outline: 'none',
                background: '#fff8f0',
              }}
            />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowDatePicker(false)}
                style={{
                  padding: '7px 16px',
                  borderRadius: 10,
                  background: 'none',
                  border: '1.5px solid #e8a0b0',
                  color: '#c87090',
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: 'pointer',
                  fontFamily: 'Baloo 2, sans-serif',
                }}
              >
                cancelar
              </button>
              <button
                onClick={handleSetDate}
                style={{
                  padding: '7px 18px',
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #fda4b4, #e8607a)',
                  border: 'none',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: 12,
                  cursor: 'pointer',
                  fontFamily: 'Baloo 2, sans-serif',
                }}
              >
                salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: confirmar reset */}
      {showConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(44,20,8,0.55)',
            zIndex: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setShowConfirm(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fdf6f0',
              borderRadius: 16,
              padding: '24px 28px',
              boxShadow: '0 8px 40px rgba(44,20,8,0.3)',
              fontFamily: 'Baloo 2, sans-serif',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              minWidth: 280,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 32 }}>💔</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#3d2408' }}>tem certeza?</div>
            <div style={{ fontSize: 12, color: '#c87090', lineHeight: 1.5 }}>
              isso vai zerar o contador e reiniciar do zero hoje.
              <br />
              mas tá tudo bem, a gente se resolve! 🌸
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <button
                onClick={() => setShowConfirm(false)}
                style={{
                  padding: '8px 20px',
                  borderRadius: 10,
                  background: 'none',
                  border: '1.5px solid #e8a0b0',
                  color: '#c87090',
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: 'pointer',
                  fontFamily: 'Baloo 2, sans-serif',
                }}
              >
                não, cancelar
              </button>
              <button
                onClick={handleReset}
                style={{
                  padding: '8px 20px',
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #ff6b6b, #c0392b)',
                  border: 'none',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: 12,
                  cursor: 'pointer',
                  fontFamily: 'Baloo 2, sans-serif',
                }}
              >
                sim, brigamos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: prêmio do marco */}
      {showMilestone && milestone && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(44,20,8,0.55)',
            zIndex: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setShowMilestone(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fdf6f0',
              borderRadius: 20,
              padding: '32px 32px',
              boxShadow: '0 8px 40px rgba(44,20,8,0.3)',
              fontFamily: 'Baloo 2, sans-serif',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              maxWidth: 320,
              textAlign: 'center',
              border: '2px solid #e8a0b0',
            }}
          >
            <div style={{ fontSize: 48 }}>{milestone.emoji}</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#7a3040' }}>{milestone.title}</div>
            <div
              style={{
                fontSize: 13,
                color: '#5a2030',
                lineHeight: 1.6,
                background: '#fff0f5',
                borderRadius: 12,
                padding: '12px 16px',
                border: '1px solid #f0c0d0',
              }}
            >
              🎁 {milestone.prize}
            </div>
            <button
              onClick={() => setShowMilestone(false)}
              style={{
                padding: '8px 0',
                borderRadius: 10,
                background: 'linear-gradient(135deg, #fda4b4, #e8607a)',
                border: 'none',
                color: '#fff',
                fontWeight: 800,
                fontSize: 13,
                cursor: 'pointer',
                fontFamily: 'Baloo 2, sans-serif',
                marginTop: 4,
              }}
            >
              que fofinho! 🌸
            </button>
          </div>
        </div>
      )}
    </>
  )
}
