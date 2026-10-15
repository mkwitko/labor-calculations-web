import type { UseFormReturn } from "react-hook-form";
import type { V2CalculationFormData } from "./v2-calculation-shema";

export interface V2CalculationFormProps {
  form: UseFormReturn<V2CalculationFormData>;
  onSubmit: (data: V2CalculationFormData) => Promise<void>;
  isPending: boolean;
  submitLabel: string;
  pendingLabel: string;
  onCancel: () => void;
  clientLocked?: boolean;
}
