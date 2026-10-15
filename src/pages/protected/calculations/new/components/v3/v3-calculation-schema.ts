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

export const v3CalculationSchema = z
  .object({
    ...ClientInfoSectionSchema.shape,
    ...ContractSectionSchema.shape,
    ...PriorNoticeSectionSchema.shape,
    ...RemunerationSectionSchema.shape,
    ...VerbasSectionSchema.shape,
    ...RiskAdditivesSectionSchema.shape,
    ...PenaltiesSectionSchema.shape,

    salaryMode: z
      .enum(["simplificado", "historico"] as const)
      .default("simplificado")
      .optional(),

    filingDate: z.string().optional(),
    liquidationDate: z.string().optional(),
    nightAdditionalPercent: z.number().min(0).max(100).optional(),
    satRate: z.number().min(0).max(100).optional(),
    employerInssRate: z.number().min(0).max(100).optional(),
    honorariosRate: z.number().min(0).max(100).optional(),
    irpfDependents: z.number().int().min(0).optional(),

    salaryPeriods: z
      .array(
        z.object({
          startDate: z.string(),
          endDate: z.string(),
          salary: z.string(),
        }),
      )
      .optional(),

    applyArt467: z.boolean(),
    applyPrescricaoQuinquenal: z.boolean(),

    salaryDifferenceEnabled: z.boolean(),
    salaryDifferenceType: z.enum(["equiparacao", "desvio_funcao"] as const),
    salaryDifferenceMode: z.enum(["paradigma", "valor"] as const),
    paradigmName: z.string().optional(),
    salaryDifferenceApplyReflexos: z.boolean(),
    salaryDifferencePeriods: z
      .array(
        z.object({
          startMonth: z.string(),
          endMonth: z.string(),
          value: z.string(),
        }),
      )
      .optional(),

    customVerbas: z
      .array(
        z.object({
          name: z.string(),
          monthlyValue: z.string(),
          startMonth: z.string(),
          endMonth: z.string(),
          nature: z.enum(["indenizatoria", "salarial"] as const),
        }),
      )
      .optional(),

    unpaidSalariesEnabled: z.boolean(),
    unpaidSalaries: z
      .array(
        z.object({
          month: z.string(),
          daysWorked: z.string(),
        }),
      )
      .optional(),

    intervalIntrajornadaHours: z.string().optional(),
    transferAdditionalMonths: z.string().optional(),
    applyDsrOnExtra: z.boolean().optional(),
    stabilityMonths: z.string().optional(),
    fgtsAlreadyDeposited: z.string().optional(),
    amountsAlreadyPaid: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.startDate && data.endDate && data.endDate < data.startDate) {
      ctx.addIssue({
        code: "custom",
        message: "Data de demissão deve ser após a admissão",
        path: ["endDate"],
      });
    }
    if (data.priorNoticeWorked && !data.priorNoticeDate) {
      ctx.addIssue({
        code: "custom",
        message: "Informe a data do aviso prévio",
        path: ["priorNoticeDate"],
      });
    }
    const isComJustaCausa = data.terminationType === "com_justa_causa";
    if (!isComJustaCausa) {
      const vacation = Number(data.vacationCount);
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
    }
    if (data.salaryMode === "simplificado") {
      if (
        !data.baseSalary ||
        Number((data.baseSalary ?? "0").replace(",", ".")) <= 0
      ) {
        ctx.addIssue({
          code: "custom",
          message: "Informe o salário base",
          path: ["baseSalary"],
        });
      }
      if (
        !data.lastSalary ||
        Number((data.lastSalary ?? "0").replace(",", ".")) <= 0
      ) {
        ctx.addIssue({
          code: "custom",
          message: "Informe o último salário",
          path: ["lastSalary"],
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
    }
    if (data.salaryMode === "historico") {
      const periods = data.salaryPeriods ?? [];

      if (periods.length === 0) {
        ctx.addIssue({
          code: "custom",
          message: "Adicione ao menos um período salarial",
          path: ["salaryPeriods"],
        });
      }

      const contractStart = data.startDate;
      const contractEnd = data.endDate;

      for (const [i, p] of periods.entries()) {
        if (!p.startDate) {
          ctx.addIssue({
            code: "custom",
            message: "Início obrigatório",
            path: ["salaryPeriods", i, "startDate"],
          });
        }

        if (!p.endDate) {
          ctx.addIssue({
            code: "custom",
            message: "Fim obrigatório",
            path: ["salaryPeriods", i, "endDate"],
          });
        }

        if (!p.salary || Number(p.salary.replace(",", ".")) <= 0) {
          ctx.addIssue({
            code: "custom",
            message: "Informe o salário",
            path: ["salaryPeriods", i, "salary"],
          });
        }

        // 🔴 NOVO: validação de range interno
        if (p.startDate && p.endDate && p.endDate < p.startDate) {
          ctx.addIssue({
            code: "custom",
            message: "Fim deve ser após o início",
            path: ["salaryPeriods", i, "endDate"],
          });
        }

        // 🔴 NOVO: dentro do contrato
        if (contractStart && p.startDate && p.startDate < contractStart) {
          ctx.addIssue({
            code: "custom",
            message: "Período não pode iniciar antes da admissão",
            path: ["salaryPeriods", i, "startDate"],
          });
        }

        if (contractEnd && p.endDate && p.endDate > contractEnd) {
          ctx.addIssue({
            code: "custom",
            message: "Período não pode terminar após a demissão",
            path: ["salaryPeriods", i, "endDate"],
          });
        }
      }

      // 🔴 (opcional mas MUITO importante): evitar sobreposição
      const sorted = [...periods]
        .filter((p) => p.startDate && p.endDate)
        .sort((a, b) => a.startDate.localeCompare(b.startDate));

      for (let i = 1; i < sorted.length; i++) {
        const prev = sorted[i - 1];
        const curr = sorted[i];

        if (prev.endDate >= curr.startDate) {
          ctx.addIssue({
            code: "custom",
            message: "Períodos não podem se sobrepor",
            path: ["salaryPeriods"],
          });
          break;
        }
      }
    }

    const contractStartMonth = data.startDate?.slice(0, 7);
    const contractEndMonth = data.endDate?.slice(0, 7);

    if (data.salaryDifferenceEnabled) {
      const periods = data.salaryDifferencePeriods ?? [];
      if (periods.length === 0) {
        ctx.addIssue({
          code: "custom",
          message: "Adicione ao menos um período",
          path: ["salaryDifferencePeriods"],
        });
      }
      for (const [i, p] of periods.entries()) {
        if (!p.startMonth) {
          ctx.addIssue({
            code: "custom",
            message: "Início obrigatório",
            path: ["salaryDifferencePeriods", i, "startMonth"],
          });
        }
        if (!p.endMonth) {
          ctx.addIssue({
            code: "custom",
            message: "Fim obrigatório",
            path: ["salaryDifferencePeriods", i, "endMonth"],
          });
        }
        if (p.startMonth && p.endMonth && p.endMonth < p.startMonth) {
          ctx.addIssue({
            code: "custom",
            message: "Fim deve ser após o início",
            path: ["salaryDifferencePeriods", i, "endMonth"],
          });
        }
        if (
          contractStartMonth &&
          p.startMonth &&
          p.startMonth < contractStartMonth
        ) {
          ctx.addIssue({
            code: "custom",
            message: "Antes da admissão",
            path: ["salaryDifferencePeriods", i, "startMonth"],
          });
        }
        if (contractEndMonth && p.endMonth && p.endMonth > contractEndMonth) {
          ctx.addIssue({
            code: "custom",
            message: "Após a rescisão",
            path: ["salaryDifferencePeriods", i, "endMonth"],
          });
        }
        if (!p.value || Number(p.value.replace(",", ".")) <= 0) {
          ctx.addIssue({
            code: "custom",
            message:
              data.salaryDifferenceMode === "valor"
                ? "Informe o valor da diferença"
                : "Informe o salário do paradigma",
            path: ["salaryDifferencePeriods", i, "value"],
          });
        }
      }
    }

    for (const [i, verba] of (data.customVerbas ?? []).entries()) {
      if (!verba.name.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "Informe o nome da verba",
          path: ["customVerbas", i, "name"],
        });
      }
      if (!verba.monthlyValue || Number(verba.monthlyValue.replace(",", ".")) <= 0) {
        ctx.addIssue({
          code: "custom",
          message: "Informe o valor mensal",
          path: ["customVerbas", i, "monthlyValue"],
        });
      }
      if (!verba.startMonth) {
        ctx.addIssue({
          code: "custom",
          message: "Início obrigatório",
          path: ["customVerbas", i, "startMonth"],
        });
      }
      if (!verba.endMonth) {
        ctx.addIssue({
          code: "custom",
          message: "Fim obrigatório",
          path: ["customVerbas", i, "endMonth"],
        });
      }
      if (
        verba.startMonth &&
        verba.endMonth &&
        verba.endMonth < verba.startMonth
      ) {
        ctx.addIssue({
          code: "custom",
          message: "Fim deve ser após o início",
          path: ["customVerbas", i, "endMonth"],
        });
      }
    }

    if (data.unpaidSalariesEnabled) {
      const entries = data.unpaidSalaries ?? [];
      if (entries.length === 0) {
        ctx.addIssue({
          code: "custom",
          message: "Adicione ao menos um mês",
          path: ["unpaidSalaries"],
        });
      }
      for (const [i, entry] of entries.entries()) {
        if (!entry.month) {
          ctx.addIssue({
            code: "custom",
            message: "Mês obrigatório",
            path: ["unpaidSalaries", i, "month"],
          });
        }
        const days = Number(entry.daysWorked);
        if (Number.isNaN(days) || days < 1 || days > 30) {
          ctx.addIssue({
            code: "custom",
            message: "Dias entre 1 e 30",
            path: ["unpaidSalaries", i, "daysWorked"],
          });
        }
      }
    }
  });

export type V3CalculationFormData = z.infer<typeof v3CalculationSchema>;
