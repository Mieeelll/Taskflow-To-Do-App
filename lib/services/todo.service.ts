/**
 * Todo Service - API-based
 */

import type { TodoCreateRequest, TodoUpdateRequest } from '@/lib/types/api'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

/**
 * Convert frontend request to backend format (dueDate -> due_date)
 */
function toBackendCreate(data: TodoCreateRequest): Record<string, unknown> {
  const body: Record<string, unknown> = {
    title: data.title,
    description: data.description,
    completed: data.completed ?? false,
    priority: data.priority ?? 'medium',
    category: data.category ?? 'Uncategorized',
    status: data.status ?? 'pending',
    subtasks: data.subtasks ?? [],
  }
  if (data.dueDate !== undefined && data.dueDate !== null) {
    body.due_date = data.dueDate
  }
  return body
}

function toBackendUpdate(data: TodoUpdateRequest): Record<string, unknown> {
  const body: Record<string, unknown> = {}
  if (data.title !== undefined) body.title = data.title
  if (data.description !== undefined) body.description = data.description
  if (data.completed !== undefined) body.completed = data.completed
  if (data.priority !== undefined) body.priority = data.priority
  if (data.category !== undefined) body.category = data.category
  if (data.dueDate !== undefined) body.due_date = data.dueDate
  if (data.status !== undefined) body.status = data.status
  if (data.subtasks !== undefined) body.subtasks = data.subtasks
  return body
}

/**
 * Get token from localStorage.
 * Throws error if token not found (user not authenticated).
 */
function getAuthHeader(): Record<string, string> {
  if (typeof window === 'undefined') {
    throw new Error('No authentication token found')
  }
  const token = localStorage.getItem('token')
  if (!token) {
    throw new Error('No authentication token found')
  }
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
}

/**
 * Parse and handle error responses from backend.
 */
async function handleErrorResponse(response: Response): Promise<never> {
  let errorMessage = `API error: ${response.status}`
  try {
    const error = await response.json()
    errorMessage = error.error || errorMessage
  } catch {
    // Response might not be JSON
  }

  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    throw new Error('Session expired. Please login again.')
  }

  throw new Error(errorMessage)
}

/**
 * Fetch all todos for authenticated user.
 */
export async function fetchTodos(
  skip: number = 0,
  limit: number = 50,
  filters?: {
    completed?: boolean
    priority?: string
    category?: string
    search?: string
  }
): Promise<{ todos: Array<Record<string, unknown>>; total: number }> {
  const params = new URLSearchParams({
    skip: skip.toString(),
    limit: limit.toString(),
  })

  if (filters?.completed !== undefined) {
    params.append('completed', filters.completed.toString())
  }
  if (filters?.priority) {
    params.append('priority', filters.priority)
  }
  if (filters?.category) {
    params.append('category', filters.category)
  }
  if (filters?.search) {
    params.append('search', filters.search)
  }

  const response = await fetch(`${API_URL}/todos?${params.toString()}`, {
    method: 'GET',
    headers: getAuthHeader(),
  })

  if (!response.ok) {
    return handleErrorResponse(response)
  }

  return response.json()
}

/**
 * Create a new todo.
 */
export async function createTodo(data: TodoCreateRequest) {
  const response = await fetch(`${API_URL}/todos`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify(toBackendCreate(data)),
  })

  if (!response.ok) {
    return handleErrorResponse(response)
  }

  return response.json()
}

/**
 * Update an existing todo.
 */
export async function updateTodo(todoId: string, data: TodoUpdateRequest) {
  const response = await fetch(`${API_URL}/todos/${todoId}`, {
    method: 'PUT',
    headers: getAuthHeader(),
    body: JSON.stringify(toBackendUpdate(data)),
  })

  if (!response.ok) {
    return handleErrorResponse(response)
  }

  return response.json()
}

/**
 * Delete (soft delete) a todo.
 */
export async function deleteTodo(todoId: string): Promise<{ success: boolean }> {
  const response = await fetch(`${API_URL}/todos/${todoId}`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  })

  if (!response.ok) {
    return handleErrorResponse(response)
  }

  return response.json()
}

/**
 * Toggle todo completion status.
 */
export async function toggleTodoComplete(
  todoId: string,
  completed: boolean
): Promise<{ id: string; completed: boolean; updated_at: string }> {
  const response = await fetch(`${API_URL}/todos/${todoId}/toggle-complete`, {
    method: 'PATCH',
    headers: getAuthHeader(),
    body: JSON.stringify({ completed }),
  })

  if (!response.ok) {
    return handleErrorResponse(response)
  }

  return response.json()
}
