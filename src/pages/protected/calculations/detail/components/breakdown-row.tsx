import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/value-format";
import React from "react";
import { CitationBadge } from "./citation-badge";

type BreakdownRowProps = {
  label: React.ReactNode;
  value: number | null | undefined;
  citation?: string;
  className?: string;
  dimIfZero?: boolean;
};

export function BreakdownRow({ label, value, citation, className, dimIfZero }: BreakdownRowProps) {
  const v = value ?? 0;
  return (
    <div
      className={cn(
        "py-2.5 border-b border-border last:border-0",
        className,
      )}
    >
      <div className={cn("flex items-center justify-between", dimIfZero && v === 0 ? "opacity-40" : "",)}>
        <span className="text-sm text-muted-foreground flex items-center flex-wrap">
          {label}
          {citation && <CitationBadge citation={citation} />}
        </span>
        <span className="text-sm font-medium text-foreground tabular-nums ml-4">
          {formatCurrency(v)}
        </span>
      </div>

    </div>
  );
}
