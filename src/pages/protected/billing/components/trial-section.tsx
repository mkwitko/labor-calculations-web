import { cn } from "@/lib/utils";
import { CalendarIcon, ClockIcon } from "lucide-react";
import type { PlanCode, PlanInterval } from "@/hooks/use-plans";
import { PlansGrid } from "./plans-grid";
import { TrialProgressBar } from "./trial-progress-bar";

export function TrialSection({
  trialEnd,
  trialDaysLeft,
  onCheckout,
  isPending,
  currentCode,
  memberCount,
}: {
  trialEnd: string | null;
  trialDaysLeft: number | null;
  onCheckout: (code: PlanCode, interval: PlanInterval) => void;
  isPending: boolean;
  /** O plano já escolhido no trial — ainda não cobrado, mas é o teto vigente. */
  currentCode?: PlanCode | null;
  memberCount?: number;
}) {
  const urgent = trialDaysLeft !== null && trialDaysLeft <= 3;

  return (
    <div className="space-y-6">
      <div
        className={cn(
          "rounded-xl border overflow-hidden",
          urgent
            ? "border-amber-200 dark:border-amber-900"
            : "border-blue-200 dark:border-blue-900",
        )}
      >
        <div
          className={cn(
            "px-5 py-4 flex items-center gap-3",
            urgent
              ? "bg-amber-50 dark:bg-amber-950/40"
              : "bg-blue-50 dark:bg-blue-950/40",
          )}
        >
          <div
            className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
              urgent
                ? "bg-amber-100 dark:bg-amber-900"
                : "bg-blue-100 dark:bg-blue-900",
            )}
          >
            <ClockIcon
              className={cn(
                "w-4 h-4",
                urgent
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-blue-600 dark:text-blue-400",
              )}
            />
          </div>
          <div>
            <p
              className={cn(
                "text-sm font-semibold",
                urgent
                  ? "text-amber-900 dark:text-amber-200"
                  : "text-blue-900 dark:text-blue-200",
              )}
            >
              Período de teste gratuito
            </p>
            <p
              className={cn(
                "text-xs mt-0.5",
                urgent
                  ? "text-amber-700 dark:text-amber-400"
                  : "text-blue-700 dark:text-blue-400",
              )}
            >
              {trialDaysLeft === 0
                ? "Expira hoje!"
                : trialDaysLeft === 1
                  ? "1 dia restante"
                  : `${trialDaysLeft} dias restantes`}
            </p>
          </div>
        </div>

        <div className="px-5 py-4 bg-card space-y-4">
          {trialDaysLeft !== null && (
            <TrialProgressBar daysLeft={trialDaysLeft} />
          )}

          {trialEnd && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarIcon className="w-4 h-4 shrink-0" />
              <span>
                Teste encerra em{" "}
                <span className="font-medium text-foreground">
                  {new Date(trialEnd).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </span>
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            Assine antes do fim do período de teste para continuar usando o
            LexLaboral sem interrupção.
          </p>
        </div>
      </div>

      <PlansGrid
        currentCode={currentCode}
        memberCount={memberCount}
        onSelect={onCheckout}
        isPending={isPending}
        ctaLabel="Assinar agora"
      />
    </div>
  );
}
