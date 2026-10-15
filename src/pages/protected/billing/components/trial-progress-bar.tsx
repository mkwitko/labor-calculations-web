import { cn } from "@/lib/utils";

export function TrialProgressBar({ daysLeft }: { daysLeft: number }) {
  const total = 7;
  const used = total - daysLeft;
  const pct = Math.round((used / total) * 100);
  const urgent = daysLeft <= 3;

  return (
    <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
      <div
        className={cn(
          "h-full rounded-full transition-all",
          urgent ? "bg-amber-500" : "bg-blue-500",
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}