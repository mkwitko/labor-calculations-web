import {
  CheckIcon,
  GavelIcon,
  Loader2Icon,
  XIcon,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  useGetClientSettlements,
  useAcceptSettlement,
  useRejectSettlement,
  getGetClientSettlementsQueryKey,
} from "@/http/generated/client-portal/client-portal";
import { queryClient } from "@/lib/react-query";
import { formatCurrency, formatDate } from "@/utils/value-format";

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  negotiating: { label: "Em negociação", variant: "secondary" },
  accepted: { label: "Aceito", variant: "default" },
  rejected: { label: "Rejeitado", variant: "destructive" },
};

export function CaseSettlements({ caseId }: { caseId: string }) {
  const { data, isLoading } = useGetClientSettlements(caseId);
  const [rejectDialogId, setRejectDialogId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const { mutateAsync: acceptSettlement, isPending: isAccepting } = useAcceptSettlement();
  const { mutateAsync: rejectSettlement, isPending: isRejecting } = useRejectSettlement();

  async function handleAccept(settlementId: string) {
    await acceptSettlement({ settlementId });
    await queryClient.invalidateQueries({ queryKey: getGetClientSettlementsQueryKey(caseId) });
  }

  async function handleReject() {
    if (!rejectDialogId) return;
    await rejectSettlement({
      settlementId: rejectDialogId,
      data: { reason: rejectReason || undefined },
    });
    await queryClient.invalidateQueries({ queryKey: getGetClientSettlementsQueryKey(caseId) });
    setRejectDialogId(null);
    setRejectReason("");
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2Icon className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const settlements = data?.settlements ?? [];

  return (
    <div className="space-y-4">
      {settlements.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <GavelIcon className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">Nenhum acordo</p>
          <p className="text-xs text-muted-foreground max-w-xs">
            As propostas de acordo aparecerão aqui quando disponibilizadas pelo seu advogado.
          </p>
        </div>
      )}

      {settlements.map((s) => {
        const statusCfg = STATUS_CONFIG[s.status] ?? STATUS_CONFIG.negotiating;
        const isPending = s.status === "negotiating";

        return (
          <Card key={s.id}>
            <CardContent className="pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GavelIcon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    Proposta de acordo
                  </span>
                </div>
                <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Valor do acordo</p>
                  <p className="font-semibold text-foreground">{formatCurrency(s.agreementValue)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Percentual</p>
                  <p className="font-semibold text-foreground">{s.agreementRate}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Honorários ({s.feeType === "percentage" ? `${s.feeValue}%` : formatCurrency(s.feeValue)})</p>
                  <p className="font-semibold text-foreground">{formatCurrency(s.feeAmount)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Líquido ao cliente</p>
                  <p className="font-semibold text-primary">{formatCurrency(s.netToClient)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Prazo estimado</p>
                  <p className="font-medium text-foreground">{s.estimatedTime}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Cálculo</p>
                  <p className="font-medium text-foreground">{s.calculation.clientName}</p>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                Proposta em {formatDate(s.createdAt)}
                {s.settledAt && ` · ${statusCfg.label} em ${formatDate(s.settledAt)}`}
              </div>

              {isPending && (
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    size="sm"
                    className="gap-1.5"
                    onClick={() => handleAccept(s.id)}
                    disabled={isAccepting}
                  >
                    {isAccepting ? <Loader2Icon className="w-4 h-4 animate-spin" /> : <CheckIcon className="w-4 h-4" />}
                    Aceitar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => setRejectDialogId(s.id)}
                    disabled={isRejecting}
                  >
                    <XIcon className="w-4 h-4" />
                    Rejeitar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      <Dialog open={!!rejectDialogId} onOpenChange={(v) => { if (!v) setRejectDialogId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar proposta</DialogTitle>
            <DialogDescription>Informe o motivo da rejeição (opcional)</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Motivo da rejeição..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogId(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleReject} disabled={isRejecting} className="gap-2">
              {isRejecting ? <Loader2Icon className="w-4 h-4 animate-spin" /> : <XIcon className="w-4 h-4" />}
              Rejeitar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
