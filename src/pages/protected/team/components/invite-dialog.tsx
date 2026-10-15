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
import {
  ASSIGNABLE_ROLES,
  ROLE_LABELS,
  type OrgRole,
} from "@/hooks/use-organizations";
import { formatBRL, usePlans } from "@/hooks/use-plans";
import type { CreateInvite201Data } from "@/http/generated/lexlaboral-server.schemas";
import {
  getListInvitesQueryKey,
  useCreateInvite,
  useGetOrganizationPlan,
} from "@/http/generated/organization/organization";
import { queryClient } from "@/lib/react-query";
import { CheckIcon, CopyIcon, Loader2Icon } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

type AssignableRole = Exclude<OrgRole, "owner">;

/** Mensagem do back quando o e-mail já é membro ou já tem convite pendente. */
function conflictMessage(error: unknown): string | null {
  const message = (
    error as { response?: { data?: { message?: string } } } | undefined
  )?.response?.data?.message;

  return message ?? null;
}

/**
 * Teto estourado é 409 com a mensagem do plano. Distinguir importa porque só
 * este caso tem saída em outra tela: e-mail repetido se resolve aqui, teto
 * cheio se resolve na assinatura.
 */
function isPlanLimit(error: unknown): boolean {
  const message = conflictMessage(error) ?? "";

  return /plano/i.test(message) && /vagas|comporta/i.test(message);
}

/**
 * Quanto do plano já está ocupado. Convite pendente conta como vaga — é assim
 * que o back conta —, senão dez convites num plano de cinco só estourariam o
 * teto no aceite, quando recusar é pior: a promessa já foi feita a alguém.
 */
function PlanOccupancy({ organizationId }: { organizationId: string }) {
  const { data, isLoading, isError } = useGetOrganizationPlan(organizationId);
  const { extraMember } = usePlans();

  if (isLoading) {
    return <p className="text-xs text-muted-foreground">Lendo o plano...</p>;
  }

  // Ocupação é informação, não trava: falha no Stripe não impede convidar.
  if (isError || !data) {
    return (
      <p className="text-xs text-muted-foreground">
        Não foi possível ler o plano agora. O convite continua disponível.
      </p>
    );
  }

  const plan = data.data;

  if (plan.remaining > 0) {
    return (
      <p className="text-xs text-muted-foreground">
        Plano {plan.name}: {plan.members} de {plan.maxMembers}{" "}
        {plan.maxMembers === 1 ? "vaga" : "vagas"} ocupadas
        {plan.pendingInvites > 0
          ? `, mais ${plan.pendingInvites} ${
              plan.pendingInvites === 1
                ? "convite pendente"
                : "convites pendentes"
            }`
          : ""}
        .
      </p>
    );
  }

  if (plan.allowsExtraMembers && extraMember.monthly) {
    return (
      <p className="text-xs text-muted-foreground">
        O teto do plano {plan.name} está cheio. Quem entrar a partir daqui é
        cobrado como advogado adicional, a{" "}
        <strong className="text-foreground">
          {formatBRL(extraMember.monthly.amountCents)}
        </strong>{" "}
        por pessoa.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-amber-700 dark:text-amber-400">
        O plano {plan.name} comporta {plan.maxMembers}{" "}
        {plan.maxMembers === 1 ? "pessoa" : "pessoas"} e todas as vagas já estão
        ocupadas. Mude de plano para convidar mais gente.
      </p>
      <Button asChild variant="outline" size="sm">
        <Link to="/assinatura">Ver planos</Link>
      </Button>
    </div>
  );
}

export function InviteDialog({
  organizationId,
  open,
  onOpenChange,
}: {
  organizationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AssignableRole>("lawyer");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [planBlocked, setPlanBlocked] = useState(false);
  const [created, setCreated] = useState<CreateInvite201Data | null>(null);
  const [copied, setCopied] = useState(false);

  const { mutate: createInvite, isPending } = useCreateInvite({
    mutation: {
      onSuccess: (response) => {
        setCreated(response.data);
        setFieldError(null);
        setPlanBlocked(false);
        queryClient.invalidateQueries({
          queryKey: getListInvitesQueryKey(organizationId),
        });
      },
      onError: (error) => {
        setFieldError(
          conflictMessage(error) ?? "Não foi possível criar o convite",
        );
        setPlanBlocked(isPlanLimit(error));
      },
    },
  });

  const reset = () => {
    setEmail("");
    setRole("lawyer");
    setFieldError(null);
    setPlanBlocked(false);
    setCreated(null);
    setCopied(false);
  };

  const close = () => {
    onOpenChange(false);
    reset();
  };

  const copyLink = async () => {
    if (!created) return;

    await navigator.clipboard.writeText(created.inviteUrl);
    setCopied(true);
    toast.success("Link copiado");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => (next ? onOpenChange(true) : close())}
    >
      <DialogContent className="sm:max-w-md">
        {created ? (
          <>
            <DialogHeader>
              <DialogTitle>Convite enviado</DialogTitle>
              <DialogDescription>
                Enviamos o convite para {created.email}. Você também pode passar
                o link direto.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <Label htmlFor="invite-link">Link do convite</Label>
              <div className="flex gap-2">
                <Input
                  id="invite-link"
                  readOnly
                  value={created.inviteUrl}
                  onFocus={(event) => event.currentTarget.select()}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={copyLink}
                  aria-label="Copiar link"
                >
                  {copied ? (
                    <CheckIcon className="w-4 h-4" />
                  ) : (
                    <CopyIcon className="w-4 h-4" />
                  )}
                </Button>
              </div>
              {/* O banco guarda só o hash do token: esta é a única tela em que
                  o link existe. Fechar sem copiar exige revogar e convidar de
                  novo. */}
              <p className="text-xs text-muted-foreground">
                Guarde agora se for usar o link — ele não pode ser recuperado
                depois.
              </p>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={reset}>
                Convidar outra pessoa
              </Button>
              <Button onClick={close}>Concluir</Button>
            </DialogFooter>
          </>
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              createInvite({
                organizationId,
                data: { email: email.trim().toLowerCase(), role },
              });
            }}
          >
            <DialogHeader>
              <DialogTitle>Convidar para a organização</DialogTitle>
              <DialogDescription>
                A pessoa ocupa uma vaga do plano e passa a ver o escritório
                conforme o papel escolhido.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="invite-email">E-mail</Label>
                <Input
                  id="invite-email"
                  type="email"
                  required
                  autoComplete="off"
                  placeholder="pessoa@escritorio.com.br"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setFieldError(null);
                  }}
                  aria-invalid={fieldError ? true : undefined}
                />
                {/* O aceite exige que a conta use este e-mail; dizer antes
                    evita um 403 que o convidado não sabe resolver. */}
                <p className="text-xs text-muted-foreground">
                  A conta que aceitar precisa usar exatamente este e-mail.
                </p>
                {fieldError && (
                  <p className="text-xs text-destructive">{fieldError}</p>
                )}
                {/* Teto cheio não se resolve neste dialog: o caminho é mudar de
                    plano, e a tela mostra a porta em vez de deixar tentar de
                    novo o mesmo convite. */}
                {planBlocked && (
                  <Button asChild variant="outline" size="sm">
                    <Link to="/assinatura">Ver planos</Link>
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="invite-role">Papel</Label>
                <Select
                  value={role}
                  onValueChange={(next) => setRole(next as AssignableRole)}
                >
                  <SelectTrigger id="invite-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSIGNABLE_ROLES.map((option) => (
                      <SelectItem key={option} value={option}>
                        {ROLE_LABELS[option]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <PlanOccupancy organizationId={organizationId} />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={close}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending || email.length === 0}>
                {isPending && (
                  <Loader2Icon className="w-4 h-4 animate-spin" />
                )}
                Enviar convite
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
