'use client'

import type { Task } from '@/lib/utils/dashboard-utils'
import type { List, CalendarEvent, StickyNote, TaskStatus } from './types'
import { getTaskStatus } from './tasks/task-item'

type TaskFormData = {
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  dueDate: string
  category: string
  status: TaskStatus
  subtasks: { id: string; title: string; completed: boolean }[]
  newSubtask: string
}

type EventFormData = {
  title: string
  startTime: string
  endTime: string
  date: string
  color: string
  description: string
}

type StickyFormData = {
  title: string
  content: string
  color: string
}

export interface DashboardModalsProps {
  showListModal: boolean
  setShowListModal: (v: boolean) => void
  newListName: string
  setNewListName: (v: string) => void
  handleAddList: (e: React.FormEvent) => void

  showEventModal: boolean
  setShowEventModal: (v: boolean) => void
  editingEvent: CalendarEvent | null
  setEditingEvent: (v: CalendarEvent | null) => void
  eventFormData: EventFormData
  setEventFormData: React.Dispatch<React.SetStateAction<EventFormData>>
  handleAddEvent: (e: React.FormEvent) => void
  handleUpdateEvent: (e: React.FormEvent) => void

  showStickyModal: boolean
  setShowStickyModal: (v: boolean) => void
  editingSticky: StickyNote | null
  setEditingSticky: (v: StickyNote | null) => void
  stickyFormData: StickyFormData
  setStickyFormData: React.Dispatch<React.SetStateAction<StickyFormData>>
  handleAddSticky: (e: React.FormEvent) => void
  handleUpdateSticky: (e: React.FormEvent) => void

  showTaskModal: boolean
  setShowTaskModal: (v: boolean) => void
  editingTask: Task | null
  setEditingTask: (v: Task | null) => void
  taskFormData: TaskFormData
  setTaskFormData: React.Dispatch<React.SetStateAction<TaskFormData>>
  lists: List[]
  handleCreateTaskFromModal: (e: React.FormEvent) => void
  handleAddSubtask: () => void
  handleRemoveSubtask: (id: string) => void

  taskDetailForModal: Task | null
  closeTaskDetailModal: () => void
  handleUpdateTaskStatus: (taskId: string, s: TaskStatus) => void
  handleToggleSubtask: (taskId: string, subtaskId: string) => void
  handleEditTaskFromClick: (task: Task) => void
  handleDeleteTaskFromClick: (taskId: string) => void
}

export function DashboardModals(p: DashboardModalsProps) {
  return (
    <>
      {p.showListModal && (
        <div className="modal-overlay" onClick={() => p.setShowListModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New List</h2>
              <button type="button" className="modal-close" onClick={() => p.setShowListModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <form onSubmit={p.handleAddList} className="modal-form">
              <div className="form-group">
                <label>List Name</label>
                <input
                  type="text"
                  value={p.newListName}
                  onChange={(e) => p.setNewListName(e.target.value)}
                  placeholder="Enter list name"
                  autoFocus
                />
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => p.setShowListModal(false)} className="btn-cancel">
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Add List
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {p.showEventModal && (
        <div
          className="modal-overlay"
          onClick={() => {
            p.setShowEventModal(false)
            p.setEditingEvent(null)
          }}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{p.editingEvent ? 'Edit Event' : 'Add Event'}</h2>
              <button
                type="button"
                className="modal-close"
                onClick={() => {
                  p.setShowEventModal(false)
                  p.setEditingEvent(null)
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <form onSubmit={p.editingEvent ? p.handleUpdateEvent : p.handleAddEvent} className="modal-form">
              <div className="form-group">
                <label>Event Title *</label>
                <input
                  type="text"
                  value={p.eventFormData.title}
                  onChange={(e) => p.setEventFormData({ ...p.eventFormData, title: e.target.value })}
                  placeholder="Enter event title"
                  autoFocus
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    value={p.eventFormData.date}
                    onChange={(e) => p.setEventFormData({ ...p.eventFormData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Color</label>
                  <input
                    type="color"
                    value={p.eventFormData.color}
                    onChange={(e) => p.setEventFormData({ ...p.eventFormData, color: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Time</label>
                  <input
                    type="time"
                    value={p.eventFormData.startTime}
                    onChange={(e) => p.setEventFormData({ ...p.eventFormData, startTime: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Time</label>
                  <input
                    type="time"
                    value={p.eventFormData.endTime}
                    onChange={(e) => p.setEventFormData({ ...p.eventFormData, endTime: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={p.eventFormData.description}
                  onChange={(e) => p.setEventFormData({ ...p.eventFormData, description: e.target.value })}
                  placeholder="Add event description (optional)"
                  rows={3}
                />
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => {
                    p.setShowEventModal(false)
                    p.setEditingEvent(null)
                  }}
                  className="btn-cancel"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {p.editingEvent ? 'Update Event' : 'Add Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {p.showStickyModal && (
        <div
          className="modal-overlay"
          onClick={() => {
            p.setShowStickyModal(false)
            p.setEditingSticky(null)
          }}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{p.editingSticky ? 'Edit Sticky Note' : 'Add Sticky Note'}</h2>
              <button
                type="button"
                className="modal-close"
                onClick={() => {
                  p.setShowStickyModal(false)
                  p.setEditingSticky(null)
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <form onSubmit={p.editingSticky ? p.handleUpdateSticky : p.handleAddSticky} className="modal-form">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={p.stickyFormData.title}
                  onChange={(e) => p.setStickyFormData({ ...p.stickyFormData, title: e.target.value })}
                  placeholder="Enter sticky note title"
                  autoFocus
                  required
                />
              </div>
              <div className="form-group">
                <label>Content</label>
                <textarea
                  value={p.stickyFormData.content}
                  onChange={(e) => p.setStickyFormData({ ...p.stickyFormData, content: e.target.value })}
                  placeholder="Enter note content (each line will be a bullet point)"
                  rows={6}
                />
              </div>
              <div className="form-group">
                <label>Color</label>
                <div className="color-picker-grid">
                  {['#fef08a', '#bfdbfe', '#fbcfe8', '#fed7aa', '#d1fae5', '#e0e7ff'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`color-option color-option-${color.slice(1)} ${
                        p.stickyFormData.color === color ? 'selected' : ''
                      }`}
                      onClick={() => p.setStickyFormData({ ...p.stickyFormData, color })}
                    />
                  ))}
                </div>
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => {
                    p.setShowStickyModal(false)
                    p.setEditingSticky(null)
                  }}
                  className="btn-cancel"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {p.editingSticky ? 'Update Note' : 'Add Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {p.showTaskModal && (
        <div
          className="modal-overlay"
          onClick={() => {
            p.setShowTaskModal(false)
            p.setEditingTask(null)
          }}
        >
          <div className="modal-content task-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{p.editingTask ? 'Edit Task' : 'Create New Task'}</h2>
              <button
                type="button"
                className="modal-close"
                onClick={() => {
                  p.setShowTaskModal(false)
                  p.setEditingTask(null)
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <form onSubmit={p.handleCreateTaskFromModal} className="modal-form">
              <div className="form-group">
                <label>Task Title *</label>
                <input
                  type="text"
                  value={p.taskFormData.title}
                  onChange={(e) => p.setTaskFormData({ ...p.taskFormData, title: e.target.value })}
                  placeholder="Enter task title"
                  autoFocus
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={p.taskFormData.description}
                  onChange={(e) => p.setTaskFormData({ ...p.taskFormData, description: e.target.value })}
                  placeholder="Enter task description (optional)"
                  rows={4}
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  value={p.taskFormData.category}
                  onChange={(e) => p.setTaskFormData({ ...p.taskFormData, category: e.target.value })}
                >
                  <option value="Uncategorized">Uncategorized</option>
                  {p.lists.map((list) => (
                    <option key={list.id} value={list.name}>
                      {list.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={p.taskFormData.status}
                  onChange={(e) =>
                    p.setTaskFormData({ ...p.taskFormData, status: e.target.value as TaskStatus })
                  }
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Done</option>
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={p.taskFormData.priority}
                    onChange={(e) =>
                      p.setTaskFormData({
                        ...p.taskFormData,
                        priority: e.target.value as 'low' | 'medium' | 'high',
                      })
                    }
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Due Date</label>
                  <input
                    type="date"
                    value={p.taskFormData.dueDate}
                    onChange={(e) => p.setTaskFormData({ ...p.taskFormData, dueDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Subtasks</label>
                <div className="subtasks-container">
                  {p.taskFormData.subtasks.map((subtask) => (
                    <div key={subtask.id} className="subtask-item">
                      <span>{subtask.title}</span>
                      <button
                        type="button"
                        className="subtask-remove-btn"
                        onClick={() => p.handleRemoveSubtask(subtask.id)}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  <div className="subtask-input-group">
                    <input
                      type="text"
                      value={p.taskFormData.newSubtask}
                      onChange={(e) => p.setTaskFormData({ ...p.taskFormData, newSubtask: e.target.value })}
                      placeholder="Add a subtask"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          p.handleAddSubtask()
                        }
                      }}
                    />
                    <button type="button" className="subtask-add-btn" onClick={p.handleAddSubtask}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => {
                    p.setShowTaskModal(false)
                    p.setEditingTask(null)
                  }}
                  className="btn-cancel"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {p.editingTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {p.taskDetailForModal && (
        <div className="modal-overlay" onClick={p.closeTaskDetailModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Task Details</h2>
              <button type="button" className="modal-close" onClick={p.closeTaskDetailModal}>
                Close
              </button>
            </div>
            <div className="modal-form">
              <div className="task-detail-view">
                <div className="task-detail-title">{p.taskDetailForModal.title}</div>
                <div className="task-detail-status-row">
                  <strong>Status:</strong>
                  <select
                    className="task-detail-status-select"
                    value={getTaskStatus(p.taskDetailForModal)}
                    onChange={(e) =>
                      p.handleUpdateTaskStatus(p.taskDetailForModal!.id, e.target.value as TaskStatus)
                    }
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Done</option>
                  </select>
                </div>
                {p.taskDetailForModal.description && (
                  <div className="task-detail-description">
                    <strong>Description:</strong>
                    <p>{p.taskDetailForModal.description}</p>
                  </div>
                )}
                <div className="task-detail-meta">
                  <div className="task-detail-row">
                    {p.taskDetailForModal.priority && (
                      <div className="task-detail-item task-detail-item-inline">
                        <strong>Priority:</strong>
                        <span className={`priority-badge priority-${p.taskDetailForModal.priority}`}>
                          {p.taskDetailForModal.priority.charAt(0).toUpperCase() +
                            p.taskDetailForModal.priority.slice(1)}
                        </span>
                      </div>
                    )}
                    {p.taskDetailForModal.dueDate && (
                      <div className="task-detail-item task-detail-item-inline">
                        <strong>Due Date:</strong>
                        <span>
                          {new Date(p.taskDetailForModal.dueDate).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: '2-digit',
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                  {p.taskDetailForModal.subtasks && p.taskDetailForModal.subtasks.length > 0 && (
                    <div className="task-detail-item task-detail-item-subtasks">
                      <div className="task-detail-subtasks-header">
                        <strong>Subtasks:</strong>
                        <span className="task-detail-subtasks-progress">
                          {p.taskDetailForModal.subtasks.filter((st) => st.completed).length}/
                          {p.taskDetailForModal.subtasks.length} completed
                        </span>
                      </div>
                      <ul className="task-detail-subtasks">
                        {p.taskDetailForModal.subtasks.map((subtask) => (
                          <li key={subtask.id}>
                            <input
                              type="checkbox"
                              checked={subtask.completed}
                              onChange={() =>
                                p.handleToggleSubtask(p.taskDetailForModal!.id, subtask.id)
                              }
                            />
                            <span
                              className={subtask.completed ? 'task-detail-subtask-title-completed' : ''}
                            >
                              {subtask.title}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-edit"
                  onClick={() => {
                    p.handleEditTaskFromClick(p.taskDetailForModal!)
                    p.closeTaskDetailModal()
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Edit
                </button>
                <button
                  type="button"
                  className="btn-delete"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this task?')) {
                      p.handleDeleteTaskFromClick(p.taskDetailForModal!.id)
                      p.closeTaskDetailModal()
                    }
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3,6 5,6 21,6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
