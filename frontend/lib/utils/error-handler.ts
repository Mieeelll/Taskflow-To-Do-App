/**
 * Error handling utilities
 */

/**
 * Extract user-friendly error message from error
 */
export function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') return error

  if (error instanceof Error) {
    return error.message || 'An unexpected error occurred'
  }

  // Common backend shapes:
  // - FastAPI handlers in this repo return: { error: string, status: number }
  // - Some APIs return: { detail: string | string[] }
  if (error && typeof error === 'object') {
    const maybe = error as Record<string, unknown>

    const apiError = maybe.error
    if (typeof apiError === 'string' && apiError.trim()) return apiError

    const detail = maybe.detail
    if (typeof detail === 'string' && detail.trim()) return detail
    if (Array.isArray(detail) && detail.every((x) => typeof x === 'string')) return detail.join(', ')
  }

  return 'An unexpected error occurred'
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(_error: unknown): boolean {
  return false
}

/**
 * Check if error is a validation error
 */
export function isValidationError(_error: unknown): boolean {
  return false
}

/**
 * Check if error is a network error
 */
export function isNetworkError(_error: unknown): boolean {
  return false
}
