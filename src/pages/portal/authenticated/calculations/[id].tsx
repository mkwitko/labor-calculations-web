import { ArrowLeftIcon, Loader2Icon } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetClientCalculation } from "@/http/generated/client-portal/client-portal";
import {
  formatCurrency,
  formatDate,
  getStatusLabel,
  getTerminationTypeLabel,
} from "@/utils/value-format";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  em_andamento: "secondary",
  proposta_enviada: "outline",
  acordo_fechado: "default",
  ajuizado: "destructive",
};

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex flex-col gap-0.5 py-3.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <span className="text-xs text-slate-400 dark:text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-900 dark:text-white">
        {value ?? <span className="text-slate-300 dark:text-slate-600 italic">—</span>}
      </span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-950">
      <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
      </div>
      <div className="px-5">{children}</div>
    </div>
  );
}

export default function PortalCalculationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: calc, isLoading } = useGetClientCalculation(id ?? "");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2Icon className="w-5 h-5 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!calc) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3 text-center px-4">
        <p className="text-sm font-medium text-slate-900 dark:text-white">Cálculo não encontrado</p>
        <Button variant="outline" size="sm" onClick={() => navigate("/portal/calculos")}>
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="px-6 py-10 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/portal/calculos")}
          className="mt-0.5 text-slate-400 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeftIcon className="w-4 h-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight truncate">
            {calc.clientName}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={STATUS_VARIANT[calc.status] ?? "secondary"}>
              {getStatusLabel(calc.status)}
            </Badge>
            <span className="text-xs text-slate-400">{getTerminationTypeLabel(calc.terminationType)}</span>
          </div>
        </div>
      </div>

      {/* Total highlight */}
      {calc.totalValue != null && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-5 py-5 text-center">
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-wider font-medium">
            Total calculado
          </p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(Number(calc.totalValue))}
          </p>
        </div>
      )}

      <Section title="Contrato">
        <Field label="Início do contrato" value={formatDate(calc.startDate)} />
        <Field label="Fim do contrato" value={formatDate(calc.endDate)} />
        <Field label="Último salário" value={formatCurrency(Number(calc.lastSalary))} />
        <Field label="Tipo de rescisão" value={getTerminationTypeLabel(calc.terminationType)} />
        {calc.observations && <Field label="Observações" value={calc.observations} />}
      </Section>

      <Section title="Verbas rescisórias">
        <Field label="Aviso prévio" value={formatCurrency(Number(calc.priorNoticeValue))} />
        <Field label="13º salário" value={formatCurrency(Number(calc.thirteenthSalaryValue))} />
        <Field label="Férias" value={formatCurrency(Number(calc.vacationValue))} />
        <Field label="FGTS" value={formatCurrency(Number(calc.fgtsValue))} />
        <Field label="Multa do FGTS" value={formatCurrency(Number(calc.fgtsFineValue))} />
        <Field label="Seguro-desemprego" value={formatCurrency(Number(calc.unemploymentInsuranceValue))} />
        {Number(calc.extraHoursValue) > 0 && (
          <Field label="Horas extras" value={formatCurrency(Number(calc.extraHoursValue))} />
        )}
        {Number(calc.insalubrityValue) > 0 && (
          <Field label="Insalubridade" value={formatCurrency(Number(calc.insalubrityValue))} />
        )}
      </Section>

      <p className="text-xs text-center text-slate-400 dark:text-slate-500 pb-4">
        Calculado em {formatDate(calc.createdAt)} · Valores informativos
      </p>
    </div>
  );
}
