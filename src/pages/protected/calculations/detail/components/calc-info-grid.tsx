import type { GetLaborCalculation200 } from "@/http/generated/lexlaboral-server.schemas";
import { formatCurrency, formatDate } from "@/utils/value-format";
import { InfoRow } from "./info-row";

type Props = {
  calc: GetLaborCalculation200;
  isV2: boolean;
};

export function CalcInfoGrid({ calc, isV2 }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
      <div className="bg-card border border-border rounded-xl p-4 md:p-5 space-y-4">
        <div className="border-b border-border pb-3">
          <h3 className="text-sm font-semibold text-foreground">Dados do Contrato</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <InfoRow label="Admissão" value={formatDate(calc?.startDate)} />
          <InfoRow label="Demissão" value={formatDate(calc?.endDate)} />
          {calc?.priorNoticeDate && (
            <InfoRow
              label="Data do aviso prévio"
              value={formatDate(calc.priorNoticeDate)}
            />
          )}
          <InfoRow
            label="Horas extras"
            value={(calc?.extraHours ?? 0) > 0 ? `${calc!.extraHours}h` : null}
          />
          <InfoRow
            label="Horas noturnas"
            value={(calc?.nightHours ?? 0) > 0 ? `${calc!.nightHours}h` : null}
          />
          <InfoRow
            label="13ºs não pagos"
            value={(calc?.unpaid13ths ?? 0) > 0 ? String(calc!.unpaid13ths) : null}
          />
          <InfoRow
            label="Férias (períodos)"
            value={(calc?.vacationCount ?? 0) > 0 ? String(calc!.vacationCount) : null}
          />
          {isV2 && (calc?.vacationVencidasCount ?? 0) > 0 && (
            <InfoRow
              label="Férias vencidas (dobro)"
              value={String(calc!.vacationVencidasCount)}
            />
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-4 md:p-5 space-y-4">
        <div className="border-b border-border pb-3">
          <h3 className="text-sm font-semibold text-foreground">Remuneração</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <InfoRow label="Salário base" value={formatCurrency(calc?.baseSalary)} />
          <InfoRow label="Último salário" value={formatCurrency(calc?.lastSalary)} />
          <InfoRow label="Média 3 meses" value={formatCurrency(calc?.lastThreeSalariesAvg)} />
          <InfoRow
            label="Insalubridade"
            value={(calc?.insalubrityLevel ?? 0) > 0 ? `${calc!.insalubrityLevel}%` : null}
          />
          <InfoRow
            label="Periculosidade"
            value={calc?.dangerousWork ? "Sim (30%)" : null}
          />
        </div>
      </div>
    </div>
  );
}
