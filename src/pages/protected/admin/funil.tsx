import { LockIcon } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetPublicFunnel } from "@/http/generated/admin/admin";

const RANGES = [7, 30, 90] as const;

function percent(value: number): string {
	return `${(value * 100).toFixed(1)}%`;
}

/** Nome legível da porta de entrada: `seo:horas-extras` → "SEO · horas-extras". */
function sourceLabel(source: string): string {
	if (source.startsWith("seo:")) return `SEO · ${source.slice(4)}`;
	if (source.startsWith("widget:")) return `Widget · ${source.slice(7)}`;
	if (source === "site") return "Site";
	return source;
}

function Stat({
	label,
	value,
	hint,
}: {
	label: string;
	value: string;
	hint?: string;
}) {
	return (
		<Card>
			<CardContent>
				<p className="text-muted-foreground text-xs">{label}</p>
				<p className="mt-1 font-semibold text-2xl tabular-nums">{value}</p>
				{hint && <p className="mt-1 text-muted-foreground text-xs">{hint}</p>}
			</CardContent>
		</Card>
	);
}

/**
 * Painel do dono do produto: mede o funil público atravessando organizações.
 *
 * Não tem entrada na navegação de propósito — é uma tela de quem toca o
 * negócio, não do escritório assinante. O gate de verdade é o `isAdmin` no
 * backend; esconder o link não protege nada, só evita ruído para quem paga.
 */
export default function AdminFunil() {
	const [days, setDays] = useState<number>(30);
	const { data, isLoading, error } = useGetPublicFunnel({ days });

	const status = (error as { response?: { status?: number } } | null)?.response
		?.status;

	if (status === 403 || status === 401) {
		return (
			<div className="w-full p-4 md:p-6">
				<EmptyState
					icon={LockIcon}
					title="Acesso restrito"
					description="Este painel é da administração da plataforma."
				/>
			</div>
		);
	}

	const maxDaily = Math.max(1, ...(data?.daily ?? []).map((d) => d.created));

	return (
		<div className="w-full space-y-4 p-4 md:space-y-6 md:p-6">
			<PageHeader
				title="Funil da calculadora pública"
				subtitle="Quantas pessoas calculam sem conta, quantas deixam contato e quantas viram cliente de algum escritório."
				actions={
					<div className="flex gap-1">
						{RANGES.map((range) => (
							<Button
								key={range}
								size="sm"
								variant={days === range ? "secondary" : "ghost"}
								onClick={() => setDays(range)}
							>
								{range} dias
							</Button>
						))}
					</div>
				}
			/>

			{isLoading || !data ? (
				<Skeleton className="h-64 w-full" />
			) : (
				<>
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
						<Stat
							label="Cálculos feitos"
							value={String(data.totals.created)}
							hint={`nos últimos ${data.range.days} dias`}
						/>
						<Stat
							label="Deixaram contato"
							value={String(data.totals.withContact)}
							hint={percent(data.totals.contactRate)}
						/>
						<Stat
							label="Importados por escritório"
							value={String(data.totals.claimed)}
							hint={percent(data.totals.claimRate)}
						/>
						<Stat
							label="Mediana até importar"
							value={
								data.medianHoursToClaim === null
									? "—"
									: `${data.medianHoursToClaim.toFixed(1)}h`
							}
							hint="do cálculo à importação"
						/>
					</div>

					<Card>
						<CardContent>
							<h2 className="mb-3 font-medium text-foreground text-sm">
								Por porta de entrada
							</h2>
							{data.bySource.length === 0 ? (
								<p className="text-muted-foreground text-sm">
									Nenhum cálculo no período.
								</p>
							) : (
								<div className="overflow-x-auto">
									<table className="w-full text-sm">
										<thead>
											<tr className="text-left text-muted-foreground text-xs">
												<th className="pb-2 font-normal">Origem</th>
												<th className="pb-2 text-right font-normal">
													Cálculos
												</th>
												<th className="pb-2 text-right font-normal">Contato</th>
												<th className="pb-2 text-right font-normal">
													Importados
												</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-border">
											{data.bySource.map((row) => (
												<tr key={row.source}>
													<td className="py-2">{sourceLabel(row.source)}</td>
													<td className="py-2 text-right tabular-nums">
														{row.created}
													</td>
													<td className="py-2 text-right tabular-nums">
														{row.withContact}
													</td>
													<td className="py-2 text-right tabular-nums">
														{row.claimed}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							)}
						</CardContent>
					</Card>

					<Card>
						<CardContent>
							<h2 className="mb-3 font-medium text-foreground text-sm">
								Por dia
							</h2>
							{data.daily.length === 0 ? (
								<p className="text-muted-foreground text-sm">
									Nenhum cálculo no período.
								</p>
							) : (
								<ul className="space-y-1.5">
									{data.daily.map((day) => (
										<li key={day.date} className="flex items-center gap-3">
											<span className="w-20 shrink-0 text-muted-foreground text-xs tabular-nums">
												{day.date.slice(5)}
											</span>
											{/* Barra em CSS: uma biblioteca de gráfico para três
											    séries não paga o peso no bundle. */}
											<span className="h-4 flex-1 overflow-hidden rounded bg-muted">
												<span
													className="block h-full bg-primary/70"
													style={{
														width: `${(day.created / maxDaily) * 100}%`,
													}}
												/>
											</span>
											<span className="w-24 shrink-0 text-right text-xs tabular-nums">
												{day.created} · {day.claimed} imp.
											</span>
										</li>
									))}
								</ul>
							)}
						</CardContent>
					</Card>
				</>
			)}
		</div>
	);
}
