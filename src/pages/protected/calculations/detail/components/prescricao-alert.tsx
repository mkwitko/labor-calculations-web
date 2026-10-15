import { useMemo } from "react";
import { AlertTriangleIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/value-format";

export function PrescricaoAlert({ endDate }: { endDate: string | Date }) {
  const info = useMemo(() => {
    const dismissal = new Date(endDate);
    const now = new Date();
    const daysElapsed = (now.getTime() - dismissal.getTime()) / (1000 * 60 * 60 * 24);
    const cutoffDate = new Date(dismissal);
    cutoffDate.setFullYear(cutoffDate.getFullYear() - 5);
    return { daysElapsed, cutoffDate };
  }, [endDate]);

  if (info.daysElapsed < 365) return null;

  const isExpired = info.daysElapsed > 730;
  const isWarning = !isExpired && info.daysElapsed > 548;

  if (!isExpired && !isWarning) return null;

  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-xl border px-4 py-3",
        isExpired
          ? "border-destructive/30 bg-destructive/5"
          : "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40",
      )}
    >
      <AlertTriangleIcon
        className={cn(
          "w-4 h-4 shrink-0 mt-0.5",
          isExpired ? "text-destructive" : "text-amber-600 dark:text-amber-400",
        )}
      />
      <div>
        <p
          className={cn(
            "text-sm font-semibold",
            isExpired ? "text-destructive" : "text-amber-800 dark:text-amber-300",
          )}
        >
          {isExpired
            ? "Prazo prescricional expirado — Art. 7º, XXIX CF"
            : "Atenção: prazo prescricional próximo do vencimento"}
        </p>
        <p
          className={cn(
            "text-xs mt-0.5",
            isExpired
              ? "text-destructive/80"
              : "text-amber-700 dark:text-amber-400",
          )}
        >
          {isExpired
            ? "Já se passaram mais de 2 anos da demissão. Nenhuma ação trabalhista pode ser ajuizada."
            : `Faltam aprox. ${Math.ceil((730 - info.daysElapsed))} dias para o prazo de 2 anos expirar (Art. 7º, XXIX CF).`}
          {` Período prescrito: verbas anteriores a ${formatDate(info.cutoffDate)}.`}
        </p>
      </div>
    </div>
  );
}
