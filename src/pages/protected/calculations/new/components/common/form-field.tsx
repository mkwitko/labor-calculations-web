import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}

export function FormField({
  label,
  htmlFor,
  error,
  hint,
  children,
  className,
}: Props) {
  return (
    <div className={cn("space-y-4", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {hint && <p className="text-xs text-muted-foreground -mt-0.5">{hint}</p>}
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
