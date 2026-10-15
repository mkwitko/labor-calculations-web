import { EmptyState } from "@/components/empty-state";
import { ListSkeleton } from "@/components/list-skeleton";
import { PageHeader } from "@/components/page-header";
import { useOrgAbilities, useOrganizations } from "@/hooks/use-organizations";
import { LockIcon } from "lucide-react";
import { DangerSection } from "./components/danger-section";
import { InvitesSection } from "./components/invites-section";
import { MembersSection } from "./components/members-section";

export default function Team() {
  const { current, isLoading } = useOrganizations();
  const { canManageMembers } = useOrgAbilities();

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <PageHeader title="Equipe" />
        <ListSkeleton rows={4} />
      </div>
    );
  }

  // A rota existe para todo papel; a API é que barra. Dizer isso aqui evita uma
  // tela de erro para quem só clicou num link recebido.
  if (!canManageMembers || !current) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <PageHeader title="Equipe" />
        <EmptyState
          icon={LockIcon}
          title="Gestão restrita"
          description="Membros e convites são administrados pelo titular e pelos sócios da organização."
        />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-8">
      <PageHeader
        title="Equipe"
        subtitle={`${current.name} · ${current.seats} ${current.seats === 1 ? "assento" : "assentos"}`}
      />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Membros</h2>
        <MembersSection organizationId={current.id} />
      </section>

      <section className="space-y-3">
        <InvitesSection organizationId={current.id} />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">
          Titularidade e saída
        </h2>
        <DangerSection organizationId={current.id} />
      </section>
    </div>
  );
}
