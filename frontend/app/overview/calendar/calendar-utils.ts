import type { CalendarEvent } from '../types'

export function getTimePosition(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return (hours * 60 + minutes) / 60
}

export function getEventHeight(startTime: string, endTime: string): number {
  const start = getTimePosition(startTime)
  const end = getTimePosition(endTime)
  return Math.max((end - start) * 60, 40)
}

export function getEventTop(startTime: string): number {
  const start = getTimePosition(startTime)
  return (start - 9) * 60
}

export function getEventsForDate(calendarEvents: CalendarEvent[], date: Date): CalendarEvent[] {
  const dateStr = date.toISOString().split('T')[0]
  const events = calendarEvents.filter((event) => event.date === dateStr)
  return events.sort((a, b) => {
    const timeA = getTimePosition(a.startTime)
    const timeB = getTimePosition(b.startTime)
    return timeA - timeB
  })
}

export const CALENDAR_HOURS = Array.from({ length: 12 }, (_, i) => i + 9)

export function formatCalendarDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatDayName(date: Date): string {
  return date.toLocaleDateString('en-GB', { weekday: 'long' }).toUpperCase()
}

export function getWeekDates(date: Date): Date[] {
  const weekDates: Date[] = []
  const dateCopy = new Date(date)
  const day = dateCopy.getDay()
  const diff = dateCopy.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(dateCopy.setDate(diff))

  for (let i = 0; i < 7; i++) {
    const weekDate = new Date(monday)
    weekDate.setDate(monday.getDate() + i)
    weekDates.push(weekDate)
  }
  return weekDates
}

export function getMonthDates(date: Date): (Date | null)[] {
  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()

  const startDay = firstDay.getDay()
  const adjustedStartDay = startDay === 0 ? 6 : startDay - 1

  const monthDates: (Date | null)[] = []

  for (let i = 0; i < adjustedStartDay; i++) {
    monthDates.push(null)
  }

  for (let d = 1; d <= daysInMonth; d++) {
    monthDates.push(new Date(year, month, d))
  }

  return monthDates
}

export function formatWeekRange(date: Date): string {
  const weekDates = getWeekDates(new Date(date))
  const start = weekDates[0]
  const end = weekDates[6]
  const startStr = start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  const endStr = end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  return `${startStr} - ${endStr}`
}

export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}
