import { Loader2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { useOrgAbilities, useOrganizations } from "@/hooks/use-organizations";
import { useSubscription } from "@/hooks/use-subscription";
import {
  useCreateCheckout,
  useCreatePortalSession,
} from "@/http/generated/billing/billing";
import { useGetOrganizationPlan } from "@/http/generated/organization/organization";
import { apiErrorMessage } from "@/utils/api-error";
import { ActiveSection } from "./components/active-section";
import {
  ChangePlanDialog,
  type PlanChangeTarget,
} from "./components/change-plan-dialog";
import { NoAccessSection } from "./components/no-access-section";
import { PlanUsageCard } from "./components/plan-usage-card";
import { PlansGrid } from "./components/plans-grid";
import { getStatusConfig } from "./components/status-config";
import { TrialSection } from "./components/trial-section";

export default function Billing() {
  const {
    status,
    isActive,
    isTrial,
    trialEnd,
    trialDaysLeft,
    currentPeriodEnd,
    cancelAtPeriodEnd,
    isLoading,
  } = useSubscription();

  const { current } = useOrganizations();
  const { canManageMembers } = useOrgAbilities();
  const organizationId = current?.id ?? "";

  // Teto e ocupação vêm do back, que os lê do Stripe: é o mesmo número que a
  // regra de convite usa, e contar aqui daria outro.
  const { data: planData } = useGetOrganizationPlan(organizationId, {
    query: { enabled: Boolean(organizationId) && canManageMembers },
  });

  const plan = planData?.data;

  const [target, setTarget] = useState<PlanChangeTarget | null>(null);

  const { mutateAsync: checkout, isPending: isCheckingOut } = useCreateCheckout(
    {
      mutation: {
        onSuccess: ({ url }) => {
          window.location.href = url;
        },
        onError: (error) => {
          const message = apiErrorMessage(
            error,
            "Não foi possível abrir o checkout.",
          );
          if (message) toast.error(message);
        },
      },
    },
  );

  const { mutateAsync: portal, isPending: isPortaling } =
    useCreatePortalSession({
      mutation: {
        onSuccess: ({ url }) => {
          window.location.href = url;
        },
        // Sem isto o botão só voltava ao estado normal, sem dizer nada: a rota
        // depende do Stripe responder, e a falha não passa pelo toast global.
        onError: (error) => {
          const message = apiErrorMessage(
            error,
            "Não foi possível abrir o portal de pagamento.",
          );
          if (message) toast.error(message);
        },
      },
    });

  return (
    <div className="p-4 md:p-6 space-y-6  w-full">
      <PageHeader title="Assinatura" subtitle="Gerencie o plano do escritório" />

      <PlanUsageCard />

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2Icon className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : isTrial ? (
        <TrialSection
          trialEnd={trialEnd}
          trialDaysLeft={trialDaysLeft}
          currentCode={plan?.code}
          memberCount={plan?.members}
          onCheckout={(code, interval) => {
            checkout({ data: { code, interval } }).catch(() => {});
          }}
          isPending={isCheckingOut}
        />
      ) : isActive ? (
        <ActiveSection
          status={status}
          currentPeriodEnd={currentPeriodEnd}
          cancelAtPeriodEnd={cancelAtPeriodEnd}
          planName={plan?.name}
          onPortal={() => {
            portal().catch(() => {});
          }}
          isPortaling={isPortaling}
          getStatusConfig={getStatusConfig}
        >
          {/* A troca acontece aqui, não no Customer Portal: lá o
              `subscription_update` está desligado de propósito, senão a
              projeção seguinte desfaria a alteração feita fora do app. */}
          {canManageMembers && (
            <PlansGrid
              title="Mudar de plano"
              currentCode={plan?.code}
              memberCount={plan?.members}
              onSelect={(code, interval) => setTarget({ code, interval })}
              isPending={false}
              ctaLabel="Mudar para este plano"
            />
          )}
        </ActiveSection>
      ) : (
        <NoAccessSection
          memberCount={plan?.members}
          onCheckout={(code, interval) => {
            checkout({ data: { code, interval } }).catch(() => {});
          }}
          isPending={isCheckingOut}
        />
      )}

      <ChangePlanDialog
        organizationId={organizationId}
        target={target}
        onClose={() => setTarget(null)}
      />
    </div>
  );
}
