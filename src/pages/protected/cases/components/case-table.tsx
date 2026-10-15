import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  getListCasesQueryKey,
  useDeleteCase,
  useRestoreCase,
} from "@/http/generated/case/case";
import type { ListCases200DataItem } from "@/http/generated/lexlaboral-server.schemas";
import { queryClient } from "@/lib/react-query";
import { formatDate } from "@/utils/value-format";
import { FolderOpenIcon, SearchXIcon, TrashIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CasePhaseBadge } from "./case-phase-badge";

type Props = {
  items: ListCases200DataItem[];
  isFiltered?: boolean;
};

export function CaseTable({ items, isFiltered = false }: Props) {
  const navigate = useNavigate();
  const { mutateAsync: deleteCase } = useDeleteCase();
  const { mutateAsync: restoreCase } = useRestoreCase();

  async function handleDelete(item: ListCases200DataItem, e: React.MouseEvent) {
    e.stopPropagation();
    await deleteCase({ caseId: item.id });
    queryClient.invalidateQueries({ queryKey: getListCasesQueryKey() });
    toast(`Caso "${item.title}" excluído`, {
      duration: 30000,
      action: {
        label: "Desfazer",
        onClick: async () => {
          await restoreCase({ caseId: item.id });
          queryClient.invalidateQueries({ queryKey: getListCasesQueryKey() });
        },
      },
    });
  }

  if (items.length === 0) {
    if (isFiltered) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center px-6">
          <SearchXIcon className="w-8 h-8 text-muted-foreground/40" />
          <div>
            <p className="text-sm font-medium text-foreground">Nenhum resultado</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Tente ajustar a busca ou o filtro de fase
            </p>
          </div>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center px-6">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
            <FolderOpenIcon className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-xs font-bold leading-none">+</span>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">
            Agrupe seus processos em casos
          </p>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            Um caso reúne cálculos, acordos, audiências e documentos de um mesmo processo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile: card list */}
      <div className="md:hidden divide-y divide-border">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => navigate(`/cases/${item.id}`)}
            className="w-full text-left px-4 py-4 hover:bg-muted/40 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium text-sm text-foreground leading-snug">{item.title}</p>
              <CasePhaseBadge phase={item.phase} />
            </div>
            {item.processNumber && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.processNumber}</p>
            )}
            <div className="flex items-center justify-between mt-1.5 gap-2">
              <p className="text-xs text-muted-foreground">
                {item.client?.name ?? "Sem cliente"} · {item._count.calculations} cálculo(s)
              </p>
              <p className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDate(item.openedAt)}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Desktop: table */}
      <table className="hidden md:table w-full text-sm mt-4">
        <thead>
          <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wide">
            <th className="text-left font-medium pb-3 px-6">Caso</th>
            <th className="text-left font-medium pb-3 px-6">Fase</th>
            <th className="text-left font-medium pb-3 px-6">Cliente</th>
            <th className="text-center font-medium pb-3 px-6">Cálculos</th>
            <th className="text-left font-medium pb-3 px-6">Abertura</th>
            <th className="pb-3" />
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.id}
              className="group border-b border-border last:border-0 hover:bg-muted/40 transition-colors cursor-pointer"
              onClick={() => navigate(`/cases/${item.id}`)}
            >
              <td className="py-3.5 px-6">
                <p className="font-medium text-foreground">{item.title}</p>
                {item.processNumber && (
                  <p className="text-xs text-muted-foreground truncate max-w-xs">
                    {item.processNumber}
                  </p>
                )}
              </td>
              <td className="py-3.5 px-6">
                <CasePhaseBadge phase={item.phase} />
              </td>
              <td className="py-3.5 px-6 text-muted-foreground">
                {item.client?.name ?? "—"}
              </td>
              <td className="py-3.5 px-6 text-center text-muted-foreground">
                {item._count.calculations}
              </td>
              <td className="py-3.5 px-6 text-muted-foreground whitespace-nowrap">
                {formatDate(item.openedAt)}
              </td>
              <td className="py-3.5 pr-4 text-right w-16">
                <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Excluir caso"
                        className="text-destructive hover:text-destructive"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <TrashIcon />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent size="sm">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir caso?</AlertDialogTitle>
                        <AlertDialogDescription>
                          O caso "{item.title}" será excluído. Você poderá desfazer essa ação.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction variant="destructive" onClick={(e) => handleDelete(item, e)}>
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
