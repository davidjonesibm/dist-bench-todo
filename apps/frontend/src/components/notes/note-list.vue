<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useNotes } from '../../composables/use-notes'
import { useTags } from '../../composables/use-tags'
import type { Note } from '../../types/note.types'
import TagBadge from '../tags/tag-badge.vue'

interface Emits {
  (e: 'select', note: Note): void
  (e: 'create'): void
}

const emit = defineEmits<Emits>()

const { notes, fetchNotes, subscribeToNotes, loading } = useNotes()
const { tags, fetchTags } = useTags()

const searchQuery = ref('')
const selectedTagFilter = ref<string | null>(null)
const selectedNoteId = ref<string | null>(null)

onMounted(async () => {
  await Promise.all([fetchNotes(), fetchTags()])
  subscribeToNotes()
})

const filteredNotes = computed(() => {
  let filtered = notes.value

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (note) =>
        note.title.toLowerCase().includes(query) || note.content.toLowerCase().includes(query),
    )
  }

  // Filter by tag
  if (selectedTagFilter.value) {
    filtered = filtered.filter((note) => note.tags?.includes(selectedTagFilter.value!))
  }

  return filtered
})

const pinnedNotes = computed(() => filteredNotes.value.filter((note) => note.isPinned))
const unpinnedNotes = computed(() => filteredNotes.value.filter((note) => !note.isPinned))

function selectNote(note: Note) {
  selectedNoteId.value = note.id
  emit('select', note)
}

function createNewNote() {
  selectedNoteId.value = null
  emit('create')
}

function getExcerpt(content: string, maxLength: number = 100): string {
  const text = content.replace(/[#*`_\-~]/g, '').trim()
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

function getTagsForNote(note: Note) {
  if (!note.tags || note.tags.length === 0) return []
  return note.tags
    .map((tagId) => tags.value.find((t) => t.id === tagId))
    .filter((tag) => tag !== undefined)
}

function toggleTagFilter(tagId: string) {
  selectedTagFilter.value = selectedTagFilter.value === tagId ? null : tagId
}

function clearFilters() {
  searchQuery.value = ''
  selectedTagFilter.value = null
}
</script>

<template>
  <div class="flex flex-col h-full bg-base-200">
    <!-- Header -->
    <div class="p-4 border-b border-base-300">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-xl font-bold">Notes</h2>
        <button type="button" class="btn btn-primary btn-sm" @click="createNewNote">
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          New
        </button>
      </div>

      <!-- Search -->
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search notes..."
        class="input input-bordered w-full input-sm"
      />

      <!-- Active tag filter -->
      <div v-if="selectedTagFilter" class="mt-2 flex items-center gap-2">
        <span class="text-xs">Filter:</span>
        <TagBadge
          v-if="tags.find((t) => t.id === selectedTagFilter)"
          :tag="tags.find((t) => t.id === selectedTagFilter)!"
          removable
          @remove="selectedTagFilter = null"
        />
      </div>

      <!-- Clear filters -->
      <button
        v-if="searchQuery || selectedTagFilter"
        type="button"
        class="btn btn-ghost btn-xs mt-2 w-full"
        @click="clearFilters"
      >
        Clear filters
      </button>
    </div>

    <!-- Notes list -->
    <div class="flex-1 overflow-y-auto">
      <div v-if="loading && notes.length === 0" class="p-4 text-center">
        <span class="loading loading-spinner loading-md"></span>
      </div>

      <div v-else-if="filteredNotes.length === 0" class="p-4 text-center text-base-content/60">
        <p v-if="searchQuery || selectedTagFilter">No notes found</p>
        <p v-else>No notes yet. Create your first note!</p>
      </div>

      <div v-else>
        <!-- Pinned notes -->
        <div v-if="pinnedNotes.length > 0" class="mb-2">
          <div class="px-4 py-2 text-xs font-semibold text-base-content/60 uppercase">Pinned</div>
          <div
            v-for="note in pinnedNotes"
            :key="note.id"
            class="px-4 py-3 border-b border-base-300 cursor-pointer hover:bg-base-100 transition-colors"
            :class="{ 'bg-base-100': selectedNoteId === note.id }"
            @click="selectNote(note)"
          >
            <div class="flex items-start justify-between mb-1">
              <h3 class="font-semibold text-sm line-clamp-1">{{ note.title || 'Untitled' }}</h3>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 text-warning flex-shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                />
              </svg>
            </div>
            <p class="text-xs text-base-content/60 line-clamp-2 mb-2">
              {{ getExcerpt(note.content) }}
            </p>
            <div v-if="getTagsForNote(note).length > 0" class="flex flex-wrap gap-1">
              <TagBadge
                v-for="tag in getTagsForNote(note)"
                :key="tag.id"
                :tag="tag"
                clickable
                @click.stop="toggleTagFilter(tag.id)"
              />
            </div>
          </div>
        </div>

        <!-- Regular notes -->
        <div v-if="unpinnedNotes.length > 0">
          <div
            v-if="pinnedNotes.length > 0"
            class="px-4 py-2 text-xs font-semibold text-base-content/60 uppercase"
          >
            Notes
          </div>
          <div
            v-for="note in unpinnedNotes"
            :key="note.id"
            class="px-4 py-3 border-b border-base-300 cursor-pointer hover:bg-base-100 transition-colors"
            :class="{ 'bg-base-100': selectedNoteId === note.id }"
            @click="selectNote(note)"
          >
            <h3 class="font-semibold text-sm line-clamp-1 mb-1">
              {{ note.title || 'Untitled' }}
            </h3>
            <p class="text-xs text-base-content/60 line-clamp-2 mb-2">
              {{ getExcerpt(note.content) }}
            </p>
            <div v-if="getTagsForNote(note).length > 0" class="flex flex-wrap gap-1">
              <TagBadge
                v-for="tag in getTagsForNote(note)"
                :key="tag.id"
                :tag="tag"
                clickable
                @click.stop="toggleTagFilter(tag.id)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
