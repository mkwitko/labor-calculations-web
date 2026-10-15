import { type ReactNode, useState } from "react";

import { AlertTriangleIcon, Loader2Icon } from "lucide-react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { getGetLaborCalculationQueryKey } from "@/http/generated/labor-calculation/labor-calculation";
import { useReindexLaborCalculation } from "@/http/generated/labor-calculation-v3/labor-calculation-v3";
import type { ReindexLaborCalculation200 } from "@/http/generated/lexlaboral-server.schemas";

import { queryClient } from "@/lib/react-query";

import { formatCurrency } from "@/utils/value-format";

function DeltaValue({ value }: { value: number }) {
  if (value === 0) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <span
      className={value > 0 ? "text-emerald-600" : "text-destructive"}
    >
      {value > 0 ? "+" : ""}
      {formatCurrency(value)}
    </span>
  );
}

/**
 * Atualizar índices é a única forma de um cálculo fechado mudar de valor sem
 * que um input mude. Por isso é sempre duas etapas: simula, mostra o impacto
 * verba a verba, e só grava depois de confirmado.
 */
export function ReindexDialog({
  calculationId,
  children,
}: {
  calculationId: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<ReindexLaborCalculation200 | null>(
    null,
  );

  const { mutateAsync: reindex, isPending } = useReindexLaborCalculation();

  async function loadPreview() {
    const result = await reindex({
      id: calculationId,
      data: { confirm: false },
    });

    setPreview(result);
  }

  async function handleOpenChange(next: boolean) {
    setOpen(next);

    if (next) {
      setPreview(null);
      await loadPreview();
      return;
    }

    setPreview(null);
  }

  async function handleConfirm() {
    await reindex({ id: calculationId, data: { confirm: true } });

    queryClient.invalidateQueries({
      queryKey: getGetLaborCalculationQueryKey(calculationId),
    });

    setOpen(false);
    setPreview(null);

    toast.success("Índices atualizados", {
      description: "O cálculo passou a usar a tabela de índices vigente.",
    });
  }

  const unchanged = preview?.indexSnapshot.unchanged ?? false;
  const changedVerbas =
    preview?.verbas.filter((verba) => verba.delta !== 0) ?? [];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Atualizar índices monetários</DialogTitle>
          <DialogDescription>
            O cálculo usa a tabela de índices congelada em sua criação. Veja o
            impacto de adotar a tabela vigente antes de confirmar.
          </DialogDescription>
        </DialogHeader>

        {!preview ? (
          <div className="flex items-center justify-center py-10">
            <Loader2Icon className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : unchanged ? (
          <p className="text-sm text-muted-foreground py-4">
            A tabela de índices não mudou desde este cálculo. Não há nada a
            atualizar.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2.5">
              <AlertTriangleIcon className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-xs text-foreground">
                Confirmar altera o valor de um cálculo já salvo. A mudança fica
                registrada no histórico, com a tabela antiga e a nova.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Total atual</p>
                <p className="font-semibold text-foreground">
                  {formatCurrency(preview.totals.totalValue.from)}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Total novo</p>
                <p className="font-semibold text-foreground">
                  {formatCurrency(preview.totals.totalValue.to)}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Diferença</p>
                <p className="font-semibold">
                  <DeltaValue value={preview.totals.totalValue.delta} />
                </p>
              </div>
            </div>

            <div className="text-xs text-muted-foreground font-mono">
              tabela {preview.indexSnapshot.fromHash?.slice(0, 8) ?? "—"} →{" "}
              {preview.indexSnapshot.toHash.slice(0, 8)}
            </div>

            {changedVerbas.length > 0 && (
              <div className="overflow-x-auto max-h-64 overflow-y-auto border border-border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-muted">
                    <tr className="text-xs text-muted-foreground">
                      <th className="text-left px-3 py-2">Verba</th>
                      <th className="text-right px-3 py-2">Atual</th>
                      <th className="text-right px-3 py-2">Nova</th>
                      <th className="text-right px-3 py-2">Diferença</th>
                    </tr>
                  </thead>
                  <tbody>
                    {changedVerbas.map((verba) => (
                      <tr
                        key={verba.name}
                        className="border-t border-border"
                      >
                        <td className="px-3 py-2 text-foreground">
                          {verba.name}
                        </td>
                        <td className="px-3 py-2 text-right text-muted-foreground">
                          {formatCurrency(verba.from)}
                        </td>
                        <td className="px-3 py-2 text-right text-foreground">
                          {formatCurrency(verba.to)}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <DeltaValue value={verba.delta} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>

          <Button
            onClick={handleConfirm}
            disabled={!preview || unchanged || isPending}
          >
            {isPending && <Loader2Icon className="w-4 h-4 animate-spin" />}
            Confirmar atualização
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
