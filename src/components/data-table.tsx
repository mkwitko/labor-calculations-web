import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ColumnDef<T> {
  key: string;
  header: string;
  headerClassName?: string;
  cellClassName?: string;
  /** Render cell content. Receives the full row. */
  render: (row: T) => ReactNode;
  /** If true, clicking this cell won't trigger onRowClick */
  stopPropagation?: boolean;
}

export interface DataTableProps<T extends { id: string }> {
  columns: ColumnDef<T>[];
  rows: T[];
  isLoading?: boolean;
  skeletonRows?: number;
  /** Render a mobile card for a row. If omitted, mobile falls back to the table. */
  renderMobileCard?: (row: T) => ReactNode;
  onRowClick?: (row: T) => void;
  emptyState?: ReactNode;
  className?: string;
}

// ── Skeleton row ──────────────────────────────────────────────────────────────

function SkeletonRow({ columns }: { columns: number }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-4 first:px-5 last:px-5">
          <Skeleton className="h-3 w-full max-w-[120px]" />
        </td>
      ))}
    </tr>
  );
}

// ── Default empty state ───────────────────────────────────────────────────────

function DefaultEmptyState({ colSpan }: { colSpan: number }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-16 text-center">
        <p className="text-sm text-muted-foreground">
          Nenhum resultado encontrado.
        </p>
      </td>
    </tr>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  isLoading = false,
  skeletonRows = 5,
  renderMobileCard,
  onRowClick,
  emptyState,
  className,
}: DataTableProps<T>) {
  const hasMobile = !!renderMobileCard;

  return (
    <div className={cn("overflow-hidden", className)}>
      {/* ── Desktop table ── */}
      <div
        className={cn(
          "overflow-x-auto",
          hasMobile ? "hidden md:block" : "block",
        )}
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "text-left px-4 py-3 first:px-5 last:px-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap",
                    col.headerClassName,
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              Array.from({ length: skeletonRows }).map((_, i) => (
                <SkeletonRow key={i} columns={columns.length} />
              ))
            ) : rows.length === 0 ? (
              emptyState ? (
                <tr>
                  <td colSpan={columns.length}>{emptyState}</td>
                </tr>
              ) : (
                <DefaultEmptyState colSpan={columns.length} />
              )
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    "transition-colors group border-b border-border last:border-0",
                    onRowClick && "cursor-pointer hover:bg-muted/40",
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        "px-4 py-4 first:px-5 last:px-5",
                        col.cellClassName,
                      )}
                      onClick={
                        col.stopPropagation
                          ? (e) => e.stopPropagation()
                          : undefined
                      }
                    >
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Mobile cards ── */}
      {hasMobile && (
        <div className="md:hidden divide-y divide-border">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="p-4 flex items-center gap-3 animate-pulse"
              >
                <Skeleton className="w-9 h-9 rounded-md shrink-0" />
                <div className="space-y-3 flex-1">
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-2.5 w-1/3" />
                </div>
              </div>
            ))
          ) : rows.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Nenhum resultado encontrado.
              </p>
            </div>
          ) : (
            rows.map((row) => (
              <div
                key={row.id}
                className={cn(
                  "transition-colors",
                  onRowClick && "cursor-pointer hover:bg-muted/40",
                )}
                onClick={() => onRowClick?.(row)}
              >
                {renderMobileCard!(row)}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
