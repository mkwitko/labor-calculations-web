import { useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  parseISO,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { useListAllHearings } from "@/http/generated/hearing/hearing";
import { useListAllDeadlines } from "@/http/generated/deadline/deadline";
import { useListAgendaEvents } from "@/http/generated/agenda-event/agenda-event";
import { getHearingKindLabel, getDeadlineKindLabel } from "@/utils/value-format";
import { DEFAULT_FILTERS, type AgendaFilters, type DayEvent } from "../types";

export function useAgendaEvents(
  currentMonth: Date,
  filters: AgendaFilters = DEFAULT_FILTERS,
) {
  const { data: hearings } = useListAllHearings();
  const { data: deadlines } = useListAllDeadlines();
  const { data: agendaEvents } = useListAgendaEvents();

  const events = useMemo<DayEvent[]>(() => {
    const result: DayEvent[] = [];
    const now = new Date();

    for (const h of hearings ?? []) {
      result.push({
        id: h.id,
        date: parseISO(h.scheduledAt),
        title: getHearingKindLabel(h.kind),
        subtitle: h.caseTitle,
        caseId: h.caseId,
        type: "hearing",
      });
    }

    for (const d of deadlines ?? []) {
      const date = parseISO(d.dueAt);
      result.push({
        id: d.id,
        date,
        title: getDeadlineKindLabel(d.kind, d.customLabel),
        subtitle: d.caseTitle,
        caseId: d.caseId,
        type: "deadline",
        isDone: !!d.doneAt,
        isOverdue: !d.doneAt && date < now,
      });
    }

    for (const e of agendaEvents?.data ?? []) {
      const date = parseISO(e.startsAt as unknown as string);
      result.push({
        id: e.id,
        date,
        title: e.title,
        subtitle: e.location ?? undefined,
        type: "event",
        isDone: !!e.doneAt,
        isOverdue: !e.doneAt && date < now,
        agendaEvent: e,
      });
    }

    return result.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [hearings, deadlines, agendaEvents]);

  const filtered = useMemo<DayEvent[]>(() => {
    return events.filter((e) => {
      if (!filters[e.type]) return false;
      if (filters.hideDone && e.isDone) return false;
      return true;
    });
  }, [events, filters]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, DayEvent[]>();
    for (const e of filtered) {
      const key = format(e.date, "yyyy-MM-dd");
      const arr = map.get(key) ?? [];
      arr.push(e);
      map.set(key, arr);
    }
    return map;
  }, [filtered]);

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { locale: ptBR });
    const end = endOfWeek(endOfMonth(currentMonth), { locale: ptBR });
    const days: Date[] = [];
    let cur = start;
    while (cur <= end) {
      days.push(cur);
      cur = addDays(cur, 1);
    }
    return days;
  }, [currentMonth]);

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    const cutoff = addDays(now, 30);
    return filtered.filter((e) => e.date >= now && e.date <= cutoff && !e.isDone);
  }, [filtered]);

  return { events: filtered, eventsByDay, calendarDays, upcomingEvents };
}
