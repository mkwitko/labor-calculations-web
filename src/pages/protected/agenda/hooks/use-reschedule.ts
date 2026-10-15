import { toast } from "sonner";
import { queryClient } from "@/lib/react-query";
import {
  getListAllDeadlinesQueryKey,
  useUpdateDeadline,
} from "@/http/generated/deadline/deadline";
import {
  getListAllHearingsQueryKey,
  useUpdateHearing,
} from "@/http/generated/hearing/hearing";
import {
  getListAgendaEventsQueryKey,
  useUpdateAgendaEvent,
} from "@/http/generated/agenda-event/agenda-event";
import type { DayEvent } from "../types";

function invalidateAll() {
  queryClient.invalidateQueries({ queryKey: getListAllHearingsQueryKey() });
  queryClient.invalidateQueries({ queryKey: getListAllDeadlinesQueryKey() });
  queryClient.invalidateQueries({ queryKey: getListAgendaEventsQueryKey() });
}

// Keeps the original time-of-day, moving only the calendar date.
function withDate(original: Date, targetDay: Date): string {
  const d = new Date(targetDay);
  d.setHours(original.getHours(), original.getMinutes(), 0, 0);
  return d.toISOString();
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// Drag-and-drop rescheduling of agenda items across days. Hearings/deadlines
// (case-bound) and personal events all update to the dropped day, preserving
// the original time.
export function useReschedule() {
  const mutation = {
    onSuccess: () => {
      invalidateAll();
      toast.success("Remarcado");
    },
    onError: () => toast.error("Erro ao remarcar"),
  };

  const { mutate: updateHearing } = useUpdateHearing({ mutation });
  const { mutate: updateDeadline } = useUpdateDeadline({ mutation });
  const { mutate: updateEvent } = useUpdateAgendaEvent({ mutation });

  function reschedule(event: DayEvent, targetDay: Date) {
    if (sameDay(event.date, targetDay)) return;
    const at = withDate(event.date, targetDay);

    if (event.type === "hearing") {
      updateHearing({ hearingId: event.id, data: { scheduledAt: at } });
    } else if (event.type === "deadline") {
      updateDeadline({ deadlineId: event.id, data: { dueAt: at } });
    } else {
      updateEvent({ id: event.id, data: { startsAt: at } });
    }
  }

  return { reschedule };
}
