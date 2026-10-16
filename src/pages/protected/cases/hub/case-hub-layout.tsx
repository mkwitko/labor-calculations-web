import {
  ArrowLeftIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  CoinsIcon,
  FileTextIcon,
  LayoutListIcon,
  MoreHorizontalIcon,
  PlusIcon,
  TrashIcon,
  UserIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  NavLink,
  Outlet,
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getListCasesQueryKey,
  useDeleteCase,
  useGetCase,
} from "@/http/generated/case/case";
import type { GetCase200 } from "@/http/generated/labor-calculations-api.schemas";
import { useGetUnreadMessageCount } from "@/http/generated/message/message";
import { queryClient } from "@/lib/react-query";
import { cn } from "@/lib/utils";
import { useProductTour } from "@/hooks/use-product-tour";
import { CasePhaseBadge } from "../components/case-phase-badge";

export type CaseHubContext = { caseData: GetCase200; caseId: string };

export function useCaseHub() {
  return useOutletContext<CaseHubContext>();
}

type NavEntry = {
  to: string;
  label: string;
  icon: React.ElementType;
  count?: number;
  end?: boolean;
  tourId?: string;
};

function SubNav({ entries }: { entries: NavEntry[] }) {
  return (
    <div
      data-tour="case-subnav"
      className="flex flex-wrap gap-1 border-b border-border"
    >
      {entries.map((e) => {
        const Icon = e.icon;
        return (
          <NavLink
            key={e.to}
            to={e.to}
            end={e.end}
            data-tour={e.tourId}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2 px-3 py-2.5 text-sm whitespace-nowrap border-b-2 -mb-px transition-colors",
                isActive
                  ? "border-primary text-foreground font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            {e.label}
            {e.count !== undefined && e.count > 0 && (
              <span className="text-xs bg-muted text-muted-foreground rounded px-1.5 py-0.5">
                {e.count}
              </span>
            )}
          </NavLink>
        );
      })}
    </div>
  );
}

export default function CaseHubLayout() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data: caseData, isLoading } = useGetCase(caseId!);
  const { data: unread } = useGetUnreadMessageCount();
  const unreadHere =
    unread?.byCase.find((entry) => entry.caseId === caseId)?.count ?? 0;
  const { startCaseHubTourIfFirstVisit } = useProductTour();

  useEffect(() => {
    if (caseData) startCaseHubTourIfFirstVisit();
  }, [caseData, startCaseHubTourIfFirstVisit]);

  const { mutate: deleteCase, isPending: isDeleting } = useDeleteCase({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListCasesQueryKey() });
        toast("Caso excluído");
        navigate("/cases");
      },
      onError: () => toast.error("Erro ao excluir caso"),
    },
  });

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-6" aria-hidden="true">
        <div className="flex items-start gap-3">
          <Skeleton className="h-8 w-8 rounded-md shrink-0" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-64" />
            <Skeleton className="h-3.5 w-40" />
          </div>
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-md" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">Caso não encontrado.</p>
      </div>
    );
  }

  // Dez abas planas quebravam em duas ou três linhas com o flex-wrap. Viram
  // quatro grupos; o segundo nível é sub-aba em `?tab=`, dentro de cada página.
  // A aba antes chamada "Agenda" agora é "Prazos" — o nome colidia com a
  // /agenda global.
  const base = `/cases/${caseId}`;
  const entries: NavEntry[] = [
    {
      to: base,
      label: "Caso",
      icon: BriefcaseIcon,
      end: true,
      // A conversa com o cliente mora na sub-aba "Mensagens" desta página.
      count: unreadHere || undefined,
    },
    {
      to: `${base}/numeros`,
      label: "Números",
      icon: CoinsIcon,
      count: caseData.calculations.length + caseData.settlements.length,
      tourId: "case-numeros",
    },
    {
      to: `${base}/prazos`,
      label: "Prazos",
      icon: CalendarDaysIcon,
      count: caseData.hearings.length + caseData.deadlines.length,
    },
    {
      to: `${base}/autos`,
      label: "Autos",
      icon: FileTextIcon,
      count: caseData.documents?.length ?? 0,
      tourId: "case-autos",
    },
  ];

  const context: CaseHubContext = { caseData, caseId: caseId! };

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Hub header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon-sm"
            type="button"
            aria-label="Voltar"
            className="shrink-0 mt-0.5"
            onClick={() => navigate("/cases")}
          >
            <ArrowLeftIcon />
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-semibold text-foreground truncate">
                {caseData.title}
              </h1>
              <CasePhaseBadge phase={caseData.phase} />
            </div>
            <div className="flex items-center gap-x-4 gap-y-1 flex-wrap mt-1 text-sm text-muted-foreground">
              {caseData.client?.name && (
                <span className="inline-flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5" />
                  {caseData.client.name}
                </span>
              )}
              {caseData.processNumber && (
                <span className="inline-flex items-center gap-1.5">
                  <LayoutListIcon className="w-3.5 h-3.5" />
                  {caseData.processNumber}
                </span>
              )}
              {caseData.court && <span>{caseData.court}</span>}
              {caseData.vara && <span>{caseData.vara}</span>}
            </div>
          </div>
        </div>

        {/* Antes o único botão do topo era Excluir, em vermelho permanente:
            a ação mais perigosa era a mais visível e não havia ação primária.
            Agora o topo oferece o que o advogado veio fazer, e o destrutivo
            fica atrás do ⋯ — com a mesma confirmação de antes. */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            onClick={() =>
              navigate("/calculations/new", {
                state: {
                  caseId,
                  clientId: caseData.client?.id,
                  clientName: caseData.client?.name,
                },
              })
            }
          >
            <PlusIcon />
            <span className="hidden sm:inline">Novo cálculo</span>
          </Button>

          <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label="Mais ações">
                  <MoreHorizontalIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={(e) => {
                    e.preventDefault();
                    setConfirmOpen(true);
                  }}
                >
                  <TrashIcon className="w-4 h-4" />
                  Excluir caso
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialogContent size="sm">
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir caso?</AlertDialogTitle>
                <AlertDialogDescription>
                  O caso <strong>{caseData.title}</strong> será removido. Os
                  cálculos e acordos vinculados não serão excluídos.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  disabled={isDeleting}
                  onClick={() => deleteCase({ caseId: caseId! })}
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <SubNav entries={entries} />

      <div>
        <Outlet context={context} />
      </div>
    </div>
  );
}
