import { LockIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { type PlanFeatureKey, usePlanFeature } from "@/hooks/use-plan-features";

/**
 * Mostra o recurso a quem tem direito e um convite de troca de plano a quem não
 * tem. Quem recusa de verdade é a API (402) — isto existe para o usuário não
 * preencher uma tela inteira só para levar um erro no fim.
 */
export function PlanFeatureGate({
  feature,
  title,
  description,
  children,
}: {
  feature: PlanFeatureKey;
  title: string;
  description: string;
  children: ReactNode;
}) {
  const { allowed, requiredPlanName } = usePlanFeature(feature);

  if (allowed) return <>{children}</>;

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center gap-3 px-6 py-10 text-center">
        <span className="flex size-10 items-center justify-center rounded-xl bg-muted">
          <LockIcon className="size-5 text-muted-foreground" />
        </span>
        <h3 className="font-semibold text-base text-foreground">{title}</h3>
        <p className="max-w-md text-muted-foreground text-sm leading-relaxed">
          {description}
          {requiredPlanName
            ? ` Disponível a partir do plano ${requiredPlanName}.`
            : ""}
        </p>
        <Button asChild className="mt-1">
          <Link to="/billing">Ver planos</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
