import { InfoBanner } from "@/components/info-banner";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
	type BreakdownVerba,
	VerbaBreakdownTable,
} from "@/components/verba-breakdown-table";
import { useGetBatchAssessmentRowBreakdown } from "@/http/generated/batch-assessment/batch-assessment";
import { formatCurrency } from "@/utils/value-format";

function Group({
	title,
	verbas,
	extraLabel,
	extraValue,
	subtotal,
}: {
	title: string;
	verbas: BreakdownVerba[];
	/** Linha que não é verba do trabalhador (encargos, custas) mas soma no grupo. */
	extraLabel: string;
	extraValue: number;
	subtotal: number;
}) {
	return (
		<div className="space-y-2">
			<h3 className="font-medium text-sm">{title}</h3>
			<VerbaBreakdownTable
				verbas={[...verbas, { name: extraLabel, total: extraValue }]}
			/>
			<p className="text-right text-sm">
				Subtotal:{" "}
				<span className="font-semibold tabular-nums">
					{formatCurrency(subtotal)}
				</span>
			</p>
		</div>
	);
}

/**
 * Demonstrativo de um funcionário do lote: o backend recomputa a linha com a
 * mesma tabela de índices do lote e devolve as verbas classificadas. Documental
 * compõe o custo de desligar; o que depende de prova compõe a exposição.
 */
export function RowBreakdownSheet({
	batchId,
	row,
	onClose,
}: {
	batchId: string;
	row: { id: string; reference: string } | null;
	onClose: () => void;
}) {
	const { data, isLoading, isError } = useGetBatchAssessmentRowBreakdown(
		batchId,
		row?.id ?? "",
		{ query: { enabled: Boolean(row) } },
	);

	const documentais =
		data?.verbas.filter((v) => v.certainty === "documental") ?? [];
	const requerProva =
		data?.verbas.filter((v) => v.certainty === "requer_prova") ?? [];

	return (
		<Sheet open={Boolean(row)} onOpenChange={(open) => !open && onClose()}>
			<SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
				<SheetHeader>
					<SheetTitle>{row?.reference}</SheetTitle>
				</SheetHeader>

				<div className="space-y-6 px-4 pb-6">
					{isLoading && <Skeleton className="h-64 w-full" />}
					{isError && (
						<InfoBanner variant="warning">
							Não conseguimos montar o demonstrativo agora. Tente de novo.
						</InfoBanner>
					)}

					{data && (
						<>
							<Group
								title="Custo de desligar (verbas documentais)"
								verbas={documentais}
								extraLabel="Encargos patronais (INSS empresa + SAT/RAT)"
								extraValue={data.employerCharges}
								subtotal={data.severanceCost}
							/>
							<Group
								title="Exposição adicional (depende de prova)"
								verbas={requerProva}
								extraLabel="Custas e honorários de sucumbência"
								extraValue={data.litigationExtras}
								subtotal={data.exposure - data.severanceCost}
							/>
							<div className="rounded-lg border border-border p-3 text-sm">
								Exposição total:{" "}
								<span className="font-semibold tabular-nums">
									{formatCurrency(data.exposure)}
								</span>
								<span className="mt-1 block text-muted-foreground text-xs">
									Diferença de {formatCurrency(data.gap)} — é o que está em
									jogo entre desligar com a documentação em ordem e responder a
									uma reclamação.
								</span>
							</div>
						</>
					)}
				</div>
			</SheetContent>
		</Sheet>
	);
}
