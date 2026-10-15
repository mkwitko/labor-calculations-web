import { useState } from "react"
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react"
import { VerbaBreakdownTable } from "@/components/verba-breakdown-table"
import { formatCurrency } from "@/utils/value-format"
import type { ResultV3 } from "../types"

function FgtsMonthlyDetail({ result }: { result: ResultV3 }) {
  const [open, setOpen] = useState(false)
  if (result.fgtsEntries.length === 0) return null
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-foreground bg-muted/30 hover:bg-muted/50 transition-colors"
      >
        <span>Detalhamento FGTS mensal ({result.fgtsEntries.length} meses)</span>
        {open ? (
          <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {open && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-140">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="py-2 px-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Mês
                </th>
                <th className="py-2 px-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Base
                </th>
                <th className="py-2 px-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Alíquota
                </th>
                <th className="py-2 px-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Depósito
                </th>
                <th className="py-2 px-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Corrigido
                </th>
                <th className="py-2 px-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Juros
                </th>
                <th className="py-2 px-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {result.fgtsEntries.map((e) => (
                <tr
                  key={e.month}
                  className="border-b border-border/50 last:border-0"
                >
                  <td className="py-2 px-3 text-sm text-foreground">
                    {new Date(e.month).toLocaleDateString("pt-BR", {
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="py-2 px-3 text-sm text-right tabular-nums text-muted-foreground">
                    {formatCurrency(e.base)}
                  </td>
                  <td className="py-2 px-3 text-sm text-right tabular-nums text-muted-foreground">
                    {(e.aliquot * 100).toFixed(0)}%
                  </td>
                  <td className="py-2 px-3 text-sm text-right tabular-nums text-muted-foreground">
                    {formatCurrency(e.deposit)}
                  </td>
                  <td className="py-2 px-3 text-sm text-right tabular-nums text-muted-foreground">
                    {formatCurrency(e.corrected)}
                  </td>
                  <td className="py-2 px-3 text-sm text-right tabular-nums text-muted-foreground">
                    {formatCurrency(e.interest)}
                  </td>
                  <td className="py-2 px-3 text-sm text-right tabular-nums font-medium text-foreground">
                    {formatCurrency(e.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function SalaryDifferenceMonthlyDetail({ result }: { result: ResultV3 }) {
  const [open, setOpen] = useState(false)
  if (result.salaryDifferenceEntries.length === 0) return null
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-foreground bg-muted/30 hover:bg-muted/50 transition-colors"
      >
        <span>
          Detalhamento das diferenças salariais (
          {result.salaryDifferenceEntries.length} meses)
        </span>
        {open ? (
          <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {open && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-140">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="py-2 px-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Mês
                </th>
                <th className="py-2 px-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Devido
                </th>
                <th className="py-2 px-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Recebido
                </th>
                <th className="py-2 px-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Diferença
                </th>
                <th className="py-2 px-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Corrigido
                </th>
                <th className="py-2 px-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Juros
                </th>
                <th className="py-2 px-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {result.salaryDifferenceEntries.map((e) => (
                <tr
                  key={e.month}
                  className="border-b border-border/50 last:border-0"
                >
                  <td className="py-2 px-3 text-sm text-foreground">
                    {new Date(e.month).toLocaleDateString("pt-BR", {
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="py-2 px-3 text-sm text-right tabular-nums text-muted-foreground">
                    {formatCurrency(e.due)}
                  </td>
                  <td className="py-2 px-3 text-sm text-right tabular-nums text-muted-foreground">
                    {formatCurrency(e.received)}
                  </td>
                  <td className="py-2 px-3 text-sm text-right tabular-nums text-muted-foreground">
                    {formatCurrency(e.diff)}
                  </td>
                  <td className="py-2 px-3 text-sm text-right tabular-nums text-muted-foreground">
                    {formatCurrency(e.corrected)}
                  </td>
                  <td className="py-2 px-3 text-sm text-right tabular-nums text-muted-foreground">
                    {formatCurrency(e.interest)}
                  </td>
                  <td className="py-2 px-3 text-sm text-right tabular-nums font-medium text-foreground">
                    {formatCurrency(e.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export function V3Breakdown({ result }: { result: ResultV3 }) {
  return (
    <div className="space-y-4">
      {result.prescricao.applied && (
        <div className="flex items-center gap-2 p-3 bg-amber-500/10 rounded-lg border border-amber-500/30 mt-4">
          <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
            Prescrição quinquenal aplicada
            {result.prescricao.cutoffDate
              ? ` — verbas anteriores a ${new Date(
                  result.prescricao.cutoffDate,
                ).toLocaleDateString('pt-BR', {
                  month: '2-digit',
                  year: 'numeric',
                })} cortadas (CF art. 7º, XXIX)`
              : ' (CF art. 7º, XXIX)'}
          </span>
        </div>
      )}

      {result.percentualRemuneratorio > 0 && (
        <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg border border-border mt-4">
          <span className="text-xs text-muted-foreground">
            Parcelas Remuneratórias:
          </span>
          <span
            className="text-sm font-semibold text-foreground tabular-nums"
            title="Percentual de verbas de natureza salarial sobre o total bruto corrigido. Usado como base para IRPF e INSS."
          >
            {result.percentualRemuneratorio.toFixed(2).replace(".", ",")}%
          </span>
        </div>
      )}

      <VerbaBreakdownTable
        verbas={result.verbasDetalhadas}
        columns={["bruto", "corrigido", "juros"]}
        footerLabel="Subtotal Verbas"
        tableClassName="min-w-150"
      />

      <FgtsMonthlyDetail result={result} />

      <SalaryDifferenceMonthlyDetail result={result} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Descontos
          </h4>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">INSS Empregado</span>
            <span className="tabular-nums text-foreground">
              -{formatCurrency(result.inssEmployee)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">IRPF</span>
            <span className="tabular-nums text-foreground">
              -{formatCurrency(result.irpf)}
            </span>
          </div>
          <div className="flex justify-between text-sm font-semibold border-t border-border pt-2">
            <span className="text-foreground">Total Descontos</span>
            <span className="tabular-nums text-foreground">
              -{formatCurrency(result.totalDescontos)}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Encargos Reclamado
          </h4>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">INSS Empregador</span>
            <span className="tabular-nums text-foreground">
              {formatCurrency(result.inssEmployer)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">SAT/RAT</span>
            <span className="tabular-nums text-foreground">
              {formatCurrency(result.satRat)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Honorários Sucumbência</span>
            <span className="tabular-nums text-foreground">
              {formatCurrency(result.honorariosSucumbencia)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Custas Judiciais</span>
            <span className="tabular-nums text-foreground">
              {formatCurrency(result.custasJudiciais)}
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Bruto Devido Reclamante</span>
          <span className="tabular-nums font-medium text-foreground">
            {formatCurrency(result.brutoDevidoReclamante)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">(-) Descontos</span>
          <span className="tabular-nums text-foreground">
            {formatCurrency(result.totalDescontos)}
          </span>
        </div>
        <div className="flex justify-between text-sm font-semibold">
          <span className="text-foreground">Líquido Devido Reclamante</span>
          <span className="tabular-nums text-foreground">
            {formatCurrency(result.liquidoDevidoReclamante)}
          </span>
        </div>
        <div className="flex justify-between text-sm font-semibold border-t border-border pt-2">
          <span className="text-foreground">Total Devido Reclamado</span>
          <span className="tabular-nums text-xl font-bold text-foreground">
            {formatCurrency(result.totalDevidoReclamado)}
          </span>
        </div>
      </div>
    </div>
  )
}
