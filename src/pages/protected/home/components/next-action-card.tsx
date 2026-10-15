import {
  AlertTriangleIcon,
  ArrowRightIcon,
  CalculatorIcon,
  PlayCircleIcon,
  RocketIcon,
  RotateCcwIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useGetDashboardNextAction } from "@/http/generated/dashboard/dashboard";

// O cartão que nunca desaparece do painel: sempre uma próxima ação, decidida
// no servidor. Substituiu o checklist "Primeiros passos", que sumia quando os
// quatro passos fechavam e deixava o segundo dia de um usuário novo sem nada
// para fazer.
const PHASE_STYLE = {
  setup: { icon: RocketIcon, cta: "Começar", label: "Primeiros passos" },
  attention: {
    icon: AlertTriangleIcon,
    cta: "Resolver",
    label: "Precisa de você agora",
  },
  resume: {
    icon: RotateCcwIcon,
    cta: "Continuar",
    label: "De onde você parou",
  },
  idle: { icon: CalculatorIcon, cta: "Começar", label: "Próximo passo" },
} as const;

export function NextActionCard() {
  // O queryClient do app desliga `refetchOnMount` por padrão
  // (src/lib/react-query.ts). Para este cartão isso é errado: ele é um resumo
  // derivado de cliente, cálculo, caso, perfil e pendência, e servir cache
  // deixava o painel pedindo "cadastre o primeiro cliente" depois de o cliente
  // já existir. Invalidar em cada ponto de escrita não cobriria convite aceito
  // nem trabalho de outro membro da organização.
  const { data } = useGetDashboardNextAction({
    query: { refetchOnMount: "always" },
  });

  if (!data) return null;

  const style = PHASE_STYLE[data.phase];
  const Icon = style.icon;
  const pct = data.progress
    ? Math.round((data.progress.completed / data.progress.total) * 100)
    : null;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">
            {style.label}
          </h3>
        </div>
        {data.progress && (
          <span className="text-xs text-muted-foreground">
            {data.progress.completed} de {data.progress.total}
          </span>
        )}
      </div>

      {pct !== null && (
        <div className="px-5 pt-3">
          <Progress value={pct} className="h-1.5" />
        </div>
      )}

      <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">{data.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{data.hint}</p>
        </div>
        <Button asChild size="sm" className="shrink-0">
          <Link to={data.to}>
            {style.cta}
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </Link>
        </Button>
      </div>

      {/* Só na fase setup: quem já tem trabalho no sistema não precisa de
          demonstração, e o link competiria com a ação real. */}
      {data.phase === "setup" && (
        <div className="px-5 py-3 border-t border-border bg-muted/30">
          <Link
            to="/ajuda/exemplo"
            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
          >
            <PlayCircleIcon className="w-3.5 h-3.5" />
            Ver um caso de exemplo antes de começar
          </Link>
        </div>
      )}
    </div>
  );
}
