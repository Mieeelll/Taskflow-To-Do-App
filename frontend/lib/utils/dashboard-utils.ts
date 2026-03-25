/**
 * Dashboard utilities for task management
 */

import { Todo } from '@/lib/types/api'

export interface Task extends Todo {
  status?: 'pending' | 'in_progress' | 'completed'
  subtasks?: { id: string; title: string; completed: boolean }[]
  dueDate?: string
  createdAt?: string
}

/**
 * Convert API Todo to Task with status and subtasks
 */
export function todoToTask(todo: Todo): Task {
  const status =
    todo.status ?? (todo.completed ? 'completed' : 'pending')
  return {
    ...todo,
    status,
    dueDate: todo.due_date || '',
    createdAt: todo.created_at,
    subtasks: todo.subtasks ?? [],
  }
}

/**
 * Convert Task to TodoUpdateRequest for API
 */
export function taskToTodoUpdate(task: Task) {
  return {
    title: task.title,
    description: task.description,
    completed: task.completed,
    priority: task.priority,
    dueDate: task.due_date || undefined,
    category: task.category,
    status: task.status,
    subtasks: task.subtasks,
  }
}

/**
 * Filter tasks by various criteria
 */
export function filterTasks(
  tasks: Task[],
  filters: {
    searchQuery?: string
    category?: string
    status?: string
  }
): Task[] {
  return tasks.filter((task) => {
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      if (
        !task.title.toLowerCase().includes(query) &&
        !task.description?.toLowerCase().includes(query)
      ) {
        return false
      }
    }

    if (filters.category && task.category !== filters.category) {
      return false
    }

    if (filters.status && task.status !== filters.status) {
      return false
    }

    return true
  })
}

/**
 * Get tasks by date range
 */
export function getTasksByDateRange(
  tasks: Task[],
  startDate: Date,
  endDate: Date
): Task[] {
  return tasks.filter((task) => {
    const dueDate = task.due_date || task.dueDate
    if (!dueDate) return false
    const taskDate = new Date(dueDate)
    return taskDate >= startDate && taskDate <= endDate
  })
}

/**
 * Sort tasks by various criteria
 */
export function sortTasks(
  tasks: Task[],
  sortBy: 'date' | 'priority' | 'title' = 'date'
): Task[] {
  const sorted = [...tasks]

  switch (sortBy) {
    case 'date':
      return sorted.sort((a, b) => {
        const aDate = a.due_date || a.dueDate
        const bDate = b.due_date || b.dueDate
        if (!aDate) return 1
        if (!bDate) return -1
        return new Date(aDate).getTime() - new Date(bDate).getTime()
      })

    case 'priority': {
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      return sorted.sort(
        (a, b) =>
          priorityOrder[a.priority as keyof typeof priorityOrder] -
          priorityOrder[b.priority as keyof typeof priorityOrder]
      )
    }

    case 'title':
      return sorted.sort((a, b) => a.title.localeCompare(b.title))

    default:
      return sorted
  }
}
