import { formatCurrency } from "@/utils/value-format";
import { useMemo } from "react";
import type { UseFormReturn } from "react-hook-form";
import { estimateLaborTotal } from "../../../utils/labor-estimate";
import type { V2CalculationFormData } from "./v2-calculation-shema";

export function LivePreview({
  form,
}: {
  form: UseFormReturn<V2CalculationFormData>;
}) {
  const values = form.watch();

  const estimate = useMemo(() => {
    if (!values.startDate || !values.endDate || !values.lastSalary) return null;
    const lastSalary = Number((values.lastSalary ?? "0").replace(",", "."));
    const baseSalary = Number((values.baseSalary ?? "0").replace(",", "."));
    if (lastSalary <= 0) return null;
    return estimateLaborTotal({
      startDate: values.startDate,
      endDate: values.endDate,
      lastSalary,
      baseSalary,
      unpaid13ths: Number(values.unpaid13ths ?? "0"),
      vacationCount: Number(values.vacationCount ?? "0"),
      vacationVencidasCount: Number(values.vacationVencidasCount ?? "0"),
      priorNoticeWorked: values.priorNoticeWorked ?? false,
      extraHours: Number(values.extraHours ?? "0"),
      nightHours: Number(values.nightHours ?? "0"),
      insalubrityLevel: Number(values.insalubrityLevel ?? "0"),
      dangerousWork: values.dangerousWork ?? false,
      lastThreeSalariesAvg: Number(
        (values.lastThreeSalariesAvg ?? "0").replace(",", "."),
      ),
      terminationType: values.terminationType ?? "sem_justa_causa",
      applyArt477Fine: values.applyArt477Fine ?? false,
    });
  }, [values]);

  if (!estimate || estimate === 0) return null;

  return (
    <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-lg px-4 py-3">
      <span className="text-sm text-muted-foreground">
        Estimativa do cálculo
      </span>
      <span className="text-lg font-bold text-primary tabular-nums">
        {formatCurrency(estimate)}
      </span>
    </div>
  );
}
