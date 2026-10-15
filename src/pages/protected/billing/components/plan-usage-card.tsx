import { UserPlusIcon, UsersRoundIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { formatBRL, usePlans } from "@/hooks/use-plans";
import { useOrgAbilities, useOrganizations } from "@/hooks/use-organizations";
import { useGetOrganizationPlan } from "@/http/generated/organization/organization";

/**
 * Quanto do plano o escritório já ocupa. Teto e ocupação vêm do back
 * (`GET /organizations/:id/plan`), que os lê do Stripe — contar aqui daria um
 * número que a regra de convite não usa.
 */
export function PlanUsageCard() {
  const { current } = useOrganizations();
  const { canManageMembers } = useOrgAbilities();
  const { extraMember } = usePlans();

  const { data, isLoading, isError } = useGetOrganizationPlan(
    current?.id ?? "",
    { query: { enabled: Boolean(current?.id) && canManageMembers } },
  );

  // Plano é assunto de quem administra a organização.
  if (!current || !canManageMembers) return null;

  const plan = data?.data;
  const full = plan ? plan.remaining === 0 && !plan.allowsExtraMembers : false;

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center gap-2">
        <UsersRoundIcon className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">
          Pessoas no escritório
        </h3>
      </div>

      {isLoading && (
        <div
          className="h-8 w-40 rounded bg-muted animate-pulse"
          aria-label="Carregando plano"
        />
      )}

      {/* Falha ao ler o plano não trava a tela: o convite continua indo, e o
          back reconcilia o teto na próxima chamada. */}
      {!isLoading && (isError || !plan) && (
        <p className="text-sm text-muted-foreground">
          Não foi possível ler o plano agora.
        </p>
      )}

      {plan && (
        <>
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="text-2xl font-bold text-foreground tabular-nums">
              {plan.members} de {plan.maxMembers}
            </span>
            <span className="text-sm text-muted-foreground">
              {plan.maxMembers === 1 ? "pessoa" : "pessoas"} · plano {plan.name}
            </span>
          </div>

          {plan.pendingInvites > 0 && (
            <p className="text-xs text-muted-foreground">
              {plan.pendingInvites === 1
                ? "1 convite pendente já ocupa uma vaga."
                : `${plan.pendingInvites} convites pendentes já ocupam vagas.`}
            </p>
          )}

          {plan.extraMembers > 0 && extraMember.monthly && (
            <p className="text-xs text-muted-foreground">
              {plan.extraMembers}{" "}
              {plan.extraMembers === 1 ? "pessoa" : "pessoas"} acima do teto,
              cobradas a {formatBRL(extraMember.monthly.amountCents)} por
              advogado.
            </p>
          )}

          {full && (
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Todas as vagas estão ocupadas. Para incluir mais pessoas, mude de
              plano abaixo.
            </p>
          )}
        </>
      )}

      <Button asChild variant="outline" size="sm">
        <Link to="/equipe">
          <UserPlusIcon className="w-4 h-4" />
          Gerenciar equipe
        </Link>
      </Button>
    </div>
  );
}
