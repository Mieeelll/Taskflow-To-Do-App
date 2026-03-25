export type TaskStatus = 'pending' | 'in_progress' | 'completed'

export interface List {
  id: string
  name: string
  color: string
}

export interface Tag {
  id: string
  name: string
  color: string
}

export interface CalendarEvent {
  id: string
  title: string
  startTime: string
  endTime: string
  date: string
  color: string
  description?: string
}

export interface StickyNote {
  id: string
  title: string
  content: string
  color: string
  createdAt: string
  x?: number
  y?: number
}

export type ViewType = 'overview' | 'categories' | 'upcoming' | 'task' | 'calendar' | 'sticky'
export type CalendarViewType = 'day' | 'week' | 'month'
