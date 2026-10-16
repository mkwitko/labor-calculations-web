import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { MessageThread } from "@/components/messaging/message-thread";
import {
  mergeMessages,
  type ThreadMessage,
  useMessageStream,
} from "@/components/messaging/use-message-stream";
import { env } from "@/env";
import {
  getListMessagesQueryKey,
  useCreateMessage,
  useCreateMessageAttachment,
  useGetMessageUploadUrl,
  useListMessages,
  useMarkMessagesRead,
} from "@/http/generated/message/message";
import type { ListMessages200 } from "@/http/generated/labor-calculations-api.schemas";
import { useCaseHub } from "../case-hub-layout";

/** Sem stream de pé a página se mantém correta por polling. */
const POLL_INTERVAL_MS = 15_000;

export default function CaseMessagesPage() {
  const { caseId } = useCaseHub();
  const queryClient = useQueryClient();
  const queryKey = getListMessagesQueryKey(caseId);

  const { connected } = useMessageStream(
    `${env.VITE_HTTP_API_URL}/cases/${caseId}/events/stream`,
    (event) => {
      if (event.type !== "message") return;

      queryClient.setQueryData(queryKey, (old: ListMessages200 | undefined) =>
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

  const { data } = useListMessages(caseId, undefined, {
    query: { refetchInterval: connected ? false : POLL_INTERVAL_MS },
  });

  const { mutate: markRead } = useMarkMessagesRead();
  const { mutateAsync: send, isPending: isSending } = useCreateMessage();
  const { mutateAsync: getUploadUrl } = useGetMessageUploadUrl();
  const { mutateAsync: registerAttachment } = useCreateMessageAttachment();

  // Abrir a aba é o que marca como lida — o advogado está olhando a thread.
  useEffect(() => {
    markRead({ caseId });
  }, [caseId, markRead]);

  const messages = (data?.items ?? []) as ThreadMessage[];

  return (
    <MessageThread
      messages={messages}
      viewer="lawyer"
      isSending={isSending}
      emptyHint="Nenhuma mensagem ainda. O que você escrever aqui aparece no portal do cliente."
      onSend={async (body, attachmentDocumentIds) => {
        try {
          await send({ caseId, data: { body, attachmentDocumentIds } });
          await queryClient.invalidateQueries({ queryKey });
        } catch {
          toast.error("Não foi possível enviar a mensagem.");
        }
      }}
      onPickFile={async (file) => {
        const upload = await getUploadUrl({
          caseId,
          data: {
            fileName: file.name,
            mimeType: file.type,
            sizeBytes: file.size,
          },
        });

        await fetch(upload.uploadUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });

        const registered = await registerAttachment({
          caseId,
          data: {
            fileKey: upload.fileKey,
            fileName: file.name,
            mimeType: file.type,
            sizeBytes: file.size,
          },
        });

        return { documentId: registered.documentId, fileName: file.name };
      }}
      onOpenAttachment={(attachment) => {
        window.open(
          `${env.VITE_STORAGE_URL}/${attachment.fileKey}`,
          "_blank",
          "noopener",
        );
      }}
    />
  );
}
