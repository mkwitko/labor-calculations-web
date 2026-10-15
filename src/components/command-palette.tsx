import { Command } from "cmdk";
import {
  BriefcaseIcon,
  CalculatorIcon,
  CalendarDaysIcon,
  FileTextIcon,
  HeadphonesIcon,
  HelpCircleIcon,
  KeyboardIcon,
  LayoutDashboardIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  UserIcon,
  UserPlusIcon,
  UsersIcon,
  UsersRoundIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useListCases } from "@/http/generated/case/case";
import { useListClients } from "@/http/generated/client/client";

type Action = {
  id: string;
  label: string;
  icon: typeof PlusIcon;
  run: () => void;
  group: string;
  keywords?: string;
};

// Global command palette (Cmd/Ctrl+K): navigate, create, and jump to a client
// or case by name. Opens from anywhere.
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const { data: clients } = useListClients(
    { limit: 50 },
    { query: { enabled: open } },
  );
  const { data: cases } = useListCases(
    { limit: 50 },
    { query: { enabled: open } },
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const go = (to: string) => {
    setOpen(false);
    setQuery("");
    navigate(to);
  };

  // Mesma ordem da sidebar, mais os destinos que saíram dela — sem isso eles
  // ficariam só atrás do avatar.
  //
  // Assinatura e Indicações ficam deliberadamente fora: exigem `isOwner`, e a
  // paleta não consulta `useOrgAbilities`. Listá-los ofereceria a papel
  // não-titular um caminho que só devolve 403. Vivem no UserMenu, que checa.
  const actions: Action[] = [
    { id: "new-calc", label: "Novo cálculo", icon: CalculatorIcon, group: "Criar", run: () => go("/calculations/new") },
    { id: "new-case", label: "Novo caso", icon: PlusIcon, group: "Criar", run: () => go("/cases/new") },
    { id: "new-client", label: "Novo cliente", icon: UserPlusIcon, group: "Criar", run: () => go("/clients/new") },
    { id: "calcs", label: "Cálculos", icon: CalculatorIcon, group: "Ir para", run: () => go("/calculations") },
    { id: "cases", label: "Casos", icon: BriefcaseIcon, group: "Ir para", run: () => go("/cases") },
    { id: "agenda", label: "Agenda", icon: CalendarDaysIcon, group: "Ir para", run: () => go("/agenda") },
    { id: "clients", label: "Clientes", icon: UsersIcon, group: "Ir para", run: () => go("/clients") },
    { id: "templates", label: "Biblioteca de templates", icon: FileTextIcon, group: "Ir para", run: () => go("/library/templates") },
    { id: "home", label: "Painel", icon: LayoutDashboardIcon, group: "Ir para", run: () => go("/home") },
    { id: "team", label: "Equipe", icon: UsersRoundIcon, group: "Conta", run: () => go("/equipe") },
    { id: "profile", label: "Perfil", icon: UserIcon, group: "Conta", run: () => go("/profile") },
    { id: "settings", label: "Configurações", icon: SettingsIcon, group: "Conta", run: () => go("/settings") },
    { id: "shortcuts", label: "Atalhos de teclado", icon: KeyboardIcon, group: "Conta", run: () => go("/settings/atalhos") },
    { id: "help", label: "Central de Ajuda", icon: HelpCircleIcon, group: "Conta", run: () => go("/ajuda") },
    { id: "support", label: "Suporte e sugestões", icon: HeadphonesIcon, group: "Conta", run: () => go("/suporte") },
  ];

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Command palette"
      className="fixed left-1/2 top-24 -translate-x-1/2 z-50 w-[92vw] max-w-lg rounded-xl border border-border bg-popover shadow-2xl overflow-hidden"
    >
      <div className="flex items-center gap-2 border-b border-border px-3">
        <SearchIcon className="w-4 h-4 text-muted-foreground shrink-0" />
        <Command.Input
          value={query}
          onValueChange={setQuery}
          placeholder="Buscar ação, cliente ou caso..."
          className="flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
        />
        <kbd className="text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5">
          ESC
        </kbd>
      </div>
      <Command.List className="max-h-80 overflow-y-auto p-2">
        <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
          Nada encontrado.
        </Command.Empty>

        {["Criar", "Ir para", "Conta"].map((group) => (
          <Command.Group
            key={group}
            heading={group}
            className="text-xs text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5"
          >
            {actions
              .filter((a) => a.group === group)
              .map((a) => {
                const Icon = a.icon;
                return (
                  <Command.Item
                    key={a.id}
                    onSelect={a.run}
                    className="flex items-center gap-2.5 px-2 py-2 rounded-md text-sm text-foreground cursor-pointer data-[selected=true]:bg-muted"
                  >
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    {a.label}
                  </Command.Item>
                );
              })}
          </Command.Group>
        ))}

        {(clients?.data?.length ?? 0) > 0 && (
          <Command.Group
            heading="Clientes"
            className="text-xs text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5"
          >
            {clients?.data?.map((c) => (
              <Command.Item
                key={c.id}
                value={`cliente-${c.id}-${c.name}`}
                onSelect={() => go(`/clients/${c.id}`)}
                className="flex items-center gap-2.5 px-2 py-2 rounded-md text-sm text-foreground cursor-pointer data-[selected=true]:bg-muted"
              >
                <UsersIcon className="w-4 h-4 text-muted-foreground" />
                {c.name}
              </Command.Item>
            ))}
          </Command.Group>
        )}

        {(cases?.data?.length ?? 0) > 0 && (
          <Command.Group
            heading="Casos"
            className="text-xs text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5"
          >
            {cases?.data?.map((c) => (
              <Command.Item
                key={c.id}
                value={`caso-${c.id}-${c.title}`}
                onSelect={() => go(`/cases/${c.id}`)}
                className="flex items-center gap-2.5 px-2 py-2 rounded-md text-sm text-foreground cursor-pointer data-[selected=true]:bg-muted"
              >
                <BriefcaseIcon className="w-4 h-4 text-muted-foreground" />
                {c.title}
              </Command.Item>
            ))}
          </Command.Group>
        )}
      </Command.List>
    </Command.Dialog>
  );
}
