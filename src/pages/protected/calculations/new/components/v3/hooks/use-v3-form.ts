import { linkCalculationToCase } from "@/http/generated/case/case";
import { useCreateLaborCalculationV3 } from "@/http/generated/labor-calculation-v3/labor-calculation-v3";
import { captureEvent } from "@/lib/analytics";
import { getListLaborCalculationQueryKey } from "@/http/generated/labor-calculation/labor-calculation";
import { queryClient } from "@/lib/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import type { CloneSource } from "../../../@types/clone-source";
import { buildV3Defaults } from "../data/v3-default";
import {
  type V3CalculationFormData,
  v3CalculationSchema,
} from "../v3-calculation-schema";
import { buildNewVerbasPayload } from "./build-new-verbas-payload";
import { periodsToSalaryHistory } from "./periods-to-salary-history";

export default function useV3Form({
  cloneFrom,
  caseId,
  lockedClient,
}: {
  cloneFrom: CloneSource | undefined;
  caseId?: string;
  lockedClient?: { id: string; name: string };
}) {
  const navigate = useNavigate();

  const { mutateAsync: mutateV3, isPending: isPendingV3 } =
    useCreateLaborCalculationV3({
      mutation: {
        onSuccess: async ({ id }) => {
          const promises = []
          if (caseId) {
            promises.push(linkCalculationToCase(caseId, id))
          }
          promises.push(queryClient.invalidateQueries({
            queryKey: getListLaborCalculationQueryKey()
          }))
          await Promise.all(promises)
          captureEvent("calculation_created", { version: "v3", linkedToCase: !!caseId })
          navigate(`/calculations/${id}`)

        },
      },
    });

  const v3Form = useForm<V3CalculationFormData>({
    resolver: zodResolver(v3CalculationSchema),
    defaultValues: buildV3Defaults(cloneFrom, lockedClient),
  });

  async function onV3Submit(data: V3CalculationFormData) {
    const isHistorico = data.salaryMode === "historico";
    const salaryHistory = isHistorico
      ? periodsToSalaryHistory(data.salaryPeriods ?? [])
      : undefined;

    const baseSalary = isHistorico
      ? (salaryHistory?.[0]?.baseSalary ?? 0)
      : Number((data.baseSalary ?? "0").replace(",", "."));
    const lastSalary = isHistorico
      ? (salaryHistory?.[salaryHistory.length - 1]?.lastSalary ?? 0)
      : Number((data.lastSalary ?? "0").replace(",", "."));
    const lastThreeSalariesAvg = isHistorico
      ? (() => {
        if (!salaryHistory || salaryHistory.length === 0) return 0;
        const last3 = salaryHistory.slice(-3);
        return last3.reduce((sum, s) => sum + s.lastSalary, 0) / last3.length;
      })()
      : Number((data.lastThreeSalariesAvg ?? "0").replace(",", "."));

    await mutateV3({
      data: {
        ...(data.clientId ? { clientId: data.clientId } : {}),
        clientName: data.clientName ?? '',
        clientDocument: data.clientDocument || undefined,
        observations: data.observations || undefined,
        terminationType: data.terminationType,
        startDate: data.startDate,
        endDate: data.endDate,
        priorNoticeWorked: data.priorNoticeWorked,
        priorNoticeDate: data.priorNoticeDate || undefined,
        baseSalary,
        lastSalary,
        lastThreeSalariesAvg,
        unpaid13ths: Number(data.unpaid13ths),
        vacationCount: Number(data.vacationCount),
        vacationVencidasCount: Number(data.vacationVencidasCount),
        extraHours: Number(data.extraHours),
        nightHours: Number(data.nightHours),
        insalubrityLevel: Number(data.insalubrityLevel) as 10 | 20 | 40,
        dangerousWork: data.dangerousWork,
        applyArt477Fine: data.applyArt477Fine,
        filingDate: data.filingDate || undefined,
        liquidationDate: data.liquidationDate || undefined,
        nightAdditionalPercent: data.nightAdditionalPercent,
        satRate: data.satRate,
        employerInssRate: data.employerInssRate,
        honorariosRate: data.honorariosRate,
        irpfDependents: data.irpfDependents,
        salaryHistory: salaryHistory?.length ? salaryHistory : undefined,
        ...buildNewVerbasPayload(data),
      },
    });
  }

  return {
    v3Form,
    onV3Submit,
    isPendingV3,
  };
}
