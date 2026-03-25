'use client'

import { useState, useRef } from 'react'
import type { Task } from '@/lib/utils/dashboard-utils'
import type { List, TaskStatus } from '../types'

export function getTaskStatus(task: Task): TaskStatus {
  return task.status ?? (task.completed ? 'completed' : 'pending')
}

export interface TaskItemProps {
  task: Task
  lists: List[]
  onToggleComplete: (taskId: string) => void
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  showDetails?: boolean
  onTaskClick?: (task: Task, e?: React.MouseEvent) => void
  showTaskActions?: string | null
  onEditFromClick?: (task: Task) => void
  onDeleteFromClick?: (taskId: string) => void
  selectionMode?: boolean
  isSelected?: boolean
  onToggleSelection?: (taskId: string) => void
}

export function TaskItem({
  task,
  lists: _lists,
  onToggleComplete,
  onEdit,
  onDelete,
  showDetails = false,
  onTaskClick,
  showTaskActions,
  onEditFromClick,
  onDeleteFromClick,
  selectionMode = false,
  isSelected = false,
  onToggleSelection,
}: TaskItemProps) {
  const [expanded, setExpanded] = useState(false)
  const taskItemRef = useRef<HTMLLIElement>(null)
  const hasDetails =
    task.description || task.dueDate || (task.subtasks && task.subtasks.length > 0) || task.priority
  const shouldShowDetails = showDetails || expanded || hasDetails
  const status = getTaskStatus(task)
  const isCompleted = status === 'completed'

  const handleMainClick = (e: React.MouseEvent) => {
    if (selectionMode && onToggleSelection) {
      e.stopPropagation()
      onToggleSelection(task.id)
    } else if (!selectionMode && onTaskClick) {
      onTaskClick(task, e)
    }
  }

  return (
    <li
      ref={taskItemRef}
      className="task-item"
      data-expanded={expanded}
      data-selected={isSelected}
      data-completed={isCompleted}
    >
      <div
        className={`task-main ${selectionMode || onTaskClick ? 'task-main-clickable' : 'task-main-default'}`}
        onClick={handleMainClick}
      >
        {selectionMode && onToggleSelection ? (
          <div
            className="task-select-checkbox"
            onClick={(e) => {
              e.stopPropagation()
              onToggleSelection(task.id)
            }}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation()
                onToggleSelection(task.id)
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        ) : null}
        <div className="task-content">
          <div className="task-title-row">
            <span
              className="task-title"
              style={isCompleted ? { textDecoration: 'line-through', opacity: 0.7 } : undefined}
            >
              {task.title}
            </span>
            {showTaskActions === task.id && (
              <div className="task-actions-menu" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  className="task-action-btn task-action-edit"
                  onClick={() => onEditFromClick && onEditFromClick(task)}
                  title="Edit task"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Edit
                </button>
                <button
                  type="button"
                  className="task-action-btn task-action-delete"
                  onClick={() => onDeleteFromClick && onDeleteFromClick(task.id)}
                  title="Delete task"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3,6 5,6 21,6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  Delete
                </button>
              </div>
            )}
          </div>
          <div className="task-meta-row">
            {task.priority && (
              <span className={`priority-badge priority-${task.priority}`}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </span>
            )}
            {task.subtasks && task.subtasks.length > 0 && (
              <div className="task-subtask-count">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" />
                  <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
                <span>
                  {task.subtasks.length} Subtask{task.subtasks.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
          {shouldShowDetails && (
            <div className="task-details">
              {task.description && <div className="task-description">{task.description}</div>}
              {task.dueDate && (
                <div className="task-details-row">
                  <div className="task-detail-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span>
                      {new Date(task.dueDate).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </li>
  )
}
