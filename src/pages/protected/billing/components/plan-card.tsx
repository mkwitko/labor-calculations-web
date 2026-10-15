import { CheckIcon, Loader2Icon, UserPlusIcon, UsersIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  describePlan,
  formatBRL,
  type Plan,
  type PlanInterval,
  type PlanPrice,
  seatLabel,
} from "@/hooks/use-plans";
import { cn } from "@/lib/utils";

interface PlanCardProps {
  /** Vem do Stripe: nome, teto e preço. */
  plan: Plan;
  interval: PlanInterval;
  features: string[];
  popular: boolean;
  isLoadingPrice: boolean;
  /** Preço do advogado adicional, quando o plano aceita excedente. */
  extraPrice: PlanPrice | null;
  /** O plano que o escritório já tem: o card vira estado, não oferta. */
  isCurrent?: boolean;
  /**
   * `false` quando o teto do plano não comporta o time atual — descer exigiria
   * remover gente, e isso não é decisão de cobrança.
   */
  isSelectable?: boolean;
  onSelect: () => void;
  isPending: boolean;
  ctaLabel?: string;
}

export function PlanCard({
  plan,
  interval,
  features,
  popular,
  isLoadingPrice,
  extraPrice,
  isCurrent = false,
  isSelectable = true,
  onSelect,
  isPending,
  ctaLabel = "Assinar agora",
}: PlanCardProps) {
  const pricing = describePlan(plan, interval);

  return (
    <div
      className={cn(
        "bg-card border rounded-xl flex flex-col overflow-hidden h-full",
        isCurrent
          ? "border-emerald-600 ring-1 ring-emerald-600"
          : popular
            ? "border-indigo-600 ring-1 ring-indigo-600"
            : "border-border",
      )}
    >
      <div className="h-7 flex items-center justify-center">
        {isCurrent ? (
          <div className="w-full bg-emerald-600 text-white text-xs font-semibold text-center py-1.5">
            Plano atual
          </div>
        ) : popular ? (
          <div className="w-full bg-indigo-600 text-white text-xs font-semibold text-center py-1.5">
            Mais vantajoso
          </div>
        ) : null}
      </div>

      <div className="p-5 flex flex-col flex-1 gap-4">
        <div>
          <p className="text-sm font-semibold text-foreground">{plan.name}</p>

          {isLoadingPrice && (
            <div
              className="mt-2 h-9 w-32 rounded bg-muted animate-pulse"
              aria-label="Carregando preço"
            />
          )}

          {!isLoadingPrice && pricing && (
            <>
              <div className="mt-2 flex items-end gap-1">
                <span className="text-3xl font-bold text-foreground">
                  {pricing.headline}
                </span>
                <span className="text-sm text-muted-foreground mb-1">
                  {pricing.period}
                </span>
              </div>
              {pricing.footnote && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {pricing.footnote}
                </p>
              )}
              {pricing.savingsBadge && (
                <span className="inline-block mt-2 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                  {pricing.savingsBadge}
                </span>
              )}
            </>
          )}

          {/* Sem preço legível a tela diz isso; número de reserva viraria
              promessa que a fatura desmente. */}
          {!isLoadingPrice && !pricing && (
            <p className="mt-2 text-sm font-medium text-foreground">
              Preço sob consulta
            </p>
          )}
        </div>

        <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 space-y-1">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <UsersIcon className="w-3.5 h-3.5 text-muted-foreground" />
            {seatLabel(plan.maxMembers)}
          </p>
          {plan.allowsExtraMembers && extraPrice && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <UserPlusIcon className="w-3.5 h-3.5" />
              Depois disso, {formatBRL(extraPrice.amountCents)} por advogado
            </p>
          )}
        </div>

        <ul className="flex-1 space-y-2.5">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5">
              <CheckIcon className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span className="text-sm text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>

        <Button
          className="w-full"
          variant={popular && !isCurrent ? "default" : "outline"}
          onClick={onSelect}
          disabled={isPending || isCurrent || !isSelectable || !pricing}
        >
          {isPending ? (
            <>
              <Loader2Icon className="w-4 h-4 animate-spin" />
              Aguarde...
            </>
          ) : isCurrent ? (
            "Plano atual"
          ) : !isSelectable ? (
            "Não comporta o time atual"
          ) : (
            ctaLabel
          )}
        </Button>
      </div>
    </div>
  );
}
