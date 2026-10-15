import { SparklesIcon } from "lucide-react";
import type { PlanCode, PlanInterval } from "@/hooks/use-plans";
import { PlansGrid } from "./plans-grid";

export function NoAccessSection({
  onCheckout,
  isPending,
  memberCount,
}: {
  onCheckout: (code: PlanCode, interval: PlanInterval) => void;
  isPending: boolean;
  memberCount?: number;
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-5 flex items-start gap-4">
        <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center shrink-0">
          <SparklesIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">
            Assine o LexLaboral
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Seu período de teste expirou. Assine um plano para retomar o acesso
            a todos os recursos.
          </p>
        </div>
      </div>

      <PlansGrid
        memberCount={memberCount}
        onSelect={onCheckout}
        isPending={isPending}
        ctaLabel="Assinar agora"
      />
    </div>
  );
}
