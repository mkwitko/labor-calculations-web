import type { UseFormReturn } from "react-hook-form";
import type { V3CalculationFormData } from "./v3-calculation-schema";

export interface V3CalculationFormProps {
  form: UseFormReturn<V3CalculationFormData>;
  onSubmit: (data: V3CalculationFormData) => Promise<void>;
  isPending: boolean;
  submitLabel: string;
  pendingLabel: string;
  onCancel: () => void;
  clientLocked?: boolean;
}

export type SalaryMode = "simplificado" | "historico";
