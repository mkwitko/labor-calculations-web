import { CalculatorIcon, FileTextIcon, FolderIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ACTIONS = [
  {
    label: "Meus documentos",
    desc: "Ver e enviar arquivos",
    icon: FileTextIcon,
    to: (caseId?: string) => (caseId ? `/portal/casos/${caseId}` : "/portal/inicio"),
    color: "text-blue-600 bg-blue-100 dark:bg-blue-950 dark:text-blue-400",
  },
  {
    label: "Valores da causa",
    desc: "Ver o cálculo",
    icon: CalculatorIcon,
    to: () => "/portal/calculos",
    color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-400",
  },
  {
    label: "Meu processo",
    desc: "Andamento completo",
    icon: FolderIcon,
    to: (caseId?: string) => (caseId ? `/portal/casos/${caseId}` : "/portal/inicio"),
    color: "text-purple-600 bg-purple-100 dark:bg-purple-950 dark:text-purple-400",
  },
];

export function QuickActions({ caseId }: { caseId?: string }) {
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {ACTIONS.map((a) => {
        const Icon = a.icon;
        return (
          <button
            key={a.label}
            type="button"
            onClick={() => navigate(a.to(caseId))}
            className="flex items-center gap-3 bg-card border border-border rounded-xl p-4 text-left hover:border-primary/40 transition-colors"
          >
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${a.color}`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{a.label}</p>
              <p className="text-xs text-muted-foreground">{a.desc}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
