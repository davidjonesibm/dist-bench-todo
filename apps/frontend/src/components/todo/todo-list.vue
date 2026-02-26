<script setup lang="ts">
import type { Todo } from '@todo-app/shared'
import TodoItem from './todo-item.vue'

defineProps<{
  todos: Todo[]
}>()

const emit = defineEmits<{
  toggle: [todo: Todo]
  delete: [id: string]
}>()
</script>

<template>
  <div>
    <ul v-if="todos.length > 0" class="divide-y divide-base-300">
      <TodoItem
        v-for="todo in todos"
        :key="todo.id"
        :todo="todo"
        @toggle="emit('toggle', $event)"
        @delete="emit('delete', $event)"
      />
    </ul>
    <div v-else class="py-10 text-center text-base-content/40">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-12 w-12 mx-auto mb-3 opacity-30"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
      <p class="text-sm">Nothing to do! Add a task above.</p>
    </div>
  </div>
</template>
