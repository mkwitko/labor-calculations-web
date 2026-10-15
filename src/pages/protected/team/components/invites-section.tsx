import { ConfirmButton } from "@/components/confirm-button";
import { EmptyState } from "@/components/empty-state";
import { ListSkeleton } from "@/components/list-skeleton";
import { Button } from "@/components/ui/button";
import { ROLE_LABELS, type OrgRole } from "@/hooks/use-organizations";
import {
  getListInvitesQueryKey,
  useListInvites,
  useRevokeInvite,
} from "@/http/generated/organization/organization";
import { queryClient } from "@/lib/react-query";
import { MailPlusIcon, Trash2Icon, UserPlusIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { InviteDialog } from "./invite-dialog";

/** "expira em 6 dias" / "expira hoje" — prazo é o que decide agir ou reenviar. */
function expiryLabel(expiresAt: string): string {
  const days = Math.ceil(
    (new Date(expiresAt).getTime() - Date.now()) / (24 * 60 * 60 * 1000),
  );

  if (days <= 0) return "expirado";
  if (days === 1) return "expira amanhã";

  return `expira em ${days} dias`;
}

export function InvitesSection({
  organizationId,
}: {
  organizationId: string;
}) {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const { data, isLoading } = useListInvites(organizationId);

  const invites = data?.data ?? [];

  const { mutate: revokeInvite, isPending } = useRevokeInvite({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getListInvitesQueryKey(organizationId),
        });
        toast.success("Convite revogado");
      },
      onError: () => toast.error("Não foi possível revogar o convite"),
    },
  });

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-foreground">
          Convites pendentes
        </h2>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <UserPlusIcon className="w-4 h-4" />
          Convidar
        </Button>
      </div>

      {isLoading ? (
        <ListSkeleton rows={2} />
      ) : invites.length === 0 ? (
        <EmptyState
          icon={MailPlusIcon}
          title="Nenhum convite pendente"
          description="Convide alguém por e-mail para ocupar um assento nesta organização."
          action={{
            label: "Convidar",
            onClick: () => setDialogOpen(true),
            icon: UserPlusIcon,
          }}
        />
      ) : (
        <div className="divide-y divide-border rounded-xl border border-border overflow-hidden bg-card">
          {invites.map((invite) => (
            <div
              key={invite.id}
              className="flex items-center gap-3 px-4 py-3.5"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">
                  {invite.email}
                </p>
                <p className="text-xs text-muted-foreground">
                  {ROLE_LABELS[invite.role as OrgRole]} ·{" "}
                  {expiryLabel(invite.expiresAt)}
                </p>
              </div>

              <ConfirmButton
                variant="ghost"
                size="icon"
                destructive
                disabled={isPending}
                tooltip="Revogar convite"
                title="Revogar este convite?"
                description="O link deixa de funcionar imediatamente. Você pode convidar o mesmo e-mail de novo depois."
                confirmLabel="Revogar"
                onConfirm={() =>
                  revokeInvite({ organizationId, inviteId: invite.id })
                }
              >
                <Trash2Icon className="w-4 h-4" />
              </ConfirmButton>
            </div>
          ))}
        </div>
      )}

      <InviteDialog
        organizationId={organizationId}
        open={isDialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}
