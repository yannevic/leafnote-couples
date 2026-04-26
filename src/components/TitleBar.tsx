import { useState, useEffect } from 'react'
const icon = new URL('../../resources/icon.png', import.meta.url).href

export default function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false)
  const [version, setVersion] = useState('')
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    window.api.getVersion().then(setVersion)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const weekDay = now.toLocaleDateString('pt-BR', { weekday: 'short' })
  const dateStr = now.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  })
  const timeStr = now.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  return (
    <div
      style={
        {
          height: 38,
          background: 'linear-gradient(90deg, #2d1a0e 0%, #5a3010 45%, #3d2408 100%)',
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
      {/* Esquerda — logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 110 }}>
        <img
          src={icon}
          alt="leafnote"
          style={{ width: 20, height: 20, objectFit: 'contain', borderRadius: 4 }}
        />
        <span
          style={{
            fontFamily: 'Baloo 2, sans-serif',
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: '0.04em',
          }}
        >
          <span style={{ color: '#7FB87F' }}>leaf</span>
          <span style={{ color: '#c4956a' }}>note</span>
        </span>
        {version && (
          <span
            style={{
              fontSize: 8.5,
              color: '#c4956a',
              fontFamily: 'Baloo 2, sans-serif',
              opacity: 0.6,
            }}
          >
            v{version}
          </span>
        )}
      </div>

      {/* Centro — data e hora */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          fontFamily: 'Baloo 2, sans-serif',
          pointerEvents: 'none',
        }}
      >
        <span
          style={{
            fontSize: 9.5,
            color: '#c4956a',
            opacity: 0.8,
            textTransform: 'capitalize',
          }}
        >
          {weekDay}
        </span>
        <span style={{ fontSize: 9, color: '#c4956a', opacity: 0.4 }}>·</span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: '#f5ecd7',
            letterSpacing: '0.04em',
          }}
        >
          {timeStr}
        </span>
        <span style={{ fontSize: 9, color: '#c4956a', opacity: 0.4 }}>·</span>
        <span style={{ fontSize: 9.5, color: '#c4956a', opacity: 0.8 }}>{dateStr}</span>
      </div>

      {/* Direita — botões macOS */}
      <div
        style={
          {
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            WebkitAppRegion: 'no-drag',
          } as React.CSSProperties
        }
      >
        <WinBtn
          color="#e8a030"
          hoverColor="#f5b840"
          onClick={() => window.api.winMinimize()}
          title="minimizar"
        />
        <WinBtn
          color="#7FB87F"
          hoverColor="#9fd49f"
          onClick={() => {
            window.api.winMaximize()
            setIsMaximized((v) => !v)
          }}
          title={isMaximized ? 'restaurar' : 'maximizar'}
        />
        <WinBtn
          color="#e8607a"
          hoverColor="#f07090"
          onClick={() => window.api.winClose()}
          title="fechar"
        />
      </div>
    </div>
  )
}

function WinBtn({
  color,
  hoverColor,
  onClick,
  title,
}: {
  color: string
  hoverColor: string
  onClick: () => void
  title: string
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 13,
        height: 13,
        borderRadius: '50%',
        border: 'none',
        background: hovered ? hoverColor : color,
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'background 0.15s, transform 0.1s',
        transform: hovered ? 'scale(1.2)' : 'scale(1)',
        boxShadow: `0 1px 4px ${color}88`,
        padding: 0,
      }}
    />
  )
}
