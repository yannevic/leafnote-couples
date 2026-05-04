import { useState } from 'react'
import { UserPlus, Check, X } from 'lucide-react'
import type { CoupleRequest } from '../types/couple'
import { acceptRequest, refuseRequest } from '../lib/couple'

interface JoinRequestToastProps {
  coupleId: string
  requests: Record<string, CoupleRequest>
}

export default function JoinRequestToast({ coupleId, requests }: JoinRequestToastProps) {
  const [loadingUid, setLoadingUid] = useState<string | null>(null)

  const entries = Object.entries(requests)
  if (entries.length === 0) return null

  async function handleAccept(fromUid: string) {
    setLoadingUid(fromUid)
    await acceptRequest(coupleId, fromUid)
    setLoadingUid(null)
  }

  async function handleRefuse(fromUid: string) {
    setLoadingUid(fromUid)
    await refuseRequest(coupleId, fromUid)
    setLoadingUid(null)
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 54,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9000,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        pointerEvents: 'none',
      }}
    >
      {entries.map(([fromUid, req]) => (
        <div
          key={fromUid}
          style={{
            pointerEvents: 'all',
            background: 'linear-gradient(135deg, #fdf6ec 0%, #f5ecd7 100%)',
            border: '1.5px solid #d4aa80',
            borderRadius: 14,
            boxShadow: '0 6px 24px rgba(44,20,8,0.28)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontFamily: 'Baloo 2, sans-serif',
            minWidth: 300,
            maxWidth: 380,
            animation: 'joinToastIn 0.35s cubic-bezier(.34,1.56,.64,1)',
          }}
        >
          <style>{`
            @keyframes joinToastIn {
              from { opacity: 0; transform: translateY(-12px) scale(0.95); }
              to   { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}</style>

          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #e8f5e8 0%, #7FB87F 100%)',
              border: '2px solid #4A7A4A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <UserPlus size={16} color="#2d4a2d" strokeWidth={2.5} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#2C1810', lineHeight: 1.3 }}>
              pedido de entrada
            </div>
            <div
              style={{
                fontSize: 11,
                color: '#8b6914',
                marginTop: 2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ fontWeight: 700, color: '#4A7A4A' }}>{req.fromName}</span>
              {' quer entrar no seu cantinho'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            <button
              onClick={() => handleAccept(fromUid)}
              disabled={loadingUid === fromUid}
              title="aceitar"
              style={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                border: '1.5px solid #4A7A4A',
                background: 'linear-gradient(135deg, #e8f5e8 0%, #7FB87F 100%)',
                cursor: loadingUid === fromUid ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.15s',
                opacity: loadingUid === fromUid ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.15)'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'
              }}
            >
              <Check size={14} color="#2d4a2d" strokeWidth={2.5} />
            </button>

            <button
              onClick={() => handleRefuse(fromUid)}
              disabled={loadingUid === fromUid}
              title="recusar"
              style={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                border: '1.5px solid #d4607a',
                background: 'linear-gradient(135deg, #fce8ee 0%, #e8a0b0 100%)',
                cursor: loadingUid === fromUid ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.15s',
                opacity: loadingUid === fromUid ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.15)'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'
              }}
            >
              <X size={14} color="#7a1a2a" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
