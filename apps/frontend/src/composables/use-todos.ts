import { apiFetch } from '../lib/api'
import { useTodoStore } from '../stores/todo.store'
import { usePageRefetch } from './use-page-refetch'
import type { Todo } from '@todo-app/shared'

export function useTodos() {
  const store = useTodoStore()

  /**
   * Fetch all todos for the current user
   */
  async function fetchTodos() {
    store.setLoading(true)
    store.setError(null)
    try {
      const records = await apiFetch<Todo[]>('/api/todos')
      store.setTodos(records)
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to load todos'
      store.setError(errorMessage)
      console.error('Error fetching todos:', err)
    } finally {
      store.setLoading(false)
    }
  }

  usePageRefetch(fetchTodos)

  return { fetchTodos }
}
