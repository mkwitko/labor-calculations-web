import { addDays, format, isToday, isTomorrow, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CalendarClockIcon,
  ChevronRightIcon,
  GavelIcon,
  TimerIcon,
} from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useListAllDeadlines } from "@/http/generated/deadline/deadline";
import { useListAllHearings } from "@/http/generated/hearing/hearing";
import {
  getDeadlineKindLabel,
  getHearingKindLabel,
} from "@/utils/value-format";
import { cn } from "@/lib/utils";

type Item = {
  id: string;
  date: Date;
  title: string;
  subtitle?: string;
  caseId: string;
  type: "hearing" | "deadline";
  overdue: boolean;
};

function dayLabel(date: Date): string {
  if (isToday(date)) return "Hoje";
  if (isTomorrow(date)) return "Amanhã";
  return format(date, "dd 'de' MMM", { locale: ptBR });
}

// Actionable cockpit: hearings + deadlines due within the next 14 days
// (plus overdue), sorted by date. Deep-links into the case hub agenda.
export function UpcomingPanel() {
  const navigate = useNavigate();
  const { data: hearings } = useListAllHearings();
  const { data: deadlines } = useListAllDeadlines();

  const items = useMemo<Item[]>(() => {
    const now = new Date();
    const cutoff = addDays(now, 14);
    const result: Item[] = [];

    for (const h of hearings ?? []) {
      const date = parseISO(h.scheduledAt);
      if (date > cutoff) continue;
      result.push({
        id: h.id,
        date,
        title: getHearingKindLabel(h.kind),
        subtitle: h.caseTitle,
        caseId: h.caseId,
        type: "hearing",
        overdue: date < now,
      });
    }
    for (const d of deadlines ?? []) {
      if (d.doneAt) continue;
      const date = parseISO(d.dueAt);
      if (date > cutoff) continue;
      result.push({
        id: d.id,
        date,
        title: getDeadlineKindLabel(d.kind, d.customLabel),
        subtitle: d.caseTitle,
        caseId: d.caseId,
        type: "deadline",
        overdue: date < now,
      });
    }
    return result.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [hearings, deadlines]);

  return (
    <div className="bg-card border border-border rounded-xl">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
        <div className="flex items-center gap-2">
          <CalendarClockIcon className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">
            Próximos compromissos
          </h3>
        </div>
        <button
          type="button"
          onClick={() => navigate("/agenda")}
          className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-0.5"
        >
          Ver agenda <ChevronRightIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      {items.length === 0 ? (
        <div className="px-5 py-8 text-center text-sm text-muted-foreground">
          Nenhum compromisso nos próximos 14 dias.
        </div>
      ) : (
        <div className="divide-y divide-border">
          {items.slice(0, 6).map((item) => {
            const Icon = item.type === "hearing" ? GavelIcon : TimerIcon;
            return (
              <button
                key={`${item.type}-${item.id}`}
                type="button"
                onClick={() => navigate(`/cases/${item.caseId}/audiencias`)}
                className="flex items-center gap-3 w-full px-5 py-3 text-left hover:bg-muted/40 transition-colors"
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                    item.type === "hearing"
                      ? "bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400"
                      : "bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400",
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground truncate">
                    {item.title}
                  </p>
                  {item.subtitle && (
                    <p className="text-xs text-muted-foreground truncate">
                      {item.subtitle}
                    </p>
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium shrink-0",
                    item.overdue ? "text-destructive" : "text-muted-foreground",
                  )}
                >
                  {item.overdue ? "Atrasado" : dayLabel(item.date)}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
