import { useNavigate } from "react-router-dom";
import { GavelIcon, ClockIcon, CalendarDaysIcon, CalendarPlusIcon } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { cn } from "@/lib/utils";
import { formatDateTime, formatDate } from "@/utils/value-format";
import type { DayEvent } from "../types";

type UpcomingSidebarProps = {
  events: DayEvent[];
  onEventClick: (event: DayEvent) => void;
};

export function UpcomingSidebar({ events, onEventClick }: UpcomingSidebarProps) {
  const navigate = useNavigate();

  const handleClick = (e: DayEvent) => {
    if (e.type === "event") onEventClick(e);
    else navigate(`/cases/${e.caseId}/audiencias`);
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden h-fit">
      <div className="px-4 py-3.5 border-b border-border">
        <div className="flex items-center gap-2">
          <CalendarDaysIcon className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">Próximos 30 dias</span>
        </div>
      </div>

      {events.length === 0 ? (
        <EmptyState
          icon={CalendarDaysIcon}
          title="Nenhum evento nos próximos 30 dias"
          description="Audiências, prazos e compromissos de todos os casos aparecem aqui."
          helpArticle="agenda-e-prazos"
          className="py-8"
        />
      ) : (
        <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
          {events.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => handleClick(e)}
              className="w-full text-left px-4 py-3 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-start gap-2.5">
                <div
                  className={cn(
                    "mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                    e.type === "hearing"
                      ? "bg-primary/10"
                      : e.type === "event"
                        ? "bg-sky-500/10"
                        : "bg-amber-500/10",
                  )}
                >
                  {e.type === "hearing" ? (
                    <GavelIcon className="w-3.5 h-3.5 text-primary" />
                  ) : e.type === "event" ? (
                    <CalendarPlusIcon className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  ) : (
                    <ClockIcon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-foreground truncate">{e.title}</p>
                  {e.subtitle && (
                    <p className="text-xs text-muted-foreground truncate">{e.subtitle}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {e.type === "deadline" ? formatDate(e.date) : formatDateTime(e.date)}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
