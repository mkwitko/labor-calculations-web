import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { GetSharedCalculation200DataSettlementsItem } from "@/http/generated/lexlaboral-server.schemas";
import { useGetSharedCalculation } from "@/http/generated/shared-calculation/shared-calculation";
import {
  formatCurrency,
  formatDate,
  getTerminationTypeLabel,
} from "@/utils/value-format";
import { LockIcon } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function BreakdownRow({
  label,
  value,
  className,
}: {
  label: string;
  value: number | null | undefined;
  className?: string;
}) {
  if (value === null || value === undefined) return null;
  return (
    <div
      className={`flex items-center justify-between py-3 border-b border-border last:border-0 ${className || ""}`}
    >
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground tabular-nums">
        {formatCurrency(value)}
      </span>
    </div>
  );
}

const STATUS_LABELS: Record<string, string> = {
  negotiating: "Negociando",
  accepted: "Aceito",
  rejected: "Recusado",
};

const STATUS_VARIANTS: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  negotiating: "secondary",
  accepted: "default",
  rejected: "destructive",
};

function SettlementRow({
  settlement,
}: {
  settlement: GetSharedCalculation200DataSettlementsItem;
}) {
  return (
    <div className="border border-border rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium tabular-nums">
          {settlement.agreementRate * 100}% de acordo
        </span>
        <Badge variant={STATUS_VARIANTS[settlement.status] ?? "outline"}>
          {STATUS_LABELS[settlement.status] ?? settlement.status}
        </Badge>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-0.5">
          <p className="text-xs text-muted-foreground">Valor do Acordo</p>
          <p className="text-sm font-bold text-primary tabular-nums">
            {formatCurrency(settlement.agreementValue)}
          </p>
        </div>
        <div className="space-y-0.5">
          <p className="text-xs text-muted-foreground">Honorários</p>
          <p className="text-sm font-medium tabular-nums">
            {formatCurrency(settlement.feeAmount)}
          </p>
        </div>
        <div className="space-y-0.5">
          <p className="text-xs text-muted-foreground">Líquido Cliente</p>
          <p className="text-sm font-medium tabular-nums">
            {formatCurrency(settlement.netToClient)}
          </p>
        </div>
      </div>
      <div className="text-xs text-muted-foreground">
        Prazo estimado: {settlement.estimatedTime}
      </div>
    </div>
  );
}

export default function SharedCalculation() {
  const { id } = useParams<{ id: string }>();
  const [code, setCode] = useState("");
  const [fetchCode, setFetchCode] = useState("");

  const {
    data: calc,
    isLoading,
    error,
  } = useGetSharedCalculation(
    id!,
    { code: fetchCode },
    {
      query: {
        enabled: !!fetchCode,
        select: (response) => response.data,
      },
    },
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setFetchCode(code);
  }

  function handleTryAgain() {
    setFetchCode("");
    setCode("");
  }

  if (!fetchCode || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 space-y-4">
            <div className="text-center space-y-2">
              <LockIcon
                className={`mx-auto h-8 w-8 ${error ? "text-destructive" : "text-muted-foreground"}`}
              />
              <h1 className="text-xl font-semibold">
                {error ? "Código Inválido" : "Cálculo Protegido"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {error
                  ? "O código digitado está incorreto. Digite novamente."
                  : "Digite o código de acesso para visualizar este cálculo."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <Input
                type="text"
                placeholder="Digite o código de acesso"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="text-center"
                autoFocus
              />
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !code.trim()}
              >
                {isLoading
                  ? "Verificando..."
                  : error
                    ? "Tentar Novamente"
                    : "Acessar Cálculo"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 space-y-4">
            <div className="text-center space-y-2">
              <LockIcon className="mx-auto h-8 w-8 text-destructive" />
              <h1 className="text-xl font-semibold">Código Inválido</h1>
              <p className="text-sm text-muted-foreground">
                O código digitado está incorreto.
              </p>
            </div>

            <Button onClick={handleTryAgain} className="w-full">
              Digite Outro Código
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!calc) return null;

  return (
    <div className="h-screen bg-background p-4 md:p-6 overflow-y-auto">
      <div className="space-y-4 md:space-y-6">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl font-semibold">{calc.clientName}</h1>
            <p className="text-sm text-muted-foreground">
              {getTerminationTypeLabel(calc.terminationType)} · Compartilhado
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          <div className="bg-card border border-border rounded-xl p-4 md:p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
              Valor Total
            </p>
            <p className="text-2xl font-bold tabular-nums">
              {formatCurrency(calc?.totalValue ?? 0)}
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 md:p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
              Período
            </p>
            <p className="text-sm font-semibold">
              {formatDate(calc?.startDate)} – {formatDate(calc?.endDate)}
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 md:p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
              Rescisão
            </p>
            <p className="text-sm font-semibold">
              {getTerminationTypeLabel(calc.terminationType)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <div className="bg-card border border-border rounded-xl p-4 md:p-5 space-y-4">
            <h3 className="text-sm font-semibold">Dados do Contrato</h3>
            <div className="grid grid-cols-2 gap-4">
              <InfoRow label="Admissão" value={formatDate(calc?.startDate)} />
              <InfoRow label="Demissão" value={formatDate(calc?.endDate)} />
              <InfoRow
                label="Horas extras"
                value={
                  calc?.extraHours && calc.extraHours > 0
                    ? `${calc.extraHours}h`
                    : null
                }
              />
              <InfoRow
                label="Horas noturnas"
                value={
                  calc?.nightHours && calc.nightHours > 0
                    ? `${calc.nightHours}h`
                    : null
                }
              />
              <InfoRow
                label="13ºs não pagos"
                value={
                  calc?.unpaid13ths && calc.unpaid13ths > 0
                    ? String(calc.unpaid13ths)
                    : null
                }
              />
              <InfoRow
                label="Férias (meses)"
                value={
                  calc?.vacationCount && calc.vacationCount > 0
                    ? String(calc.vacationCount)
                    : null
                }
              />
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-4 md:p-5 space-y-4">
            <h3 className="text-sm font-semibold">Remuneração</h3>
            <div className="grid grid-cols-2 gap-4">
              <InfoRow
                label="Salário base"
                value={formatCurrency(calc?.baseSalary)}
              />
              <InfoRow
                label="Último salário"
                value={formatCurrency(calc?.lastSalary)}
              />
              <InfoRow
                label="Média 3 meses"
                value={formatCurrency(calc?.lastThreeSalariesAvg)}
              />
              <InfoRow
                label="Insalubridade"
                value={
                  calc?.insalubrityLevel && calc.insalubrityLevel > 0
                    ? `${calc.insalubrityLevel}%`
                    : null
                }
              />
              <InfoRow
                label="Periculosidade"
                value={calc?.dangerousWork ? "Sim (30%)" : null}
              />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 md:p-5">
          <h3 className="text-sm font-semibold mb-3">Breakdown do Cálculo</h3>
          <BreakdownRow
            label="13º Salário"
            value={calc?.thirteenthSalaryValue}
          />
          <BreakdownRow
            label="Férias Proporcionais"
            value={calc?.vacationValue}
          />
          <BreakdownRow label="FGTS" value={calc?.fgtsValue} />
          <BreakdownRow label="Multa FGTS (40%)" value={calc?.fgtsFineValue} />
          <BreakdownRow
            label="Seguro Desemprego"
            value={calc?.unemploymentInsuranceValue}
          />
          <BreakdownRow label="Horas Extras" value={calc?.extraHoursValue} />
          <BreakdownRow
            label="Adicional Noturno"
            value={calc?.nightAdditionalValue}
          />
          <BreakdownRow label="Aviso Prévio" value={calc?.priorNoticeValue} />
          <BreakdownRow
            label="Periculosidade"
            value={calc?.dangerousWorkValue}
          />
          <BreakdownRow
            label="Insalubridade"
            value={calc?.insalubrityValue}
            className="border-0"
          />

          <div className="flex items-center justify-between pt-4 mt-1">
            <span className="text-sm font-semibold">Total Geral</span>
            <span className="text-xl font-bold tabular-nums">
              {formatCurrency(calc?.totalValue ?? 0)}
            </span>
          </div>
        </div>

        {calc.settlements.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-4 md:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Propostas de Acordo</h3>
              <Badge variant="outline">{calc.settlements.length}</Badge>
            </div>
            {calc.settlements.map((settlement) => (
              <SettlementRow key={settlement.id} settlement={settlement} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
