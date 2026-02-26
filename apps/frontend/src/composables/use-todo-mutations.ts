import axios from 'axios'
import { useTodoStore } from '../stores/todo.store'
import type { CreateTodoDto, Todo, UpdateTodoDto } from '@todo-app/shared'

export function useTodoMutations() {
  const store = useTodoStore()

  async function createTodo(dto: CreateTodoDto): Promise<void> {
    store.setError(null)
    try {
      const { data } = await axios.post<Todo>('/api/todos', dto)
      store.upsert(data)
    } catch {
      store.setError('Failed to create todo.')
    }
  }

  async function toggleTodo(todo: Todo): Promise<void> {
    store.setError(null)
    try {
      const update: UpdateTodoDto = { completed: !todo.completed }
      const { data } = await axios.patch<Todo>(`/api/todos/${todo.id}`, update)
      store.upsert(data)
    } catch {
      store.setError('Failed to update todo.')
    }
  }

  async function deleteTodo(id: string): Promise<void> {
    store.setError(null)
    try {
      await axios.delete(`/api/todos/${id}`)
      store.remove(id)
    } catch {
      store.setError('Failed to delete todo.')
    }
  }

  return { createTodo, toggleTodo, deleteTodo }
}
