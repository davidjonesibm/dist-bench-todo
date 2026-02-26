<script setup lang="ts">
import type { Todo } from '@todo-app/shared'

defineProps<{
  todo: Todo
}>()

const emit = defineEmits<{
  toggle: [todo: Todo]
  delete: [id: string]
}>()
</script>

<template>
  <li class="flex items-center gap-3 py-3 border-b border-base-300 last:border-0 group">
    <input
      type="checkbox"
      class="checkbox checkbox-primary flex-shrink-0"
      :checked="todo.completed"
      @change="emit('toggle', todo)"
    />
    <span
      :class="[
        'flex-1 text-sm leading-relaxed break-words min-w-0',
        todo.completed ? 'line-through text-base-content/40' : 'text-base-content',
      ]"
    >
      {{ todo.title }}
    </span>
    <button
      class="btn btn-ghost btn-sm btn-circle text-error opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
      title="Delete todo"
      @click="emit('delete', todo.id)"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-4 w-4"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
          clip-rule="evenodd"
        />
      </svg>
    </button>
  </li>
</template>
