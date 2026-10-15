export const CASE_PHASE_LABELS: Record<string, string> = {
  pre_judicial: "Pré-judicial",
  distribuido: "Distribuído",
  conhecimento: "Conhecimento",
  recurso: "Recurso",
  execucao: "Execução",
  encerrado: "Encerrado",
};

export const CASE_PHASE_COLORS: Record<
  string,
  { bg: string; text: string }
> = {
  pre_judicial: {
    bg: "bg-slate-100 dark:bg-slate-800",
    text: "text-slate-700 dark:text-slate-300",
  },
  distribuido: {
    bg: "bg-blue-100 dark:bg-blue-900/40",
    text: "text-blue-700 dark:text-blue-300",
  },
  conhecimento: {
    bg: "bg-amber-100 dark:bg-amber-900/40",
    text: "text-amber-700 dark:text-amber-300",
  },
  recurso: {
    bg: "bg-orange-100 dark:bg-orange-900/40",
    text: "text-orange-700 dark:text-orange-300",
  },
  execucao: {
    bg: "bg-purple-100 dark:bg-purple-900/40",
    text: "text-purple-700 dark:text-purple-300",
  },
  encerrado: {
    bg: "bg-green-100 dark:bg-green-900/40",
    text: "text-green-700 dark:text-green-300",
  },
};

export type CasePhase =
  | "pre_judicial"
  | "distribuido"
  | "conhecimento"
  | "recurso"
  | "execucao"
  | "encerrado";

export const ALL_PHASES: CasePhase[] = [
  "pre_judicial",
  "distribuido",
  "conhecimento",
  "recurso",
  "execucao",
  "encerrado",
];

export const ACTION_TYPE_LABELS: Record<string, string> = {
  verbas_rescisorias: "Verbas rescisórias",
  horas_extras: "Horas extras",
  equiparacao_salarial: "Equiparação salarial",
  desvio_funcao: "Desvio de função",
  danos_morais: "Danos morais",
  rescisao_indireta: "Rescisão indireta",
  adicional_insalubridade: "Adicional de insalubridade",
  adicional_periculosidade: "Adicional de periculosidade",
  fgts_multa: "FGTS e multa",
  reconhecimento_vinculo: "Reconhecimento de vínculo",
  outro: "Outro",
};

export const ALL_ACTION_TYPES = Object.keys(ACTION_TYPE_LABELS);
