import { Loader2Icon, PlusIcon, TrendingUpIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { InfoBanner } from "@/components/info-banner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getListMonetaryIndicesQueryKey,
  useListMonetaryIndices,
  useUpsertMonetaryIndex,
} from "@/http/generated/monetary-index/monetary-index";
import { queryClient } from "@/lib/react-query";

const EMPTY = {
  month: "",
  ipcaE: "",
  ipcaECumulative: "",
  selic: "",
  selicCumulative: "",
  trd: "",
};

// Editable monetary correction indices (IPCA-E / SELIC / TR). Keeps the
// calculation engine current without a code change.
export function MonetaryIndicesCard() {
  const { data: indices } = useListMonetaryIndices();
  const [form, setForm] = useState(EMPTY);

  const { mutateAsync: upsert, isPending } = useUpsertMonetaryIndex({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getListMonetaryIndicesQueryKey(),
        });
        toast.success("Índice salvo");
        setForm(EMPTY);
      },
    },
  });

  const set = (k: keyof typeof EMPTY, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const num = (v: string) => Number(v.replace(",", ".")) || 0;

  const submit = () => {
    if (!/^\d{4}-\d{2}$/.test(form.month)) {
      toast.error("Mês no formato AAAA-MM");
      return;
    }
    upsert({
      month: form.month,
      data: {
        ipcaE: num(form.ipcaE),
        ipcaECumulative: num(form.ipcaECumulative),
        selic: num(form.selic),
        selicCumulative: num(form.selicCumulative),
        trd: num(form.trd),
      },
    });
  };

  const rows = indices ?? [];

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUpIcon className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">
          Índices monetários (IPCA-E / SELIC / TR)
        </h3>
      </div>

      <InfoBanner variant="tip">
        Índices usados na correção e nos juros do cálculo. Mantenha-os
        atualizados mês a mês. Sem valores cadastrados, o sistema usa a tabela
        interna padrão.
      </InfoBanner>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <div className="space-y-1">
          <Label className="text-xs">Mês (AAAA-MM)</Label>
          <Input
            placeholder="2026-04"
            value={form.month}
            onChange={(e) => set("month", e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">IPCA-E (mês)</Label>
          <Input value={form.ipcaE} onChange={(e) => set("ipcaE", e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">IPCA-E acum.</Label>
          <Input
            value={form.ipcaECumulative}
            onChange={(e) => set("ipcaECumulative", e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">SELIC (mês)</Label>
          <Input value={form.selic} onChange={(e) => set("selic", e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">SELIC acum.</Label>
          <Input
            value={form.selicCumulative}
            onChange={(e) => set("selicCumulative", e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">TR/TRD</Label>
          <Input value={form.trd} onChange={(e) => set("trd", e.target.value)} />
        </div>
      </div>
      <Button size="sm" onClick={submit} disabled={isPending}>
        {isPending ? (
          <Loader2Icon className="w-4 h-4 animate-spin" />
        ) : (
          <PlusIcon className="w-4 h-4" />
        )}
        Salvar índice do mês
      </Button>

      {rows.length > 0 && (
        <div className="border border-border rounded-lg overflow-auto max-h-80">
          <table className="w-full text-sm min-w-125">
            <thead>
              <tr className="border-b border-border bg-muted text-xs text-muted-foreground sticky top-0 [&>th]:bg-muted">
                <th className="text-left px-3 py-2">Mês</th>
                <th className="text-right px-3 py-2">IPCA-E acum.</th>
                <th className="text-right px-3 py-2">SELIC acum.</th>
                <th className="text-right px-3 py-2">TR/TRD</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 24).map((r) => (
                <tr key={String(r.month)} className="border-b border-border/50">
                  <td className="px-3 py-2 text-foreground">
                    {new Date(r.month).toLocaleDateString("pt-BR", {
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {r.ipcaECumulative}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {r.selicCumulative}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">{r.trd}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
