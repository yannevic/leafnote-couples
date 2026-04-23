import { useState, useEffect, useCallback } from 'react'
import {
  SharedDiceState,
  DiceMode,
  subscribeDice,
  saveDiceState,
  pushActivityLog,
} from '../lib/widgets'

export function useSharedDice(nick: 'nana' | 'gueguel') {
  const [remote, setRemote] = useState<SharedDiceState | null>(null)
  const [isRolling, setIsRolling] = useState(false)

  useEffect(() => {
    const unsub = subscribeDice(setRemote)
    return unsub
  }, [])

  // Rola no modo "juntos": grava um único valor que os dois veem
  const rollTogether = useCallback(
    (diceCount: number) => {
      if (isRolling) return
      setIsRolling(true)

      let frame = 0
      const frames = 8

      const interval = setInterval(() => {
        const val = Math.floor(Math.random() * 6) + 1
        const interim: SharedDiceState = {
          mode: 'together',
          values: { [nick]: val },
          rolledBy: nick,
          rolledAt: Date.now(),
        }
        saveDiceState(interim)
        frame += 1

        if (frame >= frames) {
          clearInterval(interval)
          // Grava N dados como array encodado em nana (juntos = nana guarda tudo)
          const finalValues: number[] = Array.from(
            { length: diceCount },
            () => Math.floor(Math.random() * 6) + 1
          )
          const final: SharedDiceState = {
            mode: 'together',
            values: { nana: finalValues[0], gueguel: finalValues[1] ?? finalValues[0] },
            rolledBy: nick,
            rolledAt: Date.now(),
          }
          saveDiceState(final)
          pushActivityLog(
            nick,
            `girou ${finalValues[0]}${finalValues[1] !== finalValues[0] ? ` e ${finalValues[1]}` : ''} no dado 🎲`
          )
          setIsRolling(false)
        }
      }, 60)
    },
    [isRolling, nick]
  )

  // Rola no modo "disputa": grava só o valor do nick atual
  const rollVersus = useCallback(() => {
    if (isRolling) return
    setIsRolling(true)

    let frame = 0
    const frames = 8
    const current = remote

    const interval = setInterval(() => {
      frame += 1
      const val = Math.floor(Math.random() * 6) + 1
      const interim: SharedDiceState = {
        mode: 'versus',
        values: {
          ...(current?.values ?? {}),
          [nick]: val,
        },
        rolledBy: nick,
        rolledAt: Date.now(),
      }
      saveDiceState(interim)

      if (frame >= frames) {
        clearInterval(interval)
        const finalVal = Math.floor(Math.random() * 6) + 1
        const finalState: SharedDiceState = {
          mode: 'versus',
          values: { ...(current?.values ?? {}), [nick]: finalVal },
          rolledBy: nick,
          rolledAt: Date.now(),
        }
        saveDiceState(finalState)
        pushActivityLog(nick, `girou um ${finalVal} na disputa ⚔️`)
        setIsRolling(false)
      }
    }, 60)
  }, [isRolling, nick, remote])

  const setMode = useCallback(
    (mode: DiceMode) => {
      const next: SharedDiceState = {
        mode,
        values: {},
        rolledBy: nick,
        rolledAt: Date.now(),
      }
      saveDiceState(next)
    },
    [nick]
  )

  return { remote, isRolling, rollTogether, rollVersus, setMode }
}
