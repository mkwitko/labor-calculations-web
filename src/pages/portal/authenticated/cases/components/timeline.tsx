import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetClientTimeline } from "@/http/generated/client-portal/client-portal";
import type { GetClientTimelineType } from "@/http/generated/lexlaboral-server.schemas";
import { formatDateTime } from "@/utils/value-format";
import {
  BriefcaseIcon,
  CalculatorIcon,
  CalendarIcon,
  ClockIcon,
  FileTextIcon,
  GavelIcon,
  Loader2Icon,
  MessageSquareIcon,
  PenLineIcon,
} from "lucide-react";
import { useState } from "react";

const TYPE_ICONS: Record<string, React.ElementType> = {
  processo_iniciado: BriefcaseIcon,
  status_atualizado: ClockIcon,
  audiencia_marcada: CalendarIcon,
  documento_enviado: FileTextIcon,
  documento_aprovado: FileTextIcon,
  documento_rejeitado: FileTextIcon,
  proposta_acordo: GavelIcon,
  calculo_atualizado: CalculatorIcon,
  sentenca_publicada: MessageSquareIcon,
  custom: PenLineIcon,
};

const TYPE_LABELS: Record<string, string> = {
  processo_iniciado: "Processo iniciado",
  status_atualizado: "Status atualizado",
  audiencia_marcada: "Audiência marcada",
  documento_enviado: "Documento enviado",
  documento_aprovado: "Documento aprovado",
  documento_rejeitado: "Documento rejeitado",
  proposta_acordo: "Proposta de acordo",
  calculo_atualizado: "Cálculo atualizado",
  sentenca_publicada: "Sentença publicada",
  custom: "Personalizado",
};

const TYPE_COLORS: Record<string, string> = {
  processo_iniciado: "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
  status_atualizado: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
  audiencia_marcada: "bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
  documento_enviado: "bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
  documento_aprovado: "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400",
  documento_rejeitado: "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400",
  proposta_acordo: "bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400",
  calculo_atualizado: "bg-teal-100 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400",
  sentenca_publicada: "bg-rose-100 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400",
  custom: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
};

export function CaseTimeline({ caseId }: { caseId: string }) {
  const [type, setType] = useState<GetClientTimelineType | "all">("all");
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const { data, isLoading } = useGetClientTimeline(caseId, {
    type: type === "all" ? undefined : type,
    limit,
    offset,
  });

  const events = data?.events ?? [];
  const hasMore = data?.hasMore ?? false;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Select value={type} onValueChange={(v) => { setType(v as GetClientTimelineType | "all"); setOffset(0); }}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="processo_iniciado">Processo iniciado</SelectItem>
            <SelectItem value="status_atualizado">Status atualizado</SelectItem>
            <SelectItem value="audiencia_marcada">Audiência marcada</SelectItem>
            <SelectItem value="documento_enviado">Documento enviado</SelectItem>
            <SelectItem value="documento_aprovado">Documento aprovado</SelectItem>
            <SelectItem value="documento_rejeitado">Documento rejeitado</SelectItem>
            <SelectItem value="proposta_acordo">Proposta de acordo</SelectItem>
            <SelectItem value="calculo_atualizado">Cálculo atualizado</SelectItem>
            <SelectItem value="sentenca_publicada">Sentença publicada</SelectItem>
            <SelectItem value="custom">Personalizado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2Icon className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {!isLoading && events.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <ClockIcon className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">Nenhum evento</p>
          <p className="text-xs text-muted-foreground max-w-xs">
            A timeline do processo aparecerá aqui conforme o andamento.
          </p>
        </div>
      )}

      {!isLoading && events.length > 0 && (
        <div className="space-y-0">
          {events.map((event, i) => {
            const Icon = TYPE_ICONS[event.type] ?? ClockIcon;
            const color = TYPE_COLORS[event.type] ?? TYPE_COLORS.custom;
            return (
              <div key={event.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {i < events.length - 1 && (
                    <div className="w-px flex-1 bg-slate-200 dark:bg-slate-800 my-1.5" />
                  )}
                </div>
                <div className="pb-6 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{event.title}</p>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {TYPE_LABELS[event.type] ?? event.type}
                    </Badge>
                  </div>
                  {event.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-3">{event.description}</p>
                  )}
                  {event.responsible && (
                    <p className="text-xs text-muted-foreground mt-1">Responsável: {event.responsible}</p>
                  )}
                  {event.nextSteps && (
                    <p className="text-xs text-muted-foreground mt-1">Próximos passos: {event.nextSteps}</p>
                  )}
                  <p className="text-[10px] text-muted-foreground/60 mt-1.5">{formatDateTime(event.date)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOffset((o) => o + limit)}
          >
            Carregar mais
          </Button>
        </div>
      )}
    </div>
  );
}
