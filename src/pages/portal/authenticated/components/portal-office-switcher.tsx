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
  BuildingIcon,
  CheckIcon,
  ChevronsUpDownIcon,
  Loader2Icon,
} from "lucide-react";
import { Link } from "react-router-dom";

type Office = { id: string; name: string; current: boolean };

/**
 * Troca o escritório ativo do portal. Só aparece quando o login abre mais de
 * um: a lista vem do `linked` do cookie, não de uma consulta por e-mail, então
 * conta com senha diferente não entra aqui — para ela o rodapé leva ao login.
 *
 * Presentacional de propósito: quem chama liga a mutação e limpa o cache.
 */
export function PortalOfficeSwitcher({
  organizations,
  isPending,
  variant = "sidebar",
  onSelect,
}: {
  organizations: Office[];
  isPending?: boolean;
  variant?: "sidebar" | "header";
  onSelect: (organizationId: string) => void;
}) {
  const current = organizations.find((office) => office.current);

  if (organizations.length < 2 || !current) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={isPending}>
        <Button
          variant="ghost"
          className={
            variant === "sidebar"
              ? "w-full justify-start gap-2 text-slate-300 hover:text-white hover:bg-white/10"
              : "gap-2 text-slate-600 dark:text-slate-300"
          }
        >
          {isPending ? (
            <Loader2Icon className="w-4 h-4 shrink-0 animate-spin" />
          ) : (
            <BuildingIcon className="w-4 h-4 shrink-0" strokeWidth={1.75} />
          )}
          <span className="min-w-0 flex-1 truncate text-left text-sm">
            {current.name}
          </span>
          <ChevronsUpDownIcon className="w-3.5 h-3.5 shrink-0 opacity-60" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Seus escritórios
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {organizations.map((office) => (
          <DropdownMenuItem
            key={office.id}
            disabled={office.current || isPending}
            onSelect={() => {
              if (!office.current) onSelect(office.id);
            }}
            className="gap-2"
          >
            <span className="min-w-0 flex-1 truncate text-sm">
              {office.name}
            </span>
            {office.current && (
              <CheckIcon className="w-4 h-4 shrink-0 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/portal/login" className="text-xs text-muted-foreground">
            Entrar em outro escritório
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
