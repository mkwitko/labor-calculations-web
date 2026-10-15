import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ROLE_LABELS,
  useOrganizations,
  type OrgRole,
} from "@/hooks/use-organizations";
import { useSwitchOrganization } from "@/http/generated/auth/auth";
import { queryClient } from "@/lib/react-query";
import { cn } from "@/lib/utils";
import { BuildingIcon, CheckIcon, ChevronsUpDownIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";

/**
 * Troca a organização ativa da sessão. A organização não é estado do front — o
 * back a resolve do cookie a cada request —, então trocar é uma chamada que
 * reemite os cookies, seguida de limpar todo o cache.
 */
export function OrganizationSwitcher({
  onSwitched,
}: {
  /** O drawer mobile usa isso para se fechar depois da troca. */
  onSwitched?: () => void;
}) {
  const { organizations, current, isSingle, isLoading } = useOrganizations();

  const { mutate: switchOrganization, isPending } = useSwitchOrganization({
    mutation: {
      onSuccess: (_data, variables) => {
        const name =
          organizations.find((o) => o.id === variables.data.organizationId)
            ?.name ?? "organização";

        // Todo dado em cache pertence à organização anterior. Mantê-lo aqui
        // mostraria caso de um escritório sob o cabeçalho de outro.
        queryClient.clear();
        toast.success(`Agora em ${name}`);
        onSwitched?.();
      },
      onError: () => toast.error("Não foi possível trocar de organização"),
    },
  });

  // Solo não tem para onde trocar; enquanto carrega, nada de esqueleto no topo
  // da navegação — a ausência é menos ruidosa que um bloco pulsando.
  if (isLoading || isSingle || !current) return null;

  return (
    <div className="px-3 pb-2">
      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={isPending}
          className={cn(
            "flex items-center gap-2.5 w-full px-2.5 min-h-11 py-2 rounded-md text-left transition-colors",
            "bg-sidebar-accent/40 hover:bg-sidebar-accent text-sidebar-foreground",
            "disabled:pointer-events-none disabled:opacity-60",
          )}
        >
          {isPending ? (
            <Loader2Icon className="w-4 h-4 shrink-0 animate-spin" />
          ) : (
            <BuildingIcon className="w-4 h-4 shrink-0" strokeWidth={1.75} />
          )}
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium leading-tight truncate">
              {current.name}
            </span>
            <span className="block text-xs text-sidebar-foreground/60 leading-tight truncate">
              {ROLE_LABELS[current.role as OrgRole]}
            </span>
          </span>
          <ChevronsUpDownIcon className="w-3.5 h-3.5 shrink-0 text-sidebar-foreground/50" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Suas organizações
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {organizations.map((organization) => (
            <DropdownMenuItem
              key={organization.id}
              disabled={organization.isCurrent || isPending}
              onSelect={() =>
                switchOrganization({
                  data: { organizationId: organization.id },
                })
              }
              className="gap-2"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-sm truncate">
                  {organization.name}
                </span>
                <span className="block text-xs text-muted-foreground truncate">
                  {ROLE_LABELS[organization.role as OrgRole]}
                </span>
              </span>
              {organization.isCurrent && (
                <CheckIcon className="w-4 h-4 shrink-0 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
