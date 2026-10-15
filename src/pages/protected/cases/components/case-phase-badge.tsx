import { cn } from "@/lib/utils";
import { CASE_PHASE_COLORS, CASE_PHASE_LABELS } from "../utils/case-phase";

type Props = {
  phase: string;
  className?: string;
};

export function CasePhaseBadge({ phase, className }: Props) {
  const colors = CASE_PHASE_COLORS[phase];
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
        colors?.bg,
        colors?.text,
        className,
      )}
    >
      {CASE_PHASE_LABELS[phase] ?? phase}
    </span>
  );
}
