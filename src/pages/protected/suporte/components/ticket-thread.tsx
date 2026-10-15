import { HeadphonesIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { type Attachment, AttachmentList } from "./attachment-list";

export type ThreadMessage = {
  id: string;
  body: string;
  fromStaff: boolean;
  createdAt: string;
  author?: { id: string; name: string } | null;
  attachments?: Attachment[];
};

function when(value: string): string {
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * A conversa, em forma de chat: o que é meu encosta à esquerda, o que veio do
 * outro lado à direita.
 *
 * As duas telas usam este mesmo fio — do escritório, "meu" é o escritório; do
 * atendimento, "meu" é o LexLaboral. É só o que `mineIsStaff` inverte; a ordem
 * (do mais antigo para o mais novo) é igual nos dois lugares para ninguém
 * precisar deduzir quem falou por último.
 */
export function TicketThread({
  messages,
  mineIsStaff = false,
  autoScroll = false,
}: {
  messages: ThreadMessage[];
  mineIsStaff?: boolean;
  autoScroll?: boolean;
}) {
  const endRef = useRef<HTMLDivElement>(null);

  // Chat abre no fim: a resposta mais nova é o motivo de a pessoa ter entrado.
  useEffect(() => {
    if (!autoScroll) return;
    endRef.current?.scrollIntoView({ block: "end" });
  }, [autoScroll, messages.length]);

  return (
    <ol className="space-y-3">
      {messages.map((message) => {
        const mine = message.fromStaff === mineIsStaff;
        const name = message.fromStaff
          ? "LexLaboral"
          : (message.author?.name ?? "Escritório");

        return (
          <li
            key={message.id}
            className={cn("flex", mine ? "justify-start" : "justify-end")}
          >
            <div
              className={cn(
                "max-w-[85ch] rounded-2xl border px-4 py-3 sm:max-w-[75%]",
                mine
                  ? "rounded-bl-sm border-primary bg-primary text-primary-foreground"
                  : "rounded-br-sm border-border bg-card text-foreground",
              )}
            >
              <div
                className={cn(
                  "mb-1.5 flex items-center gap-2 text-xs",
                  mine ? "text-primary-foreground/70" : "text-muted-foreground",
                )}
              >
                {message.fromStaff && (
                  <HeadphonesIcon aria-hidden="true" className="size-3.5" />
                )}
                <span className="font-medium">{name}</span>
                <span aria-hidden="true">·</span>
                <time dateTime={message.createdAt}>{when(message.createdAt)}</time>
              </div>
              <p className="whitespace-pre-line text-sm leading-relaxed">
                {message.body}
              </p>

              <AttachmentList
                attachments={message.attachments ?? []}
                mine={mine}
              />
            </div>
          </li>
        );
      })}
      <div ref={endRef} />
    </ol>
  );
}
