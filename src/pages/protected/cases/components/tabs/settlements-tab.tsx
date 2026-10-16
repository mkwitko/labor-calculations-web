import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { GetCase200 } from "@/http/generated/labor-calculations-api.schemas";
import { formatCurrency, formatDate } from "@/utils/value-format";
import { ExternalLinkIcon, HandshakeIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Settlement = GetCase200["settlements"][number];

type Props = {
  settlements: Settlement[];
};

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  negotiating: { label: "Em negociação", variant: "secondary" },
  accepted: { label: "Aceito", variant: "default" },
  rejected: { label: "Rejeitado", variant: "destructive" },
};

export function SettlementsTab({ settlements }: Props) {
  const navigate = useNavigate();

  if (settlements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
          <HandshakeIcon className="w-6 h-6 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Nenhum acordo registrado</p>
          <p className="text-xs text-muted-foreground mt-1">
            Acordos são criados a partir de cálculos vinculados ao caso
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">
          {settlements.length} acordo{settlements.length !== 1 ? "s" : ""}
        </h3>
      </div>

      <div className="divide-y divide-border">
        {settlements.map((settlement) => {
          const statusInfo = STATUS_MAP[settlement.status] ?? { label: settlement.status, variant: "secondary" as const };
          return (
            <div
              key={settlement.id}
              className="flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors group"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {formatCurrency(settlement.agreementValue)}
                  </span>
                  <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDate(settlement.createdAt)}
                </p>
              </div>

              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Abrir cálculo"
                className="ml-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => navigate(`/calculations/${settlement.laborCalculationId}`)}
              >
                <ExternalLinkIcon />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
