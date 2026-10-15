import { ActivityIcon } from "lucide-react";
import { useGetApiUsage } from "@/http/generated/api-key/api-key";
import { useOrganizations } from "@/hooks/use-organizations";
import { formatDate } from "@/utils/value-format";

/**
 * Consumo da API no ciclo.
 *
 * O valor vem do servidor, que o calcula a partir do preço no Stripe. Quando o
 * servidor devolve `estimatedCents: null` o card mostra só a contagem — número
 * chutado em cobrança é pior que número ausente.
 */
export function ApiUsageCard() {
	const { role } = useOrganizations();
	const canManage = role === "owner" || role === "admin";
	const { data: usage } = useGetApiUsage({ query: { enabled: canManage } });

	if (!canManage || !usage) return null;
	if (usage.total === 0 && usage.testTotal === 0) return null;

	const estimated =
		usage.estimatedCents === null
			? null
			: (usage.estimatedCents / 100).toLocaleString("pt-BR", {
					style: "currency",
					currency: (usage.currency ?? "brl").toUpperCase(),
				});

	return (
		<div className="space-y-4 rounded-xl border border-border bg-card p-5">
			<div className="flex items-center gap-2">
				<ActivityIcon className="size-4 text-muted-foreground" />
				<h3 className="font-semibold text-foreground text-sm">
					Consumo da API
				</h3>
			</div>

			<p className="text-muted-foreground text-xs">
				Ciclo de {formatDate(usage.periodStart)} a{" "}
				{formatDate(usage.periodEnd)}.
			</p>

			<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
				<div className="rounded-lg border border-border bg-background px-4 py-3">
					<p className="text-muted-foreground text-xs">Chamadas cobráveis</p>
					<p className="font-semibold text-foreground text-lg">{usage.total}</p>
				</div>
				<div className="rounded-lg border border-border bg-background px-4 py-3">
					<p className="text-muted-foreground text-xs">Chamadas de teste</p>
					<p className="font-semibold text-foreground text-lg">
						{usage.testTotal}
					</p>
				</div>
				<div className="rounded-lg border border-border bg-background px-4 py-3">
					<p className="text-muted-foreground text-xs">Valor estimado</p>
					<p className="font-semibold text-foreground text-lg">
						{estimated ?? "—"}
					</p>
				</div>
			</div>

			{usage.byKey.length > 0 && (
				<div className="divide-y divide-border overflow-hidden rounded-lg border border-border">
					{usage.byKey.map((key) => (
						<div
							key={key.id}
							className="flex items-center justify-between gap-3 bg-background px-4 py-2.5"
						>
							<p className="truncate text-foreground text-sm">
								{key.name}
								{key.mode === "test" && (
									<span className="ml-2 text-muted-foreground text-xs">
										teste
									</span>
								)}
							</p>
							<p className="text-muted-foreground text-xs">
								{key.calls} {key.calls === 1 ? "chamada" : "chamadas"}
							</p>
						</div>
					))}
				</div>
			)}

			{estimated === null && (
				<p className="text-muted-foreground text-xs">
					O valor exato aparece na sua fatura.
				</p>
			)}
		</div>
	);
}
