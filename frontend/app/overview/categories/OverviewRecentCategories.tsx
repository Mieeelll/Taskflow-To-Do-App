'use client'

import type { List } from '../types'

interface OverviewRecentCategoriesProps {
  lists: List[]
  onViewAll: () => void
}

export function OverviewRecentCategories({ lists, onViewAll }: OverviewRecentCategoriesProps) {
  return (
    <div className="overview-recent-card">
      <div className="overview-recent-card-header">
        <h3 className="overview-recent-card-title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg> Recent Categories</h3>
        <button type="button" className="overview-recent-link" onClick={onViewAll}>View all</button>
      </div>
      <ul className="overview-recent-list">
        {lists.slice(0, 5).map((list) => (
          <li key={list.id} className="overview-recent-item">{list.name}</li>
        ))}
        {lists.length === 0 && <li className="overview-recent-item overview-recent-empty">No categories yet</li>}
      </ul>
    </div>
  )
}
