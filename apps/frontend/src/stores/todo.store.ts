import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Todo, TodoFilter } from '@todo-app/shared'

export const useTodoStore = defineStore('todo', () => {
  const todos = ref<Todo[]>([])
  const filter = ref<TodoFilter>('all')
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const filteredTodos = computed<Todo[]>(() => {
    if (filter.value === 'active') return todos.value.filter((t) => !t.completed)
    if (filter.value === 'completed') return todos.value.filter((t) => t.completed)
    return todos.value
  })

  const remainingCount = computed<number>(() => todos.value.filter((t) => !t.completed).length)

  const totalCount = computed<number>(() => todos.value.length)

  function setTodos(list: Todo[]) {
    todos.value = list
  }

  function setFilter(f: TodoFilter) {
    filter.value = f
  }

  function setLoading(v: boolean) {
    isLoading.value = v
  }

  function setError(e: string | null) {
    error.value = e
  }

  function upsert(todo: Todo) {
    const idx = todos.value.findIndex((t) => t.id === todo.id)
    if (idx >= 0) {
      todos.value[idx] = todo
    } else {
      todos.value.unshift(todo)
    }
  }

  function remove(id: string) {
    todos.value = todos.value.filter((t) => t.id !== id)
  }

  return {
    todos,
    filter,
    isLoading,
    error,
    filteredTodos,
    remainingCount,
    totalCount,
    setTodos,
    setFilter,
    setLoading,
    setError,
    upsert,
    remove,
  }
})
