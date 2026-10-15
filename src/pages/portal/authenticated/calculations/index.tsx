import { Badge } from "@/components/ui/badge";
import { useListClientCalculations } from "@/http/generated/client-portal/client-portal";
import type { ListClientCalculations200DataItem } from "@/http/generated/lexlaboral-server.schemas";
import {
  formatCurrency,
  formatDate,
  getStatusLabel,
  getTerminationTypeLabel,
} from "@/utils/value-format";
import { CalendarIcon, ChevronRightIcon, FileTextIcon, Loader2Icon } from "lucide-react";
import { useNavigate } from "react-router-dom";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  em_andamento: "secondary",
  proposta_enviada: "outline",
  acordo_fechado: "default",
  ajuizado: "destructive",
};

function CalcRow({ calc }: { calc: ListClientCalculations200DataItem }) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate(`/portal/calculos/${calc.id}`)}
      className="w-full text-left flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0"
    >
      <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
        <FileTextIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{calc.clientName}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <CalendarIcon className="w-3 h-3 text-slate-400" />
          <span className="text-xs text-slate-400">{formatDate(calc.endDate)}</span>
          <span className="text-xs text-slate-300 dark:text-slate-600">·</span>
          <span className="text-xs text-slate-400">{getTerminationTypeLabel(calc.terminationType)}</span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        {calc.totalValue != null && (
          <span className="text-sm font-semibold text-slate-900 dark:text-white">
            {formatCurrency(calc.totalValue)}
          </span>
        )}
        <Badge variant={STATUS_VARIANT[calc.status] ?? "secondary"} className="text-xs">
          {getStatusLabel(calc.status)}
        </Badge>
      </div>
      <ChevronRightIcon className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
    </button>
  );
}

export default function PortalCalculations() {
  const { data, isLoading } = useListClientCalculations({ limit: 50 });

  return (
    <div className="px-6 py-10 max-w-7xl mx-auto w-full space-y-8">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Meus cálculos
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Cálculos trabalhistas vinculados ao seu processo
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-950">
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2Icon className="w-5 h-5 animate-spin text-slate-400" />
          </div>
        )}

        {!isLoading && data?.data.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-6">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <FileTextIcon className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">Nenhum cálculo disponível</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
              Seu advogado ainda não vinculou cálculos à sua conta.
            </p>
          </div>
        )}

        {!isLoading && data?.data.map((calc) => (
          <CalcRow key={calc.id} calc={calc} />
        ))}
      </div>
    </div>
  );
}
