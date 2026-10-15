import { ChevronRightIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export type Breadcrumb = { label: string; to?: string };

// Standard page header: optional breadcrumbs, title, subtitle and right-aligned
// actions. Gives every screen a consistent top region.
export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
  className,
}: {
  title: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
            {breadcrumbs.map((b, i) => (
              <span key={`${b.label}-${i}`} className="flex items-center gap-1">
                {i > 0 && <ChevronRightIcon className="w-3 h-3" />}
                {b.to ? (
                  <Link to={b.to} className="hover:text-foreground">
                    {b.label}
                  </Link>
                ) : (
                  <span className="text-foreground">{b.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        {/* h1, não h2: o header global tinha o único h1 da aplicação e ele
            saiu — o título da página é o topo da hierarquia do documento. */}
        <h1 className="text-xl font-semibold text-foreground truncate">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>
      )}
    </div>
  );
}
