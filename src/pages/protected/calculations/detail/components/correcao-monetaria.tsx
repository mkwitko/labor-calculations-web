import { useMemo, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/utils/value-format";

export function CorrecaoMonetaria({ totalValue }: { totalValue: number }) {
  const [enabled, setEnabled] = useState(false);
  const [selicRate, setSelicRate] = useState("");

  const correctedTotal = useMemo(() => {
    if (!enabled || !selicRate) return null;
    const rate = Number(selicRate.replace(",", "."));
    if (Number.isNaN(rate) || rate <= 0) return null;
    return Math.round(totalValue * (1 + rate / 100) * 100) / 100;
  }, [enabled, selicRate, totalValue]);

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Correção Monetária (SELIC)
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            ADC 58 STF — SELIC como índice de atualização e juros desde jun/2021
          </p>
        </div>
        <Switch checked={enabled} onCheckedChange={setEnabled} />
      </div>

      {enabled && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground block mb-1.5">
                Taxa SELIC acumulada (%)
              </label>
              <Input
                type="text"
                inputMode="decimal"
                placeholder="Ex: 14,75"
                value={selicRate}
                onChange={(e) =>
                  setSelicRate(
                    e.target.value
                      .replace(/[^0-9.,]/g, "")
                      .replace(/(\..*)\./g, "$1"),
                  )
                }
              />
            </div>
          </div>

          {correctedTotal !== null && (
            <div className="border-t border-border pt-3 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal original</span>
                <span className="tabular-nums">
                  {formatCurrency(totalValue)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Correção aplicada (+{selicRate}%)
                </span>
                <span className="tabular-nums text-primary">
                  +{formatCurrency(correctedTotal - totalValue)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm font-bold pt-1 border-t border-border mt-1">
                <span className="text-foreground">Total corrigido</span>
                <span className="text-foreground tabular-nums text-lg">
                  {formatCurrency(correctedTotal)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
