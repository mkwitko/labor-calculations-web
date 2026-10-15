import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetWidgetBranding } from "@/http/generated/public/public";
import Calculadora, {
	type CalculatedPayload,
} from "../calculadora";
import { usePageview } from "@/hooks/use-pageview";
import { useFrameHeight } from "./use-frame-height";
import { WidgetResult } from "./widget-result";

/**
 * A calculadora dentro do site do escritório.
 *
 * Página pelada de propósito: sem navbar, sem rodapé, sem nada que pareça outro
 * site dentro do site de quem instalou. O que dá contexto é o nome e a cor do
 * escritório, que vêm da chave. Fora do `PublicLayout` porque ele manda quem
 * está logado para `/home` — e um advogado nosso testando o próprio widget seria
 * expulso do iframe.
 */
export default function WidgetCalculadora() {
	const [params] = useSearchParams();
	const widgetKey = params.get("k");
	const hostSite = params.get("h") ?? undefined;

	useFrameHeight(params.get("f"));

	// O widget não tem casca, então o pageview é chamado aqui. É ele que dá o
	// denominador do funil do widget: quantos viram a calculadora no site do
	// escritório, não só quantos começaram a preencher. Vem com o caminho
	// `/widget/calculadora`, que é como se filtra o iframe fora do Web Analytics
	// do site quando a mistura incomodar.
	usePageview();

	const [calculated, setCalculated] = useState<CalculatedPayload | null>(null);

	// `widget:<chave>`, não `widget` solto: é o formato que `/admin/funil` sabe
	// rotular (`sourceLabel` corta o prefixo) e o único que diz *de qual*
	// escritório veio o cálculo. Enquanto isso não existia, todo widget do país
	// caía numa origem só.
	const widgetSource = `widget:${widgetKey ?? ""}`;

	const { data, isLoading, error } = useGetWidgetBranding(widgetKey ?? "", {
		query: { enabled: Boolean(widgetKey) },
	});

	if (!widgetKey || error) {
		return (
			<div className="p-4">
				<Card>
					<CardContent>
						<p className="font-medium text-sm">Calculadora indisponível</p>
						<p className="mt-1 text-muted-foreground text-sm">
							Este código de incorporação não está mais válido. Se você é o
							responsável pelo site, gere um novo em Configurações.
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (isLoading || !data) {
		return (
			<div className="space-y-3 p-4">
				<Skeleton className="h-8 w-2/3" />
				<Skeleton className="h-64 w-full" />
			</div>
		);
	}

	return (
		<div
			className="bg-background p-4"
			// A cor da marca do escritório entra como variável do tema, então botão,
			// trilha e destaques seguem o site dele sem folha de estilo à parte.
			style={
				data.brandPrimaryColor
					? ({ "--primary": data.brandPrimaryColor } as React.CSSProperties)
					: undefined
			}
		>
			<div className="mx-auto w-full max-w-2xl space-y-4">
				<div className="flex items-center gap-3">
					{data.logoUrl && (
						<img
							src={data.logoUrl}
							alt={data.officeName}
							className="h-10 w-auto shrink-0 object-contain"
						/>
					)}
					<div className="min-w-0">
						<h1 className="font-semibold text-foreground text-lg">
							{calculated ? "Seu cálculo de rescisão" : "Quanto você tem a receber?"}
						</h1>
						<p className="text-muted-foreground text-sm">
							{calculated
								? `Estimativa feita com os dados que você informou — ${data.officeName}.`
								: "Sete perguntas simples. Grátis, sem cadastro, cerca de dois minutos."}
						</p>
					</div>
				</div>

				{calculated ? (
					<WidgetResult
						token={calculated.token}
						source={widgetSource}
						kind="rescisao"
						perspective="trabalhador"
						officeName={data.officeName}
						floor={calculated.result.floor}
						ceiling={calculated.result.ceiling}
						lines={calculated.result.lines}
					/>
				) : (
					<Card>
						<CardContent>
							<Calculadora
								source={widgetSource}
								embedded
								widget={{ widgetKey, hostSite }}
								onCalculated={setCalculated}
							/>
						</CardContent>
					</Card>
				)}

				<p className="text-center text-muted-foreground text-xs">
					Estimativa, não parecer jurídico. Cálculo por{" "}
					<a
						href="https://lexlaboral.com.br"
						target="_blank"
						rel="noreferrer"
						className="underline underline-offset-2"
					>
						LexLaboral
					</a>
					.
				</p>
			</div>
		</div>
	);
}
