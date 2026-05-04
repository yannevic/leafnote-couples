import { useState } from 'react'
import { Copy, Check, LogIn, Plus, Loader } from 'lucide-react'
import { createCouple, requestJoinCouple, saveUserProfile } from '../lib/couple'
import type { Sex } from '../types/couple'
import TitleBar from '../components/TitleBar'

type Step = 'sex' | 'choice' | 'created' | 'join' | 'waiting'

interface Props {
  uid: string
  displayName: string
  onDone: () => void
}

export default function Onboarding({ uid, displayName, onDone }: Props) {
  const [step, setStep] = useState<Step>('sex')
  const [coupleId, setCoupleId] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSelectSex(s: Sex) {
    setLoading(true)
    await saveUserProfile(uid, displayName, s)
    setLoading(false)
    setStep('choice')
  }

  async function handleCreateCouple() {
    setLoading(true)
    const id = await createCouple(uid)
    setCoupleId(id)
    setLoading(false)
    setStep('created')
  }

  async function handleJoinCouple() {
    setError('')
    const code = joinCode.trim().toUpperCase()
    if (code.length !== 5) {
      setError('o código precisa ter 5 caracteres')
      return
    }
    setLoading(true)
    const result = await requestJoinCouple(code, uid, displayName)
    setLoading(false)
    if (result === 'not_found') {
      setError('código não encontrado, confere aí')
      return
    }
    if (result === 'already_full') {
      setError('esse casal já está completo')
      return
    }
    setStep('waiting')
  }

  function handleCopy() {
    void navigator.clipboard.writeText(coupleId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{ background: 'linear-gradient(160deg, #f0f7f0 0%, #e8f5e8 60%, #f5f0e8 100%)' }}
    >
      <TitleBar
        extraBoards={[]}
        activeBoardId="default"
        onSwitchBoard={() => {}}
        onAddBoard={() => {}}
        onRemoveBoard={() => {}}
      />
      <div className="flex-1 flex items-center justify-center">
        <div
          style={{
            background: 'linear-gradient(160deg, #fdf6f0 0%, #f5ecd7 100%)',
            border: '2px solid #c4956a',
            borderRadius: 20,
            padding: '2rem 2.5rem',
            width: 380,
            boxShadow: '0 8px 40px rgba(44,24,16,0.18)',
            fontFamily: "'Baloo 2', cursive",
            display: 'flex',
            flexDirection: 'column',
            gap: '1.2rem',
          }}
        >
          {step === 'sex' && (
            <>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#2d4a2d', textAlign: 'center' }}>
                olá, {displayName}
              </div>
              <div style={{ fontSize: 13, color: '#4a7a4a', textAlign: 'center' }}>
                como você se identifica?
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={() => handleSelectSex('female')}
                  disabled={loading}
                  style={btnStyle('#e8a0b0', '#5a2e4a')}
                >
                  feminino
                </button>
                <button
                  onClick={() => handleSelectSex('male')}
                  disabled={loading}
                  style={btnStyle('#7fb87f', '#1a2a1a')}
                >
                  masculino
                </button>
              </div>
            </>
          )}

          {step === 'choice' && (
            <>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#2d4a2d', textAlign: 'center' }}>
                seu cantinho
              </div>
              <div style={{ fontSize: 13, color: '#4a7a4a', textAlign: 'center' }}>
                quer criar um novo casal ou entrar em um já existente?
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={handleCreateCouple}
                  disabled={loading}
                  style={btnStyle('#c4956a', '#5a2e0e')}
                >
                  <Plus size={16} />
                  criar nosso cantinho
                </button>
                <button
                  onClick={() => setStep('join')}
                  disabled={loading}
                  style={btnStyle('#7fb87f', '#1a2a1a')}
                >
                  <LogIn size={16} />
                  entrar com código
                </button>
              </div>
            </>
          )}

          {step === 'created' && (
            <>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#2d4a2d', textAlign: 'center' }}>
                cantinho criado
              </div>
              <div style={{ fontSize: 13, color: '#4a7a4a', textAlign: 'center' }}>
                manda esse código para o seu parceiro entrar no cantinho de vocês
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.8rem',
                  background: '#f5ecd7',
                  border: '2px solid #c4956a',
                  borderRadius: 12,
                  padding: '1rem',
                }}
              >
                <span style={{ fontSize: 28, fontWeight: 900, letterSpacing: 6, color: '#5a2e0e' }}>
                  {coupleId}
                </span>
                <button
                  onClick={handleCopy}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#8b6914',
                  }}
                >
                  {copied ? <Check size={20} /> : <Copy size={20} />}
                </button>
              </div>
              <div style={{ fontSize: 12, color: '#8b6914', textAlign: 'center' }}>
                aguardando seu parceiro entrar...
              </div>
              <button
                onClick={onDone}
                style={{
                  marginTop: 4,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 12,
                  color: '#4a7a4a',
                  textDecoration: 'underline',
                  fontFamily: "'Baloo 2', cursive",
                }}
              >
                ir para o mural enquanto espera
              </button>
            </>
          )}

          {step === 'join' && (
            <>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#2d4a2d', textAlign: 'center' }}>
                entrar no cantinho
              </div>
              <div style={{ fontSize: 13, color: '#4a7a4a', textAlign: 'center' }}>
                digite o código que seu parceiro te enviou
              </div>
              <input
                type="text"
                placeholder="ex: ROSA4"
                maxLength={5}
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                style={{
                  background: '#eaf5ea',
                  border: '1.5px solid #a8d8a8',
                  borderRadius: 10,
                  padding: '0.85rem 1.2rem',
                  fontSize: 20,
                  fontWeight: 800,
                  letterSpacing: 4,
                  color: '#2d4a2d',
                  textAlign: 'center',
                  outline: 'none',
                  fontFamily: "'Baloo 2', cursive",
                }}
              />
              {error !== '' && (
                <p style={{ fontSize: 12, color: '#c0504a', textAlign: 'center', margin: 0 }}>
                  {error}
                </p>
              )}
              <button
                onClick={handleJoinCouple}
                disabled={loading}
                style={btnStyle('#c4956a', '#5a2e0e')}
              >
                {loading ? <Loader size={16} className="animate-spin" /> : <LogIn size={16} />}
                entrar
              </button>
              <button
                onClick={() => setStep('choice')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 12,
                  color: '#4a7a4a',
                }}
              >
                voltar
              </button>
            </>
          )}

          {step === 'waiting' && (
            <>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#2d4a2d', textAlign: 'center' }}>
                pedido enviado
              </div>
              <div style={{ fontSize: 13, color: '#4a7a4a', textAlign: 'center', lineHeight: 1.6 }}>
                seu parceiro precisa aceitar o pedido para vocês entrarem no cantinho juntos.
                aguarda um momentinho enquanto ele confirma
              </div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Loader size={28} className="animate-spin" style={{ color: '#c4956a' }} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function btnStyle(bg: string, color: string): React.CSSProperties {
  return {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.4rem',
    padding: '0.75rem 1rem',
    background: bg,
    border: 'none',
    borderRadius: 12,
    color,
    fontFamily: "'Baloo 2', cursive",
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
  }
}
