export type Sex = 'female' | 'male'

export interface UserProfile {
  uid: string
  displayName: string
  sex: Sex
  coupleId?: string
  createdAt: string
}

export interface CoupleData {
  id: string
  members: Record<string, true>
  createdAt: string
  createdBy: string
}

export interface CoupleRequest {
  fromUid: string
  fromName: string
  status: 'pending' | 'accepted' | 'refused'
  createdAt: string
}
