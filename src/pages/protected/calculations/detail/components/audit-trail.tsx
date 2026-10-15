import { Loader2Icon } from "lucide-react";

import { useGetCalculationAudit } from "@/http/generated/labor-calculation/labor-calculation";

import { formatDateTime } from "@/utils/value-format";

const ACTION_LABELS: Record<string, string> = {
  create: "Cálculo criado",
  update: "Cálculo editado",
  reindex: "Índices atualizados",
  delete: "Cálculo excluído",
  status_change: "Situação alterada",
};

// Nomes técnicos das colunas viram rótulos legíveis. O que não estiver aqui
// aparece como veio: melhor um nome cru do que esconder a mudança.
const FIELD_LABELS: Record<string, string> = {
  clientName: "Nome do cliente",
  clientDocument: "Documento do cliente",
  observations: "Observações",
  status: "Situação",
  lastSalary: "Última remuneração",
  baseSalary: "Salário base",
  startDate: "Admissão",
  endDate: "Rescisão",
  terminationType: "Tipo de rescisão",
  totalValue: "Total",
  extraHours: "Horas extras",
  nightHours: "Horas noturnas",
  insalubrityLevel: "Grau de insalubridade",
  dangerousWork: "Periculosidade",
  applyArt477Fine: "Multa art. 477",
  applyArt467: "Multa art. 467",
  indexSnapshotHash: "Tabela de índices",
  engineVersion: "Versão do motor",
};

type FieldChange = { from: unknown; to: unknown };

function renderValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "vazio";
  if (typeof value === "boolean") return value ? "sim" : "não";
  if (typeof value === "string" && /^[0-9a-f]{64}$/.test(value)) {
    return value.slice(0, 8);
  }
  return String(value);
}

function isChangeMap(value: unknown): value is Record<string, FieldChange> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function AuditTrail({ calculationId }: { calculationId: string }) {
  const { data, isLoading } = useGetCalculationAudit(calculationId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 border-t border-border">
        <Loader2Icon className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="px-5 py-4 border-t border-border">
        <p className="text-sm text-muted-foreground">
          Sem registros de alteração.
        </p>
      </div>
    );
  }

  return (
    <div className="border-t border-border divide-y divide-border">
      {data.map((entry) => {
        const changes = isChangeMap(entry.changes) ? entry.changes : null;

        return (
          <div key={entry.id} className="px-5 py-3">
            <div className="flex items-baseline justify-between gap-3 flex-wrap">
              <p className="text-sm font-medium text-foreground">
                {ACTION_LABELS[entry.action] ?? entry.action}
                {entry.userName && (
                  <span className="font-normal text-muted-foreground">
                    {" "}
                    por {entry.userName}
                  </span>
                )}
              </p>

              <time className="text-xs text-muted-foreground">
                {formatDateTime(entry.createdAt)}
              </time>
            </div>

            {changes && Object.keys(changes).length > 0 && (
              <ul className="mt-1.5 space-y-0.5">
                {Object.entries(changes).map(([field, change]) => (
                  <li key={field} className="text-xs text-muted-foreground">
                    {FIELD_LABELS[field] ?? field}:{" "}
                    <span className="line-through">
                      {renderValue(change.from)}
                    </span>{" "}
                    → <span className="text-foreground">
                      {renderValue(change.to)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
