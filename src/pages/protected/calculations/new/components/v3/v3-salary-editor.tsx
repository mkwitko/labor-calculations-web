import { CurrencyInput } from "@/components/ui/currency-input";
import { DatePicker } from "@/components/ui/date-picker";
import { PlusIcon, TrashIcon, Upload } from "lucide-react";
import { type UseFormReturn, useFieldArray, Controller } from "react-hook-form";
import type { V3CalculationFormData } from "./v3-calculation-schema";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function SalaryPeriodsEditor({
  form,
}: {
  form: UseFormReturn<V3CalculationFormData>;
}) {
  const { control, watch, setValue } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "salaryPeriods",
  });

  const contractStart = watch("startDate");
  const contractEnd = watch("endDate");

  const autoGenerate = () => {
    if (!contractStart || !contractEnd) return;
    const start = new Date(contractStart);
    const end = new Date(contractEnd);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return;

    const periods: { startDate: string; endDate: string; salary: string }[] =
      [];
    const current = new Date(start.getFullYear(), start.getMonth(), 1);
    const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);

    while (current <= endMonth) {
      const monthStart = new Date(current.getFullYear(), current.getMonth(), 1);
      const monthEnd = new Date(
        current.getFullYear(),
        current.getMonth() + 1,
        0,
      );
      const isFirst =
        current.getFullYear() === start.getFullYear() &&
        current.getMonth() === start.getMonth();
      const isLast =
        current.getFullYear() === end.getFullYear() &&
        current.getMonth() === end.getMonth();
      const pStart = isFirst
        ? contractStart
        : monthStart.toISOString().split("T")[0];
      const pEnd = isLast ? contractEnd : monthEnd.toISOString().split("T")[0];
      periods.push({
        startDate: pStart,
        endDate: pEnd,
        salary: "",
      });
      current.setMonth(current.getMonth() + 1);
    }

    setValue("salaryPeriods", periods, { shouldDirty: true });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">
            Períodos salariais
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Informe o período e o salário vigente. O histórico será convertido
            para o cálculo de FGTS e correção monetária.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {contractStart && contractEnd && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={autoGenerate}
            >
              <PlusIcon className="w-3.5 h-3.5" />
              Gerar meses
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ startDate: "", endDate: "", salary: "" })}
          >
            <PlusIcon className="w-3.5 h-3.5" />
            Adicionar
          </Button>
        </div>
      </div>

      {fields.length > 0 && (
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 px-3 py-2 bg-muted/50 border-b border-border text-xs font-medium text-muted-foreground">
            <span>Início</span>
            <span>Fim</span>
            <span>Salário</span>
            <span className="w-7" />
          </div>
          <div className="max-h-72 overflow-y-auto divide-y divide-border">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 px-3 py-2 items-center"
              >
                <Controller
                  name={`salaryPeriods.${index}.startDate`}
                  control={control}
                  render={({ field: f }) => (
                    <DatePicker
                      value={f.value}
                      onChange={f.onChange}
                      placeholder="Início"
                    />
                  )}
                />
                <Controller
                  name={`salaryPeriods.${index}.endDate`}
                  control={control}
                  render={({ field: f }) => (
                    <DatePicker
                      value={f.value}
                      onChange={f.onChange}
                      placeholder="Fim"
                    />
                  )}
                />
                <Controller
                  name={`salaryPeriods.${index}.salary`}
                  control={control}
                  render={({ field: f }) => (
                    <CurrencyInput
                      placeholder="0,00"
                      value={f.value}
                      onChange={(e) => f.onChange(e.target.value)}
                    />
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Remover"
                  onClick={() => remove(index)}
                  className="shrink-0"
                >
                  <TrashIcon className="w-3.5 h-3.5 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {fields.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {fields.length} período{fields.length !== 1 ? "s" : ""} cadastrado
          {fields.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
