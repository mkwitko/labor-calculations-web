import type {
  CreateLaborCalculationV3BodyCustomVerbasItem,
  CreateLaborCalculationV3BodySalaryDifference,
  CreateLaborCalculationV3BodyUnpaidSalariesItem,
} from "@/http/generated/lexlaboral-server.schemas";
import type { V3CalculationFormData } from "../v3-calculation-schema";

const toNumber = (value: string) => Number(value.replace(",", "."));

// Maps the wizard's new-verbas fields (art. 467, prescrição, equiparação/desvio,
// outras verbas, saldo de salário) to the API payload shape.
// Shared by the create hook and the edit page.
export function buildNewVerbasPayload(data: V3CalculationFormData): {
  applyArt467: boolean;
  applyPrescricaoQuinquenal: boolean;
  salaryDifference: CreateLaborCalculationV3BodySalaryDifference | undefined;
  customVerbas: CreateLaborCalculationV3BodyCustomVerbasItem[] | undefined;
  unpaidSalaries: CreateLaborCalculationV3BodyUnpaidSalariesItem[] | undefined;
  intervalIntrajornadaHours: number | undefined;
  transferAdditionalMonths: number | undefined;
  applyDsrOnExtra: boolean | undefined;
  stabilityMonths: number | undefined;
  fgtsAlreadyDeposited: number | undefined;
  amountsAlreadyPaid: number | undefined;
} {
  const isValorDireto = data.salaryDifferenceMode === "valor";

  const salaryDifference =
    data.salaryDifferenceEnabled && data.salaryDifferencePeriods?.length
      ? {
          type: data.salaryDifferenceType,
          paradigmName: data.paradigmName || undefined,
          applyReflexos: data.salaryDifferenceApplyReflexos,
          periods: data.salaryDifferencePeriods.map((p) => ({
            startMonth: p.startMonth,
            endMonth: p.endMonth,
            dueSalary: toNumber(p.value),
            // "valor direto" mode: the informed value IS the difference,
            // so received = 0 and due = difference
            ...(isValorDireto ? { receivedSalary: 0 } : {}),
          })),
        }
      : undefined;

  const customVerbas = data.customVerbas?.length
    ? data.customVerbas.map((v) => ({
        name: v.name.trim(),
        monthlyValue: toNumber(v.monthlyValue),
        startMonth: v.startMonth,
        endMonth: v.endMonth,
        nature: v.nature,
      }))
    : undefined;

  const unpaidSalaries =
    data.unpaidSalariesEnabled && data.unpaidSalaries?.length
      ? data.unpaidSalaries.map((u) => ({
          month: u.month,
          daysWorked: Number(u.daysWorked),
        }))
      : undefined;

  const intervalIntrajornadaHours = data.intervalIntrajornadaHours
    ? toNumber(data.intervalIntrajornadaHours)
    : undefined;
  const transferAdditionalMonths = data.transferAdditionalMonths
    ? Number(data.transferAdditionalMonths)
    : undefined;

  return {
    applyArt467: data.applyArt467,
    applyPrescricaoQuinquenal: data.applyPrescricaoQuinquenal,
    salaryDifference,
    customVerbas,
    unpaidSalaries,
    intervalIntrajornadaHours,
    transferAdditionalMonths,
    applyDsrOnExtra: data.applyDsrOnExtra || undefined,
    stabilityMonths: data.stabilityMonths
      ? Number(data.stabilityMonths)
      : undefined,
    fgtsAlreadyDeposited: data.fgtsAlreadyDeposited
      ? toNumber(data.fgtsAlreadyDeposited)
      : undefined,
    amountsAlreadyPaid: data.amountsAlreadyPaid
      ? toNumber(data.amountsAlreadyPaid)
      : undefined,
  };
}
