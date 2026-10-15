import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Moldura das telas de exemplo do hero e da demonstração.
 *
 * Ela sempre carrega o rótulo "Exemplo ilustrativo": os números dentro do
 * quadro são de demonstração, e página de vendas que mostra número sem dizer de
 * onde ele veio é a mesma coisa que a landing pede ao produto para não fazer.
 */
export function AppFrame({
  caption,
  children,
  className,
}: {
  caption: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <figure className={cn("relative", className)}>
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-black/5 shadow-xl">
        <div className="flex items-center gap-2 border-border/60 border-b bg-muted/40 px-4 py-3">
          <span className="size-2.5 rounded-full bg-muted-foreground/25" />
          <span className="size-2.5 rounded-full bg-muted-foreground/25" />
          <span className="size-2.5 rounded-full bg-muted-foreground/25" />
          <span className="ml-2 truncate font-medium text-muted-foreground text-xs">
            {caption}
          </span>
        </div>
        <div className="p-4 sm:p-6">{children}</div>
      </div>
      <figcaption className="mt-3 text-center text-muted-foreground/80 text-xs">
        Exemplo ilustrativo da interface — valores de demonstração.
      </figcaption>
    </figure>
  );
}

/** Linha “rótulo → valor” das telas de exemplo, com números tabulares. */
export function AppFrameRow({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-border/50 border-b py-2.5 last:border-0">
      <span className="text-muted-foreground text-xs sm:text-sm">{label}</span>
      <span
        className={cn(
          "shrink-0 font-medium text-xs tabular-nums sm:text-sm",
          muted ? "text-muted-foreground" : "text-foreground",
        )}
      >
        {value}
      </span>
    </div>
  );
}
