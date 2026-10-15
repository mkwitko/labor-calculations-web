import { MenuIcon, PlusIcon, SearchIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/user-menu";
import { useMobileNav } from "@/hooks/use-mobile-nav";
import { ModeToggle } from "./theme-toggle";

/**
 * Dispara o mesmo atalho que a CommandPalette escuta em `document`, para o
 * botão de busca e o ⌘K abrirem exatamente a mesma coisa. Sem isso a paleta
 * precisaria de estado global só para ter um gatilho visível.
 */
function openCommandPalette() {
  document.dispatchEvent(
    new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }),
  );
}

/**
 * Barra de trabalho: menu mobile, gatilho de busca, ação primária do produto
 * e conta. Não anuncia o nome da tela — isso é do PageHeader de cada página,
 * que sabe onde está. O mapa manual de títulos que existia aqui cobria 5 de
 * ~40 rotas e mostrava "Painel" em quase toda tela.
 */
export function AppHeader() {
  const { openNav } = useMobileNav();
  const navigate = useNavigate();

  return (
    <header className="h-14 flex items-center gap-2 px-4 md:px-6 border-b border-border bg-background shrink-0">
      <button
        type="button"
        data-tour="menu-button"
        onClick={openNav}
        aria-label="Abrir menu"
        className="md:hidden -ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-foreground hover:bg-muted/60 transition-colors"
      >
        <MenuIcon className="w-5 h-5" />
      </button>

      <button
        type="button"
        onClick={openCommandPalette}
        className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 h-9 text-sm text-muted-foreground hover:bg-muted/70 transition-colors md:w-72"
      >
        <SearchIcon className="w-4 h-4 shrink-0" />
        <span className="hidden md:inline flex-1 text-left">
          Buscar cliente, caso ou ação
        </span>
        <kbd className="hidden md:inline text-[10px] font-medium rounded border border-border bg-background px-1.5 py-0.5">
          ⌘K
        </kbd>
      </button>

      <div className="flex items-center gap-2 md:gap-3 ml-auto">
        <Button size="sm" onClick={() => navigate("/calculations/new")}>
          <PlusIcon />
          <span className="hidden sm:inline">Novo cálculo</span>
        </Button>
        <ModeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
