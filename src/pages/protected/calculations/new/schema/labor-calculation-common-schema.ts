import { z } from "zod";

export const requiredString = (msg: string) => z.string({ message: msg });

export const ClientInfoSectionSchema = z.object({
  clientId: requiredString("Selecione um cliente").min(1, "Selecione um cliente"),
  clientName: z.string().optional(),
  clientDocument: z.string().optional(),
  observations: z.string().optional(),
});

export type ClientInfoSectionType = z.infer<typeof ClientInfoSectionSchema>;

export const ContractSectionSchema = z.object({
  terminationType: z.enum(
    [
      "sem_justa_causa",
      "com_justa_causa",
      "pedido_demissao",
      "rescisao_indireta",
    ] as const,
    {
      error: "Selecione o tipo de rescisão",
    },
  ),

  startDate: requiredString("Data obrigatória").min(1, "Data obrigatória"),
  endDate: requiredString("Data obrigatória").min(1, "Data obrigatória"),
});

export type ContractSectionType = z.infer<typeof ContractSectionSchema>;

export const PriorNoticeSectionSchema = z.object({
  priorNoticeWorked: z.boolean(),
  priorNoticeDate: z.string().optional(),
});

export type PriorNoticeSectionType = z.infer<typeof PriorNoticeSectionSchema>;

export const RemunerationSectionSchema = z.object({
  baseSalary: z.string().optional(),
  lastSalary: z.string().optional(),
  lastThreeSalariesAvg: z.string().optional(),
});

export type RemunerationSectionType = z.infer<typeof RemunerationSectionSchema>;

export const VerbasSectionSchema = z.object({
  unpaid13ths: z
    .string()
    .min(1, "Informe um valor")
    .refine((v) => /^\d+$/.test(v), "Deve ser número inteiro"),
  vacationCount: z
    .string()
    .min(1, "Informe um valor")
    .refine((v) => /^\d+$/.test(v), "Deve ser número inteiro"),
  vacationVencidasCount: z
    .string()
    .min(1, "Informe um valor")
    .refine((v) => /^\d+$/.test(v), "Deve ser número inteiro"),
  extraHours: z
    .string()
    .min(1, "Informe um valor")
    .refine(
      (v) => !Number.isNaN(Number(v)) && Number(v) >= 0,
      "Deve ser número positivo",
    ),
  nightHours: z
    .string()
    .min(1, "Informe um valor")
    .refine(
      (v) => !Number.isNaN(Number(v)) && Number(v) >= 0,
      "Deve ser número positivo",
    ),
});

export type VerbasSectionType = z.infer<typeof VerbasSectionSchema>;

export const RiskAdditivesSectionSchema = z.object({
  insalubrityLevel: z.enum(["0", "10", "20", "40"], {
    message: "Selecione o nível de insalubridade",
  }),
  dangerousWork: z.boolean(),
});

export type RiskAdditivesSectionType = z.infer<
  typeof RiskAdditivesSectionSchema
>;

export const PenaltiesSectionSchema = z.object({
  applyArt477Fine: z.boolean(),
});

export type PenaltiesSectionType = z.infer<typeof PenaltiesSectionSchema>;
