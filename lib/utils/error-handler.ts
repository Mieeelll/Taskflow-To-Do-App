/**
 * Error handling utilities
 */

/**
 * Extract user-friendly error message from error
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
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
