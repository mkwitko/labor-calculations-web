import { z } from "zod";
import {
  ClientInfoSectionSchema,
  ContractSectionSchema,
  PenaltiesSectionSchema,
  PriorNoticeSectionSchema,
  RemunerationSectionSchema,
  RiskAdditivesSectionSchema,
  VerbasSectionSchema,
} from "../../schema/labor-calculation-common-schema";

export const v2CalculationSchema = z
  .object({
    ...ClientInfoSectionSchema.shape,
    ...ContractSectionSchema.shape,
    ...PriorNoticeSectionSchema.shape,
    ...RemunerationSectionSchema.shape,
    ...VerbasSectionSchema.shape,
    ...RiskAdditivesSectionSchema.shape,
    ...PenaltiesSectionSchema.shape,
  })
  .superRefine((data, ctx) => {
    if (data.startDate && data.endDate && data.endDate < data.startDate) {
      ctx.addIssue({
        code: "custom",
        message: "Data de demissão deve ser após a admissão",
        path: ["endDate"],
      });
    }
    const isComJustaCausa = data.terminationType === "com_justa_causa";
    if (!isComJustaCausa) {
      if (data.priorNoticeWorked && !data.priorNoticeDate) {
        ctx.addIssue({
          code: "custom",
          message: "Informe a data do aviso prévio",
          path: ["priorNoticeDate"],
        });
      }
      if (
        !data.lastThreeSalariesAvg ||
        Number((data.lastThreeSalariesAvg ?? "0").replace(",", ".")) <= 0
      ) {
        ctx.addIssue({
          code: "custom",
          message: "Informe a média salarial",
          path: ["lastThreeSalariesAvg"],
        });
      }
      if (!data.unpaid13ths || !/^\d+$/.test(data.unpaid13ths)) {
        ctx.addIssue({
          code: "custom",
          message: "Deve ser número inteiro",
          path: ["unpaid13ths"],
        });
      }
      if (!data.vacationCount || !/^\d+$/.test(data.vacationCount)) {
        ctx.addIssue({
          code: "custom",
          message: "Deve ser número inteiro",
          path: ["vacationCount"],
        });
      }
    }
    const vacation = Number(data.vacationCount ?? "0");
    const vencidas = Number(data.vacationVencidasCount);
    if (
      !Number.isNaN(vacation) &&
      !Number.isNaN(vencidas) &&
      vencidas > vacation
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Não pode ser maior que o total de férias",
        path: ["vacationVencidasCount"],
      });
    }
  });

export type V2CalculationFormData = z.infer<typeof v2CalculationSchema>;
