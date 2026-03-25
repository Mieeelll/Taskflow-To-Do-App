'use client'

import { CalendarHeader } from './calendar/CalendarHeader'
import { CalendarBody } from './calendar/CalendarBody'
import { CategoriesView } from './categories/CategoriesView'
import { OverviewRecentCategories } from './categories/OverviewRecentCategories'
import { OverviewStickySection } from './sticky_notes/OverviewStickySection'
import { StickyWallPageHeader, StickyWallContent } from './sticky_notes/StickyWallView'
import { TaskViewChrome } from './tasks/TaskViewChrome'
import { TaskMainContent } from './tasks/TaskMainContent'
import { OverviewStatsSection } from './tasks/OverviewStatsSection'
import { OverviewRecentTasks } from './tasks/OverviewRecentTasks'
import { DashboardModals } from './DashboardModals'
import { useDashboardPage } from './useDashboardPage'

export default function DashboardPage() {
  const {
    apiError,
    authLoading,
    calendarEvents,
    calendarView,
    categorySearchQuery,
    closeTaskDetailModal,
    completionRate,
    currentDate,
    currentView,
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
    setEditingEvent,
    setEditingSticky,
    setEditingTask,
    setEventFormData,
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
    showTaskModal,
    sidebarOpen,
    stickyFormData,
    stickyNotes,
    taskCount,
    taskDetailForModal,
    taskFormData,
    tasks,
    todosLoading,
    userData,
  } = useDashboardPage()

  if (authLoading || loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="dashboard-layout">
      {apiError && (
        <div className="api-error-banner">
          <div className="api-error-content">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{apiError}</span>
          </div>
          <button className="api-error-close" onClick={() => setApiError(null)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {todosLoading && (
        <div className="todos-loading-indicator">
          <span className="loading-spinner-small"></span>
          <span>Syncing tasks...</span>
        </div>
      )}

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

      {sidebarOpen && (
        <div className="mobile-overlay" onClick={() => setSidebarOpen(false)} onTouchStart={() => setSidebarOpen(false)}></div>
      )}

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

            <OverviewStatsSection
              categoryCount={lists.length}
              totalTaskCount={tasks.length}
              pendingCount={pendingCount}
              inProgressCount={inProgressCount}
              inProgressCompletionRate={inProgressCompletionRate}
              completionRate={completionRate}
            />

            <OverviewStickySection
              stickyNotes={stickyNotes}
              onAddNote={() => {
                setEditingSticky(null)
                setStickyFormData({ title: '', content: '', color: '#fef08a' })
                setShowStickyModal(true)
              }}
              onEditNote={(note) => {
                setEditingSticky(note)
                setStickyFormData({ title: note.title, content: note.content, color: note.color })
                setShowStickyModal(true)
              }}
              onDeleteNote={handleDeleteSticky}
            />

            <section className="overview-recent">
              <OverviewRecentCategories
                lists={lists}
                onViewAll={() => {
                  setCurrentView('categories')
                  setSidebarOpen(false)
                }}
              />
              <OverviewRecentTasks
                tasks={recentTasks}
                onViewAll={() => {
                  setCurrentView('task')
                  setSidebarOpen(false)
                }}
              />
            </section>
          </div>
        ) : (
          <>
            {currentView === 'calendar' ? (
              <CalendarHeader
                calendarView={calendarView}
                currentDate={currentDate}
                onCalendarViewChange={setCalendarView}
                onToday={() => setCurrentDate(new Date())}
                onNavigate={handleCalendarDateChange}
                onAddEvent={() => {
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
                }}
              />
            ) : currentView === 'sticky' ? (
              <StickyWallPageHeader />
            ) : currentView === 'categories' ? (
              <CategoriesView
                lists={lists}
                tasks={tasks}
                filteredCategories={filteredCategoriesForPage}
                categorySearchQuery={categorySearchQuery}
                completionRate={completionRate}
                onCategorySearchChange={setCategorySearchQuery}
                onNewCategory={() => {
                  setNewListName('')
                  setShowListModal(true)
                }}
                onSelectCategory={(listName) => {
                  setSelectedList(listName)
                  setCurrentView('overview')
                  setSidebarOpen(false)
                }}
                onDeleteList={handleDeleteList}
              />
            ) : currentView === 'task' ? (
              <TaskViewChrome
                taskCount={taskCount}
                selectionMode={selectionMode}
                selectedCount={selectedTasks.size}
                showHeaderMenu={showHeaderMenu}
                onToggleHeaderMenu={() => setShowHeaderMenu(!showHeaderMenu)}
                onStartSelection={() => {
                  setSelectionMode(true)
                  setShowHeaderMenu(false)
                }}
                onExitSelection={handleExitSelectionMode}
                onSelectAllToggle={handleSelectAllTasks}
                selectAllLabel={
                  selectedTasks.size === getFilteredTasks().length ? 'Deselect All' : 'Select All'
                }
                onGroupSelected={handleGroupSelectedTasks}
                groupDisabled={selectedTasks.size < 2}
                onDeleteSelected={handleDeleteSelectedTasks}
                deleteDisabled={selectedTasks.size === 0}
                onOpenNewTask={() => {
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
              />
            ) : null}

        {currentView !== 'categories' && (
        <div className="tasks-container">
          {currentView === 'calendar' ? (
            <CalendarBody
              calendarEvents={calendarEvents}
              calendarView={calendarView}
              currentDate={currentDate}
              onEditEvent={handleEditEvent}
              onDeleteEvent={handleDeleteEvent}
              onDayClick={(date) => setCurrentDate(date)}
              onSwitchToDayView={() => setCalendarView('day')}
              onAddFirstEvent={() => {
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
              }}
            />
          ) : currentView === 'sticky' ? (
            <StickyWallContent
              stickyNotes={stickyNotes}
              draggedSticky={draggedSticky}
              hasDraggedRef={hasDraggedRef}
              onMouseMove={handleStickyMouseMove}
              onMouseUp={handleStickyMouseUp}
              onMouseDown={handleStickyMouseDown}
              onEditSticky={handleEditSticky}
              onDeleteSticky={handleDeleteSticky}
              onCreateNote={() => {
                setStickyFormData({ title: '', content: '', color: '#fef08a' })
                setEditingSticky(null)
                setShowStickyModal(true)
              }}
            />
          ) : currentView === 'task' ? (
            <TaskMainContent
              mode="kanban"
              tasks={getFilteredTasks()}
              lists={lists}
              selectionMode={selectionMode}
              selectedTasks={selectedTasks}
              showTaskActions={showTaskActions}
              onToggleComplete={handleToggleComplete}
              onEdit={handleEditTaskFromClick}
              onDelete={handleDeleteTask}
              onTaskClick={handleTaskClick}
              onEditFromClick={handleEditTaskFromClick}
              onDeleteFromClick={handleDeleteTaskFromClick}
              onToggleSelection={handleToggleTaskSelection}
            />
          ) : (
            <TaskMainContent
              mode="list"
              tasks={filteredTasks}
              lists={lists}
              selectionMode={selectionMode}
              selectedTasks={selectedTasks}
              showTaskActions={showTaskActions}
              onToggleComplete={handleToggleComplete}
              onEdit={handleEditTaskFromClick}
              onDelete={handleDeleteTask}
              onTaskClick={handleTaskClick}
              onEditFromClick={handleEditTaskFromClick}
              onDeleteFromClick={handleDeleteTaskFromClick}
              onToggleSelection={handleToggleTaskSelection}
            />
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

      <DashboardModals
        showListModal={showListModal}
        setShowListModal={setShowListModal}
        newListName={newListName}
        setNewListName={setNewListName}
        handleAddList={handleAddList}
        showEventModal={showEventModal}
        setShowEventModal={setShowEventModal}
        editingEvent={editingEvent}
        setEditingEvent={setEditingEvent}
        eventFormData={eventFormData}
        setEventFormData={setEventFormData}
        handleAddEvent={handleAddEvent}
        handleUpdateEvent={handleUpdateEvent}
        showStickyModal={showStickyModal}
        setShowStickyModal={setShowStickyModal}
        editingSticky={editingSticky}
        setEditingSticky={setEditingSticky}
        stickyFormData={stickyFormData}
        setStickyFormData={setStickyFormData}
        handleAddSticky={handleAddSticky}
        handleUpdateSticky={handleUpdateSticky}
        showTaskModal={showTaskModal}
        setShowTaskModal={setShowTaskModal}
        editingTask={editingTask}
        setEditingTask={setEditingTask}
        taskFormData={taskFormData}
        setTaskFormData={setTaskFormData}
        lists={lists}
        handleCreateTaskFromModal={handleCreateTaskFromModal}
        handleAddSubtask={handleAddSubtask}
        handleRemoveSubtask={handleRemoveSubtask}
        taskDetailForModal={taskDetailForModal}
        closeTaskDetailModal={closeTaskDetailModal}
        handleUpdateTaskStatus={handleUpdateTaskStatus}
        handleToggleSubtask={handleToggleSubtask}
        handleEditTaskFromClick={handleEditTaskFromClick}
        handleDeleteTaskFromClick={handleDeleteTaskFromClick}
      />

    </div>
  )
}
