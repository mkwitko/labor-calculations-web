import { InboxIcon } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { EmptyState } from "@/components/empty-state";
import { ListSkeleton } from "@/components/list-skeleton";
import { PageHeader } from "@/components/page-header";
import {
  useGetAdminSupportSummary,
  useListAdminSupportTickets,
} from "@/http/generated/admin/admin";
import { cn } from "@/lib/utils";
import {
  KIND_LABELS,
  type SupportKind,
  type SupportStatus,
  statusLabel,
  statusTone,
} from "../../suporte/labels";
import { PriorityBadge } from "./priority-badge";
import { AdminTicketPanel } from "./ticket-panel";

const FILTERS = [
  { id: "abertos", label: "Abertos" },
  { id: "sugestoes", label: "Sugestões" },
  { id: "todos", label: "Todos" },
] as const;

type FilterId = (typeof FILTERS)[number]["id"];

function when(value: string): string {
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * A fila do atendimento — todas as organizações.
 *
 * Sem item de navegação, como o `/admin/funil`: quem protege é o `requireAdmin`
 * no servidor, e esconder o link nunca foi o que protege rota nenhuma. O
 * chamado aberto vai para a URL (`?ticket=`) para que o link do e-mail de aviso
 * caia direto na conversa.
 */
export default function AdminSuporte() {
  const [filter, setFilter] = useState<FilterId>("abertos");
  const [params, setParams] = useSearchParams();
  const selected = params.get("ticket");

  const { data: summary } = useGetAdminSupportSummary();

  const { data: tickets, isLoading } = useListAdminSupportTickets({
    onlyOpen: filter === "abertos" ? true : undefined,
    kind: filter === "sugestoes" ? "sugestao" : undefined,
  });

  function select(ticketId: string | null) {
    const next = new URLSearchParams(params);

    if (ticketId) next.set("ticket", ticketId);
    else next.delete("ticket");

    setParams(next, { replace: true });
  }

  return (
    <div className="w-full space-y-6 p-4 md:p-6">
      <PageHeader
        title="Atendimento"
        subtitle={
          summary
            ? `${summary.open} em aberto · ${summary.unread} com mensagem por ler`
            : "Chamados e sugestões de todos os escritórios"
        }
      />

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setFilter(option.id)}
            aria-pressed={filter === option.id}
            className={cn(
              "rounded-full border px-4 py-1.5 font-medium text-sm transition-colors",
              filter === option.id
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        {isLoading ? (
          <ListSkeleton rows={4} />
        ) : tickets && tickets.length > 0 ? (
          <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
            {tickets.map((ticket) => (
              <li key={ticket.id}>
                <button
                  type="button"
                  onClick={() => select(ticket.id)}
                  className={cn(
                    "w-full px-4 py-3 text-left transition-colors hover:bg-muted/40",
                    selected === ticket.id && "bg-muted/60",
                  )}
                >
                  <div className="flex items-center gap-2">
                    {/* O servidor já ordena os prioritários na frente; o selo
                        é o que explica a ordem. */}
                    {ticket.priority && <PriorityBadge />}
                    <span className="truncate font-medium text-sm">
                      {ticket.subject}
                    </span>
                    {ticket.unread > 0 && (
                      <span className="rounded-full bg-primary px-1.5 py-0.5 font-semibold text-[10px] text-primary-foreground">
                        {ticket.unread}
                      </span>
                    )}
                  </div>
                  <p className="truncate text-muted-foreground text-xs">
                    {ticket.organization.name} · plano{" "}
                    {ticket.organization.planCode} ·{" "}
                    {KIND_LABELS[ticket.kind as SupportKind]}
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-muted-foreground text-xs">
                    <span
                      className={cn(
                        "rounded-full border px-2 py-0.5 font-medium",
                        statusTone(ticket.status as SupportStatus),
                      )}
                    >
                      {statusLabel(
                        ticket.status as SupportStatus,
                        ticket.kind as SupportKind,
                      )}
                    </span>
                    {when(ticket.lastMessageAt)}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={InboxIcon}
            title="Fila vazia"
            description="Nenhum chamado neste filtro."
          />
        )}

        {selected ? (
          <AdminTicketPanel ticketId={selected} onClose={() => select(null)} />
        ) : (
          <div className="hidden items-center justify-center rounded-xl border border-border border-dashed p-10 text-center text-muted-foreground text-sm lg:flex">
            Escolha um chamado para ler e responder.
          </div>
        )}
      </div>
    </div>
  );
}
