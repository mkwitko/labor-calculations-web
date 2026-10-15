import { CoinsIcon } from "lucide-react";
import { useGetFinanceSummary } from "@/http/generated/dashboard/dashboard";
import { formatCurrency } from "@/utils/value-format";
import { cn } from "@/lib/utils";

// Office financial summary card: agreed / received / receivable / overdue.
export function FinanceSummary() {
  const { data } = useGetFinanceSummary();
  if (!data || data.acceptedSettlements === 0) return null;

  const items = [
    { label: "Acordado", value: data.agreedTotal, tone: "text-foreground" },
    {
      label: "Recebido",
      value: data.received,
      tone: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "A receber",
      value: data.receivable,
      tone: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Em atraso",
      value: data.overdue,
      tone: "text-red-600 dark:text-red-400",
    },
  ];

  return (
    <div className="bg-card border border-border rounded-xl">
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border">
        <CoinsIcon className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">
          Financeiro do escritório
        </h3>
        <span className="text-xs text-muted-foreground ml-auto">
          {data.acceptedSettlements} acordo
          {data.acceptedSettlements > 1 ? "s" : ""}
        </span>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-border">
        {items.map((i) => (
          <div key={i.label} className="px-4 py-4">
            <p className="text-xs text-muted-foreground">{i.label}</p>
            <p className={cn("text-lg font-bold tabular-nums mt-0.5", i.tone)}>
              {formatCurrency(i.value)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
