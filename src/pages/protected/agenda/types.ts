import type { ListAgendaEvents200DataItem } from "@/http/generated/labor-calculations-api.schemas";

export type AgendaEventData = ListAgendaEvents200DataItem;

export type DayEvent = {
  id: string;
  date: Date;
  title: string;
  subtitle?: string;
  caseId?: string;
  type: "hearing" | "deadline" | "event";
  isDone?: boolean;
  isOverdue?: boolean;
  // Present only for personal agenda events (type === "event"); carries the raw
  // record so the edit dialog can be opened without a refetch.
  agendaEvent?: AgendaEventData;
};

export type AgendaFilters = {
  hearing: boolean;
  deadline: boolean;
  event: boolean;
  hideDone: boolean;
};

export const DEFAULT_FILTERS: AgendaFilters = {
  hearing: true,
  deadline: true,
  event: true,
  hideDone: false,
};

export const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"] as const;
