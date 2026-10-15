import { CheckIcon, CopyIcon, Loader2Icon, SendIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCreateClientPortalInvite } from "@/http/generated/client/client";

/**
 * Acesso do cliente ao portal. Antes a senha inicial eram os últimos cinco
 * dígitos do CPF e o escritório passava isso por telefone; agora sai daqui um
 * link de uso único que a própria pessoa troca por uma senha.
 *
 * O link volta na resposta de propósito: cliente sem e-mail cadastrado, ou que
 * não recebeu a mensagem, precisa que o advogado consiga copiar e mandar pelo
 * canal que já usa.
 */
export function PortalAccessCard({
  clientId,
  hasMail,
}: {
  clientId: string;
  hasMail: boolean;
}) {
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { mutateAsync: createInvite, isPending } = useCreateClientPortalInvite();

  async function handleGenerate() {
    const result = await createInvite({ clientId });
    setInviteUrl(result.inviteUrl);
    setCopied(false);

    toast.success(
      result.emailSent
        ? "Link enviado por e-mail para o cliente."
        : "Link gerado. Copie e envie para o cliente.",
    );
  }

  async function handleCopy() {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    toast.success("Link copiado.");
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">
          Acesso ao portal
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          {hasMail
            ? "Gera um link de primeiro acesso e envia por e-mail. O cliente escolhe a própria senha."
            : "Este cliente não tem e-mail cadastrado. Gere o link e envie pelo canal que preferir."}
        </p>
      </div>

      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        disabled={isPending}
        onClick={handleGenerate}
      >
        {isPending ? (
          <Loader2Icon className="w-4 h-4 animate-spin" />
        ) : (
          <SendIcon className="w-4 h-4" />
        )}
        {inviteUrl ? "Gerar novo link" : "Gerar link de acesso"}
      </Button>

      {inviteUrl && (
        <div className="flex items-center gap-2">
          <code className="flex-1 min-w-0 truncate text-xs bg-muted rounded-md px-3 py-2 text-muted-foreground">
            {inviteUrl}
          </code>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Copiar link"
            onClick={handleCopy}
          >
            {copied ? (
              <CheckIcon className="w-4 h-4" />
            ) : (
              <CopyIcon className="w-4 h-4" />
            )}
          </Button>
        </div>
      )}

      {inviteUrl && (
        <p className="text-xs text-muted-foreground">
          O link expira em 7 dias e vale uma vez só. Gerar um novo invalida o
          anterior.
        </p>
      )}
    </div>
  );
}
