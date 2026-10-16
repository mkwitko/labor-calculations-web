import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  getGetCaseQueryKey,
  getListCasesQueryKey,
  useUpdateCase,
} from "@/http/generated/case/case";
import { useListClients } from "@/http/generated/client/client";
import { GetCase200 } from "@/http/generated/labor-calculations-api.schemas";
import { queryClient } from "@/lib/react-query";
import { formatDate } from "@/utils/value-format";
import { CheckIcon, ChevronsUpDownIcon, PencilIcon, SearchIcon, UserIcon, XIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ALL_PHASES, CASE_PHASE_LABELS, type CasePhase } from "../../utils/case-phase";
import { CasePhaseBadge } from "../case-phase-badge";

type Props = {
  data: GetCase200;
};

function ClientPickerInline({
  value,
  selectedName,
  onChange,
}: {
  value: string;
  selectedName: string;
  onChange: (id: string, name: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { data } = useListClients({ limit: 100 });
  const clients = data?.data ?? [];
  const filtered = useMemo(() => {
    if (!search.trim()) return clients;
    const q = search.toLowerCase();
    return clients.filter((c) => c.name.toLowerCase().includes(q) || c.document?.includes(q));
  }, [clients, search]);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className="flex w-full items-center justify-between rounded-lg border border-input bg-transparent px-3 h-9 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 hover:border-input/80 transition-colors">
          {value ? <span className="text-foreground">{selectedName}</span> : <span className="text-muted-foreground">Selecionar cliente</span>}
          <ChevronsUpDownIcon className="w-4 h-4 text-muted-foreground ml-2 shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="start">
        <div className="relative mb-2">
          <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..." className="pl-8 h-8 text-sm" />
        </div>
        <div className="max-h-48 overflow-y-auto space-y-0.5">
          {filtered.length === 0 ? (
            <p className="py-3 text-center text-xs text-muted-foreground">Nenhum cliente</p>
          ) : (
            filtered.map((c) => (
              <button key={c.id} type="button" onClick={() => { onChange(c.id, c.name); setOpen(false); setSearch(""); }}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted/60 transition-colors text-left">
                <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <UserIcon className="w-3 h-3 text-muted-foreground" />
                </div>
                <span className="text-sm text-foreground truncate flex-1">{c.name}</span>
                {value === c.id && <CheckIcon className="w-3 h-3 text-primary shrink-0" />}
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

type EditForm = {
  title: string;
  clientId: string;
  clientName: string;
  processNumber: string;
  court: string;
  vara: string;
  phase: CasePhase;
  observations: string;
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-3.5 border-b border-border last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{children}</span>
    </div>
  );
}

export function SummaryTab({ data }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingObs, setEditingObs] = useState(false);
  const [obsText, setObsText] = useState(data.observations ?? "");
  const [form, setForm] = useState<EditForm>({
    title: data.title,
    clientId: data.client?.id ?? "",
    clientName: data.client?.name ?? "",
    processNumber: data.processNumber ?? "",
    court: data.court ?? "",
    vara: data.vara ?? "",
    phase: data.phase as CasePhase,
    observations: data.observations ?? "",
  });

  const { mutate: updateCase, isPending } = useUpdateCase({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCaseQueryKey(data.id) });
        queryClient.invalidateQueries({ queryKey: getListCasesQueryKey() });
        setIsEditing(false);
        setEditingObs(false);
        toast("Caso atualizado");
      },
      onError: () => toast.error("Erro ao atualizar caso"),
    },
  });

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    updateCase({
      caseId: data.id,
      data: {
        title: form.title,
        clientId: form.clientId || null,
        processNumber: form.processNumber || null,
        court: form.court || null,
        vara: form.vara || null,
        phase: form.phase,
        observations: form.observations || null,
      },
    });
  }

  function handleSaveObs() {
    updateCase({
      caseId: data.id,
      data: { observations: obsText || null },
    });
  }

  function startEditing() {
    setForm({
      title: data.title,
      clientId: data.client?.id ?? "",
      clientName: data.client?.name ?? "",
      processNumber: data.processNumber ?? "",
      court: data.court ?? "",
      vara: data.vara ?? "",
      phase: data.phase as CasePhase,
      observations: data.observations ?? "",
    });
    setIsEditing(true);
  }

  function set<K extends keyof EditForm>(key: K, value: EditForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Dados do Caso</h3>
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={startEditing}>
              <PencilIcon />
              Editar
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Cancelar"
                onClick={() => setIsEditing(false)}
              >
                <XIcon />
              </Button>
              <Button type="button" size="icon-sm" aria-label="Salvar" disabled={isPending} onClick={handleSave}>
                <CheckIcon />
              </Button>
            </div>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-title">Título *</Label>
              <Input
                id="edit-title"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Cliente</Label>
              <ClientPickerInline
                value={form.clientId}
                selectedName={form.clientName}
                onChange={(id, name) => setForm((f) => ({ ...f, clientId: id, clientName: name }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-phase">Fase processual</Label>
              <Select value={form.phase} onValueChange={(v) => set("phase", v as CasePhase)}>
                <SelectTrigger id="edit-phase">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALL_PHASES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {CASE_PHASE_LABELS[p]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-4">
              <Label htmlFor="edit-processNumber">Número do processo</Label>
              <Input
                id="edit-processNumber"
                value={form.processNumber}
                onChange={(e) => set("processNumber", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-4">
                <Label htmlFor="edit-court">Tribunal</Label>
                <Input
                  id="edit-court"
                  value={form.court}
                  onChange={(e) => set("court", e.target.value)}
                />
              </div>
              <div className="space-y-4">
                <Label htmlFor="edit-vara">Vara</Label>
                <Input
                  id="edit-vara"
                  value={form.vara}
                  onChange={(e) => set("vara", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-4">
              <Label htmlFor="edit-obs">Observações</Label>
              <Textarea
                id="edit-obs"
                rows={3}
                value={form.observations}
                onChange={(e) => set("observations", e.target.value)}
              />
            </div>
          </form>
        ) : (
          <>
            <Field label="Título">{data.title}</Field>
            <Field label="Fase processual">
              <CasePhaseBadge phase={data.phase} />
            </Field>
            <Field label="Número do processo">
              {data.processNumber ?? <span className="text-muted-foreground italic">—</span>}
            </Field>
            <Field label="Tribunal">
              {data.court ?? <span className="text-muted-foreground italic">—</span>}
            </Field>
            <Field label="Vara">
              {data.vara ?? <span className="text-muted-foreground italic">—</span>}
            </Field>
            <Field label="Cliente">
              {data.client?.name ?? <span className="text-muted-foreground italic">—</span>}
            </Field>
            <Field label="Abertura">{formatDate(data.openedAt)}</Field>
            <Field label="Atualizado em">{formatDate(data.updatedAt)}</Field>
          </>
        )}
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Observações</h3>
          {!editingObs ? (
            <Button variant="outline" size="sm" onClick={() => { setObsText(data.observations ?? ""); setEditingObs(true); }}>
              <PencilIcon />
              Editar
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button type="button" variant="ghost" size="icon-sm" aria-label="Cancelar" onClick={() => setEditingObs(false)}>
                <XIcon />
              </Button>
              <Button type="button" size="icon-sm" aria-label="Salvar" disabled={isPending} onClick={handleSaveObs}>
                <CheckIcon />
              </Button>
            </div>
          )}
        </div>
        {editingObs ? (
          <Textarea
            rows={6}
            value={obsText}
            onChange={(e) => setObsText(e.target.value)}
            placeholder="Informações relevantes, estratégia, histórico..."
            autoFocus
          />
        ) : data.observations ? (
          <p className="text-sm text-foreground whitespace-pre-wrap">{data.observations}</p>
        ) : (
          <p className="text-sm text-muted-foreground italic">Nenhuma observação. Clique em editar para adicionar.</p>
        )}
      </div>
    </div>
  );
}
