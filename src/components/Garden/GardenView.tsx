import { useState } from 'react'
import { useGarden } from '../../hooks/useGarden'
import { initPlant, rollDice, getFlowerFromSum, FLOWERS, RARITY_COLORS } from '../../lib/garden'
import Plant from './Plant'
import WaterButton from './WaterButton'

interface Props {
  uid: string
  partnerUid: string
  displayName: string
  partnerName: string
  onBack: () => void
}

export default function GardenView({ uid, partnerUid, displayName, partnerName, onBack }: Props) {
  const { plant, loading, water, alreadyWatered } = useGarden(uid, partnerUid)
  const [showDice, setShowDice] = useState(false)
  const [myRoll, setMyRoll] = useState<number | null>(null)
  const [partnerRoll, setPartnerRoll] = useState<number | null>(null)
  const [rolling, setRolling] = useState(false)

  const partnerWatered = plant ? plant.water[partnerUid] === true : false

  const handleRollMyDice = () => {
    setRolling(true)
    setTimeout(() => {
      setMyRoll(rollDice())
      setRolling(false)
    }, 600)
  }

  const handleRollPartnerDice = () => {
    setRolling(true)
    setTimeout(() => {
      setPartnerRoll(rollDice())
      setRolling(false)
    }, 600)
  }

  const handleConfirmFlower = async () => {
    if (myRoll === null || partnerRoll === null) return
    let sum = myRoll + partnerRoll
    if (sum === 10) sum = 9
    const flowerType = getFlowerFromSum(sum)
    await initPlant(flowerType)
    setShowDice(false)
  }

  const stageLabels = ['terra vazia', 'semente', 'broto', 'jovem', 'adulta', 'florescida']

  if (loading) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'linear-gradient(160deg, #f0f7f0 0%, #e8f5e8 60%, #f5f0e8 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ fontSize: 36, animation: 'spin 1s linear infinite' }}>🌱</span>
      </div>
    )
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'linear-gradient(160deg, #f0f7f0 0%, #e8f5e8 60%, #f5f0e8 100%)',
        fontFamily: 'Baloo 2, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflowY: 'auto',
      }}
    >
      {/* topo */}
      <div
        style={{
          width: '100%',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: '1.5px solid #a8d8a8',
            borderRadius: 10,
            padding: '6px 14px',
            color: '#2d4a2d',
            fontFamily: 'Baloo 2, sans-serif',
            fontWeight: 700,
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          voltar ao mural
        </button>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#2d4a2d' }}>🌿 jardim</div>
        <div style={{ width: 80 }} />
      </div>

      {/* sem planta ainda */}
      {!plant && !showDice && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
            marginTop: 0,
            flex: 1,
            justifyContent: 'center',
            padding: '0 40px',
            textAlign: 'center',
          }}
        >
          <span style={{ fontSize: 64 }}>🌱</span>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#2d4a2d' }}>
            o jardim está vazio!
          </div>
          <div style={{ fontSize: 16, color: '#4a7a4a', lineHeight: 1.6 }}>
            sorteiem juntos qual flor vai nascer aqui. cada um joga um dado e a soma define a flor!
          </div>
          <button
            onClick={() => setShowDice(true)}
            style={{
              marginTop: 8,
              padding: '10px 28px',
              borderRadius: 14,
              background: 'linear-gradient(180deg, #d4956a 0%, #b8744e 100%)',
              border: '2px solid #8b5a2a',
              color: '#5a2e0e',
              fontWeight: 800,
              fontSize: 16,
              cursor: 'pointer',
              fontFamily: 'Baloo 2, sans-serif',
              boxShadow: '0 3px 10px #8b5a2a44',
            }}
          >
            sortear a flor 🎲
          </button>
        </div>
      )}

      {/* sorteio de dados */}
      {!plant && showDice && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 20,
            marginTop: 40,
            padding: '0 40px',
            textAlign: 'center',
            maxWidth: 400,
          }}
        >
          <div style={{ fontSize: 20, fontWeight: 800, color: '#2d4a2d' }}>🎲 sorteio da flor</div>
          <div style={{ fontSize: 15, color: '#4a7a4a' }}>
            cada um joga seu dado — a soma define a flor!
          </div>

          <div
            style={{ display: 'flex', gap: 24, alignItems: 'flex-start', justifyContent: 'center' }}
          >
            {/* meu dado */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                width: 80,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, color: '#7a3040' }}>{displayName}</div>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 12,
                  background: '#fdf6f0',
                  border: '2px solid #e8a0b0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 28,
                  fontWeight: 900,
                  color: '#7a3040',
                  boxShadow: '0 2px 8px rgba(44,20,8,0.1)',
                }}
              >
                {myRoll !== null ? myRoll : '?'}
              </div>
              <div
                style={{
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <button
                  onClick={handleRollMyDice}
                  disabled={myRoll !== null || rolling}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 10,
                    background:
                      myRoll !== null ? '#e8f5e8' : 'linear-gradient(180deg, #7fb87f, #4a7a4a)',
                    border: '1.5px solid #4a7a4a',
                    color: myRoll !== null ? '#4a7a4a' : '#fff',
                    fontWeight: 700,
                    fontSize: 11,
                    cursor: myRoll !== null ? 'default' : 'pointer',
                    fontFamily: 'Baloo 2, sans-serif',
                  }}
                >
                  {myRoll !== null ? 'jogado!' : 'jogar'}
                </button>
              </div>
            </div>

            <div style={{ fontSize: 20, color: '#c87090', fontWeight: 800, marginTop: 44 }}>+</div>

            {/* dado do parceiro */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                width: 80,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, color: '#7a3040' }}>{partnerName}</div>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 12,
                  background: '#fdf6f0',
                  border: '2px solid #e8a0b0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 28,
                  fontWeight: 900,
                  color: '#7a3040',
                  boxShadow: '0 2px 8px rgba(44,20,8,0.1)',
                }}
              >
                {partnerRoll !== null ? partnerRoll : '?'}
              </div>
              <div
                style={{
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <button
                  onClick={handleRollPartnerDice}
                  disabled={partnerRoll !== null || rolling}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 10,
                    background:
                      partnerRoll !== null
                        ? '#e8f5e8'
                        : 'linear-gradient(180deg, #7fb87f, #4a7a4a)',
                    border: '1.5px solid #4a7a4a',
                    color: partnerRoll !== null ? '#4a7a4a' : '#fff',
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: partnerRoll !== null ? 'default' : 'pointer',
                    fontFamily: 'Baloo 2, sans-serif',
                  }}
                >
                  {partnerRoll !== null ? 'jogado!' : 'jogar'}
                </button>
              </div>
            </div>
          </div>

          {/* resultado */}
          {myRoll !== null && partnerRoll !== null && (
            <div
              style={{
                background: '#fdf6f0',
                border: '1.5px solid #e8a0b0',
                borderRadius: 14,
                padding: '14px 24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <div style={{ fontSize: 13, color: '#7a3040', fontWeight: 700 }}>
                soma: {myRoll + partnerRoll > 10 ? 9 : myRoll + partnerRoll}
              </div>
              {(() => {
                const sum = Math.min(myRoll + partnerRoll, 9)
                const flower = FLOWERS[getFlowerFromSum(sum)]
                return (
                  <>
                    <div style={{ fontSize: 28 }}>{flower.emoji}</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#5a1028' }}>
                      {flower.name}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: RARITY_COLORS[flower.rarity],
                        background: '#fff0f5',
                        borderRadius: 8,
                        padding: '3px 10px',
                        border: '1px solid #e8a0b0',
                      }}
                    >
                      {flower.rarity}
                    </div>
                  </>
                )
              })()}
              <button
                onClick={handleConfirmFlower}
                style={{
                  marginTop: 6,
                  padding: '8px 24px',
                  borderRadius: 12,
                  background: 'linear-gradient(180deg, #d4956a, #b8744e)',
                  border: '2px solid #8b5a2a',
                  color: '#5a2e0e',
                  fontWeight: 800,
                  fontSize: 12,
                  cursor: 'pointer',
                  fontFamily: 'Baloo 2, sans-serif',
                }}
              >
                plantar essa flor!
              </button>
            </div>
          )}

          <button
            onClick={() => {
              setShowDice(false)
              setMyRoll(null)
              setPartnerRoll(null)
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#7a3040',
              fontSize: 14,
              cursor: 'pointer',
              fontFamily: 'Baloo 2, sans-serif',
              fontWeight: 600,
            }}
          >
            cancelar
          </button>
        </div>
      )}

      {/* planta existente */}
      {plant && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
            marginTop: 20,
            padding: '0 20px',
            width: '100%',
            maxWidth: 700,
          }}
        >
          {/* barrinha de rega */}
          <div
            style={{
              width: '100%',
              height: 6,
              background: '#d8eed8',
              borderRadius: 10,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width:
                  alreadyWatered && partnerWatered
                    ? '100%'
                    : alreadyWatered || partnerWatered
                      ? '50%'
                      : '0%',
                background: 'linear-gradient(90deg, #60b8e8, #3a8abf)',
                borderRadius: 10,
                transition: 'width 0.6s ease',
              }}
            />
          </div>

          {/* linha principal */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              gap: 24,
            }}
          >
            {/* coluna esquerda */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                alignItems: 'flex-start',
                minWidth: 120,
              }}
            >
              <div
                style={{
                  background: '#fdf6f0',
                  border: '1.5px solid #e8a0b0',
                  borderRadius: 14,
                  padding: '10px 14px',
                  textAlign: 'left',
                }}
              >
                <span style={{ fontSize: 22 }}>{FLOWERS[plant.flowerType]?.emoji}</span>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#5a1028' }}>
                  {FLOWERS[plant.flowerType]?.name}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: RARITY_COLORS[FLOWERS[plant.flowerType]?.rarity],
                  }}
                >
                  {FLOWERS[plant.flowerType]?.rarity}
                </div>
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#4a7a4a' }}>
                {stageLabels[plant.stage]}
              </div>
              <div style={{ fontSize: 10, color: '#7fb87f' }}>{plant.daysWatered} dias regados</div>
            </div>

            {/* planta centralizada */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <Plant plant={plant} />
              {plant.wilted && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 370,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#f0e8e8',
                    border: '1.5px solid #e8a0b0',
                    borderRadius: 12,
                    padding: '8px 18px',
                    fontSize: 12,
                    color: '#7a3040',
                    fontFamily: 'Baloo 2, sans-serif',
                    fontWeight: 700,
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    zIndex: 10,
                  }}
                >
                  🥀 reguem juntos pra recuperar a plantinha!
                </div>
              )}
            </div>

            {/* coluna direita */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                alignItems: 'center',
                minWidth: 160,
                background: '#fdf6f0',
                border: '1.5px solid #a8d8a8',
                borderRadius: 16,
                padding: '16px 18px',
              }}
            >
              {plant.stage < 5 && (
                <div style={{ width: '100%' }}>
                  <div
                    style={{
                      fontSize: 10,
                      color: '#4a7a4a',
                      fontWeight: 700,
                      marginBottom: 4,
                      textAlign: 'center',
                    }}
                  >
                    próximo estágio
                  </div>
                  <div
                    style={{
                      height: 8,
                      background: '#d8eed8',
                      borderRadius: 10,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${((plant.daysWatered % 3) / 3) * 100}%`,
                        background: 'linear-gradient(90deg, #7fb87f, #4a7a4a)',
                        borderRadius: 10,
                        transition: 'width 0.6s ease',
                      }}
                    />
                  </div>
                  <div
                    style={{ fontSize: 10, color: '#7fb87f', marginTop: 3, textAlign: 'center' }}
                  >
                    {plant.daysWatered % 3}/3 dias
                  </div>
                </div>
              )}

              {plant.stage >= 5 && (
                <div
                  style={{ fontSize: 13, fontWeight: 800, color: '#7a3040', textAlign: 'center' }}
                >
                  florzinha crescida! 🌸
                </div>
              )}

              <WaterButton
                alreadyWatered={alreadyWatered}
                partnerWatered={partnerWatered}
                onWater={water}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
