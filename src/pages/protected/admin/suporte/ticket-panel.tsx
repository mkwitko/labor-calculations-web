import { XIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ListSkeleton } from "@/components/list-skeleton";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  getGetAdminSupportSummaryQueryKey,
  getGetAdminSupportTicketQueryKey,
  getListAdminSupportTicketsQueryKey,
  useGetAdminSupportTicket,
  useGetAdminSupportUploadUrl,
  useReplyAdminSupportTicket,
  useUpdateAdminSupportTicket,
} from "@/http/generated/admin/admin";
import { queryClient } from "@/lib/react-query";
import { cn } from "@/lib/utils";
import {
  AttachmentPicker,
  PendingAttachments,
} from "../../suporte/components/attachment-picker";
import { TicketThread } from "../../suporte/components/ticket-thread";
import { useSupportUpload } from "../../suporte/use-support-upload";
import { PriorityBadge } from "./priority-badge";
import {
  KIND_LABELS,
  STATUS_OPTIONS,
  type SupportKind,
  type SupportStatus,
  statusLabel,
  statusTone,
} from "../../suporte/labels";

/**
 * A conversa do lado do atendimento.
 *
 * Responder e mudar de estágio são dois botões e não um: a maior parte das
 * respostas não muda estágio nenhum, e a sugestão anda quando o desenvolvimento
 * anda — não porque alguém comentou nela.
 */
export function AdminTicketPanel({
  ticketId,
  onClose,
}: {
  ticketId: string;
  onClose: () => void;
}) {
  const [reply, setReply] = useState("");

  const { data: ticket, isLoading } = useGetAdminSupportTicket(ticketId);

  function refresh() {
    queryClient.invalidateQueries({
      queryKey: getGetAdminSupportTicketQueryKey(ticketId),
    });
    queryClient.invalidateQueries({
      queryKey: getListAdminSupportTicketsQueryKey(),
    });
    queryClient.invalidateQueries({
      queryKey: getGetAdminSupportSummaryQueryKey(),
    });
  }

  const { mutateAsync: requestUploadUrl } = useGetAdminSupportUploadUrl();

  const upload = useSupportUpload((file) =>
    requestUploadUrl({ id: ticketId, data: file }).then((result) => ({
      uploadUrl: result.uploadUrl,
      fileKey: result.fileKey,
    })),
  );

  const { mutateAsync: send, isPending: sending } = useReplyAdminSupportTicket({
    mutation: {
      onSuccess: () => {
        setReply("");
        upload.reset();
        refresh();
        toast.success("Resposta enviada — o escritório foi avisado por e-mail.");
      },
      onError: () => toast.error("Não conseguimos enviar agora."),
    },
  });

  const { mutateAsync: move } = useUpdateAdminSupportTicket({
    mutation: {
      onSuccess: () => {
        refresh();
        toast.success("Estágio atualizado. Quem abriu recebeu o aviso.");
      },
      onError: () => toast.error("Não conseguimos mudar o estágio agora."),
    },
  });

  if (isLoading || !ticket) {
    return (
      <div className="rounded-xl border border-border p-4">
        <ListSkeleton rows={3} />
      </div>
    );
  }

  const kind = ticket.kind as SupportKind;
  const status = ticket.status as SupportStatus;
  const context = ticket.context;

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4 md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-semibold text-base">{ticket.subject}</h2>
            {ticket.priority && <PriorityBadge />}
          </div>
          <p className="text-muted-foreground text-xs">
            {KIND_LABELS[kind]} · {ticket.organization.name} · plano{" "}
            {ticket.organization.planCode}
            {ticket.author ? ` · ${ticket.author.name} (${ticket.author.mail})` : ""}
          </p>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={onClose}>
          <XIcon className="size-4" />
          <span className="sr-only">Fechar</span>
        </Button>
      </div>

      {context?.path && (
        <p className="rounded-lg bg-muted/50 px-3 py-2 text-muted-foreground text-xs">
          Aberto em <code className="text-foreground">{context.path}</code>
          {context.userAgent ? ` · ${context.userAgent.slice(0, 80)}` : ""}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "rounded-full border px-2.5 py-1 font-medium text-xs",
            statusTone(status),
          )}
        >
          {statusLabel(status, kind)}
        </span>

        <Select
          value={status}
          onValueChange={(next) =>
            move({ id: ticketId, data: { status: next as SupportStatus } })
          }
        >
          <SelectTrigger size="sm" className="w-52">
            <SelectValue placeholder="Mudar estágio" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS[kind].map((option) => (
              <SelectItem key={option} value={option}>
                {statusLabel(option, kind)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <TicketThread messages={ticket.messages} mineIsStaff />

      <div className="space-y-3">
        <Textarea
          value={reply}
          rows={5}
          maxLength={5_000}
          onChange={(event) => setReply(event.target.value)}
          placeholder="Resposta ao escritório..."
        />

        <PendingAttachments pending={upload.pending} onRemove={upload.remove} />

        <div className="flex items-center justify-between gap-2">
          <AttachmentPicker onAdd={upload.add} disabled={sending} />
          <Button
            onClick={() =>
              send({
                id: ticketId,
                data: {
                  body: reply.trim(),
                  attachments: upload.attachments,
                },
              })
            }
            disabled={sending || upload.uploading || !reply.trim()}
          >
            {sending ? "Enviando..." : "Responder"}
          </Button>
        </div>
      </div>
    </div>
  );
}
