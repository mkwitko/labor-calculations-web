import { GitCompareIcon, Loader2Icon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useGetCalculationScenarios } from "@/http/generated/labor-calculation/labor-calculation";
import { formatCurrency } from "@/utils/value-format";

// Side-by-side scenario comparison (current vs without prescription / art. 467),
// recomputed live on the backend from the stored inputs.
export function ScenarioCompare({ calculationId }: { calculationId: string }) {
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useGetCalculationScenarios(calculationId, {
    query: { enabled: open },
  });

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <GitCompareIcon className="w-4 h-4" />
        Comparar cenários
      </Button>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl">
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border">
        <GitCompareIcon className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">
          Comparação de cenários
        </h3>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2Icon className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-125">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-xs text-muted-foreground">
                <th className="text-left px-4 py-2">Cenário</th>
                <th className="text-right px-4 py-2">Bruto devido</th>
                <th className="text-right px-4 py-2">Líquido ao reclamante</th>
                <th className="text-right px-4 py-2">Total do reclamado</th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((s, i) => (
                <tr
                  key={s.label}
                  className={i === 0 ? "font-medium" : "text-muted-foreground"}
                >
                  <td className="px-4 py-2.5 text-foreground">{s.label}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    {formatCurrency(s.brutoDevidoReclamante)}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    {formatCurrency(s.liquidoDevidoReclamante)}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    {formatCurrency(s.totalDevidoReclamado)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
