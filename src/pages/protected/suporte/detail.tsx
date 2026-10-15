import { ArrowLeftIcon, CheckIcon, SendIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ConfirmButton } from "@/components/confirm-button";
import { ListSkeleton } from "@/components/list-skeleton";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  getGetSupportTicketQueryKey,
  getGetSupportUnreadCountQueryKey,
  getListSupportTicketsQueryKey,
  useCloseSupportTicket,
  useGetSupportTicket,
  useGetSupportUploadUrl,
  useReplySupportTicket,
} from "@/http/generated/support/support";
import { queryClient } from "@/lib/react-query";
import { cn } from "@/lib/utils";
import {
  AttachmentPicker,
  PendingAttachments,
} from "./components/attachment-picker";
import { TicketThread } from "./components/ticket-thread";
import { useSupportUpload } from "./use-support-upload";
import {
  KIND_LABELS,
  type SupportKind,
  type SupportStatus,
  statusLabel,
  statusTone,
} from "./labels";

export default function SuporteDetail() {
  const { id = "" } = useParams<{ id: string }>();
  const [reply, setReply] = useState("");

  const { data: ticket, isLoading } = useGetSupportTicket(id, {
    query: { enabled: Boolean(id) },
  });

  function refresh() {
    queryClient.invalidateQueries({ queryKey: getGetSupportTicketQueryKey(id) });
    queryClient.invalidateQueries({ queryKey: getListSupportTicketsQueryKey() });
    queryClient.invalidateQueries({
      queryKey: getGetSupportUnreadCountQueryKey(),
    });
  }

  // Abrir a conversa é o que marca as respostas como lidas — no servidor. Sem
  // reler o contador aqui, o selo da navegação continuava apontando uma
  // resposta por ler que a pessoa acabou de ler.
  useEffect(() => {
    if (!ticket) return;

    queryClient.invalidateQueries({
      queryKey: getGetSupportUnreadCountQueryKey(),
    });
    queryClient.invalidateQueries({ queryKey: getListSupportTicketsQueryKey() });
  }, [ticket]);

  const { mutateAsync: requestUploadUrl } = useGetSupportUploadUrl();

  const upload = useSupportUpload((file) =>
    requestUploadUrl({ data: file }).then((result) => ({
      uploadUrl: result.uploadUrl,
      fileKey: result.fileKey,
    })),
  );

  const { mutateAsync: send, isPending: sending } = useReplySupportTicket({
    mutation: {
      onSuccess: () => {
        setReply("");
        upload.reset();
        refresh();
      },
      onError: () => toast.error("Não conseguimos enviar a resposta agora."),
    },
  });

  const { mutateAsync: close } = useCloseSupportTicket({
    mutation: {
      onSuccess: () => {
        toast.success("Assunto encerrado. Responder aqui reabre a conversa.");
        refresh();
      },
    },
  });

  function submit() {
    const body = reply.trim();
    // Enviar no meio do upload gravaria a mensagem sem o arquivo que ela cita.
    if (!body || sending || upload.uploading) return;
    send({ id, data: { body, attachments: upload.attachments } });
  }

  if (isLoading) {
    return (
      <div className="w-full space-y-6 p-4 md:p-6">
        <PageHeader title="Suporte" />
        <ListSkeleton rows={3} />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="w-full space-y-6 p-4 md:p-6">
        <PageHeader title="Chamado não encontrado" />
        <Button asChild variant="outline">
          <Link to="/suporte">Voltar</Link>
        </Button>
      </div>
    );
  }

  const kind = ticket.kind as SupportKind;
  const status = ticket.status as SupportStatus;
  const closed = status === "concluido" || status === "recusado";

  return (
    // Tela de conversa: cabeçalho e caixa de resposta fixos, só o fio rola.
    // A página inteira não rola junto — quem responde não perde o campo de vista
    // ao voltar para reler uma mensagem antiga.
    <div className="flex h-full min-h-0 w-full flex-col">
      <div className="shrink-0 border-border border-b px-4 pt-4 pb-3 md:px-6">
        <Link
          to="/suporte"
          className="mb-3 inline-flex items-center gap-1.5 text-muted-foreground text-sm transition-colors hover:text-foreground"
        >
          <ArrowLeftIcon className="size-3.5" />
          Suporte e sugestões
        </Link>

        <PageHeader
          title={ticket.subject}
          subtitle={`${KIND_LABELS[kind]} · aberto em ${new Date(
            ticket.createdAt,
          ).toLocaleDateString("pt-BR")}`}
          actions={
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "rounded-full border px-3 py-1 font-medium text-xs",
                  statusTone(status),
                )}
              >
                {statusLabel(status, kind)}
              </span>
              {!closed && (
                <ConfirmButton
                  variant="outline"
                  size="sm"
                  title="Encerrar o assunto?"
                  description="Você pode reabrir a qualquer momento respondendo aqui."
                  confirmLabel="Encerrar"
                  onConfirm={() => close({ id })}
                >
                  <CheckIcon className="size-3.5" />
                  Encerrar
                </ConfirmButton>
              )}
            </div>
          }
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6 md:px-6">
        <TicketThread messages={ticket.messages} autoScroll />
      </div>

      <div className="shrink-0 border-border border-t bg-background px-4 py-3 md:px-6">
        <PendingAttachments pending={upload.pending} onRemove={upload.remove} />

        <div className="flex items-end gap-2">
          <AttachmentPicker onAdd={upload.add} disabled={sending} />

          <Textarea
            value={reply}
            rows={2}
            maxLength={5_000}
            onChange={(event) => setReply(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                submit();
              }
            }}
            placeholder={
              closed
                ? "Responder aqui reabre o assunto."
                : "Escreva sua resposta..."
            }
            className="max-h-40 min-h-[2.75rem] flex-1 resize-none"
          />
          <Button
            onClick={submit}
            disabled={sending || upload.uploading || !reply.trim()}
            aria-label="Responder"
          >
            <SendIcon className="size-4" />
            <span className="hidden sm:inline">
              {sending ? "Enviando..." : "Responder"}
            </span>
          </Button>
        </div>
        <p className="mt-1.5 text-muted-foreground text-xs">
          {closed
            ? "Assunto encerrado — responder reabre a conversa."
            : "Enter envia · Shift + Enter quebra linha"}
        </p>
      </div>
    </div>
  );
}
