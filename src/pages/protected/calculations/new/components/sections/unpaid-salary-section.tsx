import { PlusIcon, TrashIcon } from "lucide-react";
import { Controller, type UseFormReturn, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { FormSection } from "../common/form-section";
import type { V3CalculationFormData } from "../v3/v3-calculation-schema";

export function UnpaidSalarySection({
  form,
}: {
  form: UseFormReturn<V3CalculationFormData>;
}) {
  const {
    control,
    watch,
    register,
    setValue,
    formState: { errors },
  } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "unpaidSalaries",
  });

  const enabled = watch("unpaidSalariesEnabled");
  const endDate = watch("endDate");

  const defaultEntry = () => {
    // Pre-fill with the termination month and the days worked in it
    // ("trabalhou X dias no mês da rescisão e não recebeu")
    if (endDate) {
      return {
        month: endDate.slice(0, 7),
        daysWorked: String(Math.min(Number(endDate.slice(8, 10)) || 30, 30)),
      };
    }
    return { month: "", daysWorked: "" };
  };

  return (
    <FormSection
      title="Saldo de Salário"
      description="Dias trabalhados e não pagos (Art. 462 CLT)"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">
            Há saldo de salário não pago?
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Ex: trabalhou 15 dias no mês da rescisão e não recebeu
          </p>
        </div>
        <Controller
          name="unpaidSalariesEnabled"
          control={control}
          render={({ field }) => (
            <Switch
              checked={field.value}
              onCheckedChange={(checked) => {
                field.onChange(checked);
                if (checked && fields.length === 0) {
                  append(defaultEntry());
                }
                if (!checked) {
                  setValue("unpaidSalaries", []);
                }
              }}
            />
          )}
        />
      </div>

      {enabled && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Valor por mês: (último salário ÷ 30) × dias trabalhados
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ month: "", daysWorked: "" })}
            >
              <PlusIcon className="w-3.5 h-3.5" />
              Adicionar mês
            </Button>
          </div>

          {typeof errors.unpaidSalaries?.message === "string" && (
            <p className="text-xs text-destructive">
              {errors.unpaidSalaries.message}
            </p>
          )}

          {fields.length > 0 && (
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="grid grid-cols-[1fr_1fr_auto] gap-2 px-3 py-2 bg-muted/50 border-b border-border text-xs font-medium text-muted-foreground">
                <span>Mês</span>
                <span>Dias trabalhados</span>
                <span className="w-7" />
              </div>
              <div className="divide-y divide-border">
                {fields.map((field, index) => {
                  const rowErrors = errors.unpaidSalaries?.[index];
                  return (
                    <div
                      key={field.id}
                      className="grid grid-cols-[1fr_1fr_auto] gap-2 px-3 py-2 items-start"
                    >
                      <div className="space-y-1">
                        <Input
                          type="month"
                          {...register(`unpaidSalaries.${index}.month`)}
                        />
                        {rowErrors?.month && (
                          <p className="text-xs text-destructive">
                            {rowErrors.month.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <Input
                          type="number"
                          inputMode="numeric"
                          min={1}
                          max={30}
                          placeholder="Dias (1-30)"
                          {...register(`unpaidSalaries.${index}.daysWorked`)}
                        />
                        {rowErrors?.daysWorked && (
                          <p className="text-xs text-destructive">
                            {rowErrors.daysWorked.message}
                          </p>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Remover"
                        onClick={() => remove(index)}
                        className="shrink-0 mt-1"
                      >
                        <TrashIcon className="w-3.5 h-3.5 text-muted-foreground" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </FormSection>
  );
}
