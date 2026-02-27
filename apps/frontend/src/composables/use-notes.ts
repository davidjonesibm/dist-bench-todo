import { ref, onUnmounted } from 'vue'
import { pb } from '../lib/pocketbase'
import type {
  Note,
  CreateNoteData,
  UpdateNoteData,
  NoteOperationResult,
  NotesListResult,
} from '../types/note.types'

export function useNotes() {
  const notes = ref<Note[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  let unsubscribe: (() => void) | null = null
  let autoSaveTimer: number | null = null

  /**
   * Fetch all notes for the current user
   */
  async function fetchNotes(): Promise<NotesListResult> {
    loading.value = true
    error.value = null

    try {
      const records = await pb.collection('notes').getFullList<Note>({
        sort: '-isPinned,-updated',
        filter: `userId = "${pb.authStore.model?.id}"`,
        expand: 'tags',
      })

      notes.value = records
      return { success: true, data: records }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to fetch notes'
      error.value = errorMessage
      console.error('Error fetching notes:', err)
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  /**
   * Create a new note
   */
  async function createNote(data: CreateNoteData): Promise<NoteOperationResult> {
    loading.value = true
    error.value = null

    try {
      const record = await pb.collection('notes').create<Note>({
        ...data,
        userId: pb.authStore.model?.id,
        isPinned: data.isPinned ?? false,
        content: data.content ?? '',
      })

      notes.value.unshift(record)
      return { success: true, data: record }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to create note'
      error.value = errorMessage
      console.error('Error creating note:', err)
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  /**
   * Update an existing note
   */
  async function updateNote(id: string, data: UpdateNoteData): Promise<NoteOperationResult> {
    error.value = null

    try {
      const record = await pb.collection('notes').update<Note>(id, data)

      const index = notes.value.findIndex((n) => n.id === id)
      if (index !== -1) {
        notes.value[index] = record
        // Re-sort notes (pinned first, then by updated date)
        notes.value.sort((a, b) => {
          if (a.isPinned !== b.isPinned) {
            return a.isPinned ? -1 : 1
          }
          return new Date(b.updated).getTime() - new Date(a.updated).getTime()
        })
      }

      return { success: true, data: record }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to update note'
      error.value = errorMessage
      console.error('Error updating note:', err)
      return { success: false, error: errorMessage }
    }
  }

  /**
   * Delete a note
   */
  async function deleteNote(id: string): Promise<NoteOperationResult> {
    loading.value = true
    error.value = null

    try {
      await pb.collection('notes').delete(id)

      notes.value = notes.value.filter((n) => n.id !== id)
      return { success: true }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to delete note'
      error.value = errorMessage
      console.error('Error deleting note:', err)
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  /**
   * Toggle pin status of a note
   */
  async function togglePin(id: string): Promise<NoteOperationResult> {
    const note = notes.value.find((n) => n.id === id)
    if (!note) {
      return { success: false, error: 'Note not found' }
    }

    return updateNote(id, { isPinned: !note.isPinned })
  }

  /**
   * Auto-save note with debounce
   * @param id - Note ID
   * @param data - Data to update
   * @param debounceMs - Debounce delay in milliseconds (default: 2000)
   */
  function autoSaveNote(
    id: string,
    data: UpdateNoteData,
    debounceMs: number = 2000,
    onSaved?: (note: Note) => void,
  ) {
    // Clear existing timer
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer)
    }

    // Set new timer
    autoSaveTimer = setTimeout(async () => {
      const result = await updateNote(id, data)
      if (result.success && result.data && onSaved) {
        onSaved(result.data)
      }
    }, debounceMs)
  }

  /**
   * Cancel any pending auto-save
   */
  function cancelAutoSave() {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer)
      autoSaveTimer = null
    }
  }

  /**
   * Subscribe to real-time note updates
   */
  async function subscribeToNotes() {
    if (!pb.authStore.model?.id) {
      console.warn('Cannot subscribe to notes: user not authenticated')
      return
    }

    unsubscribe = await pb.collection('notes').subscribe<Note>('*', (e) => {
      // Only process notes for the current user
      if (e.record?.userId !== pb.authStore.model?.id) {
        return
      }

      if (e.action === 'create') {
        const exists = notes.value.some((note) => note.id === e.record.id)
        if (!exists) {
          notes.value.unshift(e.record)
        }
      } else if (e.action === 'update') {
        const index = notes.value.findIndex((note) => note.id === e.record.id)
        if (index !== -1) {
          notes.value[index] = e.record
          // Re-sort notes
          notes.value.sort((a, b) => {
            if (a.isPinned !== b.isPinned) {
              return a.isPinned ? -1 : 1
            }
            return new Date(b.updated).getTime() - new Date(a.updated).getTime()
          })
        }
      } else if (e.action === 'delete') {
        notes.value = notes.value.filter((note) => note.id !== e.record.id)
      }
    })
  }

  /**
   * Unsubscribe from real-time updates
   */
  function unsubscribeFromNotes() {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
  }

  // Cleanup on unmount
  onUnmounted(() => {
    unsubscribeFromNotes()
    cancelAutoSave()
  })

  return {
    notes,
    loading,
    error,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    autoSaveNote,
    cancelAutoSave,
    subscribeToNotes,
    unsubscribeFromNotes,
  }
}
