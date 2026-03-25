'use client'

import type { StickyNote } from '../types'

export interface OverviewStickySectionProps {
  stickyNotes: StickyNote[]
  onAddNote: () => void
  onEditNote: (note: StickyNote) => void
  onDeleteNote: (noteId: string) => void
}

export function OverviewStickySection({
  stickyNotes,
  onAddNote,
  onEditNote,
  onDeleteNote,
}: OverviewStickySectionProps) {
  return (
    <section className="overview-sticky">
      <div className="overview-sticky-header">
        <h3 className="overview-sticky-title">Sticky Notes</h3>
        <span className="overview-sticky-count">{stickyNotes.length} notes</span>
      </div>
      <div className="overview-sticky-controls">
        <button type="button" className="overview-sticky-control-btn" title="Grid view">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
        </button>
        <button type="button" className="overview-sticky-control-btn" title="List view">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
        </button>
        <button type="button" className="overview-sticky-control-btn" title="Filter">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
        </button>
        <select className="overview-sticky-sort" defaultValue="newest">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>
      <div className="overview-sticky-add-row">
        <button type="button" className="overview-sticky-add-btn" onClick={onAddNote}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Add note</span>
        </button>
      </div>
      {stickyNotes.length === 0 ? (
        <div className="overview-sticky-empty">
          <div className="overview-sticky-empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14,2 14,8 20,8" />
            </svg>
          </div>
          <p className="overview-sticky-empty-title">No sticky notes yet</p>
          <p className="overview-sticky-empty-subtitle">Add your first reminder note to get started!</p>
        </div>
      ) : (
        <div className="overview-sticky-list">
          {stickyNotes.slice(0, 5).map((note) => (
            <div
              key={note.id}
              className="overview-sticky-preview"
              style={{ backgroundColor: note.color }}
              onClick={() => onEditNote(note)}
            >
              <button
                type="button"
                className="overview-sticky-preview-close"
                title="Delete note"
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteNote(note.id)
                }}
                aria-label="Delete note"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
              <span className="overview-sticky-preview-title">{note.title}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
