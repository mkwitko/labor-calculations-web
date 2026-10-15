import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { ROLE_LABELS, type OrgRole } from "@/hooks/use-organizations";
import { useCheckAuth, useSwitchOrganization } from "@/http/generated/auth/auth";
import {
  useAcceptInvite,
  useGetInvite,
} from "@/http/generated/organization/organization";
import { queryClient } from "@/lib/react-query";
import {
  AlertCircleIcon,
  BuildingIcon,
  CheckCircle2Icon,
  Loader2Icon,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

/**
 * Tela pública de aceite. A rota `/convite/:token` é acordada com o back —
 * `buildInviteUrl` monta `${CLIENT_URL}/convite/${token}` —, então mudar o
 * caminho aqui quebra todo convite já enviado.
 *
 * Fica fora do AppLayout de propósito: quem recebe o convite pode não ter
 * sessão, e precisa ver de quem é o convite **antes** de decidir entrar.
 */

function statusOf(error: unknown): number | undefined {
  return (error as { response?: { status?: number } } | undefined)?.response
    ?.status;
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-muted px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <Logo className="w-9 h-9 rounded-lg shrink-0" />
          <span className="text-sm font-semibold text-foreground">
            Lex Laboral
          </span>
        </div>
        {children}
      </div>
    </main>
  );
}

function Problem({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Shell>
      <div className="space-y-3">
        <AlertCircleIcon className="w-8 h-8 text-muted-foreground" />
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Button asChild variant="outline" className="w-full">
        <Link to="/">Voltar ao início</Link>
      </Button>
    </Shell>
  );
}

export default function InviteAccept() {
  const { token = "" } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [accepted, setAccepted] = useState<{
    organizationId: string;
    role: string;
  } | null>(null);
  const [acceptError, setAcceptError] = useState<string | null>(null);

  const { data: auth, isLoading: isCheckingAuth } = useCheckAuth();
  const {
    data,
    isLoading,
    error,
  } = useGetInvite(token, { query: { enabled: token.length > 0, retry: false } });

  const { mutate: acceptInvite, isPending: isAccepting } = useAcceptInvite({
    mutation: {
      onSuccess: (response) => {
        setAccepted(response.data);
        setAcceptError(null);
      },
      onError: (mutationError) => {
        const status = statusOf(mutationError);

        setAcceptError(
          status === 403
            ? `Este convite é para ${data?.data.email}. Entre com essa conta para aceitar.`
            : status === 409
              ? "Você já é membro dessa organização."
              : "Não foi possível aceitar o convite.",
        );
      },
    },
  });

  const { mutate: switchOrganization, isPending: isSwitching } =
    useSwitchOrganization({
      mutation: {
        onSuccess: () => {
          // Cookies novos: todo cache pertence à organização anterior.
          queryClient.clear();
          navigate("/home", { replace: true });
        },
        onError: () => toast.error("Não foi possível entrar na organização"),
      },
    });

  if (isLoading || isCheckingAuth) {
    return (
      <Shell>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2Icon className="w-4 h-4 animate-spin" />
          Carregando convite...
        </div>
      </Shell>
    );
  }

  const status = statusOf(error);

  if (status === 404 || !token) {
    return (
      <Problem
        title="Convite não encontrado"
        description="O link pode ter sido digitado incorretamente. Peça um novo convite a quem administra a organização."
      />
    );
  }

  if (status === 409) {
    return (
      <Problem
        title="Convite não está mais válido"
        description="Ele expirou ou foi cancelado. Peça um novo convite a quem administra a organização."
      />
    );
  }

  const invite = data?.data;

  if (!invite) {
    return (
      <Problem
        title="Não foi possível ler o convite"
        description="Tente novamente em alguns instantes."
      />
    );
  }

  if (accepted) {
    return (
      <Shell>
        <div className="space-y-3">
          <CheckCircle2Icon className="w-8 h-8 text-emerald-500" />
          <h1 className="text-lg font-semibold text-foreground">
            Você entrou em {invite.organizationName}
          </h1>
          <p className="text-sm text-muted-foreground">
            Seu papel é {ROLE_LABELS[accepted.role as OrgRole]}. Você continua na
            organização em que estava — trocar é uma escolha sua.
          </p>
        </div>
        <div className="space-y-2">
          <Button
            className="w-full"
            disabled={isSwitching}
            onClick={() =>
              switchOrganization({
                data: { organizationId: accepted.organizationId },
              })
            }
          >
            {isSwitching && <Loader2Icon className="w-4 h-4 animate-spin" />}
            Entrar em {invite.organizationName}
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate("/home", { replace: true })}
          >
            Continuar onde estou
          </Button>
        </div>
      </Shell>
    );
  }

  const returnTo = `/convite/${encodeURIComponent(token)}`;

  return (
    <Shell>
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <BuildingIcon className="w-4 h-4" />
          <span className="text-xs font-semibold uppercase tracking-wide">
            Convite
          </span>
        </div>
        <h1 className="text-lg font-semibold text-foreground">
          Você foi convidado para {invite.organizationName}
        </h1>
        <dl className="text-sm space-y-1">
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Papel</dt>
            <dd className="text-foreground font-medium">
              {ROLE_LABELS[invite.role as OrgRole]}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">E-mail do convite</dt>
            <dd className="text-foreground font-medium truncate">
              {invite.email}
            </dd>
          </div>
        </dl>
      </div>

      {auth?.isAuthenticated ? (
        <div className="space-y-3">
          {acceptError && (
            <p className="text-sm text-destructive">{acceptError}</p>
          )}
          <Button
            className="w-full"
            disabled={isAccepting}
            onClick={() => acceptInvite({ data: { token } })}
          >
            {isAccepting && <Loader2Icon className="w-4 h-4 animate-spin" />}
            Aceitar convite
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* O back exige que a conta use o e-mail do convite. Dizer aqui evita
              descobrir a regra por um 403 depois de criar conta errada. */}
          <p className="text-sm text-muted-foreground">
            Entre ou crie sua conta usando <strong>{invite.email}</strong> para
            aceitar.
          </p>
          <Button asChild className="w-full">
            <Link
              to={`/authentication?next=${encodeURIComponent(returnTo)}`}
            >
              Entrar
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link
              to={`/authentication/sign-up?next=${encodeURIComponent(returnTo)}`}
            >
              Criar conta
            </Link>
          </Button>
        </div>
      )}
    </Shell>
  );
}
