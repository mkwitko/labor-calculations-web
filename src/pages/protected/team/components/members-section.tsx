import { EmptyState } from "@/components/empty-state";
import { ListSkeleton } from "@/components/list-skeleton";
import type { OrgRole } from "@/hooks/use-organizations";
import {
  getListOrganizationMembersQueryKey,
  getListOrganizationsQueryKey,
  useListOrganizationMembers,
  useRemoveMember,
  useUpdateMemberRole,
} from "@/http/generated/organization/organization";
import { useGetAuthenticatedUser } from "@/http/generated/user/user";
import { queryClient } from "@/lib/react-query";
import { UsersRoundIcon } from "lucide-react";
import { toast } from "sonner";
import { MemberRow } from "./member-row";

export function MembersSection({ organizationId }: { organizationId: string }) {
  const { data: me } = useGetAuthenticatedUser();
  const { data, isLoading } = useListOrganizationMembers(organizationId);

  const members = data?.data ?? [];

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: getListOrganizationMembersQueryKey(organizationId),
    });
    // Mudar papel pode ter mudado o papel de quem está olhando (em outra aba,
    // ou o próprio switcher, que mostra o papel).
    queryClient.invalidateQueries({
      queryKey: getListOrganizationsQueryKey(),
    });
  };

  const { mutate: updateRole, isPending: isUpdating } = useUpdateMemberRole({
    mutation: {
      onSuccess: () => {
        invalidate();
        toast.success("Papel atualizado");
      },
      onError: () => toast.error("Não foi possível alterar o papel"),
    },
  });

  const { mutate: removeMember, isPending: isRemoving } = useRemoveMember({
    mutation: {
      onSuccess: () => {
        invalidate();
        toast.success("Membro removido");
      },
      onError: () => toast.error("Não foi possível remover o membro"),
    },
  });

  if (isLoading) return <ListSkeleton rows={4} />;

  if (members.length === 0) {
    return (
      <EmptyState
        icon={UsersRoundIcon}
        title="Nenhum membro"
        description="Convide alguém para ocupar um assento nesta organização."
      />
    );
  }

  return (
    <div className="divide-y divide-border rounded-xl border border-border overflow-hidden bg-card">
      {members.map((member) => (
        <MemberRow
          key={member.id}
          member={member}
          currentUserId={me?.data.id}
          isPending={isUpdating || isRemoving}
          onChangeRole={(role: Exclude<OrgRole, "owner">) =>
            updateRole({
              organizationId,
              membershipId: member.id,
              data: { role },
            })
          }
          onRemove={() =>
            removeMember({ organizationId, membershipId: member.id })
          }
        />
      ))}
    </div>
  );
}
