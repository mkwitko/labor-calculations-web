import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WEEKDAYS } from "../types";
import { CalendarDayCell } from "./calendar-day-cell";
import type { DayEvent } from "../types";

type CalendarGridProps = {
  currentMonth: Date;
  calendarDays: Date[];
  eventsByDay: Map<string, DayEvent[]>;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onDayClick: (date: Date) => void;
  onEventClick: (event: DayEvent) => void;
  onEventDragStart: (event: DayEvent) => void;
  onDayDrop: (date: Date) => void;
};

export function CalendarGrid({
  currentMonth,
  calendarDays,
  eventsByDay,
  onPrevMonth,
  onNextMonth,
  onDayClick,
  onEventClick,
  onEventDragStart,
  onDayDrop,
}: CalendarGridProps) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <Button variant="ghost" size="icon-sm" aria-label="Mês anterior" onClick={onPrevMonth}>
          <ChevronLeftIcon className="w-4 h-4" />
        </Button>
        <span className="text-sm font-semibold text-foreground capitalize">
          {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
        </span>
        <Button variant="ghost" size="icon-sm" aria-label="Próximo mês" onClick={onNextMonth}>
          <ChevronRightIcon className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 border-b border-border">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-2 text-center text-xs font-medium text-muted-foreground">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {calendarDays.map((day, i) => {
          const key = format(day, "yyyy-MM-dd");
          return (
            <CalendarDayCell
              key={i}
              day={day}
              dayIndex={i}
              currentMonth={currentMonth}
              events={eventsByDay.get(key) ?? []}
              onDayClick={onDayClick}
              onEventClick={onEventClick}
              onEventDragStart={onEventDragStart}
              onDayDrop={onDayDrop}
            />
          );
        })}
      </div>
    </div>
  );
}
