'use client'

interface OverviewStatsSectionProps {
  categoryCount: number
  totalTaskCount: number
  pendingCount: number
  inProgressCount: number
  inProgressCompletionRate: number | null
  completionRate: number
}

export function OverviewStatsSection({
  categoryCount,
  totalTaskCount,
  pendingCount,
  inProgressCount,
  inProgressCompletionRate,
  completionRate,
}: OverviewStatsSectionProps) {
  return (
    <section className="overview-stats">
      <div className="overview-stat-card">
        <div className="overview-stat-icon overview-stat-icon-folder"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg></div>
        <span className="overview-stat-label">Categories</span>
        <span className="overview-stat-value">{categoryCount}</span>
      </div>
      <div className="overview-stat-card">
        <div className="overview-stat-icon overview-stat-icon-list"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg></div>
        <span className="overview-stat-label">Total Tasks</span>
        <span className="overview-stat-value">{totalTaskCount}</span>
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
            '-'
          )}
        </span>
      </div>
      <div className="overview-stat-card">
        <div className="overview-stat-icon overview-stat-icon-rate"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg></div>
        <span className="overview-stat-label">Completion Rate</span>
        <span className="overview-stat-value">{completionRate}%</span>
      </div>
    </section>
  )
}
