import { Button } from "@/components/ui/button";
import {
  useListLaborCalculation,
  useUpdateLaborCalculationStatus,
} from "@/http/generated/labor-calculation/labor-calculation";
import { ListLaborCalculation200, UpdateLaborCalculationStatusBodyStatus } from "@/http/generated/lexlaboral-server.schemas";
import { cn } from "@/lib/utils";
import { ListIcon, RefreshCwIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";


export default function Workflow() {
  const navigate = useNavigate();
  const { data: calculations = [], refetch } = useListLaborCalculation({ limit: 100 });
  const { mutateAsync: updateCalculation, isPending: isUpdating } =
    useUpdateLaborCalculationStatus();

  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const statusColumns = [
    { id: "em_andamento", label: "Em Andamento" },
    { id: "proposta_enviada", label: "Proposta Enviada" },
    { id: "acordo_fechado", label: "Acordo Fechado" },
    { id: "ajuizado", label: "Ajuizado" },
  ];

  const handleDragStart = (id: string) => {
    setDraggingItemId(id);
  };

  const handleDragEnd = () => {
    setDraggingItemId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    setDragOverColumn(status);
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    if (!draggingItemId) return;

    try {
      await updateCalculation({
        id: draggingItemId,
        data: {
          status: newStatus as UpdateLaborCalculationStatusBodyStatus,
        },
      });

      toast(
        `Cálculo movido para ${statusColumns.find((col) => col.id === newStatus)?.label || newStatus}`,
      );
      refetch();
    } catch (error) {
      console.error(error);
      toast("Erro ao atualizar status do cálculo");
    } finally {
      setDraggingItemId(null);
      setDragOverColumn(null);
    }
  };

  type CalcItem = NonNullable<ListLaborCalculation200["data"]>[number];

  const calculationsByStatus = useMemo(() =>
    statusColumns.reduce<Record<string, CalcItem[]>>(
      (acc, column) => {
        acc[column.id] =
          (calculations as ListLaborCalculation200).data?.filter((calc) => calc.status === column.id) ?? [];
        return acc;
      },
      {},
    ), [calculations]);

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Workflow de Cálculos
          </h2>
          <p className="text-sm text-muted-foreground">
            Gerencie o status dos seus cálculos usando o método Kanban
          </p>
        </div>
        <Button onClick={() => navigate("/calculations/new")}>
          <ListIcon data-icon="inline-start" />
          <span className="hidden sm:inline">Novo Cálculo</span>
          <span className="sm:hidden">Novo</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {statusColumns.map((column) => (
          <div
            key={column.id}
            className="border border-border rounded-xl p-4 bg-card min-h-75"
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={() => setDragOverColumn(null)}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold text-foreground">
                {column.label}
              </h3>
              <span className="text-xs text-muted-foreground">
                {calculationsByStatus[column.id]?.length || 0}
              </span>
            </div>

            <div className="space-y-2">
              {calculationsByStatus[column.id]?.map((calc) => (
                <div
                  key={calc.id}
                  draggable={true}
                  onDragStart={() => handleDragStart(calc.id)}
                  onDragEnd={handleDragEnd}
                  onClick={() => {
                    navigate("/calculations/" + calc.id)
                  }}
                  className={cn(
                    "p-3 rounded-lg border border-border/50 bg-background cursor-pointer",
                    draggingItemId === calc.id && "opacity-50",
                    dragOverColumn === column.id && draggingItemId !== calc.id && "border-primary/50 bg-primary/5",
                  )}
                >
                  <div className="flex items-start justify-between">
                    <p className="font-medium text-sm text-foreground">
                      {calc.clientName}
                    </p>
                  </div>

                  <p className="text-xs text-muted-foreground mt-1">
                    {calc.totalValue != null
                      ? `R$ ${calc.totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      : "Valor não calculado"}
                  </p>
                </div>
              )) || []}

              {calculationsByStatus[column.id]?.length === 0 && (
                <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                  <p className="text-xs text-center">
                    Nenhum cálculo nesta etapa
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {isUpdating && (
        <div className="fixed bottom-4 right-4">
          <Button variant="outline" size="icon-sm" disabled aria-label="Atualizando">
            <RefreshCwIcon className="animate-spin" />
          </Button>
        </div>
      )}
    </div>
  );
}
