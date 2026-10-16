import type { GetLaborCalculation200 } from "@/http/generated/labor-calculations-api.schemas";
import { formatCurrency } from "@/utils/value-format";
import { BreakdownRow } from "./breakdown-row";
import { V3Breakdown } from "./v3-breakdown";
import { CLT_CITATIONS, type ResultV3 } from "../types";

type Props = {
  calc: GetLaborCalculation200;
  isV2: boolean;
  isV3: boolean;
  resultV3: ResultV3 | null;
};

export function CalcBreakdown({ calc, isV2, isV3, resultV3 }: Props) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-5">
      <div className="border-b border-border pb-3 mb-1">
        <h3 className="text-sm font-semibold text-foreground">
          {isV3 ? "Memória de Cálculo — Liquidação" : "Breakdown do Cálculo"}
        </h3>
      </div>

      {isV3 && resultV3 ? (
        <V3Breakdown result={resultV3} />
      ) : (
        <>
          <div>
            <BreakdownRow
              label="13º Salário"
              value={calc?.thirteenthSalaryValue}
              citation={CLT_CITATIONS.thirteenth}
              dimIfZero
            />
            <BreakdownRow
              label="Férias Proporcionais"
              value={
                isV2
                  ? (calc?.vacationValue ?? 0) - (calc?.doubleVacationValue ?? 0)
                  : calc?.vacationValue
              }
              citation={CLT_CITATIONS.vacation}
              dimIfZero
            />
            {isV2 && (calc?.doubleVacationValue ?? 0) > 0 && (
              <BreakdownRow
                label="Férias em Dobro (extra)"
                value={calc?.doubleVacationValue}
                citation={CLT_CITATIONS.doubleVacation}
              />
            )}
            <BreakdownRow
              label="FGTS"
              value={calc?.fgtsValue}
              citation={CLT_CITATIONS.fgts}
              dimIfZero
            />
            <BreakdownRow
              label="Multa FGTS (40%)"
              value={calc?.fgtsFineValue}
              citation={CLT_CITATIONS.fgtsFine}
              dimIfZero
            />
            <BreakdownRow
              label="Seguro Desemprego"
              value={calc?.unemploymentInsuranceValue}
              citation={CLT_CITATIONS.unemployment}
              dimIfZero
            />
            <BreakdownRow
              label="Horas Extras"
              value={calc?.extraHoursValue}
              citation={CLT_CITATIONS.extraHours}
              dimIfZero
            />
            <BreakdownRow
              label="Adicional Noturno"
              value={calc?.nightAdditionalValue}
              citation={CLT_CITATIONS.nightAdditional}
              dimIfZero
            />
            <BreakdownRow
              label="Aviso Prévio"
              value={calc?.priorNoticeValue}
              citation={CLT_CITATIONS.priorNotice}
              dimIfZero
            />
            <BreakdownRow
              label="Periculosidade"
              value={calc?.dangerousWorkValue}
              citation={CLT_CITATIONS.dangerous}
              dimIfZero
            />
            <BreakdownRow
              label="Insalubridade"
              value={calc?.insalubrityValue}
              citation={CLT_CITATIONS.insalubrity}
              dimIfZero
            />

            {isV2 && (
              <>
                <BreakdownRow
                  label="Reflexo s/ 13º"
                  value={calc?.reflexo13thValue}
                  citation={CLT_CITATIONS.reflexos}
                />
                <BreakdownRow
                  label="Reflexo s/ Férias"
                  value={calc?.reflexoVacationValue}
                  citation={CLT_CITATIONS.reflexos}
                />
                <BreakdownRow
                  label="Reflexo s/ FGTS"
                  value={calc?.reflexoFGTSValue}
                  citation={CLT_CITATIONS.reflexos}
                />
                <BreakdownRow
                  label="Reflexo s/ Multa FGTS"
                  value={calc?.reflexoMultaFGTSValue}
                  citation={CLT_CITATIONS.reflexos}
                />
                <BreakdownRow
                  label="Multa Art. 477"
                  value={calc?.art477FineValue}
                  citation={CLT_CITATIONS.art477}
                />
              </>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 mt-1 border-t border-border">
            <span className="text-sm font-semibold text-foreground">Total Geral</span>
            <span className="text-xl font-bold text-foreground tabular-nums">
              {formatCurrency(
                isV3 && resultV3
                  ? resultV3.totalDevidoReclamado
                  : (calc?.totalValue ?? 0),
              )}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
