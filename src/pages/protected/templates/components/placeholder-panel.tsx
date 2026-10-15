import { CheckIcon, CopyIcon, SearchIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useListTemplatePlaceholders } from "@/http/generated/document-template/document-template";
import type { ListTemplatePlaceholders200PlaceholdersItem } from "@/http/generated/lexlaboral-server.schemas";

const GROUP_LABELS: Record<string, string> = {
  cliente: "Cliente",
  contrato: "Contrato",
  verbas: "Verbas",
  liquidacao: "Liquidação",
  caso: "Caso",
  advogado: "Advogado",
  sistema: "Sistema",
};

const GROUP_ORDER = [
  "cliente",
  "contrato",
  "verbas",
  "liquidacao",
  "caso",
  "advogado",
  "sistema",
];

// Placeholder reference panel sourced from the backend registry (single source
// of truth). Supports search and click-to-copy of the {placeholder} tag.
export function PlaceholderPanel({ docType }: { docType?: string }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const { data, isLoading } = useListTemplatePlaceholders({
    query: { enabled: open },
  });

  const required = useMemo(
    () => new Set(docType ? (data?.requiredByType[docType] ?? []) : []),
    [data, docType],
  );

  const grouped = useMemo(() => {
    const placeholders = data?.placeholders ?? [];
    const q = query.trim().toLowerCase();
    const filtered = q
      ? placeholders.filter(
        (p) =>
          p.key.toLowerCase().includes(q) ||
          p.label.toLowerCase().includes(q),
      )
      : placeholders;

    const byGroup = new Map<
      string,
      ListTemplatePlaceholders200PlaceholdersItem[]
    >();
    for (const p of filtered) {
      const list = byGroup.get(p.group) ?? [];
      list.push(p);
      byGroup.set(p.group, list);
    }
    return GROUP_ORDER.filter((g) => byGroup.has(g)).map((g) => ({
      group: g,
      label: GROUP_LABELS[g] ?? g,
      items: byGroup.get(g) ?? [],
    }));
  }, [data, query]);

  const copy = (key: string) => {
    navigator.clipboard.writeText(`{${key}}`);
    setCopied(key);
    setTimeout(() => setCopied(null), 1200);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Referência de Placeholders
        </Button>
      </DialogTrigger>
      <DialogContent className="lg:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Placeholders Disponíveis</DialogTitle>
          <DialogDescription>
            Clique em um campo para copiar a tag. Use no .docx com a sintaxe{" "}
            <code className="font-mono">{`{placeholder}`}</code>.
            {docType && required.size > 0 && (
              <> Campos marcados com ✱ são obrigatórios para este tipo.</>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="relative mb-2">
          <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar campo..."
            className="pl-8"
          />
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground py-4">Carregando...</p>
        ) : (
          <div className="space-y-4 py-1">
            {grouped.map((g) => (
              <div key={g.group}>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                  {g.label}
                </p>
                <div className="flex flex-col gap-1">
                  {g.items.map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => copy(p.key)}
                      className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-md hover:bg-muted text-left group"
                      title={p.description}
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        <code className="px-1.5 py-0.5 text-xs rounded bg-muted text-foreground font-mono shrink-0">
                          {`{${p.key}}`}
                        </code>
                        <span className="text-xs text-muted-foreground truncate">
                          {p.label}
                          {required.has(p.key) && (
                            <span className="text-destructive ml-0.5">✱</span>
                          )}
                        </span>
                      </span>
                      {copied === p.key ? (
                        <CheckIcon className="w-3.5 h-3.5 text-green-600 shrink-0" />
                      ) : (
                        <CopyIcon className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {grouped.length === 0 && (
              <p className="text-sm text-muted-foreground py-4">
                Nenhum campo encontrado.
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
