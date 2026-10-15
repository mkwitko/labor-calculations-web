import { CalendarCheckIcon, Loader2Icon } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  getGetGoogleCalendarStatusQueryKey,
  useDisconnectGoogleCalendar,
  useGetGoogleAuthUrl,
  useGetGoogleCalendarStatus,
  useUpdateGoogleCalendarPrefs,
} from "@/http/generated/integration/integration";
import { queryClient } from "@/lib/react-query";

// Google Calendar integration card: connect via OAuth, toggle sync, disconnect.
export function GoogleCalendarCard() {
  const { data: status } = useGetGoogleCalendarStatus();
  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: getGetGoogleCalendarStatusQueryKey(),
    });

  const { refetch: getAuthUrl, isFetching: gettingUrl } = useGetGoogleAuthUrl({
    query: { enabled: false },
  });
  const { mutateAsync: updatePrefs } = useUpdateGoogleCalendarPrefs({
    mutation: { onSuccess: invalidate },
  });
  const { mutateAsync: disconnect } = useDisconnectGoogleCalendar({
    mutation: { onSuccess: invalidate },
  });

  // Surface the callback result (?google=connected|error) once.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("google");
    if (p === "connected") {
      toast.success("Google Calendar conectado");
      invalidate();
      window.history.replaceState({}, "", window.location.pathname);
    } else if (p === "error") {
      toast.error("Não foi possível conectar o Google Calendar");
      window.history.replaceState({}, "", window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const connect = async () => {
    const { data } = await getAuthUrl();
    if (data?.url) window.location.href = data.url;
    else toast.error("Integração não configurada no servidor");
  };

  if (!status) return null;

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center shrink-0">
          <CalendarCheckIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">
            Google Calendar
          </p>
          <p className="text-xs text-muted-foreground">
            Sincronize audiências e prazos com o seu calendário do Google.
          </p>
        </div>
        {status.connected ? (
          <span className="text-xs font-medium text-green-600 dark:text-green-400">
            Conectado
          </span>
        ) : null}
      </div>

      {!status.configured && (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          A integração ainda não foi configurada no servidor.
        </p>
      )}

      {status.connected ? (
        <>
          {status.email && (
            <p className="text-xs text-muted-foreground">
              Conta: <span className="text-foreground">{status.email}</span>
            </p>
          )}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Sincronizar audiências</Label>
              <Switch
                checked={status.syncHearings}
                onCheckedChange={(v) => updatePrefs({ data: { syncHearings: v } })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">Sincronizar prazos</Label>
              <Switch
                checked={status.syncDeadlines}
                onCheckedChange={(v) =>
                  updatePrefs({ data: { syncDeadlines: v } })
                }
              />
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await disconnect();
              toast("Google Calendar desconectado");
            }}
          >
            Desconectar
          </Button>
        </>
      ) : (
        <Button
          size="sm"
          onClick={connect}
          disabled={!status.configured || gettingUrl}
        >
          {gettingUrl ? (
            <Loader2Icon className="w-4 h-4 animate-spin" />
          ) : (
            <CalendarCheckIcon className="w-4 h-4" />
          )}
          Conectar Google Calendar
        </Button>
      )}
    </div>
  );
}
