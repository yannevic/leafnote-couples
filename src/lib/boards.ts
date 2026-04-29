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

export function boardItemsPath(boardId: string): string {
  if (boardId === DEFAULT_BOARD_ID) return 'board/items'
  return `boards/${boardId}/items`
}

export function subscribeBoards(callback: (boards: BoardMeta[]) => void): () => void {
  const boardsRef = ref(db, 'boards/_meta')
  const handler = onValue(boardsRef, (snap) => {
    const val = snap.val() ?? {}
    const list: BoardMeta[] = Object.values(val as Record<string, BoardMeta>).sort(
      (a, b) => a.createdAt - b.createdAt
    )
    callback(list)
  })
  return () => off(boardsRef, 'value', handler)
}

export async function createBoard(name: string, createdBy: string): Promise<string> {
  const metaRef = ref(db, 'boards/_meta')
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

export async function deleteBoard(boardId: string): Promise<void> {
  if (boardId === DEFAULT_BOARD_ID) return

  const itemsSnap = await get(ref(db, `boards/${boardId}/items`))
  const items = itemsSnap.val() ?? {}

  await Promise.all(
    Object.values(items as Record<string, AnyBoardItem>).map(async (item) => {
      await set(ref(db, `board/items/${item.id}`), JSON.parse(JSON.stringify(item)))
    })
  )

  await remove(ref(db, `boards/_meta/${boardId}`))
  await remove(ref(db, `boards/${boardId}`))
}

export async function renameBoard(boardId: string, name: string): Promise<void> {
  if (boardId === DEFAULT_BOARD_ID) return
  await set(ref(db, `boards/_meta/${boardId}/name`), name.trim())
}

export async function moveItemToBoard(
  item: AnyBoardItem,
  fromBoardId: string,
  toBoardId: string
): Promise<void> {
  const toPath = boardItemsPath(toBoardId)
  const fromPath = boardItemsPath(fromBoardId)
  await set(ref(db, `${toPath}/${item.id}`), JSON.parse(JSON.stringify(item)))
  await remove(ref(db, `${fromPath}/${item.id}`))
}

export async function moveItemsByTypeToBoard(
  items: AnyBoardItem[],
  type: string,
  fromBoardId: string,
  toBoardId: string
): Promise<void> {
  const toPath = boardItemsPath(toBoardId)
  const fromPath = boardItemsPath(fromBoardId)
  const filtered = items.filter((i) => i.type === type)
  await Promise.all(
    filtered.map(async (item) => {
      await set(ref(db, `${toPath}/${item.id}`), JSON.parse(JSON.stringify(item)))
      await remove(ref(db, `${fromPath}/${item.id}`))
    })
  )
}
