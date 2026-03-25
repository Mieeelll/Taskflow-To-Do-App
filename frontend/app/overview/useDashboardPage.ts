'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTodos } from '@/lib/hooks/use-todos'
import { useProtectedRoute } from '@/lib/hooks/use-auth'
import { logoutUser } from '@/lib/services/auth.service'
import { todoToTask, type Task } from '@/lib/utils/dashboard-utils'
import type { TodoCreateRequest, TodoUpdateRequest } from '@/lib/types/api'
import type {
  List,
  CalendarEvent,
  StickyNote,
  ViewType,
  CalendarViewType,
  TaskStatus,
} from './types'
import { getTaskStatus } from './tasks/task-item'

export function useDashboardPage() {
  const router = useRouter()
  const { isLoading: authLoading, isAuthenticated } = useProtectedRoute()
  const { todos, loading: todosLoading, error: todosError, addTodo, editTodo, removeTodo } = useTodos()

  // Convert API todos to tasks for UI
  const tasks = todos.map(todoToTask)

  // --- State: Core Data ---
  const [lists, setLists] = useState<List[]>([])

  // --- State: Filters & Search ---
  const [selectedList, setSelectedList] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [categorySearchQuery, setCategorySearchQuery] = useState('')

  // --- State: Modals & UI ---
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [showListModal, setShowListModal] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([])
  const [stickyNotes, setStickyNotes] = useState<StickyNote[]>([])
  const [calendarView, setCalendarView] = useState<CalendarViewType>('day')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showEventModal, setShowEventModal] = useState(false)
  const [showStickyModal, setShowStickyModal] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [editingSticky, setEditingSticky] = useState<StickyNote | null>(null)
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
  const [loading, setLoading] = useState(true)
  const [currentView, setCurrentView] = useState<ViewType>('overview')
  const [apiError, setApiError] = useState<string | null>(null)

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
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
      return
    }
    
    if (!authLoading && isAuthenticated) {
      loadLists()
      loadCalendarEvents()
      loadStickyNotes()
      setLoading(false)
    }
  }, [authLoading, isAuthenticated, router])

  // Show API errors
  useEffect(() => {
    if (todosError) {
      setApiError(todosError)
      const timer = setTimeout(() => setApiError(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [todosError])

  // Redirect Upcoming view to Overview (Upcoming tab/content removed)
  useEffect(() => {
    if (currentView === 'upcoming') setCurrentView('overview')
  }, [currentView])

  // Close task actions menu when clicking outside
  useEffect(() => {
    if (!showTaskActions) return
    
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element
      // Don't close if clicking on the task item itself or the actions menu
      if (!target.closest('.task-item') && !target.closest('.task-actions-menu')) {
        setShowTaskActions(null)
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

  // loadTasks is now handled by useTodos hook
  
  const loadLists = () => {
    try {
      const stored = localStorage.getItem('lists')
      setLists(stored ? JSON.parse(stored) : [])
    } catch (err) {
      console.error('Error loading lists:', err)
      setLists([])
    }
  }

  const loadCalendarEvents = () => {
    try {
      const stored = localStorage.getItem('calendarEvents')
      setCalendarEvents(stored ? JSON.parse(stored) : [])
    } catch (err) {
      console.error('Error loading calendar events:', err)
      setCalendarEvents([])
    }
  }

  const loadStickyNotes = () => {
    try {
      const stored = localStorage.getItem('stickyNotes')
      if (!stored) {
        setStickyNotes([])
        return
      }
      const notes = JSON.parse(stored)
      // Reset positions - remove x and y coordinates
      const resetNotes = notes.map((note: any) => {
        const { x, y, ...rest } = note
        return rest as StickyNote
      })
      setStickyNotes(resetNotes)
      if (resetNotes.length !== notes.length || notes.some((n: any) => n.x !== undefined || n.y !== undefined)) {
        saveStickyNotes(resetNotes)
      }
    } catch (err) {
      console.error('Error loading sticky notes:', err)
      setStickyNotes([])
    }
  }

  // =============================================================================
  // DATA SAVING
  // =============================================================================

  // Tasks are now saved via the API through useTodos hook
  
  const saveLists = (newLists: List[]) => {
    localStorage.setItem('lists', JSON.stringify(newLists))
    setLists(newLists)
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
    logoutUser()
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
  }

  const handleDeleteTaskFromClick = (taskId: string) => {
    handleDeleteTask(taskId)
    setShowTaskActions(null)
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

    // Create grouped task via API
    const createData: TodoCreateRequest = {
      title: groupedTitle,
      description: groupedDescription,
      priority: selectedTasksList[0]?.priority || 'medium',
      dueDate: selectedTasksList[0]?.dueDate || undefined,
      category: selectedTasksList[0]?.category || 'Uncategorized',
    }

    addTodo(createData).then(() => {
      // Delete selected tasks
      selectedTasks.forEach(taskId => {
        removeTodo(taskId).catch(() => {
          console.error('Failed to delete task:', taskId)
        })
      })

      setSelectedTasks(new Set())
      setSelectionMode(false)
      alert(`Grouped ${selectedCount} tasks into one.`)
    }).catch(() => {
      setApiError('Failed to group tasks. Please try again.')
    })
  }

  const handleDeleteSelectedTasks = () => {
    if (selectedTasks.size === 0) {
      alert('Please select at least one task to delete.')
      return
    }

    if (confirm(`Are you sure you want to delete ${selectedTasks.size} task(s)?`)) {
      selectedTasks.forEach(taskId => {
        removeTodo(taskId).catch(() => {
          console.error('Failed to delete task:', taskId)
        })
      })
      setSelectedTasks(new Set())
      setSelectionMode(false)
    }
  }

  const handleExitSelectionMode = () => {
    setSelectionMode(false)
    setSelectedTasks(new Set())
  }

  const handleCreateTaskFromModal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskFormData.title.trim()) return

    const taskCompleted = taskFormData.status === 'completed'

    if (editingTask) {
      // Update existing task via API
      const updateData: TodoUpdateRequest = {
        title: taskFormData.title.trim(),
        description: taskFormData.description.trim(),
        completed: taskCompleted,
        priority: taskFormData.priority,
        dueDate: taskFormData.dueDate || undefined,
        category: taskFormData.category,
        status: taskFormData.status,
        subtasks: taskFormData.subtasks,
      }

      const result = await editTodo(editingTask.id, updateData)
      if (result) {
        setEditingTask(null)
      } else {
        setApiError('Failed to update task. Please try again.')
      }
    } else {
      // Create new task via API
      const createData: TodoCreateRequest = {
        title: taskFormData.title.trim(),
        description: taskFormData.description.trim(),
        completed: taskCompleted,
        priority: taskFormData.priority,
        dueDate: taskFormData.dueDate || undefined,
        category: taskFormData.category,
        status: taskFormData.status,
        subtasks: taskFormData.subtasks,
      }

      const result = await addTodo(createData)
      if (!result) {
        setApiError('Failed to create task. Please try again.')
      }
    }

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

  const handleToggleComplete = (taskId: string) => {
    const task = todos.find(t => t.id === taskId)
    if (!task) return

    const newCompleted = !task.completed
    editTodo(taskId, { completed: newCompleted }).catch(() => {
      setApiError('Failed to update task status. Please try again.')
    })
  }

  const handleUpdateTaskStatus = useCallback((taskId: string, newStatus: TaskStatus) => {
    editTodo(taskId, {
      status: newStatus,
      completed: newStatus === 'completed',
    }).catch(() => {
      setApiError('Failed to update task status. Please try again.')
    })
  }, [editTodo])

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task || !task.subtasks) return

    const updatedSubtasks = task.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    )
    const allSubtasksDone = updatedSubtasks.length > 0 && updatedSubtasks.every((st) => st.completed)

    editTodo(taskId, {
      subtasks: updatedSubtasks,
      completed: allSubtasksDone,
    }).catch(() => {
      setApiError('Failed to update subtask. Please try again.')
    })
  }

  const handleDeleteTask = (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      removeTodo(taskId).catch(() => {
        setApiError('Failed to delete task. Please try again.')
      })
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

      // Note: Task categories cannot be updated via API without full task update
      // This would need to be handled via individual task updates
      if (selectedList === listToDelete?.name) {
        setSelectedList(null)
      }
    }
  }

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

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(q) ||
          (task.description ?? '').toLowerCase().includes(q)
      )
    }

    return filtered
  }

  const filteredTasks = getFilteredTasks()
  const filteredCategoriesForPage = categorySearchQuery.trim()
    ? lists.filter((list) => list.name.toLowerCase().includes(categorySearchQuery.trim().toLowerCase()))
    : lists
  const taskCount = tasks.filter((task) => getTaskStatus(task) !== 'completed').length

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
  const recentTasks = [...tasks].sort((a, b) => new Date(b.createdAt ?? b.created_at ?? 0).getTime() - new Date(a.createdAt ?? a.created_at ?? 0).getTime()).slice(0, 5)

  const user = typeof window !== 'undefined' ? localStorage.getItem('user') : null
  const userData = user ? JSON.parse(user) : null

  const taskDetailForModal =
    showTaskDetailModal && taskDetailModalTask
      ? tasks.find((t) => t.id === taskDetailModalTask.id) ?? taskDetailModalTask
      : null

  const closeTaskDetailModal = () => {
    setShowTaskDetailModal(false)
    setTaskDetailModalTask(null)
  }

  return {
    apiError,
    authLoading,
    calendarEvents,
    calendarView,
    categorySearchQuery,
    closeTaskDetailModal,
    completionRate,
    currentDate,
    currentView,
    dragOffset,
    dragStartPos,
    draggedSticky,
    editingEvent,
    editingSticky,
    editingTask,
    eventFormData,
    filteredCategoriesForPage,
    filteredTasks,
    getFilteredTasks,
    getGreeting,
    handleAddEvent,
    handleAddList,
    handleAddSticky,
    handleAddSubtask,
    handleCalendarDateChange,
    handleCreateTaskFromModal,
    handleDeleteEvent,
    handleDeleteList,
    handleDeleteSelectedTasks,
    handleDeleteSticky,
    handleDeleteTask,
    handleDeleteTaskFromClick,
    handleEditEvent,
    handleEditSticky,
    handleEditTaskFromClick,
    handleExitSelectionMode,
    handleGroupSelectedTasks,
    handleLogout,
    handleRemoveSubtask,
    handleSelectAllTasks,
    handleStickyMouseDown,
    handleStickyMouseMove,
    handleStickyMouseUp,
    handleTaskClick,
    handleToggleComplete,
    handleToggleSubtask,
    handleToggleTaskSelection,
    handleUpdateEvent,
    handleUpdateSticky,
    handleUpdateTaskStatus,
    hasDraggedRef,
    inProgressCompletionRate,
    inProgressCount,
    inProgressTasks,
    isAuthenticated,
    lists,
    loading,
    newListName,
    pendingCount,
    recentTasks,
    searchQuery,
    selectedList,
    selectedTasks,
    selectionMode,
    setApiError,
    setCalendarEvents,
    setCalendarView,
    setCategorySearchQuery,
    setCurrentDate,
    setCurrentView,
    setDragOffset,
    setDragStartPos,
    setDraggedSticky,
    setEditingEvent,
    setEditingSticky,
    setEditingTask,
    setEventFormData,
    setLists,
    setLoading,
    setNewListName,
    setSearchQuery,
    setSelectedList,
    setSelectedTasks,
    setSelectionMode,
    setShowEventModal,
    setShowHeaderMenu,
    setShowListModal,
    setShowStickyModal,
    setShowTaskActions,
    setShowTaskDetailModal,
    setShowTaskModal,
    setSidebarOpen,
    setStickyFormData,
    setStickyNotes,
    setTaskDetailModalTask,
    setTaskFormData,
    showEventModal,
    showHeaderMenu,
    showListModal,
    showStickyModal,
    showTaskActions,
    showTaskDetailModal,
    showTaskModal,
    sidebarOpen,
    stickyFormData,
    stickyNotes,
    taskCount,
    taskDetailForModal,
    taskDetailModalTask,
    taskFormData,
    tasks,
    todosLoading,
    userData,
  }
}
