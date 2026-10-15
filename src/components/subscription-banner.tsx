import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/use-subscription";
import { AlertTriangleIcon, ClockIcon } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export function SubscriptionBanner() {
  const {
    isLoading,
    isActive,
    isTrial,
    isExpired,
    hasNoSubscription,
    trialDaysLeft,
    cancelAtPeriodEnd,
    currentPeriodEnd,
  } = useSubscription();

  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (isLoading || pathname.startsWith("/billing")) return null;

  if (isTrial && trialDaysLeft !== null) {
    return <TrialBar daysLeft={trialDaysLeft} onNavigate={navigate} />;
  }

  if (isExpired || hasNoSubscription) {
    return <ExpiredBar onNavigate={navigate} />;
  }

  if (isActive && cancelAtPeriodEnd && currentPeriodEnd) {
    return (
      <CancellingBar
        endDate={new Date(currentPeriodEnd).toLocaleDateString("pt-BR")}
        onNavigate={navigate}
      />
    );
  }

  return null;
}

function TrialBar({
  daysLeft,
  onNavigate,
}: {
  daysLeft: number;
  onNavigate: (path: string) => void;
}) {
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
      className={`flex items-center justify-between gap-3 px-4 py-2 ${colors.bg} border-b ${colors.border}`}
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
        onClick={() => onNavigate("/billing")}
      >
        Assinar agora
      </Button>
    </div>
  );
}

function ExpiredBar({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2 bg-red-50 dark:bg-red-950/40 border-b border-red-200 dark:border-red-900">
      <div className="flex items-center gap-2 min-w-0">
        <AlertTriangleIcon className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
        <p className="text-xs font-medium truncate text-red-800 dark:text-red-300">
          Seu acesso expirou. Assine para continuar usando o LexLaboral.
        </p>
      </div>
      <Button
        size="sm"
        className="shrink-0 text-xs h-7"
        onClick={() => onNavigate("/billing")}
      >
        Ver Planos
      </Button>
    </div>
  );
}

function CancellingBar({
  endDate,
  onNavigate,
}: {
  endDate: string;
  onNavigate: (path: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900">
      <div className="flex items-center gap-2 min-w-0">
        <AlertTriangleIcon className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <p className="text-xs font-medium truncate text-amber-800 dark:text-amber-300">
          Assinatura cancelada. Acesso até {endDate}.
        </p>
      </div>
      <Button
        size="sm"
        variant="outline"
        className="shrink-0 text-xs h-7"
        onClick={() => onNavigate("/billing")}
      >
        Reativar
      </Button>
    </div>
  );
}
