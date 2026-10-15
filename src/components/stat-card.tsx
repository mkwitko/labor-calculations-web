import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  sublabel: string;
  trend?: string;
  iconClassName?: string;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  sublabel,
  trend,
  iconClassName,
}: StatCardProps) {
  return (
    <div className="document-card p-5 space-y-3 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2">
        <Icon className={cn("w-4 h-4", iconClassName ?? "text-muted-foreground")} />
        <span className="text-xs text-muted-foreground truncate">{label}</span>
      </div>
      <p className="text-2xl font-bold text-foreground tracking-tight leading-none">
        {value}
      </p>
      {trend && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <span className="text-green-600 dark:text-green-400 font-medium">{trend}</span>
        </p>
      )}
      <p className="text-xs text-muted-foreground">{sublabel}</p>
    </div>
  );
}
