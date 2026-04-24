export type BoardItemType = 'postit' | 'checklist' | 'drawing' | 'tag' | 'letter'

export type PostItColor = 'yellow' | 'green' | 'pink' | 'blue' | 'lavender' | 'peach'
export type LetterColor = 'rosa' | 'verde' | 'azul' | 'amarelo' | 'lilas'

export interface BoardItem {
  id: string
  type: BoardItemType
  x: number
  y: number
  width: number
  height: number
  zOrder?: number
  createdBy: string
  createdAt: string
  updatedAt: string
  updatedBy: string
}

export interface PostItItem extends BoardItem {
  type: 'postit'
  title?: string
  content: string
  color: PostItColor
  compacted?: boolean
  fontSize?: number
}

export interface ChecklistEntry {
  id: string
  text: string
  done: boolean
}

export interface ChecklistItem extends BoardItem {
  type: 'checklist'
  title?: string
  entries: ChecklistEntry[]
  color: PostItColor
  fontSize?: number
}

export interface DrawingItem extends BoardItem {
  type: 'drawing'
  drawingData: string
  rotation?: number
}

export interface TagItem extends BoardItem {
  type: 'tag'
  label: string
  color: string
}

export interface LetterItem extends BoardItem {
  type: 'letter'
  from: string
  to: string
  content: string
  color?: LetterColor
  opened: boolean
  openedAt?: string
}

export type AnyBoardItem = PostItItem | ChecklistItem | DrawingItem | TagItem | LetterItem
