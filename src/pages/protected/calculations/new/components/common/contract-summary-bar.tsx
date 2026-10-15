import { BriefcaseIcon, CalendarIcon, UserIcon } from "lucide-react";

const TERMINATION_LABELS: Record<string, string> = {
  sem_justa_causa: "Sem justa causa",
  com_justa_causa: "Com justa causa",
  pedido_demissao: "Pedido de demissão",
  rescisao_indireta: "Rescisão indireta",
};

function fmtDate(value?: string): string {
  if (!value) return "—";
  const [y, m, d] = value.split("-");
  if (!y || !m || !d) return value;
  return `${d}/${m}/${y}`;
}

function durationLabel(start?: string, end?: string): string | null {
  if (!start || !end) return null;
  const s = new Date(start);
  const e = new Date(end);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime()) || e < s)
    return null;
  const totalMonths =
    (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} ano${years > 1 ? "s" : ""}`);
  if (months > 0) parts.push(`${months} ${months > 1 ? "meses" : "mês"}`);
  return parts.length > 0 ? parts.join(" e ") : "menos de 1 mês";
}

// Persistent recap of the contract data (client, admission/termination dates,
// duration, termination type) shown on wizard steps after they were filled.
export function ContractSummaryBar({
  clientName,
  startDate,
  endDate,
  terminationType,
}: {
  clientName?: string;
  startDate?: string;
  endDate?: string;
  terminationType?: string;
}) {
  const duration = durationLabel(startDate, endDate);
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-lg border border-border bg-muted/40 px-3.5 py-2.5 text-xs text-muted-foreground">
      {clientName && (
        <span className="inline-flex items-center gap-1.5">
          <UserIcon className="w-3.5 h-3.5" />
          <span className="font-medium text-foreground">{clientName}</span>
        </span>
      )}
      <span className="inline-flex items-center gap-1.5">
        <CalendarIcon className="w-3.5 h-3.5" />
        Admissão:{" "}
        <span className="font-medium text-foreground">{fmtDate(startDate)}</span>
      </span>
      <span className="inline-flex items-center gap-1.5">
        <CalendarIcon className="w-3.5 h-3.5" />
        Rescisão:{" "}
        <span className="font-medium text-foreground">{fmtDate(endDate)}</span>
      </span>
      {duration && (
        <span className="inline-flex items-center gap-1.5">
          <BriefcaseIcon className="w-3.5 h-3.5" />
          {duration}
        </span>
      )}
      {terminationType && TERMINATION_LABELS[terminationType] && (
        <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 font-medium">
          {TERMINATION_LABELS[terminationType]}
        </span>
      )}
    </div>
  );
}
