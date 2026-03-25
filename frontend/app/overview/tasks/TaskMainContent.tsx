'use client'

import type { ReactNode } from 'react'
import type { Task } from '@/lib/utils/dashboard-utils'
import type { List, TaskStatus } from '../types'
import { TaskItem, getTaskStatus } from './task-item'

export interface TaskMainContentProps {
  mode: 'kanban' | 'list'
  tasks: Task[]
  lists: List[]
  selectionMode: boolean
  selectedTasks: Set<string>
  showTaskActions: string | null
  onToggleComplete: (taskId: string) => void
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  onTaskClick: (task: Task, e?: React.MouseEvent) => void
  onEditFromClick: (task: Task) => void
  onDeleteFromClick: (taskId: string) => void
  onToggleSelection: (taskId: string) => void
}

function TaskColumn({
  status,
  label,
  columnTasks,
  icon,
  lists,
  selectionMode,
  selectedTasks,
  showTaskActions,
  onToggleComplete,
  onEdit,
  onDelete,
  onTaskClick,
  onEditFromClick,
  onDeleteFromClick,
  onToggleSelection,
}: {
  status: TaskStatus
  label: string
  columnTasks: Task[]
  icon: ReactNode
} & Omit<TaskMainContentProps, 'mode' | 'tasks'>) {
  return (
    <div className={`task-table-column task-table-column-${status}`}>
      <div className="task-table-column-header">
        {icon}
        <h3 className="task-table-column-title">{label}</h3>
        <span className="task-table-column-count">{columnTasks.length}</span>
      </div>
      <ul className="task-list task-table-column-list">
        {columnTasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            lists={lists}
            onToggleComplete={onToggleComplete}
            onEdit={onEdit}
            onDelete={onDelete}
            showDetails
            onTaskClick={onTaskClick}
            showTaskActions={showTaskActions}
            onEditFromClick={onEditFromClick}
            onDeleteFromClick={onDeleteFromClick}
            selectionMode={selectionMode}
            isSelected={selectedTasks.has(task.id)}
            onToggleSelection={onToggleSelection}
          />
        ))}
      </ul>
    </div>
  )
}

export function TaskMainContent({
  mode,
  tasks,
  lists,
  selectionMode,
  selectedTasks,
  showTaskActions,
  onToggleComplete,
  onEdit,
  onDelete,
  onTaskClick,
  onEditFromClick,
  onDeleteFromClick,
  onToggleSelection,
}: TaskMainContentProps) {
  if (mode === 'kanban') {
    const pendingTasks = tasks.filter((t) => getTaskStatus(t) === 'pending')
    const inProgressTasks = tasks.filter((t) => getTaskStatus(t) === 'in_progress')
    const completedTasks = tasks.filter((t) => getTaskStatus(t) === 'completed')
    const totalTasks = pendingTasks.length + inProgressTasks.length + completedTasks.length

    if (totalTasks === 0) {
      return (
        <div className="empty-state">
          <p>No tasks found. Add a new task to get started!</p>
        </div>
      )
    }

    const colProps = {
      lists,
      selectionMode,
      selectedTasks,
      showTaskActions,
      onToggleComplete,
      onEdit,
      onDelete,
      onTaskClick,
      onEditFromClick,
      onDeleteFromClick,
      onToggleSelection,
    }

    return (
      <div className="task-table">
        <TaskColumn
          status="pending"
          label="Pending"
          columnTasks={pendingTasks}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          }
          {...colProps}
        />
        <TaskColumn
          status="in_progress"
          label="In Progress"
          columnTasks={inProgressTasks}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          }
          {...colProps}
        />
        <TaskColumn
          status="completed"
          label="Completed"
          columnTasks={completedTasks}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          }
          {...colProps}
        />
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <p>No tasks found. Add a new task to get started!</p>
      </div>
    )
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          lists={lists}
          onToggleComplete={onToggleComplete}
          onEdit={onEdit}
          onDelete={onDelete}
          onTaskClick={onTaskClick}
          showTaskActions={showTaskActions}
          onEditFromClick={onEditFromClick}
          onDeleteFromClick={onDeleteFromClick}
          selectionMode={selectionMode}
          isSelected={selectedTasks.has(task.id)}
          onToggleSelection={onToggleSelection}
        />
      ))}
    </ul>
  )
}
