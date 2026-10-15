import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  AlertTriangleIcon,
  CreditCardIcon,
  CrownIcon,
  ExternalLinkIcon,
  Loader2Icon,
} from "lucide-react";

export function ActiveSection({
  status,
  currentPeriodEnd,
  cancelAtPeriodEnd,
  onPortal,
  isPortaling,
  getStatusConfig,
  planName,
  children,
}: {
  status: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean | null;
  onPortal: () => void;
  isPortaling: boolean;
  getStatusConfig: (s: string) => { label: string; className: string };
  /** Nome comercial do plano vigente, lido do Stripe. */
  planName?: string;
  /** A grade de troca de plano, montada por quem tem o id da organização. */
  children?: React.ReactNode;
}) {
  const statusCfg = getStatusConfig(status);

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center shrink-0">
              <CrownIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <p className="text-sm font-semibold text-foreground">
              {planName ? `Plano ${planName}` : "Plano LexLaboral"}
            </p>
          </div>
          <span
            className={cn(
              "text-xs font-medium px-2.5 py-1 rounded-full",
              statusCfg.className,
            )}
          >
            {statusCfg.label}
          </span>
        </div>

        <div className="px-5 divide-y divide-border">
          {currentPeriodEnd && (
            <div className="py-3.5 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {cancelAtPeriodEnd ? "Acesso até" : "Próxima cobrança"}
              </span>
              <span className="text-sm font-medium text-foreground">
                {new Date(currentPeriodEnd).toLocaleDateString("pt-BR")}
              </span>
            </div>
          )}
        </div>

        {cancelAtPeriodEnd && (
          <div className="px-5 py-3.5 bg-amber-50 dark:bg-amber-950/40 border-t border-amber-200 dark:border-amber-900 flex items-start gap-2.5">
            <AlertTriangleIcon className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 dark:text-amber-300">
              Sua assinatura está cancelada e expirará em{" "}
              {currentPeriodEnd
                ? new Date(currentPeriodEnd).toLocaleDateString("pt-BR")
                : "breve"}
              .
            </p>
          </div>
        )}
      </div>

      {/* O portal é hospedado pelo Stripe, então o clique tira a pessoa do app.
          Dizer o que há lá dentro e marcar a saída com o ícone evita o clique
          às cegas — e é lá, não aqui, que se troca cartão, baixa nota e
          cancela. */}
      <div className="bg-card border border-border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <CreditCardIcon className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">
              Pagamento e faturas
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Trocar o cartão, baixar as faturas, atualizar os dados de cobrança
              ou cancelar a assinatura.
            </p>
          </div>
        </div>

        <Button
          onClick={onPortal}
          disabled={isPortaling}
          className="gap-2 w-full sm:w-auto shrink-0"
        >
          {isPortaling ? (
            <>
              <Loader2Icon className="w-4 h-4 animate-spin" />
              Abrindo…
            </>
          ) : (
            <>
              Gerenciar assinatura
              <ExternalLinkIcon className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>

      {children}
    </div>
  );
}