export const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  active: {
    label: "Ativo",
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  },
  past_due: {
    label: "Pagamento pendente",
    className: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  },
  canceled: {
    label: "Cancelado",
    className: "bg-muted text-muted-foreground",
  },
};

export function getStatusConfig(status: string) {
  return (
    STATUS_CONFIG[status] ?? {
      label: "Sem plano",
      className: "bg-muted text-muted-foreground",
    }
  );
}