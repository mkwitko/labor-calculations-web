import {
  BriefcaseIcon,
  CalendarIcon,
  ClockIcon,
  FileTextIcon,
  Loader2Icon,
  MapPinIcon,
  VideoIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useGetClientDashboard } from "@/http/generated/client-portal/client-portal";
import { formatDate, formatDateTime, getHearingKindLabel } from "@/utils/value-format";
import { PhaseStepper } from "./components/phase-stepper";
import { QuickActions } from "./components/quick-actions";

function StatCard({ icon: Icon, label, value, sub }: { icon: React.ElementType; label: string; value: string | number; sub?: string }) {
  return (
    <Card size="sm">
      <CardContent className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-semibold text-foreground">{value}</p>
          {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

const EVENT_ICONS: Record<string, React.ElementType> = {
  processo_iniciado: BriefcaseIcon,
  audiencia_marcada: CalendarIcon,
  documento_enviado: FileTextIcon,
  status_atualizado: ClockIcon,
};

export default function PortalDashboard() {
  const { data, isLoading } = useGetClientDashboard();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2Icon className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) return null;

  const docPercent = data.stats.totalDocuments > 0
    ? Math.round(((data.stats.totalDocuments - data.stats.pendingDocuments) / data.stats.totalDocuments) * 100)
    : 0;

  return (
    <div className="px-6 py-10 max-w-7xl mx-auto w-full space-y-8 pb-24 lg:pb-10">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Olá, {data.client.name} 👋
        </h2>
        <p className="text-sm text-muted-foreground">
          Aqui você acompanha tudo sobre o seu processo — de forma simples e a
          qualquer hora.
        </p>
      </div>

      {/* Quick actions */}
      <QuickActions caseId={data.case?.id} />

      {/* Process phase stepper */}
      {data.case && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BriefcaseIcon className="w-4 h-4 text-muted-foreground" />
              Em que etapa está o meu processo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PhaseStepper phase={data.case.phase} />
          </CardContent>
        </Card>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={FileTextIcon}
          label="Documentos pendentes"
          value={data.stats.pendingDocuments}
          sub={`${data.stats.totalDocuments} total`}
        />
        <StatCard
          icon={BriefcaseIcon}
          label="Notificações não lidas"
          value={data.stats.unreadNotifications}
        />
        <StatCard
          icon={ClockIcon}
          label="Progresso documentos"
          value={`${docPercent}%`}
          sub={`${data.stats.totalDocuments - data.stats.pendingDocuments} de ${data.stats.totalDocuments} enviados`}
        />
      </div>

      {/* Case card */}
      {data.case && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BriefcaseIcon className="w-4 h-4 text-muted-foreground" />
              Meu Processo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-base font-semibold text-foreground">{data.case.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary">{data.case.phase}</Badge>
                  {data.case.processNumber && (
                    <span className="text-xs text-muted-foreground">{data.case.processNumber}</span>
                  )}
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate(`/portal/casos/${data.case!.id}`)}>
                Ver detalhes
              </Button>
            </div>

            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>Advogado: <span className="text-foreground font-medium">{data.case.lawyer.name}</span></span>
              <span className="text-slate-300 dark:text-slate-600">·</span>
              <span>OAB {data.case.lawyer.oabNumber}</span>
            </div>

            {/* Document progress */}
            {data.stats.totalDocuments > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Documentos</span>
                  <span className="font-medium text-foreground">{docPercent}%</span>
                </div>
                <Progress value={docPercent} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Next hearing */}
      {data.nextHearing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-muted-foreground" />
              Próxima audiência
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <CalendarIcon className="w-5 h-5 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">
                  {getHearingKindLabel(data.nextHearing.kind)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDateTime(data.nextHearing.scheduledAt)}
                </p>
                {data.nextHearing.location && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPinIcon className="w-3 h-3" />
                    {data.nextHearing.location}
                  </div>
                )}
                {data.nextHearing.link && (
                  <a
                    href={data.nextHearing.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                  >
                    <VideoIcon className="w-3 h-3" />
                    Link da audiência
                  </a>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent events */}
      {data.recentEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4 text-muted-foreground" />
              Atividades recentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recentEvents.map((event) => {
              const Icon = EVENT_ICONS[event.type] ?? ClockIcon;
              return (
                <div key={event.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{event.title}</p>
                    {event.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{event.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground/70 mt-1">{formatDate(event.date)}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
