import type { MouseEvent } from "react";
import { cn } from "@/lib/utils";
import type { DayEvent } from "../types";

type EventChipProps = {
  event: DayEvent;
  onClick: (e: MouseEvent) => void;
  onDragStart?: () => void;
};

export function EventChip({ event, onClick, onDragStart }: EventChipProps) {
  return (
    <button
      type="button"
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className={cn(
        "w-full text-left text-xs px-1.5 py-0.5 rounded truncate transition-opacity cursor-grab active:cursor-grabbing",
        event.isDone
          ? "bg-muted text-muted-foreground line-through opacity-50"
          : event.isOverdue
            ? "bg-destructive/15 text-destructive hover:bg-destructive/25"
            : event.type === "hearing"
              ? "bg-primary/15 text-primary hover:bg-primary/25"
              : event.type === "event"
                ? "bg-sky-500/15 text-sky-700 dark:text-sky-400 hover:bg-sky-500/25"
                : "bg-amber-500/15 text-amber-700 dark:text-amber-400 hover:bg-amber-500/25",
      )}
      title={event.subtitle ? `${event.title} — ${event.subtitle}` : event.title}
    >
      {event.title}
    </button>
  );
}
