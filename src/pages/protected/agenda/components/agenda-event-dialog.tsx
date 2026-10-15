import { useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { ConfirmButton } from "@/components/confirm-button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  getListAgendaEventsQueryKey,
  useCreateAgendaEvent,
  useDeleteAgendaEvent,
  useUpdateAgendaEvent,
} from "@/http/generated/agenda-event/agenda-event";
import { queryClient } from "@/lib/react-query";
import type { AgendaEventData } from "../types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Edit mode when `event` is set; create mode uses `initialDate`.
  event?: AgendaEventData | null;
  initialDate?: Date | null;
};

// <input type="datetime-local"> wants "yyyy-MM-ddTHH:mm" in local time.
function toLocalInput(value?: string | Date | null): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  return format(d, "yyyy-MM-dd'T'HH:mm");
}

export function AgendaEventDialog({ open, onOpenChange, event, initialDate }: Props) {
  const isEdit = !!event;
  const [title, setTitle] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [remindEmail, setRemindEmail] = useState(true);

  // Reset the form whenever the dialog opens for a different event/date.
  useEffect(() => {
    if (!open) return;
    setTitle(event?.title ?? "");
    setStartsAt(
      toLocalInput(event?.startsAt ?? (initialDate ? setNoon(initialDate) : "")),
    );
    setEndsAt(toLocalInput(event?.endsAt ?? null));
    setLocation(event?.location ?? "");
    setDescription(event?.description ?? "");
    setRemindEmail(event?.remindEmail ?? true);
  }, [open, event, initialDate]);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: getListAgendaEventsQueryKey() });

  const { mutate: create, isPending: creating } = useCreateAgendaEvent({
    mutation: {
      onSuccess: () => {
        invalidate();
        toast.success("Evento criado");
        onOpenChange(false);
      },
      onError: () => toast.error("Erro ao criar evento"),
    },
  });
  const { mutate: update, isPending: updating } = useUpdateAgendaEvent({
    mutation: {
      onSuccess: () => {
        invalidate();
        toast.success("Evento atualizado");
        onOpenChange(false);
      },
      onError: () => toast.error("Erro ao atualizar evento"),
    },
  });
  const { mutate: remove } = useDeleteAgendaEvent({
    mutation: {
      onSuccess: () => {
        invalidate();
        toast.success("Evento excluído");
        onOpenChange(false);
      },
      onError: () => toast.error("Erro ao excluir evento"),
    },
  });

  const isPending = creating || updating;

  const submit = () => {
    if (!title.trim() || !startsAt) return;
    const data = {
      title: title.trim(),
      startsAt: new Date(startsAt).toISOString(),
      endsAt: endsAt ? new Date(endsAt).toISOString() : undefined,
      location: location.trim() || undefined,
      description: description.trim() || undefined,
      remindEmail,
    };
    if (isEdit && event) {
      update({ id: event.id, data });
    } else {
      create({ data });
    }
  };

  const done = !!event?.doneAt;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar evento" : "Novo evento"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="ev-title">Título</Label>
            <Input
              id="ev-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Reunião com cliente"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ev-start">Início</Label>
              <Input
                id="ev-start"
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ev-end">Fim (opcional)</Label>
              <Input
                id="ev-end"
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ev-loc">Local (opcional)</Label>
            <Input
              id="ev-loc"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ex: Fórum Trabalhista, sala 3"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ev-desc">Descrição (opcional)</Label>
            <Textarea
              id="ev-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="ev-remind">Lembrete por e-mail (D-3 e D-1)</Label>
            <Switch id="ev-remind" checked={remindEmail} onCheckedChange={setRemindEmail} />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          {isEdit && event ? (
            <div className="flex gap-2">
              <ConfirmButton
                variant="outline"
                size="sm"
                title="Excluir evento?"
                description="Este evento será excluído permanentemente."
                confirmLabel="Excluir"
                onConfirm={() => remove({ id: event.id })}
              >
                Excluir
              </ConfirmButton>
              <Button
                variant="outline"
                size="sm"
                onClick={() => update({ id: event.id, data: { done: !done } })}
              >
                {done ? "Reabrir" : "Concluir"}
              </Button>
            </div>
          ) : (
            <span />
          )}
          <Button size="sm" onClick={submit} disabled={isPending || !title.trim() || !startsAt}>
            {isEdit ? "Salvar" : "Criar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Default a day-click to noon so the datetime picker isn't at 00:00.
function setNoon(date: Date): Date {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  return d;
}
