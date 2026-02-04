'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

// =============================================================================
// TYPE DEFINITIONS & INTERFACES
// =============================================================================

type TaskStatus = 'pending' | 'in_progress' | 'completed'

interface Task {
  id: string
  title: string
  description: string
  completed: boolean
  status?: TaskStatus
  priority: 'low' | 'medium' | 'high'
  dueDate: string
  createdAt: string
  category: string
  subtasks?: { id: string; title: string; completed: boolean }[]
}

interface List {
  id: string
  name: string
  color: string
}

interface Tag {
  id: string
  name: string
  color: string
}

interface CalendarEvent {
  id: string
  title: string
  startTime: string // Format: "HH:MM"
  endTime: string // Format: "HH:MM"
  date: string // Format: "YYYY-MM-DD"
  color: string
  description?: string
}

interface StickyNote {
  id: string
  title: string
  content: string
  color: string
  createdAt: string
}

type ViewType = 'overview' | 'categories' | 'upcoming' | 'task' | 'calendar' | 'sticky'
type CalendarViewType = 'day' | 'week' | 'month'

// =============================================================================
// TASK ITEM COMPONENT
// =============================================================================

interface TaskItemProps {
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

function getTaskStatus(task: Task): TaskStatus {
  return task.status ?? (task.completed ? 'completed' : 'pending')
}

function TaskItem({ task, lists, onToggleComplete, onEdit, onDelete, showDetails = false, onTaskClick, showTaskActions, onEditFromClick, onDeleteFromClick, selectionMode = false, isSelected = false, onToggleSelection }: TaskItemProps) {
  const [expanded, setExpanded] = useState(false)
  const taskItemRef = useRef<HTMLLIElement>(null)
  const hasDetails = task.description || task.dueDate || (task.subtasks && task.subtasks.length > 0) || task.priority
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
      <div className="task-main" onClick={handleMainClick} style={{ cursor: selectionMode ? 'pointer' : (onTaskClick ? 'pointer' : 'default') }}>
        {selectionMode && onToggleSelection ? (
          <div className="task-select-checkbox" onClick={(e) => {
            e.stopPropagation()
            onToggleSelection(task.id)
          }}>
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
        ) : (
          <div className="task-complete-checkbox" onClick={(e) => { e.stopPropagation(); onToggleComplete(task.id); }}>
            <input
              type="checkbox"
              checked={isCompleted}
              onChange={() => onToggleComplete(task.id)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
        <div className="task-content">
          <div className="task-title-row">
            <span className="task-title" style={isCompleted ? { textDecoration: 'line-through', opacity: 0.7 } : undefined}>{task.title}</span>
            {showTaskActions === task.id && (
              <div className="task-actions-menu" onClick={(e) => e.stopPropagation()}>
                <button
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
          {shouldShowDetails && (
            <div className="task-details">
              {task.description && (
                <div className="task-description">
                  {task.description}
                </div>
              )}
              <div className="task-details-row">
                {task.priority && (
                  <div className="task-detail-item">
                    <span className={`priority-badge priority-${task.priority}`}>
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </span>
                  </div>
                )}
                {task.dueDate && (
                  <div className="task-detail-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span>{new Date(task.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}</span>
                  </div>
                )}
                {task.subtasks && task.subtasks.length > 0 && (
                  <div className="task-detail-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="8" y1="6" x2="21" y2="6" />
                      <line x1="8" y1="12" x2="21" y2="12" />
                      <line x1="8" y1="18" x2="21" y2="18" />
                      <line x1="3" y1="6" x2="3.01" y2="6" />
                      <line x1="3" y1="12" x2="3.01" y2="12" />
                      <line x1="3" y1="18" x2="3.01" y2="18" />
                    </svg>
                    <span>{task.subtasks.length} Subtask{task.subtasks.length !== 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </li>
  )
}

// =============================================================================
// DASHBOARD PAGE COMPONENT
// =============================================================================

export default function DashboardPage() {
  const router = useRouter()

  // --- State: Core Data ---
  const [tasks, setTasks] = useState<Task[]>([])
  const [lists, setLists] = useState<List[]>([])
  const [tags, setTags] = useState<Tag[]>([
    { id: '1', name: 'Tag 1', color: '#22c55e' },
    { id: '2', name: 'Tag 2', color: '#ef4444' },
  ])
  const [loading, setLoading] = useState(true)
  const [currentView, setCurrentView] = useState<ViewType>('overview')

  // --- State: Filters & Search ---
  const [selectedList, setSelectedList] = useState<string | null>(null)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [categorySearchQuery, setCategorySearchQuery] = useState('')

  // --- State: Quick Add Task Inputs ---
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [todayTaskTitle, setTodayTaskTitle] = useState('')
  const [tomorrowTaskTitle, setTomorrowTaskTitle] = useState('')
  const [thisWeekTaskTitle, setThisWeekTaskTitle] = useState('')

  // --- State: Modals & UI ---
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [showTaskDetails, setShowTaskDetails] = useState<string | null>(null)
  const [showListModal, setShowListModal] = useState(false)
  const [showTagModal, setShowTagModal] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState('#22c55e')
  const [newTaskDueDate, setNewTaskDueDate] = useState('')
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([])
  const [stickyNotes, setStickyNotes] = useState<StickyNote[]>([])
  const [calendarView, setCalendarView] = useState<CalendarViewType>('day')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showEventModal, setShowEventModal] = useState(false)
  const [showStickyModal, setShowStickyModal] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [editingSticky, setEditingSticky] = useState<StickyNote | null>(null)
  const [clickedTask, setClickedTask] = useState<Task | null>(null)
  const [showTaskActions, setShowTaskActions] = useState<string | null>(null)
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set())
  const [selectionMode, setSelectionMode] = useState(false)
  const [showHeaderMenu, setShowHeaderMenu] = useState(false)
  const [showTaskDetailModal, setShowTaskDetailModal] = useState(false)
  const [taskDetailModalTask, setTaskDetailModalTask] = useState<Task | null>(null)
  const [draggedSticky, setDraggedSticky] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 })
  const hasDraggedRef = useRef(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // --- State: Form Data ---
  const [taskFormData, setTaskFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: '',
    category: 'Uncategorized',
    status: 'pending' as TaskStatus,
    subtasks: [] as { id: string; title: string; completed: boolean }[],
    newSubtask: '',
  })
  const [eventFormData, setEventFormData] = useState({
    title: '',
    startTime: '09:00',
    endTime: '10:00',
    date: '',
    color: '#2c5282',
    description: '',
  })
  const [stickyFormData, setStickyFormData] = useState({
    title: '',
    content: '',
    color: '#fef08a',
  })

  // =============================================================================
  // EFFECTS
  // =============================================================================

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    loadTasks()
    loadLists()
    loadTags()
    loadCalendarEvents()
    loadStickyNotes()
  }, [router])

  // Redirect Upcoming view to Overview (Upcoming tab/content removed)
  useEffect(() => {
    if (currentView === 'upcoming') setCurrentView('overview')
    if (currentView === 'today') setCurrentView('task')
  }, [currentView])

  // Close task actions menu when clicking outside
  useEffect(() => {
    if (!showTaskActions) return
    
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element
      // Don't close if clicking on the task item itself or the actions menu
      if (!target.closest('.task-item') && !target.closest('.task-actions-menu')) {
        setShowTaskActions(null)
        setClickedTask(null)
      }
    }
    // Use click instead of mousedown to avoid interfering with task clicks
    document.addEventListener('click', handleClickOutside, true)
    return () => {
      document.removeEventListener('click', handleClickOutside, true)
    }
  }, [showTaskActions])

  // Close header menu when clicking outside
  useEffect(() => {
    if (!showHeaderMenu) return
    
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element
      if (!target.closest('.header-menu-btn') && !target.closest('.header-menu')) {
        setShowHeaderMenu(false)
      }
    }
    document.addEventListener('click', handleClickOutside, true)
    return () => {
      document.removeEventListener('click', handleClickOutside, true)
    }
  }, [showHeaderMenu])

  // Close sidebar when clicking on main content on mobile
  useEffect(() => {
    if (!sidebarOpen) return

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Element
      if (!target.closest('.sidebar') && !target.closest('.mobile-menu-toggle')) {
        setSidebarOpen(false)
      }
    }
    
    document.addEventListener('click', handleClickOutside, true)
    document.addEventListener('touchstart', handleClickOutside, true)
    
    return () => {
      document.removeEventListener('click', handleClickOutside, true)
      document.removeEventListener('touchstart', handleClickOutside, true)
    }
  }, [sidebarOpen])

  useEffect(() => {
    // Update event form date when calendar view or date changes
    if (currentView === 'calendar') {
      setEventFormData(prev => ({
        ...prev,
        date: currentDate.toISOString().split('T')[0],
      }))
    }
  }, [currentView, currentDate])

  // =============================================================================
  // DATA LOADING
  // =============================================================================

  const loadTasks = () => {
    try {
      const storedTasks = localStorage.getItem('tasks')
      if (storedTasks) {
        const parsed = JSON.parse(storedTasks) as Task[]
        const migrated = parsed.map((t) => ({
          ...t,
          status: t.status ?? (t.completed ? 'completed' : 'pending'),
        }))
        setTasks(migrated)
      }
    } catch (err) {
      console.error('Error loading tasks:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadLists = () => {
    try {
      const storedLists = localStorage.getItem('lists')
      if (storedLists) {
        setLists(JSON.parse(storedLists))
      }
    } catch (err) {
      console.error('Error loading lists:', err)
    }
  }

  const loadTags = () => {
    try {
      const storedTags = localStorage.getItem('tags')
      if (storedTags) {
        setTags(JSON.parse(storedTags))
      }
    } catch (err) {
      console.error('Error loading tags:', err)
    }
  }

  const loadCalendarEvents = () => {
    try {
      const storedEvents = localStorage.getItem('calendarEvents')
      if (storedEvents) {
        setCalendarEvents(JSON.parse(storedEvents))
      }
    } catch (err) {
      console.error('Error loading calendar events:', err)
    }
  }

  const loadStickyNotes = () => {
    try {
      const storedNotes = localStorage.getItem('stickyNotes')
      if (storedNotes) {
        const notes = JSON.parse(storedNotes)
        // Reset positions - remove x and y coordinates
        const resetNotes = notes.map((note: StickyNote) => {
          const { x, y, ...rest } = note
          return rest
        })
        setStickyNotes(resetNotes)
        if (resetNotes.length !== notes.length || notes.some((n: StickyNote) => n.x !== undefined || n.y !== undefined)) {
          saveStickyNotes(resetNotes)
        }
      }
    } catch (err) {
      console.error('Error loading sticky notes:', err)
    }
  }

  // =============================================================================
  // DATA SAVING
  // =============================================================================

  const saveTasks = (newTasks: Task[]) => {
    localStorage.setItem('tasks', JSON.stringify(newTasks))
    setTasks(newTasks)
  }

  const saveLists = (newLists: List[]) => {
    localStorage.setItem('lists', JSON.stringify(newLists))
    setLists(newLists)
  }

  const saveTags = (newTags: Tag[]) => {
    localStorage.setItem('tags', JSON.stringify(newTags))
    setTags(newTags)
  }

  const saveCalendarEvents = (newEvents: CalendarEvent[]) => {
    localStorage.setItem('calendarEvents', JSON.stringify(newEvents))
    setCalendarEvents(newEvents)
  }

  const saveStickyNotes = (newNotes: StickyNote[]) => {
    localStorage.setItem('stickyNotes', JSON.stringify(newNotes))
    setStickyNotes(newNotes)
  }

  // =============================================================================
  // AUTH HANDLERS
  // =============================================================================

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  // =============================================================================
  // TASK HANDLERS
  // =============================================================================

  const handleTaskClick = (task: Task, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    // Open task detail modal instead of showing actions menu
    if (!selectionMode) {
      setTaskDetailModalTask(task)
      setShowTaskDetailModal(true)
    }
  }

  const handleEditTaskFromClick = (task: Task) => {
    setEditingTask(task)
    setTaskFormData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      dueDate: task.dueDate || '',
      category: task.category || 'Uncategorized',
      status: getTaskStatus(task),
      subtasks: task.subtasks || [],
      newSubtask: '',
    })
    setShowTaskModal(true)
    setShowTaskActions(null)
    setClickedTask(null)
  }

  const handleDeleteTaskFromClick = (taskId: string) => {
    handleDeleteTask(taskId)
    setShowTaskActions(null)
    setClickedTask(null)
  }

  const handleToggleTaskSelection = (taskId: string) => {
    const newSelected = new Set(selectedTasks)
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId)
    } else {
      newSelected.add(taskId)
    }
    setSelectedTasks(newSelected)
  }

  const handleSelectAllTasks = () => {
    const currentTasks = getFilteredTasks()
    if (selectedTasks.size === currentTasks.length) {
      setSelectedTasks(new Set())
    } else {
      setSelectedTasks(new Set(currentTasks.map(t => t.id)))
    }
  }

  const handleGroupSelectedTasks = () => {
    if (selectedTasks.size < 2) {
      alert('Please select at least 2 tasks to group them.')
      return
    }

    const selectedCount = selectedTasks.size
    const selectedTasksList = tasks.filter(t => selectedTasks.has(t.id))
    const groupedTitle = selectedTasksList.map(t => t.title).join(', ')
    const groupedDescription = selectedTasksList
      .map(t => `- ${t.title}${t.description ? ': ' + t.description : ''}`)
      .join('\n')
    const groupedSubtasks = selectedTasksList.flatMap(t => 
      t.subtasks || []
    )

    // Create new grouped task
    const groupedTask: Task = {
      id: Date.now().toString(),
      title: groupedTitle,
      description: groupedDescription,
      completed: false,
      status: 'pending',
      priority: selectedTasksList[0]?.priority || 'medium',
      dueDate: selectedTasksList[0]?.dueDate || '',
      category: selectedTasksList[0]?.category || 'Uncategorized',
      createdAt: new Date().toISOString(),
      subtasks: groupedSubtasks,
    }

    // Remove selected tasks and add grouped task
    const updatedTasks = tasks.filter(t => !selectedTasks.has(t.id))
    saveTasks([groupedTask, ...updatedTasks])
    
    setSelectedTasks(new Set())
    setSelectionMode(false)
    alert(`Grouped ${selectedCount} tasks into one.`)
  }

  const handleDeleteSelectedTasks = () => {
    if (selectedTasks.size === 0) {
      alert('Please select at least one task to delete.')
      return
    }

    if (confirm(`Are you sure you want to delete ${selectedTasks.size} task(s)?`)) {
      const updatedTasks = tasks.filter(t => !selectedTasks.has(t.id))
      saveTasks(updatedTasks)
      setSelectedTasks(new Set())
      setSelectionMode(false)
    }
  }

  const handleExitSelectionMode = () => {
    setSelectionMode(false)
    setSelectedTasks(new Set())
  }

  // --- Task CRUD ---
  const handleAddTask = (e: React.FormEvent, dueDate?: string) => {
    e.preventDefault()
    // Open task creation modal instead of directly creating
    setTaskFormData({
      title: newTaskTitle.trim(),
      description: '',
      priority: 'medium',
      dueDate: dueDate || newTaskDueDate || '',
      category: selectedList || lists[0]?.name || 'Uncategorized',
      subtasks: [],
      newSubtask: '',
    })
    setNewTaskTitle('')
    setNewTaskDueDate('')
    setShowTaskModal(true)
  }

  const handleCreateTaskFromModal = (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskFormData.title.trim()) return

    const taskStatus = taskFormData.status || 'pending'
    const taskCompleted = taskStatus === 'completed'

    if (editingTask) {
      // Update existing task
      const updatedTasks = tasks.map((task) =>
        task.id === editingTask.id
          ? {
              ...task,
              title: taskFormData.title.trim(),
              description: taskFormData.description.trim(),
              priority: taskFormData.priority,
              dueDate: taskFormData.dueDate || '',
              category: taskFormData.category,
              status: taskStatus,
              completed: taskCompleted,
              subtasks: taskFormData.subtasks,
            }
          : task
      )
      saveTasks(updatedTasks)
      setEditingTask(null)
    } else {
      // Create new task
      const newTask: Task = {
        id: Date.now().toString(),
        title: taskFormData.title.trim(),
        description: taskFormData.description.trim(),
        completed: taskCompleted,
        status: taskStatus,
        priority: taskFormData.priority,
        dueDate: taskFormData.dueDate || '',
        category: taskFormData.category,
        createdAt: new Date().toISOString(),
        subtasks: taskFormData.subtasks,
      }
      saveTasks([newTask, ...tasks])
    }

    // Clear all input fields
    setNewTaskTitle('')
    setNewTaskDueDate('')
    setTodayTaskTitle('')
    setTomorrowTaskTitle('')
    setThisWeekTaskTitle('')
    setTaskFormData({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
      category: 'Uncategorized',
      status: 'pending',
      subtasks: [],
      newSubtask: '',
    })
    setShowTaskModal(false)
  }

  // --- Subtask Handlers ---
  const handleAddSubtask = () => {
    if (!taskFormData.newSubtask.trim()) return
    const newSubtask = {
      id: Date.now().toString(),
      title: taskFormData.newSubtask.trim(),
      completed: false,
    }
    setTaskFormData({
      ...taskFormData,
      subtasks: [...taskFormData.subtasks, newSubtask],
      newSubtask: '',
    })
  }

  const handleRemoveSubtask = (subtaskId: string) => {
    setTaskFormData({
      ...taskFormData,
      subtasks: taskFormData.subtasks.filter((st) => st.id !== subtaskId),
    })
  }

  const handleAddTaskToToday = (e: React.FormEvent) => {
    e.preventDefault()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    setTaskFormData({
      title: todayTaskTitle.trim(),
      description: '',
      priority: 'medium',
      dueDate: today.toISOString().split('T')[0],
      category: selectedList || lists[0]?.name || 'Uncategorized',
      status: 'pending',
      subtasks: [],
      newSubtask: '',
    })
    setTodayTaskTitle('')
    setShowTaskModal(true)
  }

  const handleAddTaskToTomorrow = (e: React.FormEvent) => {
    e.preventDefault()
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    setTaskFormData({
      title: tomorrowTaskTitle.trim(),
      description: '',
      priority: 'medium',
      dueDate: tomorrow.toISOString().split('T')[0],
      category: selectedList || lists[0]?.name || 'Uncategorized',
      status: 'pending',
      subtasks: [],
      newSubtask: '',
    })
    setTomorrowTaskTitle('')
    setShowTaskModal(true)
  }

  const handleAddTaskToThisWeek = (e: React.FormEvent) => {
    e.preventDefault()
    const thisWeek = new Date()
    thisWeek.setDate(thisWeek.getDate() + 3)
    thisWeek.setHours(0, 0, 0, 0)
    setTaskFormData({
      title: thisWeekTaskTitle.trim(),
      description: '',
      priority: 'medium',
      dueDate: thisWeek.toISOString().split('T')[0],
      category: selectedList || lists[0]?.name || 'Uncategorized',
      status: 'pending',
      subtasks: [],
      newSubtask: '',
    })
    setThisWeekTaskTitle('')
    setShowTaskModal(true)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setNewTaskTitle(task.title)
    setShowTaskDetails(task.id)
  }

  const handleUpdateTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTask || !newTaskTitle.trim()) return

    const updatedTasks = tasks.map((task) =>
      task.id === editingTask.id
        ? { ...task, title: newTaskTitle }
        : task
    )
    saveTasks(updatedTasks)
    setEditingTask(null)
    setNewTaskTitle('')
    setShowTaskDetails(null)
  }

  const handleToggleComplete = (taskId: string) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id !== taskId) return task
      const newCompleted = !task.completed
      return { ...task, completed: newCompleted, status: (newCompleted ? 'completed' : 'pending') as TaskStatus }
    })
    saveTasks(updatedTasks)
  }

  const handleUpdateTaskStatus = useCallback((taskId: string, newStatus: TaskStatus) => {
    setTasks((prevTasks) => {
      const updatedTasks = prevTasks.map((task) =>
        task.id === taskId
          ? { ...task, status: newStatus, completed: newStatus === 'completed' }
          : task
      )
      localStorage.setItem('tasks', JSON.stringify(updatedTasks))
      return updatedTasks
    })
  }, [])

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id !== taskId || !task.subtasks) return task
      const updatedSubtasks = task.subtasks.map((st) =>
        st.id === subtaskId ? { ...st, completed: !st.completed } : st
      )
      const completedCount = updatedSubtasks.filter((st) => st.completed).length
      const allSubtasksDone = updatedSubtasks.length > 0 && updatedSubtasks.every((st) => st.completed)
      let newStatus: TaskStatus = task.status as TaskStatus
      if (allSubtasksDone) {
        newStatus = 'completed'
      } else if (completedCount > 0) {
        newStatus = 'in_progress'
      } else {
        newStatus = 'pending'
      }
      return {
        ...task,
        subtasks: updatedSubtasks,
        completed: allSubtasksDone,
        status: newStatus,
      }
    })
    saveTasks(updatedTasks)
  }

  const handleDeleteTask = (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      const updatedTasks = tasks.filter((task) => task.id !== taskId)
      saveTasks(updatedTasks)
    }
  }

  const handleAddList = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newListName.trim()) return

    const newList: List = {
      id: Date.now().toString(),
      name: newListName,
      color: '#2c5282',
    }

    saveLists([...lists, newList])
    setNewListName('')
    setShowListModal(false)
  }

  const handleDeleteList = (listId: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      const listToDelete = lists.find(l => l.id === listId)
      const updatedLists = lists.filter((list) => list.id !== listId)
      saveLists(updatedLists)

      if (listToDelete) {
        const defaultCategory = updatedLists[0]?.name || 'Uncategorized'
        const updatedTasks = tasks.map((task) =>
          task.category === listToDelete.name ? { ...task, category: defaultCategory } : task
        )
        saveTasks(updatedTasks)
      }

      if (selectedList === listToDelete?.name) {
        setSelectedList(null)
      }
    }
  }

  // =============================================================================
  // TAG HANDLERS
  // =============================================================================

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTagName.trim()) return

    const newTag: Tag = {
      id: Date.now().toString(),
      name: newTagName,
      color: newTagColor,
    }

    saveTags([...tags, newTag])
    setNewTagName('')
    setNewTagColor('#22c55e')
    setShowTagModal(false)
  }

  const handleDeleteTag = (tagId: string) => {
    if (confirm('Are you sure you want to delete this tag?')) {
      const updatedTags = tags.filter((tag) => tag.id !== tagId)
      saveTags(updatedTags)

      if (selectedTag === tags.find(t => t.id === tagId)?.name) {
        setSelectedTag(null)
      }
    }
  }

  // =============================================================================
  // CALENDAR EVENT HANDLERS
  // =============================================================================

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault()
    if (!eventFormData.title.trim()) return

    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      title: eventFormData.title,
      startTime: eventFormData.startTime,
      endTime: eventFormData.endTime,
      date: eventFormData.date || currentDate.toISOString().split('T')[0],
      color: eventFormData.color,
      description: eventFormData.description,
    }

    saveCalendarEvents([...calendarEvents, newEvent])
    setEventFormData({
      title: '',
      startTime: '09:00',
      endTime: '10:00',
      date: currentDate.toISOString().split('T')[0],
      color: '#2c5282',
      description: '',
    })
    setShowEventModal(false)
  }

  const handleUpdateEvent = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingEvent || !eventFormData.title.trim()) return

    const updatedEvents = calendarEvents.map((event) =>
      event.id === editingEvent.id
        ? {
            ...event,
            title: eventFormData.title,
            startTime: eventFormData.startTime,
            endTime: eventFormData.endTime,
            date: eventFormData.date,
            color: eventFormData.color,
            description: eventFormData.description,
          }
        : event
    )
    saveCalendarEvents(updatedEvents)
    setEditingEvent(null)
    setEventFormData({
      title: '',
      startTime: '09:00',
      endTime: '10:00',
      date: currentDate.toISOString().split('T')[0],
      color: '#2c5282',
      description: '',
    })
    setShowEventModal(false)
  }

  const handleDeleteEvent = (eventId: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      const updatedEvents = calendarEvents.filter((event) => event.id !== eventId)
      saveCalendarEvents(updatedEvents)
    }
  }

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event)
    setEventFormData({
      title: event.title,
      startTime: event.startTime,
      endTime: event.endTime,
      date: event.date,
      color: event.color,
      description: event.description || '',
    })
    setShowEventModal(true)
  }

  const handleCalendarDateChange = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (calendarView === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1))
    } else if (calendarView === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
    }
    setCurrentDate(newDate)
  }

  // =============================================================================
  // STICKY NOTE HANDLERS
  // =============================================================================

  const handleAddSticky = (e: React.FormEvent) => {
    e.preventDefault()
    if (!stickyFormData.title.trim()) return

    const newSticky: StickyNote = {
      id: Date.now().toString(),
      title: stickyFormData.title,
      content: stickyFormData.content,
      color: stickyFormData.color,
      createdAt: new Date().toISOString(),
    }

    saveStickyNotes([...stickyNotes, newSticky])
    setStickyFormData({
      title: '',
      content: '',
      color: '#fef08a',
    })
    setShowStickyModal(false)
  }

  const handleUpdateSticky = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSticky || !stickyFormData.title.trim()) return

    const updatedNotes = stickyNotes.map((note) =>
      note.id === editingSticky.id
        ? {
            ...note,
            title: stickyFormData.title,
            content: stickyFormData.content,
            color: stickyFormData.color,
          }
        : note
    )
    saveStickyNotes(updatedNotes)
    setEditingSticky(null)
    setStickyFormData({
      title: '',
      content: '',
      color: '#fef08a',
    })
    setShowStickyModal(false)
  }

  const handleDeleteSticky = (stickyId: string) => {
    if (confirm('Are you sure you want to delete this sticky note?')) {
      const updatedNotes = stickyNotes.filter((note) => note.id !== stickyId)
      saveStickyNotes(updatedNotes)
    }
  }

  const handleEditSticky = (sticky: StickyNote) => {
    setEditingSticky(sticky)
    setStickyFormData({
      title: sticky.title,
      content: sticky.content,
      color: sticky.color,
    })
    setShowStickyModal(true)
  }

  // Grid size for snapping (280px card width + 24px gap = 304px)
  const GRID_SIZE = 304
  const GRID_GAP = 24

  const handleStickyMouseDown = (e: React.MouseEvent, noteId: string) => {
    e.preventDefault()
    e.stopPropagation()
    const card = e.currentTarget as HTMLElement
    const rect = card.getBoundingClientRect()
    setDragStartPos({ x: e.clientX, y: e.clientY })
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
    setDraggedSticky(noteId)
    hasDraggedRef.current = false
  }

  const handleStickyMouseMove = (e: React.MouseEvent) => {
    if (!draggedSticky) return
    e.preventDefault()
    
    const stickyWall = (e.currentTarget as HTMLElement).closest('.sticky-wall')
    if (!stickyWall) return
    
    const wallRect = stickyWall.getBoundingClientRect()
    const newX = e.clientX - wallRect.left - dragOffset.x
    const newY = e.clientY - wallRect.top - dragOffset.y
    
    const updatedNotes = stickyNotes.map((note) =>
      note.id === draggedSticky
        ? { ...note, x: Math.max(0, newX), y: Math.max(0, newY) }
        : note
    )
    setStickyNotes(updatedNotes)
  }

  const handleStickyMouseUp = () => {
    if (draggedSticky) {
      saveStickyNotes(stickyNotes)
      setDraggedSticky(null)
      setDragOffset({ x: 0, y: 0 })
    }
  }

  useEffect(() => {
    if (draggedSticky) {
      let dragElement: HTMLElement | null = null
      
      const handleMouseMove = (e: MouseEvent) => {
        // Check if mouse has moved significantly (more than 5px)
        const moveDistance = Math.sqrt(
          Math.pow(e.clientX - dragStartPos.x, 2) + Math.pow(e.clientY - dragStartPos.y, 2)
        )
        if (moveDistance > 5) {
          hasDraggedRef.current = true
        }

        if (!dragElement) {
          dragElement = document.querySelector(`[data-note-id="${draggedSticky}"]`) as HTMLElement
        }
        
        if (dragElement) {
          const stickyGrid = document.querySelector('.sticky-grid')
          if (!stickyGrid) return
          
          const gridRect = stickyGrid.getBoundingClientRect()
          const relativeX = e.clientX - gridRect.left
          const relativeY = e.clientY - gridRect.top
          
          // Calculate grid cell
          const gridCols = Math.floor((gridRect.width + GRID_GAP) / GRID_SIZE)
          const colIndex = Math.max(0, Math.min(Math.floor(relativeX / GRID_SIZE), gridCols - 1))
          const rowIndex = Math.max(0, Math.floor(relativeY / GRID_SIZE))
          const targetIndex = rowIndex * gridCols + colIndex
          
          // Reorder notes
          setStickyNotes((prevNotes) => {
            const draggedNote = prevNotes.find(n => n.id === draggedSticky)
            if (!draggedNote) return prevNotes
            
            const otherNotes = prevNotes.filter(n => n.id !== draggedSticky)
            const newOrder = [...otherNotes]
            const insertIndex = Math.min(targetIndex, newOrder.length)
            newOrder.splice(insertIndex, 0, draggedNote)
            
            return newOrder
          })
        }
      }

      const handleMouseUp = (e: MouseEvent) => {
        const wasDragged = hasDraggedRef.current
        
        if (wasDragged) {
          e.preventDefault()
          e.stopPropagation()
          setStickyNotes((prevNotes) => {
            saveStickyNotes(prevNotes)
            return prevNotes
          })
        }
        
        setDraggedSticky(null)
        setDragOffset({ x: 0, y: 0 })
        hasDraggedRef.current = false
        dragElement = null
      }

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [draggedSticky, dragStartPos])

  // =============================================================================
  // UTILITY FUNCTIONS
  // =============================================================================

  const getFilteredTasks = () => {
    let filtered = [...tasks]

    // Filter by view - Task tab shows all tasks (no date filter)
    if (currentView === 'upcoming') {
      // Upcoming view uses getTasksByTimePeriod, so we don't filter here
      // Just apply other filters
      filtered = filtered.filter((task) => getTaskStatus(task) !== 'completed')
    }

    // Filter by list
    if (selectedList) {
      filtered = filtered.filter((task) => task.category === selectedList)
    }

    // Filter by tag
    if (selectedTag) {
      filtered = filtered.filter((task) => task.category === selectedTag)
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered
  }

  const getTaskCountForList = (listName: string) => {
    return tasks.filter((task) => task.category === listName && getTaskStatus(task) !== 'completed').length
  }

  const getTaskCountForTag = (tagName: string) => {
    return tasks.filter((task) => task.category === tagName && getTaskStatus(task) !== 'completed').length
  }

  const getTasksByTimePeriod = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const thisWeekEnd = new Date(today)
    thisWeekEnd.setDate(thisWeekEnd.getDate() + 7)

    let allTasks = tasks.filter((task) => getTaskStatus(task) !== 'completed')

    // Apply filters
    if (selectedList) {
      allTasks = allTasks.filter((task) => task.category === selectedList)
    }
    if (selectedTag) {
      allTasks = allTasks.filter((task) => task.category === selectedTag)
    }
    if (searchQuery) {
      allTasks = allTasks.filter(
        (task) =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Tomorrow tasks: only tasks with dueDate = tomorrow
    const tomorrowTasks = allTasks.filter((task) => {
      if (!task.dueDate) return false
      const taskDate = new Date(task.dueDate)
      taskDate.setHours(0, 0, 0, 0)
      return taskDate.getTime() === tomorrow.getTime()
    })

    // This Week tasks: tasks with dueDate between day after tomorrow and 7 days from today
    const thisWeekTasks = allTasks.filter((task) => {
      if (!task.dueDate) return false
      const taskDate = new Date(task.dueDate)
      taskDate.setHours(0, 0, 0, 0)
      const dayAfterTomorrow = new Date(tomorrow)
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1)
      return taskDate >= dayAfterTomorrow && taskDate <= thisWeekEnd
    })

    return { tomorrowTasks, thisWeekTasks }
  }

  const filteredTasks = getFilteredTasks()
  const filteredCategoriesForPage = categorySearchQuery.trim()
    ? lists.filter((list) => list.name.toLowerCase().includes(categorySearchQuery.trim().toLowerCase()))
    : lists
  const upcomingCount = tasks.filter((task) => {
    if (getTaskStatus(task) === 'completed') return false
    if (!task.dueDate) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const taskDate = new Date(task.dueDate)
    taskDate.setHours(0, 0, 0, 0)
    // Count tasks that are tomorrow or later (not today)
    return taskDate > today
  }).length
  
  const taskCount = tasks.filter((task) => getTaskStatus(task) !== 'completed').length

  const { tomorrowTasks, thisWeekTasks } = getTasksByTimePeriod()

  // Calendar helpers
  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    const events = calendarEvents.filter((event) => event.date === dateStr)
    // Sort by start time
    return events.sort((a, b) => {
      const timeA = getTimePosition(a.startTime)
      const timeB = getTimePosition(b.startTime)
      return timeA - timeB
    })
  }

  const getTimePosition = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number)
    return (hours * 60 + minutes) / 60 // Convert to hours for positioning
  }

  const getEventHeight = (startTime: string, endTime: string) => {
    const start = getTimePosition(startTime)
    const end = getTimePosition(endTime)
    return Math.max((end - start) * 60, 40) // Minimum 40px height
  }

  const getEventTop = (startTime: string) => {
    const start = getTimePosition(startTime)
    return (start - 9) * 60 // Start from 9 AM
  }

  const currentDayEvents = getEventsForDate(currentDate)
  const hours = Array.from({ length: 12 }, (_, i) => i + 9) // 9 AM to 8 PM

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const formatDayName = (date: Date) => {
    return date.toLocaleDateString('en-GB', { weekday: 'long' }).toUpperCase()
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const pendingCount = tasks.filter((t) => getTaskStatus(t) === 'pending').length
  const inProgressTasks = tasks.filter((t) => getTaskStatus(t) === 'in_progress')
  const inProgressCount = inProgressTasks.length

  const getTaskCompletionFraction = (task: Task): number => {
    if (task.completed || getTaskStatus(task) === 'completed') return 1
    if (!task.subtasks || task.subtasks.length === 0) return 0
    const completed = task.subtasks.filter((st) => st.completed).length
    return completed / task.subtasks.length
  }

  const completionRate = tasks.length
    ? Math.round((tasks.reduce((sum, t) => sum + getTaskCompletionFraction(t), 0) / tasks.length) * 100)
    : 0

  const inProgressCompletionRate =
    inProgressCount > 0
      ? Math.round(
          (inProgressTasks.reduce((sum, t) => sum + getTaskCompletionFraction(t), 0) / inProgressCount) * 100
        )
      : null
  const recentTasks = [...tasks].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)

  // Get week dates (Monday to Sunday)
  const getWeekDates = (date: Date) => {
    const weekDates: Date[] = []
    const dateCopy = new Date(date)
    const day = dateCopy.getDay()
    const diff = dateCopy.getDate() - day + (day === 0 ? -6 : 1) // Adjust to Monday
    const monday = new Date(dateCopy.setDate(diff))
    
    for (let i = 0; i < 7; i++) {
      const weekDate = new Date(monday)
      weekDate.setDate(monday.getDate() + i)
      weekDates.push(weekDate)
    }
    return weekDates
  }

  // Get month dates
  const getMonthDates = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    
    // Get the first day of the week (0 = Sunday, 1 = Monday, etc.)
    const startDay = firstDay.getDay()
    const adjustedStartDay = startDay === 0 ? 6 : startDay - 1 // Convert to Monday = 0
    
    const monthDates: (Date | null)[] = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < adjustedStartDay; i++) {
      monthDates.push(null)
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      monthDates.push(new Date(year, month, day))
    }
    
    return monthDates
  }

  // Format week range for display
  const formatWeekRange = (date: Date) => {
    const weekDates = getWeekDates(new Date(date))
    const start = weekDates[0]
    const end = weekDates[6]
    const startStr = start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    const endStr = end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    return `${startStr} - ${endStr}`
  }

  // Format month and year for display
  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
  }

  const weekDates = calendarView === 'week' ? getWeekDates(new Date(currentDate)) : []
  const monthDates = calendarView === 'month' ? getMonthDates(currentDate) : []

  const user = typeof window !== 'undefined' ? localStorage.getItem('user') : null
  const userData = user ? JSON.parse(user) : null

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <div className="dashboard-layout">
      {/* Sidebar toggle: always visible at all resolutions - opens sidebar pop-up */}
      <button
        className="mobile-menu-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle menu"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {sidebarOpen ? (
            <>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </>
          ) : (
            <>
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </>
          )}
        </svg>
      </button>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="mobile-overlay" onClick={() => setSidebarOpen(false)} onTouchStart={() => setSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <button
          className="sidebar-add-task-button"
          onClick={() => {
            setTaskFormData({
              title: '',
              description: '',
              priority: 'medium',
              dueDate: '',
              category: selectedList || lists[0]?.name || 'Uncategorized',
              status: 'pending',
              subtasks: [],
              newSubtask: '',
            })
            setShowTaskModal(true)
            setSidebarOpen(false)
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Add New Task</span>
        </button>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <h3 className="nav-section-title">TASKS</h3>
            <ul className="nav-list">
              <li>
                <button
                  className={`nav-item ${currentView === 'overview' ? 'active' : ''}`}
                  onClick={() => {
                    setCurrentView('overview')
                    setSelectedList(null)
                    setSelectedTag(null)
                    setSidebarOpen(false)
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                  <span>Overview</span>
                </button>
              </li>
              <li>
                <button
                  className={`nav-item ${currentView === 'categories' ? 'active' : ''}`}
                  onClick={() => {
                    setCurrentView('categories')
                    setSelectedList(null)
                    setSelectedTag(null)
                    setSidebarOpen(false)
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                    <line x1="12" y1="11" x2="12" y2="17" />
                    <line x1="9" y1="14" x2="15" y2="14" />
                  </svg>
                  <span>Categories</span>
                  <span className="nav-count">{lists.length}</span>
                </button>
              </li>
              <li>
                <button
                  className={`nav-item ${currentView === 'task' ? 'active' : ''}`}
                  onClick={() => {
                    setCurrentView('task')
                    setSelectedList(null)
                    setSelectedTag(null)
                    setSidebarOpen(false)
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="8" y1="6" x2="21" y2="6" />
                    <line x1="8" y1="12" x2="21" y2="12" />
                    <line x1="8" y1="18" x2="21" y2="18" />
                    <line x1="3" y1="6" x2="3.01" y2="6" />
                    <line x1="3" y1="12" x2="3.01" y2="12" />
                    <line x1="3" y1="18" x2="3.01" y2="18" />
                  </svg>
                  <span>Task</span>
                  <span className="nav-count">{taskCount}</span>
                </button>
              </li>
              <li>
                <button
                  className={`nav-item ${currentView === 'calendar' ? 'active' : ''}`}
                  onClick={() => {
                    setCurrentView('calendar')
                    setSidebarOpen(false)
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span>Calendar</span>
                  <span className="nav-count">{calendarEvents.length}</span>
                </button>
              </li>
              <li>
                <button
                  className={`nav-item ${currentView === 'sticky' ? 'active' : ''}`}
                  onClick={() => {
                    setCurrentView('sticky')
                    setSidebarOpen(false)
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14,2 14,8 20,8" />
                  </svg>
                  <span>Sticky Wall</span>
                  <span className="nav-count">{stickyNotes.length}</span>
                </button>
              </li>
            </ul>
          </div>
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-footer-item" onClick={handleLogout}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16,17 21,12 16,7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="app-header">
          <button type="button" className="app-header-title-btn" onClick={() => { setCurrentView('overview'); setSidebarOpen(false); }} aria-label="Go to overview">
            <h1 className="app-header-title">TaskFlow</h1>
          </button>
        </header>

        {currentView === 'overview' ? (
          <div className="overview-page">
            <section className="overview-greeting">
              <div className="overview-greeting-text">
                <h2 className="overview-greeting-title">{getGreeting()}, {userData?.username || 'User'}! 👋</h2>
                <p className="overview-greeting-subtitle">Ready to start your productivity journey?</p>
              </div>
              <div className="overview-greeting-actions">
                <div className="overview-search">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button type="button" className="overview-btn overview-btn-primary" onClick={() => { setTaskFormData({ title: '', description: '', priority: 'medium', dueDate: '', category: selectedList || lists[0]?.name || 'Uncategorized', status: 'pending', subtasks: [], newSubtask: '' }); setShowTaskModal(true); }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  Create Task
                </button>
              </div>
            </section>

            <section className="overview-stats">
              <div className="overview-stat-card">
                <div className="overview-stat-icon overview-stat-icon-folder"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg></div>
                <span className="overview-stat-label">Categories</span>
                <span className="overview-stat-value">{lists.length}</span>
              </div>
              <div className="overview-stat-card">
                <div className="overview-stat-icon overview-stat-icon-list"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg></div>
                <span className="overview-stat-label">Total Tasks</span>
                <span className="overview-stat-value">{tasks.length}</span>
              </div>
              <div className="overview-stat-card">
                <div className="overview-stat-icon overview-stat-icon-pending"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg></div>
                <span className="overview-stat-label">Pending</span>
                <span className="overview-stat-value">{pendingCount}</span>
              </div>
              <div className="overview-stat-card">
                <div className="overview-stat-icon overview-stat-icon-progress"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg></div>
                <span className="overview-stat-label">In Progress</span>
                <span className="overview-stat-value">
                  {inProgressCount > 0 ? (
                    <>{inProgressCompletionRate}% <span className="overview-stat-sublabel">({inProgressCount} tasks)</span></>
                  ) : (
                    '—'
                  )}
                </span>
              </div>
              <div className="overview-stat-card">
                <div className="overview-stat-icon overview-stat-icon-rate"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg></div>
                <span className="overview-stat-label">Completion Rate</span>
                <span className="overview-stat-value">{completionRate}%</span>
              </div>
            </section>

            <section className="overview-sticky">
              <div className="overview-sticky-header">
                <h3 className="overview-sticky-title">Sticky Notes</h3>
                <span className="overview-sticky-count">{stickyNotes.length} notes</span>
              </div>
              <div className="overview-sticky-controls">
                <button type="button" className="overview-sticky-control-btn" title="Grid view"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg></button>
                <button type="button" className="overview-sticky-control-btn" title="List view"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg></button>
                <button type="button" className="overview-sticky-control-btn" title="Filter"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg></button>
                <select className="overview-sticky-sort" defaultValue="newest"><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select>
              </div>
              <div className="overview-sticky-add-row">
                <button
                  type="button"
                  className="overview-sticky-add-btn"
                  onClick={() => {
                    setEditingSticky(null)
                    setStickyFormData({ title: '', content: '', color: '#fef08a' })
                    setShowStickyModal(true)
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  Add note
                </button>
              </div>
              {stickyNotes.length === 0 ? (
                <div className="overview-sticky-empty">
                  <div className="overview-sticky-empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14,2 14,8 20,8" /></svg></div>
                  <p className="overview-sticky-empty-title">No sticky notes yet</p>
                  <p className="overview-sticky-empty-subtitle">Add your first reminder note to get started!</p>
                </div>
              ) : (
                <div className="overview-sticky-list">
                  {stickyNotes.slice(0, 5).map((note) => (
                    <div key={note.id} className="overview-sticky-preview" style={{ backgroundColor: note.color }} onClick={() => { setEditingSticky(note); setStickyFormData({ title: note.title, content: note.content, color: note.color }); setShowStickyModal(true); }}>
                      <button
                        type="button"
                        className="overview-sticky-preview-close"
                        title="Delete note"
                        onClick={(e) => { e.stopPropagation(); handleDeleteSticky(note.id); }}
                        aria-label="Delete note"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                      </button>
                      <span className="overview-sticky-preview-title">{note.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="overview-recent">
              <div className="overview-recent-card">
                <div className="overview-recent-card-header">
                  <h3 className="overview-recent-card-title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg> Recent Categories</h3>
                  <button type="button" className="overview-recent-link" onClick={() => { setCurrentView('categories'); setSidebarOpen(false); }}>View All →</button>
                </div>
                <ul className="overview-recent-list">
                  {lists.slice(0, 5).map((list) => (
                    <li key={list.id} className="overview-recent-item">{list.name}</li>
                  ))}
                  {lists.length === 0 && <li className="overview-recent-item overview-recent-empty">No categories yet</li>}
                </ul>
              </div>
              <div className="overview-recent-card">
                <div className="overview-recent-card-header">
                  <h3 className="overview-recent-card-title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg> Recent Tasks</h3>
                  <button type="button" className="overview-recent-link" onClick={() => { setCurrentView('task'); setSidebarOpen(false); }}>View All →</button>
                </div>
                <ul className="overview-recent-list">
                  {recentTasks.map((task) => (
                    <li key={task.id} className="overview-recent-item">{task.title}</li>
                  ))}
                  {recentTasks.length === 0 && <li className="overview-recent-item overview-recent-empty">No tasks yet</li>}
                </ul>
              </div>
            </section>
          </div>
        ) : (
          <>
            {currentView === 'calendar' ? (
          <div className="calendar-header">
            <div className="calendar-header-left">
              <h1 className="calendar-date">
                {calendarView === 'day' ? formatDate(currentDate) : 
                 calendarView === 'week' ? formatWeekRange(currentDate) : 
                 formatMonthYear(currentDate)}
              </h1>
              <div className="calendar-tabs">
                <button
                  className={`calendar-tab ${calendarView === 'day' ? 'active' : ''}`}
                  onClick={() => setCalendarView('day')}
                >
                  Day
                </button>
                <button
                  className={`calendar-tab ${calendarView === 'week' ? 'active' : ''}`}
                  onClick={() => setCalendarView('week')}
                >
                  Week
                </button>
                <button
                  className={`calendar-tab ${calendarView === 'month' ? 'active' : ''}`}
                  onClick={() => setCalendarView('month')}
                >
                  Month
                </button>
              </div>
            </div>
            <div className="calendar-header-right">
              <button
                className="calendar-today-btn"
                onClick={() => setCurrentDate(new Date())}
              >
                Today
              </button>
              <div className="calendar-nav">
                <button className="calendar-nav-btn" onClick={() => handleCalendarDateChange('prev')}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15,18 9,12 15,6" />
                  </svg>
                </button>
                <button className="calendar-nav-btn" onClick={() => handleCalendarDateChange('next')}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9,18 15,12 9,6" />
                  </svg>
                </button>
              </div>
              <button className="add-event-btn" onClick={() => {
                const today = new Date(currentDate)
                setEventFormData({
                  title: '',
                  startTime: '09:00',
                  endTime: '10:00',
                  date: today.toISOString().split('T')[0],
                  color: '#2c5282',
                  description: '',
                })
                setEditingEvent(null)
                setShowEventModal(true)
              }}>
                Add Event
              </button>
            </div>
          </div>
        ) : currentView === 'sticky' ? (
          <div className="content-header">
            <h1 className="content-title sticky-wall-title">Sticky Wall</h1>
          </div>
        ) : currentView === 'categories' ? (
          <div className="categories-page">
            <div className="categories-page-header">
              <h1 className="categories-page-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /><line x1="12" y1="11" x2="12" y2="17" /><line x1="9" y1="14" x2="15" y2="14" /></svg>
                My Categories
              </h1>
              <p className="categories-page-subtitle">Organize your tasks into meaningful categories</p>
            </div>
            <section className="categories-stats">
              <div className="categories-stat-card">
                <div className="categories-stat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /><line x1="12" y1="11" x2="12" y2="17" /><line x1="9" y1="14" x2="15" y2="14" /></svg></div>
                <span className="categories-stat-label">Total Categories</span>
                <span className="categories-stat-value">{lists.length}</span>
              </div>
              <div className="categories-stat-card">
                <div className="categories-stat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg></div>
                <span className="categories-stat-label">Total Tasks</span>
                <span className="categories-stat-value">{tasks.length}</span>
              </div>
              <div className="categories-stat-card">
                <div className="categories-stat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg></div>
                <span className="categories-stat-label">Completion Rate</span>
                <span className="categories-stat-value">{completionRate}%</span>
              </div>
            </section>
            <div className="categories-toolbar">
              <div className="categories-search">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                <input type="text" placeholder="Search categories..." value={categorySearchQuery} onChange={(e) => setCategorySearchQuery(e.target.value)} />
              </div>
              <button type="button" className="categories-new-btn" onClick={() => { setNewListName(''); setShowListModal(true); }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                New Category
              </button>
            </div>
            {filteredCategoriesForPage.length === 0 ? (
              <div className="categories-empty">
                <div className="categories-empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /><line x1="12" y1="11" x2="12" y2="17" /><line x1="9" y1="14" x2="15" y2="14" /></svg></div>
                <p className="categories-empty-title">No categories yet</p>
                <p className="categories-empty-subtitle">Create your first category to start organizing your tasks!</p>
                <button type="button" className="categories-create-btn" onClick={() => { setNewListName(''); setShowListModal(true); }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  Create Category
                </button>
              </div>
            ) : (
              <ul className="categories-list">
                {filteredCategoriesForPage.map((list) => (
                  <li key={list.id} className="categories-list-item" onClick={() => { setSelectedList(list.name); setCurrentView('overview'); setSidebarOpen(false); }}>
                    <span className="categories-list-color" style={{ backgroundColor: list.color }} />
                    <span className="categories-list-name">{list.name}</span>
                    <span className="categories-list-count">{tasks.filter(t => t.category === list.name).length} tasks</span>
                    <button
                      type="button"
                      className="categories-list-delete"
                      title="Delete category"
                      onClick={(e) => { e.stopPropagation(); handleDeleteList(list.id); }}
                      aria-label="Delete category"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <>
            <div className="content-header">
              <div className="content-header-left">
                <h1 className="content-title">
                  {currentView === 'task' ? 'Task' : 'Sticky Wall'}
                  {currentView === 'task' && <span className="task-count-badge">{taskCount}</span>}
                </h1>
                {selectionMode && (
                  <div className="selection-info">
                    <span>{selectedTasks.size} selected</span>
                    <button className="exit-selection-btn" onClick={handleExitSelectionMode}>
                      Cancel
                    </button>
                  </div>
                )}
              </div>
              {!selectionMode && (
                <div className="content-header-actions">
                  <button
                    className="header-menu-btn"
                    onClick={() => setShowHeaderMenu(!showHeaderMenu)}
                    title="More options"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="5" r="1" />
                      <circle cx="12" cy="12" r="1" />
                      <circle cx="12" cy="19" r="1" />
                    </svg>
                  </button>
                  {showHeaderMenu && (
                    <div className="header-menu" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="header-menu-item"
                        onClick={() => {
                          setSelectionMode(true)
                          setShowHeaderMenu(false)
                        }}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="9,11 12,14 22,4" />
                          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                        </svg>
                        Select Tasks
                      </button>
                    </div>
                  )}
                </div>
              )}
              {selectionMode && (
                <div className="content-header-actions">
                  <button
                    className="header-action-btn"
                    onClick={handleSelectAllTasks}
                    title="Select all"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9,11 12,14 22,4" />
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                    </svg>
                    {selectedTasks.size === getFilteredTasks().length ? 'Deselect All' : 'Select All'}
                  </button>
                  <button
                    className="header-action-btn"
                    onClick={handleGroupSelectedTasks}
                    disabled={selectedTasks.size < 2}
                    title="Group selected tasks"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                    </svg>
                    Group
                  </button>
                  <button
                    className="header-action-btn header-action-btn-danger"
                    onClick={handleDeleteSelectedTasks}
                    disabled={selectedTasks.size === 0}
                    title="Delete selected tasks"
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
{currentView === 'task' && (
                <button
                className="add-task-button"
                onClick={() => {
                  setTaskFormData({
                    title: '',
                    description: '',
                    priority: 'medium',
                    dueDate: '',
                    category: selectedList || lists[0]?.name || 'Uncategorized',
                    status: 'pending',
                    subtasks: [],
                    newSubtask: '',
                  })
                  setShowTaskModal(true)
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>Add New Task</span>
              </button>
            )}
          </>
        )}

        {currentView !== 'categories' && (
        <div className="tasks-container">
          {currentView === 'calendar' ? (
            calendarView === 'day' ? (
              <div className="calendar-view">
                <div className="calendar-day-label">{formatDayName(currentDate)}</div>
                <div className="calendar-timeline">
                  <div className="timeline-hours">
                    {hours.map((hour) => (
                      <div key={hour} className="timeline-hour">
                        <span className="hour-label">
                          {hour === 9 ? '09:00 AM' : hour === 12 ? '12:00 PM' : hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`}
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
                          onClick={() => handleEditEvent(event)}
                        >
                          <div className="event-title">{event.title}</div>
                          <div className="event-time">
                            {event.startTime} - {event.endTime}
                          </div>
                          <button
                            className="event-delete-btn"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteEvent(event.id)
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
            ) : calendarView === 'week' ? (
              <div className="calendar-week-view">
                <div className="week-header">
                  <div className="week-time-column"></div>
                  {weekDates.map((date, idx) => {
                    const isToday = date.toDateString() === new Date().toDateString()
                    const dayEvents = getEventsForDate(date)
                    return (
                      <div 
                        key={idx} 
                        className={`week-day-header ${isToday ? 'today' : ''}`}
                        onClick={() => {
                          setCurrentDate(date)
                          setCalendarView('day')
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="week-day-name">{date.toLocaleDateString('en-GB', { weekday: 'short' }).toUpperCase()}</div>
                        <div className="week-day-number">{date.getDate()}</div>
                        {dayEvents.length > 0 && (
                          <div className="week-day-event-count">{dayEvents.length}</div>
                        )}
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
                    const dayEvents = getEventsForDate(date)
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
                              onClick={() => handleEditEvent(event)}
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
            ) : (
              <div className="calendar-month-view">
                <div className="month-weekdays">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <div key={day} className="month-weekday">{day}</div>
                  ))}
                </div>
                <div className="month-grid">
                  {monthDates.map((date, idx) => {
                    if (!date) {
                      return <div key={idx} className="month-day empty"></div>
                    }
                    const isToday = date.toDateString() === new Date().toDateString()
                    const dayEvents = getEventsForDate(date)
                    const isCurrentMonth = date.getMonth() === currentDate.getMonth()
                    return (
                      <div
                        key={idx}
                        className={`month-day ${isToday ? 'today' : ''} ${!isCurrentMonth ? 'other-month' : ''}`}
                        onClick={() => {
                          setCurrentDate(date)
                          setCalendarView('day')
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
                                  handleEditEvent(event)
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
                                  setCurrentDate(date)
                                  setCalendarView('day')
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
          ) : currentView === 'sticky' ? (
            <div className="sticky-wall" onMouseMove={handleStickyMouseMove} onMouseUp={handleStickyMouseUp}>
              <div className="sticky-grid">
                {stickyNotes.map((note) => (
                  <div
                    key={note.id}
                    data-note-id={note.id}
                    className={`sticky-note-card ${draggedSticky === note.id ? 'dragging' : ''}`}
                    style={{
                      backgroundColor: note.color,
                    }}
                    onMouseDown={(e) => handleStickyMouseDown(e, note.id)}
                    onClick={(e) => {
                      // Only open edit if user didn't drag
                      if (!hasDraggedRef.current) {
                        handleEditSticky(note)
                      }
                    }}
                  >
                    <div className="sticky-note-header">
                      <h3 className="sticky-note-title">{note.title}</h3>
                      <button
                        className="sticky-delete-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteSticky(note.id)
                        }}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                    <div className="sticky-note-content">
                      {note.content ? (
                        note.content.split('\n').filter(line => line.trim()).map((line, idx) => (
                          <p key={idx}>• {line.trim()}</p>
                        ))
                      ) : (
                        <p style={{ color: 'rgba(0, 0, 0, 0.4)', fontStyle: 'italic' }}>No content</p>
                      )}
                    </div>
                  </div>
                ))}
                <div
                  className="sticky-note-placeholder"
                  onClick={() => {
                    setStickyFormData({
                      title: '',
                      content: '',
                      color: '#fef08a',
                    })
                    setEditingSticky(null)
                    setShowStickyModal(true)
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </div>
              </div>
            </div>
          ) : currentView === 'task' ? (
            (() => {
              const taskTableTasks = getFilteredTasks()
              const pendingTasks = taskTableTasks.filter((t) => getTaskStatus(t) === 'pending')
              const inProgressTasks = taskTableTasks.filter((t) => getTaskStatus(t) === 'in_progress')
              const completedTasks = taskTableTasks.filter((t) => getTaskStatus(t) === 'completed')
              const totalTasks = pendingTasks.length + inProgressTasks.length + completedTasks.length

              const TaskColumn = ({ status, label, tasks: columnTasks, icon }: { status: TaskStatus; label: string; tasks: Task[]; icon: React.ReactNode }) => (
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
                        onToggleComplete={handleToggleComplete}
                        onEdit={handleEditTask}
                        onDelete={handleDeleteTask}
                        showDetails={true}
                        onTaskClick={handleTaskClick}
                        showTaskActions={showTaskActions}
                        onEditFromClick={handleEditTaskFromClick}
                        onDeleteFromClick={handleDeleteTaskFromClick}
                        selectionMode={selectionMode}
                        isSelected={selectedTasks.has(task.id)}
                        onToggleSelection={handleToggleTaskSelection}
                      />
                    ))}
                  </ul>
                </div>
              )

              return totalTasks === 0 ? (
                <div className="empty-state">
                  <p>No tasks found. Add a new task to get started!</p>
                </div>
              ) : (
                <div className="task-table">
                  <TaskColumn
                    status="pending"
                    label="Pending"
                    tasks={pendingTasks}
                    icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>}
                  />
                  <TaskColumn
                    status="in_progress"
                    label="In Progress"
                    tasks={inProgressTasks}
                    icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>}
                  />
                  <TaskColumn
                    status="completed"
                    label="Completed"
                    tasks={completedTasks}
                    icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>}
                  />
                </div>
              )
            })()
          ) : filteredTasks.length === 0 ? (
            <div className="empty-state">
              <p>No tasks found. Add a new task to get started!</p>
            </div>
          ) : (
            <ul className="task-list">
              {filteredTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  lists={lists}
                  onToggleComplete={handleToggleComplete}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  onTaskClick={handleTaskClick}
                  showTaskActions={showTaskActions}
                  onEditFromClick={handleEditTaskFromClick}
                  onDeleteFromClick={handleDeleteTaskFromClick}
                  selectionMode={selectionMode}
                  isSelected={selectedTasks.has(task.id)}
                  onToggleSelection={handleToggleTaskSelection}
                />
              ))}
            </ul>
          )}
        </div>
        )}
          </>
        )}

        <footer className="app-footer">
          <div className="app-footer-inner">
            <span className="app-footer-copy">© {new Date().getFullYear()} TaskFlow. Your personal productivity companion.</span>
          </div>
        </footer>
      </main>

      {/* Add List Modal */}
      {showListModal && (
        <div className="modal-overlay" onClick={() => setShowListModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New List</h2>
              <button className="modal-close" onClick={() => setShowListModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddList} className="modal-form">
              <div className="form-group">
                <label>List Name</label>
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="Enter list name"
                  autoFocus
                />
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setShowListModal(false)} className="btn-cancel">Cancel</button>
                <button type="submit" className="btn-submit">Add List</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Tag Modal */}
      {showTagModal && (
        <div className="modal-overlay" onClick={() => setShowTagModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Tag</h2>
              <button className="modal-close" onClick={() => setShowTagModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddTag} className="modal-form">
              <div className="form-group">
                <label>Tag Name</label>
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Enter tag name"
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Tag Color</label>
                <input
                  type="color"
                  value={newTagColor}
                  onChange={(e) => setNewTagColor(e.target.value)}
                />
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setShowTagModal(false)} className="btn-cancel">Cancel</button>
                <button type="submit" className="btn-submit">Add Tag</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Calendar Event Modal */}
      {showEventModal && (
        <div className="modal-overlay" onClick={() => { setShowEventModal(false); setEditingEvent(null) }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingEvent ? 'Edit Event' : 'Add Event'}</h2>
              <button className="modal-close" onClick={() => { setShowEventModal(false); setEditingEvent(null) }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <form onSubmit={editingEvent ? handleUpdateEvent : handleAddEvent} className="modal-form">
              <div className="form-group">
                <label>Event Title *</label>
                <input
                  type="text"
                  value={eventFormData.title}
                  onChange={(e) => setEventFormData({ ...eventFormData, title: e.target.value })}
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
                    value={eventFormData.date}
                    onChange={(e) => setEventFormData({ ...eventFormData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Color</label>
                  <input
                    type="color"
                    value={eventFormData.color}
                    onChange={(e) => setEventFormData({ ...eventFormData, color: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Time</label>
                  <input
                    type="time"
                    value={eventFormData.startTime}
                    onChange={(e) => setEventFormData({ ...eventFormData, startTime: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Time</label>
                  <input
                    type="time"
                    value={eventFormData.endTime}
                    onChange={(e) => setEventFormData({ ...eventFormData, endTime: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={eventFormData.description}
                  onChange={(e) => setEventFormData({ ...eventFormData, description: e.target.value })}
                  placeholder="Add event description (optional)"
                  rows={3}
                />
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => { setShowEventModal(false); setEditingEvent(null) }} className="btn-cancel">Cancel</button>
                <button type="submit" className="btn-submit">{editingEvent ? 'Update Event' : 'Add Event'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sticky Note Modal */}
      {showStickyModal && (
        <div className="modal-overlay" onClick={() => { setShowStickyModal(false); setEditingSticky(null) }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingSticky ? 'Edit Sticky Note' : 'Add Sticky Note'}</h2>
              <button className="modal-close" onClick={() => { setShowStickyModal(false); setEditingSticky(null) }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <form onSubmit={editingSticky ? handleUpdateSticky : handleAddSticky} className="modal-form">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={stickyFormData.title}
                  onChange={(e) => setStickyFormData({ ...stickyFormData, title: e.target.value })}
                  placeholder="Enter sticky note title"
                  autoFocus
                  required
                />
              </div>
              <div className="form-group">
                <label>Content</label>
                <textarea
                  value={stickyFormData.content}
                  onChange={(e) => setStickyFormData({ ...stickyFormData, content: e.target.value })}
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
                      className={`color-option ${stickyFormData.color === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setStickyFormData({ ...stickyFormData, color })}
                    />
                  ))}
                </div>
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => { setShowStickyModal(false); setEditingSticky(null) }} className="btn-cancel">Cancel</button>
                <button type="submit" className="btn-submit">{editingSticky ? 'Update Note' : 'Add Note'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Creation Modal */}
      {showTaskModal && (
        <div className="modal-overlay" onClick={() => {
          setShowTaskModal(false)
          setEditingTask(null)
        }}>
          <div className="modal-content task-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingTask ? 'Edit Task' : 'Create New Task'}</h2>
              <button className="modal-close" onClick={() => {
                setShowTaskModal(false)
                setEditingTask(null)
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreateTaskFromModal} className="modal-form">
              <div className="form-group">
                <label>Task Title *</label>
                <input
                  type="text"
                  value={taskFormData.title}
                  onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
                  placeholder="Enter task title"
                  autoFocus
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={taskFormData.description}
                  onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
                  placeholder="Enter task description (optional)"
                  rows={4}
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  value={taskFormData.category}
                  onChange={(e) => setTaskFormData({ ...taskFormData, category: e.target.value })}
                >
                  <option value="Uncategorized">Uncategorized</option>
                  {lists.map((list) => (
                    <option key={list.id} value={list.name}>{list.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={taskFormData.status}
                  onChange={(e) => setTaskFormData({ ...taskFormData, status: e.target.value as TaskStatus })}
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
                    value={taskFormData.priority}
                    onChange={(e) => setTaskFormData({ ...taskFormData, priority: e.target.value as 'low' | 'medium' | 'high' })}
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
                    value={taskFormData.dueDate}
                    onChange={(e) => setTaskFormData({ ...taskFormData, dueDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Subtasks</label>
                <div className="subtasks-container">
                  {taskFormData.subtasks.map((subtask) => (
                    <div key={subtask.id} className="subtask-item">
                      <span>{subtask.title}</span>
                      <button
                        type="button"
                        className="subtask-remove-btn"
                        onClick={() => handleRemoveSubtask(subtask.id)}
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
                      value={taskFormData.newSubtask}
                      onChange={(e) => setTaskFormData({ ...taskFormData, newSubtask: e.target.value })}
                      placeholder="Add a subtask"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddSubtask()
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="subtask-add-btn"
                      onClick={handleAddSubtask}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => {
                  setShowTaskModal(false)
                  setEditingTask(null)
                }} className="btn-cancel">Cancel</button>
                <button type="submit" className="btn-submit">{editingTask ? 'Update Task' : 'Create Task'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {showTaskDetailModal && taskDetailModalTask && (() => {
        const currentTask = tasks.find(t => t.id === taskDetailModalTask.id) || taskDetailModalTask
        return (
        <div className="modal-overlay" onClick={() => {
          setShowTaskDetailModal(false)
          setTaskDetailModalTask(null)
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Task Details</h2>
              <button className="modal-close" onClick={() => {
                setShowTaskDetailModal(false)
                setTaskDetailModalTask(null)
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="modal-form">
              <div className="task-detail-view">
                <div className="task-detail-title">{currentTask.title}</div>
                <div className="task-detail-status-row">
                  <strong>Status:</strong>
                  <select
                    className="task-detail-status-select"
                    value={getTaskStatus(currentTask)}
                    onChange={(e) => handleUpdateTaskStatus(currentTask.id, e.target.value as TaskStatus)}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Done</option>
                  </select>
                </div>
                {currentTask.description && (
                  <div className="task-detail-description">
                    <strong>Description:</strong>
                    <p>{currentTask.description}</p>
                  </div>
                )}
                <div className="task-detail-meta">
                  <div className="task-detail-row">
                    {currentTask.priority && (
                      <div className="task-detail-item task-detail-item-inline">
                        <strong>Priority:</strong>
                        <span className={`priority-badge priority-${currentTask.priority}`}>
                          {currentTask.priority.charAt(0).toUpperCase() + currentTask.priority.slice(1)}
                        </span>
                      </div>
                    )}
                    {currentTask.dueDate && (
                      <div className="task-detail-item task-detail-item-inline">
                        <strong>Due Date:</strong>
                        <span>{new Date(currentTask.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}</span>
                      </div>
                    )}
                  </div>
                  {currentTask.subtasks && currentTask.subtasks.length > 0 && (
                    <div className="task-detail-item task-detail-item-subtasks">
                      <div className="task-detail-subtasks-header">
                        <strong>Subtasks:</strong>
                        <span className="task-detail-subtasks-progress">
                          {currentTask.subtasks.filter((st) => st.completed).length}/{currentTask.subtasks.length} completed
                        </span>
                      </div>
                      <ul className="task-detail-subtasks">
                        {currentTask.subtasks.map((subtask) => (
                          <li key={subtask.id}>
                            <input
                              type="checkbox"
                              checked={subtask.completed}
                              onChange={() => handleToggleSubtask(currentTask.id, subtask.id)}
                            />
                            <span style={{ textDecoration: subtask.completed ? 'line-through' : 'none' }}>
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
                    handleEditTaskFromClick(currentTask)
                    setShowTaskDetailModal(false)
                    setTaskDetailModalTask(null)
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
                      handleDeleteTaskFromClick(currentTask.id)
                      setShowTaskDetailModal(false)
                      setTaskDetailModalTask(null)
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
        )
      })()}

    </div>
  )
}
