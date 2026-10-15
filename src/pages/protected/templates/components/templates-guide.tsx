import { useState } from "react";
import {
  ChevronDownIcon,
  DownloadIcon,
  FileUpIcon,
  SparklesIcon,
  TypeIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "LexLaboral:templates-guide-open";

const STEPS = [
  {
    icon: DownloadIcon,
    title: "Comece de um modelo pronto",
    body: (
      <>
        Baixe um <strong>Template do Sistema</strong> (ícone de download no card)
        para usar como ponto de partida — ou crie um arquivo{" "}
        <code className="font-mono text-xs">.docx</code> novo no Word.
      </>
    ),
  },
  {
    icon: TypeIcon,
    title: "Marque onde entram os dados",
    body: (
      <>
        No documento, escreva o campo <strong>entre chaves</strong> onde quer que
        o valor apareça. Ex:{" "}
        <code className="font-mono text-xs bg-muted rounded px-1 py-0.5">
          Reclamante: {"{clientName}"}
        </code>{" "}
        vira <em>“Reclamante: Maria Silva”</em> ao gerar. Veja todos os campos em{" "}
        <strong>“Referência de Placeholders”</strong>.
      </>
    ),
  },
  {
    icon: FileUpIcon,
    title: "Envie o arquivo",
    body: (
      <>
        Clique em <strong>“Novo Template”</strong>, dê um nome, escolha o tipo e
        anexe seu <code className="font-mono text-xs">.docx</code>. Conferimos os
        campos na hora e avisamos se algum estiver inválido.
      </>
    ),
  },
  {
    icon: SparklesIcon,
    title: "Gere o documento",
    body: (
      <>
        Abra um cálculo → botão <strong>“Exportar”</strong> → escolha o modelo. Os
        campos são preenchidos automaticamente com os dados do cálculo e o{" "}
        <code className="font-mono text-xs">.docx</code> baixa pronto.
      </>
    ),
  },
];

export function TemplatesGuide() {
  const [open, setOpen] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) !== "false";
    } catch {
      return true;
    }
  });

  const toggle = () => {
    setOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-muted/30 transition-colors"
      >
        <span className="text-sm font-semibold text-foreground">
          Como usar templates
        </span>
        <ChevronDownIcon
          className={cn(
            "w-4 h-4 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="border-t border-border px-4 py-4">
          <ol className="grid gap-4 sm:grid-cols-2">
            {STEPS.map((step, i) => (
              <li key={step.title} className="flex gap-3">
                <div className="flex flex-col items-center shrink-0">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <step.icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <p className="text-sm font-medium text-foreground">{step.title}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <p className="mt-4 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
            <strong className="text-foreground">Dica:</strong> os campos entre
            chaves não são digitados pelo cliente — o sistema troca cada{" "}
            <code className="font-mono">{"{campo}"}</code> pelo dado real do
            cálculo no momento de gerar o documento.
          </p>
        </div>
      )}
    </div>
  );
}
