import { useState, useEffect } from 'react'
import {
  BoardMeta,
  DEFAULT_BOARD_ID,
  subscribeBoards,
  createBoard,
  deleteBoard,
} from '../lib/boards'

export function useBoards(uid: string) {
  const [extraBoards, setExtraBoards] = useState<BoardMeta[]>([])
  const [activeBoardId, setActiveBoardId] = useState<string>(DEFAULT_BOARD_ID)

  useEffect(() => {
    const unsub = subscribeBoards(setExtraBoards)
    return unsub
  }, [])

  const addBoard = async (name: string) => {
    if (!name.trim()) return
    const id = await createBoard(name, uid)
    setActiveBoardId(id)
  }

  const removeBoard = async (boardId: string) => {
    if (boardId === DEFAULT_BOARD_ID) return
    await deleteBoard(boardId)
    if (activeBoardId === boardId) setActiveBoardId(DEFAULT_BOARD_ID)
  }

  return {
    extraBoards,
    activeBoardId,
    setActiveBoardId,
    addBoard,
    removeBoard,
  }
}
