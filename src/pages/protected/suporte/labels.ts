/**
 * Vocabulário do canal de suporte.
 *
 * O mesmo status tem nome diferente nos dois fluxos — `concluido` é "resolvido"
 * num chamado e "entregue" numa sugestão. O back faz a mesma tradução para o
 * e-mail (`support-service.ts`); as duas precisam concordar, senão o aviso diz
 * uma coisa e a tela outra.
 */

// União local, e não o tipo gerado: o Orval cria um enum por endpoint
// (`CreateSupportTicketBodyKind`, `GetSupportTicket200Kind`, ...) com os mesmos
// valores, e amarrar a tela a um deles obrigaria a converter nos outros.
export type SupportKind = "duvida" | "problema" | "sugestao";

export type SupportStatus =
  | "aberto"
  | "em_analise"
  | "aguardando_usuario"
  | "planejado"
  | "em_desenvolvimento"
  | "concluido"
  | "recusado";

export const KIND_LABELS: Record<SupportKind, string> = {
  duvida: "Dúvida",
  problema: "Problema",
  sugestao: "Sugestão",
};

export const KIND_DESCRIPTIONS: Record<SupportKind, string> = {
  duvida: "Não sei como fazer alguma coisa no LexLaboral.",
  problema: "Alguma coisa não funcionou como deveria.",
  sugestao: "Tenho uma ideia do que o LexLaboral deveria fazer.",
};

export function statusLabel(status: SupportStatus, kind: SupportKind): string {
  const suggestion = kind === "sugestao";

  switch (status) {
    case "aberto":
      return suggestion ? "Recebida" : "Aberto";
    case "em_analise":
      return "Em análise";
    case "aguardando_usuario":
      return "Aguardando você";
    case "planejado":
      return "Planejada";
    case "em_desenvolvimento":
      return "Em desenvolvimento";
    case "concluido":
      return suggestion ? "Entregue" : "Resolvido";
    case "recusado":
      return suggestion ? "Não vamos fazer" : "Encerrado";
    default:
      return status;
  }
}

/** Cor do selo. Neutro para o que espera, verde para o que terminou bem. */
export function statusTone(status: SupportStatus): string {
  switch (status) {
    case "concluido":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
    case "recusado":
      return "border-border bg-muted text-muted-foreground";
    case "aguardando_usuario":
      return "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400";
    case "em_desenvolvimento":
    case "planejado":
      return "border-primary/20 bg-primary/10 text-primary";
    default:
      return "border-border bg-muted/60 text-foreground";
  }
}

/** Estágios que o atendimento pode escolher, por tipo de assunto. */
export const STATUS_OPTIONS: Record<SupportKind, SupportStatus[]> = {
  duvida: ["aberto", "em_analise", "aguardando_usuario", "concluido", "recusado"],
  problema: [
    "aberto",
    "em_analise",
    "aguardando_usuario",
    "em_desenvolvimento",
    "concluido",
    "recusado",
  ],
  sugestao: [
    "aberto",
    "em_analise",
    "planejado",
    "em_desenvolvimento",
    "concluido",
    "recusado",
  ],
};
