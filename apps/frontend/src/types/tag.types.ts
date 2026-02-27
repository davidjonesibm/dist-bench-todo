export interface Tag {
  id: string
  name: string
  color: string // Hex color
  userId: string
  created: string
  updated: string
}

export interface CreateTagData {
  name: string
  color: string
}

export interface UpdateTagData {
  name?: string
  color?: string
}

export interface TagOperationResult<T = Tag> {
  success: boolean
  error?: string
  data?: T
}

export interface TagsListResult {
  success: boolean
  error?: string
  data?: Tag[]
}
