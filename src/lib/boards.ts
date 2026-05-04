import { ref, push, set, remove, get, onValue, off } from 'firebase/database'
import { db } from './firebase'
import type { AnyBoardItem } from '../types/board'

export interface BoardMeta {
  id: string
  name: string
  createdAt: number
  createdBy: string
}

export const DEFAULT_BOARD_ID = 'default'

export function boardItemsPath(coupleId: string, boardId: string): string {
  if (boardId === DEFAULT_BOARD_ID) return `couples/${coupleId}/board/items`
  return `couples/${coupleId}/boards/${boardId}/items`
}

export function subscribeBoards(
  coupleId: string,
  callback: (boards: BoardMeta[]) => void
): () => void {
  const boardsRef = ref(db, `couples/${coupleId}/boards/_meta`)
  const handler = onValue(boardsRef, (snap) => {
    const val = snap.val() ?? {}
    const list: BoardMeta[] = Object.values(val as Record<string, BoardMeta>).sort(
      (a, b) => a.createdAt - b.createdAt
    )
    callback(list)
  })
  return () => off(boardsRef, 'value', handler)
}

export async function createBoard(
  coupleId: string,
  name: string,
  createdBy: string
): Promise<string> {
  const metaRef = ref(db, `couples/${coupleId}/boards/_meta`)
  const newRef = push(metaRef)
  const id = newRef.key!
  const meta: BoardMeta = {
    id,
    name: name.trim(),
    createdAt: Date.now(),
    createdBy,
  }
  await set(newRef, meta)
  return id
}

export async function deleteBoard(coupleId: string, boardId: string): Promise<void> {
  if (boardId === DEFAULT_BOARD_ID) return

  const itemsSnap = await get(ref(db, `couples/${coupleId}/boards/${boardId}/items`))
  const items = itemsSnap.val() ?? {}

  await Promise.all(
    Object.values(items as Record<string, AnyBoardItem>).map(async (item) => {
      await set(
        ref(db, `couples/${coupleId}/board/items/${item.id}`),
        JSON.parse(JSON.stringify(item))
      )
    })
  )

  await remove(ref(db, `couples/${coupleId}/boards/_meta/${boardId}`))
  await remove(ref(db, `couples/${coupleId}/boards/${boardId}`))
}

export async function renameBoard(coupleId: string, boardId: string, name: string): Promise<void> {
  if (boardId === DEFAULT_BOARD_ID) return
  await set(ref(db, `couples/${coupleId}/boards/_meta/${boardId}/name`), name.trim())
}

export async function moveItemToBoard(
  coupleId: string,
  item: AnyBoardItem,
  fromBoardId: string,
  toBoardId: string
): Promise<void> {
  const toPath = boardItemsPath(coupleId, toBoardId)
  const fromPath = boardItemsPath(coupleId, fromBoardId)
  await set(ref(db, `${toPath}/${item.id}`), JSON.parse(JSON.stringify(item)))
  await remove(ref(db, `${fromPath}/${item.id}`))
}

export async function moveItemsByTypeToBoard(
  coupleId: string,
  items: AnyBoardItem[],
  type: string,
  fromBoardId: string,
  toBoardId: string
): Promise<void> {
  const toPath = boardItemsPath(coupleId, toBoardId)
  const fromPath = boardItemsPath(coupleId, fromBoardId)
  const filtered = items.filter((i) => i.type === type)
  await Promise.all(
    filtered.map(async (item) => {
      await set(ref(db, `${toPath}/${item.id}`), JSON.parse(JSON.stringify(item)))
      await remove(ref(db, `${fromPath}/${item.id}`))
    })
  )
}
