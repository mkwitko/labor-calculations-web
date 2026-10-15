import { PlusIcon, TrashIcon } from "lucide-react";
import { Controller, type UseFormReturn, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { FormField } from "../common/form-field";
import { FormSection } from "../common/form-section";
import type { V3CalculationFormData } from "../v3/v3-calculation-schema";

export function SalaryDifferenceSection({
  form,
}: {
  form: UseFormReturn<V3CalculationFormData>;
}) {
  const {
    control,
    watch,
    register,
    formState: { errors },
  } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "salaryDifferencePeriods",
  });

  const enabled = watch("salaryDifferenceEnabled");
  const type = watch("salaryDifferenceType");
  const mode = watch("salaryDifferenceMode");
  const contractStart = watch("startDate")?.slice(0, 7);
  const contractEnd = watch("endDate")?.slice(0, 7);

  const valueLabel =
    mode === "valor" ? "Diferença mensal (R$)" : "Salário devido (R$)";

  return (
    <FormSection
      title="Diferenças Salariais"
      description="Equiparação salarial (Art. 461 CLT) ou desvio de função"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">
            Pleitear diferenças salariais
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Diferença calculada mês a mês, com correção, juros e reflexos
          </p>
        </div>
        <Controller
          name="salaryDifferenceEnabled"
          control={control}
          render={({ field }) => (
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          )}
        />
      </div>

      {enabled && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Tipo de pleito">
              <Controller
                name="salaryDifferenceType"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equiparacao">
                        Equiparação salarial (Art. 461 CLT)
                      </SelectItem>
                      <SelectItem value="desvio_funcao">
                        Desvio de função
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
            <FormField label="Modo de entrada">
              <Controller
                name="salaryDifferenceMode"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paradigma">
                        Salário do paradigma (sistema calcula a diferença)
                      </SelectItem>
                      <SelectItem value="valor">
                        Valor direto da diferença mensal
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
          </div>

          {type === "equiparacao" && (
            <FormField
              label="Nome do paradigma"
              hint="Empregado usado como referência (opcional)"
            >
              <Input placeholder="Nome do paradigma" {...register("paradigmName")} />
            </FormField>
          )}

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                Gerar reflexos
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                13º, férias + 1/3, aviso prévio e FGTS + multa 40% (Súm. 226 TST)
              </p>
            </div>
            <Controller
              name="salaryDifferenceApplyReflexos"
              control={control}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">
                Períodos da diferença
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({
                    startMonth: contractStart ?? "",
                    endMonth: contractEnd ?? "",
                    value: "",
                  })
                }
              >
                <PlusIcon className="w-3.5 h-3.5" />
                Adicionar período
              </Button>
            </div>

            {typeof errors.salaryDifferencePeriods?.message === "string" && (
              <p className="text-xs text-destructive">
                {errors.salaryDifferencePeriods.message}
              </p>
            )}

            {fields.length > 0 && (
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 px-3 py-2 bg-muted/50 border-b border-border text-xs font-medium text-muted-foreground">
                  <span>Mês inicial</span>
                  <span>Mês final</span>
                  <span>{valueLabel}</span>
                  <span className="w-7" />
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-border">
                  {fields.map((field, index) => {
                    const rowErrors =
                      errors.salaryDifferencePeriods?.[index];
                    return (
                      <div
                        key={field.id}
                        className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 px-3 py-2 items-start"
                      >
                        <div className="space-y-1">
                          <Input
                            type="month"
                            {...register(
                              `salaryDifferencePeriods.${index}.startMonth`,
                            )}
                          />
                          {rowErrors?.startMonth && (
                            <p className="text-xs text-destructive">
                              {rowErrors.startMonth.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <Input
                            type="month"
                            {...register(
                              `salaryDifferencePeriods.${index}.endMonth`,
                            )}
                          />
                          {rowErrors?.endMonth && (
                            <p className="text-xs text-destructive">
                              {rowErrors.endMonth.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <Controller
                            name={`salaryDifferencePeriods.${index}.value`}
                            control={control}
                            render={({ field: f }) => (
                              <CurrencyInput
                                placeholder="0,00"
                                value={f.value}
                                onChange={(e) => f.onChange(e.target.value)}
                              />
                            )}
                          />
                          {rowErrors?.value && (
                            <p className="text-xs text-destructive">
                              {rowErrors.value.message}
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
        </div>
      )}
    </FormSection>
  );
}
