import { ConfirmButton } from "@/components/confirm-button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrgAbilities } from "@/hooks/use-organizations";
import {
  getListOrganizationMembersQueryKey,
  getListOrganizationsQueryKey,
  useLeaveOrganization,
  useListOrganizationMembers,
  useTransferOwnership,
} from "@/http/generated/organization/organization";
import { useGetAuthenticatedUser } from "@/http/generated/user/user";
import { queryClient } from "@/lib/react-query";
import { CrownIcon, DoorOpenIcon, Loader2Icon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

function TransferDialog({
  organizationId,
  open,
  onOpenChange,
}: {
  organizationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: me } = useGetAuthenticatedUser();
  const { data } = useListOrganizationMembers(organizationId);
  const [targetUserId, setTargetUserId] = useState("");
  const [confirmation, setConfirmation] = useState("");

  const candidates = (data?.data ?? []).filter(
    (member) => member.user.id !== me?.data.id,
  );
  const target = candidates.find((member) => member.user.id === targetUserId);

  const { mutate: transfer, isPending } = useTransferOwnership({
    mutation: {
      onSuccess: () => {
        // O papel de quem pediu mudou para sócio, e o switcher mostra o papel.
        queryClient.invalidateQueries({
          queryKey: getListOrganizationsQueryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: getListOrganizationMembersQueryKey(organizationId),
        });
        toast.success("Titularidade transferida");
        onOpenChange(false);
      },
      onError: () => toast.error("Não foi possível transferir a titularidade"),
    },
  });

  const canConfirm =
    target != null && confirmation.trim() === target.user.name && !isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Transferir titularidade</DialogTitle>
          <DialogDescription>
            Quem receber passa a responder pela assinatura da organização. Você
            fica como sócio e não poderá transferir de volta — só o titular
            transfere.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="transfer-target">Novo titular</Label>
            <Select
              value={targetUserId}
              onValueChange={(next) => {
                setTargetUserId(next);
                setConfirmation("");
              }}
            >
              <SelectTrigger id="transfer-target">
                <SelectValue placeholder="Escolha um membro" />
              </SelectTrigger>
              <SelectContent>
                {candidates.map((member) => (
                  <SelectItem key={member.user.id} value={member.user.id}>
                    {member.user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {target && (
            <div className="space-y-2">
              <Label htmlFor="transfer-confirm">
                Digite <strong>{target.user.name}</strong> para confirmar
              </Label>
              <Input
                id="transfer-confirm"
                autoComplete="off"
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            disabled={!canConfirm}
            onClick={() =>
              transfer({ organizationId, data: { userId: targetUserId } })
            }
          >
            {isPending && <Loader2Icon className="w-4 h-4 animate-spin" />}
            Transferir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DangerSection({
  organizationId,
}: {
  organizationId: string;
}) {
  const navigate = useNavigate();
  const { isOwner } = useOrgAbilities();
  const [isTransferOpen, setTransferOpen] = useState(false);

  const { mutate: leave, isPending: isLeaving } = useLeaveOrganization({
    mutation: {
      onSuccess: () => {
        // A sessão segue válida, mas em outra organização — ou em nenhuma, e aí
        // o hook de auth do back devolve 403 e o interceptor manda para o login.
        queryClient.clear();
        navigate("/home", { replace: true });
        toast.success("Você saiu da organização");
      },
      onError: () => toast.error("Não foi possível sair da organização"),
    },
  });

  return (
    <div className="rounded-xl border border-border bg-card divide-y divide-border">
      {isOwner && (
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">
              Transferir titularidade
            </p>
            <p className="text-xs text-muted-foreground">
              Passe a responsabilidade pela assinatura para outro membro.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTransferOpen(true)}
          >
            <CrownIcon className="w-4 h-4" />
            Transferir
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">
            Sair da organização
          </p>
          <p className="text-xs text-muted-foreground">
            {isOwner
              ? "O titular precisa transferir a titularidade antes de sair — uma organização sem titular não tem quem responda pela assinatura."
              : "Você perde acesso aos casos deste escritório e o assento é liberado."}
          </p>
        </div>
        {/* Para o titular o back devolve 409. Desabilitar antecipa a regra em
            vez de deixar o usuário bater num erro que não sabe resolver. */}
        <ConfirmButton
          variant="outline"
          size="sm"
          destructive
          disabled={isOwner || isLeaving}
          tooltip={
            isOwner ? "Transfira a titularidade primeiro" : "Sair da organização"
          }
          title="Sair desta organização?"
          description="Você perde acesso imediatamente e precisará de um novo convite para voltar."
          confirmLabel="Sair"
          onConfirm={() => leave({ organizationId })}
        >
          <DoorOpenIcon className="w-4 h-4" />
          Sair
        </ConfirmButton>
      </div>

      {isOwner && (
        <TransferDialog
          organizationId={organizationId}
          open={isTransferOpen}
          onOpenChange={setTransferOpen}
        />
      )}
    </div>
  );
}
