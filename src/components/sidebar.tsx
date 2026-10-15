import { Logo } from "@/components/logo";
import { OrganizationSwitcher } from "@/components/organization-switcher";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useMobileNav } from "@/hooks/use-mobile-nav";
import { useGetSupportUnreadCount } from "@/http/generated/support/support";
import { useListWidgetCalculations } from "@/http/generated/widget/widget";
import { useOrgAbilities } from "@/hooks/use-organizations";
import { cn } from "@/lib/utils";
import {
  BookOpenIcon,
  HeadphonesIcon,
  BriefcaseIcon,
  CalculatorIcon,
  CalendarDaysIcon,
  CrownIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  GiftIcon,
  GlobeIcon,
  KeyboardIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  UserIcon,
  UsersIcon,
  UsersRoundIcon,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

type NavItem = {
  id: string;
  label: string;
  icon: React.ElementType;
  route: string;
  /** Só destaca em match exato de path (a rota tem sub-rotas). */
  exact?: boolean;
};

// Cálculo é o produto, então vem antes de Casos. O que não é trabalho diário
// (Perfil, Assinatura, Indicações, Configurações, Atalhos, Central de Ajuda)
// vive no rodapé, em `FOOTER_ITEMS`/`OWNER_FOOTER_ITEMS`, e não some da
// navegação: continuar só no menu do avatar era o mesmo que não existir para
// quem não pensa em procurar ali.
const NAV_ITEMS: NavItem[] = [
  { id: "home", label: "Painel", icon: LayoutDashboardIcon, route: "/home" },
  {
    id: "calculations",
    label: "Cálculos",
    icon: CalculatorIcon,
    route: "/calculations",
  },
  { id: "clients", label: "Clientes", icon: UsersIcon, route: "/clients" },
  { id: "cases", label: "Casos", icon: BriefcaseIcon, route: "/cases" },
  { id: "agenda", label: "Agenda", icon: CalendarDaysIcon, route: "/agenda" },
  {
    id: "passivo",
    label: "Passivo",
    icon: FileSpreadsheetIcon,
    route: "/passivo",
  },
];

// Depois de Equipe — ver a composição em `SidebarNav`.
const TEMPLATES_ITEM: NavItem = {
  id: "templates",
  label: "Templates",
  icon: FileTextIcon,
  route: "/library/templates",
};

// Só aparece para quem tem cálculo vindo do widget — ver `SidebarNav`.
const WIDGET_ITEM: NavItem = {
  id: "widget",
  label: "Do meu site",
  icon: GlobeIcon,
  route: "/do-meu-site",
};

const TEAM_ITEM: NavItem = {
  id: "team",
  label: "Equipe",
  icon: UsersRoundIcon,
  route: "/equipe",
};

// Rodapé da sidebar: conta e apoio. Não é trabalho diário, mas nada do app pode
// existir só dentro do menu do avatar — um item que não aparece na navegação
// principal é um item que o usuário não encontra. Os dois caminhos levam à mesma
// rota, e no mobile o drawer é o único que aparece.
const FOOTER_ITEMS: NavItem[] = [
  { id: "profile", label: "Perfil", icon: UserIcon, route: "/profile" },
  {
    id: "settings",
    label: "Configurações",
    icon: SettingsIcon,
    route: "/settings",
    // Exato, senão `/settings/atalhos` acenderia os dois itens.
    exact: true,
  },
  {
    id: "shortcuts",
    label: "Atalhos",
    icon: KeyboardIcon,
    route: "/settings/atalhos",
  },
  { id: "help", label: "Central de Ajuda", icon: BookOpenIcon, route: "/ajuda" },
  {
    id: "support",
    label: "Suporte e sugestões",
    icon: HeadphonesIcon,
    route: "/suporte",
  },
];

// Cobrança é do titular. Espelha o gate do UserMenu e o do back.
const OWNER_FOOTER_ITEMS: NavItem[] = [
  { id: "billing", label: "Assinatura", icon: CrownIcon, route: "/billing" },
  {
    id: "referrals",
    label: "Indicações",
    icon: GiftIcon,
    route: "/indicacoes",
  },
];

function isRouteActive(pathname: string, route: string, exact?: boolean) {
  return exact
    ? pathname === route
    : pathname === route || pathname.startsWith(`${route}/`);
}

function NavButton({
  item,
  active,
  muted,
  badge,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  muted?: boolean;
  /** Contagem à direita. Zero não aparece: caixa vazia não pede atenção. */
  badge?: number;
  onNavigate: (route: string) => void;
}) {
  const Icon = item.icon;

  return (
    <button
      type="button"
      data-tour={`nav-${item.id}`}
      onClick={() => onNavigate(item.route)}
      className={cn(
        "flex items-center gap-3 w-full px-3 rounded-md transition-colors text-left",
        muted ? "min-h-9 py-1.5 text-[13px]" : "min-h-11 py-2 text-sm",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
          : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
      )}
    >
      <Icon className="w-4 h-4 shrink-0" strokeWidth={active ? 2 : 1.75} />
      <span className="flex-1">{item.label}</span>
      {badge ? (
        <span className="rounded-full bg-primary px-1.5 py-0.5 text-[11px] text-primary-foreground tabular-nums">
          {badge}
        </span>
      ) : null}
    </button>
  );
}

// Compartilhado pelo rail e pelo drawer, para que os dois nunca divirjam.
function SidebarFooterNav({
  onNavigate,
}: {
  onNavigate: (route: string) => void;
}) {
  const location = useLocation();
  const { isOwner } = useOrgAbilities();

  // Resposta do suporte não chega por outro caminho: sem o contador, ela espera
  // até alguém lembrar de abrir a tela.
  const { data: support } = useGetSupportUnreadCount({
    query: { staleTime: 60 * 1000, refetchOnWindowFocus: true },
  });

  const items = isOwner
    ? [FOOTER_ITEMS[0], ...OWNER_FOOTER_ITEMS, ...FOOTER_ITEMS.slice(1)]
    : FOOTER_ITEMS;

  return (
    <div className="flex flex-col gap-0.5 px-3 pt-3 border-t border-sidebar-border">
      {items.map((item) => (
        <NavButton
          key={item.id}
          item={item}
          muted
          active={isRouteActive(location.pathname, item.route, item.exact)}
          badge={item.id === "support" ? support?.unread : undefined}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  );
}

// Conteúdo compartilhado pelo rail do desktop e pelo drawer mobile.
// `onNavigate` deixa o mobile fechar o drawer ao navegar.
function SidebarNav({
  variant,
  onNavigate,
}: {
  variant: "desktop" | "mobile";
  onNavigate: (route: string) => void;
}) {
  const location = useLocation();

  // Espelha `assertManageMembers` do back. Serve só para esconder UI — a API
  // continua sendo a autoridade e devolve 403/404.
  const { canManageMembers } = useOrgAbilities();

  // A fila do widget é caixa de entrada: só entra na navegação quando tem carta.
  // Escritório que não instalou o widget não ganha um item morto, e quem
  // instalou não precisa lembrar de ir olhar. O número é o que ainda não foi
  // importado.
  const { data: widgetQueue } = useListWidgetCalculations({
    query: { staleTime: 60_000 },
  });
  const pendingWidget = (widgetQueue ?? []).filter((row) => !row.claimed).length;
  const hasWidgetQueue = (widgetQueue ?? []).length > 0;

  const items = [
    ...NAV_ITEMS,
    ...(canManageMembers ? [TEAM_ITEM] : []),
    TEMPLATES_ITEM,
    ...(hasWidgetQueue ? [WIDGET_ITEM] : []),
  ];

  return (
    <nav className="flex-1 px-3 pb-3 overflow-y-auto space-y-3">
      {/* Mora no nav compartilhado, então aparece no rail e no drawer sem
          duplicação. No mobile, trocar de organização fecha o drawer. */}
      <OrganizationSwitcher
        onSwitched={variant === "mobile" ? () => onNavigate("/home") : undefined}
      />

      <div className="flex flex-col gap-0.5">
        {items.map((item) => (
          <NavButton
            key={item.id}
            item={item}
            active={isRouteActive(location.pathname, item.route, item.exact)}
            badge={item.id === "widget" ? pendingWidget : undefined}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </nav>
  );
}

// Desktop: rail estático à esquerda (escondido no mobile).
export function AppSidebar() {
  const navigate = useNavigate();

  return (
    <aside
      data-tour="sidebar"
      className="hidden md:flex w-56 flex-col bg-sidebar border-r border-sidebar-border shrink-0 h-screen"
    >
      <div className="flex items-center gap-3 px-4 py-5 shrink-0">
        <Logo className="w-9 h-9 rounded-lg shrink-0" />
        <p className="text-sidebar-foreground text-sm font-semibold leading-tight truncate">
          Lex Laboral
        </p>
      </div>

      <SidebarNav variant="desktop" onNavigate={navigate} />

      <div className="shrink-0">
        <SidebarFooterNav onNavigate={navigate} />
        <p className="text-sidebar-foreground/30 text-xs px-6 py-3">
          v1.0 · 2026
        </p>
      </div>
    </aside>
  );
}

// Mobile: mesmo conteúdo dentro de um drawer off-canvas, dirigido pela store
// compartilhada de mobileNav (que o tour de produto também dirige).
export function MobileNavSheet() {
  const navigate = useNavigate();
  const { open, setOpen, closeNav } = useMobileNav();

  const handleNavigate = (route: string) => {
    closeNav();
    navigate(route);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="left"
        data-tour="sidebar"
        className="w-72 max-w-[85vw] gap-0 bg-sidebar border-sidebar-border p-0 md:hidden"
      >
        <SheetHeader className="flex-row items-center gap-3 px-4 py-5 space-y-0">
          <Logo className="w-9 h-9 rounded-lg shrink-0" />
          <SheetTitle className="text-sidebar-foreground text-sm font-semibold leading-tight truncate">
            Lex Laboral
          </SheetTitle>
        </SheetHeader>

        <SidebarNav variant="mobile" onNavigate={handleNavigate} />

        <div className="shrink-0 pb-4">
          <SidebarFooterNav onNavigate={handleNavigate} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
