import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { MessageThread } from "@/components/messaging/message-thread";
import {
  mergeMessages,
  type ThreadMessage,
  useMessageStream,
} from "@/components/messaging/use-message-stream";
import { Card, CardContent } from "@/components/ui/card";
import { env } from "@/env";
import {
  createClientMessageAttachment,
  getClientMessageUploadUrl,
  getDocumentDownloadUrl,
  getListClientMessagesQueryKey,
  useCreateClientMessage,
  useListClientMessages,
  useMarkClientMessagesRead,
} from "@/http/generated/client-portal/client-portal";
import type { ListClientMessages200 } from "@/http/generated/lexlaboral-server.schemas";

const POLL_INTERVAL_MS = 15_000;

export function CaseMessages({ caseId }: { caseId: string }) {
  const queryClient = useQueryClient();
  const queryKey = getListClientMessagesQueryKey(caseId);

  const { connected } = useMessageStream(
    `${env.VITE_HTTP_API_URL}/client-portal/cases/${caseId}/events/stream`,
    (event) => {
      if (event.type !== "message") return;

      queryClient.setQueryData(
        queryKey,
        (old: ListClientMessages200 | undefined) =>
          old
            ? {
                ...old,
                items: mergeMessages(
                  old.items as ThreadMessage[],
                  event.message,
                ),
              }
            : old,
      );
    },
  );

  const { data } = useListClientMessages(caseId, undefined, {
    query: { refetchInterval: connected ? false : POLL_INTERVAL_MS },
  });

  const { mutate: markRead } = useMarkClientMessagesRead();
  const { mutateAsync: send, isPending: isSending } = useCreateClientMessage();

  useEffect(() => {
    markRead({ caseId });
  }, [caseId, markRead]);

  const messages = (data?.items ?? []) as ThreadMessage[];

  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-sm font-semibold text-foreground mb-4">
          Mensagens
        </h2>

        <MessageThread
          messages={messages}
          viewer="client"
          isSending={isSending}
          emptyHint="Nenhuma mensagem ainda. Use este espaço para falar com o escritório sobre o seu processo."
          onSend={async (body, attachmentDocumentIds) => {
            try {
              await send({ caseId, data: { body, attachmentDocumentIds } });
              await queryClient.invalidateQueries({ queryKey });
            } catch {
              toast.error("Não foi possível enviar a mensagem.");
            }
          }}
          onPickFile={async (file) => {
            const upload = await getClientMessageUploadUrl(caseId, {
              fileName: file.name,
              mimeType: file.type,
              sizeBytes: file.size,
            });

            await fetch(upload.uploadUrl, {
              method: "PUT",
              body: file,
              headers: { "Content-Type": file.type },
            });

            const registered = await createClientMessageAttachment(caseId, {
              fileKey: upload.fileKey,
              fileName: file.name,
              mimeType: file.type,
              sizeBytes: file.size,
            });

            return { documentId: registered.documentId, fileName: file.name };
          }}
          onOpenAttachment={async (attachment) => {
            // No portal o arquivo sai por URL assinada, não pelo storage
            // público — é o mesmo caminho da aba de documentos.
            const res = await getDocumentDownloadUrl(attachment.documentId);
            const link = document.createElement("a");
            link.href = res.downloadUrl;
            link.download = attachment.fileName;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.click();
          }}
        />
      </CardContent>
    </Card>
  );
}
