import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCursorPagination } from "@/hooks/use-cursor-pagination";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useListLaborCalculation } from "@/http/generated/labor-calculation/labor-calculation";
import { PlusIcon, SearchIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ListSkeleton } from "@/components/list-skeleton";
import { PageHeader } from "@/components/page-header";
import { CalcTable } from "./components/calc-table";

const PAGE_SIZE = 20;

/**
 * União literal em vez de `string`: o parâmetro `terminationType` da API é o
 * enum `TerminationType` do Prisma, e um `string` solto não é assinável a ele.
 * Escrita à mão, e não importada de `http/generated`, porque o tipo gerado só
 * existe enquanto o enum estiver no swagger — assim isto compila com as duas
 * formas do contrato.
 */
type TypeFilter =
  | "all"
  | "sem_justa_causa"
  | "com_justa_causa"
  | "pedido_demissao"
  | "rescisao_indireta";

export default function Calculations() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [versionFilter, setVersionFilter] = useState<string>("all");
  const { cursor, pageIdx, goNext, goPrev, reset: resetPagination } = useCursorPagination();

  // Filtro roda no servidor. Antes rodava client-side sobre a página de 20
  // itens enquanto a paginação era cursor server-side, então buscar cliente
  // de outra página devolvia zero resultados.
  const search = useDebouncedValue(query.trim());

  const { data: response, isLoading } = useListLaborCalculation({
    limit: PAGE_SIZE,
    cursor,
    ...(search ? { search } : {}),
    ...(typeFilter !== "all" ? { terminationType: typeFilter } : {}),
    ...(versionFilter !== "all" ? { calculationVersion: versionFilter } : {}),
  });

  const items = response?.data ?? [];
  const nextCursor = response?.nextCursor ?? null;

  function handleSearch(value: string) {
    setQuery(value);
    resetPagination();
  }

  // O `onValueChange` do Select entrega `string`; os valores possíveis são os
  // `SelectItem` logo abaixo, todos membros de `TypeFilter`.
  function handleTypeFilter(value: string) {
    setTypeFilter(value as TypeFilter);
    resetPagination();
  }

  function handleVersionFilter(value: string) {
    setVersionFilter(value);
    resetPagination();
  }

  const isFirstPage = pageIdx === 0;
  const hasNextPage = !!nextCursor;
  const isFiltered =
    search.length > 0 || typeFilter !== "all" || versionFilter !== "all";

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <PageHeader
        title="Cálculos Trabalhistas"
        subtitle="Processos e verbas rescisórias"
        actions={
          <Button onClick={() => navigate("/calculations/new")}>
            <PlusIcon data-icon="inline-start" />
            <span className="hidden sm:inline">Novo Cálculo</span>
            <span className="sm:hidden">Novo</span>
          </Button>
        }
      />

      <div className="bg-card border border-border rounded-xl">
        <div className="px-4 md:px-5 py-4 border-b border-border flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 sm:max-w-72">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Buscar cliente..."
              value={query}
              data-search
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={typeFilter} onValueChange={handleTypeFilter}>
            <SelectTrigger className="w-full sm:w-52">
              <SelectValue placeholder="Tipo de rescisão" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="sem_justa_causa">Sem justa causa</SelectItem>
              <SelectItem value="com_justa_causa">Com justa causa</SelectItem>
              <SelectItem value="pedido_demissao">Pedido de demissão</SelectItem>
              <SelectItem value="rescisao_indireta">Rescisão Indireta</SelectItem>
            </SelectContent>
          </Select>
          <Select value={versionFilter} onValueChange={handleVersionFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Tipo de cálculo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos cálculos</SelectItem>
              <SelectItem value="v2">Estimativa</SelectItem>
              <SelectItem value="v3">Liquidação</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="pt-1">
          {isLoading ? (
            <ListSkeleton />
          ) : (
            <CalcTable items={items} isFiltered={isFiltered} />
          )}
        </div>

        <div className="px-5 py-4 border-t border-border flex items-center justify-between">
          {/* A resposta não traz total e `items.length` é o tamanho da
              página — dizer "N resultados" lia-se como total. */}
          <p className="text-xs text-muted-foreground">Página {pageIdx + 1}</p>
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
    </div>
  );
}