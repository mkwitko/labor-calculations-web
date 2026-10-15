import { useEffect } from "react";
import {
  isRouteErrorResponse,
  useNavigate,
  useRouteError,
} from "react-router-dom";
import { HomeIcon, RefreshCwIcon, TriangleAlertIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sentry } from "@/lib/sentry";

// Catches render/loader errors that React Router would otherwise swallow into a
// blank screen, reports them to Sentry, and shows a recoverable fallback.
export function RouteErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  useEffect(() => {
    // 404s and other route responses are expected — don't report them.
    if (!isRouteErrorResponse(error)) {
      Sentry.captureException(error);
    }
  }, [error]);

  const is404 = isRouteErrorResponse(error) && error.status === 404;

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
        <TriangleAlertIcon className="h-6 w-6 text-destructive" />
      </div>
      <div>
        <h1 className="text-lg font-semibold text-foreground">
          {is404 ? "Página não encontrada" : "Algo deu errado"}
        </h1>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          {is404
            ? "O endereço acessado não existe ou foi movido."
            : "Ocorreu um erro inesperado. A equipe já foi notificada. Tente novamente."}
        </p>
      </div>
      <div className="flex gap-2">
        {!is404 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
          >
            <RefreshCwIcon />
            Tentar novamente
          </Button>
        )}
        <Button size="sm" onClick={() => navigate("/home")}>
          <HomeIcon />
          Voltar ao início
        </Button>
      </div>
    </div>
  );
}
