import { useEffect, useRef, useState } from "react";

export type ThreadMessage = {
  id: string;
  authorKind: "lawyer" | "client";
  authorName: string;
  body: string;
  createdAt: string;
  attachments: Array<{
    documentId: string;
    fileKey: string;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
  }>;
};

export type StreamEvent =
  | { type: "message"; caseId: string; message: ThreadMessage }
  | { type: "read"; caseId: string; viewer: "lawyer" | "client"; at: string };

/** A listagem vem do mais recente para o mais antigo; mensagem nova entra no topo. */
export function mergeMessages(
  current: ThreadMessage[],
  incoming: ThreadMessage,
): ThreadMessage[] {
  if (current.some((m) => m.id === incoming.id)) return current;
  return [incoming, ...current];
}

const MAX_BACKOFF_MS = 30_000;

export function nextBackoffMs(attempt: number): number {
  return Math.min(1000 * 2 ** attempt, MAX_BACKOFF_MS);
}

/**
 * Abre o SSE e diz se ele está de pé. Enquanto estiver caído, quem chama liga o
 * polling — a página continua correta, só com latência.
 */
export function useMessageStream(
  streamUrl: string,
  onEvent: (event: StreamEvent) => void,
) {
  const [connected, setConnected] = useState(false);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    let source: EventSource | null = null;
    let attempt = 0;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let closed = false;

    const open = () => {
      source = new EventSource(streamUrl, { withCredentials: true });

      source.onopen = () => {
        attempt = 0;
        setConnected(true);
      };

      source.onmessage = (event) => {
        onEventRef.current(JSON.parse(event.data));
      };

      source.onerror = () => {
        setConnected(false);
        source?.close();
        if (closed) return;
        retryTimer = setTimeout(open, nextBackoffMs(attempt));
        attempt += 1;
      };
    };

    open();

    return () => {
      closed = true;
      clearTimeout(retryTimer);
      source?.close();
    };
  }, [streamUrl]);

  return { connected };
}
