import { ConfirmButton } from "@/components/confirm-button";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  getGetCaseTimelineQueryKey,
  useGetCaseTimeline,
} from "@/http/generated/case/case";
import type {
  GetCaseTimeline200DataItem,
  ListNotes200Item,
} from "@/http/generated/lexlaboral-server.schemas";
import { GetCaseTimeline200DataItemKind } from "@/http/generated/lexlaboral-server.schemas";
import {
  getListNotesQueryKey,
  useCreateNote,
  useDeleteNote,
  useListNotes,
  useUpdateNote,
} from "@/http/generated/note/note";
import { queryClient } from "@/lib/react-query";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowRightLeftIcon, BriefcaseIcon, CalculatorIcon, CalendarIcon, CheckIcon, ClockIcon,
  FileMinusIcon, FilePenLineIcon, FileUpIcon,
  FileXIcon, HandshakeIcon, Loader2Icon, PencilIcon, PlusIcon, StickyNoteIcon, TrashIcon, XIcon
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  caseId: string;
};

const KIND_LABELS: Record<GetCaseTimeline200DataItemKind, string> = {
  case_created: "Caso criado",
  case_phase_changed: "Fase alterada",
  calc_linked: "Cálculo vinculado",
  calc_unlinked: "Cálculo desvinculado",
  settlement_updated: "Acordo atualizado",
  doc_uploaded: "Documento adicionado",
  doc_deleted: "Documento removido",
  hearing_created: "Audiência agendada",
  deadline_created: "Prazo criado",
  deadline_done: "Prazo concluído",
  note_created: "Nota adicionada",
  note_updated: "Nota editada",
  note_deleted: "Nota removida",
};

const KIND_ICON: Record<GetCaseTimeline200DataItemKind, React.ElementType> = {
  case_created: BriefcaseIcon,
  case_phase_changed: ArrowRightLeftIcon,
  calc_linked: CalculatorIcon,
  calc_unlinked: CalculatorIcon,
  settlement_updated: HandshakeIcon,
  doc_uploaded: FileUpIcon,
  doc_deleted: FileXIcon,
  hearing_created: CalendarIcon,
  deadline_created: ClockIcon,
  deadline_done: CheckIcon,
  note_created: StickyNoteIcon,
  note_updated: FilePenLineIcon,
  note_deleted: FileMinusIcon,
};

function NoteItem({
  note,
  caseId,
}: {
  note: ListNotes200Item;
  caseId: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(note.body);

  const { mutate: updateNote, isPending: isUpdating } = useUpdateNote({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListNotesQueryKey(caseId) });
        queryClient.invalidateQueries({ queryKey: getGetCaseTimelineQueryKey(caseId) });
        setEditing(false);
        toast("Nota atualizada");
      },
      onError: () => toast.error("Erro ao atualizar nota"),
    },
  });

  const { mutate: deleteNote, isPending: isDeleting } = useDeleteNote({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListNotesQueryKey(caseId) });
        queryClient.invalidateQueries({ queryKey: getGetCaseTimelineQueryKey(caseId) });
        toast("Nota removida");
      },
      onError: () => toast.error("Erro ao remover nota"),
    },
  });

  const handleSave = () => {
    if (!draft.trim()) return;
    updateNote({ caseId, noteId: note.id, data: { body: draft.trim() } });
  };

  const handleCancel = () => {
    setDraft(note.body);
    setEditing(false);
  };

  return (
    <div className="border border-border rounded-lg p-4 space-y-2">
      {editing ? (
        <>
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="min-h-[100px] text-sm resize-none"
            autoFocus
          />
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isUpdating || !draft.trim()}
            >
              {isUpdating ? (
                <Loader2Icon className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckIcon className="w-3.5 h-3.5" />
              )}
              Salvar
            </Button>
            <Button size="sm" variant="ghost" onClick={handleCancel} disabled={isUpdating}>
              <XIcon className="w-3.5 h-3.5" />
              Cancelar
            </Button>
          </div>
        </>
      ) : (
        <>
          <p className="text-sm text-foreground whitespace-pre-wrap">{note.body}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(note.createdAt), {
                addSuffix: true,
                locale: ptBR,
              })}
              {note.updatedAt !== note.createdAt && " · editada"}
            </span>
            <div className="flex items-center gap-1">
              <Button
                size="icon-sm"
                variant="ghost"
                aria-label="Editar nota"
                onClick={() => setEditing(true)}
                disabled={isDeleting}
              >
                <PencilIcon className="w-3.5 h-3.5" />
              </Button>
              <ConfirmButton
                size="icon-sm"
                variant="ghost"
                disabled={isDeleting}
                className="text-destructive hover:text-destructive"
                tooltip="Excluir nota"
                title="Excluir nota?"
                description="Esta nota será excluída permanentemente."
                confirmLabel="Excluir"
                onConfirm={() => deleteNote({ caseId, noteId: note.id })}
              >
                {isDeleting ? (
                  <Loader2Icon className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <TrashIcon className="w-3.5 h-3.5" />
                )}
              </ConfirmButton>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function TimelineItem({ item }: { item: GetCaseTimeline200DataItem }) {
  const Icon = KIND_ICON[item.kind];
  const label = KIND_LABELS[item.kind];

  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.75} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">
          {item.user.name} ·{" "}
          {formatDistanceToNow(new Date(item.createdAt), {
            addSuffix: true,
            locale: ptBR,
          })}
        </p>
      </div>
    </div>
  );
}

export function NotesTab({ caseId }: Props) {
  const [newNote, setNewNote] = useState("");
  const [showForm, setShowForm] = useState(false);

  const { data: notes, isLoading: notesLoading } = useListNotes(caseId);
  const { data: timeline, isLoading: timelineLoading } = useGetCaseTimeline(caseId, undefined);

  const { mutate: createNote, isPending: isCreating } = useCreateNote({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListNotesQueryKey(caseId) });
        queryClient.invalidateQueries({ queryKey: getGetCaseTimelineQueryKey(caseId) });
        setNewNote("");
        setShowForm(false);
        toast("Nota adicionada");
      },
      onError: () => toast.error("Erro ao adicionar nota"),
    },
  });

  const handleCreate = () => {
    if (!newNote.trim()) return;
    createNote({ caseId, data: { body: newNote.trim() } });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Notes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Notas</h3>
          {!showForm && (
            <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
              <PlusIcon className="w-3.5 h-3.5" />
              Nova nota
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Nota interna do escritório. O cliente não vê — para falar com ele, use
          Mensagens.
        </p>

        {showForm && (
          <div className="border border-border rounded-lg p-4 space-y-3">
            <Textarea
              placeholder="Escreva sua nota aqui..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="min-h-[120px] text-sm resize-none"
              autoFocus
            />
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleCreate}
                disabled={isCreating || !newNote.trim()}
              >
                {isCreating ? (
                  <Loader2Icon className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <PlusIcon className="w-3.5 h-3.5" />
                )}
                Adicionar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowForm(false);
                  setNewNote("");
                }}
                disabled={isCreating}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {notesLoading ? (
          <div className="flex items-center justify-center h-24">
            <Loader2Icon className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : !notes?.length ? (
          <div className="flex flex-col items-center justify-center h-24 text-center">
            <p className="text-sm text-muted-foreground">Nenhuma nota ainda.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <NoteItem key={note.id} note={note} caseId={caseId} />
            ))}
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Atividade</h3>

        {timelineLoading ? (
          <div className="flex items-center justify-center h-24">
            <Loader2Icon className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : !timeline?.data?.length ? (
          <div className="flex flex-col items-center justify-center h-24 text-center">
            <p className="text-sm text-muted-foreground">Nenhuma atividade ainda.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {timeline.data.map((item) => (
              <TimelineItem key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
