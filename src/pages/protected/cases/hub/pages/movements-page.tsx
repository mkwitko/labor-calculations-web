import {
  BuildingIcon,
  GavelIcon,
  Loader2Icon,
  PlusIcon,
  RefreshCwIcon,
  TrashIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmButton } from "@/components/confirm-button";
import { EmptyState } from "@/components/empty-state";
import { InfoBanner } from "@/components/info-banner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getListCaseMovementsQueryKey,
  useCreateCaseMovement,
  useDeleteCaseMovement,
  useListCaseMovements,
  useSyncCaseMovements,
} from "@/http/generated/case-movement/case-movement";
import { queryClient } from "@/lib/react-query";
import { useCaseHub } from "../case-hub-layout";

export default function CaseMovementsPage() {
  const { caseId, caseData } = useCaseHub();
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState("");

  const { data: movements } = useListCaseMovements(caseId);
  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: getListCaseMovementsQueryKey(caseId),
    });

  const { mutateAsync: create, isPending: creating } = useCreateCaseMovement({
    mutation: { onSuccess: invalidate },
  });
  const { mutateAsync: sync, isPending: syncing } = useSyncCaseMovements({
    mutation: { onSuccess: invalidate },
  });
  const { mutateAsync: remove } = useDeleteCaseMovement({
    mutation: { onSuccess: invalidate },
  });

  const add = async () => {
    if (!desc.trim() || !date) return;
    await create({
      caseId,
      data: { description: desc.trim(), date },
    });
    setDesc("");
    setDate("");
    toast.success("Andamento adicionado");
  };

  const doSync = async () => {
    try {
      const res = await sync({ caseId });
      toast.success(
        res.imported > 0
          ? `${res.imported} andamento(s) importado(s) do tribunal`
          : "Nenhum andamento novo encontrado",
      );
    } catch {
      toast.error("Não foi possível sincronizar com o tribunal");
    }
  };

  const list = movements ?? [];

  return (
    <div className="space-y-4">
      <InfoBanner variant="info">
        <span className="font-semibold">Andamentos processuais.</span> Casos
        ativos com número de processo são conferidos todo dia na base do CNJ
        (DataJud), e você recebe e-mail quando algo novo aparece. Aqui dá para
        importar na hora ou registrar um andamento à mão.
      </InfoBanner>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {caseData.processNumber
            ? `Processo ${caseData.processNumber}`
            : "Sem número de processo — informe no caso para sincronizar."}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={doSync}
          disabled={syncing || !caseData.processNumber}
        >
          {syncing ? (
            <Loader2Icon className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCwIcon className="w-4 h-4" />
          )}
          Sincronizar do tribunal
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row gap-2">
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="sm:w-40"
        />
        <Input
          placeholder="Descrição do andamento (ex: Juntada de petição)"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          className="flex-1"
        />
        <Button onClick={add} disabled={creating || !desc.trim() || !date}>
          <PlusIcon className="w-4 h-4" />
          Adicionar
        </Button>
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={GavelIcon}
          title="Nenhum andamento registrado"
          description="Sincronize com o tribunal ou adicione manualmente os principais atos do processo."
          helpArticle="andamentos-processuais"
        />
      ) : (
        <div className="relative pl-4">
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />
          <div className="space-y-4">
            {list.map((m) => (
              <div key={m.id} className="relative flex items-start gap-3 group">
                <div
                  className={`absolute -left-4 mt-1 w-3.5 h-3.5 rounded-full border-2 border-background ${
                    m.source === "datajud" ? "bg-blue-500" : "bg-muted-foreground"
                  }`}
                />
                <div className="min-w-0 flex-1 bg-card border border-border rounded-lg px-3.5 py-2.5">
                  <div className="flex items-center gap-2">
                    {m.source === "datajud" ? (
                      <GavelIcon className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    ) : (
                      <BuildingIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    )}
                    <span className="text-xs text-muted-foreground">
                      {new Date(m.date).toLocaleDateString("pt-BR")}
                    </span>
                    {m.source === "datajud" && (
                      <span className="text-[10px] uppercase tracking-wide text-blue-500 font-medium">
                        Tribunal
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-foreground mt-0.5">
                    {m.description}
                  </p>
                </div>
                <ConfirmButton
                  variant="ghost"
                  size="icon-sm"
                  className="opacity-0 group-hover:opacity-100"
                  tooltip="Excluir andamento"
                  title="Excluir andamento?"
                  description="Este andamento será removido do processo."
                  confirmLabel="Excluir"
                  onConfirm={() => remove({ caseId, movementId: m.id })}
                >
                  <TrashIcon className="w-3.5 h-3.5 text-muted-foreground" />
                </ConfirmButton>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
