<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useTodoStore } from '../stores/todo.store'
import { useTodos } from '../composables/use-todos'
import { useTodoMutations } from '../composables/use-todo-mutations'
import TodoForm from '../components/todo/todo-form.vue'
import TodoFilter from '../components/todo/todo-filter.vue'
import TodoList from '../components/todo/todo-list.vue'
import LoadingSpinner from '../components/ui/loading-spinner.vue'
import ErrorAlert from '../components/ui/error-alert.vue'
import type { CreateTodoDto } from '@todo-app/shared'

const store = useTodoStore()
const { filteredTodos, isLoading, error, remainingCount, filter, totalCount } = storeToRefs(store)

const { fetchTodos } = useTodos()
const { createTodo, toggleTodo, deleteTodo } = useTodoMutations()

async function handleCreate(dto: CreateTodoDto) {
  await createTodo(dto)
}

function clearCompleted() {
  const completedTodos = store.todos.filter((t) => t.completed)
  completedTodos.forEach((t) => deleteTodo(t.id))
}
</script>

<template>
  <div class="flex flex-col items-center">
    <div class="card w-full max-w-lg bg-base-100 shadow-xl">
      <div class="card-body gap-6">
        <div class="text-center">
          <h1 class="text-3xl font-bold text-primary">My Todos</h1>
          <p class="text-sm text-base-content/60 mt-1">
            {{ remainingCount }} of {{ totalCount }} remaining
          </p>
        </div>

        <TodoForm @submit="handleCreate" />

        <ErrorAlert v-if="error" :message="error" @dismiss="store.setError(null)" />

        <LoadingSpinner v-else-if="isLoading" label="Loading todos..." />

        <template v-else>
          <TodoFilter v-model="filter" />
          <TodoList :todos="filteredTodos" @toggle="toggleTodo" @delete="deleteTodo" />
          <div
            v-if="totalCount > 0"
            class="flex justify-between items-center text-xs text-base-content/50 pt-2 border-t border-base-300"
          >
            <span>{{ remainingCount }} item{{ remainingCount !== 1 ? 's' : '' }} left</span>
            <button
              v-if="totalCount > remainingCount"
              class="btn btn-ghost btn-xs text-error"
              @click="clearCompleted"
            >
              Clear completed
            </button>
          </div>
        </template>
      </div>
    </div>

    <button class="btn btn-ghost btn-sm mt-6 text-base-content/40" @click="fetchTodos">
      ↻ Refresh
    </button>
  </div>
</template>
