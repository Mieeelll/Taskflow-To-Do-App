/**
 * Authentication Service - API-based
 */

import type { User, UserLoginRequest, UserRegisterRequest } from '@/lib/types/api'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

/**
 * Register a new user with the backend.
 * @param credentials - {username, email, password}
 * @throws Error with message from backend
 */
export async function registerUser(credentials: UserRegisterRequest): Promise<void> {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Registration failed')
  }

  return
}

export interface AuthResponse {
  token: string
  user: {
    id: string
    username: string
    email: string
  }
}

/**
 * Authenticate user with backend and store JWT token.
 * @param credentials - {email, password}
 * @returns User object from backend
 * @throws Error with message from backend
 */
export async function loginUser(credentials: UserLoginRequest): Promise<User> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Login failed')
  }

  const data: AuthResponse = await response.json()

  if (typeof window !== 'undefined') {
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
  }

  return data.user
}

const APP_DATA_KEYS = [
  'lists',
  'categories',
  'tags',
  'stickyNotes',
  'calendarEvents',
  'notes',
  'todos',
] as const

/**
 * Clear only application state from localStorage (not auth).
 * Use when validating consistency so the next user doesn't see leftover data.
 */
export function clearAppDataOnly(): void {
  if (typeof window === 'undefined') return
  APP_DATA_KEYS.forEach((key) => localStorage.removeItem(key))
}

/**
 * Clear all user data from localStorage on logout.
 * Ensures complete data isolation between users on same browser.
 */
export function clearAllUserData(): void {
  if (typeof window === 'undefined') return

  localStorage.removeItem('token')
  localStorage.removeItem('user')
  clearAppDataOnly()
}

/**
 * Logout user and clear all user-specific data.
 */
export function logoutUser(): void {
  clearAllUserData()
}

/**
 * Get current user from localStorage
 */
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null

  const userStr = localStorage.getItem('user')
  if (!userStr) return null

  try {
    return JSON.parse(userStr) as User
  } catch {
    return null
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null
}
