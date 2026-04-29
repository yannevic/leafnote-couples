import { useEffect, useCallback, useRef } from 'react'
import { ref, onValue, set, remove, off } from 'firebase/database'
import { db } from '../lib/firebase'
import { AnyBoardItem } from '../types/board'
import { boardItemsPath } from '../lib/boards'

export function useBoard(
  _items: AnyBoardItem[],
  setItems: React.Dispatch<React.SetStateAction<AnyBoardItem[]>>,
  boardId: string
) {
  const loaded = useRef(false)
  const localIds = useRef<Set<string>>(new Set())
  const deletedIds = useRef<Set<string>>(new Set())

  useEffect(() => {
    loaded.current = false
    localIds.current = new Set()
    deletedIds.current = new Set()

    const path = boardItemsPath(boardId)
    const boardRef = ref(db, path)

    const unsubscribe = onValue(boardRef, (snapshot) => {
      const data = snapshot.val() as Record<string, AnyBoardItem> | null

      if (!data) {
        setItems([])
        loaded.current = true
        return
      }

      const remoteItems = Object.values(data).filter((item) => !deletedIds.current.has(item.id))
      loaded.current = true
      setItems(remoteItems)
    })

    return () => off(boardRef, 'value', unsubscribe)
  }, [boardId, setItems])

  const saveItem = useCallback(
    (item: AnyBoardItem) => {
      localIds.current.add(item.id)
      const path = boardItemsPath(boardId)
      const itemRef = ref(db, `${path}/${item.id}`)
      const clean = JSON.parse(JSON.stringify(item)) as AnyBoardItem
      set(itemRef, clean).catch((err: unknown) => {
        const msg =
          err instanceof Error
            ? err.message
            : typeof err === 'object' && err !== null && 'message' in err
              ? String((err as { message: unknown }).message)
              : String(err)
        console.error('useBoard/saveItem:', msg)
      })
    },
    [boardId]
  )

  const deleteItem = useCallback(
    (id: string) => {
      deletedIds.current.add(id)
      const path = boardItemsPath(boardId)
      const itemRef = ref(db, `${path}/${id}`)
      remove(itemRef).catch((err: unknown) => {
        const msg =
          err instanceof Error
            ? err.message
            : typeof err === 'object' && err !== null && 'message' in err
              ? String((err as { message: unknown }).message)
              : String(err)
        console.error('useBoard/deleteItem:', msg)
      })
    },
    [boardId]
  )

  const trashItem = useCallback((id: string) => {
    deletedIds.current.add(id)
  }, [])

  const restoreItem = useCallback((id: string) => {
    deletedIds.current.delete(id)
  }, [])

  const markMoving = useCallback((id: string) => {
    deletedIds.current.add(id)
  }, [])

  return { loaded: loaded.current, saveItem, deleteItem, trashItem, restoreItem, markMoving }
}
