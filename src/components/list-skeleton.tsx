import { Skeleton } from "@/components/ui/skeleton";

// Placeholder rows shown while a list/table query is loading, so pages don't
// flash an empty state before data arrives.
export function ListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div
      aria-hidden="true"
      className="divide-y divide-border rounded-xl border border-border overflow-hidden"
    >
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3.5">
          <Skeleton className="h-4 w-4 rounded shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-1/5" />
          </div>
          <Skeleton className="h-3 w-16 shrink-0" />
        </div>
      ))}
    </div>
  );
}
