import { FileSpreadsheetIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { PlanFeatureGate } from "@/components/plan-feature-gate";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
	getListBatchAssessmentsQueryKey,
	useDeleteBatchAssessment,
	useListBatchAssessments,
} from "@/http/generated/batch-assessment/batch-assessment";
import { queryClient } from "@/lib/react-query";
import { formatCurrency, formatDate } from "@/utils/value-format";
import { BatchDetail } from "./batch-detail";
import { UploadCard } from "./upload-card";

export default function Passivo() {
	const [openId, setOpenId] = useState<string | null>(null);
	const { data, isLoading } = useListBatchAssessments();

	const { mutate: remove } = useDeleteBatchAssessment({
		mutation: {
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: getListBatchAssessmentsQueryKey(),
				});
			},
		},
	});

	function refresh(id: string) {
		queryClient.invalidateQueries({
			queryKey: getListBatchAssessmentsQueryKey(),
		});
		setOpenId(id);
	}

	if (openId) {
		return <BatchDetail id={openId} onBack={() => setOpenId(null)} />;
	}

	return (
		<div className="w-full space-y-4 p-4 md:space-y-6 md:p-6">
			<PageHeader
				title="Passivo trabalhista"
				subtitle="Suba a folha de um cliente empresa e veja o custo de desligamento e a exposição em caso de reclamação, funcionário por funcionário."
			/>

			{/* Só a criação é do plano: quem desce de plano continua abrindo e
			    exportando as avaliações que já fez. Tirar o acesso ao que a pessoa
			    já produziu seria outra coisa, e não é o que a tabela de preços
			    vende. */}
			<PlanFeatureGate
				feature="batch_assessment"
				title="Avaliação de passivo em lote"
				description="Suba a folha inteira em planilha e receba o custo de desligamento e a exposição, funcionário por funcionário."
			>
				<UploadCard onCreated={refresh} />
			</PlanFeatureGate>

			{isLoading ? (
				<Skeleton className="h-40 w-full" />
			) : data && data.length > 0 ? (
				<Card>
					<CardContent>
						<h2 className="mb-3 font-medium text-sm">Avaliações</h2>
						<div className="overflow-x-auto">
							<table className="w-full text-sm">
								<thead>
									<tr className="text-left text-muted-foreground text-xs">
										<th className="pb-2 font-normal">Avaliação</th>
										<th className="pb-2 text-right font-normal">Pessoas</th>
										<th className="pb-2 text-right font-normal">
											Custo de desligar
										</th>
										<th className="pb-2 text-right font-normal">Exposição</th>
										<th className="pb-2" />
									</tr>
								</thead>
								<tbody className="divide-y divide-border">
									{data.map((batch) => (
										<tr key={batch.id}>
											<td className="py-2">
												<button
													type="button"
													className="text-left hover:underline"
													onClick={() => setOpenId(batch.id)}
												>
													{batch.name}
												</button>
												<p className="text-muted-foreground text-xs">
													{formatDate(batch.createdAt)}
													{batch.client ? ` · ${batch.client.name}` : ""}
													{batch.failedCount > 0
														? ` · ${batch.failedCount} com problema`
														: ""}
												</p>
											</td>
											<td className="py-2 text-right tabular-nums">
												{batch.rowCount}
											</td>
											<td className="py-2 text-right tabular-nums">
												{formatCurrency(Number(batch.severanceCost))}
											</td>
											<td className="py-2 text-right tabular-nums">
												{formatCurrency(Number(batch.exposure))}
											</td>
											<td className="py-2 text-right">
												<Button
													variant="ghost"
													size="icon-sm"
													aria-label="Excluir avaliação"
													onClick={() => remove({ id: batch.id })}
												>
													<Trash2Icon />
												</Button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</CardContent>
				</Card>
			) : (
				<EmptyState
					icon={FileSpreadsheetIcon}
					title="Nenhuma avaliação ainda"
					description="Suba a folha de um cliente empresa para ver o passivo agregado e a lista por funcionário, ordenada por exposição."
				/>
			)}
		</div>
	);
}
