import { CheckCircle2Icon, CircleIcon, Loader2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getListSettlementInstallmentsQueryKey,
  useGenerateSettlementInstallments,
  useListSettlementInstallments,
  useUpdateSettlementInstallment,
} from "@/http/generated/settlement/settlement";
import { queryClient } from "@/lib/react-query";
import { formatCurrency } from "@/utils/value-format";
import { cn } from "@/lib/utils";

// Installment schedule manager for one accepted settlement.
export function InstallmentsManager({
  settlementId,
  agreementValue,
}: {
  settlementId: string;
  agreementValue: number;
}) {
  const [count, setCount] = useState("1");
  const [firstDue, setFirstDue] = useState("");

  const { data: installments } = useListSettlementInstallments(settlementId);
  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: getListSettlementInstallmentsQueryKey(settlementId),
    });

  const { mutateAsync: generate, isPending } =
    useGenerateSettlementInstallments({ mutation: { onSuccess: invalidate } });
  const { mutateAsync: update } = useUpdateSettlementInstallment({
    mutation: { onSuccess: invalidate },
  });

  const rows = installments ?? [];
  const paid = rows
    .filter((r) => r.paidAt)
    .reduce((s, r) => s + r.amount, 0);

  const gen = async () => {
    if (!firstDue || !count) return;
    await generate({
      settlementId,
      data: { count: Number(count), firstDueDate: firstDue },
    });
    toast.success("Parcelas geradas");
  };

  return (
    <div className="border border-border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">
          Acordo de {formatCurrency(agreementValue)}
        </p>
        {rows.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {formatCurrency(paid)} recebido de {formatCurrency(agreementValue)}
          </span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          type="number"
          min={1}
          max={120}
          placeholder="Nº de parcelas"
          value={count}
          onChange={(e) => setCount(e.target.value)}
          className="sm:w-36"
        />
        <Input
          type="date"
          value={firstDue}
          onChange={(e) => setFirstDue(e.target.value)}
          className="sm:w-44"
        />
        <Button size="sm" variant="outline" onClick={gen} disabled={isPending || !firstDue}>
          {isPending ? (
            <Loader2Icon className="w-4 h-4 animate-spin" />
          ) : null}
          Gerar parcelas
        </Button>
      </div>

      {rows.length > 0 && (
        <div className="divide-y divide-border">
          {rows.map((r) => (
            <div key={r.id} className="flex items-center gap-3 py-2">
              <button
                type="button"
                onClick={() =>
                  update({
                    settlementId,
                    installmentId: r.id,
                    data: { paid: !r.paidAt },
                  })
                }
              >
                {r.paidAt ? (
                  <CheckCircle2Icon className="w-5 h-5 text-green-600" />
                ) : (
                  <CircleIcon className="w-5 h-5 text-muted-foreground/40" />
                )}
              </button>
              <span className="text-sm text-foreground w-8">{r.number}ª</span>
              <span className="text-xs text-muted-foreground flex-1">
                vence {new Date(r.dueDate).toLocaleDateString("pt-BR")}
              </span>
              <span
                className={cn(
                  "text-sm tabular-nums",
                  r.paidAt
                    ? "text-muted-foreground line-through"
                    : "text-foreground",
                )}
              >
                {formatCurrency(r.amount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
