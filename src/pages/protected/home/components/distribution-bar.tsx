import type { DistributionEntry } from "../utils/metrics";

type Props = {
  title: string;
  entries: DistributionEntry[];
  total: number;
};

export function DistributionBar({ title, entries, total }: Props) {
  const active = entries.filter((e) => e.count > 0);

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-5 space-y-3">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>

      {total === 0 ? (
        <p className="text-xs text-muted-foreground">Nenhum dado</p>
      ) : (
        <>
          <div className="flex h-2.5 rounded-full overflow-hidden gap-0.5">
            {active.map((e) => (
              <div
                key={e.key}
                className={`${e.color} rounded-full`}
                style={{ width: `${(e.count / total) * 100}%` }}
                title={`${e.label}: ${e.count}`}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {active.map((e) => (
              <div key={e.key} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full shrink-0 ${e.color}`} />
                <span className="text-xs text-muted-foreground">
                  {e.label}{" "}
                  <span className="font-medium text-foreground">{e.count}</span>
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
