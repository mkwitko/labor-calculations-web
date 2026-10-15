import { useEffect, useState } from "react";
import { addMonths, subMonths } from "date-fns";
import { CalendarPlusIcon, DownloadCloudIcon } from "lucide-react";
import { useProductTour } from "@/hooks/use-product-tour";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAgendaEvents } from "./hooks/use-agenda-events";
import { useReschedule } from "./hooks/use-reschedule";
import { CalendarGrid } from "./components/calendar-grid";
import { UpcomingSidebar } from "./components/upcoming-sidebar";
import { AgendaEventDialog } from "./components/agenda-event-dialog";
import { GoogleImportDialog } from "./components/google-import-dialog";
import { DEFAULT_FILTERS, type AgendaEventData, type AgendaFilters, type DayEvent } from "./types";

const FILTER_CHIPS: Array<{ key: keyof AgendaFilters; label: string; dot: string }> = [
  { key: "hearing", label: "Audiências", dot: "bg-primary" },
  { key: "deadline", label: "Prazos", dot: "bg-amber-500" },
  { key: "event", label: "Eventos", dot: "bg-sky-500" },
];

export default function Agenda() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [filters, setFilters] = useState<AgendaFilters>(DEFAULT_FILTERS);
  const { eventsByDay, calendarDays, upcomingEvents } = useAgendaEvents(currentMonth, filters);
  const { startAgendaTourIfFirstVisit } = useProductTour();

  const [eventDialog, setEventDialog] = useState<{
    open: boolean;
    event: AgendaEventData | null;
    date: Date | null;
  }>({ open: false, event: null, date: null });
  const [importOpen, setImportOpen] = useState(false);
  const [dragged, setDragged] = useState<DayEvent | null>(null);
  const { reschedule } = useReschedule();

  useEffect(() => {
    startAgendaTourIfFirstVisit();
  }, [startAgendaTourIfFirstVisit]);

  const openCreate = (date: Date) =>
    setEventDialog({ open: true, event: null, date });
  const openEdit = (e: DayEvent) => {
    if (e.agendaEvent) setEventDialog({ open: true, event: e.agendaEvent, date: null });
  };

  const toggle = (key: keyof AgendaFilters) =>
    setFilters((f) => ({ ...f, [key]: !f[key] }));

  return (
    <div className="p-4 md:p-6 space-y-6">
      <PageHeader
        title="Agenda"
        subtitle="Audiências, prazos e seus eventos"
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setImportOpen(true)}
            >
              <DownloadCloudIcon />
              Importar do Google
            </Button>
            <Button size="sm" onClick={() => openCreate(new Date())}>
              <CalendarPlusIcon />
              Novo evento
            </Button>
          </>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {FILTER_CHIPS.map((chip) => (
          <button
            key={chip.key}
            type="button"
            onClick={() => toggle(chip.key)}
            aria-pressed={filters[chip.key]}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              filters[chip.key]
                ? "border-border bg-card text-foreground"
                : "border-transparent bg-muted/50 text-muted-foreground",
            )}
          >
            <span className={cn("w-2 h-2 rounded-full", chip.dot, !filters[chip.key] && "opacity-30")} />
            {chip.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => toggle("hideDone")}
          aria-pressed={filters.hideDone}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
            filters.hideDone
              ? "border-border bg-card text-foreground"
              : "border-transparent bg-muted/50 text-muted-foreground",
          )}
        >
          Ocultar concluídos
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        <div data-tour="agenda-calendar">
          <CalendarGrid
            currentMonth={currentMonth}
            calendarDays={calendarDays}
            eventsByDay={eventsByDay}
            onPrevMonth={() => setCurrentMonth(subMonths(currentMonth, 1))}
            onNextMonth={() => setCurrentMonth(addMonths(currentMonth, 1))}
            onDayClick={openCreate}
            onEventClick={openEdit}
            onEventDragStart={setDragged}
            onDayDrop={(day) => {
              if (dragged) reschedule(dragged, day);
              setDragged(null);
            }}
          />
        </div>
        <div data-tour="agenda-upcoming">
          <UpcomingSidebar events={upcomingEvents} onEventClick={openEdit} />
        </div>
      </div>

      <AgendaEventDialog
        open={eventDialog.open}
        onOpenChange={(open) => setEventDialog((s) => ({ ...s, open }))}
        event={eventDialog.event}
        initialDate={eventDialog.date}
      />
      <GoogleImportDialog open={importOpen} onOpenChange={setImportOpen} />
    </div>
  );
}
