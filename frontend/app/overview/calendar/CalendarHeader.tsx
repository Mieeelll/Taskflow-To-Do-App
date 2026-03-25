'use client'

import type { CalendarViewType } from '../types'
import { formatCalendarDate, formatMonthYear, formatWeekRange } from './calendar-utils'

export interface CalendarHeaderProps {
  calendarView: CalendarViewType
  currentDate: Date
  onCalendarViewChange: (v: CalendarViewType) => void
  onToday: () => void
  onNavigate: (direction: 'prev' | 'next') => void
  onAddEvent: () => void
}

export function CalendarHeader({
  calendarView,
  currentDate,
  onCalendarViewChange,
  onToday,
  onNavigate,
  onAddEvent,
}: CalendarHeaderProps) {
  const title =
    calendarView === 'day'
      ? formatCalendarDate(currentDate)
      : calendarView === 'week'
        ? formatWeekRange(currentDate)
        : formatMonthYear(currentDate)

  return (
    <div className="calendar-header">
      <div className="calendar-header-left">
        <h1 className="calendar-date">{title}</h1>
        <div className="calendar-tabs">
          <button
            type="button"
            className={`calendar-tab ${calendarView === 'day' ? 'active' : ''}`}
            onClick={() => onCalendarViewChange('day')}
          >
            Day
          </button>
          <button
            type="button"
            className={`calendar-tab ${calendarView === 'week' ? 'active' : ''}`}
            onClick={() => onCalendarViewChange('week')}
          >
            Week
          </button>
          <button
            type="button"
            className={`calendar-tab ${calendarView === 'month' ? 'active' : ''}`}
            onClick={() => onCalendarViewChange('month')}
          >
            Month
          </button>
        </div>
      </div>
      <div className="calendar-header-right">
        <button type="button" className="calendar-today-btn" onClick={onToday}>
          Today
        </button>
        <div className="calendar-nav">
          <button type="button" className="calendar-nav-btn" onClick={() => onNavigate('prev')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15,18 9,12 15,6" />
            </svg>
          </button>
          <button type="button" className="calendar-nav-btn" onClick={() => onNavigate('next')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9,18 15,12 9,6" />
            </svg>
          </button>
        </div>
        <button type="button" className="add-event-btn" onClick={onAddEvent}>
          Add Event
        </button>
      </div>
    </div>
  )
}
