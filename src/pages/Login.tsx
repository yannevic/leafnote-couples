import { useState } from 'react'
import { auth } from '../lib/firebase'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  browserLocalPersistence,
  setPersistence,
  updateProfile,
} from 'firebase/auth'

import { saveUserProfile } from '../lib/couple'

type Mode = 'login' | 'register'

export default function Login() {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)

  async function handleSubmit() {
    setError('')
    if (mode === 'register' && nickname.trim() === '') {
      setError('coloca seu apelido aí 🍃')
      return
    }
    setLoading(true)
    try {
      await setPersistence(auth, browserLocalPersistence)
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password)
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email, password)
        await updateProfile(cred.user, { displayName: nickname.trim() })
        await saveUserProfile(cred.user.uid, nickname.trim(), null)
      }
    } catch (e) {
      const code =
        typeof e === 'object' && e !== null && 'code' in e
          ? String((e as { code: unknown }).code)
          : ''

      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
        setError('senha incorreta')
      } else if (code === 'auth/user-not-found') {
        setError('nenhuma conta com esse email')
      } else if (code === 'auth/email-already-in-use') {
        setError('esse email já tem uma conta')
      } else if (code === 'auth/invalid-email') {
        setError('email inválido')
      } else if (code === 'auth/weak-password') {
        setError('senha fraca — mínimo 6 caracteres')
      } else if (code === 'auth/too-many-requests') {
        setError('muitas tentativas, tenta de novo mais tarde')
      } else if (code === 'auth/network-request-failed') {
        setError('sem conexão, verifica sua internet')
      } else {
        setError('algo deu errado, tenta de novo')
      }
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #f0f7f0 0%, #e8f5e8 60%, #f5f0e8 100%)' }}
    >
      <div className="fixed top-6 left-8 text-4xl opacity-20 select-none">🌿</div>
      <div className="fixed top-8 right-10 text-3xl opacity-20 select-none">🌱</div>
      <div className="fixed bottom-8 left-12 text-3xl opacity-20 select-none">🍃</div>
      <div className="fixed bottom-6 right-8 text-4xl opacity-20 select-none">🌾</div>

      <div className="relative z-10 flex flex-col items-center gap-5 w-full max-w-sm px-8">
        <div className="flex flex-col items-center gap-1">
          <span className="text-4xl">🌱</span>
          <h1 className="text-2xl font-bold" style={{ color: '#2d4a2d' }}>
            leafnote
          </h1>
          <p className="text-sm" style={{ color: '#4a7a4a' }}>
            {mode === 'login' ? 'nosso cantinho 🍃' : 'vamos começar? 🌱'}
          </p>
        </div>

        <div
          className="flex flex-col gap-4 rounded-2xl"
          style={{
            background: '#f2faf2',
            border: '1px solid #d8eed8',
            boxShadow: '0 2px 12px #4a7a4a08',
            padding: '2rem 2.5rem',
            width: '360px',
          }}
        >
          {mode === 'register' && (
            <input
              type="text"
              placeholder="seu apelido"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="nickname"
              className="rounded-xl outline-none"
              style={{
                background: '#eaf5ea',
                border: '1.5px solid #a8d8a8',
                color: '#2d4a2d',
                padding: '0.85rem 1.2rem',
                fontSize: '0.9rem',
                width: '100%',
              }}
            />
          )}
          <input
            type="email"
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="email"
            className="rounded-xl outline-none"
            style={{
              background: '#eaf5ea',
              border: '1.5px solid #a8d8a8',
              color: '#2d4a2d',
              padding: '0.85rem 1.2rem',
              fontSize: '0.9rem',
              width: '100%',
            }}
          />
          <input
            type="password"
            placeholder="senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            className="rounded-xl outline-none"
            style={{
              background: '#eaf5ea',
              border: '1.5px solid #a8d8a8',
              color: '#2d4a2d',
              padding: '0.85rem 1.2rem',
              fontSize: '0.9rem',
              width: '100%',
            }}
          />

          {mode === 'register' && (
            <div
              style={{
                background: '#eaf5ea',
                border: '1.5px solid #a8d8a8',
                borderRadius: 10,
                padding: '0.75rem 1rem',
                fontSize: '0.75rem',
                color: '#2d4a2d',
                maxHeight: 120,
                overflowY: 'auto',
                lineHeight: 1.6,
              }}
            >
              <p style={{ fontWeight: 700, marginBottom: 4 }}>
                Termos de Uso e Política de Privacidade
              </p>
              <p>Ao criar uma conta, você concorda com os termos abaixo.</p>
              <p style={{ marginTop: 6 }}>
                <strong>1. Sobre o app</strong>
                <br />O leafnote couples é um aplicativo colaborativo para casais, distribuído de
                forma pessoal e sem fins lucrativos.
              </p>
              <p style={{ marginTop: 6 }}>
                <strong>2. Dados coletados</strong>
                <br />
                Coletamos apenas o necessário: e-mail, apelido e os dados inseridos pelo casal
                (notas, datas, registros e outros).
              </p>
              <p style={{ marginTop: 6 }}>
                <strong>3. Armazenamento</strong>
                <br />
                Seus dados são armazenados em servidores na nuvem de terceiros, protegidos por
                autenticação. Apenas você e seu parceiro têm acesso ao conteúdo do casal.
              </p>
              <p style={{ marginTop: 6 }}>
                <strong>4. Compartilhamento</strong>
                <br />
                Não vendemos, compartilhamos nem repassamos seus dados a terceiros.
              </p>
              <p style={{ marginTop: 6 }}>
                <strong>5. Exclusão de dados</strong>
                <br />
                Para solicitar exclusão da sua conta e dados, entre em contato diretamente com a
                Nana.
              </p>
              <p style={{ marginTop: 6 }}>
                <strong>6. Uso</strong>
                <br />O app é destinado a maiores de 18 anos residentes no Brasil.
              </p>
              <p style={{ marginTop: 6 }}>
                <strong>7. Alterações</strong>
                <br />
                Estes termos podem ser atualizados a qualquer momento. O uso continuado implica
                aceite das alterações.
              </p>
            </div>
          )}

          {mode === 'register' && (
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: '0.78rem',
                color: '#2d4a2d',
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                style={{ accentColor: '#4a7a4a', width: 14, height: 14, cursor: 'pointer' }}
              />
              Li e aceito os termos de uso e política de privacidade
            </label>
          )}

          {error !== '' && (
            <p className="text-xs text-center" style={{ color: '#c0504a' }}>
              {error}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || (mode === 'register' && !termsAccepted)}
            className="relative overflow-hidden font-bold text-sm transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-60 self-center cursor-pointer"
            style={{
              padding: '0.45rem 1.4rem',
              color: '#5a2e0e',
              textShadow: '0 1px 0 #e8c49866',
              letterSpacing: '0.04em',
              borderRadius: '10px',
              background: 'linear-gradient(180deg, #d4956a 0%, #c4845a 40%, #b8744e 100%)',
              boxShadow: '0 3px 10px #8b5a2a44, inset 0 1px 0 #e8b07844',
              border: '2px solid #8b5a2a',
            }}
          >
            <svg
              aria-hidden="true"
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 160 48"
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 28 Q30 18 55 26 Q75 32 95 24 Q115 16 148 26"
                stroke="#5a2e0e"
                strokeWidth="1.4"
                fill="none"
                opacity="0.6"
              />
              <path
                d="M8 36 Q35 28 60 34 Q85 40 110 32 Q130 26 150 34"
                stroke="#5a2e0e"
                strokeWidth="1.2"
                fill="none"
                opacity="0.5"
              />
              <path
                d="M20 20 Q40 14 65 20 Q80 24 100 18"
                stroke="#5a2e0e"
                strokeWidth="1.1"
                fill="none"
                opacity="0.45"
              />
            </svg>
            <span className="relative z-10">
              {loading ? '...' : mode === 'login' ? 'entrar 🌿' : 'criar conta 🌱'}
            </span>
          </button>
        </div>

        <button
          onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login')
            setError('')
            setTermsAccepted(false)
          }}
          className="text-xs transition-opacity hover:opacity-80 cursor-pointer"
          style={{ color: '#4a7a4a' }}
        >
          {mode === 'login' ? 'primeira vez aqui? cria sua conta' : 'já tem conta? entra aqui'}
        </button>

        <p className="text-xs" style={{ color: '#7fb87f', opacity: 0.6 }}>
          🌿 leafnote
        </p>
      </div>
    </div>
  )
}
