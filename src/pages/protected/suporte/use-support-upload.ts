import { useRef, useState } from "react";
import { toast } from "sonner";

/** Espelha a whitelist do back (`services/support/support-attachment.ts`). */
export const ACCEPTED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

export const MAX_ATTACHMENT_SIZE = 25 * 1024 * 1024;
export const MAX_ATTACHMENTS = 5;

export type UploadedAttachment = {
  fileKey: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
};

export type PendingUpload = {
  /** Local, só para a lista — o arquivo ainda não tem id no servidor. */
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  progress: number;
  status: "uploading" | "done" | "error";
  /** Preenchido quando o upload termina; é o que viaja na mensagem. */
  attachment?: UploadedAttachment;
};

type UploadUrl = { uploadUrl: string; fileKey: string };

/**
 * Sobe o arquivo direto para o R2 com a URL assinada que o back devolve.
 *
 * `XMLHttpRequest` em vez de `fetch` porque só ele reporta progresso de upload —
 * e um vídeo de 25MB sem barra parece travamento. O PUT vai cru, sem o
 * interceptor do app: qualquer cabeçalho a mais invalida a assinatura.
 */
function putToStorage(
  url: string,
  file: File,
  onProgress: (percent: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();

    request.open("PUT", url);
    request.setRequestHeader("Content-Type", file.type);

    request.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    request.onload = () =>
      request.status >= 200 && request.status < 300
        ? resolve()
        : reject(new Error(`Upload falhou (${request.status})`));
    request.onerror = () => reject(new Error("Upload falhou"));
    request.onabort = () => reject(new Error("Upload cancelado"));

    request.send(file);
  });
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Fila de anexos de uma mensagem que ainda não foi enviada.
 *
 * Quem chama entrega só o jeito de pedir a URL assinada — a tela do escritório e
 * a do atendimento pedem em rotas diferentes, e o resto do fluxo é igual.
 */
export function useSupportUpload(
  requestUploadUrl: (file: {
    fileName: string;
    mimeType: string;
    sizeBytes: number;
  }) => Promise<UploadUrl>,
) {
  const [pending, setPending] = useState<PendingUpload[]>([]);
  const counter = useRef(0);

  function update(id: string, patch: Partial<PendingUpload>) {
    setPending((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }

  async function add(files: FileList | File[]) {
    const list = Array.from(files);

    for (const file of list) {
      if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
        toast.error(`${file.name}: tipo de arquivo não permitido.`);
        continue;
      }

      if (file.size > MAX_ATTACHMENT_SIZE) {
        toast.error(`${file.name}: máximo de 25MB.`);
        continue;
      }

      // O teto é por mensagem, então conta o que já está na fila.
      let full = false;
      setPending((current) => {
        full = current.length >= MAX_ATTACHMENTS;
        return current;
      });
      if (full) {
        toast.error(`Máximo de ${MAX_ATTACHMENTS} arquivos por mensagem.`);
        return;
      }

      counter.current += 1;
      const id = `upload-${counter.current}`;

      setPending((current) => [
        ...current,
        {
          id,
          fileName: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
          progress: 0,
          status: "uploading",
        },
      ]);

      try {
        const { uploadUrl, fileKey } = await requestUploadUrl({
          fileName: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
        });

        await putToStorage(uploadUrl, file, (progress) =>
          update(id, { progress }),
        );

        update(id, {
          status: "done",
          progress: 100,
          attachment: {
            fileKey,
            fileName: file.name,
            mimeType: file.type,
            sizeBytes: file.size,
          },
        });
      } catch {
        update(id, { status: "error" });
        toast.error(`Não conseguimos enviar ${file.name}.`);
      }
    }
  }

  function remove(id: string) {
    setPending((current) => current.filter((item) => item.id !== id));
  }

  function reset() {
    setPending([]);
  }

  return {
    pending,
    add,
    remove,
    reset,
    /** O que vai no corpo da mensagem — só o que terminou de subir. */
    attachments: pending
      .map((item) => item.attachment)
      .filter((attachment): attachment is UploadedAttachment =>
        Boolean(attachment),
      ),
    uploading: pending.some((item) => item.status === "uploading"),
  };
}
