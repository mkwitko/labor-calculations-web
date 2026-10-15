export function formatCurrency(value: number | undefined | null): string {
  if (value == null || Number.isNaN(value)) return "";
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatDate(value: string | Date | undefined): string {
  if (!value) return "";
  let year: number, month: number, day: number;

  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    [year, month, day] = value.split("-").map(Number);
  } else {
    const date = new Date(value);
    year = date.getUTCFullYear();
    month = date.getUTCMonth() + 1;
    day = date.getUTCDate();
  }

  return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
}

export function getHearingKindLabel(kind: string): string {
  const map: Record<string, string> = {
    inicial: "Audiência Inicial",
    conciliacao: "Conciliação",
    instrucao: "Instrução",
    julgamento: "Julgamento",
    outra: "Audiência",
  };
  return map[kind] ?? kind;
}

export function getDeadlineKindLabel(kind: string, customLabel?: string | null): string {
  if (customLabel) return customLabel;
  const map: Record<string, string> = {
    contestacao: "Contestação",
    recurso_ordinario: "Recurso Ordinário",
    embargos: "Embargos",
    outros: "Prazo",
  };
  return map[kind] ?? kind;
}

export function formatDateTime(value: string | Date | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getTerminationTypeLabel(type: string): string {
  const map: Record<string, string> = {
    sem_justa_causa: "Sem justa causa",
    com_justa_causa: "Com justa causa",
    pedido_demissao: "Pedido de demissão",
    rescisao_indireta: "Rescisão Indireta"
  };
  return map[type] ?? type;
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    em_andamento: "Em Andamento",
    proposta_enviada: "Proposta Enviada",
    acordo_fechado: "Acordo Fechado",
    ajuizado: "Ajuizado",
  };
  return map[status] ?? status;
}
