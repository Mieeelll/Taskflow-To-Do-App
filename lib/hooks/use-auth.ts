/**
 * Authentication hook for checking user state
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { clearAllUserData, clearAppDataOnly } from '@/lib/services/auth.service'
import type { User } from '@/lib/types/api'

interface UseAuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

/**
 * Clear user-specific app data when not logged in (prevents stale data for next user).
 */
function validateUserDataConsistency(): void {
  if (typeof window === 'undefined') return
  const userStr = localStorage.getItem('user')
  if (!userStr) {
    clearAppDataOnly()
  }
}

/**
 * Hook for managing authentication state and protecting routes
 */
export function useAuth(): UseAuthState {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      validateUserDataConsistency()
      const userStr = localStorage.getItem('user')
      if (userStr) {
        try {
          const parsedUser = JSON.parse(userStr) as User
          setUser(parsedUser)
        } catch {
          clearAllUserData()
          setUser(null)
        }
      } else {
        setUser(null)
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  }
}

/**
 * Hook for protecting routes - redirects to login if not authenticated
 */
export function useProtectedRoute() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  return { isLoading, isAuthenticated }
}
