import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface StatCardProps {
  icon: ReactNode
  iconBg: string
  label: string
  value: string | number
  suffix: string
  largeValue?: boolean
}

export function StatCard({ icon, iconBg, label, value, suffix, largeValue }: StatCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-5 flex items-center gap-3 md:block">
      <div
        className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 md:mb-4',
          iconBg,
        )}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs md:text-sm text-muted-foreground">{label}</p>
        <p
          className={cn(
            'font-bold text-foreground mt-0.5 tabular-nums',
            largeValue ? 'text-lg md:text-2xl' : 'text-2xl md:text-3xl',
          )}
        >
          {value}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 hidden md:block">{suffix}</p>
      </div>
    </div>
  )
}
