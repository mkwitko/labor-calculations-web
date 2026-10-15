import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/value-format";

export type BreakdownVerba = {
	name: string;
	/** `null` além de ausente: o shape do detalhe V3 serializa assim. */
	legalRef?: string | null;
	bruto?: number;
	corrigido?: number;
	juros?: number;
	total: number;
};

const COLUMN_LABELS = {
	bruto: "Bruto",
	corrigido: "Corrigido",
	juros: "Juros",
} as const;

type Column = keyof typeof COLUMN_LABELS;

/**
 * Tabela de memória de cálculo: uma linha por verba, base legal embaixo do
 * nome. Compartilhada entre o detalhe V3 (todas as colunas + subtotal) e o
 * demonstrativo do /passivo (só total). Verba zerada não aparece — linha de
 * zero é ruído no laudo.
 */
export function VerbaBreakdownTable({
	verbas,
	columns = [],
	footerLabel,
	tableClassName,
}: {
	verbas: BreakdownVerba[];
	/** Colunas intermediárias a exibir; `total` é sempre a última. */
	columns?: Column[];
	/** Quando presente, rende um rodapé somando cada coluna exibida. */
	footerLabel?: string;
	tableClassName?: string;
}) {
	const visible = verbas.filter(
		(verba) => verba.total !== 0 || (verba.bruto ?? 0) !== 0,
	);
	const sum = (column: Column | "total") =>
		verbas.reduce((s, verba) => s + (verba[column] ?? 0), 0);

	return (
		<div className="overflow-x-auto">
			<table className={cn("w-full", tableClassName)}>
				<thead>
					<tr className="border-b border-border">
						<th className="py-2 pr-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
							Verba
						</th>
						{columns.map((column) => (
							<th
								key={column}
								className="py-2 px-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide"
							>
								{COLUMN_LABELS[column]}
							</th>
						))}
						<th className="py-2 pl-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
							Total
						</th>
					</tr>
				</thead>
				<tbody>
					{visible.map((verba) => (
						<tr
							key={verba.name}
							className="border-b border-border/50 last:border-0"
						>
							<td className="py-2 pr-3 text-sm text-foreground">
								{verba.name}
								{/* Fundamento na própria linha: é o que o perito confere
								    item a item. */}
								{verba.legalRef && (
									<span className="block text-xs text-muted-foreground">
										{verba.legalRef}
									</span>
								)}
							</td>
							{columns.map((column) => (
								<td
									key={column}
									className="py-2 px-3 text-sm text-right tabular-nums text-muted-foreground"
								>
									{formatCurrency(verba[column] ?? 0)}
								</td>
							))}
							<td className="py-2 pl-3 text-sm text-right tabular-nums font-medium text-foreground">
								{formatCurrency(verba.total)}
							</td>
						</tr>
					))}
				</tbody>
				{footerLabel && (
					<tfoot>
						<tr className="border-t-2 border-border">
							<td className="py-2 pr-3 text-sm font-semibold text-foreground">
								{footerLabel}
							</td>
							{columns.map((column) => (
								<td
									key={column}
									className="py-2 px-3 text-sm text-right tabular-nums font-semibold text-foreground"
								>
									{formatCurrency(sum(column))}
								</td>
							))}
							<td className="py-2 pl-3 text-sm text-right tabular-nums font-bold text-foreground">
								{formatCurrency(sum("total"))}
							</td>
						</tr>
					</tfoot>
				)}
			</table>
		</div>
	);
}
