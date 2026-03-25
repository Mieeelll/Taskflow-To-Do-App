'use client'

import type { MutableRefObject } from 'react'
import type { StickyNote } from '../types'

export function StickyWallPageHeader() {
  return (
    <div className="content-header">
      <h1 className="content-title sticky-wall-title">Sticky Wall</h1>
    </div>
  )
}

export interface StickyWallContentProps {
  stickyNotes: StickyNote[]
  draggedSticky: string | null
  hasDraggedRef: MutableRefObject<boolean>
  onMouseMove: (e: React.MouseEvent) => void
  onMouseUp: () => void
  onMouseDown: (e: React.MouseEvent, noteId: string) => void
  onEditSticky: (note: StickyNote) => void
  onDeleteSticky: (id: string) => void
  onCreateNote: () => void
}

export function StickyWallContent({
  stickyNotes,
  draggedSticky,
  hasDraggedRef,
  onMouseMove,
  onMouseUp,
  onMouseDown,
  onEditSticky,
  onDeleteSticky,
  onCreateNote,
}: StickyWallContentProps) {
  return (
    <div className="sticky-wall" onMouseMove={onMouseMove} onMouseUp={onMouseUp}>
      {stickyNotes.length === 0 ? (
        <div className="sticky-wall-empty overview-sticky-empty">
          <div className="overview-sticky-empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14,2 14,8 20,8" />
            </svg>
          </div>
          <p className="overview-sticky-empty-title">No Sticky Notes Yet</p>
          <p className="overview-sticky-empty-subtitle">
            Create your first note to get started with quick reminders and ideas.
          </p>
          <button type="button" className="categories-create-btn" onClick={onCreateNote}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Create Your First Note</span>
          </button>
        </div>
      ) : (
        <div className="sticky-grid">
          {stickyNotes.map((note) => (
            <div
              key={note.id}
              data-note-id={note.id}
              className={`sticky-note-card ${draggedSticky === note.id ? 'dragging' : ''}`}
              style={{ backgroundColor: note.color }}
              onMouseDown={(e) => onMouseDown(e, note.id)}
              onClick={() => {
                if (!hasDraggedRef.current) {
                  onEditSticky(note)
                }
              }}
            >
              <div className="sticky-note-header">
                <h3 className="sticky-note-title">{note.title}</h3>
                <button
                  type="button"
                  className="sticky-delete-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteSticky(note.id)
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
                  note.content
                    .split('\n')
                    .filter((line) => line.trim())
                    .map((line, idx) => (
                      <p key={idx}>• {line.trim()}</p>
                    ))
                ) : (
                  <p className="sticky-note-empty-content">No content</p>
                )}
              </div>
            </div>
          ))}
          <div className="sticky-note-placeholder" onClick={onCreateNote}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
        </div>
      )}
    </div>
  )
}
