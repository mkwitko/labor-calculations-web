import { Controller, type UseFormReturn } from "react-hook-form";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { FormField } from "../common/form-field";
import { FormSection } from "../common/form-section";
import type { V3CalculationFormData } from "../v3/v3-calculation-schema";

// First-class extra verbas: intervalo intrajornada (art. 71 §4) and adicional
// de transferência (art. 469 §3). Optional — leave blank to skip.
export function AdditionalVerbasSection({
  form,
}: {
  form: UseFormReturn<V3CalculationFormData>;
}) {
  const { control } = form;
  return (
    <FormSection
      title="Verbas adicionais (opcional)"
      description="Intervalo intrajornada (art. 71 §4) e adicional de transferência (art. 469 §3). Preencha apenas se aplicável."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          label="Intervalo intrajornada — horas/mês"
          hint="Horas suprimidas, pagas com +50% (indenizatória)"
        >
          <Controller
            name="intervalIntrajornadaHours"
            control={control}
            render={({ field }) => (
              <Input
                type="number"
                inputMode="decimal"
                min={0}
                placeholder="0"
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value)}
              />
            )}
          />
        </FormField>

        <FormField
          label="Adicional de transferência — meses"
          hint="25% do salário por mês de transferência provisória"
        >
          <Controller
            name="transferAdditionalMonths"
            control={control}
            render={({ field }) => (
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                placeholder="0"
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value)}
              />
            )}
          />
        </FormField>

        <FormField
          label="Estabilidade indenizada — meses"
          hint="Gestante/CIPA/acidentária: salários + 13º + férias + FGTS do período"
        >
          <Controller
            name="stabilityMonths"
            control={control}
            render={({ field }) => (
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                placeholder="0"
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value)}
              />
            )}
          />
        </FormField>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div>
          <p className="text-sm font-medium text-foreground">
            DSR sobre horas extras (Súm. 172 TST)
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Reflexo do repouso semanal sobre horas extras/noturno habituais
          </p>
        </div>
        <Controller
          name="applyDsrOnExtra"
          control={control}
          render={({ field }) => (
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          )}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-border">
        <FormField
          label="FGTS já depositado (R$)"
          hint="Abate do total devido"
        >
          <Controller
            name="fgtsAlreadyDeposited"
            control={control}
            render={({ field }) => (
              <CurrencyInput
                placeholder="0,00"
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value)}
              />
            )}
          />
        </FormField>
        <FormField
          label="Verbas já pagas / TRCT (R$)"
          hint="Abate do total devido"
        >
          <Controller
            name="amountsAlreadyPaid"
            control={control}
            render={({ field }) => (
              <CurrencyInput
                placeholder="0,00"
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value)}
              />
            )}
          />
        </FormField>
      </div>
    </FormSection>
  );
}
