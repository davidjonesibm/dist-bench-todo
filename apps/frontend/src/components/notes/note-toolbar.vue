<script setup lang="ts">
import { ref } from 'vue'
import type { Note } from '../../types/note.types'

interface Props {
  note: Note
  isEditMode: boolean
}

interface Emits {
  (e: 'toggle-pin'): void
  (e: 'delete'): void
  (e: 'toggle-mode'): void
  (e: 'toggle-tags'): void
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const showDeleteConfirm = ref(false)

function handleDelete() {
  if (showDeleteConfirm.value) {
    emit('delete')
    showDeleteConfirm.value = false
  } else {
    showDeleteConfirm.value = true
    setTimeout(() => {
      showDeleteConfirm.value = false
    }, 3000)
  }
}

function handleTogglePin() {
  emit('toggle-pin')
}

function handleToggleMode() {
  emit('toggle-mode')
}

function handleToggleTags() {
  emit('toggle-tags')
}

function handleClose() {
  emit('close')
}
</script>

<template>
  <div class="flex items-center justify-between p-3 bg-base-200 border-b border-base-300">
    <div class="flex items-center gap-2">
      <!-- Close / Back -->
      <button type="button" class="btn btn-ghost btn-sm" @click="handleClose" title="Close note">
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
      <!-- Pin/Unpin -->
      <button
        type="button"
        class="btn btn-ghost btn-sm"
        :class="{ 'text-warning': note.isPinned }"
        @click="handleTogglePin"
        :title="note.isPinned ? 'Unpin note' : 'Pin note'"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          :fill="note.isPinned ? 'currentColor' : 'none'"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
          />
        </svg>
      </button>

      <!-- Edit/Preview toggle -->
      <button
        type="button"
        class="btn btn-ghost btn-sm"
        @click="handleToggleMode"
        :title="isEditMode ? 'Preview' : 'Edit'"
      >
        <svg
          v-if="isEditMode"
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
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
        <svg
          v-else
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
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      </button>

      <!-- Tags -->
      <button
        type="button"
        class="btn btn-ghost btn-sm"
        @click="handleToggleTags"
        title="Manage tags"
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
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
          />
        </svg>
      </button>
    </div>

    <div class="flex items-center gap-2">
      <!-- Delete -->
      <button
        type="button"
        class="btn btn-sm"
        :class="showDeleteConfirm ? 'btn-error' : 'btn-ghost'"
        @click="handleDelete"
        :title="showDeleteConfirm ? 'Click again to confirm' : 'Delete note'"
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
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
        <span v-if="showDeleteConfirm">Confirm Delete</span>
      </button>
    </div>
  </div>
</template>
