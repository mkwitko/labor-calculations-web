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
import { FormSection } from "../common/form-section";
import type { V3CalculationFormData } from "../v3/v3-calculation-schema";

export function CustomVerbasSection({
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
    name: "customVerbas",
  });

  const contractStart = watch("startDate")?.slice(0, 7);
  const contractEnd = watch("endDate")?.slice(0, 7);

  // Presets for common verbas — pre-fill name + nature; período do contrato.
  const PRESETS: {
    label: string;
    name: string;
    nature: "salarial" | "indenizatoria";
  }[] = [
    { label: "Comissões", name: "Comissões habituais", nature: "salarial" },
    { label: "Gratificação de função", name: "Gratificação de função", nature: "salarial" },
    { label: "Quinquênio/anuênio", name: "Quinquênio/anuênio", nature: "salarial" },
    { label: "Sobreaviso", name: "Sobreaviso (Art. 244 §2)", nature: "salarial" },
    { label: "Gorjetas", name: "Gorjetas habituais", nature: "salarial" },
    { label: "PLR", name: "PLR", nature: "indenizatoria" },
    { label: "Multa normativa", name: "Multa normativa (CCT/ACT)", nature: "indenizatoria" },
  ];

  const addPreset = (p: (typeof PRESETS)[number]) =>
    append({
      name: p.name,
      monthlyValue: "",
      startMonth: contractStart ?? "",
      endMonth: contractEnd ?? "",
      nature: p.nature,
    });

  return (
    <FormSection
      title="Outras Verbas"
      description="Verbas adicionais com nome livre — multiplicadas pelos meses do período, com correção e juros"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          Natureza <span className="font-medium">salarial</span> gera FGTS +
          multa 40%, INSS/IRPF e reflexos; <span className="font-medium">indenizatória</span>{" "}
          soma apenas o valor corrigido com juros.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            append({
              name: "",
              monthlyValue: "",
              startMonth: contractStart ?? "",
              endMonth: contractEnd ?? "",
              nature: "indenizatoria",
            })
          }
        >
          <PlusIcon className="w-3.5 h-3.5" />
          Adicionar verba
        </Button>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-3">
        <span className="text-xs text-muted-foreground self-center mr-1">
          Atalhos:
        </span>
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => addPreset(p)}
            className="text-xs px-2 py-1 rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
          >
            + {p.label}
          </button>
        ))}
      </div>

      {fields.length > 0 && (
        <div className="mt-4 space-y-3">
          {fields.map((field, index) => {
            const rowErrors = errors.customVerbas?.[index];
            return (
              <div
                key={field.id}
                className="border border-border rounded-lg p-3 space-y-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_auto] gap-2 items-start">
                  <div className="space-y-1">
                    <Input
                      placeholder="Nome da verba (ex: Comissões não pagas)"
                      {...register(`customVerbas.${index}.name`)}
                    />
                    {rowErrors?.name && (
                      <p className="text-xs text-destructive">
                        {rowErrors.name.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Controller
                      name={`customVerbas.${index}.monthlyValue`}
                      control={control}
                      render={({ field: f }) => (
                        <CurrencyInput
                          placeholder="Valor mensal"
                          value={f.value}
                          onChange={(e) => f.onChange(e.target.value)}
                        />
                      )}
                    />
                    {rowErrors?.monthlyValue && (
                      <p className="text-xs text-destructive">
                        {rowErrors.monthlyValue.message}
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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-start">
                  <div className="space-y-1">
                    <Input
                      type="month"
                      {...register(`customVerbas.${index}.startMonth`)}
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
                      {...register(`customVerbas.${index}.endMonth`)}
                    />
                    {rowErrors?.endMonth && (
                      <p className="text-xs text-destructive">
                        {rowErrors.endMonth.message}
                      </p>
                    )}
                  </div>
                  <Controller
                    name={`customVerbas.${index}.nature`}
                    control={control}
                    render={({ field: f }) => (
                      <Select value={f.value} onValueChange={f.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Natureza" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="indenizatoria">
                            Indenizatória
                          </SelectItem>
                          <SelectItem value="salarial">Salarial</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </FormSection>
  );
}
