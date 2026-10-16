import { env } from "@/env";
import type { GetLaborCalculation200 } from "@/http/generated/labor-calculations-api.schemas";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/value-format";
import { ChevronRightIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { estimateLaborTotal } from "../../utils/labor-estimate";

const TERMINATION_LABELS: Record<string, string> = {
  sem_justa_causa: "Sem Justa Causa",
  com_justa_causa: "Com Justa Causa",
  pedido_demissao: "Pedido de Demissão",
  rescisao_indireta: "Rescisão Indireta",
};

export function ComparacaoRescisao({ calc }: { calc: GetLaborCalculation200 }) {
  const [expanded, setExpanded] = useState(false);

  const alternatives = useMemo(() => {
    const allTypes = [
      "sem_justa_causa",
      "com_justa_causa",
      "pedido_demissao",
      "rescisao_indireta",
    ];
    const others = allTypes.filter((t) => t !== calc.terminationType);
    return others.map((type) => ({
      type,
      label: TERMINATION_LABELS[type],
      estimate: estimateLaborTotal({
        startDate: new Date(calc.startDate).toISOString(),
        endDate: new Date(calc.endDate).toISOString(),
        lastSalary: calc.lastSalary,
        baseSalary: calc.baseSalary,
        unpaid13ths: calc.unpaid13ths,
        vacationCount: calc.vacationCount,
        vacationVencidasCount: calc.vacationVencidasCount ?? 0,
        priorNoticeWorked: calc.priorNoticeWorked,
        extraHours: calc.extraHours,
        nightHours: calc.nightHours,
        insalubrityLevel: calc.insalubrityLevel,
        dangerousWork: calc.dangerousWork,
        lastThreeSalariesAvg: calc.lastThreeSalariesAvg,
        terminationType: type,
        applyArt477Fine: calc.applyArt477Fine ?? false,
        fgtsRate: env.VITE_DEFAULT_FGTS_RATE,
        minimumWage: env.VITE_DEFAULT_MINIMUM_WAGE,
      }),
    }));
  }, [calc]);

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 md:px-5 py-4 text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Comparação de Tipos de Rescisão
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Estimativa para os outros tipos com os mesmos dados
          </p>
        </div>
        <ChevronRightIcon
          className={cn(
            "w-4 h-4 text-muted-foreground transition-transform",
            expanded && "rotate-90",
          )}
        />
      </button>
      {expanded && (
        <div className="border-t border-border divide-y divide-border">
          <div className="flex items-center justify-between px-4 md:px-5 py-3">
            <span className="text-sm font-medium text-foreground">
              {TERMINATION_LABELS[calc.terminationType]}{" "}
              <span className="text-xs font-normal text-primary ml-1">
                (atual)
              </span>
            </span>
            <span className="text-sm font-bold text-foreground tabular-nums">
              {formatCurrency(calc.totalValue)}
            </span>
          </div>
          {alternatives.map(({ type, label, estimate }) => (
            <div
              key={type}
              className="flex items-center justify-between px-4 md:px-5 py-3"
            >
              <span className="text-sm text-muted-foreground">{label}</span>
              <span className="text-sm font-medium text-foreground tabular-nums">
                {formatCurrency(estimate)}
              </span>
            </div>
          ))}
          <p className="px-4 md:px-5 py-2.5 text-xs text-muted-foreground/60">
            Valores alternativos são estimativas — crie um novo cálculo para o
            valor exato.
          </p>
        </div>
      )}
    </div>
  );
}
