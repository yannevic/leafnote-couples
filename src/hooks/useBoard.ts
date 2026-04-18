import { useEffect, useCallback, useRef } from 'react'
import { ref, onValue, set, remove, off } from 'firebase/database'
import { db } from '../lib/firebase'
import { AnyBoardItem } from '../types/board'

const BOARD_PATH = 'board/items'

export function useBoard(
  items: AnyBoardItem[],
  setItems: React.Dispatch<React.SetStateAction<AnyBoardItem[]>>
) {
  const loaded = useRef(false)
  const localIds = useRef<Set<string>>(new Set())

  // Escuta mudanças do Firebase e atualiza o estado local
  useEffect(() => {
    const boardRef = ref(db, BOARD_PATH)

    const unsubscribe = onValue(boardRef, (snapshot) => {
      const data = snapshot.val() as Record<string, AnyBoardItem> | null

      if (!data) {
        if (loaded.current) setItems([])
        loaded.current = true
        return
      }

      const remoteItems = Object.values(data)
      loaded.current = true
      setItems(remoteItems)
    })

    return () => off(boardRef, 'value', unsubscribe)
  }, [setItems])

  // Salva um item no Firebase
  const saveItem = useCallback((item: AnyBoardItem) => {
    localIds.current.add(item.id)
    const itemRef = ref(db, `${BOARD_PATH}/${item.id}`)
    set(itemRef, item).catch((err: unknown) => {
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === 'object' && err !== null && 'message' in err
            ? String((err as { message: unknown }).message)
            : String(err)
      console.error('useBoard/saveItem:', msg)
    })
  }, [])

  // Remove um item do Firebase
  const deleteItem = useCallback((id: string) => {
    const itemRef = ref(db, `${BOARD_PATH}/${id}`)
    remove(itemRef).catch((err: unknown) => {
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === 'object' && err !== null && 'message' in err
            ? String((err as { message: unknown }).message)
            : String(err)
      console.error('useBoard/deleteItem:', msg)
    })
  }, [])

  return { loaded: loaded.current, saveItem, deleteItem }
}
