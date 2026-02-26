import { onMounted } from 'vue'
import axios from 'axios'
import { useTodoStore } from '../stores/todo.store'
import type { Todo } from '@todo-app/shared'

export function useTodos() {
  const store = useTodoStore()

  async function fetchTodos() {
    store.setLoading(true)
    store.setError(null)
    try {
      const { data } = await axios.get<Todo[]>('/api/todos')
      store.setTodos(data)
    } catch {
      store.setError('Failed to load todos. Please check that the backend is running.')
    } finally {
      store.setLoading(false)
    }
  }

  onMounted(fetchTodos)

  return { fetchTodos }
}
