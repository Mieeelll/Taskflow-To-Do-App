'use client'

import type { Task } from '@/lib/utils/dashboard-utils'

interface OverviewRecentTasksProps {
  tasks: Task[]
  onViewAll: () => void
}

export function OverviewRecentTasks({ tasks, onViewAll }: OverviewRecentTasksProps) {
  return (
    <div className="overview-recent-card">
      <div className="overview-recent-card-header">
        <h3 className="overview-recent-card-title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg> Recent Tasks</h3>
        <button type="button" className="overview-recent-link" onClick={onViewAll}>View all</button>
      </div>
      <ul className="overview-recent-list">
        {tasks.map((task) => (
          <li key={task.id} className="overview-recent-item">{task.title}</li>
        ))}
        {tasks.length === 0 && <li className="overview-recent-item overview-recent-empty">No tasks yet</li>}
      </ul>
    </div>
  )
}
