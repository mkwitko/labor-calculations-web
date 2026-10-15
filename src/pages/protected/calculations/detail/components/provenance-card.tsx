import { useState } from "react";

import { HistoryIcon, RefreshCwIcon, ShieldCheckIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

import { formatDate } from "@/utils/value-format";

import { AuditTrail } from "./audit-trail";
import { ReindexDialog } from "./reindex-dialog";

type ProvenanceCardProps = {
  calculationId: string;
  indexSnapshotId: string | null;
  indexSnapshotHash?: string | null;
  engineVersion: string | null;
  indexesUpdatedAt: string | null;
};

// Hash inteiro não cabe na tela e ninguém compara 64 caracteres a olho; os 8
// primeiros bastam para conferir que dois laudos saíram da mesma tabela.
function shortHash(hash: string) {
  return hash.slice(0, 8);
}

/**
 * Procedência do cálculo: com qual tabela de índices e qual versão do motor
 * este número foi produzido, e quem mexeu nele desde então.
 *
 * Cálculo criado antes do rastreio não tem snapshot. A tela diz isso em vez de
 * fingir que tem — é justamente o caso em que o número não é reproduzível.
 */
export function ProvenanceCard({
  calculationId,
  indexSnapshotId,
  indexSnapshotHash,
  engineVersion,
  indexesUpdatedAt,
}: ProvenanceCardProps) {
  const [showTrail, setShowTrail] = useState(false);

  const tracked = Boolean(indexSnapshotId);

  return (
    <div className="bg-card border border-border rounded-xl">
      <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-border">
        <div className="flex items-center gap-2 min-w-0">
          <ShieldCheckIcon
            className={
              tracked
                ? "w-4 h-4 text-primary shrink-0"
                : "w-4 h-4 text-muted-foreground shrink-0"
            }
          />
          <h3 className="text-sm font-semibold text-foreground truncate">
            Procedência
          </h3>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTrail((value) => !value)}
          >
            <HistoryIcon className="w-4 h-4" />
            Histórico
          </Button>

          <ReindexDialog calculationId={calculationId}>
            <Button variant="outline" size="sm">
              <RefreshCwIcon className="w-4 h-4" />
              Atualizar índices
            </Button>
          </ReindexDialog>
        </div>
      </div>

      <div className="px-5 py-4">
        {tracked ? (
          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">
                Tabela de índices
              </dt>
              <dd className="font-mono text-foreground">
                {indexSnapshotHash
                  ? shortHash(indexSnapshotHash)
                  : "—"}
              </dd>
            </div>

            <div>
              <dt className="text-xs text-muted-foreground">
                Versão do motor
              </dt>
              <dd className="text-foreground">{engineVersion ?? "—"}</dd>
            </div>

            <div>
              <dt className="text-xs text-muted-foreground">
                Índices atualizados em
              </dt>
              <dd className="text-foreground">
                {indexesUpdatedAt
                  ? formatDate(indexesUpdatedAt)
                  : "Nunca (mantém a tabela original)"}
              </dd>
            </div>
          </dl>
        ) : (
          <p className="text-sm text-muted-foreground">
            Procedência não registrada — este cálculo é anterior ao
            rastreamento da tabela de índices. Ao editá-lo ou atualizar os
            índices, a tabela usada passa a ficar registrada.
          </p>
        )}
      </div>

      {showTrail && <AuditTrail calculationId={calculationId} />}
    </div>
  );
}
