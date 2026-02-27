<script setup lang="ts">
import { computed } from 'vue'
import type { Tag } from '../../types/tag.types'

interface Props {
  tag: Tag
  removable?: boolean
  clickable?: boolean
}

interface Emits {
  (e: 'remove'): void
  (e: 'click'): void
}

const props = withDefaults(defineProps<Props>(), {
  removable: false,
  clickable: false,
})

const emit = defineEmits<Emits>()

const badgeStyle = computed(() => ({
  backgroundColor: props.tag.color,
  color: getContrastColor(props.tag.color),
}))

/**
 * Calculate contrast color (black or white) based on background color
 */
function getContrastColor(hexColor: string): string {
  // Remove # if present
  const color = hexColor.replace('#', '')

  // Convert to RGB
  const r = parseInt(color.substring(0, 2), 16)
  const g = parseInt(color.substring(2, 4), 16)
  const b = parseInt(color.substring(4, 6), 16)

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  return luminance > 0.5 ? '#000000' : '#FFFFFF'
}

function handleClick() {
  if (props.clickable) {
    emit('click')
  }
}

function handleRemove(e: Event) {
  e.stopPropagation()
  emit('remove')
}
</script>

<template>
  <span
    class="badge badge-sm gap-1 px-2 py-3 font-medium"
    :class="{ 'cursor-pointer hover:opacity-80': clickable }"
    :style="badgeStyle"
    @click="handleClick"
  >
    {{ tag.name }}
    <button
      v-if="removable"
      type="button"
      class="btn btn-ghost btn-xs p-0 min-h-0 h-4 w-4"
      @click="handleRemove"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-3 w-3"
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
  </span>
</template>
