import { useGetOrganizationPlan } from "@/http/generated/organization/organization";
import { useOrganizations } from "@/hooks/use-organizations";

/**
 * Recursos que dependem do plano do escritório.
 *
 * Espelha `src/services/billing/plan-features.ts` no back e serve **só para a
 * tela não oferecer o que a API vai recusar**. A autoridade continua sendo o
 * servidor, que responde 402 — esconder um botão nunca é o que protege receita,
 * do mesmo jeito que não é o que protege dado.
 */
export type PlanFeatureKey = "batch_assessment" | "public_api";

export type PlanFeatureAccess = {
  allowed: boolean;
  /** Nome do plano que libera o recurso, quando o catálogo respondeu. */
  requiredPlanName: string | null;
  isLoading: boolean;
};

export function usePlanFeature(feature: PlanFeatureKey): PlanFeatureAccess {
  const { current } = useOrganizations();

  const { data, isLoading } = useGetOrganizationPlan(current?.id ?? "", {
    query: {
      enabled: Boolean(current?.id),
      // Plano muda raramente e a leitura passa pelo Stripe no back.
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  });

  const access = data?.data.features?.[feature];

  return {
    // Enquanto carrega — ou se a leitura falhar — a tela assume que pode. Piscar
    // uma oferta de upgrade para quem já paga é pior que deixar a API recusar.
    allowed: access?.allowed ?? true,
    requiredPlanName: access?.requiredPlanName ?? null,
    isLoading,
  };
}
