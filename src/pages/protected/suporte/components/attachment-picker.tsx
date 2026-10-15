import { PaperclipIcon, XIcon } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  ACCEPTED_MIME_TYPES,
  formatSize,
  type PendingUpload,
} from "../use-support-upload";

/**
 * O clipe e a fila de arquivos da mensagem que ainda não foi enviada.
 *
 * A barra de progresso não é enfeite: vídeo de 25MB em conexão de escritório
 * leva dezenas de segundos, e sem ela o silêncio parece travamento — a pessoa
 * clica de novo e manda o mesmo arquivo duas vezes.
 */
export function AttachmentPicker({
  onAdd,
  disabled,
}: {
  onAdd: (files: FileList) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        multiple
        hidden
        accept={ACCEPTED_MIME_TYPES.join(",")}
        onChange={(event) => {
          if (event.target.files?.length) onAdd(event.target.files);
          // Zera para o mesmo arquivo poder ser escolhido de novo.
          event.target.value = "";
        }}
      />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={disabled}
        aria-label="Anexar arquivo"
        onClick={() => inputRef.current?.click()}
      >
        <PaperclipIcon className="size-4" />
      </Button>
    </>
  );
}

/** A fila de arquivos da mensagem em edição — some quando ela é enviada. */
export function PendingAttachments({
  pending,
  onRemove,
}: {
  pending: PendingUpload[];
  onRemove: (id: string) => void;
}) {
  if (pending.length === 0) return null;

  return (
    <ul className="mb-2 space-y-1.5">
          {pending.map((item) => (
            <li
              key={item.id}
              className={cn(
                "flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-3 py-2",
                item.status === "error" && "border-destructive/40",
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-xs">{item.fileName}</p>
                {item.status === "uploading" ? (
                  <Progress value={item.progress} className="mt-1.5 h-1" />
                ) : (
                  <p
                    className={cn(
                      "text-xs",
                      item.status === "error"
                        ? "text-destructive"
                        : "text-muted-foreground",
                    )}
                  >
                    {item.status === "error"
                      ? "Falhou — remova e tente de novo"
                      : formatSize(item.sizeBytes)}
                  </p>
                )}
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Remover ${item.fileName}`}
                onClick={() => onRemove(item.id)}
              >
                <XIcon className="size-3.5" />
              </Button>
            </li>
          ))}
    </ul>
  );
}
