import { useState } from "react";
import {
  type PlanCode,
  type PlanInterval,
  usePlans,
} from "@/hooks/use-plans";
import { PLAN_FEATURES, POPULAR_PLAN_CODE } from "../data/plans";
import { PlanCard } from "./plan-card";

/**
 * A grade de planos, com o seletor mensal/anual. Mora num componente só porque
 * a tela de trial, a de acesso expirado e a troca de plano mostram exatamente a
 * mesma coisa — três cópias divergiriam na primeira mudança de copy.
 */
export function PlansGrid({
  title = "Escolha seu plano",
  currentCode,
  /** Time atual: plano cujo teto não o comporta não é oferecido. */
  memberCount,
  onSelect,
  isPending,
  ctaLabel,
}: {
  title?: string;
  currentCode?: PlanCode | null;
  memberCount?: number;
  onSelect: (code: PlanCode, interval: PlanInterval) => void;
  isPending: boolean;
  ctaLabel?: string;
}) {
  const [interval, setInterval] = useState<PlanInterval>("monthly");
  const { plans, extraMember, isLoading, isUnavailable } = usePlans();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <p className="text-sm font-medium text-foreground">{title}</p>

        <div
          className="inline-flex items-center p-0.5 rounded-lg border border-border bg-muted/40"
          role="group"
          aria-label="Periodicidade da cobrança"
        >
          {(
            [
              { id: "monthly" as const, label: "Mensal" },
              { id: "yearly" as const, label: "Anual" },
            ] satisfies Array<{ id: PlanInterval; label: string }>
          ).map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setInterval(option.id)}
              aria-pressed={interval === option.id}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                interval === option.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {isUnavailable ? (
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Não foi possível ler os planos agora. Tente novamente em instantes ou
            fale com a gente.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {plans.map((plan) => (
            <PlanCard
              key={plan.code}
              plan={plan}
              interval={interval}
              features={PLAN_FEATURES[plan.code]}
              popular={plan.code === POPULAR_PLAN_CODE}
              isLoadingPrice={isLoading}
              extraPrice={extraMember[interval]}
              isCurrent={plan.code === currentCode}
              isSelectable={
                memberCount === undefined ||
                plan.allowsExtraMembers ||
                memberCount <= plan.maxMembers
              }
              onSelect={() => onSelect(plan.code, interval)}
              isPending={isPending}
              ctaLabel={ctaLabel}
            />
          ))}
        </div>
      )}
    </div>
  );
}
