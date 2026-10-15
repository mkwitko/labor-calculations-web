/**
 * Fases do processo em linguagem simples, para o cliente. Deliberadamente
 * diferente de `pages/protected/cases/utils/case-phase.ts`, que usa o termo
 * jurídico porque quem lê ali é advogado.
 */
export const PORTAL_PHASES = [
  {
    key: "pre_judicial",
    label: "Preparação",
    desc: "Reunindo documentos e definindo a estratégia da ação.",
  },
  {
    key: "distribuido",
    label: "Processo iniciado",
    desc: "A ação foi protocolada e distribuída na Justiça do Trabalho.",
  },
  {
    key: "conhecimento",
    label: "Em análise",
    desc: "Fase de audiências e produção de provas.",
  },
  {
    key: "recurso",
    label: "Recurso",
    desc: "A decisão está sendo reanalisada por uma instância superior.",
  },
  {
    key: "execucao",
    label: "Execução",
    desc: "Cobrança dos valores reconhecidos na decisão.",
  },
  {
    key: "encerrado",
    label: "Encerrado",
    desc: "O processo foi finalizado.",
  },
] as const;

export function portalPhaseLabel(phase: string): string {
  return PORTAL_PHASES.find((p) => p.key === phase)?.label ?? phase;
}
