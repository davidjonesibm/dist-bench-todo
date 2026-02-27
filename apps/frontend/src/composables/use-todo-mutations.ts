import { pb } from '../lib/pocketbase'
import { useTodoStore } from '../stores/todo.store'
import type { CreateTodoDto, Todo, UpdateTodoDto } from '@todo-app/shared'

export function useTodoMutations() {
  const store = useTodoStore()

  /**
   * Create a new todo for the current user
   */
  async function createTodo(dto: CreateTodoDto): Promise<void> {
    store.setError(null)
    try {
      if (!pb.authStore.model?.id) {
        throw new Error('User not authenticated')
      }

      const data = await pb.collection('todos').create<Todo>({
        ...dto,
        userId: pb.authStore.model.id,
        completed: false,
      })

      store.upsert(data)
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to create todo'
      store.setError(errorMessage)
      console.error('Error creating todo:', err)
    }
  }

  /**
   * Toggle the completed status of a todo
   */
  async function toggleTodo(todo: Todo): Promise<void> {
    store.setError(null)
    try {
      const update: UpdateTodoDto = { completed: !todo.completed }
      const data = await pb.collection('todos').update<Todo>(todo.id, update)
      store.upsert(data)
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to update todo'
      store.setError(errorMessage)
      console.error('Error updating todo:', err)
    }
  }

  /**
   * Delete a todo
   */
  async function deleteTodo(id: string): Promise<void> {
    store.setError(null)
    try {
      await pb.collection('todos').delete(id)
      store.remove(id)
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to delete todo'
      store.setError(errorMessage)
      console.error('Error deleting todo:', err)
    }
  }

  return { createTodo, toggleTodo, deleteTodo }
}
