/**
 * TypeScript types for TaskFlow
 */

export interface User {
  id: string
  username: string
  email: string
}

export interface UserRegisterRequest {
  username: string
  email: string
  password: string
}

export interface UserLoginRequest {
  email: string
  password: string
}

export type TodoStatus = 'pending' | 'in_progress' | 'completed'

export interface SubtaskItem {
  id: string
  title: string
  completed: boolean
}

export interface Todo {
  id: string
  title: string
  description: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  due_date: string | null
  category: string
  created_at: string
  updated_at?: string
  status?: TodoStatus
  subtasks?: SubtaskItem[]
}

export interface TodoCreateRequest {
  title: string
  description?: string
  completed?: boolean
  priority?: 'low' | 'medium' | 'high'
  dueDate?: string | null
  category?: string
  status?: TodoStatus
  subtasks?: SubtaskItem[]
}

export interface TodoUpdateRequest {
  title?: string
  description?: string
  completed?: boolean
  priority?: 'low' | 'medium' | 'high'
  dueDate?: string | null
  category?: string
  status?: TodoStatus
  subtasks?: SubtaskItem[]
}
