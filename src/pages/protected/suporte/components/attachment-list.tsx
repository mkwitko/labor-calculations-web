import {
  DownloadIcon,
  FileTextIcon,
  ShieldAlertIcon,
  ShieldQuestionIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatSize } from "../use-support-upload";

export type Attachment = {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  scanStatus: string;
  url?: string | null;
};

function isImage(mimeType: string): boolean {
  return mimeType.startsWith("image/");
}

function isVideo(mimeType: string): boolean {
  return mimeType.startsWith("video/");
}

/**
 * Os anexos de uma fala.
 *
 * Imagem e vídeo aparecem na conversa em vez de virarem link: print de tela é o
 * conteúdo da mensagem, e obrigar um download para ver o erro é uma ida e volta
 * a cada resposta. O thumbnail é o próprio arquivo redimensionado — gerar
 * miniatura no servidor custaria uma fila de processamento para economizar
 * alguns KB numa conversa que quase sempre tem um arquivo só.
 */
export function AttachmentList({
  attachments,
  mine,
}: {
  attachments: Attachment[];
  /** Muda só as cores, para o anexo não sumir dentro da bolha colorida. */
  mine?: boolean;
}) {
  if (attachments.length === 0) return null;

  return (
    <ul className="mt-2 space-y-2">
      {attachments.map((attachment) => {
        // Sem URL o arquivo foi bloqueado pela varredura: o registro fica para
        // explicar por que o anexo não abre.
        if (!attachment.url) {
          return (
            <li
              key={attachment.id}
              className={cn(
                "flex items-center gap-2 rounded-lg border border-destructive/40 px-3 py-2 text-xs",
                mine ? "text-primary-foreground" : "text-destructive",
              )}
            >
              <ShieldAlertIcon className="size-3.5 shrink-0" />
              <span className="truncate">
                {attachment.fileName} — bloqueado pelo antivírus
              </span>
            </li>
          );
        }

        if (isImage(attachment.mimeType)) {
          return (
            <li key={attachment.id}>
              <a href={attachment.url} target="_blank" rel="noreferrer">
                <img
                  src={attachment.url}
                  alt={attachment.fileName}
                  loading="lazy"
                  className="max-h-64 w-auto max-w-full rounded-lg border border-border object-contain"
                />
              </a>
            </li>
          );
        }

        if (isVideo(attachment.mimeType)) {
          return (
            <li key={attachment.id}>
              {/* biome-ignore lint/a11y/useMediaCaption: vídeo de suporte é gravação de tela enviada pelo usuário, sem legenda disponível */}
              <video
                controls
                preload="metadata"
                src={attachment.url}
                className="max-h-64 w-full rounded-lg border border-border"
              />
            </li>
          );
        }

        return (
          <li key={attachment.id}>
            <a
              href={attachment.url}
              target="_blank"
              rel="noreferrer"
              className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors",
                mine
                  ? "border-primary-foreground/20 bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/25"
                  : "border-border bg-muted/40 text-foreground hover:bg-muted",
              )}
            >
              <FileTextIcon className="size-3.5 shrink-0" />
              <span className="min-w-0 flex-1 truncate">
                {attachment.fileName}
              </span>
              <span
                className={cn(
                  mine ? "text-primary-foreground/70" : "text-muted-foreground",
                )}
              >
                {formatSize(attachment.sizeBytes)}
              </span>
              <DownloadIcon className="size-3.5 shrink-0" />
            </a>

            {attachment.scanStatus === "pending" && (
              <p
                className={cn(
                  "mt-1 flex items-center gap-1 text-[11px]",
                  mine ? "text-primary-foreground/70" : "text-muted-foreground",
                )}
              >
                <ShieldQuestionIcon className="size-3" />
                Varredura em andamento
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}
