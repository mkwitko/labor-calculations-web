import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlusIcon, SearchIcon } from "lucide-react";
import { ListSkeleton } from "@/components/list-skeleton";
import { PageHeader } from "@/components/page-header";
import { useListClients } from "@/http/generated/client/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { formatDate } from "@/utils/value-format";
import { useCursorPagination } from "@/hooks/use-cursor-pagination";
import { EmptyState } from "@/components/empty-state";
import { UserPlusIcon, UsersIcon } from "lucide-react";

const PAGE_SIZE = 20;

export default function Clients() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const { cursor, pageIdx, goNext, goPrev, reset: resetPagination } = useCursorPagination();

  const { data: response, isLoading } = useListClients({
    limit: PAGE_SIZE,
    cursor,
  });
  const items = response?.data ?? [];
  const nextCursor = response?.nextCursor ?? null;

  const filtered = useMemo(() =>
    query.trim()
      ? items.filter(
          (c) =>
            c.name.toLowerCase().includes(query.toLowerCase()) ||
            (c.document ?? "").includes(query) ||
            (c.mail ?? "").toLowerCase().includes(query.toLowerCase()),
        )
      : items,
    [query, items],
  );

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <PageHeader
        title="Clientes"
        subtitle="Gerencie seus clientes e vincule-os a cálculos"
        actions={
          <Button size="sm" onClick={() => navigate("/clients/new")}>
            <PlusIcon />
            Novo Cliente
          </Button>
        }
      />

      <div className="relative max-w-sm">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, CPF ou e-mail..."
          className="pl-9"
          value={query}
          data-search
          onChange={(e) => {
            setQuery(e.target.value);
            resetPagination();
          }}
        />
      </div>

      {isLoading ? (
        <ListSkeleton />
      ) : filtered.length === 0 ? (
        query ? (
          <EmptyState
            icon={UsersIcon}
            title="Nenhum cliente encontrado"
            description="Tente outro termo de busca."
          />
        ) : (
          <EmptyState
            icon={UsersIcon}
            title="Cadastre seu primeiro cliente"
            description="O cliente é o reclamante da causa. A partir dele você abre casos, faz cálculos e libera o portal de acompanhamento."
            action={{
              label: "Novo cliente",
              icon: UserPlusIcon,
              onClick: () => navigate("/clients/new"),
            }}
            helpArticle="cadastro-de-clientes"
          />
        )
      ) : (
        <>
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                    Nome
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide hidden md:table-cell">
                    CPF
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide hidden lg:table-cell">
                    E-mail
                  </th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                    Cálculos
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide hidden sm:table-cell">
                    Cadastro
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((client) => (
                  <tr
                    key={client.id}
                    onClick={() => navigate(`/clients/${client.id}`)}
                    className="border-b border-border last:border-0 hover:bg-muted/30 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-foreground">
                      {client.name}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      {client.document ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                      {client.mail ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-center text-muted-foreground">
                      {client._count.laborCalculations}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                      {formatDate(client.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={goPrev}
                  aria-disabled={pageIdx === 0}
                  className={pageIdx === 0 ? "pointer-events-none opacity-40" : "cursor-pointer"}
                />
              </PaginationItem>
              <PaginationItem>
                <span className="text-sm text-muted-foreground px-2">
                  Pág. {pageIdx + 1}
                </span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  onClick={() => nextCursor && goNext(nextCursor)}
                  aria-disabled={!nextCursor}
                  className={!nextCursor ? "pointer-events-none opacity-40" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </>
      )}
    </div>
  );
}
