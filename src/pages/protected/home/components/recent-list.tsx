import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface RecentListProps {
  title: string
  onViewAll: () => void
  empty: boolean
  emptyIcon: ReactNode
  emptyText: string
  children?: ReactNode
  className?: string
}

export function RecentList({
  title,
  onViewAll,
  empty,
  emptyIcon,
  emptyText,
  children,
  className,
}: RecentListProps) {
  return (
    <div className={cn('bg-card border border-border rounded-xl overflow-hidden', className)}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <button
          type="button"
          onClick={onViewAll}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Ver todos
        </button>
      </div>

      {empty ? (
        <div className="flex flex-col items-center justify-center py-12 gap-2">
          <div className="text-muted-foreground/25">{emptyIcon}</div>
          <p className="text-sm text-muted-foreground">{emptyText}</p>
        </div>
      ) : (
        <div className="divide-y divide-border">{children}</div>
      )}
    </div>
  );
}
