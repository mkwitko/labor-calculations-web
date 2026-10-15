import { ConfirmButton } from "@/components/confirm-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ASSIGNABLE_ROLES,
  ROLE_LABELS,
  type OrgRole,
} from "@/hooks/use-organizations";
import type { ListOrganizationMembers200DataItem } from "@/http/generated/lexlaboral-server.schemas";
import { Trash2Icon } from "lucide-react";

/**
 * Uma linha da equipe. As três travas abaixo espelham guardas do back — a API
 * recusaria de todo modo, e desabilitar aqui poupa o usuário de descobrir a
 * regra por um erro.
 */
export function MemberRow({
  member,
  currentUserId,
  isPending,
  onChangeRole,
  onRemove,
}: {
  member: ListOrganizationMembers200DataItem;
  currentUserId: string | undefined;
  isPending: boolean;
  onChangeRole: (role: Exclude<OrgRole, "owner">) => void;
  onRemove: () => void;
}) {
  const isSelf = member.user.id === currentUserId;
  const isOwnerRow = member.role === "owner";

  // Titularidade muda só por transferência (`POST /transfer-ownership`), e
  // ninguém altera o próprio papel — nem o titular.
  const lockReason = isOwnerRow
    ? "A titularidade muda apenas por transferência"
    : isSelf
      ? "Você não altera seu próprio papel"
      : null;

  return (
    <div className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground truncate">
          {member.user.name}
          {isSelf && (
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              você
            </span>
          )}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {member.user.mail}
          {member.user.oabNumber ? ` · ${member.user.oabNumber}` : ""}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {lockReason ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-xs font-medium text-muted-foreground border border-border rounded-md px-2.5 py-1.5">
                  {ROLE_LABELS[member.role as OrgRole]}
                </span>
              </TooltipTrigger>
              <TooltipContent>{lockReason}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <Select
            value={member.role}
            disabled={isPending}
            onValueChange={(role) =>
              onChangeRole(role as Exclude<OrgRole, "owner">)
            }
          >
            <SelectTrigger className="w-[190px]" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ASSIGNABLE_ROLES.map((role) => (
                <SelectItem key={role} value={role}>
                  {ROLE_LABELS[role]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <ConfirmButton
          variant="ghost"
          size="icon"
          destructive
          disabled={isPending || isSelf || isOwnerRow}
          tooltip={
            isSelf
              ? "Para sair da organização use o botão abaixo"
              : isOwnerRow
                ? "O titular não pode ser removido"
                : "Remover da organização"
          }
          title={`Remover ${member.user.name}?`}
          description="A pessoa perde acesso a esta organização no próximo request, e o assento dela é liberado na assinatura. Os casos atribuídos a ela continuam no escritório."
          confirmLabel="Remover"
          onConfirm={onRemove}
        >
          <Trash2Icon className="w-4 h-4" />
        </ConfirmButton>
      </div>
    </div>
  );
}
