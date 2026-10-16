import { BriefcaseIcon, UserIcon } from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useListCases } from "@/http/generated/case/case";
import type { ListCases200DataItem } from "@/http/generated/labor-calculations-api.schemas";
import { cn } from "@/lib/utils";
import { ALL_PHASES, CASE_PHASE_COLORS, CASE_PHASE_LABELS } from "../utils/case-phase";

// Kanban view of cases grouped by phase. Reachable via /cases?view=kanban
// (and the legacy /workflow redirect). Cards deep-link into the case hub.
export function CasesKanban({ search }: { search?: string }) {
  const navigate = useNavigate();
  const { data } = useListCases({
    limit: 100,
    search: search?.trim() || undefined,
  });

  const byPhase = useMemo(() => {
    const map = new Map<string, ListCases200DataItem[]>();
    const items = data?.data ?? [];
    for (const phase of ALL_PHASES) map.set(phase, []);
    for (const c of items) {
      const arr = map.get(c.phase) ?? [];
      arr.push(c);
      map.set(c.phase, arr);
    }
    return map;
  }, [data]);

  return (
    <div className="flex flex-col gap-3 md:flex-row md:overflow-x-auto pb-2">
      {ALL_PHASES.map((phase) => {
        const cases = byPhase.get(phase) ?? [];
        const colors = CASE_PHASE_COLORS[phase];
        return (
          <div
            key={phase}
            className="flex flex-col w-full md:w-64 md:shrink-0 bg-muted/30 rounded-xl border border-border"
          >
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
              <span
                className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                  colors?.bg,
                  colors?.text,
                )}
              >
                {CASE_PHASE_LABELS[phase]}
              </span>
              <span className="text-xs text-muted-foreground">
                {cases.length}
              </span>
            </div>
            <div className="flex flex-col gap-2 p-2 min-h-16">
              {cases.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => navigate(`/cases/${c.id}`)}
                  className="bg-card border border-border rounded-lg p-3 text-left hover:border-primary/50 transition-colors"
                >
                  <p className="text-sm font-medium text-foreground truncate">
                    {c.title}
                  </p>
                  {c.client?.name && (
                    <p className="text-xs text-muted-foreground truncate mt-1 inline-flex items-center gap-1">
                      <UserIcon className="w-3 h-3" />
                      {c.client.name}
                    </p>
                  )}
                  {c.processNumber && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {c.processNumber}
                    </p>
                  )}
                </button>
              ))}
              {cases.length === 0 && (
                <div className="flex flex-col items-center justify-center py-6 text-muted-foreground/50">
                  <BriefcaseIcon className="w-5 h-5" />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
