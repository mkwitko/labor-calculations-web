import { ConfirmButton } from "@/components/confirm-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ListSettlements200Item } from "@/http/generated/lexlaboral-server.schemas";
import {
  getListSettlementsQueryKey,
  useDeleteSettlement,
  useListSettlements,
} from "@/http/generated/settlements/settlements";
import { formatCurrency, formatDate } from "@/utils/value-format";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Props = {
  calculationId: string;
};

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

function SettlementItem({
  settlement,
  onDelete,
  isDeleting,
}: {
  settlement: ListSettlements200Item;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  return (
    <div className="border border-border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium tabular-nums">
            {settlement.agreementRate * 100}% de acordo
          </span>
          <Badge variant={STATUS_VARIANTS[settlement.status] ?? "outline"}>
            {STATUS_LABELS[settlement.status] ?? settlement.status}
          </Badge>
        </div>
        <ConfirmButton
          variant="ghost"
          size="icon"
          disabled={isDeleting}
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          tooltip="Excluir acordo"
          title="Excluir acordo?"
          description="Esta simulação de acordo será excluída permanentemente."
          confirmLabel="Excluir"
          onConfirm={() => onDelete(settlement.id)}
        >
          {isDeleting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Trash2 className="h-3.5 w-3.5" />
          )}
        </ConfirmButton>
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

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Prazo: {settlement.estimatedTime}</span>
        <span>{formatDate(settlement.createdAt)}</span>
      </div>
    </div>
  );
}

export default function SettlementList({ calculationId }: Props) {
  const queryClient = useQueryClient();
  const { data: settlements, isLoading } = useListSettlements(calculationId);
  const { mutate: deleteSettlement, variables: deletingVars } =
    useDeleteSettlement({
      mutation: {
        onSuccess: () => {
          toast.success("Simulação excluída");
          queryClient.invalidateQueries({
            queryKey: getListSettlementsQueryKey(calculationId),
          });
        },
        onError: () => {
          toast.error("Erro ao excluir simulação");
        },
      },
    });

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!settlements || settlements.length === 0) {
    return null;
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Acordos Salvos
          </CardTitle>
          <Badge variant="outline">{settlements.length}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {settlements.map((settlement) => (
          <SettlementItem
            key={settlement.id}
            settlement={settlement}
            onDelete={(id) => deleteSettlement({ id })}
            isDeleting={deletingVars?.id === settlement.id}
          />
        ))}
      </CardContent>
    </Card>
  );
}
