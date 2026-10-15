import {
  BookOpenIcon,
  HeadphonesIcon,
  InboxIcon,
  CrownIcon,
  GiftIcon,
  KeyboardIcon,
  Loader2Icon,
  LogOutIcon,
  PlayCircleIcon,
  SettingsIcon,
  UserIcon,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useOrgAbilities } from "@/hooks/use-organizations";
import { TOUR_AREAS, useProductTour } from "@/hooks/use-product-tour";
import { useSubscription } from "@/hooks/use-subscription";
import { useSignOut } from "@/http/generated/auth/auth";
import { useGetSupportUnreadCount } from "@/http/generated/support/support";
import { useGetAuthenticatedUser } from "@/http/generated/user/user";
import { resetAnalytics } from "@/lib/analytics";
import { queryClient } from "@/lib/react-query";

function initials(name: string | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? "") : "";
  return (first + last).toUpperCase();
}

/**
 * Menu de conta e ajuda no header. Recebeu o que saiu da sidebar (Perfil,
 * Assinatura, Indicações, Configurações, Atalhos, Sair) e o que saiu do
 * HelpLauncher flutuante (refazer tours, Central de Ajuda), para que desktop
 * e mobile tenham um caminho só.
 *
 * Assinatura e Indicações seguem atrás de `isOwner`, igual à sidebar antes:
 * esconder o item não substitui a checagem do servidor.
 */
export function UserMenu() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: me } = useGetAuthenticatedUser();
  const { data: support } = useGetSupportUnreadCount({
    query: { staleTime: 60 * 1000 },
  });
  const { isOwner } = useOrgAbilities();
  const {
    isSubscribed,
    isTrial,
    trialDaysLeft,
    isLoading: isSubLoading,
  } = useSubscription();
  const { replayTour, startTour } = useProductTour();

  const { mutate: signOut, isPending: isSigningOut } = useSignOut({
    mutation: {
      onSuccess: () => {
        resetAnalytics();
        queryClient.clear();
        navigate("/authentication");
      },
    },
  });

  const user = me?.data;
  const unread = support?.unread ?? 0;
  const showTrial = !isSubLoading && isTrial && trialDaysLeft !== null;
  const showUpgrade = !isSubLoading && !isSubscribed && !isTrial;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        data-tour="help-button"
        aria-label="Conta e ajuda"
        className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Avatar className="h-9 w-9">
          <AvatarFallback className="text-xs font-semibold">
            {initials(user?.name)}
          </AvatarFallback>
        </Avatar>
        {(showTrial || showUpgrade) && (
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-background" />
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="font-normal">
          <p className="text-sm font-medium text-foreground truncate">
            {user?.name ?? "Minha conta"}
          </p>
          {user?.mail && (
            <p className="text-xs text-muted-foreground truncate">
              {user.mail}
            </p>
          )}
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem onSelect={() => navigate("/profile")}>
          <UserIcon className="w-4 h-4" />
          Perfil
        </DropdownMenuItem>

        {isOwner && (
          <DropdownMenuItem onSelect={() => navigate("/billing")}>
            <CrownIcon className="w-4 h-4" />
            <span className="flex-1">Assinatura</span>
            {showTrial && (
              <span className="text-[10px] font-semibold rounded-full bg-primary px-1.5 py-0.5 leading-none text-primary-foreground">
                {trialDaysLeft}d
              </span>
            )}
            {showUpgrade && (
              <span className="text-[10px] font-semibold rounded-full bg-primary px-1.5 py-0.5 leading-none text-primary-foreground">
                Assinar
              </span>
            )}
          </DropdownMenuItem>
        )}

        {isOwner && (
          <DropdownMenuItem onSelect={() => navigate("/indicacoes")}>
            <GiftIcon className="w-4 h-4" />
            Indicações
          </DropdownMenuItem>
        )}

        <DropdownMenuItem onSelect={() => navigate("/settings")}>
          <SettingsIcon className="w-4 h-4" />
          Configurações
        </DropdownMenuItem>

        <DropdownMenuItem onSelect={() => navigate("/settings/atalhos")}>
          <KeyboardIcon className="w-4 h-4" />
          Atalhos de teclado
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onSelect={() => navigate("/ajuda")}>
          <BookOpenIcon className="w-4 h-4" />
          Central de Ajuda
        </DropdownMenuItem>

        <DropdownMenuItem onSelect={() => navigate("/suporte")}>
          <HeadphonesIcon className="w-4 h-4" />
          <span className="flex-1">Suporte e sugestões</span>
          {unread > 0 && (
            <span className="rounded-full bg-primary px-1.5 py-0.5 font-semibold text-[10px] text-primary-foreground leading-none">
              {unread}
            </span>
          )}
        </DropdownMenuItem>

        {/* Atalho do dono do produto. Esconder não protege nada — o
            `requireAdmin` no servidor é que recusa —, mas evita um item sem
            sentido para quem assina. */}
        {user?.isAdmin && (
          <DropdownMenuItem onSelect={() => navigate("/admin/suporte")}>
            <InboxIcon className="w-4 h-4" />
            Fila de atendimento
          </DropdownMenuItem>
        )}

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <PlayCircleIcon className="w-4 h-4" />
            Refazer tour
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {TOUR_AREAS.map((t) => (
              <DropdownMenuItem
                key={t.area}
                title={t.hint}
                onSelect={() => {
                  if (location.pathname === t.route) {
                    startTour(t.area);
                  } else {
                    replayTour(t.area);
                    navigate(t.route);
                  }
                }}
              >
                <PlayCircleIcon className="w-4 h-4 text-primary" />
                {t.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          disabled={isSigningOut}
          onSelect={(e) => {
            e.preventDefault();
            signOut();
          }}
        >
          {isSigningOut ? (
            <Loader2Icon className="w-4 h-4 animate-spin" />
          ) : (
            <LogOutIcon className="w-4 h-4" />
          )}
          {isSigningOut ? "Saindo..." : "Sair"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
