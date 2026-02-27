export interface Note {
  id: string
  title: string
  content: string
  isPinned: boolean
  userId: string
  tags: string[] // Tag IDs
  attachments?: string[]
  created: string
  updated: string
}

export interface CreateNoteData {
  title: string
  content?: string
  isPinned?: boolean
  tags?: string[]
  attachments?: string[]
}

export interface UpdateNoteData {
  title?: string
  content?: string
  isPinned?: boolean
  tags?: string[]
  attachments?: string[]
}

export interface NoteOperationResult<T = Note> {
  success: boolean
  error?: string
  data?: T
}

export interface NotesListResult {
  success: boolean
  error?: string
  data?: Note[]
}
