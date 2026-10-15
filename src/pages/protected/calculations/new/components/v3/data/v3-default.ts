import type { CloneSource } from "../../../@types/clone-source";
import { toDateStr } from "../../../utils/date-str";
import type { V3CalculationFormData } from "../v3-calculation-schema";

export function buildV3Defaults(
  cloneFrom?: CloneSource,
  lockedClient?: { id: string; name: string },
): Partial<V3CalculationFormData> {
  const base: Partial<V3CalculationFormData> = {
    clientId: lockedClient?.id ?? '',
    clientName: lockedClient?.name,
    salaryMode: "simplificado",
    priorNoticeWorked: false,
    dangerousWork: false,
    insalubrityLevel: "10" as const,
    unpaid13ths: "0",
    vacationCount: "0",
    vacationVencidasCount: "0",
    extraHours: "0",
    nightHours: "0",
    applyArt477Fine: false,
    nightAdditionalPercent: 20,
    satRate: 3,
    employerInssRate: 20,
    honorariosRate: 15,
    irpfDependents: 0,
    applyArt467: false,
    applyPrescricaoQuinquenal: false,
    salaryDifferenceEnabled: false,
    salaryDifferenceType: "equiparacao",
    salaryDifferenceMode: "paradigma",
    salaryDifferenceApplyReflexos: true,
    salaryDifferencePeriods: [],
    customVerbas: [],
    unpaidSalariesEnabled: false,
    unpaidSalaries: [],
    intervalIntrajornadaHours: "",
    transferAdditionalMonths: "",
    applyDsrOnExtra: false,
    stabilityMonths: "",
    fgtsAlreadyDeposited: "",
    amountsAlreadyPaid: "",
  };
  if (!cloneFrom) return base;
  return {
    ...base,
    salaryMode: "simplificado",
    clientId: (cloneFrom as { clientId?: string }).clientId ?? '',
    clientName: cloneFrom.clientName ?? '',
    clientDocument: cloneFrom.clientDocument ?? '',
    terminationType:
      (cloneFrom.terminationType as V3CalculationFormData["terminationType"]) ??
      "sem_justa_causa",
    startDate: toDateStr(cloneFrom.startDate),
    endDate: toDateStr(cloneFrom.endDate),
    priorNoticeWorked: cloneFrom.priorNoticeWorked ?? false,
    priorNoticeDate: toDateStr(cloneFrom.priorNoticeDate),
    baseSalary: String(cloneFrom.baseSalary ?? ""),
    lastSalary: String(cloneFrom.lastSalary ?? ""),
    lastThreeSalariesAvg: String(cloneFrom.lastThreeSalariesAvg ?? ""),
    unpaid13ths: String(cloneFrom.unpaid13ths ?? 0),
    vacationCount: String(cloneFrom.vacationCount ?? 0),
    vacationVencidasCount: String(cloneFrom.vacationVencidasCount ?? 0),
    extraHours: String(cloneFrom.extraHours ?? 0),
    nightHours: String(cloneFrom.nightHours ?? 0),
    insalubrityLevel: String(
      cloneFrom.insalubrityLevel ?? 0,
    ) as V3CalculationFormData["insalubrityLevel"],
    dangerousWork: cloneFrom.dangerousWork ?? false,
    applyArt477Fine: cloneFrom.applyArt477Fine ?? false,
    observations: cloneFrom.observations ?? "",
    filingDate: toDateStr(cloneFrom.filingDate) || undefined,
    liquidationDate: toDateStr(cloneFrom.liquidationDate) || undefined,
    nightAdditionalPercent: cloneFrom.nightAdditionalPercent ?? 20,
    satRate: cloneFrom.satRate != null ? cloneFrom.satRate * 100 : 3,
    employerInssRate:
      cloneFrom.employerInssRate != null
        ? cloneFrom.employerInssRate * 100
        : 20,
    honorariosRate:
      cloneFrom.honorariosRate != null ? cloneFrom.honorariosRate * 100 : 15,
    irpfDependents: cloneFrom.irpfDependents ?? 0,
  };
}
