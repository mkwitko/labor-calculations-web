import { HeadphonesIcon, LightbulbIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState } from "@/components/empty-state";
import { ListSkeleton } from "@/components/list-skeleton";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  getListSupportTicketsQueryKey,
  useListSupportTickets,
} from "@/http/generated/support/support";
import { queryClient } from "@/lib/react-query";
import { cn } from "@/lib/utils";
import { NewTicketDialog } from "./components/new-ticket-dialog";
import {
  KIND_LABELS,
  type SupportKind,
  type SupportStatus,
  statusLabel,
  statusTone,
} from "./labels";

function when(value: string): string {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

/**
 * O canal do escritório com o LexLaboral: dúvida, problema e sugestão na mesma
 * lista.
 *
 * São do escritório, e não de quem abriu — o colega que assume o caso encontra
 * a conversa aqui em vez de recomeçar do zero.
 */
export default function Suporte() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [defaultKind, setDefaultKind] = useState<SupportKind>("duvida");

  const { data: tickets, isLoading } = useListSupportTickets();

  function refresh() {
    queryClient.invalidateQueries({
      queryKey: getListSupportTicketsQueryKey(),
    });
  }

  function open(kind: SupportKind) {
    setDefaultKind(kind);
    setDialogOpen(true);
  }

  return (
    <div className="w-full space-y-6 p-4 md:p-6">
      <PageHeader
        title="Suporte e sugestões"
        subtitle="Fale com quem faz o LexLaboral. A conversa fica aqui, e avisamos por e-mail quando houver resposta."
        actions={
          <Button onClick={() => open("duvida")}>
            <PlusIcon className="size-4" />
            Abrir chamado
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => open("problema")}
          className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/30"
        >
          <HeadphonesIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <span>
            <span className="block font-medium text-sm">Preciso de ajuda</span>
            <span className="block text-muted-foreground text-xs">
              Dúvida de uso ou algo que não funcionou como deveria.
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => open("sugestao")}
          className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/30"
        >
          <LightbulbIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <span>
            <span className="block font-medium text-sm">Tenho uma ideia</span>
            <span className="block text-muted-foreground text-xs">
              Sua sugestão vai direto para quem decide o que construir.
            </span>
          </span>
        </button>
      </div>

      {isLoading ? (
        <ListSkeleton rows={3} />
      ) : tickets && tickets.length > 0 ? (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {tickets.map((ticket) => (
            <li key={ticket.id}>
              <Link
                to={`/suporte/${ticket.id}`}
                className="flex items-center justify-between gap-4 px-4 py-3.5 transition-colors hover:bg-muted/40"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium text-foreground text-sm">
                      {ticket.subject}
                    </span>
                    {ticket.unread > 0 && (
                      <span className="rounded-full bg-primary px-1.5 py-0.5 font-semibold text-[10px] text-primary-foreground">
                        {ticket.unread}
                      </span>
                    )}
                  </div>
                  <p className="truncate text-muted-foreground text-xs">
                    {KIND_LABELS[ticket.kind as SupportKind]}
                    {ticket.author ? ` · ${ticket.author.name}` : ""} ·{" "}
                    {when(ticket.lastMessageAt)}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full border px-2.5 py-1 font-medium text-xs",
                    statusTone(ticket.status as SupportStatus),
                  )}
                >
                  {statusLabel(
                    ticket.status as SupportStatus,
                    ticket.kind as SupportKind,
                  )}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={HeadphonesIcon}
          title="Nenhuma conversa por aqui ainda"
          description="Dúvida de uso, alguma coisa que quebrou ou uma ideia para o produto — os três começam no mesmo lugar."
          action={{
            label: "Abrir o primeiro",
            onClick: () => open("duvida"),
          }}
        />
      )}

      <NewTicketDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultKind={defaultKind}
        onCreated={refresh}
      />
    </div>
  );
}
