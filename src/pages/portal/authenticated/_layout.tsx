import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  getCheckClientAuthQueryKey,
  getGetClientNotificationsQueryKey,
  useCheckClientAuth,
  useGetClientNotifications,
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useSignOutClient,
  useSwitchClientOrganization,
} from "@/http/generated/client-portal/client-portal";
import { queryClient } from "@/lib/react-query";
import {
  primaryColor,
  secondaryColor,
  secondaryHoverColor,
} from "@/utils/get-css";
import { formatDateTime } from "@/utils/value-format";
import {
  BellIcon,
  BriefcaseIcon,
  FileTextIcon,
  HomeIcon,
  KeyRoundIcon,
  Loader2Icon,
  LogOutIcon,
  MenuIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { PortalOfficeSwitcher } from "./components/portal-office-switcher";

function NotificationsDropdown() {
  const { data, isLoading } = useGetClientNotifications({ limit: 10 });
  const { mutateAsync: markAsRead } = useMarkNotificationAsRead();
  const { mutateAsync: markAllRead } = useMarkAllNotificationsAsRead();

  async function handleMarkAllRead() {
    await markAllRead();
    await queryClient.invalidateQueries({ queryKey: getGetClientNotificationsQueryKey() });
  }

  async function handleMarkOneRead(id: string) {
    await markAsRead({ notificationId: id });
    await queryClient.invalidateQueries({ queryKey: getGetClientNotificationsQueryKey() });
  }

  const unread = data?.unreadCount ?? 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Notificações" className="relative text-slate-400 hover:text-white hover:bg-white/10">
          <BellIcon className="w-4 h-4" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificações</span>
          {unread > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="text-xs font-normal text-primary hover:underline"
            >
              Marcar todas como lidas
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isLoading && (
          <div className="flex items-center justify-center py-6">
            <Loader2Icon className="w-4 h-4 animate-spin text-muted-foreground" />
          </div>
        )}
        {!isLoading && data?.notifications.length === 0 && (
          <div className="px-2 py-6 text-center text-xs text-muted-foreground">
            Nenhuma notificação
          </div>
        )}
        {!isLoading && data?.notifications.map((n) => (
          <DropdownMenuItem
            key={n.id}
            className={`flex flex-col items-start gap-1 py-2.5 px-2 ${!n.isRead ? "bg-primary/5" : ""}`}
            onSelect={() => {
              if (!n.isRead) handleMarkOneRead(n.id);
            }}
          >
            <div className="flex items-center gap-2 w-full">
              <span className={`text-sm font-medium ${!n.isRead ? "text-foreground" : "text-muted-foreground"}`}>
                {n.title}
              </span>
              {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
            </div>
            <span className="text-xs text-muted-foreground line-clamp-2">{n.message}</span>
            <span className="text-[10px] text-muted-foreground/70">{formatDateTime(n.createdAt)}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const NAV_ITEMS = [
  { to: "/portal/inicio", label: "Início", icon: HomeIcon },
  { to: "/portal/casos", label: "Meus processos", icon: BriefcaseIcon },
  { to: "/portal/calculos", label: "Meus cálculos", icon: FileTextIcon },
];

export function PortalLayout() {
  const { data, isFetching } = useCheckClientAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { mutateAsync: signOut } = useSignOutClient({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: getCheckClientAuthQueryKey() });
        navigate("/portal");
      },
    },
  });

  const { mutate: switchOffice, isPending: isSwitching } =
    useSwitchClientOrganization({
      mutation: {
        onSuccess: ({ mustChangePassword }) => {
          // Todo dado em cache é do escritório anterior; mantê-lo mostraria
          // processo de um escritório sob o cabeçalho de outro.
          queryClient.clear();
          setMobileOpen(false);
          navigate(
            mustChangePassword ? "/portal/change-password" : "/portal/inicio",
          );
        },
        onError: () => toast.error("Não foi possível trocar de escritório"),
      },
    });

  const offices = data?.organizations ?? [];

  useEffect(() => {
    if (isFetching) return;
    if (!data?.isAuthenticated) {
      navigate("/portal");
      return;
    }
    if (data.mustChangePassword && location.pathname !== "/portal/change-password") {
      navigate("/portal/change-password");
    }
  }, [isFetching, data?.isAuthenticated, data?.mustChangePassword, location.pathname]);

  if (isFetching) return null;
  if (!data?.isAuthenticated) return null;

  const showNav = !data.mustChangePassword;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-sans w-full">
      {/* ── Desktop sidebar ── */}
      <div
        className="
          hidden lg:flex
          lg:w-72 lg:min-h-screen
          relative overflow-hidden
          bg-slate-900
          flex-col
          p-6
        "
      >
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              `radial-gradient(ellipse at 10% 20%, ${primaryColor} 0%, transparent 60%),` +
              `radial-gradient(ellipse at 90% 80%, ${secondaryColor} 0%, transparent 50%),` +
              `radial-gradient(ellipse at 50% 60%, ${secondaryHoverColor} 0%, transparent 55%)`,
          }}
        />
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.2) 1px, transparent 1px)," +
              "linear-gradient(90deg, rgba(255,255,255,.2) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center shrink-0">
              <div className="w-5 h-5 rounded-md bg-white/80" />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">Portal do Cliente</p>
              <p className="text-xs text-slate-400">Acompanhe seu processo</p>
            </div>
          </div>

          {showNav && offices.length > 1 && (
            <div className="mb-3">
              <PortalOfficeSwitcher
                organizations={offices}
                isPending={isSwitching}
                onSelect={(organizationId) =>
                  switchOffice({ data: { organizationId } })
                }
              />
            </div>
          )}

          {showNav && (
            <nav className="space-y-1 flex-1">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                      ? "bg-white/15 text-white"
                      : "text-slate-400 hover:bg-white/10 hover:text-white"
                    }`
                  }
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          )}

          {data.mustChangePassword && (
            <div className="flex-1 flex items-start">
              <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-white/10 text-white text-sm font-medium w-full">
                <KeyRoundIcon className="w-4 h-4 shrink-0" />
                Criar senha
              </div>
            </div>
          )}

          <div className="mt-auto pt-6 border-t border-white/10">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut()}
              className="w-full justify-start text-slate-400 hover:text-white hover:bg-white/10 gap-2"
            >
              <LogOutIcon className="w-4 h-4" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex flex-col min-h-screen bg-white dark:bg-slate-950 overflow-y-auto">
        {/* Mobile header */}
        <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Abrir menu">
                <MenuIcon className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-slate-900 text-white p-6">
              <SheetHeader>
                <SheetTitle className="text-white">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center shrink-0">
                      <div className="w-5 h-5 rounded-md bg-white/80" />
                    </div>
                    <span className="text-sm font-bold text-white">Portal do Cliente</span>
                  </div>
                </SheetTitle>
              </SheetHeader>
              {showNav && offices.length > 1 && (
                <div className="mt-6">
                  <PortalOfficeSwitcher
                    organizations={offices}
                    isPending={isSwitching}
                    onSelect={(organizationId) =>
                      switchOffice({ data: { organizationId } })
                    }
                  />
                </div>
              )}
              <nav className="space-y-1 mt-6">
                {NAV_ITEMS.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                        ? "bg-white/15 text-white"
                        : "text-slate-400 hover:bg-white/10 hover:text-white"
                      }`
                    }
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    {item.label}
                  </NavLink>
                ))}
              </nav>
              <div className="mt-auto pt-6 border-t border-white/10">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut()}
                  className="w-full justify-start text-slate-400 hover:text-white hover:bg-white/10 gap-2"
                >
                  <LogOutIcon className="w-4 h-4" />
                  Sair
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          <p className="text-sm font-semibold text-slate-900 dark:text-white">Portal do Cliente</p>

          {showNav && <NotificationsDropdown />}
        </div>

        {/* Desktop: notifications in top-right corner */}
        {showNav && (
          <div className="hidden lg:flex justify-end px-6 pt-4">
            <NotificationsDropdown />
          </div>
        )}

        <Outlet />
      </div>

      {/* ── Mobile bottom nav ── */}
      {showNav && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-around py-1.5 px-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-colors ${isActive
                  ? "text-primary"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}
