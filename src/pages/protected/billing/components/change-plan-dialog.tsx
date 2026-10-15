import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  formatBRL,
  type PlanCode,
  type PlanInterval,
  seatLabel,
  usePlans,
} from "@/hooks/use-plans";
import {
  getGetOrganizationPlanQueryKey,
  useChangeOrganizationPlan,
  usePreviewPlan,
} from "@/http/generated/organization/organization";
import { getGetSubscriptionQueryKey } from "@/http/generated/billing/billing";
import { queryClient } from "@/lib/react-query";
import { apiErrorMessage } from "@/utils/api-error";
import { toast } from "sonner";

export type PlanChangeTarget = { code: PlanCode; interval: PlanInterval };

/**
 * A troca de plano é confirmada com o valor que o **Stripe** diz que vai cobrar
 * (`GET /plan/preview`, que por baixo é `invoices.createPreview`). Recalcular por
 * fora divergiria em algum arredondamento, e um dialog que promete um número
 * diferente da fatura vira reclamação de cobrança.
 */
export function ChangePlanDialog({
  organizationId,
  target,
  onClose,
}: {
  organizationId: string;
  target: PlanChangeTarget | null;
  onClose: () => void;
}) {
  const { planByCode } = usePlans();
  const plan = target ? planByCode(target.code) : undefined;

  const { data, isLoading, isError } = usePreviewPlan(
    organizationId,
    { code: target?.code ?? "solo", interval: target?.interval ?? "monthly" },
    { query: { enabled: Boolean(target), retry: 0 } },
  );

  const { mutate: changePlan, isPending } = useChangeOrganizationPlan({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getGetOrganizationPlanQueryKey(organizationId),
        });
        queryClient.invalidateQueries({
          queryKey: getGetSubscriptionQueryKey(),
        });
        toast.success("Plano alterado");
        onClose();
      },
      onError: (error) => {
        const message = apiErrorMessage(
          error,
          "Não foi possível mudar de plano.",
        );
        if (message) toast.error(message);
      },
    },
  });

  const preview = data?.data;

  return (
    <Dialog
      open={Boolean(target)}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Mudar para o plano {plan?.name ?? target?.code}
          </DialogTitle>
          <DialogDescription>
            {plan
              ? `Passa a comportar ${seatLabel(plan.maxMembers)}, com cobrança ${
                  target?.interval === "yearly" ? "anual" : "mensal"
                }.`
              : "Confirme a troca de plano."}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-border bg-muted/30 p-3">
          {isLoading && (
            <p className="text-xs text-muted-foreground">
              Calculando o valor da troca...
            </p>
          )}

          {/* Preview é consulta: se o Stripe não responde, a tela avisa em vez
              de mostrar um número inventado — mas a troca segue possível. */}
          {!isLoading && (isError || !preview) && (
            <p className="text-xs text-muted-foreground">
              Não foi possível calcular o valor agora.
            </p>
          )}

          {preview && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                Valor do plano:{" "}
                <strong className="text-foreground">
                  {formatBRL(preview.planAmountCents)}
                </strong>{" "}
                {preview.interval === "yearly" ? "por ano" : "por mês"}
              </p>

              {preview.prorated && preview.amountDueCents !== null ? (
                <p className="text-xs text-muted-foreground">
                  Cobrança agora:{" "}
                  <strong className="text-foreground">
                    {formatBRL(preview.amountDueCents)}
                  </strong>{" "}
                  {preview.amountDueCents <= 0
                    ? "— a diferença vira crédito na próxima fatura."
                    : ", proporcional ao período em curso."}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  A cobrança começa quando a assinatura for criada.
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button
            disabled={isPending || !target}
            onClick={() => {
              if (!target) return;

              changePlan({ organizationId, data: target });
            }}
          >
            {isPending && <Loader2Icon className="w-4 h-4 animate-spin" />}
            Confirmar troca
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
