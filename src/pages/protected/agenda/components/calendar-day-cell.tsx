import { format, isSameMonth, isToday } from "date-fns";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import type { DayEvent } from "../types";
import { EventChip } from "./event-chip";

type CalendarDayCellProps = {
  day: Date;
  dayIndex: number;
  currentMonth: Date;
  events: DayEvent[];
  onDayClick: (date: Date) => void;
  onEventClick: (event: DayEvent) => void;
  onEventDragStart: (event: DayEvent) => void;
  onDayDrop: (date: Date) => void;
};

export function CalendarDayCell({
  day,
  dayIndex,
  currentMonth,
  events,
  onDayClick,
  onEventClick,
  onEventDragStart,
  onDayDrop,
}: CalendarDayCellProps) {
  const navigate = useNavigate();
  const [dragOver, setDragOver] = useState(false);
  const isCurrentMonth = isSameMonth(day, currentMonth);
  const today = isToday(day);

  const handleEvent = (e: DayEvent) => {
    // Personal events open the edit dialog; case-bound items jump to the case.
    if (e.type === "event") onEventClick(e);
    else navigate(`/cases/${e.caseId}/audiencias`);
  };

  return (
    // Clicking empty space in the cell creates an event on that day. Chips
    // stop propagation so they don't also trigger the create flow.
    <div
      onClick={() => onDayClick(day)}
      onDragOver={(e) => {
        e.preventDefault();
        if (!dragOver) setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={() => {
        setDragOver(false);
        onDayDrop(day);
      }}
      className={cn(
        "min-h-[80px] p-1.5 border-b border-r border-border cursor-pointer hover:bg-muted/40 transition-colors",
        !isCurrentMonth && "bg-muted/20",
        today && "bg-primary/5",
        dragOver && "ring-2 ring-inset ring-primary bg-primary/10",
        dayIndex % 7 === 6 && "border-r-0",
      )}
    >
      <span
        className={cn(
          "inline-flex w-6 h-6 items-center justify-center rounded-full text-xs font-medium mb-1",
          today
            ? "bg-primary text-primary-foreground"
            : isCurrentMonth
              ? "text-foreground"
              : "text-muted-foreground/40",
        )}
      >
        {format(day, "d")}
      </span>
      <div className="space-y-0.5">
        {events.slice(0, 3).map((e) => (
          <EventChip
            key={e.id}
            event={e}
            onClick={(ev) => {
              ev.stopPropagation();
              handleEvent(e);
            }}
            onDragStart={() => onEventDragStart(e)}
          />
        ))}
        {events.length > 3 && (
          <span className="text-xs text-muted-foreground px-1">+{events.length - 3}</span>
        )}
      </div>
    </div>
  );
}
