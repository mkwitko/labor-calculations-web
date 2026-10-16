import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { DeadlineCalculator } from "../deadline-calculator";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getGetCaseQueryKey } from "@/http/generated/case/case";
import {
  getListAllDeadlinesQueryKey,
  getListDeadlinesQueryKey,
  useCreateDeadline,
  useDeleteDeadline,
  useUpdateDeadline,
} from "@/http/generated/deadline/deadline";
import {
  getListAllHearingsQueryKey,
  getListHearingsQueryKey,
  useCreateHearing,
  useDeleteHearing,
} from "@/http/generated/hearing/hearing";
import type { GetCase200 } from "@/http/generated/labor-calculations-api.schemas";

// Hearings/deadlines feed the Agenda (which queries the "list all" endpoints),
// so any change here must refresh those caches too — otherwise the Agenda is
// stale until a full reload.
function invalidateAgenda() {
  queryClient.invalidateQueries({ queryKey: getListAllHearingsQueryKey() });
  queryClient.invalidateQueries({ queryKey: getListAllDeadlinesQueryKey() });
}
import { queryClient } from "@/lib/react-query";
import { formatDate, formatDateTime, getDeadlineKindLabel, getHearingKindLabel } from "@/utils/value-format";
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  CircleIcon,
  ClockIcon,
  GavelIcon,
  LinkIcon,
  MapPinIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Hearing = GetCase200["hearings"][number];
type Deadline = GetCase200["deadlines"][number];

type Props = {
  caseId: string;
  hearings: Hearing[];
  deadlines: Deadline[];
};

const HEARING_KINDS = [
  { value: "inicial", label: "Audiência Inicial" },
  { value: "conciliacao", label: "Conciliação" },
  { value: "instrucao", label: "Instrução" },
  { value: "julgamento", label: "Julgamento" },
  { value: "outra", label: "Outra" },
];

const DEADLINE_KINDS = [
  { value: "contestacao", label: "Contestação" },
  { value: "recurso_ordinario", label: "Recurso Ordinário" },
  { value: "embargos", label: "Embargos" },
  { value: "outros", label: "Outros" },
];

const HEARING_KIND_COLORS: Record<string, string> = {
  inicial: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  conciliacao: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  instrucao: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  julgamento: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  outra: "bg-muted text-muted-foreground",
};

function HearingForm({ caseId, onSuccess }: { caseId: string; onSuccess: () => void }) {
  const [kind, setKind] = useState("inicial");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00");
  const [location, setLocation] = useState("");
  const [link, setLink] = useState("");
  const [notes, setNotes] = useState("");

  const { mutate: create, isPending } = useCreateHearing({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCaseQueryKey(caseId) });
        queryClient.invalidateQueries({ queryKey: getListHearingsQueryKey(caseId) });
        invalidateAgenda();
        toast("Audiência registrada");
        if (kind === "inicial") toast("Prazo de contestação criado automaticamente (D+15 úteis)");
        onSuccess();
      },
      onError: () => toast.error("Erro ao registrar audiência"),
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!date) return;
    const scheduledAt = new Date(`${date}T${time || "00:00"}:00`).toISOString();
    create({
      caseId,
      data: {
        kind: kind as "inicial" | "conciliacao" | "instrucao" | "julgamento" | "outra",
        scheduledAt,
        location: location || undefined,
        link: link || undefined,
        notes: notes || undefined,
      },
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-2">
      <div className="space-y-1.5">
        <Label>Tipo *</Label>
        <Select value={kind} onValueChange={setKind}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {HEARING_KINDS.map((k) => (
              <SelectItem key={k.value} value={k.value}>{k.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Data *</Label>
          <DatePicker value={date} onChange={setDate} placeholder="dd/mm/aaaa" />
        </div>
        <div className="space-y-1.5">
          <Label>Hora</Label>
          <Input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Local</Label>
        <Input
          placeholder="Ex: 3ª Vara do Trabalho de SP"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Link (videoconferência)</Label>
        <Input
          type="url"
          placeholder="https://..."
          value={link}
          onChange={(e) => setLink(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Observações</Label>
        <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      {kind === "inicial" && (
        <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
          Prazo de contestação (D+15 úteis CLT) será criado automaticamente.
        </p>
      )}
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={isPending || !date}>
          {isPending ? "Salvando..." : "Salvar audiência"}
        </Button>
      </div>
    </form>
  );
}

function DeadlineForm({ caseId, onSuccess }: { caseId: string; onSuccess: () => void }) {
  const [kind, setKind] = useState("contestacao");
  const [dueAt, setDueAt] = useState("");
  const [customLabel, setCustomLabel] = useState("");

  const { mutate: create, isPending } = useCreateDeadline({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCaseQueryKey(caseId) });
        queryClient.invalidateQueries({ queryKey: getListDeadlinesQueryKey(caseId) });
        invalidateAgenda();
        toast("Prazo registrado");
        onSuccess();
      },
      onError: () => toast.error("Erro ao registrar prazo"),
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!dueAt) return;
    create({
      caseId,
      data: {
        kind: kind as "contestacao" | "recurso_ordinario" | "embargos" | "outros",
        dueAt: new Date(`${dueAt}T00:00:00`).toISOString(),
        customLabel: customLabel || undefined,
      },
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-2">
      <div className="space-y-1.5">
        <Label>Tipo *</Label>
        <Select value={kind} onValueChange={setKind}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {DEADLINE_KINDS.map((k) => (
              <SelectItem key={k.value} value={k.value}>{k.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {kind === "outros" && (
        <div className="space-y-1.5">
          <Label>Descrição *</Label>
          <Input
            placeholder="Ex: Juntar documentos"
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            required
          />
        </div>
      )}
      <div className="space-y-1.5">
        <Label>Data limite *</Label>
        <DatePicker value={dueAt} onChange={setDueAt} placeholder="dd/mm/aaaa" />
      </div>
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={isPending || !dueAt}>
          {isPending ? "Salvando..." : "Salvar prazo"}
        </Button>
      </div>
    </form>
  );
}

export function HearingsTab({ caseId, hearings, deadlines }: Props) {
  const [hearingDialogOpen, setHearingDialogOpen] = useState(false);
  const [deadlineDialogOpen, setDeadlineDialogOpen] = useState(false);

  const { mutate: deleteHearing, isPending: isDeletingHearing } = useDeleteHearing({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCaseQueryKey(caseId) });
        invalidateAgenda();
        toast("Audiência removida");
      },
      onError: () => toast.error("Erro ao remover audiência"),
    },
  });

  const { mutate: deleteDeadline, isPending: isDeletingDeadline } = useDeleteDeadline({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCaseQueryKey(caseId) });
        invalidateAgenda();
        toast("Prazo removido");
      },
      onError: () => toast.error("Erro ao remover prazo"),
    },
  });

  const { mutate: toggleDone } = useUpdateDeadline({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCaseQueryKey(caseId) });
        invalidateAgenda();
      },
      onError: () => toast.error("Erro ao atualizar prazo"),
    },
  });

  function handleToggleDone(deadline: Deadline) {
    toggleDone({
      deadlineId: deadline.id,
      data: { doneAt: deadline.doneAt ? null : new Date().toISOString() },
    });
  }

  const pendingDeadlines = deadlines.filter((d) => !d.doneAt);
  const overdueDeadlines = pendingDeadlines.filter((d) => new Date(d.dueAt) < new Date());

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Hearings */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3.5 border-b border-border flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <GavelIcon className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">
              Audiências
              {hearings.length > 0 && (
                <span className="ml-1.5 text-xs font-normal text-muted-foreground">({hearings.length})</span>
              )}
            </span>
          </div>
          <Dialog open={hearingDialogOpen} onOpenChange={setHearingDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline"><PlusIcon />Nova</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nova audiência</DialogTitle></DialogHeader>
              <HearingForm caseId={caseId} onSuccess={() => setHearingDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {hearings.length === 0 ? (
          <div className="py-10 text-center">
            <GavelIcon className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">Nenhuma audiência registrada</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {hearings.map((h) => {
              const isPast = new Date(h.scheduledAt) < new Date();
              return (
              <div key={h.id} className="flex items-start justify-between px-4 py-3.5 gap-3 group hover:bg-muted/20 transition-colors">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${HEARING_KIND_COLORS[h.kind] ?? "bg-muted text-muted-foreground"}`}>
                      {getHearingKindLabel(h.kind)}
                    </span>
                    {isPast && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
                        Já realizada
                      </span>
                    )}
                  </div>
                  <div className={`flex items-center gap-1.5 text-sm font-medium ${isPast ? "text-muted-foreground" : "text-foreground"}`}>
                    <ClockIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    {formatDateTime(h.scheduledAt)}
                  </div>
                  {h.location && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPinIcon className="w-3 h-3 shrink-0" />
                      {h.location}
                    </div>
                  )}
                  {h.link && (
                    <a href={h.link} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-primary hover:underline">
                      <LinkIcon className="w-3 h-3 shrink-0" />
                      Link da audiência
                    </a>
                  )}
                  {h.notes && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{h.notes}</p>
                  )}
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon-sm"
                      aria-label="Excluir audiência"
                      className="shrink-0 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                      disabled={isDeletingHearing}>
                      <Trash2Icon />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remover audiência?</AlertDialogTitle>
                      <AlertDialogDescription>
                        {getHearingKindLabel(h.kind)} em {formatDateTime(h.scheduledAt)} será removida.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction variant="destructive" onClick={() => deleteHearing({ hearingId: h.id })}>
                        Remover
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Deadlines */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3.5 border-b border-border flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ClockIcon className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">
              Prazos
              {deadlines.length > 0 && (
                <span className="ml-1.5 text-xs font-normal text-muted-foreground">({deadlines.length})</span>
              )}
            </span>
            {overdueDeadlines.length > 0 && (
              <span className="flex items-center gap-1 text-xs font-medium text-destructive">
                <AlertCircleIcon className="w-3 h-3" />
                {overdueDeadlines.length} vencido{overdueDeadlines.length > 1 ? "s" : ""}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <DeadlineCalculator />
            <Dialog open={deadlineDialogOpen} onOpenChange={setDeadlineDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline"><PlusIcon />Novo</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Novo prazo</DialogTitle></DialogHeader>
                <DeadlineForm caseId={caseId} onSuccess={() => setDeadlineDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {deadlines.length === 0 ? (
          <div className="py-10 text-center">
            <ClockIcon className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">Nenhum prazo registrado</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {deadlines.map((d) => {
              const isDone = !!d.doneAt;
              const isOverdue = !isDone && new Date(d.dueAt) < new Date();
              return (
                <div key={d.id}
                  className={`flex items-center justify-between px-4 py-3 gap-3 group transition-colors ${isOverdue ? "bg-destructive/5 hover:bg-destructive/10" : "hover:bg-muted/20"}`}>
                  <button
                    type="button"
                    className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => handleToggleDone(d)}
                  >
                    {isDone ? (
                      <CheckCircle2Icon className="w-5 h-5 text-green-500" />
                    ) : (
                      <CircleIcon className={`w-5 h-5 ${isOverdue ? "text-destructive" : ""}`} />
                    )}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium ${isDone ? "line-through text-muted-foreground" : isOverdue ? "text-destructive" : "text-foreground"}`}>
                      {getDeadlineKindLabel(d.kind, d.customLabel)}
                    </p>
                    <p className={`text-xs mt-0.5 ${isOverdue ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                      {isOverdue ? "Vencido · " : ""}{formatDate(d.dueAt)}
                      {d.autoCalculatedFromHearingId && (
                        <span className="ml-1.5 text-muted-foreground/60">(automático)</span>
                      )}
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon-sm"
                        aria-label="Excluir prazo"
                        className="shrink-0 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                        disabled={isDeletingDeadline}>
                        <Trash2Icon />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent size="sm">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remover prazo?</AlertDialogTitle>
                        <AlertDialogDescription>
                          {getDeadlineKindLabel(d.kind, d.customLabel)} em {formatDate(d.dueAt)} será removido.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction variant="destructive" onClick={() => deleteDeadline({ deadlineId: d.id })}>
                          Remover
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
