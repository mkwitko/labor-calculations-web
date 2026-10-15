import type { CloneSource } from "../../../@types/clone-source";
import { toDateStr } from "../../../utils/date-str";
import type { V2CalculationFormData } from "../v2-calculation-shema";

export function buildV2Defaults(
  cloneFrom?: CloneSource,
  lockedClient?: { id: string; name: string },
): Partial<V2CalculationFormData> {
  const base: Partial<V2CalculationFormData> = {
    clientId: lockedClient?.id ?? '',
    clientName: lockedClient?.name,
    priorNoticeWorked: false,
    dangerousWork: false,
    insalubrityLevel: "10" as const,
    unpaid13ths: "0",
    vacationCount: "0",
    vacationVencidasCount: "0",
    extraHours: "0",
    nightHours: "0",
    applyArt477Fine: false,
  };
  if (!cloneFrom) return base;
  return {
    ...base,
    clientId: (cloneFrom as { clientId?: string }).clientId ?? '',
    clientName: cloneFrom.clientName ?? '',
    clientDocument: cloneFrom.clientDocument ?? '',
    terminationType:
      (cloneFrom.terminationType as V2CalculationFormData["terminationType"]) ??
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
    ) as V2CalculationFormData["insalubrityLevel"],
    dangerousWork: cloneFrom.dangerousWork ?? false,
    applyArt477Fine: cloneFrom.applyArt477Fine ?? false,
    observations: cloneFrom.observations ?? "",
  };
}
