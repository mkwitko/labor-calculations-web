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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  getGetCaseQueryKey,
  useLinkCalculationToCase,
  useUnlinkCalculationFromCase,
} from "@/http/generated/case/case";
import { useListLaborCalculation } from "@/http/generated/labor-calculation/labor-calculation";
import type { GetCase200 } from "@/http/generated/lexlaboral-server.schemas";
import { queryClient } from "@/lib/react-query";
import {
  formatCurrency,
  formatDate,
  getStatusLabel,
  getTerminationTypeLabel,
} from "@/utils/value-format";
import { CalculatorIcon, ExternalLinkIcon, LinkIcon, PlusIcon, SearchIcon, UnlinkIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type Calculation = GetCase200["calculations"][number];

type Props = {
  caseId: string;
  clientId?: string | null;
  clientName?: string | null;
  calculations: Calculation[];
};

function LinkDialog({ caseId, linkedIds, clientId }: { caseId: string; linkedIds: Set<string>; clientId?: string | null }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data: calcsResponse } = useListLaborCalculation({ limit: 100, ...(clientId ? { clientId } : {}) });
  const { mutate: link, isPending } = useLinkCalculationToCase({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCaseQueryKey(caseId) });
        setOpen(false);
        setSearch("");
        toast("Cálculo vinculado ao caso");
      },
      onError: () => toast.error("Erro ao vincular cálculo"),
    },
  });

  const available = useMemo(() => {
    const all = calcsResponse?.data ?? [];
    const unlinked = all.filter((c) => !linkedIds.has(c.id));
    if (!search.trim()) return unlinked;
    const q = search.toLowerCase();
    return unlinked.filter(
      (c) =>
        c.clientName.toLowerCase().includes(q) ||
        getTerminationTypeLabel(c.terminationType).toLowerCase().includes(q),
    );
  }, [calcsResponse, linkedIds, search]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <LinkIcon />
          Vincular existente
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Vincular cálculo existente</DialogTitle>
        </DialogHeader>

        <div className="relative mt-2">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="mt-3 max-h-80 overflow-y-auto divide-y divide-border border border-border rounded-lg">
          {available.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              {search ? "Nenhum resultado" : "Todos os cálculos já estão vinculados"}
            </div>
          ) : (
            available.map((calc) => (
              <button
                key={calc.id}
                type="button"
                disabled={isPending}
                onClick={() => link({ caseId, calcId: calc.id })}
                className="w-full text-left flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{calc.clientName}</p>
                  <p className="text-xs text-muted-foreground">
                    {getTerminationTypeLabel(calc.terminationType)} · {getStatusLabel(calc.status)} ·{" "}
                    {formatDate(calc.createdAt)}
                  </p>
                </div>
                {calc.totalValue != null && (
                  <span className="ml-3 text-sm font-semibold text-foreground shrink-0">
                    {formatCurrency(calc.totalValue)}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function CalculationsTab({ caseId, clientId, clientName, calculations }: Props) {
  const navigate = useNavigate();
  const { mutate: unlink, isPending: isUnlinking } = useUnlinkCalculationFromCase({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCaseQueryKey(caseId) });
        toast("Cálculo desvinculado do caso");
      },
      onError: () => toast.error("Erro ao desvincular cálculo"),
    },
  });

  const linkedIds = useMemo(() => new Set(calculations.map((c) => c.id)), [calculations]);

  if (calculations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
          <CalculatorIcon className="w-6 h-6 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Nenhum cálculo vinculado</p>
          <p className="text-xs text-muted-foreground mt-1">
            Crie um novo cálculo já dentro deste caso ou vincule um existente
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              navigate("/calculations/new", { state: { caseId, clientId, clientName } })
            }
          >
            <PlusIcon />
            Novo cálculo
          </Button>
          <LinkDialog caseId={caseId} linkedIds={linkedIds} clientId={clientId} />
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-foreground">
          {calculations.length} cálculo{calculations.length !== 1 ? "s" : ""}
        </h3>
        <div className="flex gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  navigate("/calculations/new", { state: { caseId, clientId, clientName } })
                }
              >
                <PlusIcon />
                Novo
              </Button>
            </TooltipTrigger>
            <TooltipContent>Criar novo cálculo neste caso</TooltipContent>
          </Tooltip>
          <LinkDialog caseId={caseId} linkedIds={linkedIds} clientId={clientId} />
        </div>
      </div>

      <div className="divide-y divide-border">
        {calculations.map((calc) => (
          <div
            key={calc.id}
            className="flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors group"
          >
            <button
              type="button"
              onClick={() => navigate(`/calculations/${calc.id}`)}
              className="flex-1 text-left min-w-0"
            >
              <p className="text-sm font-medium text-foreground truncate">
                {calc.clientName} — {getTerminationTypeLabel(calc.terminationType)}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {getStatusLabel(calc.status)} · {formatDate(calc.createdAt)}
                {calc.totalValue != null && (
                  <span className="ml-2 font-medium text-foreground">
                    {formatCurrency(calc.totalValue)}
                  </span>
                )}
              </p>
            </button>

            <div className="flex items-center gap-1 ml-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Abrir cálculo"
                    onClick={() => navigate(`/calculations/${calc.id}`)}
                  >
                    <ExternalLinkIcon />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Abrir cálculo</TooltipContent>
              </Tooltip>

              <AlertDialog>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:text-destructive"
                        disabled={isUnlinking}
                      >
                        <UnlinkIcon />
                      </Button>
                    </AlertDialogTrigger>
                  </TooltipTrigger>
                  <TooltipContent>Desvincular do caso</TooltipContent>
                </Tooltip>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Desvincular cálculo?</AlertDialogTitle>
                    <AlertDialogDescription>
                      O cálculo "{calc.clientName} —{" "}
                      {getTerminationTypeLabel(calc.terminationType)}" será
                      removido deste caso. O cálculo em si não será excluído e
                      poderá ser vinculado novamente.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => unlink({ caseId, calcId: calc.id })}
                    >
                      Desvincular
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
      </div>
      </div>
    </TooltipProvider>
  );
}
