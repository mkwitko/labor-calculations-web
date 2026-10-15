import { ZapIcon } from "lucide-react";

/**
 * Selo de atendimento prioritário.
 *
 * Deriva do plano do escritório no servidor — a tela não decide quem é
 * prioritário, só mostra. Na fila, esses chamados já vêm ordenados na frente;
 * o selo é o que explica por quê.
 */
export function PriorityBadge() {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 font-medium text-amber-600 text-xs dark:text-amber-400">
      <ZapIcon className="size-3" />
      Prioritário
    </span>
  );
}
