import { onMounted, onUnmounted } from 'vue'
import { pb } from '../lib/pocketbase'
import { useTodoStore } from '../stores/todo.store'
import type { Todo } from '@todo-app/shared'

export function useTodos() {
  const store = useTodoStore()
  let unsubscribe: (() => void) | null = null

  /**
   * Fetch all todos for the current user
   */
  async function fetchTodos() {
    store.setLoading(true)
    store.setError(null)
    try {
      if (!pb.authStore.model?.id) {
        throw new Error('User not authenticated')
      }

      const records = await pb.collection('todos').getFullList<Todo>({
        sort: '-created',
        filter: `userId = "${pb.authStore.model.id}"`,
      })

      store.setTodos(records)
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to load todos'
      store.setError(errorMessage)
      console.error('Error fetching todos:', err)
    } finally {
      store.setLoading(false)
    }
  }

  /**
   * Subscribe to real-time todo updates
   */
  async function subscribeToTodos() {
    if (!pb.authStore.model?.id) {
      console.warn('Cannot subscribe to todos: user not authenticated')
      return
    }

    try {
      unsubscribe = await pb.collection('todos').subscribe<Todo>('*', (e) => {
        // Only process todos for the current user
        if (e.record?.userId !== pb.authStore.model?.id) {
          return
        }

        if (e.action === 'create') {
          store.upsert(e.record)
        } else if (e.action === 'update') {
          store.upsert(e.record)
        } else if (e.action === 'delete') {
          store.remove(e.record.id)
        }
      })
    } catch (err) {
      console.error('Error subscribing to todos:', err)
    }
  }

  /**
   * Unsubscribe from real-time updates
   */
  function unsubscribeFromTodos() {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
  }

  // Initialize on mount
  onMounted(async () => {
    await fetchTodos()
    await subscribeToTodos()
  })

  // Cleanup on unmount
  onUnmounted(() => {
    unsubscribeFromTodos()
  })

  return { fetchTodos, subscribeToTodos, unsubscribeFromTodos }
}
