import { ArrowLeftIcon, DownloadIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetBatchAssessment } from "@/http/generated/batch-assessment/batch-assessment";
import { formatCurrency } from "@/utils/value-format";
import { MethodologyPanel } from "./methodology-panel";
import { RowBreakdownSheet } from "./row-breakdown-sheet";

function Stat({
	label,
	value,
	hint,
	tone,
}: {
	label: string;
	value: string;
	hint: string;
	tone?: "primary" | "risk";
}) {
	return (
		<Card
			className={
				tone === "primary"
					? "border-primary/30 bg-primary/5"
					: tone === "risk"
						? "border-amber-200 dark:border-amber-900"
						: undefined
			}
		>
			<CardContent>
				<p className="text-muted-foreground text-xs">{label}</p>
				<p className="mt-1 font-semibold text-xl tabular-nums md:text-2xl">
					{value}
				</p>
				<p className="mt-1 text-muted-foreground text-xs">{hint}</p>
			</CardContent>
		</Card>
	);
}

export function BatchDetail({
	id,
	onBack,
}: {
	id: string;
	onBack: () => void;
}) {
	const { data, isLoading } = useGetBatchAssessment(id);
	const [selected, setSelected] = useState<{
		id: string;
		reference: string;
	} | null>(null);

	async function exportXlsx() {
		if (!data) return;
		const XLSX = await import("xlsx");

		const sheet = XLSX.utils.json_to_sheet(
			data.rows.map((row) => ({
				Referência: row.reference,
				"Custo de desligar": row.severanceCost
					? Number(row.severanceCost)
					: null,
				Exposição: row.exposure ? Number(row.exposure) : null,
				Diferença: row.gap ? Number(row.gap) : null,
				Problema: row.error ?? "",
			})),
		);

		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, sheet, "passivo");
		XLSX.writeFile(
			workbook,
			`passivo-${data.batch.name.replace(/[^\w-]+/g, "-").toLowerCase()}.xlsx`,
		);
	}

	if (isLoading || !data) {
		return (
			<div className="w-full space-y-4 p-4 md:p-6">
				<Skeleton className="h-10 w-64" />
				<Skeleton className="h-64 w-full" />
			</div>
		);
	}

	const { batch, rows } = data;

	return (
		<div className="w-full space-y-4 p-4 md:space-y-6 md:p-6">
			<div className="flex items-start gap-3">
				<Button
					variant="ghost"
					size="icon-sm"
					aria-label="Voltar"
					className="mt-0.5"
					onClick={onBack}
				>
					<ArrowLeftIcon />
				</Button>
				<div className="min-w-0">
					<h1 className="font-semibold text-foreground text-xl">
						{batch.name}
					</h1>
					<p className="text-muted-foreground text-sm">
						{batch.rowCount} pessoas
						{batch.failedCount > 0 &&
							` · ${batch.failedCount} sem cálculo por problema no arquivo`}
					</p>
				</div>
				<Button
					variant="outline"
					size="sm"
					className="ml-auto"
					onClick={exportXlsx}
				>
					<DownloadIcon /> Exportar XLSX
				</Button>
			</div>

			<MethodologyPanel />

			<div className="grid gap-4 sm:grid-cols-3">
				<Stat
					label="Custo de desligar hoje"
					value={formatCurrency(Number(batch.severanceCost))}
					hint="Verbas, FGTS, multa e encargos patronais."
					tone="primary"
				/>
				<Stat
					label="Exposição em reclamação"
					value={formatCurrency(Number(batch.exposure))}
					hint="Somando o que depende de prova, custas e honorários."
					tone="risk"
				/>
				<Stat
					label="Diferença"
					value={formatCurrency(Number(batch.gap))}
					hint="O que está em jogo na documentação."
				/>
			</div>

			<Card>
				<CardContent>
					<h2 className="font-medium text-sm">
						Por funcionário, da maior exposição para a menor
					</h2>
					<p className="mt-0.5 mb-3 text-muted-foreground text-xs">
						Clique em um funcionário para ver o demonstrativo verba a verba.
					</p>
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead>
								<tr className="text-left text-muted-foreground text-xs">
									<th className="pb-2 font-normal">Referência</th>
									<th className="pb-2 text-right font-normal">
										Custo de desligar
									</th>
									<th className="pb-2 text-right font-normal">Exposição</th>
									<th className="pb-2 text-right font-normal">Diferença</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-border">
								{rows.map((row) => (
									<tr
										key={row.id}
										onClick={() =>
											!row.error &&
											setSelected({ id: row.id, reference: row.reference })
										}
										className={
											row.error
												? undefined
												: "cursor-pointer transition-colors hover:bg-muted/30"
										}
									>
										<td className="py-2">
											{row.reference}
											{row.error && (
												<p className="text-amber-600 text-xs dark:text-amber-400">
													{row.error}
												</p>
											)}
										</td>
										<td className="py-2 text-right tabular-nums">
											{row.severanceCost
												? formatCurrency(Number(row.severanceCost))
												: "—"}
										</td>
										<td className="py-2 text-right tabular-nums">
											{row.exposure ? formatCurrency(Number(row.exposure)) : "—"}
										</td>
										<td className="py-2 text-right tabular-nums">
											{row.gap ? formatCurrency(Number(row.gap)) : "—"}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</CardContent>
			</Card>

			<RowBreakdownSheet
				batchId={id}
				row={selected}
				onClose={() => setSelected(null)}
			/>
		</div>
	);
}
