<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTags } from '../../composables/use-tags'
import type { Tag } from '../../types/tag.types'
import TagBadge from './tag-badge.vue'

interface Props {
  modelValue: string[] // Array of tag IDs
}

interface Emits {
  (e: 'update:modelValue', value: string[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { tags, fetchTags, createTag } = useTags()

const showDropdown = ref(false)
const searchQuery = ref('')
const newTagName = ref('')
const newTagColor = ref('#3B82F6') // Default blue color

onMounted(async () => {
  await fetchTags()
})

const selectedTags = computed(() => {
  return tags.value.filter((tag) => props.modelValue.includes(tag.id))
})

const filteredTags = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) return tags.value
  return tags.value.filter((tag) => tag.name.toLowerCase().includes(query))
})

const availableTags = computed(() => {
  return filteredTags.value.filter((tag) => !props.modelValue.includes(tag.id))
})

const showCreateNew = computed(() => {
  return (
    searchQuery.value.trim() !== '' &&
    !tags.value.some((tag) => tag.name.toLowerCase() === searchQuery.value.toLowerCase())
  )
})

function toggleTag(tagId: string) {
  const newValue = props.modelValue.includes(tagId)
    ? props.modelValue.filter((id) => id !== tagId)
    : [...props.modelValue, tagId]

  emit('update:modelValue', newValue)
}

function removeTag(tagId: string) {
  emit(
    'update:modelValue',
    props.modelValue.filter((id) => id !== tagId),
  )
}

async function handleCreateTag() {
  const name = newTagName.value.trim() || searchQuery.value.trim()
  if (!name) return

  const result = await createTag(name, newTagColor.value)
  if (result.success && result.data) {
    toggleTag(result.data.id)
    newTagName.value = ''
    searchQuery.value = ''
    newTagColor.value = '#3B82F6'
  }
}

function toggleDropdown() {
  showDropdown.value = !showDropdown.value
  if (showDropdown.value) {
    searchQuery.value = ''
  }
}

// Predefined color palette
const colorPalette = [
  '#EF4444', // Red
  '#F59E0B', // Amber
  '#10B981', // Green
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#6366F1', // Indigo
  '#14B8A6', // Teal
]
</script>

<template>
  <div class="form-control w-full">
    <label class="label">
      <span class="label-text">Tags</span>
    </label>

    <!-- Selected tags -->
    <div v-if="selectedTags.length > 0" class="flex flex-wrap gap-2 mb-2">
      <TagBadge
        v-for="tag in selectedTags"
        :key="tag.id"
        :tag="tag"
        removable
        @remove="removeTag(tag.id)"
      />
    </div>

    <!-- Tag selector dropdown -->
    <div class="dropdown dropdown-bottom w-full">
      <button
        type="button"
        tabindex="0"
        class="btn btn-outline w-full justify-start"
        @click="toggleDropdown"
      >
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
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
          />
        </svg>
        Add tags
      </button>

      <div
        v-if="showDropdown"
        tabindex="0"
        class="dropdown-content z-10 card card-compact w-full p-4 shadow bg-base-100 border border-base-300 mt-2"
      >
        <!-- Search input -->
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search or create tag..."
          class="input input-bordered w-full mb-3"
        />

        <!-- Available tags list -->
        <div v-if="availableTags.length > 0" class="max-h-48 overflow-y-auto mb-3">
          <div class="flex flex-wrap gap-2">
            <TagBadge
              v-for="tag in availableTags"
              :key="tag.id"
              :tag="tag"
              clickable
              @click="toggleTag(tag.id)"
            />
          </div>
        </div>

        <!-- Create new tag -->
        <div v-if="showCreateNew" class="border-t border-base-300 pt-3">
          <p class="text-sm mb-2">
            Create new tag: <strong>{{ searchQuery }}</strong>
          </p>

          <div class="flex gap-2 mb-2">
            <button
              v-for="color in colorPalette"
              :key="color"
              type="button"
              class="w-8 h-8 rounded-full border-2 transition-all"
              :class="newTagColor === color ? 'border-base-content scale-110' : 'border-base-300'"
              :style="{ backgroundColor: color }"
              @click="newTagColor = color"
            />
          </div>

          <button type="button" class="btn btn-primary btn-sm w-full" @click="handleCreateTag">
            Create Tag
          </button>
        </div>

        <!-- Empty state -->
        <div
          v-if="availableTags.length === 0 && !showCreateNew"
          class="text-center py-4 text-base-content/60"
        >
          <p v-if="searchQuery">No tags found</p>
          <p v-else>No available tags</p>
        </div>

        <!-- Close button -->
        <button
          type="button"
          class="btn btn-sm btn-ghost w-full mt-2"
          @click="showDropdown = false"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>
