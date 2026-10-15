import { PaperclipIcon, SendIcon, XIcon } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { ThreadMessage } from "./use-message-stream";

export type PendingAttachment = {
  documentId: string;
  fileName: string;
};

type MessageThreadProps = {
  messages: ThreadMessage[];
  /** De que lado esta tela está: define qual balão é "meu". */
  viewer: "lawyer" | "client";
  onSend: (body: string, attachmentDocumentIds: string[]) => void;
  isSending?: boolean;
  emptyHint: string;
  /** Ausente = anexo desligado nesta tela. */
  onPickFile?: (file: File) => Promise<PendingAttachment>;
  onOpenAttachment?: (attachment: ThreadMessage["attachments"][number]) => void;
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MessageThread({
  messages,
  viewer,
  onSend,
  isSending,
  emptyHint,
  onPickFile,
  onOpenAttachment,
}: MessageThreadProps) {
  const [body, setBody] = useState("");
  const [pending, setPending] = useState<PendingAttachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const canSend = (body.trim().length > 0 || pending.length > 0) && !isSending;

  const submit = () => {
    if (!canSend) return;
    onSend(
      body.trim(),
      pending.map((p) => p.documentId),
    );
    setBody("");
    setPending([]);
  };

  const pickFile = async (file: File | undefined) => {
    if (!file || !onPickFile) return;
    setUploading(true);
    try {
      const attachment = await onPickFile(file);
      setPending((current) => [...current, attachment]);
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* A lista chega do mais recente para o mais antigo; `flex-col-reverse`
          põe a última embaixo sem inverter o array. */}
      <div className="flex flex-col-reverse gap-3 max-h-[28rem] overflow-y-auto pr-1">
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground py-8 text-center">
            {emptyHint}
          </p>
        )}

        {messages.map((message) => {
          const mine = message.authorKind === viewer;

          return (
            <div
              key={message.id}
              className={cn("flex", mine ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-lg px-3 py-2 space-y-1",
                  mine
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground",
                )}
              >
                <div
                  className={cn(
                    "flex items-baseline gap-2 text-xs",
                    mine ? "text-primary-foreground/70" : "text-muted-foreground",
                  )}
                >
                  <span className="font-medium">{message.authorName}</span>
                  <span>{formatTime(message.createdAt)}</span>
                </div>

                {message.body && (
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.body}
                  </p>
                )}

                {message.attachments.map((attachment) => (
                  <button
                    key={attachment.documentId}
                    type="button"
                    onClick={() => onOpenAttachment?.(attachment)}
                    className={cn(
                      "flex items-center gap-2 text-xs rounded px-2 py-1 w-full text-left",
                      mine
                        ? "bg-primary-foreground/15 hover:bg-primary-foreground/25"
                        : "bg-background hover:bg-accent",
                    )}
                  >
                    <PaperclipIcon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{attachment.fileName}</span>
                    <span className="shrink-0 opacity-70">
                      {formatSize(attachment.sizeBytes)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-2">
        {pending.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {pending.map((attachment) => (
              <span
                key={attachment.documentId}
                className="flex items-center gap-1.5 text-xs bg-muted rounded px-2 py-1"
              >
                <PaperclipIcon className="w-3 h-3" />
                {attachment.fileName}
                <button
                  type="button"
                  aria-label={`Remover ${attachment.fileName}`}
                  onClick={() =>
                    setPending((current) =>
                      current.filter(
                        (p) => p.documentId !== attachment.documentId,
                      ),
                    )
                  }
                >
                  <XIcon className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        <Textarea
          placeholder="Escreva sua mensagem..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          className="min-h-[80px] text-sm resize-none"
        />

        <div className="flex items-center justify-between gap-2">
          {onPickFile ? (
            <>
              <input
                ref={fileInput}
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.webp,.docx"
                onChange={(e) => pickFile(e.target.files?.[0])}
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={uploading}
                onClick={() => fileInput.current?.click()}
              >
                <PaperclipIcon className="w-3.5 h-3.5" />
                {uploading ? "Enviando..." : "Anexar"}
              </Button>
            </>
          ) : (
            <span />
          )}

          <Button type="button" size="sm" disabled={!canSend} onClick={submit}>
            <SendIcon className="w-3.5 h-3.5" />
            Enviar
          </Button>
        </div>
      </div>
    </div>
  );
}
