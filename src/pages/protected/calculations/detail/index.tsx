import {
  Navigate as RouterNavigate,
  useNavigate,
  useParams,
} from "react-router-dom";

import { ArrowLeftIcon, CopyIcon, PencilIcon, TrashIcon } from "lucide-react";

import {
  getListLaborCalculationQueryKey,
  useDeleteLaborCalculation,
  useGetLaborCalculation,
  useRestoreLaborCalculation,
} from "@/http/generated/labor-calculation/labor-calculation";

import { Button } from "@/components/ui/button";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { toast } from "sonner";

import { formatDate, getTerminationTypeLabel } from "@/utils/value-format";

import { queryClient } from "@/lib/react-query";

import { CalcBreakdown } from "./components/calc-breakdown";
import { CalcInfoGrid } from "./components/calc-info-grid";
import { ComparacaoRescisao } from "./components/comparacao-rescisao";
import { CorrecaoMonetaria } from "./components/correcao-monetaria";
import { ExportMenu } from "./components/export-menu";
import { PrescricaoAlert } from "./components/prescricao-alert";
import SettlementList from "./components/settlement-list";
import SettlementSimulator from "./components/settlement-simulator";
import { ShareDialog } from "./components/share-dialog";
import { ProvenanceCard } from "./components/provenance-card";
import { ScenarioCompare } from "./components/scenario-compare";
import { SummaryCards } from "./components/summary-cards";
import { mapResultV3 } from "./types";

export default function CalculationDetail() {
  const { id: routeId } = useParams<{ id: string }>();

  const navigate = useNavigate();

  if (!routeId) {
    return <RouterNavigate to="/calculations" />;
  }

  const id = routeId;

  const { data: calc, isLoading } =
    useGetLaborCalculation(id);

  const {
    mutateAsync: deleteCalc,
    isPending: isDeleting,
  } = useDeleteLaborCalculation();

  const {
    mutateAsync: restoreCalc,
  } = useRestoreLaborCalculation();

  async function handleDelete() {
    await deleteCalc({ id });

    queryClient.invalidateQueries({
      queryKey: getListLaborCalculationQueryKey(),
    });

    navigate("/calculations");

    toast("Cálculo excluído", {
      duration: 30000,

      action: {
        label: "Desfazer",

        onClick: async () => {
          await restoreCalc({ id });

          queryClient.invalidateQueries({
            queryKey:
              getListLaborCalculationQueryKey(),
          });

          navigate(`/calculations/${id}`);
        },
      },
    });
  }

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-40">
        <p className="text-sm text-muted-foreground">
          Carregando...
        </p>
      </div>
    );
  }

  if (!calc) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">
          Cálculo não encontrado.
        </p>
      </div>
    );
  }

  const isV2 =
    calc.calculationVersion === "v2";

  const isV3 =
    calc.calculationVersion === "v3";

  const resultV3 = isV3
    ? mapResultV3(calc)
    : null;

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon-sm"
            type="button"
            aria-label="Voltar"
            className="mt-0.5 shrink-0"
            onClick={() => navigate(-1)}
          >
            <ArrowLeftIcon />
          </Button>
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-foreground truncate">
              {calc.clientName}
            </h1>
            <p className="text-sm text-muted-foreground">
              {getTerminationTypeLabel(calc.terminationType)} · Criado em{" "}
              {formatDate(calc.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-2">
            <ShareDialog
              calculationId={id}
              clientDocument={calc?.clientDocument ?? undefined}
            />

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                navigate("/calculations/new", { state: { cloneFrom: calc } })
              }
            >
              <CopyIcon />
              Clonar
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/calculations/${id}/edit`)}
          >
            <PencilIcon />
            <span className="hidden sm:inline">Editar</span>
          </Button>

          <ExportMenu calcId={id} calc={calc} resultV3={resultV3} />

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={isDeleting}>
                <TrashIcon />
                <span className="hidden sm:inline">Excluir</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent size="sm">
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir cálculo?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação pode ser desfeita em até 30 segundos após a exclusão.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction variant="destructive" onClick={handleDelete}>
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <PrescricaoAlert endDate={calc?.endDate ?? ""} />

      {/* Summary cards */}
      <SummaryCards calc={calc} isV3={isV3} resultV3={resultV3} />

      {/* Info grid */}
      <CalcInfoGrid calc={calc} isV2={isV2} />

      {/* Breakdown */}
      <CalcBreakdown calc={calc} isV2={isV2} isV3={isV3} resultV3={resultV3} />

      {!isV3 && <ComparacaoRescisao calc={calc} />}
      {!isV3 && <CorrecaoMonetaria totalValue={calc?.totalValue ?? 0} />}

      {isV3 && <ScenarioCompare calculationId={id} />}

      {/* Só na liquidação: a estimativa (V2) não aplica correção monetária,
          então não há tabela de índices de que falar. */}
      {isV3 && (
        <ProvenanceCard
          calculationId={id}
          indexSnapshotId={calc.indexSnapshotId}
          indexSnapshotHash={calc.indexSnapshotHash}
          engineVersion={calc.engineVersion}
          indexesUpdatedAt={calc.indexesUpdatedAt}
        />
      )}

      <SettlementList calculationId={id} />
      <SettlementSimulator calculationId={id} />
    </div>
  );
}
