import { formatCurrency } from "@/utils/value-format";
import { useMemo } from "react";
import type { UseFormReturn } from "react-hook-form";
import { estimateLaborV3 } from "../../../utils/labor-estimate-v3";
import type { V3CalculationFormData } from "./v3-calculation-schema";

export function LivePreviewV3({
  form,
}: {
  form: UseFormReturn<V3CalculationFormData>;
}) {
  const values = form.watch();

  const estimate = useMemo(() => {
    if (!values.startDate || !values.endDate) return null;
    const lastSalary = Number((values.lastSalary ?? "0").replace(",", "."));
    const baseSalary = Number((values.baseSalary ?? "0").replace(",", "."));
    if (values.salaryMode === "simplificado" && lastSalary <= 0) return null;
    if (values.salaryMode === "historico") {
      const periods = values.salaryPeriods ?? [];
      if (periods.length === 0) return null;
    }
    return estimateLaborV3({
      startDate: values.startDate,
      endDate: values.endDate,
      lastSalary:
        values.salaryMode === "simplificado" ? lastSalary : baseSalary,
      baseSalary:
        values.salaryMode === "simplificado" ? baseSalary : lastSalary,
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
      applyArt467: values.applyArt467 ?? false,
      applyPrescricaoQuinquenal: values.applyPrescricaoQuinquenal ?? false,
      salaryDifferencePeriods: values.salaryDifferenceEnabled
        ? (values.salaryDifferencePeriods ?? [])
            .filter((p) => p.startMonth && p.endMonth && p.value)
            .map((p) => {
              const monthly = Number(p.value.replace(",", "."));
              // "paradigma" mode: value is the due salary — diff = due − last salary
              const diff =
                values.salaryDifferenceMode === "valor"
                  ? monthly
                  : Math.max(
                      0,
                      monthly -
                        Number((values.lastSalary ?? "0").replace(",", ".")),
                    );
              return {
                startMonth: p.startMonth,
                endMonth: p.endMonth,
                monthly: diff,
              };
            })
        : [],
      salaryDifferenceApplyReflexos:
        values.salaryDifferenceApplyReflexos ?? true,
      customVerbas: (values.customVerbas ?? [])
        .filter((v) => v.startMonth && v.endMonth && v.monthlyValue)
        .map((v) => ({
          startMonth: v.startMonth,
          endMonth: v.endMonth,
          monthly: Number(v.monthlyValue.replace(",", ".")),
          nature: v.nature,
        })),
      unpaidSalaryDays: values.unpaidSalariesEnabled
        ? (values.unpaidSalaries ?? []).reduce(
            (sum, u) => sum + (Number(u.daysWorked) || 0),
            0,
          )
        : 0,
      intervalIntrajornadaHours: values.intervalIntrajornadaHours
        ? Number(values.intervalIntrajornadaHours.replace(",", "."))
        : 0,
      transferAdditionalMonths: values.transferAdditionalMonths
        ? Number(values.transferAdditionalMonths)
        : 0,
      applyDsrOnExtra: values.applyDsrOnExtra ?? false,
      stabilityMonths: values.stabilityMonths
        ? Number(values.stabilityMonths)
        : 0,
      deductions:
        (values.fgtsAlreadyDeposited
          ? Number(values.fgtsAlreadyDeposited.replace(",", "."))
          : 0) +
        (values.amountsAlreadyPaid
          ? Number(values.amountsAlreadyPaid.replace(",", "."))
          : 0),
    });
  }, [values]);

  if (!estimate || estimate === 0) return null;

  return (
    <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-lg px-4 py-3">
      <span className="text-sm text-muted-foreground">
        Estimativa (sem correção/juros)
      </span>
      <span className="text-lg font-bold text-primary tabular-nums">
        {formatCurrency(estimate)}
      </span>
    </div>
  );
}
