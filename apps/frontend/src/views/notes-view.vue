<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useNotes } from '../composables/use-notes'
import type { Note } from '../types/note.types'
import NoteList from '../components/notes/note-list.vue'
import NoteEditor from '../components/notes/note-editor.vue'
import NoteViewer from '../components/notes/note-viewer.vue'
import NoteToolbar from '../components/notes/note-toolbar.vue'
import TagInput from '../components/tags/tag-input.vue'

const {
  createNote,
  updateNote,
  deleteNote,
  togglePin,
  autoSaveNote,
  cancelAutoSave,
  subscribeToNotes,
} = useNotes()

const selectedNote = ref<Note | null>(null)
const noteTitle = ref('')
const noteContent = ref('')
const noteTags = ref<string[]>([])
const isEditMode = ref(true)
const showTagsPanel = ref(false)
const isCreatingNew = ref(false)

onMounted(() => {
  subscribeToNotes()
})

const hasUnsavedChanges = computed(() => {
  if (!selectedNote.value && !isCreatingNew.value) return false
  if (isCreatingNew.value) {
    return noteTitle.value.trim() !== '' || noteContent.value.trim() !== ''
  }
  return (
    selectedNote.value?.title !== noteTitle.value ||
    selectedNote.value?.content !== noteContent.value ||
    JSON.stringify(selectedNote.value?.tags || []) !== JSON.stringify(noteTags.value)
  )
})

function handleSelectNote(note: Note) {
  // Cancel any pending autosave
  cancelAutoSave()

  // Save current note if creating new
  if (isCreatingNew.value && hasUnsavedChanges.value) {
    saveNewNote()
  }

  selectedNote.value = note
  noteTitle.value = note.title
  noteContent.value = note.content
  noteTags.value = note.tags || []
  isCreatingNew.value = false
  isEditMode.value = true
  showTagsPanel.value = false
}

async function handleCreateNote() {
  // Cancel any pending autosave
  cancelAutoSave()

  // Save current note if creating new
  if (isCreatingNew.value && hasUnsavedChanges.value) {
    await saveNewNote()
  }

  selectedNote.value = null
  noteTitle.value = 'Untitled Note'
  noteContent.value = ''
  noteTags.value = []
  isCreatingNew.value = true
  isEditMode.value = true
  showTagsPanel.value = false
}

async function saveNewNote() {
  if (!noteTitle.value.trim() && !noteContent.value.trim()) {
    isCreatingNew.value = false
    return
  }

  const result = await createNote({
    title: noteTitle.value || 'Untitled Note',
    content: noteContent.value,
    tags: noteTags.value,
  })

  if (result.success && result.data) {
    selectedNote.value = result.data
    isCreatingNew.value = false
  }
}

function handleTitleChange(e: Event) {
  const target = e.target as HTMLInputElement
  noteTitle.value = target.value

  if (selectedNote.value && !isCreatingNew.value) {
    const savedId = selectedNote.value.id
    autoSaveNote(selectedNote.value.id, { title: noteTitle.value }, 2000, (saved) => {
      if (selectedNote.value?.id === savedId) selectedNote.value = saved
    })
  }
}

function handleContentChange(content: string) {
  noteContent.value = content

  if (selectedNote.value && !isCreatingNew.value) {
    const savedId = selectedNote.value.id
    autoSaveNote(selectedNote.value.id, { content: noteContent.value }, 2000, (saved) => {
      if (selectedNote.value?.id === savedId) selectedNote.value = saved
    })
  }
}

function handleTagsChange(tags: string[]) {
  noteTags.value = tags

  if (selectedNote.value && !isCreatingNew.value) {
    const savedId = selectedNote.value.id
    autoSaveNote(selectedNote.value.id, { tags: noteTags.value }, 500, (saved) => {
      if (selectedNote.value?.id === savedId) selectedNote.value = saved
    })
  }
}

async function handleTogglePin() {
  if (!selectedNote.value) return

  const result = await togglePin(selectedNote.value.id)
  if (result.success && result.data) {
    selectedNote.value = result.data
  }
}

async function handleDelete() {
  if (!selectedNote.value) return

  const result = await deleteNote(selectedNote.value.id)
  if (result.success) {
    selectedNote.value = null
    noteTitle.value = ''
    noteContent.value = ''
    noteTags.value = []
    isCreatingNew.value = false
  }
}

function handleToggleMode() {
  // Save before switching to preview mode
  if (isEditMode.value && isCreatingNew.value && hasUnsavedChanges.value) {
    saveNewNote()
  }
  isEditMode.value = !isEditMode.value
}

function handleToggleTags() {
  showTagsPanel.value = !showTagsPanel.value
}

async function handleClose() {
  cancelAutoSave()
  if (isCreatingNew.value && hasUnsavedChanges.value) {
    await saveNewNote()
  }
  selectedNote.value = null
  noteTitle.value = ''
  noteContent.value = ''
  noteTags.value = []
  isCreatingNew.value = false
  showTagsPanel.value = false
}
</script>

<template>
  <div class="flex flex-col h-full -m-6">
    <!-- Main content area -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Sidebar - Note list -->
      <div class="w-80 border-r border-base-300 hidden md:block">
        <NoteList @select="handleSelectNote" @create="handleCreateNote" />
      </div>

      <!-- Main editor/viewer area -->
      <div class="flex-1 flex flex-col">
        <div v-if="selectedNote || isCreatingNew" class="flex-1 flex flex-col overflow-hidden">
          <!-- Title input -->
          <div class="p-4 border-b border-base-300 flex items-center gap-2">
            <input
              v-model="noteTitle"
              type="text"
              placeholder="Note title..."
              class="input input-ghost flex-1 text-2xl font-bold px-2 focus:outline-none"
              @input="handleTitleChange"
            />
            <!-- Close button for new unsaved notes (no toolbar shown) -->
            <button
              v-if="isCreatingNew"
              type="button"
              class="btn btn-ghost btn-sm flex-shrink-0"
              title="Save &amp; close"
              @click="handleClose"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <!-- Toolbar -->
          <NoteToolbar
            v-if="selectedNote"
            :note="selectedNote"
            :is-edit-mode="isEditMode"
            @toggle-pin="handleTogglePin"
            @delete="handleDelete"
            @toggle-mode="handleToggleMode"
            @toggle-tags="handleToggleTags"
            @close="handleClose"
          />

          <!-- Tags panel -->
          <div v-if="showTagsPanel" class="p-4 border-b border-base-300 bg-base-100">
            <TagInput v-model="noteTags" @update:model-value="handleTagsChange" />
          </div>

          <!-- Editor/Viewer -->
          <div class="flex-1 overflow-hidden">
            <NoteEditor
              v-if="isEditMode"
              :note="selectedNote"
              :model-value="noteContent"
              @update:model-value="handleContentChange"
            />
            <NoteViewer v-else :content="noteContent" />
          </div>
        </div>

        <!-- Empty state -->
        <div v-else class="flex-1 flex items-center justify-center bg-base-100">
          <div class="text-center max-w-md px-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-24 w-24 mx-auto text-base-content/20 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            <h2 class="text-2xl font-bold mb-2">No Note Selected</h2>
            <p class="text-base-content/60 mb-6">
              Select a note from the sidebar or create a new one to get started.
            </p>
            <button type="button" class="btn btn-primary" @click="handleCreateNote">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create New Note
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile note list toggle -->
    <div class="md:hidden fixed bottom-4 right-4">
      <label for="mobile-drawer" class="btn btn-primary btn-circle drawer-button">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </label>
    </div>
  </div>

  <!-- Mobile drawer -->
  <div class="drawer drawer-end md:hidden">
    <input id="mobile-drawer" type="checkbox" class="drawer-toggle" />
    <div class="drawer-side z-50">
      <label for="mobile-drawer" class="drawer-overlay"></label>
      <div class="w-80 h-full bg-base-200">
        <NoteList @select="handleSelectNote" @create="handleCreateNote" />
      </div>
    </div>
  </div>
</template>
