import { CheckIcon, CodeIcon, CopyIcon, Loader2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { InfoBanner } from "@/components/info-banner";
import { Button } from "@/components/ui/button";
import {
	getGetWidgetKeyQueryKey,
	useGetWidgetKey,
	useIssueWidgetKey,
	useRevokeWidgetKey,
} from "@/http/generated/widget/widget";
import { useOrganizations } from "@/hooks/use-organizations";
import { queryClient } from "@/lib/react-query";

/**
 * Liga a calculadora pública no site do escritório.
 *
 * A chave vai para o HTML de um site de terceiro, então quem mexe aqui é
 * titular ou sócio — o back cobra a mesma régua. Rotacionar derruba o código já
 * publicado, e é isso que o aviso diz antes de a pessoa clicar.
 */
export function WidgetCard() {
	const { current, role } = useOrganizations();
	const organizationId = current?.id;
	const canManage = role === "owner" || role === "admin";

	const [copied, setCopied] = useState(false);

	const { data, isLoading } = useGetWidgetKey(organizationId ?? "", {
		query: { enabled: Boolean(organizationId) && canManage },
	});

	function refresh() {
		if (!organizationId) return;
		queryClient.invalidateQueries({
			queryKey: getGetWidgetKeyQueryKey(organizationId),
		});
	}

	const { mutate: issue, isPending: isIssuing } = useIssueWidgetKey({
		mutation: {
			onSuccess: () => {
				refresh();
				toast.success("Widget pronto. Copie o código e cole no seu site.");
			},
			onError: () => toast.error("Não conseguimos gerar o código agora."),
		},
	});

	const { mutate: revoke, isPending: isRevoking } = useRevokeWidgetKey({
		mutation: {
			onSuccess: () => {
				refresh();
				toast.success("Widget desligado.");
			},
			onError: () => toast.error("Não conseguimos desligar agora."),
		},
	});

	if (!canManage || !organizationId) return null;

	const widgetKey = data?.widgetKey ?? null;
	const snippet = widgetKey
		? `<script src="${window.location.origin}/widget.js" data-key="${widgetKey}"></script>`
		: "";

	async function copy() {
		await navigator.clipboard.writeText(snippet);
		setCopied(true);
		toast.success("Código copiado.");
		setTimeout(() => setCopied(false), 2000);
	}

	return (
		<div className="space-y-4 rounded-xl border border-border bg-card p-5">
			<div className="flex items-center gap-2">
				<CodeIcon className="size-4 text-muted-foreground" />
				<h3 className="font-semibold text-foreground text-sm">
					Calculadora no seu site
				</h3>
			</div>
			<p className="text-muted-foreground text-xs">
				Uma linha de código coloca a calculadora de rescisão no site do
				escritório, com o seu nome, sua logo e a sua cor. Quem calcular por lá
				aparece na sua fila, e você importa o cálculo com um clique — sem
				redigitar nada.
			</p>

			{isLoading ? (
				<div className="flex items-center gap-2 text-muted-foreground text-xs">
					<Loader2Icon className="size-3.5 animate-spin" /> Carregando...
				</div>
			) : widgetKey ? (
				<div className="space-y-3">
					<div className="overflow-x-auto rounded-lg border border-border bg-background p-3">
						<code className="whitespace-pre text-xs">{snippet}</code>
					</div>

					<div className="flex flex-wrap gap-2">
						<Button size="sm" onClick={copy}>
							{copied ? <CheckIcon /> : <CopyIcon />}
							{copied ? "Copiado" : "Copiar código"}
						</Button>
						<Button
							variant="outline"
							size="sm"
							disabled={isIssuing}
							onClick={() => issue({ organizationId })}
						>
							Gerar novo código
						</Button>
						<Button
							variant="ghost"
							size="sm"
							disabled={isRevoking}
							onClick={() => revoke({ organizationId })}
						>
							Desligar
						</Button>
					</div>

					<InfoBanner variant="info">
						Cole o código onde a calculadora deve aparecer. Para posicioná-la em
						outro lugar, use{" "}
						<code className="text-xs">data-target="#seu-elemento"</code>. Gerar um
						novo código invalida o que já está publicado — o widget para de
						atribuir até você trocar o trecho no site.
					</InfoBanner>
				</div>
			) : (
				<Button
					size="sm"
					disabled={isIssuing}
					onClick={() => issue({ organizationId })}
				>
					{isIssuing ? <Loader2Icon className="animate-spin" /> : <CodeIcon />}
					Gerar o código
				</Button>
			)}
		</div>
	);
}
