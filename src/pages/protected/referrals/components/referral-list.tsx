import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import type { GetReferralSummary200DataReferralsItem } from "@/http/generated/labor-calculations-api.schemas";
import { UsersIcon } from "lucide-react";

const STATUS_LABEL: Record<string, string> = {
  pending: "Convidado",
  signed_up: "Cadastrado",
  qualified: "Ativo",
  lost: "Perdido",
};

const STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  pending: "outline",
  signed_up: "secondary",
  qualified: "default",
  lost: "destructive",
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";

  return new Date(iso).toLocaleDateString("pt-BR");
}

export function ReferralList({
  referrals,
}: {
  referrals: GetReferralSummary200DataReferralsItem[];
}) {
  if (referrals.length === 0) {
    return (
      <EmptyState
        icon={UsersIcon}
        title="Nenhuma indicação ainda"
        description="Compartilhe seu link ou convide um colega por e-mail para começar."
      />
    );
  }

  return (
    <Card>
      <CardContent className="divide-y divide-border p-0">
        {referrals.map((referral) => (
          <div
            key={referral.id}
            className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">
                {referral.name ?? referral.email ?? "Convite enviado"}
              </p>
              <p className="text-sm text-muted-foreground">
                Convidado em {formatDate(referral.invitedAt)}
                {referral.qualifiedAt
                  ? ` · ativo desde ${formatDate(referral.qualifiedAt)}`
                  : ""}
              </p>
            </div>
            <Badge variant={STATUS_VARIANT[referral.status] ?? "outline"}>
              {STATUS_LABEL[referral.status] ?? referral.status}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
