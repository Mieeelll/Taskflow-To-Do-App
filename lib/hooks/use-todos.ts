/**
 * Custom hook for managing todos with API integration
 */

import { useCallback, useEffect, useState } from 'react'
import {
  fetchTodos as fetchTodosAPI,
  createTodo as createTodoAPI,
  updateTodo as updateTodoAPI,
  deleteTodo as deleteTodoAPI,
  toggleTodoComplete as toggleTodoCompleteAPI,
} from '@/lib/services/todo.service'
import type { Todo, TodoCreateRequest, TodoUpdateRequest } from '@/lib/types/api'

interface UseTodosState {
  todos: Todo[]
  loading: boolean
  error: string | null
}

interface UseTodosActions {
  fetchTodos: () => Promise<void>
  fetchTodo: (id: string) => Promise<Todo | null>
  addTodo: (data: TodoCreateRequest) => Promise<Todo | null>
  editTodo: (id: string, data: TodoUpdateRequest) => Promise<Todo | null>
  removeTodo: (id: string) => Promise<boolean>
  clearError: () => void
}

/**
 * Map backend todo to frontend Todo type
 */
function mapTodo(raw: Record<string, unknown>): Todo {
  return {
    id: String(raw.id),
    title: String(raw.title),
    description: String(raw.description ?? ''),
    completed: Boolean(raw.completed),
    priority: (raw.priority as 'low' | 'medium' | 'high') || 'medium',
    due_date: raw.due_date ? String(raw.due_date) : null,
    category: String(raw.category ?? 'Uncategorized'),
    created_at: String(raw.created_at ?? ''),
    updated_at: raw.updated_at ? String(raw.updated_at) : undefined,
  }
}

/**
 * Hook for managing todos with backend API
 */
export function useTodos(): UseTodosState & UseTodosActions {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTodos = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchTodosAPI(0, 100)
      setTodos((data.todos || []).map(mapTodo))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch todos')
      setTodos([])
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchTodo = useCallback(async (id: string): Promise<Todo | null> => {
    const todo = todos.find((t) => t.id === id)
    return todo ?? null
  }, [todos])

  const addTodo = useCallback(async (data: TodoCreateRequest): Promise<Todo | null> => {
    setError(null)
    try {
      const newTodo = await createTodoAPI(data)
      const mapped = mapTodo(newTodo)
      setTodos((prev) => [...prev, mapped])
      return mapped
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create todo'
      setError(errorMsg)
      return null
    }
  }, [])

  const editTodo = useCallback(async (id: string, data: TodoUpdateRequest): Promise<Todo | null> => {
    setError(null)
    try {
      const updated = await updateTodoAPI(id, data)
      const mapped = mapTodo(updated)
      setTodos((prev) => prev.map((t) => (t.id === id ? mapped : t)))
      return mapped
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update todo'
      setError(errorMsg)
      return null
    }
  }, [])

  const removeTodo = useCallback(async (id: string): Promise<boolean> => {
    setError(null)
    try {
      await deleteTodoAPI(id)
      setTodos((prev) => prev.filter((t) => t.id !== id))
      return true
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete todo'
      setError(errorMsg)
      return false
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  useEffect(() => {
    fetchTodos()
  }, [fetchTodos])

  return {
    todos,
    loading,
    error,
    fetchTodos,
    fetchTodo,
    addTodo,
    editTodo,
    removeTodo,
    clearError,
  }
}
