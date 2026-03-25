'use client'

import type { List } from '../types'
import type { Task } from '@/lib/utils/dashboard-utils'

export interface CategoriesViewProps {
  lists: List[]
  tasks: Task[]
  filteredCategories: List[]
  categorySearchQuery: string
  completionRate: number
  onCategorySearchChange: (q: string) => void
  onNewCategory: () => void
  onSelectCategory: (listName: string) => void
  onDeleteList: (listId: string) => void
}

export function CategoriesView({
  lists,
  tasks,
  filteredCategories,
  categorySearchQuery,
  completionRate,
  onCategorySearchChange,
  onNewCategory,
  onSelectCategory,
  onDeleteList,
}: CategoriesViewProps) {
  return (
    <div className="categories-page">
      <div className="categories-page-header">
        <h1 className="categories-page-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            <line x1="12" y1="11" x2="12" y2="17" />
            <line x1="9" y1="14" x2="15" y2="14" />
          </svg>
          My Categories
        </h1>
        <p className="categories-page-subtitle">Organize your tasks into meaningful categories</p>
      </div>
      <section className="categories-stats">
        <div className="categories-stat-card">
          <div className="categories-stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              <line x1="12" y1="11" x2="12" y2="17" />
              <line x1="9" y1="14" x2="15" y2="14" />
            </svg>
          </div>
          <span className="categories-stat-label">Total Categories</span>
          <span className="categories-stat-value">{lists.length}</span>
        </div>
        <div className="categories-stat-card">
          <div className="categories-stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
          </div>
          <span className="categories-stat-label">Total Tasks</span>
          <span className="categories-stat-value">{tasks.length}</span>
        </div>
        <div className="categories-stat-card">
          <div className="categories-stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
          <span className="categories-stat-label">Completion Rate</span>
          <span className="categories-stat-value">{completionRate}%</span>
        </div>
      </section>
      <div className="categories-toolbar">
        <div className="categories-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search categories..."
            value={categorySearchQuery}
            onChange={(e) => onCategorySearchChange(e.target.value)}
          />
        </div>
        <button type="button" className="categories-new-btn" onClick={onNewCategory}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Category
        </button>
      </div>
      {filteredCategories.length === 0 ? (
        <div className="categories-empty">
          <div className="categories-empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              <line x1="12" y1="11" x2="12" y2="17" />
              <line x1="9" y1="14" x2="15" y2="14" />
            </svg>
          </div>
          <p className="categories-empty-title">No categories yet</p>
          <p className="categories-empty-subtitle">
            Create your first category to start organizing your tasks!
          </p>
          <button type="button" className="categories-create-btn" onClick={onNewCategory}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Create Category
          </button>
        </div>
      ) : (
        <ul className="categories-list">
          {filteredCategories.map((list) => (
            <li
              key={list.id}
              className="categories-list-item"
              onClick={() => onSelectCategory(list.name)}
            >
              <span className="categories-list-color" style={{ backgroundColor: list.color }} />
              <span className="categories-list-name">{list.name}</span>
              <span className="categories-list-count">
                {tasks.filter((t) => t.category === list.name).length} tasks
              </span>
              <button
                type="button"
                className="categories-list-delete"
                title="Delete category"
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteList(list.id)
                }}
                aria-label="Delete category"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
