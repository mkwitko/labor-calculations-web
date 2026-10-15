import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon, ChevronsUpDownIcon, CheckIcon, SearchIcon, UserIcon } from "lucide-react";
import { useCreateCase, getListCasesQueryKey } from "@/http/generated/case/case";
import { captureEvent } from "@/lib/analytics";
import { useListClients } from "@/http/generated/client/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { queryClient } from "@/lib/react-query";
import { toast } from "sonner";
import {
  ACTION_TYPE_LABELS,
  ALL_ACTION_TYPES,
  ALL_PHASES,
  CASE_PHASE_LABELS,
  type CasePhase,
} from "./utils/case-phase";
import { CurrencyInput } from "@/components/ui/currency-input";
import { CalculationPicker } from "./components/calculation-picker";

type FormState = {
  title: string;
  clientId: string;
  clientName: string;
  processNumber: string;
  court: string;
  vara: string;
  phase: CasePhase;
  actionType: string;
  valorCausa: string;
  observations: string;
  calculationId: string;
};

const DEFAULT_FORM: FormState = {
  title: "",
  clientId: "",
  clientName: "",
  processNumber: "",
  court: "",
  vara: "",
  phase: "pre_judicial",
  actionType: "",
  valorCausa: "",
  observations: "",
  calculationId: "",
};

function ClientPicker({
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

  function handleSelect(id: string, name: string) {
    onChange(id, name);
    setOpen(false);
    setSearch("");
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-lg border border-input bg-transparent px-3 h-9 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 hover:border-input/80"
        >
          {value ? (
            <span className="text-foreground">{selectedName}</span>
          ) : (
            <span className="text-muted-foreground">Selecionar cliente *</span>
          )}
          <ChevronsUpDownIcon className="w-4 h-4 text-muted-foreground shrink-0 ml-2" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-2" align="start">
        <div className="relative mb-2">
          <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar cliente..."
            className="pl-8 h-8 text-sm"
          />
        </div>
        <div className="max-h-56 overflow-y-auto space-y-0.5">
          {filtered.length === 0 ? (
            <p className="py-4 text-center text-xs text-muted-foreground">Nenhum cliente encontrado</p>
          ) : (
            filtered.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => handleSelect(c.id, c.name)}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md hover:bg-muted/60 transition-colors text-left"
              >
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <UserIcon className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                  {c.document && <p className="text-xs text-muted-foreground">{c.document}</p>}
                </div>
                {value === c.id && <CheckIcon className="w-3.5 h-3.5 text-primary shrink-0" />}
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default function NewCase() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);

  const { mutate: createCase, isPending } = useCreateCase({
    mutation: {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: getListCasesQueryKey() });
        captureEvent("case_created");
        toast("Caso criado com sucesso");
        navigate(`/cases/${data.id}`);
      },
      onError: () => toast.error("Erro ao criar caso"),
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.clientId) {
      toast.error("Selecione um cliente");
      return;
    }
    createCase({
      data: {
        title: form.title,
        clientId: form.clientId,
        processNumber: form.processNumber || undefined,
        court: form.court || undefined,
        vara: form.vara || undefined,
        phase: form.phase,
        actionType: (form.actionType || undefined) as never,
        valorCausa: form.valorCausa
          ? Number(form.valorCausa.replace(/\./g, "").replace(",", "."))
          : undefined,
        observations: form.observations || undefined,
        calculationId: form.calculationId || undefined,
      },
    });
  }

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  return (
    <div className="p-4 md:p-6 w-full space-y-6">
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon-sm" type="button" aria-label="Voltar" className="mt-0.5" onClick={() => navigate("/cases")}>
          <ArrowLeftIcon />
        </Button>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Novo Caso</h1>
          <p className="text-sm text-muted-foreground">
            Agrupe cálculos, acordos, audiências e documentos de um mesmo processo
          </p>
        </div>
      </div>

      {/* Largura total, como as outras telas de criação (o wizard de cálculo
          usa `w-full`). O `max-w-2xl` daqui era o único formulário estreito e
          quebrava a consistência. */}
      <form onSubmit={handleSubmit} className="w-full space-y-6">
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Identificação</h3>

          <div className="space-y-1.5">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              placeholder="Ex: João da Silva vs Empresa X"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>Cliente *</Label>
            <ClientPicker
              value={form.clientId}
              selectedName={form.clientName}
              // Trocar de cliente invalida o cálculo escolhido: ele pertencia à
              // outra pessoa.
              onChange={(id, name) =>
                setForm((f) => ({
                  ...f,
                  clientId: id,
                  clientName: name,
                  calculationId: "",
                }))
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label>Cálculo</Label>
            <CalculationPicker
              clientId={form.clientId}
              value={form.calculationId}
              onChange={(id) => set("calculationId", id)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="phase">Fase processual</Label>
              <Select value={form.phase} onValueChange={(v) => set("phase", v as CasePhase)}>
                <SelectTrigger id="phase"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ALL_PHASES.map((p) => (
                    <SelectItem key={p} value={p}>{CASE_PHASE_LABELS[p]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="actionType">Tipo de ação</Label>
              <Select
                value={form.actionType || undefined}
                onValueChange={(v) => set("actionType", v)}
              >
                <SelectTrigger id="actionType">
                  <SelectValue placeholder="Selecione (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {ALL_ACTION_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {ACTION_TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="valorCausa">Valor da causa (R$)</Label>
            <CurrencyInput
              id="valorCausa"
              placeholder="0,00"
              value={form.valorCausa}
              onChange={(e) => set("valorCausa", e.target.value)}
            />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Dados processuais</h3>

          <div className="space-y-1.5">
            <Label htmlFor="processNumber">Número do processo</Label>
            <Input
              id="processNumber"
              placeholder="0001234-56.2024.5.02.0001"
              value={form.processNumber}
              onChange={(e) => set("processNumber", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="court">Tribunal</Label>
              <Input
                id="court"
                placeholder="TRT 2ª Região"
                value={form.court}
                onChange={(e) => set("court", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="vara">Vara</Label>
              <Input
                id="vara"
                placeholder="1ª VT de São Paulo"
                value={form.vara}
                onChange={(e) => set("vara", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Observações</h3>
          <Textarea
            id="observations"
            rows={4}
            placeholder="Informações relevantes, estratégia, histórico..."
            value={form.observations}
            onChange={(e) => set("observations", e.target.value)}
          />
        </div>

        <div className="sticky bottom-0 z-10 -mx-4 md:-mx-6 -mb-4 md:-mb-6 flex items-center gap-3 border-t border-border bg-background/95 px-4 md:px-6 py-3 supports-[backdrop-filter]:backdrop-blur-sm">
          <Button type="button" variant="outline" onClick={() => navigate("/cases")}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending || !form.title.trim() || !form.clientId}>
            {isPending ? "Criando..." : "Criar Caso"}
          </Button>
        </div>
      </form>
    </div>
  );
}
