import {
	CheckCircle2Icon,
	DownloadIcon,
	GlobeIcon,
	Loader2Icon,
	MailIcon,
	PhoneIcon,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
	getListWidgetCalculationsQueryKey,
	useClaimWidgetCalculation,
	useListWidgetCalculations,
} from "@/http/generated/widget/widget";
import { useOrgAbilities } from "@/hooks/use-organizations";
import { queryClient } from "@/lib/react-query";
import { formatCurrency, formatDate } from "@/utils/value-format";

/**
 * A fila do widget: quem calculou no site do escritório.
 *
 * Importar cria cliente e liquidação com o mesmo número que a pessoa viu, e
 * dispara o convite de portal — o mesmo caminho do link compartilhado, só que
 * alcançado por id, porque o token do resultado ficou com o visitante.
 */
/**
 * O widget pode hospedar as três calculadoras, e as três atribuem pela mesma
 * chave. Sem o rótulo, um cálculo de horas extras apareceria na fila com cara
 * de rescisão — o número tem outra ordem de grandeza e o advogado ligaria para
 * a pessoa falando do caso errado.
 */
const KIND_LABELS: Record<string, string> = {
	rescisao: "Rescisão",
	horas_extras: "Horas extras",
	ferias_13: "Férias e 13º",
};

export default function DoMeuSite() {
	const { canWriteCases } = useOrgAbilities();
	const { data, isLoading } = useListWidgetCalculations();
	const [claimingId, setClaimingId] = useState<string | null>(null);

	const { mutate: claim } = useClaimWidgetCalculation({
		mutation: {
			onSuccess: (result) => {
				queryClient.invalidateQueries({
					queryKey: getListWidgetCalculationsQueryKey(),
				});
				toast.success(
					result.portalEmailSent
						? "Cálculo importado e convite do portal enviado."
						: "Cálculo importado.",
				);
			},
			onError: () => toast.error("Não conseguimos importar este cálculo."),
			onSettled: () => setClaimingId(null),
		},
	});

	const rows = data ?? [];
	const pending = rows.filter((row) => !row.claimed);

	return (
		<div className="w-full space-y-4 p-4 md:space-y-6 md:p-6">
			<PageHeader
				title="Do meu site"
				subtitle="Quem usou a calculadora no site do escritório. Importar cria o cliente e a liquidação com o mesmo número que a pessoa viu."
			/>

			{isLoading ? (
				<Skeleton className="h-48 w-full" />
			) : rows.length === 0 ? (
				<EmptyState
					icon={GlobeIcon}
					title="Nenhum cálculo pelo site ainda"
					description="Instale a calculadora no site do escritório para que quem pesquisa rescisão chegue com o cálculo pronto — e com o contato."
					action={{
						label: "Pegar o código",
						onClick: () => {
							window.location.href = "/settings";
						},
					}}
				/>
			) : (
				<div className="space-y-3">
					{pending.length > 0 && (
						<p className="text-muted-foreground text-sm">
							{pending.length}{" "}
							{pending.length === 1
								? "cálculo ainda não importado"
								: "cálculos ainda não importados"}
							.
						</p>
					)}

					{rows.map((row) => (
						<Card key={row.id}>
							<CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
								<div className="min-w-0 flex-1">
									<div className="flex flex-wrap items-center gap-2">
										<p className="font-medium text-sm">
											{row.name ?? "Sem nome informado"}
										</p>
										<span className="rounded-full border border-border px-2 py-0.5 text-muted-foreground text-xs">
											{KIND_LABELS[row.kind] ?? row.kind}
										</span>
										{row.perspective === "empresa" && (
											<span className="text-muted-foreground text-xs">
												visão de empresa
											</span>
										)}
									</div>

									<p className="mt-0.5 font-semibold text-sm tabular-nums">
										{formatCurrency(row.floor)}
										<span className="mx-1.5 font-normal text-muted-foreground">
											a
										</span>
										{formatCurrency(row.ceiling)}
									</p>

									<div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground text-xs">
										<span>{formatDate(row.createdAt)}</span>
										{row.email && (
											<span className="flex items-center gap-1">
												<MailIcon className="size-3" /> {row.email}
											</span>
										)}
										{row.phone && (
											<span className="flex items-center gap-1">
												<PhoneIcon className="size-3" /> {row.phone}
											</span>
										)}
										{row.hostSite && <span>{row.hostSite}</span>}
									</div>

									{!row.email && !row.phone && !row.claimed && (
										<p className="mt-1 text-muted-foreground text-xs">
											Sem contato: a pessoa calculou e não deixou como falar com
											ela. Importar guarda o cálculo, mas não há quem chamar.
										</p>
									)}
								</div>

								{row.claimed ? (
									<span className="flex shrink-0 items-center gap-1.5 text-muted-foreground text-sm">
										<CheckCircle2Icon className="size-4 text-primary" />
										Importado
									</span>
								) : canWriteCases ? (
									<Button
										size="sm"
										className="shrink-0"
										disabled={claimingId === row.id}
										onClick={() => {
											setClaimingId(row.id);
											// Corpo vazio: o convite de portal é o padrão do back.
											claim({ id: row.id, data: {} });
										}}
									>
										{claimingId === row.id ? (
											<Loader2Icon className="animate-spin" />
										) : (
											<DownloadIcon />
										)}
										Importar
									</Button>
								) : null}
							</CardContent>
						</Card>
					))}

					<p className="text-muted-foreground text-xs">
						Cálculos do widget ficam disponíveis por 90 dias. Depois disso a
						pessoa e o cálculo são apagados — o que você importou continua no{" "}
						<Link to="/clients" className="underline underline-offset-2">
							cadastro de clientes
						</Link>
						.
					</p>
				</div>
			)}
		</div>
	);
}
