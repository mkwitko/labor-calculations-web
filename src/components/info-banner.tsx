import { InfoIcon, LightbulbIcon, TriangleAlertIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const VARIANTS = {
  info: {
    icon: InfoIcon,
    box: "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/40",
    ic: "text-blue-600 dark:text-blue-400",
    tx: "text-blue-900 dark:text-blue-200",
  },
  tip: {
    icon: LightbulbIcon,
    box: "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40",
    ic: "text-amber-600 dark:text-amber-400",
    tx: "text-amber-900 dark:text-amber-200",
  },
  warning: {
    icon: TriangleAlertIcon,
    box: "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/40",
    ic: "text-red-600 dark:text-red-400",
    tx: "text-red-900 dark:text-red-200",
  },
} as const;

// One-line contextual banner atop complex screens (wizard, templates) that
// explains the flow. Variant: info | tip | warning.
export function InfoBanner({
  variant = "info",
  children,
  className,
}: {
  variant?: keyof typeof VARIANTS;
  children: ReactNode;
  className?: string;
}) {
  const v = VARIANTS[variant];
  const Icon = v.icon;
  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-lg border px-3.5 py-3",
        v.box,
        className,
      )}
    >
      <Icon className={cn("w-4 h-4 shrink-0 mt-0.5", v.ic)} />
      <div className={cn("text-xs leading-relaxed", v.tx)}>{children}</div>
    </div>
  );
}
