import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface Props {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function FormSection({
  title,
  description,
  children,
  className,
}: Props) {
  return (
    <div
      className={cn(
        "bg-card border border-border rounded-xl space-y-3",
        className,
      )}
    >
      <div className="border-b border-border pb-3 p-5">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <div className="p-5 pt-2">{children}</div>
    </div>
  );
}
