'use client'

import type { CalendarEvent, CalendarViewType } from '../types'
import {
  CALENDAR_HOURS,
  formatDayName,
  getEventHeight,
  getEventTop,
  getEventsForDate,
  getMonthDates,
  getWeekDates,
} from './calendar-utils'

export interface CalendarBodyProps {
  calendarEvents: CalendarEvent[]
  calendarView: CalendarViewType
  currentDate: Date
  onEditEvent: (event: CalendarEvent) => void
  onDeleteEvent: (eventId: string) => void
  onDayClick: (date: Date) => void
  onSwitchToDayView: () => void
  onAddFirstEvent: () => void
}

export function CalendarBody({
  calendarEvents,
  calendarView,
  currentDate,
  onEditEvent,
  onDeleteEvent,
  onDayClick,
  onSwitchToDayView,
  onAddFirstEvent,
}: CalendarBodyProps) {
  const hours = CALENDAR_HOURS
  const currentDayEvents = getEventsForDate(calendarEvents, currentDate)
  const weekDates = calendarView === 'week' ? getWeekDates(new Date(currentDate)) : []
  const monthDates = calendarView === 'month' ? getMonthDates(currentDate) : []

  if (calendarEvents.length === 0) {
    return (
      <div className="calendar-empty categories-empty">
        <div className="categories-empty-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>
        <p className="categories-empty-title">No Events Yet</p>
        <p className="categories-empty-subtitle">
          Schedule your first event to stay on top of your plans.
        </p>
        <button type="button" className="categories-create-btn" onClick={onAddFirstEvent}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Your First Event
        </button>
      </div>
    )
  }

  if (calendarView === 'day') {
    return (
      <div className="calendar-view">
        <div className="calendar-day-label">{formatDayName(currentDate)}</div>
        <div className="calendar-timeline">
          <div className="timeline-hours">
            {hours.map((hour) => (
              <div key={hour} className="timeline-hour">
                <span className="hour-label">
                  {hour === 9
                    ? '09:00 AM'
                    : hour === 12
                      ? '12:00 PM'
                      : hour > 12
                        ? `${hour - 12}:00 PM`
                        : `${hour}:00 AM`}
                </span>
                <div className="hour-line"></div>
              </div>
            ))}
          </div>
          <div className="timeline-events">
            {currentDayEvents.map((event) => {
              const top = getEventTop(event.startTime)
              const height = getEventHeight(event.startTime, event.endTime)
              return (
                <div
                  key={event.id}
                  className="calendar-event"
                  style={{
                    top: `${top}px`,
                    height: `${height}px`,
                    backgroundColor: event.color,
                  }}
                  onClick={() => onEditEvent(event)}
                >
                  <div className="event-title">{event.title}</div>
                  <div className="event-time">
                    {event.startTime} - {event.endTime}
                  </div>
                  <button
                    type="button"
                    className="event-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteEvent(event.id)
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  if (calendarView === 'week') {
    return (
      <div className="calendar-week-view">
        <div className="week-header">
          <div className="week-time-column"></div>
          {weekDates.map((date, idx) => {
            const isToday = date.toDateString() === new Date().toDateString()
            const dayEvents = getEventsForDate(calendarEvents, date)
            return (
              <div
                key={idx}
                className={`week-day-header calendar-day-clickable ${isToday ? 'today' : ''}`}
                onClick={() => {
                  onDayClick(date)
                  onSwitchToDayView()
                }}
              >
                <div className="week-day-name">
                  {date.toLocaleDateString('en-GB', { weekday: 'short' }).toUpperCase()}
                </div>
                <div className="week-day-number">{date.getDate()}</div>
                {dayEvents.length > 0 && <div className="week-day-event-count">{dayEvents.length}</div>}
              </div>
            )
          })}
        </div>
        <div className="week-timeline">
          <div className="week-hours-column">
            {hours.map((hour) => (
              <div key={hour} className="week-hour">
                <span className="week-hour-label">
                  {hour === 9 ? '09:00' : hour === 12 ? '12:00' : hour > 12 ? `${hour - 12}:00` : `${hour}:00`}
                </span>
              </div>
            ))}
          </div>
          {weekDates.map((date, dayIdx) => {
            const dayEvents = getEventsForDate(calendarEvents, date)
            const isToday = date.toDateString() === new Date().toDateString()
            return (
              <div key={dayIdx} className={`week-day-column ${isToday ? 'today' : ''}`}>
                {hours.map((hour) => (
                  <div key={hour} className="week-hour-cell"></div>
                ))}
                {dayEvents.map((event) => {
                  const top = getEventTop(event.startTime)
                  const height = getEventHeight(event.startTime, event.endTime)
                  return (
                    <div
                      key={event.id}
                      className="week-event"
                      style={{
                        top: `${top}px`,
                        height: `${height}px`,
                        backgroundColor: event.color,
                      }}
                      onClick={() => onEditEvent(event)}
                    >
                      <div className="week-event-title">{event.title}</div>
                      <div className="week-event-time">{event.startTime}</div>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="calendar-month-view">
      <div className="month-weekdays">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <div key={day} className="month-weekday">
            {day}
          </div>
        ))}
      </div>
      <div className="month-grid">
        {monthDates.map((date, idx) => {
          if (!date) {
            return <div key={idx} className="month-day empty"></div>
          }
          const isToday = date.toDateString() === new Date().toDateString()
          const dayEvents = getEventsForDate(calendarEvents, date)
          const isCurrentMonth = date.getMonth() === currentDate.getMonth()
          return (
            <div
              key={idx}
              className={`month-day ${isToday ? 'today' : ''} ${!isCurrentMonth ? 'other-month' : ''}`}
              onClick={() => {
                onDayClick(date)
                onSwitchToDayView()
              }}
            >
              <div className="month-day-number">{date.getDate()}</div>
              {dayEvents.length > 0 && (
                <div className="month-day-events">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className="month-event-item"
                      style={{ backgroundColor: event.color }}
                      onClick={(e) => {
                        e.stopPropagation()
                        onEditEvent(event)
                      }}
                      title={event.title}
                    >
                      <span className="month-event-title">{event.title}</span>
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div
                      className="month-event-more"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDayClick(date)
                        onSwitchToDayView()
                      }}
                    >
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
