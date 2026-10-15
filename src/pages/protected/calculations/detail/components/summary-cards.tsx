import type { GetLaborCalculation200 } from "@/http/generated/lexlaboral-server.schemas";
import { formatCurrency, formatDate, getTerminationTypeLabel } from "@/utils/value-format";
import type { ResultV3 } from "../types";

type Props = {
  calc: GetLaborCalculation200;
  isV3: boolean;
  resultV3: ResultV3 | null;
};

export function SummaryCards({ calc, isV3, resultV3 }: Props) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        <div className="bg-card border border-border rounded-xl p-4 md:p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
            {isV3 ? "Líquido Devido Reclamante" : "Valor Total"}
          </p>
          <p className="text-2xl font-bold text-foreground tabular-nums">
            {formatCurrency(
              isV3 && resultV3
                ? resultV3.liquidoDevidoReclamante
                : (calc?.totalValue ?? 0),
            )}
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 md:p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
            Período
          </p>
          <p className="text-sm font-semibold text-foreground">
            {formatDate(calc?.startDate)} – {formatDate(calc?.endDate)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {calc?.priorNoticeWorked
              ? "Aviso prévio trabalhado"
              : "Aviso prévio indenizado"}
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 md:p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
            Rescisão
          </p>
          <p className="text-sm font-semibold text-foreground">
            {getTerminationTypeLabel(calc.terminationType)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {isV3 ? "Liquidação (v3)" : `Versão ${calc.calculationVersion ?? "—"}`}
          </p>
        </div>
      </div>

      {isV3 && resultV3 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Bruto Reclamante
            </p>
            <p className="text-lg font-bold text-foreground tabular-nums">
              {formatCurrency(resultV3.brutoDevidoReclamante)}
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Descontos
            </p>
            <p className="text-lg font-bold text-foreground tabular-nums">
              -{formatCurrency(resultV3.totalDescontos)}
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Total Devido Reclamado
            </p>
            <p className="text-lg font-bold text-foreground tabular-nums">
              {formatCurrency(resultV3.totalDevidoReclamado)}
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Honorários Líquidos
            </p>
            <p className="text-lg font-bold text-foreground tabular-nums">
              {formatCurrency(resultV3.honorariosLiquidos)}
            </p>
          </div>
          {resultV3.percentualRemuneratorio > 0 && (
            <div
              className="bg-card border border-border rounded-xl p-4"
              title="Percentual de verbas de natureza salarial sobre o total bruto corrigido. Usado como base para IRPF e INSS."
            >
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                % Remuneratório
              </p>
              <p className="text-lg font-bold text-foreground tabular-nums">
                {resultV3.percentualRemuneratorio.toFixed(2).replace(".", ",")}%
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
