import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/use-subscription";
import { ClockIcon, LockIcon, SparklesIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

function TrialBanner({ daysLeft }: { daysLeft: number }) {
  const navigate = useNavigate();
  const urgent = daysLeft <= 3;

  const colors = urgent
    ? {
      bg: "bg-amber-50 dark:bg-amber-950/40",
      border: "border-amber-200 dark:border-amber-900",
      icon: "text-amber-600 dark:text-amber-400",
      text: "text-amber-800 dark:text-amber-300",
    }
    : {
      bg: "bg-blue-50 dark:bg-blue-950/40",
      border: "border-blue-200 dark:border-blue-900",
      icon: "text-blue-600 dark:text-blue-400",
      text: "text-blue-800 dark:text-blue-300",
    };

  const message =
    daysLeft === 0
      ? "Seu teste gratuito expira hoje!"
      : `${daysLeft} dia${daysLeft > 1 ? "s" : ""} restante${daysLeft > 1 ? "s" : ""} no teste gratuito`;

  return (
    <div
      className={`flex items-center justify-between gap-3 px-4 py-2.5 ${colors.bg} border-b ${colors.border}`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <ClockIcon className={`w-4 h-4 shrink-0 ${colors.icon}`} />
        <p className={`text-xs font-medium truncate ${colors.text}`}>
          {message}
        </p>
      </div>
      <Button
        size="sm"
        variant={urgent ? "default" : "outline"}
        className="shrink-0 text-xs h-7"
        onClick={() => navigate("/billing")}
      >
        Assinar agora
      </Button>
    </div>
  );
}

function ExpiredBlock() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 p-8 text-center">
      <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-950 flex items-center justify-center">
        <LockIcon className="w-7 h-7 text-red-600 dark:text-red-400" />
      </div>
      <div className="max-w-xs">
        <h3 className="text-base font-semibold text-foreground">
          Seu acesso expirou
        </h3>
        <p className="text-sm text-muted-foreground mt-1.5">
          Seu período de teste ou assinatura terminou. Assine um plano para
          continuar usando o LexLaboral.
        </p>
      </div>
      <Button onClick={() => navigate("/billing")}>Ver Planos</Button>
    </div>
  );
}

function NoSubscriptionBlock() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 p-8 text-center">
      <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center">
        <SparklesIcon className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
      </div>
      <div className="max-w-xs">
        <h3 className="text-base font-semibold text-foreground">
          Acesso Premium Necessário
        </h3>
        <p className="text-sm text-muted-foreground mt-1.5">
          Seu período de teste expirou. Assine um plano para continuar usando o
          LexLaboral.
        </p>
      </div>
      <Button onClick={() => navigate("/billing")}>Ver Planos</Button>
    </div>
  );
}

export function SubscriptionGate({ children }: { children: ReactNode }) {
  const { isSubscribed, isTrial, isExpired, trialDaysLeft, isLoading } =
    useSubscription();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (isExpired) return <ExpiredBlock />;

  if (!isSubscribed) return <NoSubscriptionBlock />;

  return (
    <>
      {isTrial && trialDaysLeft !== null && (
        <TrialBanner daysLeft={trialDaysLeft} />
      )}
      {children}
    </>
  );
}
