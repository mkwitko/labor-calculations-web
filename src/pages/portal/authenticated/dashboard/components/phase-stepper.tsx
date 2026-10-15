import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { PORTAL_PHASES as PHASES } from "../../utils/case-phase";

export function PhaseStepper({ phase }: { phase: string }) {
  const currentIdx = Math.max(
    0,
    PHASES.findIndex((p) => p.key === phase),
  );
  const current = PHASES[currentIdx];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {PHASES.map((p, i) => {
          const done = i < currentIdx;
          const active = i === currentIdx;
          return (
            <div key={p.key} className="flex items-center gap-1.5 shrink-0">
              <div className="flex flex-col items-center gap-1.5 w-20">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-colors",
                    done && "bg-primary border-primary text-primary-foreground",
                    active &&
                      "border-primary text-primary bg-primary/10 ring-4 ring-primary/10",
                    !done && !active && "border-border text-muted-foreground",
                  )}
                >
                  {done ? <CheckIcon className="w-4 h-4" /> : i + 1}
                </div>
                <span
                  className={cn(
                    "text-[10px] text-center leading-tight",
                    active
                      ? "text-foreground font-medium"
                      : "text-muted-foreground",
                  )}
                >
                  {p.label}
                </span>
              </div>
              {i < PHASES.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 w-4 rounded-full -mt-5",
                    i < currentIdx ? "bg-primary" : "bg-border",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
      {current && (
        <div className="rounded-lg bg-primary/5 border border-primary/15 px-4 py-3">
          <p className="text-sm font-medium text-foreground">
            Etapa atual: {current.label}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">{current.desc}</p>
        </div>
      )}
    </div>
  );
}
