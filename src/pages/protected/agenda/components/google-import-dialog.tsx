import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useImportGoogleCalendarEvents,
  useListGoogleCalendarEvents,
} from "@/http/generated/integration/integration";
import { getListAgendaEventsQueryKey } from "@/http/generated/agenda-event/agenda-event";
import { getListAllHearingsQueryKey } from "@/http/generated/hearing/hearing";
import { getListAllDeadlinesQueryKey } from "@/http/generated/deadline/deadline";
import { useListCases } from "@/http/generated/case/case";
import type {
  ImportGoogleCalendarEventsBodyEventsItem,
  ListGoogleCalendarEvents200DataItem,
} from "@/http/generated/lexlaboral-server.schemas";
import { queryClient } from "@/lib/react-query";
import { formatDateTime } from "@/utils/value-format";

type Target = "none" | "personal" | "hearing" | "deadline";
type Choice = { target: Target; caseId?: string };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function GoogleImportDialog({ open, onOpenChange }: Props) {
  const [choices, setChoices] = useState<Record<string, Choice>>({});

  const { data, isLoading } = useListGoogleCalendarEvents(undefined, {
    query: { enabled: open },
  });
  const { data: casesResp } = useListCases({ limit: 100 }, { query: { enabled: open } });
  const cases = casesResp?.data ?? [];

  const { mutate: importEvents, isPending } = useImportGoogleCalendarEvents({
    mutation: {
      onSuccess: (res) => {
        queryClient.invalidateQueries({ queryKey: getListAgendaEventsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListAllHearingsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListAllDeadlinesQueryKey() });
        toast.success(
          `${res.imported} importado(s)${res.skipped ? `, ${res.skipped} ignorado(s)` : ""}`,
        );
        setChoices({});
        onOpenChange(false);
      },
      onError: () => toast.error("Erro ao importar eventos"),
    },
  });

  const events = data?.data ?? [];

  const setChoice = (id: string, patch: Partial<Choice>) =>
    setChoices((prev) => {
      const current: Choice = prev[id] ?? { target: "none" };
      return { ...prev, [id]: { ...current, ...patch } };
    });

  const selected = useMemo(
    () =>
      events.filter((e) => {
        const c = choices[e.googleEventId];
        return c && c.target !== "none";
      }),
    [events, choices],
  );

  const submit = () => {
    const payload: ImportGoogleCalendarEventsBodyEventsItem[] = [];
    for (const e of selected) {
      const c = choices[e.googleEventId];
      if (!c) continue;
      if ((c.target === "hearing" || c.target === "deadline") && !c.caseId) {
        toast.error(`Escolha o caso para "${e.title}"`);
        return;
      }
      payload.push({
        googleEventId: e.googleEventId,
        title: e.title,
        description: e.description,
        location: e.location,
        startsAt: e.startsAt,
        endsAt: e.endsAt,
        allDay: e.allDay,
        target: c.target as "personal" | "hearing" | "deadline",
        ...(c.caseId ? { caseId: c.caseId } : {}),
        ...(c.target === "hearing" ? { hearingKind: "outra" } : {}),
        ...(c.target === "deadline" ? { deadlineKind: "outros" } : {}),
      });
    }
    if (payload.length === 0) return;
    importEvents({ data: { events: payload } });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Importar do Google Agenda</DialogTitle>
        </DialogHeader>

        <div className="max-h-[55vh] overflow-y-auto -mx-1 px-1">
          {isLoading ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Carregando eventos do Google...
            </p>
          ) : events.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Nenhum evento encontrado nos próximos 90 dias. Verifique se o Google
              Agenda está conectado em Configurações.
            </p>
          ) : (
            <div className="divide-y divide-border border border-border rounded-lg">
              {events.map((e) => (
                <ImportRow
                  key={e.googleEventId}
                  event={e}
                  choice={choices[e.googleEventId] ?? { target: "none" }}
                  cases={cases}
                  onChange={(patch) => setChoice(e.googleEventId, patch)}
                />
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button size="sm" onClick={submit} disabled={isPending || selected.length === 0}>
            Importar {selected.length > 0 ? `(${selected.length})` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ImportRow({
  event,
  choice,
  cases,
  onChange,
}: {
  event: ListGoogleCalendarEvents200DataItem;
  choice: Choice;
  cases: Array<{ id: string; title: string }>;
  onChange: (patch: Partial<Choice>) => void;
}) {
  const needsCase = choice.target === "hearing" || choice.target === "deadline";

  return (
    <div className="flex flex-col gap-2 px-3 py-2.5 sm:flex-row sm:items-start">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground truncate">{event.title}</p>
        <p className="text-xs text-muted-foreground">
          {formatDateTime(event.startsAt)}
          {event.alreadyImported && " · já importado"}
        </p>
      </div>

      <div className="flex w-full flex-col gap-2 shrink-0 sm:w-48">
        <Select
          value={choice.target}
          onValueChange={(v) => onChange({ target: v as Target })}
          disabled={event.alreadyImported}
        >
          <SelectTrigger className="w-full" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Ignorar</SelectItem>
            <SelectItem value="personal">Evento pessoal</SelectItem>
            <SelectItem value="hearing">Audiência</SelectItem>
            <SelectItem value="deadline">Prazo</SelectItem>
          </SelectContent>
        </Select>

        {needsCase && (
          <Select value={choice.caseId ?? ""} onValueChange={(v) => onChange({ caseId: v })}>
            <SelectTrigger className="w-full" size="sm">
              <SelectValue placeholder="Escolher caso" />
            </SelectTrigger>
            <SelectContent>
              {cases.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
}
