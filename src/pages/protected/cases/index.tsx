import { useNavigate, useSearchParams } from "react-router-dom";
import { KanbanIcon, ListIcon, PlusIcon, SearchIcon, XIcon } from "lucide-react";
import { useListCases } from "@/http/generated/case/case";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CasesKanban } from "./components/cases-kanban";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ListSkeleton } from "@/components/list-skeleton";
import { PageHeader } from "@/components/page-header";
import { CaseTable } from "./components/case-table";
import { useOrgAbilities } from "@/hooks/use-organizations";
import { useCaseFilters } from "./hooks/use-case-filters";
import { ALL_PHASES, CASE_PHASE_LABELS, type CasePhase } from "./utils/case-phase";

const PAGE_SIZE = 20;

export default function Cases() {
  const navigate = useNavigate();
  const { canWriteCases } = useOrgAbilities();
  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get("view") === "kanban" ? "kanban" : "lista";
  const setView = (v: "lista" | "kanban") => {
    const next = new URLSearchParams(searchParams);
    if (v === "kanban") next.set("view", "kanban");
    else next.delete("view");
    setSearchParams(next, { replace: true });
  };

  const { search, phase, cursor, pageIdx, handleSearch, handlePhase, clearFilters, goNext, goPrev, isFiltered } =
  useCaseFilters();

  const { data: response, isLoading } = useListCases({
  limit: PAGE_SIZE,
  cursor,
    phase,
    search: search.trim() || undefined,
  });

  const items = response?.data ?? [];
  const nextCursor = response?.nextCursor ?? null;
  const isFirstPage = pageIdx === 0;
  const hasNextPage = !!nextCursor;

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <PageHeader
        title="Casos"
        subtitle="Processos e ciclo de vida jurídico"
        actions={
          <>
            <div className="flex items-center rounded-lg border border-border p-0.5">
              <button
                type="button"
                onClick={() => setView("lista")}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors",
                  view === "lista"
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <ListIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Lista</span>
              </button>
              <button
                type="button"
                onClick={() => setView("kanban")}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors",
                  view === "kanban"
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <KanbanIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Kanban</span>
              </button>
            </div>
            {/* Espelha canWriteCases: staff e estagiário leem caso, não criam. */}
            {canWriteCases && (
              <Button onClick={() => navigate("/cases/new")}>
                <PlusIcon data-icon="inline-start" />
                <span className="hidden sm:inline">Novo Caso</span>
                <span className="sm:hidden">Novo</span>
              </Button>
            )}
          </>
        }
      />

      {view === "kanban" ? (
        <CasesKanban search={search} />
      ) : (
      <div className="bg-card border border-border rounded-xl">
        <div className="px-4 md:px-5 py-4 border-b border-border flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 sm:max-w-72">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
              placeholder="Buscar por título, processo ou cliente..."
              value={search}
              data-search
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={phase ?? "all"}
              onValueChange={(v) => handlePhase(v === "all" ? undefined : (v as CasePhase))}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Todas as fases" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as fases</SelectItem>
                {ALL_PHASES.map((p) => (
                  <SelectItem key={p} value={p}>
                    {CASE_PHASE_LABELS[p]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {isFiltered && (
              <Button variant="ghost" size="icon-sm" aria-label="Limpar filtros" onClick={clearFilters}>
                <XIcon />
              </Button>
            )}
          </div>
        </div>

        <div className="pt-1">
          {isLoading ? (
            <ListSkeleton />
          ) : (
            <CaseTable items={items} isFiltered={isFiltered} />
          )}
        </div>

        <div className="px-5 py-4 border-t border-border flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {items.length} resultado{items.length !== 1 ? "s" : ""} · Página {pageIdx + 1}
          </p>
          {(!isFirstPage || hasNextPage) && (
            <Pagination className="mx-0 w-auto justify-end">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    text="Anterior"
                    onClick={goPrev}
                    aria-disabled={isFirstPage}
                    className={isFirstPage ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    text="Próxima"
                    onClick={() => nextCursor && goNext(nextCursor)}
                    aria-disabled={!hasNextPage}
                    className={!hasNextPage ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </div>
      )}
    </div>
  );
}
