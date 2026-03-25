'use client'

export interface TaskViewChromeProps {
  taskCount: number
  selectionMode: boolean
  selectedCount: number
  showHeaderMenu: boolean
  onToggleHeaderMenu: () => void
  onStartSelection: () => void
  onExitSelection: () => void
  onSelectAllToggle: () => void
  selectAllLabel: string
  onGroupSelected: () => void
  groupDisabled: boolean
  onDeleteSelected: () => void
  deleteDisabled: boolean
  onOpenNewTask: () => void
}

export function TaskViewChrome({
  taskCount,
  selectionMode,
  selectedCount,
  showHeaderMenu,
  onToggleHeaderMenu,
  onStartSelection,
  onExitSelection,
  onSelectAllToggle,
  selectAllLabel,
  onGroupSelected,
  groupDisabled,
  onDeleteSelected,
  deleteDisabled,
  onOpenNewTask,
}: TaskViewChromeProps) {
  return (
    <>
      <div className="content-header">
        <div className="content-header-left">
          <h1 className="content-title">
            Task
            <span className="task-count-badge">{taskCount}</span>
          </h1>
          {selectionMode && (
            <div className="selection-info">
              <span>{selectedCount} selected</span>
              <button type="button" className="exit-selection-btn" onClick={onExitSelection}>
                Cancel
              </button>
            </div>
          )}
        </div>
        {!selectionMode && (
          <div className="content-header-actions">
            <button
              type="button"
              className="header-menu-btn"
              onClick={onToggleHeaderMenu}
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
                <button type="button" className="header-menu-item" onClick={onStartSelection}>
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
            <button type="button" className="header-action-btn" onClick={onSelectAllToggle} title="Select all">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9,11 12,14 22,4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
              {selectAllLabel}
            </button>
            <button
              type="button"
              className="header-action-btn"
              onClick={onGroupSelected}
              disabled={groupDisabled}
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
              type="button"
              className="header-action-btn header-action-btn-danger"
              onClick={onDeleteSelected}
              disabled={deleteDisabled}
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
      <div className="tasks-actions-row">
        <button type="button" className="add-task-button" onClick={onOpenNewTask}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Add New Task</span>
        </button>
      </div>
    </>
  )
}
