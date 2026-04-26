import { useState, useEffect } from 'react'
const icon = new URL('../../resources/icon.png', import.meta.url).href

export default function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false)
  const [version, setVersion] = useState('')

  useEffect(() => {
    window.api.getVersion().then(setVersion)
  }, [])

  function handleMinimize() {
    window.api.winMinimize()
  }

  function handleMaximize() {
    window.api.winMaximize()
    setIsMaximized((v) => !v)
  }

  function handleClose() {
    window.api.winClose()
  }

  return (
    <div
      style={
        {
          height: 38,
          background: 'linear-gradient(90deg, #2d1a0e 0%, #5a3010 40%, #3d2408 100%)',
          borderBottom: '1.5px solid #8b5a2a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingLeft: '0.75rem',
          paddingRight: '0.5rem',
          WebkitAppRegion: 'drag',
          userSelect: 'none',
          flexShrink: 0,
          zIndex: 9999,
          position: 'relative',
        } as React.CSSProperties
      }
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <img
          src={icon}
          alt="leafnote"
          style={{ width: 22, height: 22, objectFit: 'contain', borderRadius: 4 }}
        />
        <span
          style={{
            fontFamily: 'Baloo 2, sans-serif',
            fontSize: 13,
            fontWeight: 800,
            color: '#f5ecd7',
            letterSpacing: '0.04em',
          }}
        >
          <span style={{ color: '#7FB87F' }}>leaf</span>
          <span style={{ color: '#c4956a' }}>note</span>
        </span>
      </div>

      {/* Versão + botões */}
      <div
        style={
          {
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            WebkitAppRegion: 'no-drag',
          } as React.CSSProperties
        }
      >
        {version && (
          <span
            style={{
              fontSize: 9,
              color: '#c4956a',
              fontFamily: 'Baloo 2, sans-serif',
              marginRight: 4,
              opacity: 0.8,
            }}
          >
            v{version}
          </span>
        )}

        {/* Minimizar */}
        <TitleBtn color="#c4956a" onClick={handleMinimize} title="minimizar">
          <span style={{ fontSize: 10, lineHeight: 1, marginBottom: 2, display: 'block' }}>—</span>
        </TitleBtn>

        {/* Maximizar */}
        <TitleBtn
          color="#7FB87F"
          onClick={handleMaximize}
          title={isMaximized ? 'restaurar' : 'maximizar'}
        >
          <span style={{ fontSize: 9, lineHeight: 1, display: 'block' }}>
            {isMaximized ? '❐' : '□'}
          </span>
        </TitleBtn>

        {/* Fechar */}
        <TitleBtn color="#e8607a" onClick={handleClose} title="fechar">
          <span style={{ fontSize: 11, lineHeight: 1, display: 'block' }}>✕</span>
        </TitleBtn>
      </div>
    </div>
  )
}

function TitleBtn({
  color,
  onClick,
  title,
  children,
}: {
  color: string
  onClick: () => void
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 26,
        height: 26,
        borderRadius: 7,
        border: 'none',
        background: color,
        color: '#fff',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'opacity 0.15s',
        flexShrink: 0,
        fontFamily: 'Baloo 2, sans-serif',
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLButtonElement).style.opacity = '0.75'
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLButtonElement).style.opacity = '1'
      }}
    >
      {children}
    </button>
  )
}
