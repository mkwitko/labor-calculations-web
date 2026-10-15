import { Badge } from "@/components/ui/badge";
import { useListClientCases } from "@/http/generated/client-portal/client-portal";
import type { ListClientCases200CasesItem } from "@/http/generated/lexlaboral-server.schemas";
import { formatDate } from "@/utils/value-format";
import {
  AlertCircleIcon,
  CalendarIcon,
  ChevronRightIcon,
  Loader2Icon,
  ScaleIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { portalPhaseLabel } from "../utils/case-phase";

function CaseRow({ item }: { item: ListClientCases200CasesItem }) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(`/portal/casos/${item.id}`)}
      className="w-full text-left flex items-center gap-4 px-5 py-4 hover:bg-muted/50 transition-colors border-b border-border last:border-0"
    >
      <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
        <ScaleIcon className="w-4 h-4 text-muted-foreground" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {item.title}
        </p>
        <div className="flex items-center flex-wrap gap-1.5 mt-0.5">
          <span className="text-xs text-muted-foreground">
            Aberto em {formatDate(item.openedAt)}
          </span>
          {item.processNumber && (
            <>
              <span className="text-xs text-muted-foreground/50">·</span>
              <span className="text-xs text-muted-foreground truncate">
                {item.processNumber}
              </span>
            </>
          )}
          {item.nextHearingAt && (
            <>
              <span className="text-xs text-muted-foreground/50">·</span>
              <CalendarIcon className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Audiência em {formatDate(item.nextHearingAt)}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col items-end gap-1 shrink-0">
        <Badge variant="secondary" className="text-xs">
          {portalPhaseLabel(item.phase)}
        </Badge>
        {item.pendingDocuments > 0 && (
          <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
            <AlertCircleIcon className="w-3 h-3" />
            {item.pendingDocuments}{" "}
            {item.pendingDocuments === 1
              ? "documento pendente"
              : "documentos pendentes"}
          </span>
        )}
      </div>

      <ChevronRightIcon className="w-4 h-4 text-muted-foreground shrink-0" />
    </button>
  );
}

export default function PortalCases() {
  const { data, isLoading } = useListClientCases();
  const cases = data?.cases ?? [];

  return (
    <div className="px-6 py-10 max-w-7xl mx-auto w-full space-y-8">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-foreground tracking-tight">
          Meus processos
        </h2>
        <p className="text-sm text-muted-foreground">
          Todos os processos que o seu advogado acompanha para você
        </p>
      </div>

      <div className="rounded-xl border border-border overflow-hidden bg-card">
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2Icon className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && cases.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-6">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
              <ScaleIcon className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">
              Nenhum processo por aqui ainda
            </p>
            <p className="text-xs text-muted-foreground max-w-xs">
              Assim que o seu advogado abrir um processo, ele aparece nesta
              lista.
            </p>
          </div>
        )}

        {!isLoading &&
          cases.map((item) => <CaseRow key={item.id} item={item} />)}
      </div>
    </div>
  );
}
