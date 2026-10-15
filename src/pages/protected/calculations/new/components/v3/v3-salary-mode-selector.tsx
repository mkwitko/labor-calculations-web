import { cn } from "@/lib/utils";
import type { SalaryMode } from "./v3-calculation-type";

export function SalaryModeSelector({
  value,
  onChange,
}: {
  value: SalaryMode;
  onChange: (mode: SalaryMode) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <button
        type="button"
        onClick={() => onChange("simplificado")}
        className={cn(
          "flex flex-col items-start gap-1 rounded-lg border-2 px-4 py-3 text-left transition-colors",
          value === "simplificado"
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50",
        )}
      >
        <span className="text-sm font-medium text-foreground">
          Simplificado
        </span>
        <span className="text-xs text-muted-foreground">
          Informe salário base, último salário e média
        </span>
      </button>
      <button
        type="button"
        onClick={() => onChange("historico")}
        className={cn(
          "flex flex-col items-start gap-1 rounded-lg border-2 px-4 py-3 text-left transition-colors",
          value === "historico"
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50",
        )}
      >
        <span className="text-sm font-medium text-foreground">
          Histórico salarial
        </span>
        <span className="text-xs text-muted-foreground">
          Informe períodos com salários vigentes
        </span>
      </button>
    </div>
  );
}
